'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Wifi,
  Bluetooth,
  BatteryMedium,
  Sun,
  Moon,
  Search,
  Command,
  SlidersHorizontal,
} from 'lucide-react';
import { useShell } from '@/app/lib/shellContext';
import { useTheme } from './ThemeProvider';
import { APPS } from '@/app/lib/apps';
import { ControlCenter } from './ControlCenter';

function formatClock(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return date.toLocaleString('en-US', options).replace(/,/g, '');
}

export function MenuBar() {
  const { state, activeAppId } = useShell();
  const { theme, toggleTheme } = useTheme();
  const [now, setNow] = useState<Date | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const activeAppName = useMemo(() => {
    const app = state.dockItems.find((id) => id === activeAppId);
    return app ? APPS[activeAppId].name : 'Finder';
  }, [activeAppId, state.dockItems]);

  const menus = useMemo<string[]>(() => {
    if (activeAppId === 'finder') {
      return [
        'Finder',
        'File',
        'Edit',
        'View',
        'Go',
        'Window',
        'Help',
      ];
    }
    if (activeAppId === 'safari') {
      return [
        'Safari',
        'File',
        'Edit',
        'View',
        'History',
        'Bookmarks',
        'Window',
        'Help',
      ];
    }
    if (activeAppId === 'notes') {
      return ['Notes', 'File', 'Edit', 'View', 'Window', 'Help'];
    }
    if (activeAppId === 'terminal') {
      return ['Terminal', 'Shell', 'Edit', 'View', 'Window', 'Help'];
    }
    if (activeAppId === 'settings') {
      return ['System Settings', 'View', 'Window', 'Help'];
    }
    if (activeAppId === 'calculator') {
      return ['Calculator', 'View', 'Window', 'Help'];
    }
    if (activeAppId === 'calendar') {
      return ['Calendar', 'File', 'Edit', 'View', 'Window', 'Help'];
    }
    if (activeAppId === 'clock') {
      return ['Clock', 'File', 'Edit', 'View', 'Window', 'Help'];
    }
    if (activeAppId === 'photos') {
      return ['Photos', 'File', 'Edit', 'View', 'Window', 'Help'];
    }
    if (activeAppId === 'music') {
      return ['Music', 'File', 'Edit', 'View', 'Controls', 'Window', 'Help'];
    }
    return ['Finder', 'File', 'Edit', 'View', 'Go', 'Window', 'Help'];
  }, [activeAppId]);

  const clockLabel = now ? formatClock(now) : '';

  return (
    <div
      data-testid="menubar"
      className="glass fixed left-0 right-0 top-0 z-[9000] flex items-center justify-between px-4 text-xs text-foreground"
      style={{
        height: 'var(--menubar-height)',
        background: 'var(--menubar-bg)',
        borderBottom: '1px solid var(--menubar-border)',
      }}
    >
      <div className="flex items-center gap-4">
        <button
          data-testid="apple-menu"
          className="opacity-80 transition-opacity hover:opacity-100"
          aria-label="Apple"
        >
          <Command className="h-4 w-4" />
        </button>
        <span
          data-testid="active-app-name"
          className="font-semibold"
        >
          {activeAppName}
        </span>
        <nav className="hidden items-center gap-3 md:flex">
          {menus.map((label) => (
            <button
              key={label}
              data-testid={`menu-${label}`}
              className="opacity-90 transition-opacity hover:opacity-100"
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          data-testid="search-tray"
          className="opacity-80 transition-opacity hover:opacity-100"
          aria-label="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2 opacity-80">
          <Wifi className="h-3.5 w-3.5" aria-label="Wi-Fi" />
          <Bluetooth className="h-3.5 w-3.5" aria-label="Bluetooth" />
          <BatteryMedium className="h-3.5 w-3.5" aria-label="Battery" />
        </div>
        <button
          data-testid="theme-toggle"
          onClick={toggleTheme}
          className="opacity-80 transition-opacity hover:opacity-100"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          data-testid="control-center-toggle"
          onClick={() => setShowControlCenter((v) => !v)}
          className="opacity-80 transition-opacity hover:opacity-100"
          aria-label="Control Center"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
        <span data-testid="clock" className="min-w-[140px] text-right tabular-nums">
          {clockLabel}
        </span>
      </div>
      <ControlCenter open={showControlCenter} />
    </div>
  );
}
