import { useState } from 'react';
import { Apple } from 'lucide-react';
import { useWindowStore } from '../stores/windowStore';
import { useSystemStore } from '../stores/systemStore';
import Menu from './Menu';
import type { MenuItem } from '../types';

/**
 * Universal Apple menu. Always present in the menu bar regardless of which
 * app has focus. Actions are placeholders for Chunk 7 (System Settings app
 * handles real wallpaper/accent changes; this just wires up the openWindow
 * call for Settings).
 */
export default function AppleMenu() {
  const [open, setOpen] = useState(false);
  const computerName = useSystemStore((s) => s.computerName);
  const openWindow = useWindowStore((s) => s.openWindow);

  const items: MenuItem[] = [
    {
      id: 'about',
      label: `About This Mac`,
      action: () => {
        // Placeholder: would open the About panel in a real build.
      },
    },
    { id: 'sep-1', separator: true },
    {
      id: 'settings',
      label: 'System Settings…',
      action: () => {
        openWindow('settings');
      },
    },
    {
      id: 'app-store',
      label: 'App Store…',
      disabled: true,
      action: () => {},
    },
    { id: 'sep-2', separator: true },
    {
      id: 'sleep',
      label: 'Sleep',
      action: () => {},
    },
    {
      id: 'restart',
      label: 'Restart…',
      action: () => {},
    },
    {
      id: 'shutdown',
      label: 'Shut Down…',
      action: () => {},
    },
    { id: 'sep-3', separator: true },
    {
      id: 'lock-screen',
      label: 'Lock Screen',
      shortcut: 'Cmd+Ctrl+Q',
      action: () => {},
    },
    {
      id: 'logout',
      label: `Log Out ${computerName}…`,
      shortcut: 'Shift+Cmd+Q',
      action: () => {},
    },
  ];

  return (
    <div className="relative" data-testid="apple-menu-root">
      <button
        type="button"
        aria-label="Apple menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={
          'flex h-full items-center px-3 text-white ' +
          (open ? 'bg-white/20' : 'hover:bg-white/10')
        }
      >
        <Apple className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full"
          data-testid="apple-menu-dropdown"
        >
          <Menu items={items} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
