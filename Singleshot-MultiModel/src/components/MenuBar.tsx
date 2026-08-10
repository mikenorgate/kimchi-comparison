import { useEffect, useRef, useState } from 'react';
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
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
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

export default function MenuBar() {
  const activeWindowId = useWindowStore((s) => s.activeWindowId);
  const apps = useAppRegistry((s) => s.apps);
  const activeAppId = getActiveAppId(activeWindowId);
  const activeApp = apps[activeAppId] ?? apps.finder;

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
          {activeApp.menus.map((menu) => (
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
