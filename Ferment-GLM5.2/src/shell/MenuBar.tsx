/**
 * MenuBar — the transparent glass menu bar for the macOS Tahoe desktop.
 *
 * Features:
 * - Transparent glass surface with backdrop-filter (Liquid Glass)
 * - Apple menu (original SVG logo) with dropdown
 * - Active app name (bold) + standard app menus (File, Edit, View, Window, Help)
 * - Functional dropdown menus using the Menu/MenuItem design-system primitives
 * - Hover-to-switch behavior (macOS: hovering another menu while one is open switches)
 * - Click-outside and Escape to close
 * - Right-side floating icons: Battery, Wi-Fi, Spotlight, Control Center, Date/Time, Notification Center
 * - About This Mac overlay (functional)
 * - View > Use Dark/Tinted Appearance (functional — changes appearance mode via settings store)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, MenuItem } from '@/design-system';
import { useSettingsStore } from '@/store/settings';
import { appleMenuItems, appMenus, type MenuItemDef } from './menus';

// ── Icons (original SVG approximations) ──────────────────────────

function AppleLogo() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="10" r="4.5" />
      <path d="M8 5.5 C8 4, 9 3, 10.5 3 C10.5 4.5, 9.5 5.5, 8 5.5 Z" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 28 12" className="w-7 h-3" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <rect x="1" y="1" width="22" height="10" rx="2.5" />
      <rect x="3" y="3" width="16" height="6" rx="1" fill="currentColor" stroke="none" />
      <rect x="24.5" y="4" width="2" height="4" rx="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 16 12" className="w-4 h-3" fill="currentColor" aria-hidden="true">
      <path d="M8 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      <path d="M8 7c-1.4 0-2.7.5-3.7 1.4l1.1 1.1A3.7 3.7 0 018 8.8c1 0 1.9.4 2.6 1.1l1.1-1.1A5.2 5.2 0 008 7z" opacity="0.8" />
      <path d="M8 3.2c-2.5 0-4.8 1-6.5 2.6l1.1 1.1A7.7 7.7 0 018 4.8c2 0 3.9.8 5.4 2.1l1.1-1.1A9.2 9.2 0 008 3.2z" opacity="0.6" />
    </svg>
  );
}

function SpotlightIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="7" cy="7" r="5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" strokeLinecap="round" />
    </svg>
  );
}

function ControlCenterIcon() {
  return (
    <svg viewBox="0 0 20 12" className="w-5 h-3" fill="currentColor" aria-hidden="true">
      <rect x="0" y="0" width="20" height="5" rx="2.5" opacity="0.4" />
      <circle cx="15" cy="2.5" r="2" />
      <rect x="0" y="7" width="20" height="5" rx="2.5" opacity="0.4" />
      <circle cx="5" cy="9.5" r="2" />
    </svg>
  );
}

function NotificationCenterIcon() {
  return (
    <svg viewBox="0 0 16 12" className="w-4 h-3" fill="currentColor" aria-hidden="true">
      <rect x="0" y="1" width="16" height="1.5" rx="0.75" />
      <rect x="0" y="5.25" width="12" height="1.5" rx="0.75" />
      <rect x="0" y="9.5" width="14" height="1.5" rx="0.75" />
    </svg>
  );
}

// ── About This Mac overlay ──────────────────────────────────────

function AboutOverlay({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 2000, background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
      data-testid="about-overlay"
    >
      <div
        className="glass-surface-heavy bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-window flex flex-col items-center gap-3"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: '320px' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center text-white">
          <svg viewBox="0 0 16 16" className="w-10 h-10" fill="currentColor">
            <circle cx="8" cy="10" r="4.5" />
            <path d="M8 5.5 C8 4, 9 3, 10.5 3 C10.5 4.5, 9.5 5.5, 8 5.5 Z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">macOS Tahoe</h2>
        <p className="text-sm opacity-60">Version 26.0</p>
        <p className="text-xs opacity-40">Web Recreation · Liquid Glass</p>
        <button
          className="mt-3 px-6 py-1 bg-[#0a84ff] text-white rounded-md text-sm font-medium hover:bg-[#0a6fff] transition-colors"
          onClick={onClose}
          data-testid="about-close"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── MenuBar ──────────────────────────────────────────────────────

export interface MenuBarProps {
  /** Active app name shown in bold (default: "Finder") */
  activeApp?: string;
}

