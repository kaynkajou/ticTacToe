# Walking Skeleton — Tic-Tac-Toe

**Phase:** 1
**Generated:** 2026-09-26

## Capability Proven End-to-End

Two people on one device run `npm run dev`, open the page, and take alternating X and O turns on a 3×3 board of native buttons. The status line announces whose turn it is. Each click goes from the React UI through a `useReducer` controller into a pure TypeScript engine and back. Vitest, Testing Library, and axe exercise this same path, and GitHub Actions runs those tests, plus lint, typecheck, format check, and build, on every push.

This is **plan 01-01**. Plans 01-02, 01-03, and 01-04 add the rest of Phase 1 on top of it as vertical slices: games end correctly, play again, and see the winning line.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Vite 8.0.9 + React 19.3.0 + TypeScript 6.0.3 (not 7.x) + `@vitejs/plugin-react` 6.1.1 | Locked in `.claude/CLAUDE.md`. TS 7 has no compiler API yet, so `typescript-eslint` breaks on it. |
| Build / dev server | Vite (`npm run dev`, `npm run build` = `tsc -b && vite build`, static `dist/`) | No backend (local-only v1). `tsc -b` in the build also typechecks the test files. |
| Data layer | None. In-memory `useReducer` state over a `readonly` 9-cell array (`Board = readonly Cell[]`). | Persistence belongs to Phase 3, which adds one guarded storage module. Phase 1 makes no browser-storage access. |
| Game rules | Pure TS modules in `src/engine/` with no React, `document`, or `window` access. `applyMove` is immutable and throws `IllegalMoveError`. `evaluate` checks win, then draw, then continue. | Rules can be unit-tested without a DOM, and the Phase 2 AI calls the same functions. |
| Controller | `src/game/gameReducer.ts` (pure reducer) + `src/game/useGame.ts` (hook: derived turn/result/status, focus refs) | Components stay render-only. The current player is derived from the board and never stored. |
| Status text | One builder, `buildStatusMessage(result, turn)`, in `src/game/status.ts` | D-03. Phase 3 swaps in player names in this one place. |
| Routing | None: a single-screen SPA with no router | Nothing to route in a 1-screen game |
| Auth | None: local hot-seat play | Out of scope per PROJECT.md |
| Deployment target | None in v1. Run locally with `npm run dev`. CI runs on GitHub Actions (`ubuntu-latest`, Node from `.nvmrc` = 24). | PROJECT.md: local only, with hosting deferred to v2 (DEPLOY-01) |
| Directory layout | `src/engine/` (pure rules), `src/game/` (controller + status text), `src/ui/` (components + CSS Modules), `src/test/` (setup + axe canary). Tests sit next to the code as `*.test.ts(x)`, and App-level flow tests are `src/App*.test.tsx`. | Matches `.planning/research/ARCHITECTURE.md` layering |
| Testing | Vitest 5.0.2 (jsdom 30.1.1, `globals: true`) + @testing-library/react 16.3.3 (+ dom 10.4.2) + user-event 14.6.7 + jest-dom 7.0.1 (`/vitest` entry) + @chialab/vitest-axe 0.19.2 + axe-core 4.13.0 | jsdom, not happy-dom, so axe runs correctly. An axe canary proves the matcher can both pass and fail under Vitest 5. |
| Lint / format | ESLint 10 flat config (`eslint.config.mjs`: @eslint/js, typescript-eslint, jsx-a11y, react-hooks `configs.flat.recommended`, react-refresh `configs.vite`, `noInlineConfig`) + Prettier 3.9 + eslint-config-prettier/flat. `.gitattributes` forces LF line endings. | The create-vite template now ships Oxlint, so we delete it and write the ESLint config ourselves. Inline disables are ignored and fail the build, which keeps the gates honest. |
| Dependency hygiene | Exact version pins (`--save-exact`), an `overrides` block for the jsx-a11y↔ESLint 10 and vitest-axe↔Vitest 5 peer gaps, a committed `package-lock.json`, and `npm ci` in CI | Reproducible installs. RESEARCH.md reproduced both peer gaps and fixed them this way. |
| Styling | CSS Modules + CSS custom properties on `:root`, with a neutral Phase 1 look and a visible `:focus-visible` ring | Locked. Phase 4 re-skins the app through the same custom properties. |
| Accessibility baseline | Cells are native `<button>` elements with `aria-label` "Row r, column c, X/O/empty", `aria-disabled` (never native `disabled`), and no composite ARIA roles. One always-mounted polite `role="status"` region has id `game-status`. | Locked decisions D-04 and D-05, plus the carried-forward a11y constraints |

## Stack Touched in Phase 1

This is a local-only static SPA, so the template's routing and database slots are read as noted.

- [ ] Project scaffold (Vite + React + TS, build, ESLint, Prettier, Vitest) — plan 01-01, Tasks 2–3
- [ ] Routing: none by design (single screen). The one real "route" is `index.html` → `src/main.tsx` → `<App />`.
- [ ] Database: none by design. The real state read/write is the `useReducer` state transition `MOVE → isLegalMove → applyMove`, which the UI reads back as board, labels, and status.
- [ ] UI: one interactive element wired to the real engine (a cell `<button>` click puts a mark on the board through the reducer and engine) — plan 01-01, Task 2
- [ ] Deployment: a documented local run (`npm run dev`) plus the GitHub Actions CI workflow (`.github/workflows/ci.yml`) running lint → typecheck → format check → test → build on every push — plan 01-01, Task 3

## Out of Scope (Deferred to Later Slices)

- The computer opponent, mode selection, choosing who goes first, and the "thinking" delay (Phase 2). `currentPlayer(board, firstPlayer)` already takes a first-player parameter.
- Player names, the scoreboard, and any browser storage (Phase 3)
- The colorful theme, animation, AA-contrast tuning, and reduced-motion handling (Phase 4)
- The end-to-end keyboard/screen-reader verification pass, the README rewrite, and Playwright (Phase 5 / v2 E2E-01)
- Hosting at a live URL (v2 DEPLOY-01) and mobile-responsive layout (v2 RESP-01)
- Any router, backend, auth, or global state library (the project excludes them in CLAUDE.md "What NOT to Use")

## Subsequent Slice Plan

Each later slice adds one user capability on top of this skeleton. None of them change the decisions above.

- Plan 01-02: games end correctly. `evaluate` finds wins on all 8 lines (including on the 9th move) and draws. The result appears in the same status element, and the board locks.
- Plan 01-03: play again. An always-enabled New round button clears the board. Focus goes to New round at game end (with the result as its description) and back to Row 1, column 1 after New round.
- Plan 01-04: see the winning line. A strike line is drawn for all 8 orientations and stays visible in forced-colors and grayscale, and the winning cells' labels gain ", winning".
- Phase 2: play the computer (Easy/Medium/Hard) behind a race-free "thinking" delay
- Phase 3: names and a saved scoreboard that survive refreshes and bad storage
- Phase 4: a playful look and feel with AA contrast and reduced-motion support
- Phase 5: an accessible, portfolio-ready release (keyboard/SR verification + README)
