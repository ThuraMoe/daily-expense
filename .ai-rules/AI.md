# AI Rules for `daily-expense`

## Project Identity

`daily-expense` is a single-page personal expense tracking application. It lets authenticated users log expenses, categorize them, and review dashboard and analytics views over their own data.

- Frontend stack: React 19, Vite 6, mixed TypeScript/JavaScript codebase (some files are `.tsx`/`.ts`, others still follow older JS-style patterns), React Router 7
- UI stack: Tailwind CSS 4 (primary — all new components), React Bootstrap (legacy — being phased out gradually), shadcn/ui primitives, Radix UI, Lucide icons, Font Awesome
- Data and auth: Firebase Authentication, Firebase Realtime Database, Firebase Analytics
- Charts and dates: Nivo charts, Day.js
- Local runtime: Node.js, npm, Docker / Docker Compose

## Key Integrations

- Firebase Authentication is used for login state and session handling.
- Google sign-in is used through Firebase auth popup flow.
- Firebase Realtime Database stores expense data.
- Firebase Analytics is initialized in the frontend app.

## Architecture & Structure

This repo is a frontend-only app. There is no Laravel, Express, or separate backend in this project.

- App entry points live in `src/main.tsx`, `src/App.tsx`, and `src/WebRoute.tsx`.
- Firebase setup lives in `src/firebaseConfig.ts`.
- Auth state handling lives in `src/context/AuthContext.tsx`.
- Page-level screens live in `src/pages/`.
- Shared UI and reusable components live in `src/components/`.
- App shell and navigation live in `src/layout/`.
- Utility helpers and constants live in `src/utils/` and `src/lib/`.
- Static assets live in `src/assets/`.
- CSS modules and shared styles live in `src/styles/`, `src/App.css`, and `src/index.css`.

## Data Structure (Firebase Realtime Database)

The database is scoped per authenticated user. Current paths visible in code:

- `/expenses/users/{uid}/daily-expenses/{YYYY-MM-DD}/{expenseId}` - individual expense records grouped by day

Each expense record currently contains:

- `name`
- `amount`
- `currency`
- `category`

Categories are not currently stored as user-defined Firebase records. The app uses a predefined local category list from `src/utils/CategoryList.ts`. The `src/pages/Category/CategoryList.tsx` screen exists, but it does not currently persist category data to Firebase.

Do not invent or assume database paths beyond what is visible in existing code. Always check `src/utils/` and existing Firebase call sites before writing new read/write logic.

## Auth & Route Guards

- Unauthenticated users are redirected to the login screen via route-level guards defined in `src/WebRoute.tsx`.
- Do not add new pages or routes without applying the same auth guard pattern already in use.
- Do not assume a user is logged in when writing data access logic.

## Deployment & Runtime

- Local development uses `npm run dev`.
- The Vite dev server is configured to use port `43177`. This port is intentional - do not change it without updating both `vite.config.ts` and `docker-compose.yml` at the same time.
- Docker support exists through `Dockerfile` and `docker-compose.yml`.
- Environment variables are read from `.env` using Vite `import.meta.env` keys prefixed with `VITE_`.

## Coding Conventions

- Prefer existing project style over idealized rewrites.
- Use PascalCase for React components and page files.
- Use camelCase for variables, functions, props, and local helpers.
- Existing route, utility, and style naming is mixed; preserve nearby conventions when editing.
- Path alias `@` maps to `src` and should be preferred where the file already uses it.
- Keep components focused and local to the page unless the code is clearly reusable.
- All new components must be written with Tailwind CSS only — do not use React Bootstrap for any new code.
- Existing Bootstrap components are being phased out gradually — only migrate a Bootstrap component to Tailwind if it is within the scope of the current task.
- Do not rewrite Bootstrap components to Tailwind speculatively or as a "while I'm at it" improvement.
- Favor small, explicit state and effect logic over broad refactors.
- Every React component must have a JSDoc comment directly above it describing what it renders and its purpose.
- Every function and method must have a JSDoc comment describing what it does, its parameters, and its return value.
- Inline comments are still kept rare and practical - only when logic is non-obvious within a function body.

