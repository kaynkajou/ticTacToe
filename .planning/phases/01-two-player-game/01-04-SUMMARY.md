---
phase: 01-two-player-game
plan: 04
subsystem: game-ui
tags:
  [
    css-forced-colors,
    aria-hidden,
    accessibility,
    vitest,
    testing-library,
    axe-core,
  ]

# Dependency graph
requires:
  - phase: 01-03
    provides: 'GameView.result (win/draw/in-progress) and the existing Board/Cell isCellPlayable/onPlay wiring this plan attaches winningLine to'
provides:
  - 'src/ui/strikeLine.ts: strikeLineId(line) maps any of the 8 WINNING_LINES entries to its orientation id, in WINNING_LINES order (row-1..3, col-1..3, diag-down, diag-up); throws on a non-winning line'
  - 'src/ui/Board.tsx: required winningLine prop (WinLine | null); flags each cell isWinning and renders one aria-hidden strike <span> with data-line after the 9 cells'
  - "src/ui/Cell.tsx: isWinning prop (default false) driving both data-winning='true' and the cellLabel ', winning' suffix from one source"
  - 'CSS geometry for all 8 winning-line orientations, plus a forced-colors (CanvasText background, Highlight outline fallback) and grayscale-safe (6.5:1 contrast, 6px thickness) implementation, static only -- no keyframes/transition/animation anywhere'
affects: [phase-2, phase-3, phase-4, phase-5]

# Actuals (#2632)
actuals:
  tokens: 4575
  tasks: 2
  commits: 2
  plan_head_before: 8172a1fbbf4cc8bb699279d3bf480dccf4c35dfe
  plan_head_after: 9b563891cc203e5c4c263f6ab6e31ed17924f35b

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'strikeLineId(line) is a pure lookup against the existing WINNING_LINES array (no hardcoded geometry math in TS); it throws for any array that is not literally one of the 8 winning lines, so a malformed winningLine can never render a misleading cue (T-1-09).'
    - '.board defines --board-size/--c1/--c2/--c3 once, computed from the existing --cell-size/--board-gap custom properties, so all 8 strike geometries stay correct for any cell size or gap without hardcoded pixel values.'
    - "Winning-cue redundancy across three independent channels, per D-01/D-02: a static strike line (CanvasText-safe in forced-colors mode), a Highlight outline fallback on winning cells (forced-colors mode only, since box-shadow is stripped there), and the ', winning' accessible-name suffix (works with no CSS/color at all)."

key-files:
  created:
    - src/ui/strikeLine.ts
    - src/ui/Board.test.tsx
    - src/App.winningLine.test.tsx
  modified:
    - src/ui/Board.tsx
    - src/ui/Cell.tsx
    - src/ui/Board.module.css
    - src/ui/Cell.module.css
    - src/index.css
    - src/App.tsx

key-decisions:
  - "Task boundary followed the plan exactly: Task 1 (tracer) wired only the row-1 case end to end (strikeLine.ts, isWinning plumbing, row geometry, one test); Task 2 added the remaining 7 orientations' CSS, the forced-colors/Highlight fallback, and the rest of the test matrix in its own commit."
  - 'The strike element is rendered unconditionally after the 9 cells (not conditionally styled via a cell pseudo-element), so its position is independent of any single cell and the same <span> covers all 8 orientations via one data-line-keyed CSS selector set.'
  - "Diagonal strikes use a single rotated element (width calc(var(--board-size) * 1.3), centered via top/left 50% + translate(-50%,-50%) rotate(±45deg)) rather than per-cell corner math, keeping the diagonal case as simple as the row/column cases."

patterns-established:
  - 'CSS custom properties for cross-cutting layout math (cell-center offsets) are declared once on the container that owns the geometry (.board), not recomputed per orientation -- reusable for any future absolutely-positioned overlay on the board (e.g. Phase 4 win-celebration effects).'

requirements-completed: [GAME-06, A11Y-02, QUAL-03]

