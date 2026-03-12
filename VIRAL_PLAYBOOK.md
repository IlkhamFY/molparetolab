# MolParetoLab — Viral Playbook 🧬🔥

> **Generated:** 2026-03-12 | **Purpose:** Reverse-engineer what makes chemistry tools go viral and apply those patterns to MolParetoLab's growth strategy.

---

## Part 1: Anatomy of Viral Chemistry Tools

### Case Studies — What Spread and Why

#### 1. SwissADME (~10,000+ citations, millions of users)
- **What made it spread:** Zero-friction access (no registration, no install), instant results from a SMILES string, and the **BOILED-Egg plot** — a single, visually stunning chart that became the screenshot everyone shared. The bioavailability radar chart became a "figure generator" — students and researchers could produce publication-ready figures in 30 seconds.
- **Who shared it:** Graduate students writing their first papers. Supervisors saying "just run SwissADME on it." Became a default step in every computational drug discovery curriculum.
- **Problem solved instantly:** "Is my molecule drug-like?" — answered in one click.
- **Aha moment:** Paste SMILES → see the radar chart → realize your molecule fails 3 rules → save months of wasted synthesis. The radar chart IS the aha moment.
- **Viral mechanic:** **Academic citation snowball** — once enough papers cited it, every reviewer expected it. Self-reinforcing adoption.

#### 2. ADMETlab 3.0 (667+ citations in <2 years, 1.7M visits)
- **What made it spread:** 119 endpoints (most comprehensive free tool), API for batch processing, and an academic paper in Nucleic Acids Research (high-visibility journal). Outperformed SwissADME on benchmarks — gave people a reason to switch.
- **Who shared it:** Computational chemists who needed more than Lipinski. Groups doing virtual screening at scale (API users). Chinese pharma/biotech ecosystem (strong in that community).
- **Problem solved instantly:** "I need ADMET predictions for 500 compounds and SwissADME is too slow." Batch + API = adoption.
- **Aha moment:** Upload a list → get 119 predictions per molecule → uncertainty scores tell you which predictions to trust. Power users love this.
- **Viral mechanic:** **Feature depth as competitive moat** — 119 endpoints became the talking point. "SwissADME does 30; ADMETlab does 119."

#### 3. AlphaFold / AlphaFold Server (Nobel Prize, billions of structures)
- **What made it spread:** Solved a 50-year grand challenge in biology. Free web server at alphafoldserver.com for anyone to predict structures. Database of 200M+ pre-computed structures.
- **Who shared it:** Every biologist, every science journalist, every funding agency. Nobel Prize in 2024 amplified it to mainstream.
- **Problem solved instantly:** "What does this protein look like?" — answered in minutes instead of years.
- **Aha moment:** Enter a protein sequence → get a 3D structure with confidence coloring → realize the answer that used to take a PhD project now takes 30 seconds.
- **Viral mechanic:** **Paradigm shift** — not incremental improvement, but category creation. Also: open access database meant downstream tools could build on it.

#### 4. Boltz-1 / Chai-1 (open-source AlphaFold competitors, 2024)
- **What made it spread:** Open-source alternatives to AlphaFold 3 (which was initially restricted). MIT license = anyone can use commercially. ABCFold made it easy to compare all three.
- **Who shared it:** ML researchers, biotech startups, open-source advocates. "Big Pharma backing open-source" was the narrative.
- **Problem solved:** "I want AlphaFold 3 quality but I can actually run it on my own GPU."
- **Viral mechanic:** **Open-source rebellion against closed models** — the narrative drove the adoption as much as the technology.

#### 5. Consensus / Elicit / SciSpace (AI research tools)
- **What made it spread:** "Ask a scientific question, get an evidence-based answer with citations." Consensus had 103+ followers on Product Hunt within days. SciSpace ranked #1 in Science on Product Hunt.
- **Who shared it:** Students overwhelmed by literature. Researchers doing literature reviews. Twitter science communicators demoing it.
- **Problem solved instantly:** "I need to know what the literature says about X without reading 200 papers."
- **Aha moment:** Type a question → get a synthesis with real citations → verify it's not hallucinating.
- **Viral mechanic:** **Demo-ability** — you can screenshot the result and it's immediately impressive. Perfect for Twitter/LinkedIn posts.

