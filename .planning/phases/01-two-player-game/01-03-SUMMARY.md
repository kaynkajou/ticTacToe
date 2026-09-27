---
phase: 01-two-player-game
plan: 03
subsystem: game-engine
tags: [react-19, ref-as-prop, focus-management, aria-describedby, vitest, testing-library, axe-core]

# Dependency graph
requires:
  - phase: 01-02
    provides: "evaluate(board) driving GameView.result (win/draw/in-progress), and the engine-layer game-over lock (applyMove throws 'game-over') this plan's New round has to release"
provides:
  - "src/game/gameReducer.ts: GameState.round counter and the NEW_ROUND action (empty board, round + 1) from any state (empty, mid-game, over); MOVE keeps round unchanged and its same-object identity on an illegal move"
  - "src/game/useGame.ts: newRound(), firstCellRef and newRoundRef, and the two focus effects -- D-10 (focus the first cell when round > 0) and D-08 (focus New round when result.status leaves in-progress)"
  - "src/ui/NewRoundButton.tsx: an always-enabled native button (never disabled/aria-disabled) described by the status region via aria-describedby (D-09)"
  - "src/ui/Cell.tsx / src/ui/Board.tsx: an optional ref prop (React 19 ref-as-prop, no forwardRef) so Board can attach firstCellRef to the cell at index 0 only"
  - "Component and reducer test coverage: src/App.newRound.test.tsx (8 tests) and src/game/gameReducer.test.ts (4 tests) covering the full New round flow, focus choreography, Tab order, edge cases, and axe"
affects: [01-04, phase-2, phase-3, phase-5]

# Actuals (#2632)
actuals:
  tokens: 4776
  tasks: 2
  commits: 2
  plan_head_before: d7ba5a6b20df31b30188e2c371e600f427d1ceb9
  plan_head_after: 85ae599f9f5e22c1bf7ff6f4cd778d71f494d7a4

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "React 19 ref-as-prop for Cell and NewRoundButton: `ref?: Ref<HTMLButtonElement>` as an ordinary prop, no forwardRef wrapper -- confirmed by an acceptance-criteria grep that forwardRef appears zero times in either file"
    - "Exactly two production focus() calls in the whole codebase (useGame.ts's two useEffects), each gated on a state transition (round > 0; result.status !== 'in-progress') -- the only two places focus moves programmatically, enforced by a grep in Task 2's acceptance criteria"
    - "New round's aria-describedby points at the persistent status region (STATUS_REGION_ID), so focusing it after a result reads the result text without a second announcement"

key-files:
  created:
    - src/ui/NewRoundButton.tsx
    - src/App.newRound.test.tsx
    - src/game/gameReducer.test.ts
  modified:
    - src/game/gameReducer.ts
    - src/game/useGame.ts
    - src/ui/Board.tsx
    - src/ui/Cell.tsx
    - src/App.tsx

key-decisions:
  - "Split the useGame.ts ref/effect work strictly along the plan's task boundary: Task 1 added only firstCellRef and the round-keyed effect (D-10); Task 2 added newRoundRef and the result.status-keyed effect (D-08) in its own commit, even though both live in the same file, to keep each task's commit scoped to exactly what that task specified."
  - "gameReducer's MOVE branch keeps returning the exact same state object (not a new object with identical fields) on an illegal move, preserving the toBe identity contract gameReducer.test.ts asserts for occupied/out-of-range/game-over moves."
  - "Test-only fix: resetting focus to document.body between Tab-order assertions needed `(document.activeElement as HTMLElement | null)?.blur()` rather than `document.body.focus()`, because jsdom's body is not natively focusable and a direct focus() call on it is a silent no-op when another element already holds focus."

patterns-established:
  - "Tab/Enter-only interaction helper (playMovesByKeyboard) that tracks a logical tab position and uses forward Tab or shift+Tab to reach a non-monotonic move order (e.g. cell 3 then cell 1) -- reusable for any future keyboard-only flow test."

