# Phase 1: Two-Player Game - Research

**Researched:** 2026-09-26
**Domain:** Browser-based two-player tic-tac-toe walking skeleton — pure TS engine, accessible React UI, Vitest/RTL/axe test suite, GitHub Actions CI
**Confidence:** HIGH (architecture, engine logic, accessibility patterns) / MEDIUM (scaffolding specifics, sourced via WebSearch and cross-checked against npm registry and empirical install tests)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Carried forward (project-level, already locked; do not re-open)**
- Stack: Vite 8 + React 19 + TypeScript 6.0 (not 7) + Vitest 5 + @testing-library/react + user-event + jest-dom + jsdom (not happy-dom) + @chialab/vitest-axe. ESLint 10 flat config with typescript-eslint, jsx-a11y, and react-hooks. Prettier. npm.
- The engine is pure TS over a plain 9-cell board with no DOM or `window` access. React components only render state and dispatch actions. The current player is derived from the board and never stored.
- Outcome evaluation order is win, then draw, then continue. A win on the 9th move counts as a win and must have its own test (Pitfall 1).
- Cells are native `<button>` elements in a CSS grid. No `role="grid"` or any other composite ARIA role.
- There is exactly one `aria-live="polite"` status region. The board itself is never a live region.
- Styling uses CSS Modules and CSS custom properties.

**Winning-line cue & wording**
- **D-01:** The non-color cue for a win is a **strike line drawn across the three winning cells**. It must work for all 8 line orientations: 3 rows, 3 columns, and 2 diagonals.
- **D-02:** The strike line must stay visible in OS forced-colors (high-contrast) mode and in grayscale. Claude chooses how (see Discretion).
- **D-03:** Status text in Phase 1 is short: `"X's turn"` / `"O's turn"`, `"X wins!"` / `"O wins!"`, and `"It's a draw"`. Phase 3 will substitute player names. Keep the message-building code in one place so that swap is a one-spot change.
- **D-04:** Cell accessible labels follow the pattern `"Row {r}, column {c}, {X|O|empty}"`, with rows and columns numbered from 1. Winning cells append `", winning"`, e.g. `"Row 1, column 2, X, winning"`.
- **D-05:** Unplayable cells (occupied cells, and every cell once the game is over) use **`aria-disabled="true"` and stay focusable** in the Tab order, so keyboard and screen-reader users can still review the board. Do not use the native `disabled` attribute. Click and Enter/Space on these cells must do nothing, which means the handler guards against the move and the engine rejects it too.

**Game-over & New round flow**
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

### Deferred Ideas (OUT OF SCOPE)
None. The discussion stayed within the phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GAME-01 | Place mark in any empty cell; occupied cells cannot be played | Pure engine `applyMove` rejects occupied cells (Architecture Patterns, Pattern 1); UI handler also guards before dispatch (Common Pitfalls, Pitfall: double-guard) |
| GAME-02 | Players alternate turns automatically; current turn always shown | Current player derived from move count/board (never separate state) — see Architecture Patterns, Standard Stack; status text D-03 |
| GAME-03 | Detect win on any of 8 lines, including a win on the 9th move | `WINNING_LINES` constant + evaluation order win→draw→continue (Common Pitfalls, Pitfall 1); Code Examples |
| GAME-04 | Detect draw when board full with no winner | Same evaluation-order function; explicit 9th-move test required |
| GAME-05 | Result announced; board locks until new round | Single `aria-live="polite"` region (D-07); `gameOver` flag gates all cell handlers |
| GAME-06 | Winning three-in-a-row visually highlighted, not by color alone | Strike-line pattern (D-01/D-02); forced-colors CSS technique (Code Examples) |
| GAME-07 | New round clears board without reload | D-06/D-10; controller reset action, no `window.location.reload` |
| A11Y-02 | Each cell has screen-reader label with position + contents | D-04 label pattern; Code Examples |
| A11Y-03 | Turn changes and results announced via single polite live region | D-07/D-09; persistent-live-region pitfall (Common Pitfalls) |
| QUAL-01 | Unit tests cover game rules (all win lines, draw, win-on-final-move, invalid moves) | Validation Architecture section; engine test matrix |
| QUAL-03 | Component tests + automated axe checks on rendered UI | `@chialab/vitest-axe` setup (Code Examples); Package Legitimacy Audit (vitest-5 peer-dep gap) |
| QUAL-04 | CI (GitHub Actions) runs lint, typecheck, tests on every push | CI workflow (Code Examples); Validation Architecture |
</phase_requirements>

## Summary

Phase 1 is a walking skeleton: everything needed to play a correct, fully-tested, accessible two-player game, plus the scaffolding (Vite/TS/ESLint/CI) every later phase builds on. The technical risk here is not the game logic itself (tic-tac-toe on a 3×3 board is trivial) — it is getting the **scaffolding versions to actually install together** and getting the **accessibility wiring exactly right** (single persistent live region, `aria-disabled` not `disabled`, focus choreography across game-over and new-round).

