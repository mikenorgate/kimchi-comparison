import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CalendarApp
 *
 * Pure presentational mock of the macOS Calendar month view.
 *
 *   Header     – current month/year plus previous/next month buttons.
 *   Weekdays   – a static Sun..Sat header row.
 *   Day grid   – one button per day in the visible month. Today's cell
 *                is highlighted with an accent fill, and a subset of
 *                cells show a small placeholder event dot to suggest
 *                that events live on some days.
 *
 * All date math is done with the built-in `Date` object — no external
 * date libraries. State is local: only the visible (year, month) is
 * tracked, not the selected day, and there is no persistence.
 *
 * Props: none. Mounted inside a `<Window>` body by WindowManager when
 * the window's appId is `'calendar'`.
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function isoDate(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function daysInMonth(year, month) {
  // Day 0 of (month + 1) yields the last day of the requested month.
  return new Date(year, month + 1, 0).getDate();
}

function hasMockEvent(day) {
  // Deterministic mock: every third day has an event dot.
  return day % 3 === 0;
}

function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function CalendarApp() {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const { year, month } = view;
  const totalDays = daysInMonth(year, month);
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;
  const todayIso = isoDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const goPrev = () => {
    setView((v) => {
      if (v.month === 0) {
        return { year: v.year - 1, month: 11 };
      }
      return { year: v.year, month: v.month - 1 };
    });
  };

  const goNext = () => {
    setView((v) => {
      if (v.month === 11) {
        return { year: v.year + 1, month: 0 };
      }
      return { year: v.year, month: v.month + 1 };
    });
  };

  const days = [];
  for (let d = 1; d <= totalDays; d += 1) {
    days.push(d);
  }

  return (
    <div
      data-testid="calendar-app"
      className="flex h-full w-full flex-col rounded-lg bg-black/80 p-4 text-white backdrop-blur-md"
    >
      <header
        data-testid="calendar-header"
        className="mb-3 flex items-center justify-between"
      >
        <button
          type="button"
          data-testid="calendar-prev-month"
          aria-label="Previous month"
          onClick={goPrev}
          className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <h2
          data-testid="calendar-month-year"
          className="text-base font-semibold"
        >
          {monthLabel(year, month)}
        </h2>
        <button
          type="button"
          data-testid="calendar-next-month"
          aria-label="Next month"
          onClick={goNext}
          className="rounded-md p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div
        data-testid="calendar-weekday-row"
        className="mb-1 grid grid-cols-7 gap-1 text-[11px] uppercase tracking-wide text-white/60"
      >
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            data-testid={`calendar-weekday-${w}`}
            className="py-1 text-center"
          >
            {w}
          </div>
        ))}
      </div>

      <div
        data-testid="calendar-day-grid"
        role="grid"
        aria-label={`${monthLabel(year, month)} calendar`}
        className="grid flex-1 auto-rows-fr grid-cols-7 gap-1"
      >
        {days.map((d) => {
          const iso = isoDate(year, month, d);
          const isToday = isCurrentMonth && iso === todayIso;
          const showEvent = hasMockEvent(d);
          const baseCell =
            'flex flex-col items-center justify-start pt-1.5 rounded-md text-sm transition-colors hover:bg-white/15';
          const tone = isToday
            ? 'bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400'
            : 'bg-white/5 text-white/90';
          return (
            <button
              key={iso}
              type="button"
              data-testid={`calendar-day-${iso}`}
              data-is-today={isToday ? 'true' : 'false'}
              aria-current={isToday ? 'date' : undefined}
              aria-label={`Day ${d}${isToday ? ', today' : ''}`}
              className={`${baseCell} ${tone}`}
            >
              <span>{d}</span>
              {showEvent ? (
                <span
                  data-testid="calendar-event-dot"
                  aria-hidden="true"
                  className={
                    'mt-1 block h-1.5 w-1.5 rounded-full ' +
                    (isToday ? 'bg-slate-900' : 'bg-blue-400')
                  }
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarApp;
export { CalendarApp };
