import type { AppId } from '../apps/types';

export interface WindowState {
  id: string;
  appId: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  zIndex: number;
}

export interface WindowsState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
  nextWindowNumber: number;
}

export interface WindowManagerStore {
  readonly state: WindowsState;
  openWindow(appId: AppId): void;
  closeWindow(windowId: string): void;
  minimizeWindow(windowId: string): void;
  focusWindow(windowId: string): void;
  moveWindow(windowId: string, deltaX: number, deltaY: number): void;
  getWindowById(windowId: string): WindowState | undefined;
  readonly openWindows: WindowState[];
  subscribe(listener: () => void): () => void;
}

const DEFAULT_WINDOW_WIDTH = 800;
const DEFAULT_WINDOW_HEIGHT = 600;
const DEFAULT_WINDOW_X = 100;
const DEFAULT_WINDOW_Y = 100;
const CASCADE_OFFSET = 24;
const INITIAL_Z_INDEX = 10;

function createInitialState(): WindowsState {
  return {
    windows: [],
    activeWindowId: null,
    nextZIndex: INITIAL_Z_INDEX,
    nextWindowNumber: 1,
  };
}

export function createWindowManagerStore(
  initialState: WindowsState = createInitialState()
): WindowManagerStore {
  let state = initialState;
  const listeners = new Set<() => void>();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const setState = (next: WindowsState): void => {
    state = next;
    notify();
  };

  const openWindow = (appId: AppId): void => {
    const count = state.windows.length;
    const id = `window-${state.nextWindowNumber}`;
    const newWindow: WindowState = {
      id,
      appId,
      x: DEFAULT_WINDOW_X + count * CASCADE_OFFSET,
      y: DEFAULT_WINDOW_Y + count * CASCADE_OFFSET,
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
      isMinimized: false,
      zIndex: state.nextZIndex,
    };
    setState({
      ...state,
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      nextZIndex: state.nextZIndex + 1,
      nextWindowNumber: state.nextWindowNumber + 1,
    });
  };

  const closeWindow = (windowId: string): void => {
    const remaining = state.windows.filter((w) => w.id !== windowId);
    let nextActiveId = state.activeWindowId;
    if (state.activeWindowId === windowId) {
      const top = remaining
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      nextActiveId = top ? top.id : null;
    }
    setState({
      ...state,
      windows: remaining,
      activeWindowId: nextActiveId,
    });
  };

  const minimizeWindow = (windowId: string): void => {
    const windows = state.windows.map((w) =>
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    );
    const minimized = windows.find((w) => w.id === windowId)?.isMinimized ?? false;
    let nextActiveId = state.activeWindowId;
    if (state.activeWindowId === windowId && minimized) {
      const top = windows
        .filter((w) => w.id !== windowId && !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      nextActiveId = top ? top.id : null;
    }
    setState({
      ...state,
      windows,
      activeWindowId: nextActiveId,
    });
  };

  const focusWindow = (windowId: string): void => {
    const exists = state.windows.some((w) => w.id === windowId);
    if (!exists) return;
    const windows = state.windows.map((w) =>
      w.id === windowId
        ? { ...w, zIndex: state.nextZIndex, isMinimized: false }
        : w
    );
    setState({
      ...state,
      windows,
      activeWindowId: windowId,
      nextZIndex: state.nextZIndex + 1,
    });
  };

  const moveWindow = (windowId: string, deltaX: number, deltaY: number): void => {
    const windows = state.windows.map((w) =>
      w.id === windowId
        ? { ...w, x: w.x + deltaX, y: w.y + deltaY }
        : w
    );
    setState({
      ...state,
      windows,
    });
  };

  const getWindowById = (windowId: string): WindowState | undefined =>
    state.windows.find((w) => w.id === windowId);

  return {
    get state() {
      return state;
    },
    get openWindows() {
      return state.windows;
    },
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    moveWindow,
    getWindowById,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
