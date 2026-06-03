export type FilterMode = "daily" | "monthly" | "yearly" | "range";

export interface DateFilter {
  mode: FilterMode;
  /** YYYY-MM-DD — set when mode === "daily" */
  date?: string;
  /** YYYY-MM — set when mode === "monthly" */
  month?: string;
  /** set when mode === "yearly" */
  year?: number;
  /** YYYY-MM-DD — set when mode === "range" */
  rangeStart?: string;
  /** YYYY-MM-DD — set when mode === "range" */
  rangeEnd?: string;
}

export interface DateFilterPopoverProps {
  value: DateFilter;
  onChange: (filter: DateFilter) => void;
}

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTH_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * getTodayParts
 *
 * Returns today's year, month (1-12), and day as separate numbers using local time.
 *
 * @returns {{ y: number; m: number; d: number }}
 */
export function getTodayParts(): { y: number; m: number; d: number } {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

/**
 * toDateStr
 *
 * Converts year/month/day parts into a YYYY-MM-DD string.
 *
 * @param {number} y - Full year.
 * @param {number} m - Month (1-12).
 * @param {number} d - Day of month.
 * @returns {string}
 */
export function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * parseDateStr
 *
 * Splits a YYYY-MM-DD string into numeric year/month/day parts.
 *
 * @param {string} s - Date string in YYYY-MM-DD format.
 * @returns {{ y: number; m: number; d: number }}
 */
export function parseDateStr(s: string): { y: number; m: number; d: number } {
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

/**
 * getDaysInMonth
 *
 * Returns the number of days in the given month/year.
 *
 * @param {number} year - Full year.
 * @param {number} month - Month (1-12).
 * @returns {number}
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * getFirstDayOfWeek
 *
 * Returns the weekday index (0=Sun…6=Sat) of the 1st of the given month.
 *
 * @param {number} year - Full year.
 * @param {number} month - Month (1-12).
 * @returns {number}
 */
export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * formatFilterLabel
 *
 * Produces the button label text for the current filter value.
 *
 * @param {DateFilter} f - Current filter.
 * @returns {string}
 */
export function formatFilterLabel(f: DateFilter): string {
  if (f.mode === "daily" && f.date) {
    const { y, m, d } = parseDateStr(f.date);
    const today = getTodayParts();
    if (y === today.y && m === today.m && d === today.d) return "Today";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(y, m - 1, d));
  }
  if (f.mode === "monthly" && f.month) {
    const [y, m] = f.month.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
      new Date(y, m - 1, 1)
    );
  }
  if (f.mode === "yearly" && f.year) return String(f.year);
  if (f.mode === "range") {
    if (f.rangeStart && f.rangeEnd) {
      const fmt = (s: string) => {
        const { y, m, d } = parseDateStr(s);
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(new Date(y, m - 1, d));
      };
      return `${fmt(f.rangeStart)} – ${fmt(f.rangeEnd)}`;
    }
    if (f.rangeStart) {
      const { y, m, d } = parseDateStr(f.rangeStart);
      return `From ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(y, m - 1, d))}`;
    }
    return "Select range";
  }
  return "Select date";
}
