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

**Last updated:** 2026-04-03
**Active task:** None - full rewrite decided, TASK-001 is next

**What was done last session:**
- Decided to do a full rewrite of the codebase from scratch
- Rewrote `TASKS.md` completely with proper development sequence starting from project cleanup, shell, routing, login, and building up phase by phase
- Old task order (starting from delete expense) has been replaced
- All 5 `.ai-rules/` files updated and synced

**What to do next session:**
- Start with **TASK-001** (Project Cleanup & Setup Verification)
- AI must read all `.ai-rules/` files first, then review the existing folder structure with human before touching anything
- Do not delete or change any files until human has approved the cleanup list

**Loose ends / warnings:**
- Old code still exists in the repo - treat it as reference only, not as a base
- TASK-002 (delete expense) from the old task list is now TASK-009 in the new sequence - do not confuse them
- Firebase database paths in `AI.md` are confirmed from real code

---

## Session Log

| # | Date | What was done | Next step |
|---|------|--------------|-----------|
| 1 | _(date)_ | Set up `.ai-rules/` documentation structure | Verify docs against real codebase, start first task |
| 2 | _(date)_ | Updated `AI.md` with real Firebase paths and category implementation details. Synced `PRODUCT_SCOPE.md`, `DECISIONS.md` accordingly | Verify remaining task statuses against real codebase, then pick first task |
| 3 | _(date)_ | Updated Bootstrap -> Tailwind migration plan. Added dark mode as planned feature. Added TASK-005 and TASK-006 | Drop `.ai-rules/` into project, then start next task |
| 4 | _(date)_ | Major scope expansion - added 10 new planned features. Updated `PRODUCT_SCOPE.md`, `DECISIONS.md`, `TASKS.md` | Drop `.ai-rules/` into project. Pick first task to start |
| 5 | 2026-04-03 | Full rewrite decided. Rewrote `TASKS.md` from scratch with 21 tasks across 8 phases in correct build order (foundation -> auth -> expenses -> views -> income -> dashboard -> polish -> AI) | Start TASK-001 next session |

---

> Warning: If this file has not been updated since the last session, ask the human what happened before assuming the previous plan is still valid.
