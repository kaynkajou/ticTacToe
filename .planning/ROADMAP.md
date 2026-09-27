# Roadmap: Tic-Tac-Toe

## Overview

Five vertical slices take this from an empty repo to a portfolio-ready browser game. Phase 1 is the walking skeleton: a complete, correct two-player game, with its pure engine, tests, accessibility semantics, and CI in place from day one. Phase 2 adds the computer opponent (Easy / Medium / unbeatable Hard) behind a safe "thinking" delay. Phase 3 gives players names and a scoreboard that survives refreshes and bad storage. Phase 4 adds the playful, animated, AA-contrast visual theme with reduced-motion support. Phase 5 is the final keyboard and screen-reader verification pass, plus the README that presents the finished work.

## Build Conventions (apply to every phase)

- **Layering inside each slice:** game rules and computer-opponent logic are pure TypeScript functions over a plain 9-cell board, with no DOM or `window` access. Persistence is an isolated, guarded module. React components only render state and dispatch actions. The current player is derived from the board, never stored as separate state.
- **Tests ship with the code:** each phase includes the unit and component tests (with axe checks) for what it builds. There is no separate testing phase, and CI (set up in Phase 1) must stay green.
- **Accessibility is built in, not bolted on:** cells are native `<button>` elements laid out with CSS grid (no `role="grid"`). Every new control is keyboard-operable and has a visible focus indicator. No state is conveyed by color alone. All status messages go through the single polite live region. User-entered names render as text, never as HTML.
- **"AI" means game-tree search:** the computer opponent is minimax plus simple heuristics, not an LLM. No model integration or AI-SPEC applies.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Two-Player Game** - A complete, correct hot-seat game on one device, with engine tests, accessible board semantics, and CI from day one
- [ ] **Phase 2: Play the Computer** - Choose two-player or vs-computer, who goes first, and Easy/Medium/unbeatable Hard, with a race-free "thinking" delay
- [ ] **Phase 3: Names & Saved Scoreboard** - Named players and a running win/draw tally that survive page refreshes and missing, corrupt, or blocked storage
- [ ] **Phase 4: Playful Look & Feel** - Colorful theme, lively animation, and win celebration that meet AA contrast and respect reduced motion
- [ ] **Phase 5: Accessible, Portfolio-Ready Release** - End-to-end keyboard and screen-reader verification of the finished game, plus a README that shows it off

## Phase Details

### Phase 1: Two-Player Game

**Goal**: As a player sharing a device, I want to play full games with correct wins and draws, so that a friend and I can compete.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07, A11Y-02, A11Y-03, QUAL-01, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):
  1. Two people can play on one board in the browser. Marks alternate X then O, the status always shows whose turn it is, and clicking an occupied cell (or pressing Enter/Space on it) does nothing.
  2. The game ends correctly. Three in a row on any of the 8 lines is reported as a win, including a line completed on the 9th move, which must count as a win rather than a draw. A full board with no line is reported as a draw. The result is shown, the board then accepts no moves, and the three winning cells are marked with a non-color cue (for example an outline or strike line, plus "winning" in their accessible label).
  3. "New round" clears the board so play starts again without reloading the page.
  4. With a screen reader, each cell reads its position and contents (e.g. "Row 1, column 2, X"). Turn changes and results are each announced once through a single polite status region. Cells are native buttons reachable by Tab.
  5. `npm test` passes the engine unit tests (all 8 win lines, draw, win on the final move, and moves on occupied cells or after game over) and the component tests with zero axe violations. A GitHub Actions run on push shows lint, typecheck, and tests all passing.

**Plans:** 2/4 plans executed

Plans:
**Wave 1**
- [x] 01-01-PLAN.md — Walking skeleton: scaffold (with package-legitimacy gate), pure engine core, taking alternating turns on an accessible native-button board, one polite status region, tests + axe canary, lint/typecheck/format, GitHub Actions CI

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-02-PLAN.md — Games end correctly: evaluate() win-then-draw (including a 9th-move win), the result in the same status region, the board locks; full engine test matrix

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 01-03-PLAN.md — Play again: an always-enabled New round button; focus goes to New round at game end with the result as its description, then back to Row 1, column 1

**Wave 4** *(blocked on Wave 3 completion)*
- [ ] 01-04-PLAN.md — See the winning line: a strike line for all 8 orientations (forced-colors/grayscale safe) and ", winning" cell labels

**UI hint**: yes

### Phase 2: Play the Computer