requirements-completed: [GAME-07, GAME-05, A11Y-03, QUAL-03]

coverage:
  - id: D1
    description: "New round is always visible and enabled (no disabled/aria-disabled attribute) on an empty board, mid-game, and after a result, and keeps a stable Tab position after the 9 cells"
    requirement: "GAME-07"
    verification:
      - kind: e2e
        ref: "src/App.newRound.test.tsx#New round is always enabled and follows the cells in Tab order"
        status: pass
    human_judgment: false
  - id: D2
    description: "Activating New round clears all 9 cells without reloading, resets the status to X's turn, and makes every cell playable again -- from 0 moves, mid-game, and after a result"
    requirement: "GAME-07"
    verification:
      - kind: e2e
        ref: "src/App.newRound.test.tsx#New round mid-game clears the board and focuses Row 1, column 1"
        status: pass
      - kind: e2e
        ref: "src/App.newRound.test.tsx#New round works at 0 moves, mid-game and after a result"
        status: pass
    human_judgment: false
  - id: D3
    description: "The board lock from 01-02 is released by New round: after New round every cell reports aria-disabled=false"
    requirement: "GAME-05"
    verification:
      - kind: e2e
        ref: "src/App.newRound.test.tsx#New round mid-game clears the board and focuses Row 1, column 1"
        status: pass
    human_judgment: false
  - id: D4
    description: "When a game ends (win or draw), focus moves programmatically to New round, and its accessible description is the exact result text (aria-describedby wiring, D-08/D-09)"
    requirement: "A11Y-03"
    verification:
      - kind: e2e
        ref: "src/App.newRound.test.tsx#focus moves to New round after a win and its description is the result"
        status: pass
      - kind: e2e
        ref: "src/App.newRound.test.tsx#focus moves to New round after a draw"
        status: pass
    human_judgment: false
  - id: D5
    description: "After New round clears the board, focus lands on the Row 1, column 1 cell (D-10), including pressing New round twice in a row"
    requirement: "GAME-07"
    verification:
      - kind: e2e
        ref: "src/App.newRound.test.tsx#focus moves to New round after a win and its description is the result"
        status: pass
      - kind: e2e
        ref: "src/App.newRound.test.tsx#pressing New round twice still leaves an empty board with focus on the first cell"
        status: pass
    human_judgment: false
  - id: D6
    description: "The status element stays the same single aria-live=polite DOM node across New round -- never unmounted/recreated"
    requirement: "A11Y-03"
    verification:
      - kind: e2e
        ref: "src/App.newRound.test.tsx#the status stays the same single live region across New round"
        status: pass
    human_judgment: false
  - id: D7
    description: "axe reports zero violations both after a result (focus on New round) and after New round (focus on the first cell)"
    requirement: "QUAL-03"
    verification:
      - kind: e2e
        ref: "src/App.newRound.test.tsx#has no axe violations after a result and after New round"
        status: pass
    human_judgment: false
  - id: D8
    description: "Reducer-level GAME-07 edge cases: NEW_ROUND increments round from mid-game, a finished game, and an empty board; MOVE keeps the round; an illegal MOVE returns the exact same state object (occupied, out-of-range, game-over)"
    requirement: "GAME-07"
    verification:
      - kind: unit
        ref: "src/game/gameReducer.test.ts (4 tests)"
        status: pass
    human_judgment: false
  - id: D9
    description: "A real-browser, keyboard-only playthrough shows a visible focus ring on New round at game end and on the top-left cell after New round is pressed"
    verification: []
    human_judgment: true
    rationale: "jsdom cannot render or assert CSS focus-ring visibility (Task 2's own <human-check>). Deferred to end-of-phase UAT per workflow.human_verify_mode=end-of-phase; recorded in .planning/WINDOWS.md (id 5, kind unrun-verify). Phase 5 owns the formal keyboard/screen-reader verification pass."

# Metrics
duration: 22min
completed: 2026-09-27
status: complete
---

