import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface StatCardsProps {
  totalIncome: number;
  totalExpenses: number;
  periodLabel: string;
}

/**
 * StatCards
 *
 * Renders three summary stat cards: Total Income, Total Spent, and Money Left.
 * Money Left is coloured green when positive and red when negative.
 *
 * @param {StatCardsProps} props
 */
const StatCards = ({ totalIncome, totalExpenses, periodLabel }: StatCardsProps) => {
  const moneyLeft = totalIncome - totalExpenses;
  const leftPositive = moneyLeft >= 0;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
          {totalIncome > 0 ? `$${fmt(totalIncome)}` : "–"}
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
          {totalExpenses > 0 ? `$${fmt(totalExpenses)}` : "–"}
        </p>
        <p className="mt-0.5 text-[10px] text-primary/60">{periodLabel}</p>
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
          {totalIncome > 0 || totalExpenses > 0
            ? `${leftPositive ? "" : "-"}$${fmt(Math.abs(moneyLeft))}`
            : "–"}
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
