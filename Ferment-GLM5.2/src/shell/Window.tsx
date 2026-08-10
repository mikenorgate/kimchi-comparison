/**
 * Window — a single desktop window with Liquid Glass chrome.
 *
 * Features:
 * - Traffic light buttons (close, minimize, maximize) — left side of title bar
 * - Draggable by title bar (mousedown on title bar → mousemove updates position)
 * - Resizable from bottom-right corner
 * - Squircle-rounded corners with glass surface
 * - Minimize → genie animation (scale + opacity + transform to dock position)
 * - Maximize → fullscreen (insets from screen edges)
 * - Focus on click (brings to front via z-index)
 * - Title in center of title bar
 * - Children content area
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  useWindowStore,
  type WindowState,
  WINDOW_MIN_WIDTH,
  WINDOW_MIN_HEIGHT,
} from '@/store/windows';

interface WindowProps {
  win: WindowState;
  focused: boolean;
  children?: ReactNode;
}

// ── Traffic Light Button ──────────────────────────────────────────

function TrafficLight({
  color,
  symbol,
  onClick,
  label,
  disabled,
}: {
  color: string;
  symbol: string;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      className="group relative flex items-center justify-center rounded-full transition-transform hover:scale-110"
      style={{ width: 12, height: 12, backgroundColor: color, opacity: disabled ? 0.4 : 1 }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={label}
      data-testid={`traffic-${label}`}
    >
      <span
        className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold leading-none"
        style={{ color: 'rgba(0,0,0,0.5)' }}
      >
        {symbol}
      </span>
    </button>
  );
}

// ── Window Component ──────────────────────────────────────────────

export function Window({ win, focused, children }: WindowProps) {
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const setWindowPosition = useWindowStore((s) => s.setWindowPosition);
  const setWindowSize = useWindowStore((s) => s.setWindowSize);

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, winX: 0, winY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const handleTitleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (win.maximized) return;
      e.preventDefault();
      focusWindow(win.id);
      setDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        winX: win.x,
        winY: win.y,
      };
    },
    [win.id, win.x, win.y, win.maximized, focusWindow]
  );

  const handleResizeMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.id);
      setResizing(true);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: win.width,
        h: win.height,
      };
    },
    [win.id, win.width, win.height, focusWindow]
  );

  useEffect(() => {
    if (!dragging && !resizing) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (dragging) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setWindowPosition(win.id, dragStart.current.winX + dx, dragStart.current.winY + dy);
      }
      if (resizing) {
        const dw = e.clientX - resizeStart.current.x;
        const dh = e.clientY - resizeStart.current.y;
        setWindowSize(
          win.id,
          Math.max(WINDOW_MIN_WIDTH, resizeStart.current.w + dw),
          Math.max(WINDOW_MIN_HEIGHT, resizeStart.current.h + dh),
        );
      }
    };

    const handleMouseUp = () => {
      setDragging(false);
      setResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, win.id, setWindowPosition, setWindowSize]);

  // Computed styles
  const isMaximized = win.maximized;
  const style: React.CSSProperties = isMaximized
    ? {
        left: 0,
        top: 'var(--height-menubar)',
        width: '100vw',
        height: 'calc(100vh - var(--height-menubar) - var(--height-dock) - 8px)',
        zIndex: win.zIndex,
        borderRadius: 0,
      }
    : {
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      };

  // Minimize: render hidden (genie effect handled by CSS class)
  if (win.minimized) {
    return (
      <div
        className="window-minimized"
        data-testid={`window-${win.id}`}
        data-app={win.appId}
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <div
      className="glass-surface absolute flex flex-col overflow-hidden"
      style={{
        ...style,
        borderRadius: isMaximized ? 0 : 'var(--radius-window)',
        boxShadow: focused ? 'var(--shadow-window)' : 'var(--shadow-panel)',
        border: '0.5px solid rgba(0,0,0,0.12)',
        transition: dragging || resizing ? 'none' : 'box-shadow 0.2s ease',
        opacity: focused ? 1 : 0.95,
      }}
      onMouseDown={() => {
        if (!focused) focusWindow(win.id);
      }}
      data-testid={`window-${win.id}`}
      data-app={win.appId}
    >
      {/* Title Bar */}
      <div
        className="flex items-center px-3 select-none cursor-grab active:cursor-grabbing"
        style={{
          height: 38,
          backgroundImage: 'var(--gradient-chrome-bar)',
          borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        }}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => toggleMaximize(win.id)}
        data-testid="window-titlebar"
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-2 group">
          <TrafficLight
            color="#ff5f57"
            symbol="✕"
            onClick={() => closeWindow(win.id)}
            label="close"
          />
          <TrafficLight
            color="#ffbd2e"
            symbol="−"
            onClick={() => minimizeWindow(win.id)}
            label="minimize"
          />
          <TrafficLight
            color="#28c840"
            symbol="＋"
            onClick={() => toggleMaximize(win.id)}
            label="maximize"
          />
        </div>

        {/* Title */}
        <div className="flex-1 text-center text-[13px] font-medium text-black/70 dark:text-white/70">
          {win.title}
        </div>

        {/* Spacer to balance traffic lights */}
        <div style={{ width: 52 }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white/60 dark:bg-gray-900/60" data-testid="window-content">
        {children ?? (
          <div className="flex items-center justify-center h-full text-black/40 dark:text-white/40 text-sm">
            {win.title}
          </div>
        )}
      </div>

      {/* Resize handle (bottom-right corner) */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 cursor-se-resize"
          style={{ width: 16, height: 16 }}
          onMouseDown={handleResizeMouseDown}
          data-testid="window-resize-handle"
        />
      )}
    </div>
  );
}
