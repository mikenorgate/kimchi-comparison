import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  BatteryFull,
  Search,
  SlidersHorizontal,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

import { useOSStore } from '../store/osStore';
import type { MenuBarMenu, StatusIcon } from '../types/os';
import { Menu } from './ui/Menu';
import { IconButton } from './ui/IconButton';

const ICON_MAP: Record<string, LucideIcon> = {
  BatteryFull,
  Wifi,
  Search,
  SlidersHorizontal,
};

interface OpenMenu {
  kind: 'apple' | 'app';
  index: number;
  /** Anchor element used to position the dropdown. */
  anchorRect: DOMRect;
}

function formatClock(date: Date): string {
  const day = date.toLocaleDateString(undefined, { weekday: 'short' });
  const month = date.toLocaleDateString(undefined, { month: 'short' });
  const dayNum = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = ((hours + 11) % 12) + 1;
  return `${day} ${month} ${dayNum}  ${hour12}:${minutes} ${ampm}`;
}

/**
 * 28px translucent top bar: Apple menu (left), app menus (File/Edit/View…),
 * status icons + clock (right).
 */
export function MenuBar(): JSX.Element {
  const menuBar = useOSStore((state) => state.menuBar);
  const spotlightOpen = useOSStore((state) => state.spotlightOpen);
  const controlCenterOpen = useOSStore((state) => state.controlCenterOpen);
  const launchpadOpen = useOSStore((state) => state.launchpadOpen);
  const openSpotlight = useOSStore((state) => state.openSpotlight);
  const closeSpotlight = useOSStore((state) => state.closeSpotlight);
  const openControlCenter = useOSStore((state) => state.openControlCenter);
  const closeControlCenter = useOSStore((state) => state.closeControlCenter);

  const [openMenu, setOpenMenu] = useState<OpenMenu | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  // Update clock every minute (and on the next minute boundary so it ticks
  // at :00).
  useEffect(() => {
    const update = (): void => setNow(new Date());
    update();
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const initial = window.setTimeout(() => {
      update();
      intervalId = window.setInterval(update, 60_000);
    }, msToNextMinute);
    let intervalId: number = 0;
    return () => {
      window.clearTimeout(initial);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  // When any overlay opens, close any open dropdown menu.
  useEffect(() => {
    if (spotlightOpen || launchpadOpen) {
      setOpenMenu(null);
    }
  }, [spotlightOpen, launchpadOpen]);

  const handleMenuToggle = useCallback(
    (
      kind: OpenMenu['kind'],
      index: number,
      anchor: HTMLElement,
    ): void => {
      const rect = anchor.getBoundingClientRect();
      if (
        openMenu &&
        openMenu.kind === kind &&
        openMenu.index === index
      ) {
        setOpenMenu(null);
        return;
      }
      setOpenMenu({ kind, index, anchorRect: rect });
    },
    [openMenu],
  );

  // Close open menu when clicking outside it / the anchor buttons.
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!openMenu) return;
    const handleClick = (event: globalThis.MouseEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      // Let the Menu primitive handle outside clicks within its own dropdown.
      const menuEl = document.querySelector('.os-menu');
      if (menuEl && menuEl.contains(target)) return;
      setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [openMenu]);

  // Close menu on Escape — App-level handler also fires, but doing it here
  // ensures the menu closes even if other overlays have their own Escape
  // behaviour.
  useEffect(() => {
    if (!openMenu) return;
    const handleKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpenMenu(null);
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => {
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [openMenu]);

  const activeAppMenus = useMemo<MenuBarMenu[]>(
    () => menuBar.appMenus,
    [menuBar.appMenus],
  );

  const openMenuData = useMemo(() => {
    if (!openMenu) return null;
    if (openMenu.kind === 'apple') {
      return {
        menu: menuBar.appleMenu,
        x: openMenu.anchorRect.left,
        y: openMenu.anchorRect.bottom + 4,
      };
    }
    const menu = activeAppMenus[openMenu.index];
    if (!menu) return null;
    return {
      menu,
      x: openMenu.anchorRect.left,
      y: openMenu.anchorRect.bottom + 4,
    };
  }, [openMenu, menuBar.appleMenu, activeAppMenus]);

  const handleStatusIconClick = (status: StatusIcon): void => {
    switch (status.id) {
      case 'spotlight':
        if (spotlightOpen) closeSpotlight();
        else openSpotlight();
        break;
      case 'control-center':
        if (controlCenterOpen) closeControlCenter();
        else openControlCenter();
        break;
      case 'wifi':
      case 'battery':
        // For mock, these also toggle the control center.
        if (controlCenterOpen) closeControlCenter();
        else openControlCenter();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="menubar" role="menubar" aria-label="Menu bar">
      <div className="menubar__left">
        <button
          type="button"
          className={[
            'menubar__item',
            'menubar__apple',
            openMenu?.kind === 'apple' ? 'menubar__item--active' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="Apple menu"
          onClick={(event) =>
            handleMenuToggle('apple', 0, event.currentTarget)
          }
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M11.182 8.215c-.018-1.879 1.535-2.78 1.605-2.825-.875-1.282-2.238-1.458-2.722-1.479-1.16-.117-2.262.683-2.85.683-.591 0-1.494-.666-2.456-.647-1.262.018-2.426.733-3.074 1.864-1.31 2.272-.336 5.635.945 7.483.625.904 1.371 1.92 2.348 1.884.94-.037 1.296-.61 2.43-.61 1.135 0 1.456.61 2.452.59 1.013-.018 1.654-.923 2.276-1.83.717-1.05 1.013-2.067 1.031-2.12-.022-.01-1.978-.758-1.985-3.003zM9.305 2.74c.516-.625.864-1.493.768-2.357-.743.03-1.642.494-2.176 1.119-.479.553-.898 1.438-.785 2.286.83.065 1.677-.422 2.193-1.048z" />
          </svg>
        </button>
        <span
          className={[
            'menubar__item',
            'menubar__item--bold',
            openMenu?.kind === 'app' && openMenu.index === -1
              ? 'menubar__item--active'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={menuBar.activeAppName}
          onClick={(event) =>
            handleMenuToggle('app', -1, event.currentTarget)
          }
        >
          {menuBar.activeAppName}
        </span>
        {activeAppMenus.map((menu, idx) => {
          const isActive =
            openMenu?.kind === 'app' && openMenu.index === idx;
          return (
            <button
              key={`${menu.title}-${idx}`}
              type="button"
              className={[
                'menubar__item',
                isActive ? 'menubar__item--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={(event) =>
                handleMenuToggle('app', idx, event.currentTarget)
              }
            >
              {menu.title}
            </button>
          );
        })}
      </div>

      <div className="menubar__right">
        <span className="menubar__divider" aria-hidden="true" />
        <span className="menubar__clock" aria-live="polite">
          {formatClock(now)}
        </span>
        <span className="menubar__divider" aria-hidden="true" />
        {menuBar.statusIcons.map((status) => {
          const Icon = ICON_MAP[status.icon] ?? BatteryFull;
          const isActive =
            (status.id === 'spotlight' && spotlightOpen) ||
            (status.id === 'control-center' && controlCenterOpen);
          return (
            <IconButton
              key={status.id}
              label={status.tooltip ?? status.id}
              active={isActive}
              onClick={() => handleStatusIconClick(status)}
            >
              <Icon aria-hidden="true" />
            </IconButton>
          );
        })}
      </div>

      {openMenuData && (
        <Menu
          menu={openMenuData.menu}
          position={{ x: openMenuData.x, y: openMenuData.y }}
          onClose={() => setOpenMenu(null)}
        />
      )}
    </div>
  );
}

export default MenuBar;
