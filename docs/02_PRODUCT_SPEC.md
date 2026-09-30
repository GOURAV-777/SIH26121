# 02 Product Spec: 23 Features

## Product story (keep it consistent across the UI and the demo)
A drilling engineer is drilling **DEMO-ACTIVE-01** in a synthetic block in Upper Assam. NWIS shows nearby wells, remembers what happened in them, reads new reports, predicts risk by depth, and warns the engineer **before** the bit reaches **Formation X (about 2,440 to 2,500 m TVD)**, where 3 of 4 offset wells had lost circulation. The alert cites source wells, pages, similarity and the mitigation that worked.

## Navigation (left rail)
Command Center | Area Map | Cross-Section | Live Drilling | Knowledge | Ingest | Analytics | Brief Builder | Settings and Audit. Top bar: global search (Ctrl+K), radius chip, alert bell, role switch, "Synthetic demo data" chip, "Play Demo" button.

## Test-ID convention
Every feature exposes a root `data-testid="fXX-<slug>"` plus the sub-IDs listed. E2E tests live in `tests/e2e/fXX.spec.ts`; API tests in `backend/tests/test_fXX.py`.

---

## GROUP A: Geo views

### F01 Area Map (top view)
- MapLibre GL map centred on the synthetic block near Duliajan (27.36 N, 95.30 E). Toggle **Street / Satellite / Hybrid** (`f01-basemap-toggle`).
- Markers for 14 wells: active (orange, pulsing ring), offsets (teal, ring colour by max event severity), plugged (grey). Hover popup (name, TD, status, top event). Click opens F04 drawer.
- Synthetic lease-block polygon, geodesic radius circle (from F03), event-density heat layer toggle (`f01-heat-toggle`), scale bar, north arrow, live coordinate readout, fullscreen, legend.
- **Fallback:** if tiles fail, show a styled vector basemap (grid, river ribbon, tea-estate patches) and a small "offline basemap" chip.
- **Accept:** ≥14 markers render (`f01-marker` x14); switching basemap changes the tile source; aborting tile requests in the test shows the fallback chip (`f01-offline-chip`).

### F02 Subsurface Cross-Section (sky, surface, ground, underground)
The signature visual. Full spec of art direction in `05_DESIGN_SYSTEM.md`.
- Vertical stack: **sky** (gradient, sun or moon, parallax clouds), **surface profile** along the section line (undulating terrain, river dip, trees, well pads with rig silhouettes), **ground** (topsoil, alluvium, water table), then **≥8 formation layers** with lithology patterns, faults, overpressure gradient zone, loss-zone hatching.
- Wells projected onto the section plane: trajectories (deviated), casing strings with shoes, open-hole, event glyphs at depth, active-well bit with glow and mud-return animation in live mode.
- Controls: layer toggles (lithology, events, casing, pressure, groundwater, faults), vertical exaggeration 1x to 5x (`f02-ve-slider`), zoom and pan, day/dusk toggle (`f02-tod-toggle`), depth ruler in m (TVD) and elevation (m ASL), crosshair with tooltip (formation, lithology, depth, synthetic pore-pressure estimate).
- **Accept:** SVG/canvas contains sky, terrain, ≥8 strata (`f02-stratum` x≥8), ≥3 wells (`f02-well`), ruler; slider changes rendered depth scale; tooltip shows formation name on hover; section follows F03's line.

### F03 Radius and section-line tools
- Radius slider 1 to 20 km, default 5 (`f03-radius-slider`); circle and nearby list update instantly; wells outside radius dim on both maps.
- Nearby-wells list sorted by distance, with distance (km), bearing (degrees and compass), TD, event count (`f03-nearby-row`).
- **Section line tool** on the Area Map: click-drag to draw or "Auto section" through the active well and the 3 nearest offsets (`f03-auto-section`). Line drives F02.
- "Set active well" action to re-centre analysis on any well.
- **Accept:** at 5 km the list contains between 6 and 10 wells; changing to 2 km reduces the count; auto section produces a line and F02 renders ≥3 wells.

### F04 Well detail drawer
- Slide-over with tabs: Overview (header data, status, TD, spud date, rig, operator "Synthetic Operator"), Trajectory (3D-ish inclination/azimuth profile plus plan view), Formations (tops table), Events (mini list), Documents (linked PDFs with page counts).
- **Accept:** opening any well shows all 5 tabs populated (`f04-tab-overview` … `f04-tab-docs`); document row opens F05 viewer.

---

## GROUP B: Knowledge and documents