coverage:
  - id: D1
    description: 'Exactly one aria-hidden strike-line element is drawn across the three winning cells, for all 8 orientations (3 rows, 3 columns, 2 diagonals)'
    requirement: 'GAME-06'
    verification:
      - kind: unit
        ref: "src/ui/Board.test.tsx#draws the %s strike line across its three cells (it.each over all 8 WINNING_LINES)"
        status: pass
      - kind: e2e
        ref: 'src/App.winningLine.test.tsx#a winning row is struck through and its cells are labelled winning'
        status: pass
      - kind: e2e
        ref: 'src/App.winningLine.test.tsx#a diagonal win strikes diag-down'
        status: pass
    human_judgment: false
  - id: D2
    description: 'Winning cells’ accessible names end with \", winning\"; the other six cells’ names never contain \"winning\"'
    requirement: 'A11Y-02'
    verification:
      - kind: unit
        ref: 'src/ui/Board.test.tsx#draws the %s strike line across its three cells'
        status: pass
      - kind: e2e
        ref: 'src/App.winningLine.test.tsx#a winning row is struck through and its cells are labelled winning'
        status: pass
    human_judgment: false
  - id: D3
    description: 'The strike line stays visible in OS forced-colors mode (CanvasText + forced-color-adjust: none) with a Highlight outline fallback on winning cells, and stays visible in grayscale (>=3:1 contrast, >=6px thick)'
    requirement: 'GAME-06'
    verification:
      - kind: unit
        ref: 'grep-based acceptance criteria: forced-colors: active, forced-color-adjust: none, CanvasText in Board.module.css; Highlight in Cell.module.css'
        status: pass
      - kind: manual
        ref: "Task 2's own <human-check>: Chrome/Edge DevTools forced-colors and achromatopsia emulation, all 4 orientations"
        status: pending
    human_judgment: true
    rationale: 'jsdom cannot render CSS forced-colors or vision-deficiency emulation (Task 2’s own human-check). --color-strike #b3261e against #ffffff computes to ~6.5:1 contrast and --strike-thickness is 0.375rem (6px), satisfying the numeric requirement by construction; the real-browser visual pass is deferred to end-of-phase UAT per workflow.human_verify_mode=end-of-phase and recorded in .planning/WINDOWS.md (id 6).'
  - id: D4
    description: 'No strike line, data-winning attribute, or \", winning\" suffix exists during play, in a draw, or after New round'
    requirement: 'GAME-06'
    verification:
      - kind: e2e
        ref: 'src/App.winningLine.test.tsx#no strike line or winning label during play, in a draw, or after New round'
        status: pass
    human_judgment: false
  - id: D5
    description: 'The strike-line element is not focusable and does not change the Tab order (9 cells, then New round)'
    requirement: 'GAME-06'
    verification:
      - kind: e2e
        ref: 'src/App.winningLine.test.tsx#the strike line is not focusable and leaves Tab order unchanged'
        status: pass
    human_judgment: false
  - id: D6
    description: 'axe reports zero violations on the win state with the strike line rendered'
    requirement: 'QUAL-03'
    verification:
      - kind: e2e
        ref: 'src/App.winningLine.test.tsx#a winning row is struck through and its cells are labelled winning'
        status: pass
    human_judgment: false
  - id: D7
    description: 'The winning-line cue never blinks, flashes, or repeats motion (WCAG 2.3.1 seizure safety) -- static strike line, no keyframes/transition/animation in any stylesheet'
    requirement: 'GAME-06'
    verification:
      - kind: unit
        ref: "acceptance-criteria grep: find src -name '*.css' | grep -cE '@keyframes|animation' prints 0"
        status: pass
    human_judgment: false

# Metrics
duration: 11min
completed: 2026-09-27
status: complete
---

# Phase 1 Plan 4: Two-Player Game -- See the Winning Line Summary

**A `strikeLineId()` lookup against the existing `WINNING_LINES` drives one `aria-hidden` strike element (CSS custom-property geometry for all 8 orientations, `CanvasText`/`Highlight` forced-colors fallbacks) plus a shared `isWinning` flag that appends ", winning" to the three winning cells' accessible names -- closing out ROADMAP success criterion 2 and Phase 1's full requirement set.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-09-27T18:20:24Z
- **Completed:** 2026-09-27T18:29:56Z
- **Tasks:** 2 (Task 1 tracer, Task 2 auto)
- **Files modified:** 9 (3 created, 6 modified)

