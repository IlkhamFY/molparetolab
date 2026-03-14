# Chart Rewrite Brief

## What's broken (ground truth from screenshots)

### ParetoView
- Molecule name labels clutter the chart — truncated names overlap everywhere
- The overlay filter coloring is confusing: when ALL molecules pass (drug-like set), everything is green and the feature looks broken
- Gold ring "Pareto optimal" markers exist but are hard to see
- The axis-swap dropdowns are fine, keep them
- The Pareto "line" was removed but could be added as a subtle background annotation

### RadarView  
- Actually works now. Just make it look polished.

### SimilarityMatrixView
- The canvas-based rendering is fine but the matrix is too small when there are few molecules
- When n=8, cells should be ~60px each → total matrix ~480px. The container is 400px tall so cells get capped
- Make container height dynamic: min(80px * n + 100px for labels, 600px)

### EggView
- Looks good! Keep as-is.

### ParetoView overlay feature
- The bug: filter is working correctly (Lipinski allows 1 violation), but visually it looks broken because the drug-like example molecules all genuinely pass
- Fix: add a clear visual indicator when "all molecules pass" this filter (e.g. a subtle banner)
- More importantly: make the overlay buttons more visually distinct — radio style with colored active state

## What needs a proper rewrite

### 1. ParetoView — drop molecule name labels on chart
Name labels on scatter plots are almost always a mistake unless the chart is huge. Remove them. Instead:
- On hover: show tooltip card (already works)  
- On click: highlight the molecule in the sidebar
- Pareto-optimal points: larger point size (10px vs 6px for others), gold border

### 2. SimilarityMatrixView — fix container height  
Make the container height = Math.min(n * 60 + 100, 580)px  
Use inline style on the container div, not fixed Tailwind class.

### 3. ParetoView overlay — better UX
When activeFilter is set but ALL molecules pass (0 fails), show a small notice: "All molecules pass [FilterName]" in muted text below the legend. This makes it clear the feature IS working.

## Implementation notes
- Do NOT change EggView, ParallelView, ActivityCliffsView, ScoringView, CompareView, TableView — those are fine
- Only touch: ParetoView.tsx, RadarView.tsx (minor), SimilarityMatrixView.tsx
- Keep zero TypeScript errors
- Keep existing color palette
