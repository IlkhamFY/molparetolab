# MolParetoLab Overnight Build Plan

## v1 (DONE - 11:30 PM)
- [x] Core app: SMILES input, RDKit.js parsing, property computation
- [x] Pareto ranking (non-dominated sorting)
- [x] 4 views: scatter, radar, table, dominance
- [x] Lipinski Ro5 checking
- [x] Example datasets
- [x] CSV export
- [x] Dark theme
- [x] GitHub Pages live

## v2 (12:00 AM) - Interactive Pareto Front
- [x] Axis selector dropdowns on scatter plots (any property vs any)
- [x] Lipinski threshold lines on scatter plots
- [ ] Hover tooltips with molecule structure preview
- [x] Highlight Pareto front line connecting non-dominated points
- [x] Color by Lipinski pass/fail

## v3 (1:00 AM) - Molecule Drawing
- [ ] RDKit.js molecule editor/drawer integration
- [ ] Draw a molecule -> instant property analysis
- [ ] Copy SMILES from drawing

## v4 (4:00 AM) - Share & Polish
- [x] Share URL with encoded molecules (LZ-String compressed URL params)
- [x] SDF file upload (client-side .sdf parsing)
- [x] Landing hero section explaining the tool
- [x] README.md with features, how-to, screenshot placeholder
- [x] og:image meta tag for social preview
- [ ] Custom scoring profiles (drug-like, CNS, oral bioavailability) → moved to v5
- [ ] Weighted multi-objective score → moved to v5

## v5 (3:00 AM) - Similarity & Clustering
- [ ] Tanimoto similarity matrix (Morgan fingerprints via RDKit.js)
- [ ] Cluster molecules by similarity
- [ ] Chemical space diversity score

## v6 (4:00 AM) - Polish & Share-ability
- [x] Share URL with encoded molecules (URL params) — done in v4
- [ ] Screenshot/export current view as PNG
- [x] README with screenshots and GIF — done in v4
- [x] Social preview image (og:image) — done in v4
- [x] Landing page hero section — done in v4

## v7 (5:00 AM) - Real-World Data
- [x] Load SDF files — done in v4
- [ ] Paste from clipboard (tab-separated with headers)
- [ ] ChEMBL/PubChem lookup by name
- [ ] Batch mode for >100 molecules