Two real, currently-unresolved dependency conflicts were found and empirically fixed during this research session (not just theorized): `eslint-plugin-jsx-a11y@6.10.2`'s peer range doesn't include `eslint@10`, and `@chialab/vitest-axe@0.19.2`'s peer range doesn't include `vitest@5` (it predates vitest 5's release by about a week). Both were reproduced with a live `npm install --dry-run` ERESOLVE failure and both were confirmed fixed with a `package.json` `overrides` block, also verified with a live dry-run install. This is the single most load-bearing finding in this document — without it, Wave 0 scaffolding will fail on the very first `npm install`.

The architecture is the classic React tic-tac-toe shape (already documented in `.planning/research/ARCHITECTURE.md`): a pure `engine/` module with zero DOM references, a thin controller (React state/reducer), and a render-only UI layer. Phase 1 builds only the engine + UI + tests + CI slice of that architecture; AI and persistence layers are Phase 2/3 concerns and are out of scope here except that the engine's API shape should not preclude them (e.g., derive current player, keep board immutable).

**Primary recommendation:** Scaffold with `npm create vite@latest . -- --template react-ts`, immediately delete the generated `_oxlintrc.json` (the template now ships Oxlint, not ESLint) and replace it with a hand-written ESLint 10 flat config, add the two `overrides` entries to `package.json` before the first real `npm install`, and build the engine module and its full unit-test matrix before writing any React component.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Board state, move legality, win/draw detection | Browser / Client (pure TS module, no framework) | — | No backend exists (local-only per PROJECT.md); logic runs entirely client-side and must be framework-agnostic per the locked architecture (`ARCHITECTURE.md`) |
| Turn/result rendering, cell buttons, status region | Browser / Client (React UI layer) | — | Single-page app, no SSR in scope; React renders board/status purely from engine output |
| Test execution (unit + component + axe) | Build tooling (Vitest, jsdom) | — | Runs in Node via jsdom, not a real browser; no e2e browser tier in this phase (Playwright is Phase 5/stretch, out of scope here) |
| CI (lint/typecheck/test gate) | CI/CD (GitHub Actions) | — | Runs on push, outside the app runtime entirely |
| Persistence | N/A this phase | — | Explicitly deferred to Phase 3; Phase 1 has no `localStorage` reads/writes at all |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 8.0.9 | Dev server + build | `[VERIFIED: npm registry]` `npm view vite version` → `8.3.1` is current latest; `8.0.9` (CLAUDE.md pin) still resolves and installs cleanly alongside the rest of the locked stack in this session's dry-run install. Locked by project CLAUDE.md. |
| React / react-dom | 19.3.0 | UI layer | `[VERIFIED: npm registry]` `npm view react version` → `19.3.0` (current latest, matches pin exactly). |
| TypeScript | 6.0.3 (not 7.x) | Static typing | `[VERIFIED: npm registry]` `npm view typescript@6 version` → latest 6.x is `6.0.3`. Registry also shows `7.1.1` and `7.1.0-dev.*` releases exist — confirms CLAUDE.md's "TS7 exists but avoid it" framing is current, not stale. |
| @vitejs/plugin-react | 6.1.1 | Vite↔React integration | `[VERIFIED: npm registry]` latest is `6.1.1` (CLAUDE.md said "6.x", consistent). Peer-requires `vite: ^8.0.0` — matches. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 5.0.2 | Test runner | `[VERIFIED: npm registry]` latest `5.0.2`, released 2026-09-25 (one day before this research date) — very fresh major. |
| @testing-library/react | 16.3.3 | Component testing | `[VERIFIED: npm registry]` latest `16.3.3`; peer declares `react: ^18\|\|^19` — compatible. |
| @testing-library/jest-dom | 7.0.1 | Custom matchers | `[VERIFIED: npm registry]` latest is `7.0.1`, **not** the `10.x` CLAUDE.md guessed — see Assumptions Log A1. Must import `@testing-library/jest-dom/vitest` (the Vitest-flavored subpath export), not the bare package import, in the setup file `[CITED: testing-library/jest-dom GitHub + npm package docs]`. |
| @testing-library/user-event | 14.6.7 | Realistic interaction sim | `[VERIFIED: npm registry]` latest `14.6.7`, matches CLAUDE.md's "14.x" claim. |
| jsdom | 30.1.1 | Vitest DOM environment | `[VERIFIED: npm registry]` latest `30.1.1`. Vitest's peerDependencies list `jsdom: '*'` (no version constraint) — no pin conflict. |
| @chialab/vitest-axe | 0.19.2 | A11y test matcher | `[VERIFIED: npm registry]` latest `0.19.2`, published 2026-08-26 — **before** vitest 5.0.0 existed (released 2026-09-03). Its declared peer is `vitest: ^3.0.0 \|\| ^4.0.0`, which does **not** include vitest 5. See Package Legitimacy Audit and Common Pitfalls for the fix. |
| typescript-eslint | 8.70.1 | TS-aware linting | `[VERIFIED: npm registry]` latest `8.70.1`; peer declares `eslint: ^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` — natively supports ESLint 10, no override needed. |
| eslint-plugin-jsx-a11y | 6.10.2 | Static JSX a11y lint | `[VERIFIED: npm registry]` latest `6.10.2`; peer declares `eslint: ^3-^9` only — **does not** include ESLint 10. Confirmed by a live `npm install --dry-run` ERESOLVE failure in this session (see Common Pitfalls). Requires a `package.json` `overrides` entry. |
| eslint-plugin-react-hooks | 7.1.1 | Hooks linting | `[VERIFIED: npm registry]` latest `7.1.1` — **not** the "6.x" CLAUDE.md guessed (see Assumptions Log A2). Peer declares `eslint: ^3-^10` — natively supports ESLint 10, no override needed. |
| eslint-plugin-react-refresh | 0.5.7 | Fast-Refresh lint rule (ships in the create-vite react-ts template) | `[VERIFIED: npm registry]` latest `0.5.7`; peer declares `eslint: ^9 \|\| ^10` — compatible. Not in original CLAUDE.md list but present in the current scaffold template; keep it since the template already wires it in. |

### Alternatives Considered
See `.planning/research/STACK.md` §"Alternatives Considered" and §"What NOT to Use" — unchanged for this phase; CONTEXT.md does not reopen any of these. No new alternatives were evaluated in this phase-specific pass.

**Installation:**
```bash
npm create vite@latest . -- --template react-ts
npm install react@19.3.0 react-dom@19.3.0
npm install -D vite@8.0.9 @vitejs/plugin-react@6.1.1 typescript@6.0.3 @types/react@19.3.0 @types/react-dom@19.3.0 @types/node@26.6.3
npm install -D vitest@5.0.2 jsdom@30.1.1 @testing-library/react@16.3.3 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.7 @chialab/vitest-axe@0.19.2
npm install -D eslint@10.11.0 typescript-eslint@8.70.1 eslint-plugin-jsx-a11y@6.10.2 eslint-plugin-react-hooks@7.1.1 eslint-plugin-react-refresh@0.5.7 eslint-config-prettier@10.1.8 prettier@3.9.9
```

**Required `package.json` addition (see Common Pitfalls for why):**
```json
{
  "overrides": {
    "eslint-plugin-jsx-a11y": { "eslint": "10.11.0" },
    "@chialab/vitest-axe": { "vitest": "5.0.2" }
  }
}
```
`[VERIFIED: empirical npm install --dry-run in this session]` — both conflicts reproduced (ERESOLVE) without overrides, then confirmed installing cleanly (346 packages, 0 errors) with them.

**Version verification:** All versions above were checked with `npm view <package> version` and `npm view <package> peerDependencies` against the live npm registry on 2026-09-26 (this session), not carried over unverified from the prior STACK.md research pass.

## Package Legitimacy Audit

| Package | Registry | Age (latest publish) | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|----------------------|---------------|--------------|---------|-------------|
| vite | npm | 2 days | 205M | github.com/vitejs/vite | SUS (`too-new`) | Approved — the "too-new" signal fires on latest-version publish recency, not package age; 205M weekly downloads and an official vitejs org repo make this an unambiguous heuristic false-positive. No checkpoint needed in practice, but per protocol the planner should still note it. |
| react / react-dom | npm | ~2-3 weeks | ~200M each | github.com/react/react | SUS (`too-new`) | Approved — same false-positive pattern; official React org repo, 200M+/wk downloads. |
| @vitejs/plugin-react | npm | ~1 month | 105M | github.com/vitejs/vite-plugin-react | SUS (`too-new`) | Approved — same pattern. |
| vitest | npm | 1 day | 119M | github.com/vitest-dev/vitest | SUS (`too-new`) | Approved — same pattern; note vitest 5 is a very fresh major (released 2026-09-03), which is exactly why the vitest-axe peer-dep gap below exists. |
| @testing-library/user-event | npm | ~3 weeks | 61M | github.com/testing-library/user-event | SUS (`too-new`) | Approved — same pattern. |
| jsdom | npm | 4 days | 117M | github.com/jsdom/jsdom | SUS (`too-new`) | Approved — same pattern. |
| typescript-eslint | npm | 5 days | 101M | github.com/typescript-eslint/typescript-eslint | SUS (`too-new`) | Approved — same pattern. |
| eslint | npm | ~1 week | 185M | github.com/eslint/eslint | SUS (`too-new`) | Approved — same pattern. |
| eslint-plugin-react-refresh | npm | ~2 weeks | 44M | github.com/ArnaudBarre/eslint-plugin-react-refresh | SUS (`too-new`) | Approved — smaller maintainer (solo, ArnaudBarre) but very high downloads (bundled by create-vite itself) and matches the actual create-vite scaffold dependency. |
| prettier | npm | 3 days | 154M | github.com/prettier/prettier | SUS (`too-new`) | Approved — same pattern. |
| @playwright/test | npm | ~3 weeks | 71M | github.com/microsoft/playwright | SUS (`too-new`) | Not installed this phase (Phase 5/stretch only) — no action needed now. |
| typescript | npm | ~3 months | 329M | github.com/microsoft/TypeScript | OK | Approved. |
| @testing-library/react | npm | 1 month | 69M | github.com/testing-library/react-testing-library | OK | Approved. |
| @testing-library/jest-dom | npm | ~7 weeks | 74M | github.com/testing-library/jest-dom | OK | Approved. |
| @chialab/vitest-axe | npm | 1 month | 4.3K | github.com/chialab/rna | OK (legitimacy) / **compatibility gap** | Approved for legitimacy, but flagged separately in Common Pitfalls: peer dep does not yet cover vitest 5. Not a slop/sus signal — a real, small, actively-maintained fork with a low but non-zero download count consistent with a niche a11y-testing tool. |
| eslint-plugin-jsx-a11y | npm | ~2 years | 55M | github.com/jsx-eslint/eslint-plugin-jsx-a11y | OK (legitimacy) / **compatibility gap** | Approved for legitimacy (mature, huge downloads), but peer dep does not cover ESLint 10 — see Common Pitfalls for the required `overrides` fix. |
| eslint-plugin-react-hooks | npm | ~5 months | 113M | github.com/facebook/react | OK | Approved; also corrects CLAUDE.md's stale "6.x" version claim — actual latest is 7.1.1. |
| eslint-config-prettier | npm | ~1 year | 72M | github.com/prettier/eslint-config-prettier | OK | Approved. |
| @axe-core/playwright | npm | ~7 weeks | 12M | github.com/dequelabs/axe-core-npm | OK | Not installed this phase — no action needed now. |

**Packages removed due to `[SLOP]` verdict:** none.

**Packages flagged as suspicious `[SUS]`:** All the "too-new" verdicts above are the `package-legitimacy check` heuristic firing on *recency of the latest published version*, not on the package being new/unknown — every flagged package has an official, matching source repo and tens-to-hundreds of millions of weekly downloads (the entire mainstream Vite/React/Vitest/ESLint/Prettier toolchain releases very frequently). No install-time `checkpoint:human-verify` is warranted for these specific packages based on the corroborating signals gathered, but the planner may still insert a lightweight checkpoint on first `npm install` per protocol if it wants an extra confirmation gate before the (larger, separate) compatibility-override work below.

**Real, actionable compatibility gaps found in this session (distinct from the SLOP/SUS legitimacy check):**
1. `eslint-plugin-jsx-a11y@6.10.2` peer dep `eslint: ^3-^9` excludes ESLint 10 — reproduced with a live ERESOLVE failure.
2. `@chialab/vitest-axe@0.19.2` peer dep `vitest: ^3||^4` excludes Vitest 5 — same category of gap, not yet reproduced as an actual runtime failure (only as an install-time peer-dep declaration), fixed the same way.

Both are fixed with the `overrides` block shown in Standard Stack → Installation, verified via `npm install --dry-run` in this session (346 packages resolved, 0 errors).

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────── UI LAYER (React, render-only) ───────────────────────────────┐
│                                                                                                │
│   [Board]                                        [StatusRegion]         [NewRoundButton]      │
│   9x <Cell> native <button>                       aria-live="polite"    aria-describedby=      │
│   aria-disabled (not disabled)                    always mounted        StatusRegion id        │
│   onClick / onKeyDown → dispatch(MOVE, i)         text swaps in place   always enabled          │
│        │                                                 ▲                     ▲               │
└────────┼─────────────────────────────────────────────────┼─────────────────────┼───────────────┘
         │ dispatch(MOVE) / dispatch(NEW_ROUND)             │ status text          │ focus() called
         ▼                                                  │                     │ imperatively
┌──────────────────────────── CONTROLLER (useReducer in a single component) ───────────────────┐
│  reducer(state, action):                                                                       │
│   MOVE      → engine.applyMove(board, i, currentPlayer(board))                                 │
│             → engine.evaluate(board)  // win → draw → continue, in that order                  │
│             → if win: winningLine = [...]; if game over: schedule focus→NewRound (useEffect)   │
│   NEW_ROUND → board = emptyBoard(); schedule focus→first cell (useEffect)                      │
└───────────────────────────────────────┬────────────────────────────────────────────────────────┘
                                         │ calls (pure functions, no side effects)
                                         ▼
┌──────────────────────────── ENGINE (pure TS, zero DOM/window refs) ───────────────────────────┐
│  board.ts:   emptyBoard(), applyMove(board,i,mark) → new Board (throws/returns null on illegal) │
│  rules.ts:   WINNING_LINES (8 lines), evaluate(board) → {status:'win'|'draw'|'in-progress',     │
│              winner?, winningLine?}   — checks win BEFORE draw, every time                      │
│  player.ts:  currentPlayer(board) → 'X' | 'O'  (derived from mark count, never stored)          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```
Trace the primary use case: click a cell → UI dispatches MOVE → controller calls `applyMove` then `evaluate` → engine returns win/draw/continue → controller updates state and (if game over) schedules a focus move → UI re-renders board + status text + moves focus, all from the single reducer state, with the live region announcing exactly once per change.

### Recommended Project Structure
```
src/
├── engine/
│   ├── board.ts          # Board type, emptyBoard, applyMove (immutable, throws on illegal move)
│   ├── rules.ts          # WINNING_LINES, evaluate() — win, then draw, then continue
│   ├── player.ts         # currentPlayer(board) derived from mark count
│   └── engine.test.ts    # all 8 win lines, draw, win-on-9th-move, occupied-cell rejection
├── ui/
│   ├── Board.tsx          # renders 9 Cell buttons in a CSS grid
│   ├── Board.module.css
│   ├── Cell.tsx           # single <button>, aria-disabled, aria-label per D-04
│   ├── StatusRegion.tsx   # the one aria-live="polite" element, id referenced by NewRound
│   ├── NewRoundButton.tsx # aria-describedby={statusId}, always enabled
│   └── *.test.tsx         # RTL render + user-event + vitest-axe per component
├── game/
│   └── useGame.ts         # useReducer wiring UI to engine; owns focus-management useEffects
├── App.tsx
└── main.tsx
```

### Pattern 1: Pure Engine, Evaluation Order Win → Draw → Continue
**What:** One `evaluate(board)` function checks all 8 `WINNING_LINES` first; only if none match does it check `board.every(cell => cell !== null)` for a draw.
**When to use:** Every call site — human moves and (in Phase 2) AI moves must share this exact function so there is one source of truth for "is this game over."
**Example:**
```typescript
// src/engine/rules.ts
export type Mark = 'X' | 'O';
export type Cell = Mark | null;
export type Board = readonly Cell[]; // length 9

export const WINNING_LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],           // diagonals
];

