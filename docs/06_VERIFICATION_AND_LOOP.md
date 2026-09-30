# 06 Verification and Loop Protocol

> **Purpose:** defines exactly how the agent verifies each feature, what the verify script does, the stop conditions, and how the external loop runner works. Follow this file precisely.

---

## 1. Verify script (`scripts/verify.py`)

Run via: `npm run verify` (all features) or `npm run verify -- --feature F01` (single feature).

### 1.1 What it does per feature

For each feature Fxx the script:

1. **Runs Vitest unit tests** matching `frontend/src/features/fXX/**/*.test.ts` — `vitest run --reporter=verbose`.
2. **Runs pytest API tests** matching `backend/tests/test_fXX.py` — `pytest -x -q`.
3. **Runs Playwright E2E spec** `tests/e2e/fXX.spec.ts` — `playwright test fXX.spec.ts`.
4. **Takes a screenshot** of the relevant view and saves it to `docs/screens/Fxx.png` (Playwright `page.screenshot`).
5. **Writes one result line** to `verify_report.md`:
   ```
   [PASS] F01 Area Map — unit OK, api OK, e2e OK — 2026-09-30T18:42:00Z
   [FAIL] F05 Ingest — unit OK, api FAIL (test_extraction::test_event_count) — e2e SKIP — 2026-09-30T18:50:11Z
   ```

### 1.2 Stop condition

After processing all features it prints the summary block:
```
=== VERIFY SUMMARY ===
F01  PASS
F02  PASS
...
F23  PASS
ALL 23 FEATURES PASS
```

If **any** feature is FAIL it prints:
```
=== VERIFY SUMMARY ===
F01  PASS
F05  FAIL  (see above)
...
FAILED: 1 of 23 features
```

The script exits with code 0 only when all 23 pass.

### 1.3 Story-critical assertions (`scripts/verify.py` section: `verify_story`)

These run as part of the full verify run (not tied to a single Fxx):

- Query the DB: confirm ≥ 3 of the 4 nearest offset wells have a `mud_loss` event in Formation X (2,440–2,500 m TVD). FAIL if < 3.
- Confirm at least 180 events total in `events` table.
- Confirm at least 20 PDFs in `backend/data/pdfs/`.
- Confirm the ML model files exist in `backend/data/models/`.
- Confirm the simulator scenario A truth marker `loss_start_tvd` is between 2,440 and 2,460.

---

## 2. Test conventions

### 2.1 Frontend unit tests (Vitest)

Location: `frontend/src/features/fXX/fXX.test.ts` (or `__tests__/` subdirectory).

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
// Test data: use the seeded demo-data JSON or inline minimal fixtures.
// Never hit the real API in unit tests (mock via vi.mock).
// Each test targets a specific acceptance criterion from the spec.
describe('F01 Area Map', () => {
  it('renders 14 well markers', async () => { ... })
  it('basemap toggle changes tile source', async () => { ... })
  it('offline chip appears when tiles abort', async () => { ... })
})
```

### 2.2 Backend API tests (pytest)

Location: `backend/tests/test_fXX.py`.

```python
import pytest
from httpx import AsyncClient
from backend.app.main import app

@pytest.mark.asyncio
async def test_wells_returns_14(client: AsyncClient):
    r = await client.get("/api/wells")
    assert r.status_code == 200
    assert len(r.json()) == 14
```

- Use `pytest-asyncio` with `asyncio_mode = "auto"` in `pytest.ini`.
- Use an **in-memory SQLite** for tests: `conftest.py` provides a `client` fixture that overrides the DB dependency and seeds minimal test data.
- Each test function must be independent; do not rely on order.

### 2.3 E2E Playwright tests

Location: `tests/e2e/fXX.spec.ts`.

```typescript
import { test, expect } from '@playwright/test'

