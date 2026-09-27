# Architecture Research

**Domain:** Browser-based turn-based board game (tic-tac-toe), portfolio piece
**Researched:** 2026-09-26
**Confidence:** HIGH (structural pattern) / MEDIUM (implementation specifics, web-sourced)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                            UI LAYER                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐     │
│  │  Board    │  │  Cell     │  │  ScorePanel│  │ SettingsBar│     │
│  │ (renders  │  │ (button,  │  │ (names,   │  │ (mode,     │     │
│  │ 3x3 grid) │  │ a11y attrs)│  │ tallies)  │  │ difficulty)│     │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬──────┘     │
│        │  reads state / dispatches intents (click, choose)        │
├────────┴────────────────┴──────────────┴──────────────┴──────────┤
│                      GAME STATE / CONTROLLER                     │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  GameController — orchestrates a turn:                    │    │
│  │  intent → engine.applyMove() → engine.checkResult()        │    │
│  │        → (if vs AI) ai.chooseMove() → engine.applyMove()   │    │
│  │        → persistence.save(scores/names)                    │    │
│  └──────────────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────────── ┤
│         GAME ENGINE (pure)      │        AI MODULE (pure)        │
│  ┌────────────────────────┐     │  ┌──────────────────────────┐  │
│  │ board create/validate   │     │  │ strategy per difficulty:  │  │
│  │ applyMove (immutable)   │     │  │  easy → random legal move │  │
│  │ checkWinner / checkDraw │◄────┼──┤  medium → win/block/random │  │
│  │ winning-line detection  │     │  │  hard → minimax (unbeatable)│ │
│  └────────────────────────┘     │  └──────────────────────────┘  │
├────────────────────────────────────────────────────────────────── ┤
│                       PERSISTENCE LAYER                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  storage.js — thin wrapper over window.localStorage:       │    │
│  │  getState()/setState() with try/catch + schema versioning  │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

This four-layer split (UI / Controller / Engine+AI / Persistence) is the de facto standard for small browser board games, and it's exactly the shape React's own official tutorial uses for tic-tac-toe: an immutable board array, a pure function that derives the winner from that array, and a UI layer that only renders and dispatches clicks. Independent OSS implementations converge on the same idea under different names (`engine.js`, `game-logic.js`, `core/`), consistently isolating board/move/win logic from rendering so it can be unit-tested without a DOM or component-render harness.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Game Engine | Board representation, move legality, win/draw detection, winning-line identification | Pure functions over a flat 9-element array or 3x3 grid; no side effects, no DOM/framework references |
| AI Module | Choose a move given a board + player + difficulty | Pure function per difficulty: random (easy), heuristic win/block/random (medium), minimax (hard) |
| Game Controller / Store | Orchestrate a turn: apply human move → check result → trigger AI move if applicable → update score → persist | Small reducer/state machine (`useReducer`, a Zustand/Pinia-style store, or a hand-rolled class) sitting between UI and engine |
| Persistence Layer | Read/write player names, scores, and preferences to `localStorage`; tolerate missing/corrupt data | Thin wrapper module (`storage.js`) with `try/catch`, JSON parse guarding, and a schema-version key |
| UI Layer | Render board/cells/score/settings; capture clicks & keyboard input; expose ARIA roles/labels/live regions | Components (or plain DOM + event listeners) that read state and dispatch intents — contain zero game rules |
| Test Suite | Verify engine correctness (win/draw/move validation) and AI guarantees (hard never loses) | Unit tests directly against engine/AI modules; no rendering required for the core logic tests |

## Recommended Project Structure

