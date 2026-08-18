import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Calendar from './Calendar'

afterEach(() => cleanup())

describe('Calendar', () => {
  it('renders month grid with weekday headers', () => {
    render(<Calendar />)
    expect(screen.getByTestId('calendar')).toBeInTheDocument()
    expect(screen.getByTestId('cal-month-label')).toBeInTheDocument()
    // Weekday headers
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('navigates to next month', () => {
    render(<Calendar />)
    const initialLabel = screen.getByTestId('cal-month-label').textContent
    fireEvent.click(screen.getByTestId('cal-next'))
    const newLabel = screen.getByTestId('cal-month-label').textContent
    expect(newLabel).not.toBe(initialLabel)
  })

  it('navigates to previous month', () => {
    render(<Calendar />)
    const initialLabel = screen.getByTestId('cal-month-label').textContent
    fireEvent.click(screen.getByTestId('cal-prev'))
    const newLabel = screen.getByTestId('cal-month-label').textContent
    expect(newLabel).not.toBe(initialLabel)
  })

  it('opens event popover when clicking a day', () => {
    render(<Calendar />)
    fireEvent.click(screen.getByTestId('cal-day-15'))
    expect(screen.getByTestId('cal-event-popover')).toBeInTheDocument()
    expect(screen.getByTestId('cal-event-title')).toBeInTheDocument()
  })

  it('adds an event on the 15th and renders it as a pill', () => {
    render(<Calendar />)

    // Click day 15
    fireEvent.click(screen.getByTestId('cal-day-15'))

    // Fill in event details
    fireEvent.change(screen.getByTestId('cal-event-title'), { target: { value: 'Team Meeting' } })
    fireEvent.change(screen.getByTestId('cal-event-time'), { target: { value: '2:00 PM' } })
    fireEvent.click(screen.getByTestId('cal-event-add'))

    // Popover should close
    expect(screen.queryByTestId('cal-event-popover')).not.toBeInTheDocument()

    // Event pill should appear on day 15
    expect(screen.getByTestId('cal-event-15')).toBeInTheDocument()
    expect(screen.getByTestId('cal-event-15').textContent).toBe('Team Meeting')
  })

  it('cancels event creation without adding', () => {
    render(<Calendar />)
    fireEvent.click(screen.getByTestId('cal-day-10'))
    fireEvent.change(screen.getByTestId('cal-event-title'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByTestId('cal-event-cancel'))

    expect(screen.queryByTestId('cal-event-popover')).not.toBeInTheDocument()
    expect(screen.queryByTestId('cal-event-10')).not.toBeInTheDocument()
  })

  it('persists events across month navigation', () => {
    render(<Calendar />)

    // Add event on the 15th
    fireEvent.click(screen.getByTestId('cal-day-15'))
    fireEvent.change(screen.getByTestId('cal-event-title'), { target: { value: 'Birthday' } })
    fireEvent.click(screen.getByTestId('cal-event-add'))

    // Navigate to next month and back
    fireEvent.click(screen.getByTestId('cal-next'))
    expect(screen.queryByTestId('cal-event-15')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('cal-prev'))
    // Event should still be there
    expect(screen.getByTestId('cal-event-15')).toBeInTheDocument()
  })
})
