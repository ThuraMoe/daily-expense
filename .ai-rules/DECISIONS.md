# Decisions — `daily-expense`

This file records **why** things were built a certain way.
Before refactoring or "improving" any of the patterns below, the AI must read this file and understand the reasoning. Do not reverse a decision without explicit instruction from the user.

---

## Firebase calls live directly in components (no service layer)

**Decision:** Firebase reads and writes are made directly inside React components, not abstracted into service classes or a repository layer.

**Why:** The app is small and personal. Introducing a service layer would add complexity without meaningful benefit at this scale. The direct approach is easier to read and maintain for a solo developer.

**Do not:** Introduce a `services/`, `repositories/`, or `api/` abstraction layer as part of routine changes. Only do this if the user explicitly asks for it.

---

## Categories are predefined and fixed (not stored in Firebase)

**Decision:** Expense categories come from a local constant file `src/utils/CategoryList.ts`. They are not stored in Firebase and are not user-configurable.

**Why:** The app is for personal use by a single user. Fixed categories keep the data model simple and avoid building a full category management UI.

**Note:** A `src/pages/Category/CategoryList.tsx` screen exists but does not currently write to Firebase. Do not assume it does, and do not add Firebase persistence to it unless explicitly asked.

**Do not:** Add category CRUD, store categories in Firebase, or make them user-editable unless explicitly asked.

---

## Mixed TypeScript and JavaScript files

**Decision:** The codebase has a mix of `.tsx`/`.ts` files and older JS-style patterns. This mixed state is left as-is.

**Why:** The project was partially modernized. Full normalization would require touching many files with risk of introducing bugs for no functional gain.

**Do not:** Attempt bulk conversion of JS files to TS, or add strict TypeScript configs that would break existing files. Match the style of the file you are editing.

---

## React Bootstrap is being replaced with Tailwind CSS (gradual migration)

**Decision:** The project is migrating from React Bootstrap to Tailwind CSS 4. The migration is gradual — new components are written in Tailwind only, and existing Bootstrap components are converted when they are touched as part of a task.

**Why:** Tailwind gives more control over styling, reduces bundle size from Bootstrap, and aligns better with the shadcn/ui components already in use.

**Rules:**
- All new components must use Tailwind only — no new Bootstrap usage
- Only migrate an existing Bootstrap component if it is directly in scope of the current task
- Do not do speculative Bootstrap → Tailwind rewrites as cleanup

**Do not:** Rewrite all Bootstrap components at once. Do not add new Bootstrap imports.

---

## Dev port is 43177

**Decision:** The Vite dev server runs on port `43177` instead of the default `5173`.

**Why:** Port was intentionally set to avoid conflicts with other local services. This is reflected in both `vite.config.ts` and `docker-compose.yml`.

**Do not:** Change the port without updating both files simultaneously.

---

## Add expense form opens as a popup/modal

**Decision:** The create expense form is a modal popup, not a separate page or inline form.

**Why:** Faster UX — user stays in context of their current view. Consistent with mobile-friendly interaction patterns.

**Do not:** Create a separate `/add-expense` route or render the form inline in the expense list.

---

## Active/Inactive toggle is stored per expense record

**Decision:** Each expense record in Firebase has an `active` boolean field. Inactive expenses are excluded from all total calculations but remain in the database.

**Why:** User may want to temporarily exclude an expense (e.g. a reimbursable cost) without deleting it permanently.

**Firebase impact:** All total calculation logic must filter by `active: true`. Do not assume all records in Firebase should be summed.

---

## Monthly income is stored separately from expenses

**Decision:** Monthly income is stored as a separate Firebase node, not mixed with expense records.

**Suggested path:** `/expenses/users/{uid}/income/{YYYY-MM}` with a `amount` and `currency` field.

**Why:** Income and expenses are conceptually different and queried independently. Mixing them would complicate filtering logic.

**Do not:** Store income as a special expense record with a negative amount or a special category.

---

## AI analytics page uses Anthropic API

**Decision:** The AI analytics suggestion page calls the Anthropic API to analyze the user's spending data and return saving suggestions per category.

**Why:** On-device analysis would be too limited. A real LLM can give meaningful, contextual suggestions.

**Rules:**
- Only call the API when the user explicitly opens or refreshes the analytics page — do not call on every render
- Never send personally identifiable information to the API — only send aggregated category totals
- Handle API errors gracefully with a user-facing message

---



**Decision:** There are no unit tests, integration tests, or test configuration files in this project.

**Why:** Personal project, solo developer, moving fast. The cost of maintaining tests outweighs the benefit at this stage.

**Do not:** Generate test files, install testing libraries, or scaffold test configs unless explicitly asked.

---

> ⚠️ If you think a decision here should be changed, say so and explain why — do not silently reverse it.