export type Result =
  | { status: 'in-progress' }
  | { status: 'win'; winner: Mark; winningLine: readonly [number, number, number] }
  | { status: 'draw' };

export function evaluate(board: Board): Result {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { status: 'win', winner: board[a] as Mark, winningLine: line };
    }
  }
  if (board.every((cell) => cell !== null)) {
    return { status: 'draw' };
  }
  return { status: 'in-progress' };
}
```
This is the exact shape needed to satisfy GAME-03/GAME-04 and the win-on-9th-move requirement: the win check runs over the *post-move* board before the draw check ever runs, so a full board that also completes a line reports `'win'`, never `'draw'`.

### Pattern 2: Derived Current Player, No Separate Turn State
**What:** `currentPlayer(board) = board.filter(c => c !== null).length % 2 === 0 ? 'X' : 'O'`.
**When to use:** Always — per CONTEXT.md's locked decision and Pitfall (Technical Debt Patterns) in `.planning/research/PITFALLS.md`, tracking turn as separate state risks drift, especially once Phase 2 adds AI-move timing.

### Pattern 3: Persistent, Single `aria-live="polite"` Status Region
**What:** One element, always mounted (never conditionally rendered), whose text content is swapped by the controller. It has a stable `id` so `NewRoundButton` can reference it via `aria-describedby`.
**When to use:** For every status/result announcement in this phase — D-07, D-09, A11Y-03.
**Example:**
```tsx
// src/ui/StatusRegion.tsx
export const STATUS_REGION_ID = 'game-status';

