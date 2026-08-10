import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Window from '../Window.jsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const defaultProps = {
  id: 'win-1',
  appId: 'safari',
  title: 'Safari',
  x: 100,
  y: 80,
  width: 800,
  height: 500,
  zIndex: 5,
};

function renderWindow(overrides = {}) {
  const props = { ...defaultProps, ...overrides };
  const children = props.children ?? <p>hello world</p>;
  return {
    props,
    ...render(<Window {...props}>{children}</Window>),
  };
}

describe('<Window /> component', () => {
  it('renders title and children', () => {
    renderWindow();
    expect(screen.getByTestId('window')).toBeInTheDocument();
    expect(screen.getByTestId('titlebar-title')).toHaveTextContent('Safari');
    expect(screen.getByTestId('window-body')).toHaveTextContent('hello world');
  });

  it('returns null when minimized', () => {
    const { container } = renderWindow({ minimized: true });
    expect(screen.queryByTestId('window')).not.toBeInTheDocument();
    expect(screen.queryByTestId('titlebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('window-body')).not.toBeInTheDocument();
    // The component should not produce any DOM output when minimized.
    expect(container.firstChild).toBeNull();
  });

  it('calls onClose(id) when the close button is clicked', () => {
    const handleClose = vi.fn();
    renderWindow({ onClose: handleClose });
    fireEvent.click(screen.getByTestId('window-close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledWith('win-1');
  });

  it('calls onMinimize(id) when the minimize button is clicked', () => {
    const handleMinimize = vi.fn();
    renderWindow({ onMinimize: handleMinimize });
    fireEvent.click(screen.getByTestId('window-minimize'));
    expect(handleMinimize).toHaveBeenCalledTimes(1);
    expect(handleMinimize).toHaveBeenCalledWith('win-1');
  });

  it('calls onFullscreen(id, true) when the fullscreen button is clicked and window is not fullscreen', () => {
    const handleFullscreen = vi.fn();
    renderWindow({ onFullscreen: handleFullscreen, isFullscreen: false });
    fireEvent.click(screen.getByTestId('window-fullscreen'));
    expect(handleFullscreen).toHaveBeenCalledTimes(1);
    expect(handleFullscreen).toHaveBeenCalledWith('win-1', true);
  });

  it('calls onFullscreen(id, false) when the fullscreen button is clicked and window is fullscreen', () => {
    const handleFullscreen = vi.fn();
    renderWindow({ onFullscreen: handleFullscreen, isFullscreen: true });
    fireEvent.click(screen.getByTestId('window-fullscreen'));
    expect(handleFullscreen).toHaveBeenCalledTimes(1);
    expect(handleFullscreen).toHaveBeenCalledWith('win-1', false);
  });

  it('calls onFocus(id) when the body is left-clicked', () => {
    const handleFocus = vi.fn();
    renderWindow({ onFocus: handleFocus });
    fireEvent.mouseDown(screen.getByTestId('window-body'), { button: 0 });
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleFocus).toHaveBeenCalledWith('win-1');
  });

  it('does not focus on right-click of the body', () => {
    const handleFocus = vi.fn();
    renderWindow({ onFocus: handleFocus });
    fireEvent.mouseDown(screen.getByTestId('window-body'), { button: 2 });
    expect(handleFocus).not.toHaveBeenCalled();
  });

  it('drags via mouse events and calls onDrag(id, deltaX, deltaY)', () => {
    const handleFocus = vi.fn();
    const handleDrag = vi.fn();
    renderWindow({ onFocus: handleFocus, onDrag: handleDrag });

    const titlebar = screen.getByTestId('titlebar');
    fireEvent.mouseDown(titlebar, { button: 0, clientX: 100, clientY: 100 });

    // mousedown on the title bar should also focus the window.
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(handleFocus).toHaveBeenCalledWith('win-1');

    fireEvent.mouseMove(document, { button: 0, clientX: 150, clientY: 130 });
    expect(handleDrag).toHaveBeenCalled();
    expect(handleDrag).toHaveBeenCalledWith('win-1', 50, 30);

    fireEvent.mouseUp(document);
  });

  it('does not drag or focus when a non-primary button is pressed on the title bar', () => {
    const handleFocus = vi.fn();
    const handleDrag = vi.fn();
    renderWindow({ onFocus: handleFocus, onDrag: handleDrag });

    const titlebar = screen.getByTestId('titlebar');
    fireEvent.mouseDown(titlebar, { button: 2, clientX: 50, clientY: 50 });

    expect(handleFocus).not.toHaveBeenCalled();

    fireEvent.mouseMove(document, { button: 0, clientX: 60, clientY: 60 });
    expect(handleDrag).not.toHaveBeenCalled();
  });

  it('adds the window-active class when isActive is true', () => {
    renderWindow({ isActive: true });
    const win = screen.getByTestId('window');
    const cls = win.getAttribute('class') ?? '';
    expect(cls).toContain('window-active');
    expect(cls).toContain('window-glass');
  });

  it('does not add the window-active class when isActive is false', () => {
    renderWindow({ isActive: false });
    const win = screen.getByTestId('window');
    const cls = win.getAttribute('class') ?? '';
    expect(cls).not.toContain('window-active');
  });

  it('applies absolute position and zIndex via inline styles', () => {
    renderWindow({ x: 220, y: 140, width: 640, height: 420, zIndex: 42 });
    const win = screen.getByTestId('window');
    const style = win.getAttribute('style') ?? '';
    expect(style).toContain('left: 220px');
    expect(style).toContain('top: 140px');
    expect(style).toContain('width: 640px');
    expect(style).toContain('height: 420px');
    expect(style).toMatch(/z-index:\s*42/);
  });

  it('stops dragging after mouseup (subsequent moves do not call onDrag)', () => {
    const handleDrag = vi.fn();
    renderWindow({ onDrag: handleDrag });

    const titlebar = screen.getByTestId('titlebar');
    fireEvent.mouseDown(titlebar, { button: 0, clientX: 0, clientY: 0 });
    fireEvent.mouseMove(document, { button: 0, clientX: 10, clientY: 10 });
    expect(handleDrag).toHaveBeenCalled();

    fireEvent.mouseUp(document);

    handleDrag.mockClear();
    fireEvent.mouseMove(document, { button: 0, clientX: 50, clientY: 50 });
    expect(handleDrag).not.toHaveBeenCalled();
  });

  it('cleans up global mouse listeners on unmount', () => {
    const handleDrag = vi.fn();
    const { unmount } = renderWindow({ onDrag: handleDrag });

    const titlebar = screen.getByTestId('titlebar');
    fireEvent.mouseDown(titlebar, { button: 0, clientX: 0, clientY: 0 });

    unmount();

    handleDrag.mockClear();
    fireEvent.mouseMove(document, { button: 0, clientX: 50, clientY: 50 });
    expect(handleDrag).not.toHaveBeenCalled();
  });

  it('does not throw when optional callbacks are omitted', () => {
    expect(() => {
      render(
        <Window
          id="win-x"
          appId="finder"
          x={0}
          y={0}
          width={400}
          height={300}
          zIndex={1}
        >
          <span>body</span>
        </Window>,
      );
      fireEvent.mouseDown(screen.getByTestId('window-body'), { button: 0 });
      fireEvent.click(screen.getByTestId('window-close'));
      fireEvent.click(screen.getByTestId('window-minimize'));
      fireEvent.click(screen.getByTestId('window-fullscreen'));
      const bar = screen.getByTestId('titlebar');
      fireEvent.mouseDown(bar, { button: 0, clientX: 0, clientY: 0 });
      fireEvent.mouseMove(document, { button: 0, clientX: 10, clientY: 10 });
      fireEvent.mouseUp(document);
    }).not.toThrow();
  });

  it('renders a resize handle positioned at the bottom-right corner', () => {
    renderWindow();
    const handle = screen.getByTestId('window-resize');
    expect(handle).toBeInTheDocument();
    const cls = handle.getAttribute('class') ?? '';
    expect(cls).toContain('absolute');
    expect(cls).toContain('bottom-0');
    expect(cls).toContain('right-0');
    expect(cls).toContain('cursor-nwse-resize');
  });

  it('resizes via mouse events and calls onResize(id, newWidth, newHeight)', () => {
    const handleResize = vi.fn();
    renderWindow({ width: 800, height: 500, onResize: handleResize });

    const handle = screen.getByTestId('window-resize');
    fireEvent.mouseDown(handle, {
      button: 0,
      clientX: 800,
      clientY: 500,
    });
    fireEvent.mouseMove(document, {
      button: 0,
      clientX: 900,
      clientY: 620,
    });
    expect(handleResize).toHaveBeenCalled();
    expect(handleResize).toHaveBeenCalledWith('win-1', 900, 620);
    fireEvent.mouseUp(document);
  });

  it('clamps the resize delta to the minimum window size', () => {
    const handleResize = vi.fn();
    renderWindow({ width: 800, height: 500, onResize: handleResize });

    const handle = screen.getByTestId('window-resize');
    // Drag toward the top-left so the requested size would go below
    // the minimums (240x160).
    fireEvent.mouseDown(handle, {
      button: 0,
      clientX: 800,
      clientY: 500,
    });
    fireEvent.mouseMove(document, {
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    expect(handleResize).toHaveBeenCalled();
    expect(handleResize).toHaveBeenCalledWith('win-1', 240, 160);
    fireEvent.mouseUp(document);
  });

  it('does not resize when a non-primary button is pressed on the resize handle', () => {
    const handleResize = vi.fn();
    renderWindow({ width: 800, height: 500, onResize: handleResize });

    const handle = screen.getByTestId('window-resize');
    fireEvent.mouseDown(handle, {
      button: 2,
      clientX: 800,
      clientY: 500,
    });
    fireEvent.mouseMove(document, {
      button: 0,
      clientX: 900,
      clientY: 600,
    });
    expect(handleResize).not.toHaveBeenCalled();
    fireEvent.mouseUp(document);
  });

  it('stops resizing after mouseup so subsequent moves do not call onResize', () => {
    const handleResize = vi.fn();
    renderWindow({ width: 800, height: 500, onResize: handleResize });

    const handle = screen.getByTestId('window-resize');
    fireEvent.mouseDown(handle, {
      button: 0,
      clientX: 800,
      clientY: 500,
    });
    fireEvent.mouseMove(document, {
      button: 0,
      clientX: 900,
      clientY: 620,
    });
    expect(handleResize).toHaveBeenCalled();

    fireEvent.mouseUp(document);
    handleResize.mockClear();
    fireEvent.mouseMove(document, {
      button: 0,
      clientX: 1000,
      clientY: 700,
    });
    expect(handleResize).not.toHaveBeenCalled();
  });
});
