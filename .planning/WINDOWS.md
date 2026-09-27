---
schema_version: 1
open_count: 3
waived_count: 0
fixed_count: 0
total_count: 3
last_updated: 2026-09-27T17:23:30.719Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | package.json |  | vite pinned at 8.0.9 per plan/CLAUDE.md exact-pin acceptance criteria; npm audit reports 1 high-severity advisory (GHSA-fx2h-pf6j-xcff server.fs.deny bypass on Windows, GHSA-v6wh-96g9-6wx3 launch-editor NTLMv2 disclosure) fixed only in vite>=8.3.1 (outside the plan's pinned range). Dev-server-only risk (not shipped in the production build); left un-upgraded to keep Task 2's exact-pin acceptance criteria green. Revisit when a later plan is free to bump the vite pin. | open |  | 2026-09-27T17:21:57.649Z |  |
| 2 | 01 | stub | src/game/useGame.ts |  | result is a hardcoded { status: 'in-progress' } constant (per plan 01-01's own scope note); win/draw detection is deferred to plan 01-02, which replaces this constant with evaluate(board). Status text can never show a win or draw until 01-02 lands. | open |  | 2026-09-27T17:23:16.551Z |  |
| 3 | 01 | unrun-verify | .github/workflows/ci.yml |  | Task 3's human-check (first green GitHub Actions run for the pushed commit) has not been performed -- pushing requires the user's explicit go-ahead per CLAUDE.md. All CI steps pass locally (lint, typecheck, format:check, test, build); the workflow file's structure/order/permissions were verified by grep, but no real Actions run has confirmed it end-to-end. Deferred to end-of-phase UAT. | open |  | 2026-09-27T17:23:30.719Z |  |

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
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-27T17:23:16.551Z",
    "resolved_at": null,
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
  }
]
````
