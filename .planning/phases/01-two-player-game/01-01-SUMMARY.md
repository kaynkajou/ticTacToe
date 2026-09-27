---
phase: 01-two-player-game
plan: 01
subsystem: game-engine
tags: [vite, react, typescript, vitest, testing-library, axe-core, eslint, prettier, github-actions]

# Dependency graph
requires: []
provides:
  - "Vite 8 + React 19 + TypeScript 6 scaffold with exact-pinned dependencies and the jsx-a11y/ESLint-10 + vitest-axe/Vitest-5 overrides block"
  - "Pure engine (src/engine): Mark/Cell/Board/WinLine/Result types, emptyBoard/isLegalMove/applyMove/IllegalMoveError, currentPlayer -- zero React/DOM/window references"
  - "Controller (src/game): gameReducer (MOVE action), buildStatusMessage (D-03 single status-message builder), useGame hook exposing a GameView"
  - "Accessible UI (src/ui + src/App.tsx): native-button Cell with aria-disabled (never disabled) and D-04 labels via cellLabel, Board as one role=group of 9 row-major cells, StatusRegion as the one always-mounted role=status/aria-live=polite element"
  - "Vitest + jsdom + Testing Library + @chialab/vitest-axe test setup, with an axe canary proving the matcher can both pass and fail under Vitest 5"
  - "ESLint 10 flat config, Prettier, LF-forcing .gitattributes, and .github/workflows/ci.yml running Install/Lint/Typecheck/Format check/Test/Build on every push"
affects: [01-02, 01-03, 01-04, phase-2, phase-3, phase-4, phase-5]

# Actuals (#2632)
actuals:
  tokens: 58781
  tasks: 3
  commits: 2
  plan_head_before: f5996f42937590e4c70ecfa8864ec9db126f5931
  plan_head_after: 4bb7c5488d18024cf1517fd1a858d5ce46759bf9

# Tech tracking
tech-stack:
  added: [vite, react, react-dom, "@vitejs/plugin-react", typescript, vitest, jsdom, "@testing-library/react", "@testing-library/dom", "@testing-library/user-event", "@testing-library/jest-dom", "@chialab/vitest-axe", axe-core, eslint, "@eslint/js", typescript-eslint, eslint-plugin-jsx-a11y, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint-config-prettier, prettier]
  patterns:
    - "Pure engine module with zero DOM/window references; current player always derived from board state, never stored"
    - "Single status-message builder (buildStatusMessage) as the one place status/result text is constructed"
    - "Single always-mounted aria-live=polite status region; board is a role=group, never a live region or composite ARIA widget"
    - "aria-disabled (never native disabled) on unplayable cells, guarded independently by both the UI handler and the engine"
    - "CSS Modules + :root custom properties for theming, no CSS-in-JS"
    - "Exact-pinned dependencies (--save-exact) plus a package.json overrides block for known peer-dependency gaps, verified against a live install rather than assumed"

key-files:
  created:
    - package.json
    - package-lock.json
    - .nvmrc
    - .gitignore
    - .gitattributes
    - index.html
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
    - vite.config.ts
    - eslint.config.mjs
    - .prettierrc.json
    - .prettierignore
    - .github/workflows/ci.yml
    - src/main.tsx
    - src/index.css
    - src/App.tsx
    - src/App.module.css
    - src/App.test.tsx
    - src/test/setup.ts
    - src/test/axe-canary.test.ts
    - src/engine/types.ts
    - src/engine/board.ts
    - src/engine/player.ts
    - src/game/gameReducer.ts
    - src/game/status.ts
    - src/game/status.test.ts
    - src/game/useGame.ts
    - src/ui/Board.tsx
    - src/ui/Board.module.css
    - src/ui/Cell.tsx
    - src/ui/Cell.module.css
    - src/ui/cellLabel.ts
    - src/ui/cellLabel.test.ts
    - src/ui/StatusRegion.tsx
  modified:
    - README.md

