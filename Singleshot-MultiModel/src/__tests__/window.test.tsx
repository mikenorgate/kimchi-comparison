import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import WindowManager from '../components/WindowManager';
import Window from '../components/Window';
import { useWindowStore } from '../stores/windowStore';

// RTL's fireEvent.pointerMove doesn't reliably propagate clientX/clientY
// to listeners attached via window.addEventListener in jsdom. Dispatching
// MouseEvents directly works because the hook only reads clientX/clientY.
function dispatchPointer(
  target: EventTarget,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  clientX: number,
  clientY: number,
) {
  const event = new MouseEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
}

beforeEach(() => {
  localStorage.clear();
  useWindowStore.setState({
    windows: {},
    windowOrder: [],
    activeWindowId: null,
    zCounter: 100,
  });
});

afterEach(() => {
  localStorage.clear();
  // Clean up any global pointer listeners a window may have left behind.
});

describe('WindowManager', () => {
  it('renders one window per id in windowOrder', () => {
    let id1 = '';
    let id2 = '';
    act(() => {
      id1 = useWindowStore.getState().openWindow('finder');
      id2 = useWindowStore.getState().openWindow('calculator');
    });
    render(<WindowManager />);
    expect(screen.getByTestId(`window-${id1}`)).toBeInTheDocument();
    expect(screen.getByTestId(`window-${id2}`)).toBeInTheDocument();
  });

  it('focusing a window increments its z-index above siblings', () => {
    let id1 = '';
    let id2 = '';
    act(() => {
      id1 = useWindowStore.getState().openWindow('finder');
      id2 = useWindowStore.getState().openWindow('calculator');
    });
    render(<WindowManager />);
    const before = useWindowStore.getState().windows[id1].zIndex;
    act(() => {
      fireEvent.pointerDown(screen.getByTestId(`window-${id1}`));
    });
    const after = useWindowStore.getState().windows[id1].zIndex;
    expect(after).toBeGreaterThan(before);
    expect(useWindowStore.getState().activeWindowId).toBe(id1);
    // Focused window's z-index should now exceed the other window's.
    expect(useWindowStore.getState().windows[id1].zIndex).toBeGreaterThan(
      useWindowStore.getState().windows[id2].zIndex,
    );
  });

  it('minimizing hides the window and the window element is removed from the DOM', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    render(<WindowManager />);
    expect(screen.getByTestId(`window-${id}`)).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByTestId(`minimize-${id}`));
    });
    expect(useWindowStore.getState().windows[id].minimized).toBe(true);
    expect(screen.queryByTestId(`window-${id}`)).not.toBeInTheDocument();
  });

  it('restoring after minimize shows the window again', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    render(<WindowManager />);
    act(() => {
      useWindowStore.getState().minimizeWindow(id);
    });
    expect(screen.queryByTestId(`window-${id}`)).not.toBeInTheDocument();
    act(() => {
      useWindowStore.getState().restoreWindow(id);
    });
    expect(screen.getByTestId(`window-${id}`)).toBeInTheDocument();
    expect(useWindowStore.getState().windows[id].minimized).toBe(false);
  });

  it('maximizing sets maximized and stores previous bounds; restore reverts to those bounds', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    render(<WindowManager />);
    const original = useWindowStore.getState().windows[id];
    act(() => {
      fireEvent.click(screen.getByTestId(`maximize-${id}`));
    });
    const maximized = useWindowStore.getState().windows[id];
    expect(maximized.maximized).toBe(true);
    expect(maximized.prevBounds).toBeDefined();
    expect(maximized.prevBounds?.width).toBe(original.width);
    expect(maximized.prevBounds?.height).toBe(original.height);
    expect(maximized.prevBounds?.x).toBe(original.x);
    expect(maximized.prevBounds?.y).toBe(original.y);

    // Click maximize again to restore.
    act(() => {
      fireEvent.click(screen.getByTestId(`maximize-${id}`));
    });
    const restored = useWindowStore.getState().windows[id];
    expect(restored.maximized).toBe(false);
    expect(restored.width).toBe(original.width);
    expect(restored.height).toBe(original.height);
    expect(restored.x).toBe(original.x);
    expect(restored.y).toBe(original.y);
  });

  it('closing removes the window from the store and the DOM', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    render(<WindowManager />);
    expect(screen.getByTestId(`window-${id}`)).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByTestId(`close-${id}`));
    });
    expect(useWindowStore.getState().windows[id]).toBeUndefined();
    expect(useWindowStore.getState().windowOrder).not.toContain(id);
    expect(screen.queryByTestId(`window-${id}`)).not.toBeInTheDocument();
  });
});

