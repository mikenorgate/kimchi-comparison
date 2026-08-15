import { useCallback, useRef, useEffect } from 'react';
import AppIcon from './AppIcon';
import { useWindows, MIN_WIDTH, MIN_HEIGHT } from '../context/WindowContext';
import { getAppById } from '../config/apps';
import './WindowFrame.css';

export default function WindowFrame({ win, children }) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindow,
  } = useWindows();

  const app = getAppById(win.appId);

  // Drag state
  const dragRef = useRef(null);
  // Resize state
  const resizeRef = useRef(null);

  useEffect(() => {
    function onMouseMove(e) {
      if (dragRef.current) {
        const { startX, startY, startWinX, startWinY } = dragRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        updateWindow(win.id, {
          x: startWinX + dx,
          y: startWinY + dy,
        });
      }

      if (resizeRef.current) {
        const {
          direction,
          startX,
          startY,
          startWinX,
          startWinY,
          startWidth,
          startHeight,
        } = resizeRef.current;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let nextX = startWinX;
        let nextY = startWinY;
        let nextWidth = startWidth;
        let nextHeight = startHeight;

        if (direction.includes('e')) {
          nextWidth = Math.max(MIN_WIDTH, startWidth + dx);
        }
        if (direction.includes('s')) {
          nextHeight = Math.max(MIN_HEIGHT, startHeight + dy);
        }
        if (direction.includes('w')) {
          const newWidth = Math.max(MIN_WIDTH, startWidth - dx);
          nextX = startWinX + (startWidth - newWidth);
          nextWidth = newWidth;
        }
        if (direction.includes('n')) {
          const newHeight = Math.max(MIN_HEIGHT, startHeight - dy);
          nextY = startWinY + (startHeight - newHeight);
          nextHeight = newHeight;
        }

        updateWindow(win.id, {
          x: nextX,
          y: nextY,
          width: nextWidth,
          height: nextHeight,
        });
      }
    }

    function onMouseUp() {
      dragRef.current = null;
      resizeRef.current = null;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [updateWindow, win.id]);

  const handleFrameMouseDown = useCallback(() => {
    focusWindow(win.id);
  }, [focusWindow, win.id]);

  const onTitleBarMouseDown = useCallback(
    (e) => {
      if (e.target.closest('.traffic-light') || win.maximized) return;
      focusWindow(win.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWinX: win.x,
        startWinY: win.y,
      };
    },
    [focusWindow, win.id, win.maximized, win.x, win.y]
  );

  const onResizeMouseDown = useCallback(
    (direction) => (e) => {
      e.stopPropagation();
      e.preventDefault();
      focusWindow(win.id);
      resizeRef.current = {
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startWinX: win.x,
        startWinY: win.y,
        startWidth: win.width,
        startHeight: win.height,
      };
    },
    [focusWindow, win.id, win.height, win.width, win.x, win.y]
  );

  const onClose = useCallback(
    (e) => {
      e.stopPropagation();
      closeWindow(win.id);
    },
    [closeWindow, win.id]
  );

  const onMinimize = useCallback(
    (e) => {
      e.stopPropagation();
      minimizeWindow(win.id);
    },
    [minimizeWindow, win.id]
  );

  const onMaximizeRestore = useCallback(
    (e) => {
      e.stopPropagation();
      if (win.maximized) {
        restoreWindow(win.id);
      } else {
        maximizeWindow(win.id);
      }
    },
    [maximizeWindow, restoreWindow, win.id, win.maximized]
  );

  if (win.minimized) {
    return null;
  }

  const style = {
    left: win.x,
    top: win.y,
    width: win.width,
    height: win.height,
    zIndex: win.zIndex,
  };

  const resizeHandles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <div
      className={`window-frame glass-window ${win.maximized ? 'maximized' : ''}`}
      style={style}
      onMouseDown={handleFrameMouseDown}
    >
      <div className="window-titlebar" onMouseDown={onTitleBarMouseDown}>
        <div className="window-traffic-lights">
          <button
            className="traffic-light close"
            aria-label="Close"
            onClick={onClose}
          />
          <button
            className="traffic-light minimize"
            aria-label="Minimize"
            onClick={onMinimize}
          />
          <button
            className="traffic-light maximize"
            aria-label="Maximize"
            onClick={onMaximizeRestore}
          />
        </div>
        <div className="window-title">
          {app && <AppIcon app={app} size={16} variant="clear" />}
          <span>{app?.name || 'Window'}</span>
        </div>
        <div className="window-titlebar-spacer" />
      </div>
      <div className="window-content">{children}</div>
      {!win.maximized &&
        resizeHandles.map((dir) => (
          <div
            key={dir}
            className={`resize-handle resize-${dir}`}
            onMouseDown={onResizeMouseDown(dir)}
          />
        ))}
    </div>
  );
}
