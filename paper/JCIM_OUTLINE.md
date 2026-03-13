# JCIM Paper Outline — MolParetoLab

> **Status:** Draft outline for writing  
> **Target:** JCIM Application Note (~4000 words + figures)  
> **Generated:** 2026-03-13  
> **Last updated:** 2026-03-13

---

## 1. Title Options

**Option A (recommended):**  
**MolParetoLab: Interactive Multi-Objective Pareto Analysis of Drug-Like Molecules in the Browser**

**Option B:**  
**Client-Side Pareto Front Exploration for Multi-Property Molecular Triage via WebAssembly**

**Option C:**  
**MolParetoLab: A Zero-Install Web Tool for Non-Dominated Sorting and Weighted Scalarization of Molecular Property Profiles**

> *Recommendation:* Option A. Clear, scannable, hits the keywords reviewers search for (Pareto, multi-objective, drug-like, browser/web). Option C is more algorithmically precise but less inviting. Option B buries the tool name.

---

## 2. Abstract (~250 words)

> *Draft — refine during writing.*

Multi-objective optimization is central to drug discovery, yet existing web-based molecular property tools analyze compounds in isolation, leaving medicinal chemists to manually reconcile trade-offs across molecular weight, lipophilicity, hydrogen bonding capacity, polar surface area, and rotational flexibility. We present **MolParetoLab**, an open-source, client-side web application that performs interactive Pareto front analysis across six drug-likeness properties simultaneously. Built as a single HTML file powered by RDKit.js WebAssembly, MolParetoLab computes non-dominated sorting, pairwise dominance relationships, weighted Chebyshev scalarization with preset and user-defined scoring profiles, Tanimoto similarity matrices from Morgan fingerprints, activity cliff detection, and BOILED-Egg permeation predictions—all without transmitting molecular structures to any server.

The tool provides ten coordinated interactive views: Pareto scatter plots with drug-likeness filter overlays, scoring profile rankings, parallel coordinates, a Tanimoto similarity heatmap, activity cliff analysis, BOILED-Egg (BBB/GI absorption) plot, radar charts, a properties table, a dominance matrix, and head-to-head molecule comparison. Smart defaults automatically select the most informative view based on the number of molecules loaded. Per-molecule verdicts and natural-language "why Pareto" explanations translate mathematical dominance into actionable insights for non-computational users.

We demonstrate MolParetoLab's utility through three case studies: kinase inhibitor selection across the imatinib family, fragment-to-lead property tracking, and triage of a 50-molecule diverse library. A task-based evaluation with medicinal chemists shows that Pareto-aware analysis reduces decision time by [X]% compared to tabular property comparison alone. MolParetoLab is freely available at https://molparetolab.ilkham.com with source code at https://github.com/IlkhamFY/molparetolab.

---

## 3. Introduction Outline

### 3.1 The Multi-Objective Nature of Drug Design (~400 words)

- **Opening hook:** A drug candidate must simultaneously satisfy MW < 500, cLogP ≤ 5, adequate TPSA, limited rotatable bonds — the Lipinski/Veber/Ghose rules are really a multi-objective feasibility problem, not independent filters.
- **The real challenge:** Medicinal chemists routinely compare 5–50 analogs during lead optimization. The question isn't "does this molecule pass Ro5?" — it's "which molecule best balances *all* properties for my target profile?"
- **Multi-objective optimization theory:** Introduce Pareto optimality — no molecule on the Pareto front can improve one property without worsening another. Cite Deb (2001) for NSGA-II context, Miettinen (1999) for scalarization.
- **State of the field in drug discovery:** MO optimization is well-established in generative molecular design (GFlowNets, ParetoDrug, MolPAL, REINVENT) but these are *generative* tools. The *analysis* and *selection* step — "I have 20 candidates, which set is Pareto-optimal?" — lacks purpose-built interactive tooling.

### 3.2 The Gap: Analysis Tools Don't Do Multi-Objective Comparison (~300 words)

- **SwissADME** (Daina et al., *Sci. Rep.* 2017; >10K citations): property prediction, BOILED-Egg, bioavailability radar — but each molecule analyzed independently. No comparison, no ranking.
- **ADMETlab 3.0** (Dong et al., *NAR* 2024; 119 ADMET endpoints): deep ML-based ADMET prediction with uncertainty. But results are flat tables per molecule — no multi-objective ranking.
- **DataWarrior** (Sander et al., *JCIM* 2015; ~1400 citations): closest in spirit — rich scatter plots, parallel coordinates, activity cliffs. But desktop Java, no automated Pareto detection, no web deployment.
- **pkCSM, ProTox, Molinspiration:** Single-molecule focus.
- **The categorical gap:** Every tool answers "What are this molecule's properties?" — none answer "Which of my molecules wins, and why?" Multi-objective comparison is left to manual spreadsheet inspection.

### 3.3 Our Contribution (~200 words)

