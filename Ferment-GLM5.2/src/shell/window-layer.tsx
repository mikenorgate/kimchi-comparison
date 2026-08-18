import { useWindowStore } from '../store/window-store'
import { getApp } from '../store/app-registry'
import { Window } from './window'

/**
 * Renders all open (non-closed) windows from the window store.
 * Each window's content is the registered app's component.
 * Minimized windows render nothing (restored from Dock).
 */
export function WindowLayer() {
  const windows = useWindowStore((s) => s.windows)

  return (
    <div className="window-layer" data-testid="window-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {windows.map((win) => {
        const app = getApp(win.appId)
        const AppComponent = app?.component
        return (
          <div key={win.id} style={{ pointerEvents: 'auto' }}>
            <Window win={win}>
              {AppComponent ? <AppComponent windowId={win.id} /> : (
                <div style={{ padding: 20, color: 'var(--text-primary)' }}>
                  App "{win.appId}" not registered.
                </div>
              )}
            </Window>
          </div>
        )
      })}
    </div>
  )
}
