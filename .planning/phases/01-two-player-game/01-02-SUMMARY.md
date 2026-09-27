---
phase: 01-two-player-game
plan: 02
subsystem: game-engine
tags: [typescript, vitest, testing-library, axe-core, mutation-observer]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Pure engine (Board/Mark/Cell/WinLine/Result types, emptyBoard/isLegalMove/applyMove, currentPlayer), the gameReducer/useGame controller, buildStatusMessage, and the accessible native-button UI (Cell/Board/StatusRegion) this plan wires evaluate() into without touching"
provides:
  - "src/engine/rules.ts: WINNING_LINES (8 lines, rows-then-columns-then-diagonals) and evaluate(board), the single source of truth checking win before draw before in-progress"
  - "src/engine/board.ts: isLegalMove and applyMove both refuse moves once evaluate(board).status is no longer 'in-progress' (IllegalMoveReason gains 'game-over'); a shared isInRange() helper removes the duplicated bounds check"
  - "src/game/useGame.ts: GameView.result = evaluate(board), replacing plan 01-01's hardcoded in-progress constant; status still flows through the one buildStatusMessage builder"
  - "Full engine rule-matrix test suite (src/engine/engine.test.ts, 29 tests): all 8 winning lines x both marks, win on the 9th move, full-board draw, the 4-vs-5-mark boundary, near-miss boards, the double-line tie-break, order independence, WINNING_LINES shape, derived current player, and occupied/out-of-range/game-over rejections with input immutability"
  - "Component outcome coverage (src/App.gameOver.test.tsx, 7 tests): a completed row ends the game end to end, O wins on the middle row, a full board draw, a 9th-move win, board locking after any result, single-live-region announcement (MutationObserver-verified), and zero axe violations in both the win and draw states"
affects: [01-03, 01-04, phase-2, phase-3, phase-4, phase-5]

# Actuals (#2632)
actuals:
  tokens: 4841
  tasks: 3
  commits: 5
  plan_head_before: 658cb30b6b6e5e29b7c86e0da41fbe4cf6d09f14
  plan_head_after: 17a5561c6703d58598a46aac0c80a5e28111243b

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "One evaluate(board) function is the single source of game outcome; every legality check (isLegalMove, applyMove) delegates to it instead of re-deriving game-over state, structurally guaranteeing win is checked before draw (Pitfall 1/4)"
    - "A won or drawn board is enforced as illegal-to-move-on at the engine layer (applyMove throws 'game-over'), not just the UI layer -- the UI guard (aria-disabled) is a UX nicety, the engine is the actual boundary"
    - "boardOf(layout) test helper (engine.test.ts, not exported): a whitespace-stripped 'X'/'O'/'.' string literal makes 9-cell board fixtures readable in test names and assertions"

key-files:
  created:
    - src/engine/rules.ts
    - src/engine/engine.test.ts
  modified:
    - src/engine/board.ts
    - src/game/useGame.ts
    - src/App.gameOver.test.tsx

key-decisions:
  - "evaluate() narrows each line's first cell with a truthy check (`if (mark && mark === board[b] && mark === board[c]))`) rather than `!== null`, because tsconfig's noUncheckedIndexedAccess types board[a] as Mark | null | undefined -- the truthy check narrows out both null and undefined in one branch, matching the exact pattern already shown in 01-RESEARCH.md's Pattern 1."
  - "applyMove checks in the plan-mandated order: out-of-range, then game-over, then occupied -- so a call on an out-of-range index never triggers an evaluate() call, and an occupied-cell call on an otherwise-live board still reports 'occupied' rather than 'game-over'."
  - "REFACTOR step: extracted a private isInRange(index) helper shared by isLegalMove and applyMove, removing the duplicated Number.isInteger/bounds check named as an example in the plan's REFACTOR guidance."

patterns-established:
  - "Engine-layer game-over enforcement: applyMove throws IllegalMoveError('game-over', index) whenever evaluate(board).status !== 'in-progress', independent of and in addition to the UI's aria-disabled guard -- both Phase 2's AI and any future move source share this same enforcement point."

