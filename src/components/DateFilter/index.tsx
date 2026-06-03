import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarDays } from "lucide-react";

import DayCalendar from "./DayCalendar";
import MonthPicker from "./MonthPicker";
import YearPicker from "./YearPicker";
import RangePicker from "./RangePicker";
import {
  formatFilterLabel,
  getTodayParts,
  toDateStr,
  type DateFilter,
  type DateFilterPopoverProps,
  type FilterMode,
} from "./types";

// Re-export types and helpers so consumers can import from one place.
export type { DateFilter, FilterMode };
export { formatFilterLabel };
export { DayCalendar, MonthPicker, YearPicker, RangePicker };

const TABS: { label: string; value: FilterMode }[] = [
  { label: "Day", value: "daily" },
  { label: "Month", value: "monthly" },
  { label: "Year", value: "yearly" },
  { label: "Range", value: "range" },
];

/**
 * DateFilterPopover
 *
 * A single trigger button showing the currently selected date/period label.
 * Clicking opens a Radix UI Popover containing Day / Month / Year / Range tabs,
 * each with its own calendar or picker sub-component.
 *
 * Selecting any value closes the popover and calls onChange with the new filter.
 * Default selection (on first render) is today's date in Day mode.
 *
 * @param {DateFilterPopoverProps} props
 */
const DateFilterPopover = ({ value, onChange }: DateFilterPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterMode>(value.mode);

  const today = getTodayParts();

  const [draftDate, setDraftDate] = useState(
    value.date ?? toDateStr(today.y, today.m, today.d)
  );
  const [draftMonth, setDraftMonth] = useState(
    value.month ?? `${today.y}-${String(today.m).padStart(2, "0")}`
  );
  const [draftYear, setDraftYear] = useState(value.year ?? today.y);
  const [draftRangeStart, setDraftRangeStart] = useState(value.rangeStart ?? "");
  const [draftRangeEnd, setDraftRangeEnd] = useState(value.rangeEnd ?? "");

  const commitDay = (date: string) => {
    setDraftDate(date);
    onChange({ mode: "daily", date });
    setOpen(false);
  };

  const commitMonth = (month: string) => {
    setDraftMonth(month);
    onChange({ mode: "monthly", month });
    setOpen(false);
  };

  const commitYear = (year: number) => {
    setDraftYear(year);
    onChange({ mode: "yearly", year });
    setOpen(false);
  };

  const commitRange = (start: string, end: string) => {
    setDraftRangeStart(start);
    setDraftRangeEnd(end);
    onChange({ mode: "range", rangeStart: start, rangeEnd: end });
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
          <CalendarDays size={15} className="shrink-0 text-muted-foreground" />
          <span>{formatFilterLabel(value)}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className="z-50 w-72 rounded-2xl border border-border bg-popover p-4 shadow-xl animate-in fade-in-0 zoom-in-95"
        >
          {/* Tab row */}
          <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
            {TABS.map(({ label, value: tab }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  "flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors",
                  activeTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "daily" && (
            <DayCalendar selected={draftDate} onSelect={commitDay} />
          )}
          {activeTab === "monthly" && (
            <MonthPicker selected={draftMonth} onSelect={commitMonth} />
          )}
          {activeTab === "yearly" && (
            <YearPicker selected={draftYear} onSelect={commitYear} />
          )}
          {activeTab === "range" && (
            <RangePicker
              rangeStart={draftRangeStart}
              rangeEnd={draftRangeEnd}
              onSelect={commitRange}
            />
          )}

          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default DateFilterPopover;