**Goal**: As a solo player, I want to play the computer at a difficulty I choose, so that I can enjoy a game at my own level anytime.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: MODE-01, MODE-02, MODE-03, AI-01, AI-02, AI-03, AI-04, AI-05, QUAL-02
**Success Criteria** (what must be TRUE):
  1. Before a round, the user can choose Two players or Vs computer, choose who moves first (X or O in two-player; "me" or the computer in single-player), and pick Easy, Medium, or Hard, with Hard labeled as unbeatable. All of these choices work with mouse or keyboard, and the next round uses them.
  2. Easy plays a random legal move. Medium takes an immediate win if one exists, otherwise blocks the user's immediate win, otherwise plays randomly. Unit tests on specific board positions check both behaviors.
  3. On Hard the user can never win; the best they can get is a draw, whether the computer moves first or second. An automated test that plays out every possible human move sequence, in both turn orders, proves this.
  4. After the user moves, "Computer is thinking…" is shown and announced, and the computer moves after a short delay. Board input is ignored during the delay, so rapid clicking never gives anyone two moves in a row. Starting a new round mid-think never lets the old computer move land on the new board.

**Plans**: TBD
**UI hint**: yes

### Phase 3: Names & Saved Scoreboard

**Goal**: As a returning player, I want to keep our names and score tally across refreshes, so that our rivalry carries on.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: PLYR-01, PLYR-02, PLYR-03, PLYR-04, PLYR-05
**Success Criteria** (what must be TRUE):
  1. Users can enter player names (defaults are "Player X" / "Player O", and "Computer" for the computer opponent). The names appear exactly as typed, as plain text, in the turn status, the result announcement, and the scoreboard.
  2. A scoreboard shows wins for each player and draws for the current matchup, and updates when each round ends. "New round" leaves it unchanged. A separate "Reset scores" control, distinct from New round, sets the tally to zero.
  3. After a page refresh, names and scores are exactly as they were until the user resets them.
  4. The app still loads with default names and zero scores, and stays fully playable, if saved data is missing, malformed (e.g. hand-edited in devtools), the wrong shape, or storage is blocked entirely. Unit tests cover each of these cases.

**Plans**: TBD
**UI hint**: yes

### Phase 4: Playful Look & Feel

**Goal**: As a player, I want to play on a colorful and lively board that celebrates wins, so that the game feels fun.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, A11Y-04, A11Y-05
**Success Criteria** (what must be TRUE):
  1. The whole app (setup controls, board, status, and scoreboard) has a playful, colorful theme. X and O are styled distinctly, differing in shape as well as color. The layout looks clean at common desktop browser widths.
  2. Cells have clear hover and keyboard-focus states, marks animate in when placed, and a win plays a celebration on the winning line.
  3. All text and UI elements meet WCAG AA contrast. The winning line, the current turn, and X versus O stay distinguishable in grayscale or colorblind simulation and in OS forced-colors (high-contrast) mode.
  4. With OS reduced-motion turned on, decorative motion is removed or minimized, but placed marks, the winning-line highlight, and the result text still appear immediately, so no information is lost.

**Plans**: TBD
**UI hint**: yes

### Phase 5: Accessible, Portfolio-Ready Release

**Goal**: As a portfolio reviewer, I want to run, test, and keyboard-play the finished game, so that I can judge its quality.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: A11Y-01, QUAL-05
**Success Criteria** (what must be TRUE):
  1. Using only the keyboard, a player can set up a game (mode, first player, difficulty, and names), play it to a result, start a new round, and reset scores. A visible focus indicator shows at every step, and focus is never lost when the board clears or the result appears.
  2. A manual pass with a real screen reader (NVDA or VoiceOver) through a full vs-computer game confirms that cell labels, turn changes, "Computer is thinking…", and results are each announced once and concisely. No composite ARIA role (such as `role="grid"`) is present.
  3. Someone new to the repo can follow the README to install, run the dev server, and run the tests. The README covers what the game is, how to run and test it, and design notes (engine/UI/persistence layering, the minimax approach, and accessibility decisions), and includes a screenshot of the finished, styled UI.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Two-Player Game | 2/4 | In Progress|  |
| 2. Play the Computer | 0/TBD | Not started | - |
| 3. Names & Saved Scoreboard | 0/TBD | Not started | - |
| 4. Playful Look & Feel | 0/TBD | Not started | - |
| 5. Accessible, Portfolio-Ready Release | 0/TBD | Not started | - |
