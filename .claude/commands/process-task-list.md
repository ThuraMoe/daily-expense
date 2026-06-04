# Command: Process Task List

## Goal

Work through a task list file one subtask at a time. Show a clear diff before each change. Wait for explicit user approval before moving to the next subtask.

## Process

1. **Receive task list reference** — the user points to a task list file in `.ai-rules/tasks/`.
2. **Read context** — read the task list, `.ai-rules/AI.md`, `.ai-rules/DECISIONS.md`, and any relevant source files before starting.
3. **Identify the next incomplete subtask** — find the first unchecked `[ ]` subtask.
4. **Show what will change** — before touching any file, state exactly which files will be created or modified and what the change will do. Wait for the user to say "yes" or "y".
5. **Implement the subtask** — make only the change described. Nothing more.
6. **Mark the subtask complete** — update the task list file, changing `[ ]` to `[x]` for the completed subtask.
7. **Report and pause** — summarize what was done in one sentence, then stop and wait for the user to approve the next subtask.
8. **Repeat** until all subtasks under a parent task are done.
9. **Complete parent task** — when all subtasks under a parent are `[x]`, mark the parent `[x]` too. Then pause and ask if the user is ready to move to the next parent task.

## Rules

- **Never start the next subtask without explicit user approval** ("yes", "y", or equivalent).
- **Never make changes outside the scope of the current subtask** — no "while I'm at it" edits.
- **Always show a summary of changes before implementing** — file name, what changes, why.
- **Keep the task list file up to date** — mark items complete as you go.
- **If a subtask is blocked**, say so clearly and ask the user how to proceed. Do not skip ahead.
- **If a subtask turns out to need more steps than expected**, break it down and confirm with the user before proceeding.

## Constraints (from this project)

- All new UI uses Tailwind CSS only
- Firebase calls go directly in components — no service layer abstraction
- JSDoc comments required on every component and exported function (see `.ai-rules/AI.md`)
- No test files
- Do not modify `.env` or Firebase credentials
- Do not change dev port without updating both `vite.config.ts` and `docker-compose.yml`

## Final Instructions

- One subtask at a time
- Show diff summary → wait for approval → implement → mark complete → pause
- Keep `.ai-rules/tasks/` task file updated throughout
