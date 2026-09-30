"""
run_loop.py — External loop runner for the NWIS demo prototype.
Option B unattended build: restarts the agent until all 23 features pass.

Usage:
    python run_loop.py
    python run_loop.py --max-rounds 30
    python run_loop.py --agent aider   # if using aider instead of claude

Requirements:
    - Python 3.11+
    - The agent CLI installed (default: claude from @anthropic-ai/claude-code)
    - Run inside the nwis-demo/ root directory
"""

import argparse
import re
import subprocess
import sys
import time
from pathlib import Path

# ─── Configuration ─────────────────────────────────────────────────────────────

DEFAULT_MAX_ROUNDS = 50
SLEEP_BETWEEN_ROUNDS = 10  # seconds
FAIL_THRESHOLD = 5          # rounds the same feature fails before logging a blocker
VERIFY_REPORT = Path("verify_report.md")
PROGRESS_FILE = Path("PROGRESS.md")
BLOCKERS_FILE = Path("docs/BLOCKERS.md")
MASTER_PROMPT_FILE = Path("docs/01_MASTER_PROMPT.md")
DECISIONS_FILE = Path("docs/DECISIONS.md")


# ─── Helpers ───────────────────────────────────────────────────────────────────

def all_pass() -> bool:
    """Return True iff verify_report.md exists and ends with ALL 23 FEATURES PASS."""
    if not VERIFY_REPORT.exists():
        return False
    return "ALL 23 FEATURES PASS" in VERIFY_REPORT.read_text(encoding="utf-8")


def extract_failing_features() -> list[str]:
    """Parse verify_report.md and return list of FAIL feature IDs."""
    if not VERIFY_REPORT.exists():
        return []
    failing = []
    for line in VERIFY_REPORT.read_text(encoding="utf-8").splitlines():
        m = re.match(r"\[FAIL\]\s+(F\d{2})", line)
        if m:
            failing.append(m.group(1))
    return failing


def get_agent_prompt() -> str:
    """Extract the prompt block from docs/01_MASTER_PROMPT.md."""
    if not MASTER_PROMPT_FILE.exists():
        # Fallback: minimal prompt if the file is missing
        return (
            "Read PROGRESS.md and docs/01_MASTER_PROMPT.md. "
            "Follow the LOOP PROTOCOL. Do not stop until all 23 features pass."
        )
    text = MASTER_PROMPT_FILE.read_text(encoding="utf-8")
    # Extract the block after "PROMPT TO PASTE" between first pair of ```
    m = re.search(r"PROMPT TO PASTE.*?```\n(.*?)```", text, re.S)
    if m:
        return m.group(1).strip()
    return text.strip()


def log_blocker(feature: str, round_num: int) -> None:
    BLOCKERS_FILE.parent.mkdir(exist_ok=True)
    with BLOCKERS_FILE.open("a", encoding="utf-8") as f:
        f.write(
            f"| {round_num} | {feature} | Failed {FAIL_THRESHOLD} consecutive rounds. "
            f"Agent should apply the fallback documented in 03_ARCHITECTURE_AND_STACK.md. |\n"
        )
    print(f"  [BLOCKER] Logged persistent failure for {feature} in docs/BLOCKERS.md")


def run_agent(agent_cmd: str, prompt: str) -> int:
    """Run the agent CLI with the prompt. Returns exit code."""
    print(f"\n  Starting agent: {agent_cmd}")
    if agent_cmd == "claude":
        cmd = ["claude", "--dangerously-skip-permissions", "-p", prompt]
    elif agent_cmd == "aider":
        cmd = ["aider", "--message", prompt]
    else:
        # Generic: pass prompt via stdin
        cmd = agent_cmd.split()
    try:
        result = subprocess.run(cmd, capture_output=False, text=True)
        return result.returncode
    except FileNotFoundError:
        print(f"  ERROR: agent '{agent_cmd}' not found. Install it and try again.")
        return 1


# ─── Main loop ─────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="NWIS loop runner")
    parser.add_argument("--max-rounds", type=int, default=DEFAULT_MAX_ROUNDS)
    parser.add_argument("--agent", default="claude", help="Agent CLI to use (claude, aider, or full command)")
    parser.add_argument("--dry-run", action="store_true", help="Print prompt and exit without running the agent")
    args = parser.parse_args()

    prompt = get_agent_prompt()
    if args.dry_run:
        print("=== DRY RUN: PROMPT ===")
        print(prompt)
        print("=== END PROMPT ===")
        sys.exit(0)

    # Initialise BLOCKERS.md header if missing
    if not BLOCKERS_FILE.exists():
        BLOCKERS_FILE.parent.mkdir(exist_ok=True)
        BLOCKERS_FILE.write_text(
            "# BLOCKERS\n| Round | Feature | Note |\n|---|---|---|\n",
            encoding="utf-8"
        )

    fail_counts: dict[str, int] = {}  # feature -> consecutive fail count

    for round_num in range(1, args.max_rounds + 1):
        print(f"\n{'='*60}")
        print(f"LOOP ROUND {round_num} / {args.max_rounds}")
        print(f"{'='*60}")

        if all_pass():
            print("\n✅  PROTOTYPE COMPLETE — ALL 23 FEATURES PASS")
            sys.exit(0)

        failing_before = set(extract_failing_features())
        print(f"  Failing features before this round: {sorted(failing_before) or 'none (verify not run yet)'}")

        rc = run_agent(args.agent, prompt)
        print(f"\n  Agent exited with code {rc}")

        if all_pass():
            print("\n✅  PROTOTYPE COMPLETE — ALL 23 FEATURES PASS")
            sys.exit(0)

        failing_after = set(extract_failing_features())

        # Track consecutive failures per feature
        for f in failing_after:
            fail_counts[f] = fail_counts.get(f, 0) + 1
            if fail_counts[f] >= FAIL_THRESHOLD:
                log_blocker(f, round_num)
                fail_counts[f] = 0  # reset after logging

        # Clear counts for features that recovered
        for f in list(fail_counts.keys()):
            if f not in failing_after:
                fail_counts[f] = 0

        newly_fixed = failing_before - failing_after
        newly_broken = failing_after - failing_before
        if newly_fixed:
            print(f"  ✓ Fixed this round: {sorted(newly_fixed)}")
        if newly_broken:
            print(f"  ✗ Broken this round: {sorted(newly_broken)}")
        print(f"  Still failing: {sorted(failing_after) or 'none'}")

        if round_num < args.max_rounds:
            print(f"\n  Sleeping {SLEEP_BETWEEN_ROUNDS}s before next round...")
            time.sleep(SLEEP_BETWEEN_ROUNDS)

    print(f"\n⛔  LOOP LIMIT REACHED ({args.max_rounds} rounds)")
    print("     Review docs/BLOCKERS.md and docs/DECISIONS.md for persistent issues.")
    sys.exit(1)


if __name__ == "__main__":
    main()
