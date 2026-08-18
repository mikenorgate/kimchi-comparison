import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { SystemSettings } from './system-settings'
import { useThemeStore, WALLPAPERS, ACCENT_COLORS } from '../../store/theme-store'
import { useSystemStore } from '../../store/system-store'

function resetStores() {
  localStorage.removeItem('tahoe.theme')
  localStorage.removeItem('tahoe.accent')
  localStorage.removeItem('tahoe.wallpaper')
  localStorage.removeItem('tahoe.system-settings')
  useThemeStore.setState({ mode: 'light', accent: '#0a84ff', wallpaperId: 'tahoe' })
  useSystemStore.setState({ wifi: true, bluetooth: true, airdrop: false, brightness: 80, volume: 60, doNotDisturb: false })
}

describe('System Settings', () => {
  beforeEach(() => {
    resetStores()
  })

  it('renders the sidebar with all 6 panes', () => {
    render(<SystemSettings windowId="w1" />)
    expect(screen.getByTestId('settings-root')).toBeInTheDocument()
    expect(screen.getByTestId('settings-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('settings-pane-appearance')).toBeInTheDocument()
    expect(screen.getByTestId('settings-pane-wallpaper')).toBeInTheDocument()
    expect(screen.getByTestId('settings-pane-dock')).toBeInTheDocument()
    expect(screen.getByTestId('settings-pane-control-center')).toBeInTheDocument()
    expect(screen.getByTestId('settings-pane-sound')).toBeInTheDocument()
    expect(screen.getByTestId('settings-pane-network')).toBeInTheDocument()
  })

  it('defaults to the Appearance pane', () => {
    render(<SystemSettings windowId="w1" />)
    expect(screen.getByTestId('pane-appearance')).toBeInTheDocument()
  })

  it('shows Light and Dark mode previews', () => {
    render(<SystemSettings windowId="w1" />)
    expect(screen.getByTestId('appearance-light-preview')).toBeInTheDocument()
    expect(screen.getByTestId('appearance-dark-preview')).toBeInTheDocument()
  })

  it('toggles to dark mode when Dark preview is clicked', () => {
    render(<SystemSettings windowId="w1" />)
    expect(useThemeStore.getState().mode).toBe('light')
    act(() => {
      fireEvent.click(screen.getByTestId('appearance-dark-preview'))
    })
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('toggles to light mode when Light preview is clicked', () => {
    useThemeStore.setState({ mode: 'dark' })
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('appearance-light-preview'))
    })
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('shows accent color swatches', () => {
    render(<SystemSettings windowId="w1" />)
    for (const c of ACCENT_COLORS) {
      expect(screen.getByTestId(`accent-${c}`)).toBeInTheDocument()
    }
  })

  it('sets accent color when swatch is clicked', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('accent-#ff453a'))
    })
    expect(useThemeStore.getState().accent).toBe('#ff453a')
  })

  it('persists accent color to localStorage', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('accent-#30d158'))
    })
    expect(localStorage.getItem('tahoe.accent')).toBe('#30d158')
  })

  it('persists theme mode to localStorage', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('appearance-dark-preview'))
    })
    expect(localStorage.getItem('tahoe.theme')).toBe('dark')
  })

  it('switches to Wallpaper pane when clicked', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-wallpaper'))
    })
    expect(screen.getByTestId('pane-wallpaper')).toBeInTheDocument()
    expect(screen.queryByTestId('pane-appearance')).toBeNull()
  })

  it('shows all wallpaper options', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-wallpaper'))
    })
    for (const wp of WALLPAPERS) {
      expect(screen.getByTestId(`wallpaper-${wp.id}`)).toBeInTheDocument()
    }
  })

  it('sets wallpaper when option is clicked', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-wallpaper'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('wallpaper-sunrise'))
    })
    expect(useThemeStore.getState().wallpaperId).toBe('sunrise')
  })

  it('persists wallpaper to localStorage', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-wallpaper'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('wallpaper-ocean'))
    })
    expect(localStorage.getItem('tahoe.wallpaper')).toBe('ocean')
  })

  it('Control Center pane toggles wifi on/off', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-control-center'))
    })
    expect(useSystemStore.getState().wifi).toBe(true)
    act(() => {
      fireEvent.click(screen.getByTestId('cc-wifi-toggle'))
    })
    expect(useSystemStore.getState().wifi).toBe(false)
  })

  it('Control Center pane toggles bluetooth on/off', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-control-center'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('cc-bt-toggle'))
    })
    expect(useSystemStore.getState().bluetooth).toBe(false)
  })

  it('Control Center pane toggles Do Not Disturb', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-control-center'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('cc-dnd-toggle'))
    })
    expect(useSystemStore.getState().doNotDisturb).toBe(true)
  })

  it('Sound pane has a volume slider', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-sound'))
    })
    expect(screen.getByTestId('sound-volume-slider')).toBeInTheDocument()
  })

  it('Sound pane volume slider adjusts volume', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-sound'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('sound-volume-slider'), { target: { value: 45 } })
    })
    expect(useSystemStore.getState().volume).toBe(45)
  })

  it('Network pane shows wifi toggle', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-network'))
    })
    expect(screen.getByTestId('net-wifi-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('net-bt-toggle')).toBeInTheDocument()
  })

  it('Dock & Menu Bar pane renders', () => {
    render(<SystemSettings windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('settings-pane-dock'))
    })
    expect(screen.getByTestId('pane-dock')).toBeInTheDocument()
  })
})