MolParetoLab fills this gap with:
1. **Automated Pareto front identification** — non-dominated sorting across 6 drug-likeness properties
2. **Weighted Chebyshev scalarization** — preset (Drug-like, CNS, Oral, Lead-like) and custom scoring profiles
3. **Ten coordinated interactive views** — from scatter to dominance matrix to activity cliffs
4. **Complete client-side execution** — RDKit.js WASM, zero data exfiltration, zero install
5. **Actionable explanations** — per-molecule verdicts and "why Pareto" natural language

---

## 4. Related Work

### 4.1 Molecular Property Prediction Web Tools

| Tool | Citation | Strengths | Multi-Obj? |
|------|----------|-----------|:----------:|
| SwissADME | Daina et al., *Sci Rep* 2017 | BOILED-Egg, 6 logP models, PAINS | ❌ |
| ADMETlab 3.0 | Dong et al., *NAR* 2024 | 119 endpoints, DMPNN, uncertainty | ❌ |
| pkCSM | Pires et al., *J Med Chem* 2015 | Graph-signature ADMET | ❌ |
| ProTox-3 | Banerjee et al., *NAR* 2024 | 33 toxicity endpoints | ❌ |
| Molinspiration | molinspiration.com | Bioactivity scores, fast batch | ❌ |

> *Key point:* These are **prediction** tools. MolParetoLab is a **decision** tool — it takes computed properties (from RDKit or any source) and helps users *choose*.

### 4.2 Desktop Cheminformatics Suites

- **DataWarrior** (Sander et al., *JCIM* 2015) — interactive scatter, parallel coordinates, activity cliffs. No Pareto detection, no web.
- **RDKit + KNIME** — workflow-based, 200+ descriptors. No Pareto nodes, steep learning curve.
- **ChemAxon Calculators** — commercial, no comparison layer.

### 4.3 Multi-Objective Optimization in Drug Discovery

- **Generative methods:** NSGA-II/III (Deb et al., 2002), MolPAL (Graff et al., *Chem. Sci.* 2024), ParetoDrug (Xu et al., 2024), REINVENT multi-objective scoring.
- **Bayesian optimization:** GFlowNets (Bengio et al., 2021), MOBO (Daulton et al., NeurIPS 2020).
- **Gap:** All of these *generate* molecules. None provide interactive *analysis* of an existing set. MolParetoLab is complementary — it's the analysis layer for the output of generative tools or for manual analog selection.

### 4.4 Scalarization and Decision-Making in MOO

- **Weighted Chebyshev scalarization** (Miettinen, 1999) — can reach any point on a non-convex Pareto front, unlike linear scalarization. MolParetoLab implements this with interactive weight sliders.
- **Reference point methods** (Wierzbicki, 1980) — MolParetoLab uses the utopia point (per-property minima of the current set) as reference.

---

## 5. Methods

### 5.1 Architecture and Design Principles (~300 words)

- **Single-file architecture:** All HTML, CSS (~530 lines), and JavaScript (~2500 lines) in one `index.html`. No build step, no dependencies beyond CDN-loaded libraries.
- **Technology stack:**
  - *RDKit.js* v2025.3.4 (WebAssembly) — SMILES/SDF parsing, descriptor computation, SVG rendering, Morgan fingerprints
  - *Chart.js* v4.4.7 + annotation plugin — scatter, radar, bar charts
  - *Canvas 2D API* — BOILED-Egg, parallel coordinates, similarity heatmap (custom renderers)
  - *LZ-String* — URL compression for shareable molecule sets
- **Privacy-by-design:** All computation in-browser via WASM. No server calls, no telemetry beyond privacy-friendly analytics (Plausible). Pharma users can work with proprietary structures without data exfiltration risk.
- **Design philosophy:** Fukasawa (remove friction before pixels), Rams (useful, honest, unobtrusive), Yanagi (warmth through proportion). Resulting in a dark-theme interface with zero onboarding — paste SMILES, see results.

**Figure 1:** Architecture diagram — input (SMILES/SDF) → RDKit.js WASM (parse, descriptors, fingerprints) → analysis engine (Pareto ranking, dominance, scoring, similarity) → 10 coordinated views.

### 5.2 Property Computation (~200 words)

Molecular properties are computed client-side via `mol.get_descriptors()`:

| Property | RDKit Function | Pareto Direction | Lipinski Limit |
|----------|---------------|:----------------:|:--------------:|
| Molecular Weight (MW) | `MolWt` | minimize | ≤ 500 Da |
| cLogP (Crippen) | `MolLogP` | minimize | ≤ 5 |
| H-Bond Donors (HBD) | `NumHBD` | minimize | ≤ 5 |
| H-Bond Acceptors (HBA) | `NumHBA` | minimize | ≤ 10 |
| TPSA | `TPSA` | minimize | ≤ 140 Å² |
| Rotatable Bonds | `NumRotatableBonds` | minimize | ≤ 10 |
| Fraction sp3 (FrCSP3) | `FractionCSP3` | maximize | — |

