import { getDockApps } from '../data/apps'
import { useDesktopStore } from '../store/desktopStore'
import { DockItem } from './DockItem'

export function Dock() {
  const windows = useDesktopStore((state) => state.windows)
  const activeWindowId = useDesktopStore((state) => state.activeWindowId)
  const openApp = useDesktopStore((state) => state.openApp)

  const dockApps = getDockApps()

  const runningAppIds = new Set(windows.map((w) => w.appId))
  const activeWindow = windows.find((w) => w.id === activeWindowId)
  const activeAppId = activeWindow?.appId ?? null

  return (
    <div
      data-testid="dock"
      style={{
        position: 'fixed',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-dock)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-sm) var(--space-md)',
        background: 'var(--color-dock-bg)',
        backdropFilter: 'blur(var(--blur-lg))',
        WebkitBackdropFilter: 'blur(var(--blur-lg))',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-dock)',
        border: '1px solid var(--color-border)',
      }}
    >
      {dockApps.map((app) => (
        <DockItem
          key={app.id}
          app={app}
          isRunning={runningAppIds.has(app.id)}
          isActive={activeAppId === app.id}
          onClick={() => openApp(app.id)}
        />
      ))}
    </div>
  )
}

export default Dock