```
src/
├── engine/                 # Pure game rules — zero DOM/framework imports
│   ├── board.js            # createBoard, applyMove, isCellEmpty
│   ├── rules.js            # checkWinner, checkDraw, WINNING_LINES
│   └── engine.test.js      # unit tests: wins, draws, invalid moves
├── ai/                     # Pure decision logic — depends only on engine
│   ├── random.js           # easy strategy
│   ├── heuristic.js        # medium strategy (win/block/random)
│   ├── minimax.js          # hard strategy (unbeatable)
│   └── ai.test.js          # unit tests: hard never loses/draws-or-wins
├── state/                  # Orchestration + persistence
│   ├── gameController.js   # turn sequencing, calls engine + ai
│   ├── storage.js          # localStorage read/write, corruption-safe
│   └── state.test.js       # controller + persistence tests
├── ui/                     # Presentation only
│   ├── Board.(jsx|ts)
│   ├── Cell.(jsx|ts)
│   ├── ScorePanel.(jsx|ts)
│   ├── SettingsBar.(jsx|ts)
│   └── styles/
└── main.(jsx|ts)           # wires controller + UI together
```

### Structure Rationale

- **`engine/` isolated with no imports from `ui/` or `state/`:** this is the single most important boundary in the whole project — it's what makes "automated tests cover game logic" trivial to satisfy and is the pattern every reference implementation uses.
- **`ai/` depends only on `engine/` (never on `state/` or `ui/`):** keeps minimax testable in isolation and swappable per difficulty without touching game rules.
- **`state/` is the only layer allowed to talk to `localStorage`:** centralizing persistence avoids scattering `try/catch` JSON-parsing logic and makes it easy to test corruption-handling once.
- **`ui/` never imports minimax or win-detection logic directly — it calls the controller:** keeps components thin, so accessibility and animation work doesn't risk breaking game rules, and vice versa.

## Architectural Patterns

### Pattern 1: Pure Engine / Immutable State

**What:** Board state is a plain, serializable value (array of 9 cells, each `null | 'X' | 'O'`). Every operation (`applyMove`, `checkWinner`) takes the board in and returns a new board/result out — no mutation, no globals.
**When to use:** Always, for this project — it's what makes both unit testing and "undo/replay" style features cheap, and it's exactly React's own recommended tic-tac-toe pattern.
**Trade-offs:** Slightly more allocation than mutating in place, but at 9 cells this is irrelevant; the testability and predictability payoff is large relative to project size.

**Example:**
```typescript
type Cell = 'X' | 'O' | null;
type Board = Cell[]; // length 9

function applyMove(board: Board, index: number, player: 'X' | 'O'): Board {
  if (board[index] !== null) throw new Error('Invalid move: cell occupied');
  const next = [...board];
  next[index] = player;
  return next;
}
```

### Pattern 2: Strategy Pattern for AI Difficulty

**What:** Each difficulty level is a separate pure function with the same signature `(board, player) => moveIndex`. A dispatcher picks the strategy by name; no `if/else` difficulty branching leaks into the controller or UI.
**When to use:** As soon as more than one difficulty exists (this project needs 3+: Easy/Medium/Hard).
**Trade-offs:** Slight duplication of "find empty cells" helpers across strategies unless factored into a shared engine helper — worth sharing via `engine/board.js`.

**Example:**
```typescript
const strategies = { easy: randomMove, medium: heuristicMove, hard: minimaxMove };
function chooseMove(board: Board, player: 'X'|'O', difficulty: 'easy'|'medium'|'hard') {
  return strategies[difficulty](board, player);
}
```

### Pattern 3: Repository-style Persistence Wrapper

**What:** All `localStorage` access goes through one module exposing `loadGameData()` / `saveGameData(data)`, which internally handles `JSON.parse`/`stringify`, wraps access in `try/catch` (private browsing / storage-disabled / quota-exceeded / corrupted JSON all throw), and validates/repairs against a known shape before returning defaults.
**When to use:** Any browser app persisting to `localStorage`, especially where corrupted or absent data must not crash the app.
**Trade-offs:** One extra module/indirection layer, but it turns "browser storage can throw or return garbage" into a single tested chokepoint instead of scattered defensive code.

## Data Flow

### Turn Flow (human move)

