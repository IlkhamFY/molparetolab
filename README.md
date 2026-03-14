# MolParetoLab

**Interactive multi-objective Pareto analysis of drug-like molecules in the browser.**

MolParetoLab is a client-side web app for comparing and ranking molecules across multiple drug-likeness properties. Paste SMILES, upload an SDF, or open a shared link — all computation runs in your browser via RDKit.js (WebAssembly). No backend, no install, no data leaves your machine.

- **Live app:** [https://molparetolab.ilkham.com/](https://molparetolab.ilkham.com/) · [GitHub Pages](https://ilkhamfy.github.io/molparetolab/)
- **Repo:** [https://github.com/IlkhamFY/molparetolab](https://github.com/IlkhamFY/molparetolab)

## Features

- **Pareto ranking** — Non-dominated sorting across MW, LogP, HBD, HBA, TPSA, RotBonds
- **Drug-likeness filters** — Lipinski Ro5, Veber, Ghose with pass/fail and overlays on scatter plots
- **9 views** — Pareto scatter (axis selector), BOILED-Egg (WLogP × TPSA), Radar, Scoring (weighted Chebyshev profiles), Parallel coordinates, **Similarity matrix**, **Activity cliffs**, Compare (head-to-head), Table & Dominance matrix
- **Share URL** — Encode your molecule set in the link; anyone opening it sees the same analysis
- **Export** — CSV (properties + filters + Pareto), PNG figure (current view)
- **SDF upload** — Drag-and-drop or file picker; client-side parse then full analysis
- **ChEMBL** — Fetch by ChEMBL IDs (comma/semicolon list), then analyze
- **Batch** — Chunked analysis with progress for 30+ molecules; “Resolving names…” and “Analyzing…” with progress bar
- **Examples** — Drug-like set, Lipinski edge cases, diverse chemical space, kinase inhibitors
- **PubChem names** — Paste compound names; app resolves to SMILES when not valid SMILES
- **Tooltips** — Hover on Pareto scatter or parallel coordinates for structure preview + key props
- **AI Copilot** — “Summarize my set” and “Why is [name] Pareto-optimal?” (canned answers)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Build for production:

```bash
npm run build
```

## Tech stack

- **React 19** + TypeScript + Vite 8
- **RDKit.js** (WASM) — parsing, descriptors, SVG, Morgan fingerprints
- **Chart.js 4** + react-chartjs-2 — scatter, radar, bar
- **Tailwind CSS** — dark theme, zinc palette
- **LZ-String** — compressed shareable URLs

## Roadmap

- **Molecule editor** — Draw or edit structures in-browser (planned; depends on RDKit.js sketcher availability).
- Batch mode for 500+ molecules (Web Workers), JCIM application note.

## License & author

Open source. Built by [Ilkham Yabbarov](https://ilkham.com).