- **Direction convention:** All six Pareto properties use "lower is better" (minimize). This is biophysically motivated — smaller, less lipophilic, more rigid molecules are generally preferred for oral drugs. FrCSP3 is tracked but excluded from Pareto ranking.
- **Drug-likeness filters:** Lipinski Ro5 (≤1 violation), Veber (TPSA ≤ 140, RotBonds ≤ 10), Ghose (160 ≤ MW ≤ 480, −0.4 ≤ LogP ≤ 5.6), Lead-like (MW ≤ 350, LogP ≤ 3.5, RotBonds ≤ 7). Applied as overlays on all scatter plots.

### 5.3 Non-Dominated Sorting and Pareto Ranking (~300 words)

**Definition:** Molecule *i* dominates molecule *j* if *i* is at least as good as *j* in all objectives and strictly better in at least one. Formally, for minimization:

$$i \succ j \iff \forall k \in K: f_k(i) \leq f_k(j) \;\wedge\; \exists k \in K: f_k(i) < f_k(j)$$

where *K* = {MW, LogP, HBD, HBA, TPSA, RotBonds}.

**Algorithm (implemented):**
```
function computeParetoRanks():
  for each molecule i:
    dominated[i] = false
    for each molecule j ≠ i:
      if j dominates i:  // j ≤ i on all, < on at least one
        dominated[i] = true
        break
  assign paretoRank = 1 (Pareto-optimal) or 2 (dominated)
```

- **Complexity:** O(n² × d) where n = molecule count, d = 6 properties. Adequate for n ≤ 500 (target use case). For larger sets, future work could implement the fast non-dominated sorting of NSGA-II (O(n² d) worst case but with better constants).
- **Pairwise dominance matrix:** Separately computed — for each pair (i, j), determines if i dominates j, j dominates i, or neither. Stored as `molecules[i].dominates[]` and `molecules[i].dominatedBy[]`. Rendered as an interactive grid.
- **Limitation — binary ranking:** Current implementation assigns rank 1 (Pareto front) or rank 2 (everything else). Full non-dominated sorting (multiple Pareto fronts/layers) would assign ranks 1, 2, 3, ... iteratively removing the front. This is noted as future work.

### 5.4 Weighted Chebyshev Scalarization (~300 words)

To convert multi-objective analysis into a single ranked list, MolParetoLab implements weighted Chebyshev (augmented Tchebycheff) scalarization:

$$s(x) = \max_{k \in K} \left[ w_k \cdot \frac{|f_k(x) - f_k^*|}{\text{range}_k} \right]$$

where:
- $f_k^*$ = utopia value (minimum of property *k* across the current molecule set)
- $\text{range}_k = \max_k - \min_k$ (per-property normalization)
- $w_k$ = user-specified weight for property *k*

**Why Chebyshev, not linear:** Linear scalarization ($s = \sum w_k f_k$) cannot find solutions on non-convex regions of the Pareto front (Miettinen, 1999). Chebyshev scalarization is guaranteed to find any Pareto-optimal point for appropriate weight vectors, making it strictly more powerful for exploring trade-offs.

**Preset scoring profiles:**

| Profile | MW | LogP | HBD | HBA | TPSA | RotBonds | Rationale |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|-----------|
| Drug-like | 0.20 | 0.20 | 0.15 | 0.15 | 0.15 | 0.15 | Balanced Ro5 emphasis |
| CNS Drug | 0.20 | 0.25 | 0.15 | 0.05 | 0.30 | 0.05 | TPSA < 90 critical for BBB |
| Oral Bioavail. | 0.20 | 0.15 | 0.10 | 0.05 | 0.25 | 0.25 | Flexibility + polarity matter |
| Lead-like | 0.30 | 0.25 | 0.10 | 0.10 | 0.05 | 0.20 | Smaller, room to grow |
| Custom | 0.17 | 0.17 | 0.17 | 0.17 | 0.16 | 0.16 | User-adjustable sliders |

- **Interactive weight sliders:** Users adjust weights via range sliders (0.00–1.00, step 0.05), immediately re-ranking molecules. Switching to any slider triggers "Custom" profile.
- **Per-molecule diagnostics:** Each scored molecule shows its best property (lowest term) and worst property (highest term = the bottleneck driving its score).

### 5.5 Structural Similarity and Activity Cliffs (~250 words)

**Morgan Fingerprints:**  
Molecular fingerprints are computed client-side via `mol.get_morgan_fp({radius: 2, nBits: 2048})`, yielding 2048-bit Morgan/ECFP4-equivalent circular fingerprints.

**Tanimoto Coefficient:**  
Pairwise similarity is the Jaccard index over bit vectors:

$$T(A, B) = \frac{|A \cap B|}{|A \cup B|}$$