export function StatusRegion({ message }: { message: string }) {
  return (
    <p id={STATUS_REGION_ID} aria-live="polite" role="status">
      {message}
    </p>
  );
}
```
```tsx
// src/ui/NewRoundButton.tsx
import { STATUS_REGION_ID } from './StatusRegion';

export function NewRoundButton({ onClick, buttonRef }: { onClick: () => void; buttonRef: React.RefObject<HTMLButtonElement> }) {
  return (
    <button ref={buttonRef} type="button" aria-describedby={STATUS_REGION_ID} onClick={onClick}>
      New round
    </button>
  );
}
```
`[CITED: MDN — ARIA live regions guide; multiple corroborating sources found this session]` — the region must never be conditionally unmounted or React-recreated, or assistive tech loses the "this is a live region I'm watching" registration and silently drops announcements.

### Pattern 4: `aria-disabled`, Not `disabled`, for Unplayable Cells
**What:** Occupied cells and all cells once the game is over get `aria-disabled="true"` and stay in the Tab order; the click/keydown handler and the engine both independently refuse the move.
**Example:**
```tsx
// src/ui/Cell.tsx
function Cell({ value, row, col, isWinning, isPlayable, onActivate }: CellProps) {
  const label = `Row ${row}, column ${col}, ${value ?? 'empty'}${isWinning ? ', winning' : ''}`;
  return (
    <button
      type="button"
      className={styles.cell}
      aria-disabled={!isPlayable}
      aria-label={label}
      data-winning={isWinning || undefined}
      onClick={() => { if (isPlayable) onActivate(); }}
      // Enter/Space activate native <button> for free; no manual key handler needed
    >
      {value}
    </button>
  );
}
```
`[CITED: MDN — ARIA: aria-disabled attribute]` — "Use `aria-disabled` if the control should still be focusable... developers must manually ensure such elements have their functionality suppressed" — confirms D-05 is exactly the standard pattern, not a custom invention.

### Pattern 5: Focus Choreography via `useEffect` Keyed on Game-Over / Reset
**What:** Two refs (`newRoundRef`, `firstCellRef`) and two `useEffect`s: one fires when `result.status !== 'in-progress'` becomes true (focus New Round), one fires when the board is reset to empty (focus cell 0).
**Example:**
```tsx
useEffect(() => {
  if (result.status !== 'in-progress') {
    newRoundRef.current?.focus();
  }
}, [result.status]);

