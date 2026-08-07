import { useEffect, useRef, useState } from 'react'
import { Apple } from 'lucide-react'
import { appleMenu, getAppMenus, type Menu, type MenuItem } from '../../lib/menus'
import { useWindowStore } from '../../store/window-manager'
import { getApp } from '../../lib/registry'

/**
 * MenuBarMenus — the Tahoe menu bar's menu content.
 *
 * Renders the Apple () menu followed by the focused app's menus. The bold
 * app-name menu (e.g. "Finder", "Calculator") reflects whichever window is
 * focused; with no focused window it falls back to Finder. Clicking a title
 * toggles its dropdown; hovering another title while one is open switches
 * menus (macOS behavior); clicking an item resolves its `actionId` and
 * closes; a click anywhere outside the menu bar closes the open menu.
 *
 * The menu bar itself (the transparent strip) is <MenuBar/>; this component
 * is its content.
 */

interface MenuBarMenusProps {
  testId?: string
}

export function MenuBarMenus({ testId }: MenuBarMenusProps) {
  const windows = useWindowStore((s) => s.windows)
  const open = useWindowStore((s) => s.open)
  const close = useWindowStore((s) => s.close)
  const minimize = useWindowStore((s) => s.minimize)
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize)

  const focusedWin = windows.find((w) => w.isFocused && !w.isMinimized)
  const focusedAppId = focusedWin?.appId
  const config = getAppMenus(focusedAppId)

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  // Tracks the menu currently opened by an explicit click (vs hover). Used to
  // resolve the hover-then-click race: hovering onto a menu switches it open,
  // and clicking that same menu should keep it open — not toggle it closed.
  const clickedMenuRef = useRef<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  // Close on outside click / Escape.
  const closeMenus = () => {
    clickedMenuRef.current = null
    setOpenMenuId(null)
  }
  useEffect(() => {
    if (!openMenuId) return
    const onDown = (e: globalThis.MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        closeMenus()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenus()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenuId])

  const focusedId = focusedWin?.id
  const actions: Record<string, () => void> = {
    'close-window': () => focusedId && close(focusedId),
    minimize: () => focusedId && minimize(focusedId),
    zoom: () => focusedId && toggleMaximize(focusedId),
    'new-window': () => {
      const appId = focusedAppId ?? 'finder'
      const app = getApp(appId)
      const size = app?.defaultSize ?? { w: 560, h: 400 }
      open({
        appId,
        title: app?.title ?? 'Window',
        bounds: { x: 140, y: 80, w: size.w, h: size.h },
      })
    },
    'quit-app': () => {
      const appId = focusedAppId
      if (!appId) return
      windows.filter((w) => w.appId === appId).forEach((w) => close(w.id))
    },
    'hide-app': () => {
      const appId = focusedAppId
      if (!appId) return
      windows
        .filter((w) => w.appId === appId && !w.isMinimized)
        .forEach((w) => minimize(w.id))
    },
    // Remaining items are no-ops until their apps ship (steps 5-6).
  }

  const runItem = (item: MenuItem) => {
    if (item.isSeparator || item.disabled) return
    if (item.actionId && actions[item.actionId]) actions[item.actionId]!()
    closeMenus()
  }

  const toggleMenu = (id: string) => {
    // If this menu was opened by a prior explicit click on itself, close it.
    if (clickedMenuRef.current === id && openMenuId === id) {
      closeMenus()
      return
    }
    // Otherwise open (or switch to) it and mark it click-opened.
    clickedMenuRef.current = id
    setOpenMenuId(id)
  }
  const hoverSwitch = (id: string) => {
    // Only switch when a menu is already open; clear the click marker so a
    // subsequent click on the hover-opened menu keeps it open.
    if (openMenuId !== null && openMenuId !== id) {
      clickedMenuRef.current = null
      setOpenMenuId(id)
    }
  }

  const allMenus: Menu[] = [appleMenu, ...config.menus]

  return (
    <div
      ref={barRef}
      className="flex h-full items-center gap-0.5"
      data-testid={testId}
    >
      {allMenus.map((menu) => {
        const isOpen = openMenuId === menu.id
        const isApple = menu.id === 'apple'
        const isAppName = menu.id === 'app-name'
        return (
          <div key={menu.id} className="relative">
            <button
              type="button"
              className={`flex h-7 items-center rounded px-2 text-[13px] leading-none ${
                isOpen ? 'bg-white/20' : 'hover:bg-white/10'
              } ${isAppName ? 'font-semibold' : ''}`}
              data-testid={`menu-${menu.id}`}
              onClick={() => toggleMenu(menu.id)}
              onMouseEnter={() => hoverSwitch(menu.id)}
            >
              {isApple ? <Apple size={15} fill="currentColor" /> : menu.title}
            </button>
            {isOpen && (
              <div
                className="absolute left-0 top-full z-[1000001] min-w-[220px] py-1"
                style={{
                  background: 'rgba(245,245,247,0.85)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                  border: '0.5px solid var(--color-glass-light-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-menu)',
                }}
                data-testid="menu-dropdown"
                role="menu"
              >
                {menu.items.map((item) =>
                  item.isSeparator ? (
                    <div
                      key={item.id}
                      className="my-1 h-px bg-black/10"
                      role="separator"
                    />
                  ) : (
                    <button
                      type="button"
                      key={item.id}
                      className={`flex w-full items-center justify-between gap-6 px-3 py-1 text-left text-[13px] ${
                        item.disabled ? 'text-black/30' : 'text-black/85 hover:bg-[var(--color-accent-blue)] hover:text-white'
                      }`}
                      data-testid={`menu-item-${item.id}`}
                      onClick={() => runItem(item)}
                      role="menuitem"
                      disabled={item.disabled}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-black/40 group-hover:text-white/70">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default MenuBarMenus
