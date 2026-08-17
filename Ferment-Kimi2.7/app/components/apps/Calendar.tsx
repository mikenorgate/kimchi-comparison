'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: number; // day of month 1-31
  time?: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team standup', date: 3, time: '10:00' },
  { id: '2', title: 'Design review', date: 7, time: '14:00' },
  { id: '3', title: 'Lunch with Sarah', date: 12, time: '12:30' },
  { id: '4', title: 'Project launch', date: 15, time: '09:00' },
  { id: '5', title: 'Dentist appointment', date: 22, time: '16:00' },
  { id: '6', title: 'Weekly planning', date: 28, time: '11:00' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const { days, eventsForDay } = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayDay = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : null;

    const dayCells: { day: number | null; isToday: boolean }[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayCells.push({ day: null, isToday: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      dayCells.push({ day, isToday: day === todayDay });
    }

    const eventsByDay = new Map<number, CalendarEvent[]>();
    for (const event of MOCK_EVENTS) {
      const list = eventsByDay.get(event.date) ?? [];
      list.push(event);
      eventsByDay.set(event.date, list);
    }

    const eventsForDayFn = (day: number) => eventsByDay.get(day) ?? [];

    return { days: dayCells, eventsForDay: eventsForDayFn, todayDay };
  }, [year, month, today]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  return (
    <div className="flex h-full w-full flex-col bg-background" data-testid="calendar">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            data-testid="calendar-prev"
            onClick={prevMonth}
            className="rounded p-1 hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            data-testid="calendar-next"
            onClick={nextMonth}
            className="rounded p-1 hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h2 data-testid="calendar-month" className="ml-2 text-lg font-semibold">
            {monthLabel}
          </h2>
        </div>
        <button
          data-testid="calendar-today"
          onClick={goToday}
          className="rounded-md bg-accent px-3 py-1 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          Today
        </button>
      </header>

      <div className="grid flex-1 grid-cols-7 grid-rows-[auto_1fr] overflow-hidden">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="border-b border-r border-border py-1 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((cell, index) => (
          <button
            key={index}
            data-testid={cell.day ? `calendar-day-${cell.day}` : `calendar-empty-${index}`}
            onClick={() => cell.day && setSelectedDay(cell.day)}
            className={`relative border-b border-r border-border p-2 text-left text-sm transition-colors hover:bg-accent/50 ${
              cell.day === selectedDay ? 'bg-accent/30 ring-1 ring-inset ring-accent' : ''
            } ${cell.isToday ? 'font-bold text-primary' : 'text-foreground'}`}
          >
            {cell.day && (
              <>
                <span className={cell.isToday ? 'rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground' : ''}>
                  {cell.day}
                </span>
                {eventsForDay(cell.day).length > 0 && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    {eventsForDay(cell.day).slice(0, 2).map((event) => (
                      <span
                        key={event.id}
                        data-testid={`calendar-event-${event.id}`}
                        className="truncate rounded bg-primary/20 px-1 text-[10px] text-primary"
                      >
                        {event.title}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {selectedDay && (
        <div
          data-testid="calendar-detail"
          className="border-t border-border bg-muted/30 px-4 py-3"
        >
          <h3 data-testid="calendar-detail-date" className="text-sm font-semibold">
            {new Date(year, month, selectedDay).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">No events</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {selectedEvents.map((event) => (
                <li key={event.id} data-testid={`calendar-detail-event-${event.id}`} className="text-xs">
                  {event.time && <span className="mr-2 text-muted-foreground">{event.time}</span>}
                  {event.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
