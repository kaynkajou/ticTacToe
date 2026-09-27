---
phase: "1"
slug: "two-player-game"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-26"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 5.0.x (jsdom environment) + @testing-library/react + @chialab/vitest-axe |
| **Config file** | `vitest.config.ts` — none yet, Wave 0 installs |
| **Quick run command** | `npx vitest run <path-to-test-file>` |
| **Full suite command** | `npm test` (aliased to `vitest run`) |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run <changed-test-file>`
- **After every plan wave:** Run `npm test` + `npm run lint` + `npm run typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green (including axe), and a GitHub Actions run on push must pass (success criterion 5)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | (all installs) | T-1-SC | Only human-verified, exact-pinned packages are installed | checkpoint (blocking-human) | n/a (package legitimacy gate) | n/a | ⬜ pending |
| 01-01-02 | 01 | 1 | GAME-01, GAME-02, A11Y-02, A11Y-03, QUAL-03 | T-1-03, T-1-04, T-1-06 | Engine rejects out-of-range/occupied index; text rendered as React text; axe matcher proven to fail on a known violation | component + unit + axe canary | `npx vitest run src/App.test.tsx src/test/axe-canary.test.ts src/game/status.test.ts src/ui/cellLabel.test.ts` | ❌ created by this task | ⬜ pending |
| 01-01-03 | 01 | 1 | QUAL-04 | T-1-01, T-1-02, T-1-05 | CI read-only token, first-party actions only, no network/storage code | lint/typecheck/format/CI | `npm run lint && npm run typecheck && npm run format:check && npm test` | ❌ created by this task | ⬜ pending |
| 01-02-01 | 02 | 2 | GAME-03, GAME-05 | T-1-07 | Moves after a result refused | component (tracer) | `npx vitest run src/App.gameOver.test.tsx src/App.test.tsx` | ❌ created by this task | ⬜ pending |
| 01-02-02 | 02 | 2 | QUAL-01, GAME-01, GAME-02, GAME-03, GAME-04 | T-1-03, T-1-07 | applyMove throws IllegalMoveError (out-of-range / game-over / occupied) | unit (TDD) | `npx vitest run src/engine/engine.test.ts` | ❌ created by this task | ⬜ pending |
| 01-02-03 | 02 | 2 | GAME-04, GAME-05, A11Y-03, QUAL-03 | — | N/A | component + axe | `npx vitest run src/App.gameOver.test.tsx` | ❌ created by 01-02-01 | ⬜ pending |
| 01-03-01 | 03 | 3 | GAME-07 | T-1-08 | New round rebuilds from emptyBoard; no stale result | component (tracer) | `npx vitest run src/App.newRound.test.tsx src/App.test.tsx src/App.gameOver.test.tsx` | ❌ created by this task | ⬜ pending |
| 01-03-02 | 03 | 3 | GAME-07, GAME-05, A11Y-03, QUAL-03 | T-1-08 | N/A | component + unit + axe | `npx vitest run src/App.newRound.test.tsx src/game/gameReducer.test.ts` | ❌ created by this task | ⬜ pending |
| 01-04-01 | 04 | 4 | GAME-06, A11Y-02 | T-1-09 | Cue derived only from engine winningLine | component (tracer) + axe | `npx vitest run src/App.winningLine.test.tsx src/App.gameOver.test.tsx src/App.newRound.test.tsx` | ❌ created by this task | ⬜ pending |
| 01-04-02 | 04 | 4 | GAME-06, A11Y-02, QUAL-03 | T-1-09 | N/A | component (8 orientations) | `npx vitest run src/ui/Board.test.tsx src/App.winningLine.test.tsx` | ❌ created by this task | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Planner note (2026-09-26):** An empirical check found that Vitest exits 0 when a `-t "<name>"` filter matches no tests: every test is reported as skipped and the run still counts as green. The original `-t` commands in this table could therefore pass without running anything. All automated commands above run whole test files instead. Each plan's acceptance criteria use `grep -c "<exact test name>"` to prove the named tests exist. Test file layout per plan: `src/App.test.tsx` (turns), `src/App.gameOver.test.tsx` (results), `src/App.newRound.test.tsx` (New round/focus), `src/App.winningLine.test.tsx` + `src/ui/Board.test.tsx` (winning line), `src/engine/engine.test.ts` (rule matrix), `src/game/gameReducer.test.ts`, `src/game/status.test.ts`, `src/ui/cellLabel.test.ts`, `src/test/axe-canary.test.ts`.

---

## Wave 0 Requirements

*This phase is greenfield, so plan 01-01's tracer task (01-01-02) is the Wave 0: it creates the test infrastructure and the first test files in the same task. Planner additions to the install set: `@eslint/js` 10.0.1 (ESLint 10 no longer bundles it), `axe-core` 4.13.0 (a peer of @chialab/vitest-axe that tests import directly), and `@testing-library/dom` 10.4.2 (a peer of RTL 16). The planner verified this set with a dry run (349 packages, 0 errors) plus a real scratch install that ran the axe canary green under Vitest 5.*

- [ ] `package.json` `overrides` block — required before the first `npm install` (jsx-a11y ↔ ESLint 10, vitest-axe ↔ Vitest 5 peer conflicts)
- [ ] `vitest.config.ts` — framework config, jsdom environment
- [ ] `src/test/setup.ts` — `@testing-library/jest-dom/vitest` + vitest-axe `expect.extend` wiring
- [ ] Canary axe test proving `toHaveNoViolations()` works under Vitest 5
- [ ] `src/engine/engine.test.ts` — win/draw/occupied-move matrix
- [ ] `src/ui/*.test.tsx` — component + axe tests
- [ ] `eslint.config.mjs` — flat config (create-vite template ships Oxlint, not ESLint)
- [ ] `.github/workflows/ci.yml` — lint, typecheck, test on push

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Screen reader announces turn/result exactly once | A11Y-03 | jsdom cannot run a real screen reader | Play a game with NVDA/Narrator; confirm each turn change and the result is read once |
| GitHub Actions run passes on push | QUAL-04 | Needs a real push to GitHub | Push branch; confirm lint, typecheck and test jobs are green |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
