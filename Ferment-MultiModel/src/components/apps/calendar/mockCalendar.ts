/**
 * In-memory mock dataset and helpers for the Calendar app.
 *
 * Conventions:
 * - Events are stored as plain year / month / day triples (rather than
 *   ISO strings or `Date` objects) so the data is timezone-stable and
 *   trivially freezable. `Date` math happens only at render time, in
 *   the browser's local timezone.
 * - `month` is **0-indexed** (`0` = January, `11` = December) to match
 *   `Date.prototype.getMonth()`. UI code that exposes the month name
 *   uses {@link monthName} so callers never have to remember the
 *   offset.
 * - The exported {@link initialMockEvents} constant is deeply frozen
 *   at module load; helper functions return new arrays rather than
 *   mutating shared state.
 */

/**
 * The fixed palette of event chip colours. Mirrors the categories
 * shipped with macOS Calendar (work, family, etc.). The Calendar UI
 * maps each id to a CSS class of the form `calendar__event--{color}`
 * and a matching accent colour on the details list.
 */
export type CalendarColor =
  | "indigo"
  | "rose"
  | "emerald"
  | "amber"
  | "sky"
  | "violet";

/**
 * A single calendar entry. `startTime` is the 24-hour "HH:MM" clock
 * string; when omitted the event is treated as all-day and renders
 * without a time label.
 */
export interface CalendarEvent {
  /** Stable unique identifier (e.g. "evt-001"). */
  readonly id: string;
  /** Headline shown on the chip and in the detail list. */
  readonly title: string;
  /** Full year (e.g. 2025). */
  readonly year: number;
  /** Month (0-indexed; 0 = January). */
  readonly month: number;
  /** Day of month (1-indexed). */
  readonly day: number;
  /**
   * Optional start time in 24-hour "HH:MM" format. When omitted the
   * event renders as an all-day chip.
   */
  readonly startTime?: string;
  /**
   * Duration in minutes. Has no effect on rendering today, but is
   * surfaced in the detail panel when present.
   */
  readonly durationMinutes?: number;
  /** Colour category for the chip and detail accent. */
  readonly color: CalendarColor;
  /** Optional location label (e.g. "Boardroom"). */
  readonly location?: string;
  /** Optional free-form notes; shown on the detail list. */
  readonly notes?: string;
}

/**
 * A single cell in the month grid. Cells outside the current month
 * are still rendered (so the grid always has the same shape) but
 * flagged with `isCurrentMonth: false` so the UI can dim them.
 */
export interface CalendarDayCell {
  /** Date that the cell represents. */
  readonly date: Date;
  readonly year: number;
  readonly month: number;
  readonly day: number;
  /** Whether this cell belongs to the rendered month. */
  readonly isCurrentMonth: boolean;
  /**
   * Stable "YYYY-MM-DD" id used as a `data-testid` key and for
   * selection state. Padded so sort order matches chronological
   * order.
   */
  readonly isoDate: string;
}

/** Number of cells in the rendered grid (6 weeks × 7 days). */
export const CALENDAR_GRID_SIZE = 42;

/** Day-of-week labels, Sunday-first to match `Date.getDay()`. */
export const DAY_LABELS: readonly string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

/**
 * Full month names indexed by 0-indexed month. Indexed access
 * guarantees we never return `undefined` for a valid month.
 */
export const MONTH_NAMES: readonly string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Return the full month name for a 0-indexed `month` value. Falls
 * back to an empty string for out-of-range inputs so the UI never
 * has to render "undefined".
 */
export function monthName(month: number): string {
  return MONTH_NAMES[month] ?? "";
}

/**
 * Return the short weekday label for a 0-indexed day-of-week.
 */
export function dayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? "";
}

/**
 * Format a 24-hour "HH:MM" time string as "h:MM AM/PM". Returns the
 * input verbatim when it cannot be parsed so the UI never crashes on
 * malformed data.
 */
