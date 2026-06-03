import { useEffect, useState } from "react";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import type { User } from "firebase/auth";
import { Circle, CircleCheck, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";
import AddExpenseModal from "@/components/AddExpenseModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
 * Provides an edit button on each record that opens AddExpenseModal pre-filled.
 *
 * @returns {JSX.Element} The expense list page.
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

  /**
   * handleToggleActive
   *
   * Flips the active flag on an expense record in Firebase. Uses togglingId
   * to disable the button on just that card while the write is in flight.
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
    } catch (err) {
      console.error("Failed to toggle expense:", err);
    } finally {
      setTogglingId(null);
    }
  };

  /**
   * handleDelete
   *
   * Removes the expense currently staged in deletingExpense from Firebase,
   * then clears the confirmation dialog state. The onValue listener
   * automatically reflects the removal in the rendered list.
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
      setDeletingExpense(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const grouped = groupByDate(expenses);

  return (
    <>
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
                    className={`rounded-xl border bg-card px-4 py-3 shadow-sm transition-opacity ${expense.active === false ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-card-foreground">
                        {expense.name}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-semibold text-card-foreground">
                          {expense.currency}
                          {expense.amount.toLocaleString()}
                        </span>
                        <button
                          aria-label={expense.active === false ? "Mark active" : "Mark inactive"}
                          onClick={() => handleToggleActive(expense)}
                          disabled={togglingId === expense.id}
                          className={`rounded-lg p-1 transition-colors disabled:opacity-50 ${expense.active === false ? "text-muted-foreground hover:bg-muted hover:text-foreground" : "text-green-500 hover:bg-green-500/10"}`}
                        >
                          {expense.active === false
                            ? <Circle size={14} />
                            : <CircleCheck size={14} />}
                        </button>
                        <button
                          aria-label="Edit expense"
                          onClick={() => setEditingExpense(expense)}
                          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          aria-label="Delete expense"
                          onClick={() => setDeletingExpense(expense)}
                          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <span className="mt-1.5 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                      {expense.category}
                    </span>
                    {expense.note && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {expense.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <AddExpenseModal
        open={editingExpense !== null}
        onClose={() => setEditingExpense(null)}
        editExpense={editingExpense ?? undefined}
      />

      <Dialog
        open={deletingExpense !== null}
        onOpenChange={(isOpen) => { if (!isOpen && !deleteLoading) setDeletingExpense(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete expense?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {deletingExpense?.name}
            </span>{" "}
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Expenses;
