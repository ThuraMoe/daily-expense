import { useEffect, useState } from "react";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import type { User } from "firebase/auth";
import { Pencil, Trash2, TrendingUp } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";
import AddIncomeModal from "@/components/AddIncomeModal";
import MaskedAmount from "@/components/MaskedAmount";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Income {
  id: string;
  yearMonth: string;
  amount: number;
  currency: string;
  source: string;
  date: string;
  note: string;
}

interface IncomeGroup {
  yearMonth: string;
  label: string;
  items: Income[];
  totalsByCurrency: Record<string, number>;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * formatYearMonth
 *
 * Converts a YYYY-MM string into a human-readable label like "June 2026".
 *
 * @param {string} yearMonth - A string in YYYY-MM format.
 * @returns {string} Human-readable month and year label.
 */
function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/**
 * formatDate
 *
 * Formats a YYYY-MM-DD string into a short label like "Jun 1".
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format.
 * @returns {string} Short formatted date string.
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

/**
 * groupByMonth
 *
 * Groups a flat income array by YYYY-MM, sorted newest-first.
 * Computes per-currency totals within each group.
 *
 * @param {Income[]} records - Flat array of income records.
 * @returns {IncomeGroup[]} Income grouped by month, newest first.
 */
function groupByMonth(records: Income[]): IncomeGroup[] {
  const map = new Map<string, Income[]>();
  for (const record of records) {
    const key = record.yearMonth;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(record);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([yearMonth, items]) => {
      const totalsByCurrency: Record<string, number> = {};
      for (const item of items) {
        totalsByCurrency[item.currency] =
          (totalsByCurrency[item.currency] ?? 0) + item.amount;
      }
      return {
        yearMonth,
        label: formatYearMonth(yearMonth),
        items: [...items].sort((a, b) => b.date.localeCompare(a.date)),
        totalsByCurrency,
      };
    });
}

/**
 * Income
 *
 * Monthly income entry page. Reads all income records from Firebase, groups
 * them by month, and displays per-month totals. Supports adding, editing,
 * and deleting income records.
 *
 * Firebase path: /expenses/users/{uid}/income/{YYYY-MM}/{incomeId}
 *
 * @returns {JSX.Element} The income page.
 */
const Income = () => {
  const { currentUser } = useAuth() as unknown as { currentUser: User | null };

  const [groups, setGroups] = useState<IncomeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Subscribe to all income records for the current user.
  useEffect(() => {
    if (!currentUser) return;

    const db = getDatabase(app);
    const incomeRef = ref(db, `expenses/users/${currentUser.uid}/income`);

    const unsubscribe = onValue(
      incomeRef,
      (snapshot) => {
        const flat: Income[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((monthSnap) => {
            const yearMonth = monthSnap.key as string;
            monthSnap.forEach((recordSnap) => {
              const val = recordSnap.val();
              flat.push({
                id: recordSnap.key as string,
                yearMonth,
                amount: val.amount ?? 0,
                currency: val.currency ?? "$",
                source: val.source ?? "",
                date: val.date ?? `${yearMonth}-01`,
                note: val.note ?? "",
              });
            });
          });
        }
        setGroups(groupByMonth(flat));
        setLoading(false);
        setFetchError(null);
      },
      (err) => {
        console.error("Failed to load income:", err);
        setFetchError("Failed to load income. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  /**
   * handleDelete
   *
   * Removes the currently targeted income record from Firebase.
   */
  const handleDelete = async () => {
    if (!deletingIncome || !currentUser) return;
    setDeleteLoading(true);
    try {
      const db = getDatabase(app);
      const target = ref(
        db,
        `expenses/users/${currentUser.uid}/income/${deletingIncome.yearMonth}/${deletingIncome.id}`
      );
      await remove(target);
      setDeletingIncome(null);
    } catch (err) {
      console.error("Failed to delete income:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading income…
      </div>
    );
  }

  // ── Error state ──
  if (fetchError) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-destructive">
        {fetchError}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* ── Page header ── */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Income</h1>
          <p className="text-sm text-muted-foreground">
            Track your monthly income by source.
          </p>
        </div>

        {/* ── Empty state ── */}
        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No income recorded yet</p>
            <p className="text-xs text-muted-foreground">
              Tap "Add Income" to log your first entry.
            </p>
          </div>
        )}

        {/* ── Month groups ── */}
        {groups.map((group) => (
          <div key={group.yearMonth} className="flex flex-col gap-3">
            {/* Month header */}
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
              <span className="text-sm font-semibold">{group.label}</span>
              <div className="flex items-center gap-2">
                {Object.entries(group.totalsByCurrency).map(([currency, total]) => (
                  <span
                    key={currency}
                    className="rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600"
                  >
                    <MaskedAmount>
                      {currency}
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </MaskedAmount>
                  </span>
                ))}
              </div>
            </div>

            {/* Income records */}
            <div className="flex flex-col gap-2">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.source || "Income"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.date)}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>

                  {/* Amount */}
                  <span className="shrink-0 text-sm font-semibold text-emerald-600">
                    <MaskedAmount>
                      {item.currency}
                      {item.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </MaskedAmount>
                  </span>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingIncome(item)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingIncome(item)}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit modal ── */}
      <AddIncomeModal
        open={editingIncome !== null}
        onClose={() => setEditingIncome(null)}
        editIncome={editingIncome ?? undefined}
      />

      {/* ── Delete confirmation ── */}
      <Dialog
        open={deletingIncome !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && !deleteLoading) setDeletingIncome(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete income?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {deletingIncome?.source || "This income record"}
            </span>{" "}
            will be permanently removed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingIncome(null)}
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

export default Income;
