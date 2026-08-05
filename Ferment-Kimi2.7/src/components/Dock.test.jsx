import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Dock } from './Dock'
import { useDesktopStore } from '../store/desktopStore'
import { APP_IDS } from '../data/apps'

describe('Dock', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('renders dock items for built-in dock apps', () => {
    render(<Dock />)
    expect(screen.getByTestId('dock')).toBeInTheDocument()
    expect(screen.getByTestId(`dock-item-${APP_IDS.FINDER}`)).toBeInTheDocument()
    expect(screen.getByTestId(`dock-item-${APP_IDS.SAFARI}`)).toBeInTheDocument()
  })

  it('opens an app when a dock item is clicked', () => {
    render(<Dock />)
    fireEvent.click(screen.getByTestId(`dock-item-${APP_IDS.CALCULATOR}`))
    const state = useDesktopStore.getState()
    expect(state.windows).toHaveLength(1)
    expect(state.windows[0].appId).toBe(APP_IDS.CALCULATOR)
  })

  it('shows running indicator for open apps', () => {
    useDesktopStore.getState().openApp(APP_IDS.NOTES)
    render(<Dock />)
    expect(screen.getByTestId(`dock-indicator-${APP_IDS.NOTES}`)).toBeInTheDocument()
  })

  it('uses active color for the active app indicator', () => {
    useDesktopStore.getState().openApp(APP_IDS.NOTES)
    const windowId = useDesktopStore.getState().windows[0].id
    useDesktopStore.getState().focusWindow(windowId)
    render(<Dock />)
    const indicator = screen.getByTestId(`dock-indicator-${APP_IDS.NOTES}`)
    expect(indicator).toHaveStyle({ background: 'var(--color-accent)' })
  })
})
