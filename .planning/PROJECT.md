# Tic-Tac-Toe

## What This Is

A playful, colorful tic-tac-toe game that runs in a web browser. Two players can go head-to-head locally on the same device, or a single player can take on a computer opponent at a chosen difficulty. It's built as a portfolio piece: polished to play, accessible, tested, and clearly documented.

## Core Value

A complete, fun game of tic-tac-toe — against a friend or the computer — that plays correctly every time (valid moves, correct win/draw detection, sensible AI).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Game is playable in a modern web browser on a 3×3 board
- [ ] Two players can play head-to-head locally on the same device (hot-seat)
- [ ] Single player can play against a computer opponent
- [ ] Computer opponent has selectable difficulty levels (e.g. Easy, Medium, Hard — Hard is unbeatable)
- [ ] Game detects wins and draws correctly and announces the result
- [ ] Winning three-in-a-row is visually highlighted
- [ ] Players can enter names instead of just "X" and "O"
- [ ] Players can choose who goes first (including human vs. computer)
- [ ] Running score tally (wins per player, draws) is shown
- [ ] Names and scores persist across page refreshes (browser storage) until the player resets them
- [ ] Players can start a new round and reset scores
- [ ] Playful, colorful visual style with lively feedback/animation
- [ ] Accessible: fully keyboard-playable, screen-reader labels and announcements, sufficient color contrast, respects reduced-motion
- [ ] Automated tests cover game logic (win/draw detection, move validation) and AI behavior (Hard never loses)
- [ ] Clean README: what it is, how to run it, how to test it, design notes, screenshot

### Out of Scope

- Online / networked multiplayer — v1 is local hot-seat only; adds servers and complexity
- Accounts, login, or server-side leaderboards — scores live in the browser
- Deployment / hosting to a live URL — local only for now; can be added later
- Larger boards or variants (4×4, ultimate tic-tac-toe) — keep focus on classic game
- Native mobile app — browser only (responsive layout is nice-to-have, not a v1 priority)

## Context

- Greenfield project; repo currently contains only a README ("For testing Claude commands"). Doubles as a sandbox for exercising Claude Code / GSD workflows.
- Intended as a portfolio piece — code quality, tests, accessibility and README are part of what's being shown off, not afterthoughts.
- Tech stack not chosen by the user — to be recommended by research (portfolio-friendly, easy to run locally, easy to test).

## Constraints

- **Platform**: Runs in a modern web browser — user requirement
- **Runtime**: Runs locally (dev server or static open); no backend — local-only v1, persistence via browser storage
- **Quality**: Automated tests and accessibility are required, not optional — portfolio goals

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local hot-seat multiplayer only (no online) | Keeps v1 simple; matches user's "head-to-head local" | — Pending |
| AI with difficulty levels, Hard = unbeatable | User wants selectable challenge; unbeatable Hard is a good testable guarantee | — Pending |
| Persist names/scores in browser storage | User wants them to survive refresh; no backend needed | — Pending |
| Playful & colorful visual style | User preference | — Pending |
| Local only, no deployment in v1 | User choice; hosting can come later | — Pending |
| Stack: Vite + React 19 + TypeScript 6 + Vitest | Research recommendation, user chose React over vanilla; TS 6 not 7 (tooling compat) | — Pending |
| Desktop-first; responsive/mobile deferred to v2 | User choice during requirements scoping | — Pending |
| AI "thinking" delay + CI (GitHub Actions) in v1 | User opted into these stretch items | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-26 after initialization*
