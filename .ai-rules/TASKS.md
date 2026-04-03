# Tasks - `daily-expense`

This file tracks the **current active work**. It is updated by the human at the start and end of every session.

The AI must read this file before doing anything. If a task is listed here, work on it step by step and wait for approval at each step. Do not jump ahead.

---

## How to Use This File

**At the start of a session:**
- Human tells the AI which task to work on
- AI reads this file and `HANDOFF.md` to understand context
- AI proposes a step-by-step plan
- Human approves or adjusts the plan
- AI executes one step at a time, showing diff before each change

**At the end of a session:**
- Human updates `HANDOFF.md` with what was done and what is next
- Human updates task status in this file

---

## Status Legend

| Label | Meaning |
|-------|---------|
| `NOT_STARTED` | Not started |
| `IN_PROGRESS` | In progress |
| `DONE` | Done |
| `PAUSED` | Paused / blocked |

---

## Full Rewrite Notice

This is a **full rewrite**. The existing code is treated as reference only - not as a base to build on. Tasks must be completed in order. Do not skip ahead. Each phase is a foundation for the next.

The AI must not reuse old code unless the human explicitly says so.

---

## Phase 1 - Foundation

### TASK-001 - Project Cleanup & Setup Verification
**Status:** `NOT_STARTED`
**Description:** Clean the existing codebase down to a known good starting point. Verify all tooling works before writing any new code.
**Steps:**
- [ ] Review existing folder structure with human - agree what to keep vs remove
- [ ] Remove old page components, old routes, and unused files - show list and get approval before deleting anything
- [ ] Verify Tailwind CSS 4 is correctly configured and working
- [ ] Verify Firebase config is working (`src/firebaseConfig.ts`)
- [ ] Verify Vite dev server runs correctly on port `43177`
- [ ] Verify Docker setup still works
- [ ] Review `package.json` - show list of potentially unused dependencies and ask before removing any
- [ ] Confirm folder structure matches what is documented in `AI.md`

---

### TASK-002 - App Shell & Layout
**Status:** `NOT_STARTED`
**Description:** Build the main layout wrapper that every page will live inside. This includes the outer shell, sidebar or top navigation skeleton, and the content area. No real pages yet - just the frame.
**Steps:**
- [ ] Agree on navigation style with human (sidebar vs top nav vs bottom nav for mobile)
- [ ] Build layout component in `src/layout/` using Tailwind only
- [ ] Set up responsive behavior - must work on mobile browser and desktop
- [ ] Add placeholder content area where pages will render
- [ ] Wire layout into `src/App.tsx`
- [ ] Verify layout renders correctly at mobile and desktop sizes

---

### TASK-003 - Routing Structure
**Status:** `NOT_STARTED`
**Description:** Define all app routes in one place. No page content yet - just route definitions with placeholder pages so navigation works end to end.
**Steps:**
- [ ] List all planned pages with human and agree on route paths
- [ ] Set up routes in `src/WebRoute.tsx` using React Router 7
- [ ] Create empty placeholder page components for each route in `src/pages/`
- [ ] Apply auth guard to all protected routes using existing pattern in `src/WebRoute.tsx`
- [ ] Verify navigating between routes works without errors

**Planned routes (confirm with human before implementing):**
- `/login` - Login page (public)
- `/` - Dashboard (protected)
- `/expenses` - Expense log (protected)
- `/income` - Monthly income (protected)
- `/analytics` - AI analytics (protected)
- `/settings` - Settings / dark mode toggle (protected)

---

## Phase 2 - Authentication

### TASK-004 - Login Page
**Status:** `NOT_STARTED`
**Description:** Build the login page UI with Google sign-in button. Clean Tailwind design, mobile-friendly.
**Steps:**
- [ ] Build login page in `src/pages/Login/`
- [ ] Add Google sign-in button using existing Firebase auth popup flow
- [ ] Handle loading state while auth is in progress
- [ ] Handle error state if sign-in fails
- [ ] Redirect to `/` (dashboard) after successful login
- [ ] If user is already logged in, redirect away from `/login` automatically
- [ ] Verify on mobile browser

---

### TASK-005 - Auth State & Route Protection
**Status:** `NOT_STARTED`
**Description:** Ensure auth state is properly managed across the app. Protected routes redirect to login if not authenticated. Auth context provides user data to all pages.
**Steps:**
- [ ] Review existing `src/context/AuthContext.tsx` - update or rewrite if needed
- [ ] Ensure auth state persists correctly across page refresh
- [ ] Verify all protected routes redirect to `/login` when not authenticated
- [ ] Verify `/login` redirects to `/` when already authenticated
- [ ] Add sign-out functionality to navigation

