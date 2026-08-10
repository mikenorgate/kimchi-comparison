import { useEffect, useRef } from 'react';
import Menu from './Menu';
import type { MenuItem } from '../types';

interface ContextMenuProps {
  /** Viewport-anchored X coordinate (clientX). */
  x: number;
  /** Viewport-anchored Y coordinate (clientY). */
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

/**
 * Absolutely-positioned dropdown that closes when the user clicks outside of
 * it or presses Escape. Designed to be rendered at the screen root so it floats
 * above all other UI.
 */
export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const node = menuRef.current;
      if (node && event.target instanceof Node && node.contains(event.target)) {
        return;
      }
      onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const handleCloseMenus = () => onClose();
    // Pointerdown fires before click; using it avoids needing to stop the
    // contextmenu event from re-opening the menu immediately.
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('contextmenu', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('app:close-menus', handleCloseMenus);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('contextmenu', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('app:close-menus', handleCloseMenus);
    };
  }, [onClose]);

  // Clamp the menu inside the viewport so it stays reachable when invoked near
  // an edge.
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - items.length * 28 - 16),
    zIndex: 9999,
  };

  return (
    <div ref={menuRef} style={style} data-testid="context-menu">
      <Menu items={items} onClose={onClose} />
    </div>
  );
}
