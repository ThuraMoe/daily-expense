import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getTodayParts } from "./types";

export interface YearPickerProps {
  selected: number;
  onSelect: (year: number) => void;
}

/**
 * YearPicker
 *
 * Displays a decade-sized grid of years (12 cells: one before and one after
 * the decade to allow easy navigation). Arrows navigate between decades.
 * The current year is ringed; the selected year is filled.
 *
 * @param {YearPickerProps} props
 */
const YearPicker = ({ selected, onSelect }: YearPickerProps) => {
  const today = getTodayParts();
  const [decade, setDecade] = useState(Math.floor((selected || today.y) / 10) * 10);
  const years = Array.from({ length: 12 }, (_, i) => decade + i - 1);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setDecade((d) => d - 10)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {decade} – {decade + 9}
        </span>
        <button
          onClick={() => setDecade((d) => d + 10)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {years.map((y) => {
          const isSel = y === selected;
          const isCurrent = y === today.y;
          const isEdge = y === decade - 1 || y === decade + 10;
          return (
            <button
              key={y}
              onClick={() => onSelect(y)}
              className={[
                "rounded-lg py-2 text-sm font-medium transition-colors",
                isSel
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                  ? "text-primary ring-1 ring-primary hover:bg-primary/10"
                  : isEdge
                  ? "text-muted-foreground hover:bg-muted"
                  : "text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default YearPicker;
