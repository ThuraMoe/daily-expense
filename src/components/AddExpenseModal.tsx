import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { getDatabase, push, ref, remove, set, update } from "firebase/database";
import type { User } from "firebase/auth";

import { useAuth } from "@/context/AuthContext";
import { app } from "@/firebaseConfig";
import { getCategoryMeta, CATEGORY_CONFIG } from "@/utils/CategoryConfig";
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

/** Maps Ctrl+letter → category name. */
const CATEGORY_KEYS: Record<string, string> = {
  g: "Groceries",
  d: "Dining Out",
  s: "Snacks",
  k: "Drink",
  q: "Transport",
  e: "Entertainment",
  b: "Bill",
  l: "Personal Care",
  h: "Healthcare",
  m: "Family",
  j: "Friends",
  i: "Trip",
  o: "Others",
};

/** Maps category name → uppercase key letter shown on the chip. */
const CATEGORY_KEY_LABEL: Record<string, string> = {
  "Groceries":     "G",
  "Dining Out":    "D",
  "Snacks":        "S",
  "Drink":         "K",
  "Transport":     "Q",
  "Entertainment": "E",
  "Bill":          "B",
  "Personal Care": "L",
  "Healthcare":    "H",
  "Family":        "M",
  "Friends":       "J",
  "Trip":          "I",
  "Others":        "O",
};

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
  editExpense?: Expense;
}

/**
 * AddExpenseModal
 *
 * Modal form for adding or editing an expense record. When editExpense is
 * provided the form is pre-filled and submit runs a Firebase update instead
 * of a push. If the date changes during edit the old record is removed and a
 * new one is created at the correct date path.
 *
 * Firebase path: /expenses/users/{uid}/daily-expenses/{YYYY-MM-DD}/{expenseId}
 *
 * @param {AddExpenseModalProps} props - Modal visibility, close callback, and optional expense to edit.
 */
const AddExpenseModal = ({ open, onClose, editExpense }: AddExpenseModalProps) => {
  const { currentUser } = useAuth() as unknown as { currentUser: User | null };

  const isEditing = !!editExpense;

  const nameInputRef = useRef<HTMLInputElement>(null);
  // Set to true after a successful add save so the effect below can focus
  // the name field once React re-enables it (loading → false).
  const shouldFocusName = useRef(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [category, setCategory] = useState(Object.keys(CATEGORY_CONFIG)[0]);
  const [date, setDate] = useState(getTodayDate());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // After a successful add save, focus the name field once loading clears.
  useEffect(() => {
    if (!loading && shouldFocusName.current) {
      shouldFocusName.current = false;
      nameInputRef.current?.focus();
    }
  }, [loading]);

  // Populate form fields when opening in edit mode.
  useEffect(() => {
    if (open && editExpense) {
      setName(editExpense.name);
      setAmount(String(editExpense.amount));
      setCurrency(editExpense.currency);
      setCategory(editExpense.category);
      setDate(editExpense.date);
      setNote(editExpense.note ?? "");
      setNameError(null);
      setAmountError(null);
      setSubmitError(null);
    } else if (open && !editExpense) {
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editExpense]);

  /**
   * resetForm
   *
   * Resets all form fields and validation errors to their initial values.
   * Pass keepDate=true after a successful add so the user's selected date
   * is preserved for the next entry.
   *
   * @param {boolean} [keepDate] - When true, the date field is not reset.
   */
  const resetForm = (keepDate?: boolean) => {
    setName("");
    setAmount("");
    setCurrency(CURRENCIES[0]);
    setCategory(Object.keys(CATEGORY_CONFIG)[0]);
    if (!keepDate) setDate(getTodayDate());
    setNote("");
    setNameError(null);
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
   * Validates the form then either creates a new expense (push + set) or
   * updates an existing one. If the date changed during editing, the old
   * record is deleted and a new one is written at the new date path.
   */
  const handleSubmit = async () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Expense name is required.");
      valid = false;
    } else {
      setNameError(null);
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError("Enter a valid amount greater than zero.");
      valid = false;
    } else {
      setAmountError(null);
    }
    if (!valid) return;

    if (!currentUser) {
      setSubmitError("You must be signed in to add an expense.");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const db = getDatabase(app);
      const payload = {
        name: name.trim(),
        amount: Number(amount),
        currency,
        category,
        date,
        note: note.trim(),
        active: true,
      };

      if (isEditing && editExpense) {
        if (date !== editExpense.date) {
          // Date changed: remove from old bucket, create in new bucket.
          const oldRef = ref(
            db,
            `expenses/users/${currentUser.uid}/daily-expenses/${editExpense.date}/${editExpense.id}`
          );
          await remove(oldRef);
          const newDayRef = ref(
            db,
            `expenses/users/${currentUser.uid}/daily-expenses/${date}`
          );
          const newRef = push(newDayRef);
          await set(newRef, payload);
        } else {
          // Same date: update fields in place.
          const existingRef = ref(
            db,
            `expenses/users/${currentUser.uid}/daily-expenses/${editExpense.date}/${editExpense.id}`
          );
          await update(existingRef, payload);
        }
        resetForm();
        onClose();
      } else {
        const dayRef = ref(
          db,
          `expenses/users/${currentUser.uid}/daily-expenses/${date}`
        );
        const newRef = push(dayRef);
        await set(newRef, payload);
        resetForm(true);
        shouldFocusName.current = true;
      }
    } catch (err) {
      console.error("Failed to save expense:", err);
      setSubmitError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleKeyDown
   *
   * Submits the form when Enter is pressed, unless focus is on a textarea,
   * button, or select element where Enter has its own native meaning.
   *
   * @param {KeyboardEvent} e - The keyboard event from DialogContent.
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl+letter → select category
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
      const cat = CATEGORY_KEYS[e.key.toLowerCase()];
      if (cat) {
        e.preventDefault();
        setCategory(cat);
        return;
      }
    }

    // Enter → submit (not on textarea / button / select)
    if (
      e.key === "Enter" &&
      !(e.target instanceof HTMLTextAreaElement) &&
      !(e.target instanceof HTMLButtonElement) &&
      !(e.target instanceof HTMLSelectElement)
    ) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";
  const selectClass =
    "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div>
            <label htmlFor="expense-name" className={labelClass}>
              Name
            </label>
            <Input
              id="expense-name"
              ref={nameInputRef}
              placeholder="e.g. Coffee"
              value={name}
              onChange={(e) => { const v = e.target.value; setName(v.charAt(0).toUpperCase() + v.slice(1)); setNameError(null); }}
              disabled={loading}
              autoFocus
            />
            {nameError && (
              <p className="mt-1.5 text-xs text-destructive">{nameError}</p>
            )}
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
                onChange={(e) => { setAmount(e.target.value); setAmountError(null); }}
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

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CATEGORY_CONFIG).map((cat) => {
                const { color, Icon } = getCategoryMeta(cat);
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                    style={
                      selected
                        ? { backgroundColor: `${color}20`, color, borderColor: color }
                        : { borderColor: "transparent", backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
                    }
                  >
                    <Icon size={12} style={{ color }} />
                    {cat}
                    <span className="ml-0.5 rounded bg-black/10 px-1 py-0.5 font-mono text-[9px] font-normal leading-none dark:bg-white/10">
                      {CATEGORY_KEY_LABEL[cat]}
                    </span>
                  </button>
                );
              })}
            </div>
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
            {loading ? (isEditing ? "Updating…" : "Saving…") : isEditing ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
