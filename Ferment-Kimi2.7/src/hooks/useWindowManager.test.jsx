import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useWindowManager } from './useWindowManager'
import { useDesktopStore } from '../store/desktopStore'
import { APP_IDS } from '../data/apps'

function TestWindow({ windowId }) {
  const { window, isActive, focus, close, minimize, handlers } = useWindowManager(windowId)
  return (
    <div data-testid="test-window" data-active={isActive} data-minimized={window?.minimized}>
      <div data-testid="titlebar" onMouseDown={handlers.onTitleMouseDown}>Title</div>
      <button data-testid="close-btn" onClick={close}>Close</button>
      <button data-testid="minimize-btn" onClick={minimize}>Minimize</button>
      <div data-testid="resize-handle" onMouseDown={handlers.onResizeMouseDown}>Resize</div>
      <button data-testid="focus-btn" onClick={focus}>Focus</button>
    </div>
  )
}

describe('useWindowManager', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('returns window state and focus/close/minimize actions', () => {
    useDesktopStore.getState().openApp(APP_IDS.NOTES)
    const windowId = useDesktopStore.getState().windows[0].id
    render(<TestWindow windowId={windowId} />)

    expect(screen.getByTestId('test-window')).toHaveAttribute('data-active', 'true')
    fireEvent.click(screen.getByTestId('minimize-btn'))
    expect(useDesktopStore.getState().windows[0].minimized).toBe(true)
    fireEvent.click(screen.getByTestId('close-btn'))
    expect(useDesktopStore.getState().windows).toHaveLength(0)
  })

  it('focuses a window', () => {
    useDesktopStore.getState().openApp(APP_IDS.NOTES)
    useDesktopStore.getState().openApp(APP_IDS.CALCULATOR)
    const firstWindow = useDesktopStore.getState().windows[0]

    render(<TestWindow windowId={firstWindow.id} />)
    fireEvent.click(screen.getByTestId('focus-btn'))
    expect(useDesktopStore.getState().activeWindowId).toBe(firstWindow.id)
  })

  it('drags a window', () => {
    useDesktopStore.getState().openApp(APP_IDS.NOTES)
    const windowId = useDesktopStore.getState().windows[0].id
    render(<TestWindow windowId={windowId} />)

    const titlebar = screen.getByTestId('titlebar')
    fireEvent.mouseDown(titlebar, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(window, { clientX: 150, clientY: 160 })
    fireEvent.mouseUp(window)

    const w = useDesktopStore.getState().windows[0]
    expect(w.x).toBeGreaterThan(0)
    expect(w.y).toBeGreaterThan(0)
  })

  it('resizes a window', () => {
    useDesktopStore.getState().openApp(APP_IDS.NOTES)
    const windowId = useDesktopStore.getState().windows[0].id
    render(<TestWindow windowId={windowId} />)

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(window, { clientX: 250, clientY: 220 })
    fireEvent.mouseUp(window)

    const w = useDesktopStore.getState().windows[0]
    expect(w.width).toBeGreaterThan(200)
    expect(w.height).toBeGreaterThan(150)
  })
})
