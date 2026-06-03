# Command: Create PRD

## Goal

Guide the AI in creating a Product Requirements Document (PRD) for a new feature in this project. The PRD must be clear, actionable, and consistent with the existing decisions and rules in `.ai-rules/`.

## Process

1. **Receive the feature request** from the user.
2. **Read context** — read `.ai-rules/AI.md`, `.ai-rules/DECISIONS.md`, and `.ai-rules/PRODUCT_SCOPE.md` before asking anything.
3. **Ask clarifying questions** — use numbered or lettered lists so the user can answer quickly. Cover:
   - What problem does this feature solve?
   - Who uses it and when?
   - What are the key actions the user should be able to perform?
   - What does success look like?
   - What is explicitly out of scope for this feature?
   - Are there any UI/UX constraints or patterns to follow?
   - Are there any Firebase data structure implications?
4. **Generate the PRD** using the structure below.
5. **Save the PRD** to `.ai-rules/tasks/prd-[feature-name].md`.

## PRD Structure

1. **Overview** — what the feature is and what problem it solves
2. **Goals** — specific, measurable objectives
3. **User Stories** — "As a user, I want to... so that..."
4. **Functional Requirements** — numbered list of what the feature must do
5. **Non-Goals** — what this feature will NOT include
6. **UI/UX Considerations** — layout, Tailwind patterns, mobile requirements
7. **Data Considerations** — Firebase paths, data shape, any new fields
8. **Open Questions** — anything still unclear

## Constraints (from this project)

- All new UI must use Tailwind CSS only — no React Bootstrap
- Firebase calls go directly in components — no service layer
- Categories are fixed in `src/utils/CategoryList.ts` — do not add category CRUD
- Google sign-in only — no other auth providers
- No test files, no backend, no export features
- Check `.ai-rules/DECISIONS.md` before proposing any architectural pattern

## Final Instructions

- Do NOT start implementing anything
- Ask clarifying questions first
- Only write the PRD after the user has answered
- Save to `.ai-rules/tasks/prd-[feature-name].md`
