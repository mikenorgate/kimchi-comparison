/**
 * OS Store — central Zustand store for the macOS Tahoe web app.
 *
 * Holds in-memory desktop state: registered apps, open windows, focus / z-order,
 * the Dock, desktop icons, menu bar, overlay toggles, and appearance settings.
 *
 * All state mutations go through actions on this store and use immutable
 * updates (spread / map / filter) so React/Zustand can detect changes via
 * reference equality.
 */
import { create } from 'zustand';

import type {
  AppDefinition,
  Appearance,
  DesktopIcon,
  MenuBarMenu,
  MenuBarState,
  OSState,
  WindowInstance,
} from '../types/os';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default minimum visible margin from any viewport edge, in pixels. */
const VIEWPORT_MARGIN = 40;

/** Default minimum window size when an app does not specify its own. */
const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 240;

/** Default new-window offset when cascading. */
const CASCADE_STEP = 28;

/** Duration of the Dock "bounce" animation when an app is launched. */
const LAUNCH_BOUNCE_MS = 800;

/** Default title-bar offset so windows do not sit directly under the menu bar. */
const MENU_BAR_OFFSET = 28;

/** Default Dock height offset so windows do not sit directly under the Dock. */
const DOCK_OFFSET = 96;

// ---------------------------------------------------------------------------
// Static seed data
// ---------------------------------------------------------------------------

/** Static Apple menu (left side of the menu bar). Items open system-level UIs. */
const APPLE_MENU: MenuBarMenu = {
  title: 'Apple',
  items: [
    { label: 'About This Mac' },
    { separator: true, label: '' },
    { label: 'System Settings…' },
    { label: 'App Store…', disabled: true },
    { separator: true, label: '' },
    { label: 'Sleep' },
    { label: 'Restart…' },
    { label: 'Shut Down…' },
    { separator: true, label: '' },
    { label: 'Lock Screen', shortcut: '⌃⌘Q' },
    { label: 'Log Out…', shortcut: '⇧⌘Q' },
  ],
};

/** Static status icons on the right of the menu bar. */
const STATUS_ICONS = [
  { id: 'control-center', icon: 'SlidersHorizontal', tooltip: 'Control Center' },
  { id: 'battery', icon: 'BatteryFull', tooltip: 'Battery' },
  { id: 'wifi', icon: 'Wifi', tooltip: 'Wi-Fi' },
  { id: 'spotlight', icon: 'Search', tooltip: 'Spotlight' },
];

/**
 * Initial Dock order. Apps register themselves later via `registerApp`.
 *
 * The first 18 entries are real apps; the last two are pseudo-apps
 * (Launchpad toggles the Launchpad overlay, Trash is a special target).
 */
const INITIAL_DOCK_APP_IDS: string[] = [
  'finder',
  'safari',
  'mail',
  'music',
  'photos',
  'podcasts',
  'tv',
  'system-settings',
  'notes',
  'reminders',
  'calculator',
  'weather',
  'maps',
  'clock',
  'stocks',
  'calendar',
  'terminal',
  'launchpad',
  'trash',
];

/** Mock desktop icons shown in the top-right of the desktop. */
const INITIAL_DESKTOP_ICONS: DesktopIcon[] = [
  { id: 'desktop-macintosh-hd', label: 'Macintosh HD', icon: '💽', x: 24, y: 40 },
  { id: 'desktop-documents', label: 'Documents', icon: '📁', x: 24, y: 120 },
  { id: 'desktop-notes-txt', label: 'notes.txt', icon: '📄', x: 24, y: 200 },
  { id: 'desktop-project-folder', label: 'Projects', icon: '📁', x: 24, y: 280 },
];

