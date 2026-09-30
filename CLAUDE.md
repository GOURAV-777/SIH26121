# NWIS Demo Prototype: Agent Entry File

You are building the NWIS demo prototype end to end. Do not ask the user questions; decide using the defaults in `docs/`.

**Read in this order, every session:**
1. `PROGRESS.md` (current state; the source of truth for what is done)
2. `docs/01_MASTER_PROMPT.md` (loop protocol and rules)
3. `docs/02_PRODUCT_SPEC.md` (23 features, acceptance criteria)
4. `docs/03_ARCHITECTURE_AND_STACK.md`, `docs/04_DATA_SPEC.md`, `docs/05_DESIGN_SYSTEM.md`, `docs/06_VERIFICATION_AND_LOOP.md`

**Hard rules:**
- Never mark a feature done unless `npm run verify` shows its test passing.
- Never stop while any `- [ ]` remains in `PROGRESS.md` or verify does not print `ALL 23 FEATURES PASS`.
- All data is synthetic and labelled "Synthetic demo data" in the UI.
- Commit after every completed feature: `feat(Fxx): <name>`.
- Update `PROGRESS.md` and append to its iteration log before ending any session.