useEffect(() => {
  if (board.every((c) => c === null) && wasJustReset) {
    firstCellRef.current?.focus();
  }
}, [board, wasJustReset]);
```
`[CITED: multiple corroborating sources — React focus-management writeups found this session]` — ref + `useEffect` keyed on the relevant state transition is the standard React pattern for programmatic focus after a state-driven render.

### Anti-Patterns to Avoid
- **`role="grid"` on the board:** Composite ARIA widget roles require full roving-tabindex/arrow-key keyboard behavior; adding the role without that behavior is worse than no role. CONTEXT.md already locks this out — do not add it even as a "nice to have."
- **Conditionally rendering the status region** (e.g., `{message && <p aria-live="polite">{message}</p>}`): breaks the persistent-DOM-node requirement above; always render the element, vary only its text.
- **Native `disabled` on cells:** removes them from the Tab order entirely, breaking the "screen reader users can review the whole board" requirement in D-05.
- **Checking draw before win, or as an unconditional `isBoardFull()` with no reference to win state:** the single highest-risk logic bug for this phase — see Common Pitfalls, Pitfall 1.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rendering assertions that match what a screen reader would see | Custom DOM-querying test helpers | `@testing-library/react` queries by role/label | Directly tests the accessibility contract, not implementation detail |
| Automated accessibility violation detection | Manual ARIA/contrast checklist scripts | `@chialab/vitest-axe` + `toHaveNoViolations()` | Runs real axe-core rules against rendered output; turns a manual review into a CI-enforced assertion |
| Keyboard/mouse interaction simulation in tests | Manually dispatching synthetic `KeyboardEvent`/`MouseEvent` | `@testing-library/user-event` | Fires the same realistic event sequences a browser would, which matters for verifying Enter/Space activates cells |
| ESLint + TypeScript + JSX a11y rule wiring | A hand-rolled custom rule set | `typescript-eslint` + `eslint-plugin-jsx-a11y` + `eslint-plugin-react-hooks` flat-config presets | Mature, widely-adopted rule sets catch classes of bugs (missing labels, hook dependency issues) before a test even runs |

**Key insight:** For a 3×3 board, the actual game logic is small enough that hand-rolling is not the risk — the risk is hand-rolling the *scaffolding* (a custom eslint config from scratch instead of the plugins' flat-config presets, a bespoke a11y-testing shim instead of vitest-axe, manual keyboard handlers instead of native `<button>`). Every one of those hand-rolled alternatives has a well-trodden, already-verified library replacement.

## Common Pitfalls

### Pitfall 1: `eslint-plugin-jsx-a11y` cannot install alongside ESLint 10 without an override
**What goes wrong:** Running `npm install` with `eslint@10.11.0` and `eslint-plugin-jsx-a11y@6.10.2` both in `package.json` fails immediately with `ERESOLVE unable to resolve dependency tree`.
**Why it happens:** `eslint-plugin-jsx-a11y@6.10.2`'s `peerDependencies.eslint` is `"^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9"` — it does not declare ESLint 10 support (confirmed via `npm view eslint-plugin-jsx-a11y peerDependencies` and reproduced live).
**How to avoid:** Add to `package.json`:
```json
"overrides": { "eslint-plugin-jsx-a11y": { "eslint": "10.11.0" } }
```
Verified this session: without the override, `npm install --dry-run` fails with:
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer eslint@"^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9" from eslint-plugin-jsx-a11y@6.10.2
```
With the override added, the same command resolves 224+ packages with zero errors.
**Warning signs:** Wave 0 scaffolding task fails on its very first `npm install` with an ERESOLVE error naming `eslint-plugin-jsx-a11y`.

