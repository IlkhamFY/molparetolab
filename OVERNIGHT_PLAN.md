# Overnight Build Plan — March 12-13, 2026

## Phase 1: Polish & Assets (11 PM - 12 AM)
1. **OG image** — generate 1200x630 screenshot of app with molecules loaded
2. **README screenshots** — capture 5 views (Pareto, Scoring, Similarity, Parallel, BOILED-Egg)
3. **LAUNCH_POST.md refresh** — rewrite for v10 features

## Phase 2: Responsive & Performance (12 AM - 2 AM)
4. **Responsive layout** — media query <768px stacks sidebar below content
5. **Chart cleanup** — destroy Chart.js instances on view switch (memory leak)
6. **Accessibility** — ARIA labels on tabs, role=tabpanel, focus-visible on mol cards
7. **Filter toggle disclosure** — wrap in collapsible, hide by default

## Phase 3: Competitive Intelligence (2 AM - 4 AM)
8. **Deep spy: SwissADME** — screenshot every view, document exact UX flow, steal bioavailability radar overlay idea
9. **Deep spy: ADMETlab 3.0** — test their API, document all 119 endpoints, plan integration layer
10. **Deep spy: DataWarrior** — document their activity cliff implementation, parallel coords brushing UX
11. **Deep spy: Molstar/3Dmol.js** — can we add lightweight 3D conformer preview?
12. **Spy: emerging tools** — search for any new 2025-2026 molecular comparison tools we missed

## Phase 4: Features That Win (4 AM - 6 AM)
13. **ADMETlab API link-out** — button per molecule that opens ADMETlab with that SMILES, or fetch via their API
14. **Synthetic Accessibility score** — RDKit.js has SA score, add to properties
15. **QED (Quantitative Estimate of Drug-likeness)** — add to properties + scoring profiles
16. **PAINS filter** — flag problematic substructures
17. **Export as PNG** — html2canvas or canvas-based screenshot of current view

## Phase 5: Paper Prep (6 AM - 8 AM)
18. **JCIM paper outline** — structure, related work, what to benchmark
19. **Feature comparison table** — MolParetoLab vs all 8 competitors, updated for v10
20. **User study design** — how to validate the tool with real medchem users