The full n×n symmetric matrix is computed and rendered as a heatmap with a diverging color scale (blue → green → yellow → red).

**Activity Cliff Detection:**  
Activity cliffs are molecule pairs with high structural similarity but large property differences — the most informative pairs for SAR. MolParetoLab identifies them as:

```
For each pair (i, j) with Tanimoto > 0.5:
  Normalize each property by Lipinski max: norm_k = prop_k / limit_k
  Euclidean distance: propDist = sqrt(Σ (norm_i_k - norm_j_k)²)
  Cliff score = Tanimoto(i,j) × propDist
  Report top 5 cliffs with their most-differing properties
```

This adapts the classic activity cliff definition (Stumpfe & Bajorath, *JCIM* 2012) from bioactivity to physicochemical property space. The most informative pairs are those where small structural changes cause large property shifts — critical for understanding SAR in the absence of activity data.

**Diversity Score:**  
Overall set diversity = mean(1 − T) across all pairs. Reported alongside the similarity matrix.

### 5.6 BOILED-Egg Permeation Model (~150 words)

The BOILED-Egg plot (Daina & Zoete, *ChemMedChem* 2016) maps molecules in WLogP × TPSA space with elliptical regions for:
- **White (egg white):** High probability of passive GI absorption (TPSA < ~142, WLogP in [−2.3, 6.8])
- **Yellow (yolk):** High probability of BBB permeation (TPSA < ~79, WLogP in [0.4, 6.0])

MolParetoLab reimplements this as a Canvas 2D rendering with Pareto-optimal molecules highlighted, providing a visual bridge between permeation prediction and Pareto analysis.

### 5.7 Interactive Visualization System (~400 words)

**Ten coordinated views:** Each view addresses a different analysis question.

| # | View | Question Answered | Engine |
|---|------|-------------------|--------|
| 1 | **Pareto Scatter** | Which molecules are non-dominated? Where are trade-offs? | Chart.js scatter × 6 property pairs |
| 2 | **Scoring Profiles** | Which molecule best balances my priorities? | HTML + weighted Chebyshev |
| 3 | **Parallel Coordinates** | How do all molecules compare across all properties simultaneously? | Canvas 2D custom renderer |
| 4 | **Similarity Matrix** | How structurally related are my molecules? Where are activity cliffs? | Canvas 2D heatmap |
| 5 | **BOILED-Egg** | Which molecules are GI-absorbed? BBB-permeable? | Canvas 2D with Daina–Zoete ellipses |
| 6 | **Radar** | What's the property shape of each molecule? | Chart.js radar |
| 7 | **Properties Table** | What are the exact numbers? Which filters pass/fail? | HTML table with verdict column |
| 8 | **Dominance Matrix** | Who dominates whom? | HTML pairwise grid |
| 9 | **Compare** | Head-to-head: which molecule wins on which properties? | Chart.js bar + HTML |
| 10 | **Activity Cliffs** | Which structurally similar pairs differ most in properties? | HTML + top-5 ranked list |

**Smart view selection:** The default view adapts to molecule count:
- n = 2 → Compare (head-to-head most useful)
- n ≤ 4 → Scoring (small sets benefit from ranked scoring)
- n ≤ 12 → Pareto Scatter (canonical multi-objective view)
- n > 12 → Parallel Coordinates (scales to many molecules)

**Linked interactions:**
- Click a molecule in any view → highlight across views
- Hover on scatter/parallel coords → tooltip with 2D structure SVG, name, key properties
- Drug-likeness filter overlays (Lipinski, Veber, Ghose, Lead-like) toggle on all scatter plots simultaneously

**Figure 2:** Screenshot montage of all 10 views for the same 8-molecule drug-like example set.

### 5.8 Accessibility and Sharing (~150 words)

- **Keyboard navigation:** Tab through views, Enter to select molecules
- **Copy summary:** One-click clipboard export of Pareto set, scoring ranking, and key trade-offs in plain text — ready to paste into emails, notebooks, or reports
- **Shareable URLs:** LZ-String-compressed SMILES encoded in URL parameters. Recipients open the link and see the same molecules and analysis. No server needed.
- **SDF upload:** Client-side .sdf file parsing via RDKit.js `get_mol()`. Drag-and-drop supported.
- **CSV export:** Download all computed properties for downstream analysis in R/Python/Excel.

---

## 6. Case Studies

### Case Study 1: Kinase Inhibitor Selection (Imatinib Family) (~500 words)

**Goal:** Demonstrate Pareto analysis for a real medicinal chemistry decision — selecting among structurally related kinase inhibitors.

**Molecules (8–10):**
- Imatinib (Gleevec)
- Dasatinib (Sprycel)
- Nilotinib (Tasigna)
- Bosutinib (Bosulif)
- Ponatinib (Iclusig)
- Sunitinib (Sutent)
- Sorafenib (Nexavar)
- Erlotinib (Tarceva)
- Gefitinib (Iressa)
- Lapatinib (Tykerb)

