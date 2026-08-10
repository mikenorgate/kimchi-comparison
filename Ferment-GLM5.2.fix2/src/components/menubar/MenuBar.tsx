import { useEffect, useRef, useState } from 'react'
import { useOverlays } from '@/lib/overlays-context'
import { AppleLogo } from '@/components/menubar/AppleLogo'
import {
  BatteryIcon,
  ControlCenterIcon,
  SpotlightIcon,
  WifiIcon,
} from '@/components/menubar/StatusGlyphs'
import { MenuDropdown } from '@/components/menubar/MenuDropdown'
import { buildAppleMenu } from '@/lib/menus'
import { useOs } from '@/lib/os-context'
import { useTheme } from '@/lib/theme-context'
import { getAppManifest } from '@/lib/os-context'
import { menubarClock } from '@/lib/clock'
import type { AppMenu } from '@/lib/menu-types'

/**
 * Tahoe transparent menu bar.
 *
 * Layout (left → right):
 *     [Active App Name]  File  Edit  View  …            [status] [clock]
 *
 * - Clicking a top-level item opens its dropdown; hovering another item while
 *   one is open switches to it (macOS behavior).
 * - Apple menu is global; per-app menus come from the registry.
 * - Click-outside or Escape closes any open menu.
 */
export function MenuBar() {
  const os = useOs()
  const theme = useTheme()
  const overlays = useOverlays()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const barRef = useRef<HTMLDivElement>(null)

  // Live clock — updates every 15s is enough for the minute display.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(t)
  }, [])

  // Resolve menus for the focused app.
  const manifest = getAppManifest(os.activeAppId)
  const appMenus: AppMenu[] = manifest?.menus ?? []
  const appleMenu = buildAppleMenu(os, theme)

  // All top-level menus (Apple first, then app name as a non-dropdown label,
  // then the app's menus).
  const allMenus: { key: string; label: string; menu: AppMenu | null }[] = [
    { key: 'apple', label: '', menu: appleMenu },
    { key: 'appname', label: os.activeAppName, menu: null },
    ...appMenus.map((m) => ({ key: m.label, label: m.label, menu: m })),
  ]

  // Close on click-outside or Escape.
  useEffect(() => {
    if (!openMenu) return
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu])

  return (
    <div
      ref={barRef}
      role="menubar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: '2px',
        zIndex: 9000,
        // Transparent Liquid Glass — Tahoe's signature invisible menu bar.
        backgroundColor: 'var(--menu-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter:
          'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        color: 'var(--text-on-glass)',
        fontSize: '13px',
        userSelect: 'none',
      }}
    >
      {allMenus.map(({ key, label, menu }) => {
        const isOpen = openMenu === key
        const isApple = key === 'apple'
        const isAppName = key === 'appname'
        return (
          <div key={key} style={{ position: 'relative', height: '100%' }}>
            <button
              role="menuitem"
              data-testid={isAppName ? 'active-app-name' : undefined}
              onClick={() => setOpenMenu(isOpen ? null : key)}
              onMouseEnter={() => {
                if (openMenu && key !== openMenu) setOpenMenu(key)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: isApple ? '0 7px' : '0 8px',
                borderRadius: '6px',
                border: 'none',
                background: isOpen ? 'rgba(var(--accent-rgb), 0.9)' : 'transparent',
                color: isOpen ? '#fff' : 'var(--text-on-glass)',
                fontWeight: isAppName ? 600 : 400,
                fontSize: isApple ? '15px' : '13px',
                gap: '4px',
              }}
            >
              {isApple ? <AppleLogo /> : label}
            </button>

            {menu && (
              <MenuDropdown
                menu={menu}
                open={isOpen}
                anchorLeft={0}
                onAction={() => setOpenMenu(null)}
              />
            )}
          </div>
        )
      })}

      {/* Right side: status glyphs + clock */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 6px',
          height: '100%',
        }}
      >
        <StatusButton title="Battery">
          <BatteryIcon />
        </StatusButton>
        <StatusButton title="Wi-Fi">
          <WifiIcon />
        </StatusButton>
        <StatusButton title="Spotlight" onClick={() => overlays.toggle('spotlight')}>
          <SpotlightIcon />
        </StatusButton>
        <StatusButton title="Control Center" onClick={() => overlays.toggle('control-center')}>
          <ControlCenterIcon />
        </StatusButton>
        <button
          title="Notification Center"
          onClick={() => overlays.toggle('notification-center')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <span style={{ fontSize: '12px', letterSpacing: '0.2px' }}>
            {menubarClock(now)}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>
            {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </button>
      </div>
    </div>
  )
}

function StatusButton({
  title,
  children,
  onClick,
}: {
  title: string
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-on-glass)',
        padding: '0 2px',
        height: '100%',
        opacity: 0.9,
      }}
    >
      {children}
    </button>
  )
}
