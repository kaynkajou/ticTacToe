# Phase 1: Two-Player Game - Context

**Gathered:** 2026-09-26
**Status:** Ready for planning

<domain>
## Phase Boundary

The walking skeleton. This phase delivers a complete, correct hot-seat tic-tac-toe game on one device in the browser. It includes:

- a pure TypeScript engine for moves, win/draw detection, and the derived current player
- a React UI with native-button cells, one polite status region, and a New round control
- unit tests, component tests with axe checks, and a GitHub Actions CI workflow (lint, typecheck, tests)

Not in this phase:

- the computer opponent and mode/first-player selection (Phase 2)
- names and the scoreboard (Phase 3)
- the colorful theme and animation (Phase 4)
- the full keyboard and screen-reader verification and the README (Phase 5)

Phase 1 styling stays functional and minimal. Phase 4 re-skins it.

</domain>

<decisions>
## Implementation Decisions

### Carried forward (project-level, already locked; do not re-open)
- Stack: Vite 8 + React 19 + TypeScript 6.0 (not 7) + Vitest 5 + @testing-library/react + user-event + jest-dom + jsdom (not happy-dom) + @chialab/vitest-axe. ESLint 10 flat config with typescript-eslint, jsx-a11y, and react-hooks. Prettier. npm.
- The engine is pure TS over a plain 9-cell board with no DOM or `window` access. React components only render state and dispatch actions. The current player is derived from the board and never stored.
- Outcome evaluation order is win, then draw, then continue. A win on the 9th move counts as a win and must have its own test (Pitfall 1).
- Cells are native `<button>` elements in a CSS grid. No `role="grid"` or any other composite ARIA role.
- There is exactly one `aria-live="polite"` status region. The board itself is never a live region.
- Styling uses CSS Modules and CSS custom properties.

### Winning-line cue & wording
- **D-01:** The non-color cue for a win is a **strike line drawn across the three winning cells**. It must work for all 8 line orientations: 3 rows, 3 columns, and 2 diagonals.
- **D-02:** The strike line must stay visible in OS forced-colors (high-contrast) mode and in grayscale. Claude chooses how (see Discretion).
- **D-03:** Status text in Phase 1 is short: `"X's turn"` / `"O's turn"`, `"X wins!"` / `"O wins!"`, and `"It's a draw"`. Phase 3 will substitute player names. Keep the message-building code in one place so that swap is a one-spot change.
- **D-04:** Cell accessible labels follow the pattern `"Row {r}, column {c}, {X|O|empty}"`, with rows and columns numbered from 1. Winning cells append `", winning"`, e.g. `"Row 1, column 2, X, winning"`.
- **D-05:** Unplayable cells (occupied cells, and every cell once the game is over) use **`aria-disabled="true"` and stay focusable** in the Tab order, so keyboard and screen-reader users can still review the board. Do not use the native `disabled` attribute. Click and Enter/Space on these cells must do nothing, which means the handler guards against the move and the engine rejects it too.

### Game-over & New round flow
- **D-06:** The **New round** button is always visible and always enabled, including mid-game and on an empty board. Its Tab position stays stable. Phase 2's cancel-pending-AI-move logic will build on the mid-game restart.
- **D-07:** The result appears **in the status line above the board**. The same element switches from the turn text to the result text. There is no modal, overlay, or second banner.
- **D-08:** When a game ends (win or draw), **move focus programmatically to the New round button**.
- **D-09:** To keep the result from being lost when focus moves, New round has **`aria-describedby` pointing at the status element**, so focusing it reads e.g. "New round, button, X wins!". The live region still updates exactly once per change. A component test asserts the `aria-describedby` wiring and that focus lands on New round after a win and after a draw. Phase 5's manual screen-reader pass must confirm the result is not announced twice or dropped.
- **D-10:** After New round clears the board, **move focus to the first (top-left) cell**, i.e. Row 1, column 1. The status resets to `"X's turn"`, and X always starts in Phase 1.

### Claude's Discretion
- How the strike line is drawn (SVG overlay, pseudo-element, or rotated element) and how it survives forced-colors mode. Options include `CanvasText`/`Highlight` system colors, `forced-color-adjust`, and an additional outline on winning cells as a fallback. The only hard requirement is that it stays visible in forced-colors and grayscale. Phase 4 may animate it.
- The minimal Phase 1 visual styling: a neutral, clean, readable layout with visible focus rings. It should not attempt the playful theme.
- Tooling specifics that were not discussed: tsconfig strictness flags, the CI Node version (target 24.x), whether Prettier `--check` runs in CI, and whether to use pre-commit hooks. Use sensible, portfolio-appropriate defaults. CI must at minimum run lint, typecheck, and tests on push.
- File/module layout for the engine, components, and tests.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope & requirements
- `.planning/ROADMAP.md` §"Phase 1: Two-Player Game" — goal, success criteria 1–5, and the Build Conventions that apply to every phase
- `.planning/REQUIREMENTS.md` — GAME-01…07, A11Y-02, A11Y-03, QUAL-01, QUAL-03, QUAL-04
- `.planning/PROJECT.md` — core value, constraints, and key decisions

### Stack & architecture
- `.claude/CLAUDE.md` — the locked technology stack, version pins, and the "What NOT to use" list (TS 7, happy-dom, original vitest-axe, CRA, global stores, CSS-in-JS)
- `.planning/research/STACK.md` — stack rationale and version compatibility
- `.planning/research/ARCHITECTURE.md` — the layered pattern (UI → controller → pure engine), with render-only components

### Pitfalls
- `.planning/research/PITFALLS.md` — Pitfall 1 (draw detection order and win on the 9th move), the aria-live calibration pitfall (single scoped polite region, no spam), the color-only-cue pitfall, and keyboard/div-cell pitfalls

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None. This is a greenfield repo containing only `README.md` (placeholder text). Phase 1 scaffolds everything.

### Established Patterns
- None yet. The patterns this phase sets up (engine module shape, component/test layout, CSS Modules usage, and the CI workflow) become the conventions later phases follow, so keep them clean and consistent.

### Integration Points
- The engine API must leave room for Phase 2 (AI reads the board and legal moves, and first-player choice changes who starts) and Phase 3 (names feed the status/result text). This is a reason to keep status-message construction centralized (D-03) and derive the current player rather than hard-coding "X starts" deep in the logic.

</code_context>

<specifics>
## Specific Ideas

- The strike line is the classic tic-tac-toe "cross out the winning three" look. The user chose it over a plain cell outline.
- The end-of-game keyboard flow is: the last move ends the game → focus jumps to New round, which reads the result via `aria-describedby` → Enter → focus lands on the top-left cell, ready to play.

</specifics>

<deferred>
## Deferred Ideas

None. The discussion stayed within the phase scope.

</deferred>

---

*Phase: 01-two-player-game*
*Context gathered: 2026-09-26*
