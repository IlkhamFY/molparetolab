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

## v4 (2:00 AM) - Multi-Objective Scoring
- [ ] Custom scoring profiles (drug-like, CNS, oral bioavailability)
- [ ] Weighted multi-objective score with user-adjustable sliders
- [ ] "Which molecule is best for MY criteria?" mode
- [ ] Profile presets: Lipinski, Veber, Ghose, Lead-like

## v5 (3:00 AM) - Similarity & Clustering
- [ ] Tanimoto similarity matrix (Morgan fingerprints via RDKit.js)
- [ ] Cluster molecules by similarity
- [ ] Chemical space diversity score

## v6 (4:00 AM) - Polish & Share-ability
- [ ] Share URL with encoded molecules (URL params)
- [ ] Screenshot/export current view as PNG
- [ ] README with screenshots and GIF
- [ ] Social preview image (og:image)
- [ ] Landing page hero section

## v7 (5:00 AM) - Real-World Data
- [ ] Load SDF files
- [ ] Paste from clipboard (tab-separated with headers)
- [ ] ChEMBL/PubChem lookup by name
- [ ] Batch mode for >100 molecules
