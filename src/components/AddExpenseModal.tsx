import { useState } from "react";
import { getDatabase, push, ref, set } from "firebase/database";
import type { User } from "firebase/auth";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";
import categoryList from "@/utils/CategoryList";
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

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * AddExpenseModal
 *
 * Modal form for adding a new expense record. Writes to Firebase Realtime
 * Database at /expenses/users/{uid}/daily-expenses/{YYYY-MM-DD}/{expenseId}.
 * Every record includes active: true so it is included in totals by default.
 *
 * @param {AddExpenseModalProps} props - Modal visibility flag and close callback.
 */
const AddExpenseModal = ({ open, onClose }: AddExpenseModalProps) => {
  const { currentUser } = useAuth() as unknown as { currentUser: User | null };

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [category, setCategory] = useState(categoryList[0]);
  const [date, setDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * resetForm
   *
   * Resets all form fields to their initial values.
   */
  const resetForm = () => {
    setName("");
    setAmount("");
    setCurrency(CURRENCIES[0]);
    setCategory(categoryList[0]);
    setDate(getTodayDate());
    setNote("");
    setError(null);
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
   * Validates the form, writes the new expense record to Firebase, then
   * closes the modal on success or surfaces an error message on failure.
   */
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Expense name is required.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("A valid amount greater than zero is required.");
      return;
    }
    if (!currentUser) {
      setError("You must be signed in to add an expense.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const db = getDatabase(app);
      const dayRef = ref(
        db,
        `expenses/users/${currentUser.uid}/daily-expenses/${date}`
      );
      const newRef = push(dayRef);
      await set(newRef, {
        name: name.trim(),
        amount: Number(amount),
        currency,
        category,
        date,
        note: note.trim(),
        active: true,
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to save expense:", err);
      setError("Failed to save. Please try again.");
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
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div>
            <label htmlFor="expense-name" className={labelClass}>
              Name
            </label>
            <Input
              id="expense-name"
              placeholder="e.g. Coffee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Amount + Currency */}
          <div>
            <label className={labelClass}>Amount</label>
            <div className="flex gap-2">
              <Input
                id="expense-amount"
                type="number"
                placeholder="0.00"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
          </div>

          {/* Category */}
          <div>
            <label htmlFor="expense-category" className={labelClass}>
              Category
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className={selectClass}
            >
              {categoryList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="expense-date" className={labelClass}>
              Date
            </label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Note */}
          <div>
            <label htmlFor="expense-note" className={labelClass}>
              Note{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <textarea
              id="expense-note"
              placeholder="Any extra details…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              rows={3}
              className={`${selectClass} resize-none`}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
