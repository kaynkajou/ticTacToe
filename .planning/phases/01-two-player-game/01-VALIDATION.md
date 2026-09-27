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
| TBD | TBD | TBD | GAME-01 | — | N/A | unit | `npx vitest run src/engine/engine.test.ts -t "occupied"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-02 | — | N/A | unit | `npx vitest run src/engine/engine.test.ts -t "current player"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-03 | — | N/A | unit | `npx vitest run src/engine/engine.test.ts -t "win"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-04 | — | N/A | unit | `npx vitest run src/engine/engine.test.ts -t "draw"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-05 | — | N/A | component | `npx vitest run src/ui/Board.test.tsx -t "locks"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-06 | — | N/A | component | `npx vitest run src/ui/Cell.test.tsx -t "winning"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | GAME-07 | — | N/A | component | `npx vitest run src/ui/App.test.tsx -t "new round"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | A11Y-02 | — | N/A | component | `npx vitest run src/ui/Cell.test.tsx -t "label"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | A11Y-03 | — | N/A | component | `npx vitest run src/ui/App.test.tsx -t "aria-live"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | QUAL-03 | — | N/A | component (axe) | `npx vitest run src/ui/App.test.tsx -t "axe"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | QUAL-04 | — | N/A | CI | `.github/workflows/ci.yml` on push | ❌ W0 | ⬜ pending |

*Task IDs are filled in once PLAN.md files exist. Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

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
