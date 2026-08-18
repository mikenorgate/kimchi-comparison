import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Dock } from './dock'
import { useWindowStore } from '../store/window-store'
import { registerApp, clearRegistry, type AppDefinition } from '../store/app-registry'

function resetStores() {
  useWindowStore.setState({ windows: [], focusedId: null, topZ: 10 })
}

const App1: AppDefinition = {
  id: 'app-one',
  name: 'App One',
  icon: 'finder',
  component: () => <div />,
  defaultWidth: 600,
  defaultHeight: 400,
}

const App2: AppDefinition = {
  id: 'app-two',
  name: 'App Two',
  icon: 'notes',
  component: () => <div />,
}

describe('Dock', () => {
  beforeEach(() => {
    resetStores()
    clearRegistry()
    registerApp(App1)
    registerApp(App2)
  })

  it('renders the dock with backdrop-filter glass base', () => {
    render(<Dock />)
    const dock = screen.getByTestId('dock')
    expect(dock).toBeInTheDocument()
    expect(dock.style.backdropFilter).toContain('blur')
    expect(dock.style.background).toContain('var(--dock-bg)')
  })

  it('renders a dock item for each registered app', () => {
    render(<Dock />)
    expect(screen.getByTestId('dock-item-app-one')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-app-two')).toBeInTheDocument()
  })

  it('renders app icons from the app-registry icon name', () => {
    render(<Dock />)
    expect(screen.getByTestId('app-icon-finder')).toBeInTheDocument()
    expect(screen.getByTestId('app-icon-notes')).toBeInTheDocument()
  })

  it('clicking a dock item opens a new window for that app', () => {
    render(<Dock />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-app-one'))
    })
    const wins = useWindowStore.getState().windows
    expect(wins).toHaveLength(1)
    expect(wins[0].appId).toBe('app-one')
    expect(wins[0].title).toBe('App One')
  })

  it('clicking a dock item uses the app defaultWidth/defaultHeight', () => {
    render(<Dock />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-app-one'))
    })
    const win = useWindowStore.getState().windows[0]
    expect(win.width).toBe(600)
    expect(win.height).toBe(400)
  })

  it('clicking a dock item for an already-open app focuses it instead of opening a new window', () => {
    const id = useWindowStore.getState().openWindow('app-one', 'App One')
    // Open a second window to lower z-index of the first
    useWindowStore.getState().openWindow('app-two', 'App Two')
    const zBefore = useWindowStore.getState().getWindow(id)!.zIndex
    render(<Dock />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-app-one'))
    })
    const zAfter = useWindowStore.getState().getWindow(id)!.zIndex
    expect(zAfter).toBeGreaterThan(zBefore)
    expect(useWindowStore.getState().windows).toHaveLength(2) // no new window
    expect(useWindowStore.getState().focusedId).toBe(id)
  })

  it('clicking a dock item for a minimized app restores it', () => {
    const id = useWindowStore.getState().openWindow('app-one', 'App One')
    useWindowStore.getState().minimizeWindow(id)
    expect(useWindowStore.getState().getWindow(id)!.isMinimized).toBe(true)
    render(<Dock />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-app-one'))
    })
    expect(useWindowStore.getState().getWindow(id)!.isMinimized).toBe(false)
    expect(useWindowStore.getState().focusedId).toBe(id)
  })

  it('shows a running indicator dot for apps with open windows', () => {
    useWindowStore.getState().openWindow('app-one', 'App One')
    render(<Dock />)
    const indicator = screen.getByTestId('dock-indicator-app-one')
    expect(indicator.style.opacity).toBe('0.7')
  })

  it('does not show a running indicator for apps with no windows', () => {
    render(<Dock />)
    const indicator = screen.getByTestId('dock-indicator-app-two')
    expect(indicator.style.opacity).toBe('0')
  })

  it('removes the running indicator when a window is closed', () => {
    const id = useWindowStore.getState().openWindow('app-one', 'App One')
    const { rerender } = render(<Dock />)
    expect(screen.getByTestId('dock-indicator-app-one').style.opacity).toBe('0.7')
    act(() => {
      useWindowStore.getState().closeWindow(id)
    })
    rerender(<Dock />)
    expect(screen.getByTestId('dock-indicator-app-one').style.opacity).toBe('0')
  })

  it('shows a tooltip with the app name on hover', () => {
    render(<Dock />)
    fireEvent.mouseEnter(screen.getByTestId('dock-item-app-one'))
    expect(screen.getByTestId('dock-tooltip-app-one')).toHaveTextContent('App One')
  })

  it('hides the tooltip on mouse leave', () => {
    render(<Dock />)
    const item = screen.getByTestId('dock-item-app-one')
    fireEvent.mouseEnter(item)
    expect(screen.getByTestId('dock-tooltip-app-one')).toBeInTheDocument()
    fireEvent.mouseLeave(item)
    expect(screen.queryByTestId('dock-tooltip-app-one')).toBeNull()
  })

  it('applies a lift transform on hover (magnification)', () => {
    render(<Dock />)
    const item = screen.getByTestId('dock-item-app-one')
    fireEvent.mouseEnter(item)
    const transform = item.style.transform
    expect(transform).toContain('translateY(-8px)')
  })

  it('removes the lift transform on mouse leave', () => {
    render(<Dock />)
    const item = screen.getByTestId('dock-item-app-one')
    fireEvent.mouseEnter(item)
    fireEvent.mouseLeave(item)
    expect(item.style.transform).not.toContain('translateY(-8px)')
  })

  it('updates dock contents when apps are registered after initial render', () => {
    render(<Dock />)
    expect(screen.queryByTestId('dock-item-app-three')).toBeNull()
    registerApp({
      id: 'app-three',
      name: 'App Three',
      icon: 'calendar',
      component: () => <div />,
    })
    // Re-render to pick up new registry entry
    const { rerender } = render(<Dock />)
    // Since getRegisteredApps is called at render time, a re-render picks it up
    rerender(<Dock />)
    expect(screen.getByTestId('dock-item-app-three')).toBeInTheDocument()
  })
})
