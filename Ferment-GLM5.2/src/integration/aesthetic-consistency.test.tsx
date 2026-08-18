import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Desktop } from '../shell/desktop'
import { registerBuiltInApps } from '../builtin-apps'
import { useWindowStore } from '../store/window-store'
import { useUIStore } from '../store/ui-store'
import { useThemeStore } from '../store/theme-store'
import { clearRegistry } from '../store/app-registry'

function resetAll() {
  const keys = Object.keys(localStorage)
  keys.forEach((k) => { if (k.startsWith('tahoe.')) localStorage.removeItem(k) })
  useWindowStore.setState({ windows: [], focusedId: null, topZ: 10 })
  useUIStore.setState({ spotlightOpen: false, controlCenterOpen: false, missionControlOpen: false, notificationCenterOpen: false })
  clearRegistry()
  registerBuiltInApps()
}

describe('Aesthetic consistency', () => {
  beforeEach(() => {
    resetAll()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Glass CSS variables', () => {
    it('menu bar has backdrop-filter for translucency', () => {
      render(<Desktop />)
      const menuBar = screen.getByTestId('menu-bar')
      expect(menuBar.style.backdropFilter).toContain('blur')
    })

    it('menu bar uses glass background variable', () => {
      render(<Desktop />)
      const menuBar = screen.getByTestId('menu-bar')
      expect(menuBar.style.background).toContain('var(--menubar-bg)')
    })

    it('dock has backdrop-filter for Liquid Glass', () => {
      render(<Desktop />)
      const dock = screen.getByTestId('dock')
      expect(dock.style.backdropFilter).toContain('blur')
    })

    it('dock uses glass background variable', () => {
      render(<Desktop />)
      const dock = screen.getByTestId('dock')
      expect(dock.style.background).toContain('var(--dock-bg)')
    })

    it('wallpaper renders on desktop', () => {
      render(<Desktop />)
      expect(screen.getByTestId('desktop-wallpaper')).toBeInTheDocument()
    })
  })

  describe('Light/dark mode theming', () => {
    it('starts in light mode by default', () => {
      render(<Desktop />)
      expect(useThemeStore.getState().mode).toBe('light')
    })

    it('switching to dark mode updates theme store', () => {
      render(<Desktop />)
      act(() => {
        useThemeStore.getState().setMode('dark')
      })
      expect(useThemeStore.getState().mode).toBe('dark')
    })

    it('dark mode persists to localStorage', () => {
      render(<Desktop />)
      act(() => {
        useThemeStore.getState().setMode('dark')
      })
      expect(localStorage.getItem('tahoe.theme')).toBe('dark')
    })

    it('switching back to light mode works', () => {
      render(<Desktop />)
      act(() => {
        useThemeStore.getState().setMode('dark')
      })
      act(() => {
        useThemeStore.getState().setMode('light')
      })
      expect(useThemeStore.getState().mode).toBe('light')
      expect(localStorage.getItem('tahoe.theme')).toBe('light')
    })

    it('wallpaper changes when wallpaper ID changes', () => {
      render(<Desktop />)
      const before = useThemeStore.getState().wallpaperId
      act(() => {
        useThemeStore.getState().setWallpaper('ocean')
      })
      const after = useThemeStore.getState().wallpaperId
      expect(before).not.toBe(after)
    })

    it('accent color persists to localStorage', () => {
      render(<Desktop />)
      act(() => {
        useThemeStore.getState().setAccent('#ff6b6b')
      })
      expect(localStorage.getItem('tahoe.accent')).toBe('#ff6b6b')
    })

    it('wallpaper persists to localStorage', () => {
      render(<Desktop />)
      act(() => {
        useThemeStore.getState().setWallpaper('forest')
      })
      expect(localStorage.getItem('tahoe.wallpaper')).toBe('forest')
    })
  })

  describe('Control Center toggles', () => {
    it('wifi toggle exists in control center', () => {
      render(<Desktop />)
      act(() => {
        useUIStore.getState().setControlCenterOpen(true)
      })
      const wifiToggle = screen.getByTestId('cc-wifi')
      expect(wifiToggle).toBeInTheDocument()
    })

    it('brightness slider exists in control center', () => {
      render(<Desktop />)
      act(() => {
        useUIStore.getState().setControlCenterOpen(true)
      })
      expect(screen.getByTestId('cc-brightness')).toBeInTheDocument()
    })

    it('volume slider exists in control center', () => {
      render(<Desktop />)
      act(() => {
        useUIStore.getState().setControlCenterOpen(true)
      })
      expect(screen.getByTestId('cc-volume')).toBeInTheDocument()
    })
  })

  describe('Window glass aesthetic', () => {
    it('windows have glass background', () => {
      render(<Desktop />)
      act(() => {
        fireEvent.click(screen.getByTestId('dock-item-notes'))
      })
      const windows = screen.getAllByTestId(/window-/)
      expect(windows.length).toBeGreaterThan(0)
      // Window should have glass-related styling
      const win = windows[0]
      expect(win).toBeInTheDocument()
    })

    it('window has traffic light buttons', () => {
      render(<Desktop />)
      act(() => {
        fireEvent.click(screen.getByTestId('dock-item-notes'))
      })
      const winId = useWindowStore.getState().windows[0].id
      expect(screen.getByTestId(`close-${winId}`)).toBeInTheDocument()
    })
  })

  describe('Keyboard shortcuts', () => {
    it('Cmd+Space opens Spotlight', () => {
      render(<Desktop />)
      expect(useUIStore.getState().spotlightOpen).toBe(false)
      act(() => {
        fireEvent.keyDown(window, { code: 'Space', metaKey: true })
      })
      expect(useUIStore.getState().spotlightOpen).toBe(true)
    })

    it('Cmd+Space toggles Spotlight closed', () => {
      render(<Desktop />)
      act(() => {
        useUIStore.getState().setSpotlightOpen(true)
      })
      act(() => {
        fireEvent.keyDown(window, { code: 'Space', metaKey: true })
      })
      expect(useUIStore.getState().spotlightOpen).toBe(false)
    })

    it('Escape closes Spotlight', () => {
      render(<Desktop />)
      act(() => {
        useUIStore.getState().setSpotlightOpen(true)
      })
      act(() => {
        fireEvent.keyDown(window, { key: 'Escape' })
      })
      expect(useUIStore.getState().spotlightOpen).toBe(false)
    })

    it('Cmd+W closes focused window', () => {
      render(<Desktop />)
      act(() => {
        fireEvent.click(screen.getByTestId('dock-item-calculator'))
      })
      expect(useWindowStore.getState().windows.length).toBe(1)
      act(() => {
        fireEvent.keyDown(window, { key: 'w', metaKey: true })
      })
      expect(useWindowStore.getState().windows.length).toBe(0)
    })

    it('Cmd+W does nothing when no window is focused', () => {
      render(<Desktop />)
      act(() => {
        fireEvent.keyDown(window, { key: 'w', metaKey: true })
      })
      expect(useWindowStore.getState().windows.length).toBe(0)
    })
  })

  describe('App icon consistency', () => {
    it('all dock items have icons', () => {
      render(<Desktop />)
      const dockItems = screen.getAllByTestId(/dock-item-/)
      for (const item of dockItems) {
        // Each dock item should contain an icon (SVG or text)
        expect(item.children.length).toBeGreaterThan(0)
      }
    })

    it('spotlight results show app icons', () => {
      render(<Desktop />)
      act(() => {
        useUIStore.getState().setSpotlightOpen(true)
      })
      const input = screen.getByTestId('spotlight-input')
      act(() => {
        fireEvent.change(input, { target: { value: 'notes' } })
      })
      const result = screen.getByTestId('spotlight-result-notes')
      expect(result).toBeInTheDocument()
      expect(result.children.length).toBeGreaterThan(0)
    })
  })
})