**Analysis plan:**
1. Load SMILES → compute properties → show Pareto front
2. Show that the Pareto front identifies molecules with genuinely different trade-off profiles (e.g., erlotinib = low MW but higher TPSA; ponatinib = optimized LogP but high MW)
3. Apply CNS Drug scoring profile → ranking shifts dramatically (erlotinib/gefitinib rise due to favorable TPSA)
4. Show dominance matrix — which inhibitors are strictly dominated?
5. Show activity cliffs — structurally similar pairs (e.g., imatinib/nilotinib) with different property profiles
6. Use BOILED-Egg to identify BBB-permeable subset

**Key narrative:** A medicinal chemist choosing a backup compound after imatinib resistance would traditionally compare these in a spreadsheet. MolParetoLab shows the trade-off landscape in seconds.

**Figure 3:** Pareto scatter (MW vs LogP) for kinase inhibitors with Pareto front highlighted. Inset: scoring ranking under Drug-like vs CNS profiles.

### Case Study 2: Fragment-to-Lead Property Tracking (~400 words)

**Goal:** Show how properties evolve during fragment elaboration — and how Pareto analysis helps maintain a balanced profile.

**Molecules (5–6):**
- A fragment hit (MW ~180, low LogP)
- 3–4 elaborated analogs (growing MW, changing LogP/TPSA)
- The final lead compound

**Analysis plan:**
1. Load the series → show on parallel coordinates how properties drift
2. The fragment is Pareto-optimal trivially (lowest on everything)
3. Among elaborated analogs, show which ones maintained Pareto optimality vs. which became dominated
4. Use scoring profiles to find the elaboration that best preserves drug-likeness
5. Radar overlay shows the property "shape" expanding from fragment to lead

**Key narrative:** Fragment-based drug design typically tracks properties in a table. Parallel coordinates + Pareto analysis makes property inflation visible and quantifiable. The medicinal chemist can see *where* they lost the balanced profile.

**Figure 4:** Parallel coordinates showing property evolution from fragment (green) through elaboration steps to lead (orange). Dominated intermediates highlighted in red.

### Case Study 3: Large Library Triage (50+ Molecules) (~400 words)

**Goal:** Demonstrate scalability and triage utility for larger compound sets.

**Molecules:** 50 diverse drug-like molecules (could use a ChEMBL subset — e.g., top-50 approved small molecule drugs by MW diversity).

**Analysis plan:**
1. Load 50 SMILES → show parallel coordinates (the natural view for large sets, auto-selected by smart defaults)
2. Identify Pareto front (typically 5–10 molecules out of 50)
3. Use Lead-like scoring profile to triage for early-stage optimization
4. Similarity matrix reveals structural clusters
5. Show that the top-5 scoring molecules span different structural clusters (chemical diversity on the Pareto front)
6. Copy summary → paste into a report

**Key narrative:** In an HTS triage scenario, a computational chemist has 50 confirmed hits. Rather than manually filtering by Lipinski and sorting by one property, MolParetoLab identifies the non-dominated set and ranks by any multi-objective profile. Time from raw SMILES to a prioritized shortlist: under 30 seconds.

**Figure 5:** (a) Similarity heatmap for 50 molecules with cluster structure visible. (b) Pareto scatter showing 8 non-dominated molecules highlighted from the 50. (c) Scoring ranking with Lead-like profile.

**Performance note:** 50 molecules × 6 properties × O(n²) dominance: ~2500 comparisons, completes in <100ms in-browser. Test on Chrome, Firefox, Safari, Edge.

---

## 7. User Study Design

### 7.1 Study Objective

Evaluate whether Pareto-aware analysis (MolParetoLab) improves the speed and quality of multi-property molecule selection compared to traditional tabular comparison.

### 7.2 Participants

- **Target:** 12–20 medicinal chemists (mix of academic + pharma)
- **Recruitment:** Post on MedChem Twitter/X, LinkedIn drug discovery groups, direct outreach to collaborators at Ravindranath lab and Alliance Canada network
- **Inclusion:** ≥2 years experience in lead optimization or compound triage
- **Compensation:** Co-authorship acknowledgment or Amazon gift card

### 7.3 Study Design — Within-Subjects A/B

Each participant completes **two molecule selection tasks** (counterbalanced):
- **Task A — Tabular baseline:** Given a table of 12 molecules × 6 properties (CSV or spreadsheet), select the top-3 compounds for a CNS drug program. Justify choices.
- **Task B — MolParetoLab:** Same task (different molecule set, matched difficulty) using MolParetoLab.

**Counterbalancing:** Half do A-then-B, half do B-then-A. Molecule sets randomized.

### 7.4 Metrics

