import { useEffect, useMemo, useRef, useState } from 'react';
import { useWindowStore } from '../stores/windowStore';
import { useAppRegistry } from '../lib/apps';
import type { MenuItem } from '../types';
import AppleMenu from './AppleMenu';
import Clock from './Clock';
import StatusMenu from './StatusMenu';
import Menu from './Menu';

interface MenuButtonProps {
  label: string;
  items: MenuItem[];
  bold?: boolean;
}

function MenuButton({ label, items, bold }: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const node = rootRef.current;
      if (node && event.target instanceof Node && node.contains(event.target)) return;
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const handleCloseMenus = () => setOpen(false);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('app:close-menus', handleCloseMenus);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('app:close-menus', handleCloseMenus);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative h-full">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={
          'flex h-full items-center px-3 text-white text-sm ' +
          (bold ? 'font-semibold ' : '') +
          (open ? 'bg-white/25' : 'hover:bg-white/10')
        }
      >
        {label}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50">
          <Menu
            items={items}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

function getActiveAppId(activeWindowId: string | null): string {
  if (!activeWindowId) return 'finder';
  const win = useWindowStore.getState().windows[activeWindowId];
  return win?.appId ?? 'finder';
}

/**
 * Dispatch a `terminal:menu-action` event on the active Terminal window.
 * The Terminal app listens for this and runs the matching command.
 */
function dispatchTerminalAction(activeWindowId: string | null, action: string) {
  if (!activeWindowId) return;
  document.dispatchEvent(
    new CustomEvent('terminal:menu-action', {
      detail: { windowId: activeWindowId, action },
    }),
  );
}

/**
 * Provide a sensible default action for known universal menu items (e.g.
 * Close Window, Minimize). This makes the menu bar functional even when an
 * app hasn't wired its own handler. Items the app already gave an `action`
 * to are left alone.
 */
function applyDefaultActions(items: MenuItem[]): MenuItem[] {
  const closeActiveWindow = () => {
    const id = useWindowStore.getState().activeWindowId;
    if (id) useWindowStore.getState().closeWindow(id);
  };
  const minimizeActiveWindow = () => {
    const id = useWindowStore.getState().activeWindowId;
    if (id) useWindowStore.getState().minimizeWindow(id);
  };
  const zoomActiveWindow = () => {
    const id = useWindowStore.getState().activeWindowId;
    if (id) useWindowStore.getState().toggleMaximize(id);
  };

  return items.map((item) => {
    if (item.action) return item;
    if (item.separator) return item;
    switch (item.id) {
      case 'close':
      case 'close-window':
        return { ...item, action: closeActiveWindow };
      case 'minimize':
        return { ...item, action: minimizeActiveWindow };
      case 'zoom':
      case 'zoom-window':
        return { ...item, action: zoomActiveWindow };
      default:
        return item;
    }
  });
}

/**
 * Build the active app's menus with runtime actions wired in. Terminal gets
 * its Shell actions wired here; every other app gets default actions for
 * universal items (close / minimize / zoom).
 */
function buildActiveMenus(
  appId: string,
  activeWindowId: string | null,
  baseMenus: MenuItem[]
): MenuItem[] {
  return baseMenus.map((menu) => {
    if (!menu.submenu) return menu;
    let submenu = applyDefaultActions(menu.submenu);
    if (appId === 'terminal' && menu.id === 'shell') {
      const openWindow = useWindowStore.getState().openWindow;
      submenu = submenu.map((item) => {
        if (item.id === 'new-window') {
          return {
            ...item,
            action: () => {
              openWindow('terminal');
              dispatchTerminalAction(activeWindowId, 'focus');
            },
          };
        }
        if (item.id === 'clear') {
          return { ...item, action: () => dispatchTerminalAction(activeWindowId, 'clear') };
        }
        return item;
      });
    }
    return { ...menu, submenu };
  });
}

export default function MenuBar() {
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const apps = useAppRegistry((s) => s.apps);
  const activeAppId = getActiveAppId(activeWindowId);
  const activeApp = apps[activeAppId] ?? apps.finder;
  const menus = useMemo(
    () => buildActiveMenus(activeAppId, activeWindowId, activeApp.menus),
    [activeAppId, activeWindowId, activeApp.menus],
  );

  return (
    <div
      data-testid="menu-bar"
      data-active-app={activeApp.id}
      className="relative z-40 flex h-7 w-full items-center justify-between bg-black/30 backdrop-blur-md select-none"
    >
      <div className="flex h-full items-center">
        <AppleMenu />
        <div className="flex h-full items-center">
          <MenuButton label={activeApp.name} items={[]} bold />
          {menus.map((menu) => (
            <MenuButton
              key={`${activeApp.id}-${menu.id}`}
              label={menu.label ?? menu.id}
              items={menu.submenu ?? []}
            />
          ))}
        </div>
      </div>
      <div className="flex h-full items-center">
        <StatusMenu />
        <Clock />
      </div>
    </div>
  );
}
