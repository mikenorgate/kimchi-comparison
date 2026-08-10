import { describe, it, expect } from 'vitest';
import {
  OPEN,
  CLOSE,
  MINIMIZE,
  RESTORE,
  FOCUS,
  DRAG,
  RESIZE,
  FULLSCREEN,
  windowReducer,
  initialState,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
} from '../windowReducer.js';

function openApp(state, appId) {
  return windowReducer(state, { type: OPEN, appId });
}

describe('windowReducer', () => {
  it('exposes the documented initial state', () => {
    expect(initialState).toEqual({
      windows: [],
      nextZIndex: 1,
      activeAppId: null,
    });
  });

  it('OPEN creates a new window with default geometry and activeAppId', () => {
    const state = openApp(initialState, 'Finder');
    expect(state.windows).toHaveLength(1);
    const win = state.windows[0];
    expect(win.appId).toBe('Finder');
    expect(win.minimized).toBe(false);
    expect(win.width).toBe(DEFAULT_WINDOW_WIDTH);
    expect(win.height).toBe(DEFAULT_WINDOW_HEIGHT);
    expect(win.zIndex).toBe(1);
    expect(state.activeAppId).toBe('Finder');
    expect(state.nextZIndex).toBe(2);
    expect(typeof win.id).toBe('string');
    expect(win.id.length).toBeGreaterThan(0);
  });

  it('OPEN cascades subsequent windows so they do not all stack identically', () => {
    let state = initialState;
    state = openApp(state, 'Finder');
    state = openApp(state, 'Safari');
    state = openApp(state, 'Notes');
    expect(state.windows).toHaveLength(3);
    // Cascade means the second window is offset from the first.
    expect(state.windows[1].x).toBeGreaterThan(state.windows[0].x);
    expect(state.windows[1].y).toBeGreaterThan(state.windows[0].y);
    // Default size still applies.
    for (const w of state.windows) {
      expect(w.width).toBe(DEFAULT_WINDOW_WIDTH);
      expect(w.height).toBe(DEFAULT_WINDOW_HEIGHT);
    }
  });

  it('OPEN for an existing non-minimized app focuses the existing window', () => {
    let state = openApp(initialState, 'Finder');
    const firstId = state.windows[0].id;
    state = openApp(state, 'Finder');
    expect(state.windows).toHaveLength(1);
    expect(state.windows[0].id).toBe(firstId);
    expect(state.windows[0].minimized).toBe(false);
    expect(state.activeAppId).toBe('Finder');
  });

  it('OPEN for a minimized app restores the existing window instead of creating a duplicate', () => {
    let state = openApp(initialState, 'Finder');
    const originalId = state.windows[0].id;
    state = windowReducer(state, { type: MINIMIZE, id: originalId });
    expect(state.windows.find((w) => w.id === originalId).minimized).toBe(
      true,
    );
    state = openApp(state, 'Finder');
    // Restored (not duplicated) — there must still be exactly one window.
    expect(state.windows).toHaveLength(1);
    expect(state.windows[0].id).toBe(originalId);
    expect(state.windows[0].minimized).toBe(false);
    expect(state.activeAppId).toBe('Finder');
  });

  it('OPEN for an already-minimized app via Dock click leaves no duplicates', () => {
    // Simulate the full lifecycle that occurs when a user opens an app
    // from the Dock, minimizes it, and clicks the Dock icon again.
    let state = openApp(initialState, 'Safari');
    const safariId = state.windows[0].id;
    state = windowReducer(state, { type: MINIMIZE, id: safariId });
    expect(state.windows).toHaveLength(1);
    expect(state.windows[0].minimized).toBe(true);

    state = openApp(state, 'Safari');

    // Critical: there must still be exactly one Safari window — no
    // duplicate was opened. The window is restored and focused.
    expect(state.windows).toHaveLength(1);
    expect(state.windows[0].id).toBe(safariId);
    expect(state.windows[0].minimized).toBe(false);
    expect(state.activeAppId).toBe('Safari');
  });

  it('CLOSE removes the window and resets activeAppId when it was active', () => {
    let state = openApp(initialState, 'Finder');
    state = openApp(state, 'Safari');
    const safariId = state.windows[1].id;
    state = windowReducer(state, { type: CLOSE, id: safariId });
    expect(state.windows).toHaveLength(1);
    expect(state.windows[0].appId).toBe('Finder');
    // Finder is the only remaining window and it becomes active.
    expect(state.activeAppId).toBe('Finder');
  });

  it('CLOSE sets activeAppId to null when the last window closes', () => {
    let state = openApp(initialState, 'Finder');
    const id = state.windows[0].id;
    state = windowReducer(state, { type: CLOSE, id });
    expect(state.windows).toHaveLength(0);
    expect(state.activeAppId).toBeNull();
  });

  it('CLOSE leaves activeAppId alone when closing a non-active window', () => {
    let state = openApp(initialState, 'Finder');
    state = openApp(state, 'Safari');
    state = windowReducer(state, { type: FOCUS, id: state.windows[1].id });
    expect(state.activeAppId).toBe('Safari');
    const finderId = state.windows[0].id;
    state = windowReducer(state, { type: CLOSE, id: finderId });
    expect(state.activeAppId).toBe('Safari');
  });

  it('MINIMIZE marks the window minimized and picks a new activeAppId', () => {
    let state = openApp(initialState, 'Finder');
    state = openApp(state, 'Safari');
    const finderId = state.windows[0].id;
    const safariId = state.windows[1].id;
    // Safari is on top after opening it second.
    expect(state.activeAppId).toBe('Safari');
    state = windowReducer(state, { type: MINIMIZE, id: safariId });
    expect(state.windows.find((w) => w.id === safariId).minimized).toBe(true);
    expect(state.activeAppId).toBe('Finder');
    // Minimizing the remaining active window leaves nothing active.
    state = windowReducer(state, { type: MINIMIZE, id: finderId });
    expect(state.activeAppId).toBeNull();
  });

  it('RESTORE un-minimizes the window and focuses it', () => {
    let state = openApp(initialState, 'Finder');
    state = openApp(state, 'Safari');
    const safariId = state.windows[1].id;
    state = windowReducer(state, { type: MINIMIZE, id: safariId });
    expect(state.windows.find((w) => w.id === safariId).minimized).toBe(true);
    state = windowReducer(state, { type: RESTORE, id: safariId });
    const restored = state.windows.find((w) => w.id === safariId);
    expect(restored.minimized).toBe(false);
    expect(state.activeAppId).toBe('Safari');
    // Restoring must bump zIndex above any previously focused window.
    const finder = state.windows.find((w) => w.id === state.windows[0].id);
    expect(restored.zIndex).toBeGreaterThan(finder.zIndex);
  });

  it('FOCUS assigns the next zIndex and updates activeAppId', () => {
    let state = openApp(initialState, 'Finder');
    state = openApp(state, 'Safari');
    const finderId = state.windows[0].id;
    const before = state.windows.find((w) => w.id === finderId).zIndex;
    state = windowReducer(state, { type: FOCUS, id: finderId });
    const after = state.windows.find((w) => w.id === finderId).zIndex;
    expect(after).toBeGreaterThan(before);
    expect(state.activeAppId).toBe('Finder');
  });

  it('multiple FOCUS actions produce strictly monotonic zIndex values', () => {
    let state = openApp(initialState, 'Finder');
    state = openApp(state, 'Safari');
    state = openApp(state, 'Notes');
    const ids = state.windows.map((w) => w.id);
    // Focus each window repeatedly and record their zIndex after each pass.
    const observed = [];
    for (let pass = 0; pass < 3; pass++) {
      for (const id of ids) {
        state = windowReducer(state, { type: FOCUS, id });
        observed.push(state.windows.find((w) => w.id === id).zIndex);
      }
    }
    for (let i = 1; i < observed.length; i++) {
      expect(observed[i]).toBeGreaterThan(observed[i - 1]);
    }
  });

  it('DRAG updates x and y by delta and does not change zIndex or activeAppId', () => {
    let state = openApp(initialState, 'Finder');
    state = openApp(state, 'Safari');
    const finderId = state.windows[0].id;
    const before = state.windows.find((w) => w.id === finderId);
    const beforeZ = before.zIndex;
    const beforeActive = state.activeAppId;
    state = windowReducer(state, {
      type: DRAG,
      id: finderId,
      deltaX: 25,
      deltaY: -10,
    });
    const after = state.windows.find((w) => w.id === finderId);
    expect(after.x).toBe(before.x + 25);
    expect(after.y).toBe(before.y - 10);
    expect(after.zIndex).toBe(beforeZ);
    expect(state.activeAppId).toBe(beforeActive);
  });

  it('RESIZE updates width and height without changing position or zIndex', () => {
    let state = openApp(initialState, 'Finder');
    const id = state.windows[0].id;
    const before = state.windows[0];
    state = windowReducer(state, {
      type: RESIZE,
      id,
      width: 1024,
      height: 768,
    });
    const after = state.windows[0];
    expect(after.width).toBe(1024);
    expect(after.height).toBe(768);
    expect(after.x).toBe(before.x);
    expect(after.y).toBe(before.y);
    expect(after.zIndex).toBe(before.zIndex);
  });

  it('FULLSCREEN expands to viewport size and stashes the previous rect', () => {
    let state = openApp(initialState, 'Finder');
    const id = state.windows[0].id;
    const before = state.windows[0];
    state = windowReducer(state, {
      type: FULLSCREEN,
      id,
      isFullscreen: true,
    });
    const full = state.windows[0];
    expect(full.x).toBe(0);
    expect(full.y).toBe(0);
    expect(full.width).toBe(window.innerWidth);
    expect(full.height).toBe(window.innerHeight);
    expect(full.previousRect).toEqual({
      x: before.x,
      y: before.y,
      width: before.width,
      height: before.height,
    });
  });

  it('FULLSCREEN with isFullscreen false restores the previous rect and clears it', () => {
    let state = openApp(initialState, 'Finder');
    const id = state.windows[0].id;
    const before = state.windows[0];
    state = windowReducer(state, {
      type: FULLSCREEN,
      id,
      isFullscreen: true,
    });
    expect(state.windows[0].previousRect).toBeDefined();
    state = windowReducer(state, {
      type: FULLSCREEN,
      id,
      isFullscreen: false,
    });
    const restored = state.windows[0];
    expect(restored.x).toBe(before.x);
    expect(restored.y).toBe(before.y);
    expect(restored.width).toBe(before.width);
    expect(restored.height).toBe(before.height);
    expect(restored.previousRect).toBeUndefined();
  });

  it('FULLSCREEN exiting without a previousRect is a no-op', () => {
    let state = openApp(initialState, 'Finder');
    const id = state.windows[0].id;
    // No previousRect recorded yet.
    const before = state.windows[0];
    state = windowReducer(state, {
      type: FULLSCREEN,
      id,
      isFullscreen: false,
    });
    expect(state.windows[0]).toEqual(before);
  });

  it('unknown action types return state unchanged', () => {
    let state = openApp(initialState, 'Finder');
    const next = windowReducer(state, { type: 'NOPE' });
    expect(next).toBe(state);
  });

  it('CLOSE on an unknown id returns state unchanged', () => {
    let state = openApp(initialState, 'Finder');
    const next = windowReducer(state, { type: CLOSE, id: 'does-not-exist' });
    expect(next).toBe(state);
  });

  it('DRAG and RESIZE on unknown ids return state unchanged', () => {
    let state = openApp(initialState, 'Finder');
    const dragNext = windowReducer(state, {
      type: DRAG,
      id: 'nope',
      deltaX: 5,
      deltaY: 5,
    });
    const resizeNext = windowReducer(state, {
      type: RESIZE,
      id: 'nope',
      width: 1,
      height: 1,
    });
    expect(dragNext).toBe(state);
    expect(resizeNext).toBe(state);
  });
});