export function formatTimeLabel(hhmm: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return hhmm;
  const hours24 = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  if (Number.isNaN(hours24) || Number.isNaN(minutes)) return hhmm;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${mm} ${period}`;
}

/**
 * Return the full weekday name for a `Date` (e.g. "Wednesday").
 */
export function fullDayName(date: Date): string {
  const names = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return names[date.getDay()] ?? "";
}

/**
 * Sort comparator for events that orders all-day entries before
 * timed ones, then by start time.
 */
function compareEvents(
  a: CalendarEvent,
  b: CalendarEvent
): number {
  if (!a.startTime && b.startTime) return -1;
  if (a.startTime && !b.startTime) return 1;
  if (!a.startTime && !b.startTime) {
    return a.id.localeCompare(b.id);
  }
  return (a.startTime ?? "").localeCompare(b.startTime ?? "");
}

/**
 * Return every event from `events` that falls on the given day,
 * ordered by start time. Returns a fresh array so callers can
 * mutate freely without affecting the source dataset.
 */
export function getEventsForDay(
  year: number,
  month: number,
  day: number,
  events: readonly CalendarEvent[]
): readonly CalendarEvent[] {
  return events
    .filter(
      (event) =>
        event.year === year && event.month === month && event.day === day
    )
    .slice()
    .sort(compareEvents);
}

/**
 * Build the 42-cell grid for the month containing `(year, month)`.
 *
 * The grid always starts on the Sunday on or before the 1st of the
 * month, and always covers 6 weeks (42 cells). Out-of-month cells are
 * flagged with `isCurrentMonth: false` so the UI can render them in
 * a dimmed state.
 *
 * Dates are constructed with the local-time `Date(year, month, day)`
 * constructor so day-of-week math is timezone-agnostic.
 */
export function buildMonthGrid(
  year: number,
  month: number
): readonly CalendarDayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const offset = firstOfMonth.getDay();
  const start = new Date(year, month, 1 - offset);
  const cells: CalendarDayCell[] = [];
  for (let i = 0; i < CALENDAR_GRID_SIZE; i += 1) {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i
    );
    const cellYear = date.getFullYear();
    const cellMonth = date.getMonth();
    const day = date.getDate();
    cells.push({
      date,
      year: cellYear,
      month: cellMonth,
      day,
      isCurrentMonth: cellYear === year && cellMonth === month,
      isoDate: formatIsoDate(cellYear, cellMonth, day),
    });
  }
  return cells;
}

/**
 * Add `delta` months to the supplied `(year, month)` pair and
 * normalise the result so `month` stays in `[0, 11]`. Used by the
 * prev/next navigation handlers to wrap years without ever writing
 * out-of-range values into state.
 */
export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { readonly year: number; readonly month: number } {
  const total = year * 12 + month + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = ((total % 12) + 12) % 12;
  return { year: newYear, month: newMonth };
}

/**
 * Format a `(year, month, day)` triple as "YYYY-MM-DD". Always pads
 * month and day to two digits so the string sort order matches
 * chronological order.
 */
export function formatIsoDate(
  year: number,
  month: number,
  day: number
): string {
  const m = month + 1;
  const mm = m < 10 ? `0${m}` : `${m}`;
  const dd = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${mm}-${dd}`;
}

/**
 * Parse a "YYYY-MM-DD" string back into its year/month/day
 * components. Month is 0-indexed on the way out to match
 * `CalendarEvent.month` and `Date.prototype.getMonth()`. Returns
 * `null` for malformed input so callers can degrade gracefully.
 */
export function parseIsoDate(
  iso: string
): { readonly year: number; readonly month: number; readonly day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = parseInt(match[1] ?? "", 10);
  const month = parseInt(match[2] ?? "", 10) - 1;
  const day = parseInt(match[3] ?? "", 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }
  return { year, month, day };
}

/**
 * The frozen seed dataset that powers the Calendar app by default.
 *
 * Spans January–February 2025 with a mix of timed and all-day events
 * and several different colour categories. Tests can swap in a
 * smaller fixture via the `initialEvents` prop on `<Calendar />`.
 */
export const initialMockEvents: readonly CalendarEvent[] = Object.freeze([
  Object.freeze({
    id: "evt-001",
    title: "Team standup",
    year: 2025,
    month: 0,
    day: 2,
    startTime: "09:00",
    durationMinutes: 30,
    color: "indigo",
    location: "Zoom",
    notes: "Daily engineering sync.",
  }),
  Object.freeze({
    id: "evt-002",
    title: "Design review",
    year: 2025,
    month: 0,
    day: 6,
    startTime: "14:00",
    durationMinutes: 90,
    color: "rose",
    location: "Room A",
  }),
  Object.freeze({
    id: "evt-003",
    title: "Lunch with Avery",
    year: 2025,
    month: 0,
    day: 8,
    startTime: "12:30",
    durationMinutes: 60,
    color: "emerald",
    location: "Cafe Rio",
  }),
  Object.freeze({
    id: "evt-004",
    title: "Sprint planning",
    year: 2025,
    month: 0,
    day: 13,
    startTime: "10:00",
    durationMinutes: 60,
    color: "amber",
  }),
  Object.freeze({
    id: "evt-005",
    title: "Tahoe beta demo",
    year: 2025,
    month: 0,
    day: 15,
    color: "violet",
    notes: "All-day internal demo of the macOS Tahoe build.",
  }),
  Object.freeze({
    id: "evt-006",
    title: "Coffee with Mom",
    year: 2025,
    month: 0,
    day: 17,
    startTime: "11:00",
    durationMinutes: 45,
    color: "rose",
  }),
  Object.freeze({
    id: "evt-007",
    title: "Quarterly review",
    year: 2025,
    month: 0,
    day: 20,
    startTime: "15:00",
    durationMinutes: 120,
    color: "sky",
    location: "Boardroom",
    notes: "Bring Q4 metrics deck.",
  }),
  Object.freeze({
    id: "evt-008",
    title: "1:1 with Avery",
    year: 2025,
    month: 0,
    day: 22,
    startTime: "09:30",
    durationMinutes: 30,
    color: "indigo",
  }),
  Object.freeze({
    id: "evt-009",
    title: "Tahoe launch party",
    year: 2025,
    month: 0,
    day: 27,
    startTime: "18:00",
    durationMinutes: 180,
    color: "violet",
    location: "Yerba Buena Gardens",
  }),
  Object.freeze({
    id: "evt-010",
    title: "Sprint retro",
    year: 2025,
    month: 0,
    day: 30,
    startTime: "14:30",
    durationMinutes: 60,
    color: "emerald",
  }),
  Object.freeze({
    id: "evt-011",
    title: "All-hands meeting",
    year: 2025,
    month: 1,
    day: 4,
    startTime: "10:00",
    durationMinutes: 60,
    color: "amber",
  }),
  Object.freeze({
    id: "evt-012",
    title: "Valentine's dinner",
    year: 2025,
    month: 1,
    day: 14,
    startTime: "19:00",
    durationMinutes: 120,
    color: "rose",
    location: "Spruce",
  }),
]);