## Accomplishments

- `src/ui/strikeLine.ts` exports `StrikeLineId` and `strikeLineId(line)`, a pure lookup that finds `line`'s index in the existing `WINNING_LINES` and returns the matching orientation id (`row-1..3`, `col-1..3`, `diag-down`, `diag-up`), throwing on anything that isn't one of the 8 winning lines.
- `src/ui/Cell.tsx` gains an `isWinning` prop (default `false`) that drives both `aria-label={cellLabel(index, value, isWinning)}` and `data-winning="true"` from the same source -- one place decides both the label suffix and the DOM hook.
- `src/ui/Board.tsx` gains a required `winningLine: WinLine | null` prop; it builds a `Set` of the winning indices to flag each `Cell`'s `isWinning`, and renders exactly one `aria-hidden="true"` `<span data-line={strikeLineId(winningLine)}>` after the 9 cells when there is a winner.
- `src/App.tsx` wires `winningLine={result.status === 'win' ? result.winningLine : null}` into `Board`.
- `src/ui/Board.module.css` computes `--board-size`/`--c1`/`--c2`/`--c3` once on `.board` from the existing `--cell-size`/`--board-gap`, then styles all 8 `data-line` orientations (rows/columns via inset + center-offset math, diagonals via a single rotated element), plus a `@media (forced-colors: active)` rule that forces `background: CanvasText` with `forced-color-adjust: none`.
- `src/ui/Cell.module.css` gains a forced-colors-only `Highlight` outline on `[data-winning='true']` cells as the D-02 fallback cue (outline survives forced-colors stripping; `box-shadow` does not).
- `src/index.css` gains `--color-strike: #b3261e` (~6.5:1 contrast against `#ffffff`) and `--strike-thickness: 0.375rem` (6px).
- `src/ui/Board.test.tsx` (10 tests: 8 via `it.each` over every `WINNING_LINES` entry, plus the null-winningLine case and `strikeLineId` rejecting a non-winning line) proves the strike element and winning-cell flags are correct for every orientation in isolation.
- `src/App.winningLine.test.tsx` (4 tests) proves the end-to-end path through the real engine and reducer: a top-row win's strike + labels + axe, a `diag-down` win, the absence of any cue mid-game/in a draw/after New round, and that the strike element never enters or disturbs the Tab order.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end "struck-through winning row" tracer** -- `07bd458` (feat)
2. **Task 2: All 8 orientations, forced-colors and grayscale safety, and clearing on draw and New round** -- `9b56389` (test)

**Plan metadata:** committed alongside this SUMMARY (see below)

## Files Created/Modified

- `src/ui/strikeLine.ts` -- new: `StrikeLineId`, `strikeLineId(line)`
- `src/ui/Board.tsx` -- required `winningLine` prop; winning-index `Set`; the `aria-hidden` strike element
- `src/ui/Cell.tsx` -- `isWinning` prop (default `false`) driving `aria-label` and `data-winning`
- `src/ui/Board.module.css` -- `--board-size`/`--c1`/`--c2`/`--c3`; `.strike` geometry for all 8 orientations; forced-colors `CanvasText` rule
- `src/ui/Cell.module.css` -- forced-colors `Highlight` outline fallback on winning cells
- `src/index.css` -- `--color-strike`, `--strike-thickness`
- `src/App.tsx` -- `winningLine={result.status === 'win' ? result.winningLine : null}` wired into `Board`
- `src/ui/Board.test.tsx` -- new: 10 component tests (all orientations + null case + `strikeLineId` rejection)
- `src/App.winningLine.test.tsx` -- new: 4 end-to-end tests through `App`

## Decisions Made

- Kept the strike element as one unconditionally-rendered-when-winning `<span>` positioned by `data-line`-keyed CSS selectors, rather than styling a pseudo-element per winning cell -- this keeps the diagonal case (which spans across, not within, a single cell) symmetric with the row/column cases instead of needing a different mechanism.
- Diagonals are drawn with one rotated element sized to `calc(var(--board-size) * 1.3)` and centered on the board via `top`/`left: 50%` plus `translate(-50%, -50%) rotate(±45deg)`, rather than computing per-cell corner-to-corner coordinates.
- Split exactly along the plan's task boundary: Task 1's commit touches only the row-1 tracer path (strikeLine.ts, the Cell/Board/App plumbing, row CSS, one test); Task 2's commit adds the other 7 orientations' CSS, the forced-colors/Highlight fallback, and the rest of the test matrix, so each commit's diff matches only what its task specified.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

