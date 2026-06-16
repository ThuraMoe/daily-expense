import { useEffect, useState } from "react";
import {
  get,
  getDatabase,
  onValue,
  orderByKey,
  query,
  ref,
  remove,
  startAt,
  endAt,
  update,
  type DataSnapshot,
} from "firebase/database";
import type { User } from "firebase/auth";
import { ChevronDown, Circle, CircleCheck, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";
import { getCategoryMeta } from "@/utils/CategoryConfig";
import AddExpenseModal from "@/components/AddExpenseModal";
import DateFilterPopover, {
  type DateFilter,
  formatFilterLabel,
} from "@/components/DateFilter";
import { MONTH_FULL } from "@/components/DateFilter/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ViewMode = "daily" | "monthly" | "yearly" | "range";

interface Expense {
  id: string;
  date: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  note?: string;
  active?: boolean;
}

interface ExpenseGroup {
  key: string;
  label: string;
  items: Expense[];
}

interface YearlyMonthData {
  month: string;
  label: string;
  total: number;
  expenses: Expense[];
}

/**
 * getTodayStr
 *
 * Returns today's date as a YYYY-MM-DD string using local time.
 *
 * @returns {string} Today's date string.
 */
function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * formatDate
 *
 * Formats a YYYY-MM-DD string into a human-readable label like "Jun 1, 2026".
 * Constructs the Date from parts to avoid UTC offset shifts.
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format.
 * @returns {string} Formatted date string.
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
}

/**
 * groupByDate
 *
 * Groups a flat expense array by date, sorted newest-first.
 *
 * @param {Expense[]} expenses - Flat array of expense records.
 * @returns {ExpenseGroup[]} Expenses grouped and sorted by date descending.
 */
function groupByDate(expenses: Expense[]): ExpenseGroup[] {
  const map = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const list = map.get(expense.date) ?? [];
    list.push(expense);
    map.set(expense.date, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ key: date, label: formatDate(date), items }));
}

/**
 * parseDateBucketedSnapshot
 *
 * Parses a Firebase snapshot from a date-bucketed node into a flat expense array.
 *
 * @param {Record<string, Record<string, Omit<Expense, "id" | "date">>> | null} data - Snapshot value.
 * @returns {Expense[]} Flat expense array.
 */
function parseDateBucketedSnapshot(
  data: Record<string, Record<string, Omit<Expense, "id" | "date">>> | null
): Expense[] {
  if (!data) return [];
  const flat: Expense[] = [];
  for (const [date, dateGroup] of Object.entries(data)) {
    for (const [id, record] of Object.entries(dateGroup)) {
      flat.push({ id, date, ...record });
    }
  }
  return flat;
}

/**
 * parseDaySnapshot
 *
 * Parses a Firebase snapshot from a single date node into an expense array.
 *
 * @param {string} date - The date string (YYYY-MM-DD) this snapshot belongs to.
 * @param {Record<string, Omit<Expense, "id" | "date">> | null} data - Snapshot value.
 * @returns {Expense[]} Flat expense array.
 */
function parseDaySnapshot(
  date: string,
  data: Record<string, Omit<Expense, "id" | "date">> | null
): Expense[] {
  if (!data) return [];
  return Object.entries(data).map(([id, record]) => ({ id, date, ...record }));
}

/**
 * calcStats
 *
 * Computes summary statistics for a set of expenses. Only counts expenses
 * where active !== false. Only sums "$" currency amounts.
 *
 * @param {Expense[]} items - All loaded expenses for the current view.
 * @param {ViewMode} view - Active view mode; determines the avg-per-day divisor.
 * @returns {{ totalSpent: number; mostSpentCategory: string | null; avgPerDay: number; byCategory: Record<string, number> }}
 */
function calcStats(
  items: Expense[],
  view: ViewMode
): {
  totalSpent: number;
  mostSpentCategory: string | null;
  avgPerDay: number;
  byCategory: Record<string, number>;
} {
  const active = items.filter((i) => i.active !== false);
  const totalSpent = active.reduce(
    (sum, i) => (i.currency === "$" ? sum + Number(i.amount) : sum),
    0
  );

  const byCategory: Record<string, number> = {};
  for (const item of active) {
    if (item.currency !== "$") continue;
    byCategory[item.category] = (byCategory[item.category] ?? 0) + Number(item.amount);
  }

  let mostSpentCategory: string | null = null;
  let maxAmt = 0;
  for (const [cat, amt] of Object.entries(byCategory)) {
    if (amt > maxAmt) {
      maxAmt = amt;
      mostSpentCategory = cat;
    }
  }

  const d = new Date();
  let daysElapsed = 1;
  if (view === "monthly") {
    daysElapsed = d.getDate();
  } else if (view === "yearly") {
    const yearStart = new Date(d.getFullYear(), 0, 0);
    daysElapsed = Math.floor((d.getTime() - yearStart.getTime()) / 86400000);
  }

  return {
    totalSpent,
    mostSpentCategory,
    avgPerDay: daysElapsed > 0 ? totalSpent / daysElapsed : 0,
    byCategory,
  };
}

