# NWIS Demo Prototype: Build Pack (START HERE)

**Project:** eRTMAC-NWIS, Nearby Wells Intelligence System (SIH PS 26121, Oil India Limited)
**Goal:** a complete, professional demo prototype (23 features, 2 maps) that we screen-record, add a voice-over to, upload to YouTube, and submit together with the prototype link.

## What this pack is
A set of Markdown files you give to an AI coding agent (Claude Code recommended). The agent reads them, builds the prototype, verifies every feature with automated tests, and keeps looping until all 23 features pass. State lives in files, so it can resume after any interruption.

| File | Purpose |
|---|---|
| `CLAUDE.md` | Short entry file the agent auto-loads. Points to everything else. |
| `01_MASTER_PROMPT.md` | The prompt you paste (or the loop runner feeds). Contains the loop protocol. |
| `02_PRODUCT_SPEC.md` | The 23 features with acceptance criteria and test IDs. |
| `03_ARCHITECTURE_AND_STACK.md` | Stack, folders, APIs, algorithms, static-demo mode. |
| `04_DATA_SPEC.md` | Dummy dataset: wells, formations, events, PDFs, live scenarios. |
| `05_DESIGN_SYSTEM.md` | Look and feel, both maps' art direction, motion, anti-"AI-look" rules. |
| `06_VERIFICATION_AND_LOOP.md` | Tests, verify script, stop conditions, loop runner. |
| `07_PROGRESS_TRACKER.md` | Checklist the agent updates (copy to `PROGRESS.md`). |
| `08_DEMO_VIDEO_SCRIPT.md` | Recording plan, voice-over script, YouTube and submission checklist. |
| `run_loop.py` | External runner that restarts the agent until everything is done. |

## Quick start (10 minutes)
1. Install: **Node 20+**, **Python 3.11+**, **Git**, **Claude Code** (`npm i -g @anthropic-ai/claude-code`). Optional: Tesseract OCR (for the scanned-PDF demo path).
2. Create an empty folder `nwis-demo/`. Inside it create `docs/` and copy **all** `.md` files from this pack into `docs/`.
3. Move `CLAUDE.md` to the repo root, copy `docs/07_PROGRESS_TRACKER.md` to `PROGRESS.md`, and put `run_loop.py` in the root.
4. Run `git init`.
5. **Option A, interactive:** open Claude Code in the folder and paste the prompt from `docs/01_MASTER_PROMPT.md` (the block under "PROMPT TO PASTE").
6. **Option B, unattended loop:** run `python run_loop.py`. Each round starts a fresh agent that resumes from `PROGRESS.md` until `verify` prints `ALL 23 FEATURES PASS`. Run it only inside this dedicated folder (it uses permissive mode).
7. When done: `npm run dev`, open http://localhost:5173, press **D** to run the guided demo, then follow `08_DEMO_VIDEO_SCRIPT.md`.

## Honest expectations
- No prompt can *guarantee* completion. This pack maximises the chance: explicit acceptance tests, a resumable tracker, a verify gate, and an external loop. If usage limits pause the agent, the runner waits and retries.
- Everything in the demo uses **synthetic data**, labelled as such on screen. Never present it as real OIL data.
- Tile maps (OpenStreetMap, Esri imagery) need internet while recording. A built-in fallback basemap covers failures.
