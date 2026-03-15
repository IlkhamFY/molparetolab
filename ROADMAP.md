# MolParetoLab Roadmap

## Shipped

### v0.1–v0.10 (Core)
- SMILES input, RDKit.js WASM parsing, property computation
- Pareto non-dominated sorting across 6 objectives
- 9 analysis views: Pareto scatter, BOILED-Egg, Radar, Scoring, Parallel coords, Similarity matrix, Activity cliffs, Compare, Table & Dominance
- Drug-likeness filters: Lipinski Ro5, Veber, Ghose, Lead-like
- CSV/SDF import/export, Share URL (LZ-String compressed)
- ChEMBL batch fetch by ID
- Dark theme (warm zinc palette)
- GitHub Pages auto-deploy

### v0.11–v0.12 (AI + React Migration)
- AI Copilot slide-out panel (BYOK: Gemini, OpenAI, Anthropic)
- React 19 + TypeScript + Vite 8 migration
- Tailwind CSS styling

### v0.13 (Visual Polish)
- Fixed all Chart.js rendering issues (Pareto auto-scale, Radar normalization, Similarity centering)
- BOILED-Egg axis labels + threshold lines
- Consistent dark palette across all canvas views
- Zero console errors (DominanceMatrix key fix)

### v0.14 (Interaction + UX)
- Empty state hero with feature cards (Lucide icons)
- Lipinski threshold annotation lines on Pareto scatter
- Click-to-select molecules on Pareto charts
- Compare tab molecule dropdowns
- Expandable sidebar cards (SMILES copy, full properties)
- Pointer cursor on chart hover

## Next Up

### Performance
- [ ] Web Worker for RDKit.js analysis (unblock UI on 100+ molecules)
- [ ] Virtual scrolling for sidebar with 500+ molecules

### Features
- [ ] Clipboard paste (tab-separated with headers)
- [ ] PubChem name lookup (batch)
- [ ] ADMETlab API link-out per molecule
- [ ] Export current view as PNG (per-tab canvas capture)
- [ ] Molecule editor (RDKit.js drawing integration)

### Academic
- [ ] JCIM application note for academic adoption
- [ ] Proper citation format (BibTeX)
- [ ] DOI via Zenodo

### Distribution
- [ ] Browser extension (right-click SMILES → analyze)
- [ ] npm package for programmatic use
- [ ] PyPI wrapper for Python integration
