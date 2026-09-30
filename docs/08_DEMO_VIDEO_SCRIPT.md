# 08 Demo Video Script & Presentation Guide

## 1. Demo Storyline (3-minute Walkthrough)
1. **0:00 - 0:25: Command Center (F00 / F22)**
   - Welcome to NWIS (Nearby Wells Intelligence System) for Oil India Limited (eRTMAC SIH PS 26121).
   - Point out "Synthetic demo data" banner, 4 KPI counters, active well DEMO-ACTIVE-01 status.
2. **0:25 - 0:55: Area Map & Radius Tool (F01, F03, F04)**
   - Top-down GIS view around Duliajan (27.36 N, 95.30 E).
   - Adjust radius slider (1-20 km) to filter offset wells, toggle heat layer, inspect well detail drawer.
   - Click "Auto Section" line connecting DEMO-ACTIVE-01 through 3 key offset wells.
3. **0:55 - 1:30: Subsurface Cross-Section (F02, F10)**
   - Signature geoscience view: atmospheric sky, terrain profile, rigs, lithology layers down to basement (3,600 m).
   - Highlight **Formation X (Barail Coal-Sand, 2,440 - 2,500 m TVD)** with red loss-zone hatching and overpressure zone.
   - Adjust Vertical Exaggeration slider (1x - 5x), Day/Dusk lighting toggle, tooltips with pore pressure.
4. **1:30 - 2:05: Live Drilling Simulation & Real-time Alert Engine (F13, F14, F15, F16)**
   - Switch to Live Drilling mode (Scenario A: Formation X Mud Loss).
   - Play 1 Hz stream: as bit approaches 2,410 m TVD, Watch alert fires; at 2,440 m, Critical Alert triggers.
   - Parameter charts show synchronous drop in flow-out and pit volume.
   - Open Alert Detail (F12) to show Explainable "Why" SHAP chart, offset well citations, and recommended LCM mitigation checklist.
5. **2:05 - 2:35: Knowledge Ingestion & Ask the Wells RAG Chat (F05, F06, F07, F08, F09)**
   - Ingest new DDR PDF with live OCR stepper and confidence extraction.
   - Open "Ask the Wells" chat: Ask "What mud losses occurred in Formation X within 5 km?".
   - Deterministic RAG answer citing offset reports [DEMO-B-03, p.7] with click-to-view.
6. **2:35 - 3:00: Pre-Drill Risk Brief & Analytics (F17, F18, F19, F20, F21)**
   - Generate multi-page Pre-Drill Risk Brief PDF for proposed coordinates.
   - Analytics dashboard with NPT breakdown by lithology.
   - Conclusion: NWIS turns historical well records into actionable, real-time drilling intelligence.
