import { TrendingUp } from "lucide-react";

export interface IncomeRecord {
  source: string;
  amount: number;
  currency: string;
}

interface IncomeBreakdownProps {
  records: IncomeRecord[];
}

/**
 * IncomeBreakdown
 *
 * Lists each income record for the selected period by source and amount.
 * Only rendered when there is at least one income record.
 *
 * @param {IncomeBreakdownProps} props
 */
const IncomeBreakdown = ({ records }: IncomeBreakdownProps) => {
  const dollarRecords = records.filter((r) => r.currency === "$");

  if (dollarRecords.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted px-4 py-4">
      <p className="text-xs font-medium text-muted-foreground">Income Sources</p>
      <div className="flex flex-col gap-2">
        {dollarRecords.map((record, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp size={14} className="text-emerald-600" />
            </div>

            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {record.source || "Income"}
            </p>

            <span className="shrink-0 text-sm font-semibold text-emerald-600">
              ${record.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeBreakdown;
