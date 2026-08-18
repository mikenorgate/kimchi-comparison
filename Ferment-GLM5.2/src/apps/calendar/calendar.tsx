import { useState, useMemo, useCallback } from 'react'
import { useCalendarStore, type CalendarEvent } from '../../store/calendar-store'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const EVENT_COLORS = ['#ff453a', '#0a84ff', '#30d158', '#ffd60a', '#bf5af2', '#ff9f0a']

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function todayKey(): string {
  const d = new Date()
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

export function Calendar({ windowId: _windowId }: { windowId: string }) {
  const { events, addEvent, updateEvent, deleteEvent, getEventsByDate } = useCalendarStore()
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const todayK = todayKey()

  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const startDow = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: { date: string | null; day: number | null }[] = []
    for (let i = 0; i < startDow; i++) cells.push({ date: null, day: null })
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: dateKey(year, month, d), day: d })
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, day: null })
    return cells
  }, [year, month])

  const eventsForSelected = useMemo(
    () => (selectedDate ? getEventsByDate(selectedDate).sort((a, b) => a.time.localeCompare(b.time)) : []),
    [selectedDate, events]
  )

  const prevMonth = useCallback(() => {
    setViewDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }, [year, month])

  const nextMonth = useCallback(() => {
    setViewDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }, [year, month])

  const goToday = useCallback(() => {
    setViewDate(new Date())
    setSelectedDate(todayK)
  }, [todayK])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setShowEditor(true)
  }, [])

  const handleEditEvent = useCallback((ev: CalendarEvent) => {
    setEditingEvent(ev)
    setShowEditor(true)
  }, [])

  const handleSaveEvent = useCallback(
    (title: string, date: string, time: string, notes: string, color: string) => {
      if (editingEvent) {
        updateEvent(editingEvent.id, { title, date, time, notes, color })
      } else {
        addEvent({ title, date, time, notes, color })
      }
      setShowEditor(false)
      setEditingEvent(null)
    },
    [editingEvent, addEvent, updateEvent]
  )

  return (
    <div data-testid="calendar-root" style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>
      {/* Header */}
      <div data-testid="calendar-header" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '0.5px solid var(--glass-border)' }}>
        <button data-testid="cal-prev" onClick={prevMonth} style={hdrBtn}>‹</button>
        <h2 data-testid="cal-month-year" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0, minWidth: 160, textAlign: 'center' }}>
          {MONTHS[month]} {year}
        </h2>
        <button data-testid="cal-next" onClick={nextMonth} style={hdrBtn}>›</button>
        <button data-testid="cal-today" onClick={goToday} style={{ ...hdrBtn, fontSize: 12 }}>Today</button>
        <div style={{ flex: 1 }} />
        <button data-testid="cal-new-event" onClick={handleNewEvent} style={{ ...hdrBtn, background: 'var(--accent-blue)', color: 'white', fontSize: 12 }}>+ Event</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Month grid */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* DOW header */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid var(--glass-border)' }}>
            {DOW.map((d) => (
              <div key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>
          {/* Grid cells */}
          <div data-testid="cal-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '1fr' }}>
            {grid.map((cell, i) => {
              if (!cell.date) return <div key={i} style={{ borderRight: '0.5px solid var(--glass-border)', borderBottom: '0.5px solid var(--glass-border)' }} />
              const cellEvents = getEventsByDate(cell.date)
              const isToday = cell.date === todayK
              const isSelected = cell.date === selectedDate
              return (
                <div
                  key={i}
                  data-testid={`cal-day-${cell.date}`}
                  onClick={() => setSelectedDate(cell.date)}
                  style={{
                    borderRight: '0.5px solid var(--glass-border)',
                    borderBottom: '0.5px solid var(--glass-border)',
                    padding: '2px 4px',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(10,132,255,0.12)' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    data-testid={`cal-daynum-${cell.date}`}
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? 'white' : 'var(--text-primary)',
                      background: isToday ? 'var(--accent-blue)' : 'transparent',
                      borderRadius: '50%',
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {cell.day}
                  </span>
                  {cellEvents.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      data-testid={`cal-event-${ev.id}`}
                      style={{
                        fontSize: 10,
                        color: 'white',
                        background: ev.color,
                        borderRadius: 3,
                        padding: '1px 4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel — selected day events */}
        <div data-testid="cal-day-panel" style={{ width: 220, borderLeft: '0.5px solid var(--glass-border)', padding: 8, overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a day'}
          </div>
          {selectedDate && eventsForSelected.length === 0 && (
            <div data-testid="cal-no-events" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No events</div>
          )}
          {eventsForSelected.map((ev) => (
            <div
              key={ev.id}
              data-testid={`cal-event-item-${ev.id}`}
              onClick={() => handleEditEvent(ev)}
              style={{
                display: 'flex',
                gap: 6,
                padding: '4px 6px',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 4,
                background: 'var(--glass-bg)',
              }}
            >
              <div style={{ width: 4, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{ev.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ev.time}</div>
              </div>
              <button
                data-testid={`cal-event-delete-${ev.id}`}
                onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id) }}
                style={{ border: 'none', background: 'transparent', color: '#ff5f57', cursor: 'pointer', fontSize: 14, marginLeft: 'auto' }}
              >✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Event editor modal */}
      {showEditor && (
        <EventEditor
          event={editingEvent}
          defaultDate={selectedDate ?? todayK}
          onSave={handleSaveEvent}
          onCancel={() => { setShowEditor(false); setEditingEvent(null) }}
        />
      )}
    </div>
  )
}

const hdrBtn: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 18,
  padding: '2px 8px',
  borderRadius: 4,
}

function EventEditor({
  event,
  defaultDate,
  onSave,
  onCancel,
}: {
  event: CalendarEvent | null
  defaultDate: string
  onSave: (title: string, date: string, time: string, notes: string, color: string) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(event?.date ?? defaultDate)
  const [time, setTime] = useState(event?.time ?? '09:00')
  const [notes, setNotes] = useState(event?.notes ?? '')
  const [color, setColor] = useState(event?.color ?? EVENT_COLORS[1])

  return (
    <div
      data-testid="event-editor-overlay"
      onClick={onCancel}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        data-testid="event-editor"
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 320, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <input
          data-testid="event-title-input"
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          style={inputStyle}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
            Date
            <input data-testid="event-date-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
            Time
            <input data-testid="event-time-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
          </label>
        </div>
        <textarea
          data-testid="event-notes-input"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {EVENT_COLORS.map((c) => (
            <button
              key={c}
              data-testid={`event-color-${c}`}
              onClick={() => setColor(c)}
              style={{
                width: 24, height: 24, borderRadius: '50%', border: color === c ? '2px solid white' : '2px solid transparent', background: c, cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button data-testid="event-cancel" onClick={onCancel} style={{ ...hdrBtn, fontSize: 13 }}>Cancel</button>
          <button
            data-testid="event-save"
            onClick={() => onSave(title || 'Untitled', date, time, notes, color)}
            style={{ ...hdrBtn, fontSize: 13, background: 'var(--accent-blue)', color: 'white', padding: '4px 12px' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  border: '0.5px solid var(--glass-border)',
  borderRadius: 6,
  background: 'var(--glass-bg)',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
}
