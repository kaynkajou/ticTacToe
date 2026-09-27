---
phase: 01-two-player-game
reviewed: 2026-09-27T00:00:00Z
depth: standard
files_reviewed: 44
files_reviewed_list:
  - .gitattributes
  - .github/workflows/ci.yml
  - .gitignore
  - .nvmrc
  - .prettierignore
  - .prettierrc.json
  - README.md
  - eslint.config.mjs
  - index.html
  - package.json
  - src/App.gameOver.test.tsx
  - src/App.module.css
  - src/App.newRound.test.tsx
  - src/App.test.tsx
  - src/App.tsx
  - src/App.winningLine.test.tsx
  - src/engine/board.ts
  - src/engine/engine.test.ts
  - src/engine/player.ts
  - src/engine/rules.ts
  - src/engine/types.ts
  - src/game/gameReducer.test.ts
  - src/game/gameReducer.ts
  - src/game/status.test.ts
  - src/game/status.ts
  - src/game/useGame.ts
  - src/index.css
  - src/main.tsx
  - src/test/axe-canary.test.ts
  - src/test/setup.ts
  - src/ui/Board.module.css
  - src/ui/Board.test.tsx
  - src/ui/Board.tsx
  - src/ui/Cell.module.css
  - src/ui/Cell.tsx
  - src/ui/NewRoundButton.tsx
  - src/ui/StatusRegion.tsx
  - src/ui/cellLabel.test.ts
  - src/ui/cellLabel.ts
  - src/ui/strikeLine.ts
  - tsconfig.app.json
  - tsconfig.json
  - tsconfig.node.json
  - vite.config.ts
findings:
  critical: 0
  warning: 3
  info: 0
  total: 3
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-09-27T00:00:00Z
**Depth:** standard
**Files Reviewed:** 44
**Status:** issues_found

## Summary

Reviewed the full two-player tic-tac-toe implementation: engine (`board.ts`, `rules.ts`, `player.ts`, `types.ts`), game layer (`gameReducer.ts`, `useGame.ts`, `status.ts`), UI (`Board.tsx`, `Cell.tsx`, `NewRoundButton.tsx`, `StatusRegion.tsx`, `cellLabel.ts`, `strikeLine.ts`), all associated tests, and project config (ESLint, TS, Vite, CI, package manifests).

The application logic itself is sound: win/draw/in-progress detection, move legality, immutability, focus management, and ARIA labelling were traced by hand against the test suite and no incorrect-behavior defects were found. `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm test` (76/76) all pass cleanly, and there are no hardcoded secrets, `eval`, empty catch blocks, or leftover debug artifacts in `src/`.

Because the code itself held up, this review's findings sit at the edges the test suite doesn't reach: a known-vulnerable pinned dependency, a self-verified gap in the accessibility test harness (confirmed by instrumenting axe-core directly — see WR-02), and a documentation shortfall relative to the project's own stated portfolio/documentation requirements. All three are WARNING severity; none are BLOCKER-level incorrect behavior in the reviewed application code.

## Warnings

### WR-01: Pinned Vite version has two known high-severity advisories

**File:** `package.json:45` (`"vite": "8.0.9"`)
**Issue:** `npm audit` reports a **high severity** vulnerability against the exact pinned range `vite 8.0.0 - 8.0.15` used by this project:
- GHSA-fx2h-pf6j-xcff — `vite`'s `server.fs.deny` can be bypassed via alternate path syntax on Windows.
- GHSA-v6wh-96g9-6wx3 — `launch-editor` (a Vite dev-server dependency) discloses an NTLMv2 hash via UNC path handling on Windows.

