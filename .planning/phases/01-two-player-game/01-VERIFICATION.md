---
phase: 01-two-player-game
verified: 2026-09-27T19:10:20Z
status: human_needed
score: 12/12 truths verified
covered_files: [".gitattributes", ".github/workflows/ci.yml", ".gitignore", ".nvmrc", ".planning/phases/01-two-player-game/01-01-PLAN.md", ".planning/phases/01-two-player-game/01-01-SUMMARY.md", ".planning/phases/01-two-player-game/01-02-PLAN.md", ".planning/phases/01-two-player-game/01-02-SUMMARY.md", ".planning/phases/01-two-player-game/01-03-PLAN.md", ".planning/phases/01-two-player-game/01-03-SUMMARY.md", ".planning/phases/01-two-player-game/01-04-PLAN.md", ".planning/phases/01-two-player-game/01-04-SUMMARY.md", ".planning/phases/01-two-player-game/01-CONTEXT.md", ".planning/phases/01-two-player-game/01-DISCUSSION-LOG.md", ".planning/phases/01-two-player-game/01-PATTERNS.md", ".planning/phases/01-two-player-game/01-RESEARCH.md", ".planning/phases/01-two-player-game/01-REVIEW-DISPOSITION.md", ".planning/phases/01-two-player-game/01-REVIEW.md", ".planning/phases/01-two-player-game/01-VALIDATION.md", ".planning/phases/01-two-player-game/SKELETON.md", ".prettierignore", ".prettierrc.json", "README.md", "eslint.config.mjs", "index.html", "package-lock.json", "package.json", "src/App.gameOver.test.tsx", "src/App.module.css", "src/App.newRound.test.tsx", "src/App.test.tsx", "src/App.tsx", "src/App.winningLine.test.tsx", "src/engine/board.ts", "src/engine/engine.test.ts", "src/engine/player.ts", "src/engine/rules.ts", "src/engine/types.ts", "src/game/gameReducer.test.ts", "src/game/gameReducer.ts", "src/game/status.test.ts", "src/game/status.ts", "src/game/useGame.ts", "src/index.css", "src/main.tsx", "src/test/axe-canary.test.ts", "src/test/setup.ts", "src/ui/Board.module.css", "src/ui/Board.test.tsx", "src/ui/Board.tsx", "src/ui/Cell.module.css", "src/ui/Cell.tsx", "src/ui/NewRoundButton.tsx", "src/ui/StatusRegion.tsx", "src/ui/cellLabel.test.ts", "src/ui/cellLabel.ts", "src/ui/strikeLine.ts", "tsconfig.app.json", "tsconfig.json", "tsconfig.node.json", "vite.config.ts"]
covered_digest: "v2:sha256:c0c18219856c8fba37ec5822dbdbe6e8f4770e264cc5a520da91df16fb91ba3f"
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Push the branch to GitHub and open the repository's Actions tab (or `gh run watch`) for the pushed commit"
    expected: "The 'CI' workflow run is green, and its Install, Lint, Typecheck, Format check, Test and Build steps all succeed"
    why_human: "Needs a real push to GitHub; pushing requires the user's explicit go-ahead per CLAUDE.md. The workflow file's step order/permissions/action pins were verified locally by grep and content inspection, and all six gates pass locally, but no real Actions run has executed yet (WINDOWS.md id 3, open)."
  - test: "Run `npm run dev`, start NVDA (Windows) or Narrator, and play a full game using only Tab and Enter"
    expected: "Each turn change ('O's turn', 'X's turn') is read once, 'X wins!' (or the draw text) is read once when the game ends, and the board itself is never read out as a live region"
    why_human: "jsdom cannot run a real screen reader. The single-live-region and MutationObserver-verified single-announcement behavior is proven under jsdom (src/App.gameOver.test.tsx#announces the result in the same single live region — reran individually, passes), but a real AT pass has not been performed (WINDOWS.md id 4, open). Phase 5 owns the formal pass."
  - test: "Run `npm run dev`. Using only the keyboard (Tab, Enter, Space), play a game to a win, then press Enter on New round"
    expected: "A clearly visible focus ring appears on New round when the game ends; after Enter, the ring is on the top-left cell and the status reads 'X's turn'; focus is never lost to the page body"
    why_human: "jsdom cannot render or assert CSS focus-ring visibility. The underlying focus-movement logic is proven under jsdom (src/App.newRound.test.tsx#focus moves to New round after a win and its description is the result — reran individually, passes), but the visual focus ring has not been confirmed in a real browser (WINDOWS.md id 5, open). Phase 5 owns the formal pass."
  - test: "Run `npm run dev` in Chrome or Edge. In DevTools -> Rendering, emulate forced-colors (active) and, separately, Achromatopsia. Win once on a row, a column, and each diagonal in each mode (New round between games)"
    expected: "In both emulation modes the strike line is clearly visible and runs through the centers of exactly the three winning cells for every orientation; in forced-colors mode the winning cells also show an outline; X and O marks stay legible under the line"
    why_human: "jsdom has no CSS layout or forced-colors/vision-deficiency rendering. The numeric/structural requirements are satisfied by construction (--color-strike #b3261e against #ffffff computes to ~6.5:1 contrast; --strike-thickness is 0.375rem = 6px; @media (forced-colors: active) rules for CanvasText and a Highlight outline fallback are present in src/ui/Board.module.css and src/ui/Cell.module.css), but the real-browser visual confirmation has not been performed (WINDOWS.md id 6, open)."
