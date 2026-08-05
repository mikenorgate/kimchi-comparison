import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Clock, formatTime, formatCityTime, WORLD_CITIES } from './Clock'

describe('Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders current time and world cities', () => {
    render(<Clock />)
    expect(screen.getByTestId('clock-time')).toBeInTheDocument()
    WORLD_CITIES.forEach((city) => {
      expect(screen.getByTestId(`clock-city-${city.id}`)).toBeInTheDocument()
    })
  })

  it('updates time every second', async () => {
    const initial = new Date('2026-08-05T12:00:00')
    vi.setSystemTime(initial)
    render(<Clock />)
    const time = screen.getByTestId('clock-time')
    const first = time.textContent
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })
    await waitFor(() => expect(time.textContent).not.toBe(first))
  })

  it('formatTime formats a date', () => {
    const date = new Date('2026-08-05T14:30:45')
    expect(formatTime(date)).toContain('30')
    expect(formatTime(date)).toContain('45')
  })

  it('formatCityTime respects time zone', () => {
    const date = new Date('2026-08-05T12:00:00Z')
    const local = formatCityTime(date, 'America/Los_Angeles')
    const tokyo = formatCityTime(date, 'Asia/Tokyo')
    expect(local).not.toBe(tokyo)
  })
})
