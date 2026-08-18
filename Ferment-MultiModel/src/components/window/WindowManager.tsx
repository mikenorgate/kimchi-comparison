"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { getApp, type AppComponentLoader, type AppId } from "@/lib/apps";
import Window from "./Window";
import useWindowGeometry, {
  type ResizeDirection,
  type WindowPosition,
  type WindowSize,
} from "./useWindowGeometry";

/** Pixel height of the fixed Menu Bar. Maximized windows start below it. */
const MENU_BAR_HEIGHT = 28;
/** Approximate pixel height reserved for the Dock at the bottom of the
 *  viewport. Maximized windows stop above it. */
const DOCK_RESERVED = 88;
/** Default starting size for a brand-new desktop window. */
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 500;
/** Cascade offset applied to each subsequent window so they don't open
 *  perfectly stacked on top of one another. */
const CASCADE_OFFSET = 32;
/** Starting origin for the first window. */
const ORIGIN_X = 80;
const ORIGIN_Y = 60;
/** Maximum cascade depth before wrapping back to the origin. */
const MAX_CASCADE = 8;
/** Z-index floor. The MenuBar (z=60) and Dock (z=50) live above this so
 *  they always stay on top of windows. */
const Z_INDEX_BASE = 10;
/** Resize handle edge / corner size in CSS pixels. */
const HANDLE_EDGE = 8;
const HANDLE_CORNER = 14;

/** A single managed window's serialisable state. */
export interface ManagedWindow {
  readonly id: string;
  readonly appId: AppId;
  readonly title: string;
  readonly icon: ReactNode;
  readonly position: WindowPosition;
  readonly size: WindowSize;
  /** Position + size captured before maximizing so we can restore on unzoom. */
  readonly restorePosition: WindowPosition | null;
  readonly restoreSize: WindowSize | null;
  readonly zIndex: number;
  readonly minimized: boolean;
  readonly maximized: boolean;
}

/** Initial-window descriptor used by the `initialWindows` prop. */
export interface InitialWindowSpec {
  readonly appId: AppId;
  readonly position?: WindowPosition;
  readonly size?: WindowSize;
  readonly maximized?: boolean;
  readonly minimized?: boolean;
}

export interface WindowManagerApi {
  readonly windows: readonly ManagedWindow[];
  readonly activeWindowId: string | null;
  readonly openWindow: (appId: AppId) => string;
  readonly closeWindow: (id: string) => void;
  readonly focusWindow: (id: string) => void;
  readonly minimizeWindow: (id: string) => void;
  readonly maximizeWindow: (id: string) => void;
  readonly restoreWindow: (id: string) => void;
}

const WindowManagerContext = createContext<WindowManagerApi | null>(null);

/**
 * Read the current viewport dimensions from `window.innerWidth` /
 * `window.innerHeight`. Falls back to a reasonable desktop baseline
 * during SSR / jsdom so initial renders don't crash.
 */