test.describe('F01 Area Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/map')
    await page.waitForLoadState('networkidle')
  })

  test('14 well markers are visible', async ({ page }) => {
    const markers = page.locator('[data-testid^="f01-marker"]')
    await expect(markers).toHaveCount(14)
  })

  test('basemap toggle changes tiles', async ({ page }) => {
    await page.click('[data-testid="f01-basemap-toggle"]')
    // assert that a satellite tile request is made or a class changes
  })

  test('offline chip appears on tile abort', async ({ page }) => {
    await page.route('**/tiles/**', route => route.abort())
    await page.reload()
    await expect(page.locator('[data-testid="f01-offline-chip"]')).toBeVisible()
  })
})
```

Playwright config (`playwright.config.ts`):
- `baseURL: 'http://localhost:5173'`
- `use.headless: true` (CI) / `false` in `--headed` mode
- `screenshot: 'only-on-failure'` (the verify script takes its own explicit screenshots)
- `video: 'off'`
- `retries: 1` (one retry before marking FAIL)
- `timeout: 30_000` per test

---

## 3. `data-testid` registry

The agent **must** use exactly these `data-testid` values. Adding new ones is fine; renaming existing ones breaks tests.

| Feature | Key test IDs |
|---|---|
| F01 | `f01-basemap-toggle`, `f01-marker` (×14), `f01-heat-toggle`, `f01-offline-chip` |
| F02 | `f02-ve-slider`, `f02-tod-toggle`, `f02-stratum` (×≥8), `f02-well` (×≥3), `f02-ruler` |
| F03 | `f03-radius-slider`, `f03-nearby-row`, `f03-auto-section` |
| F04 | `f04-tab-overview`, `f04-tab-trajectory`, `f04-tab-formations`, `f04-tab-events`, `f04-tab-docs` |
| F05 | `f05-sample-picker`, `f05-stepper`, `f05-extracted-row` |
| F06 | `f06-queue-item` |
| F07 | `f07-export-csv` |
| F08 | `f08-chat-input`, `f08-answer`, `f08-citation` |
| F09 | `f09-lesson-card` (×≥8) |
| F10 | `f10-corr-line` (×≥4 per top) |
| F11 | `f11-risk-strip`, `f11-model-card` |
| F12 | `f12-why-chart` |
| F13 | `f13-play`, `f13-pause`, `f13-speed`, `f13-scrub`, `f13-reset`, `f13-scenario` |
| F14 | `f14-toast`, `f14-alert-row` |
| F15 | `f15-chart` (×6) |
| F16 | `f16-feedback-useful`, `f16-feedback-false-alarm`, `f16-feedback-known` |
| F17 | `f17-download-pdf` |
| F18 | `f18-kpi-tile`, `f18-chart` (×≥4) |
| F19 | `f19-compare-row`, `f19-similarity-breakdown` |
| F20 | `f20-time-depth-curve`, `f20-gantt` |
| F21 | `f21-schematic`, `f21-window-chart` |
| F22 | `f22-role-switch`, `f22-audit-row` |
| F23 | `f23-demo-caption`, `f23-demo-controls` |

---

## 4. `npm run verify` implementation

`scripts/verify.py` is a Python script run via Node with: `node -e "const {execSync}=require('child_process');execSync('python scripts/verify.py '+process.argv.slice(2).join(' '),{stdio:'inherit'})"`.

Alternatively, wrap it directly in `package.json`:
```json
"verify": "python scripts/verify.py",
"verify:feature": "python scripts/verify.py --feature"
```

The script must:
1. Check the backend is running on port 8000 (start it if not: `uvicorn backend.app.main:app --port 8000 &`).
2. Check the frontend dev server is running on port 5173 (start if not: `vite &`).
3. Wait up to 30 s for both to be healthy.
4. Run all or the specified feature's tests.
5. Write `verify_report.md` (overwrite, not append).
6. Print the summary block.
7. Exit 0 iff all tested features pass.

---

## 5. Loop runner (`run_loop.py`)

The external loop runner is for **unattended builds** (Option B). It:

1. Reads `PROGRESS.md` and checks if `ALL 23 FEATURES PASS` appears in `verify_report.md`.
2. If done, prints `PROTOTYPE COMPLETE` and exits 0.
3. Otherwise, starts `claude --dangerously-skip-permissions -p "$(cat docs/01_MASTER_PROMPT.md | grep -A1000 'PROMPT TO PASTE' | tail -n +2)"` (or equivalent for the installed agent CLI).
4. Waits for it to exit. If it exits with 0 and `verify_report.md` says `ALL 23 FEATURES PASS`, done.
5. If it exits with non-zero or features still fail: wait 10 s and loop back to step 3.
6. If the same feature has failed in 5 consecutive rounds, write a line to `docs/BLOCKERS.md` and continue (the agent should self-correct by using the fallback).
7. Maximum 50 rounds (safety); if reached, print `LOOP LIMIT REACHED` and exit 1.

```python
# run_loop.py skeleton
import subprocess, time, re, sys
from pathlib import Path

