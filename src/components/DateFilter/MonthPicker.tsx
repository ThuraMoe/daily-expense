import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTodayParts, MONTH_NAMES } from "./types";

export interface MonthPickerProps {
  selected: string; // YYYY-MM
  onSelect: (month: string) => void;
}

/**
 * MonthPicker
 *
 * Displays a 3×4 grid of month abbreviations for a given year.
 * Arrows navigate between years. The current month is ringed; the
 * selected month is filled with the primary colour.
 *
 * @param {MonthPickerProps} props
 */
const MonthPicker = ({ selected, onSelect }: MonthPickerProps) => {
  const today = getTodayParts();
  const initYear = selected ? Number(selected.split("-")[0]) : today.y;
  const [year, setYear] = useState(initYear);

  const selYear = selected ? Number(selected.split("-")[0]) : null;
  const selMonth = selected ? Number(selected.split("-")[1]) : null;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-foreground">{year}</span>
        <button
          onClick={() => setYear((y) => y + 1)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MONTH_NAMES.map((name, idx) => {
          const m = idx + 1;
          const isSel = selYear === year && selMonth === m;
          const isCurrent = today.y === year && today.m === m;
          return (
            <button
              key={m}
              onClick={() => onSelect(`${year}-${String(m).padStart(2, "0")}`)}
              className={[
                "rounded-lg py-2 text-sm font-medium transition-colors",
                isSel
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                  ? "text-primary ring-1 ring-primary hover:bg-primary/10"
                  : "text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthPicker;
