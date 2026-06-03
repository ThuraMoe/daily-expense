import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getDaysInMonth,
  getFirstDayOfWeek,
  getTodayParts,
  parseDateStr,
  toDateStr,
  MONTH_FULL,
} from "./types";

export interface DayCalendarProps {
  selected: string;
  onSelect: (date: string) => void;
  rangeStart?: string;
  rangeEnd?: string;
  onRangeSelect?: (date: string) => void;
  isRange?: boolean;
}

/**
 * DayCalendar
 *
 * A single-month calendar grid. Supports both single-day selection and
 * range selection (highlights the span between rangeStart and rangeEnd).
 * Arrows navigate between months.
 *
 * @param {DayCalendarProps} props
 */
const DayCalendar = ({
  selected,
  onSelect,
  rangeStart,
  rangeEnd,
  onRangeSelect,
  isRange = false,
}: DayCalendarProps) => {
  const today = getTodayParts();
  const init = selected
    ? parseDateStr(selected)
    : rangeStart
    ? parseDateStr(rangeStart)
    : today;

  const [navYear, setNavYear] = useState(init.y);
  const [navMonth, setNavMonth] = useState(init.m);

  const daysInMonth = getDaysInMonth(navYear, navMonth);
  const firstDow = getFirstDayOfWeek(navYear, navMonth);
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (navMonth === 1) { setNavYear((y) => y - 1); setNavMonth(12); }
    else setNavMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (navMonth === 12) { setNavYear((y) => y + 1); setNavMonth(1); }
    else setNavMonth((m) => m + 1);
  };

  const isToday = (d: number) =>
    d === today.d && navMonth === today.m && navYear === today.y;

  const isSelected = (d: number) => {
    if (isRange) return toDateStr(navYear, navMonth, d) === rangeStart || toDateStr(navYear, navMonth, d) === rangeEnd;
    if (!selected) return false;
    const { y, m, d: sd } = parseDateStr(selected);
    return d === sd && navMonth === m && navYear === y;
  };

  const isInRange = (d: number) => {
    if (!isRange || !rangeStart || !rangeEnd) return false;
    const ds = toDateStr(navYear, navMonth, d);
    return ds > rangeStart && ds < rangeEnd;
  };

  const isRangeStart = (d: number) =>
    isRange && toDateStr(navYear, navMonth, d) === rangeStart;
  const isRangeEnd = (d: number) =>
    isRange && toDateStr(navYear, navMonth, d) === rangeEnd;

  const handleDay = (d: number) => {
    const ds = toDateStr(navYear, navMonth, d);
    if (isRange && onRangeSelect) { onRangeSelect(ds); return; }
    onSelect(ds);
  };

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_FULL[navMonth - 1]} {navYear}
        </span>
        <button
          onClick={nextMonth}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
          <span key={w} className="text-[10px] font-medium text-muted-foreground">
            {w}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const sel = isSelected(day);
          const inRange = isInRange(day);
          const rStart = isRangeStart(day);
          const rEnd = isRangeEnd(day);
          const tdy = isToday(day);
          return (
            <button
              key={idx}
              onClick={() => handleDay(day)}
              className={[
                "relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors",
                sel || rStart || rEnd
                  ? "bg-primary text-primary-foreground font-semibold"
                  : inRange
                  ? "bg-primary/15 text-foreground rounded-none"
                  : tdy
                  ? "text-primary font-semibold hover:bg-muted"
                  : "text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {day}
              {tdy && !sel && !rStart && !rEnd && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DayCalendar;
