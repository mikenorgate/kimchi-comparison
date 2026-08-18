import { useState, useEffect, useRef, type ReactNode } from 'react'
import { useWindowStore } from '../store/window-store'
import { getApp } from '../store/app-registry'
import { useThemeStore } from '../store/theme-store'
import { useSystemStore } from '../store/system-store'
import { useUIStore } from '../store/ui-store'
import type { AppMenuItem, AppMenu } from '../store/app-registry'

const APPLE_MENU: AppMenuItem[] = [
  { label: 'About This Mac' },
  { label: '', separator: true },
  { label: 'System Settings…' },
  { label: '', separator: true },
  { label: 'Sleep' },
  { label: 'Restart…' },
  { label: 'Shut Down…' },
]

const DEFAULT_APP_MENUS: AppMenu[] = [
  { label: 'File', items: [{ label: 'New Window', shortcut: '⌘N' }] },
  { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }, { label: 'Redo', shortcut: '⇧⌘Z' }] },
  { label: 'View', items: [{ label: 'Enter Full Screen', shortcut: '⌃⌘F' }] },
  { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }, { label: 'Zoom' }] },
  { label: 'Help', items: [{ label: 'Help' }] },
]

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return now
}

function formatDate(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}

function formatTime(d: Date): string {
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export function MenuBar() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const focusedId = useWindowStore((s) => s.focusedId)
  const windows = useWindowStore((s) => s.windows)
  const { toggle: toggleTheme } = useThemeStore()
  const { wifi, bluetooth } = useSystemStore()
  const { setSpotlightOpen, setControlCenterOpen, setNotificationCenterOpen } = useUIStore()
  const now = useClock()

  // Determine the focused app's name and menus
  const focusedWin = windows.find((w) => w.id === focusedId)
  const focusedApp = focusedWin ? getApp(focusedWin.appId) : undefined
  const appName = focusedApp?.name ?? 'Finder'
  const appMenus = focusedApp?.menus ?? DEFAULT_APP_MENUS

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return
    const onClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuId(null)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [openMenuId])

  const handleMenuClick = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id))
  }

  const handleMenuItemClick = (item: AppMenuItem) => {
    if (item.disabled || item.separator) return
    if (item.action) item.action()
    setOpenMenuId(null)
  }

  const renderMenu = (id: string, label: string, items: AppMenuItem[]): ReactNode => (
    <div
      key={id}
      data-testid={`menu-${id}`}
      style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
    >
      <button
        data-testid={`menubutton-${id}`}
        onClick={() => handleMenuClick(id)}
        style={{
          padding: '2px 10px',
          borderRadius: 5,
          border: 'none',
          background: openMenuId === id ? 'rgba(0,0,0,0.12)' : 'transparent',
          color: 'var(--text-primary)',
          fontSize: 13,
          cursor: 'pointer',
          fontWeight: id === 'apple' ? 600 : 500,
        }}
      >
        {id === 'apple' ? ' ' : label}
      </button>
      {openMenuId === id && (
        <div
          data-testid={`dropdown-${id}`}
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            minWidth: 200,
            borderRadius: 8,
            padding: '4px 0',
            zIndex: 10000,
            marginTop: 2,
          }}
        >
          {items.map((item, i) =>
            item.separator ? (
              <div
                key={i}
                style={{
                  height: 1,
                  margin: '4px 8px',
                  background: 'var(--glass-border)',
                }}
              />
            ) : (
              <button
                key={i}
                data-testid={`menuitem-${id}-${item.label}`}
                onClick={() => handleMenuItemClick(item)}
                disabled={item.disabled}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '4px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  cursor: item.disabled ? 'default' : 'pointer',
                  opacity: item.disabled ? 0.4 : 1,
                  gap: 24,
                }}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    {item.shortcut}
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )

  return (
    <div
      ref={barRef}
      data-testid="menu-bar"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        zIndex: 10001,
        background: 'var(--menubar-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        color: 'var(--text-primary)',
        fontSize: 13,
        userSelect: 'none',
      }}
    >
      {/* Left side: Apple menu + app name + app menus */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: '100%' }}>
        <div
          data-testid="apple-logo"
          style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', color: 'var(--text-primary)' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.92-.03-.01-2.71-1.04-2.74-4.13zM14.2 4.66c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z"/>
          </svg>
        </div>
        {renderMenu('apple', '', APPLE_MENU)}
        <span
          data-testid="active-app-name"
          style={{
            padding: '2px 8px',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--text-primary)',
          }}
        >
          {appName}
        </span>
        {appMenus.map((menu) =>
          renderMenu(menu.label.toLowerCase(), menu.label, menu.items)
        )}
      </div>

      {/* Right side: system tray */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%' }}>
        {/* Battery */}
        <div data-testid="tray-battery" style={{ display: 'flex', alignItems: 'center', width: 24, height: 16 }}>
          <svg viewBox="0 0 24 24" width="24" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="7" width="18" height="10" rx="2" />
            <rect x="4" y="9" width="12" height="6" rx="0.5" fill="currentColor" />
            <line x1="22" y1="10" x2="22" y2="14" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>

        {/* Wifi */}
        <div
          data-testid="tray-wifi"
          style={{ display: 'flex', alignItems: 'center', width: 18, height: 18, color: 'var(--text-primary)' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={wifi ? 1 : 0.3}>
            <path d="M5 12.55a11 11 0 0 1 14 0" />
            <path d="M8.5 16.1a6 6 0 0 1 7 0" />
            <line x1="12" y1="20" x2="12" y2="20" />
          </svg>
        </div>

        {/* Bluetooth */}
        <div
          data-testid="tray-bluetooth"
          style={{ display: 'flex', alignItems: 'center', width: 16, height: 18, color: 'var(--text-primary)' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={bluetooth ? 1 : 0.3}>
            <path d="M6 6l12 12-6 6V0l6 6L6 18" />
          </svg>
        </div>

        {/* Spotlight search */}
        <button
          data-testid="tray-spotlight"
          onClick={() => setSpotlightOpen(true)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            width: 16,
            height: 16,
            color: 'var(--text-primary)',
            padding: 0,
          }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16" y1="16" x2="21" y2="21" />
          </svg>
        </button>

        {/* Control Center */}
        <button
          data-testid="tray-control-center"
          onClick={() => setControlCenterOpen(true)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            width: 18,
            height: 16,
            color: 'var(--text-primary)',
            padding: 0,
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="8" height="8" rx="2" />
            <rect x="13" y="3" width="8" height="8" rx="2" />
            <rect x="3" y="13" width="8" height="8" rx="2" />
            <rect x="13" y="13" width="8" height="8" rx="2" />
          </svg>
        </button>

        {/* Notification Center / clock */}
        <button
          data-testid="tray-clock"
          onClick={() => setNotificationCenterOpen(true)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: 1.2,
            padding: 0,
            textAlign: 'right',
          }}
        >
          <span data-testid="menu-date">{formatDate(now)}</span>
          <span data-testid="menu-time">{formatTime(now)}</span>
        </button>

        {/* Hidden toggle for testing theme */}
        <button
          data-testid="tray-theme-toggle"
          onClick={() => toggleTheme()}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}
