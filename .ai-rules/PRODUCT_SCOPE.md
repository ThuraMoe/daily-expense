# Product Scope — `daily-expense`

## What This App Is

`daily-expense` is a **personal expense tracking app** for a single authenticated user.
It is not a team tool, not a budgeting platform, and not a financial advisor.
Its job is simple: let a user log what they spent, when, and on what — then show it back to them in useful ways.

---

## What Users Can Do ✅

- Sign in with Google via Firebase Authentication
- Log a new expense (amount, category, date, optional note)
- View a list of their past expenses
- Filter or browse expenses by date or category
- See a dashboard with summary analytics (totals, breakdowns by category, trends over time)
- Delete an expense they logged
- Edit an expense they logged
- Sign out

## Planned Features 📋

- **Responsive on mobile browser** — the app must work well on mobile browsers, not just desktop
- **Add expense via popup** — the create expense form opens as a modal/popup, not a separate page
- **Expense log views** — user can view logs by Daily, Monthly, or Yearly tab, each showing total for all and per category
- **Date range filter** — user can pick a custom date range and see expense logs with totals for all and per category
- **Category monthly totals** — user can see total per category for a selected month range; default view shows the whole current year
- **Active/Inactive toggle per expense** — each expense has a toggle to include or exclude it from total calculations
- **AI analytics suggestion page** — AI-powered page that analyzes spending and suggests which categories to reduce for better savings
- **Monthly income** — user can log their monthly income
- **Monthly income vs expense view** — user can see each month's total income, total expense, and breakdown per category
- **Month-by-month comparison** — user can compare two or more months side by side, showing per-category totals, total income, total expense, and money left
- **Dark mode** — user can toggle between light and dark via a button in the app
- **Bootstrap → Tailwind migration** — gradual, component by component

---

## What Users Cannot Do ❌

- Create, rename, or delete expense categories — categories are predefined and fixed
- See or access another user's data
- Use the app without signing in
- Export data
- Set budgets or spending limits
- Receive notifications or reminders
- Use the app offline
- Bulk delete expenses
- Import expenses from CSV or bank

---

## What This App Will Never Have ❌

These are explicitly out of scope. The AI must not build or suggest any of these:

**Auth**
- Email/password login
- Any OAuth provider other than Google

**Expenses**
- Bulk delete
- CSV or bank import

**Categories**
- User-created, renamed, or deleted categories
- Categories stored in Firebase

**Dashboard**
- Budget tracking or spending limits
- Forecasting or predictions

**UI**
- Speculative Bootstrap → Tailwind rewrites outside current task scope

**Infrastructure**
- Data export
- Backend API or server layer
- Offline support

---

## What This App Is Not

- Not a multi-user or shared expense tool
- Not a bank integration or financial data aggregator
- Not a mobile app (web only)
- Not a backend service — frontend only, no server API

---

## Predefined Categories

Categories are fixed and defined in `src/utils/CategoryList.ts`. They are **not stored in Firebase** — they are local constants only.

A `src/pages/Category/CategoryList.tsx` screen exists in the codebase but does not currently persist anything to Firebase. Do not assume it does.

The AI must not add, remove, or rename categories without explicit instruction. Always reference `src/utils/CategoryList.ts` as the single source of truth for category data.

---

## Design Philosophy

- Simple over feature-rich
- Personal and private — one user, their own data
- Fast to use — logging an expense should take seconds
- No clutter — only show what the user needs

---

> ⚠️ If a feature request falls outside this scope, the AI must flag it and ask before proceeding. Do not silently expand the app's scope.
