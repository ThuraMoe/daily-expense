import { useEffect, useState } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import type { User } from "firebase/auth";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";

interface Expense {
  id: string;
  date: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  note: string;
  active: boolean;
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
 * @returns {{ date: string; items: Expense[] }[]} Expenses grouped and sorted by date descending.
 */
function groupByDate(expenses: Expense[]): { date: string; items: Expense[] }[] {
  const map = new Map<string, Expense[]>();
  for (const expense of expenses) {
    const list = map.get(expense.date) ?? [];
    list.push(expense);
    map.set(expense.date, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items }));
}

/**
 * Expenses
 *
 * Displays all expense records for the authenticated user, grouped by date with
 * the most recent date first. Shows loading, empty, and error states as appropriate.
 *
 * @returns {JSX.Element} The expense list page.
 */
const Expenses = () => {
  const { currentUser } = useAuth() as unknown as { currentUser: User | null };
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const db = getDatabase(app);
    const expensesRef = ref(
      db,
      `expenses/users/${currentUser.uid}/daily-expenses`
    );
    const unsub = onValue(
      expensesRef,
      (snapshot) => {
        const data = snapshot.val() as Record<
          string,
          Record<string, Omit<Expense, "id" | "date">>
        > | null;
        const flat: Expense[] = [];
        if (data) {
          for (const [date, dateGroup] of Object.entries(data)) {
            for (const [id, record] of Object.entries(dateGroup)) {
              flat.push({ id, date, ...record });
            }
          }
        }
        setExpenses(flat);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to read expenses:", err);
        setError("Failed to load expenses. Please try again.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [currentUser]);

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

  if (expenses.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <p className="text-base font-medium">No expenses yet</p>
        <p className="text-sm">Tap the + button to add your first expense.</p>
      </div>
    );
  }

  const grouped = groupByDate(expenses);

  return (
    <div className="p-4 md:p-6">
      <h1 className="mb-6 text-xl font-semibold">Expenses</h1>
      <div className="flex flex-col gap-6">
        {grouped.map(({ date, items }) => (
          <section key={date}>
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              {formatDate(date)}
            </h2>
            <div className="flex flex-col gap-2">
              {items.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-xl border bg-card px-4 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-card-foreground">
                      {expense.name}
                    </span>
                    <span className="shrink-0 font-semibold text-card-foreground">
                      {expense.currency}
                      {expense.amount.toLocaleString()}
                    </span>
                  </div>
                  <span className="mt-1.5 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {expense.category}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Expenses;