```
[Click/Enter/Space on Cell]
    ↓
[UI dispatches intent: {type:'MOVE', index}]
    ↓
[Controller] → engine.applyMove(board, index, currentPlayer)
    ↓
[Controller] → engine.checkWinner(board) / checkDraw(board)
    ↓                                              ↓
[if game over] → update score → storage.save()   [if not over]
    ↓                                              ↓
[UI re-renders: board, status text, ARIA live region announces result]
```

### Turn Flow (AI move, appended when opponent is computer)

```
[Controller detects: game not over AND currentPlayer === AI]
    ↓
ai.chooseMove(board, aiPlayer, difficulty)
    ↓
engine.applyMove(board, chosenIndex, aiPlayer)
    ↓
(same checkWinner/checkDraw → score → persist → render path as above)
```

### Persistence Flow

```
[App boot] → storage.load() → { names, scores } or safe defaults
    ↓
[Controller seeds initial state]
    ↓
[Every score-changing event] → storage.save({ names, scores })
    ↓
[User clicks "Reset scores"] → storage.save(defaults) → controller re-seeds
```

### Key Data Flows

1. **Human move → engine → result → (maybe) AI move → engine → result → persist → render.** This is the single authoritative path; both human and AI moves flow through the *same* `applyMove`/`checkWinner` functions, so there is exactly one source of truth for legality and win detection (never duplicate win-checking logic for "AI wins" vs "human wins").
2. **Persistence is one-directional per event, not continuously synced:** state changes trigger a save; storage is never polled or watched. On boot, storage is read once to seed initial state.
3. **AI move computation must not block the win/draw check for the human's move it follows.** Because tic-tac-toe's search space is tiny (≤ 9!, effectively far smaller with pruning), a synchronous minimax call between "human moved" and "render" is standard and does not need a Web Worker or async scheduling — this only becomes a concern for larger boards/games, which are explicitly out of scope here.

## Scaling Considerations

This project has no realistic "scale" axis in the traditional sense (no concurrent users, no server) — the relevant "scale" is board size and search-tree size, which is fixed and tiny.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 3x3 board (this project) | Synchronous minimax on every AI turn; no memoization needed; render whole board on every state change — no perf work required |
| If ever extended to larger boards / variants (explicitly out of scope) | Would need alpha-beta pruning, move-ordering, and possibly a Web Worker to keep minimax off the main thread |
| If ever extended to online multiplayer (explicitly out of scope) | Controller layer would gain a network-sync boundary; engine/AI modules would be unaffected since they're already pure and side-effect-free |

### Scaling Priorities

1. **Not applicable to v1.** With a 3x3 board, minimax explores at most a few hundred thousand terminal nodes worst-case at the very first move and far fewer in practice — this completes in low single-digit milliseconds in any modern JS engine. No optimization is needed; alpha-beta pruning would be premature complexity for this scope.
2. **If the project later grows** (larger board, online play), the existing engine/AI/persistence separation is exactly what makes those additions additive rather than a rewrite — this is the main long-term payoff of the layering, not runtime performance.

## Anti-Patterns

### Anti-Pattern 1: Game Rules Coupled to the DOM/Framework

**What people do:** Put win-checking or move-validation logic inside a click handler or component method (`onClick={() => { if (board[i]===null) {...check winner inline...} }}`).
**Why it's wrong:** Makes the rules untestable without rendering the component, duplicates logic between human-move and AI-move code paths, and tangles accessibility/animation concerns with correctness concerns — exactly the kind of bug ("wrong win detected," "invalid move accepted") a portfolio piece cannot afford.
**Do this instead:** Keep `engine/` as plain functions with no framework imports; UI only calls into the controller, which calls the engine.

### Anti-Pattern 2: Mutating Board State In Place

