import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Spotlight } from './spotlight'
import { useUIStore } from '../store/ui-store'
import { useWindowStore } from '../store/window-store'
import { registerApp, clearRegistry, type AppDefinition } from '../store/app-registry'

function resetStores() {
  useUIStore.setState({ spotlightOpen: false, controlCenterOpen: false, notificationCenterOpen: false, missionControlOpen: false })
  useWindowStore.setState({ windows: [], focusedId: null, topZ: 10 })
}

const Notes: AppDefinition = { id: 'notes', name: 'Notes', icon: 'notes', component: () => <div /> }
const Calculator: AppDefinition = { id: 'calculator', name: 'Calculator', icon: 'calculator', component: () => <div /> }
const Maps: AppDefinition = { id: 'maps', name: 'Maps', icon: 'maps', component: () => <div /> }

describe('Spotlight', () => {
  beforeEach(() => {
    resetStores()
    clearRegistry()
    registerApp(Notes)
    registerApp(Calculator)
    registerApp(Maps)
  })

  it('does not render when spotlightOpen is false', () => {
    render(<Spotlight />)
    expect(screen.queryByTestId('spotlight-overlay')).toBeNull()
  })

  it('renders the overlay panel when spotlightOpen is true', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-panel')).toBeInTheDocument()
  })

  it('shows all registered apps when query is empty', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    expect(screen.getByTestId('spotlight-result-notes')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-result-calculator')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-result-maps')).toBeInTheDocument()
  })

  it('filters results by app name on query input', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.change(screen.getByTestId('spotlight-input'), { target: { value: 'cal' } })
    })
    expect(screen.getByTestId('spotlight-result-calculator')).toBeInTheDocument()
    expect(screen.queryByTestId('spotlight-result-notes')).toBeNull()
    expect(screen.queryByTestId('spotlight-result-maps')).toBeNull()
  })

  it('shows no-results message when query matches nothing', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.change(screen.getByTestId('spotlight-input'), { target: { value: 'xyznonexistent' } })
    })
    expect(screen.getByTestId('spotlight-no-results')).toBeInTheDocument()
  })

  it('closes when clicking the overlay backdrop', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.click(screen.getByTestId('spotlight-overlay'))
    })
    expect(useUIStore.getState().spotlightOpen).toBe(false)
  })

  it('does not close when clicking inside the panel', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.click(screen.getByTestId('spotlight-panel'))
    })
    expect(useUIStore.getState().spotlightOpen).toBe(true)
  })

  it('launches an app and closes on result click', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.click(screen.getByTestId('spotlight-result-notes'))
    })
    expect(useWindowStore.getState().windows).toHaveLength(1)
    expect(useWindowStore.getState().windows[0].appId).toBe('notes')
    expect(useUIStore.getState().spotlightOpen).toBe(false)
  })

  it('launches the selected result on Enter key', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.change(screen.getByTestId('spotlight-input'), { target: { value: 'map' } })
    })
    act(() => {
      fireEvent.keyDown(screen.getByTestId('spotlight-input'), { key: 'Enter' })
    })
    expect(useWindowStore.getState().windows[0].appId).toBe('maps')
    expect(useUIStore.getState().spotlightOpen).toBe(false)
  })

  it('navigates results with ArrowDown/ArrowUp and launches on Enter', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    // Default selected index is 0 (Notes). Arrow down to Calculator.
    act(() => {
      fireEvent.keyDown(screen.getByTestId('spotlight-input'), { key: 'ArrowDown' })
    })
    act(() => {
      fireEvent.keyDown(screen.getByTestId('spotlight-input'), { key: 'Enter' })
    })
    expect(useWindowStore.getState().windows[0].appId).toBe('calculator')
  })

  it('focuses an existing window instead of opening a new one', () => {
    const id = useWindowStore.getState().openWindow('notes', 'Notes')
    useWindowStore.getState().openWindow('maps', 'Maps') // lower id's z-index
    const zBefore = useWindowStore.getState().getWindow(id)!.zIndex
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.change(screen.getByTestId('spotlight-input'), { target: { value: 'not' } })
    })
    act(() => {
      fireEvent.keyDown(screen.getByTestId('spotlight-input'), { key: 'Enter' })
    })
    const zAfter = useWindowStore.getState().getWindow(id)!.zIndex
    expect(zAfter).toBeGreaterThan(zBefore)
    expect(useWindowStore.getState().windows).toHaveLength(2) // no new window
  })

  it('opens Spotlight via Cmd+Space keyboard shortcut', () => {
    render(<Spotlight />)
    expect(useUIStore.getState().spotlightOpen).toBe(false)
    act(() => {
      fireEvent.keyDown(window, { metaKey: true, code: 'Space' })
    })
    expect(useUIStore.getState().spotlightOpen).toBe(true)
  })

  it('closes Spotlight via Escape key', () => {
    useUIStore.setState({ spotlightOpen: true })
    render(<Spotlight />)
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(useUIStore.getState().spotlightOpen).toBe(false)
  })
})
