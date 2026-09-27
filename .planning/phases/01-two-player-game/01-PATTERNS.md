# Phase 1: Two-Player Game - Pattern Map

**Mapped:** 2026-09-26
**Files analyzed:** 15 (new; none modified — greenfield repo)
**Analogs found:** 0 / 15 (no in-repo analogs exist; only `README.md` is tracked)

## Greenfield Notice

This repo contains no application source yet — `git ls-files` returns only `README.md`. There is no `src/`, no prior component, engine, or test file to copy conventions from. **Every file in this phase has no in-repo analog.** The planner must use the code skeletons in `01-RESEARCH.md` (sections "Architecture Patterns", "Code Examples") as the reference pattern instead of an existing-file analog. This mapping exists so the planner has one canonical place per file pointing at the exact RESEARCH.md section/line range to copy from, rather than re-deriving structure per plan.

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|-----------------|----------------|
| `src/engine/board.ts` | model/utility (pure) | transform | none | no analog — use RESEARCH.md Pattern 1 |
| `src/engine/rules.ts` | model/utility (pure) | transform | none | no analog — use RESEARCH.md Pattern 1 |
| `src/engine/player.ts` | model/utility (pure) | transform | none | no analog — use RESEARCH.md Pattern 2 |
| `src/engine/engine.test.ts` | test | transform | none | no analog — use RESEARCH.md Validation Architecture table |
| `src/game/useGame.ts` | hook | event-driven | none | no analog — use RESEARCH.md system diagram (Controller layer) + Pattern 5 |
| `src/ui/Board.tsx` | component | request-response (render) | none | no analog — use RESEARCH.md Recommended Project Structure |
| `src/ui/Board.module.css` | config/style | n/a | none | no analog — use RESEARCH.md forced-colors CSS example |
| `src/ui/Cell.tsx` | component | request-response (render) | none | no analog — use RESEARCH.md Pattern 4 |
| `src/ui/Cell.module.css` | config/style | n/a | none | no analog — use RESEARCH.md "Forced-colors-safe strike line" |
| `src/ui/StatusRegion.tsx` | component | event-driven (a11y live region) | none | no analog — use RESEARCH.md Pattern 3 |
| `src/ui/NewRoundButton.tsx` | component | event-driven | none | no analog — use RESEARCH.md Pattern 3 |
| `src/ui/*.test.tsx` (Board, Cell, App) | test | request-response | none | no analog — use RESEARCH.md Validation Architecture + Vitest/axe setup |
| `src/App.tsx` | component | event-driven | none | no analog — use RESEARCH.md system diagram |
| `src/main.tsx` | entry point | n/a | none | no analog — standard Vite React entry (create-vite scaffold output) |
| `vitest.config.ts` / `src/test/setup.ts` | config | n/a | none | no analog — use RESEARCH.md "Vitest + jsdom + jest-dom + vitest-axe setup" |
| `eslint.config.mjs` | config | n/a | none | no analog — use RESEARCH.md "ESLint 10 flat config skeleton" (Pitfall 3: template ships Oxlint, not this) |
| `.github/workflows/ci.yml` | config | n/a | none | no analog — use RESEARCH.md "GitHub Actions CI workflow" |

## Pattern Assignments

Since there are no in-repo analogs, each assignment below points to the exact RESEARCH.md excerpt to copy verbatim as the starting point.

### `src/engine/rules.ts` + `src/engine/board.ts` (pure engine, transform)
**Reference:** `01-RESEARCH.md` → "Architecture Patterns" → Pattern 1 ("Pure Engine, Evaluation Order Win → Draw → Continue"), lines ~220-254.
Copy the `WINNING_LINES` constant and `evaluate()` function exactly as shown — win-check loop before the `board.every(...)` draw check. This ordering is the single highest-risk-if-wrong piece of this phase (Pitfall 4/Pitfall 1 in CONTEXT/RESEARCH).

### `src/engine/player.ts` (pure, transform)
**Reference:** RESEARCH.md → Pattern 2 ("Derived Current Player, No Separate Turn State"), lines ~256-258.
`currentPlayer(board) = board.filter(c => c !== null).length % 2 === 0 ? 'X' : 'O'` — never store turn as state.

### `src/ui/StatusRegion.tsx` + `src/ui/NewRoundButton.tsx` (component, event-driven/a11y)
**Reference:** RESEARCH.md → Pattern 3 ("Persistent, Single `aria-live=\"polite\"` Status Region"), lines ~260-288.
Copy the `StatusRegion` component (stable `id`, unconditionally mounted, `role="status"` + `aria-live="polite"`) and `NewRoundButton` (`aria-describedby={STATUS_REGION_ID}`) verbatim as starting shape. Never conditionally render this element (Anti-Pattern, line ~334).

