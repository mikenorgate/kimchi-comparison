import { useMemo } from 'react';

import { useOSStore } from '../store/osStore';
import type { WindowInstance } from '../types/os';

/**
 * Shape of the actions returned by `useWindow`. They mirror the store's
 * window lifecycle actions but are pre-bound to a specific `windowId`,
 * so callers don't have to thread the id through every call.
 */
export interface UseWindowActions {
  /** Bring the window to the front and mark it focused. */
  focus: () => void;
  /** Close (remove) the window from the store. */
  close: () => void;
  /** Hide the window. Stays in `store.windows` but is not rendered. */
  minimize: () => void;
  /** Restore a minimized/maximized window to its previous geometry. */
  restore: () => void;
  /** Toggle maximize state. */
  maximize: () => void;
  /** Move the window to an absolute viewport position. */
  move: (x: number, y: number) => void;
  /** Resize the window to the given width/height. */
  resize: (width: number, height: number) => void;
  /** Update the window's title shown in the title bar. */
  setTitle: (title: string) => void;
}

export interface UseWindowResult {
  /** The window instance from the store, or null if it doesn't exist. */
  window: WindowInstance | null;
  /** Whether the window currently has focus. */
  isFocused: boolean;
  /** Convenience actions, pre-bound to this window's id. */
  actions: UseWindowActions;
}

/**
 * Subscribe to a single window by id. Returns the latest window state
 * (or `null` if the window has been closed) plus convenience actions
 * bound to that id.
 *
 * Selector returns `undefined` for unknown ids so we can cheaply skip
 * work; callers receive `null` for missing windows.
 */
export function useWindow(windowId: string): UseWindowResult {
  const window = useOSStore((state) =>
    state.windows.find((w) => w.id === windowId),
  );
  const isFocused = window?.isFocused ?? false;

  const focus = useOSStore((state) => state.focusWindow);
  const close = useOSStore((state) => state.closeWindow);
  const minimize = useOSStore((state) => state.minimizeWindow);
  const restore = useOSStore((state) => state.restoreWindow);
  const maximize = useOSStore((state) => state.maximizeWindow);
  const move = useOSStore((state) => state.moveWindow);
  const resize = useOSStore((state) => state.resizeWindow);
  const setTitle = useOSStore((state) => state.setWindowTitle);

  const actions = useMemo<UseWindowActions>(
    () => ({
      focus: () => focus(windowId),
      close: () => close(windowId),
      minimize: () => minimize(windowId),
      restore: () => restore(windowId),
      maximize: () => maximize(windowId),
      move: (x, y) => move(windowId, x, y),
      resize: (width, height) => resize(windowId, width, height),
      setTitle: (title) => setTitle(windowId, title),
    }),
    [
      close,
      focus,
      maximize,
      minimize,
      move,
      resize,
      restore,
      setTitle,
      windowId,
    ],
  );

  return useMemo<UseWindowResult>(
    () => ({
      window: window ?? null,
      isFocused,
      actions,
    }),
    [window, isFocused, actions],
  );
}

export default useWindow;
