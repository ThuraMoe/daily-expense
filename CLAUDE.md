# CLAUDE.md — daily-expense

This file is auto-read by Claude Code at the start of every session.
Read the files listed below before doing or suggesting anything.

---

## Step 1 — Read these files first (in order)

1. `.ai-rules/HANDOFF.md` — what was done last session and what to do next
2. `.ai-rules/TASKS.md` — full task list and current status
3. `.ai-rules/AI.md` — coding rules, conventions, and what not to do
4. `.ai-rules/DECISIONS.md` — why things are built the way they are
5. `.ai-rules/PRODUCT_SCOPE.md` — what the app is and what it will never have

Do not skip any of these. Do not propose or implement anything until you have read all five.

---

## Step 2 — Summarise your understanding

After reading, tell the user:
- Which task is active
- What was done last session
- What the next step is
- Ask if the plan is still valid before starting

---

## Step 3 — Work rules

- One task at a time. Do not jump ahead.
- Show exactly what will change (files, diff summary) before touching anything.
- Wait for explicit approval ("yes" / "y") before making any change.
- Mark tasks complete in the task list file as you go.
- If something is unclear or out of scope, ask — do not assume.

---

## Available Commands

| Command | What it does |
|---|---|
| `/create-prd` | AI asks clarifying questions and writes a PRD for a new feature |
| `/generate-tasks` | AI reads a PRD and generates a step-by-step task list |
| `/process-task-list` | AI works through a task list one subtask at a time with approval gates |

PRDs and task lists are saved to `.ai-rules/tasks/`.

---

## Key facts

- Stack: React 19, Vite 6, TypeScript, Tailwind CSS 4, Firebase Auth + Realtime Database, React Router 7
- Dev server: `npm run dev` on port `43177`
- All new UI: Tailwind CSS only — no React Bootstrap
- No automated tests, no backend, no service layer
- See `.ai-rules/AI.md` for full coding conventions