function readViewport(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return { width: 1280, height: 800 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

/** Maximum-size rect for a maximized window given the current viewport. */
function maximizedRect(viewport = readViewport()): {
  position: WindowPosition;
  size: WindowSize;
} {
  const width = Math.max(DEFAULT_WIDTH, viewport.width);
  const height = Math.max(
    DEFAULT_HEIGHT,
    viewport.height - MENU_BAR_HEIGHT - DOCK_RESERVED
  );
  return {
    position: { x: 0, y: MENU_BAR_HEIGHT },
    size: { width, height },
  };
}

interface State {
  readonly windows: readonly ManagedWindow[];
  readonly activeWindowId: string | null;
  /** Monotonically increasing z-index counter. Each focus/open bumps it. */
  readonly topZ: number;
  /** Cascade counter used to offset successive new windows. */
  readonly cascadeIndex: number;
}

export type WindowManagerAction =
  | {
      readonly type: "open";
      readonly id: string;
      readonly appId: AppId;
      readonly title: string;
      readonly icon: ReactNode;
      readonly size: WindowSize;
      readonly maximized: boolean;
      readonly minimized: boolean;
      /** Caller-supplied cascade step. Required so batched dispatch
       *  calls (e.g. three Dock clicks in the same handler) each get a
       *  unique offset instead of colliding on the same state. */
      readonly cascadeStep: number;
      readonly positionOverride?: WindowPosition;
    }
  | { readonly type: "close"; readonly id: string }
  | { readonly type: "focus"; readonly id: string }
  | { readonly type: "minimize"; readonly id: string }
  | {
      readonly type: "maximize";
      readonly id: string;
      readonly rect: { position: WindowPosition; size: WindowSize };
    }
  | { readonly type: "restore"; readonly id: string }
  | {
      readonly type: "position";
      readonly id: string;
      readonly position: WindowPosition;
    }
  | { readonly type: "size"; readonly id: string; readonly size: WindowSize };

function nextCascadeOrigin(cascadeIndex: number): WindowPosition {
  const step = cascadeIndex % MAX_CASCADE;
  return {
    x: ORIGIN_X + step * CASCADE_OFFSET,
    y: ORIGIN_Y + step * CASCADE_OFFSET,
  };
}

function reducer(state: State, action: WindowManagerAction): State {
  switch (action.type) {
    case "open": {
      const topZ = state.topZ + 1;
      const position =
        action.positionOverride ?? nextCascadeOrigin(action.cascadeStep);
      const win: ManagedWindow = {
        id: action.id,
        appId: action.appId,
        title: action.title,
        icon: action.icon,
        position,
        size: action.size,
        restorePosition: null,
        restoreSize: null,
        zIndex: topZ,
        minimized: action.minimized,
        maximized: action.maximized,
      };
      return {
        windows: [...state.windows, win],
        activeWindowId: action.minimized ? state.activeWindowId : action.id,
        topZ,
        cascadeIndex: state.cascadeIndex + 1,
      };
    }
    case "close": {
      const remaining = state.windows.filter((w) => w.id !== action.id);
      let nextActive = state.activeWindowId;
      if (state.activeWindowId === action.id) {
        const candidates = remaining.filter((w) => !w.minimized);
        nextActive =
          candidates.length > 0
            ? candidates.reduce((best, w) => (w.zIndex > best.zIndex ? w : best))
                .id
            : null;
      }
      return { ...state, windows: remaining, activeWindowId: nextActive };
    }
    case "focus": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      if (target.minimized) {
        const topZ = state.topZ + 1;
        return {
          ...state,
          topZ,
          activeWindowId: action.id,
          windows: state.windows.map((w) =>
            w.id === action.id
              ? { ...w, minimized: false, zIndex: topZ }
              : w
          ),
        };
      }
      if (state.activeWindowId === action.id) return state;
      const topZ = state.topZ + 1;
      return {
        ...state,
        topZ,
        activeWindowId: action.id,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, zIndex: topZ } : w
        ),
      };
    }
    case "minimize": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.minimized) return state;
      let nextActive = state.activeWindowId;
      if (state.activeWindowId === action.id) {
        const candidates = state.windows.filter(
          (w) => w.id !== action.id && !w.minimized
        );
        nextActive =
          candidates.length > 0
            ? candidates.reduce((best, w) => (w.zIndex > best.zIndex ? w : best))
                .id
            : null;
      }
      return {
        ...state,
        activeWindowId: nextActive,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: true } : w
        ),
      };
    }
    case "maximize": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.maximized) return state;
      const topZ = state.topZ + 1;
      return {
        ...state,
        topZ,
        activeWindowId: action.id,
        windows: state.windows.map((w) =>
          w.id === action.id
            ? {
                ...w,
                maximized: true,
                position: action.rect.position,
                size: action.rect.size,
                restorePosition: target.position,
                restoreSize: target.size,
                zIndex: topZ,
              }
            : w
        ),
      };
    }
    case "restore": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target) return state;
      const topZ = state.topZ + 1;
      const restored: ManagedWindow = {
        ...target,
        maximized: false,
        minimized: false,
        position: target.restorePosition ?? target.position,
        size: target.restoreSize ?? target.size,
        zIndex: topZ,
      };
      return {
        ...state,
        topZ,
        activeWindowId: action.id,
        windows: state.windows.map((w) => (w.id === action.id ? restored : w)),
      };
    }
    case "position": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, position: action.position } : w
        ),
      };
    }
    case "size": {
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, size: action.size } : w
        ),
      };
    }
  }
}