key-decisions:
  - "Scaffolded via create-vite into a scratch temp directory outside the repo, then hand-copied only index.html/tsconfig*/main.tsx/.gitignore into the repo root -- never pointed create-vite at the repo root, per the plan's explicit safety instruction (its non-empty-directory handling can offer to delete existing files)."
  - "package.json written by hand rather than left as the create-vite template output, with the full approved package list installed in one `npm install --save-exact` pass so the lockfile only needs to resolve once."
  - "Left vite pinned at the plan-mandated 8.0.9 despite `npm audit` reporting a high-severity, Windows-specific dev-server advisory fixed only in vite>=8.3.1 -- upgrading would fail Task 2's explicit exact-pin acceptance criterion. Recorded in .planning/WINDOWS.md for a later plan to revisit."
  - "Added `.gsd/` to .prettierignore after `npm run format` reformatted the orchestrator's dispatch-isolation-sentinel.json; the JSON content is semantically unchanged, but the directory is now excluded from future format runs to keep this plan's file changes scoped to its own files."

patterns-established:
  - "engine/ -> game/ -> ui/ layering: pure rules, then a useReducer controller, then render-only components. Every later Phase-1 plan (01-02..01-04) and Phase 2's AI extend this same layering."
  - "Status/result text always goes through buildStatusMessage; later plans add cases to its switch rather than inlining new strings elsewhere."

requirements-completed: [GAME-01, GAME-02, A11Y-02, A11Y-03, QUAL-03, QUAL-04]

coverage:
  - id: D1
    description: "Two players alternate X/O turns on the board through the real engine; the status line always names whose turn it is"
    requirement: "GAME-02"
    verification:
      - kind: e2e
        ref: "src/App.test.tsx#plays alternating turns through the real engine"
        status: pass
    human_judgment: false
  - id: D2
    description: "Activating an occupied cell by click, Enter or Space changes nothing (board, labels, status, and live region all stay identical); the cell stays focusable and never gets the native disabled attribute"
    requirement: "GAME-01"
    verification:
      - kind: e2e
        ref: "src/App.test.tsx#ignores an occupied cell activated by click, Enter or Space"
        status: pass
    human_judgment: false
  - id: D3
    description: "Each cell's accessible name follows D-04: \"Row {r}, column {c}, {X|O|empty}\", 9 distinct labels in row-major order"
    requirement: "A11Y-02"
    verification:
      - kind: unit
        ref: "src/ui/cellLabel.test.ts"
        status: pass
      - kind: e2e
        ref: "src/App.test.tsx#renders 9 row-major cells with D-04 labels and one polite live region"
        status: pass
    human_judgment: false
  - id: D4
    description: "Exactly one aria-live=polite status region exists, is always mounted (same DOM node before/after a move), and the board carries no grid/gridcell/row role"
    requirement: "A11Y-03"
    verification:
      - kind: e2e
        ref: "src/App.test.tsx#renders 9 row-major cells with D-04 labels and one polite live region"
        status: pass
    human_judgment: false
  - id: D5
    description: "Automated axe checks run clean on the rendered app mid-game, and the axe matcher is proven able to both pass and fail (not a silent no-op) under Vitest 5 + the vitest-axe override"
    requirement: "QUAL-03"
    verification:
      - kind: unit
        ref: "src/test/axe-canary.test.ts"
        status: pass
      - kind: e2e
        ref: "src/App.test.tsx#has no axe violations mid-game"
        status: pass
    human_judgment: false
  - id: D6
    description: "npm run lint/typecheck/format:check/test/build all exit 0 locally, and .github/workflows/ci.yml runs the same gates as ordered, named steps on every push"
    requirement: "QUAL-04"
    verification:
      - kind: other
        ref: "npm run lint && npm run typecheck && npm run format:check && npm test && npm run build (all exit 0)"
        status: pass
    human_judgment: true
    rationale: "The workflow file's step order/permissions/action pins were verified by grep and all gates pass locally, but the first real green GitHub Actions run has not happened -- pushing requires the user's explicit go-ahead per CLAUDE.md. Recorded as an unrun-verify in .planning/WINDOWS.md; Task 3's own <human-check> defers this to end-of-phase UAT per workflow.human_verify_mode=end-of-phase."

# Metrics
duration: 62min
completed: 2026-09-27
status: complete
---

# Phase 1 Plan 1: Two-Player Game -- Walking Skeleton Summary

**Vite 8 + React 19 + TS 6 hot-seat tic-tac-toe skeleton: a pure TS engine wired through a `useReducer` controller to an accessible native-button board, proven by Vitest/RTL/axe tests and gated by an ESLint 10 + Prettier + GitHub Actions CI pipeline.**

## Performance

