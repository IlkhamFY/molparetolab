# MolParetoLab ⚗️

**Multi-objective molecule analysis — entirely in your browser.**

MolParetoLab lets you paste SMILES, upload SDF files, and instantly explore the Pareto frontier across drug-likeness properties. No server, no installs — everything runs client-side via [RDKit.js](https://github.com/rdkit/rdkit-js) WASM.

> **Live:** [molparetolab.ilkham.com](https://molparetolab.ilkham.com) (or your GitHub Pages URL)

![MolParetoLab Screenshot](screenshot.png)

---

## Features

- **Pareto Front Analysis** — Non-dominated sorting across MW, cLogP, HBD, HBA, TPSA, and rotatable bonds
- **Interactive Scatter Plots** — 6 configurable scatter views with axis dropdowns, Lipinski threshold lines, and Pareto front overlay
- **Radar View** — Overlay all molecules on a normalized property radar chart
- **Property Table** — Sortable table with Lipinski Ro5 pass/fail highlighting
- **Dominance Matrix** — Pairwise dominance comparison grid
- **SDF File Upload** — Drag-and-drop or click to upload `.sdf` files parsed entirely client-side
- **Shareable URLs** — Encode your molecule set into a URL and share it with colleagues
- **CSV Export** — Download computed properties as CSV
- **Dark Theme** — Easy on the eyes, designed for long sessions
- **Example Datasets** — Drug-like, Lipinski edge cases, kinase inhibitors, diverse chemical space

## How to Use

1. **Open** MolParetoLab in your browser
2. **Input molecules** in one of three ways:
   - **Paste SMILES** — one per line, optionally followed by a name (e.g. `CCO ethanol`)
   - **Upload SDF** — click the upload area or drag-and-drop a `.sdf` file
   - **Load an example** — click any Quick Load preset
3. **Click Analyze** — properties are computed instantly via RDKit WASM
4. **Explore views** — switch between Pareto Scatter, Radar, Properties table, and Dominance matrix
5. **Share** — click "Share URL" to copy a link with your molecules encoded in the URL
6. **Export** — download a CSV of all computed properties

## Properties Computed

| Property | Key | Lipinski Limit |
|----------|-----|----------------|
| Molecular Weight | MW | ≤ 500 Da |
| cLogP | LogP | ≤ 5 |
| H-Bond Donors | HBD | ≤ 5 |
| H-Bond Acceptors | HBA | ≤ 10 |
| TPSA | TPSA | ≤ 140 Å² |
| Rotatable Bonds | RotBonds | ≤ 10 |
| Fraction sp3 | FrCSP3 | — |
| Ring Count | Rings | — |
| Aromatic Rings | AromaticRings | — |
| Heavy Atoms | HeavyAtoms | — |

## Tech Stack

- **RDKit.js** (WASM) — molecular parsing, descriptors, SVG rendering
- **Chart.js** — scatter plots, radar charts
- **Vanilla JS** — zero build step, single HTML file
- **LZ-String** — URL-safe compression for shareable links

## Development

It's a single `index.html`. Open it in a browser and hack away.

```bash
# Clone and open
git clone https://github.com/IlkhamFY/molparetolab.git
cd molparetolab
open index.html  # or python -m http.server
```

## License

MIT

---

Built by [Ilkham Yabbarov](https://ilkham.com) • Powered by RDKit.js
