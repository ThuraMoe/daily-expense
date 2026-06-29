import { getCategoryMeta } from "@/utils/CategoryConfig";
import MaskedAmount from "@/components/MaskedAmount";

interface Expense {
  id: string;
  date: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  active?: boolean;
}

interface RecentExpensesProps {
  expenses: Expense[];
}

/**
 * formatShortDate
 *
 * Converts a YYYY-MM-DD string to a short label like "Jun 12".
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD format.
 * @returns {string}
 */
function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(y, m - 1, d)
  );
}

/**
 * RecentExpenses
 *
 * Shows the 5 most recent active expenses for the selected period, sorted by
 * date descending. Hidden when there are no expenses to display.
 *
 * @param {RecentExpensesProps} props
 */
const RecentExpenses = ({ expenses }: RecentExpensesProps) => {
  const recent = [...expenses]
    .filter((e) => e.active !== false)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted px-4 py-4">
      <p className="text-xs font-medium text-muted-foreground">Recent Expenses</p>
      <div className="flex flex-col gap-2">
        {recent.map((expense) => {
          const { color, Icon } = getCategoryMeta(expense.category);
          return (
            <div key={expense.id} className="flex items-center gap-3">
              {/* Category icon */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={14} style={{ color }} />
              </div>

              {/* Name + date */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {expense.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatShortDate(expense.date)} · {expense.category}
                </p>
              </div>

              {/* Amount */}
              <span className="shrink-0 text-sm font-semibold text-foreground">
                <MaskedAmount>
                  {expense.currency}
                  {Number(expense.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </MaskedAmount>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentExpenses;
