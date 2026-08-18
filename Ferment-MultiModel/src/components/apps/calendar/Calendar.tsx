"use client";

import {
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import {
  DAY_LABELS,
  buildMonthGrid,
  dayLabel,
  formatTimeLabel,
  fullDayName,
  getEventsForDay,
  initialMockEvents,
  monthName,
  parseIsoDate,
  shiftMonth,
} from "./mockCalendar";
import type {
  CalendarColor,
  CalendarDayCell,
  CalendarEvent,
} from "./mockCalendar";

/**
 * Calendar window content.
 *
 * Renders a single-month calendar inspired by macOS Calendar:
 *
 *   | toolbar (prev / next / today / month-year title)            |
 *   | day-of-week header                                          |
 *   | 7-column × 6-row grid of day cells (with event chips)       |
 *   | detail panel showing events for the selected day            |
 *
 * The component owns its own selection state (which day is selected)
 * and the currently-displayed month/year. The initial month can be
 * overridden via the `initialYear` / `initialMonth` props so tests
 * can boot into a deterministic month without monkey-patching the
 * system clock.
 *
 * Behavioural notes:
 * - Clicking a day cell selects it and reveals a detail list to the
 *   right of the grid. Clicking an event chip selects that day and
 *   marks the chip "active" in the detail list.
 * - Navigation buttons clamp at the boundaries: prev/next wrap years
 *   (Jan - 1 → Dec of the previous year). The today button returns
 *   the user to the live month without resetting the day selection.
 * - Events are read-only — they come from `initialMockEvents` (or a
 *   fixture passed via `initialEvents`) and the component never
 *   mutates the underlying array.
 */

/** Map a {@link CalendarColor} to its tailwind / CSS class suffix. */
function eventColorClass(color: CalendarColor): string {
  return `calendar__event--${color}`;
}

export interface CalendarProps {
  /**
   * Initial month (0-indexed). When omitted, defaults to the current
   * local month. Tests pass an explicit value to keep the rendered
   * month stable across runs.
   */
  readonly initialMonth?: number;
  /** Initial year. See {@link CalendarProps.initialMonth}. */
  readonly initialYear?: number;
  /**
   * Optional override for the seed event dataset. Defaults to
   * {@link initialMockEvents}. Tests can pass a smaller fixture.
   */
  readonly initialEvents?: readonly CalendarEvent[];
}

/**
 * Render the header title (e.g. "January 2025") from a `(year,
 * month)` pair.
 */
function formatHeader(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}

/**
 * Pick a sensible default initial month when no `initialMonth` /
 * `initialYear` props are supplied. Resolved once at mount time so
 * subsequent ticks of the system clock don't move the displayed
 * month underneath the user.
 */
function resolveInitial(
  initialYear: number | undefined,
  initialMonth: number | undefined
): { year: number; month: number } {
  if (
    typeof initialYear === "number" &&
    typeof initialMonth === "number" &&
    initialMonth >= 0 &&
    initialMonth <= 11
  ) {
    return { year: initialYear, month: initialMonth };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default function Calendar({
  initialMonth,
  initialYear,
  initialEvents,
}: CalendarProps): JSX.Element {
  const seed = useMemo(
    () => resolveInitial(initialYear, initialMonth),
    // The initial month/year are treated as a one-time fixture even
    // if the parent re-renders, so `initialMonth` / `initialYear` are
    // intentionally not listed as deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const events = initialEvents ?? initialMockEvents;

  const [cursor, setCursor] = useState<{
    readonly year: number;
    readonly month: number;
  }>(seed);
  const [selectedIsoDate, setSelectedIsoDate] = useState<string | undefined>(
    undefined
  );

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month]
  );

  const goPrev = useCallback(() => {
    setCursor((prev) => shiftMonth(prev.year, prev.month, -1));
  }, []);
  const goNext = useCallback(() => {
    setCursor((prev) => shiftMonth(prev.year, prev.month, 1));
  }, []);
  const goToday = useCallback(() => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
  }, []);

  const handleDaySelect = useCallback((cell: CalendarDayCell) => {
    setSelectedIsoDate(cell.isoDate);
  }, []);

  const handleEventClick = useCallback(
    (event: CalendarEvent, eventMouseEvent: MouseEvent<HTMLButtonElement>) => {
      // Selecting an event implies selecting its day. Stop propagation
      // so the parent day-cell's onClick doesn't fire twice and
      // trigger a redundant state update.
      eventMouseEvent.stopPropagation();
      setSelectedIsoDate(
        `${event.year}-${String(event.month + 1).padStart(2, "0")}-${String(
          event.day
        ).padStart(2, "0")}`
      );
    },
    []
  );

  const selectedCell = useMemo<CalendarDayCell | undefined>(() => {
    if (!selectedIsoDate) return undefined;
    const parsed = parseIsoDate(selectedIsoDate);
    if (!parsed) return undefined;
    return grid.find((c) => c.isoDate === selectedIsoDate);
  }, [selectedIsoDate, grid]);

  const selectedEvents = useMemo<readonly CalendarEvent[]>(() => {
    if (!selectedCell) return [];
    return getEventsForDay(
      selectedCell.year,
      selectedCell.month,
      selectedCell.day,
      events
    );
  }, [selectedCell, events]);

  return (
    <div
      className="calendar"
      data-testid="calendar"
      data-year={cursor.year}
      data-month={cursor.month}
      data-selected-date={selectedIsoDate ?? ""}
    >
      <Toolbar
        year={cursor.year}
        month={cursor.month}
        onPrev={goPrev}
        onNext={goNext}
        onToday={goToday}
      />

      <div className="calendar__body">
        <MonthGrid
          year={cursor.year}
          month={cursor.month}
          grid={grid}
          events={events}
          selectedIsoDate={selectedIsoDate}
          onDaySelect={handleDaySelect}
          onEventClick={handleEventClick}
        />

        <DayDetails
          selectedCell={selectedCell}
          events={selectedEvents}
          onClear={() => setSelectedIsoDate(undefined)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

interface ToolbarProps {
  readonly year: number;
  readonly month: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onToday: () => void;
}

/**
 * Toolbar across the top of the Calendar window: prev/next chevrons,
 * a "Today" jump button, and the centered month / year title. The
 * header text comes from {@link formatHeader} so the format stays
 * consistent with the rest of the UI.
 */
function Toolbar({
  year,
  month,
  onPrev,
  onNext,
  onToday,
}: ToolbarProps): JSX.Element {
  return (
    <header
      className="calendar__toolbar"
      data-testid="calendar-toolbar"
    >
      <div className="calendar__toolbar-left">
        <button
          type="button"
          className="calendar__toolbar-button"
          data-testid="calendar-prev"
          aria-label="Previous month"
          onClick={onPrev}
        >
          {"\u2039"}
        </button>
        <button
          type="button"
          className="calendar__toolbar-button"
          data-testid="calendar-next"
          aria-label="Next month"
          onClick={onNext}
        >
          {"\u203A"}
        </button>
        <button
          type="button"
          className="calendar__toolbar-button calendar__toolbar-button--today"
          data-testid="calendar-today"
          onClick={onToday}
        >
          Today
        </button>
      </div>
      <h2
        className="calendar__title"
        data-testid="calendar-title"
      >
        {formatHeader(year, month)}
      </h2>
      <div className="calendar__toolbar-right" aria-hidden="true" />
    </header>
  );
}

// ---------------------------------------------------------------------------
// Month grid
// ---------------------------------------------------------------------------

interface MonthGridProps {
  readonly year: number;
  readonly month: number;
  readonly grid: readonly CalendarDayCell[];
  readonly events: readonly CalendarEvent[];
  readonly selectedIsoDate: string | undefined;
  readonly onDaySelect: (cell: CalendarDayCell) => void;
  readonly onEventClick: (event: CalendarEvent, mouse: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * The 7-column day-of-week header followed by 42 day cells. Day cells
 * outside the rendered month render with the
 * `calendar__cell--out` class so CSS can dim them. Each cell surfaces
 * the day's events as small colored chips.
 */
function MonthGrid({
  year,
  month,
  grid,
  events,
  selectedIsoDate,
  onDaySelect,
  onEventClick,
}: MonthGridProps): JSX.Element {
  return (
    <section
      className="calendar__grid-wrapper"
      data-testid="calendar-grid-wrapper"
      aria-label={`${monthName(month)} ${year}`}
    >
      <div
        className="calendar__weekdays"
        data-testid="calendar-weekdays"
        aria-hidden="true"
      >
        {DAY_LABELS.map((label, idx) => (
          <span
            key={label}
            className="calendar__weekday"
            data-testid={`calendar-weekday-${idx}`}
          >
            {dayLabel(idx)}
          </span>
        ))}
      </div>

      <div
        className="calendar__grid"
        data-testid="calendar-grid"
        data-year={year}
        data-month={month}
        role="grid"
        aria-readonly="true"
      >
        {grid.map((cell) => {
          const dayEvents = getEventsForDay(
            cell.year,
            cell.month,
            cell.day,
            events
          );
          const isSelected = cell.isoDate === selectedIsoDate;
          return (
            <DayCell
              key={cell.isoDate}
              cell={cell}
              dayEvents={dayEvents}
              isSelected={isSelected}
              onSelect={onDaySelect}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </section>
  );
}

interface DayCellProps {
  readonly cell: CalendarDayCell;
  readonly dayEvents: readonly CalendarEvent[];
  readonly isSelected: boolean;
  readonly onSelect: (cell: CalendarDayCell) => void;
  readonly onEventClick: (event: CalendarEvent, mouse: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * A single day cell in the month grid. The whole cell is clickable
 * (selects the day) and event chips inside it are also clickable.
 * Event chips stop propagation so the day-cell click handler doesn't
 * run twice.
 */
function DayCell({
  cell,
  dayEvents,
  isSelected,
  onSelect,
  onEventClick,
}: DayCellProps): JSX.Element {
  const className =
    "calendar__cell" +
    (cell.isCurrentMonth ? "" : " calendar__cell--out") +
    (isSelected ? " calendar__cell--selected" : "");
  return (
    <div
      role="gridcell"
      tabIndex={0}
      className={className}
      data-testid={`calendar-cell-${cell.isoDate}`}
      data-iso-date={cell.isoDate}
      data-day={cell.day}
      data-month={cell.month}
      data-year={cell.year}
      data-current-month={cell.isCurrentMonth ? "true" : "false"}
      data-selected={isSelected ? "true" : "false"}
      data-event-count={dayEvents.length}
      aria-current={isSelected ? "date" : undefined}
      onClick={() => onSelect(cell)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(cell);
        }
      }}
    >
      <span
        className="calendar__cell-number"
        data-testid={`calendar-cell-number-${cell.isoDate}`}
      >
        {cell.day}
      </span>
      <ul
        className="calendar__events"
        data-testid={`calendar-events-${cell.isoDate}`}
        aria-label={`Events on ${cell.isoDate}`}
      >
        {dayEvents.map((event) => {
          const chipClass =
            "calendar__event " + eventColorClass(event.color);
          return (
            <li
              key={event.id}
              className="calendar__event-row"
              data-testid={`calendar-event-row-${event.id}`}
              data-event-id={event.id}
              data-event-color={event.color}
              data-event-date={cell.isoDate}
            >
              <button
                type="button"
                className={chipClass}
                data-testid={`calendar-event-${event.id}`}
                data-event-color={event.color}
                onClick={(mouse) => onEventClick(event, mouse)}
                title={
                  event.startTime
                    ? `${event.title} — ${formatTimeLabel(event.startTime)}`
                    : event.title
                }
              >
                <span className="calendar__event-dot" aria-hidden="true" />
                <span className="calendar__event-title">{event.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Day details
// ---------------------------------------------------------------------------

interface DayDetailsProps {
  readonly selectedCell: CalendarDayCell | undefined;
  readonly events: readonly CalendarEvent[];
  readonly onClear: () => void;
}

/**
 * Side panel listing the events on the currently-selected day. When
 * nothing is selected it shows a friendly empty state; when the
 * selected day exists but has no events it shows an explicit "No
 * events" message so the layout doesn't look broken.
 */
function DayDetails({
  selectedCell,
  events,
  onClear,
}: DayDetailsProps): JSX.Element {
  if (!selectedCell) {
    return (
      <aside
        className="calendar__details"
        data-testid="calendar-details"
        data-empty="true"
        aria-label="Day details"
      >
        <div
          className="calendar__details-empty"
          data-testid="calendar-details-empty"
          role="status"
        >
          Select a day to see its events
        </div>
      </aside>
    );
  }

  const dateLabel = `${fullDayName(selectedCell.date)}, ${monthName(
    selectedCell.month
  )} ${selectedCell.day}, ${selectedCell.year}`;

  return (
    <aside
      className="calendar__details"
      data-testid="calendar-details"
      data-empty={events.length === 0 ? "true" : "false"}
      data-iso-date={selectedCell.isoDate}
      aria-label="Day details"
    >
      <header className="calendar__details-header">
        <h3
          className="calendar__details-title"
          data-testid="calendar-details-title"
        >
          {dateLabel}
        </h3>
        <button
          type="button"
          className="calendar__details-close"
          data-testid="calendar-details-close"
          aria-label="Close details"
          onClick={onClear}
        >
          {"\u2715"}
        </button>
      </header>
      {events.length === 0 ? (
        <div
          className="calendar__details-empty"
          data-testid="calendar-details-empty"
          role="status"
        >
          No events
        </div>
      ) : (
        <ul
          className="calendar__details-list"
          data-testid="calendar-details-list"
          aria-label="Events on this day"
        >
          {events.map((event) => (
            <EventDetailRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </aside>
  );
}

interface EventDetailRowProps {
  readonly event: CalendarEvent;
}

/**
 * A single row inside the day-details list. Renders the title, time
 * (or "All day"), optional location, and any notes the event
 * carries. The colour swatch matches the chip colour.
 */
function EventDetailRow({ event }: EventDetailRowProps): JSX.Element {
  const timeLabel = event.startTime
    ? formatTimeLabel(event.startTime)
    : "All day";
  return (
    <li
      className={"calendar__detail " + eventColorClass(event.color)}
      data-testid={`calendar-detail-${event.id}`}
      data-event-id={event.id}
      data-event-color={event.color}
    >
      <span
        className="calendar__detail-swatch"
        aria-hidden="true"
      />
      <div className="calendar__detail-body">
        <div
          className="calendar__detail-title"
          data-testid={`calendar-detail-title-${event.id}`}
        >
          {event.title}
        </div>
        <div
          className="calendar__detail-meta"
          data-testid={`calendar-detail-meta-${event.id}`}
        >
          <span className="calendar__detail-time">{timeLabel}</span>
          {event.location ? (
            <span
              className="calendar__detail-location"
              data-testid={`calendar-detail-location-${event.id}`}
            >
              {" \u00B7 "}
              {event.location}
            </span>
          ) : null}
          {event.durationMinutes !== undefined ? (
            <span className="calendar__detail-duration">
              {" \u00B7 "}
              {event.durationMinutes} min
            </span>
          ) : null}
        </div>
        {event.notes ? (
          <div
            className="calendar__detail-notes"
            data-testid={`calendar-detail-notes-${event.id}`}
          >
            {event.notes}
          </div>
        ) : null}
      </div>
    </li>
  );
}

// Re-export the CalendarEvent type so callers can reference
// `Calendar.CalendarEvent` if they want a type-level companion to the
// component.
export type { CalendarEvent };