---

## Phase 3 - Core Expense Features

### TASK-006 - Add Expense Modal
**Status:** `NOT_STARTED`
**Description:** Build the add expense form as a modal popup. This is the primary way users enter data - get this right before building any list views.
**Steps:**
- [ ] Build modal wrapper using shadcn/ui Dialog or Radix UI Dialog - Tailwind only
- [ ] Build expense form inside modal with fields: name, amount, currency, category, date, note (optional)
- [ ] Populate category dropdown from `src/utils/CategoryList.ts`
- [ ] Default date to today
- [ ] Wire up Firebase write to `/expenses/users/{uid}/daily-expenses/{YYYY-MM-DD}/{expenseId}`
- [ ] Add `active: true` field to every new expense record
- [ ] Handle form validation, loading state, and error state
- [ ] Close modal and refresh list on success
- [ ] Trigger modal from a clearly visible add button in the app shell
- [ ] Verify modal works on mobile browser

---

### TASK-007 - Expense List Page
**Status:** `NOT_STARTED`
**Description:** Build the main expense log page showing a list of expenses. Basic list first - filters and views come later.
**Steps:**
- [ ] Build expense list page in `src/pages/Expenses/`
- [ ] Read expenses from Firebase for the current user
- [ ] Display each expense: name, amount, currency, category, date
- [ ] Show loading state while data is fetching
- [ ] Show empty state when no expenses exist
- [ ] Show error state if Firebase read fails
- [ ] Verify list renders correctly on mobile and desktop

---

### TASK-008 - Edit Expense
**Status:** `NOT_STARTED`
**Description:** Allow user to edit an existing expense. Reuses the add expense modal with pre-filled values.
**Steps:**
- [ ] Add edit button to each expense list item
- [ ] Open add expense modal pre-filled with existing expense data
- [ ] Wire up Firebase update call on submit
- [ ] Handle loading and error states
- [ ] Verify edit works and updates the list correctly

---

### TASK-009 - Delete Expense
**Status:** `NOT_STARTED`
**Description:** Allow user to delete an expense with a confirmation step.
**Steps:**
- [ ] Add delete button to each expense list item
- [ ] Show confirmation dialog before deleting (reuse shadcn/ui Dialog or Alert)
- [ ] Wire up Firebase delete call
- [ ] Handle loading and error states
- [ ] Remove expense from list on success

---

### TASK-010 - Active/Inactive Toggle per Expense
**Status:** `NOT_STARTED`
**Description:** Add a toggle to each expense to include or exclude it from total calculations. Inactive expenses stay in the database but are excluded from all totals.
**Steps:**
- [ ] Add toggle button to each expense list item
- [ ] Wire up Firebase update to set `active: true/false`
- [ ] Show inactive expenses visually distinct (greyed out)
- [ ] Ensure all total calculation logic filters by `active: true`
- [ ] Handle toggle loading and error state

---

## Phase 4 - Expense Views & Filtering

### TASK-011 - Expense Log View Tabs (Daily / Monthly / Yearly)
**Status:** `NOT_STARTED`
**Description:** Add tab-based view switching on the expense log page. Each tab groups and summarizes expenses differently.
**Steps:**
- [ ] Build tab switcher component (Daily / Monthly / Yearly) using Tailwind
- [ ] Daily view: expenses grouped by day with daily totals
- [ ] Monthly view: expenses grouped by month with monthly totals
- [ ] Yearly view: expenses grouped by year with yearly totals
- [ ] Each view shows total for all expenses and total per category
- [ ] Handle empty states per view

---

### TASK-012 - Date Range Filter
**Status:** `NOT_STARTED`
**Description:** Allow user to pick a custom date range and see expense logs with totals for all and per category.
**Steps:**
- [ ] Add date range picker (start date / end date) - use Day.js for all date logic
- [ ] Filter Firebase expense data by selected range
- [ ] Show total for all expenses in range
- [ ] Show breakdown total per category in range
- [ ] Agree default date range with human before implementing

---