### Pitfall 2: `@chialab/vitest-axe`'s peer range doesn't cover Vitest 5 yet
**What goes wrong:** Same ERESOLVE class of failure — `@chialab/vitest-axe@0.19.2` declares `peerDependencies.vitest: "^3.0.0 || ^4.0.0"`.
**Why it happens:** Vitest 5.0.0 was published 2026-09-03; `@chialab/vitest-axe@0.19.2` was published 2026-08-26, a week earlier — the peer range is simply not caught up yet as of this research date (2026-09-26).
**How to avoid:** Same technique, add to the `overrides` block:
```json
"overrides": { "@chialab/vitest-axe": { "vitest": "5.0.2" } }
```
Verified this session: the combined `overrides` block (both entries) produces a clean 346-package dry-run install covering the entire locked stack (React 19, Vite 8, TS 6, Vitest 5, RTL 16, jest-dom 7, user-event 14, jsdom 30, vitest-axe 0.19, ESLint 10, typescript-eslint 8, jsx-a11y 6, react-hooks 7, react-refresh 0.5, eslint-config-prettier 10, Prettier 3.9).
**Warning signs:** ERESOLVE error naming `@chialab/vitest-axe` and `vitest`. Also worth a smoke test once installed: run one `toHaveNoViolations()` assertion early (Wave 0) to confirm the override doesn't just silence npm but also produces a working runtime — a peer-dep override forces npm to install the version anyway, but does not by itself prove the two packages behave correctly together at runtime. Recommend the planner add a `checkpoint:human-verify` (or at minimum an early CI-green check) immediately after this specific matcher is first used, precisely because this pairing is unverified beyond "it installs."

