import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import MenuBar from '../components/MenuBar'
import { WindowManagerProvider } from '../WindowManager'

afterEach(() => cleanup())

function renderMenuBar() {
  return render(
    <WindowManagerProvider>
      <MenuBar />
    </WindowManagerProvider>
  )
}

describe('MenuBar component', () => {
  it('renders the menu bar with glass class', () => {
    renderMenuBar()
    const menuBar = screen.getByTestId('menu-bar')
    expect(menuBar).toBeInTheDocument()
    expect(menuBar.className).toContain('glass')
  })

  it('renders the clock with a non-placeholder time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 15, 10, 30, 0))
    renderMenuBar()
    const clock = screen.getByTestId('menu-bar-clock')
    expect(clock.textContent).toContain('10:30')
    vi.useRealTimers()
  })

  it('updates the clock every second', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 0, 15, 10, 30, 0))
    renderMenuBar()
    expect(screen.getByTestId('menu-bar-clock').textContent).toContain('10:30')
    // Advance past a minute boundary — the interval fires and setTime updates the clock
    vi.setSystemTime(new Date(2025, 0, 15, 10, 31, 0))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    // Clock must now show 10:31, proving the interval actually fired
    expect(screen.getByTestId('menu-bar-clock').textContent).toContain('10:31')
    vi.useRealTimers()
  })

  it('Apple menu dropdown is closed initially', () => {
    renderMenuBar()
    expect(screen.queryByTestId('apple-menu-dropdown')).not.toBeInTheDocument()
  })

  it('opens Apple menu dropdown on click', () => {
    renderMenuBar()
    const button = screen.getByTestId('apple-menu-button')
    fireEvent.click(button)
    const dropdown = screen.getByTestId('apple-menu-dropdown')
    expect(dropdown).toBeInTheDocument()
    // Verify Sleep, Restart, Shut Down, Lock Screen items are present
    expect(screen.getByTestId('apple-menu-item-sleep')).toBeInTheDocument()
    expect(screen.getByTestId('apple-menu-item-restart')).toBeInTheDocument()
    expect(screen.getByTestId('apple-menu-item-shut-down')).toBeInTheDocument()
    expect(screen.getByTestId('apple-menu-item-lock-screen')).toBeInTheDocument()
  })

  it('closes Apple menu dropdown on second click', () => {
    renderMenuBar()
    const button = screen.getByTestId('apple-menu-button')
    fireEvent.click(button)
    expect(screen.getByTestId('apple-menu-dropdown')).toBeInTheDocument()
    fireEvent.click(button)
    expect(screen.queryByTestId('apple-menu-dropdown')).not.toBeInTheDocument()
  })

  it('closes Apple menu dropdown when clicking outside', () => {
    render(
      <WindowManagerProvider>
        <div>
          <MenuBar />
          <div data-testid="outside" />
        </div>
      </WindowManagerProvider>
    )
    const button = screen.getByTestId('apple-menu-button')
    fireEvent.click(button)
    expect(screen.getByTestId('apple-menu-dropdown')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByTestId('apple-menu-dropdown')).not.toBeInTheDocument()
  })

  it('renders battery, Wi-Fi, and Control Center status icons', () => {
    renderMenuBar()
    expect(screen.getByTestId('battery-icon')).toBeInTheDocument()
    expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
    expect(screen.getByTestId('control-center-button')).toBeInTheDocument()
  })
})