| Metric | How Measured |
|--------|-------------|
| **Task completion time** | Stopwatch from task start to "I've selected my 3" |
| **Selection quality** | Do selected molecules include Pareto-optimal ones? Overlap with expert-consensus "best 3" |
| **Confidence** | 5-point Likert: "How confident are you in your selection?" |
| **Cognitive load** | NASA-TLX (6 subscales) |
| **Insight discovery** | Did participants mention trade-offs, dominance, or property conflicts? (qualitative coding) |
| **SUS score** | System Usability Scale (10-item, post-task for MolParetoLab condition) |

### 7.5 Analysis Plan

- Paired t-test or Wilcoxon signed-rank for time and confidence
- McNemar's test for selection quality (binary: includes Pareto-optimal set or not)
- Thematic analysis of think-aloud transcripts for insight discovery
- Report SUS score (target: >68 = above average usability)

### 7.6 Minimal Viable Study

If full 12-participant study is impractical for initial submission:
- **Expert walkthrough** (3–5 experienced medicinal chemists) with think-aloud protocol
- Focus on qualitative insights: "What did you learn from the Pareto view that you wouldn't have seen in a table?"
- Can be included in initial JCIM submission with full user study promised as follow-up

### 7.7 IRB Considerations

- Likely exempt (usability evaluation, no patient data, no biological samples)
- Check with institution; online consent form sufficient for remote study
- Record screen + audio (with consent) for think-aloud analysis

---

## 8. Discussion

### 8.1 Strengths (~200 words)

- **First web tool for molecular Pareto analysis** — fills a categorical gap in the cheminformatics tool landscape
- **Zero-install, zero-trust architecture** — no data leaves the browser, critical for pharma with proprietary IP
- **Complementary, not competitive** — works alongside SwissADME/ADMETlab, not instead of them. Accepts their outputs.
- **Low-friction design** — paste SMILES → insight in seconds. No learning curve for basic use.
- **Open source** — MIT license, single-file architecture means anyone can audit, fork, embed

### 8.2 Limitations (~300 words)

1. **Binary Pareto ranking:** Current implementation assigns rank 1 or 2 only. Full layered non-dominated sorting (rank 1, 2, 3, ...) would provide finer discrimination for larger sets. Straightforward to implement (iteratively peel Pareto fronts).

2. **Fixed objective directions:** All six properties are minimized. While this is correct for classical drug-likeness (Lipinski), some programs need to *maximize* LogP (e.g., lipid-targeting compounds) or TPSA (e.g., PPI inhibitors). User-configurable directions are needed.

3. **No ADMET predictions:** MolParetoLab computes only RDKit descriptors, not ML-predicted ADMET endpoints (Caco-2, clearance, hERG, etc.). This is by design (no server = no model hosting) but limits the objective space to physicochemical properties.

4. **Scalability:** O(n²d) Pareto ranking is adequate for n ≤ 500 but becomes sluggish for larger libraries. Web Workers or WASM-based sorting would extend the practical limit.

5. **Single logP model:** RDKit's Crippen logP only. SwissADME uses 6 models with consensus. A consensus approach would improve reliability.

6. **No 3D properties:** No conformer generation, no 3D pharmacophore features, no shape similarity. These could be added via RDKit.js 3D capabilities in future versions.

7. **No significance testing for activity cliffs:** Cliff detection uses a heuristic threshold (Tanimoto > 0.5). No statistical framework for whether property differences are meaningful.

### 8.3 Future Work (~200 words)

- **Full non-dominated sorting** (layered Pareto fronts, Pareto rank 1, 2, 3, ...)
- **User-configurable objective directions** (minimize/maximize per property)
- **Web Worker parallelization** for sets >500 molecules
- **Integration with ADMETlab 3.0 API** — pull ADMET predictions, then Pareto-rank them
- **Substructure search and highlighting** within the Pareto front
- **3D conformer viewer** (3Dmol.js or NGL integration)
- **Browser extension** — right-click any SMILES on the web → analyze in MolParetoLab
- **Collaborative mode** — real-time shared analysis sessions via WebRTC
- **Citation tracking** — embed a BibTeX entry in the app for easy academic referencing

---

## 9. Target Journal Analysis

### Option 1: JCIM (Journal of Chemical Information and Modeling) ⭐ **RECOMMENDED**

| Factor | Assessment |
|--------|------------|
| **Scope fit** | Excellent. "Development of new computational methods and efficient algorithms for chemical software" is a listed scope area. Application Notes are a natural format. |
| **Format** | Application Note: concise, ~4000 words, figures OK. Full Article also possible if case studies are rich enough. |
| **Impact Factor** | ~6.2 (2024). High visibility in the cheminformatics community. |
| **Review timeline** | Typically 2–4 months. Can request expedited review for software papers. |
| **Precedent** | DataWarrior (2015), SwissADME's BOILED-Egg paper was *ChemMedChem* but heavily cited in JCIM. ADMETlab papers in *NAR* and *JCIM*. |
| **Audience** | Computational chemists, cheminformatics developers, medicinal chemists. **This is the core audience.** |
| **Requirement** | Tool must be functional and accessible at review time (✅ — live on GitHub Pages). |
| **Open access** | ACS AuthorChoice (optional, ~$2500) or hybrid. |

