# Feature Research

**Domain:** Browser-based tic-tac-toe game (local hot-seat + vs-computer, portfolio piece)
**Researched:** 2026-09-26
**Confidence:** MEDIUM (well-established, low-novelty domain; individual web sources rate LOW per source-hierarchy, but findings cross-check consistently with each other and with well-known CS/accessibility fundamentals — see Sources)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist for *this* project's declared scope. Missing these = the game feels incomplete or broken for a portfolio submission.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Correct game rules (valid moves, win/draw detection) | Baseline — a tic-tac-toe game that allows illegal moves or misjudges a win isn't a game | LOW | 3x3 grid, 8 win lines, full-board = draw. Pure function, easy to unit test exhaustively. |
| Local hot-seat 2-player mode | Fundamental mode almost every implementation includes; "vs a friend on one device" is the default expectation | LOW | Turn alternates on the same screen; no networking. |
| Vs-computer mode | Nearly universal in browser tic-tac-toe; playing alone is the most common single-player use case | MEDIUM | Requires an AI move-selection algorithm (see AI section). |
| Selectable AI difficulty (Easy/Medium/Hard) | Every competent AI-mode implementation surveyed offers tiers; a single fixed difficulty (especially always-unbeatable) frustrates casual players | MEDIUM | Easy = random legal move. Medium = heuristic (win-if-possible, block-if-threatened, else random/shallow). Hard = full minimax, unbeatable. |
| Win/draw announcement | Players need explicit feedback that the game ended and how | LOW | Text/status message; must also be programmatically announced for a11y (see below). |
| Winning-line highlight | Universally present in modern implementations; shows *why* the game ended | LOW | Highlight the 3 matched cells/line; purely visual + ARIA-described. |
| Restart / new round | Players expect to immediately play again without reloading the page | LOW | Resets board, keeps names/scores/difficulty. |
| Responsive layout (playable on typical browser window sizes) | Baseline expectation for any browser game in 2026 | LOW | CSS grid/flexbox; no native mobile app needed per scope. |

### Differentiators (Competitive Advantage — within this project's chosen scope)

Not required for the game to "work," but these are the features this project has explicitly chosen to include that elevate it above a bare-minimum tic-tac-toe clone and demonstrate portfolio-quality craft.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Unbeatable Hard AI (provably never loses) | A concrete, testable correctness guarantee ("Hard cannot lose") is a strong portfolio signal — shows algorithmic rigor, not just UI polish | MEDIUM | Minimax (optionally alpha-beta pruning, though full 3x3 tree is tiny — ~5478 states, ~765 unique with symmetry — so pruning is a nice-to-have, not required for performance). Deterministic-optimal play can feel robotic; randomizing among equally-optimal moves keeps it lively without breaking unbeatability. |
| Player name entry | Personalizes the match ("Alex vs Sam" beats "X vs O"); a small but noticeable delight | LOW | Free-text fields, fallback to "Player 1/2" or "X/O" if blank. |
| Choose who goes first | Removes a common source of perceived unfairness ("X always starts"); rare in bare-bones clones, present in more polished ones | LOW | Toggle/selector before or between rounds; must work for human-vs-human and human-vs-AI. |
| Persistent score tally (localStorage) | Turns a single round into an ongoing rivalry/session; signals attention to state-persistence and browser storage skills | LOW–MEDIUM | Store {playerXWins, playerOWins, draws, names} keyed in localStorage; must handle reset and handle missing/corrupt storage gracefully. |
| Playful, colorful visual style with animation/feedback | Differentiates from the sea of plain gray/black tic-tac-toe clones; demonstrates visual/UX design sense, not just logic | LOW–MEDIUM | Hover states, mark-placement transition, win celebration (confetti/pulse/highlight), color theme. Must still satisfy `prefers-reduced-motion`. |
| Full accessibility (keyboard play, ARIA live announcements, contrast, reduced motion) | Most hobby tic-tac-toe clones skip this entirely — doing it well is a genuine differentiator and directly supports the "portfolio piece" goal | MEDIUM | aria-live="polite" region for turn/result announcements, per-cell aria-label (e.g. "row 1 column 2, empty" / "marked X"), full keyboard operability (Tab/Arrow + Enter/Space), visible focus ring, WCAG-contrast palette, `@media (prefers-reduced-motion: reduce)` fallback. |
| Automated test suite (game logic + AI behavior) | Explicit "Hard never loses" test is a rare, high-signal proof point for reviewers/employers looking at the repo | MEDIUM | Exhaustive tests for win/draw detection, move validation, and a property-style/simulation test that Hard AI never loses across many random opponent sequences (or full game-tree enumeration since space is small). |
| Clean, portfolio-grade README (what/how-to-run/how-to-test/design notes/screenshot) | Signals professionalism beyond the code itself; often the *first* thing a reviewer reads | LOW | Standard sections; screenshot/gif of gameplay adds credibility. |

