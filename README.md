# ⚗️ MolParetoLab

**Multi-objective Pareto analysis for molecules — entirely in your browser.**

Paste SMILES, upload SDF files, and instantly explore the Pareto frontier across drug-likeness properties. No server, no installs, no data leaves your machine — everything runs client-side via RDKit WASM.

> **🚀 [Try it now → molparetolab.ilkham.com](https://molparetolab.ilkham.com)**

![MolParetoLab — Pareto Scatter](screenshots/pareto-scatter.png)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Pareto Front Analysis** | Non-dominated sorting across MW, cLogP, HBD, HBA, TPSA, RotBonds — interactive scatter plots with configurable axes |
| 🥚 **BOILED-Egg Plot** | Predict GI absorption and BBB penetration at a glance (Daina & Zoete, 2016) |
| 🎯 **Multi-Filter Overlays** | Toggle Lipinski Ro5, Veber, Ghose, and Lead-like filters with threshold lines on every plot |
| 🕸️ **Radar Property View** | Overlay all molecules on a normalized radar chart to spot property imbalances instantly |
| ⚔️ **Dominance Matrix** | Pairwise dominance grid — see exactly which molecule beats which |
| 🔬 **Side-by-Side Comparison** | Right-click any two molecules for a detailed head-to-head breakdown with winner scoring |
| 📁 **SDF Upload** | Drag-and-drop `.sdf` files — parsed entirely client-side via RDKit WASM |
| 🔗 **Shareable URLs** | Compress your molecule set into a URL and share with collaborators (LZ-String encoded) |
| 📥 **CSV Export** | Download all computed properties for downstream analysis |
| ⚡ **Zero Install** | Single HTML file, no build step, no backend, no dependencies to install |

---

## 🆚 How it compares

| Capability | MolParetoLab | SwissADME | ADMETlab 3.0 |
|-----------|:---:|:---:|:---:|
| Runs client-side (no server) | ✅ | ❌ | ❌ |
| Pareto front analysis | ✅ | ❌ | ❌ |
| BOILED-Egg plot | ✅ | ✅ | ❌ |
| Multi-filter overlays (Ro5/Veber/Ghose/Lead-like) | ✅ | ✅ | ✅ |
| Interactive scatter with axis selection | ✅ | ❌ | ❌ |
| Dominance matrix | ✅ | ❌ | ❌ |
| Side-by-side molecule comparison | ✅ | ❌ | ❌ |
| SDF file upload | ✅ | ❌ | ✅ |
| Shareable URL encoding | ✅ | ❌ | ❌ |
| Radar property chart | ✅ | ✅ | ❌ |
| No data leaves your browser | ✅ | ❌ | ❌ |
| ADMET/ML predictions | ❌ | ✅ | ✅ |
| Pharmacokinetics modeling | ❌ | ✅ | ✅ |
| Open source | ✅ | ❌ | ❌ |

**MolParetoLab doesn't replace ADMET prediction tools** — it's the multi-objective analysis layer you use *before* or *alongside* them. Think of it as a Pareto-aware property explorer for early-stage compound triage.

---

## 🖼️ Screenshots

| Pareto Scatter | BOILED-Egg | Radar View |
|:-:|:-:|:-:|
| ![Pareto](screenshots/pareto-scatter.png) | ![Egg](screenshots/boiled-egg.png) | ![Radar](screenshots/radar.png) |

| Properties Table | Dominance Matrix | Comparison Mode |
|:-:|:-:|:-:|
| ![Table](screenshots/properties.png) | ![Dominance](screenshots/dominance.png) | ![Compare](screenshots/compare.png) |

---

## 🧪 Quick Start

1. **Open** [molparetolab.ilkham.com](https://molparetolab.ilkham.com)
2. **Paste SMILES** — one per line, optionally with a name (`CC(=O)Oc1ccccc1C(=O)O aspirin`)
3. **Click Analyze** — properties computed instantly via RDKit WASM
4. **Explore** — switch between Pareto Scatter, BOILED-Egg, Radar, Properties, Dominance, and Compare views
5. **Share** — click 🔗 Share URL to copy a link with your molecules encoded

Or load one of the built-in example sets: Drug-like, Lipinski edge cases, Kinase inhibitors, Diverse chemical space.

---

## 📐 Properties Computed

| Property | Key | Lipinski Limit | Direction |
|----------|-----|:--------------:|:---------:|
| Molecular Weight | `MW` | ≤ 500 Da | lower ↓ |
| cLogP (Crippen) | `LogP` | ≤ 5 | lower ↓ |
| H-Bond Donors | `HBD` | ≤ 5 | lower ↓ |
| H-Bond Acceptors | `HBA` | ≤ 10 | lower ↓ |
| TPSA | `TPSA` | ≤ 140 Å² | lower ↓ |
| Rotatable Bonds | `RotBonds` | ≤ 10 | lower ↓ |
| Fraction sp3 | `FrCSP3` | — | higher ↑ |
| Ring Count | `Rings` | — | — |
| Aromatic Rings | `AromaticRings` | — | — |
| Heavy Atoms | `HeavyAtoms` | — | lower ↓ |
| Molar Refractivity | `MR` | — | — |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Molecular Engine** | [RDKit.js](https://github.com/rdkit/rdkit-js) v2025.3.4 (WebAssembly) — parsing, descriptors, 2D SVG rendering |
| **Visualization** | [Chart.js](https://www.chartjs.org/) v4.4.7 + [Annotation Plugin](https://github.com/chartjs/chartjs-plugin-annotation) — scatter, radar, bar charts |
| **URL Compression** | [LZ-String](https://github.com/pieroxy/lz-string) v1.5.0 — shareable molecule URLs |
| **Fonts** | [Inter](https://rsms.me/inter/) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/) |
| **Analytics** | [Plausible](https://plausible.io/) — privacy-friendly, no cookies |
| **Deployment** | GitHub Pages — single `index.html`, zero build step |

---

## 💻 Development

It's a single `index.html`. Clone and open.

```bash
git clone https://github.com/IlkhamFY/molparetolab.git
cd molparetolab
python -m http.server 8000
# open http://localhost:8000
```

No build step. No package.json. No node_modules. Just HTML + JS + CSS.

---

## 🤝 Contributing

Contributions welcome! Here's how:

1. **Fork** this repo
2. **Create a branch** (`git checkout -b feature/my-feature`)
3. **Make changes** to `index.html` (it's all in one file)
4. **Test** locally — load the page, paste some SMILES, check all 6 tabs
5. **Open a PR** with a clear description of what changed and why

### Ideas for contributions

- [ ] ADMET prediction integration (via ML models in WASM)
- [ ] 3D conformer viewer (Three.js / 3Dmol.js)
- [ ] Substructure highlighting and search
- [ ] BRICS fragmentation visualization
- [ ] Custom scoring functions
- [ ] Dark/light theme toggle

Found a bug? Have a feature request? → [Open an issue](https://github.com/IlkhamFY/molparetolab/issues)

---

## 📄 License

MIT

---

<p align="center">
  Built by <a href="https://ilkham.com">Ilkham Yabbarov</a> · Powered by <a href="https://github.com/rdkit/rdkit-js">RDKit.js</a><br>
  <sub>⚗️ multi-objective thinking for drug discovery</sub>
</p>
