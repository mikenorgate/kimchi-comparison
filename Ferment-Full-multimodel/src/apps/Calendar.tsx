import { useMemo, useState } from 'react';

interface CalendarEvent {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  title: string;
  color?: string;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', date: sampleDateOffset(0), title: 'Team standup', color: '#0a84ff' },
  { id: 'evt-2', date: sampleDateOffset(0), title: 'Design review', color: '#ff9f0a' },
  { id: 'evt-3', date: sampleDateOffset(1), title: 'Lunch with Alex', color: '#34c759' },
  { id: 'evt-4', date: sampleDateOffset(2), title: 'Sprint planning', color: '#0a84ff' },
  { id: 'evt-5', date: sampleDateOffset(3), title: 'Yoga', color: '#bf5af2' },
  { id: 'evt-6', date: sampleDateOffset(5), title: 'Project deadline', color: '#ff3b30' },
  { id: 'evt-7', date: sampleDateOffset(7), title: 'Coffee with Sam', color: '#ff9f0a' },
];

function todayISO(): string {
  const d = new Date();
  return formatYMD(d);
}

function sampleDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatYMD(d);
}

function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function buildMonthGrid(year: number, month: number): Date[] {
  // 6 rows * 7 cols = 42 cells starting from the Sunday on or before the 1st.
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar(): JSX.Element {
  const [cursor, setCursor] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS);
  const [selected, setSelected] = useState<string>(todayISO());
  const [draftTitle, setDraftTitle] = useState('');

  const today = useMemo(() => todayISO(), []);

  const cells = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDate.get(selected) ?? [];

  const goPrev = (): void => {
    setCursor(({ year, month }) => {
      const m = month - 1;
      if (m < 0) return { year: year - 1, month: 11 };
      return { year, month: m };
    });
  };

  const goNext = (): void => {
    setCursor(({ year, month }) => {
      const m = month + 1;
      if (m > 11) return { year: year + 1, month: 0 };
      return { year, month: m };
    });
  };

  const goToday = (): void => {
    const now = new Date();
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(formatYMD(now));
  };

  const handleAddEvent = (): void => {
    const title = draftTitle.trim();
    if (!title) return;
    const next: CalendarEvent = {
      id: `evt-${Date.now()}`,
      date: selected,
      title,
    };
    setEvents((prev) => [...prev, next]);
    setDraftTitle('');
  };

  const handleDeleteEvent = (id: string): void => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="calendar-root">
      <div className="calendar-month-header">
        <div className="calendar-nav">
          <button type="button" className="app-btn" onClick={goPrev} aria-label="Previous month">
            ‹
          </button>
          <button type="button" className="app-btn" onClick={goToday}>
            Today
          </button>
          <button type="button" className="app-btn" onClick={goNext} aria-label="Next month">
            ›
          </button>
        </div>
        <div className="calendar-month-header__title">{monthLabel(cursor.year, cursor.month)}</div>
        <div style={{ width: 120 }} />
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      <div className="calendar-grid" role="grid">
        {cells.map((d) => {
          const iso = formatYMD(d);
          const outOfMonth = d.getMonth() !== cursor.month;
          const dayEvents = eventsByDate.get(iso) ?? [];
          const classes = [
            'calendar-day',
            outOfMonth ? 'calendar-day--out' : '',
            iso === today ? 'calendar-day--today' : '',
            iso === selected ? 'calendar-day--selected' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              type="button"
              key={iso}
              className={classes}
              onClick={() => setSelected(iso)}
            >
              <span className="calendar-day__num">{d.getDate()}</span>
              {dayEvents.slice(0, 3).map((e) => (
                <button
                  type="button"
                  key={e.id}
                  className="calendar-event-pill"
                  style={e.color ? { background: `${e.color}22`, color: e.color } : undefined}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDeleteEvent(e.id);
                  }}
                  title={`${e.title} (click to delete)`}
                >
                  {e.title}
                </button>
              ))}
              {dayEvents.length > 3 && (
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  +{dayEvents.length - 3} more
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-add-row">
        <input
          type="text"
          className="app-input calendar-add-row__input"
          placeholder={`Add event for ${selected}`}
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddEvent();
          }}
        />
        <button type="button" className="app-btn app-btn--primary" onClick={handleAddEvent}>
          Add
        </button>
      </div>

      {selectedEvents.length > 0 && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            background: 'rgba(245,245,247,0.7)',
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            flexShrink: 0,
          }}
        >
          {selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'} on{' '}
          {selected} — click a pill to delete.
        </div>
      )}
    </div>
  );
}

export default Calendar;
