import { useEffect } from 'react';

import { useOSStore } from './store/osStore';
import { Desktop } from './components/Desktop';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { Launchpad } from './components/Launchpad';
import { Spotlight } from './components/Spotlight';
import { ControlCenter } from './components/ControlCenter';
import { WindowManager } from './components/WindowManager';
import { buildStubApps } from './apps/stubApps';
import { registerFinder } from './apps/registerFinder';
import { registerCoreApps } from './apps/registerCoreApps';
import { registerAdditionalApps } from './apps/registerAdditionalApps';

/** Returns true when the event target is a text-editable element. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

/** Find the next non-minimized window in z-order (wrap around). */
function pickWindowByZ(forward: boolean): string | null {
  const state = useOSStore.getState();
  const candidates = state.windows
    .filter((w) => !w.isMinimized)
    .slice()
    .sort((a, b) => a.zIndex - b.zIndex);
  if (candidates.length === 0) return null;
  if (forward) return candidates[candidates.length - 1]?.id ?? null;
  return candidates[0]?.id ?? null;
}

function App(): JSX.Element {
  const registerApp = useOSStore((state) => state.registerApp);
  const spotlightOpen = useOSStore((state) => state.spotlightOpen);
  const launchpadOpen = useOSStore((state) => state.launchpadOpen);
  const controlCenterOpen = useOSStore((state) => state.controlCenterOpen);
  const toggleSpotlight = useOSStore((state) => state.toggleSpotlight);
  const closeSpotlight = useOSStore((state) => state.closeSpotlight);
  const closeLaunchpad = useOSStore((state) => state.closeLaunchpad);
  const closeControlCenter = useOSStore((state) => state.closeControlCenter);
  const appearance = useOSStore((state) => state.appearance);

  // Register stub apps on mount so the Dock and Launchpad have something
  // to render. Then override with real implementations from later chunks.
  useEffect(() => {
    const stubs = buildStubApps();
    for (const app of stubs) {
      registerApp(app);
    }
    // Override stubs with real app implementations.
    registerFinder(registerApp);
    registerCoreApps(registerApp);
    registerAdditionalApps(registerApp);
    // Intentionally don't unregister on unmount — this app stays mounted
    // for the lifetime of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global keyboard shortcuts.
  useEffect(() => {
    const handleKey = (event: globalThis.KeyboardEvent): void => {
      const isMod = event.metaKey || event.ctrlKey;
      const target = event.target;

      if (isMod && event.code === 'Space') {
        event.preventDefault();
        toggleSpotlight();
        return;
      }

      if (isMod && event.key === 'Tab') {
        event.preventDefault();
        const nextId = pickWindowByZ(!event.shiftKey);
        if (nextId) useOSStore.getState().focusWindow(nextId);
        return;
      }

      if (isMod && (event.key === 'w' || event.key === 'W')) {
        event.preventDefault();
        const state = useOSStore.getState();
        const focused = state.windows.find((w) => w.isFocused) ?? null;
        if (focused) state.closeWindow(focused.id);
        return;
      }

      if (isMod && (event.key === 'q' || event.key === 'Q')) {
        event.preventDefault();
        const state = useOSStore.getState();
        const appId = state.activeAppId;
        if (!appId) return;
        for (const w of state.windows) {
          if (w.appId === appId) state.closeWindow(w.id);
        }
        return;
      }

      if (isMod && (event.key === 'n' || event.key === 'N')) {
        event.preventDefault();
        const state = useOSStore.getState();
        const appId = state.activeAppId ?? 'finder';
        state.launchApp(appId);
        return;
      }

      // Arrow keys nudge the focused window when no text input is focused.
      if (
        !isMod &&
        (event.key === 'ArrowLeft' ||
          event.key === 'ArrowRight' ||
          event.key === 'ArrowUp' ||
          event.key === 'ArrowDown')
      ) {
        if (isEditableTarget(target)) return;
        const state = useOSStore.getState();
        const focused = state.windows.find((w) => w.isFocused) ?? null;
        if (!focused || focused.isMaximized) return;
        let dx = 0;
        let dy = 0;
        if (event.key === 'ArrowLeft') dx = -1;
        else if (event.key === 'ArrowRight') dx = 1;
        else if (event.key === 'ArrowUp') dy = -1;
        else if (event.key === 'ArrowDown') dy = 1;
        if (dx !== 0 || dy !== 0) {
          event.preventDefault();
          state.moveWindow(focused.id, focused.x + dx, focused.y + dy);
        }
        return;
      }

      if (event.key === 'Escape') {
        // Close the top-most overlay. Stop propagation so child Escape
        // handlers (menus, etc.) don't double-fire.
        if (spotlightOpen) {
          event.preventDefault();
          closeSpotlight();
        } else if (launchpadOpen) {
          event.preventDefault();
          closeLaunchpad();
        } else if (controlCenterOpen) {
          event.preventDefault();
          closeControlCenter();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [
    closeControlCenter,
    closeLaunchpad,
    closeSpotlight,
    controlCenterOpen,
    launchpadOpen,
    spotlightOpen,
    toggleSpotlight,
  ]);

  return (
    <div className={`os-root wallpaper${appearance === 'dark' ? ' os-root--dark' : ''}`}>
      <MenuBar />
      <Desktop />
      <WindowManager />
      <Dock />
      <Launchpad />
      <Spotlight />
      <ControlCenter />
    </div>
  );
}

export default App;