### F05 Document ingestion and extraction
- Upload PDF (drag and drop) or pick from 20 bundled synthetic DDR/WCR PDFs (`f05-sample-picker`).
- Stepper: Upload > OCR/Text > Extract > Validate > Indexed, with real progress (`f05-stepper`).
- Split view: PDF page viewer left; extracted events right, with highlighted source spans and confidence chips (`f05-extracted-row`).
- OCR mode toggle: "Text layer" (pdfplumber) or "Scanned OCR" (Tesseract if installed; otherwise use the pre-computed OCR result and show a "precomputed" chip).
- **Accept:** processing a sample DDR yields ≥5 structured events with depth, formation, type, cause, action, NPT hours, source page; unsupported file shows a friendly error.

### F06 Human review queue
- Items with confidence < 0.80 land here (`f06-queue-item`). Actions: Approve, Edit inline, Reject; keyboard J/K/A/R.
- Approving pushes the event into the repository (F07) and updates counters; audit entry written (F22).
- **Accept:** approve one item and the KB count increases by 1; reject removes it; edit changes the stored depth.

### F07 Knowledge repository
- Table with columns: well, date, formation, depth (MD/TVD), type, severity, NPT hrs, cause, action, outcome, source.
- Filters: well, formation, event type, severity, depth range, date; full-text search; sort; pagination; column chooser; **CSV export** (`f07-export-csv`).
- Row click opens event detail panel with source excerpt, page reference, related events, "show on cross-section".
- **Accept:** ≥180 events indexed; filtering by Formation X and type mud loss returns the expected ≥8 rows; export downloads a CSV.

### F08 Ask the Wells (RAG chat)
- Natural-language questions such as "What mud losses happened in Formation X within 5 km?" Parser extracts type, formation, radius, depth, well. Retrieval is hybrid (BM25 + optional embeddings) over events and report chunks.
- Answer is structured: 2 to 4 sentences, a mini table, and **citations** like `[DEMO-B-03, p.7]` that open the source.
- Works fully offline with deterministic templated synthesis. If `ANTHROPIC_API_KEY` exists, optionally polish wording, never change facts.
- "Show on map" and "Show on section" buttons; suggestion chips; conversation history; typing/streaming effect.
- **Accept:** the sample question returns ≥3 cited results including Formation X losses; every claim has a citation; asking about a non-existent topic returns "no supporting records" instead of inventing.

### F09 Lessons and playbook library
- Card per event type (mud loss, kick, stuck pipe, torque spike, cementing issue, overpressure, wellbore instability, tight hole): symptoms, typical causes, mitigations, cases from offset wells, and stats from the data (e.g. "mitigation X resolved 7 of 9 cases").
- **Accept:** ≥8 cards; each card links to ≥2 real events; stats are computed from the DB, not hard-coded.

---

## GROUP C: Correlation and prediction

### F10 Depth and formation correlation panel
- Multi-track strip log for 3 to 6 selected wells: depth track, lithology fill, formation tops with connecting correlation lines, event glyphs, active well overlay with the live bit.
- Toggle "flatten on formation top" (choose which top). Hover syncs to F02 crosshair.
- **Accept:** ≥4 wells rendered; correlation lines connect the same formation across wells (`f10-corr-line` ≥ 4 per top); flatten toggle re-aligns tops.

### F11 Risk prediction engine
- For the active well planned section (0 to TD), compute probability per depth window (20 m) for 6 risks: mud loss, kick/overpressure, stuck pipe, torque spike, cementing issue, wellbore instability.
- Heat strip along depth (`f11-risk-strip`), risk-type filter, top-5 risk depths table.
- Model card page: features, training data (synthetic), leave-one-well-out metrics, calibration plot, honest limits.
- **Accept:** API returns probabilities in [0,1] for all windows; the highest mud-loss risk window lies within Formation X ±30 m; model card renders metrics.

### F12 Explainable alerts
- Alert detail modal: risk type, depth ahead, confidence, **"Why" bar chart** of feature contributions (SHAP if available, otherwise permutation contributions), **evidence list** of offset events with similarity % and distance, source docs, "View on cross-section".
- **Accept:** each alert has ≥3 evidence items with source references and a "why" chart with ≥4 features (`f12-why-chart`).

---

## GROUP D: Live drilling

### F13 Live drilling simulator (eRTMAC-style feed)
- Streams once per second (via WebSocket; static mode replays JSON): depth (MD and TVD), bit position, ROP, WOB, RPM, torque, standpipe pressure, flow-in, flow-out, pit volume, mud weight, gas units.
- Controls: play, pause, speed (1x, 2x, 5x, 10x), scrub timeline, reset, scenario select: **A** Formation X loss (default), **B** overpressure/kick near 3,120 m, **C** stuck-pipe precursor near 2,360 m.
- **Accept:** playing scenario A reaches TVD 2,452 m and produces a flow-out drop and pit-volume decrease; reset returns to the start; scrubbing updates all charts.