#### 6. Ketcher (EPAM, web molecule editor)
- **What made it spread:** Best free web-based molecule editor. Embedded in dozens of ELNs and platforms (Chemotion, CDD Vault, etc.). GitHub stars grew steadily.
- **Who shared it:** Developers building chemistry apps. Lab informatics teams replacing commercial editors.
- **Problem solved:** "I need a molecule sketcher in my web app and don't want to pay ChemAxon."
- **Viral mechanic:** **Embeddability** — became infrastructure, not just a tool.

#### 7. Mol* (Mol Star, RCSB Protein Data Bank viewer)
- **What made it spread:** Replaced Jmol/JSmol as the default web viewer on PDB. Can render millions of atoms. Free, open-source.
- **Who shared it:** Structural biologists. Anyone viewing PDB structures on the web.
- **Viral mechanic:** **Platform integration** — became the default viewer for the world's protein structure database.

#### 8. DataWarrior (1,437 citations, open-source desktop)
- **What made it spread:** The only free tool with serious interactive visualization for chemical data. Scatter plots, parallel coordinates, activity cliffs — researchers who found it loved it.
- **Who shared it:** Cheminformatics PIs recommending it to students. Drug discovery teams on tight budgets.
- **Problem solved:** "I need DataWarrior-level analysis but can't afford Spotfire/Schrödinger."
- **Aha moment:** Load SDF → click scatter → see your SAR patterns instantly.
- **Viral mechanic:** **Word of mouth among power users** — slow but sticky.

---

## Part 2: Patterns of Viral Chemistry Tools

### Pattern 1: "Paste SMILES, Get Answer" (Zero-Friction Input)
Every viral chemistry tool has a **< 10-second time-to-value**:
- SwissADME: Paste SMILES → see radar in 5 seconds
- ADMETlab: Paste SMILES → 119 predictions in 3 seconds
- MolParetoLab: Paste SMILES → Pareto analysis in 2 seconds ← **we already have this**

**Action:** Our landing page should have a SMILES input box above the fold with a "Try it now" CTA. No scrolling needed to get value.

### Pattern 2: "Screenshot-Worthy Visualization" (Shareability)
The tools that spread fastest produce **visuals people want to screenshot and share**:
- SwissADME's BOILED-Egg plot → iconic, instantly recognizable
- AlphaFold's confidence-colored structures → rainbow proteins everywhere
- Consensus's "Yes/No/Possibly" consensus meters → perfect for Twitter

**Action:** MolParetoLab needs ONE signature visualization that's instantly recognizable and screenshot-worthy. The Pareto scatter with highlighted frontier is good but needs to be more visually distinctive. See Part 3.

### Pattern 3: "Figure Generator" (Academic Pull)
Tools that generate publication-ready figures get cited → citations drive adoption:
- SwissADME bioavailability radar → appears in thousands of papers
- ProTox toxicity radar → standard figure in toxicity papers
- DataWarrior plots → used in JCIM/JMedChem papers

**Action:** Add a "Download Figure" button that exports publication-quality PNG/SVG with proper axis labels, legends, and a small MolParetoLab watermark. Scientists will use it in papers → citations → more users.

### Pattern 4: "Free + No Registration + No Install" (Adoption Velocity)
Every viral tool has zero barriers:
- SwissADME: No registration ✅
- ADMETlab: No registration ✅  
- MolParetoLab: No registration, no server, no install ✅ ← **we're even better (client-side)**

**Action:** Never add mandatory registration. The privacy angle ("your molecules never leave your browser") is a differentiator worth emphasizing.

### Pattern 5: "The Default Step" (Workflow Integration)
Once a tool becomes "the thing you always do," it's viral:
- SwissADME became the default ADMET check
- AlphaFold became the default structure prediction
- RDKit became the default Python cheminformatics library

**Action:** Position MolParetoLab as "the default molecule comparison step" — after you get properties from SwissADME/ADMETlab, you paste them into MolParetoLab to compare. Or better: we compute the properties ourselves, making us the single stop.

### Pattern 6: "Shareable URL" (Network Effects)
Tools with built-in sharing grow faster:
- Google Docs → share a link, anyone can view
- We already have LZ-String URL encoding ← **underexploited**

**Action:** Make the share URL prominent. "Send this Pareto analysis to your advisor" — the shared link IS the distribution mechanism.

### Pattern 7: "Open Source + GitHub Stars" (Developer Adoption)
Boltz-1, RDKit, Ketcher — open source drives trust and contributions:
- MolParetoLab is already MIT-licensed on GitHub ✅

**Action:** Add a GitHub star badge to the app. Post the repo in awesome-cheminformatics lists.

