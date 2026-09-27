<!-- GSD:project-start source:PROJECT.md -->

## Project

**Tic-Tac-Toe**

A playful, colorful tic-tac-toe game that runs in a web browser. Two players can go head-to-head locally on the same device, or a single player can take on a computer opponent at a chosen difficulty. It's built as a portfolio piece: polished to play, accessible, tested, and clearly documented.

**Core Value:** A complete, fun game of tic-tac-toe — against a friend or the computer — that plays correctly every time (valid moves, correct win/draw detection, sensible AI).

### Constraints

- **Platform**: Runs in a modern web browser — user requirement
- **Runtime**: Runs locally (dev server or static open); no backend — local-only v1, persistence via browser storage
- **Quality**: Automated tests and accessibility are required, not optional — portfolio goals

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 8.0.x (latest 8.0.9) | Dev server + build tool | The 2026 default for any new browser SPA. Instant dev-server start, native ESM, zero-config TS support. Vite 8 ships Rolldown (Rust bundler) as the unified bundler for dev and prod, so behavior no longer differs between `vite dev` and `vite build` the way it did with Vite 7's esbuild/Rollup split — one less class of "works in dev, breaks in build" bug for a portfolio piece to trip over. |
| React | 19.3.x | UI / component model | Board, scoreboard, and settings map cleanly onto components + hooks; no state management library needed for something this size. React is also the framework most reviewers/hiring managers will recognize at a glance, so it reads as "portfolio-legible" without extra explanation. Function components + hooks only — no class components. |
| TypeScript | 6.0.x (latest 6.0.3), **not 7.0** | Static typing | Type safety demonstrates rigor (board state, move validation, AI return types) and catches whole classes of bugs (off-by-one on the 3×3 grid, wrong win-line indices) at compile time instead of in a bug report. **Deliberately pinning to 6.0, not the newer 7.0**: TypeScript 7.0 (GA July 2026) is the new Go-native compiler and ships with *no* programmatic compiler API — `typescript-eslint`, `ts-jest`, and similar tools do not work against it until 7.1 ships that API, which was still "several months out" as of mid-2026. 6.0.x is TypeScript's last JS-based release and has full tooling support today. |
| @vitejs/plugin-react | 6.x | Vite ↔ React integration | Official plugin for JSX/Fast Refresh under Vite. Version 6 (released alongside Vite 8) moved its transform from Babel to Oxc (Rust), which is faster and has a smaller install — no functional tradeoff for a project this size. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 5.0.x | Unit/component test runner | Shares Vite's config and transform pipeline, so no separate Babel/Webpack test config to maintain — the single biggest reason it has replaced Jest as the default test runner for Vite projects. Use it for all game-logic (win/draw detection, move validation) and AI (minimax) unit tests, plus component tests. |
| @testing-library/react | 16.3.x | Component testing | Renders components and queries them the way a user/screen-reader would (by role/label, not by CSS selector) — directly supports the accessibility requirement by making "can this be found by role" a testable assertion, not just a manual check. |
| @testing-library/jest-dom | latest (10.x) | Custom matchers | `toBeDisabled()`, `toHaveTextContent()`, etc. Despite the name it works with Vitest's `expect` — install and `expect.extend`. |
| @testing-library/user-event | latest (14.x) | Realistic interaction simulation | Fires the same event sequences a real keyboard/mouse would, which matters for testing the "fully keyboard-playable" requirement (Tab/Enter/Space on cells), not just click handlers. |
| jsdom | latest | Vitest DOM environment | Set `test.environment: 'jsdom'` in Vitest config. **Do not use `happy-dom`** here — see What NOT to Use. |
| @chialab/vitest-axe | 0.19.x | Automated accessibility assertions | Runs axe-core against rendered component output and exposes a `toHaveNoViolations()` matcher, turning "sufficient color contrast / proper ARIA labels" from a manual checklist item into a CI-enforced test. This is the actively-maintained fork to use — see What NOT to Use for why the original `vitest-axe` package is a trap. |
| typescript-eslint | 8.x | TS-aware linting | The umbrella package (parser + plugin + configs) recommended by the TypeScript-ESLint project itself; use its flat-config helper (`tseslint.config(...)`). |
| eslint-plugin-jsx-a11y | 6.10.x | Static a11y linting for JSX | Catches missing `alt`, invalid ARIA roles, non-interactive elements with click handlers, etc. *before* a test even runs. Release cadence is slow (this ruleset is mature and stable, not abandoned) but it remains the standard for JSX a11y linting and is still the plugin `create-vite`-style templates and most React style guides ship with. |
| eslint-plugin-react-hooks | latest (6.x) | Hooks rules-of-hooks linting | Official plugin from the React team; catches dependency-array bugs in `useEffect`/`useMemo` that are easy to introduce and easy to miss in review. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Static analysis | Use v10.x (v9 reached end-of-life 2026-08-06). Flat config (`eslint.config.mjs`) only — the legacy `.eslintrc` format is deprecated. |
| Prettier | Formatting | v3.9.x. Pair with `eslint-config-prettier` to turn off ESLint's stylistic rules and avoid the two tools fighting each other. |
| Node.js | Toolchain runtime | Target Node 24.x (Active LTS as of Sep 2026; Node 22.x is Maintenance LTS and also fine). Document the minimum in the README so a reviewer's `npm install` just works. |
| npm | Package manager | Ships with Node — zero extra setup for someone cloning the repo to review it. A pnpm/yarn switch buys speed you don't need at this project size, at the cost of an extra "install pnpm first" step for the reviewer. |
| Playwright + @axe-core/playwright | Optional e2e/a11y smoke test | 1.63.x. Not required for v1, but a strong differentiator: one real-browser test that tabs through the whole board with a keyboard and asserts zero axe violations demonstrates the accessibility requirement end-to-end rather than only at the component level. See Stack Patterns by Variant. |

