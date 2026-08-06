import './apps/registry'
import { useMemo } from 'react'
import { MenuBar, Dock } from './components/glass'
import { Window } from './components/window/Window'
import { useWindowStore } from './store/window-manager'
import { listApps } from './lib/registry'

/**
 * Tahoe desktop root.
 *
 * Composes the wallpaper, the transparent menu bar, the Liquid Glass Dock
 * (whose icons launch registered apps), and the window layer. Step 4 adds
 * menus/Spotlight/Control Center on top of this shell.
 */
function App() {
  const windows = useWindowStore((s) => s.windows)
  const open = useWindowStore((s) => s.open)
  const apps = useMemo(() => listApps(), [])

  const launch = (appId: string) => {
    const app = apps.find((a) => a.appId === appId)
    if (!app) return
    const size = app.defaultSize ?? { w: 560, h: 400 }
    const offset = windows.length * 28
    open({
      appId,
      title: app.title,
      bounds: { x: 120 + offset, y: 70 + offset, w: size.w, h: size.h },
    })
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #4a90d9 0%, #7bb8e8 35%, #d48fb9 70%, #f5a86b 100%)',
      }}
      data-testid="desktop"
    >
      <MenuBar testId="menu-bar">
        <span className="font-semibold"></span>
        <span className="ml-1 opacity-90">Finder</span>
      </MenuBar>

      {/* Window layer */}
      {windows.map((w) => (
        <Window key={w.id} win={w} />
      ))}

      {/* Dock — Liquid Glass capsule with registered app launchers */}
      <div
        className="absolute bottom-2 left-1/2 z-[100000] -translate-x-1/2"
        data-testid="dock-wrapper"
      >
        <Dock testId="dock">
          {apps.map((app) => (
            <button
              key={app.appId}
              type="button"
              className="grid h-12 w-12 place-items-center rounded-xl text-black/80 transition hover:scale-110 hover:bg-black/5"
              data-testid={`dock-icon-${app.appId}`}
              aria-label={`Launch ${app.title}`}
              onClick={() => launch(app.appId)}
            >
              {app.icon}
            </button>
          ))}
        </Dock>
      </div>
    </div>
  )
}

export default App