### Pitfall 3: create-vite's `react-ts` template now ships Oxlint, not ESLint
**What goes wrong:** Scaffolding with `npm create vite@latest . -- --template react-ts` produces a `_oxlintrc.json` and no ESLint config at all — a plan step that says "run `npm run lint`" against a freshly scaffolded repo will invoke Oxlint (or nothing), not the project's locked ESLint 10 flat-config setup.
**Why it happens:** `[CITED: github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts]` — the current template description is "a minimal setup to get React working in Vite with HMR and some Oxlint rules."
**How to avoid:** Treat the ESLint flat config (`eslint.config.mjs`) as something Wave 0 must author from scratch (using the plugins' documented flat-config helpers — `tseslint.config(...)`, `jsxA11y.flatConfigs.recommended`, `reactHooks` flat preset), and explicitly delete/ignore the generated `_oxlintrc.json` so there's no ambiguity about which linter is authoritative.
**Warning signs:** `npm run lint` either doesn't exist yet or invokes an unfamiliar Oxlint binary instead of ESLint.

### Pitfall 4: Draw checked before win, or the win-on-9th-move case untested
**What goes wrong:** A board that fills up on the same move that completes a line gets reported as a draw instead of a win.
**Why it happens:** Draw logic ("is the board full?") is easy to treat as independent of win logic rather than as a fallback checked only *after* win detection.
**How to avoid:** Use the single `evaluate()` function shown in Pattern 1 — it structurally cannot check draw before win. Write an explicit unit test with a board that is simultaneously full and winning.
**Warning signs:** No test named something like `win on final move` / `9th move` exists in the engine test file.

### Pitfall 5: Live region unmounted/remounted instead of updated in place
**What goes wrong:** Turn changes or results are silently never announced to screen readers, even though the visible text updates correctly.
**Why it happens:** `{message && <p aria-live="polite">{message}</p>}` (or swapping between two different result/turn components) destroys and recreates the DOM node; screen readers only track nodes that were already present and already marked live when they first appeared.
**How to avoid:** Render `StatusRegion` unconditionally at the top level for the entire lifetime of the game (see Pattern 3); only its text child changes.
**Warning signs:** Manual screen-reader spot check (even before Phase 5's formal pass) shows the visible status line updating but nothing being read aloud on turn changes.

## Code Examples

### ESLint 10 flat config skeleton
```javascript
// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
  prettierConfig,
);
```
`[CITED: WebSearch-sourced ESLint 10 migration writeups, cross-checked against jsx-a11y's own documented `flatConfigs.recommended` export name]` — exact plugin option names should be double-checked against each package's own README at implementation time; this skeleton establishes the composition order (base → TS → a11y → hooks → refresh → prettier-disables-conflicts last).

### Vitest + jsdom + jest-dom + vitest-axe setup
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import matchers from '@chialab/vitest-axe';
import { expect } from 'vitest';

expect.extend(matchers);
```
```json
// tsconfig.app.json (add to compilerOptions.types)
{ "compilerOptions": { "types": ["vitest/globals", "@testing-library/jest-dom", "@chialab/vitest-axe/matchers"] } }
```
`[CITED: testing-library/jest-dom package docs (7.x exports "./vitest" subpath) + chialab/rna vitest-axe guide, both found via WebSearch this session]`

### GitHub Actions CI workflow
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
```
`[ASSUMED]` — `actions/checkout@v4` / `actions/setup-node@v4` action major versions were not re-verified against the GitHub Marketplace this session; they are current widely-used majors as of training knowledge. Low risk: GitHub Actions auto-resolves tags within a major version, and a stale major would fail loudly in the very first CI run, which the phase's own success criteria (a green Actions run) will catch immediately.

### Forced-colors-safe strike line (CSS)
```css
/* Cell.module.css */
.cell[data-winning] {
  position: relative;
}
.cell[data-winning]::after {
  content: '';
  position: absolute;
  inset: 0;
  /* SVG or gradient drawing the line orientation-specific strike;
     rotation/orientation chosen per-cell via a data attribute or CSS custom property */
  background: var(--strike-color, red);
}

@media (forced-colors: active) {
  .cell[data-winning]::after {
    background: Highlight; /* system color keyword: survives forced-colors overrides */
    forced-color-adjust: none;
  }
}
```
`[CITED: MDN — forced-color-adjust CSS property; blogs.windows.com Microsoft Edge Dev Blog — Styling for Windows high contrast with forced colors]` — the core technique (explicit `@media (forced-colors: active)` block using a system color keyword, combined with `forced-color-adjust: none` to opt the decorative element out of the default stripping) is corroborated by both sources.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| create-vite react-ts template ships ESLint config | create-vite react-ts template ships Oxlint (`_oxlintrc.json`) | Sometime before 2026-09-26 (current template state, verified this session) | Wave 0 must author the ESLint 10 flat config from scratch rather than adapting a generated one |
| `@testing-library/jest-dom` bare import works for both Jest and Vitest | `@testing-library/jest-dom/vitest` subpath is the documented Vitest entry point (7.x) | jest-dom 7.x | Setup file must use the `/vitest` subpath import, not the bare package import |
| ESLint 9 | ESLint 10 (v9 reached end-of-life 2026-08-06) | 2026-08-06 EOL / ESLint 10 current | Confirmed still current as of this session; no further action beyond the jsx-a11y peer-dep fix |

**Deprecated/outdated:** TypeScript 7.0.x exists on the registry (confirmed `7.1.1` and nightly `7.1.0-dev.*` builds present) but is explicitly excluded by CLAUDE.md due to the missing programmatic compiler API — this exclusion is confirmed still accurate this session (no evidence 7.1 has shipped the API yet was checked, so treat this as unchanged from STACK.md's prior finding, not re-verified).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CLAUDE.md's guess of "@testing-library/jest-dom latest (10.x)" was stale; actual latest is 7.0.1 | Standard Stack | Low — installation command above uses the verified `7.0.1`; if the planner instead copies CLAUDE.md's "10.x" literally, `npm install` will fail to resolve a nonexistent version and fail loudly at Wave 0 |
| A2 | CLAUDE.md's guess of "eslint-plugin-react-hooks latest (6.x)" was stale; actual latest is 7.1.1 | Standard Stack | Low — same as A1, fails loudly rather than silently if copied verbatim |
| A3 | GitHub Actions `actions/checkout@v4` / `actions/setup-node@v4` are still the current recommended majors | Code Examples (CI workflow) | Low — CI would fail visibly on the first push if a major were retired, and QUAL-04's success criterion (a green Actions run) is exactly the check that catches this |
| A4 | TypeScript 7.1's compiler-API gap (blocking `typescript-eslint`) is still unresolved as of this research date | State of the Art | Low for this phase (6.0.3 is pinned and installs cleanly) — only matters if a future phase considers upgrading to TS 7 |
| A5 | `@chialab/vitest-axe` functions correctly at runtime with Vitest 5 beyond just installing (peer-dep override only proves npm will place the packages, not that the matcher behaves correctly) | Common Pitfalls, Pitfall 2 | Medium — if the pairing has an actual runtime incompatibility (not just an unpublished peer range), the first `toHaveNoViolations()` test could fail or silently produce false negatives; recommend an early Wave 0 smoke test specifically for this |

**If this table is empty:** N/A — see entries above; all are low-to-medium risk and each is self-revealing (a failed install, a failed CI run, or a failing/misbehaving first axe test) rather than a silent correctness gap.

## Open Questions

1. **Does `@chialab/vitest-axe` produce correct results against Vitest 5's jsdom integration, beyond just installing?**
   - What we know: peer-dep override makes `npm install` succeed; the underlying `axe-core` dependency itself is version-pinned at `^4.0.0` and installs fine independent of the vitest-axe wrapper.
   - What's unclear: whether the wrapper's internal Vitest API usage (e.g., `expect.extend` typing, matcher context) has any Vitest-5-specific breakage not caught by a peer-dep check.
   - Recommendation: Wave 0 should include one trivial `toHaveNoViolations()` test on a minimal rendered element as an early canary, before building out the full component test suite on top of it.

2. **Exact flat-config export names/shapes for `eslint-plugin-jsx-a11y` and `eslint-plugin-react-hooks` at their currently-installed versions (6.10.2 / 7.1.1).**
   - What we know: `jsxA11y.flatConfigs.recommended` and `reactHooks.configs['recommended-latest']` are the documented shapes as of the versions found in web search results this session.
   - What's unclear: these were not confirmed by reading each package's actual shipped `dist`/README at the exact pinned version (no Context7/docs MCP was available this session, all sourced via WebSearch on the general topic).
   - Recommendation: the planner/executor should treat the ESLint config skeleton in Code Examples as a structural starting point and verify the exact export name against `node_modules/eslint-plugin-jsx-a11y/README.md` (or its TS types) once actually installed, adjusting names if the installed version differs from what web search described.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Toolchain runtime | ✓ | v24.21.0 | — |
| npm | Package manager | ✓ | 11.19.0 | — |
| git | Version control / CI | ✓ | 2.51.0.windows.1 | — |

**Missing dependencies with no fallback:** none — this phase has no external service dependencies (local-only, no backend, no browser automation required for Phase 1's own test suite).

**Missing dependencies with fallback:** none applicable.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 5.0.2 (with jsdom 30.1.1 environment) |
| Config file | `vitest.config.ts` (merged with `@vitejs/plugin-react`) — none exists yet, created in Wave 0 |
| Quick run command | `npm test -- --run <path-to-file>` (single-file, fast feedback) |
| Full suite command | `npm test` (aliased to `vitest run`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GAME-01 | Occupied cell move rejected | unit | `npx vitest run src/engine/engine.test.ts -t "occupied"` | ❌ Wave 0 |
| GAME-02 | Current player alternates, derived not stored | unit | `npx vitest run src/engine/engine.test.ts -t "current player"` | ❌ Wave 0 |
| GAME-03 | All 8 win lines detected; win on 9th move | unit | `npx vitest run src/engine/engine.test.ts -t "win"` | ❌ Wave 0 |
| GAME-04 | Full board, no line → draw | unit | `npx vitest run src/engine/engine.test.ts -t "draw"` | ❌ Wave 0 |
| GAME-05 | Board locks after game over | component | `npx vitest run src/ui/Board.test.tsx -t "locks"` | ❌ Wave 0 |
| GAME-06 | Winning cells get non-color cue + label suffix | component | `npx vitest run src/ui/Cell.test.tsx -t "winning"` | ❌ Wave 0 |
| GAME-07 | New round clears board, no reload | component | `npx vitest run src/ui/App.test.tsx -t "new round"` | ❌ Wave 0 |
| A11Y-02 | Cell aria-label = "Row r, column c, ..." | component | `npx vitest run src/ui/Cell.test.tsx -t "label"` | ❌ Wave 0 |
| A11Y-03 | Single polite live region, announced once | component | `npx vitest run src/ui/App.test.tsx -t "aria-live"` | ❌ Wave 0 |
| QUAL-03 | Zero axe violations on rendered board/app | component (axe) | `npx vitest run src/ui/App.test.tsx -t "axe"` | ❌ Wave 0 |
| QUAL-04 | CI runs lint/typecheck/test on push | CI | `.github/workflows/ci.yml` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run <changed-file>`
- **Per wave merge:** `npm test` (full suite) + `npm run lint` + `npm run typecheck`
- **Phase gate:** Full suite green (including axe) before `/gsd-verify-work`; a passing GitHub Actions run on the pushed branch is itself one of Phase 1's success criteria (criterion 5), not just an internal gate.

### Wave 0 Gaps
- [ ] `vitest.config.ts` — framework install/config, none exists yet
- [ ] `src/test/setup.ts` — jest-dom + vitest-axe `expect.extend` wiring
- [ ] `src/engine/engine.test.ts` — full win/draw/occupied-move matrix
- [ ] `src/ui/*.test.tsx` — component + axe tests per component
- [ ] `eslint.config.mjs` — flat config, does not exist (template ships Oxlint instead, see Pitfall 3)
- [ ] `.github/workflows/ci.yml` — does not exist, greenfield repo
- [ ] `package.json` `overrides` block — required before the first real (non-dry-run) `npm install` succeeds

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No accounts/auth in scope (local-only, per PROJECT.md) |
| V3 Session Management | No | No sessions; all state is in-memory for Phase 1 (no persistence yet) |
| V4 Access Control | No | Single local user, no access boundaries |
| V5 Input Validation | Yes | Move input is a cell index (0-8) from a fixed set of 9 rendered buttons — the engine's `applyMove` independently validates bounds and occupancy regardless of what the UI sends, so a malformed/out-of-range index is rejected at the pure-function boundary, not just the UI |
| V6 Cryptography | No | No secrets, no crypto in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Player-visible text rendered via `innerHTML` instead of as React text children (not directly applicable yet — no user-entered names until Phase 3, but the status-message-construction code built in this phase should establish the safe pattern now) | Tampering (self-XSS) | Always render dynamic text as React text children/props, never via `dangerouslySetInnerHTML`; D-03's "keep message-building code in one place" decision is also the natural place to enforce this for Phase 3 |
| Out-of-range or type-confused cell index reaching `applyMove` (e.g., a future refactor wiring an untrusted index) | Tampering | Engine validates index bounds and cell occupancy independently of the UI layer, per Pattern 1 — the UI's own guard (`aria-disabled` check) is a UX nicety, not the security boundary |

This phase has no network/backend surface (per PROJECT.md's explicit out-of-scope: no online multiplayer, no accounts, no server). The above two rows are the only realistic threat-adjacent considerations, both already satisfied by the locked pure-engine architecture rather than requiring new work.

## Sources

### Primary (HIGH confidence — direct tool verification this session)
- `npm view <package> version` / `peerDependencies` — live npm registry queries for all 20 packages in the locked stack, run 2026-09-26
- `npm install --dry-run` (three separate empirical runs in an isolated scratch directory) — reproduced both ERESOLVE conflicts and confirmed both `overrides` fixes, plus a full 346-package combined install
- `gsd_run query package-legitimacy check --ecosystem npm` — legitimacy verdicts for all 20 planned packages

### Secondary (MEDIUM confidence — official/authoritative docs, cross-checked)
- github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts — current scaffold file listing (Oxlint, tsconfig project-references)
- developer.mozilla.org/.../ARIA/Reference/Attributes/aria-disabled — aria-disabled vs disabled semantics
- developer.mozilla.org/.../CSS/forced-color-adjust and blogs.windows.com Edge Dev Blog "Styling for Windows high contrast" — forced-colors CSS technique
- npmjs.com/package/@chialab/vitest-axe + chialab.github.io/rna/guide/vitest-axe.html — setup/import pattern
- github.com/testing-library/jest-dom — 7.x `/vitest` subpath entry point

### Tertiary (LOW confidence — WebSearch only, not independently re-verified against primary docs)
- ESLint 10 flat-config migration writeups (pockit.tools, chris.lu) — general flat-config shape and jsx-a11y/ESLint-10 friction narrative (corroborated by the direct npm peerDependencies check, elevating that specific claim to HIGH; the exact flat-config plugin option names remain LOW/unverified, see Open Questions #2)
- GitHub Actions CI workflow shape for Vite/React/Vitest projects — general community convention, not a single authoritative source
- React focus-management and live-region persistence writeups — general community convention, internally consistent across multiple independent sources found

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version and every peer-dependency claim was checked directly against the live npm registry this session, and the two critical compatibility gaps were empirically reproduced and fixed, not just theorized
- Architecture: HIGH — directly inherited from `.planning/research/ARCHITECTURE.md` (prior project-level research), which is itself corroborated by React's own official tutorial and multiple independent OSS implementations
- Accessibility patterns (aria-disabled, live region persistence, forced-colors CSS): MEDIUM-HIGH — each pattern is corroborated by at least one authoritative source (MDN) plus community writeups, though not fetched via a dedicated docs MCP
- Scaffolding specifics (exact ESLint flat-config option names, exact CI action versions): MEDIUM-LOW — sourced via WebSearch only, flagged explicitly in Open Questions and the Assumptions Log for verification at implementation time

**Research date:** 2026-09-26
**Valid until:** 7 days for the exact package versions pinned above (this stack updates fast — vitest 5.0.2 was one day old at research time); 30 days for the architecture/accessibility patterns, which are stable regardless of package churn