function buildInitialState(
  initialWindows: readonly InitialWindowSpec[] | undefined
): State {
  const windows: ManagedWindow[] = [];
  let cascadeIndex = 0;
  let topZ = Z_INDEX_BASE;
  let activeWindowId: string | null = null;
  let counter = 0;
  for (const spec of initialWindows ?? []) {
    counter += 1;
    const app = getApp(spec.appId);
    const position = spec.position ?? nextCascadeOrigin(cascadeIndex);
    const size = spec.size ?? { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    const maximized = spec.maximized === true;
    const rect = maximized ? maximizedRect() : null;
    topZ += 1;
    const id = `init-${spec.appId}-${counter}`;
    const win: ManagedWindow = {
      id,
      appId: spec.appId,
      title: app?.name ?? spec.appId,
      icon: app?.icon,
      position: rect?.position ?? position,
      size: rect?.size ?? size,
      restorePosition: maximized ? position : null,
      restoreSize: maximized ? size : null,
      zIndex: topZ,
      minimized: spec.minimized === true,
      maximized,
    };
    windows.push(win);
    if (!win.minimized) activeWindowId = id;
    cascadeIndex += 1;
  }
  return { windows, activeWindowId, topZ, cascadeIndex };
}

const DispatchContext = createContext<{
  readonly dispatch: React.Dispatch<WindowManagerAction>;
  readonly subscribe: (
    listener: (api: WindowManagerApi) => void
  ) => () => void;
  readonly api: WindowManagerApi;
} | null>(null);

export interface WindowManagerProviderProps {
  readonly initialWindows?: readonly InitialWindowSpec[];
  readonly children: ReactNode;
}

/**
 * Owns the manager's reducer state and exposes the {@link WindowManagerApi}
 * via context. Most consumers will use {@link WindowManager} (the
 * provider + renderer combo); exporting the provider separately is for
 * tests that need to drive the API without rendering the window layer.
 */
export function WindowManagerProvider({
  initialWindows,
  children,
}: WindowManagerProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(
    reducer,
    initialWindows,
    buildInitialState
  );

  // Persistent counter that increments every time openWindow is called.
  // Lives outside the reducer because React 18 auto-batches dispatches
  // triggered in the same synchronous handler, which would otherwise
  // make the reducer see the same state.cascadeIndex for every batched
  // open action.
  const cascadeCounterRef = useRef(state.cascadeIndex);

  const openWindow = useCallback((appId: AppId): string => {
    const id = `w-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const app = getApp(appId);
    const size = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    // Increment a ref-based counter so batched dispatches each get a
    // unique cascade offset.
    cascadeCounterRef.current += 1;
    dispatch({
      type: "open",
      id,
      appId,
      title: app?.name ?? appId,
      icon: app?.icon,
      size,
      maximized: false,
      minimized: false,
      cascadeStep: cascadeCounterRef.current,
    });
    return id;
  }, []);

  const closeWindow = useCallback((id: string) => {
    dispatch({ type: "close", id });
  }, []);

  const focusWindow = useCallback((id: string) => {
    dispatch({ type: "focus", id });
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    dispatch({ type: "minimize", id });
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    dispatch({ type: "maximize", id, rect: maximizedRect() });
  }, []);

  const restoreWindow = useCallback((id: string) => {
    dispatch({ type: "restore", id });
  }, []);

  const api = useMemo<WindowManagerApi>(
    () => ({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
    }),
    [
      state.windows,
      state.activeWindowId,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
    ]
  );

  // Keep the latest API in a ref so the dispatch-based bridge below can
  // resolve the cascade index without subscribing to every change.
  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const value = useMemo(
    () => ({
      dispatch,
      subscribe: (listener: (api: WindowManagerApi) => void) => {
        listener(apiRef.current);
        // No real subscription is needed: the provider re-renders children
        // after every dispatch, so child useMemo hooks pick up the new
        // state. We return a no-op unsubscribe for API symmetry.
        return () => {};
      },
      api,
    }),
    [api]
  );

  return (
    <DispatchContext.Provider value={value}>
      <WindowManagerContext.Provider value={api}>
        {children}
      </WindowManagerContext.Provider>
    </DispatchContext.Provider>
  );
}

/**
 * Read the {@link WindowManagerApi} from the closest provider. Throws
 * when called outside a {@link WindowManagerProvider} so the failure
 * mode is obvious instead of silently no-op'ing.
 */
export function useWindowManager(): WindowManagerApi {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error(
      "useWindowManager must be used inside a <WindowManagerProvider>"
    );
  }
  return ctx;
}

/**
 * Pull the raw reducer dispatcher. Used internally by
 * {@link ManagedWindowView} to push geometry updates back into manager
 * state without going through the full context API.
 */
function useManagerDispatch(): React.Dispatch<WindowManagerAction> {
  const ctx = useContext(DispatchContext);
  if (!ctx) {
    throw new Error(
      "useManagerDispatch must be used inside a <WindowManagerProvider>"
    );
  }
  return ctx.dispatch;
}

export interface WindowManagerProps {
  readonly initialWindows?: readonly InitialWindowSpec[];
  /**
   * Optional overlay rendered behind the windows. Useful for embedding
   * desktop shortcuts, the wallpaper, or other absolutely-positioned
   * chrome without each consumer re-implementing the layer.
   */
  readonly children?: ReactNode;
}

/**
 * Drop-in window layer. Wraps its children in a {@link WindowManagerProvider}
 * and renders one `<Window>` per managed window above them, applying the
 * drag/resize handlers, z-index ordering, and minimize/maximize behaviour.
 */
export default function WindowManager({
  initialWindows,
  children,
}: WindowManagerProps): JSX.Element {
  return (
    <WindowManagerProvider initialWindows={initialWindows}>
      <WindowLayer>{children}</WindowLayer>
    </WindowManagerProvider>
  );
}

/**
 * Renders the window layer (one managed `<Window>` per non-minimized
 * record, plus optional child overlays) inside an existing
 * {@link WindowManagerProvider}. Use this directly when the consumer
 * already supplies its own provider higher in the tree — e.g. when the
 * Desktop composes the MenuBar, Dock, and window layer as siblings
 * but wants them all to share the same manager state.
 */
export function WindowLayer({
  children,
}: {
  readonly children?: ReactNode;
}): JSX.Element {
  const { windows, focusWindow } = useWindowManager();

  return (
    <div
      className="window-layer"
      data-testid="window-layer"
      aria-label="Desktop window layer"
    >
      {children}
      {windows.map((win) => {
        if (win.minimized) return null;
        return (
          <ManagedWindowView
            key={win.id}
            window={win}
            onFocus={() => focusWindow(win.id)}
          />
        );
      })}
    </div>
  );
}

interface ManagedWindowViewProps {
  readonly window: ManagedWindow;
  readonly onFocus: () => void;
}

/**
 * Body of a managed window. Resolves the app registry's component
 * loader (sync component today, lazy loader in the future) and renders
 * it inside the wrapper that the integration tests look up via
 * `app-content-<appId>`. When the registry entry has no component
 * registered yet, falls back to rendering the app's display name so
 * the window still has visible content (this is what every app other
 * than Finder does at the moment).
 */
function AppWindowContent({
  appId,
  title,
}: {
  readonly appId: AppId;
  readonly title: string;
}): JSX.Element {
  const app = getApp(appId);
  return (
    <div
      className="window-manager__content"
      data-testid={`app-content-${appId}`}
      data-app-id={appId}
    >
      <ResolvedAppBody appId={appId} loader={app?.component} title={title} />
    </div>
  );
}

interface ResolvedAppBodyProps {
  readonly appId: AppId;
  readonly loader: AppComponentLoader | undefined;
  readonly title: string;
}

/**
 * Mounts the app's component if the registry has one; otherwise shows
 * a placeholder with the app's title. For lazy loaders we trigger the
 * import on mount and store the resolved component in state so a
 * re-render picks it up without forcing the parent to re-mount.
 */
function ResolvedAppBody({
  appId,
  loader,
  title,
}: ResolvedAppBodyProps): JSX.Element {
  const [Resolved, setResolved] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (!loader || loader.kind !== "lazy") return;
    let cancelled = false;
    void loader.load().then((mod) => {
      if (cancelled) return;
      setResolved(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [loader, appId]);

  if (loader?.kind === "sync") {
    const AppComponent = loader.Component;
    return <AppComponent />;
  }
  if (loader?.kind === "lazy" && Resolved) {
    const LazyAppComponent = Resolved;
    return <LazyAppComponent />;
  }
  if (loader?.kind === "lazy") {
    return (
      <div
        className="window-manager__placeholder"
        data-testid={`app-placeholder-${appId}`}
        role="status"
      >
        Loading {title}…
      </div>
    );
  }
  return (
    <div
      className="window-manager__placeholder"
      data-testid={`app-placeholder-${appId}`}
      role="status"
    >
      {title}
    </div>
  );
}

/**
 * Bridges the {@link ManagedWindow} record in manager state to a real
 * `<Window>` frame. Owns its own {@link useWindowGeometry} hook so drag
 * and resize are handled inside the hook, and pushes committed
 * position/size changes back into manager state via the dispatcher.
 */
function ManagedWindowView({
  window: win,
  onFocus,
}: ManagedWindowViewProps): JSX.Element {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    activeWindowId,
  } = useWindowManager();
  const dispatch = useManagerDispatch();

  const geometry = useWindowGeometry({
    initialPosition: win.position,
    initialSize: win.size,
  });

  // Keep the hook's internal geometry in sync with manager state whenever
  // the manager changes the window's position/size externally (focus,
  // maximize, restore, programmatic reposition). Reading win.position /
  // win.size as deps avoids re-syncing on hook-internal drags (which we
  // route through dispatch, not setPosition).
  useEffect(() => {
    geometry.setPosition(win.position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.position.x, win.position.y]);
  useEffect(() => {
    geometry.setSize(win.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.size.width, win.size.height]);

  // Push hook-driven geometry updates back into manager state. Only
  // fires when the value actually changes (the hook already dedupes
  // identical values internally) and only for non-maximized windows so
  // we don't fight the maximizedRect snapshot.
  const lastPos = useRef(win.position);
  const lastSize = useRef(win.size);
  useEffect(() => {
    if (
      geometry.position.x === lastPos.current.x &&
      geometry.position.y === lastPos.current.y
    ) {
      return;
    }
    lastPos.current = geometry.position;
    if (!win.maximized) {
      dispatch({
        type: "position",
        id: win.id,
        position: geometry.position,
      });
    }
  }, [geometry.position, win.id, win.maximized, dispatch]);
  useEffect(() => {
    if (
      geometry.size.width === lastSize.current.width &&
      geometry.size.height === lastSize.current.height
    ) {
      return;
    }
    lastSize.current = geometry.size;
    if (!win.maximized) {
      dispatch({ type: "size", id: win.id, size: geometry.size });
    }
  }, [geometry.size, win.id, win.maximized, dispatch]);

  const isActive = activeWindowId === win.id;

  const handleClose = () => closeWindow(win.id);
  const handleMinimize = () => minimizeWindow(win.id);
  const handleMaximize = win.maximized
    ? () => restoreWindow(win.id)
    : () => maximizeWindow(win.id);

  // Wrap the title-bar drag handler so clicking the traffic lights
  // (close/minimize/maximize) does not start an unwanted drag.
  const handleTitleBarPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-testid="window-lights"]')) return;
      if (win.maximized) return;
      geometry.titleBarProps.onPointerDown(event);
    },
    [geometry, win.maximized]
  );

  const frameClassName = [
    "window-manager__frame",
    win.maximized ? "window-manager__frame--maximized" : null,
    isActive
      ? "window-manager__frame--active"
      : "window-manager__frame--inactive",
  ]
    .filter(Boolean)
    .join(" ");

  const frameStyle = win.maximized
    ? {
        position: "absolute" as const,
        left: 0,
        top: 0,
        width: "100%",
        height: `calc(100vh - ${MENU_BAR_HEIGHT + DOCK_RESERVED}px)`,
        zIndex: win.zIndex,
      }
    : {
        position: "absolute" as const,
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      };

  return (
    <div
      className={frameClassName}
      data-testid={`managed-window-${win.id}`}
      data-app-id={win.appId}
      data-maximized={win.maximized ? "true" : "false"}
      data-minimized={win.minimized ? "true" : "false"}
      data-z-index={win.zIndex}
      data-active={isActive ? "true" : "false"}
      style={frameStyle}
      onPointerDownCapture={onFocus}
    >
      <Window
        title={win.title}
        icon={win.icon}
        isActive={isActive}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        width="100%"
        height="100%"
        ariaLabel={`${win.title} window`}
        onTitleBarPointerDown={handleTitleBarPointerDown}
      >
        <AppWindowContent appId={win.appId} title={win.title} />
      </Window>
      {!win.maximized ? (
        <>
          <ResizeHandle
            dir="n"
            testId={`resize-${win.id}-n`}
            geometry={geometry}
          />
          <ResizeHandle
            dir="s"
            testId={`resize-${win.id}-s`}
            geometry={geometry}
          />
          <ResizeHandle
            dir="e"
            testId={`resize-${win.id}-e`}
            geometry={geometry}
          />
          <ResizeHandle
            dir="w"
            testId={`resize-${win.id}-w`}
            geometry={geometry}
          />
          <ResizeHandle
            dir="ne"
            testId={`resize-${win.id}-ne`}
            geometry={geometry}
          />
          <ResizeHandle
            dir="nw"
            testId={`resize-${win.id}-nw`}
            geometry={geometry}
          />
          <ResizeHandle
            dir="se"
            testId={`resize-${win.id}-se`}
            geometry={geometry}
          />
          <ResizeHandle
            dir="sw"
            testId={`resize-${win.id}-sw`}
            geometry={geometry}
          />
        </>
      ) : null}
    </div>
  );
}

interface ResizeHandleProps {
  readonly dir: ResizeDirection;
  readonly testId: string;
  readonly geometry: ReturnType<typeof useWindowGeometry>;
}

function ResizeHandle({
  dir,
  testId,
  geometry,
}: ResizeHandleProps): JSX.Element {
  const props = geometry.resizeHandleProps[dir];
  const ref = geometry.resizeHandleRefs[dir];
  return (
    <div
      ref={ref}
      data-testid={testId}
      data-resize-handle={dir}
      aria-label={props["aria-label"]}
      role={props.role}
      style={{
        position: "absolute",
        ...handleBoxStyle(dir),
        ...props.style,
      }}
      onPointerDown={props.onPointerDown}
    />
  );
}

function handleBoxStyle(dir: ResizeDirection): {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width?: number;
  height?: number;
} {
  switch (dir) {
    case "n":
      return { left: HANDLE_CORNER, right: HANDLE_CORNER, top: 0, height: HANDLE_EDGE };
    case "s":
      return {
        left: HANDLE_CORNER,
        right: HANDLE_CORNER,
        bottom: 0,
        height: HANDLE_EDGE,
      };
    case "e":
      return {
        right: 0,
        top: HANDLE_CORNER,
        bottom: HANDLE_CORNER,
        width: HANDLE_EDGE,
      };
    case "w":
      return {
        left: 0,
        top: HANDLE_CORNER,
        bottom: HANDLE_CORNER,
        width: HANDLE_EDGE,
      };
    case "ne":
      return { right: 0, top: 0, width: HANDLE_CORNER, height: HANDLE_CORNER };
    case "nw":
      return { left: 0, top: 0, width: HANDLE_CORNER, height: HANDLE_CORNER };
    case "se":
      return { right: 0, bottom: 0, width: HANDLE_CORNER, height: HANDLE_CORNER };
    case "sw":
      return { left: 0, bottom: 0, width: HANDLE_CORNER, height: HANDLE_CORNER };
  }
}