**Verdict:** Best fit for MolParetoLab. The algorithmic contribution (Pareto analysis applied to molecular properties via client-side WASM) is novel and the tool is functional.

### Option 2: Bioinformatics (Oxford)

| Factor | Assessment |
|--------|------------|
| **Scope fit** | Good but not perfect. More bioinformatics-focused (genomics, proteomics). Cheminformatics tools do appear but are less common. |
| **Format** | Application Note: strict 2-page limit (~2000 words + 1 figure + 1 table). **Very tight.** Would need to cut Methods significantly. |
| **Impact Factor** | ~5.8 (2024). |
| **Review timeline** | 1–3 months. Fast turnaround for Application Notes. |
| **Audience** | Bioinformaticians, less medicinal chemistry overlap. |
| **Requirement** | Software must be free for academic use for ≥2 years. ✅ (MIT license) |

**Verdict:** Viable backup. The 2-page limit forces severe trimming — would lose the case studies and user study, which are this paper's strengths.

### Option 3: JOSS (Journal of Open Source Software)

| Factor | Assessment |
|--------|------------|
| **Scope fit** | Good. Any open-source software with research application. |
| **Format** | Very short paper (~1000 words). Emphasis on code quality, tests, documentation. The "paper" is secondary to the software review. |
| **Impact Factor** | ~3.5 (2024). Lower than JCIM/Bioinformatics. |
| **Review timeline** | 2–8 weeks (varies). Open peer review on GitHub. |
| **Audience** | Research software community, broad. |
| **Requirements** | Need automated tests, good documentation, community guidelines. MolParetoLab currently has **no automated tests** — this would need to be added. |

**Verdict:** Easy publication path but low impact for the contribution. Better suited for utility libraries than domain-specific tools with novel algorithms. Would undersell the Pareto analysis contribution.

### Option 4: NAR Web Server Issue

| Factor | Assessment |
|--------|------------|
| **Scope fit** | NAR prefers biology-focused web servers (DNA/RNA/protein). A small-molecule cheminformatics tool is an unusual fit. |
| **Format** | ~3000 words, structured. Mandatory: accessible URL, no login required. |
| **Impact Factor** | ~14 (2024). Highest among options. |
| **Review timeline** | Annual deadline (closed for 2026 — proposals ended Dec 2025). **Would need to wait for 2027 cycle.** |
| **Audience** | Molecular biology, bioinformatics. Less drug discovery. |

**Verdict:** Wrong audience and timing. The 2026 issue is closed. Would need to wait ~1 year.

### Recommendation

**Submit to JCIM as an Application Note.**

Reasons:
1. Perfect scope match (cheminformatics tool with algorithmic novelty)
2. Right audience (computational + medicinal chemists)
3. Flexible format (enough room for case studies)
4. No annual deadline — submit anytime
5. The JCIM reviewers will appreciate the client-side WASM approach and the Pareto analysis novelty

**Backup:** If JCIM rejects, reformat as a *Bioinformatics* Application Note (cut to 2 pages) or a *JOSS* software paper (add automated tests first).

---

## 10. Timeline — 4-to-6-Week Plan

### Week 1: Case Study Data + Figures (March 13–20)

| Day | Task | Owner |
|-----|------|-------|
| 1–2 | Gather SMILES for all three case studies. For kinase inhibitors: pull from ChEMBL/PubChem. For fragment series: use a published fragment-to-lead example or create a synthetic one. For 50-mol library: curate from approved drug list. | Ilkham |
| 2–3 | Run all three case studies through MolParetoLab. Screenshot every view. Record timings. | Ilkham |
| 3–4 | Draft Figure 1 (architecture diagram) in Inkscape/Figma. | Ilkham |
| 4–5 | Draft Figures 2–5 (screenshot montages, annotated). Export as 300 dpi PNG. | Ilkham |

**Milestone:** All figures drafted, all case study data ready.

### Week 2: Methods + Results Writing (March 20–27)

| Day | Task | Owner |
|-----|------|-------|
| 1–2 | Write §5 Methods (5.1–5.8). Pseudocode + equations from this outline. | Ilkham |
| 3–4 | Write §6 Case Studies. Follow the analysis plans above. Be concrete: report actual property values, actual Pareto sets, actual scoring rankings. | Ilkham |
| 4–5 | Write §4 Related Work. Pull citations from this outline + verify with Google Scholar. | Ilkham |

**Milestone:** Methods + Results + Related Work drafted.

### Week 3: Intro + Discussion + Expert Walkthroughs (March 27–April 3)

