# NWIS (Nearby Wells Intelligence System) for eRTMAC
## Oil India Limited — Smart India Hackathon (SIH PS 26121)
### Final Engineering & Prototype Delivery Report

---

### Executive Summary

The **Nearby Wells Intelligence System (NWIS)** prototype has been built and verified as a production-grade hackathon demonstration system for Oil India Limited (eRTMAC). The platform ingests unstructured offset well records, correlates subsurface lithology, trains explainable risk prediction models, and delivers real-time drilling hazard detection during operations.

---

### 1. Key Highlights & Verification Status

- **Automated Verification:** `ALL 23 FEATURES PASS` verified via `python scripts/verify.py`.
- **Unit Test Suite:** 23 test suites passing (`vitest run`).
- **Production Bundle:** Clean build with Vite and Tailwind CSS (`dist/` generated with zero compilation errors).
- **Domain Story Integrity:** 
  - 14 synthetic wells mapped in the Duliajan/Upper Assam Basin block.
  - 190 drilling events, 21 synthetic PDF daily drilling reports with OCR text layers.
  - Core hazard story: Formation X Barail Coal severe mud loss zone (2,440–2,500 m TVD) reflected across 3 of 4 nearest offset wells and validated in the real-time drilling simulator.
- **Offline & Dual-Mode Capability:** Works completely offline out of the box via static demo JSON payloads (`/demo-data/`), with automatic backend API/WebSocket live fallback.

---

### 2. Implemented Features (F01–F23)

| Feature | Code | Module / Component | Capability |
|---|---|---|---|
| **Area Map** | F01 | `AreaMap.tsx` | Top-down GIS map with 14 well locations, status indicators, and cross-section line visualizer. |
| **Subsurface Cross-Section** | F02 | `CrossSection.tsx` | 2D subsurface stratigraphic rendering showing 10 formation strata, deviated well trajectories, casing shoes, and the Formation X loss zone hazard. |
| **Radius & Section Tool** | F03 | `RadiusSectionTool.tsx` | Dynamic radius filtering (1–20 km) with offset proximity ranking and automatic section generation. |
| **Well Detail Drawer** | F04 | `WellDetailDrawer.tsx` | Deep-dive slideout drawer with 5 tabs: Overview, Trajectory, Formations, Historical Events, and Source Documents. |
| **Document Ingestion** | F05 | `DocumentIngest.tsx` | Multi-step OCR extraction stepper, preview pane, and automated metadata extraction from Daily Drilling Reports. |
| **Human Review Queue** | F06 | `ReviewQueue.tsx` | Verification interface for low-confidence extracted records with keyboard shortcuts and audit logging. |
| **Knowledge Repository** | F07 | `KnowledgeRepo.tsx` | Filterable and searchable archive of 190+ historical drilling events with CSV export. |
| **Ask the Wells (RAG)** | F08 | `AskWellsChat.tsx` | AI-assisted search across offset well records with verifiable document page citations. |
| **Lessons Playbook** | F09 | `LessonsPlaybook.tsx` | Curated operational mitigations, LCM recipes, and standard operating procedures. |
| **Formation Correlation** | F10 | `FormationCorrelation.tsx` | Multi-well stratigraphic correlation strip-log with datum flattening. |
| **Risk Prediction Engine** | F11 | `RiskPrediction.tsx` | Pre-drill depth-based hazard probability curves for 6 risk types powered by ML models. |
| **Explainable Alerts** | F12 | `ExplainableAlerts.tsx` | Feature importance attribution (SHAP) and offset evidence citations for every flagged risk. |
| **Live Drilling Simulator** | F13 | `LiveSimulator.tsx` | 1 Hz telemetry stream with 3 operational scenarios, playback controls, and anomaly injection. |
| **Real-Time Alert Center** | F14 | `AlertCenter.tsx` | Real-time hazard monitoring with acknowledge/snooze/escalate workflows and audio-visual cues. |
| **Live Parameter Charts** | F15 | `LiveParameterCharts.tsx` | Synchronized multi-channel telemetry streams (ROP, WOB, RPM, Torque, SPP, Flow Out, Pit Volume). |
| **Recommended Actions** | F16 | `RecommendedActions.tsx` | Real-time contingency checklists and mitigation recommendations for active hazards. |
| **Pre-Drill Brief Builder** | F17 | `PreDrillBrief.tsx` | Automated 6-section pre-drill intelligence dossier with export-ready formatting. |
| **Analytics Dashboard** | F18 | `AnalyticsDashboard.tsx` | Rig fleet KPIs, NPT breakdown by lithology and event type, and risk correlation statistics. |
| **Well Comparison** | F19 | `WellComparison.tsx` | Multi-well trajectory, formation tops, and event overlay comparison tool. |
| **Well Timeline** | F20 | `WellTimeline.tsx` | Time vs. Depth curve with NPT event overlays and operational Gantt phases. |
| **Casing & Mud Programme** | F21 | `CasingProgram.tsx` | Wellbore casing architecture, cementing top depths, and mud weight operating window. |
| **Roles & Audit Log** | F22 | `SettingsAudit.tsx` | Role-based permission switcher (`field_engineer`, `analyst`, `manager`) and tamper-evident audit trail. |
| **Guided Demo Mode** | F23 | `DemoGuideOverlay.tsx` | Interactive 8-step walkthrough with synchronized route navigation and judge-friendly overlays. |

---

### 3. How to Run the Prototype

#### Development Server
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

#### Automated Verification Suite
```bash
python scripts/verify.py
```

#### Unit Test Suite
```bash
npm test
```

#### Production Build
```bash
npm run build
```

---

### 4. Demo Guide for Hackathon Presentations

1. Press **`D`** on any screen (or click **"Play Demo (D)"** in the top bar) to start the 8-step guided presentation tour.
2. Observe the persistent **"Synthetic demo data"** honesty badge in the top right.
3. Switch user personas using the **Role Switcher** (`Field Engineer` | `Analyst` | `Manager`) to demonstrate tailored workflows.
4. Navigate to **Live Drilling** to inspect the real-time detection of mud losses in **Formation X (2,442 m TVD)** with synchronized parameter anomalies and SHAP explanations.
