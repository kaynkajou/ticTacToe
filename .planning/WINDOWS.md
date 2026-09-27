---
schema_version: 1
open_count: 4
waived_count: 0
fixed_count: 1
total_count: 5
last_updated: 2026-09-27T18:18:21.294Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | package.json |  | vite pinned at 8.0.9 per plan/CLAUDE.md exact-pin acceptance criteria; npm audit reports 1 high-severity advisory (GHSA-fx2h-pf6j-xcff server.fs.deny bypass on Windows, GHSA-v6wh-96g9-6wx3 launch-editor NTLMv2 disclosure) fixed only in vite>=8.3.1 (outside the plan's pinned range). Dev-server-only risk (not shipped in the production build); left un-upgraded to keep Task 2's exact-pin acceptance criteria green. Revisit when a later plan is free to bump the vite pin. | open |  | 2026-09-27T17:21:57.649Z |  |
| 2 | 01 | stub | src/game/useGame.ts |  | result is a hardcoded { status: 'in-progress' } constant (per plan 01-01's own scope note); win/draw detection is deferred to plan 01-02, which replaces this constant with evaluate(board). Status text can never show a win or draw until 01-02 lands. | fixed |  | 2026-09-27T17:23:16.551Z | 2026-09-27T17:53:00.805Z |
| 3 | 01 | unrun-verify | .github/workflows/ci.yml |  | Task 3's human-check (first green GitHub Actions run for the pushed commit) has not been performed -- pushing requires the user's explicit go-ahead per CLAUDE.md. All CI steps pass locally (lint, typecheck, format:check, test, build); the workflow file's structure/order/permissions were verified by grep, but no real Actions run has confirmed it end-to-end. Deferred to end-of-phase UAT. | open |  | 2026-09-27T17:23:30.719Z |  |
| 4 | 01 | unrun-verify | src/App.gameOver.test.tsx |  | Task 3's human-check (NVDA/Narrator screen-reader pass playing X's top-row win via keyboard only) has not been performed; jsdom cannot run a real screen reader. All automated checks (npm test, lint, typecheck) pass. Deferred to end-of-phase UAT per workflow.human_verify_mode=end-of-phase; Phase 5 owns the formal keyboard/screen-reader verification pass. | open |  | 2026-09-27T17:53:08.926Z |  |
| 5 | 01 | unrun-verify | src/App.newRound.test.tsx |  | Task 2's human-check (real-browser keyboard-only playthrough: Tab/Enter/Space to a win, visible focus ring on New round, Enter, visible focus ring on the top-left cell, status reads X's turn) has not been performed; jsdom cannot verify focus-ring visibility. All automated checks (npm test, lint, typecheck, format:check, build) pass. Deferred to end-of-phase UAT per workflow.human_verify_mode=end-of-phase; Phase 5 owns the formal keyboard/screen-reader verification pass. | open |  | 2026-09-27T18:18:21.294Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "package.json",
    "line": null,
    "description": "vite pinned at 8.0.9 per plan/CLAUDE.md exact-pin acceptance criteria; npm audit reports 1 high-severity advisory (GHSA-fx2h-pf6j-xcff server.fs.deny bypass on Windows, GHSA-v6wh-96g9-6wx3 launch-editor NTLMv2 disclosure) fixed only in vite>=8.3.1 (outside the plan's pinned range). Dev-server-only risk (not shipped in the production build); left un-upgraded to keep Task 2's exact-pin acceptance criteria green. Revisit when a later plan is free to bump the vite pin.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-27T17:21:57.649Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 2,
    "kind": "stub",
    "phase": "01",
    "file": "src/game/useGame.ts",
    "line": null,
    "description": "result is a hardcoded { status: 'in-progress' } constant (per plan 01-01's own scope note); win/draw detection is deferred to plan 01-02, which replaces this constant with evaluate(board). Status text can never show a win or draw until 01-02 lands.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-09-27T17:23:16.551Z",
    "resolved_at": "2026-09-27T17:53:00.805Z",
    "milestone": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "01",
    "file": ".github/workflows/ci.yml",
    "line": null,
    "description": "Task 3's human-check (first green GitHub Actions run for the pushed commit) has not been performed -- pushing requires the user's explicit go-ahead per CLAUDE.md. All CI steps pass locally (lint, typecheck, format:check, test, build); the workflow file's structure/order/permissions were verified by grep, but no real Actions run has confirmed it end-to-end. Deferred to end-of-phase UAT.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-27T17:23:30.719Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "src/App.gameOver.test.tsx",
    "line": null,
    "description": "Task 3's human-check (NVDA/Narrator screen-reader pass playing X's top-row win via keyboard only) has not been performed; jsdom cannot run a real screen reader. All automated checks (npm test, lint, typecheck) pass. Deferred to end-of-phase UAT per workflow.human_verify_mode=end-of-phase; Phase 5 owns the formal keyboard/screen-reader verification pass.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-27T17:53:08.926Z",
    "resolved_at": null,
    "milestone": null
  },
  {
    "id": 5,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "src/App.newRound.test.tsx",
    "line": null,
    "description": "Task 2's human-check (real-browser keyboard-only playthrough: Tab/Enter/Space to a win, visible focus ring on New round, Enter, visible focus ring on the top-left cell, status reads X's turn) has not been performed; jsdom cannot verify focus-ring visibility. All automated checks (npm test, lint, typecheck, format:check, build) pass. Deferred to end-of-phase UAT per workflow.human_verify_mode=end-of-phase; Phase 5 owns the formal keyboard/screen-reader verification pass.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-27T18:18:21.294Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