# Phase 1 Plan 3: Two-Player Game -- Play Again Summary

**An always-enabled `NewRoundButton` (React 19 ref-as-prop) clears the board through a new `NEW_ROUND` reducer action and round counter, with focus moving to New round when a game ends (reading the result via `aria-describedby`) and back to Row 1, column 1 after it's pressed -- closing the play-result-play-again loop for keyboard and screen-reader users.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-09-27T17:57:00Z
- **Completed:** 2026-09-27T18:18:30Z
- **Tasks:** 2 (Task 1 tracer, Task 2 auto)
- **Files modified:** 8 (3 created, 5 modified)

## Accomplishments

- `src/game/gameReducer.ts` gains `GameState.round` and a `NEW_ROUND` action that returns `{ board: emptyBoard(), round: state.round + 1 }` from any state -- empty, mid-game, or over -- while `MOVE` keeps the round unchanged and preserves its same-object identity on an illegal move.
- `src/game/useGame.ts` exposes `newRound()`, `firstCellRef`, and `newRoundRef`, plus the two focus effects: D-10 (focus the first cell when `round > 0`, guarding StrictMode's double-mount) and D-08 (focus New round when `result.status` leaves `'in-progress'`). These are the only two `.focus()` calls in production code, confirmed by an acceptance-criteria grep.
- `src/ui/NewRoundButton.tsx` is a native button that never sets `disabled` or `aria-disabled`, with `aria-describedby={STATUS_REGION_ID}` (D-09) so focusing it after a result reads the result text. `src/ui/Cell.tsx` and `src/ui/Board.tsx` gained an optional `ref` prop using React 19's ref-as-prop convention (no `forwardRef`), letting `Board` attach `firstCellRef` to cell index 0 only.
- `src/App.newRound.test.tsx` (8 tests) proves the full flow end to end: the mid-game restart tracer, focus-and-description on win and draw, always-enabled + stable Tab-order behavior (10 Tab presses through all 9 cells then New round, both before and after a result), New round parity at 0 moves/mid-game/post-result, pressing New round twice, the single persistent live region, and zero axe violations after a result and after New round.
- `src/game/gameReducer.test.ts` (4 tests) proves the reducer-level `NEW_ROUND`/`MOVE` contract in isolation, including `toBe` identity checks for illegal moves (occupied, out-of-range, game-over).

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end "New round mid-game" tracer** -- `c8c86f5` (feat)
2. **Task 2: Game-over focus to New round, result as its description, and edge cases** -- `85ae599` (test)

**Plan metadata:** committed alongside this SUMMARY (see below)

## Files Created/Modified

- `src/ui/NewRoundButton.tsx` -- new always-enabled button, `aria-describedby={STATUS_REGION_ID}`, `ref` prop
- `src/game/gameReducer.ts` -- `GameState.round`, `NEW_ROUND` action
- `src/game/useGame.ts` -- `newRound()`, `firstCellRef`, `newRoundRef`, the two D-08/D-10 focus effects
- `src/ui/Board.tsx` -- optional `firstCellRef` prop, wired to cell index 0 only
- `src/ui/Cell.tsx` -- optional `ref` prop (React 19 ref-as-prop)
- `src/App.tsx` -- renders `NewRoundButton` after `Board`, wires `newRound`, `firstCellRef`, `newRoundRef`
- `src/App.newRound.test.tsx` -- 8 component tests covering the whole New round flow
- `src/game/gameReducer.test.ts` -- 4 pure reducer tests

## Decisions Made

- Kept the `useGame.ts` ref/effect additions split across the two task commits exactly along the plan's task boundary (Task 1: `firstCellRef` + round effect; Task 2: `newRoundRef` + result-status effect), even though both changes live in the same file, so each commit matches only what its task specified.
- `gameReducer`'s illegal-`MOVE` branch continues returning the literal same `state` object (not a structurally-equal copy), which `gameReducer.test.ts` asserts with `toBe` for occupied, out-of-range, and post-game-over moves.

## Deviations from Plan

None -- plan executed exactly as written. (See Issues Encountered below for one self-authored test bug found and fixed during Task 2, not a production-code defect or a deviation from what the plan specified.)

## Issues Encountered

- **Task 2 (Tab-order test):** My first draft of the "always enabled and follows the cells in Tab order" test called `document.body.focus()` to reset focus before each 10-Tab walk. That call is a silent no-op in jsdom once another element already holds focus, because `<body>` is not natively focusable without an explicit `tabindex`. After a win moved focus to New round, the second reset attempt left focus exactly where it already was, so the first `Tab` press landed on New round again instead of cell 0, and the assertion failed comparing the whole document body against a button. Fixed by blurring the current `document.activeElement` instead, which reproduces the same "nothing focused" state a real browser reaches when the focused element loses focus with no next target. Re-ran the file after the fix with no flakes.

## User Setup Required

None -- no external service configuration required.

## Known Stubs

None new. This plan resolves GAME-07's remaining scope (New round) and closes the board-lock loop GAME-05 opened in 01-02; no other engine result is stubbed.

## Threat Flags

None. This plan introduces no new network endpoints, auth paths, file access, or schema changes -- `NEW_ROUND` only rebuilds the board via the existing `emptyBoard()` and derives its result through the existing `evaluate()`, per the plan's own T-1-08 mitigation. `git diff --quiet` on `package.json`/`package-lock.json` across the whole plan confirms no dependency changes (T-1-SC).

## Next Phase Readiness

- The full play -> result -> play-again loop is complete and keyboard/screen-reader accessible: `newRound()`, `firstCellRef`, and `newRoundRef` are stable exports on `GameView` for 01-04 (winning-line highlight) and Phase 2 (AI, which the plan notes will build its cancel-pending-move logic on this same mid-game restart path) to extend without further changes to `gameReducer.ts`'s action shape.
- `npm test` (8 files, 62 tests), `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` all pass locally; no dependency changes anywhere in this plan.
- One new item is open in `.planning/WINDOWS.md` (id 5): Task 2's real-browser keyboard-only focus-ring `<human-check>`, deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`, alongside the three items already carried forward from 01-01/01-02 (the un-upgraded `vite` dev-server advisory, the still-unrun first GitHub Actions push, and the 01-02 NVDA/Narrator screen-reader pass) -- none are blockers for 01-04.
- 01-04 (winning-line highlight) can read `result.winningLine` directly from `useGame()` and render it inside `Board`/`Cell` without touching this plan's `NewRoundButton`, focus effects, or reducer shape.

---
*Phase: 01-two-player-game*
*Completed: 2026-09-27*

## Self-Check: PASSED

- `src/ui/NewRoundButton.tsx`, `src/App.newRound.test.tsx`, `src/game/gameReducer.test.ts` verified present via `test -f`; `src/game/gameReducer.ts`, `src/game/useGame.ts`, `src/ui/Board.tsx`, `src/ui/Cell.tsx`, `src/App.tsx` verified modified via `git status`/`git log`.
- Both commits (`c8c86f5`, `85ae599`) verified present via `git log --oneline`.
- Every task's `<acceptance_criteria>` re-run and passing at commit time: Task 1's 5 greps (3/3 test files passing, exact test name present, `aria-describedby={STATUS_REGION_ID}` present, `NEW_ROUND` present, zero `forwardRef` occurrences); Task 2's greps (all 7 exact test names present once, `an illegal MOVE returns the same state object` present, exactly 2 production `.focus()` calls, zero assertive/alert live regions, `npm run lint`/`typecheck` exit 0).
- Plan-level `<verification>` re-confirmed: `npm test` (8/8 files, 62/62 tests passing), `npm run lint && npm run typecheck && npm run format:check && npm run build` all exit 0, and `git diff --quiet` on `package.json`/`package-lock.json` across the whole plan confirms no dependency drift.
