import { useCallback, useMemo, useState } from 'react'
import { appRegistry, getAppById } from '../../apps'
import { useWindowManager } from '../window'
import { useTheme } from '../../theme'

function DockIcon({
  app,
  isRunning,
  onClick,
}: {
  app: (typeof appRegistry)[number]
  isRunning: boolean
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { tokens } = useTheme()
  const Icon = app.icon

  return (
    <button
      type="button"
      aria-label={app.name}
      data-testid="dock-icon"
      data-app-id={app.id}
      className="group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-150 ease-out hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: tokens.colors.glass,
        boxShadow: `inset 0 1px 0 ${tokens.colors.glassBorder}, 0 4px 16px rgba(0,0,0,0.15)`,
      }}
    >
      {isHovered && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs whitespace-nowrap pointer-events-none transition-opacity"
          style={{
            backgroundColor: tokens.colors.glass,
            color: tokens.colors.text,
            backdropFilter: `blur(${tokens.backdropBlur.lg}) saturate(180%)`,
          }}
        >
          {app.name}
        </div>
      )}
      <Icon className="w-7 h-7 text-white/90 drop-shadow" />
      {isRunning && (
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80"
          data-testid="dock-running-dot"
        />
      )}
    </button>
  )
}

export function Dock() {
  const { state, openWindow, focusWindow, restoreWindow } = useWindowManager()

  const runningAppIds = useMemo(() => {
    const ids = new Set<string>()
    for (const w of state.windows) {
      if (w.isOpen && !w.isMinimized) ids.add(w.appId)
    }
    return ids
  }, [state.windows])

  const minimizedWindows = useMemo(() => {
    return state.windows.filter((w) => w.isOpen && w.isMinimized)
  }, [state.windows])

  const handleAppClick = useCallback(
    (appId: string) => {
      const existingWindow = state.windows.find(
        (w) => w.appId === appId && w.isOpen,
      )
      if (existingWindow) {
        if (existingWindow.isMinimized) {
          restoreWindow(existingWindow.id)
        }
        focusWindow(existingWindow.id)
        return
      }

      const app = getAppById(appId)
      if (!app) return

      const offset = state.windows.length * 24
      openWindow({
        id: `${appId}-${Date.now()}`,
        appId,
        title: app.name,
        icon: <app.icon className="w-4 h-4" />,
        x: 120 + offset,
        y: 100 + offset,
        width: app.defaultWidth,
        height: app.defaultHeight,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
      })
    },
    [state.windows, openWindow, focusWindow, restoreWindow],
  )

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2"
      data-testid="dock"
    >
      {minimizedWindows.length > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-2xl"
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(24px) saturate(180%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 24px rgba(0,0,0,0.2)',
          }}
          data-testid="dock-minimized-area"
        >
          {minimizedWindows.map((w) => {
            const app = getAppById(w.appId)
            if (!app) return null
            const Icon = app.icon
            return (
              <button
                key={w.id}
                type="button"
                aria-label={`Restore ${w.title}`}
                data-testid="dock-minimized-window"
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => restoreWindow(w.id)}
              >
                <Icon className="w-5 h-5 text-white/80" />
              </button>
            )
          })}
        </div>
      )}

      <div
        className="flex items-end gap-2 px-3 py-3 rounded-[2rem]"
        style={{
          backgroundColor: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        {appRegistry.map((app) => (
          <DockIcon
            key={app.id}
            app={app}
            isRunning={runningAppIds.has(app.id)}
            onClick={() => handleAppClick(app.id)}
          />
        ))}
      </div>
    </div>
  )
}
