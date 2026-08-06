import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import { useOSStore } from '../store/osStore';
import type { AppDefinition, WindowInstance } from '../types/os';
import { WindowChrome } from './WindowChrome';
import { useWindow } from '../hooks/useWindow';

/** Direction strings for each resize handle. */
type ResizeDirection =
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'nw';

/** Cursor style for each direction. */
const RESIZE_CURSORS: Record<ResizeDirection, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
};

/** The 8 resize handles in render order. */
const HANDLE_DIRECTIONS: ResizeDirection[] = [
  'n',
  'ne',
  'e',
  'se',
  's',
  'sw',
  'w',
  'nw',
];

/** Height of the menu bar — maximized windows stop below this. */
const MENU_BAR_HEIGHT = 28;

/** Minimum visible margin from any viewport edge. */
const VIEWPORT_MARGIN = 40;

/**
 * Geometry snapshot used to compute deltas during a drag/resize
 * operation. Stored once when the pointer goes down so subsequent moves
 * can be computed relative to a stable origin.
 */
interface DragOrigin {
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

interface WindowProps {
  windowId: string;
}

/**
 * Single floating win: title bar (drag), 8 resize handles, traffic
 * lights, app content. All pointer interaction uses Pointer Events for
 * cross-input robustness (mouse + touch + pen).
 *
 * Maximized state is local to the component — pre-maximize geometry is
 * captured so the win can restore to its previous size/position when
 * un-maximized. The store's `isMaximized` flag is the source of truth,
 * but the visual geometry comes from local state.
 */
export function Window({ windowId }: WindowProps): JSX.Element | null {
  const { window: win, actions } = useWindow(windowId);
  const apps = useOSStore((state) => state.apps);

  // Pre-maximize geometry captured at the moment we entered maximize.
  const preMaximizeGeometryRef = useRef<
    Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'> | null
  >(null);

  // Live geometry used during a drag/resize. We snapshot the store's
  // geometry when the pointer goes down and then apply deltas locally on
  // each move, only committing to the store on pointer up. This keeps the
  // drag feeling responsive and avoids flooding the store with updates.
  const dragOriginRef = useRef<DragOrigin | null>(null);
  const [dragOverride, setDragOverride] = useState<
    Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'> | null
  >(null);

  // Track viewport size so maximized windows can react to resize.
  const [viewport, setViewport] = useState<{ width: number; height: number }>(
    () => ({
      width: typeof window === 'undefined' ? 1280 : window.innerWidth,
      height: typeof window === 'undefined' ? 800 : window.innerHeight,
    }),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = (): void => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Capture / restore pre-maximize geometry around maximize changes.
  useLayoutEffect(() => {
    if (!win) return;
    if (win.isMaximized) {
      // Save the current geometry (or last drag override) the first time
      // we become maximized.
      if (preMaximizeGeometryRef.current === null) {
        const source = dragOverride ?? {
          x: win.x,
          y: win.y,
          width: win.width,
          height: win.height,
        };
        preMaximizeGeometryRef.current = { ...source };
      }
    } else {
      // Restore the saved geometry by writing it back to the store when
      // we leave the maximized state.
      const saved = preMaximizeGeometryRef.current;
      if (saved) {
        actions.move(saved.x, saved.y);
        actions.resize(saved.width, saved.height);
        preMaximizeGeometryRef.current = null;
        setDragOverride(null);
      }
    }
    // Intentionally only run when isMaximized toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win?.isMaximized]);

  // ---- Drag handling (title bar) ------------------------------------

  const handleTitleBarPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Ignore right-clicks etc.
      if (event.button !== 0) return;
      // Focus + raise.
      actions.focus();

      // Drag start is a no-op when maximized; the OS snaps to fill the
      // screen. macOS allows click+drag to "un-maximize" but we keep the
      // model simple: un-maximize happens via the green traffic light.
      if (!win || win.isMaximized) return;

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      dragOriginRef.current = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: win.x,
        startY: win.y,
        startWidth: win.width,
        startHeight: win.height,
      };
    },
    [actions, win],
  );

  const handleTitleBarDoubleClick = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Double-click the title bar = toggle maximize.
      event.preventDefault();
      if (!win) return;
      if (win.isMaximized) {
        actions.restore();
      } else {
        actions.maximize();
      }
    },
    [actions, win],
  );

  // ---- Resize handling ----------------------------------------------

  const handleResizePointerDown = useCallback(
    (direction: ResizeDirection, event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if (!win || win.isMaximized) return;

      actions.focus();

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);

      dragOriginRef.current = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: win.x,
        startY: win.y,
        startWidth: win.width,
        startHeight: win.height,
      };
      // Stash direction on the DOM node so the global move handler can
      // read it without a stale closure.
      target.dataset['direction'] = direction;
    },
    [actions, win],
  );

  // ---- Global pointer move/up --------------------------------------

  // Mirror dragOverride into a ref so the global pointer handlers can read
  // the latest value without re-attaching on every render.
  const pendingCommitRef = useRef<
    Pick<WindowInstance, 'x' | 'y' | 'width' | 'height'> | null
  >(null);
  pendingCommitRef.current = dragOverride;

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent): void => {
      const origin = dragOriginRef.current;
      if (!origin) return;
      const dx = event.clientX - origin.startClientX;
      const dy = event.clientY - origin.startClientY;
      const direction = (event.target as HTMLElement | null)?.dataset?.[
        'direction'
      ] as ResizeDirection | undefined;

      if (direction) {
        // Resize: compute new x/y/w/h from origin + delta in the
        // direction of the handle.
        let nextX = origin.startX;
        let nextY = origin.startY;
        let nextWidth = origin.startWidth;
        let nextHeight = origin.startHeight;
        if (direction.includes('e')) {
          nextWidth = origin.startWidth + dx;
        }
        if (direction.includes('w')) {
          nextWidth = origin.startWidth - dx;
          nextX = origin.startX + dx;
        }
        if (direction.includes('s')) {
          nextHeight = origin.startHeight + dy;
        }
        if (direction.includes('n')) {
          nextHeight = origin.startHeight - dy;
          nextY = origin.startY + dy;
        }
        // Read latest min sizes from the store to avoid stale closures.
        const live = useOSStore.getState().windows.find((w) => w.id === windowId);
        const clamped = clampResize(
          nextX,
          nextY,
          nextWidth,
          nextHeight,
          live?.minWidth ?? 320,
          live?.minHeight ?? 240,
          viewport.width,
          viewport.height,
          direction,
        );
        setDragOverride({
          x: clamped.x,
          y: clamped.y,
          width: clamped.width,
          height: clamped.height,
        });
      } else {
        // Drag: only translate.
        setDragOverride({
          x: origin.startX + dx,
          y: origin.startY + dy,
          width: origin.startWidth,
          height: origin.startHeight,
        });
      }
    };

    const handlePointerUp = (event: PointerEvent): void => {
      const origin = dragOriginRef.current;
      if (!origin) return;
      const direction = (event.target as HTMLElement | null)?.dataset?.[
        'direction'
      ] as ResizeDirection | undefined;
      // Pull the latest override from a ref to avoid re-attaching listeners every render.
      const committed = pendingCommitRef.current;
      if (committed) {
        // Commit the final geometry to the store.
        actions.move(committed.x, committed.y);
        actions.resize(committed.width, committed.height);
      }
      setDragOverride(null);
      dragOriginRef.current = null;

      // Release pointer capture if any.
      const target = event.target as HTMLElement | null;
      if (target && target.hasPointerCapture?.(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }

      // Direction was on the handle dataset; no further action needed.
      void direction;
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [actions, viewport.height, viewport.width, windowId]);

  // ---- Traffic-light handlers --------------------------------------

  const handleClose = useCallback(() => {
    actions.close();
  }, [actions]);

  const handleMinimize = useCallback(() => {
    actions.minimize();
  }, [actions]);

  const handleMaximize = useCallback(() => {
    if (!win) return;
    if (win.isMaximized) {
      actions.restore();
    } else {
      actions.maximize();
    }
  }, [actions, win]);

  // ---- Render ------------------------------------------------------

  const app: AppDefinition | undefined = win ? apps[win.appId] : undefined;
  const AppComponent = app?.component;

  const liveGeometry = useMemo(() => {
    if (!win) return null;
    if (win.isMaximized) {
      return {
        x: 0,
        y: MENU_BAR_HEIGHT,
        width: viewport.width,
        height: Math.max(240, viewport.height - MENU_BAR_HEIGHT),
      };
    }
    if (dragOverride) {
      return dragOverride;
    }
    return {
      x: win.x,
      y: win.y,
      width: win.width,
      height: win.height,
    };
  }, [dragOverride, viewport.height, viewport.width, win]);

  if (!win || !liveGeometry || !AppComponent) {
    return null;
  }

  const isFocused = win.isFocused;
  const classes = [
    'win',
    isFocused ? 'win--focused' : 'win--unfocused',
    win.isMaximized ? 'win--maximized' : '',
    win.isMinimized ? 'win--minimized' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style: CSSProperties = {
    left: `${liveGeometry.x}px`,
    top: `${liveGeometry.y}px`,
    width: `${liveGeometry.width}px`,
    height: `${liveGeometry.height}px`,
    zIndex: win.zIndex,
  };

  return (
    <div
      className={classes}
      style={style}
      data-win-id={win.id}
      data-app-id={win.appId}
      role="dialog"
      aria-label={win.title}
      onPointerDown={() => {
        // Bring to front on any pointer-down inside the win.
        if (!isFocused) actions.focus();
      }}
    >
      <WindowChrome
        title={win.title}
        icon={app.icon}
        isFocused={isFocused}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
      />
      <div
        className="window__titlebar-drag"
        onPointerDown={handleTitleBarPointerDown}
        onDoubleClick={handleTitleBarDoubleClick}
        aria-hidden="true"
      />
      <div className="window__content">
        <AppComponent windowId={win.id} />
      </div>
      {HANDLE_DIRECTIONS.map((dir) => (
        <div
          key={dir}
          className={`window__resize window__resize--${dir}`}
          data-direction={dir}
          style={{ cursor: RESIZE_CURSORS[dir] }}
          onPointerDown={(event) => handleResizePointerDown(dir, event)}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * Clamp resize delta to viewport constraints + min size.
 *
 * For West/North handles we adjust the anchor (x/y) so the opposite
 * edge stays fixed and the win grows/shrinks toward the cursor.
 */
function clampResize(
  x: number,
  y: number,
  width: number,
  height: number,
  minWidth: number,
  minHeight: number,
  viewportWidth: number,
  viewportHeight: number,
  direction: ResizeDirection,
): { x: number; y: number; width: number; height: number } {
  const minW = Math.max(minWidth, 160);
  const minH = Math.max(minHeight, 120);

  // Apply min-size first. When dragging West/North, the anchor (x/y)
  // changes while the opposite edge stays put, so the effective width
  // is `startX + startWidth - x`. We use the start geometry's analogue
  // implicitly by clamping width/height against the fixed edge.
  let nextWidth = Math.max(minW, width);
  let nextHeight = Math.max(minH, height);
  let nextX = x;
  let nextY = y;

  // If West handle shrunk below min, push x so width == minW.
  if (direction.includes('w') && width < minW) {
    nextX = x + (width - minW);
    nextWidth = minW;
  }
  if (direction.includes('n') && height < minH) {
    nextY = y + (height - minH);
    nextHeight = minH;
  }

  // Clamp to viewport margin.
  const maxX = Math.max(VIEWPORT_MARGIN, viewportWidth - VIEWPORT_MARGIN - nextWidth);
  const maxY = Math.max(MENU_BAR_HEIGHT, viewportHeight - VIEWPORT_MARGIN - nextHeight);
  nextX = Math.min(Math.max(nextX, VIEWPORT_MARGIN), maxX);
  nextY = Math.min(Math.max(nextY, MENU_BAR_HEIGHT), maxY);

  // Also clamp the bottom-right edge if it goes outside the viewport.
  if (nextX + nextWidth > viewportWidth - VIEWPORT_MARGIN) {
    if (!direction.includes('w')) {
      nextWidth = viewportWidth - VIEWPORT_MARGIN - nextX;
    } else {
      nextX = viewportWidth - VIEWPORT_MARGIN - nextWidth;
    }
  }
  if (nextY + nextHeight > viewportHeight - VIEWPORT_MARGIN) {
    if (!direction.includes('n')) {
      nextHeight = viewportHeight - VIEWPORT_MARGIN - nextY;
    } else {
      nextY = viewportHeight - VIEWPORT_MARGIN - nextHeight;
    }
  }

  return { x: nextX, y: nextY, width: nextWidth, height: nextHeight };
}

export default Window;
