import { useState } from 'react'

interface CalEvent {
  id: string
  date: string // YYYY-MM-DD
  title: string
  time: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Calendar app — month grid view with weekday headers.
 * Prev/next month navigation. Click a day to create an event.
 * Events render as pills on their day.
 */
export default function Calendar() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalEvent[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('')

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    setEventTitle('')
    setEventTime('')
  }

  const addEvent = () => {
    if (!eventTitle.trim() || selectedDay === null) return
    const dateStr = formatDate(viewYear, viewMonth, selectedDay)
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setEvents(prev => [...prev, { id, date: dateStr, title: eventTitle.trim(), time: eventTime || 'All Day' }])
    setEventTitle('')
    setEventTime('')
    setSelectedDay(null)
  }

  const getEventsForDay = (day: number): CalEvent[] => {
    const dateStr = formatDate(viewYear, viewMonth, day)
    return events.filter(e => e.date === dateStr)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div
      data-testid="calendar"
      style={{
        height: '100%',
        background: '#1e1e1e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px' }}>
        <button data-testid="cal-prev" onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#0a84ff', fontSize: '18px', cursor: 'pointer' }}>‹</button>
        <span data-testid="cal-month-label" style={{ fontSize: '18px', fontWeight: 600, minWidth: '180px', textAlign: 'center' }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button data-testid="cal-next" onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#0a84ff', fontSize: '18px', cursor: 'pointer' }}>›</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px' }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, opacity: 0.5, padding: '4px' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div data-testid="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', padding: '4px 8px', flex: 1 }}>
        {cells.map((day, i) => (
          <div
            key={i}
            data-testid={day ? `cal-day-${day}` : `cal-empty-${i}`}
            onClick={() => day && handleDayClick(day)}
            style={{
              minHeight: '50px',
              padding: '4px',
              background: day ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderRadius: '6px',
              cursor: day ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {day && (
              <>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>{day}</span>
                {getEventsForDay(day).map(evt => (
                  <div
                    key={evt.id}
                    data-testid={`cal-event-${day}`}
                    style={{
                      fontSize: '10px',
                      background: '#0a84ff',
                      borderRadius: '3px',
                      padding: '1px 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {evt.title}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Event creation popover */}
      {selectedDay !== null && (
        <div
          data-testid="cal-event-popover"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#2a2a2a',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minWidth: '280px',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            New Event — {MONTHS[viewMonth]} {selectedDay}, {viewYear}
          </div>
          <input
            data-testid="cal-event-title"
            type="text"
            placeholder="Event title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            style={{
              background: '#1e1e1e',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <input
            data-testid="cal-event-time"
            type="text"
            placeholder="Time (e.g. 2:00 PM)"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            style={{
              background: '#1e1e1e',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              data-testid="cal-event-cancel"
              onClick={() => setSelectedDay(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0a84ff',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '4px 12px',
              }}
            >
              Cancel
            </button>
            <button
              data-testid="cal-event-add"
              onClick={addEvent}
              style={{
                background: '#0a84ff',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '4px 14px',
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
