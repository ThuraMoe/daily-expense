import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import MaskedAmount from "@/components/MaskedAmount";

interface StatCardsProps {
  totalIncome: number;
  totalExpenses: number;
  periodLabel: string;
  /** Previous period's total expenses — used to show month-over-month delta. Undefined when not applicable. */
  prevExpenses?: number;
}

/**
 * StatCards
 *
 * Renders three summary stat cards: Total Income, Total Spent, and Money Left.
 * When prevExpenses is provided, a delta indicator is shown under the Spent card.
 * Money Left is coloured green when positive and red when negative.
 *
 * @param {StatCardsProps} props
 */
const StatCards = ({
  totalIncome,
  totalExpenses,
  periodLabel,
  prevExpenses,
}: StatCardsProps) => {
  const moneyLeft = totalIncome - totalExpenses;
  const leftPositive = moneyLeft >= 0;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Month-over-month delta — only shown when prevExpenses is provided.
  const delta = prevExpenses !== undefined ? totalExpenses - prevExpenses : null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Income */}
      <div className="rounded-2xl bg-emerald-500/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600/70">
            Income
          </p>
        </div>
        <p className="mt-2 text-2xl font-bold text-emerald-600">
          <MaskedAmount>{totalIncome > 0 ? `$${fmt(totalIncome)}` : "–"}</MaskedAmount>
        </p>
        <p className="mt-0.5 text-[10px] text-emerald-600/60">{periodLabel}</p>
      </div>

      {/* Spent */}
      <div className="rounded-2xl bg-primary/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-primary" />
          <p className="text-xs font-medium uppercase tracking-wide text-primary/70">
            Spent
          </p>
        </div>
        <p className="mt-2 text-2xl font-bold text-primary">
          <MaskedAmount>{totalExpenses > 0 ? `$${fmt(totalExpenses)}` : "–"}</MaskedAmount>
        </p>
        {delta !== null ? (
          <p
            className={`mt-0.5 text-[10px] font-medium ${
              delta > 0
                ? "text-destructive/80"
                : delta < 0
                ? "text-emerald-600/80"
                : "text-muted-foreground"
            }`}
          >
            <MaskedAmount>
              {delta > 0 ? `$${fmt(delta)} more than last month` : delta < 0 ? `$${fmt(Math.abs(delta))} less than last month` : "Same as last month"}
            </MaskedAmount>
          </p>
        ) : (
          <p className="mt-0.5 text-[10px] text-primary/60">{periodLabel}</p>
        )}
      </div>

      {/* Money Left */}
      <div
        className={`rounded-2xl px-4 py-4 ${
          leftPositive ? "bg-emerald-500/10" : "bg-destructive/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <Wallet
            className={`h-4 w-4 ${leftPositive ? "text-emerald-600" : "text-destructive"}`}
          />
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              leftPositive ? "text-emerald-600/70" : "text-destructive/70"
            }`}
          >
            Left
          </p>
        </div>
        <p
          className={`mt-2 text-2xl font-bold ${
            leftPositive ? "text-emerald-600" : "text-destructive"
          }`}
        >
          <MaskedAmount>
            {totalIncome > 0 || totalExpenses > 0
              ? `${leftPositive ? "" : "-"}$${fmt(Math.abs(moneyLeft))}`
              : "–"}
          </MaskedAmount>
        </p>
        <p
          className={`mt-0.5 text-[10px] ${
            leftPositive ? "text-emerald-600/60" : "text-destructive/60"
          }`}
        >
          {periodLabel}
        </p>
      </div>
    </div>
  );
};

export default StatCards;
