# Handoff - `daily-expense`

This file is the **session log**. It is updated at the end of every working session by the human.

When starting a new session, the AI must read this file first to understand the current state of the project before doing or suggesting anything.

---

## How to Use This File

**At the end of every session, the human updates:**
1. What was completed today
2. What is the next thing to do
3. Any loose ends, warnings, or things to be careful about
4. Which task is active (reference TASKS.md)

**At the start of every session, the AI must:**
1. Read this file completely
2. Read `TASKS.md` to understand the active task
3. Summarize its understanding back to the human before proposing anything
4. Ask if the plan is still valid before starting

---

## Current State

**Last updated:** _(fill in date when you first work on the project)_
**Active task:** None - project documentation being set up

**What was done last session:**
- Set up `.ai-rules/` folder with all documentation files
- `AI.md` - coding rules, conventions, change control
- `PRODUCT_SCOPE.md` - what the app is, is not, and will never have
- `DECISIONS.md` - architectural decisions and reasoning
- `TASKS.md` - task list with step-by-step breakdowns
- `HANDOFF.md` - this file

**What to do next session:**
- Review all `.ai-rules/` files and fill in any missing details specific to your actual codebase (e.g. confirm Firebase database paths, confirm category list location, update ROADMAP statuses to reflect what is actually built)
- Pick the first task from `TASKS.md` to start working on
- Suggested starting point: **TASK-002 (Delete Expense)** - simpler than edit, good first real task

**Loose ends / warnings:**
- ROADMAP statuses are based on conversation context - verify them against the actual codebase before trusting them
- Firebase database paths in `AI.md` are approximate - confirm the real paths from your code

---

## Session Log

| # | Date | What was done | Next step |
|---|------|--------------|-----------|
| 1 | _(date)_ | Set up `.ai-rules/` documentation structure | Verify docs against real codebase, start TASK-002 |
| 2 | _(date)_ | Updated `AI.md` with real Firebase paths and category implementation details. Synced `PRODUCT_SCOPE.md`, `DECISIONS.md` accordingly | Verify remaining task statuses against real codebase, then pick first task |
| 3 | _(date)_ | Updated Bootstrap -> Tailwind migration plan. Added dark mode as planned feature. Added TASK-005 and TASK-006 | Drop `.ai-rules/` into project, then start next task |
| 4 | _(date)_ | Major scope expansion - added 10 new planned features. Updated `PRODUCT_SCOPE.md`, `DECISIONS.md`, `TASKS.md` (TASK-007 to TASK-016) | Drop `.ai-rules/` into project. Pick first task to start - suggested order: TASK-008 (popup), TASK-002 (delete), TASK-001 (edit) |

---

> Warning: If this file has not been updated since the last session, ask the human what happened before assuming the previous plan is still valid.
