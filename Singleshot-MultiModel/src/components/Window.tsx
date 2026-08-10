import { useCallback } from 'react';
import { useWindowStore } from '../stores/windowStore';
import { getAppDefinition } from '../lib/apps';
import { useDrag, type DragDelta } from '../hooks/useDrag';
import { useResize, type ResizeAnchor } from '../hooks/useResize';
import type { WindowState } from '../types';
import TitleBar from './TitleBar';
import ResizeHandle from './ResizeHandle';

const MENU_BAR_HEIGHT = 28;

const RESIZE_ANCHORS: ResizeAnchor[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

interface WindowProps {
  windowId: string;
}

interface ComputedBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Compute new bounds after a resize delta is applied to a given anchor.
 * Width/height never drop below the window's minWidth/minHeight. When the
 * left or top edges move, the corresponding x/y is adjusted so the corner
 * the user is dragging stays under the cursor as much as possible.
 */
function computeResize(
  win: WindowState,
  anchor: ResizeAnchor,
  delta: DragDelta,
): ComputedBounds {
  let x = win.x;
  let y = win.y;
  let width = win.width;
  let height = win.height;

  const touchesEast = anchor.includes('e');
  const touchesWest = anchor.includes('w');
  const touchesNorth = anchor.includes('n');
  const touchesSouth = anchor.includes('s');

  if (touchesEast) {
    width = win.width + delta.dx;
  }
  if (touchesSouth) {
    height = win.height + delta.dy;
  }
  if (touchesWest) {
    const proposedWidth = win.width - delta.dx;
    if (proposedWidth >= win.minWidth) {
      width = proposedWidth;
      x = win.x + delta.dx;
    } else {
      width = win.minWidth;
      x = win.x + (win.width - win.minWidth);
    }
  }
  if (touchesNorth) {
    const proposedHeight = win.height - delta.dy;
    if (proposedHeight >= win.minHeight) {
      height = proposedHeight;
      y = win.y + delta.dy;
    } else {
      height = win.minHeight;
      y = win.y + (win.height - win.minHeight);
    }
  }

  width = Math.max(win.minWidth, width);
  height = Math.max(win.minHeight, height);

  return { x, y, width, height };
}

interface ResizeHandleWithHookProps {
  anchor: ResizeAnchor;
  windowId: string;
  onResize: (delta: DragDelta) => void;
}

/**
 * Small wrapper so each ResizeHandle gets its own `useResize` instance
 * (hooks must be called in stable order, not inside a map).
 */
function ResizeHandleWithHook({ anchor, windowId, onResize }: ResizeHandleWithHookProps) {
  const { startResize } = useResize(anchor, onResize);
  return (
    <ResizeHandle
      position={anchor}
      windowId={windowId}
      onPointerDown={(e) => startResize(e)}
    />
  );
}

export default function Window({ windowId }: WindowProps) {
  const win = useWindowStore((s) => s.windows[windowId]);
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const resizeWindow = useWindowStore((s) => s.resizeWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);

  const handleDragMove = useCallback(
    (delta: DragDelta) => {
      const current = useWindowStore.getState().windows[windowId];
      if (!current) return;
      if (current.maximized) {
        // Unmaximize first; subsequent moves will operate on the restored bounds.
        toggleMaximize(windowId);
        return;
      }
      // Clamp so the title bar (and therefore the drag handle) stays inside
      // the viewport. Without clamping the user can drag the window fully
      // off-screen and lose the ability to grab it again.
      const viewportW = typeof window !== 'undefined' ? window.innerWidth : 0;
      const viewportH = typeof window !== 'undefined' ? window.innerHeight : 0;
      // Keep at least 80px of the window's width visible horizontally so the
      // title bar / grab area stays reachable; the top edge cannot be dragged
      // above the menu bar.
      const minVisibleX = 80;
      const maxX = Math.max(viewportW - minVisibleX, viewportW - 1);
      const maxY = Math.max(viewportH - 20, MENU_BAR_HEIGHT);
      const proposedX = current.x + delta.dx;
      const proposedY = current.y + delta.dy;
      const nextX = Math.min(Math.max(proposedX, -current.width + minVisibleX), maxX);
      const nextY = Math.min(Math.max(proposedY, MENU_BAR_HEIGHT), maxY);
      moveWindow(windowId, nextX, nextY);
    },
    [windowId, moveWindow, toggleMaximize],
  );

  const { startDrag } = useDrag(handleDragMove);

  const handleResizeMove = useCallback(
    (anchor: ResizeAnchor, delta: DragDelta) => {
      const current = useWindowStore.getState().windows[windowId];
      if (!current || current.maximized) return;
      const next = computeResize(current, anchor, delta);
      if (next.width !== current.width || next.height !== current.height) {
        resizeWindow(windowId, next.width, next.height);
      }
      if (next.x !== current.x || next.y !== current.y) {
        moveWindow(windowId, next.x, next.y);
      }
    },
    [windowId, moveWindow, resizeWindow],
  );

  // Hidden when minimized (per spec) or unknown id.
  if (!win || win.minimized) return null;

  const def = getAppDefinition(win.appId);
  const AppComponent = def?.component;

  const style: React.CSSProperties = win.maximized
    ? {
        left: 0,
        top: MENU_BAR_HEIGHT,
        width: '100vw',
        height: `calc(100vh - ${MENU_BAR_HEIGHT}px)`,
      }
    : {
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
      };

  return (
    <div
      data-testid={`window-${windowId}`}
      data-window-id={windowId}
      data-z-index={win.zIndex}
      data-maximized={win.maximized ? 'true' : 'false'}
      onPointerDown={() => focusWindow(windowId)}
      className="absolute flex flex-col overflow-hidden rounded-lg bg-white/95 shadow-2xl ring-1 ring-black/10 backdrop-blur-md"
      style={{ ...style, zIndex: win.zIndex }}
    >
      <TitleBar
        title={win.title}
        isMaximized={win.maximized}
        windowId={windowId}
        onClose={() => closeWindow(windowId)}
        onMinimize={() => minimizeWindow(windowId)}
        onMaximize={() => toggleMaximize(windowId)}
        onPointerDown={(e) => startDrag(e)}
      />
      <div className="flex-1 overflow-auto bg-white">
        {AppComponent ? <AppComponent windowId={windowId} /> : null}
      </div>
      {RESIZE_ANCHORS.map((anchor) => (
        <ResizeHandleWithHook
          key={anchor}
          anchor={anchor}
          windowId={windowId}
          onResize={(delta) => handleResizeMove(anchor, delta)}
        />
      ))}
    </div>
  );
}