**What people do:** `board[i] = player; return board;` — mutating and returning the same array reference.
**Why it's wrong:** Breaks React-style change detection (or any state-diffing UI layer), makes "undo" or history features impossible, and makes tests fragile because a previously-asserted board can be silently mutated later by unrelated code.
**Do this instead:** Always return a new array/object from engine operations (`[...board]` then modify the copy).

### Anti-Pattern 3: Letting AI Difficulty Leak Into the Controller/UI

**What people do:** `if (difficulty === 'hard') { ...inline minimax... } else if (difficulty === 'medium') {...}` scattered in the turn-orchestration code.
**Why it's wrong:** Makes it hard to unit-test "hard never loses" in isolation, and difficulty logic ends up duplicated or drifting from the UI's difficulty selector.
**Do this instead:** One `chooseMove(board, player, difficulty)` entry point in `ai/` that dispatches to a strategy function; controller only knows "ask AI for a move."

### Anti-Pattern 4: Trusting `localStorage` Blindly

**What people do:** `JSON.parse(localStorage.getItem('scores'))` with no `try/catch` and no shape validation.
**Why it's wrong:** Throws uncaught in private/incognito mode, when storage is disabled, when quota is exceeded, or when a prior version wrote a different shape — crashing the app on load.
**Do this instead:** Wrap all reads in `try/catch`, validate against an expected shape, and fall back to safe defaults; version the stored schema key so future changes don't choke on old data.

## Integration Points

### External Services

None. This is a local-only, no-backend project (per PROJECT.md constraints) — the only "external" API surface is the browser's own `localStorage`.

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Controller | Dispatched intents in, rendered state out (event handlers call controller methods/actions; controller exposes read-only state) | UI never imports `engine/` or `ai/` directly |
| Controller ↔ Engine | Direct function calls, synchronous, pure | Engine has zero knowledge of the controller or UI |
| Controller ↔ AI | Direct function call, synchronous, pure | AI has zero knowledge of the controller or UI; only sees board/player/difficulty |
| Controller ↔ Persistence | Direct function calls (`save`/`load`), synchronous (`localStorage` is sync) | Persistence never reaches back into controller/engine — one-directional |
| Engine ↔ AI | AI imports engine helpers (e.g., "get empty cells," "check winner") to evaluate positions | Keeps a single source of truth for what a "win" is, shared by both AI evaluation and game-over detection |

## Sources

- [React official tutorial pattern — pure winner-calculation over immutable board array (well-known, canonical reference for this exact project shape)](https://react.dev/learn/tutorial-tic-tac-toe) — MEDIUM confidence (web-sourced corroboration; pattern is widely and independently replicated)
- [GitHub - DrShahinstein/tic-tac-toe: minimax + React](https://github.com/DrShahinstein/tic-tac-toe) — MEDIUM
- [GitHub - jiahaog/ttt: React + unbeatable AI, engine.js pattern shared between app and tests](https://github.com/jiahaog/ttt) — MEDIUM
- [freeCodeCamp — How to make your Tic Tac Toe game unbeatable using minimax](https://www.freecodecamp.org/news/how-to-make-your-tic-tac-toe-game-unbeatable-by-using-the-minimax-algorithm-9d690bad4b37/) — MEDIUM
- [DataCamp — Implementing the Minimax Algorithm for AI in Python (difficulty-level pattern generalizes across languages)](https://www.datacamp.com/tutorial/minimax-algorithm-for-ai-in-python) — MEDIUM
- [nestedsoftware — Tic-Tac-Toe with the Minimax Algorithm](https://nestedsoftware.com/2019/06/15/tic-tac-toe-with-the-minimax-algorithm-5988.123625.html) — MEDIUM
- Cross-referenced against multiple independent OSS repos (Frontend Mentor solutions, MikeBild/react-tic-tac-toe, maximys963/tic-tac-toe) showing convergent engine/AI separation — MEDIUM, corroborated by repetition across independent sources

---
*Architecture research for: browser-based tic-tac-toe (portfolio piece)*
*Researched: 2026-09-26*
