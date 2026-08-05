import { useMemo } from 'react'
import { getApp } from './registry'
import { useDesktop } from '../desktop/store'

export function StubApp({ appId }: { appId: string }) {
  const { windows } = useDesktop()
  const app = useMemo(() => getApp(appId), [appId])
  const win = windows.find((w) => w.appId === appId)
  return (
    <div className="flex flex-col items-center justify-center h-full text-tahoe-text-secondary gap-2">
      {app?.icon && <app.icon size={48} />}
      <h2 className="text-xl font-semibold text-tahoe-text">{app?.name}</h2>
      <p className="text-sm">Window ID: {win?.id.slice(0, 8)}</p>
      <p className="text-xs text-tahoe-text-tertiary">This app is a placeholder for Phase 2 shell integration.</p>
    </div>
  )
}
