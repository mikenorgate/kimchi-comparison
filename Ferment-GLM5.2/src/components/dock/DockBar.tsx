import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dock } from '../glass'
import { listApps } from '../../lib/registry'
import { useWindowStore } from '../../store/window-manager'
import { useResolvedAppearance } from '../../store/theme'

/**
 * DockBar — the Tahoe Dock with app launchers, running indicators, and
 * fisheye hover magnification.
 *
 * Magnification scales each icon by its distance from the hovered icon
 * (nearest grows most), approximating macOS's Dock magnification. A small
 * dot beneath each icon marks apps with at least one open (non-closed)
 * window.
 */
export function DockBar() {
  const apps = listApps()
  const windows = useWindowStore((s) => s.windows)
  const open = useWindowStore((s) => s.open)
  const focus = useWindowStore((s) => s.focus)
  const [hovered, setHovered] = useState<number | null>(null)

  const resolved = useResolvedAppearance()
  const openAppIds = new Set(windows.map((w) => w.appId))

  const launch = (appId: string, idx: number) => {
    const app = apps[idx]
    // If the app already has a window, focus its topmost one instead of
    // opening a duplicate (macOS single-instance-by-default for these apps).
    const appWins = windows
      .filter((w) => w.appId === appId)
      .sort((a, b) => b.zIndex - a.zIndex)
    if (appWins.length > 0) {
      focus(appWins[0].id)
      return
    }
    const size = app.defaultSize ?? { w: 560, h: 400 }
    const offset = windows.length * 28
    open({
      appId,
      title: app.title,
      bounds: { x: 140 + offset, y: 80 + offset, w: size.w, h: size.h },
    })
  }

  return (
    <div
      className="absolute bottom-2 left-1/2 z-[1000000] -translate-x-1/2"
      data-testid="dock-wrapper"
    >
      <Dock testId="dock" variant={resolved}>
        {apps.map((app, i) => {
          const dist = hovered === null ? 0 : Math.abs(i - hovered)
          const proximity = hovered === null ? 0 : Math.max(0, 1 - dist * 0.4)
          const scale = 1 + proximity * 0.5
          const lift = proximity * 14
          const running = openAppIds.has(app.appId)
          return (
            <motion.button
              key={app.appId}
              type="button"
              className="dock-icon relative grid place-items-center"
              animate={{ scale, y: -lift }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
              onClick={() => launch(app.appId, i)}
              data-testid={`dock-icon-${app.appId}`}
              aria-label={`Launch ${app.title}`}
              style={{ width: 52, height: 52, color: 'rgba(0,0,0,0.8)' }}
            >
              {app.icon}
              {running && (
                <span
                  className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black/60"
                  data-testid={`dock-indicator-${app.appId}`}
                />
              )}
            </motion.button>
          )
        })}
      </Dock>
    </div>
  )
}

export default DockBar
