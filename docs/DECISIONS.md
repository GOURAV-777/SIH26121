# Architectural & Design Decisions Log

| Decision ID | Date | Area | Decision | Rationale | Fallback / Impact |
|---|---|---|---|---|---|
| DEC-001 | 2026-09-30 | Data & Seeding | Seed = 20260930 with 14 deterministic wells (DEMO-ACTIVE-01 + 13 offsets) and 200 synthetic events | Complete determinism for demo recording & repeatable test suite | N/A |
| DEC-002 | 2026-09-30 | Static Mode | Full dual-adapter architecture (Live FastAPI + Static JSON replay) in frontend `lib/api.ts` | Allows instant zero-config static hosting (Vercel/GitHub Pages) with full simulator & interactive maps | Falls back gracefully if backend is offline |
| DEC-003 | 2026-09-30 | Maps & Graphics | MapLibre GL for Area Map with vector fallback canvas, D3 + SVG + Canvas for Subsurface Cross-Section | High performance 60fps rendering with rich custom lithology shaders and animations | Offline vector fallback on network fail |
