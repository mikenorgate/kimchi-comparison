"use client";

import { useCallback, useMemo } from "react";
import type { AppId } from "@/lib/apps";
import { useWindowManager } from "@/components/window/WindowManager";

export interface ShellState {
  readonly activeApp: AppId | null;
  readonly openApps: ReadonlySet<AppId>;
  /**
   * Launch an app via the window manager. If at least one window for
   * the app is already open, the most recently active window is
   * focused (which also un-minimizes it). Otherwise a new window is
   * opened for the app.
   *
   * Keeping this logic behind the shell hook ensures the Dock and any
   * future launcher (Spotlight, Apple menu, etc.) all funnel through
   * the same focus-or-open decision tree.
   */
  readonly launchApp: (id: AppId) => void;
  readonly closeApp: (id: AppId) => void;
}

/**
 * Default active app when no windows are open. Matches the desktop's
 * boot state so the MenuBar never renders an empty active-app slot.
 */
const DEFAULT_ACTIVE_APP: AppId = "finder";

/**
 * Single source of truth for the persistent desktop shell.
 *
 * The Dock and MenuBar both consume this state, which is derived
 * directly from the window manager's `windows` array so the two stay
 * in lockstep without ever going out of sync.
 *
 * - `activeApp` is the focused window's appId, falling back to
 *   `DEFAULT_ACTIVE_APP` whenever there are no windows open (the
 *   MenuBar can then show Finder as the desktop's foreground app).
 * - `openApps` is the unique set of appIds across every non-closed
 *   window, including minimized ones — so a minimized Mail still
 *   counts as "running" for the Dock indicator.
 *
 * `launchApp` performs the macOS-style focus-or-open behaviour: if any
 * window for the app exists, focus the most recently active one
 * (which also restores it from a minimized state); otherwise open a
 * fresh window.
 */
export function useShellState(): ShellState {
  const manager = useWindowManager();
  const { windows, openWindow, focusWindow, closeWindow } = manager;

  const openApps = useMemo<ReadonlySet<AppId>>(() => {
    const ids = new Set<AppId>();
    for (const win of windows) {
      ids.add(win.appId);
    }
    return ids;
  }, [windows]);

  const activeApp: AppId | null = useMemo(() => {
    const activeWin = windows.find((w) => w.id === manager.activeWindowId);
    if (activeWin) return activeWin.appId;
    // No focused window — fall back to the default desktop app so the
    // MenuBar always has a foreground app name to display. Without
    // this, closing every window would blank the active-app slot.
    return DEFAULT_ACTIVE_APP;
  }, [windows, manager.activeWindowId]);

  const launchApp = useCallback(
    (id: AppId) => {
      // macOS behaviour: clicking a Dock icon for an already-running
      // app focuses (and un-minimizes) its most-recently-active
      // window; otherwise it opens a fresh one. We pick the
      // highest-z window so that, when several are open, we bring the
      // most recently used one to the front.
      const candidates = windows.filter((w) => w.appId === id);
      if (candidates.length > 0) {
        const top = candidates.reduce((best, w) =>
          w.zIndex > best.zIndex ? w : best
        );
        focusWindow(top.id);
        return;
      }
      openWindow(id);
    },
    [windows, focusWindow, openWindow]
  );

  const closeApp = useCallback(
    (id: AppId) => {
      // Close every open window for the app, not just the focused one,
      // so clicking the Quit menu item truly tears the app down.
      const matching = windows.filter((w) => w.appId === id);
      for (const win of matching) closeWindow(win.id);
    },
    [windows, closeWindow]
  );

  return useMemo<ShellState>(
    () => ({ activeApp, openApps, launchApp, closeApp }),
    [activeApp, openApps, launchApp, closeApp]
  );
}