## Installation

# Core

# Dev dependencies — build tooling

# Dev dependencies — testing

# Dev dependencies — linting/formatting

# Optional — e2e/a11y smoke test (stretch goal, see Stack Patterns by Variant)

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| React 19 + hooks | Vanilla TypeScript + DOM APIs (no framework) | If the portfolio goal is specifically to demonstrate framework-free fundamentals (manual DOM diffing/rendering, event delegation) rather than component-model fluency. Fully viable for something this small — no persuasive technical reason to need React here, only a legibility-to-reviewers reason to prefer it. |
| CSS Modules (built into Vite, no install) | Tailwind CSS 4.x | If you want to move faster on the "playful, colorful" visual requirement and are comfortable with utility classes; Tailwind is also a very standard 2026 choice and equally portfolio-legible. Recommended default here is CSS Modules because hand-written scoped CSS + `@keyframes`/`transition` demonstrates CSS skill directly, with zero added dependencies, for a UI this small. |
| Built-in `useState`/`useReducer` for game state | Zustand / Redux Toolkit | Only if the game state grows well beyond a 3×3 board + scoreboard + settings (e.g. you add replay history, undo/redo across sessions, or multiple simultaneous games). For this project's scope, a global store is unjustified complexity. |
| Vitest | Jest | If you specifically want to showcase Jest experience for a role that uses it, or the project were built with Create React App (it isn't, and shouldn't be — see What NOT to Use). For a Vite project, Vitest is the default; Jest requires extra config to understand Vite's transforms. |
| npm | pnpm | If you're optimizing your own install speed across many local projects and don't mind asking reviewers to install pnpm first. Not worth the friction for a single portfolio repo. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| Create React App (`create-react-app`) | Deprecated and unmaintained; the React team removed it from the official "Start a New React Project" docs. It also uses Webpack, which is dramatically slower to start and build than Vite for a project this size. | Vite + `@vitejs/plugin-react` |
| TypeScript 7.0.x (today) | Ships with no programmatic compiler API as of its July 2026 GA — `typescript-eslint`, `ts-jest`, and similar tools break or refuse to run against it until 7.1 adds the API back. Adopting it now means either broken linting or juggling a `@typescript/typescript6` compatibility shim just to keep ESLint working — not worth it for a portfolio project where "lint passes cleanly" matters. | TypeScript 6.0.x (last full-featured JS-based release, full tooling support) — revisit 7.x once 7.1 ships and `typescript-eslint` confirms support. |
| `happy-dom` as the Vitest test environment, if using axe-based a11y tests | `happy-dom` has a known bug in its `Node.prototype.isConnected` implementation that breaks axe-core's DOM traversal, causing accessibility assertions to fail or silently pass incorrectly. | `jsdom` as the Vitest `environment` |
| `vitest-axe` (the original `chaance/vitest-axe` package) | Maintenance is inactive — last release was roughly a year+ old with no recent activity. Depending on an abandoned a11y-testing package undermines the "well-tested" portfolio goal it's meant to serve. | `@chialab/vitest-axe` (actively maintained fork) |
| Global state libraries (Redux, MobX, Zustand, Jotai) | Adds a dependency and a mental-model layer to explain in the README for state that fits comfortably in one or two `useReducer` calls. Reviewers reading portfolio code generally read "global store for a 9-cell board" as over-engineering, not sophistication. | React's built-in `useState`/`useReducer`, lifted to the smallest common ancestor component |
| CSS-in-JS runtime libraries (styled-components, Emotion) | Runtime style injection adds bundle size and a build step for zero benefit on a project with no dynamic theming needs beyond CSS custom properties. | CSS Modules (native Vite support) + CSS custom properties for theming/reduced-motion |
| Scattering raw `localStorage.getItem`/`setItem` calls through components | Makes persistence logic untestable in isolation and easy to get subtly wrong (JSON parse errors on corrupted/missing data, forgetting to guard `localStorage` access for environments where it can throw). | A small typed `useLocalStorage` hook (or plain persistence module) that centralizes read/write/parse/guard logic, unit-tested on its own |

