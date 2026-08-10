import { useCallback, useState } from 'react';

export interface ContextMenuState {
  /** Viewport-anchored X coordinate (clientX). */
  x: number;
  /** Viewport-anchored Y coordinate (clientY). */
  y: number;
}

/**
 * Convenience hook that owns the small bit of state required to display a
 * `ContextMenu`. The wrapped consumer renders `<ContextMenu>` only when
 * `menu` is non-null and hands the open/close callbacks to its trigger.
 *
 * The hook intentionally lives at the surface level — it doesn't add or
 * remove event listeners — so the underlying ContextMenu keeps its own
 * outside-click / Escape behaviour.
 */
export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  const open = useCallback((event: React.MouseEvent | MouseEvent) => {
    if ('preventDefault' in event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    setMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const close = useCallback(() => setMenu(null), []);

  return { menu, open, close } as const;
}
