import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ControlCenter } from './control-center'
import { useUIStore } from '../store/ui-store'
import { useSystemStore } from '../store/system-store'
import { useThemeStore } from '../store/theme-store'

function resetStores() {
  useUIStore.setState({ spotlightOpen: false, controlCenterOpen: false, notificationCenterOpen: false, missionControlOpen: false })
  useSystemStore.setState({ wifi: true, bluetooth: true, airdrop: false, brightness: 80, volume: 60, doNotDisturb: false })
  useThemeStore.setState({ mode: 'light', accent: '#0a84ff' })
}

describe('ControlCenter', () => {
  beforeEach(() => {
    resetStores()
    localStorage.clear()
  })

  it('does not render when controlCenterOpen is false', () => {
    render(<ControlCenter />)
    expect(screen.queryByTestId('control-center-panel')).toBeNull()
  })

  it('renders the glass panel when controlCenterOpen is true', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument()
    expect(screen.getByTestId('control-center-panel').className).toContain('glass-panel')
  })

  it('closes when clicking the backdrop', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    act(() => {
      fireEvent.click(screen.getByTestId('control-center-backdrop'))
    })
    expect(useUIStore.getState().controlCenterOpen).toBe(false)
  })

  it('toggles wifi on click', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    expect(useSystemStore.getState().wifi).toBe(true)
    act(() => {
      fireEvent.click(screen.getByTestId('cc-wifi'))
    })
    expect(useSystemStore.getState().wifi).toBe(false)
    act(() => {
      fireEvent.click(screen.getByTestId('cc-wifi'))
    })
    expect(useSystemStore.getState().wifi).toBe(true)
  })

  it('toggles bluetooth on click', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    expect(useSystemStore.getState().bluetooth).toBe(true)
    act(() => {
      fireEvent.click(screen.getByTestId('cc-bluetooth'))
    })
    expect(useSystemStore.getState().bluetooth).toBe(false)
  })

  it('toggles airdrop on click', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    expect(useSystemStore.getState().airdrop).toBe(false)
    act(() => {
      fireEvent.click(screen.getByTestId('cc-airdrop'))
    })
    expect(useSystemStore.getState().airdrop).toBe(true)
  })

  it('toggles dark mode on click — flips theme live', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    expect(useThemeStore.getState().mode).toBe('light')
    act(() => {
      fireEvent.click(screen.getByTestId('cc-darkmode'))
    })
    expect(useThemeStore.getState().mode).toBe('dark')
    act(() => {
      fireEvent.click(screen.getByTestId('cc-darkmode'))
    })
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('has a brightness slider that updates the system store', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    const slider = screen.getByTestId('cc-brightness-slider')
    expect(slider).toHaveAttribute('value', '80')
    act(() => {
      fireEvent.change(slider, { target: { value: '50' } })
    })
    expect(useSystemStore.getState().brightness).toBe(50)
  })

  it('has a volume slider that updates the system store', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    const slider = screen.getByTestId('cc-volume-slider')
    expect(slider).toHaveAttribute('value', '60')
    act(() => {
      fireEvent.change(slider, { target: { value: '30' } })
    })
    expect(useSystemStore.getState().volume).toBe(30)
  })

  it('persists brightness change to localStorage', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    act(() => {
      fireEvent.change(screen.getByTestId('cc-brightness-slider'), { target: { value: '42' } })
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.system-settings')!)
    expect(stored.brightness).toBe(42)
  })

  it('persists volume change to localStorage', () => {
    useUIStore.setState({ controlCenterOpen: true })
    render(<ControlCenter />)
    act(() => {
      fireEvent.change(screen.getByTestId('cc-volume-slider'), { target: { value: '15' } })
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.system-settings')!)
    expect(stored.volume).toBe(15)
  })

  it('reflects wifi state in toggle label and active styling', () => {
    useUIStore.setState({ controlCenterOpen: true })
    useSystemStore.setState({ wifi: false })
    const { rerender } = render(<ControlCenter />)
    const tile = screen.getByTestId('cc-wifi')
    expect(tile).toHaveTextContent('Wi-Fi Off')
    rerender(<ControlCenter />)
    expect(tile.style.background).not.toContain('var(--accent-blue)')
  })
})
