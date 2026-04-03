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
|--------|---------|
| `NOT_STARTED` | Not started |
| `IN_PROGRESS` | In progress |
| `DONE` | Done |
| `PAUSED` | Paused / blocked |

---

## Active Tasks

### TASK-001 - Edit Expense
**Status:** `NOT_STARTED`
**From ROADMAP:** Expense Management -> Edit an existing expense
**Description:** Allow the user to edit an existing expense record. Should reuse the existing add expense form pattern.
**Steps:**
- [ ] Review current add expense form implementation
- [ ] Plan edit flow (inline edit vs modal vs separate page) - ask user before deciding
- [ ] Implement edit UI
- [ ] Wire up Firebase update call
- [ ] Handle loading and error states
- [ ] Test manually

---

### TASK-002 - Delete Expense
**Status:** `NOT_STARTED`
**From ROADMAP:** Expense Management -> Delete an expense
**Description:** Allow the user to delete an expense record with a confirmation step.
**Steps:**
- [ ] Add delete button to expense list item
- [ ] Show confirmation before deleting
- [ ] Wire up Firebase delete call
- [ ] Handle loading and error states
- [ ] Test manually

---

### TASK-003 - Dashboard Charts
**Status:** `NOT_STARTED`
**From ROADMAP:** Dashboard & Analytics -> Total spending by category, spending trend over time
**Description:** Add Nivo charts to the dashboard showing category breakdown and time trend.
**Steps:**
- [ ] Review existing dashboard page structure
- [ ] Decide chart types with user (pie/bar for category, line for trend)
- [ ] Build category breakdown chart
- [ ] Build time trend chart
- [ ] Connect to real Firebase data
- [ ] Handle empty state (no expenses yet)

---

### TASK-004 - Empty & Loading States
**Status:** `NOT_STARTED`
**From ROADMAP:** UI & Experience
**Description:** Add proper empty states and loading indicators across the app.
**Steps:**
- [ ] Audit all pages for missing loading states
- [ ] Audit all pages for missing empty states
- [ ] Implement consistently using existing UI components

### TASK-005 - Bootstrap -> Tailwind Migration
**Status:** `IN_PROGRESS` (gradual)
**Description:** Replace React Bootstrap with Tailwind CSS across the app. Done component by component - only migrate what is in scope of the current task. Never do bulk rewrites.
**Rules:**
- All new components must be Tailwind only
- Migrate an existing Bootstrap component only when touching it for another reason
- Do not import any new Bootstrap components

---

### TASK-006 - Dark Mode
**Status:** `NOT_STARTED`
**Description:** Add a light/dark mode toggle button in the app. User preference should persist across sessions (localStorage or Firebase user preference).
**Steps:**
- [ ] Decide where to store preference - ask user (localStorage vs Firebase)
- [ ] Set up Tailwind dark mode config (`darkMode: 'class'` in tailwind.config)
- [ ] Add toggle button to app shell/navigation
- [ ] Apply dark mode classes to existing Tailwind components
- [ ] Handle Bootstrap components still in the app - decide approach with user

---

### TASK-007 - Mobile Responsive Layout
**Status:** `NOT_STARTED`
**Description:** Ensure the entire app is fully usable on mobile browsers. All pages, forms, and navigation must work on small screens.
**Steps:**
- [ ] Audit all existing pages on mobile viewport
- [ ] Fix layout issues page by page - ask user to prioritize order
- [ ] Ensure navigation is mobile-friendly
- [ ] Test on common mobile screen sizes (375px, 390px, 414px)

---

### TASK-008 - Add Expense Popup Modal
**Status:** `NOT_STARTED`
**Description:** Convert the add expense form into a modal popup. Reuse existing form logic - only change the container.
**Steps:**
- [ ] Review current add expense form implementation
- [ ] Build modal wrapper using Tailwind + Radix UI Dialog (or shadcn/ui Dialog)
- [ ] Move form into modal
- [ ] Trigger modal from existing add button
- [ ] Handle close, submit, and error states
- [ ] Ensure modal is mobile-friendly

---