const INITIAL_MENU_BAR: MenuBarState = {
  appleMenu: APPLE_MENU,
  appMenus: [],
  statusIcons: STATUS_ICONS,
  activeAppName: 'Finder',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let windowIdCounter = 0;
function nextWindowId(): string {
  windowIdCounter += 1;
  return `window-${windowIdCounter}`;
}

/** Module-level map of pending bounce timers, keyed by app id. */
const bounceTimers = new Map<string, number>();

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function clampWindowGeometry(
  next: Pick<WindowInstance, 'x' | 'y' | 'width' | 'height' | 'minWidth' | 'minHeight'>,
): Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'> {
  const minWidth = next.minWidth ?? DEFAULT_MIN_WIDTH;
  const minHeight = next.minHeight ?? DEFAULT_MIN_HEIGHT;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const width = clamp(next.width, minWidth, Math.max(minWidth, viewportWidth));
  const height = clamp(next.height, minHeight, Math.max(minHeight, viewportHeight));
  const maxX = Math.max(VIEWPORT_MARGIN, viewportWidth - VIEWPORT_MARGIN - width);
  const maxY = Math.max(MENU_BAR_OFFSET, viewportHeight - DOCK_OFFSET - height);
  const x = clamp(next.x, VIEWPORT_MARGIN, maxX);
  const y = clamp(next.y, MENU_BAR_OFFSET, maxY);

  return { x, y, width, height };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface OSStore extends OSState {
  // --- App lifecycle ---------------------------------------------------
  registerApp: (app: AppDefinition) => void;

  // --- Window lifecycle ------------------------------------------------
  launchApp: (appId: string, payload?: unknown) => string | null;
  focusWindow: (windowId: string) => void;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  moveWindow: (windowId: string, x: number, y: number) => void;
  resizeWindow: (windowId: string, width: number, height: number) => void;
  setWindowTitle: (windowId: string, title: string) => void;

  // --- Overlays --------------------------------------------------------
  openSpotlight: () => void;
  closeSpotlight: () => void;
  toggleSpotlight: () => void;
  openLaunchpad: () => void;
  closeLaunchpad: () => void;
  toggleLaunchpad: () => void;
  openControlCenter: () => void;
  closeControlCenter: () => void;
  toggleControlCenter: () => void;

  // --- Focus / app -----------------------------------------------------
  setActiveApp: (appId: string | null) => void;

  // --- Appearance ------------------------------------------------------
  setAppearance: (appearance: Appearance) => void;
  setWallpaper: (wallpaper: string) => void;
}

function refreshMenuBar(
  state: OSState,
  apps: Record<string, AppDefinition>,
  activeAppId: string | null,
): MenuBarState {
  if (activeAppId && apps[activeAppId]) {
    const app = apps[activeAppId];
    return {
      ...state.menuBar,
      appMenus: app.menus ?? [],
      activeAppName: app.name,
    };
  }
  return {
    ...state.menuBar,
    appMenus: [],
    activeAppName: 'Finder',
  };
}

function topWindowId(windows: WindowInstance[]): string | null {
  let topId: string | null = null;
  let topZ = -Infinity;
  for (const w of windows) {
    if (w.isMinimized) continue;
    if (w.zIndex > topZ) {
      topZ = w.zIndex;
      topId = w.id;
    }
  }
  return topId;
}

export const useOSStore = create<OSStore>((set, get) => {
  /**
   * Internal helper: bring a window to the front (focus + z-index bump) and
   * update activeAppId / menu bar. Returns the new state patch.
   */
  const bringWindowToFront = (
    windows: WindowInstance[],
    windowId: string,
  ): {
    windows: WindowInstance[];
    activeAppId: string | null;
    nextMaxZ: number;
  } => {
    let nextMaxZ = get().maxZ;
    let targetAppId: string | null = null;
    const updated = windows.map((w) => {
      if (w.id !== windowId) {
        return w.isFocused ? { ...w, isFocused: false } : w;
      }
      targetAppId = w.appId;
      nextMaxZ += 1;
      return {
        ...w,
        isFocused: true,
        isMinimized: false,
        zIndex: nextMaxZ,
      };
    });
    return { windows: updated, activeAppId: targetAppId, nextMaxZ };
  };

  return {
    // ----- Initial state ------------------------------------------------
    activeAppId: null,
    apps: {},
    windows: [],
    dockAppIds: INITIAL_DOCK_APP_IDS,
    desktopIcons: INITIAL_DESKTOP_ICONS,
    menuBar: INITIAL_MENU_BAR,
    spotlightOpen: false,
    launchpadOpen: false,
    controlCenterOpen: false,
    wallpaper: 'wallpaper',
    appearance: 'light',
    maxZ: 0,
    bouncingAppIds: [],

    // ----- App lifecycle ------------------------------------------------
    registerApp: (app) =>
      set((state) => {
        const nextApps = { ...state.apps, [app.id]: app };
        return {
          apps: nextApps,
          // If the registered app is the active one, refresh its menus.
          menuBar:
            state.activeAppId === app.id
              ? refreshMenuBar({ ...state, apps: nextApps }, nextApps, app.id)
              : state.menuBar,
        };
      }),

    // ----- Window lifecycle --------------------------------------------
    launchApp: (appId, payload) => {
      const state = get();
      const app = state.apps[appId];
      if (!app) return null;

      // If the app does not allow multiple instances, focus an existing
      // window instead of opening a new one.
      if (!app.canOpenMultiple) {
        const existing = state.windows.find((w) => w.appId === appId);
        if (existing) {
          const { windows, activeAppId, nextMaxZ } = bringWindowToFront(
            state.windows,
            existing.id,
          );
          set((s) => ({
            windows,
            activeAppId,
            maxZ: nextMaxZ,
            menuBar: refreshMenuBar({ ...s, windows, activeAppId }, s.apps, activeAppId),
          }));
          return existing.id;
        }
      }

      const id = nextWindowId();
      const cascadeIndex = state.windows.length;
      const desiredX = 80 + cascadeIndex * CASCADE_STEP;
      const desiredY = MENU_BAR_OFFSET + 24 + cascadeIndex * CASCADE_STEP;
      const draft: WindowInstance = {
        id,
        appId,
        title: app.name,
        x: desiredX,
        y: desiredY,
        width: app.defaultWidth,
        height: app.defaultHeight,
        minWidth: app.minWidth,
        minHeight: app.minHeight,
        isMinimized: false,
        isMaximized: false,
        isFocused: true,
        zIndex: state.maxZ + 1,
        payload,
      };
      const clamped = clampWindowGeometry(draft);
      const newWindow: WindowInstance = {
        ...draft,
        ...clamped,
        zIndex: state.maxZ + 1,
      };

      const nextMaxZ = state.maxZ + 1;
      // Mark all other windows as not focused.
      const windows = [
        ...state.windows.map((w) => ({ ...w, isFocused: false })),
        newWindow,
      ];

      // Bounce the Dock icon briefly. Use globalThis to avoid shadowing by any
      // local `window` variable.
      const globalWin = globalThis as typeof globalThis & {
        clearTimeout: (handle: number) => void;
        setTimeout: (handler: () => void, ms: number) => number;
      };
      const existingTimer = bounceTimers.get(appId);
      if (existingTimer !== undefined) {
        globalWin.clearTimeout(existingTimer);
        bounceTimers.delete(appId);
      }
      const bouncingAppIds = state.bouncingAppIds.includes(appId)
        ? state.bouncingAppIds
        : [...state.bouncingAppIds, appId];
      const timer = globalWin.setTimeout(() => {
        bounceTimers.delete(appId);
        set((s) => ({
          bouncingAppIds: s.bouncingAppIds.filter((id) => id !== appId),
        }));
      }, LAUNCH_BOUNCE_MS);
      bounceTimers.set(appId, timer);

      set((s) => ({
        windows,
        activeAppId: appId,
        maxZ: nextMaxZ,
        bouncingAppIds,
        menuBar: refreshMenuBar({ ...s, windows, activeAppId: appId }, s.apps, appId),
      }));

      return id;
    },

    focusWindow: (windowId) =>
      set((state) => {
        const target = state.windows.find((w) => w.id === windowId);
        if (!target) return state;
        const { windows, activeAppId, nextMaxZ } = bringWindowToFront(
          state.windows,
          windowId,
        );
        return {
          windows,
          activeAppId,
          maxZ: nextMaxZ,
          menuBar: refreshMenuBar({ ...state, windows, activeAppId }, state.apps, activeAppId),
        };
      }),

    closeWindow: (windowId) =>
      set((state) => {
        const target = state.windows.find((w) => w.id === windowId);
        if (!target) return state;
        const windows = state.windows.filter((w) => w.id !== windowId);

        // Determine the new active window: the focused window that is on top,
        // or null when no windows remain.
        let activeAppId: string | null = null;
        let topZ = -Infinity;
        for (const w of windows) {
          if (!w.isMinimized && w.zIndex > topZ) {
            topZ = w.zIndex;
            activeAppId = w.appId;
          }
        }
        // Mark the top window (if any) as focused; clear focus from the rest.
        const updatedWindows = windows.map((w) => ({
          ...w,
          isFocused: !w.isMinimized && w.zIndex === topZ,
        }));

        return {
          windows: updatedWindows,
          activeAppId,
          menuBar: refreshMenuBar(
            { ...state, windows: updatedWindows, activeAppId },
            state.apps,
            activeAppId,
          ),
        };
      }),

    minimizeWindow: (windowId) =>
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === windowId ? { ...w, isMinimized: true, isFocused: false } : w,
        ),
      })),

    maximizeWindow: (windowId) =>
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === windowId ? { ...w, isMaximized: true } : w,
        ),
      })),

    restoreWindow: (windowId) =>
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === windowId ? { ...w, isMinimized: false, isMaximized: false } : w,
        ),
      })),

    moveWindow: (windowId, x, y) =>
      set((state) => ({
        windows: state.windows.map((w) => {
          if (w.id !== windowId) return w;
          const { x: nx, y: ny } = clampWindowGeometry({
            x,
            y,
            width: w.width,
            height: w.height,
            minWidth: w.minWidth,
            minHeight: w.minHeight,
          });
          return { ...w, x: nx, y: ny };
        }),
      })),

    resizeWindow: (windowId, width, height) =>
      set((state) => ({
        windows: state.windows.map((w) => {
          if (w.id !== windowId) return w;
          const { width: nw, height: nh } = clampWindowGeometry({
            x: w.x,
            y: w.y,
            width,
            height,
            minWidth: w.minWidth,
            minHeight: w.minHeight,
          });
          return { ...w, width: nw, height: nh };
        }),
      })),

    setWindowTitle: (windowId, title) =>
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === windowId ? { ...w, title } : w,
        ),
        // The menu bar shows the focused app's name, not the window title,
        // but update the active app name if the title belongs to the active
        // app and the app has no explicit name. Most apps set their name at
        // registration, so this is a fallback.
        menuBar:
          state.activeAppId !== null &&
          state.windows.find((w) => w.id === windowId)?.appId === state.activeAppId
            ? { ...state.menuBar, activeAppName: title }
            : state.menuBar,
      })),

    // ----- Overlays -----------------------------------------------------
    openSpotlight: () => set({ spotlightOpen: true }),
    closeSpotlight: () => set({ spotlightOpen: false }),
    toggleSpotlight: () => set((s) => ({ spotlightOpen: !s.spotlightOpen })),

    openLaunchpad: () => set({ launchpadOpen: true }),
    closeLaunchpad: () => set({ launchpadOpen: false }),
    toggleLaunchpad: () => set((s) => ({ launchpadOpen: !s.launchpadOpen })),

    openControlCenter: () => set({ controlCenterOpen: true }),
    closeControlCenter: () => set({ controlCenterOpen: false }),
    toggleControlCenter: () => set((s) => ({ controlCenterOpen: !s.controlCenterOpen })),

    // ----- Focus / app --------------------------------------------------
    setActiveApp: (appId) =>
      set((state) => ({
        activeAppId: appId,
        menuBar: refreshMenuBar(state, state.apps, appId),
      })),

    // ----- Appearance ---------------------------------------------------
    setAppearance: (appearance) => set({ appearance }),
    setWallpaper: (wallpaper) => set({ wallpaper }),
  };
});

// ---------------------------------------------------------------------------
// Selectors (re-exported for ergonomic consumption in components)
// ---------------------------------------------------------------------------

export const selectActiveApp = (s: OSState): AppDefinition | null =>
  s.activeAppId ? s.apps[s.activeAppId] ?? null : null;

export const selectFocusedWindow = (s: OSState): WindowInstance | null =>
  s.windows.find((w) => w.isFocused) ?? null;

export const selectTopWindowId = (s: OSState): string | null => topWindowId(s.windows);

export const selectIsAppBouncing = (appId: string) => (s: OSState): boolean =>
  s.bouncingAppIds.includes(appId);
