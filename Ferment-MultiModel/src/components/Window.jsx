/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Window
 *
 * Single draggable, focusable application window. Receives all state via
 * props so it can be controlled by a parent (typically WindowManager
 * wired to a reducer) and remains decoupled from WindowContext.
 *
 * Drag implementation uses native mouse events (mousedown / mousemove /
 * mouseup) rather than pointer events because mouse events are reliably
 * propagated through jsdom in the test environment, where pointer
 * events have inconsistent `clientX` / `button` handling.
 */

const MIN_WINDOW_WIDTH = 240;
const MIN_WINDOW_HEIGHT = 160;

function clampSize(width, height) {
  const w =
    typeof width === 'number' && Number.isFinite(width)
      ? Math.max(MIN_WINDOW_WIDTH, width)
      : MIN_WINDOW_WIDTH;
  const h =
    typeof height === 'number' && Number.isFinite(height)
      ? Math.max(MIN_WINDOW_HEIGHT, height)
      : MIN_WINDOW_HEIGHT;
  return { width: w, height: h };
}

function fallbackTitle(appId) {
  if (typeof appId !== 'string' || appId.length === 0) return '';
  return appId.charAt(0).toUpperCase() + appId.slice(1);
}

function readCoords(event) {
  if (!event) return { x: 0, y: 0 };
  const native =
    typeof event.nativeEvent === 'object' && event.nativeEvent
      ? event.nativeEvent
      : event;
  const x = typeof native.clientX === 'number' ? native.clientX : 0;
  const y = typeof native.clientY === 'number' ? native.clientY : 0;
  return { x, y };
}