### F14 Real-time alert engine and alert center
- Every tick compares the live TVD with offset events in a look-ahead window (default 150 m) and the ML probability. Score = 0.6 evidence + 0.4 ML. Levels: watch ≥ 0.35, warning ≥ 0.55, critical ≥ 0.75.
- Toasts (`f14-toast`), bell badge, alert center list with states: new, acknowledged, snoozed, resolved, expired (`f14-alert-row`). Debounce duplicates.
- **Accept:** in scenario A the first warning fires when the bit is 30 to 80 m above Formation X and a critical fires within 25 m; acknowledging changes state and writes an audit entry.

### F15 Live parameter charts
- Six synchronised charts: ROP, WOB and RPM, torque, standpipe pressure, flow-in vs flow-out, pit volume and mud weight. Anomaly bands, offset-event markers, hover crosshair sync, depth or time x-axis switch.
- **Accept:** hovering one chart moves the cursor on all six (`f15-chart` x6); anomaly band appears in scenario A near the loss.

### F16 Recommended actions and feedback loop
- Each alert shows an action checklist from the playbook (e.g. "Have LCM in stock", "Review mud weight", "Reduce ROP") with completion ticks.
- Feedback buttons: **Useful**, **False alarm**, **Already known**. Feedback adjusts a visible sensitivity value (e.g. 0.55 to 0.58) and is logged.
- **Accept:** clicking False alarm on a warning changes the displayed threshold and records an audit entry; ticked actions persist.

---

## GROUP E: Planning and analytics

### F17 Pre-drill risk brief builder
- Choose a location (click map or enter coordinates) and target TD; generate a brief: nearby wells, expected formation tops with ± uncertainty, risk table by depth, casing and mud recommendations derived from offsets, top lessons, data-quality notes.
- Export: browser print stylesheet plus a backend-generated PDF (`f17-download-pdf`).
- **Accept:** brief renders all 6 sections; PDF downloads and has ≥2 pages.

### F18 Analytics dashboard
- KPI tiles: wells, documents processed, events indexed, NPT hours in archive, % events with documented mitigation, alerts fired in session.
- Charts: NPT by event type, events by formation (heat matrix), event depth histogram, events over time, extraction accuracy on the labelled sample.
- **No savings or ROI claims.** Show measured archive statistics only.
- **Accept:** all tiles and ≥4 charts render from API data.

### F19 Well comparison
- Select 2 to 4 wells: side-by-side table (TD, days, NPT, casing scheme, mud programme, ROP), overlaid ROP-vs-depth curves, event comparison, similarity score to the active well with breakdown.
- **Accept:** comparing 3 wells shows overlay lines and a similarity breakdown that sums to the reported total.

### F20 Well timeline
- Per well: time-depth curve (days vs depth) with NPT bands and event markers, plus an operations Gantt (drilling, tripping, casing, cementing, NPT).
- **Accept:** curve renders with monotonic days axis; NPT bands total equals the well's NPT hours (±0.1).

### F21 Casing, cementing and mud programme viewer
- Schematic wellbore: hole sizes, casing strings and shoe depths, cement tops, formation tops. Chart: pore pressure, fracture gradient and planned vs actual mud weight window per interval, offset overlay.
- **Accept:** for any well, schematic and window chart render; an interval where MW leaves the window is flagged.

---

## GROUP F: Platform and presentation

### F22 Roles, audit log and settings
- Role switch: **Field Engineer** (Live Drilling, Cross-Section, Alerts first), **Office Analyst** (Knowledge, Ingest, Analytics first), **Manager** (Command Center, Analytics, Briefs). Role changes default landing page and visible modules.
- Audit log table (who, role, action, target, time) with filters and CSV export.
- Settings: units (m/ft), theme (light/dark), default radius, alert sensitivity, reduce motion.
- **Accept:** switching role changes the landing view; ack, approve and feedback actions appear in the audit log; unit toggle changes displayed depths.

### F23 Guided demo mode
- "Play Demo" (or key **D**, or `?demo=1`) runs a scripted ~3 minute tour of the story with caption overlays, cursor highlight and auto-navigation: Command Center > Area Map (radius) > Cross-Section > Ingest a report > Ask the Wells > Live drilling scenario A > alert and explanation > feedback > Pre-drill brief > Analytics.
- Controls: pause, next, previous, restart, exit; presenter-clean mode hides dev UI; deterministic timing.
- **Accept:** `npm run demo:check` completes the whole tour with no errors and produces one screenshot per step.

---

## Non-functional requirements
- **Performance:** first meaningful view < 3 s; live stream at 1 Hz without dropped frames; charts use canvas or virtualised SVG.
- **Reliability:** zero console errors; graceful empty and error states everywhere; skeleton loaders, not spinners only.
- **Accessibility:** keyboard navigation, visible focus, WCAG AA contrast in both themes, reduce-motion honoured.
- **Responsiveness:** primary target 1920x1080; usable down to 1280x720 and on a tablet in landscape.
- **Static demo build:** the whole app runs without a backend from pre-generated JSON (see architecture doc).
- **Copy quality:** real domain vocabulary, units on every number, no placeholder text.
