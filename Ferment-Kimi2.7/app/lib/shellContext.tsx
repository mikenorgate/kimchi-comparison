'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useTheme } from '@/app/components/ThemeProvider';
import { APPS, APP_IDS, DEFAULT_APP } from './apps';
import type { AppId, ShellState, WindowState } from './types';

type Action =
  | { type: 'OPEN_APP'; appId: AppId }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MINIMIZE_WINDOW'; id: string }
  | { type: 'RESTORE_WINDOW'; id: string }
  | { type: 'SET_POSITION'; id: string; x: number; y: number }
  | { type: 'SET_SIZE'; id: string; width: number; height: number }
  | { type: 'LOCK' }
  | { type: 'UNLOCK' }
  | { type: 'TOGGLE_SPACES' };

const WINDOW_OFFSET = 28;
const BASE_Z_INDEX = 100;

const initialState: ShellState = {
  windows: [],
  activeWindowId: null,
  activeAppId: DEFAULT_APP,
  dockItems: APP_IDS,
  locked: true,
  showSpaces: false,
};

function nextZIndex(windows: WindowState[]): number {
  if (windows.length === 0) return BASE_Z_INDEX;
  return Math.max(...windows.map((w) => w.zIndex)) + 1;
}

function topUnminimizedWindow(
  windows: WindowState[]
): WindowState | undefined {
  const visible = windows.filter((w) => !w.minimized);
  if (visible.length === 0) return undefined;
  return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
}

function reducer(state: ShellState, action: Action): ShellState {
  switch (action.type) {
    case 'OPEN_APP': {
      const existing = state.windows.find(
        (w) => w.appId === action.appId && !w.minimized
      );
      if (existing) {
        const z = nextZIndex(state.windows);
        const updated = state.windows.map((w) =>
          w.id === existing.id ? { ...w, zIndex: z, minimized: false } : w
        );
        return {
          ...state,
          windows: updated,
          activeWindowId: existing.id,
          activeAppId: action.appId,
          showSpaces: false,
        };
      }

      const app = APPS[action.appId];
      const count = state.windows.filter((w) => w.appId === action.appId).length;
      const z = nextZIndex(state.windows);
      const newWindow: WindowState = {
        id: `${action.appId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        appId: action.appId,
        title: count > 0 ? `${app.defaultTitle} ${count + 1}` : app.defaultTitle,
        x: 80 + state.windows.length * WINDOW_OFFSET,
        y: 80 + state.windows.length * WINDOW_OFFSET,
        width: app.defaultSize.width,
        height: app.defaultSize.height,
        minimized: false,
        zIndex: z,
      };
      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        activeAppId: action.appId,
        showSpaces: false,
      };
    }
    case 'CLOSE_WINDOW': {
      const remaining = state.windows.filter((w) => w.id !== action.id);
      const top = topUnminimizedWindow(remaining);
      return {
        ...state,
        windows: remaining,
        activeWindowId: top?.id ?? null,
        activeAppId: top?.appId ?? DEFAULT_APP,
      };
    }
    case 'FOCUS_WINDOW': {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.minimized) return state;
      const z = nextZIndex(state.windows);
      const updated = state.windows.map((w) =>
        w.id === action.id ? { ...w, zIndex: z } : w
      );
      return {
        ...state,
        windows: updated,
        activeWindowId: action.id,
        activeAppId: target.appId,
      };
    }
    case 'MINIMIZE_WINDOW': {
      const updated = state.windows.map((w) =>
        w.id === action.id ? { ...w, minimized: true } : w
      );
      const top = topUnminimizedWindow(updated);
      return {
        ...state,
        windows: updated,
        activeWindowId: top?.id ?? null,
        activeAppId: top?.appId ?? DEFAULT_APP,
      };
    }
    case 'RESTORE_WINDOW': {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const z = nextZIndex(state.windows);
      const updated = state.windows.map((w) =>
        w.id === action.id ? { ...w, minimized: false, zIndex: z } : w
      );
      return {
        ...state,
        windows: updated,
        activeWindowId: action.id,
        activeAppId: target.appId,
      };
    }
    case 'SET_POSITION': {
      const updated = state.windows.map((w) =>
        w.id === action.id ? { ...w, x: action.x, y: action.y } : w
      );
      return { ...state, windows: updated };
    }
    case 'SET_SIZE': {
      const updated = state.windows.map((w) =>
        w.id === action.id
          ? { ...w, width: action.width, height: action.height }
          : w
      );
      return { ...state, windows: updated };
    }
    case 'LOCK':
      return { ...state, locked: true };
    case 'UNLOCK':
      return { ...state, locked: false };
    case 'TOGGLE_SPACES':
      return { ...state, showSpaces: !state.showSpaces };
    default:
      return state;
  }
}

interface ShellContextValue {
  state: ShellState;
  activeAppId: AppId;
  openApp: (appId: AppId) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  setWindowPosition: (id: string, x: number, y: number) => void;
  setWindowSize: (id: string, width: number, height: number) => void;
  lock: () => void;
  unlock: () => void;
  toggleSpaces: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { resolvedTheme, toggleTheme } = useTheme();

  const openApp = useCallback(
    (appId: AppId) => {
      const minimized = state.windows.find(
        (w) => w.appId === appId && w.minimized
      );
      if (minimized) {
        dispatch({ type: 'RESTORE_WINDOW', id: minimized.id });
        return;
      }
      const existing = state.windows.find(
        (w) => w.appId === appId && !w.minimized
      );
      if (existing) {
        dispatch({ type: 'FOCUS_WINDOW', id: existing.id });
        return;
      }
      dispatch({ type: 'OPEN_APP', appId });
    },
    [state.windows]
  );
  const closeWindow = useCallback(
    (id: string) => dispatch({ type: 'CLOSE_WINDOW', id }),
    []
  );
  const focusWindow = useCallback(
    (id: string) => dispatch({ type: 'FOCUS_WINDOW', id }),
    []
  );
  const minimizeWindow = useCallback(
    (id: string) => dispatch({ type: 'MINIMIZE_WINDOW', id }),
    []
  );
  const restoreWindow = useCallback(
    (id: string) => dispatch({ type: 'RESTORE_WINDOW', id }),
    []
  );
  const setWindowPosition = useCallback(
    (id: string, x: number, y: number) =>
      dispatch({ type: 'SET_POSITION', id, x, y }),
    []
  );
  const setWindowSize = useCallback(
    (id: string, width: number, height: number) =>
      dispatch({ type: 'SET_SIZE', id, width, height }),
    []
  );
  const lock = useCallback(() => dispatch({ type: 'LOCK' }), []);
  const unlock = useCallback(() => dispatch({ type: 'UNLOCK' }), []);
  const toggleSpaces = useCallback(
    () => dispatch({ type: 'TOGGLE_SPACES' }),
    []
  );

  const value = useMemo(
    () => ({
      state,
      activeAppId: state.activeAppId,
      openApp,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      setWindowPosition,
      setWindowSize,
      lock,
      unlock,
      toggleSpaces,
      theme: resolvedTheme,
      toggleTheme,
    }),
    // Callbacks are stable; only state and theme values change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, resolvedTheme, toggleTheme]
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error('useShell must be used within ShellProvider');
  }
  return ctx;
}
