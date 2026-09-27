# Requirements: Tic-Tac-Toe

**Defined:** 2026-09-26
**Core Value:** A complete, fun game of tic-tac-toe — against a friend or the computer — that plays correctly every time (valid moves, correct win/draw detection, sensible AI).

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Core Game

- [x] **GAME-01**: User can place their mark in any empty cell of a 3×3 board; occupied cells cannot be played
- [x] **GAME-02**: Players alternate turns automatically and the current turn is always shown
- [ ] **GAME-03**: Game detects a win on any of the 8 lines, including a win on the final (9th) move
- [ ] **GAME-04**: Game detects a draw when the board is full with no winner
- [ ] **GAME-05**: Result (win with player name, or draw) is announced and the board locks until a new round
- [ ] **GAME-06**: Winning three-in-a-row is visually highlighted (not by color alone)
- [ ] **GAME-07**: User can start a new round, which clears the board and keeps scores

### Game Modes

- [ ] **MODE-01**: User can choose a two-player local (same device) game
- [ ] **MODE-02**: User can choose a single-player game against the computer
- [ ] **MODE-03**: User can choose who goes first (either player, or human vs. computer)

### Computer Opponent

- [ ] **AI-01**: User can pick a difficulty (Easy / Medium / Hard) before playing
- [ ] **AI-02**: Easy picks a random legal move
- [ ] **AI-03**: Medium wins if it can, blocks an immediate threat, otherwise plays randomly
- [ ] **AI-04**: Hard plays perfectly (minimax) and never loses
- [ ] **AI-05**: Computer moves after a short "Computer is thinking…" delay; user input is locked during it and a pending AI move is cancelled on new round/reset

### Players & Scoring

- [ ] **PLYR-01**: User can enter player names (defaults: "Player X" / "Player O" / "Computer")
- [ ] **PLYR-02**: Scoreboard shows wins per player and draws for the current matchup
- [ ] **PLYR-03**: User can reset scores (separate action from new round)
- [ ] **PLYR-04**: Names and scores persist across page refresh via browser storage
- [ ] **PLYR-05**: App loads normally with defaults if stored data is missing, corrupted, or storage is unavailable

### Look & Feel

- [ ] **UI-01**: Playful, colorful visual theme with distinct X and O styling
- [ ] **UI-02**: Lively feedback — cell hover/focus states, mark-placement animation, win celebration
- [ ] **UI-03**: Layout works well on desktop browsers (desktop-first)

### Accessibility

- [ ] **A11Y-01**: Entire game (setup, moves, new round, reset) is playable with keyboard only, with a visible focus indicator
- [ ] **A11Y-02**: Each cell has a screen-reader label with its position and contents (e.g. "Row 1, column 2, X")
- [ ] **A11Y-03**: Turn changes and game results are announced to screen readers via a single polite live region
- [ ] **A11Y-04**: Text and UI elements meet WCAG AA contrast
- [ ] **A11Y-05**: Respects prefers-reduced-motion — decorative motion is reduced without losing any state information

### Quality & Docs

- [ ] **QUAL-01**: Automated unit tests cover game rules (all win lines, draw, win-on-final-move, invalid moves)
- [ ] **QUAL-02**: Automated tests prove Hard never loses (exhaustive or large-sample, AI-first and human-first)
- [ ] **QUAL-03**: Component tests plus automated accessibility (axe) checks on the rendered UI
- [x] **QUAL-04**: CI (GitHub Actions) runs lint, typecheck, and tests on every push
- [ ] **QUAL-05**: README covers what it is, how to run, how to test, design notes, and a screenshot

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Polish & Reach

- **RESP-01**: Responsive layout that plays well on phones
- **E2E-01**: Playwright end-to-end keyboard playthrough with zero axe violations
- **COV-01**: Enforced test coverage thresholds (e.g. engine/AI 100%)
- **DEPLOY-01**: Hosted at a live URL (e.g. GitHub Pages)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Online / networked multiplayer | Requires servers; v1 is local hot-seat only |
| Accounts, login, server leaderboards | No backend; scores live in the browser |
| Board variants (4×4, ultimate) | Keep focus on the classic game |
| Native mobile app | Browser only |
| Sound effects | Not requested; adds asset + a11y considerations |
| Move history / undo | Not requested; keep v1 tight |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GAME-01 | Phase 1 | Complete |
| GAME-02 | Phase 1 | Complete |
| GAME-03 | Phase 1 | Pending |
| GAME-04 | Phase 1 | Pending |
| GAME-05 | Phase 1 | Pending |
| GAME-06 | Phase 1 | Pending |
| GAME-07 | Phase 1 | Pending |
| MODE-01 | Phase 2 | Pending |
| MODE-02 | Phase 2 | Pending |
| MODE-03 | Phase 2 | Pending |
| AI-01 | Phase 2 | Pending |
| AI-02 | Phase 2 | Pending |
| AI-03 | Phase 2 | Pending |
| AI-04 | Phase 2 | Pending |
| AI-05 | Phase 2 | Pending |
| PLYR-01 | Phase 3 | Pending |
| PLYR-02 | Phase 3 | Pending |
| PLYR-03 | Phase 3 | Pending |
| PLYR-04 | Phase 3 | Pending |
| PLYR-05 | Phase 3 | Pending |
| UI-01 | Phase 4 | Pending |
| UI-02 | Phase 4 | Pending |
| UI-03 | Phase 4 | Pending |
| A11Y-01 | Phase 5 | Pending |
| A11Y-02 | Phase 1 | Pending |
| A11Y-03 | Phase 1 | Pending |
| A11Y-04 | Phase 4 | Pending |
| A11Y-05 | Phase 4 | Pending |
| QUAL-01 | Phase 1 | Pending |
| QUAL-02 | Phase 2 | Pending |
| QUAL-03 | Phase 1 | Pending |
| QUAL-04 | Phase 1 | Complete |
| QUAL-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-26*
*Last updated: 2026-09-26 after roadmap creation (traceability mapped)*
