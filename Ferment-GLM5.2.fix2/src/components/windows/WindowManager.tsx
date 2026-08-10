import type { ReactNode } from 'react'
import { useWindows } from '@/lib/windows-context'
import { Window } from '@/components/windows/Window'

/**
 * Renders all open, non-minimized windows. Each window is positioned/z-ordered
 * by its own state; minimized windows are hidden (Dock will restore them).
 *
 * App content is rendered via the `renderApp` prop, keyed by appId — apps
 * register a renderer that the manager calls with the window id.
 */
export function WindowManager({
  renderApp,
}: {
  renderApp: (appId: string, winId: string) => ReactNode
}) {
  const { windows } = useWindows()
  return (
    <>
      {windows.map((w) =>
        w.minimized ? null : (
          <Window key={w.id} win={w}>
            {renderApp(w.appId, w.id)}
          </Window>
        ),
      )}
    </>
  )
}
