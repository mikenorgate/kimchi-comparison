import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Calendar } from './calendar'
import { useCalendarStore } from '../../store/calendar-store'

function resetStore() {
  localStorage.removeItem('tahoe.calendar-events')
  useCalendarStore.getState().reset()
}

describe('Calendar', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders the calendar with header and month grid', () => {
    render(<Calendar windowId="w1" />)
    expect(screen.getByTestId('calendar-root')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-header')).toBeInTheDocument()
    expect(screen.getByTestId('cal-grid')).toBeInTheDocument()
    expect(screen.getByTestId('cal-day-panel')).toBeInTheDocument()
  })

  it('shows the current month and year in the header', () => {
    render(<Calendar windowId="w1" />)
    const now = new Date()
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    expect(screen.getByTestId('cal-month-year')).toHaveTextContent(`${months[now.getMonth()]} ${now.getFullYear()}`)
  })

  it('navigates to the next month', () => {
    render(<Calendar windowId="w1" />)
    const now = new Date()
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1
    const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
    act(() => {
      fireEvent.click(screen.getByTestId('cal-next'))
    })
    expect(screen.getByTestId('cal-month-year')).toHaveTextContent(`${months[nextMonth]} ${nextYear}`)
  })

  it('navigates to the previous month', () => {
    render(<Calendar windowId="w1" />)
    const now = new Date()
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    act(() => {
      fireEvent.click(screen.getByTestId('cal-prev'))
    })
    expect(screen.getByTestId('cal-month-year')).toHaveTextContent(`${months[prevMonth]} ${prevYear}`)
  })

  it('Today button navigates back to the current month', () => {
    render(<Calendar windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('cal-next'))
      fireEvent.click(screen.getByTestId('cal-next'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('cal-today'))
    })
    const now = new Date()
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    expect(screen.getByTestId('cal-month-year')).toHaveTextContent(`${months[now.getMonth()]} ${now.getFullYear()}`)
  })

  it('highlights today with a blue circle', () => {
    render(<Calendar windowId="w1" />)
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const todayCell = screen.getByTestId(`cal-daynum-${todayKey}`)
    expect(todayCell.style.background).toContain('var(--accent-blue)')
    expect(todayCell.style.color).toBe('white')
  })

  it('opens the event editor when + Event is clicked', () => {
    render(<Calendar windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('cal-new-event'))
    })
    expect(screen.getByTestId('event-editor')).toBeInTheDocument()
    expect(screen.getByTestId('event-title-input')).toBeInTheDocument()
  })

  it('creates a new event via the editor', () => {
    render(<Calendar windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('cal-new-event'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('event-title-input'), { target: { value: 'Meeting' } })
      fireEvent.change(screen.getByTestId('event-date-input'), { target: { value: '2025-06-15' } })
      fireEvent.change(screen.getByTestId('event-time-input'), { target: { value: '14:00' } })
      fireEvent.click(screen.getByTestId('event-save'))
    })
    expect(useCalendarStore.getState().events).toHaveLength(1)
    expect(useCalendarStore.getState().events[0].title).toBe('Meeting')
    expect(useCalendarStore.getState().events[0].date).toBe('2025-06-15')
    expect(useCalendarStore.getState().events[0].time).toBe('14:00')
  })

  it('closes the event editor on Cancel', () => {
    render(<Calendar windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('cal-new-event'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('event-cancel'))
    })
    expect(screen.queryByTestId('event-editor')).toBeNull()
  })

  it('closes the event editor on overlay click', () => {
    render(<Calendar windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('cal-new-event'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('event-editor-overlay'))
    })
    expect(screen.queryByTestId('event-editor')).toBeNull()
  })

  it('shows events in the day panel when a day is selected', () => {
    useCalendarStore.getState().addEvent({ title: 'Lunch', date: '2025-06-15', time: '12:00', notes: '', color: '#0a84ff' })
    render(<Calendar windowId="w1" />)
    // Navigate to June 2025 (current date is Aug 2026, so go backwards)
    const now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth()
    while (y > 2025 || (y === 2025 && m > 5)) {
      act(() => { fireEvent.click(screen.getByTestId('cal-prev')) })
      m--
      if (m < 0) { m = 11; y-- }
    }
    act(() => {
      fireEvent.click(screen.getByTestId('cal-day-2025-06-15'))
    })
    expect(screen.getByTestId('cal-event-item-' + useCalendarStore.getState().events[0].id)).toBeInTheDocument()
  })

  it('shows event chips in the month grid', () => {
    const id = useCalendarStore.getState().addEvent({ title: 'Birthday', date: '2025-03-20', time: '10:00', notes: '', color: '#ff453a' })
    render(<Calendar windowId="w1" />)
    // Navigate to March 2025 (go backwards from current month)
    const now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth()
    while (y > 2025 || (y === 2025 && m > 2)) {
      act(() => { fireEvent.click(screen.getByTestId('cal-prev')) })
      m--
      if (m < 0) { m = 11; y-- }
    }
    expect(screen.getByTestId(`cal-event-${id}`)).toHaveTextContent('Birthday')
  })

  it('deletes an event from the day panel', () => {
    const id = useCalendarStore.getState().addEvent({ title: 'ToDelete', date: '2025-06-15', time: '09:00', notes: '', color: '#0a84ff' })
    render(<Calendar windowId="w1" />)
    const now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth()
    while (y > 2025 || (y === 2025 && m > 5)) {
      act(() => { fireEvent.click(screen.getByTestId('cal-prev')) })
      m--
      if (m < 0) { m = 11; y-- }
    }
    act(() => {
      fireEvent.click(screen.getByTestId('cal-day-2025-06-15'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId(`cal-event-delete-${id}`))
    })
    expect(useCalendarStore.getState().events).toHaveLength(0)
  })

  it('edits an existing event via the day panel', () => {
    const id = useCalendarStore.getState().addEvent({ title: 'Original', date: '2025-06-15', time: '09:00', notes: '', color: '#0a84ff' })
    render(<Calendar windowId="w1" />)
    const now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth()
    while (y > 2025 || (y === 2025 && m > 5)) {
      act(() => { fireEvent.click(screen.getByTestId('cal-prev')) })
      m--
      if (m < 0) { m = 11; y-- }
    }
    act(() => {
      fireEvent.click(screen.getByTestId('cal-day-2025-06-15'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId(`cal-event-item-${id}`))
    })
    expect(screen.getByTestId('event-editor')).toBeInTheDocument()
    expect((screen.getByTestId('event-title-input') as HTMLInputElement).value).toBe('Original')
    act(() => {
      fireEvent.change(screen.getByTestId('event-title-input'), { target: { value: 'Updated' } })
      fireEvent.click(screen.getByTestId('event-save'))
    })
    expect(useCalendarStore.getState().getEventsByDate('2025-06-15')[0].title).toBe('Updated')
  })

  it('selects a color for an event', () => {
    render(<Calendar windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('cal-new-event'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('event-color-#ff453a'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('event-title-input'), { target: { value: 'Colored' } })
      fireEvent.click(screen.getByTestId('event-save'))
    })
    expect(useCalendarStore.getState().events[0].color).toBe('#ff453a')
  })

  it('persists events to localStorage', () => {
    useCalendarStore.getState().addEvent({ title: 'Persisted', date: '2025-01-01', time: '08:00', notes: 'note', color: '#30d158' })
    const stored = JSON.parse(localStorage.getItem('tahoe.calendar-events')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Persisted')
  })

  it('shows "No events" when a day with no events is selected', () => {
    render(<Calendar windowId="w1" />)
    // Navigate to a month and click a day
    const now = new Date()
    const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    act(() => {
      fireEvent.click(screen.getByTestId(`cal-day-${dayKey}`))
    })
    expect(screen.getByTestId('cal-no-events')).toBeInTheDocument()
  })

  it('renders day-of-week headers', () => {
    render(<Calendar windowId="w1" />)
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('Wed')).toBeInTheDocument()
    expect(screen.getByText('Thu')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })
})
