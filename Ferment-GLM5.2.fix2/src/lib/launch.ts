import { useCallback } from 'react'
import { useWindows } from '@/lib/windows-context'
import { useOs } from '@/lib/os-context'
import { getDockApp } from '@/lib/app-registry'

/**
 * Shared "launch an app" logic — used by the Dock, Spotlight, and Launchpad.
 *
 * Opens a new window if the app has none open; otherwise focuses/restores the
 * most recent window of that app and makes it the active app (menu bar
 * re-titles).
 */
export function useAppLauncher() {
  const { openWindow, focusWindow, restoreWindow, windows } = useWindows()
  const { setActiveAppId } = useOs()

  return useCallback(
    (appId: string) => {
      const app = getDockApp(appId)
      if (!app) return
      const appWindows = windows
        .filter((w) => w.appId === appId)
        .sort((a, b) => b.z - a.z)
      if (appWindows.length > 0) {
        const top = appWindows[0]
        if (top.minimized) {
          restoreWindow(top.id)
        } else {
          focusWindow(top.id)
        }
        setActiveAppId(appId)
      } else {
        openWindow({
          appId,
          title: app.name,
          width: app.defaultWidth,
          height: app.defaultHeight,
        })
      }
    },
    [openWindow, focusWindow, restoreWindow, windows, setActiveAppId],
  )
}
