import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Desktop } from '../shell/desktop'
import { registerBuiltInApps } from '../builtin-apps'
import { useWindowStore } from '../store/window-store'
import { getRegisteredApps, clearRegistry } from '../store/app-registry'
import { useUIStore } from '../store/ui-store'

// Reset all stores before each test
function resetAll() {
  const keys = Object.keys(localStorage)
  keys.forEach((k) => { if (k.startsWith('tahoe.')) localStorage.removeItem(k) })
  useWindowStore.setState({ windows: [], focusedId: null, topZ: 10 })
  useUIStore.setState({ spotlightOpen: false, controlCenterOpen: false, missionControlOpen: false, notificationCenterOpen: false })
  clearRegistry()
  registerBuiltInApps()
}

describe('Cross-app integration', () => {
  beforeEach(() => {
    resetAll()
  })

  it('registers all 22 apps in the app registry', () => {
    const apps = getRegisteredApps()
    expect(apps.length).toBe(22)
  })

  it('all registered apps have required fields', () => {
    const apps = getRegisteredApps()
    for (const app of apps) {
      expect(app.id).toBeTruthy()
      expect(app.name).toBeTruthy()
      expect(app.icon).toBeTruthy()
      expect(app.component).toBeDefined()
      expect(app.defaultWidth).toBeGreaterThan(0)
      expect(app.defaultHeight).toBeGreaterThan(0)
    }
  })

  it('Dock contains apps from all phases', () => {
    render(<Desktop />)
    expect(screen.getByTestId('dock-item-finder')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-notes')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-calculator')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-terminal')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-photos')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-mail')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-safari')).toBeInTheDocument()
    expect(screen.getByTestId('dock-item-maps')).toBeInTheDocument()
  })

  it('launching an app from Dock creates a window', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-calculator'))
    })
    expect(useWindowStore.getState().windows.length).toBe(1)
    expect(useWindowStore.getState().windows[0].appId).toBe('calculator')
  })

  it('Dock shows running indicator when an app has a window', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-notes'))
    })
    expect(screen.getByTestId('dock-indicator-notes')).toBeInTheDocument()
  })

  it('Dock running indicator disappears when app window is closed', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-notes'))
    })
    expect(screen.getByTestId('dock-indicator-notes')).toBeInTheDocument()
    const winId = useWindowStore.getState().windows[0].id
    act(() => {
      fireEvent.click(screen.getByTestId(`close-${winId}`))
    })
    // Indicator still in DOM but hidden (opacity 0)
    const indicator = screen.queryByTestId('dock-indicator-notes')
    if (indicator) {
      expect(indicator.style.opacity).toBe('0')
    } else {
      // Or it's completely removed — either is acceptable
      expect(indicator).toBeNull()
    }
  })

  it('menu bar shows focused app name', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-notes'))
    })
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('Notes')
  })

  it('menu bar updates when focus changes between apps', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-notes'))
    })
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('Notes')
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-calculator'))
    })
    expect(screen.getByTestId('active-app-name')).toHaveTextContent('Calculator')
  })

  it('multiple apps can be open simultaneously', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-finder'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-notes'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-calculator'))
    })
    expect(useWindowStore.getState().windows.length).toBe(3)
  })

  it('closing a window leaves other windows open', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-notes'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-calculator'))
    })
    // Close calculator (focused)
    const focusedId = useWindowStore.getState().focusedId!
    act(() => {
      fireEvent.click(screen.getByTestId(`close-${focusedId}`))
    })
    expect(useWindowStore.getState().windows.length).toBe(1)
  })

  it('singleWindow apps like Calculator prevent multiple instances', () => {
    render(<Desktop />)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-calculator'))
    })
    expect(useWindowStore.getState().windows.length).toBe(1)
    act(() => {
      fireEvent.click(screen.getByTestId('dock-item-calculator'))
    })
    expect(useWindowStore.getState().windows.length).toBe(1)
  })

  it('Spotlight opens via UI store and can search apps', () => {
    render(<Desktop />)
    act(() => {
      useUIStore.getState().setSpotlightOpen(true)
    })
    const input = screen.getByTestId('spotlight-input')
    expect(input).toBeInTheDocument()
    act(() => {
      fireEvent.change(input, { target: { value: 'notes' } })
    })
    expect(screen.getByTestId('spotlight-result-notes')).toBeInTheDocument()
  })

  it('Spotlight finds apps from all phases', () => {
    render(<Desktop />)
    act(() => {
      useUIStore.getState().setSpotlightOpen(true)
    })
    const input = screen.getByTestId('spotlight-input')
    const searchTerms = [
      { q: 'terminal', id: 'terminal' },
      { q: 'music', id: 'music' },
      { q: 'mail', id: 'mail' },
      { q: 'weather', id: 'weather' },
      { q: 'stocks', id: 'stocks' },
    ]
    for (const { q, id } of searchTerms) {
      act(() => {
        fireEvent.change(input, { target: { value: q } })
      })
      expect(screen.getByTestId(`spotlight-result-${id}`)).toBeInTheDocument()
    }
  })

  it('launching from Spotlight creates a window', () => {
    render(<Desktop />)
    act(() => {
      useUIStore.getState().setSpotlightOpen(true)
    })
    const input = screen.getByTestId('spotlight-input')
    act(() => {
      fireEvent.change(input, { target: { value: 'calculator' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('spotlight-result-calculator'))
    })
    expect(useWindowStore.getState().windows.length).toBe(1)
    expect(useWindowStore.getState().windows[0].appId).toBe('calculator')
  })
})
