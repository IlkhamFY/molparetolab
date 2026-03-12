# CLAUDE.md

## Project

MolParetoLab — client-side multi-objective Pareto analysis for drug-like molecules. Single-file web app (`index.html`, ~3100 lines). RDKit.js WASM for cheminformatics, Chart.js for plots, Canvas 2D for custom visualizations. Zero backend, zero installs, no data leaves the browser.

Live: https://ilkhamfy.github.io/molparetolab/
Repo: https://github.com/IlkhamFY/molparetolab

## Tech Stack

- **Single file**: ALL code lives in `index.html` — HTML, CSS (`<style>` block), JS (`<script>` block). No build step.
- **RDKit.js WASM** (`@rdkit/rdkit@2025.3.4-1.0.0`): molecule parsing, descriptors, SVG rendering, fingerprints
- **Chart.js 4.4.7** + annotation plugin: scatter plots, radar, bar charts
- **Canvas 2D**: BOILED-Egg plot, parallel coordinates (custom renderers)
- **LZString**: URL compression for shareable molecule sets
- **Dark theme**: CSS variables (`--bg`, `--surface`, `--accent`, `--border`, `--text`, `--text2`)
- **Deployed via**: GitHub Pages (push to `main` auto-deploys)

## Architecture

```
index.html
├── <style>     ~530 lines   CSS (dark theme, all components)
├── <body>      ~100 lines   HTML skeleton (header, sidebar, content)
└── <script>    ~2500 lines  JS (state, analysis, 9 tab renderers)
```

### State (global variables)
- `RDKitModule` — RDKit WASM instance
- `molecules[]` — analyzed molecules with `.props`, `.svg`, `.filters`, `.paretoRank`, `.fingerprint`
- `selectedMolIdx` — currently selected molecule (null or index)
- `currentView` — active tab name string
- `compareIndices[]` — 2 molecule indices for comparison
- `activeFilters` — Set of active drug-likeness filter names
- `scoringWeights` — object with weight per property key
- `pcBrushes` — parallel coordinates brush state

### Analysis Pipeline (doAnalysis)
1. Parse SMILES lines → `RDKitModule.get_mol(smiles)`
2. Extract descriptors → `mol.get_descriptors()`
3. Generate SVG → `mol.get_svg_with_highlights()`
4. Compute fingerprints → `mol.get_morgan_fp()`
5. Apply drug-likeness filters (Lipinski, Veber, Ghose, Lead-like)
6. Compute Pareto ranks + dominance relationships
7. Render all views

### Tab Views (9 tabs)
| Tab | Renderer | Engine |
|-----|----------|--------|
| Pareto Scatter | `renderParetoView` | Chart.js scatter × 6 |
| BOILED-Egg | `renderEggView` + `drawBoiledEgg` | Canvas 2D |
| Radar | `renderRadarView` | Chart.js radar |
| Parallel | `renderParallelView` + `drawParallelCoords` | Canvas 2D |
| Properties | `renderTableView` | HTML table |
| Dominance | `renderDominanceView` | HTML grid |
| Similarity | `renderSimilarityView` | Canvas 2D heatmap |
| Scoring | `renderScoringView` | HTML + computed ranks |
| Compare | `renderCompareView` | Chart.js bar + HTML |

## Key Conventions

- **All changes go in index.html.** There is no second file.
- **Maintain the dark theme.** Use existing CSS variables, not hardcoded colors.
- **Never break existing tabs.** After any change, all 9 tabs must still render.
- **RDKit API**: descriptors come from `mol.get_descriptors()` (JSON string), SVG from `mol.get_svg_with_highlights()`, fingerprints from `mol.get_morgan_fp()`. Always `mol.delete()` after use.
- **New tabs**: add to the tab bar in `renderContent()`, add routing in the `if/else if` chain below it, add the render function before `// ---- Utilities ----`.
- **Hover tooltips**: reuse `showMolTooltip(molIdx, x, y, xKey, yKey)` and `hideMolTooltip()` for all interactive charts.
- **Canvas views**: follow the BOILED-Egg pattern — get parent rect, apply DPR scaling, store `canvas.width/height` at `rect * dpr`, draw in logical pixels after `ctx.scale(dpr, dpr)`.
- **Property keys**: `MW`, `LogP`, `HBD`, `HBA`, `TPSA`, `RotBonds`, `FrCSP3`, `Rings`, `AromaticRings`, `HeavyAtoms`, `MR`, `NumAtoms`. The first 6 are used for Pareto ranking.
- **Drug-likeness filters**: defined in `DRUG_FILTERS` object. Each has rules, maxViolations, color.
- **Colors**: `COLORS` array for per-molecule assignment. Pareto = green, dominated = red, accent = indigo.

## Testing

No automated tests. Verify manually:
1. Load "Drug-like set" example (8 molecules)
2. Click through all 9 tabs — each should render without console errors
3. Check hover tooltips on scatter plots and parallel coords
4. Test scoring profile switching (Drug-like → CNS Drug → Custom slider)
5. Verify SDF upload with a `.sdf` file
6. Test share URL (copy + paste in new tab should restore state)

## Gotchas

- `RDKitModule.get_mol()` can return null for invalid SMILES — always null-check
- Chart.js instances are not tracked/destroyed — re-rendering a view creates new Chart objects (acceptable for this app size)
- `mol.get_morgan_fp()` takes a JSON string argument, returns a string of '0'/'1' chars
- PowerShell `&&` doesn't work — use `;` or separate commands
- `git push` stderr goes to PowerShell error stream (exit code 1) even on success — check output text

## Roadmap Priority

See `ROADMAP.md` for full list. Current focus:
- Batch performance (500+ SMILES with Web Workers)
- ADMETlab API link-out
- JCIM paper for academic adoption
- Browser extension for right-click SMILES analysis
