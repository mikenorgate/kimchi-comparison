import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CalendarApp } from './components'

describe('CalendarApp', () => {
  it('renders the month view with day headers', () => {
    render(<CalendarApp />)
    expect(screen.getByTestId('calendar-month-label')).toHaveTextContent('August 2026')
    for (const label of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('renders event dots on scheduled days', () => {
    render(<CalendarApp />)
    const day5 = screen.getByTestId('calendar-day-5')
    expect(day5).toBeInTheDocument()
    expect(day5.querySelectorAll('[data-testid="calendar-event-dot"]')).toHaveLength(2)
  })

  it('navigates to previous and next months', () => {
    render(<CalendarApp />)
    const label = screen.getByTestId('calendar-month-label')
    expect(label).toHaveTextContent('August 2026')

    fireEvent.click(screen.getByTestId('calendar-prev'))
    expect(label).toHaveTextContent('July 2026')

    fireEvent.click(screen.getByTestId('calendar-next'))
    fireEvent.click(screen.getByTestId('calendar-next'))
    expect(label).toHaveTextContent('September 2026')
  })
})