function Window({
  id,
  appId,
  title,
  icon,
  x,
  y,
  width,
  height,
  zIndex,
  minimized = false,
  isActive = false,
  isFullscreen = false,
  onFocus,
  onClose,
  onMinimize,
  onFullscreen,
  onDrag,
  onResize,
  children,
}) {
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const onDragRef = useRef(onDrag);

  const resizingRef = useRef(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const onResizeRef = useRef(onResize);

  // Keep the latest callbacks in refs so the document-level listeners
  // do not capture stale references between renders.
  useLayoutEffect(() => {
    onDragRef.current = onDrag;
  }, [onDrag]);
  useLayoutEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  // Global mousemove / mouseup listeners. These are attached for the
  // lifetime of the component but only do work while a drag/resize
  // is in progress.
  useEffect(() => {
    function handleMouseMove(event) {
      if (draggingRef.current) {
        const coords = readCoords(event);
        const deltaX = coords.x - dragStartRef.current.x;
        const deltaY = coords.y - dragStartRef.current.y;
        const cb = onDragRef.current;
        if (typeof cb === 'function') {
          cb(id, deltaX, deltaY);
        }
        return;
      }
      if (resizingRef.current) {
        const coords = readCoords(event);
        const deltaX = coords.x - resizeStartRef.current.x;
        const deltaY = coords.y - resizeStartRef.current.y;
        const { width, height } = clampSize(
          resizeStartRef.current.width + deltaX,
          resizeStartRef.current.height + deltaY,
        );
        const cb = onResizeRef.current;
        if (typeof cb === 'function') {
          cb(id, width, height);
        }
      }
    }

    function handleMouseUp() {
      draggingRef.current = false;
      resizingRef.current = false;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      draggingRef.current = false;
      resizingRef.current = false;
    };
  }, [id]);

  const handleTitleBarMouseDown = useCallback(
    (event) => {
      const button =
        event && typeof event.button === 'number' ? event.button : 0;
      if (button !== 0) return;

      // Focus the window when a drag starts.
      if (typeof onFocus === 'function') {
        onFocus(id);
      }

      const coords = readCoords(event);
      dragStartRef.current = { x: coords.x, y: coords.y };
      draggingRef.current = true;

      // Prevent the synthetic mousedown from bubbling up to the body
      // and triggering a redundant focus call.
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    },
    [id, onFocus],
  );

  const handleBodyMouseDown = useCallback(
    (event) => {
      const button =
        event && typeof event.button === 'number' ? event.button : 0;
      if (button !== 0) return;
      if (typeof onFocus === 'function') {
        onFocus(id);
      }
    },
    [id, onFocus],
  );

  const handleResizeMouseDown = useCallback(
    (event) => {
      const button =
        event && typeof event.button === 'number' ? event.button : 0;
      if (button !== 0) return;
      const coords = readCoords(event);
      resizeStartRef.current = {
        x: coords.x,
        y: coords.y,
        width: typeof width === 'number' ? width : MIN_WINDOW_WIDTH,
        height: typeof height === 'number' ? height : MIN_WINDOW_HEIGHT,
      };
      resizingRef.current = true;
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
    },
    [width, height],
  );

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose(id);
    }
  }, [id, onClose]);

  const handleMinimize = useCallback(() => {
    if (typeof onMinimize === 'function') {
      onMinimize(id);
    }
  }, [id, onMinimize]);

  const handleFullscreen = useCallback(() => {
    if (typeof onFullscreen === 'function') {
      onFullscreen(id, !isFullscreen);
    }
  }, [id, isFullscreen, onFullscreen]);

  if (minimized) {
    return null;
  }

  const resolvedTitle =
    typeof title === 'string' && title.length > 0 ? title : fallbackTitle(appId);

  const style = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: typeof zIndex === 'number' ? zIndex : undefined,
  };

  const containerClassName = [
    'absolute',
    'window-glass',
    'rounded-xl',
    'overflow-hidden',
    'shadow-2xl',
    'flex',
    'flex-col',
    isActive ? 'window-active' : 'window-inactive',
  ].join(' ');

  // Stop click/mousedown propagation on title bar buttons so they don't
  // bubble to the body click handler (and cause a redundant focus call).
  const stop = (handler) => (event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    handler();
  };

  const stopMouseDown = (event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
  };

  return (
    <div
      data-testid="window"
      data-app-id={appId}
      data-window-id={id}
      data-active={isActive ? 'true' : 'false'}
      data-fullscreen={isFullscreen ? 'true' : 'false'}
      role="group"
      aria-label={`${resolvedTitle} window`}
      className={containerClassName}
      style={style}
      onMouseDown={handleBodyMouseDown}
    >
      <div
        data-testid="titlebar"
        className="glass-dark flex items-center justify-between px-3 py-1.5 select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleTitleBarMouseDown}
      >
        <div
          data-testid="titlebar-controls"
          className="flex items-center gap-1.5"
        >
          <button
            type="button"
            data-testid="window-close"
            aria-label="Close"
            onMouseDown={stopMouseDown}
            onClick={stop(handleClose)}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          />
          <button
            type="button"
            data-testid="window-minimize"
            aria-label="Minimize"
            onMouseDown={stopMouseDown}
            onClick={stop(handleMinimize)}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          />
          <button
            type="button"
            data-testid="window-fullscreen"
            aria-label="Fullscreen"
            data-fullscreen-state={isFullscreen ? 'on' : 'off'}
            onMouseDown={stopMouseDown}
            onClick={stop(handleFullscreen)}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          />
        </div>

        <div
          data-testid="titlebar-title"
          className="flex-1 mx-3 text-center text-xs font-medium text-white/90 truncate"
        >
          {resolvedTitle}
        </div>

        <div
          data-testid="titlebar-icon"
          aria-hidden={icon ? 'false' : 'true'}
          className="flex items-center justify-center min-w-[1.5rem]"
        >
          {icon}
        </div>
      </div>

      <div
        data-testid="window-body"
        className="flex-1 overflow-auto"
      >
        {children}
      </div>

      <div
        data-testid="window-resize"
        role="presentation"
        aria-hidden="true"
        onMouseDown={handleResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className="block"
        >
          <path
            d="M14 6 L6 14 M14 10 L10 14 M14 14 L14 14"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.6"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

export default Window;
