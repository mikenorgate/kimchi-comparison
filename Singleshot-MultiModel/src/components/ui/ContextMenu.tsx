import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import type { MenuBarMenu, MenuBarMenuItem } from '../../types/os';
import { Menu } from './Menu';

export interface ContextMenuProps {
  /** Screen coordinates of the right-click that triggered this menu. */
  position: { x: number; y: number };
  menu: MenuBarMenu;
  onClose: () => void;
  onItemActivated?: (item: MenuBarMenuItem) => void;
}

/**
 * A right-click context menu. Reuses the `Menu` primitive for rendering and
 * behavior, so it inherits keyboard nav, outside-click handling, and viewport
 * clamping. The only difference is that it lives on top of everything via
 * the modal z-index and uses a thin wrapper class for animation overrides.
 */
export function ContextMenu({
  position,
  menu,
  onClose,
  onItemActivated,
}: ContextMenuProps): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const style: CSSProperties = {
    left: 0,
    top: 0,
    visibility: hasMounted ? 'visible' : 'hidden',
  };

  // The Menu component positions itself absolutely based on the `position`
  // prop and clamps to the viewport. We just need to render the wrapper so
  // that the menu's outside-click handler can detect clicks outside.
  return (
    <div ref={wrapperRef} className="os-context-menu" style={style}>
      <Menu
        menu={menu}
        position={position}
        onClose={onClose}
        onItemActivated={onItemActivated}
      />
    </div>
  );
}

export default ContextMenu;
