"use client";

import Dock from "@/components/dock/Dock";
import MenuBar from "@/components/menu-bar/MenuBar";
import WindowManager from "@/components/window/WindowManager";
import { getApp } from "@/lib/apps";
import { useShellState } from "./useShellState";

/**
 * Persistent macOS-style desktop shell.
 *
 * Composition:
 * - A single {@link WindowManager} wraps the whole shell so that the
 *   MenuBar, Dock, and window layer all share the same manager state
 *   via {@link useShellState}. The manager is seeded with an initial
 *   Finder window so the desktop boots with the foreground app
 *   already focused (matching the macOS launch experience).
 * - The MenuBar sits at the top of the viewport, the Dock at the
 *   bottom, and the wallpaper + window layer fill the middle.
 * - The window layer is rendered by {@link WindowManager} itself; we
 *   don't need a separate slot here any more.
 */
export default function Desktop(): JSX.Element {
  return (
    <WindowManager initialWindows={[{ appId: "finder" }]}>
      <DesktopShell />
    </WindowManager>
  );
}

/**
 * Inner shell rendered inside the {@link WindowManager} so it can read
 * the manager's state via {@link useShellState} and route app launches
 * through it. Pulled out into its own component so the
 * `useWindowManager` hook resolves to the manager above.
 */
function DesktopShell(): JSX.Element {
  const { activeApp, openApps, launchApp } = useShellState();

  const activeAppName = activeApp ? getApp(activeApp)?.name ?? null : null;

  return (
    <main className="desktop-root" data-testid="desktop-root">
      <div className="wallpaper" aria-hidden="true" />
      <div className="desktop-title">
        <h1>macOS Tahoe</h1>
        <p>
          {activeAppName
            ? `Active app: ${activeAppName}`
            : "Web Desktop — loading the desktop shell…"}
        </p>
      </div>
      <MenuBar activeApp={activeApp} openApps={openApps} />
      <Dock openApps={openApps} onLaunchApp={launchApp} />
    </main>
  );
}
