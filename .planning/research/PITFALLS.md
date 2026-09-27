# Pitfalls Research

**Domain:** Browser-based tic-tac-toe game (local hot-seat + vs-computer AI, portfolio piece)
**Researched:** 2026-09-26
**Confidence:** MEDIUM (web-search sourced; individual sources are LOW-tier per source hierarchy, but findings are corroborated across multiple independent sources — GitHub issues/PRs on real tic-tac-toe implementations, MDN, W3C ARIA guidance, and React's own tutorial follow-ups — and align with well-established, non-controversial engineering practice. Treat specifics as directional, not gospel; the prevention strategies below are standard practice regardless of source tier.)

## Critical Pitfalls

### Pitfall 1: Draw detection is missing, wrong-ordered, or an afterthought

**What goes wrong:**
The board fills up with no three-in-a-row and the game either hangs (no result shown), throws an error, or — worse — incorrectly reports a win. A related variant: draw is checked *before* win on the final (9th) move, so a game that is actually won on the last move gets reported as a draw instead.

**Why it happens:**
Win-checking gets all the design attention (it's the "interesting" logic); draw is treated as "just check if the board is full," bolted on afterward without checking it runs in the correct order relative to win detection. It's also the one board state (full board) that's easy to forget to test because it requires playing out a full game.

**How to avoid:**
Always evaluate in this order after every move: (1) did the move complete three-in-a-row? → win; (2) else, is the board full? → draw; (3) else, game continues. Never check draw before win. Write the full-board-with-a-win-on-the-last-move case as an explicit test, not just full-board-no-winner.

**Warning signs:**
No test exists for "win on move 9" (the simultaneous full-board-and-win edge case). Draw logic is a single `isBoardFull()` check with no reference to win state at all.

**Phase to address:**
Core game logic / engine phase (before any UI work). Verification: unit tests for all 8 winning lines, a full-board draw, and the win-on-last-move edge case.

---

### Pitfall 2: Minimax mutates shared board state without properly restoring it

**What goes wrong:**
The AI's search explores a move, recurses, and either forgets to undo it or clones incorrectly, so sibling branches see contaminated board state left over from a previous branch. Symptom: the AI occasionally makes a move that ignores an obvious block or win, or behaves inconsistently between otherwise-identical positions.

**Why it happens:**
In-place mutate-then-undo is the "efficient" naive pattern copied from tutorials, but it's easy to get wrong (e.g., forgetting to reset the cell in one early-return path, or restoring the wrong index after a refactor). On a 9-cell board the performance cost of cloning is negligible, so the "efficiency" gained by mutation is not worth the risk.

**How to avoid:**
Clone the board (or work on a copy) before each simulated move rather than mutate-and-undo. With only 9 cells and a full-depth search, this is cheap and eliminates an entire class of bugs. If mutation is used anyway, make the undo unconditional (e.g., in a `finally`-equivalent) so every code path restores state.

**Warning signs:**
AI plays a losing or non-optimal move in a specific position but plays correctly if you reset and replay just that position — a classic sign of state leaking between search branches.

**Phase to address:**
AI/computer-opponent phase. Verification: automated test that Hard difficulty never loses across a large sample of played-out games (including AI-goes-first and AI-goes-second), not just a handful of manually-checked positions.

---

### Pitfall 3: AI move timing creates an input race that lets the human move twice or skips the AI's turn

**What goes wrong:**
The computer's move is delayed (e.g., `setTimeout`) to feel more natural, but clicks on other cells during that delay are not blocked. The human places a piece, the turn flips back, and the pending AI move then also fires — one side effectively gets two moves in a row, or the board ends up in an impossible/corrupted state. This is a documented real bug in React tic-tac-toe implementations, not a hypothetical.

**Why it happens:**
Turn-taking is modeled as "whoever's turn it is can click" without an explicit `isThinking`/`isAiTurn` guard, and the delayed move is scheduled independently of whatever the human does in the meantime. Restarting the game while a delayed AI move is still pending is a second variant of the same root cause (a stale timer fires after reset).

**How to avoid:**
- Ignore/disable board clicks entirely while it is the AI's turn (a single boolean guard checked at the top of the click handler, not just a UI-disabled style).
- Store the timeout/animation-frame id for the pending AI move and cancel it whenever the game resets or a new round starts, so a stale move can never apply to a new board.
- Prefer deriving "whose turn is it" from the board state itself (count of X vs O) rather than tracking it as separate mutable state that can drift out of sync.

**Warning signs:**
Rapidly clicking multiple cells during the "AI thinking" delay produces an invalid board (two moves for one player in a row, or a filled cell overwritten). Resetting mid-AI-turn occasionally causes a move to land on the fresh board.

**Phase to address:**
AI/computer-opponent phase, specifically the UI-integration step where AI moves meet the click handler. Verification: a test or manual script that clicks during the AI's delay and asserts no double-move occurs; a test that resets during a pending AI turn and asserts the new board is unaffected.

---

### Pitfall 4: localStorage reads/writes aren't defensively guarded, so corrupted or absent data crashes the app

**What goes wrong:**
On load, the app calls `JSON.parse` on whatever is in localStorage. If that value is missing, empty, from an older/incompatible version of the app, or was manually edited by a curious user via devtools, `JSON.parse` throws a `SyntaxError` that isn't caught — and the whole app fails to initialize (blank page) instead of just resetting scores. Similarly, `setItem` can throw `QuotaExceededError` (rare here, but private-browsing/blocked storage can throw on any access).

**Why it happens:**
Persistence code is usually added late, written optimistically ("it'll always be there because I wrote it"), and never tested against a first-run (no key present), a manually-corrupted value, or storage being disabled/blocked (private browsing, browser settings, some corporate policies).

**How to avoid:**
Wrap every localStorage read and write in try/catch, falling back to sane defaults (empty scores, default names) on any failure. Validate the *shape* of parsed data before trusting it (e.g., scores are numbers, names are strings) rather than assuming JSON.parse succeeding means the data is well-formed. Treat "storage unavailable" as a normal, expected condition (feature degrades gracefully to in-memory-only) rather than a fatal error.

**Warning signs:**
No test exists for "localStorage key present but not valid JSON" or "localStorage throws on access." Persistence code is untested because "it works when I click through it once."

**Phase to address:**
Persistence phase. Verification: unit tests that seed localStorage with malformed/missing/wrong-shape data and assert the app still boots with defaults; a manual check with storage disabled (private window) that the game is still playable (just without persistence).

---

### Pitfall 5: Game logic is coupled to the DOM, making it hard or impossible to unit test

**What goes wrong:**
Win/draw checking, move validation, and AI move selection are written as functions that read `document.querySelector` results or mutate DOM elements directly, rather than operating on a plain data structure (e.g., a 9-element array). The only way to "test" the logic is to render the whole UI and simulate clicks, which is slow, brittle, and can't easily cover edge cases (e.g., feeding the AI a specific board position to verify it blocks/wins correctly).

**Why it happens:**
It's the fastest way to get something on screen when following along with a basic tutorial, and the coupling isn't obviously painful until you try to write tests or add a feature (like difficulty levels) that needs to reason about board state independent of what's rendered.

**How to avoid:**
Keep board state as a plain array/object and write all game logic (win check, draw check, move validation, minimax/AI) as pure functions that take state in and return state/decisions out, with zero DOM references. The rendering layer only reads state and re-renders; it never contains game rules. This also directly enables the automated tests this project requires (win/draw detection, AI-never-loses) to run fast, in isolation, without a browser or DOM.

**Warning signs:**
You can't write a test for "does the AI block this specific threat" without first rendering the full UI and clicking cells in sequence. Game-rule functions have `document` or `window` in their bodies.

**Phase to address:**
Should be a foundational decision made at project/architecture setup, before the game-logic phase is built — retrofitting decoupling later means rewriting the logic layer anyway.

---

### Pitfall 6: The board isn't actually keyboard-operable, only visually clickable

**What goes wrong:**
Cells are `<div>`s or `<span>`s with click handlers and no `tabindex`, `role="button"`/`role="gridcell"`, or keyboard event handlers. A keyboard-only or screen-reader user cannot focus a cell, let alone activate it with Enter/Space. This directly fails the "fully keyboard-playable" requirement.

**Why it happens:**
Click handlers "work" visually in normal mouse-driven manual testing, so the gap is invisible unless someone explicitly tests with Tab/Enter or a screen reader. Native HTML elements (`<button>`) have this behavior for free; custom `<div>`-based cells do not and require it to be built manually.

**How to avoid:**
Use native `<button>` elements for cells (they get focus, Enter/Space activation, and correct default semantics for free) rather than styled `<div>`s. If a composite grid-navigation pattern (arrow keys moving between cells) is wanted, it must be deliberately implemented with roving `tabindex` — but a 3×3 board of 9 independently-tabbable buttons is simpler, robust, and arguably a *better* experience here, since full ARIA `grid`/composite-widget patterns are easy to get wrong (see Pitfall 7) and add complexity a 9-cell board doesn't need.

**Warning signs:**
Unplug the mouse and try to play using only Tab and Enter — if you can't, so can't a real user. Cells have no visible focus ring in default browser styling.

**Phase to address:**
Accessibility should be built into the initial board/UI phase, not bolted on afterward — retrofitting keyboard support onto already-styled `div`-soup is more expensive than building it in from the first render.

---

### Pitfall 7: `role="grid"` (or other composite ARIA roles) added without the required keyboard behavior — an accessibility anti-pattern that makes things worse, not better

**What goes wrong:**
A well-meaning attempt at "more accessible" markup adds `role="grid"`/`role="row"`/`role="gridcell"` to the 3×3 board because it visually looks like a grid. Screen readers then switch into grid-navigation mode, expecting arrow-key roving and suppressing normal tab-through-elements behavior — but if that keyboard behavior isn't actually implemented, the result is *more* broken for screen-reader users than plain unstyled buttons would have been.

**Why it happens:**
ARIA roles are often treated as "accessibility seasoning" to sprinkle on for compliance, without understanding that composite widget roles (`grid`, `listbox`, `tree`, etc.) come with a full contract of required keyboard behavior. Adding the role without the behavior is worse than adding no role at all.

**How to avoid:**
Do not add `role="grid"` (or similar) unless implementing the full ARIA composite-widget keyboard pattern (arrow keys move focus without wrapping, Home/End, roving tabindex, etc). For this project's scope, prefer the simpler, robust pattern from Pitfall 6: plain `<button>` cells in a visual grid layout (CSS grid for layout only), each independently focusable via normal Tab order. Layout can look like a grid without the accessibility tree claiming to be an ARIA grid widget.

**Warning signs:**
`role="grid"` appears in the markup but there's no arrow-key handler anywhere in the codebase.

**Phase to address:**
Accessibility/UI phase — should be a conscious decision documented in that phase's plan, not an assumption.

---

### Pitfall 8: Game outcome and turn changes aren't announced to screen-reader users (or over-announced, spamming them)

**What goes wrong:**
A sighted player sees the winning line highlight and a "X wins!" banner appear; a screen-reader user hears nothing, because the change is a plain DOM update with no `aria-live` region — the requirement to "announce the result" silently fails for assistive tech. The opposite failure also happens: marking too much of the UI (e.g., the whole board) as `aria-live`, causing every single move to be read aloud verbosely, which is disorienting rather than helpful.

**Why it happens:**
`aria-live` is invisible in normal visual testing, so its absence (or its miscalibration) is never caught without deliberately testing with a screen reader. Developers who do add it often apply it broadly ("wrap everything in aria-live to be safe") rather than scoping it to the specific status message that should be announced.

**How to avoid:**
Use one dedicated, visually-present status region (e.g., "It's X's turn" / "X wins!" / "It's a draw") marked `aria-live="polite"`, updated only when the message actually changes (turn change, win, draw). Don't mark the whole board live. Keep announcements short and specific ("O wins" not a restating of the whole board state).

**Warning signs:**
No element in the markup has `aria-live`. Or: testing with a screen reader on, every click floods multiple redundant announcements.

**Phase to address:**
Accessibility/UI phase, alongside the win/draw-announcement feature itself — this is one requirement ("announces the result") with both a visual and a non-visual half; build both at once rather than treating aria-live as a separate later pass.

---

### Pitfall 9: The winning line and turn indicator are conveyed by color alone

**What goes wrong:**
The winning three-in-a-row is highlighted only by a background/text color change, and/or whose-turn-it-is is shown only via a color swatch. Colorblind users (and anyone in `forced-colors`/high-contrast mode, where custom colors can be overridden by the OS) can't perceive the distinction, failing the "sufficient color contrast" and general accessibility requirement even if contrast ratios are technically fine for typical vision.

**Why it happens:**
Color is the fastest, most visually pleasing way to add "playful" feedback (matches the project's playful/colorful goal), and it's easy to ship without checking a colorblindness simulator or a forced-colors mode.

**How to avoid:**
Pair every color-coded state with a non-color signal: an icon/shape change, a text label, a border/outline style, or a strikethrough/pattern on the winning line — not color as the *only* differentiator. Spot-check the design with a colorblindness simulation and with the OS forced-colors/high-contrast mode enabled.

**Warning signs:**
Toggle a colorblindness simulator (or grayscale filter) on the UI — if the winner's line or the turn indicator becomes indistinguishable from normal cells, this pitfall is present.

**Phase to address:**
Visual design/UI polish phase — should be a design constraint from the start given the "playful and colorful" requirement is explicitly paired with the "accessible" requirement in this project's scope.

---

### Pitfall 10: Animations ignore `prefers-reduced-motion`, or reduced-motion mode silently removes needed feedback

**What goes wrong:**
Two opposite failures both happen in practice. Either (a) win celebrations, piece-drop animations, or hover effects play at full intensity regardless of the user's OS-level reduced-motion setting, causing discomfort for motion-sensitive users; or (b) the reduced-motion media query is used as a blunt "disable everything" switch, which also strips out the animation that was the *only* way a state change (e.g., whose turn it is, or that a win occurred) was being communicated — leaving reduced-motion users with less information, not just less flourish.

**Why it happens:**
`prefers-reduced-motion` is treated as a binary on/off for all animation rather than "remove large/non-essential motion, keep or replace essential state-change cues with a static/instant equivalent."

**How to avoid:**
Wrap decorative motion (bounce, spin, parallax-style flourishes) in a `prefers-reduced-motion: reduce` media query that disables or shortens it. For any animation that also communicates information (e.g., the winning line drawing itself in), ensure the *end state* (the highlighted line, the result text) still appears instantly/statically when motion is reduced — never let "reduced motion" mean "reduced information."

**Warning signs:**
No `@media (prefers-reduced-motion: reduce)` rule exists anywhere in the stylesheet. Or: enabling reduced-motion in OS settings and replaying a win removes the win highlight entirely along with the animation.

**Phase to address:**
Visual design/animation phase, verified against the explicit "respects reduced-motion" requirement.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|------------------|
| Track "current player" as separate mutable state instead of deriving it from move count/board | Slightly simpler mental model at first | Can drift out of sync with actual board state, especially around resets and the AI-turn race (Pitfall 3) | Never for this project — derive it |
| Full-depth, unmemoized minimax on every AI move | Trivial to implement, "just works" | None material here — 9-cell board has at most 9! branches, well within instant recompute; memoization would be over-engineering | Always acceptable for tic-tac-toe specifically; would NOT be acceptable if the board size grew |
| Store only win/loss/draw tallies in localStorage, no move history | Minimal persistence code | Can't add a "replay last game" or undo feature later without redesigning storage | Acceptable for v1 given explicit out-of-scope on larger features |
| Skip a version field in the localStorage payload | One less field to write | Future app updates that change the score-shape can't distinguish "old shape" from "corrupted," making migration/defaulting logic guess wrong | Acceptable only if the team commits to never changing the persisted shape, which is unlikely — cheap to include from day one |
| Use `<div onClick>` cells styled to look like buttons | Faster initial styling, no button reset CSS needed | Loses free keyboard focus/activation (Pitfall 6), must be manually reimplemented | Never — use `<button>` from the start, it's not actually slower |

## Integration Gotchas

No external services are in scope for this project (local-only, no backend, no accounts per PROJECT.md). The only "integration" is with browser-provided APIs:

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| `window.localStorage` | Assuming it's always available and always parses cleanly | Guard every access in try/catch; treat unavailability/corruption as a normal, handled case (Pitfall 4) |
| `prefers-reduced-motion` / `forced-colors` media queries | Assuming these are edge cases nobody uses, skipping them | Treat as a required, testable state given this project's explicit accessibility requirement (Pitfalls 9–10) |
| Screen reader / assistive tech | Assuming visual QA (clicking through with a mouse, sighted review) is sufficient verification | Actually test with a keyboard-only pass and at least one real screen reader (NVDA/VoiceOver) before calling accessibility "done" |

## Performance Traps

Tic-tac-toe on a 3×3 board is not performance-sensitive at any realistic scale — the entire game tree is at most 9! (362,880) nodes, trivially searchable synchronously. There is effectively no scale axis here (single local user, no growth in data). The one trap worth naming:

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering the entire board (and re-running full minimax) on every keystroke/hover rather than only on actual moves | Sluggish or flickery UI feel, wasted work | Only trigger AI computation and full re-render on an actual completed move, not on every mouseover/focus event | Not a real risk at this scale, but worth avoiding by default for code cleanliness — it's a bad habit, not a bug here |

## Security Mistakes

This is a local-only, no-backend, no-accounts, single-device game (per PROJECT.md's Out of Scope). Traditional web security concerns (auth, injection, CSRF, secrets) do not apply. The only realistic "security-adjacent" concern:

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting localStorage contents as inherently safe/well-formed | A user (or browser extension, or shared-computer previous session) can freely edit localStorage via devtools; unvalidated trust could let a crafted value crash the app or corrupt displayed scores | Validate shape/types of anything read from localStorage before use (same fix as Pitfall 4) — this is a robustness issue more than a security one, but the mitigation is identical |
| Rendering a player-entered name directly as raw HTML | If names are ever inserted via `innerHTML` rather than as text content, a player entering `<img src=x onerror=...>` as their "name" could execute script in their own browser (self-XSS; low real risk locally, but bad practice) | Always render user-entered names as text (`textContent`/React text child), never via `innerHTML` |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| No feedback when clicking an already-occupied cell | Player thinks the game is unresponsive/broken | Ignore the click silently or give a subtle "that's taken" cue — never let it look like nothing happened for an unknown reason |
| AI moves instantly with zero delay | Feels robotic/jarring, undermines the "playful" feel and makes it hard to follow what happened | A small, consistent delay (a few hundred ms) before the AI's move reads as more natural — but must be paired with the input-lock from Pitfall 3 |
| No visual distinction between "your turn" and "computer is thinking" | Player tries to click during the AI's delay, gets confused when it's ignored | Show an explicit status ("Computer is thinking…") during the AI's delay, disable/gray the board, and pair with the aria-live status update from Pitfall 8 |
| Resetting the round also silently resets the persisted score tally | Player loses their running score by accident when they just wanted a new round | Keep "new round" (clears the board) and "reset scores" (clears the tally) as clearly separate actions — PROJECT.md already implies this distinction; don't collapse them in the UI |
| Difficulty selection buried or unclear about what "Hard" means | Player is surprised Hard is literally unbeatable and feels the game is unfair rather than accurately labeled | Label difficulty honestly (e.g., "Hard (unbeatable)") since PROJECT.md commits to Hard being provably unbeatable — set that expectation up front |

## "Looks Done But Isn't" Checklist

- [ ] **Win detection:** Often missing the "win achieved on the final (9th) move" edge case — verify a test exists where the board fills up *and* completes a line simultaneously, and confirm it reports a win, not a draw.
- [ ] **AI "Hard is unbeatable" claim:** Often verified only by the developer playing a few rounds manually — verify with an automated test that plays out many/all human-first and AI-first games against Hard and asserts it never loses.
- [ ] **Keyboard playability:** Often "looks" done because Tab reaches the cells, but Enter/Space doesn't activate them, or focus order is wrong after a board reset — verify by playing an entire game using only Tab/Enter/Space, no mouse.
- [ ] **Screen-reader announcements:** Often present for the win/draw message but missing for whose-turn-it-is, or vice versa — verify both are announced by actually running a screen reader (not just checking `aria-live` exists in markup).
- [ ] **localStorage persistence:** Often tested only in the happy path (works after a normal refresh) — verify by manually corrupting the stored value (or clearing it, or disabling storage in a private window) and confirming the app still loads with sane defaults instead of crashing.
- [ ] **Reduced motion:** Often implemented as "no bounce animation" but the win-highlight or turn-change *information* silently disappears too — verify by enabling OS-level reduced-motion and confirming all state changes are still visible, just less animated.
- [ ] **Color-only cues:** Often "looks" accessible because contrast ratios pass, but colorblind users still can't distinguish states — verify with a colorblindness simulation, not just a contrast checker.
- [ ] **README:** Often written once at the very start and never updated to match the finished feature set — verify it accurately lists how to run, how to test, and includes a real screenshot of the finished, styled UI (not a rough draft).

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|------------------|
| Draw/win detection bug shipped | LOW | Isolated pure-function logic (Pitfall 5 prevention) means the fix is a small, testable patch to one function, not a UI rewrite |
| Minimax board-mutation bug found late | MEDIUM | Requires tracing through recursive calls to find the leak; switching to clone-per-branch is a contained rewrite of the AI module only if logic is decoupled from UI |
| AI/input race condition found late | LOW–MEDIUM | Add the turn-lock guard and stale-timer cancellation; low cost if state management is already centralized, higher if turn state is scattered across multiple components |
| localStorage crash-on-corrupt-data found in the wild | LOW | Wrap existing read/write calls in try/catch with fallback defaults; doesn't require a data migration since defaults are safe |
| Accessibility gaps (keyboard/aria/color) found after "done" | MEDIUM–HIGH | Retrofitting keyboard support onto div-based cells or adding live regions after the fact touches most of the UI layer; cheaper to build in from the first UI phase than to retrofit |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| Draw/win detection ordering bugs | Core game logic phase | Unit tests cover all 8 win lines, full-board draw, and win-on-final-move |
| Minimax board mutation bugs | AI/computer-opponent phase | Automated test: Hard never loses across many played-out games, both orders (AI first / human first) |
| AI move timing / input race | AI/computer-opponent phase (UI integration step) | Manual/automated test: rapid clicking during AI delay never produces an invalid board; reset during pending AI move doesn't corrupt new board |
| localStorage corruption/crash | Persistence phase | Unit tests seed malformed/missing localStorage and assert graceful default fallback |
| Logic coupled to DOM | Architecture/setup, before game-logic phase | Code review check: game-logic module has no DOM/window references; tests run without a browser |
| Keyboard-inaccessible board | Initial board/UI phase | Manual pass: complete a full game using only keyboard |
| Misused `role="grid"` / composite ARIA | Accessibility/UI phase | Code review: no composite ARIA role added without matching keyboard behavior implemented |
| Missing/miscalibrated aria-live announcements | Accessibility/UI phase | Manual screen-reader pass: turn changes and results are announced once, concisely, not spammed |
| Color-only state indicators | Visual design/UI polish phase | Colorblindness simulation check on win-highlight and turn indicator |
| Reduced-motion strips information | Visual design/animation phase | Manual check with OS reduced-motion enabled: all state-change information still visible |

## Sources

- [fix(ai): ignore clicks while the AI is thinking and cancel stale AI moves — ShambhaviCode/TicTac-Pro PR #1](https://github.com/ShambhaviCode/TicTac-Pro/pull/1) — documents the exact human/AI double-move race condition and its fix
- [Win & draw detection — Y-O-W/discovery_piscine Issue #4](https://github.com/Y-O-W/discovery_piscine/issues/4)
- [Check Tic Tac Toe Winner at O(1) Time Complexity — Medium](https://medium.com/@shray.7/check-tic-tac-toe-winner-at-o-1-time-complexity-a86e644aae13)
- [Trying to get minimax to work correctly in tic-tac-toe — Treehouse Community](https://teamtreehouse.com/community/trying-to-get-minimax-to-work-correctly-in-tictactoe)
- [Tic Tac Toe: Understanding the Minimax Algorithm — Never Stop Building](https://www.neverstopbuilding.com/blog/minimax)
- [Develop an Unbeatable Tic-Tac-Toe AI Using React — Gregory Gaines](https://www.gregorygaines.com/blog/develop-unbeatable-tic-tac-toe-ai-react/)
- [Tutorial: Tic-Tac-Toe — React official docs](https://react.dev/learn/tutorial-tic-tac-toe)
- [ARIA Grid As an Anti-Pattern — Adrian Roselli](https://adrianroselli.com/2020/07/aria-grid-as-an-anti-pattern.html)
- [Usability, Accessibility, & ARIA Compliance with Grid Keyboard Navigation — Infragistics](https://www.infragistics.com/blogs/grid-keyboard-navigation-accessibility)
- [ARIA - Accessibility — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [UI Resilience: Add local storage corruption recovery guard — OpSoll/noc-iq-fe Issue #722](https://github.com/OpSoll/noc-iq-fe/issues/722)
- [Store JSON in localStorage: Complete JavaScript Guide — Jsonic](https://jsonic.io/guides/json-localstorage)
- [Common Pitfalls in JS-based Games — Gist](https://gist.github.com/seiyria/1bfd939a1d0566223228)
- [Component · Decoupling Patterns · Game Programming Patterns](https://gameprogrammingpatterns.com/component.html)
- [Project: A Platform Game :: Eloquent JavaScript](https://eloquentjavascript.net/16_game.html)
- [Using prefers-reduced-motion for Accessible Animation — OpenReplay](https://blog.openreplay.com/prefers-reduced-motion-accessible-animation/)
- [prefers-reduced-motion CSS media feature — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Respecting Users' Motion Preferences — Smashing Magazine](https://www.smashingmagazine.com/2021/10/respecting-users-motion-preferences/)
- [Hire Web Developers: Portfolio Red Flags You Can't Ignore — Contra](https://contra.com/p/kXU7WbZb-hire-web-developers-portfolio-red-flags-you-cant-ignore)
- [What I Learned from Reviewing 50 Portfolios on Reddit in 3 Crazy Days — Bomberbot](https://www.bomberbot.com/design/what-i-learned-from-reviewing-50-portfolios-on-reddit-in-3-crazy-days/)

---
*Pitfalls research for: browser-based tic-tac-toe game (portfolio piece)*
*Researched: 2026-09-26*