---

## Part 3: Specific Features to Add for Virality

### 🔥 TIER 1 — Add This Week (Maximum Viral Impact)

#### 1. BOILED-Egg with Pareto Overlay (The Signature Plot)
**What:** Recreate SwissADME's BOILED-Egg plot (WLogP vs TPSA) but overlay Pareto-optimal molecules. White egg = GI absorbed, yellow yolk = BBB permeable, red dots = Pareto front.
**Why viral:** Everyone knows the BOILED-Egg. Adding Pareto to it is novel + familiar = perfect shareability. "I ran BOILED-Egg in MolParetoLab and it shows which molecules are actually best."
**Effort:** 4-6 hours (we have scatter plots, just add the egg zones)

#### 2. "Export as Figure" Button (Publication Pull)
**What:** One-click SVG/PNG export of the current view with axis labels, legend, title, and small watermark. Options for light/dark background, font size, DPI.
**Why viral:** Scientists need figures for papers. Every exported figure is a citation waiting to happen. SwissADME's radar appears in 10,000+ papers because it's export-ready.
**Effort:** 3-4 hours (Chart.js has toDataURL, just add UI chrome)

#### 3. Structure-on-Hover Tooltips
**What:** Hover over any point on the scatter plot → see a 2D structure rendering + molecule name + key properties.
**Why viral:** Makes screenshots 10x more informative. Makes the tool feel "alive" and polished. Every demo video would showcase this.
**Effort:** 4-5 hours (RDKit.js SVG rendering + chart tooltip override)

#### 4. "Compare to Drug" Quick-Load
**What:** Pre-loaded datasets of approved drugs by class (kinase inhibitors, GPCR ligands, HIV antivirals, etc.). User adds their molecules → instantly sees where they sit relative to real drugs.
**Why viral:** "How does my molecule compare to Imatinib?" is a question every med chem student asks. Built-in reference datasets = instant context = instant value.
**Effort:** 2-3 hours (curate SMILES lists, add buttons)

### 🔥 TIER 2 — Add This Month (Stickiness + Retention)

#### 5. Scoring Profiles with Sliders
**What:** Pre-built profiles (Drug-like, CNS-penetrant, Oral bioavail, Lead-like) with adjustable weight sliders. "I care 40% about logP, 30% about MW, 30% about TPSA" → see ranked list update in real-time.
**Why viral:** This is the "which molecule wins FOR ME" feature. Nobody else has it. Demo videos of sliding weights and watching rankings change are extremely shareable.
**Effort:** 8-12 hours

#### 6. Parallel Coordinates View
**What:** Multi-axis parallel coordinates where each molecule is a polyline through all property axes. Brushable ranges to filter.
**Why viral:** Visually stunning for multi-dimensional data. DataWarrior users will instantly recognize it and appreciate the web-native version.
**Effort:** 6-8 hours (D3.js parallel coordinates)

#### 7. "Molecule of the Day" / Example Gallery
**What:** Curated example analyses (e.g., "Comparing Pfizer's COVID-19 candidates", "The evolution of kinase inhibitors") as one-click demos.
**Why viral:** Pre-built stories are more shareable than empty tools. People share the analysis, not the tool. "Look at this cool Pareto analysis of kinase inhibitors" → link → new user.
**Effort:** 2-4 hours per analysis

### 🔥 TIER 3 — Add This Quarter (Moat Expansion)

#### 8. ADMETlab 3.0 API Integration
**What:** Toggle "Fetch ADMET predictions from ADMETlab 3.0" → enriches molecules with 119 ML-predicted endpoints → Pareto rank on predicted ADMET properties.
**Why viral:** Bridges the gap between property prediction and property comparison. "I ran ADMETlab and MolParetoLab in one tool."
**Effort:** 16-24 hours

#### 9. Browser Extension
**What:** Right-click any SMILES string on any webpage → "Open in MolParetoLab." Works on PubChem, ChEMBL, papers.
**Why viral:** Embeds MolParetoLab into existing workflows. Every ChEMBL search becomes a MolParetoLab entry point.
**Effort:** 12-16 hours

#### 10. Embed Widget (iframe)
**What:** `<iframe src="molparetolab.ilkham.com?embed=true&smiles=...">` that anyone can embed in blog posts, course materials, ELNs.
**Why viral:** Same mechanic as Ketcher — become infrastructure. Every chemistry blog post with an embedded Pareto analysis is free advertising.
**Effort:** 4-6 hours

