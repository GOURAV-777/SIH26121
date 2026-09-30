# 01 Master Prompt and Loop Protocol

## PROMPT TO PASTE (copy everything in this block)

```
You are a senior full-stack engineer and product designer. Build the NWIS (Nearby Wells Intelligence System) demo prototype for Oil India Limited's eRTMAC problem statement (SIH PS 26121), completely and autonomously.

Read, in order: PROGRESS.md, docs/01_MASTER_PROMPT.md, docs/02_PRODUCT_SPEC.md, docs/03_ARCHITECTURE_AND_STACK.md, docs/04_DATA_SPEC.md, docs/05_DESIGN_SYSTEM.md, docs/06_VERIFICATION_AND_LOOP.md.

Then run the LOOP PROTOCOL in docs/01_MASTER_PROMPT.md and do not stop until every feature F01-F23 passes its automated test, the static demo build works, and `npm run verify` prints "ALL 23 FEATURES PASS". Do not ask me questions. Make sensible decisions using the docs, log them in docs/DECISIONS.md, and keep going. If a session ends early, the next session resumes from PROGRESS.md.
```

## 1. Mission
Deliver a demo prototype that looks like a real product from an oil and gas software vendor, not a hackathon toy or a generic AI template. It will be screen-recorded for a YouTube demo and also hosted as a static link. It must run on a laptop, offline-capable except map tiles, with **no API keys required**.

## 2. Non-negotiables
1. All 23 features in `02_PRODUCT_SPEC.md` implemented and passing tests. No stubs, no "coming soon" tiles, no lorem ipsum, no dead buttons.
2. Two distinct maps: **Area Map** (top view, street/satellite) and **Subsurface Cross-Section** (sky, surface, ground, strata, wells, pressure, groundwater).
3. Everything runs from seeded synthetic data and is deterministic (fixed seeds). The same demo can be recorded again and again identically.
4. Professional visual quality per `05_DESIGN_SYSTEM.md`. Screenshots must pass the design checklist.
5. Zero console errors and zero failed network requests (except optional tile requests) during the E2E run.
6. Honest labelling: "Synthetic demo data" chip visible in the header; model-card page states metrics are on synthetic data.
7. No invented savings claims anywhere in the UI.

## 3. LOOP PROTOCOL (follow exactly, every session)

**Step 0: Orient.** Read `PROGRESS.md`. If it does not exist, copy `docs/07_PROGRESS_TRACKER.md` to it. Read the iteration log to see the last thing attempted. Run `git status` and `git log --oneline -n 10`.

**Step 1: Bootstrap check.** If Phase 0 is not complete, do Phase 0 first (scaffold, tooling, verify script, empty feature tests that fail). Otherwise ensure dependencies are installed (`npm run setup` is idempotent).

**Step 2: Pick work.** Take the first unchecked item in `PROGRESS.md`, in phase order. Never skip ahead unless the item is blocked; if blocked, log it in `docs/BLOCKERS.md`, use the documented fallback, and move on.

**Step 3: Implement.** Build the smallest complete slice that satisfies the feature's acceptance criteria in `02_PRODUCT_SPEC.md`, following the architecture and design docs. Use the exact `data-testid` names from the spec.

**Step 4: Verify.** Run `npm run verify -- --feature Fxx` (the feature's unit, API and E2E tests, plus a screenshot saved to `docs/screens/Fxx.png`). Look at the screenshot with your image viewing ability and judge it against the design checklist in `05_DESIGN_SYSTEM.md`.

**Step 5: Fix loop.** If anything fails or looks unprofessional, fix and re-run Step 4. Repeat until it passes. Time-box: after 6 failed attempts on the same problem, simplify the approach (never remove the feature), log the decision in `docs/DECISIONS.md`, and continue.

**Step 6: Regression.** Run `npm run verify` (all features so far). If a previously passing feature broke, fix it before continuing.

**Step 7: Record.** Tick the checkbox in `PROGRESS.md`, append one line to the iteration log (date, feature, what changed, test result), and commit: `feat(Fxx): <name>`.

**Step 8: Continue.** Go back to Step 2. Do not summarise, do not ask for confirmation, do not stop to celebrate.

**Step 9: Final gates** (only when all features are checked):
1. `npm run verify` prints `ALL 23 FEATURES PASS`.
2. `npm run build:static` succeeds and `npm run verify:static` passes the static subset.
3. `npm run demo:check` plays the guided demo (F23) start to finish with no errors and saves `docs/screens/demo-*.png` at each step.
4. Run the full design checklist on all screenshots; fix any failure.
5. Write `docs/FINAL_REPORT.md` (features, how to run, how to deploy the static build, known limits).
6. Only then print `PROTOTYPE COMPLETE` and stop.

## 4. Rules that prevent stalling
- **Never ask the user anything.** Decide, log in `docs/DECISIONS.md`, proceed.
- **Never mark something done without a passing test.** Never weaken a test to make it pass; fix the code.
- **No long plans.** Prefer writing code over describing code.
- **Work in small commits.** Frequent commits mean a crash costs little.
- **External dependency failed** (package, tiles, OCR binary, API key)? Use the documented fallback in `03_ARCHITECTURE_AND_STACK.md`, log it, continue.
- **Context getting long?** Finish the current step, update `PROGRESS.md` and the iteration log, commit, then continue. A fresh session resumes from these files.
- **Windows or macOS or Linux:** scripts must be cross-platform (Node and Python only, no bash-only commands in npm scripts).
- **Do not delete the docs or the tracker.** Do not rewrite the spec; only append clarifications to `docs/DECISIONS.md`.

## 5. Definition of Done
- All boxes in `PROGRESS.md` are `- [x]`.
- `verify_report.md` shows all 23 features PASS and the final line `ALL 23 FEATURES PASS`.
- The static build works from a plain static file server.
- `docs/FINAL_REPORT.md` exists.
- The app opens on the Command Center view in under 3 seconds on a normal laptop, with no console errors.

## 6. Session-end checklist (do before stopping for any reason)
- [ ] `PROGRESS.md` updated
- [ ] Iteration log line added
- [ ] Working tree committed
- [ ] The next action is written as the first unchecked item
