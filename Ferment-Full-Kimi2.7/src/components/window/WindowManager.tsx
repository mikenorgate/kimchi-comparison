import { useMemo } from 'react'
import { Window } from './Window'
import { useDesktop } from '../../desktop/store'
import { getApp } from '../../apps/registry'

export function WindowManager() {
  const { windows } = useDesktop()

  const windowComponents = useMemo(() => {
    return windows.map((win) => {
      const app = getApp(win.appId)
      const AppComponent = app?.component
      return (
        <Window key={win.id} window={win}>
          {AppComponent ? <AppComponent /> : <div className="p-4">Unknown app: {win.appId}</div>}
        </Window>
      )
    })
  }, [windows])

  return <>{windowComponents}</>
}
