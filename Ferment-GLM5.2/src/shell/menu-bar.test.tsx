import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MenuBar } from './menu-bar'
import { useWindowStore } from '../store/window-store'
import { registerApp, clearRegistry, type AppDefinition } from '../store/app-registry'
import { useSystemStore } from '../store/system-store'
import { useUIStore } from '../store/ui-store'

function resetStores() {
  useWindowStore.setState({ windows: [], focusedId: null, topZ: 10 })
  useSystemStore.setState({
    wifi: true, bluetooth: true, airdrop: false,
    brightness: 80, volume: 60, doNotDisturb: false,
  })
  useUIStore.setState({
    spotlightOpen: false, controlCenterOpen: false,
    notificationCenterOpen: false, missionControlOpen: false,
  })
}

const TestApp: AppDefinition = {
  id: 'test-app',
  name: 'TestApp',
  icon: 'finder',
  component: () => <div>content</div>,
  menus: [
    { label: 'File', items: [{ label: 'New File', shortcut: '⌘N' }, { label: 'Open…', shortcut: '⌘O' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
  ],
}

describe('MenuBar', () => {
  beforeEach(() => {
    resetStores()
    clearRegistry()
    registerApp(TestApp)
  })

  it('renders the transparent menu bar with backdrop-filter', () => {
    render(<MenuBar />)
    const bar = screen.getByTestId('menu-bar')
    expect(bar).toBeInTheDocument()
    expect(bar.style.backdropFilter).toContain('blur')
  })

  it('renders the Apple logo', () => {
    render(<MenuBar />)
    expect(screen.getByTestId('apple-logo')).toBeInTheDocument()
  })

  it('shows Finder as the active app name when no window is focused', () => {
    render(<MenuBar />)
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('Finder')
  })

  it('shows the focused app name when a window is open', () => {
    useWindowStore.getState().openWindow('test-app', 'TestApp')
    render(<MenuBar />)
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('TestApp')
  })

  it('shows default app menus (File/Edit/View/Window/Help) when no app is focused', () => {
    render(<MenuBar />)
    expect(screen.getByTestId('menubutton-file')).toBeInTheDocument()
    expect(screen.getByTestId('menubutton-edit')).toBeInTheDocument()
    expect(screen.getByTestId('menubutton-view')).toBeInTheDocument()
    expect(screen.getByTestId('menubutton-window')).toBeInTheDocument()
    expect(screen.getByTestId('menubutton-help')).toBeInTheDocument()
  })

  it('shows the focused app custom menus when an app window is focused', () => {
    useWindowStore.getState().openWindow('test-app', 'TestApp')
    render(<MenuBar />)
    expect(screen.getByTestId('menubutton-file')).toBeInTheDocument()
    expect(screen.getByTestId('menubutton-edit')).toBeInTheDocument()
    // Default View/Window/Help should not appear (app defines only File/Edit)
    expect(screen.queryByTestId('menubutton-view')).toBeNull()
  })

  it('opens the Apple menu on click', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    expect(screen.getByTestId('dropdown-apple')).toBeInTheDocument()
    expect(screen.getByTestId('menuitem-apple-About This Mac')).toBeInTheDocument()
    expect(screen.getByTestId('menuitem-apple-System Settings…')).toBeInTheDocument()
    expect(screen.getByTestId('menuitem-apple-Sleep')).toBeInTheDocument()
    expect(screen.getByTestId('menuitem-apple-Restart…')).toBeInTheDocument()
    expect(screen.getByTestId('menuitem-apple-Shut Down…')).toBeInTheDocument()
  })

  it('opens a per-app menu (File) on click and shows its items', () => {
    useWindowStore.getState().openWindow('test-app', 'TestApp')
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-file'))
    })
    expect(screen.getByTestId('dropdown-file')).toBeInTheDocument()
    expect(screen.getByTestId('menuitem-file-New File')).toBeInTheDocument()
    expect(screen.getByTestId('menuitem-file-Open…')).toBeInTheDocument()
  })

  it('closes an open menu when clicking the same button again (toggle)', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    expect(screen.getByTestId('dropdown-apple')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    expect(screen.queryByTestId('dropdown-apple')).toBeNull()
  })

  it('closes an open menu when clicking a different menu button', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    expect(screen.getByTestId('dropdown-apple')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-file'))
    })
    expect(screen.queryByTestId('dropdown-apple')).toBeNull()
    expect(screen.getByTestId('dropdown-file')).toBeInTheDocument()
  })

  it('closes the menu when clicking outside', () => {
    render(
      <div>
        <MenuBar />
        <div data-testid="outside">outside</div>
      </div>
    )
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    expect(screen.getByTestId('dropdown-apple')).toBeInTheDocument()
    act(() => {
      fireEvent.mouseDown(screen.getByTestId('outside'))
    })
    expect(screen.queryByTestId('dropdown-apple')).toBeNull()
  })

  it('closes the menu on Escape key', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    expect(screen.getByTestId('dropdown-apple')).toBeInTheDocument()
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' })
    })
    expect(screen.queryByTestId('dropdown-apple')).toBeNull()
  })

  it('closes the menu after clicking a menu item', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('menuitem-apple-About This Mac'))
    })
    expect(screen.queryByTestId('dropdown-apple')).toBeNull()
  })

  it('renders separators as dividers (not clickable buttons)', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('menubutton-apple'))
    })
    // System Settings… has separator=true, so the divider line should exist
    const dropdown = screen.getByTestId('dropdown-apple')
    const dividers = dropdown.querySelectorAll('div[style*="height: 1px"]')
    expect(dividers.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the system tray with battery, wifi, bluetooth icons', () => {
    render(<MenuBar />)
    expect(screen.getByTestId('tray-battery')).toBeInTheDocument()
    expect(screen.getByTestId('tray-wifi')).toBeInTheDocument()
    expect(screen.getByTestId('tray-bluetooth')).toBeInTheDocument()
  })

  it('dims the wifi icon when wifi is off', () => {
    useSystemStore.getState().setWifi(false)
    render(<MenuBar />)
    const wifi = screen.getByTestId('tray-wifi')
    const svg = wifi.querySelector('svg')
    expect(svg?.getAttribute('opacity')).toBe('0.3')
  })

  it('dims the bluetooth icon when bluetooth is off', () => {
    useSystemStore.getState().setBluetooth(false)
    render(<MenuBar />)
    const bt = screen.getByTestId('tray-bluetooth')
    const svg = bt.querySelector('svg')
    expect(svg?.getAttribute('opacity')).toBe('0.3')
  })

  it('renders the Spotlight search button in the tray', () => {
    render(<MenuBar />)
    expect(screen.getByTestId('tray-spotlight')).toBeInTheDocument()
  })

  it('opens Spotlight UI when the search button is clicked', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('tray-spotlight'))
    })
    expect(useUIStore.getState().spotlightOpen).toBe(true)
  })

  it('renders the Control Center button in the tray', () => {
    render(<MenuBar />)
    expect(screen.getByTestId('tray-control-center')).toBeInTheDocument()
  })

  it('opens Control Center when the button is clicked', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('tray-control-center'))
    })
    expect(useUIStore.getState().controlCenterOpen).toBe(true)
  })

  it('renders the clock with live date and time', () => {
    render(<MenuBar />)
    const date = screen.getByTestId('menu-date')
    const time = screen.getByTestId('menu-time')
    expect(date.textContent).toBeTruthy()
    expect(date.textContent).toMatch(/^[A-Z][a-z]{2} [A-Z][a-z]{2} \d+$/)
    expect(time.textContent).toMatch(/^\d{1,2}:\d{2} [AP]M$/)
  })

  it('opens Notification Center when the clock is clicked', () => {
    render(<MenuBar />)
    act(() => {
      fireEvent.click(screen.getByTestId('tray-clock'))
    })
    expect(useUIStore.getState().notificationCenterOpen).toBe(true)
  })

  it('updates the active app name when focus changes between windows', () => {
    const SecondApp: AppDefinition = {
      id: 'second-app',
      name: 'SecondApp',
      icon: 'notes',
      component: () => <div />,
    }
    registerApp(SecondApp)
    const id1 = useWindowStore.getState().openWindow('test-app', 'TestApp')
    useWindowStore.getState().openWindow('second-app', 'SecondApp')
    render(<MenuBar />)
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('SecondApp')
    // Focus the first window
    act(() => {
      useWindowStore.getState().focusWindow(id1)
    })
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('TestApp')
  })
})
