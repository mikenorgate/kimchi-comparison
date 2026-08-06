import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { WindowState } from './types';
import { getApp } from './appRegistry';

let zCounter = 1;

interface OpenOptions {
  title?: string;
  width?: number;
  height?: number;
}

interface WindowStore {
  windows: WindowState[];
  focusedId: string | null;
  openApp: (appId: string, opts?: OpenOptions) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  moveResize: (id: string, bounds: Partial<Pick<WindowState, 'x' | 'y' | 'width' | 'height'>>) => void;
  setTitle: (id: string, title: string) => void;
  isAppRunning: (appId: string) => boolean;
  windowsForApp: (appId: string) => WindowState[];
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedId: null,

  openApp: (appId, opts) => {
    const app = getApp(appId);
    if (!app) return '';

    const existing = get().windows.find((w) => w.appId === appId && !app.functional);
    if (existing) {
      get().focusWindow(existing.id);
      if (existing.minimized) get().restoreWindow(existing.id);
      return existing.id;
    }

    const id = uuid();
    const count = get().windows.length;
    const width = opts?.width ?? app.defaultSize.width;
    const height = opts?.height ?? app.defaultSize.height;
    const win: WindowState = {
      id,
      appId,
      title: opts?.title ?? app.title,
      x: 80 + (count % 6) * 40,
      y: 60 + (count % 6) * 32,
      width,
      height,
      z: ++zCounter,
      minimized: false,
      maximized: false,
    };
    set((s) => ({ windows: [...s.windows, win], focusedId: id }));
    return id;
  },

  closeWindow: (id) => {
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== id),
      focusedId: s.focusedId === id ? null : s.focusedId,
    }));
  },

  focusWindow: (id) => {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, z: ++zCounter, minimized: false } : w)),
      focusedId: id,
    }));
  },

  minimizeWindow: (id) => {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      focusedId: s.focusedId === id ? null : s.focusedId,
    }));
  },

  restoreWindow: (id) => {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false, z: ++zCounter } : w)),
      focusedId: id,
    }));
  },

  toggleMaximize: (id) => {
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized) {
          const prev = w.prevBounds ?? { x: 80, y: 60, width: w.width, height: w.height };
          return { ...w, maximized: false, ...prev, prevBounds: undefined };
        }
        return {
          ...w,
          maximized: true,
          prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
        };
      }),
    }));
  },

  moveResize: (id, bounds) => {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, ...bounds } : w)),
    }));
  },

  setTitle: (id, title) => {
    set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, title } : w)) }));
  },

  isAppRunning: (appId) => get().windows.some((w) => w.appId === appId),
  windowsForApp: (appId) => get().windows.filter((w) => w.appId === appId),
}));
