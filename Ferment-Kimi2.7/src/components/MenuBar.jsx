import { useDesktopStore } from '../store/desktopStore'
import { Icon } from './common/Icon'

const DEFAULT_MENUS = [
  { label: 'File', items: ['New Window', 'New Folder', 'Open', 'Close'] },
  { label: 'Edit', items: ['Undo', 'Cut', 'Copy', 'Paste', 'Select All'] },
  { label: 'View', items: ['As Icons', 'As List', 'As Columns', 'Show Preview'] },
  { label: 'Window', items: ['Minimize', 'Zoom', 'Bring All to Front'] },
]

export function MenuBar({ onOpenControlCenter, onOpenSpotlight }) {
  const activeApp = useDesktopStore((state) => state.getActiveApp())
  const appName = activeApp?.name ?? 'Finder'

  const now = new Date()
  const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const dateString = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div
      data-testid="menu-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--menu-bar-height)',
        zIndex: 'var(--z-menu-bar)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-md)',
        background: 'var(--color-menu-bar-bg)',
        backdropFilter: 'blur(var(--blur-md))',
        WebkitBackdropFilter: 'blur(var(--blur-md))',
        color: 'var(--color-text-light)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-weight-medium)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button
          data-testid="menu-apple"
          type="button"
          aria-label="Apple"
          style={{ color: 'inherit', padding: '0 var(--space-sm)' }}
        >
          <svg width="14" height="16" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8-60.5 0-108.2-58.2-154.8-126.2C21.1 809.8 0 684.8 0 566.2 0 350.5 137.4 236 272.1 236c70.1 0 128.5 45.8 172.6 45.8 42.2 0 108.5-48.6 190.4-48.6 30.8 0 141.5 2.9 152.9 84.7zM540.9 127.2c30.7-37.1 52.8-88.4 52.8-139.7 0-7.1-.6-14.3-1.9-20.2-50.4 1.9-110.7 33.7-146.8 75.8-28.3 32.5-55.3 83.5-55.3 135 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.5 1.3 45.3 0 101.9-30.4 135.8-70.3z" />
          </svg>
        </button>

        <span
          data-testid="menu-app-name"
          style={{ fontWeight: 'var(--font-weight-bold)', padding: '0 var(--space-sm)' }}
        >
          {appName}
        </span>

        {DEFAULT_MENUS.map((menu) => (
          <button
            key={menu.label}
            data-testid={`menu-${menu.label.toLowerCase()}`}
            type="button"
            style={{ color: 'inherit', padding: '0 var(--space-sm)' }}
          >
            {menu.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button
          type="button"
          data-testid="menu-wifi"
          aria-label="Wi-Fi"
          style={{ color: 'inherit' }}
        >
          <Icon name="wifi" size={16} color="currentColor" />
        </button>
        <button
          type="button"
          data-testid="menu-battery"
          aria-label="Battery"
          style={{ color: 'inherit' }}
        >
          <Icon name="battery" size={16} color="currentColor" />
        </button>
        <button
          type="button"
          data-testid="menu-control-center"
          aria-label="Control Center"
          onClick={onOpenControlCenter}
          style={{ color: 'inherit' }}
        >
          <Icon name="gear" size={16} color="currentColor" />
        </button>
        <button
          type="button"
          data-testid="menu-spotlight"
          aria-label="Spotlight"
          onClick={onOpenSpotlight}
          style={{ color: 'inherit' }}
        >
          <Icon name="search" size={16} color="currentColor" />
        </button>
        <span data-testid="menu-datetime" style={{ padding: '0 var(--space-sm)' }}>
          {dateString} {timeString}
        </span>
      </div>
    </div>
  )
}

export default MenuBar
