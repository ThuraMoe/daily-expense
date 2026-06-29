import { getCategoryMeta } from "@/utils/CategoryConfig";

interface BiggestExpense {
  name: string;
  amount: number;
  date: string;
  category: string;
}

interface HighlightsProps {
  savingsRate: number | null;
  biggest: BiggestExpense | null;
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
 * Highlights
 *
 * Renders two mini stat cards: savings rate for the period and the single
 * biggest active expense. Hidden when there is nothing meaningful to show.
 *
 * @param {HighlightsProps} props
 */
const Highlights = ({ savingsRate, biggest }: HighlightsProps) => {
  if (savingsRate === null && biggest === null) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Savings rate */}
      {savingsRate !== null && (
        <div
          className={`rounded-2xl px-4 py-3 ${
            savingsRate >= 0 ? "bg-emerald-500/10" : "bg-destructive/10"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              savingsRate >= 0 ? "text-emerald-600/70" : "text-destructive/70"
            }`}
          >
            Savings rate
          </p>
          <p
            className={`mt-1 text-xl font-bold ${
              savingsRate >= 0 ? "text-emerald-600" : "text-destructive"
            }`}
          >
            {savingsRate.toFixed(1)}%
          </p>
          <p
            className={`mt-0.5 text-[10px] ${
              savingsRate >= 0 ? "text-emerald-600/60" : "text-destructive/60"
            }`}
          >
            of income
          </p>
        </div>
      )}

      {/* Biggest expense */}
      {biggest !== null && (() => {
        const { color, Icon } = getCategoryMeta(biggest.category);
        return (
          <div className="rounded-2xl bg-muted px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Largest expense
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <Icon size={14} style={{ color }} />
              <p className="truncate text-sm font-bold text-foreground">{biggest.name}</p>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              ${biggest.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              · {formatShortDate(biggest.date)}
            </p>
          </div>
        );
      })()}
    </div>
  );
};

export default Highlights;