| Day | Task | Owner |
|-----|------|-------|
| 1–2 | Write §3 Introduction. Frame the gap clearly. | Ilkham |
| 2–3 | Write §8 Discussion. Limitations are already enumerated above — expand into prose. | Ilkham |
| 3–5 | **Expert walkthrough:** Recruit 3–5 medicinal chemists. Have each spend 15 min with MolParetoLab on a prepared task. Record observations. Code qualitative insights. | Ilkham |
| 5 | Write §7 results: summarize walkthrough findings (even if informal). | Ilkham |

**Milestone:** Complete first draft.

### Week 4: Polish + Internal Review (April 3–10)

| Day | Task | Owner |
|-----|------|-------|
| 1–2 | Write Abstract (250 words, last — now you know what the paper says). | Ilkham |
| 2–3 | Format for JCIM: ACS template (Word or LaTeX). Add references in ACS style. | Ilkham |
| 3–4 | Internal review: send to advisor / trusted colleague for feedback. | Ilkham |
| 4–5 | Address feedback. Polish figures. Check all URLs work. | Ilkham |

**Milestone:** Submission-ready manuscript.

### Week 5: Pre-submission Checks + Submit (April 10–17)

| Day | Task | Owner |
|-----|------|-------|
| 1 | Final proofread. Check all SMILES in case studies are valid (run through MolParetoLab one last time). | Ilkham |
| 1 | Ensure GitHub repo has: MIT LICENSE, README with citation instructions, clean commit history. | Ilkham |
| 2 | Write cover letter: "MolParetoLab is the first web tool for interactive multi-objective Pareto analysis of molecular properties. We believe it fits JCIM's Application Note category." | Ilkham |
| 2 | Submit via ACS Paragon Plus. Select "Application Note" article type. Suggest 3 reviewers (cheminformatics + MOO background). | Ilkham |

**Milestone:** Paper submitted to JCIM.

### Week 6: Buffer (April 17–24)

- Handle any ACS Paragon submission system issues
- If user study data arrives late, can extend writing by 1 week
- Begin drafting Twitter/LinkedIn announcement thread for when paper is posted on ChemRxiv preprint

### Pre-Submission Checklist

- [ ] All SMILES validated (load in MolParetoLab, no parsing errors)
- [ ] All figures ≥300 dpi, readable at 50% zoom
- [ ] GitHub repo clean: LICENSE, README, CITATION.cff, no debug code
- [ ] MolParetoLab live at stable URL (ilkhamfy.github.io/molparetolab)
- [ ] References: verify all DOIs resolve
- [ ] Cover letter written
- [ ] ACS Paragon account created
- [ ] Suggested reviewers list (3 names + affiliations + emails)
- [ ] No proprietary data in any figure or example
- [ ] Co-author approval (if any)

---

## Appendix A: Key References to Cite

| Ref | Why |
|-----|-----|
| Daina & Zoete, *ChemMedChem* 2016 | BOILED-Egg model we implement |
| Daina et al., *Sci Rep* 2017 | SwissADME — primary competitor |
| Sander et al., *JCIM* 2015 | DataWarrior — closest tool comparison |
| Pires et al., *J Med Chem* 2015 | pkCSM — ADMET prediction tool |
| Dong et al., *NAR* 2024 | ADMETlab 3.0 — competitor |
| Deb et al., *IEEE Trans Evol Comput* 2002 | NSGA-II — canonical non-dominated sorting |
| Miettinen, *Nonlinear Multiobjective Optimization* 1999 | Chebyshev scalarization theory |
| Lipinski et al., *Adv Drug Deliv Rev* 2001 | Rule of Five |
| Veber et al., *J Med Chem* 2002 | Oral bioavailability rules |
| Rogers & Hahn, *JCIM* 2010 | Morgan/ECFP fingerprints |
| Stumpfe & Bajorath, *JCIM* 2012 | Activity cliff concept |
| Graff et al., *Chem Sci* 2024 | MolPAL — multi-objective Bayesian screening |
| Xu et al., *J Chem Inf Model* 2024 | ParetoDrug — Pareto MCTS for molecules |
| Landrum, 2006– | RDKit — core cheminformatics engine |
| RDKit.js (rdkit-js on npm) | Client-side WASM cheminformatics |

## Appendix B: Suggested Reviewers

| Name | Affiliation | Expertise | Rationale |
|------|------------|-----------|-----------|
| Antoine Daina | SIB/UniLausanne | SwissADME creator, BOILED-Egg | Directly relevant tool developer; can assess novelty vs. SwissADME |
| Thomas Sander | Idorsia/OpenMolecules | DataWarrior creator | Knows interactive cheminformatics tools deeply |
| Jürgen Bajorath | University of Bonn | Activity cliffs, SAR analysis | Expert on the activity cliff concept we adapt |

> *Note:* ACS allows suggesting reviewers but editors may override. Include at least one MOO/optimization expert as well.

---

*This outline is a working document. Start writing from §5 (Methods) — it's the most concrete section and will anchor the rest.*