- **Duration:** 62 min
- **Started:** 2026-09-27T16:19:00Z (resumed after Task 1's package-legitimacy checkpoint was approved)
- **Completed:** 2026-09-27T17:21:00Z
- **Tasks:** 3 (Task 1 checkpoint verified with no code changes; Task 2 tracer; Task 3 quality gates)
- **Files modified:** 35 (34 created, 1 modified -- README.md, whitespace only)

## Accomplishments

- A full click-to-move path works end to end: Cell guard -> Board -> useGame -> gameReducer -> engine `isLegalMove`/`applyMove` -> re-rendered board, labels and status, with X and O alternating automatically (current player always derived, never stored).
- Cells are native `<button>` elements with `aria-disabled` (never the native `disabled` attribute) and D-04 accessible labels ("Row r, column c, X/O/empty"); the board is a plain `role="group"`, never a live region or composite ARIA widget.
- Exactly one `aria-live="polite"` status region exists, is always mounted, and is the same DOM node before and after every move.
- An axe canary proves `@chialab/vitest-axe`'s `toHaveNoViolations()` matcher can both pass on clean markup and fail on a known `image-alt` violation under the Vitest-5 override -- closing RESEARCH.md's Open Question 1 about whether the override just installs or actually works at runtime.
- `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test` and `npm run build` all exit 0 locally, and `.github/workflows/ci.yml` runs the same five gates (plus install) as ordered, named steps on every push with `contents: read` and `persist-credentials: false`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Package verification required before install** -- no commit (checkpoint only; user replied "verified", approving the full SUS + OK list verbatim; nothing was installed until Task 2)
2. **Task 2: End-to-end "place a mark"** -- `3547afc` (feat)
3. **Task 3: Quality gates** -- `4bb7c54` (feat)

**Plan metadata:** committed alongside this SUMMARY (see below)

## Files Created/Modified

- `package.json` / `package-lock.json` -- exact-pinned dependencies, the two-entry `overrides` block, and the `dev`/`build`/`preview`/`test`/`test:watch`/`lint`/`typecheck`/`format`/`format:check` scripts
- `src/engine/{types,board,player}.ts` -- pure engine: types, immutable `applyMove`/`isLegalMove`/`emptyBoard`, derived `currentPlayer`
- `src/game/{gameReducer,status,useGame}.ts` -- MOVE-only reducer, the single `buildStatusMessage` builder, and the `useGame` controller hook
- `src/ui/{Board,Cell,StatusRegion}.tsx` + `cellLabel.ts` -- render-only accessible UI components
- `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/App.module.css` -- entry point and neutral Phase-1 styling
- `src/App.test.tsx`, `src/test/axe-canary.test.ts`, `src/game/status.test.ts`, `src/ui/cellLabel.test.ts` -- the four required test files
- `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `.gitattributes` -- lint/format/line-ending configuration
- `.github/workflows/ci.yml` -- CI workflow (Install -> Lint -> Typecheck -> Format check -> Test -> Build)
- `README.md` -- whitespace-only normalization from `prettier --write .` (words unchanged)

## Decisions Made

- Scaffolded via `create-vite` into a scratch temp directory, then selectively copied only the files the plan named into the repo root, rather than running `create-vite` against the repo root directly (its non-empty-directory prompt could have offered to delete `.planning/`/`.claude/`).
- Kept vite pinned at the plan-mandated `8.0.9` rather than auto-upgrading past a high-severity, Windows-specific `npm audit` finding (see Deviations) -- the plan's own acceptance criteria hard-check the exact pin.
- Added `.gsd/` to `.prettierignore` after discovering `npm run format` had reformatted the orchestrator's own sentinel file (see Deviations).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking/scope] Excluded `.gsd/` from Prettier's write scope**
- **Found during:** Task 3, step (c) (`npm run format`)
- **Issue:** `prettier --write .` reformatted `.gsd/dispatch-isolation-sentinel.json`, an orchestrator-owned runtime file outside this plan's `files_modified` list. The continuation prompt explicitly said not to touch orchestrator files.
- **Fix:** Added `.gsd/` to `.prettierignore` (alongside the plan-specified `.planning/`, `.claude/`, `dist/`, `coverage/`, `package-lock.json`) so future format runs never touch it again. The one write that already happened only changed the file's JSON whitespace (2-space pretty-printing), not its semantic content, and the file was never staged or committed.
- **Files modified:** `.prettierignore`
- **Verification:** `git status --short` confirms `.gsd/` was never staged in either task commit; `cat .gsd/dispatch-isolation-sentinel.json` shows the same keys/values, just reformatted.
- **Committed in:** `4bb7c54` (Task 3 commit)

### Documented, Not Auto-fixed

**2. [Deferred security finding] vite dev-server advisory left un-upgraded to preserve the plan's exact-pin acceptance criteria**
- **Found during:** Task 2, step (b) (`npm install --save-exact`)
- **Issue:** `npm audit` reports one high-severity advisory against `vite@8.0.0 - 8.0.15` (GHSA-fx2h-pf6j-xcff, a `server.fs.deny` bypass on Windows alternate paths, plus GHSA-v6wh-96g9-6wx3 in a transitive `launch-editor` dependency). The fix requires `vite@8.3.1`, outside the plan's pinned range.
- **Why not auto-fixed:** Task 2's acceptance criteria hard-check `vite === '8.0.9'` by exact string match, and that pin is also locked in `.claude/CLAUDE.md` and `01-RESEARCH.md` (which already knew 8.3.1 existed at research time and pinned 8.0.9 anyway). Upgrading would fail an explicit, automated acceptance criterion and drift from a project-level pin. The vulnerability affects only the local dev server (`vite`/`vite preview`), never the static production build this app ships.
- **Action taken:** Left the pin as specified; recorded the finding in `.planning/WINDOWS.md` (kind: `deviation`) for a future plan/maintenance pass to revisit once the pin can move.
- **Verification:** `npm audit` output captured; `node -e "...require('./node_modules/vite/package.json').version"` confirms the installed version is exactly `8.0.9`.

---

**Total deviations:** 1 auto-fixed (Rule 3/scope), 1 documented-and-deferred (security finding, tracked in WINDOWS.md).
**Impact on plan:** No scope creep. The auto-fix only tightens Prettier's ignore list; the deferred item is a real but dev-server-only, Windows-specific finding that conflicts with an explicit plan/project pin and is now tracked for follow-up rather than silently dropped or silently fixed against the plan's own acceptance criteria.

## Known Stubs

- **`src/game/useGame.ts`** -- `result` is a hardcoded `{ status: 'in-progress' }` constant. This is explicit, plan-sanctioned scope: the plan's own text states "Plan 01-02 owns replacing that single constant with `evaluate(board)`," and the phase success criteria exclude the result from this plan ("ROADMAP SC1, except the result, which belongs to 01-02"). Status text can never show a win or a draw until 01-02 lands. Recorded in `.planning/WINDOWS.md` (kind: `stub`) for traceability; expected to close when 01-02's SUMMARY lands.

## Issues Encountered

None beyond the two items documented above under Deviations.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness

- The engine contract (`Mark`/`Cell`/`Board`/`WinLine`/`Result`, `applyMove`, `currentPlayer(board, firstPlayer)`) is in place and stable for plan 01-02 (win/draw detection) to extend without touching call sites.
- `buildStatusMessage` already has an exhaustive switch ready for 01-02 to fill in the `'win'`/`'draw'` branches with real data (the branches exist and are tested; only `useGame`'s hardcoded `result` constant needs replacing).
- CI is wired and green locally; the first real GitHub Actions run is deferred to the end-of-phase UAT consolidation (Task 3's `<human-check>`), consistent with `workflow.human_verify_mode: end-of-phase`.
- Blocker/concern carried forward from STATE.md: Phase 1 must evaluate outcome in the order win, then draw, then continue, and explicitly test a win on the 9th move (Pitfall 1) -- this is 01-02's responsibility, not yet exercised by this plan's tests.

---
*Phase: 01-two-player-game*
*Completed: 2026-09-27*

## Self-Check: PASSED

- All 34 created files verified present on disk via `git show HEAD --stat` / direct `test -f` checks during execution.
- Both task commits (`3547afc`, `4bb7c54`) verified present via `git log --oneline`.
- Every task's `<acceptance_criteria>` re-run and passing at commit time (vitest 4/4 files, 14/14 tests; build; all Task 3 greps; `npm run lint`/`typecheck`/`format:check`/`test`/`build` all exit 0).
- Plan-level `<verification>` re-confirmed: `npm test` passes, the four local gates plus build all exit 0, `npm run dev` serves the page (smoke-tested and torn down), and `.github/workflows/ci.yml` is present with the required ordered steps.
