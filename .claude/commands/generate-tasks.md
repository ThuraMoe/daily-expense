# Command: Generate Tasks from PRD

## Goal

Read a PRD file and generate a detailed, step-by-step task list the AI will use to implement the feature — one task at a time with user approval at each step.

## Process

1. **Receive PRD reference** — the user points to a PRD file in `.ai-rules/tasks/`.
2. **Read context** — read the PRD, `.ai-rules/AI.md`, `.ai-rules/DECISIONS.md`, and scan the relevant parts of `src/` to understand what already exists.
3. **Phase 1 — Generate parent tasks** — create the high-level tasks needed to implement the feature. Present them to the user without subtasks yet. Then say: "Here are the high-level tasks. Reply 'Go' to generate the subtasks."
4. **Wait for 'Go'** — do not proceed until the user confirms.
5. **Phase 2 — Generate subtasks** — break each parent task into small, actionable subtasks. Each subtask should be specific enough for a single focused code change.
6. **List relevant files** — list every file that will be created or modified.
7. **Save the task list** to `.ai-rules/tasks/tasks-[prd-file-name].md`.

## Output Format

```markdown
## Relevant Files

- `src/path/to/file.tsx` - Why this file is relevant.
- `src/path/to/another.tsx` - Why this file is relevant.

## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 Subtask description
  - [ ] 1.2 Subtask description
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 Subtask description
```

## Constraints (from this project)

- No test files — this project has no automated tests
- No service layer — Firebase calls go directly in components
- All new components use Tailwind CSS only
- Match the JSDoc comment style from `.ai-rules/AI.md`
- Check `.ai-rules/DECISIONS.md` before proposing any new patterns
- Do not create new routes without updating `src/WebRoute.tsx`

## Final Instructions

- Do NOT start implementing
- Present parent tasks first, wait for 'Go', then generate subtasks
- Save output to `.ai-rules/tasks/tasks-[prd-file-name].md`
