import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Clock } from './clock'

function resetCities() {
  localStorage.removeItem('tahoe.clock-cities')
}

describe('Clock', () => {
  beforeEach(() => {
    resetCities()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the clock root with 3 tabs', () => {
    render(<Clock windowId="w1" />)
    expect(screen.getByTestId('clock-root')).toBeInTheDocument()
    expect(screen.getByTestId('clock-tab-world')).toBeInTheDocument()
    expect(screen.getByTestId('clock-tab-stopwatch')).toBeInTheDocument()
    expect(screen.getByTestId('clock-tab-timer')).toBeInTheDocument()
  })

  it('defaults to World Clock tab', () => {
    render(<Clock windowId="w1" />)
    expect(screen.getByTestId('world-clock-tab')).toBeInTheDocument()
  })

  it('shows default cities in World Clock', () => {
    render(<Clock windowId="w1" />)
    expect(screen.getByTestId('city-cupertino')).toBeInTheDocument()
    expect(screen.getByTestId('city-newyork')).toBeInTheDocument()
    expect(screen.getByTestId('city-london')).toBeInTheDocument()
    expect(screen.getByTestId('city-tokyo')).toBeInTheDocument()
  })

  it('displays time for each city', () => {
    render(<Clock windowId="w1" />)
    const time = screen.getByTestId('city-time-cupertino')
    expect(time.textContent).toMatch(/\d+:\d+:\d+ (AM|PM)/)
  })

  it('removes a city when remove button is clicked', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-remove-tokyo'))
    })
    expect(screen.queryByTestId('city-tokyo')).toBeNull()
  })

  it('persists city list to localStorage', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-remove-london'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.clock-cities')!)
    expect(stored).toHaveLength(3)
    expect(stored.some((c: { id: string }) => c.id === 'london')).toBe(false)
  })

  it('adds a city from the available list', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-add-btn'))
    })
    expect(screen.getByTestId('city-add-list')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('city-add-paris'))
    })
    expect(screen.getByTestId('city-paris')).toBeInTheDocument()
  })

  it('does not show already-added cities in add list', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('city-add-btn'))
    })
    expect(screen.queryByTestId('city-add-cupertino')).toBeNull()
  })

  it('switches to Stopwatch tab', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-stopwatch'))
    })
    expect(screen.getByTestId('stopwatch-tab')).toBeInTheDocument()
    expect(screen.getByTestId('stopwatch-display')).toBeInTheDocument()
  })

  it('stopwatch starts at 00:00.00', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-stopwatch'))
    })
    expect(screen.getByTestId('stopwatch-display')).toHaveTextContent('00:00.00')
  })

  it('stopwatch Start button starts the timer', () => {
    render(<Clock windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('clock-tab-stopwatch')) })
    act(() => { fireEvent.click(screen.getByTestId('sw-toggle')) })
    act(() => { vi.advanceTimersByTime(1000) })
    const display = screen.getByTestId('stopwatch-display').textContent
    expect(display).not.toBe('00:00.00')
  })

  it('stopwatch Stop button stops the timer', () => {
    render(<Clock windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('clock-tab-stopwatch')) })
    act(() => { fireEvent.click(screen.getByTestId('sw-toggle')) })
    act(() => { vi.advanceTimersByTime(1000) })
    const stoppedAt = screen.getByTestId('stopwatch-display').textContent
    act(() => { fireEvent.click(screen.getByTestId('sw-toggle')) })
    act(() => { vi.advanceTimersByTime(2000) })
    expect(screen.getByTestId('stopwatch-display').textContent).toBe(stoppedAt)
  })

  it('stopwatch records laps', () => {
    render(<Clock windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('clock-tab-stopwatch')) })
    act(() => { fireEvent.click(screen.getByTestId('sw-toggle')) })
    act(() => { vi.advanceTimersByTime(500) })
    act(() => { fireEvent.click(screen.getByTestId('sw-lap')) })
    expect(screen.getByTestId('sw-lap-0')).toBeInTheDocument()
    expect(screen.getByTestId('sw-lap-0')).toHaveTextContent('Lap 1')
  })

  it('stopwatch Reset clears time and laps', () => {
    render(<Clock windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('clock-tab-stopwatch')) })
    act(() => { fireEvent.click(screen.getByTestId('sw-toggle')) })
    act(() => { vi.advanceTimersByTime(500) })
    act(() => { fireEvent.click(screen.getByTestId('sw-lap')) })
    act(() => { fireEvent.click(screen.getByTestId('sw-reset')) })
    expect(screen.getByTestId('stopwatch-display')).toHaveTextContent('00:00.00')
    expect(screen.queryByTestId('sw-lap-0')).toBeNull()
  })

  it('switches to Timer tab', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-timer'))
    })
    expect(screen.getByTestId('timer-tab')).toBeInTheDocument()
    expect(screen.getByTestId('timer-inputs')).toBeInTheDocument()
  })

  it('timer has hours, minutes, seconds inputs', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-timer'))
    })
    expect(screen.getByTestId('timer-hours')).toBeInTheDocument()
    expect(screen.getByTestId('timer-minutes')).toBeInTheDocument()
    expect(screen.getByTestId('timer-seconds')).toBeInTheDocument()
  })

  it('timer Start begins the countdown', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-timer'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('timer-minutes'), { target: { value: 1 } })
      fireEvent.change(screen.getByTestId('timer-seconds'), { target: { value: 0 } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('timer-start'))
    })
    expect(screen.queryByTestId('timer-inputs')).toBeNull()
    expect(screen.getByTestId('timer-display')).toBeInTheDocument()
  })

  it('timer counts down and shows alarm when finished', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-timer'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('timer-minutes'), { target: { value: 0 } })
      fireEvent.change(screen.getByTestId('timer-seconds'), { target: { value: 3 } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('timer-start'))
    })
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.getByTestId('timer-alarm')).toBeInTheDocument()
  })

  it('timer Reset returns to input mode', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-timer'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('timer-seconds'), { target: { value: 5 } })
      fireEvent.click(screen.getByTestId('timer-start'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('timer-reset'))
    })
    expect(screen.getByTestId('timer-inputs')).toBeInTheDocument()
    expect(screen.queryByTestId('timer-display')).toBeNull()
  })

  it('timer Pause stops the countdown', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-timer'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('timer-seconds'), { target: { value: 10 } })
      fireEvent.click(screen.getByTestId('timer-start'))
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    const pausedAt = screen.getByTestId('timer-display').textContent
    act(() => {
      fireEvent.click(screen.getByTestId('timer-pause'))
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByTestId('timer-display').textContent).toBe(pausedAt)
  })

  it('timer Resume continues from paused position', () => {
    render(<Clock windowId="w1" />)
    act(() => { fireEvent.click(screen.getByTestId('clock-tab-timer')) })
    act(() => {
      fireEvent.change(screen.getByTestId('timer-seconds'), { target: { value: 10 } })
      fireEvent.click(screen.getByTestId('timer-start'))
    })
    act(() => {
      vi.advanceTimersByTime(2000)
      fireEvent.click(screen.getByTestId('timer-pause'))
    })
    const pausedAt = screen.getByTestId('timer-display').textContent
    act(() => { fireEvent.click(screen.getByTestId('timer-resume')) })
    act(() => { vi.advanceTimersByTime(3000) })
    // Time should have decreased from the paused position
    const display = screen.getByTestId('timer-display').textContent
    expect(display).not.toBe(pausedAt)
  })

  it('timer Start is disabled when all inputs are zero', () => {
    render(<Clock windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('clock-tab-timer'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('timer-hours'), { target: { value: 0 } })
      fireEvent.change(screen.getByTestId('timer-minutes'), { target: { value: 0 } })
      fireEvent.change(screen.getByTestId('timer-seconds'), { target: { value: 0 } })
    })
    expect((screen.getByTestId('timer-start') as HTMLButtonElement).disabled).toBe(true)
  })
})
