import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Window } from './Window'
import { ThemeProvider } from '../../theme'

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true, configurable: true })
}

describe('Window', () => {
  beforeEach(() => {
    setViewport(1280, 800)
  })

  it('renders the title bar with title and traffic light buttons', () => {
    render(
      <ThemeProvider>
        <Window
          id="finder"
          title="Finder"
          x={100}
          y={100}
          width={600}
          height={400}
          onClose={vi.fn()}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
          onFocus={vi.fn()}
        >
          <div data-testid="window-content">Hello Finder</div>
        </Window>
      </ThemeProvider>,
    )
    expect(screen.getByText('Finder')).toBeInTheDocument()
    expect(screen.getByLabelText('Close')).toBeInTheDocument()
    expect(screen.getByLabelText('Minimize')).toBeInTheDocument()
    expect(screen.getByLabelText('Maximize')).toBeInTheDocument()
    expect(screen.getByTestId('window-content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const close = vi.fn()
    render(
      <ThemeProvider>
        <Window
          id="finder"
          title="Finder"
          x={100}
          y={100}
          width={600}
          height={400}
          onClose={close}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
          onFocus={vi.fn()}
        >
          <div>Content</div>
        </Window>
      </ThemeProvider>,
    )
    screen.getByLabelText('Close').click()
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does not render when minimized', () => {
    const { container } = render(
      <ThemeProvider>
        <Window
          id="finder"
          title="Finder"
          x={100}
          y={100}
          width={600}
          height={400}
          isMinimized
          onClose={vi.fn()}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
          onFocus={vi.fn()}
        >
          <div>Content</div>
        </Window>
      </ThemeProvider>,
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls onMove while dragging the title bar', () => {
    const move = vi.fn()
    render(
      <ThemeProvider>
        <Window
          id="finder"
          title="Finder"
          x={100}
          y={100}
          width={600}
          height={400}
          onClose={vi.fn()}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
          onFocus={vi.fn()}
          onMove={move}
        >
          <div>Content</div>
        </Window>
      </ThemeProvider>,
    )
    const titleBar = screen.getByText('Finder').parentElement!.parentElement!
    fireEvent.pointerDown(titleBar, { clientX: 100, clientY: 100, button: 0 })
    fireEvent.pointerMove(titleBar, { clientX: 150, clientY: 120 })
    fireEvent.pointerUp(titleBar, { clientX: 150, clientY: 120 })
    expect(move).toHaveBeenCalled()
    const [lastX, lastY] = move.mock.calls[move.mock.calls.length - 1]
    expect(lastX).toBe(150)
    expect(lastY).toBe(120)
  })

  it('clamps drag position to viewport', () => {
    const move = vi.fn()
    render(
      <ThemeProvider>
        <Window
          id="finder"
          title="Finder"
          x={1000}
          y={600}
          width={600}
          height={400}
          onClose={vi.fn()}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
          onFocus={vi.fn()}
          onMove={move}
        >
          <div>Content</div>
        </Window>
      </ThemeProvider>,
    )
    const titleBar = screen.getByText('Finder').parentElement!.parentElement!
    fireEvent.pointerDown(titleBar, { clientX: 1000, clientY: 600, button: 0 })
    fireEvent.pointerMove(titleBar, { clientX: 1400, clientY: 900 })
    expect(move).toHaveBeenCalled()
    const [lastX, lastY] = move.mock.calls[move.mock.calls.length - 1]
    expect(lastX).toBeLessThanOrEqual(680)
    expect(lastY).toBeLessThanOrEqual(400)
  })

  it('calls onResize while dragging the resize handle', () => {
    const resize = vi.fn()
    const { container } = render(
      <ThemeProvider>
        <Window
          id="finder"
          title="Finder"
          x={100}
          y={100}
          width={600}
          height={400}
          onClose={vi.fn()}
          onMinimize={vi.fn()}
          onMaximize={vi.fn()}
          onFocus={vi.fn()}
          onResize={resize}
        >
          <div>Content</div>
        </Window>
      </ThemeProvider>,
    )
    const handle = container.querySelector('.cursor-nwse-resize') as HTMLElement
    fireEvent.pointerDown(handle, { clientX: 700, clientY: 500, button: 0 })
    fireEvent.pointerMove(handle, { clientX: 750, clientY: 540 })
    fireEvent.pointerUp(handle, { clientX: 750, clientY: 540 })
    expect(resize).toHaveBeenCalled()
    const [lastW, lastH] = resize.mock.calls[resize.mock.calls.length - 1]
    expect(lastW).toBe(650)
    expect(lastH).toBe(440)
  })
})
