import { describe, expect, it, vi } from 'vitest';
import { createWindowManagerStore } from './windowsStore';

describe('window manager store', () => {
  it('opens a window with default position, size, and highest z-index', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');

    expect(store.openWindows).toHaveLength(1);
    const window = store.openWindows[0];
    expect(window).toMatchObject({
      id: 'window-1',
      appId: 'finder',
      x: 100,
      y: 100,
      width: 800,
      height: 600,
      isMinimized: false,
      zIndex: 10,
    });
    expect(store.state.activeWindowId).toBe('window-1');
    expect(store.state.nextZIndex).toBe(11);
  });

  it('cascades subsequent windows', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    store.openWindow('safari');

    const [first, second] = store.openWindows;
    expect(first.x).toBe(100);
    expect(first.y).toBe(100);
    expect(second.x).toBe(124);
    expect(second.y).toBe(124);
  });

  it('closes a window and removes it from open windows', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    store.closeWindow('window-1');

    expect(store.openWindows).toHaveLength(0);
    expect(store.state.activeWindowId).toBeNull();
  });

  it('activates the next top window when the active window is closed', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    store.openWindow('safari');
    store.openWindow('notes');

    store.closeWindow('window-3');

    expect(store.state.activeWindowId).toBe('window-2');
  });

  it('toggles the minimized flag for a window', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');

    store.minimizeWindow('window-1');
    expect(store.state.windows[0].isMinimized).toBe(true);

    store.minimizeWindow('window-1');
    expect(store.state.windows[0].isMinimized).toBe(false);
  });

  it('sets a new active window when the active window is minimized', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    store.openWindow('safari');

    store.minimizeWindow('window-2');

    expect(store.state.activeWindowId).toBe('window-1');
  });

  it('focuses a window and raises its z-index above others', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    store.openWindow('safari');
    store.openWindow('notes');

    store.focusWindow('window-1');

    const focused = store.getWindowById('window-1');
    expect(focused?.zIndex).toBe(13);
    expect(store.state.activeWindowId).toBe('window-1');
    expect(store.state.nextZIndex).toBe(14);

    const top = store.state.windows.slice().sort((a, b) => b.zIndex - a.zIndex)[0];
    expect(top.id).toBe('window-1');
  });

  it('restores a minimized window when focused', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    store.minimizeWindow('window-1');

    store.focusWindow('window-1');

    expect(store.getWindowById('window-1')?.isMinimized).toBe(false);
    expect(store.state.activeWindowId).toBe('window-1');
  });

  it('ignores focus for an unknown window id', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    const before = store.state;

    store.focusWindow('unknown');

    expect(store.state).toEqual(before);
  });

  it('moves a window by a delta', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');

    store.moveWindow('window-1', 50, -30);

    const window = store.getWindowById('window-1');
    expect(window?.x).toBe(150);
    expect(window?.y).toBe(70);
  });

  it('leaves other windows unchanged when one is moved', () => {
    const store = createWindowManagerStore();
    store.openWindow('finder');
    store.openWindow('safari');

    store.moveWindow('window-2', 10, 20);

    const finder = store.getWindowById('window-1');
    expect(finder?.x).toBe(100);
    expect(finder?.y).toBe(100);
  });

  it('notifies subscribers when state changes', () => {
    const store = createWindowManagerStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.openWindow('finder');
    expect(listener).toHaveBeenCalledTimes(1);

    store.moveWindow('window-1', 1, 1);
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    store.closeWindow('window-1');
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
