import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WindowManagerProvider } from './windowStore'
import { useWindowManager } from './useWindowManager'
import { WindowManager } from './WindowManager'
import { ThemeProvider } from '../../theme'

function TestHarness() {
  const {
    state,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager()
  return (
    <div>
      <button
        data-testid="open-a"
        onClick={() =>
          openWindow({
            id: 'a',
            appId: 'finder',
            title: 'Finder',
            x: 50,
            y: 50,
            width: 300,
            height: 200,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
          })
        }
      >
        Open A
      </button>
      <button
        data-testid="open-b"
        onClick={() =>
          openWindow({
            id: 'b',
            appId: 'safari',
            title: 'Safari',
            x: 80,
            y: 80,
            width: 300,
            height: 200,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
          })
        }
      >
        Open B
      </button>
      <button data-testid="close-a" onClick={() => closeWindow('a')}>
        Close A
      </button>
      <button data-testid="minimize-a" onClick={() => minimizeWindow('a')}>
        Minimize A
      </button>
      <button data-testid="maximize-a" onClick={() => maximizeWindow('a')}>
        Maximize A
      </button>
      <button data-testid="restore-a" onClick={() => restoreWindow('a')}>
        Restore A
      </button>
      <button data-testid="focus-a" onClick={() => focusWindow('a')}>
        Focus A
      </button>
      <button data-testid="focus-b" onClick={() => focusWindow('b')}>
        Focus B
      </button>
      <button data-testid="move-a" onClick={() => moveWindow('a', 10, 20)}>
        Move A
      </button>
      <button data-testid="resize-a" onClick={() => resizeWindow('a', 400, 300)}>
        Resize A
      </button>
      <div data-testid="focused-id">{state.focusedId ?? 'none'}</div>
      <div data-testid="window-count">{state.windows.length}</div>
      <div data-testid="minimized-states">
        {state.windows.map((w) => `${w.id}:${w.isMinimized}`).join(',')}
      </div>
      <WindowManager />
    </div>
  )
}

function renderHarness() {
  return render(
    <ThemeProvider>
      <WindowManagerProvider>
        <TestHarness />
      </WindowManagerProvider>
    </ThemeProvider>,
  )
}

describe('WindowManagerProvider', () => {
  it('opens a window and focuses it', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('open-a'))
    expect(screen.getByTestId('window-count').textContent).toBe('1')
    expect(screen.getByTestId('focused-id').textContent).toBe('a')
    expect(screen.getByTestId('window-frame')).toBeInTheDocument()
  })

  it('focuses the clicked window and updates z-index', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('open-a'))
    fireEvent.click(screen.getByTestId('open-b'))
    const windowA = screen.getByLabelText('Finder')
    const windowB = screen.getByLabelText('Safari')
    expect(windowA).toHaveStyle('z-index: 100')
    expect(windowB).toHaveStyle('z-index: 101')

    fireEvent.click(screen.getByTestId('focus-a'))
    expect(screen.getByTestId('focused-id').textContent).toBe('a')
    expect(windowA).toHaveStyle('z-index: 102')
  })

  it('closes a window and updates focus', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('open-a'))
    fireEvent.click(screen.getByTestId('open-b'))
    fireEvent.click(screen.getByTestId('close-a'))
    expect(screen.getByTestId('window-count').textContent).toBe('1')
    expect(screen.getByTestId('focused-id').textContent).toBe('b')
  })

  it('minimizes a window', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('open-a'))
    expect(screen.getByTestId('minimized-states').textContent).toBe('a:false')
    fireEvent.click(screen.getByTestId('minimize-a'))
    expect(screen.getByTestId('minimized-states').textContent).toBe('a:true')
    expect(screen.getByTestId('window-count').textContent).toBe('1')
    expect(screen.queryByLabelText('Finder')).not.toBeInTheDocument()
  })

  it('maximizes and restores a window preserving previous bounds', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('open-a'))
    const windowA = screen.getByLabelText('Finder')
    expect(windowA).toHaveStyle('left: 50px')
    expect(windowA).toHaveStyle('top: 50px')

    fireEvent.click(screen.getByTestId('maximize-a'))
    expect(windowA).toHaveStyle('left: 0px')
    expect(windowA).toHaveStyle('top: 32px')

    fireEvent.click(screen.getByTestId('restore-a'))
    expect(windowA).toHaveStyle('left: 50px')
    expect(windowA).toHaveStyle('top: 50px')
  })

  it('moves and resizes a window', () => {
    renderHarness()
    fireEvent.click(screen.getByTestId('open-a'))
    fireEvent.click(screen.getByTestId('move-a'))
    fireEvent.click(screen.getByTestId('resize-a'))
    const windowA = screen.getByLabelText('Finder')
    expect(windowA).toHaveStyle('left: 10px')
    expect(windowA).toHaveStyle('top: 20px')
    expect(windowA).toHaveStyle('width: 400px')
    expect(windowA).toHaveStyle('height: 300px')
  })
})