requirements-completed: [GAME-03, GAME-04, GAME-05, QUAL-01, A11Y-03, QUAL-03]

coverage:
  - id: D1
    description: "Three in a row on any of the 8 lines ends the game, including a win completed on the 9th move (never reported as a draw); the status line reads the exact winner string"
    requirement: "GAME-03"
    verification:
      - kind: unit
        ref: "src/engine/engine.test.ts#detects a win on every one of the 8 winning lines (16 cases via it.each)"
        status: pass
      - kind: unit
        ref: "src/engine/engine.test.ts#win on the 9th move is a win, not a draw"
        status: pass
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#a completed top row ends the game"
        status: pass
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#O wins on the middle row"
        status: pass
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#a line completed on the 9th move is a win, not a draw"
        status: pass
    human_judgment: false
  - id: D2
    description: "A full board with no completed line is reported as a draw (It's a draw, ASCII apostrophe)"
    requirement: "GAME-04"
    verification:
      - kind: unit
        ref: "src/engine/engine.test.ts#full board with no line is a draw"
        status: pass
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#a full board with no line is a draw"
        status: pass
    human_judgment: false
  - id: D3
    description: "Once the game is over, every cell is aria-disabled (never native disabled), stays focusable, and click/Enter/Space change nothing at either the engine or UI layer"
    requirement: "GAME-05"
    verification:
      - kind: unit
        ref: "src/engine/engine.test.ts#rejects any move after game over"
        status: pass
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#a completed top row ends the game"
        status: pass
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#the board locks after a result"
        status: pass
    human_judgment: false
  - id: D4
    description: "The result replaces the turn text inside the same always-mounted aria-live=polite status node -- no modal, overlay, or second banner"
    requirement: "A11Y-03"
    verification:
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#announces the result in the same single live region"
        status: pass
    human_judgment: false
  - id: D5
    description: "Full engine rule matrix: all 8 lines x both marks, draw, win-on-9th-move, the 4-vs-5-mark boundary, near-miss boards, the double-line tie-break, order independence, WINNING_LINES shape, derived current player, and occupied/out-of-range/game-over rejections with input immutability"
    requirement: "QUAL-01"
    verification:
      - kind: unit
        ref: "src/engine/engine.test.ts (29 tests across evaluate/WINNING_LINES/currentPlayer/isLegalMove and applyMove)"
        status: pass
    human_judgment: false
  - id: D6
    description: "axe reports zero violations on the rendered win and draw states"
    requirement: "QUAL-03"
    verification:
      - kind: e2e
        ref: "src/App.gameOver.test.tsx#has no axe violations in the win and draw states"
        status: pass
    human_judgment: false
  - id: D7
    description: "A screen reader announces each turn change and the final result exactly once while playing a full keyboard-only game"
    requirement: "A11Y-03"
    verification: []
    human_judgment: true
    rationale: "jsdom cannot run a real screen reader (Task 3's own <human-check>). Deferred to end-of-phase UAT consolidation per workflow.human_verify_mode=end-of-phase; recorded in .planning/WINDOWS.md as an unrun-verify. Phase 5 owns the formal keyboard/screen-reader pass."

# Metrics
duration: 62min
completed: 2026-09-27
status: complete
---

# Phase 1 Plan 2: Two-Player Game -- Outcome Evaluation Summary

**A single `evaluate(board)` function (WINNING_LINES checked before the draw check, structurally) now drives "X wins!" / "O wins!" / "It's a draw" through the existing status region and locks the board at the engine layer, proven by a 29-test engine matrix and 7 component tests including a MutationObserver-verified single-announcement check and axe.**

## Performance

- **Duration:** 62 min
- **Started:** 2026-09-27T16:52:00Z
- **Completed:** 2026-09-27T17:54:00Z
- **Tasks:** 3 (Task 1 tracer, Task 2 TDD RED/GREEN/REFACTOR, Task 3 UI outcome coverage)
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments

- `src/engine/rules.ts` defines `WINNING_LINES` (rows, then columns, then diagonals) and `evaluate(board)`, which loops every winning line before ever checking for a draw -- the exact structure that guarantees a win completed on the 9th move is reported as a win, never a draw (Pitfall 1/4).
- `isLegalMove` and `applyMove` both now refuse any move once `evaluate(board).status !== 'in-progress'`; `applyMove` throws `IllegalMoveError('game-over', index)`, closing the threat register's T-1-07 (a move after a result reaching the engine) at the engine layer, independent of the UI's `aria-disabled` guard.
- `useGame.ts`'s `GameView` now exposes `result = evaluate(board)`, replacing plan 01-01's hardcoded in-progress stub -- no other UI code changed, because locking already flowed through `isCellPlayable -> isLegalMove -> Cell aria-disabled`.
- `src/engine/engine.test.ts` (29 tests) proves the full QUAL-01 rule matrix: every one of the 8 winning lines for both marks, the win-on-the-9th-move edge case, the full-board draw, the 4-vs-5-mark boundary, two near-miss boards, the double-line tie-break (first match in `WINNING_LINES` order), order independence, `WINNING_LINES`'s exact shape, derived `currentPlayer` alternation, and occupied/out-of-range/game-over rejections plus input immutability.
- `src/App.gameOver.test.tsx` (7 tests) proves the outcome end to end: a completed top row, O winning the middle row, a full-board draw, a 9th-move win, board locking after either result (aria-disabled, still focusable, no native `disabled`), a MutationObserver-verified single announcement through the one `aria-live="polite"` node, and zero axe violations in both the win and draw states.

## Task Commits

Each task was committed atomically (Task 2 followed the TDD RED-GREEN-REFACTOR cycle):

1. **Task 1: Tracer -- outcome evaluation ends the game end to end** -- `7b9e49c` (feat)
2. **Task 2 RED: failing test for the full engine rule matrix** -- `bce79f8` (test)
3. **Task 2 GREEN: implement game-over rejection in applyMove** -- `5530116` (feat)
4. **Task 2 REFACTOR: share the range check between isLegalMove and applyMove** -- `dabc491` (refactor)
5. **Task 3: UI outcome coverage** -- `17a5561` (test)

**Plan metadata:** committed alongside this SUMMARY (see below)

## Files Created/Modified

- `src/engine/rules.ts` -- `WINNING_LINES` (8 lines, exact order) and `evaluate(board)`: win, then draw, then in-progress
- `src/engine/board.ts` -- `IllegalMoveReason` gains `'game-over'`; `isLegalMove`/`applyMove` both check `evaluate(board).status === 'in-progress'`; shared `isInRange()` helper
- `src/game/useGame.ts` -- `GameView.result = evaluate(board)`, replacing the 01-01 stub constant
- `src/engine/engine.test.ts` -- the full QUAL-01 rule matrix (29 tests), including the local `boardOf(layout)` fixture helper
- `src/App.gameOver.test.tsx` -- component outcome coverage (7 tests): win/draw/9th-move results, locking, live-region announcement, axe

## Decisions Made