### TASK-009 - Expense Log Views (Daily / Monthly / Yearly)
**Status:** `NOT_STARTED`
**Description:** Add tab-based view switching on the expense log page - Daily, Monthly, Yearly. Each view shows expense list and totals for all and per category.
**Steps:**
- [ ] Review current expense list page structure
- [ ] Build tab switcher (Daily / Monthly / Yearly)
- [ ] Group and filter Firebase data by selected view
- [ ] Show total for all expenses in view
- [ ] Show total per category in view
- [ ] Handle empty states per view

---

### TASK-010 - Date Range Filter with Category Totals
**Status:** `NOT_STARTED`
**Description:** Allow user to pick a custom date range and see filtered expense logs with totals for all and per category.
**Steps:**
- [ ] Add date range picker (start date / end date) - use Day.js for date logic
- [ ] Filter Firebase expense data by selected range
- [ ] Show total for all expenses in range
- [ ] Show breakdown total per category in range
- [ ] Default range - ask user what default should be

---

### TASK-011 - Category Monthly Totals View
**Status:** `NOT_STARTED`
**Description:** A view showing total per category for a selected month range. Default shows the whole current year.
**Steps:**
- [ ] Build month range selector
- [ ] Query Firebase data for selected month range
- [ ] Group totals by category
- [ ] Display category totals clearly (table or chart - ask user)
- [ ] Default to current full year on first load

---

### TASK-012 - Active/Inactive Toggle per Expense
**Status:** `NOT_STARTED`
**Description:** Add an active/inactive toggle to each expense record. Inactive expenses are excluded from all totals but stay in the database.
**Steps:**
- [ ] Add `active` boolean field to expense records in Firebase (default: `true`)
- [ ] Add toggle button to each expense list item
- [ ] Update all total calculation logic to filter by `active: true`
- [ ] Show inactive expenses visually distinct (greyed out)
- [ ] Handle toggle loading and error state

---

### TASK-013 - Monthly Income
**Status:** `NOT_STARTED`
**Description:** Allow user to log their monthly income. Stored separately from expenses in Firebase.
**Firebase path:** `/expenses/users/{uid}/income/{YYYY-MM}`
**Steps:**
- [ ] Design income data structure - confirm path and fields with user
- [ ] Build add/edit income UI (popup or inline - ask user)
- [ ] Wire up Firebase read/write for income
- [ ] Show income entry on relevant views
- [ ] Handle empty state (no income logged yet)

---

### TASK-014 - Monthly Income vs Expense View
**Status:** `NOT_STARTED`
**Description:** A view showing each month's total income, total expense, and per-category expense breakdown side by side.
**Steps:**
- [ ] Design layout - ask user (table vs cards vs chart)
- [ ] Query income and expense data per month from Firebase
- [ ] Calculate: total income, total expense, money left per month
- [ ] Show per-category breakdown per month
- [ ] Handle months with no income or no expenses

---

### TASK-015 - Month-by-Month Comparison
**Status:** `NOT_STARTED`
**Description:** Allow user to compare two or more months side by side. Shows per-category totals, total income, total expense, and money left per month.
**Steps:**
- [ ] Build month selector (pick 2+ months to compare)
- [ ] Query data for all selected months
- [ ] Build comparison layout (columns per month - ask user for design preference)
- [ ] Show per-category totals per month
- [ ] Show total income, total expense, money left per month
- [ ] Highlight differences between months (optional - ask user)

---

### TASK-016 - AI Analytics Suggestion Page
**Status:** `NOT_STARTED`
**Description:** A dedicated page that sends aggregated spending data to the Anthropic API and displays saving suggestions per category.
**Steps:**
- [ ] Aggregate user's category totals (never send raw expense records or personal data to API)
- [ ] Build prompt that asks for saving suggestions based on category totals
- [ ] Call Anthropic API on page load or user-triggered refresh
- [ ] Display suggestions clearly per category
- [ ] Handle API loading, error, and empty states
- [ ] Add refresh button - do not auto-call on every render

---

> Warning: Do not start a task that is not listed here without the user adding it first. If the user asks for something not in this file, ask them to add it before proceeding.