MAX_ROUNDS = 50
SLEEP_BETWEEN = 10  # seconds

def all_pass():
    r = Path("verify_report.md")
    return r.exists() and "ALL 23 FEATURES PASS" in r.read_text()

def run_agent():
    prompt = Path("docs/01_MASTER_PROMPT.md").read_text()
    # Extract the block between ```...``` under "PROMPT TO PASTE"
    m = re.search(r'```\n(.*?)```', prompt, re.S)
    agent_prompt = m.group(1).strip() if m else prompt
    result = subprocess.run(
        ["claude", "--dangerously-skip-permissions", "-p", agent_prompt],
        capture_output=False
    )
    return result.returncode

for round_num in range(1, MAX_ROUNDS + 1):
    print(f"\n=== LOOP ROUND {round_num} ===")
    if all_pass():
        print("PROTOTYPE COMPLETE")
        sys.exit(0)
    rc = run_agent()
    print(f"Agent exited with code {rc}")
    if all_pass():
        print("PROTOTYPE COMPLETE")
        sys.exit(0)
    print(f"Sleeping {SLEEP_BETWEEN}s before next round...")
    time.sleep(SLEEP_BETWEEN)

print("LOOP LIMIT REACHED")
sys.exit(1)
```

---

## 6. Static verification (`npm run verify:static`)

Runs `tests/e2e/static.spec.ts` against the built `frontend/dist-static/` served by `npx serve -s frontend/dist-static -l 4173`.

Tests in `static.spec.ts` cover: F01 (markers visible), F02 (section renders), F08 (chat returns answer), F13 (sim plays without backend), F14 (alert fires client-side), F17 (brief renders from static JSON), F23 (demo tour completes). All other features are excluded from static verification (backend-only; noted in the spec).

---

## 7. Progress tracker sync

`scripts/check_progress.py` reads `PROGRESS.md` and `verify_report.md` and prints a diff: features checked in `PROGRESS.md` but FAIL in verify (stale checks), and features PASS in verify but not yet checked (agent forgot to update `PROGRESS.md`). Run it manually or add it as a CI gate.

---

## 8. Session-start checklist (agent must do this every session)

```
1. Read PROGRESS.md — identify the first unchecked item.
2. Run: git status && git log --oneline -n 5
3. Run: npm run verify (or verify the last attempted feature only, if session was interrupted mid-feature).
4. If verify shows a previously passing feature now FAIL → fix before touching new work.
5. Proceed with the loop protocol in 01_MASTER_PROMPT.md.
```

---

## 9. Definition of a passing feature

A feature is considered **done and passing** when ALL of the following are true:

| Criterion | Check |
|---|---|
| Unit tests pass | `vitest run` exits 0 for this feature |
| API tests pass | `pytest backend/tests/test_fXX.py` exits 0 |
| E2E tests pass | `playwright test fXX.spec.ts` exits 0 |
| Screenshot exists | `docs/screens/Fxx.png` exists and is non-empty |
| Design checklist | All 13 items in §14 of `05_DESIGN_SYSTEM.md` pass visual inspection |
| `data-testid` present | All required IDs from §3 above are in the rendered DOM |
| No console errors | Chrome DevTools console shows 0 errors during the E2E run |

Do NOT mark a feature done by simply checking the `PROGRESS.md` box. The checkbox is a **consequence** of the feature passing all the above, not a shortcut.
