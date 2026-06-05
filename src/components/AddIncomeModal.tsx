import { useEffect, useState } from "react";
import { getDatabase, push, ref, remove, set, update } from "firebase/database";
import type { User } from "firebase/auth";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CURRENCIES = ["$", "៛", "Ks"];

interface Income {
  id: string;
  yearMonth: string;
  amount: number;
  currency: string;
  source: string;
  date: string;
  note: string;
}

/**
 * getTodayDate
 *
 * Returns today's date formatted as "YYYY-MM-DD" for use as the default
 * value of the date input field.
 *
 * @returns {string} Today's date in YYYY-MM-DD format.
 */
const getTodayDate = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * getYearMonth
 *
 * Extracts the YYYY-MM portion from a YYYY-MM-DD date string.
 *
 * @param {string} date - A date string in YYYY-MM-DD format.
 * @returns {string} The year-month portion in YYYY-MM format.
 */
const getYearMonth = (date: string): string => date.slice(0, 7);

interface AddIncomeModalProps {
  open: boolean;
  onClose: () => void;
  editIncome?: Income;
}

/**
 * AddIncomeModal
 *
 * Modal form for adding or editing a monthly income record. When editIncome is
 * provided the form is pre-filled and submit runs a Firebase update instead of
 * a push. If the month changes during edit the old record is removed and a new
 * one is created at the correct YYYY-MM path.
 *
 * Firebase path: /expenses/users/{uid}/income/{YYYY-MM}/{incomeId}
 *
 * @param {AddIncomeModalProps} props - Modal visibility, close callback, and optional income to edit.
 */
const AddIncomeModal = ({ open, onClose, editIncome }: AddIncomeModalProps) => {
  const { currentUser } = useAuth() as unknown as { currentUser: User | null };

  const isEditing = !!editIncome;

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [date, setDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form fields when opening in edit mode.
  useEffect(() => {
    if (open && editIncome) {
      setSource(editIncome.source ?? "");
      setAmount(String(editIncome.amount));
      setCurrency(editIncome.currency);
      setDate(editIncome.date);
      setNote(editIncome.note ?? "");
      setAmountError(null);
      setSubmitError(null);
    } else if (open && !editIncome) {
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editIncome]);

  /**
   * resetForm
   *
   * Resets all form fields and validation errors to their initial values.
   */
  const resetForm = () => {
    setSource("");
    setAmount("");
    setCurrency(CURRENCIES[0]);
    setDate(getTodayDate());
    setNote("");
    setAmountError(null);
    setSubmitError(null);
  };

  /**
   * handleClose
   *
   * Resets the form and fires the onClose callback.
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  /**
   * handleSubmit
   *
   * Validates the form then either creates a new income record (push + set) or
   * updates an existing one. If the month changed during editing, the old record
   * is deleted and a new one is written at the new YYYY-MM path.
   */
  const handleSubmit = async () => {
    let valid = true;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError("Enter a valid amount greater than zero.");
      valid = false;
    } else {
      setAmountError(null);
    }
    if (!valid) return;

    if (!currentUser) {
      setSubmitError("You must be signed in to add income.");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const db = getDatabase(app);
      const yearMonth = getYearMonth(date);
      const payload = {
        amount: Number(amount),
        currency,
        source: source.trim(),
        date,
        note: note.trim(),
      };

      if (isEditing && editIncome) {
        const oldYearMonth = getYearMonth(editIncome.date);
        if (yearMonth !== oldYearMonth) {
          // Month changed: remove from old bucket, create in new bucket.
          const oldRef = ref(
            db,
            `expenses/users/${currentUser.uid}/income/${oldYearMonth}/${editIncome.id}`
          );
          await remove(oldRef);
          const newMonthRef = ref(
            db,
            `expenses/users/${currentUser.uid}/income/${yearMonth}`
          );
          const newRef = push(newMonthRef);
          await set(newRef, payload);
        } else {
          // Same month: update fields in place.
          const existingRef = ref(
            db,
            `expenses/users/${currentUser.uid}/income/${oldYearMonth}/${editIncome.id}`
          );
          await update(existingRef, payload);
        }
        resetForm();
        onClose();
      } else {
        const monthRef = ref(
          db,
          `expenses/users/${currentUser.uid}/income/${yearMonth}`
        );
        const newRef = push(monthRef);
        await set(newRef, payload);
        resetForm();
      }
    } catch (err) {
      console.error("Failed to save income:", err);
      setSubmitError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";
  const selectClass =
    "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Income" : "Add Income"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Source */}
          <div>
            <label htmlFor="income-source" className={labelClass}>
              Source{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="income-source"
              placeholder="e.g. Salary, Freelance"
              value={source}
              onChange={(e) => {
                const v = e.target.value;
                setSource(v.charAt(0).toUpperCase() + v.slice(1));
              }}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Amount + Currency */}
          <div>
            <label className={labelClass}>Amount</label>
            <div className="flex gap-2">
              <Input
                id="income-amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError(null);
                }}
                disabled={loading}
                className="min-w-0 flex-1"
              />
              <select
                aria-label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading}
                className={cn(selectClass, "w-14 shrink-0")}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {amountError && (
              <p className="mt-1.5 text-xs text-destructive">{amountError}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="income-date" className={labelClass}>
              Date
            </label>
            <Input
              id="income-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="income-note" className={labelClass}>
              Note{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="income-note"
              placeholder="Any extra details…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              rows={3}
              className={`${selectClass} resize-none`}
            />
          </div>

          {/* Firebase / auth error */}
          {submitError && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? isEditing
                ? "Updating…"
                : "Saving…"
              : isEditing
              ? "Update"
              : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddIncomeModal;