### TASK-013 - Category Monthly Totals View
**Status:** `NOT_STARTED`
**Description:** A view showing total per category for a selected month range. Default shows the whole current year.
**Steps:**
- [ ] Build month range selector
- [ ] Query and group Firebase data by category for selected range
- [ ] Display category totals (table or chart - ask human to decide)
- [ ] Default to current full year on first load

---

## Phase 5 - Income

### TASK-014 - Monthly Income Entry
**Status:** `NOT_STARTED`
**Description:** Allow user to log their monthly income. Stored separately from expenses.
**Firebase path:** `/expenses/users/{uid}/income/{YYYY-MM}`
**Steps:**
- [ ] Confirm data structure and path with human before writing any code
- [ ] Build add/edit income UI (popup or inline - ask human)
- [ ] Wire up Firebase read/write for income records
- [ ] Show income entry on relevant views
- [ ] Handle empty state (no income logged yet)

---

### TASK-015 - Monthly Income vs Expense View
**Status:** `NOT_STARTED`
**Description:** A view showing each month's total income, total expense, and per-category breakdown side by side.
**Steps:**
- [ ] Agree on layout with human (table vs cards vs chart)
- [ ] Query income and expense data per month from Firebase
- [ ] Calculate and show: total income, total expense, money left per month
- [ ] Show per-category expense breakdown per month
- [ ] Handle months with no income or no expenses logged

---

### TASK-016 - Month-by-Month Comparison
**Status:** `NOT_STARTED`
**Description:** Allow user to compare two or more months side by side showing per-category totals, total income, total expense, and money left.
**Steps:**
- [ ] Build month selector (pick 2 or more months)
- [ ] Query data for all selected months from Firebase
- [ ] Agree on comparison layout with human (columns per month)
- [ ] Show per-category totals per month
- [ ] Show total income, total expense, money left per month
- [ ] Ask human if they want differences highlighted between months

---

## Phase 6 - Dashboard

### TASK-017 - Dashboard Page
**Status:** `NOT_STARTED`
**Description:** Build the main dashboard as a summary overview. Built after data features so there is real data to display.
**Steps:**
- [ ] Agree on dashboard layout and what to show with human
- [ ] Show current month summary: total income, total expense, money left
- [ ] Show spending breakdown by category (Nivo chart)
- [ ] Show recent expenses (last 5-10)
- [ ] Add quick-access add expense button
- [ ] Handle empty state (new user with no data)
- [ ] Verify on mobile and desktop

---

## Phase 7 - Polish & Quality

### TASK-018 - Empty & Loading States Audit
**Status:** `NOT_STARTED`
**Description:** Audit all pages for missing loading and empty states and implement consistently.
**Steps:**
- [ ] List all missing loading states across every page
- [ ] List all missing empty states across every page
- [ ] Implement using consistent Tailwind components
- [ ] Verify all async operations have visible feedback

---

### TASK-019 - Dark Mode
**Status:** `NOT_STARTED`
**Description:** Add a light/dark toggle. User preference persists in localStorage.
**Steps:**
- [ ] Set up Tailwind dark mode config (`darkMode: 'class'` in `tailwind.config`)
- [ ] Add toggle button to navigation or settings page
- [ ] Save and load preference from localStorage
- [ ] Apply dark mode classes across all Tailwind components
- [ ] Verify dark mode on mobile and desktop

---

### TASK-020 - Bootstrap -> Tailwind Migration Completion
**Status:** `IN_PROGRESS` (gradual, ongoing alongside all other tasks)
**Description:** All new code uses Tailwind. Any remaining Bootstrap components are migrated when touched. By Phase 7 most should already be gone.
**Steps:**
- [ ] Audit remaining Bootstrap usage after Phase 6 is complete
- [ ] Migrate remaining components to Tailwind - one at a time with approval
- [ ] Remove React Bootstrap from `package.json` once fully migrated

---

## Phase 8 - AI Analytics

### TASK-021 - AI Analytics Suggestion Page
**Status:** `NOT_STARTED`
**Description:** A dedicated page that sends aggregated spending data to the Anthropic API and returns saving suggestions per category.
**Steps:**
- [ ] Aggregate category totals only - never send raw records or personal data to the API
- [ ] Build prompt asking for saving suggestions based on category totals
- [ ] Call Anthropic API on user-triggered refresh only - not on every render
- [ ] Display suggestions clearly per category
- [ ] Handle loading, error, and empty states
- [ ] Add visible refresh button

---

> Warning: Do not start a task that is not listed here without the user adding it first. If the user asks for something not in this file, ask them to add it before proceeding.