## Stack Patterns by Variant

- Use the full stack above: Vite + React 19 + TypeScript 6 + Vitest/RTL.
- Because React is the most widely recognized UI library among people likely to review a frontend portfolio piece, and its component model matches this domain (Board → Cell, Scoreboard, Settings) almost exactly.
- Drop React and `@vitejs/plugin-react`; keep Vite + TypeScript for the dev server/build/types, write a small manual render function (or a tiny signal-based reactivity helper) over the DOM directly.
- Testing becomes Vitest + `@testing-library/dom` (the framework-agnostic core of Testing Library) instead of `@testing-library/react`.
- Because this shows you don't need a framework to build something clean and testable — a valid, different signal than the React path, but pick one deliberately rather than drifting into a mix of both.
- Add Playwright + `@axe-core/playwright` for one real-browser end-to-end test: tab through the entire board with the keyboard, play a full game, and assert zero axe violations on the final state.
- Because component-level a11y tests (via `@chialab/vitest-axe`) verify pieces in isolation, but a real-browser keyboard-only playthrough is the strongest, most literal proof of the "fully keyboard-playable" requirement — and it's a distinctive addition most portfolio tic-tac-toe clones skip.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `vite@8.0.x` | `@vitejs/plugin-react@6.x` | Plugin v6 was released alongside Vite 8 specifically to move off Babel onto Oxc; v5 of the plugin also still works on Vite 8 if you hit an edge case, but v6 is the intended pairing. |
| `vitest@5.0.x` | `vite@8.0.x` | Same maintainer org (VoidZero/Vite team); keep Vitest's major version aligned with Vite's for guaranteed config-sharing compatibility. |
| `typescript@6.0.x` | `typescript-eslint@8.x` | Full support today. Do **not** pair `typescript-eslint` with `typescript@7.0.x` yet — no compiler API until 7.1. |
| `@chialab/vitest-axe` | `vitest` with `environment: 'jsdom'` | Will silently misbehave under `environment: 'happy-dom'`; must be jsdom. |
| `react@19.x` | `@testing-library/react@16.x` (13+) | RTL 13+ requires React 18+; 16.x is current and fully supports React 19. |

## Sources

- npm registry pages for `vite`, `react`, `react-dom`, `vitest`, `@testing-library/react`, `typescript`, `eslint`, `prettier`, `playwright`, `vitest-axe`, `eslint-plugin-jsx-a11y` — version numbers, last-published dates (accessed 2026-09-26, via WebSearch) — MEDIUM confidence (cross-checked against a second independent source per claim)
- vite.dev official blog, "Vite 8.0 is out!" and "Vite 8 Beta: The Rolldown-powered Vite" — Rolldown architecture, plugin compatibility, memory tradeoff — MEDIUM confidence
- devblogs.microsoft.com/typescript, "Announcing TypeScript 6.0" and "Announcing TypeScript 7.0" — TS 6 vs 7 status, GA date, no-API-until-7.1 finding — MEDIUM confidence (corroborated by a second, independent source: `typescript-eslint/typescript-eslint` GitHub issue #12518 and a third-party migration-readiness writeup)
- `github.com/chaance/vitest-axe` README + Snyk/Socket.dev package pages — original `vitest-axe` inactive-maintenance status and the happy-dom/`isConnected` bug — MEDIUM confidence
- `@vitejs/plugin-react` GitHub releases/changelog and `vitejs/vite-plugin-react` discussion #1240 — plugin v5/v6 compatibility with Vite 8, Babel→Oxc change — MEDIUM confidence
- eslint.org, "ESLint v10.0.0 released" and eslint.org/version-support — ESLint 9 EOL date (2026-08-06), v10 as current — MEDIUM confidence
- playwright.dev release notes and npm `playwright` page — current version, supported Node versions — MEDIUM confidence
- nodejs.org v26 blog post and endoflife.date/nodejs — LTS status of Node 22/24/26 as of Sep 2026 — MEDIUM confidence

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