---

# Phase 1: Two-Player Game Verification Report

**Phase Goal:** As a player sharing a device, I want to play full games with correct wins and draws, so that a friend and I can compete.
**Verified:** 2026-09-27T19:10:20Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Two players alternate X/O turns on the real engine; the status line always names whose turn it is; occupied cells ignore click, Enter and Space (no state/label/live-region change) | VERIFIED | `src/App.test.tsx` ("plays alternating turns through the real engine", "ignores an occupied cell activated by click, Enter or Space"); `src/engine/player.ts` derives `currentPlayer` from board (never stored). `npm test` reran independently: 76/76 pass. |
| 2 | Three in a row on any of the 8 lines ends the game, including a win completed on the 9th move (never reported as a draw); status reads the exact winner string | VERIFIED | `src/engine/rules.ts` `evaluate()` loops `WINNING_LINES` (rows, columns, diagonals) before any draw check — read and confirmed structurally. `src/engine/engine.test.ts` (16-case `it.each` over all 8 lines x 2 marks, plus "win on the 9th move is a win, not a draw"); `src/App.gameOver.test.tsx#a completed top row ends the game` / `#O wins on the middle row` / `#a line completed on the 9th move is a win, not a draw`. |
| 3 | A full board with no completed line is reported as a draw ("It's a draw", ASCII apostrophe) | VERIFIED | `src/engine/engine.test.ts#full board with no line is a draw`; `src/App.gameOver.test.tsx#a full board with no line is a draw`; `src/game/status.test.ts` checks the apostrophe char code is 39. |
| 4 | Once a game is over, every cell is `aria-disabled="true"` (never native `disabled`), stays focusable, and click/Enter/Space on any cell change nothing at engine and UI layers | VERIFIED (behavior-dependent, individually re-run) | `src/engine/board.ts` `applyMove`/`isLegalMove` both gate on `evaluate(board).status === 'in-progress'`, throwing `IllegalMoveError('game-over', …)` otherwise. Re-ran `src/App.gameOver.test.tsx#the board locks after a result` in isolation (`vitest -t`) — passed. Re-ran `src/game/gameReducer.test.ts#an illegal MOVE returns the same state object` in isolation — passed (`toBe` identity for occupied/out-of-range/game-over). |
| 5 | Winning cells get a non-color cue — a static strike line for all 8 orientations plus a ", winning" accessible-name suffix — and the cue is absent during play, in a draw, and after New round | VERIFIED | `src/ui/strikeLine.ts` (`strikeLineId`, throws on non-winning line); `src/ui/Board.tsx`/`Cell.tsx` wiring read and matches interface contract exactly; `src/ui/Board.test.tsx` (`it.each` over all 8 `WINNING_LINES`); `src/App.winningLine.test.tsx#no strike line or winning label during play, in a draw, or after New round`. |
| 6 | "New round" clears all 9 cells without reloading, resets status to "X's turn", makes every cell playable again, from any state (empty/mid-game/over), including pressed twice in a row | VERIFIED (behavior-dependent, individually re-run) | `src/game/gameReducer.ts` `NEW_ROUND` returns `{board: emptyBoard(), round: round+1}` from any state. Re-ran `src/App.newRound.test.tsx#New round mid-game clears the board and focuses Row 1, column 1` in isolation — passed. |
| 7 | Each cell's accessible name is "Row {r}, column {c}, {X\|O\|empty}[, winning]"; 9 distinct labels in row-major DOM/Tab order | VERIFIED | `src/ui/cellLabel.ts` implements the exact contract; `src/ui/cellLabel.test.ts` (distinctness, regex match, char-code checks); re-ran `src/App.test.tsx#renders 9 row-major cells with D-04 labels and one polite live region` in isolation — passed. |
| 8 | Exactly one `aria-live="polite"` status region exists, is always mounted (same DOM node across moves and New round), and announces each turn change and result once; the board carries no grid/gridcell/row role | VERIFIED (behavior-dependent, individually re-run) | `src/ui/StatusRegion.tsx` (`role="status"`, `aria-live="polite"`, always mounted). Re-ran `src/App.gameOver.test.tsx#announces the result in the same single live region` (MutationObserver-based) in isolation — passed. Re-ran `src/App.newRound.test.tsx#the status stays the same single live region across New round` in isolation — passed. |
| 9 | The 9 cells, then New round, are native buttons reachable by Tab in a stable order; New round is always enabled (never `disabled`/`aria-disabled`) | VERIFIED (behavior-dependent, individually re-run) | `src/ui/NewRoundButton.tsx` never sets `disabled`/`aria-disabled`. Re-ran `src/App.newRound.test.tsx#New round is always enabled and follows the cells in Tab order` in isolation — passed. |
| 10 | `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test` and `npm run build` all exit 0; component + axe tests report zero violations in mid-game/win/draw states | VERIFIED | Independently reran all five commands outside the executor's own claims: lint exit 0, typecheck exit 0, format:check exit 0 ("All matched files use Prettier code style!"), `npx vitest run` 10/10 files, 76/76 tests, build exit 0 (`dist/index.html` produced). `src/test/axe-canary.test.ts` proves the matcher can both pass and fail (not a silent no-op). |
| 11 | `.github/workflows/ci.yml` runs Install, Lint, Typecheck, Format check, Test and Build as separate named steps, in that order, on every push, with least-privilege permissions | VERIFIED (structural; real run pending — see Human Verification) | Read the workflow file directly: `permissions: contents: read`, `persist-credentials: false`, `actions/checkout@v7` and `actions/setup-node@v7`, steps named Install/Lint/Typecheck/"Format check"/Test/Build in that exact order, `on: push / pull_request` with no branch/path filters. No `continue-on-error`, no `passWithNoTests`. |
| 12 | `src/engine` contains zero React/`document`/`window` references; the current player is always derived from the board, never stored; `evaluate()` is the single, structural source of truth for win-before-draw-before-in-progress | VERIFIED | `grep -rnE "from 'react|document\.|window\." src/engine` returns nothing. Read `src/engine/rules.ts`/`board.ts`/`player.ts` directly: one `evaluate()` function loops all 8 lines before checking `board.every(...)` for a draw; `currentPlayer(board)` counts non-null cells with no external state. |

