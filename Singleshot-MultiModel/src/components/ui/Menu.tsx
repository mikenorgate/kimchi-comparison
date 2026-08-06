import { useEffect, useRef, useState } from 'react';
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
} from 'react';

import type { MenuBarMenu, MenuBarMenuItem } from '../../types/os';

export interface MenuProps {
  menu: MenuBarMenu;
  /** Pixel position of the menu's top-left corner. */
  position: { x: number; y: number };
  onClose: () => void;
  onItemActivated?: (item: MenuBarMenuItem) => void;
}

/**
 * Compute a position that keeps the menu inside the viewport.
 */
function clampPosition(
  position: { x: number; y: number },
  width: number,
  height: number,
  margin = 8,
): { x: number; y: number } {
  if (typeof window === 'undefined') return position;
  const maxX = Math.max(margin, window.innerWidth - width - margin);
  const maxY = Math.max(margin, window.innerHeight - height - margin);
  return {
    x: Math.min(Math.max(position.x, margin), maxX),
    y: Math.min(Math.max(position.y, margin), maxY),
  };
}

interface PositionedMenuProps {
  menu: MenuBarMenu;
  position: { x: number; y: number };
  onClose: () => void;
  onItemActivated?: (item: MenuBarMenuItem) => void;
}

/**
 * macOS-style dropdown menu used for the Apple menu, app menus, and any
 * anchored dropdown. Supports keyboard navigation (arrow keys, Enter, Escape)
 * and clicks outside.
 */
export function Menu({
  menu,
  position,
  onClose,
  onItemActivated,
}: MenuProps): JSX.Element {
  return (
    <PositionedMenu
      menu={menu}
      position={position}
      onClose={onClose}
      onItemActivated={onItemActivated}
    />
  );
}

function PositionedMenu({
  menu,
  position,
  onClose,
  onItemActivated,
}: PositionedMenuProps): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null);
  const [clamped, setClamped] = useState<{ x: number; y: number }>(position);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Index of the first non-separator item — used for keyboard navigation.
  const navigableIndices = menu.items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => !item.separator && !item.disabled)
    .map(({ idx }) => idx);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setClamped(
      clampPosition(position, rect.width || 220, rect.height || 200),
    );
  }, [position]);

  // Close on outside click.
  useEffect(() => {
    const handleClick = (event: globalThis.MouseEvent): void => {
      const target = event.target as Node | null;
      if (ref.current && target && !ref.current.contains(target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  // Close on Escape (handled at this level too — App.tsx also handles it
  // globally, but menus should still close even if App's handler is
  // overridden in the future).
  useEffect(() => {
    const handleKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [onClose]);

  const style: CSSProperties = {
    left: `${clamped.x}px`,
    top: `${clamped.y}px`,
  };

  const activateItem = (item: MenuBarMenuItem): void => {
    if (item.disabled || item.separator) return;
    if (item.action) {
      try {
        item.action();
      } catch {
        // Swallow action errors so a single bad menu item cannot break the UI.
      }
    }
    onItemActivated?.(item);
    onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (navigableIndices.length === 0) return;
    const currentIdx = hoverIndex;
    const currentPos = currentIdx === null
      ? -1
      : navigableIndices.indexOf(currentIdx);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextPos = (currentPos + 1) % navigableIndices.length;
      setHoverIndex(navigableIndices[nextPos]);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const nextPos = currentPos <= 0
        ? navigableIndices.length - 1
        : currentPos - 1;
      setHoverIndex(navigableIndices[nextPos]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (currentIdx !== null) {
        event.preventDefault();
        const item = menu.items[currentIdx];
        if (item) activateItem(item);
      }
    }
  };

  const handleItemClick = (
    event: MouseEvent<HTMLDivElement>,
    item: MenuBarMenuItem,
  ): void => {
    event.stopPropagation();
    activateItem(item);
  };

  return (
    <div
      ref={ref}
      className="os-menu"
      style={style}
      role="menu"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {menu.items.map((item, idx) => {
        if (item.separator) {
          return <div key={`sep-${idx}`} className="os-menu__separator" role="separator" />;
        }
        const isHovered = hoverIndex === idx;
        const classes = [
          'os-menu__item',
          item.disabled ? 'os-menu__item--disabled' : '',
          isHovered ? 'os-menu__item--hovered' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <div
            key={`${item.label}-${idx}`}
            role="menuitem"
            aria-disabled={item.disabled || undefined}
            className={classes}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex((current) => (current === idx ? null : current))}
            onClick={(event) => handleItemClick(event, item)}
          >
            <span className="os-menu__item-label">{item.label}</span>
            {item.shortcut && (
              <span className="os-menu__item-shortcut">{item.shortcut}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Menu;