### Anti-Features (Explicitly Out of Scope for This Project)

Features that are common in the wider tic-tac-toe ecosystem, seem appealing, but are deliberately excluded per this project's declared scope.

| Feature | Why Requested (elsewhere) | Why Problematic (for this project) | Alternative |
|---------|---------------------------|--------------------------------------|-------------|
| Online / real-time multiplayer | Some hobby projects add it to show off networking/websocket skills | Requires a backend, session/matchmaking, and networking concerns — large scope increase for a game whose value is local play and clean logic/AI/a11y; distracts from the stated portfolio focus | Local hot-seat covers the "play with someone else" need without a server |
| User accounts / login / server-side leaderboards | Seen in "full-stack demo" tic-tac-toe projects wanting to show auth flows | Adds a backend, auth, and data-persistence layer unrelated to the core game-logic/AI/a11y showcase; scores are inherently per-device/per-browser here | localStorage-based score tally scoped to Requirements |
| Deployment / hosting to a live URL | Common instinct once a project "works" | Explicitly deferred by the user; conflates "runs correctly" with "is hosted," which are separate concerns for this milestone | Document clear local run instructions in README; hosting can be a later milestone |
| Board variants (4x4, ultimate tic-tac-toe, Connect Four-style boards) | Popular "advanced" feature to differentiate from generic clones | Changes win-condition logic, AI complexity (minimax on 4x4+ is not exhaustively solvable the same way), and board rendering — scope creep away from "classic game, done well" | Keep the classic 3x3 board; depth of polish (AI, a11y, tests) is the differentiation strategy instead of board complexity |
| Native mobile app | Occasionally requested to "reach more users" | Out of scope per user; browser + responsive layout already covers phone/tablet browsers without app-store packaging overhead | Responsive CSS layout so it's still comfortably playable in a mobile browser |
| Sound effects / background music | Common "polish" addition in game-jam style clones | Adds asset management, mute controls, and extra a11y considerations (auto-playing audio is a known UX/accessibility anti-pattern) without being requested; risks scope creep beyond "playful, colorful" visual style | Rely on visual/animated feedback (already in scope) for the "playful" feel |
| Persisted move history / replay / undo | Sometimes added to "AI teaching" tic-tac-toe variants | Not requested, adds state-management complexity (undo interacts with AI turn-taking and score tally) with no stated user need | Skip; current round state + persisted score tally is sufficient |

## Feature Dependencies