### `src/ui/Cell.tsx` + `Cell.module.css` (component, render)
**Reference:** RESEARCH.md → Pattern 4 ("`aria-disabled`, Not `disabled`, for Unplayable Cells"), lines ~290-312, plus "Forced-colors-safe strike line (CSS)" code example, lines ~470-492.
Copy the label-construction (`Row ${row}, column ${col}, ${value ?? 'empty'}${isWinning ? ', winning' : ''}`) matching CONTEXT.md D-04 exactly, and the `aria-disabled`/`data-winning` attribute pattern. Use native `disabled` never (Anti-Pattern, line ~335).

### `src/game/useGame.ts` (hook, event-driven, focus choreography)
**Reference:** RESEARCH.md → Pattern 5 ("Focus Choreography via `useEffect` Keyed on Game-Over / Reset"), lines ~314-330, plus the Controller box in the System Architecture Diagram, lines ~181-186.
Two refs + two `useEffect`s keyed on `result.status` transition and board-reset transition, per D-08/D-10.

### `src/ui/Board.tsx`, `src/App.tsx` (component, request-response render)
**Reference:** RESEARCH.md → "Recommended Project Structure", lines ~199-218, and the System Architecture Diagram UI layer box, lines ~171-179.

### Test files (`engine.test.ts`, `*.test.tsx`)
**Reference:** RESEARCH.md → "Validation Architecture" → "Phase Requirements → Test Map" table, lines ~550-563, which enumerates the exact test names/assertions required per requirement ID (GAME-01 through QUAL-04). Component tests must use `@testing-library/react` + `user-event` + `@chialab/vitest-axe`'s `toHaveNoViolations()`, per "Don't Hand-Roll" table (lines ~340-347).

### Tooling/config (`vitest.config.ts`, `src/test/setup.ts`, `eslint.config.mjs`, `.github/workflows/ci.yml`)
**Reference:** RESEARCH.md → "Code Examples" section in full, lines ~394-492. Copy each block verbatim as the starting point:
- Vitest+jsdom+jest-dom+vitest-axe setup, lines ~418-445 (note: `@testing-library/jest-dom/vitest` subpath import, not bare import).
- ESLint 10 flat config skeleton, lines ~397-416 (verify exact export names against installed package README per Open Question #2 before finalizing).
- GitHub Actions CI workflow, lines ~448-467.
- **Required `package.json` `overrides` block** (RESEARCH.md "Standard Stack" → Installation, lines ~119-128) must be added before the first non-dry-run `npm install`, or install fails (Pitfall 1 & 2).

## Shared Patterns

### Single source of truth for game outcome
**Source:** RESEARCH.md Pattern 1 (`evaluate()`)
**Apply to:** `engine/rules.ts`, `game/useGame.ts`, and all engine/component tests. Every call site (human move now, AI move in Phase 2) must share this one function — do not duplicate win/draw logic in the UI or hook.

### Status message construction, centralized
**Source:** CONTEXT.md D-03 — "Keep the message-building code in one place so that swap is a one-spot change" (Phase 3 will substitute player names).
**Apply to:** `game/useGame.ts` or a small `buildStatusMessage(result, currentPlayer)` helper feeding `StatusRegion`. Do not inline status strings in multiple components.

### Accessible labeling
**Source:** CONTEXT.md D-04, RESEARCH.md Pattern 4.
**Apply to:** `Cell.tsx` only, but the `", winning"` suffix must be driven by the same `winningLine` data the strike-line CSS (`data-winning`) uses — one source (the `evaluate()` result), two consumers (label text and CSS attribute).

### Focus choreography
**Source:** RESEARCH.md Pattern 5, CONTEXT.md D-08/D-09/D-10.
**Apply to:** `useGame.ts` (owns refs + effects), consumed by `App.tsx` wiring refs to `NewRoundButton` and the first `Cell`.

## No Analog Found

All 17 files above have no in-repo analog (greenfield repo — only `README.md` tracked). Use the RESEARCH.md excerpts cited per file instead.

## Metadata

**Analog search scope:** Full repo (`git ls-files`) — confirmed only `README.md` is tracked; no `src/` exists.
**Files scanned:** 1 (README.md, not a code analog)
**Pattern extraction date:** 2026-09-26
