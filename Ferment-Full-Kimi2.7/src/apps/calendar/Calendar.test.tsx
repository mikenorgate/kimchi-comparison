import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Calendar } from './Calendar'

describe('Calendar', () => {
  beforeEach(() => {
    render(<Calendar />)
  })

  it('renders the current month and weekday headers', () => {
    expect(screen.getByTestId('calendar-month-year')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-app')).toBeInTheDocument()
  })

  it('navigates to the next month', async () => {
    const monthYear = screen.getByTestId('calendar-month-year')
    const initial = monthYear.textContent
    await userEvent.click(screen.getByTestId('calendar-next'))
    expect(monthYear.textContent).not.toBe(initial)
  })

  it('navigates to the previous month', async () => {
    const monthYear = screen.getByTestId('calendar-month-year')
    const initial = monthYear.textContent
    await userEvent.click(screen.getByTestId('calendar-prev'))
    expect(monthYear.textContent).not.toBe(initial)
  })

  it('highlights today and shows event dots', () => {
    const today = new Date().getDate()
    expect(screen.getByTestId(`calendar-day-${today}`)).toBeInTheDocument()
    expect(screen.getAllByTestId('calendar-event-dot').length).toBeGreaterThanOrEqual(1)
  })

  it('selects a day and shows events for that day', async () => {
    const dayButton = screen.getByTestId('calendar-day-15')
    await userEvent.click(dayButton)
    expect(dayButton.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Project Launch')).toBeInTheDocument()
  })

  it('shows "No events" when a day without events is selected', async () => {
    const dayButton = screen.getByTestId('calendar-day-1')
    await userEvent.click(dayButton)
    expect(screen.getByTestId('calendar-no-events')).toBeInTheDocument()
  })
})