interface ExpenseCardProps {
  expense: Expense;
  togglingId: string | null;
  onToggle: (expense: Expense) => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

/**
 * ExpenseCard
 *
 * Renders a single expense record with name, amount, category badge, optional note,
 * and action buttons for active toggle, edit, and delete.
 *
 * @param {ExpenseCardProps} props
 */
const ExpenseCard = ({ expense, togglingId, onToggle, onEdit, onDelete }: ExpenseCardProps) => {
  const { color, Icon } = getCategoryMeta(expense.category);
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-card px-3 py-3 shadow-sm transition-opacity ${
        expense.active === false ? "opacity-50" : ""
      }`}
    >
      {/* Category icon box */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}26` }}
      >
        <Icon size={20} style={{ color }} />
      </div>

      {/* Name + category badge */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-card-foreground">
          {expense.name}
        </span>
        <span
          className="mt-1 inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {expense.category}
        </span>
        {expense.note && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{expense.note}</p>
        )}
      </div>

      {/* Amount + action buttons */}
      <div className="flex shrink-0 items-center gap-1">
        <span className="mr-1 text-sm font-semibold text-card-foreground">
          {expense.currency}{Number(expense.amount).toFixed(2)}
        </span>
        <button
          aria-label={expense.active === false ? "Mark active" : "Mark inactive"}
          onClick={() => onToggle(expense)}
          disabled={togglingId === expense.id}
          className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
            expense.active === false
              ? "text-muted-foreground hover:bg-muted hover:text-foreground"
              : "text-green-500 hover:bg-green-500/10"
          }`}
        >
          {expense.active === false ? <Circle size={18} /> : <CircleCheck size={18} />}
        </button>
        <button
          aria-label="Edit expense"
          onClick={() => onEdit(expense)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil size={18} />
        </button>
        <button
          aria-label="Delete expense"
          onClick={() => onDelete(expense)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const EMPTY_MESSAGES: Record<ViewMode, string> = {
  daily: "No expenses for this day.",
  monthly: "No expenses for this month.",
  yearly: "No expenses for this year.",
  range: "No expenses for the selected range.",
};

/**
 * buildDefaultFilter
 *
 * Builds the initial DateFilter with today as the selected day.
 *
 * @returns {DateFilter}
 */
function buildDefaultFilter(): DateFilter {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return { mode: "daily", date: `${y}-${m}-${d}` };
}

/**
 * Expenses
 *
 * Expense log page with a smart date-filter button (Day / Month / Year / Range).
 * Clicking the button opens a popover with a tab-switched calendar/picker.
 * The selected date, month, year, or range drives the Firebase query.
 * Only active expenses are counted in all totals.
 *
 * @returns {JSX.Element} The expense log page.
 */
const Expenses = () => {
  const { currentUser } = useAuth() as unknown as { currentUser: User | null };
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DateFilter>(buildDefaultFilter);

  // Yearly accordion state.
  const [yearlyMonths, setYearlyMonths] = useState<YearlyMonthData[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [yearlyVersion, setYearlyVersion] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const view: ViewMode = filter.mode;

  // Re-runs whenever the filter changes.
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setExpenses([]);
    setError(null);
    setYearlyMonths([]);
    setExpandedMonths(new Set());
    setSelectedCategory(null);

    const db = getDatabase(app);
    const uid = currentUser.uid;

    // ── Daily ─────────────────────────────────────────────────────────────────
    if (filter.mode === "daily" && filter.date) {
      const dailyRef = ref(db, `expenses/users/${uid}/daily-expenses/${filter.date}`);
      const unsub = onValue(
        dailyRef,
        (snapshot) => {
          setExpenses(
            parseDaySnapshot(
              filter.date!,
              snapshot.val() as Record<string, Omit<Expense, "id" | "date">> | null
            )
          );
          setLoading(false);
        },
        (err) => {
          console.error("Failed to read expenses:", err);
          setError("Failed to load expenses. Please try again.");
          setLoading(false);
        }
      );
      return () => unsub();
    }

    // ── Monthly ───────────────────────────────────────────────────────────────
    if (filter.mode === "monthly" && filter.month) {
      const monthQuery = query(
        ref(db, `expenses/users/${uid}/daily-expenses`),
        orderByKey(),
        startAt(`${filter.month}-01`),
        endAt(`${filter.month}-99`)
      );
      const unsub = onValue(
        monthQuery,
        (snapshot) => {
          setExpenses(
            parseDateBucketedSnapshot(
              snapshot.val() as Record<
                string,
                Record<string, Omit<Expense, "id" | "date">>
              > | null
            )
          );
          setLoading(false);
        },
        (err) => {
          console.error("Failed to read expenses:", err);
          setError("Failed to load expenses. Please try again.");
          setLoading(false);
        }
      );
      return () => unsub();
    }

    // ── Yearly ────────────────────────────────────────────────────────────────
    if (filter.mode === "yearly" && filter.year) {
      const year = filter.year;
      const d = new Date();
      const maxMonth = year === d.getFullYear() ? d.getMonth() + 1 : 12;

      const monthFetches: Promise<{ mNum: number; exps: Expense[] }>[] = Array.from(
        { length: maxMonth },
        (_, i) => {
          const mNum = i + 1;
          const mStr = String(mNum).padStart(2, "0");
          const monthQuery = query(
            ref(db, `expenses/users/${uid}/daily-expenses`),
            orderByKey(),
            startAt(`${year}-${mStr}-01`),
            endAt(`${year}-${mStr}-99`)
          );
          return get(monthQuery).then((snapshot: DataSnapshot) => ({
            mNum,
            exps: parseDateBucketedSnapshot(
              snapshot.val() as Record<
                string,
                Record<string, Omit<Expense, "id" | "date">>
              > | null
            ),
          }));
        }
      );

      Promise.all(monthFetches)
        .then((results) => {
          const months: YearlyMonthData[] = results
            .map(({ mNum, exps }) => {
              const mStr = String(mNum).padStart(2, "0");
              const total = exps
                .filter((e: Expense) => e.active !== false && e.currency === "$")
                .reduce((sum: number, e: Expense) => sum + Number(e.amount), 0);
              return {
                month: `${year}-${mStr}`,
                label: MONTH_FULL[mNum - 1],
                total,
                expenses: exps,
              };
            })
            .reverse();
          setYearlyMonths(months);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to read expenses:", err);
          setError("Failed to load expenses. Please try again.");
          setLoading(false);
        });
    }

    // ── Range ─────────────────────────────────────────────────────────────────
    if (filter.mode === "range" && filter.rangeStart && filter.rangeEnd) {
      const rangeQuery = query(
        ref(db, `expenses/users/${uid}/daily-expenses`),
        orderByKey(),
        startAt(filter.rangeStart),
        endAt(filter.rangeEnd.slice(0, 7) + "-99") // include all records on the end day
      );
      const unsub = onValue(
        rangeQuery,
        (snapshot: DataSnapshot) => {
          // Filter to only include dates within the exact range.
          const all = parseDateBucketedSnapshot(
            snapshot.val() as Record<
              string,
              Record<string, Omit<Expense, "id" | "date">>
            > | null
          );
          setExpenses(
            all.filter(
              (e) => e.date >= filter.rangeStart! && e.date <= filter.rangeEnd!
            )
          );
          setLoading(false);
        },
        (err: Error) => {
          console.error("Failed to read expenses:", err);
          setError("Failed to load expenses. Please try again.");
          setLoading(false);
        }
      );
      return () => unsub();
    }
  }, [currentUser, filter, yearlyVersion]);


  /**
   * handleToggleActive
   *
   * Flips the active flag on an expense record in Firebase. Uses togglingId
   * to disable the button on just that card while the write is in flight.
   * In yearly view, also updates yearlyMonths local state to keep totals correct.
   *
   * @param {Expense} expense - The expense whose active state will be toggled.
   */
  const handleToggleActive = async (expense: Expense) => {
    if (!currentUser) return;
    setTogglingId(expense.id);
    try {
      const db = getDatabase(app);
      const expenseRef = ref(
        db,
        `expenses/users/${currentUser.uid}/daily-expenses/${expense.date}/${expense.id}`
      );
      await update(expenseRef, { active: !expense.active });
      if (view === "yearly") {
        setYearlyMonths((prev) =>
          prev.map((m) => {
            if (!m.expenses.some((e) => e.id === expense.id)) return m;
            const updated = m.expenses.map((e) =>
              e.id === expense.id ? { ...e, active: !e.active } : e
            );
            return {
              ...m,
              expenses: updated,
              total: updated
                .filter((e) => e.active !== false && e.currency === "$")
                .reduce((sum, e) => sum + Number(e.amount), 0),
            };
          })
        );
      }
    } catch (err) {
      console.error("Failed to toggle expense:", err);
    } finally {
      setTogglingId(null);
    }
  };

  /**
   * handleDelete
   *
   * Removes the expense staged in deletingExpense from Firebase and clears
   * the confirmation dialog. In yearly view, also removes the record from
   * yearlyMonths local state.
   */
  const handleDelete = async () => {
    if (!deletingExpense || !currentUser) return;
    setDeleteLoading(true);
    try {
      const db = getDatabase(app);
      const expenseRef = ref(
        db,
        `expenses/users/${currentUser.uid}/daily-expenses/${deletingExpense.date}/${deletingExpense.id}`
      );
      await remove(expenseRef);
      if (view === "yearly") {
        const deletedId = deletingExpense.id;
        setYearlyMonths((prev) =>
          prev.map((m) => {
            if (!m.expenses.some((e) => e.id === deletedId)) return m;
            const updated = m.expenses.filter((e) => e.id !== deletedId);
            return {
              ...m,
              expenses: updated,
              total: updated
                .filter((e) => e.active !== false && e.currency === "$")
                .reduce((sum, e) => sum + Number(e.amount), 0),
            };
          })
        );
      }
      setDeletingExpense(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * toggleExpandedMonth
   *
   * Toggles the open/closed state of a month accordion box in the yearly view.
   *
   * @param {string} month - The month key (YYYY-MM) to toggle.
   */
  const toggleExpandedMonth = (month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Loading expenses…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      </div>
    );
  }

  const allYearlyExpenses = view === "yearly" ? yearlyMonths.flatMap((m) => m.expenses) : [];
  const stats = calcStats(view === "yearly" ? allYearlyExpenses : expenses, view);
  const displayExpenses = selectedCategory
    ? expenses.filter((e) => e.category === selectedCategory)
    : expenses;
  const grouped = view === "monthly" || view === "range" ? groupByDate(displayExpenses) : [];
  const periodLabel = formatFilterLabel(filter);

  // For daily view: determine which date label to show.
  const dailyDisplayDate = filter.mode === "daily" && filter.date ? filter.date : getTodayStr();

  return (
    <>
      <div className="p-4 md:p-6">
        <h1 className="mb-4 text-xl font-semibold">Expenses</h1>

        {/* Date filter button */}
        <div className="mb-4">
          <DateFilterPopover value={filter} onChange={setFilter} />
        </div>

        {/* Stat cards */}
        <div className="mb-3 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-primary/10 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-primary/70">
              Total Spent
            </p>
            <p className="mt-1 text-xl font-bold text-primary">
              {stats.totalSpent > 0 ? `$${stats.totalSpent.toLocaleString()}` : "–"}
            </p>
            <p className="mt-0.5 text-[10px] text-primary/60">{periodLabel}</p>
          </div>

          <div className="rounded-xl bg-muted px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Top Category
            </p>
            <p className="mt-1 truncate text-sm font-bold text-foreground">
              {stats.mostSpentCategory ?? "–"}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {stats.mostSpentCategory
                ? `$${(stats.byCategory[stats.mostSpentCategory] ?? 0).toLocaleString()}`
                : "no data"}
            </p>
          </div>

          <div className="rounded-xl bg-muted px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Avg / Day
            </p>
            <p className="mt-1 text-xl font-bold text-foreground">
              {stats.avgPerDay > 0 ? `$${stats.avgPerDay.toFixed(2)}` : "–"}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">estimated</p>
          </div>
        </div>

        {/* Category breakdown — chips are clickable filters */}
        {Object.keys(stats.byCategory).length > 0 && (
          <div className="mb-4 rounded-xl bg-muted px-4 py-3">
            <p className="mb-2.5 text-xs font-medium text-muted-foreground">Categories</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const { color, Icon } = getCategoryMeta(cat);
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(isActive ? null : cat)}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-all"
                      style={
                        isActive
                          ? { backgroundColor: `${color}30`, color, outline: `2px solid ${color}`, outlineOffset: "1px" }
                          : { backgroundColor: "var(--background)", color: "var(--muted-foreground)" }
                      }
                    >
                      <Icon size={12} style={{ color: isActive ? color : undefined }} />
                      <span>{cat}</span>
                      <span className="font-semibold" style={{ color: isActive ? color : "var(--foreground)" }}>
                        ${amount.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Active category filter indicator */}
        {selectedCategory && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtered by</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {selectedCategory}
              <span className="ml-0.5 text-primary/70">×</span>
            </button>
          </div>
        )}

        {/* Empty state */}
        {expenses.length === 0 && view !== "yearly" && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <p className="text-base font-medium">{EMPTY_MESSAGES[view]}</p>
            {view === "daily" && (
              <p className="text-sm">Tap the + button to add an expense.</p>
            )}
          </div>
        )}

        {/* Daily: flat list under the selected date header */}
        {view === "daily" && expenses.length > 0 && (
          <div className="flex flex-col gap-6">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  {periodLabel === "Today"
                    ? `Today — ${formatDate(dailyDisplayDate)}`
                    : formatDate(dailyDisplayDate)}
                </h2>
                <span className="text-sm font-bold text-foreground">
                  {stats.totalSpent > 0 ? `$${stats.totalSpent.toLocaleString()}` : "–"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {displayExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    togglingId={togglingId}
                    onToggle={handleToggleActive}
                    onEdit={setEditingExpense}
                    onDelete={setDeletingExpense}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Monthly / Range: expenses grouped by day */}
        {(view === "monthly" || view === "range") && expenses.length > 0 && (
          <div className="flex flex-col gap-6">
            {grouped.map(({ key, label, items }) => {
              const groupTotal = items
                .filter((i) => i.active !== false && i.currency === "$")
                .reduce((sum, i) => sum + Number(i.amount), 0);
              return (
                <section key={key}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">{label}</h2>
                    <span className="text-sm font-bold text-foreground">
                      {groupTotal > 0 ? `$${groupTotal.toLocaleString()}` : "–"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {items.map((expense) => (
                      <ExpenseCard
                        key={expense.id}
                        expense={expense}
                        togglingId={togglingId}
                        onToggle={handleToggleActive}
                        onEdit={setEditingExpense}
                        onDelete={setDeletingExpense}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Yearly: accordion month boxes */}
        {view === "yearly" && (
          <div className="flex flex-col gap-2">
            {yearlyMonths.map(({ month, label, total, expenses: monthExpenses }) => {
              const displayMonthExpenses = selectedCategory
                ? monthExpenses.filter((e) => e.category === selectedCategory)
                : monthExpenses;
              const isExpanded = expandedMonths.has(month);
              const dayGroups = groupByDate(displayMonthExpenses);
              return (
                <div key={month} className="overflow-hidden rounded-xl border bg-card">
                  <button
                    className={`flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50 ${isExpanded ? "bg-muted" : ""}`}
                    onClick={() => toggleExpandedMonth(month)}
                  >
                    <span className="text-sm font-bold text-foreground">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {total > 0 ? `$${total.toLocaleString()}` : "–"}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t px-4 py-3">
                      {displayMonthExpenses.length === 0 ? (
                        <p className="py-2 text-sm text-muted-foreground">
                          {selectedCategory
                            ? `No ${selectedCategory} expenses this month.`
                            : "No expenses this month."}
                        </p>
                      ) : (
                        <div className="flex flex-col gap-4">
                          {dayGroups.map(({ key, label: dayLabel, items }) => {
                            const dayTotal = items
                              .filter((i) => i.active !== false && i.currency === "$")
                              .reduce((sum, i) => sum + Number(i.amount), 0);
                            return (
                              <section key={key}>
                                <div className="mb-2 flex items-center justify-between">
                                  <h2 className="text-sm font-semibold text-foreground">
                                    {dayLabel}
                                  </h2>
                                  <span className="text-sm font-bold text-foreground">
                                    {dayTotal > 0 ? `$${dayTotal.toLocaleString()}` : "–"}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {items.map((expense) => (
                                    <ExpenseCard
                                      key={expense.id}
                                      expense={expense}
                                      togglingId={togglingId}
                                      onToggle={handleToggleActive}
                                      onEdit={setEditingExpense}
                                      onDelete={setDeletingExpense}
                                    />
                                  ))}
                                </div>
                              </section>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddExpenseModal
        open={editingExpense !== null}
        onClose={() => {
          setEditingExpense(null);
          if (view === "yearly") setYearlyVersion((v) => v + 1);
        }}
        editExpense={editingExpense ?? undefined}
      />

      <Dialog
        open={deletingExpense !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && !deleteLoading) setDeletingExpense(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete expense?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{deletingExpense?.name}</span>{" "}
            will be permanently removed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingExpense(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Expenses;
