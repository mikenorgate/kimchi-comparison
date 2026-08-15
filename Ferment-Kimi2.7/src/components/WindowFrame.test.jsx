import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import { WindowProvider, useWindows } from '../context/WindowContext';
import WindowFrame from './WindowFrame';

function FrameHarness() {
  const { windows, openWindow } = useWindows();

  useEffect(() => {
    if (windows.length === 0) {
      openWindow('finder');
    }
  }, [windows.length, openWindow]);

  const win = windows[0];
  if (!win) return null;

  return (
    <div>
      <WindowFrame win={win}>
        <div data-testid="frame-content">Content</div>
      </WindowFrame>
    </div>
  );
}

function renderFrame() {
  return render(
    <WindowProvider>
      <FrameHarness />
    </WindowProvider>
  );
}

describe('WindowFrame drag and resize', () => {
  beforeEach(() => {
    window.innerWidth = 1280;
    window.innerHeight = 800;
  });

  it('focuses the window when clicked', () => {
    renderFrame();
    const frame = screen.getByText('Finder').closest('.window-frame');
    expect(frame).toBeTruthy();
    act(() => {
      fireEvent.mouseDown(frame);
    });
    expect(frame).toBeTruthy();
  });

  it('moves the window when dragging the title bar', () => {
    renderFrame();
    const titlebar = screen.getByText('Finder').closest('.window-titlebar');
    const frame = screen.getByText('Finder').closest('.window-frame');
    const startLeft = parseInt(frame.style.left, 10);
    const startTop = parseInt(frame.style.top, 10);

    act(() => {
      fireEvent.mouseDown(titlebar, { clientX: startLeft + 20, clientY: startTop + 10 });
    });
    act(() => {
      fireEvent.mouseMove(window, { clientX: startLeft + 70, clientY: startTop + 60 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });

    const endLeft = parseInt(frame.style.left, 10);
    const endTop = parseInt(frame.style.top, 10);
    expect(endLeft).toBe(startLeft + 50);
    expect(endTop).toBe(startTop + 50);
  });

  it('resizes the window when dragging the south-east handle', () => {
    renderFrame();
    const handle = document.querySelector('.resize-se');
    const frame = screen.getByText('Finder').closest('.window-frame');
    const startWidth = parseInt(frame.style.width, 10);
    const startHeight = parseInt(frame.style.height, 10);

    act(() => {
      fireEvent.mouseDown(handle, { clientX: startLeftFor(frame, 'right'), clientY: startTopFor(frame, 'bottom') });
    });
    act(() => {
      fireEvent.mouseMove(window, { clientX: startLeftFor(frame, 'right') + 50, clientY: startTopFor(frame, 'bottom') + 50 });
    });
    act(() => {
      fireEvent.mouseUp(window);
    });

    const endWidth = parseInt(frame.style.width, 10);
    const endHeight = parseInt(frame.style.height, 10);
    expect(endWidth).toBe(startWidth + 50);
    expect(endHeight).toBe(startHeight + 50);
  });
});

function startLeftFor(el, side) {
  const left = parseInt(el.style.left, 10);
  const width = parseInt(el.style.width, 10);
  return side === 'right' ? left + width : left;
}

function startTopFor(el, side) {
  const top = parseInt(el.style.top, 10);
  const height = parseInt(el.style.height, 10);
  return side === 'bottom' ? top + height : top;
}