---

## Part 4: What Medicinal Chemists Complain About Most

Based on Reddit/Twitter sentiment analysis (r/cheminformatics, r/chemistry, MedChem Twitter):

### Top Pain Points

| Rank | Complaint | Frequency | Tool Gap |
|------|-----------|-----------|----------|
| 1 | **"I have 10 candidates, which one should I make?"** | Very high | No free tool answers this. SwissADME tells you about each one; nothing helps you CHOOSE. **← This is us.** |
| 2 | **"SMILES handling is painful"** — inconsistent parsers, no visual editor, broken copy-paste | High | Ketcher helps but isn't integrated with analysis tools |
| 3 | **"Every tool is single-molecule"** — can't compare a set side-by-side | High | DataWarrior does this but is desktop-only. **← This is us.** |
| 4 | **"No good free retrosynthesis tool"** — ASKCOS abandoned, IBM closed RXN | High | CGFlow (2025) emerging but not web-accessible |
| 5 | **"Tools look like they're from 2005"** — ugly UIs, no dark mode, no interactivity | Medium | **← We already solve this.** |
| 6 | **"I need to chain tools"** — RDKit → Gaussian → analysis = manual hell | Medium | No-code workflow builders requested; KNIME too heavy |
| 7 | **"No free pKa prediction"** — ChemAxon has a lock on this | Medium | Open-source models emerging but no good web tools |
| 8 | **"Where's my chemical Grammarly?"** — SMILES validator/auto-corrector | Medium | Nothing exists |
| 9 | **"Proprietary compounds can't go to web tools"** — confidentiality concerns | Medium | **← Client-side is our answer.** |
| 10 | **"I wish there was a Notion for chemical data"** — searchable, visual, personal DB | Low-Med | Nothing exists; big opportunity |

### The Tool They Wish Existed

The single most-requested tool across all platforms: **"A free, web-based tool where I paste 5-20 SMILES, see all their properties compared side by side, and the tool tells me which ones are best based on what I care about — without installing anything or learning Python."**

This is **literally MolParetoLab**. We just need to market it.

---

## Part 5: Distribution Strategy

### Reddit (Primary Channel for Early Traction)

| Subreddit | Members | Strategy | Post Type |
|-----------|---------|----------|-----------|
| **r/cheminformatics** | ~5K | Core audience. Post as "I built this tool" with technical details. | Show & Tell + feature requests |
| **r/chemistry** | ~200K | Broader audience. Lead with visual (screenshot/GIF). | "I built a free tool for comparing molecules" |
| **r/drugdiscovery** | ~3K | Niche but high-value. Focus on decision-making angle. | "Which of your candidates is best? This tool tells you." |
| **r/computationalchemistry** | ~8K | Technical audience. Emphasize RDKit.js WASM, client-side. | Technical deep dive |
| **r/bioinformatics** | ~130K | Adjacent. Frame as "Pareto optimization for molecular screening." | Cross-post with bio framing |
| **r/machinelearning** | ~3M | Frame as "interactive multi-objective optimization visualization." | Technical + cool viz |
| **r/dataisbeautiful** | ~22M | Pure visual post. The Pareto scatter plot IS data visualization. | Screenshot with explanation |
| **r/webdev** | ~2M | "I built a single-HTML-file drug discovery tool with WASM" | Technical build story |
| **r/sideproject** | ~160K | "Weekend project → multi-objective molecule analysis in the browser" | Build story |

**Reddit Posting Strategy:**
1. Start with r/cheminformatics (most relevant, least competitive)
2. Cross-post to r/chemistry with a more accessible framing
3. If the tool resonates, post to r/dataisbeautiful with a killer screenshot
4. r/webdev for the technical angle ("RDKit compiled to WASM, zero backend")

### Twitter/X (Amplification)

**Key Accounts to Tag or Engage:**
| Account | Who | Why |
|---------|-----|-----|
| @deaborlowe | Derek Lowe | Most-read med chem blogger (In the Pipeline). If he mentions it, it's viral in pharma. 15-20K daily readers. |
| @wpwalters | Pat Walters | Cheminformatics leader. Writes "Practical Cheminformatics" blog. High influence in comp chem. |
| @DrugHunter | Drug Hunter | Curates drug discovery content. Newsletter with large audience. |
| @RDKit_org | RDKit official | Built on their tech. They often RT cool RDKit.js apps. |
| @_PracticalCheminformatics | Practical Cheminformatics | Blog + Twitter. Reviews tools. |
| @john_jumper | John Jumper | AlphaFold lead. Structural bio audience. |
| @KetanJoshi | Various AI/drug discovery accounts | Growing AI + drug discovery intersection |

