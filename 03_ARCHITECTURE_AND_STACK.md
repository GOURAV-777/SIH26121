# 03 Architecture and Stack

## 1. Stack (fixed; do not debate, log deviations in DECISIONS.md)
**Frontend:** Vite, React 18, TypeScript (strict), Tailwind CSS, Radix UI primitives with shadcn-style components, lucide-react icons, Zustand (state), TanStack Query (data), MapLibre GL JS (Area Map), custom SVG + Canvas with d3-scale/d3-shape (Cross-Section, strip logs, charts), Recharts for simple dashboards, Framer Motion (subtle transitions), date-fns.
**Backend:** Python 3.11, FastAPI, Uvicorn, SQLModel over **SQLite** (PostGIS is the production path; mention it in docs only), pandas, numpy, scikit-learn, xgboost (fallback: sklearn GradientBoosting), shap (fallback: permutation contributions), pdfplumber, reportlab (generate synthetic PDFs and the brief PDF), pytesseract + pdf2image (optional OCR), rank_bm25 (search), optional sentence-transformers.
**Tests:** pytest, Vitest, Playwright (Chromium), axe-core for basic a11y.
**Tooling:** one root `package.json` orchestrates everything with cross-platform scripts (`concurrently`, `cross-env`, Node and Python only).
**Ports:** frontend 5173, backend 8000.

## 2. Repository layout
```
nwis-demo/
  CLAUDE.md  PROGRESS.md  run_loop.py  package.json  verify_report.md
  docs/                      # all MD files, screens/, DECISIONS.md, BLOCKERS.md, FINAL_REPORT.md
  backend/
    app/ main.py, config.py, db.py, models.py, schemas.py
         routers/ wells.py events.py docs.py search.py risk.py alerts.py live.py brief.py analytics.py audit.py
         services/ geo.py correlate.py similarity.py extract.py ocr.py rag.py risk_model.py alert_engine.py simulator.py brief_pdf.py
    seed/ generate_dataset.py, generate_pdfs.py, train_model.py, export_static.py
    data/ nwis.db, pdfs/, models/, static_export/
    tests/
  frontend/
    src/ app/ (routes, layout), components/ (ui, charts, map, section), features/f01 … f23, lib/ (api, units, format), store/, styles/
    public/ demo-data/ (static export goes here), pdfs/
  tests/e2e/                 # Playwright specs f01..f23, demo.spec.ts, static.spec.ts
  scripts/ verify.py, check_progress.py, screenshot.ts
```

## 3. Backend API (REST + WebSocket)
| Endpoint | Purpose |
|---|---|
| `GET /api/wells` | list wells; `?lat&lon&radius_km` returns distance and bearing |
| `GET /api/wells/{id}` | header, tops, casing, mud, survey, events summary |
| `GET /api/wells/{id}/trajectory` | MD, TVD, inc, azi, N/S, E/W |
| `GET /api/section?line=lon1,lat1;lon2,lat2` | projected wells, strata polygons, terrain, faults, groundwater, pressure zones |
| `GET /api/events` | filters: well, formation, type, severity, depth, date, q; pagination; CSV via `?format=csv` |
| `GET /api/events/{id}` | detail with source excerpt |
| `GET /api/lessons` | playbook cards with computed stats |
| `POST /api/docs/upload`, `GET /api/docs`, `GET /api/docs/{id}/pages/{n}` | ingestion and page images |
| `POST /api/docs/{id}/process` (SSE progress) | OCR, extract, validate, index |
| `GET /api/review`, `POST /api/review/{id}/approve|reject|edit` | review queue |
| `POST /api/chat` | Ask the Wells (structured answer + citations) |
| `GET /api/correlation?wells=…&flatten=…` | strip-log data and correlation lines |
| `GET /api/risk?well=ACTIVE&scenario=A` | probabilities per window and type; `GET /api/risk/model-card` |
| `GET /api/alerts`, `POST /api/alerts/{id}/ack|snooze|resolve|feedback` | alert lifecycle |
| `WS /ws/live?scenario=A&speed=1` | tick stream; client sends `{cmd: play|pause|seek|speed|reset}` |
| `POST /api/brief` , `GET /api/brief/{id}.pdf` | pre-drill brief |
| `GET /api/analytics/summary` | KPI tiles and chart series |
| `GET /api/compare?wells=a,b,c` | comparison data and similarity breakdown |
| `GET /api/wells/{id}/timeline`, `GET /api/wells/{id}/program` | F20 and F21 |
| `GET/POST /api/audit`, `GET /api/settings` | F22 |

All responses typed with Pydantic; the frontend generates types from the OpenAPI schema (`npm run gen:types`).

## 4. Key algorithms (implement as specified)

### Geo
Haversine distance; initial bearing; geodesic circle polygon (64 points) for radius; section-line projection: for each well compute along-line distance and perpendicular offset, keep wells within 1.5 km of the line; project trajectories onto the plane by using along-line displacement.