- `evaluate()`'s win check narrows each line's first cell with a truthy check (matching 01-RESEARCH.md Pattern 1's example) rather than `!== null`, because `noUncheckedIndexedAccess` types `board[a]` as `Mark | null | undefined` and the truthy check narrows out both in one branch.
- `applyMove`'s check order is out-of-range, then game-over, then occupied, exactly as the plan specified -- an out-of-range call never reaches `evaluate()`, and an occupied-cell call on an otherwise-live board still reports `'occupied'`, not `'game-over'`.
- Extracted a private `isInRange(index)` helper shared by `isLegalMove` and `applyMove` during the REFACTOR step, per the plan's own suggested example.

## Deviations from Plan

None -- plan executed exactly as written. (See Issues Encountered below for two self-authored test bugs found and fixed during Task 2/Task 3, neither of which was a production-code defect or a deviation from what the plan specified.)

## Issues Encountered

- **Task 2 (currentPlayer test):** My first draft of "derives the current player from the board" played indices 0..8 in that literal order while asserting alternation across all 9 moves. That order actually completes the `[2,4,6]` diagonal after the 7th move, so `applyMove` correctly threw `'game-over'` on the 8th call -- a bug in my test fixture, not in `board.ts` (which was behaving exactly as newly specified). Fixed by replacing the move order with one that fills the known-draw board `'XOX XOO OXX'` (verified in engine.test.ts's own draw test), which by construction can never complete a line at any prefix, so all 9 moves apply cleanly.
- **Task 3 (live-region test):** The first draft of "announces the result in the same single live region" used a no-op `MutationObserver` callback and read `observer.takeRecords()` synchronously right after `await user.click(...)`. This was flaky-by-construction: the observer's own queued microtask can drain the pending-record queue before a synchronous `takeRecords()` call gets a turn, since `await` already yields a microtask checkpoint. Fixed by accumulating records via the callback itself and flushing one extra `await Promise.resolve()` tick before combining with a final `takeRecords()` call. Re-ran the test file 4 times back-to-back after the fix with no flakes.

## User Setup Required

None -- no external service configuration required.

## Known Stubs

None. This plan's own purpose was to close the one stub 01-01 left open (`src/game/useGame.ts`'s hardcoded `{ status: 'in-progress' }` constant) -- resolved and marked `fixed` in `.planning/WINDOWS.md` (item 2).

## Threat Flags

None. This plan introduces no new network endpoints, auth paths, file access, or schema changes -- it only tightens an existing trust boundary (UI event -> engine) that was already in the plan's threat register (T-1-07), and adds no dependencies (`git diff --quiet` on `package.json`/`package-lock.json` across the whole plan confirmed clean).

## Next Phase Readiness

- The engine's outcome contract (`evaluate(board): Result`, `WINNING_LINES`, `IllegalMoveReason` including `'game-over'`) is stable for 01-03 (New round) and 01-04 (winning-line visual cue) to build on without further changes to `rules.ts` or `board.ts`.
- `GameView.result` is now real and drives `buildStatusMessage`'s `'win'`/`'draw'` branches for the first time -- 01-04's winning-line highlight can read `result.winningLine` directly from `useGame()`.
- `npm test` (50 tests across 6 files), `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` all pass locally; no dependency changes anywhere in this plan.
- Two items remain open in `.planning/WINDOWS.md` from 01-01 (the un-upgraded `vite` dev-server advisory, and the still-unrun first GitHub Actions push) plus one new item from this plan (the deferred NVDA/Narrator screen-reader pass for Task 3's `<human-check>`) -- all three are explicitly deferred to end-of-phase UAT per `workflow.human_verify_mode: end-of-phase`, not blockers for 01-03.
- The plan's own Edge Probe Coverage table flagged GAME-03 and GAME-04 as "unclassified (FLAGGED ASSUMPTION)" for the edge-probe pass, with an assumed edge set that this plan's tests fully cover (all 8 lines x both marks, the earliest 5th-move win, the 9th-move full-board win, a double-line move, and a full board with no line vs. a full board with a line). Carried forward for human confirmation that no other GAME-03/GAME-04 edge exists, per the plan's own note.

---
*Phase: 01-two-player-game*
*Completed: 2026-09-27*

## Self-Check: PASSED

- `src/engine/rules.ts`, `src/engine/engine.test.ts` verified present via `test -f`; `src/engine/board.ts`, `src/game/useGame.ts`, `src/App.gameOver.test.tsx` verified modified via `git status`/`git log`.
- All 5 commits (`7b9e49c`, `bce79f8`, `5530116`, `dabc491`, `17a5561`) verified present via `git log --oneline`.
- Every task's `<acceptance_criteria>` re-run and passing at commit time: Task 1's 5 greps, Task 2's TDD gate greps plus `RED_EVIDENCE_OK` verdict from `gsd_run check tdd-red-evidence`, Task 3's 6 test-name greps -- all confirmed.
- Plan-level `<verification>` re-confirmed: `npm test` (50/50 passing across 6 files), `npm run lint && npm run typecheck && npm run format:check && npm run build` all exit 0, and `git diff --quiet 658cb30 HEAD -- package.json package-lock.json` exits 0 (no dependency drift across the whole plan).
