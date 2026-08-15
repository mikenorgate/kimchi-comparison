import { useState, useMemo } from 'react';
import './Calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOCK_EVENTS = [
  { id: 'e1', title: 'Keynote Rehearsal', date: 3, time: '9:00 AM', color: '#007aff' },
  { id: 'e2', title: 'Design Review', date: 5, time: '2:00 PM', color: '#34c759' },
  { id: 'e3', title: 'Team Lunch', date: 12, time: '12:30 PM', color: '#ff9500' },
  { id: 'e4', title: 'Product Sync', date: 15, time: '10:00 AM', color: '#5856d6' },
  { id: 'e5', title: 'All Hands', date: 18, time: '4:00 PM', color: '#ff3b30' },
  { id: 'e6', title: '1:1 with Manager', date: 21, time: '11:00 AM', color: '#af52de' },
  { id: 'e7', title: 'Q3 Planning', date: 24, time: '1:00 PM', color: '#5ac8fa' },
  { id: 'e8', title: 'Board Meeting', date: 28, time: '9:30 AM', color: '#ff2d55' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0).getDate(),
    [currentYear, currentMonth]
  );
  const firstDayOfWeek = useMemo(
    () => new Date(currentYear, currentMonth, 1).getDay(),
    [currentYear, currentMonth]
  );

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const eventsForSelectedDate = useMemo(
    () => MOCK_EVENTS.filter((e) => e.date === selectedDate),
    [selectedDate]
  );

  const isToday = (date) =>
    date === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const gotoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today.getDate());
  };

  return (
    <div className="calendar">
      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button className="calendar-tool-button" onClick={prevMonth} aria-label="Previous month">
            ‹
          </button>
          <button className="calendar-tool-button" onClick={nextMonth} aria-label="Next month">
            ›
          </button>
          <button className="calendar-today-button" onClick={gotoToday}>
            Today
          </button>
        </div>
        <h2 className="calendar-title">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h2>
        <div className="calendar-views">
          <button className="calendar-view-button active">Month</button>
          <button className="calendar-view-button">Week</button>
          <button className="calendar-view-button">Day</button>
        </div>
      </div>
      <div className="calendar-body">
        <div className="calendar-grid-panel">
          <div className="calendar-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-days">
            {calendarDays.map((date, index) =>
              date === null ? (
                <div key={`empty-${index}`} className="calendar-day empty" />
              ) : (
                <button
                  key={date}
                  className={`calendar-day ${selectedDate === date ? 'selected' : ''} ${
                    isToday(date) ? 'today' : ''
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="calendar-day-number">{date}</span>
                  <div className="calendar-day-events">
                    {MOCK_EVENTS.filter((e) => e.date === date).map((e) => (
                      <span
                        key={e.id}
                        className="calendar-dot"
                        style={{ background: e.color }}
                        title={e.title}
                      />
                    ))}
                  </div>
                </button>
              )
            )}
          </div>
        </div>
        <aside className="calendar-events-panel">
          <h3 className="calendar-events-date">
            {MONTH_NAMES[currentMonth]} {selectedDate}, {currentYear}
          </h3>
          {eventsForSelectedDate.length === 0 ? (
            <div className="calendar-no-events">No events scheduled</div>
          ) : (
            <ul className="calendar-events-list">
              {eventsForSelectedDate.map((event) => (
                <li key={event.id} className="calendar-event">
                  <span
                    className="calendar-event-bar"
                    style={{ background: event.color }}
                  />
                  <div className="calendar-event-info">
                    <div className="calendar-event-title">{event.title}</div>
                    <div className="calendar-event-time">{event.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