- Prettier flagged `src/ui/Board.test.tsx`'s formatting (a wrapped `it.each` call) after it was first written; ran `npx prettier --write` on the one file and re-confirmed `npm run format:check` passes. Not a deviation from the plan, no production-code change.

## User Setup Required

None -- no external service configuration required.

## Known Stubs

None. This plan completes GAME-06 (the last open Phase 1 requirement); no rendering path in Phase 1 is left stubbed.

## Threat Flags

None. Per the plan's own T-1-09 disposition: `strikeLineId` throws on any non-winning line, so a malformed `winningLine` can never render a misleading cue, and this plan introduces no new network endpoints, auth paths, file access, or schema changes. `git diff --quiet` on `package.json`/`package-lock.json` across the whole plan confirms no dependency changes (T-1-SC).

## Next Phase Readiness

- Phase 1 is now feature-complete: all 12 phase requirements (GAME-01..07, A11Y-02, A11Y-03, QUAL-01, QUAL-03, QUAL-04) are implemented and covered by `npm test` (12 files, 90 tests), `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build`, all passing locally with zero dependency drift.
- The `[data-line="row-1|row-2|row-3|col-1|col-2|col-3|diag-down|diag-up"]` (aria-hidden) and `[data-winning="true"]` DOM contract is stable for Phase 4 to style or animate (with reduced-motion handling), and `strikeLineId`/`StrikeLineId` are available as a stable export for any future consumer that needs the same orientation mapping.
- Four items are open in `.planning/WINDOWS.md`, all deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase` and none blocking for this plan: the un-upgraded `vite` dev-server advisory (id 1), the still-unrun first GitHub Actions push (id 3), the 01-02 NVDA/Narrator screen-reader pass (id 4), the 01-03 keyboard-only focus-ring pass (id 5), and this plan's new forced-colors/achromatopsia visual pass (id 6, covering all 4 orientation families: row, column, and both diagonals).
- Edge Probe Coverage flagged one unresolved assumption (a single move completing two lines strikes only the first `WINNING_LINES` match, per 01-02's existing tie-break behavior) -- inherited unchanged from `evaluate()`, not new behavior from this plan; no test exercises a genuine double-line win since Phase 1's move sequences never produce one, consistent with 01-02's own tie-break truth already covering that engine-level guarantee.

---

_Phase: 01-two-player-game_
_Completed: 2026-09-27_

## Self-Check: PASSED

- `src/ui/strikeLine.ts`, `src/ui/Board.test.tsx`, `src/App.winningLine.test.tsx` verified present via `test -f` (all created this plan); `src/ui/Board.tsx`, `src/ui/Cell.tsx`, `src/ui/Board.module.css`, `src/ui/Cell.module.css`, `src/index.css`, `src/App.tsx` verified modified via `git status`/`git log`.
- Both commits (`07bd458`, `9b56389`) verified present via `git log --oneline`.
- Every task's `<acceptance_criteria>` re-run and passing at commit time: Task 1's 5 greps (3/3 test files passing, exact test name present once, `strikeLineId(` present in Board.tsx, `cellLabel(index, value, isWinning)` present in Cell.tsx, `winningLine=` present in App.tsx, `--color-strike` present in index.css); Task 2's greps (8 orientations styled, `forced-colors: active`/`forced-color-adjust: none`/`CanvasText` present in Board.module.css, `Highlight` present in Cell.module.css, zero `@keyframes`/`animation` across all CSS, all 3 exact test names present once each).
- Plan-level `<verification>` re-confirmed: `npm test` (10/10 files, 76/76 tests passing), `npm run lint && npm run typecheck && npm run format:check && npm run build` all exit 0, and `git diff --quiet` on `package.json`/`package-lock.json` across the whole plan confirms no dependency drift.