**Score:** 12/12 truths verified (0 present, behavior-unverified)

### Deferred Items

No later-phase deferrals apply — the 4 open items below are Phase 1's own end-of-phase human checks (per `workflow.human_verify_mode: end-of-phase`), not work assigned to a later phase. They are listed under Human Verification Required.

### Advisory (Not Blocking Phase 1's Goal)

These are real findings from `01-REVIEW.md` / `01-REVIEW-DISPOSITION.md` (all disposition: open) and `WINDOWS.md` id 1. None affect the phase-1 success criteria above; they are carried forward for follow-up.

| # | Finding | Category | Why not a Phase-1 blocker |
|---|---------|----------|---------------------------|
| 1 | `vite` pinned at `8.0.9`; `npm audit` reports 2 high-severity, Windows-specific, dev-server-only advisories fixed only in `vite>=8.3.1` (WR-01 / WINDOWS id 1, open) | security | Dev-server-only risk, not shipped in the production build; the exact pin is mandated by this plan's own acceptance criteria and `.claude/CLAUDE.md`'s stack guidance. Tracked for a future maintenance pass, not a Phase 1 success criterion. |
| 2 | `axe-core`'s `color-contrast` rule cannot run under jsdom (no `canvas` package installed), so it always lands in `results.incomplete`, never `results.violations` — every `toHaveNoViolations()` in this suite passes regardless of actual contrast (WR-02) | testing gap | Phase 1's own plans explicitly flag this jsdom limitation and explicitly defer contrast verification to Phase 4 (A11Y-04). QUAL-03 ("component tests plus automated accessibility (axe) checks") is satisfied — the checks run and report zero violations for what jsdom *can* evaluate. |
| 3 | `README.md` is still the original placeholder ("For testing Claude commands.") (WR-03) | documentation | QUAL-05 (README content) is explicitly a Phase 5 requirement, not Phase 1's. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/engine/types.ts` | Engine contract types | VERIFIED | `Mark`, `Cell`, `Board`, `WinLine`, `Result` present, matches interface exactly. |
| `src/engine/board.ts` | Move validation, game-over enforcement | VERIFIED | `BOARD_SIZE`, `emptyBoard`, `isLegalMove`, `applyMove`, `IllegalMoveError`, `IllegalMoveReason` (`'out-of-range'\|'game-over'\|'occupied'`) all present and match the plan's ordering (out-of-range → game-over → occupied). |
| `src/engine/rules.ts` | `WINNING_LINES`, `evaluate()` | VERIFIED | Exact 8-line order (rows, columns, diagonals); single win-then-draw-then-in-progress function. |
| `src/engine/player.ts` | `currentPlayer` | VERIFIED | Derived from board parity, never stored. |
| `src/game/gameReducer.ts` | `MOVE`/`NEW_ROUND`, `round` counter | VERIFIED | Matches interface; illegal `MOVE` returns identical state object. |
| `src/game/status.ts` | `buildStatusMessage` | VERIFIED | Single builder, exhaustive switch, ASCII apostrophe. |
| `src/game/useGame.ts` | `GameView` controller hook | VERIFIED | `result = evaluate(board)`, two focus effects (D-08/D-10), `newRound`, refs — matches interface exactly. |
| `src/ui/Cell.tsx` | Native button cell | VERIFIED | `aria-disabled` (never `disabled`), `data-winning`, `cellLabel(index, value, isWinning)`, React-19 ref-as-prop. |
| `src/ui/Board.tsx` | Board + strike element | VERIFIED | `role="group"`, no composite ARIA role, `strikeLineId(winningLine)`, `firstCellRef` on index 0 only. |
| `src/ui/StatusRegion.tsx` | The one polite live region | VERIFIED | `id="game-status"`, `role="status"`, `aria-live="polite"`, always mounted. |
| `src/ui/NewRoundButton.tsx` | Always-enabled control | VERIFIED | Never sets `disabled`/`aria-disabled`; `aria-describedby={STATUS_REGION_ID}`. |
| `src/ui/strikeLine.ts` | Orientation-id lookup | VERIFIED | `strikeLineId`, `StrikeLineId`; throws on non-winning line. |
| `src/ui/cellLabel.ts` | Accessible-label builder | VERIFIED | Exact D-04 contract with optional ", winning" suffix. |
| `.github/workflows/ci.yml` | CI on every push | VERIFIED | Named ordered steps, least-privilege permissions, pinned GitHub-owned actions. |
| `README.md` | Project docs | STUB (Phase 5 scope, not Phase 1) | Still the original placeholder; QUAL-05 is Phase 5's requirement — noted under Advisory, not a Phase 1 gap. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/ui/Cell.tsx` | `src/game/useGame.ts` | `onActivate(index)` → Board → `playCell` → `dispatch({type:'MOVE'})` | WIRED | Confirmed by reading `Cell.tsx`'s `onClick` guard, `Board.tsx`'s `onPlay={onPlay}` and `App.tsx`'s wiring to `playCell`. |
| `src/game/gameReducer.ts` | `src/engine/board.ts` / `src/engine/rules.ts` | `evaluate(board)`, `applyMove` | WIRED | `useGame.ts` line `const result = evaluate(board);`; `board.ts` imports and calls `evaluate` in both `isLegalMove` and `applyMove`. |
| `src/game/useGame.ts` | `src/game/status.ts` | `buildStatusMessage(result, turn)` | WIRED | Confirmed in `useGame.ts` line 25. |
| `src/App.tsx` | `src/ui/StatusRegion.tsx` | Always-rendered above Board | WIRED | Confirmed by reading `App.tsx`. |
| `src/ui/Board.tsx` | `src/ui/strikeLine.ts` | `strikeLineId(winningLine)` on the `data-line` span | WIRED | Confirmed in `Board.tsx`. |
| `src/ui/NewRoundButton.tsx` | `src/ui/StatusRegion.tsx` | `aria-describedby={STATUS_REGION_ID}` | WIRED | Confirmed in `NewRoundButton.tsx`. |
| `.github/workflows/ci.yml` | `package.json` | `npm ci` / `npm run <script>` steps | WIRED | Confirmed by reading the workflow file; scripts exist in `package.json`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `Board.tsx` cells | `board` (9-cell array) | `useGame()` → `useReducer(gameReducer, initialGameState)` → real dispatch chain | Yes | FLOWING |
| `StatusRegion` message | `status` | `buildStatusMessage(evaluate(board), currentPlayer(board))` — real engine call, not a static string | Yes | FLOWING |
| Strike `<span data-line>` | `winningLine` | `result.winningLine` from `evaluate(board)` when `status==='win'`, else `null` | Yes | FLOWING |
| Cell `aria-disabled` | `isPlayable` | `isCellPlayable(index)` → `isLegalMove(board, index)` (delegates to `evaluate`) | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite passes | `npx vitest run` | 10 files / 76 tests passed | PASS |
| `lint` exits 0 | `npm run lint` | exit 0, no output | PASS |
| `typecheck` exits 0 | `npm run typecheck` | exit 0, no output | PASS |
| `format:check` exits 0 | `npm run format:check` | "All matched files use Prettier code style!" | PASS |
| `build` exits 0, produces `dist/index.html` | `npm run build` | exit 0, `dist/index.html` + assets written | PASS |
| Axe matcher has teeth (not a silent no-op) | `npx vitest run src/test/axe-canary.test.ts` | 2/2 passed (pass-on-clean + fail-on-image-alt) | PASS |
| Board locks after result (state transition) | `npx vitest run -t "the board locks after a result"` | 1 passed | PASS |
| Illegal MOVE preserves identity (no-op invariant) | `npx vitest run -t "an illegal MOVE returns the same state object"` | 1 passed | PASS |
| New round clears + focuses first cell (state transition) | `npx vitest run -t "New round mid-game clears the board and focuses Row 1, column 1"` | 1 passed | PASS |
| Focus moves to New round after win (state transition) | `npx vitest run -t "focus moves to New round after a win and its description is the result"` | 1 passed | PASS |
| Single live region persists + announces once (ordering invariant) | `npx vitest run -t "announces the result in the same single live region"` | 1 passed | PASS |
| Single live region persists across New round | `npx vitest run -t "the status stays the same single live region across New round"` | 1 passed | PASS |
| Tab order stable, New round always enabled (ordering invariant) | `npx vitest run -t "New round is always enabled and follows the cells in Tab order"` | 1 passed | PASS |
| Row-major labels + one live region | `npx vitest run -t "renders 9 row-major cells with D-04 labels and one polite live region"` | 1 passed | PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` files or PLAN/SUMMARY-declared probe scripts exist for this phase. SKIPPED (no runnable probes declared; behavioral spot-checks above cover the equivalent ground via `vitest`).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|--------------|-------------|--------------|--------|----------|
| GAME-01 | 01-01 | Place mark in empty cell; occupied cells unplayable | SATISFIED | `App.test.tsx`, `board.ts` |
| GAME-02 | 01-01 | Auto-alternating turns, turn always shown | SATISFIED | `App.test.tsx`, `player.ts` |
| GAME-03 | 01-02 | Win detected on any of 8 lines, incl. 9th move | SATISFIED | `engine.test.ts`, `App.gameOver.test.tsx` |
| GAME-04 | 01-02 | Draw when board full with no winner | SATISFIED | `engine.test.ts`, `App.gameOver.test.tsx` |
| GAME-05 | 01-02, 01-03 | Result announced, board locks until new round | SATISFIED | `board.ts` game-over enforcement, `App.gameOver.test.tsx`, `App.newRound.test.tsx` |
| GAME-06 | 01-04 | Winning line visually highlighted, not by color alone | SATISFIED | `strikeLine.ts`, `Board.tsx`/`Cell.tsx`, `Board.test.tsx`, `App.winningLine.test.tsx`; forced-colors/grayscale real-browser confirmation deferred (see Human Verification) |
| GAME-07 | 01-03 | New round clears board, keeps scores (scoring is Phase 3) | SATISFIED | `gameReducer.ts` `NEW_ROUND`, `App.newRound.test.tsx` |
| A11Y-02 | 01-01, 01-04 | Cell screen-reader label with position + contents | SATISFIED | `cellLabel.ts`, `cellLabel.test.ts` |
| A11Y-03 | 01-01, 01-02, 01-03 | Turn/result changes announced via single polite live region | SATISFIED | `StatusRegion.tsx`, MutationObserver tests; real screen-reader pass deferred (see Human Verification) |
| QUAL-01 | 01-02 | Unit tests cover all win lines, draw, win-on-final-move, invalid moves | SATISFIED | `engine.test.ts` (29 tests) |
| QUAL-03 | 01-01, 01-02, 01-03, 01-04 | Component tests + automated axe checks | SATISFIED | axe canary + axe assertions across all App test files; contrast-checking limitation is a known jsdom gap explicitly deferred to Phase 4 (A11Y-04), not a QUAL-03 failure |
| QUAL-04 | 01-01 | CI runs lint, typecheck, tests on every push | SATISFIED (structural); first real green run deferred | `.github/workflows/ci.yml` |

No orphaned requirements: the 12 requirement IDs on ROADMAP.md's Phase 1 row exactly match the union of all four plans' `requirements:` frontmatter, and all 12 are marked `[x]` / "Complete" in `.planning/REQUIREMENTS.md`'s traceability table.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No `TBD`/`FIXME`/`XXX` debt markers found in any phase-1-touched file (`grep -rnE "TBD|FIXME|XXX" src .github README.md` — the only 3 hits were the literal test-fixture string `'XXX OO. ...'` etc. in `engine.test.ts`, not debt markers) | — | none |
| — | — | No `TODO`/`HACK`/`PLACEHOLDER`/"not yet implemented" markers in `src/` | — | none |
| — | — | No `.only(`/`.skip(`/`.todo(` test modifiers in `src/` | — | none |
| — | — | No `dangerouslySetInnerHTML`/`innerHTML` in `src/` | — | none |
| — | — | No network/storage calls (`fetch`, `localStorage`, `document.cookie`, etc.) in `src/`/`index.html` | — | none (offline-only prohibition satisfied) |
| — | — | No `@keyframes`/`animation` in any stylesheet (seizure-safety prohibition satisfied) | — | none |
| `package.json:45` | 45 | `vite@8.0.9` has 2 known high-severity, Windows-specific, dev-server-only `npm audit` advisories (WR-01, open) | ℹ️ Info (advisory, not a Phase 1 blocker — see Advisory section) | Dev-server-only; does not affect the shipped static build or any phase-1 success criterion |
| `src/test/setup.ts` | 1-5 | `axe-core`'s `color-contrast` rule cannot execute under jsdom without the `canvas` package (WR-02, open) | ℹ️ Info (advisory — explicitly deferred to Phase 4 A11Y-04 by this phase's own plans) | QUAL-03 (axe checks run, zero violations for jsdom-evaluable rules) is still satisfied |
| `README.md:1-3` | 1-3 | Placeholder README content (WR-03, open) | ℹ️ Info (advisory — QUAL-05 is Phase 5's requirement) | No Phase 1 requirement references README content |

### Human Verification Required

### 1. First real GitHub Actions run

**Test:** Push the branch to GitHub and open the repository's Actions tab (or run `gh run watch`) for the pushed commit.
**Expected:** The "CI" workflow run is green, and its Install, Lint, Typecheck, Format check, Test and Build steps all succeed.
**Why human:** Needs a real push to GitHub; pushing requires the user's explicit go-ahead per CLAUDE.md. All six gates pass locally and the workflow structure/permissions/action pins were verified directly, but no real Actions run has executed yet (WINDOWS.md id 3, open).

### 2. Real screen-reader pass (NVDA/Narrator)

**Test:** Run `npm run dev`, start NVDA (Windows) or Narrator, and play a full game (to a win or draw) using only Tab and Enter.
**Expected:** Each turn change ("O's turn"/"X's turn") is read once, the result ("X wins!"/"O wins!"/"It's a draw") is read once when the game ends, and the board itself is never read out as a live region.
**Why human:** jsdom cannot run a real screen reader. The single-live-region, single-announcement behavior is proven under jsdom via a MutationObserver-based test (reran individually — passes), but no real assistive-technology pass has been performed (WINDOWS.md id 4, open). Phase 5 owns the formal pass.

### 3. Keyboard-only focus-ring visibility

**Test:** Run `npm run dev`. Using only the keyboard (Tab, Enter, Space), play a game to a win, then press Enter on New round.
**Expected:** A clearly visible focus ring appears on New round when the game ends; after Enter, the ring is on the top-left cell and the status reads "X's turn"; focus is never lost to the page body.
**Why human:** jsdom cannot render or assert CSS focus-ring visibility. The underlying focus-movement logic is proven under jsdom (reran the win→New-round focus test individually — passes), but the visual focus ring has not been confirmed in a real browser (WINDOWS.md id 5, open). Phase 5 owns the formal pass.

### 4. Forced-colors and grayscale visual check

**Test:** Run `npm run dev` in Chrome or Edge. In DevTools → Rendering, emulate "forced-colors: active", and separately "Achromatopsia". Win once on a row, a column, and each diagonal in each mode (New round between games).
**Expected:** In both emulation modes the strike line is clearly visible and runs through the centers of exactly the three winning cells for every orientation; in forced-colors mode the winning cells also show an outline; X and O marks stay legible under the line.
**Why human:** jsdom has no CSS layout or forced-colors/vision-deficiency rendering. The numeric/structural requirements are satisfied by construction (verified directly: `--color-strike: #b3261e` against `#ffffff` computes to ~6.5:1 contrast; `--strike-thickness: 0.375rem` = 6px; `@media (forced-colors: active)` rules present in both `Board.module.css` and `Cell.module.css`), but the real-browser visual confirmation has not been performed (WINDOWS.md id 6, open).

### Gaps Summary

No gaps found. All 12 observable truths derived from ROADMAP.md's Phase 1 Success Criteria (merged with the four plans' `must_haves`) are verified against the actual codebase — independently re-run, not taken on SUMMARY.md's word: `npm test` (76/76), `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` all reran clean, and 8 individually-named behavioral tests covering the phase's state-transition and ordering invariants (board locking, New round clearing, focus choreography, single-live-region persistence, Tab order) were re-run in isolation and passed. Requirements coverage is complete with no orphans. No debt markers, disabled tests, disabled axe rules, or CI escape hatches were found in any phase-1-touched file.

The phase is not `passed` only because four items that this phase's own plans explicitly scoped as end-of-phase human checks (`workflow.human_verify_mode: end-of-phase`) remain open in `.planning/WINDOWS.md` (ids 3, 4, 5, 6): the first real GitHub Actions run, a real screen-reader pass, keyboard-only focus-ring visibility, and forced-colors/grayscale visual confirmation. None of these represent a failed or missing artifact — the underlying logic each depends on is independently proven under jsdom — they are genuinely un-automatable checks that need a human with a browser, a screen reader, or GitHub push access.

Three advisory findings from the code review (`01-REVIEW.md`, all disposition `open`) were considered and found not to block Phase 1's goal: the pinned `vite` dev-server security advisory (dev-server-only, mandated by the plan's own exact-pin requirement), the jsdom `color-contrast` testing gap (explicitly deferred to Phase 4's A11Y-04 by this phase's own plans), and the placeholder README (QUAL-05 is Phase 5's requirement, not Phase 1's).

---

*Verified: 2026-09-27T19:10:20Z*
*Verifier: Claude (gsd-verifier)*
