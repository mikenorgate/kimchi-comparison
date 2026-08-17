'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WindowState } from '@/app/lib/types';
import { useShell } from '@/app/lib/shellContext';

interface WindowFrameProps {
  window: WindowState;
  children?: React.ReactNode;
}

const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

export function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { closeWindow, minimizeWindow, focusWindow, setWindowPosition, setWindowSize } = useShell();
  const frameRef = useRef<HTMLDivElement>(null);

  const [drag, setDrag] = useState<{
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const [resize, setResize] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;
      focusWindow(win.id);
      setDrag({
        startX: e.clientX,
        startY: e.clientY,
        startLeft: win.x,
        startTop: win.y,
      });
    },
    [focusWindow, win.id, win.x, win.y]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      focusWindow(win.id);
      setResize({
        startX: e.clientX,
        startY: e.clientY,
        startWidth: win.width,
        startHeight: win.height,
      });
    },
    [focusWindow, win.id, win.height, win.width]
  );

  useEffect(() => {
    if (!drag && !resize) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (drag) {
        const nextX = Math.max(0, drag.startLeft + (e.clientX - drag.startX));
        const nextY = Math.max(
          28,
          drag.startTop + (e.clientY - drag.startY)
        );
        setWindowPosition(win.id, nextX, nextY);
      }
      if (resize) {
        const nextWidth = Math.max(MIN_WIDTH, resize.startWidth + (e.clientX - resize.startX));
        const nextHeight = Math.max(MIN_HEIGHT, resize.startHeight + (e.clientY - resize.startY));
        setWindowSize(win.id, nextWidth, nextHeight);
      }
    };

    const handleMouseUp = () => {
      setDrag(null);
      setResize(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drag, resize, setWindowPosition, setWindowSize, win.id]);

  if (win.minimized) {
    return (
      <div
        data-testid={`minimized-${win.id}`}
        data-window-id={win.id}
        className="pointer-events-none absolute opacity-0"
        style={{ left: win.x, top: win.y }}
      />
    );
  }

  return (
    <div
      ref={frameRef}
      data-testid={`window-${win.id}`}
      className="absolute overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl"
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        borderColor: 'var(--window-border)',
        background: 'var(--window-bg)',
      }}
      onMouseDown={() => focusWindow(win.id)}
      role="dialog"
      aria-label={win.title}
    >
      <div
        data-testid={`titlebar-${win.id}`}
        className="flex h-9 select-none items-center justify-between px-3"
        style={{ background: 'var(--titlebar-bg)' }}
        onMouseDown={handleTitleMouseDown}
      >
        <div className="flex items-center gap-2">
          <button
            data-testid={`close-${win.id}`}
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="h-3 w-3 rounded-full bg-[#ff5f57] hover:brightness-90"
          />
          <button
            data-testid={`minimize-${win.id}`}
            aria-label="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            className="h-3 w-3 rounded-full bg-[#febc2e] hover:brightness-90"
          />
          <button
            data-testid={`zoom-${win.id}`}
            aria-label="Zoom"
            className="h-3 w-3 rounded-full bg-[#28c840] hover:brightness-90"
          />
        </div>
        <span
          data-testid={`title-${win.id}`}
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium"
        >
          {win.title}
        </span>
      </div>
      <div className="relative h-[calc(100%-2.25rem)] overflow-auto p-1">
        {children}
        <div
          data-testid={`resize-${win.id}`}
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize"
          aria-label="Resize"
        />
      </div>
    </div>
  );
}