**Twitter Post Templates:**
1. **The Demo:** GIF of pasting SMILES → Pareto front appearing → hovering over molecules. "Which of your drug candidates is actually best? Built a free tool to find out. No install, no registration. [link]"
2. **The Comparison:** Screenshot of BOILED-Egg with Pareto overlay. "SwissADME tells you about molecules. MolParetoLab tells you which one wins. 🎯"
3. **The Technical:** "Compiled RDKit to WASM, built multi-objective Pareto analysis, and shipped it as a single HTML file. Everything runs in your browser — your molecules never leave your machine. [link]"
4. **The Story:** "As a comp chem grad student, I kept asking 'but which molecule should I make?' No tool answered this. So I built one."

### LinkedIn (Professional Network)

**Strategy:** Longer-form posts targeting drug discovery professionals.

**Groups to Post In:**
| Group | Members | Focus |
|-------|---------|-------|
| Drug Discovery & Development | ~50K | Pharma professionals |
| Cheminformatics | ~5K | Technical audience |
| Computational Chemistry | ~15K | Academic + industry |
| AI in Drug Discovery | ~20K | Hype + substance mix |
| Medicinal Chemistry | ~10K | Core target |

**LinkedIn Post Template:**
> I've been frustrated by a gap in drug discovery tools for years.
> 
> We have SwissADME for properties. ADMETlab for ADMET. DataWarrior for visualization.
> 
> But NONE of them answer the simplest question: "I have 5 candidates. Which one should I make?"
> 
> So I built MolParetoLab — free, open-source, runs entirely in your browser.
> 
> Paste SMILES → see Pareto-optimal molecules → understand tradeoffs → make better decisions.
> 
> No registration. No server. Your molecules never leave your machine.
> 
> [Link] [Screenshot]
> 
> What features would make this useful for your workflow?

### Product Hunt

**Launch Strategy:**
- 79% of featured products are self-hunted — do it yourself
- Build a pre-launch list (collect emails from early Reddit users)
- Schedule for a Tuesday morning launch
- Key taglines: "The Pareto-optimal molecule picker" / "Multi-objective drug design in your browser"
- Categories: Science, Productivity, Developer Tools
- Reference: BIOS got 103 followers with AI scientist framing; SciSpace ranked #1 in Science

### Hacker News

**Template:** "Show HN: MolParetoLab – Multi-objective molecule analysis in a single HTML file (RDKit WASM)"
- HN loves: single-file apps, WASM, zero-dependency, open-source, novel visualization
- Lead with the technical angle: "Everything runs client-side via RDKit compiled to WebAssembly"

### Academic Channels

| Channel | Strategy |
|---------|----------|
| **Paper (JCIM or Bioinformatics)** | "MolParetoLab: Interactive Multi-Objective Pareto Analysis for Drug Discovery" → permanent citation engine |
| **awesome-cheminformatics (GitHub)** | PR to add MolParetoLab → 914 repos in the topic, high visibility |
| **RDKit newsletter / UGM** | Submit as a showcase project for RDKit User Group Meeting |
| **DrugHunter newsletter** | Pitch for inclusion in their tools roundup |
| **In the Pipeline (Derek Lowe)** | Email pitch — "Free tool that tells you which molecule wins" |

---

## Part 6: The Single Most Viral Feature We Could Add

### 🏆 **The "BOILED-Egg with Pareto" Plot**

**Why this specific feature:**

1. **Familiarity breeds sharing.** The BOILED-Egg is the most recognized visualization in computational drug discovery. EVERY comp chem student knows it. Adding Pareto to it gives people something new to share about something they already know.

2. **It's screenshot-perfect.** The egg shape (ellipse zones for GI absorption and BBB) is visually distinctive. Overlay Pareto-optimal molecules as highlighted stars/diamonds → instant visual story: "These molecules are both drug-like AND optimal."

3. **It answers TWO questions at once.** "Is my molecule drug-like?" (the egg) AND "Which of my molecules is best?" (the Pareto front). No other tool does both.

4. **It generates publication figures.** A BOILED-Egg + Pareto overlay figure in a paper is novel enough to attract reviewer attention and citations.

