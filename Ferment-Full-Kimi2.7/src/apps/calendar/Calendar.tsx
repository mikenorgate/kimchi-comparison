import { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from './types'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

function getMonthGrid(date: Date) {
  const firstDay = startOfMonth(date).getDay()
  const totalDays = daysInMonth(date)
  const days: { day: number; currentMonth: boolean }[] = []
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: 0, currentMonth: false })
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push({ day: i, currentMonth: true })
  }
  return days
}

function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const today = new Date()

const mockedEvents: CalendarEvent[] = [
  {
    id: generateId(),
    title: 'Team Standup',
    date: toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate())),
    time: '09:00',
  },
  {
    id: generateId(),
    title: 'Design Review',
    date: toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
    time: '14:00',
  },
  {
    id: generateId(),
    title: 'Project Launch',
    date: toISODate(new Date(today.getFullYear(), today.getMonth(), 15)),
    time: '10:00',
  },
]

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(today))

  const grid = useMemo(() => getMonthGrid(currentDate), [currentDate])
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of mockedEvents) {
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    }
    return map
  }, [])

  const prevMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }, [])

  const selectedEvents = eventsByDate.get(selectedDate) ?? []

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="flex h-full bg-tahoe-surface text-tahoe-text overflow-hidden" data-testid="calendar-app">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md hover:bg-white/10"
              aria-label="Previous month"
              data-testid="calendar-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-white/10"
              aria-label="Next month"
              data-testid="calendar-next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold" data-testid="calendar-month-year">
            {formatMonthYear(currentDate)}
          </h2>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-tahoe-text-secondary py-2 border-b border-white/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1">
          {grid.map((cell, index) => {
            if (!cell.currentMonth) {
              return <div key={index} className="border-b border-r border-white/5" />
            }
            const dateStr = toISODate(new Date(currentDate.getFullYear(), currentDate.getMonth(), cell.day))
            const hasEvents = eventsByDate.has(dateStr)
            const selected = selectedDate === dateStr
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex flex-col items-center justify-start pt-2 border-b border-r border-white/5 transition-colors ${
                  selected ? 'bg-tahoe-accent/20' : 'hover:bg-white/5'
                }`}
                data-testid={`calendar-day-${cell.day}`}
                aria-pressed={selected}
              >
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                    isToday(cell.day)
                      ? 'bg-tahoe-accent text-white'
                      : ''
                  }`}
                >
                  {cell.day}
                </span>
                {hasEvents && (
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-tahoe-accent" data-testid="calendar-event-dot" />
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="w-64 border-l border-white/10 bg-tahoe-glass/30 p-4" data-testid="calendar-events-panel">
        <h3 className="font-semibold mb-3">
          {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-tahoe-text-secondary" data-testid="calendar-no-events">No events</p>
        ) : (
          <ul className="space-y-2">
            {selectedEvents.map((event) => (
              <li key={event.id} className="text-sm bg-white/5 rounded-md p-2" data-testid="calendar-event-item">
                <div className="font-medium">{event.title}</div>
                {event.time && <div className="text-xs text-tahoe-text-secondary">{event.time}</div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
