import { useMemo } from 'react'
import { Search } from 'lucide-react'
import { AppIcon } from '../primitives'
import { useDesktop } from '../../desktop/store'
import { useSpotlight } from '../spotlight/Spotlight'
import { getDockApps } from '../../apps/registry'

export function Dock() {
  const { windows, activeWindowId, openWindow, focusWindow } = useDesktop()
  const { open: openSpotlight } = useSpotlight()
  const apps = useMemo(() => getDockApps(), [])

  const activeAppId = useMemo(() => {
    if (!activeWindowId) return null
    return windows.find((w) => w.id === activeWindowId)?.appId ?? null
  }, [activeWindowId, windows])

  const runningAppIds = useMemo(() => new Set(windows.map((w) => w.appId)), [windows])

  return (
    <div
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] px-3 py-2 rounded-tahoe bg-tahoe-dock backdrop-blur-tahoe shadow-dock border border-tahoe-glass-border flex items-end gap-2"
      data-testid="dock"
    >
      {apps.map((app) => (
        <AppIcon
          key={app.id}
          icon={app.icon}
          label={app.name}
          color="bg-gradient-to-br from-tahoe-accent to-tahoe-teal"
          running={runningAppIds.has(app.id)}
          active={activeAppId === app.id}
          onClick={() => {
            if (runningAppIds.has(app.id)) {
              const win = windows.find((w) => w.appId === app.id && !w.minimized)
              if (win) {
                focusWindow(win.id)
              } else {
                openWindow(app.id)
              }
            } else {
              openWindow(app.id)
            }
          }}
        />
      ))}
      <AppIcon
        icon={Search}
        label="Spotlight"
        color="bg-gradient-to-br from-tahoe-text-secondary to-tahoe-text-tertiary"
        running={false}
        active={false}
        onClick={openSpotlight}
        data-testid="dock-spotlight"
      />
    </div>
  )
}
