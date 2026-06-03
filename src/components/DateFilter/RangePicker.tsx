import { useState } from "react";
import DayCalendar from "./DayCalendar";

export interface RangePickerProps {
  rangeStart: string;
  rangeEnd: string;
  onSelect: (start: string, end: string) => void;
}

/**
 * RangePicker
 *
 * Two-step range selector built on top of DayCalendar.
 * First click sets the start date; second click sets the end date (if after
 * the start). Clicking a third time resets and starts over.
 * The span between start and end is highlighted in the calendar.
 *
 * @param {RangePickerProps} props
 */
const RangePicker = ({ rangeStart, rangeEnd, onSelect }: RangePickerProps) => {
  const [localStart, setLocalStart] = useState(rangeStart);
  const [localEnd, setLocalEnd] = useState(rangeEnd);

  const handleRangeSelect = (date: string) => {
    if (!localStart || (localStart && localEnd)) {
      setLocalStart(date);
      setLocalEnd("");
    } else if (date < localStart) {
      setLocalStart(date);
      setLocalEnd("");
    } else {
      setLocalEnd(date);
      onSelect(localStart, date);
    }
  };

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-xs text-muted-foreground">
        {!localStart || (localStart && localEnd) ? "Pick start date" : "Pick end date"}
      </p>
      <DayCalendar
        selected={localStart}
        onSelect={() => {}}
        rangeStart={localStart}
        rangeEnd={localEnd}
        onRangeSelect={handleRangeSelect}
        isRange
      />
    </div>
  );
};

export default RangePicker;
