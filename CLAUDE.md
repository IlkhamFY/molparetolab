# CLAUDE.md

## Project

MolParetoLab — client-side multi-objective Pareto analysis for drug-like molecules. React + TypeScript SPA with RDKit.js WASM for cheminformatics, Chart.js for plots, Canvas 2D for custom visualizations. Zero backend, zero installs, no data leaves the browser.

Live: https://ilkhamfy.github.io/molparetolab/
Repo: https://github.com/IlkhamFY/molparetolab

## Tech Stack

- **React 19 + TypeScript + Vite 8**: component-based SPA with HMR dev server
- **Tailwind CSS 3**: utility-first styling, no separate CSS files
- **RDKit.js WASM** (`@rdkit/rdkit@2025.3.4-1.0.0`): molecule parsing, descriptors, SVG rendering, fingerprints
- **Chart.js 4** + react-chartjs-2: scatter plots, radar, bar charts
- **Canvas 2D**: BOILED-Egg plot, parallel coordinates (custom renderers)
- **Lucide React**: icon library
- **Geist font**: UI typography
- **Dark theme**: warm zinc palette (`#09090b` bg, `#1A1918` surfaces, `#798F81` / `#5F7367` accents)
- **Deployed via**: GitHub Pages (push to `main` auto-deploys)

## Architecture

```
src/
├── main.tsx                        Entry point
├── App.tsx                         Root component (state: molecules, selection, compare)
├── components/
│   ├── Header.tsx                  Top bar: logo, action buttons, GitHub links
│   ├── Sidebar.tsx                 SMILES input, examples, molecule cards
│   ├── Content.tsx                 Tab router for views
│   ├── CopilotPanel.tsx            AI copilot slide-out panel
│   └── views/
│       ├── ParetoView.tsx          Pareto scatter plots (Chart.js scatter × 6)
│       ├── EggView.tsx             BOILED-Egg plot (Canvas 2D)
│       ├── RadarView.tsx           Radar chart (Chart.js radar)
│       ├── ScoringView.tsx         Weighted scoring with profiles
│       ├── ParallelView.tsx        Parallel coordinates (Canvas 2D)
│       ├── CompareView.tsx         Side-by-side molecule comparison (Chart.js bar)
│       └── TableView.tsx           Properties table + dominance matrix
├── utils/
│   ├── types.ts                    Interfaces (Molecule, filters), constants (DRUG_FILTERS, EXAMPLES)
│   └── chem.ts                     RDKit WASM integration, PubChem name lookup, analysis pipeline
└── index.css                       Tailwind directives + custom scrollbar styles
```

### State (lifted to App.tsx)
- `molecules: Molecule[]` — analyzed molecules with `.props`, `.svg`, `.filters`, `.paretoRank`, `.fingerprint`
- `selectedMolIdx: number | null` — currently selected molecule
- `compareIndices: number[]` — 2 molecule indices for comparison
- Tab state managed locally in `Content.tsx`

### Analysis Pipeline (chem.ts)
1. Parse SMILES lines → `RDKitModule.get_mol(smiles)`
2. Extract descriptors → `mol.get_descriptors()`
3. Generate SVG → `mol.get_svg_with_highlights()`
4. Compute fingerprints → `mol.get_morgan_fp()`
5. Apply drug-likeness filters (Lipinski, Veber, Ghose, Lead-like)
6. Compute Pareto ranks + dominance relationships

### Tab Views (7 tabs)
| Tab | Component | Engine |
|-----|-----------|--------|
| Pareto | `ParetoView` | Chart.js scatter × 6 |
| BOILED-Egg | `EggView` | Canvas 2D |
| Radar | `RadarView` | Chart.js radar |
| Scoring | `ScoringView` | HTML + computed ranks |
| Parallel | `ParallelView` | Canvas 2D |
| Compare | `CompareView` | Chart.js bar + HTML |
| Table & Dominance | `TableView` | HTML table + dominance grid |

## Key Conventions

- **Component-based**: each view is a separate `.tsx` file in `src/components/views/`.
- **Maintain the dark theme.** Use Tailwind classes with the existing color palette, not hardcoded colors outside the palette.
- **Never break existing tabs.** After any change, all 7 tabs must still render.
- **RDKit API**: descriptors come from `mol.get_descriptors()` (JSON string), SVG from `mol.get_svg_with_highlights()`, fingerprints from `mol.get_morgan_fp()`. Always `mol.delete()` after use.
- **New views**: create a new file in `src/components/views/`, import in `Content.tsx`, add to tab list and routing.
- **Canvas views**: follow the BOILED-Egg pattern — get parent rect, apply DPR scaling, draw in logical pixels after `ctx.scale(dpr, dpr)`.
- **Property keys**: `MW`, `LogP`, `HBD`, `HBA`, `TPSA`, `RotBonds`, `FrCSP3`, `Rings`, `AromaticRings`, `HeavyAtoms`, `MR`, `NumAtoms`. The first 6 are used for Pareto ranking.
- **Drug-likeness filters**: defined in `DRUG_FILTERS` in `types.ts`. Each has rules, maxViolations, color.
- **Type safety**: all components use TypeScript interfaces for props. Use `Molecule` type from `utils/types.ts`.

## Development

```bash
npm run dev      # Vite dev server with HMR
npx tsc -b       # Type check (must pass with zero errors)
npx vite build   # Production build to dist/
```

## Testing

No automated tests. Verify manually:
1. Load "Drug-like set" example (8 molecules)
2. Click through all 7 tabs — each should render without console errors
3. Check hover tooltips on scatter plots and parallel coords
4. Test scoring profile switching (Drug-like → CNS Drug → Custom slider)
5. Verify SDF upload with a `.sdf` file
6. Test share URL (copy + paste in new tab should restore state)

## Gotchas

- `RDKitModule.get_mol()` can return null for invalid SMILES — always null-check
- `mol.get_morgan_fp()` takes a JSON string argument, returns a string of '0'/'1' chars
- PowerShell `&&` doesn't work — use `;` or separate commands
- `git push` stderr goes to PowerShell error stream (exit code 1) even on success — check output text

## Roadmap Priority

See `ROADMAP.md` for full list. Current focus:
- Batch performance (500+ SMILES with Web Workers)
- ADMETlab API link-out
- JCIM paper for academic adoption
- Browser extension for right-click SMILES analysis