```
[Correct game rules: win/draw detection, move validation]
    └──requires nothing──> foundational; everything else builds on it

[Local hot-seat 2P] ──requires──> [Correct game rules]
[Vs-computer mode]  ──requires──> [Correct game rules]
                        └──requires──> [AI difficulty levels: Easy/Medium/Hard]
                                          └──requires──> [Hard = minimax, provably unbeatable]

[Winning-line highlight] ──requires──> [Correct game rules] (needs to know which 3 cells won)
[Win/draw announcement]  ──requires──> [Correct game rules]
                             └──enhances──> [Accessibility: ARIA live announcements]

[Player names]            ──enhances──> [Score tally] (tally is more meaningful with names than "X/O")
[Choose who goes first]   ──requires──> [Local hot-seat 2P] AND [Vs-computer mode] (must apply to both)

[Score tally]              ──requires──> [Correct game rules] (needs win/draw results to tally)
                              └──requires──> [Persistence in localStorage] (to survive refresh)
[New round / reset]         ──requires──> [Correct game rules]
                              └──must NOT reset──> [Score tally] (reset board, keep score, unless explicit "reset scores" action)

[Playful/colorful style + animation] ──enhances──> [Winning-line highlight], [Win/draw announcement]
[Accessibility: keyboard play, ARIA, contrast, reduced motion] ──constrains──> [Playful/colorful style + animation]
                              (reduced-motion must gracefully degrade animations; contrast must survive the color theme)

[Automated tests] ──depends on──> [Correct game rules] AND [AI difficulty levels] existing first (tests verify behavior, not the other way around)

[README] ──depends on──> everything above being substantially complete (documents what was actually built)
```

### Dependency Notes

- **AI difficulty levels require correct game rules first:** the AI (at any difficulty) needs a reliable win/draw/valid-move check to evaluate board states; build and test core game logic before AI.
- **Hard/unbeatable AI requires the general AI mode to exist:** difficulty selection is the feature; "Hard" is one of its levels, not a separate feature to sequence before the others.
- **Winning-line highlight and win/draw announcement both require game rules to expose *which* line won**, not just *that* someone won — plan the win-detection function to return the winning line, not just a boolean.
- **Score tally requires persistence (localStorage) to satisfy the "survives refresh" requirement** — building tally state in memory only and adding persistence later means revisiting the same code twice; do them together.
- **Choose-who-goes-first must be designed to cover both hot-seat and vs-computer modes** — if implemented only for one mode first, it will need rework to generalize.
- **Accessibility constrains the playful visual style, not the reverse:** design the color palette and animations with contrast and `prefers-reduced-motion` in mind from the start, rather than bolting on compliance after the visual design is locked in — retrofitting is more expensive than designing within the constraint.
- **Automated tests depend on the AI and game logic being implemented** but should be written close to (ideally alongside, via TDD-style) that implementation, not deferred to the very end, especially the "Hard never loses" behavioral test — it's the single highest-value test in the project and easiest to justify writing early.
- **Anti-feature note:** none of the excluded features (online multiplayer, accounts, deployment, board variants) are dependencies of anything in the table-stakes or differentiator lists — confirming they can be cleanly deferred without blocking any in-scope feature.

## MVP Definition

### Launch With (v1)

Everything in this project's Active Requirements is effectively the MVP — there is no smaller "v0" that would still satisfy the stated portfolio goal.

- [ ] Correct 3x3 game logic (moves, win/draw detection returning the winning line) — nothing else can be built or tested without this
- [ ] Local hot-seat 2-player mode — core declared mode #1
- [ ] Vs-computer mode with Easy/Medium/Hard (Hard unbeatable) — core declared mode #2, and the AI-correctness showcase
- [ ] Player names, choose who goes first — small, low-cost, directly requested
- [ ] Winning-line highlight, win/draw announcement — required for the game to feel complete and correct
- [ ] Score tally persisted in localStorage, new round/reset — required "session" feature, explicitly requested
- [ ] Playful/colorful style with animation — explicitly requested visual identity
- [ ] Accessibility (keyboard, ARIA live, contrast, reduced motion) — explicitly required, not optional, per project constraints
- [ ] Automated tests (game logic + "Hard never loses") — explicitly required, not optional, per project constraints
- [ ] README (what/run/test/design notes/screenshot) — explicitly required deliverable

### Add After Validation (v1.x)

Nothing is currently deferred within scope — the project's own Out of Scope list already captures the natural "next" features. If this MVP were validated (e.g. shown to reviewers, used as a talking point in interviews) and expanded, logical v1.x candidates would be:

- [ ] Deployment to a live URL — trigger: want a shareable link instead of "clone and run locally"
- [ ] Sound effects with mute control — trigger: user feedback that the game feels too quiet, paired with careful a11y (no autoplay, respects OS mute)
- [ ] Light/dark theme toggle — trigger: portfolio reviewer feedback on visual variety, low cost given the styling work is already in place

### Future Consideration (v2+)

- [ ] Online multiplayer — defer: requires a backend/signaling layer, a completely different architecture, and dilutes the "local, no backend" simplicity that makes this a clean portfolio piece
- [ ] Accounts / server-side leaderboards — defer: only makes sense paired with online multiplayer; no value in isolation
- [ ] Board variants (4x4, ultimate tic-tac-toe) — defer: AI approach (minimax) doesn't scale the same way; would need a different algorithm (heuristic evaluation instead of full-tree search) and separate research

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Correct game rules (win/draw/valid moves) | HIGH | LOW | P1 |
| Local hot-seat 2P mode | HIGH | LOW | P1 |
| Vs-computer mode | HIGH | MEDIUM | P1 |
| AI difficulty levels (Easy/Medium/Hard, Hard unbeatable) | HIGH | MEDIUM | P1 |
| Winning-line highlight | MEDIUM | LOW | P1 |
| Win/draw announcement | HIGH | LOW | P1 |
| Player names | MEDIUM | LOW | P1 |
| Choose who goes first | MEDIUM | LOW | P1 |
| Score tally + localStorage persistence | MEDIUM | LOW–MEDIUM | P1 |
| New round / reset | HIGH | LOW | P1 |
| Playful/colorful style + animation | MEDIUM | LOW–MEDIUM | P1 |
| Accessibility (keyboard, ARIA, contrast, reduced motion) | HIGH (for stated portfolio goal) | MEDIUM | P1 |
| Automated tests (logic + AI) | HIGH (for stated portfolio goal) | MEDIUM | P1 |
| README with screenshot | HIGH (for stated portfolio goal) | LOW | P1 |
| Deployment | LOW (explicitly deferred) | LOW–MEDIUM | P3 |
| Sound effects | LOW | LOW | P3 |
| Theme toggle | LOW | LOW–MEDIUM | P3 |
| Online multiplayer | LOW (explicitly out of scope) | HIGH | P3 |
| Accounts / server leaderboards | LOW (explicitly out of scope) | HIGH | P3 |
| Board variants | LOW (explicitly out of scope) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (this milestone's MVP — everything the user already scoped in)
- P2: Should have, add when possible (none identified beyond MVP — this project's scope is already tightly MVP-shaped)
- P3: Nice to have, future consideration (all explicitly Out-of-Scope items, plus low-value polish like sound/themes)

## Competitor Feature Analysis

"Competitors" here means the broad population of publicly-shared browser tic-tac-toe implementations (itch.io game-jam entries and GitHub hobby/portfolio projects), since this is a well-worn, low-differentiation domain rather than a market with named commercial products.

| Feature | Typical hobby/game-jam clone | Typical "modern portfolio" clone (e.g. Minimax + local multiplayer + score tracking repos) | Our Approach |
|---------|------------------------------|----------------------------------------------------------------------------------------------|--------------|
| AI difficulty | Often single fixed difficulty or none | 2–3 tiers, Hard via minimax | 3 tiers (Easy/Medium/Hard), Hard provably unbeatable and tested |
| Score tracking | Rare or session-only (resets on refresh) | Live score tracking, sometimes match/round counters | Persisted via localStorage across refreshes, with explicit reset |
| Visual style | Plain, minimal, or single "neon"/"glassmorphism" theme with no accessibility consideration | Same, still typically no accessibility consideration | Playful/colorful style designed together with contrast + reduced-motion support (differentiator vs. nearly all surveyed clones) |
| Player identity | Fixed "X"/"O" | Custom names sometimes present | Custom names + choose-who-goes-first (both requested, less commonly both present together) |
| Accessibility | Essentially absent in the vast majority of surveyed hobby implementations | Also largely absent | Full keyboard play, ARIA live announcements, contrast, reduced-motion — this is the project's clearest point of distinction from the ecosystem |
| Automated tests | Rare; most repos ship with no test suite | Occasionally present for game logic only, rarely for AI behavior | Explicit game-logic tests plus an AI-correctness test ("Hard never loses") — second clearest point of distinction |
| Multiplayer scope | Local only (most), some add online/Firebase real-time sync for portfolio flair | Local only, or local + online | Local only, by deliberate choice — trades a networking flex for depth in AI/a11y/tests |

## Sources

- [Logith-G/CodeOrbit-tic-tac-toe (GitHub)](https://github.com/Logith-G/CodeOrbit-tic-tac-toe) — Minimax AI, local multiplayer, multiple difficulty levels, match formats, score tracking
- [Smax1988/Tic-Tac-Toe (GitHub)](https://github.com/Smax1988/Tic-Tac-Toe) — Vanilla JS, human vs computer with 3 difficulty levels
- [naimafarooq-dev/Tic-Tac-Toe-Game (GitHub)](https://github.com/naimafarooq-dev/Tic-Tac-Toe-Game) — Multiple AI difficulty levels, local + online multiplayer, responsive UI
- [ShambhaviCode/TicTac-Pro (GitHub)](https://github.com/ShambhaviCode/TicTac-Pro) — PvP/AI modes, glassmorphism UI
- [Sonamkhuranaa/Tic-Tac-Toe-Game-with-AI (GitHub)](https://github.com/Sonamkhuranaa/Tic-Tac-Toe-Game-with-AI) — Neon-themed AI implementation
- [freeCodeCamp — How to make your Tic Tac Toe game unbeatable using the minimax algorithm](https://www.freecodecamp.org/news/how-to-make-your-tic-tac-toe-game-unbeatable-by-using-the-minimax-algorithm-9d690bad4b37/) — Minimax fundamentals, state-space size
- [DEV Community — Tic-Tac-Toe with the Minimax Algorithm](https://dev.to/nestedsoftware/tic-tac-toe-with-the-minimax-algorithm-5988) — Minimax implementation walkthrough
- [Medium — Creating an Unbeatable Tic Tac Toe Game Using Minimax with Alpha-Beta Pruning](https://cshanjib.medium.com/creating-an-unbeatable-tic-tac-toe-game-using-minimax-algorithm-with-alpha-beta-pruning-in-flutter-f666594be0b4) — Difficulty tiering via random/heuristic/minimax blend
- [marianoheller/tic-tac-toe-minimax (GitHub)](https://github.com/marianoheller/tic-tac-toe-minimax) — Reference minimax implementation
- [MDN Web Docs — ARIA (Accessibility)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) — ARIA live region and role fundamentals
- [UXPin — Keyboard Navigation Patterns for Complex Widgets (2026)](https://www.uxpin.com/studio/blog/keyboard-navigation-patterns-complex-widgets/) — Roving tabindex, Enter/Space activation, focus order for interactive grids
- [GitHub Issue — harennon/cardgamesimulator #260](https://github.com/harennon/cardgamesimulator/issues/260) — Practical pattern for keyboard-operable turn-based play + screen-reader turn/event announcements
- Cross-checked against established CS/accessibility fundamentals (minimax completeness for tic-tac-toe's small state space; WAI-ARIA live-region semantics) — individual web sources are rated LOW confidence per the source-hierarchy tier for unverified general web search, but the findings are internally consistent across many independent hobby-project sources and align with textbook algorithm/accessibility guidance, which is why overall confidence is assessed as MEDIUM rather than LOW.

---
*Feature research for: Browser-based tic-tac-toe (local hot-seat + vs-computer AI, portfolio piece)*
*Researched: 2026-09-26*
