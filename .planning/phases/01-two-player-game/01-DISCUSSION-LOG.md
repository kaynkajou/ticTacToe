# Phase 1: Two-Player Game - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md. This log preserves the alternatives considered.

**Date:** 2026-09-26
**Phase:** 1-Two-Player Game
**Areas discussed:** Winning-line cue & wording, Game-over & New round flow
**Areas offered but not selected:** Phase 1 visual baseline, Tooling & CI strictness (left to Claude's discretion)

---

## Winning-line cue & wording

### Non-color cue for winning cells
| Option | Description | Selected |
|--------|-------------|----------|
| Thick outline on cells | Heavy border/outline on each winning cell; simple, forced-colors-friendly | |
| Strike line across the line | Classic line drawn through the three cells; needs geometry for 8 orientations | ✓ |
| Both | Outline now, strike line in Phase 4 | |
| You decide | | |

### Status wording before names exist
| Option | Description | Selected |
|--------|-------------|----------|
| "X's turn" / "X wins!" / "It's a draw" | Short and concise; Phase 3 swaps in names | ✓ |
| "Player X's turn" / "Player X wins!" | Matches the Phase 3 default names already | |
| You decide | | |

### Cell accessible label phrasing
| Option | Description | Selected |
|--------|-------------|----------|
| "Row 1, column 2, X" / "…, empty" / "…, X, winning" | Matches the roadmap example | ✓ |
| "Row 1, column 2: X" + aria-disabled | Colon phrasing, relies on "unavailable" | |
| You decide | | |

### Disabled cells
| Option | Description | Selected |
|--------|-------------|----------|
| aria-disabled, stay focusable | Board stays reviewable via Tab | ✓ |
| Native disabled attribute | Removed from Tab order | |
| You decide | | |

### Strike line in forced-colors mode
| Option | Description | Selected |
|--------|-------------|----------|
| Strike line + subtle outline fallback | System-color outline as a backup cue | |
| Strike line only, forced-colors-safe | currentColor/CanvasText SVG or border | |
| You decide | Must stay visible in forced-colors | ✓ |

---

## Game-over & New round flow

### New round availability
| Option | Description | Selected |
|--------|-------------|----------|
| Always visible, always enabled | Stable Tab position; supports mid-game restart | ✓ |
| Always visible, enabled after first move | Avoids no-op reset | |
| Only appears after game over | Cleaner, but complicates focus | |

### Focus when game ends
| Option | Description | Selected |
|--------|-------------|----------|
| Stay on the cell just played | No focus jump; live region announces | |
| Move to New round button | One keypress to replay | ✓ |
| You decide | | |

### Focus after New round
| Option | Description | Selected |
|--------|-------------|----------|
| Stay on New round button | Native default | |
| Move to the first (top-left) cell | Ready to play immediately | ✓ |
| You decide | | |

### Where the result appears
| Option | Description | Selected |
|--------|-------------|----------|
| In the status line above the board | Same single live region; no overlay | ✓ |
| Overlay/banner on the board | More dramatic; modal/focus concerns | |

### Keeping the result audible when focus moves (follow-up)
| Option | Description | Selected |
|--------|-------------|----------|
| aria-describedby from New round → status | Focus reads "New round, button, X wins!" | ✓ |
| Short delay before moving focus | Timing-dependent, fragile | |
| You decide | | |

**Notes:** Claude flagged that moving focus at game end can cause the polite live-region announcement to be dropped. The user chose aria-describedby as the mitigation. Phase 5 will verify it manually.

---

## Claude's Discretion

- How the strike line is implemented and how it survives forced-colors mode
- Minimal Phase 1 visual styling (area not selected for discussion)
- Tooling & CI details (area not selected): tsconfig strictness, Node version, Prettier check in CI, pre-commit hooks
- File/module layout

## Deferred Ideas

None.
