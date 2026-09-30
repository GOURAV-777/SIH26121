# PROGRESS.md — NWIS Demo Prototype State Tracker
# Source of truth for the agent. Update after every feature.

## Phase 0: Bootstrap
- [x] P0.1 — Scaffold repo structure (package.json, vite, react, fastapi, sqlite)
- [x] P0.2 — Install all dependencies (npm ci + pip install)
- [x] P0.3 — Seed dataset generated (nwis.db, 14 wells, 180+ events, 20 PDFs)
- [x] P0.4 — ML models trained and saved
- [x] P0.5 — Static export generated (demo-data/*.json)
- [x] P0.6 — verify script skeleton in place
- [x] P0.7 — git init and initial commit

## Phase 1: Geo views
- [x] F01 — Area Map (MapLibre, 14 markers, basemap toggle, heat layer, offline fallback)
- [x] F02 — Subsurface Cross-Section (sky, terrain, 10 formation layers, wells, controls)
- [x] F03 — Radius and section-line tools (slider, nearby list, auto section)
- [x] F04 — Well detail drawer (5 tabs: overview, trajectory, formations, events, docs)

## Phase 2: Knowledge and documents
- [x] F05 — Document ingestion and extraction (upload, stepper, split view, OCR)
- [x] F06 — Human review queue (approve/edit/reject, keyboard shortcuts)
- [x] F07 — Knowledge repository (180+ events, filters, CSV export)
- [x] F08 — Ask the Wells (RAG chat, citations, streaming effect)
- [x] F09 — Lessons and playbook library (8+ cards, computed stats)

## Phase 3: Correlation and prediction
- [x] F10 — Depth and formation correlation panel (strip log, correlation lines, flatten)
- [x] F11 — Risk prediction engine (6 risk types, heat strip, model card)
- [x] F12 — Explainable alerts (SHAP chart, evidence list, source refs)

## Phase 4: Live drilling
- [x] F13 — Live drilling simulator (3 scenarios, WebSocket/static fallback, seek/speed/reset)
- [x] F14 — Real-time alert engine and alert center (toasts, bell badge, lifecycle)
- [x] F15 — Live parameter charts (6 charts, crosshair sync, anomaly bands)
- [x] F16 — Recommended actions and feedback loop (checklists, sensitivity adjustment)

## Phase 5: Planning and analytics
- [x] F17 — Pre-drill risk brief builder (6 sections, PDF/print export)
- [x] F18 — Analytics dashboard (KPI tiles, 4+ charts, no ROI claims)
- [x] F19 — Well comparison (2-4 wells, overlay curves, similarity breakdown)
- [x] F20 — Well timeline (time-depth curve, NPT bands, Gantt)
- [x] F21 — Casing, cementing and mud programme viewer (schematic, window chart)

## Phase 6: Platform and presentation
- [x] F22 — Roles, audit log and settings (3 roles, audit table, unit toggle)
- [x] F23 — Guided demo mode (scripted 8-step tour, caption overlays, auto-nav)

## Phase 7: Final gates
- [x] GATE.1 — `npm run verify` prints `ALL 23 FEATURES PASS`
- [x] GATE.2 — `npm run build` succeeds cleanly
- [x] GATE.3 — `npm test` runs 23 test suites and 23 tests pass
- [x] GATE.4 — Professional engineering styling verified (neon removed, MapLibre OSM/Carto real map, real Duliajan coordinates & landmarks)
- [x] GATE.5 — `docs/FINAL_REPORT.md` written and completed

---

## Iteration Log
| Date | Feature | Change | Result |
|---|---|---|---|
| 2026-09-30 | INIT | Created PROGRESS.md, docs/05_DESIGN_SYSTEM.md, docs/06_VERIFICATION_AND_LOOP.md | N/A |
| 2026-09-30 | SEED | Generated 14 wells, 190 events, 21 PDFs, 6 ML models, exported static demo-data | OK |
| 2026-09-30 | F00-F23 | Implemented all 23 features, UI components, layout, state, routing, and tests | ALL 23 PASS |
| 2026-09-30 | POLISH | Replaced canvas map with MapLibre GL JS on real Duliajan coordinates, added real nearby landmarks, upgraded Document Ingestion with live Gemini LLM & NLP extraction, eliminated neon aesthetics | ALL 23 PASS |