Both require the Vite dev server to be reachable (either exposed on the network via `--host`, or reached by another local process/attacker on a shared machine) and both are Windows-specific — directly relevant here since the project's own environment and `.nvmrc`/CI target are Windows-compatible and `npm run dev` is the primary local workflow per the project's "Runtime: runs locally (dev server...)" constraint. Verified via `npm audit` in the actual repo (not simulated):
```
vite  8.0.0 - 8.0.15
Severity: high
launch-editor: NTLMv2 hash disclosure via UNC path handling on Windows
vite: `server.fs.deny` bypass on Windows alternate paths
```
**Fix:** Bump the pinned version past the affected range and re-verify `npm run dev` / `npm run build` / `npm test` still pass:
```diff
-    "vite": "8.0.9",
+    "vite": "8.3.1",
```
(`npm audit fix --force` resolves to `vite@8.3.1` at time of review — pin explicitly rather than relying on `--force` in CI.)

### WR-02: Axe-based accessibility tests never actually check color contrast — `toHaveNoViolations()` silently treats the check as passed

**File:** `src/test/setup.ts:1-5`, and every accessibility assertion built on it: `src/App.gameOver.test.tsx:199-214`, `src/App.newRound.test.tsx:252-264`, `src/App.test.tsx:111-126`, `src/App.winningLine.test.tsx:43-79`, `src/test/axe-canary.test.ts:11-39`
**Issue:** `axe-core`'s `color-contrast` rule needs `HTMLCanvasElement.getContext()` to compute rendered colors. jsdom's canvas support is a no-op unless the optional `canvas` npm package is installed; it is **not** present in this project's `node_modules` (only referenced transitively in `package-lock.json`, never actually installed — confirmed via `ls node_modules/canvas` → not found). Running the test suite reproduces this every run:
```
Not implemented: HTMLCanvasElement's getContext() method: without installing the canvas npm package
```
I instrumented `axe(container)` directly against the rendered `<App />` to confirm the practical effect:
```json
{
  "violations": [],
  "incomplete": [{ "id": "color-contrast", "nodes": 1 }],
  "passes": []
}
```
`color-contrast` lands in `results.incomplete` ("can't tell"), not `results.violations` and not `results.passes`. `@chialab/vitest-axe`'s matcher (`node_modules/@chialab/vitest-axe/lib/index.js`) only inspects `results.violations`:
```js
toHaveNoViolations(results) {
    const violations = results.violations ?? [];
    return { pass: violations.length === 0, ... };
}
```
So every `expect(results).toHaveNoViolations()` call in this suite passes regardless of whether contrast is actually adequate — the check silently never runs. This directly undercuts the project's own stated bar ("Automated tests and accessibility are required, not optional — portfolio goals") for one of the most commonly-cited WCAG criteria, and gives false confidence specifically in the areas this project styles with custom colors (`--color-focus`, `--color-strike`, `.cell`, forced-colors fallback).
**Fix:** Either:
1. Add `canvas` as a devDependency (`npm install -D canvas`) so jsdom's `getContext()` is backed by a real implementation and `color-contrast` can actually execute, then assert on `results.incomplete` too (e.g., a shared helper that fails if `incomplete` is non-empty, not just `violations`); or
2. Add the real-browser Playwright + `@axe-core/playwright` smoke test the project's own stack notes already recommend as a differentiator — a real browser can compute contrast correctly where jsdom cannot.

### WR-03: README does not meet the project's own documentation requirement

**File:** `README.md:1-3`
**Issue:** The entire README reads:
```
# ticTacToe

For testing Claude commands.
```
`.claude/CLAUDE.md` states this project's "Quality" constraint is that "Automated tests and accessibility are required, not optional — portfolio goals," and the stack guidance embedded in the same file explicitly calls for documenting "the minimum in the README so a reviewer's `npm install` just works." As written, the README has no project description, no setup instructions, no mention of `npm run dev`/`npm test`/`npm run lint`/`npm run build`, and does not describe the game or its accessibility/testing posture at all — a reviewer cloning the repo has to read `package.json` scripts by hand to know how to run anything.
**Fix:** Replace the placeholder with at least: a one-line project description, prerequisites (Node version from `.nvmrc`), install/run/test/lint/build commands, and a short note on the accessibility/testing approach (mirroring the intent already documented in `.claude/CLAUDE.md`).

---

_Reviewed: 2026-09-27T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
