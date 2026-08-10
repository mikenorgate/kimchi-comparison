import { create } from 'zustand';
import type { WindowState } from '../types';
import { useAppRegistry } from '../lib/apps';

const DEFAULT_Z = 100;

export interface OpenWindowOptions {
  title?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface WindowStoreState {
  windows: Record<string, WindowState>;
  windowOrder: string[];
  activeWindowId: string | null;
  zCounter: number;

  openWindow: (appId: string, opts?: OpenWindowOptions) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
  setTitle: (id: string, title: string) => void;
}

function generateWindowId(): string {
  return `window-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: {},
  windowOrder: [],
  activeWindowId: null,
  zCounter: DEFAULT_Z,

  openWindow: (appId, opts = {}) => {
    const def = useAppRegistry.getState().apps[appId];
    if (!def) return '';

    const id = generateWindowId();
    const nextZ = get().zCounter + 1;
    const width = opts.width ?? def.defaultSize.width;
    const height = opts.height ?? def.defaultSize.height;
    const offset = get().windowOrder.length * 24;
    const x = opts.x ?? 120 + offset;
    const y = opts.y ?? 80 + offset;

    const win: WindowState = {
      id,
      appId,
      title: opts.title ?? def.defaultTitle,
      x,
      y,
      width,
      height,
      minWidth: def.minSize.width,
      minHeight: def.minSize.height,
      zIndex: nextZ,
      minimized: false,
      maximized: false,
    };

    set((state) => ({
      windows: { ...state.windows, [id]: win },
      windowOrder: [...state.windowOrder, id],
      activeWindowId: id,
      zCounter: nextZ,
    }));

    return id;
  },

  closeWindow: (id) => {
    set((state) => {
      if (!state.windows[id]) return state;
      const rest: Record<string, WindowState> = {};
      for (const [wid, win] of Object.entries(state.windows)) {
        if (wid !== id) rest[wid] = win;
      }
      const order = state.windowOrder.filter((wid) => wid !== id);
      let active = state.activeWindowId;
      let nextZ = state.zCounter;
      if (active === id) {
        active = order.length ? order[order.length - 1] : null;
        if (active && rest[active]) {
          nextZ = state.zCounter + 1;
          rest[active] = { ...rest[active], zIndex: nextZ };
        }
      }
      return {
        windows: rest,
        windowOrder: order,
        activeWindowId: active,
        zCounter: nextZ,
      };
    });
  },

  focusWindow: (id) => {
    const win = get().windows[id];
    if (!win) return;
    if (win.minimized) {
      set((state) => ({
        windows: { ...state.windows, [id]: { ...win, minimized: false } },
        activeWindowId: id,
      }));
      return;
    }
    const nextZ = get().zCounter + 1;
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: { ...win, zIndex: nextZ },
      },
      activeWindowId: id,
      zCounter: nextZ,
    }));
  },

  minimizeWindow: (id) => {
    const win = get().windows[id];
    if (!win) return;
    set((state) => {
      const nextActive =
        state.activeWindowId === id
          ? state.windowOrder.filter((wid) => wid !== id && !state.windows[wid]?.minimized).pop() ??
            null
          : state.activeWindowId;
      return {
        windows: { ...state.windows, [id]: { ...win, minimized: true } },
        activeWindowId: nextActive,
      };
    });
  },

  restoreWindow: (id) => {
    const win = get().windows[id];
    if (!win) return;
    const nextZ = get().zCounter + 1;
    set((state) => ({
      windows: { ...state.windows, [id]: { ...win, minimized: false, zIndex: nextZ } },
      activeWindowId: id,
      zCounter: nextZ,
    }));
  },

  maximizeWindow: (id) => {
    const win = get().windows[id];
    if (!win || win.maximized) return;
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...win,
          maximized: true,
          prevBounds: { x: win.x, y: win.y, width: win.width, height: win.height },
        },
      },
    }));
  },

  toggleMaximize: (id) => {
    const win = get().windows[id];
    if (!win) return;
    if (win.maximized && win.prevBounds) {
      const prev = win.prevBounds;
      set((state) => ({
        windows: {
          ...state.windows,
          [id]: {
            ...win,
            maximized: false,
            x: prev.x,
            y: prev.y,
            width: prev.width,
            height: prev.height,
          },
        },
      }));
    } else {
      get().maximizeWindow(id);
    }
  },

  moveWindow: (id, x, y) => {
    const win = get().windows[id];
    if (!win || win.maximized) return;
    set((state) => ({
      windows: { ...state.windows, [id]: { ...win, x, y } },
    }));
  },

  resizeWindow: (id, width, height) => {
    const win = get().windows[id];
    if (!win || win.maximized) return;
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...win,
          width: Math.max(win.minWidth, width),
          height: Math.max(win.minHeight, height),
        },
      },
    }));
  },

  setTitle: (id, title) => {
    const win = get().windows[id];
    if (!win) return;
    set((state) => ({
      windows: { ...state.windows, [id]: { ...win, title } },
    }));
  },
}));
