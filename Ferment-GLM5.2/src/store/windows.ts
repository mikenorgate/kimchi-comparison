/**
 * Window Store — Zustand store managing all open windows on the desktop.
 *
 * State:
 * - windows: array of WindowState objects
 * - focusedId: ID of the currently focused window (null = desktop focused)
 * - currentSpace: active Space index (0-based)
 *
 * Actions:
 * - openWindow(appId): opens a new window for an app (or focuses existing)
 * - closeWindow(id): closes a window
 * - focusWindow(id): brings window to front
 * - minimizeWindow(id): minimizes window to Dock
 * - toggleMaximize(id): toggles fullscreen/maximized
 * - restoreWindow(id): un-minimizes a window
 * - updateWindowPosition(id, x, y): drag move (deprecated alias for setWindowPosition)
 * - updateWindowSize(id, w, h): resize (deprecated alias for setWindowSize)
 * - nextSpace / prevSpace: switch Spaces
 *
 * Persistence: NOT persisted to localStorage (windows don't survive reload —
 * matching real macOS behavior for app state that isn't document data).
 */

import { create } from 'zustand';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  space: number; // which Space this window is on
  zIndex: number;
}

interface WindowStoreState {
  windows: WindowState[];
  focusedId: string | null;
  currentSpace: number;
  zCounter: number;

  openWindow: (appId: string, title?: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  /** @deprecated Use setWindowPosition instead */
  updateWindowPosition: (id: string, x: number, y: number) => void;
  /** @deprecated Use setWindowSize instead */
  updateWindowSize: (id: string, w: number, h: number) => void;
  setWindowPosition: (id: string, x: number, y: number) => void;
  setWindowSize: (id: string, w: number, h: number) => void;
  nextSpace: () => void;
  prevSpace: () => void;
  getRunningApps: () => Set<string>;
}

let idCounter = 0;

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 440;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const MAX_SPACES = 2;

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: [],
  focusedId: null,
  currentSpace: 0,
  zCounter: 100,

  openWindow: (appId, title) => {
    const state = get();
    // Check if a window for this app already exists on the current space
    const existing = state.windows.find(
      (w) => w.appId === appId && w.space === state.currentSpace
    );
    if (existing) {
      // Focus or un-minimize it
      set((s) => ({
        focusedId: existing.id,
        zCounter: s.zCounter + 1,
        windows: s.windows.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, zIndex: s.zCounter + 1 }
            : w
        ),
      }));
      return;
    }

    const id = `win-${++idCounter}`;
    const z = state.zCounter + 1;
    const offset = (state.windows.length % 5) * 24;
    const newWindow: WindowState = {
      id,
      appId,
      title: title ?? appId.charAt(0).toUpperCase() + appId.slice(1),
      x: 120 + offset,
      y: 60 + offset,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      minimized: false,
      maximized: false,
      space: state.currentSpace,
      zIndex: z,
    };
    set((s) => ({
      windows: [...s.windows, newWindow],
      focusedId: id,
      zCounter: z,
    }));
  },

  closeWindow: (id) => {
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id);
      const focusedId =
        s.focusedId === id
          ? windows.length > 0
            ? windows[windows.length - 1].id
            : null
          : s.focusedId;
      return { windows, focusedId };
    });
  },

  focusWindow: (id) => {
    set((s) => {
      const z = s.zCounter + 1;
      return {
        focusedId: id,
        zCounter: z,
        windows: s.windows.map((w) =>
          w.id === id ? { ...w, zIndex: z, minimized: false } : w
        ),
      };
    });
  },

  minimizeWindow: (id) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
      focusedId: s.focusedId === id ? null : s.focusedId,
    }));
  },

  restoreWindow: (id) => {
    set((s) => {
      const z = s.zCounter + 1;
      return {
        windows: s.windows.map((w) =>
          w.id === id ? { ...w, minimized: false, zIndex: z } : w
        ),
        focusedId: id,
        zCounter: z,
      };
    });
  },

  toggleMaximize: (id) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      ),
    }));
  },

  // Deprecated aliases — Window.tsx uses setWindowPosition/setWindowSize directly.
  // Kept for API compatibility but delegate to the primary methods.
  updateWindowPosition: (id, x, y) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    }));
  },

  updateWindowSize: (id, w, h) => {
    const fw = Math.max(MIN_WIDTH, w);
    const fh = Math.max(MIN_HEIGHT, h);
    set((s) => ({
      windows: s.windows.map((win) =>
        win.id === id ? { ...win, width: fw, height: fh } : win
      ),
    }));
  },

  setWindowPosition: (id, x, y) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    }));
  },

  setWindowSize: (id, w, h) => {
    const fw = Math.max(MIN_WIDTH, w);
    const fh = Math.max(MIN_HEIGHT, h);
    set((s) => ({
      windows: s.windows.map((win) =>
        win.id === id ? { ...win, width: fw, height: fh } : win
      ),
    }));
  },

  nextSpace: () => {
    set((s) => ({
      currentSpace: Math.min(s.currentSpace + 1, MAX_SPACES - 1),
      focusedId: null,
    }));
  },

  prevSpace: () => {
    set((s) => ({
      currentSpace: Math.max(s.currentSpace - 1, 0),
      focusedId: null,
    }));
  },

  getRunningApps: () => {
    const state = get();
    const apps = new Set<string>();
    state.windows.forEach((w) => {
      if (w.space === state.currentSpace || w.minimized) {
        apps.add(w.appId);
      }
    });
    // Finder is always running
    apps.add('finder');
    return apps;
  },
}));

export const WINDOW_MIN_WIDTH = MIN_WIDTH;
export const WINDOW_MIN_HEIGHT = MIN_HEIGHT;
