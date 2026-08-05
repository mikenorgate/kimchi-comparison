import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Calendar, getDaysInMonth, getFirstDayOfMonth, isSameDay } from './Calendar'

describe('Calendar', () => {
  it('renders the current month and grid', () => {
    render(<Calendar />)
    const today = new Date()
    const label = new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString([], { month: 'long', year: 'numeric' })
    expect(screen.getByTestId('cal-month')).toHaveTextContent(label)
    expect(screen.getByTestId('cal-day-1')).toBeInTheDocument()
  })

  it('highlights today', () => {
    render(<Calendar />)
    const today = new Date()
    const todayCell = screen.getByTestId(`cal-day-${today.getDate()}`)
    expect(todayCell).toHaveStyle({ background: 'var(--color-accent)' })
  })

  it('navigates to previous month', () => {
    render(<Calendar />)
    const initial = screen.getByTestId('cal-month').textContent
    fireEvent.click(screen.getByTestId('cal-prev'))
    expect(screen.getByTestId('cal-month').textContent).not.toBe(initial)
  })

  it('navigates to next month', () => {
    render(<Calendar />)
    const initial = screen.getByTestId('cal-month').textContent
    fireEvent.click(screen.getByTestId('cal-next'))
    expect(screen.getByTestId('cal-month').textContent).not.toBe(initial)
  })

  it('getDaysInMonth returns correct count', () => {
    expect(getDaysInMonth(2026, 7)).toBe(31)
    expect(getDaysInMonth(2026, 1)).toBe(28)
  })

  it('getFirstDayOfMonth returns correct weekday', () => {
    expect(getFirstDayOfMonth(2026, 7)).toBe(6)
  })

  it('isSameDay compares dates correctly', () => {
    const a = new Date('2026-08-05')
    const b = new Date('2026-08-05T12:00:00')
    const c = new Date('2026-08-06')
    expect(isSameDay(a, b)).toBe(true)
    expect(isSameDay(a, c)).toBe(false)
  })
})
