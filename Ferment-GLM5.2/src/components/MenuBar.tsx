import { useState, useEffect, useRef } from 'react'
import { useWindowManager } from '../WindowManager'
import { APP_REGISTRY } from '../apps/registry'

/**
 * MenuBar component — the transparent top menu bar of macOS Tahoe.
 * Left: Apple menu (with dropdown) + active-app menus.
 * Right: battery, Wi-Fi, Control Center, live clock.
 */
export default function MenuBar() {
  const { windows } = useWindowManager()
  const [time, setTime] = useState(new Date())
  const [appleMenuOpen, setAppleMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Determine the active (topmost, non-minimized) window's app name
  const visibleWindows = windows.filter(w => !w.minimized)
  const activeWindow = visibleWindows.length > 0
    ? visibleWindows.reduce((top, w) => w.z > top.z ? w : top)
    : null
  const activeAppName = activeWindow
    ? APP_REGISTRY.find(a => a.id === activeWindow.appId)?.name ?? activeWindow.appId
    : 'Finder'

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!appleMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAppleMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [appleMenuOpen])

  const formatTime = (d: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const day = days[d.getDay()]
    const month = months[d.getMonth()]
    const date = d.getDate()
    let h = d.getHours()
    const m = d.getMinutes().toString().padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12 || 12
    return `${day} ${month} ${date} ${h}:${m} ${ampm}`
  }

  const appleMenuItems = [
    'About This Mac',
    'System Settings…',
    'App Store…',
    '---',
    'Sleep',
    'Restart…',
    'Shut Down…',
    '---',
    'Lock Screen',
    'Log Out…',
  ]

  return (
    <div
      data-testid="menu-bar"
      className="glass fixed top-0 left-0 right-0 z-50 flex items-center px-3"
      style={{ height: '28px', borderRadius: '0' }}
    >
      {/* Left side: Apple menu + active-app menus */}
      <div className="flex items-center gap-4 text-white text-sm font-medium" ref={menuRef}>
        <span
          data-testid="apple-menu-button"
          className="cursor-default select-none relative"
          onClick={() => setAppleMenuOpen((v) => !v)}
        >
          <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
            <path d="M11.6 8.3c0-2 1.6-3 1.7-3-0.9-1.3-2.3-1.5-2.8-1.5-1.2-0.1-2.3 0.7-2.9 0.7-0.6 0-1.5-0.7-2.5-0.7C3.1 3.8 1.8 4.6 1.1 5.9 0.3 7.5 0.9 9.9 1.9 12c0.5 1.1 1.1 2.3 1.9 2.3 0.8 0 1-0.5 2-0.5 1 0 1.2 0.5 2 0.5 0.8 0 1.4-1.1 1.9-2.2 0.6-1.2 0.8-2.3 0.8-2.4 0-0.1-2.6-1-2.6-3.4z M9.5 2.2c0.5-0.6 0.9-1.5 0.8-2.4-0.8 0-1.7 0.5-2.3 1.2-0.5 0.5-0.9 1.4-0.8 2.3 0.9 0.1 1.8-0.5 2.3-1.1z" />
          </svg>
          {appleMenuOpen && (
            <div
              data-testid="apple-menu-dropdown"
              className="glass absolute top-7 left-0 min-w-[200px] py-1 rounded-lg text-white text-sm"
              style={{ borderRadius: '8px' }}
            >
              {appleMenuItems.map((item, i) =>
                item === '---' ? (
                  <div key={i} className="my-1 border-t border-white/15" />
                ) : (
                  <div
                    key={i}
                    className="px-3 py-1 hover:bg-blue-500/60 cursor-default select-none"
                    data-testid={`apple-menu-item-${item.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')}`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          )}
        </span>
        <span data-testid="active-app-menu" className="cursor-default select-none font-semibold">{activeAppName}</span>
        <span className="cursor-default select-none">File</span>
        <span className="cursor-default select-none">Edit</span>
        <span className="cursor-default select-none">View</span>
        <span className="cursor-default select-none">Go</span>
        <span className="cursor-default select-none">Window</span>
        <span className="cursor-default select-none">Help</span>
      </div>

      {/* Right side: status items */}
      <div className="ml-auto flex items-center gap-3 text-white text-sm">
        <span className="cursor-default select-none" data-testid="battery-icon">
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="1" y="1" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1" />
            <rect x="3" y="3" width="14" height="6" rx="1" fill="currentColor" />
            <rect x="22" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" />
          </svg>
        </span>
        <span className="cursor-default select-none" data-testid="wifi-icon">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <path d="M8 10.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM3.5 6.5C4.7 5.3 6.3 4.7 8 4.7s3.3 0.6 4.5 1.8l1-1C12.1 4.1 10.1 3.3 8 3.3s-4.1 0.8-5.5 2.2l1 1zM0.5 3.5C2.6 1.4 5.2 0.3 8 0.3s5.4 1.1 7.5 3.2l1-1C14.2 0.2 11.2-1 8-1S1.8 0.2-0.5 2.5l1 1z" />
          </svg>
        </span>
        <span
          className="cursor-default select-none"
          data-testid="mission-control-button"
          title="Mission Control"
          onClick={() => document.dispatchEvent(new CustomEvent('toggle-mission-control'))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        </span>
        <span
          className="cursor-default select-none"
          data-testid="control-center-button"
          title="Control Center"
          onClick={() => document.dispatchEvent(new CustomEvent('toggle-control-center'))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 5h10v2H3V5zm0 4h10v2H3V9z" />
            <circle cx="5" cy="6" r="1.5" fill="black" />
            <circle cx="11" cy="10" r="1.5" fill="black" />
          </svg>
        </span>
        <span
          data-testid="menu-bar-clock"
          className="cursor-default select-none tabular-nums"
        >
          {formatTime(time)}
        </span>
      </div>
    </div>
  )
}
