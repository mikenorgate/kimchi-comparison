import { useEffect, useMemo, useState } from 'react'
import { Battery, Command, Wifi } from 'lucide-react'
import { Menu } from '../primitives'
import { useDesktop } from '../../desktop/store'
import { getApp } from '../../apps/registry'

const appleMenuItems = [
  { id: 'about', label: 'About This Mac', onClick: () => {} },
  { id: 'sep1', label: '', separator: true },
  { id: 'preferences', label: 'System Preferences...', shortcut: '⌘,' },
  { id: 'sep2', label: '', separator: true },
  { id: 'sleep', label: 'Sleep' },
  { id: 'restart', label: 'Restart...' },
  { id: 'sep3', label: '', separator: true },
  { id: 'logout', label: 'Log Out User...', shortcut: '⇧⌘Q' },
]

const defaultAppMenuItems = [
  { id: 'about', label: 'About', onClick: () => {} },
  { id: 'sep1', label: '', separator: true },
  { id: 'preferences', label: 'Preferences...', shortcut: '⌘,' },
  { id: 'sep2', label: '', separator: true },
  { id: 'quit', label: 'Quit', shortcut: '⌘Q' },
]

export function MenuBar() {
  const { windows, activeWindowId } = useDesktop()
  const activeApp = useMemo(() => {
    if (!activeWindowId) return undefined
    return getApp(windows.find((w) => w.id === activeWindowId)?.appId ?? '')
  }, [activeWindowId, windows])

  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const appMenuItems = activeApp?.menuItems ?? defaultAppMenuItems

  return (
    <nav
      className="absolute top-0 left-0 right-0 h-7 z-[1000] flex items-center justify-between px-2 text-sm text-tahoe-text backdrop-blur-tahoe bg-tahoe-menubar border-b border-tahoe-glass-border select-none"
      data-testid="menu-bar"
    >
      <div className="flex items-center gap-1">
        <Menu
          label={<Command size={14} strokeWidth={2} className="text-tahoe-text" />}
          items={appleMenuItems}
          data-testid="apple-menu"
        />
        {activeApp && (
          <Menu
            label={<span className="font-semibold">{activeApp.name}</span>}
            items={appMenuItems}
          />
        )}
      </div>
      <div className="flex items-center gap-3 px-2">
        <Wifi size={14} />
        <Battery size={14} />
        <span className="tabular-nums" data-testid="menu-bar-time">{time}</span>
      </div>
    </nav>
  )
}