### Offset-well evidence score (per risk type at depth d, look-ahead window L)
For each offset event e of that type within TVD window [d, d+L]:
`w = 0.35*formation_match + 0.30*exp(-((tvd_e-d)/σ)^2) + 0.20*exp(-dist_km/3) + 0.15*param_match`, σ = 40 m. Evidence = `1 - Π(1 - 0.6*w*severity_weight)`, clipped to [0,1]. Similarity % shown to the user = `w*100` with the four components displayed.

### ML risk model
- Training rows: every 10 m of every offset well (from `parameters.parquet`). Features: TVD, formation id, inclination, dogleg severity, mud weight, ROP, WOB, RPM, torque, SPP, flow difference, pit-volume trend, offset-event density (per type) in ±50 m and distance-weighted, days since spud.
- Label: an event of type T occurs within the next 60 m of drilling in the same well.
- Model: XGBoost (or GradientBoosting fallback), one binary model per risk type, `predict_proba`; **leave-one-well-out** validation; report AUC, precision, recall, and lead distance; calibration plot. State on the model card that data is synthetic and metrics are optimistic.
- Explanations: SHAP TreeExplainer top features; fallback permutation contributions.

### Alert engine (F14)
Each tick: for each risk type compute `score = 0.6*evidence + 0.4*ml_prob` over the look-ahead window (default 150 m TVD). Fire at thresholds 0.35 / 0.55 / 0.75 with hysteresis (needs 3 consecutive ticks) and per-type debounce (60 s wall or 100 m). Sensitivity offset from feedback (F16) shifts thresholds within ±0.10. Alert payload includes evidence list, feature contributions, action checklist, source references.

### Extraction (F05)
Pipeline: text layer via pdfplumber; if page has < 40 chars or "Scanned OCR" chosen, rasterise (200 dpi) and OCR with Tesseract (fallback: read `precomputed_ocr/*.json`). Split into operation-log lines; rule-based NER with patterns for depth (`2,452 m`, `@2452m`, `2452 MD`), event keywords (lost circulation, partial/total losses, gas cut mud, well kicked, pack-off, tight hole, overpull, stuck pipe, cement channelling, poor bond log, wellbore breathing), actions (pumped LCM pill, increased MW to X, POOH, reamed, squeeze cement), NPT hours. Map depth to formation via the well's tops. Confidence = weighted pattern strength x OCR confidence. Optional LLM refine when `ANTHROPIC_API_KEY` is set (schema-constrained JSON; never invent fields). Evaluate on 12 labelled synthetic pages; expose accuracy in F18.

### Ask the Wells (F08)
1. Parse: type, formation, radius, depth range, well names via keyword dictionaries and regex.
2. Retrieve: structured filter on events plus BM25 over report chunks; merge and rank.
3. Synthesize: templated answer from the top records (counts, depth ranges, common cause and mitigation), each sentence carrying citation IDs.
4. Guard: if zero records, answer "No supporting records found"; never generate uncited claims.
5. Optional LLM polish behind a feature flag; facts frozen in the prompt; output validated to contain only cited IDs.

### Simulator (F13)
Seeded generator producing a per-second timeline for each scenario by combining a planned depth-vs-time curve with parameter models (ROP by formation hardness, torque trending with inclination, SPP with depth and mud weight) plus scripted anomalies (see `04_DATA_SPEC.md`). Same seed gives identical output. Supports seek and speed. The whole timeline is precomputed so static mode can replay it.

## 5. Static demo mode (required; this is the "prototype link")
- Goal: host on Vercel, Netlify or GitHub Pages with **no backend**.
- `python -m backend.seed.export_static` writes JSON for every endpoint the UI needs (wells, section for the default lines, events, lessons, risk, alerts per scenario, sim timelines, correlation, analytics, compare, timeline, program, brief data, review queue, sample docs with precomputed extraction) into `frontend/public/demo-data/`.
- Frontend data layer (`lib/api.ts`) has two adapters selected by `VITE_STATIC_DEMO`: `liveAdapter` (fetch and WebSocket) and `staticAdapter` (fetch JSON, replay timelines client-side, run BM25 in the browser for chat, compute the alert engine client-side from the precomputed scores).
- Static differences (documented in the UI footer): uploads only accept the bundled samples; the brief PDF uses browser print.
- `npm run build:static` outputs `frontend/dist-static/`; `npm run verify:static` serves it and runs `tests/e2e/static.spec.ts` covering F01, F02, F08, F13, F14, F17, F23.
- Deploy notes go to `docs/FINAL_REPORT.md` (Vercel: framework Vite, output dir `frontend/dist-static`).

## 6. Fallbacks (use immediately when the primary fails)
| Primary | Fallback |
|---|---|
| Map tiles unreachable | Styled vector basemap + "offline basemap" chip |
| Tesseract missing | Precomputed OCR JSON + "precomputed" chip |
| xgboost/shap install fails | sklearn GradientBoosting + permutation contributions |
| sentence-transformers unavailable | BM25 only |
| No API key | Deterministic templated chat and brief text |
| WebSocket blocked | Server-Sent Events, then polling |

## 7. Scripts (root package.json)
`setup` (npm ci + pip install + seed), `seed`, `dev` (backend + frontend), `test`, `verify`, `verify -- --feature Fxx`, `verify:static`, `build`, `build:static`, `demo:check`, `gen:types`, `lint`, `typecheck`.
