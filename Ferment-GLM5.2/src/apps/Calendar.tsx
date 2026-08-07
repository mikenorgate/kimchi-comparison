import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/**
 * Calendar — month view with today highlighted, add/delete events, persisted.
 *
 * Events are keyed by ISO date string (YYYY-MM-DD) and persisted to
 * localStorage ('tahoe.calendar'). The month grid shows leading/trailing
 * days from adjacent months (dimmed), today's cell is highlighted with the
 * accent color, and cells with events show event dots + titles. Clicking a
 * day selects it and shows its events in a side list; events can be added
 * (title + optional time) and deleted.
 */

export interface CalEvent {
  id: string
  title: string
  time?: string
}

const STORAGE_KEY = 'tahoe.calendar'

function uid(): string {
  return 'e' + Math.random().toString(36).slice(2, 10)
}

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Build the 6-week grid (42 cells) for a given month, always Mon-start? — keep Sun-start. */
function buildMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay()) // back up to Sunday
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

function todayISO(): string {
  return toISO(new Date())
}

export function Calendar() {
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [events, setEvents] = usePersistentState<Record<string, CalEvent[]>>(
    STORAGE_KEY,
    { [todayISO()]: [{ id: 'seed-today', title: 'Welcome to Calendar' }] },
  )
  const [selectedISO, setSelectedISO] = useState<string>(todayISO())
  const [draftTitle, setDraftTitle] = useState('')
  const [draftTime, setDraftTime] = useState('')

  const grid = useMemo(
    () => buildMonth(viewYear, viewMonth),
    [viewYear, viewMonth],
  )

  const today = todayISO()
  const selectedEvents = events[selectedISO] ?? []

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const addEvent = () => {
    const title = draftTitle.trim()
    if (!title) return
    const ev: CalEvent = { id: uid(), title, time: draftTime.trim() || undefined }
    setEvents((prev) => ({
      ...prev,
      [selectedISO]: [...(prev[selectedISO] ?? []), ev],
    }))
    setDraftTitle('')
    setDraftTime('')
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => ({
      ...prev,
      [selectedISO]: (prev[selectedISO] ?? []).filter((e) => e.id !== id),
    }))
  }

  return (
    <div data-testid="calendar-content" className="flex h-full text-[13px]">
      {/* Month grid */}
      <div className="flex flex-1 flex-col overflow-hidden p-3">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 data-testid="calendar-month-label" className="text-base font-semibold">
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <div className="flex items-center gap-1">
            <button
              data-testid="calendar-prev"
              onClick={prevMonth}
              className="rounded-md p-1 hover:bg-black/10"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              data-testid="calendar-today"
              onClick={() => {
                setViewYear(now.getFullYear())
                setViewMonth(now.getMonth())
                setSelectedISO(today)
              }}
              className="rounded-md px-2 py-1 hover:bg-black/10"
            >
              Today
            </button>
            <button
              data-testid="calendar-next"
              onClick={nextMonth}
              className="rounded-md p-1 hover:bg-black/10"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-black/10 pb-1 text-center text-[11px] font-medium text-black/50">
          {WEEKDAYS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div data-testid="calendar-grid" className="grid flex-1 grid-cols-7 gap-px">
          {grid.map((d, i) => {
            const iso = toISO(d)
            const inMonth = d.getMonth() === viewMonth
            const isToday = iso === today
            const isSelected = iso === selectedISO
            const dayEvents = events[iso] ?? []
            return (
              <button
                key={i}
                data-testid="calendar-day"
                data-date={iso}
                onClick={() => setSelectedISO(iso)}
                className={`flex flex-col items-start rounded-md border p-1 text-left text-[12px] ${
                  isSelected
                    ? 'border-[var(--accent)]'
                    : 'border-transparent'
                } ${inMonth ? '' : 'text-black/30'} hover:bg-black/5`}
              >
                <span
                  data-testid="calendar-day-num"
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    isToday ? 'bg-[var(--accent)] font-semibold text-white' : ''
                  }`}
                >
                  {d.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-0.5 w-full space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        data-testid="calendar-event-pill"
                        className="truncate rounded bg-[var(--accent)]/20 px-1 text-[9px] text-[var(--accent)]"
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-black/40">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Event list sidebar */}
      <aside className="flex w-56 flex-col border-l border-black/10 bg-black/[0.04] p-3">
        <div className="mb-2 text-xs font-semibold text-black/50">
          {new Date(selectedISO + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div data-testid="calendar-events" className="mb-3 flex-1 space-y-1 overflow-auto">
          {selectedEvents.length === 0 ? (
            <div className="text-black/30">No events.</div>
          ) : (
            selectedEvents.map((e) => (
              <div
                key={e.id}
                data-testid="calendar-event"
                className="group flex items-center justify-between rounded-md bg-white/70 px-2 py-1"
              >
                <div className="truncate">
                  <span data-testid="calendar-event-title">{e.title}</span>
                  {e.time && (
                    <span data-testid="calendar-event-time" className="ml-2 text-[11px] text-black/40">
                      {e.time}
                    </span>
                  )}
                </div>
                <button
                  data-testid="calendar-event-delete"
                  onClick={() => deleteEvent(e.id)}
                  className="opacity-0 group-hover:opacity-100"
                  aria-label="Delete event"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="space-y-1 border-t border-black/10 pt-2">
          <input
            data-testid="calendar-event-title-input"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addEvent() }}
            placeholder="Event title"
            className="w-full rounded-md border border-black/10 px-2 py-1 outline-none focus:border-[var(--accent)]"
          />
          <input
            data-testid="calendar-event-time-input"
            value={draftTime}
            onChange={(e) => setDraftTime(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addEvent() }}
            placeholder="Time (optional)"
            className="w-full rounded-md border border-black/10 px-2 py-1 outline-none focus:border-[var(--accent)]"
          />
          <button
            data-testid="calendar-add"
            onClick={addEvent}
            className="flex w-full items-center justify-center gap-1 rounded-md bg-[var(--accent)] py-1 text-white hover:brightness-105"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
      </aside>
    </div>
  )
}

export default Calendar