describe('Window dragging', () => {
  it('dragging the title bar updates x and y on the store', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    const startX = useWindowStore.getState().windows[id].x;
    const startY = useWindowStore.getState().windows[id].y;
    render(<WindowManager />);

    const titlebar = screen.getByTestId(`titlebar-${id}`);
    act(() => {
      dispatchPointer(titlebar, 'pointerdown', 150, 90);
    });

    act(() => {
      dispatchPointer(window, 'pointermove', 200, 140);
    });
    act(() => {
      dispatchPointer(window, 'pointermove', 260, 180);
    });

    act(() => {
      dispatchPointer(window, 'pointerup', 260, 180);
    });

    const win = useWindowStore.getState().windows[id];
    expect(win.x).toBe(startX + 110);
    expect(win.y).toBe(startY + 90);
  });
});

describe('Window resize', () => {
  it('resizing from the SE handle grows width and height', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    const startW = useWindowStore.getState().windows[id].width;
    const startH = useWindowStore.getState().windows[id].height;
    render(<WindowManager />);

    const handle = screen.getByTestId(`resize-se-${id}`);
    act(() => {
      dispatchPointer(handle, 'pointerdown', 1000, 600);
    });

    act(() => {
      dispatchPointer(window, 'pointermove', 1080, 680);
    });
    act(() => {
      dispatchPointer(window, 'pointerup', 1080, 680);
    });

    const win = useWindowStore.getState().windows[id];
    expect(win.width).toBe(startW + 80);
    expect(win.height).toBe(startH + 80);
  });

  it('resizing clamps to minWidth/minHeight from the SW handle', () => {
    let id = '';
    act(() => {
      id = useWindowStore.getState().openWindow('finder');
    });
    const minW = useWindowStore.getState().windows[id].minWidth;
    const minH = useWindowStore.getState().windows[id].minHeight;
    render(<WindowManager />);

    // The handle's client position is irrelevant; we just want the SW anchor.
    const handle = screen.getByTestId(`resize-sw-${id}`);
    act(() => {
      dispatchPointer(handle, 'pointerdown', 500, 500);
    });

    // Drag far past the minimum (large positive dx shrinks width on W edge,
    // large positive dy grows height on S edge — but W clamps to minWidth).
    act(() => {
      dispatchPointer(window, 'pointermove', 5000, 5000);
    });
    act(() => {
      dispatchPointer(window, 'pointerup', 5000, 5000);
    });

    const win = useWindowStore.getState().windows[id];
    expect(win.width).toBe(minW);
    // Height grows freely (S edge).
    expect(win.height).toBeGreaterThanOrEqual(minH);
  });
});

describe('Window focus', () => {
  it('clicking a window focuses it and bumps zCounter', () => {
    let id1 = '';
    let id2 = '';
    act(() => {
      id1 = useWindowStore.getState().openWindow('finder');
      id2 = useWindowStore.getState().openWindow('calculator');
    });
    render(<WindowManager />);

    const zBefore = useWindowStore.getState().zCounter;
    act(() => {
      fireEvent.pointerDown(screen.getByTestId(`window-${id1}`));
    });
    const state = useWindowStore.getState();
    expect(state.activeWindowId).toBe(id1);
    expect(state.zCounter).toBeGreaterThan(zBefore);
    expect(state.windows[id1].zIndex).toBeGreaterThan(state.windows[id2].zIndex);
  });
});

describe('Direct Window component', () => {
  it('returns null for an unknown id', () => {
    const { container } = render(<Window windowId="nope" />);
    expect(container.firstChild).toBeNull();
  });
});