## Comments & Documentation

Always add JSDoc comments for components and functions. Use the following format:

**React components:**
```tsx
/**
 * ExpenseCard
 *
 * Displays a single expense record including category, amount, and date.
 * Used inside the expense list on the Dashboard page.
 *
 * @param {Expense} expense - The expense object to display.
 * @param {() => void} onDelete - Callback fired when the delete button is clicked.
 */
const ExpenseCard = ({ expense, onDelete }) => { ... }
```

**Functions and helpers:**
```ts
/**
 * formatCurrency
 *
 * Formats a numeric amount into a localized currency string.
 *
 * @param {number} amount - The raw numeric value.
 * @param {string} currency - ISO 4217 currency code (e.g. "USD", "KHR").
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount, currency) => { ... }
```

**Rules:**
- Every component file must have a JSDoc block above the component function.
- Every exported function or helper must have a JSDoc block.
- Private or internal helper functions inside a component should have at least a one-line `//` comment if their purpose is not immediately obvious.
- Do not add JSDoc to JSX markup, event handler inline arrows, or simple one-liner constants.
- Do not write comments that just restate what the code already says (e.g. `// increment count` above `count++`).

## Error Handling & Logging

- Follow the existing lightweight approach unless asked to standardize error handling.
- Prefer user-facing guards/messages for recoverable UI issues.
- Use `console.error` sparingly for debugging or unexpected failures when no project logging utility exists.
- Do not add noisy logging to frequently rendered paths.

## Testing

- There are no automated tests in this project.
- Do not generate test files, test utilities, or testing library configs unless explicitly asked.

## Change Control

Before creating, editing, or deleting any file, the AI must:

1. Show a clear diff or summary of exactly what will change
2. Explicitly state which files will be created, modified, or deleted
3. Wait for explicit approval before making any changes

The AI must never:
- Create new files without permission
- Delete or overwrite existing files without permission
- Refactor or rename anything outside the scope of the current task
- Make "while I'm at it" improvements without asking first

If the AI is unsure whether a change is in scope, it must ask — not assume.

## Workflow Rules

- Prefer small scoped changes over rewrites.
- Ask before refactoring large existing components or reshaping file structure.
- Preserve the current Firebase-based architecture unless explicitly asked to change it.
- Keep environment-driven configuration in Vite config or code, not hard-coded across multiple files.
- When changing ports or local runtime behavior, keep Vite and Docker settings aligned.
- Reuse existing utilities, constants, and category definitions before creating new duplicates.
- If a file mixes TypeScript and JavaScript conventions, match the surrounding file instead of trying to normalize the whole project.

## What Not To Do

- Do not modify `.env` directly unless the user explicitly asks for it.
- Do not rotate, replace, or expose Firebase credentials.
- Do not change Firebase project IDs, database URLs, or auth configuration without asking.
- Do not switch authentication flow away from Firebase Google popup without asking.
- Do not introduce a backend, ORM, or server API layer as part of routine frontend changes.
- Do not use React Bootstrap for any new components — use Tailwind CSS instead.
- Do not rewrite React Bootstrap or shadcn/ui usage wholesale outside the scope of the current task.
- Do not rename large groups of files to enforce naming purity.
- Do not change the dev port without updating both Vite config and `docker-compose.yml`.

## Known Issues & Gotchas

- The dev port was previously misconfigured. Always keep `vite.config.ts` and `docker-compose.yml` in sync when touching port configuration.
- Mixed TS/JS files exist intentionally across the codebase. Bulk normalization is risky and should not be attempted.

## Context The AI Can't Infer Reliably

- The repo is partially modernized: it uses TypeScript/Vite configuration, but several app files still follow older JS-style patterns. That mixed state is intentional enough that bulk normalization is risky.
- Firebase is the source of truth for both auth and app data, so many features are coupled directly to frontend state and Firebase reads/writes.
- There are existing shared category and date helper utilities in `src/utils/`; use those before inventing alternate business logic.
- The project includes both React Bootstrap styling and newer utility/component patterns. Consistency matters less than avoiding unnecessary churn.
- Docker support is for local development convenience, not proof of a production container deployment pipeline.
