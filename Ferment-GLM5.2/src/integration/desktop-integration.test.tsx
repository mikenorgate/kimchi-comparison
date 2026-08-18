import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from '../App'
import { registerBuiltInApps } from '../builtin-apps'
import { clearRegistry } from '../store/app-registry'
import { useWindowStore } from '../store/window-store'
import { useUIStore } from '../store/ui-store'
import { useThemeStore } from '../store/theme-store'
import { useSystemStore } from '../store/system-store'
import { useNotificationStore } from '../store/notification-store'

function resetAll() {
  useWindowStore.setState({ windows: [], focusedId: null, topZ: 10 })
  useUIStore.setState({ spotlightOpen: false, controlCenterOpen: false, notificationCenterOpen: false, missionControlOpen: false })
  useThemeStore.setState({ mode: 'light', accent: '#0a84ff' })
  useSystemStore.setState({ wifi: true, bluetooth: true, airdrop: false, brightness: 80, volume: 60, doNotDisturb: false })
  useNotificationStore.setState({ notifications: [] })
  localStorage.clear()
  clearRegistry()
  registerBuiltInApps()
}

describe('Desktop integration (App → full shell)', () => {
  beforeEach(() => {
    resetAll()
  })

  it('boots the desktop with wallpaper, menu bar, and Dock rendered', () => {
    render(<App />)
    expect(screen.getByTestId('desktop-wallpaper')).toBeInTheDocument()
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument()
    expect(screen.getByTestId('dock')).toBeInTheDocument()
  })

  it('Dock is non-empty — stub Finder app is registered in production', () => {
    render(<App />)
    expect(screen.getByTestId('dock-item-finder')).toBeInTheDocument()
    expect(screen.getByTestId('app-icon-finder')).toBeInTheDocument()
  })

  it('menu bar shows Finder as active app name (no window focused)', () => {
    render(<App />)
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('Finder')
  })

  it('Spotlight is accessible via Cmd+Space and can launch an app', () => {
    render(<App />)
    // Spotlight should not be visible initially
    expect(screen.queryByTestId('spotlight-overlay')).toBeNull()

    // Open via Cmd+Space
    act(() => {
      fireEvent.keyDown(window, { metaKey: true, code: 'Space' })
    })
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()

    // Search for Finder
    const input = screen.getByTestId('spotlight-input')
    act(() => {
      fireEvent.change(input, { target: { value: 'find' } })
    })
    expect(screen.getByTestId('spotlight-result-finder')).toBeInTheDocument()

    // Launch via Enter
    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' })
    })

    // Spotlight closes and a window opens
    expect(useUIStore.getState().spotlightOpen).toBe(false)
    expect(useWindowStore.getState().windows).toHaveLength(1)
    expect(useWindowStore.getState().windows[0].appId).toBe('finder')
  })

  it('launching an app from the Dock opens a window with traffic lights', () => {
    render(<App />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-finder'))
    })
    const wins = useWindowStore.getState().windows
    expect(wins).toHaveLength(1)
    const winId = wins[0].id
    expect(screen.getByTestId(`window-${winId}`)).toBeInTheDocument()
    expect(screen.getByTestId(`close-${winId}`)).toBeInTheDocument()
    expect(screen.getByTestId(`minimize-${winId}`)).toBeInTheDocument()
    expect(screen.getByTestId(`maximize-${winId}`)).toBeInTheDocument()
  })

  it('Control Center opens and dark-mode toggle flips the theme live', () => {
    render(<App />)
    expect(useThemeStore.getState().mode).toBe('light')

    // Open Control Center
    act(() => {
      fireEvent.click(screen.getByTestId('tray-control-center'))
    })
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument()

    // Toggle dark mode
    act(() => {
      fireEvent.click(screen.getByTestId('cc-darkmode'))
    })
    expect(useThemeStore.getState().mode).toBe('dark')
    expect(screen.getByTestId('cc-darkmode')).toHaveTextContent('Dark')
  })

  it('a notification can appear and be dismissed', () => {
    render(<App />)

    // Push a notification
    useNotificationStore.getState().pushNotification({
      appId: 'finder',
      title: 'Test Notification',
      body: 'This is a test notification',
    })

    // Open Notification Center
    act(() => {
      fireEvent.click(screen.getByTestId('tray-clock'))
    })
    expect(screen.getByTestId('notif-center-panel')).toBeInTheDocument()
    expect(screen.getByText('Test Notification')).toBeInTheDocument()

    // Dismiss it
    const notifId = useNotificationStore.getState().notifications[0].id
    act(() => {
      fireEvent.click(screen.getByTestId(`notif-dismiss-${notifId}`))
    })
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })
})
