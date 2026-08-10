import { useState } from 'react';

interface Event { id: string; title: string; day: number; time: string; color: string; }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ appId: _appId }: { appId: string }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const today = now.getDate();

  const seedEvents: Event[] = [
    { id: 'e1', title: 'Team Meeting', day: today, time: '10:00 AM', color: '#0a84ff' },
    { id: 'e2', title: 'Lunch with Sarah', day: today, time: '12:30 PM', color: '#ff9f0a' },
    { id: 'e3', title: 'Design Review', day: today + 1, time: '2:00 PM', color: '#bf5af2' },
    { id: 'e4', title: 'Ship Release', day: today + 2, time: '4:00 PM', color: '#30d158' },
  ];

  const [selectedDay, setSelectedDay] = useState(today);
  const dayEvents = seedEvents.filter(e => e.day === selectedDay);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div className="flex h-full w-full" data-testid="calendar-root">
      <div className="flex-1 flex flex-col p-3" data-testid="calendar-grid">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-black/80 dark:text-white/80" data-testid="calendar-month">{MONTHS[currentMonth]} {currentYear}</h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="px-2 text-black/50 dark:text-white/50" data-testid="calendar-prev">‹</button>
            <button onClick={nextMonth} className="px-2 text-black/50 dark:text-white/50" data-testid="calendar-next">›</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => <div key={d} className="text-xs text-center font-medium text-black/40 dark:text-white/40">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 flex-1" data-testid="calendar-days">
          {cells.map((day, i) => {
            const hasEvent = day !== null && seedEvents.some(e => e.day === day);
            const isToday = day === today && currentMonth === now.getMonth() && currentYear === now.getFullYear();
            const isSelected = day === selectedDay;
            return (
              <button
                key={i}
                className={`rounded-lg text-sm flex flex-col items-center justify-center transition-colors ${
                  isSelected ? 'bg-[#0a84ff] text-white' :
                  isToday ? 'bg-[#0a84ff]/15 text-[#0a84ff] font-bold' :
                  day ? 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5' : ''
                }`}
                disabled={day === null}
                onClick={() => day && setSelectedDay(day)}
                data-testid={day ? `calendar-day-${day}` : `calendar-empty-${i}`}
              >
                {day && <span>{day}</span>}
                {hasEvent && <div className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="w-56 shrink-0 border-l border-black/5 dark:border-white/5 p-3 overflow-y-auto" data-testid="calendar-events">
        <div className="text-sm font-semibold text-black/70 dark:text-white/70 mb-2">
          {MONTHS[currentMonth]} {selectedDay}
        </div>
        {dayEvents.length > 0 ? (
          dayEvents.map(e => (
            <div key={e.id} className="flex items-center gap-2 py-2 border-b border-black/3 dark:border-white/3" data-testid={`calendar-event-${e.id}`}>
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: e.color }} />
              <div>
                <div className="text-sm text-black/80 dark:text-white/80">{e.title}</div>
                <div className="text-xs text-black/40 dark:text-white/40">{e.time}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-black/30 dark:text-white/30 text-center py-4">No events</div>
        )}
      </div>
    </div>
  );
}
