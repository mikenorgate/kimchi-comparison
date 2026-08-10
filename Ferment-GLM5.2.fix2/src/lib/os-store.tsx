import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  OsContext,
  getAppManifest,
  type AppManifest,
  type OsState,
  type PowerOverlay,
} from '@/lib/os-context'

/**
 * OS-wide UI store: tracks the focused app (drives the menu bar's app name +
 * menus) and lightweight overlay flags the Apple menu touches (power/lock).
 * The window manager (Step 4) will call setActiveAppId on focus changes.
 */

const DEFAULT_APP: AppManifest = {
  id: 'finder',
  name: 'Finder',
  menus: [],
}

export function OsProvider({
  children,
  initialApp = DEFAULT_APP,
}: {
  children: ReactNode
  initialApp?: AppManifest
}) {
  const [activeAppId, setActiveAppIdState] = useState(initialApp.id)
  const [activeAppName, setActiveAppName] = useState(initialApp.name)
  const [powerOverlay, setPowerOverlay] = useState<PowerOverlay>(null)

  const setActiveAppId = useCallback((id: string) => {
    setActiveAppIdState(id)
    const app = getAppManifest(id)
    setActiveAppName(app?.name ?? id)
  }, [])

  const value = useMemo<OsState>(
    () => ({
      activeAppId,
      activeAppName,
      setActiveAppId,
      powerOverlay,
      setPowerOverlay,
    }),
    [activeAppId, activeAppName, setActiveAppId, powerOverlay],
  )

  return <OsContext.Provider value={value}>{children}</OsContext.Provider>
}
