import { useEffect, useState } from "react";
import {
  get,
  getDatabase,
  orderByKey,
  query,
  ref,
  startAt,
  endAt,
} from "firebase/database";
import type { User } from "firebase/auth";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";
import DateFilterPopover, {
  type DateFilter,
  formatFilterLabel,
} from "@/components/DateFilter";
import StatCards from "./StatCards";
import CategoryBreakdown from "./CategoryBreakdown";
import Highlights from "./Highlights";
import DailyLineChart from "./DailyLineChart";
import RecentExpenses from "./RecentExpenses";
import IncomeBreakdown, { type IncomeRecord } from "./IncomeBreakdown";

interface Expense {
  id: string;
  date: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  active?: boolean;
}

/**
 * buildDefaultFilter
 *
 * Returns a DateFilter set to the current calendar month.
 *
 * @returns {DateFilter}
 */
function buildDefaultFilter(): DateFilter {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return { mode: "monthly", month: `${y}-${m}` };
}

/**
 * getMonthsForFilter
 *
 * Returns all YYYY-MM strings that fall within the given filter period.
 * Used to determine which income month buckets to fetch.
 *
 * @param {DateFilter} filter - The active date filter.
 * @returns {string[]} Array of YYYY-MM strings.
 */
function getMonthsForFilter(filter: DateFilter): string[] {
  if (filter.mode === "daily" && filter.date) {
    return [filter.date.slice(0, 7)];
  }
  if (filter.mode === "monthly" && filter.month) {
    return [filter.month];
  }
  if (filter.mode === "yearly" && filter.year) {
    const now = new Date();
    const maxMonth = filter.year === now.getFullYear() ? now.getMonth() + 1 : 12;
    return Array.from({ length: maxMonth }, (_, i) =>
      `${filter.year}-${String(i + 1).padStart(2, "0")}`
    );
  }
  if (filter.mode === "range" && filter.rangeStart && filter.rangeEnd) {
    const months: string[] = [];
    const [startY, startM] = filter.rangeStart.slice(0, 7).split("-").map(Number);
    const [endY, endM] = filter.rangeEnd.slice(0, 7).split("-").map(Number);
    let y = startY;
    let m = startM;
    while (y < endY || (y === endY && m <= endM)) {
      months.push(`${y}-${String(m).padStart(2, "0")}`);
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return months;
  }
  return [];
}

/**
 * shiftMonthBack
 *
 * Returns the YYYY-MM string one calendar month before the given one.
 *
 * @param {string} month - YYYY-MM string.
 * @returns {string}
 */
function shiftMonthBack(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

/**
 * parseDateBucketedSnapshot
 *
 * Flattens a date-bucketed Firebase snapshot into a plain expense array.
 *
 * @param {Record<string, Record<string, Omit<Expense, "id" | "date">>> | null} data
 * @returns {Expense[]}
 */
function parseDateBucketedSnapshot(
  data: Record<string, Record<string, Omit<Expense, "id" | "date">>> | null
): Expense[] {
  if (!data) return [];
  const flat: Expense[] = [];
  for (const [date, group] of Object.entries(data)) {
    for (const [id, record] of Object.entries(group)) {
      flat.push({ id, date, ...(record as Omit<Expense, "id" | "date">) });
    }
  }
  return flat;
}

/**
 * parseDaySnapshot
 *
 * Parses a single-day Firebase snapshot into an expense array.
 *
 * @param {string} date - YYYY-MM-DD string this snapshot belongs to.
 * @param {Record<string, Omit<Expense, "id" | "date">> | null} data
 * @returns {Expense[]}
 */
function parseDaySnapshot(
  date: string,
  data: Record<string, Omit<Expense, "id" | "date">> | null
): Expense[] {
  if (!data) return [];
  return Object.entries(data).map(([id, record]) => ({
    id,
    date,
    ...(record as Omit<Expense, "id" | "date">),
  }));
}

/**
 * fetchMonthExpensesTotal
 *
 * Fetches the total active $ expense amount for a given YYYY-MM month.
 *
 * @param {ReturnType<typeof getDatabase>} db - Firebase database instance.
 * @param {string} uid - Authenticated user ID.
 * @param {string} month - YYYY-MM string.
 * @returns {Promise<number>}
 */
async function fetchMonthExpensesTotal(
  db: ReturnType<typeof getDatabase>,
  uid: string,
  month: string
): Promise<number> {
  const q = query(
    ref(db, `expenses/users/${uid}/daily-expenses`),
    orderByKey(),
    startAt(`${month}-01`),
    endAt(`${month}-99`)
  );
  const snap = await get(q);
  const expenses = parseDateBucketedSnapshot(
    snap.val() as Record<string, Record<string, Omit<Expense, "id" | "date">>> | null
  );
  return expenses
    .filter((e) => e.active !== false && e.currency === "$")
    .reduce((sum, e) => sum + Number(e.amount), 0);
}

/**
 * Dashboard
 *
 * Main dashboard page showing income vs expense summary for a selected period.
 * Uses DateFilterPopover to switch between day / month / year / range views.
 * Fetches income (with per-source records) and expenses, then derives stats
 * including category breakdown, savings rate, biggest expense, and daily chart.
 *
 * @returns {JSX.Element} The dashboard page.
 */
const Dashboard = () => {
  const { currentUser } = useAuth() as unknown as { currentUser: User | null };

  const [filter, setFilter] = useState<DateFilter>(buildDefaultFilter);
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [prevExpenses, setPrevExpenses] = useState<number | undefined>(undefined);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [byCategory, setByCategory] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    setPrevExpenses(undefined);

    const db = getDatabase(app);
    const uid = currentUser.uid;

    // Fetch income records (with source info) for all months in the period.
    const incomePromise = Promise.all(
      getMonthsForFilter(filter).map((month) =>
        get(ref(db, `expenses/users/${uid}/income/${month}`)).then((snap) => {
          const records: IncomeRecord[] = [];
          if (snap.exists()) {
            snap.forEach((child) => {
              const val = child.val() as {
                amount?: number;
                currency?: string;
                source?: string;
              };
              records.push({
                source: val.source ?? "",
                amount: Number(val.amount ?? 0),
                currency: val.currency ?? "$",
              });
            });
          }
          return records;
        })
      )
    ).then((groups) => groups.flat());

    // Fetch expenses using the same query patterns as the Expenses page.
    let expensePromise: Promise<Expense[]>;

    if (filter.mode === "daily" && filter.date) {
      expensePromise = get(
        ref(db, `expenses/users/${uid}/daily-expenses/${filter.date}`)
      ).then((snap) =>
        parseDaySnapshot(
          filter.date!,
          snap.val() as Record<string, Omit<Expense, "id" | "date">> | null
        )
      );
    } else if (filter.mode === "monthly" && filter.month) {
      const q = query(
        ref(db, `expenses/users/${uid}/daily-expenses`),
        orderByKey(),
        startAt(`${filter.month}-01`),
        endAt(`${filter.month}-99`)
      );
      expensePromise = get(q).then((snap) =>
        parseDateBucketedSnapshot(
          snap.val() as Record<
            string,
            Record<string, Omit<Expense, "id" | "date">>
          > | null
        )
      );
    } else if (filter.mode === "yearly" && filter.year) {
      const year = filter.year;
      const now = new Date();
      const maxMonth = year === now.getFullYear() ? now.getMonth() + 1 : 12;
      expensePromise = Promise.all(
        Array.from({ length: maxMonth }, (_, i) => {
          const mStr = String(i + 1).padStart(2, "0");
          const q = query(
            ref(db, `expenses/users/${uid}/daily-expenses`),
            orderByKey(),
            startAt(`${year}-${mStr}-01`),
            endAt(`${year}-${mStr}-99`)
          );
          return get(q).then((snap) =>
            parseDateBucketedSnapshot(
              snap.val() as Record<
                string,
                Record<string, Omit<Expense, "id" | "date">>
              > | null
            )
          );
        })
      ).then((results) => results.flat());
    } else if (filter.mode === "range" && filter.rangeStart && filter.rangeEnd) {
      const q = query(
        ref(db, `expenses/users/${uid}/daily-expenses`),
        orderByKey(),
        startAt(filter.rangeStart),
        endAt(`${filter.rangeEnd.slice(0, 7)}-99`)
      );
      expensePromise = get(q).then((snap) => {
        const all = parseDateBucketedSnapshot(
          snap.val() as Record<
            string,
            Record<string, Omit<Expense, "id" | "date">>
          > | null
        );
        return all.filter(
          (e) => e.date >= filter.rangeStart! && e.date <= filter.rangeEnd!
        );
      });
    } else {
      expensePromise = Promise.resolve([]);
    }

    Promise.all([incomePromise, expensePromise])
      .then(([records, expenses]) => {
        const income = records
          .filter((r) => r.currency === "$")
          .reduce((sum, r) => sum + r.amount, 0);

        const active = expenses.filter((e) => e.active !== false);
        const spent = active
          .filter((e) => e.currency === "$")
          .reduce((sum, e) => sum + Number(e.amount), 0);

        const catMap: Record<string, number> = {};
        for (const e of active) {
          if (e.currency !== "$") continue;
          catMap[e.category] = (catMap[e.category] ?? 0) + Number(e.amount);
        }

        setTotalIncome(income);
        setIncomeRecords(records);
        setTotalExpenses(spent);
        setAllExpenses(expenses);
        setByCategory(catMap);
        setLoading(false);

        // Fetch previous month total separately after main data is shown.
        if (filter.mode === "monthly" && filter.month) {
          const prev = shiftMonthBack(filter.month);
          fetchMonthExpensesTotal(db, uid, prev).then(setPrevExpenses);
        }
      })
      .catch((err) => {
        console.error("Dashboard fetch failed:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      });
  }, [currentUser, filter]);

  const periodLabel = formatFilterLabel(filter);
  const hasData = totalIncome > 0 || totalExpenses > 0;

  // Derive highlights from raw expense array.
  const activeExpenses = allExpenses.filter(
    (e) => e.active !== false && e.currency === "$"
  );
  const biggestExpense =
    activeExpenses.length > 0
      ? activeExpenses.reduce((max, e) =>
          Number(e.amount) > Number(max.amount) ? e : max
        )
      : null;

  const savingsRate =
    totalIncome > 0
      ? ((totalIncome - totalExpenses) / totalIncome) * 100
      : null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Income vs spending overview.</p>
        </div>
        <DateFilterPopover value={filter} onChange={setFilter} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          <StatCards
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            periodLabel={periodLabel}
            prevExpenses={prevExpenses}
          />

          {hasData ? (
            <>
              <Highlights
                savingsRate={savingsRate}
                biggest={
                  biggestExpense
                    ? {
                        name: biggestExpense.name,
                        amount: Number(biggestExpense.amount),
                        date: biggestExpense.date,
                        category: biggestExpense.category,
                      }
                    : null
                }
              />

              <CategoryBreakdown byCategory={byCategory} />

              {filter.mode === "monthly" && filter.month && (
                <DailyLineChart expenses={allExpenses} month={filter.month} />
              )}

              <IncomeBreakdown records={incomeRecords} />

              <RecentExpenses expenses={allExpenses} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
              <p className="text-sm font-medium">No data for this period.</p>
              <p className="text-xs">
                Add an expense or log income to see your summary.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