export function MenuBar({ activeApp = 'Finder' }: MenuBarProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  // Synchronous mirror of openMenuId so hoverSwitch can read it without waiting for React state flush
  const openMenuIdRef = useRef<string | null>(null);
  // Tracks when a menu was opened via hover-switch so the subsequent click doesn't toggle it closed
  const hoverSwitchedRef = useRef<string | null>(null);

  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);

  // Keep ref in sync with state
  const updateOpenMenu = useCallback((id: string | null) => {
    openMenuIdRef.current = id;
 setOpenMenuId(id);
  }, []);

  // Click outside closes open menu
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        updateOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenuId, updateOpenMenu]);

  // Escape closes open menu
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') updateOpenMenu(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openMenuId, updateOpenMenu]);

  const toggleMenu = useCallback((id: string) => {
    // If this click immediately followed a hover-switch to the same menu,
    // the menu is already open — don't toggle it closed
    if (hoverSwitchedRef.current === id) {
      hoverSwitchedRef.current = null;
      return;
    }
    hoverSwitchedRef.current = null;
    updateOpenMenu(openMenuIdRef.current === id ? null : id);
  }, [updateOpenMenu]);

  const hoverSwitch = useCallback((id: string) => {
    const current = openMenuIdRef.current;
    if (current !== null && current !== id) {
      hoverSwitchedRef.current = id;
      updateOpenMenu(id);
    }
  }, [updateOpenMenu]);

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case 'about':
        setShowAbout(true);
        break;
      case 'toggle-dark':
        setAppearance(appearance === 'dark' ? 'light' : 'dark');
        break;
      case 'toggle-tinted':
        setAppearance(appearance === 'tinted' ? 'light' : 'tinted');
        break;
      // All other actions are no-ops (window manager not yet built)
    }
    setOpenMenuId(null);
  }, [appearance, setAppearance]);

  // Clock
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const renderDropdown = (items: MenuItemDef[], menuId: string) => (
    <Menu
      className="absolute top-full left-0 mt-0.5 z-[1100]"
      data-testid={`menu-dropdown-${menuId}`}
    >
      {items.map((item, i) => (
        <MenuItem
          key={i}
          label={item.label}
          shortcut={item.shortcut}
          disabled={item.disabled}
          separator={item.separator}
          onClick={item.action && !item.disabled ? () => handleAction(item.action!) : undefined}
          data-testid={`menu-item-${menuId}-${i}`}
        />
      ))}
    </Menu>
  );

  const titleButtonClass = (isOpen: boolean) =>
    `px-2 py-0.5 rounded-md transition-colors text-[13px] leading-none ${
      isOpen
        ? 'bg-white/25 dark:bg-white/15'
        : 'hover:bg-white/15 dark:hover:bg-white/10'
    }`;

  const iconButtonClass =
    'flex items-center hover:bg-white/15 dark:hover:bg-white/10 rounded-md px-1.5 py-0.5 transition-colors';

  return (
    <>
      <div
        id="menubar"
        ref={barRef}
        className="glass-surface-bar fixed top-0 left-0 right-0 flex items-center justify-between px-2 text-[13px] text-black/85 dark:text-white/90"
        style={{
          height: 'var(--height-menubar)',
          zIndex: 1000,
          backgroundImage: 'var(--gradient-menubar-bg)',
        }}
        data-testid="menubar"
      >
        {/* Left: Apple logo + app name + menu titles */}
        <div className="flex items-center gap-0.5">
          {/* Apple menu */}
          <div className="relative">
            <button
              data-testid="menu-title-apple"
              onClick={() => toggleMenu('apple')}
              onMouseEnter={() => hoverSwitch('apple')}
              className={`flex items-center px-2 py-0.5 rounded-md transition-colors ${
                openMenuId === 'apple'
                  ? 'bg-white/25 dark:bg-white/15'
                  : 'hover:bg-white/15 dark:hover:bg-white/10'
              }`}
              aria-label="Apple menu"
            >
              <AppleLogo />
            </button>
            {openMenuId === 'apple' && renderDropdown(appleMenuItems, 'apple')}
          </div>

          {/* Active app name */}
          <span className="font-semibold px-1.5 text-[13px] leading-none">{activeApp}</span>

          {/* App menus */}
          {appMenus.map((menu) => (
            <div key={menu.id} className="relative">
              <button
                data-testid={`menu-title-${menu.id}`}
                onClick={() => toggleMenu(menu.id)}
                onMouseEnter={() => hoverSwitch(menu.id)}
                className={titleButtonClass(openMenuId === menu.id)}
              >
                {menu.label}
              </button>
              {openMenuId === menu.id && renderDropdown(menu.items, menu.id)}
            </div>
          ))}
        </div>

        {/* Right: floating icons */}
        <div className="flex items-center gap-2.5" data-testid="menubar-icons">
          <div className="flex items-center" data-testid="menubar-battery">
            <BatteryIcon />
          </div>
          <button className={iconButtonClass} data-testid="menubar-wifi" aria-label="Wi-Fi">
            <WifiIcon />
          </button>
          <button className={iconButtonClass} data-testid="menubar-spotlight" aria-label="Spotlight">
            <SpotlightIcon />
          </button>
          <button className={iconButtonClass} data-testid="menubar-control-center" aria-label="Control Center">
            <ControlCenterIcon />
          </button>
          <span className="tabular-nums" data-testid="menubar-datetime">
            {dateStr}&nbsp;{timeStr}
          </span>
          <button className={iconButtonClass} data-testid="menubar-notification-center" aria-label="Notification Center">
            <NotificationCenterIcon />
          </button>
        </div>
      </div>

      {/* About This Mac overlay */}
      {showAbout && <AboutOverlay onClose={() => setShowAbout(false)} />}
    </>
  );
}
