import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useWindowStore } from '../store/window-store'
import { registerApp, clearRegistry, getApp, getRegisteredApps, type AppDefinition } from '../store/app-registry'
import { WindowLayer } from './window-layer'

// Helper: reset window store between tests
function resetStore() {
  useWindowStore.setState({ windows: [], focusedId: null, topZ: 10 })
}

const TestApp: AppDefinition = {
  id: 'test-app',
  name: 'Test App',
  icon: 'finder',
  component: ({ windowId }) => (
    <div data-testid={`app-content-${windowId}`}>Test App Content</div>
  ),
  defaultWidth: 600,
  defaultHeight: 400,
}

const AnotherApp: AppDefinition = {
  id: 'another-app',
  name: 'Another App',
  icon: 'notes',
  component: () => <div>Another App</div>,
}

describe('Window Manager', () => {
  beforeEach(() => {
    resetStore()
    clearRegistry()
    registerApp(TestApp)
    registerApp(AnotherApp)
  })

  describe('window-store', () => {
    it('opens a window and returns an id', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      expect(id).toBeTruthy()
      expect(useWindowStore.getState().windows).toHaveLength(1)
      expect(useWindowStore.getState().windows[0].appId).toBe('test-app')
    })

    it('sets the opened window as focused', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      expect(useWindowStore.getState().focusedId).toBe(id)
    })

    it('assigns incrementing z-index on focus', () => {
      const id1 = useWindowStore.getState().openWindow('test-app', 'T1')
      const id2 = useWindowStore.getState().openWindow('another-app', 'T2')
      const z1 = useWindowStore.getState().getWindow(id1)!.zIndex
      const z2 = useWindowStore.getState().getWindow(id2)!.zIndex
      expect(z2).toBeGreaterThan(z1)
    })

    it('closes a window', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      useWindowStore.getState().closeWindow(id)
      expect(useWindowStore.getState().windows).toHaveLength(0)
      expect(useWindowStore.getState().focusedId).toBeNull()
    })

    it('minimizes a window and clears focus', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      useWindowStore.getState().minimizeWindow(id)
      expect(useWindowStore.getState().getWindow(id)!.isMinimized).toBe(true)
      expect(useWindowStore.getState().focusedId).toBeNull()
    })

    it('restores a minimized window and focuses it', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      useWindowStore.getState().minimizeWindow(id)
      useWindowStore.getState().restoreWindow(id)
      const win = useWindowStore.getState().getWindow(id)!
      expect(win.isMinimized).toBe(false)
      expect(useWindowStore.getState().focusedId).toBe(id)
    })

    it('maximizes a window saving prevRect, then restores geometry', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App', {
        x: 100, y: 50, width: 500, height: 300,
      })
      useWindowStore.getState().toggleMaximize(id)
      const max = useWindowStore.getState().getWindow(id)!
      expect(max.isMaximized).toBe(true)
      expect(max.prevRect).toEqual({ x: 100, y: 50, width: 500, height: 300 })

      useWindowStore.getState().toggleMaximize(id)
      const restored = useWindowStore.getState().getWindow(id)!
      expect(restored.isMaximized).toBe(false)
      expect(restored.x).toBe(100)
      expect(restored.y).toBe(50)
      expect(restored.width).toBe(500)
      expect(restored.height).toBe(300)
      expect(restored.prevRect).toBeUndefined()
    })

    it('moves a window', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      useWindowStore.getState().moveWindow(id, 200, 150)
      const win = useWindowStore.getState().getWindow(id)!
      expect(win.x).toBe(200)
      expect(win.y).toBe(150)
    })

    it('resizes a window', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      useWindowStore.getState().resizeWindow(id, 800, 600)
      const win = useWindowStore.getState().getWindow(id)!
      expect(win.width).toBe(800)
      expect(win.height).toBe(600)
    })

    it('focusing a window raises its z-index above others', () => {
      const id1 = useWindowStore.getState().openWindow('test-app', 'T1')
      const id2 = useWindowStore.getState().openWindow('another-app', 'T2')
      // id2 is focused (opened last). Focus id1 — it should now have higher z.
      useWindowStore.getState().focusWindow(id1)
      const z1 = useWindowStore.getState().getWindow(id1)!.zIndex
      const z2 = useWindowStore.getState().getWindow(id2)!.zIndex
      expect(z1).toBeGreaterThan(z2)
      expect(useWindowStore.getState().focusedId).toBe(id1)
    })
  })

  describe('app-registry', () => {
    it('registers and retrieves an app', () => {
      expect(getApp('test-app')?.name).toBe('Test App')
      expect(getApp('test-app')?.icon).toBe('finder')
      expect(getRegisteredApps()).toHaveLength(2)
    })

    it('returns undefined for unregistered app', () => {
      expect(getApp('nonexistent')).toBeUndefined()
    })
  })

  describe('Window component (rendered via WindowLayer)', () => {
    it('renders an open window with traffic lights', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      render(<WindowLayer />)
      const winEl = screen.getByTestId(`window-${id}`)
      expect(winEl).toBeInTheDocument()
      expect(screen.getByTestId(`close-${id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`minimize-${id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`maximize-${id}`)).toBeInTheDocument()
    })

    it('renders the app component content inside the window', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      render(<WindowLayer />)
      expect(screen.getByTestId(`app-content-${id}`)).toBeInTheDocument()
    })

    it('shows the window title in the title bar', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'My Window Title')
      render(<WindowLayer />)
      const titlebar = screen.getByTestId(`titlebar-${id}`)
      expect(titlebar).toHaveTextContent('My Window Title')
    })

    it('does not render a minimized window', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      useWindowStore.getState().minimizeWindow(id)
      render(<WindowLayer />)
      expect(screen.queryByTestId(`window-${id}`)).toBeNull()
    })

    it('close button removes the window', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      render(<WindowLayer />)
      act(() => {
        fireEvent.click(screen.getByTestId(`close-${id}`))
      })
      expect(useWindowStore.getState().windows).toHaveLength(0)
    })

    it('minimize button minimizes the window', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      render(<WindowLayer />)
      act(() => {
        fireEvent.click(screen.getByTestId(`minimize-${id}`))
      })
      expect(useWindowStore.getState().getWindow(id)!.isMinimized).toBe(true)
    })

    it('maximize button toggles maximize state', () => {
      const id = useWindowStore.getState().openWindow('test-app', 'Test App')
      render(<WindowLayer />)
      act(() => {
        fireEvent.click(screen.getByTestId(`maximize-${id}`))
      })
      expect(useWindowStore.getState().getWindow(id)!.isMaximized).toBe(true)
      act(() => {
        fireEvent.click(screen.getByTestId(`maximize-${id}`))
      })
      expect(useWindowStore.getState().getWindow(id)!.isMaximized).toBe(false)
    })

    it('renders multiple windows simultaneously', () => {
      const id1 = useWindowStore.getState().openWindow('test-app', 'T1')
      const id2 = useWindowStore.getState().openWindow('another-app', 'T2')
      render(<WindowLayer />)
      expect(screen.getByTestId(`window-${id1}`)).toBeInTheDocument()
      expect(screen.getByTestId(`window-${id2}`)).toBeInTheDocument()
    })

    it('marks the focused window with data-focused attribute', () => {
      const id1 = useWindowStore.getState().openWindow('test-app', 'T1')
      const id2 = useWindowStore.getState().openWindow('another-app', 'T2')
      render(<WindowLayer />)
      const win2 = screen.getByTestId(`window-${id2}`)
      expect(win2).toHaveAttribute('data-focused')
      // Focus the first
      act(() => {
        fireEvent.mouseDown(screen.getByTestId(`window-${id1}`))
      })
      const win1 = screen.getByTestId(`window-${id1}`)
      expect(win1).toHaveAttribute('data-focused')
    })
  })
})