5. **It creates a meme-able format.** "Your compound" (off in the corner, dominated) vs. "My compound" (in the yolk, Pareto-optimal). Chemistry Twitter would eat this up.

**Implementation:**
- WLogP (y-axis) vs TPSA (x-axis) scatter plot
- Draw the white ellipse (GI absorption zone: TPSA ≤ 142, -2.3 ≤ WLogP ≤ 6.8)
- Draw the yellow ellipse (BBB zone: TPSA ≤ 79, -0.31 ≤ WLogP ≤ 3.84)
- Plot all molecules as dots, colored by Pareto rank
- Connect Pareto front with a bold line
- Pareto-optimal molecules get star markers
- Export as SVG with "MolParetoLab" watermark

**Estimated time:** 4-6 hours
**Expected impact:** First thing people screenshot and share. Instant recognition. "Oh, it's like SwissADME but it compares molecules."

---

## Part 7: Launch Timeline

### Week 1 (Now → March 19)
- [ ] Implement BOILED-Egg + Pareto plot
- [ ] Add "Export as Figure" (SVG/PNG)
- [ ] Add structure-on-hover tooltips
- [ ] Add "Compare to Drug" quick-loads
- [ ] Record GIF demo for README

### Week 2 (March 19-26)
- [ ] Post to r/cheminformatics
- [ ] Post to r/chemistry
- [ ] Tweet with demo GIF (tag @RDKit_org, @wpwalters)
- [ ] Submit PR to awesome-cheminformatics
- [ ] LinkedIn post

### Week 3 (March 26 → April 2)
- [ ] Implement scoring profiles with sliders
- [ ] Post to r/dataisbeautiful (if scatter is pretty enough)
- [ ] Hacker News "Show HN" post
- [ ] Email DrugHunter newsletter

### Week 4 (April 2-9)
- [ ] Product Hunt launch
- [ ] Email Derek Lowe (In the Pipeline)
- [ ] Submit to RDKit UGM showcase

### Month 2
- [ ] Parallel coordinates view
- [ ] ADMETlab API integration
- [ ] Begin paper draft

### Month 3
- [ ] Browser extension
- [ ] Embed widget
- [ ] Paper submission to JCIM

---

## Part 8: Metrics to Track

| Metric | Tool | Target (Month 1) | Target (Month 3) |
|--------|------|-------------------|-------------------|
| GitHub stars | GitHub | 100 | 500 |
| Unique visitors | Analytics (Plausible/Umami) | 1,000 | 10,000 |
| Reddit upvotes (launch) | Reddit | 50+ | — |
| Twitter impressions | X Analytics | 10,000 | 50,000 |
| Shared URLs generated | Internal counter | 100 | 1,000 |
| Citations | Google Scholar | 0 | 1-3 |
| Awesome-list inclusion | GitHub | ✅ | — |

---

## Part 9: Anti-Patterns to Avoid

1. **Don't require registration.** Every gate kills 80% of users. SwissADME's no-reg policy is key to its dominance.
2. **Don't make it look like a paper demo.** Gray backgrounds, Times New Roman, no interactivity = death. We already have dark mode ✅
3. **Don't explain too much before showing value.** Landing page should have SMILES input above the fold, not a paragraph about Pareto optimality.
4. **Don't add server-side computation (yet).** Client-side = privacy differentiator. The moment molecules leave the browser, we lose the pharma audience.
5. **Don't compete on ADMET depth.** ADMETlab has 119 endpoints with DMPNN models. We can't beat that. Compete on the decision layer — "given these properties, which molecule wins?"
6. **Don't neglect mobile.** Many scientists will first see the link on their phone (Twitter/Reddit). At minimum, the landing page and example should work on mobile. Interactive analysis can be desktop-only.

---

## Summary: The Viral Formula for MolParetoLab

```
VIRAL CHEMISTRY TOOL = 
    Zero friction (paste SMILES, no install)
  + Instant value (< 10 seconds to aha moment)
  + Screenshot-worthy visualization (BOILED-Egg + Pareto)
  + Publication-ready export (figure generator → citations)
  + Privacy by design (client-side → pharma trust)
  + Shareable URLs (network effects)
  + The answer to "which molecule wins?" (unmet need)
```

**One-line positioning:**
> SwissADME tells you what a molecule IS. MolParetoLab tells you which molecule WINS.

---

*This playbook will be updated as we execute and learn. Metrics, post links, and results go in `LAUNCH_LOG.md` (to be created).*
