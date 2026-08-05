import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const monthLabel = new Date(year, month, 1).toLocaleDateString([], { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(year, month)
  const startOffset = getFirstDayOfMonth(year, month)
  const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7
  const cells = Array.from({ length: totalCells }, (_, i) => i - startOffset + 1)

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <div data-testid="calendar-app" style={{ padding: 'var(--space-lg)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <button type="button" data-testid="cal-prev" onClick={prevMonth} style={{ padding: 'var(--space-sm)', border: 'none', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>‹</button>
        <div data-testid="cal-month" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}>{monthLabel}</div>
        <button type="button" data-testid="cal-next" onClick={nextMonth} style={{ padding: 'var(--space-sm)', border: 'none', background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
        {DAYS.map((day) => (
          <div key={day} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', padding: 'var(--space-sm)' }}>{day}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, flex: 1 }}>
        {cells.map((day, index) => {
          const isValid = day >= 1 && day <= daysInMonth
          const date = isValid ? new Date(year, month, day) : null
          const isToday = date ? isSameDay(date, today) : false
          return (
            <div
              key={index}
              data-testid={isValid ? `cal-day-${day}` : `cal-empty-${index}`}
              style={{
                padding: 'var(--space-sm)',
                borderRadius: 'var(--radius-md)',
                background: isToday ? 'var(--color-accent)' : 'transparent',
                color: isToday ? '#fff' : isValid ? 'var(--color-text)' : 'transparent',
                fontSize: 'var(--text-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isValid ? day : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar
