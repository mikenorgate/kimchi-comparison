import { useState, useCallback } from 'react'
import { getRegisteredApps, type AppDefinition } from '../store/app-registry'
import { useWindowStore } from '../store/window-store'
import { AppIcon } from '../primitives/app-icon'

const ICON_SIZE = 52
const MAGNIFIED_SIZE = 72

export function Dock() {
  const apps = getRegisteredApps()
  const windows = useWindowStore((s) => s.windows)
  const openWindow = useWindowStore((s) => s.openWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)

  const launchApp = useCallback(
    (app: AppDefinition) => {
      // If app already has a window, focus or restore it
      const existing = windows.find((w) => w.appId === app.id)
      if (existing) {
        if (existing.isMinimized) {
          restoreWindow(existing.id)
        } else {
          focusWindow(existing.id)
        }
      } else {
        openWindow(app.id, app.name, {
          width: app.defaultWidth,
          height: app.defaultHeight,
        })
      }
    },
    [windows, openWindow, focusWindow, restoreWindow]
  )

  // Track which apps have open windows
  const runningAppIds = new Set(windows.map((w) => w.appId))

  return (
    <div
      data-testid="dock"
      style={{
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 6,
        padding: '6px 8px',
        borderRadius: 20,
        background: 'var(--dock-bg)',
        backdropFilter: 'blur(30px) saturate(200%)',
        WebkitBackdropFilter: 'blur(30px) saturate(200%)',
        border: '0.5px solid var(--glass-border)',
        boxShadow:
          '0 0 0 0.5px var(--glass-shadow), 0 8px 32px var(--glass-shadow), inset 0 1px 1px var(--glass-highlight)',
        zIndex: 9000,
        maxWidth: 'calc(100vw - 20px)',
      }}
    >
      {/* Reflective top highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          borderRadius: '20px 20px 0 0',
          background: 'linear-gradient(180deg, var(--glass-highlight) 0%, transparent 100%)',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />
      {apps.map((app) => {
        const isHovered = hoveredApp === app.id
        const isRunning = runningAppIds.has(app.id)
        const size = isHovered ? MAGNIFIED_SIZE : ICON_SIZE
        return (
          <div
            key={app.id}
            data-testid={`dock-item-${app.id}`}
            onClick={() => launchApp(app)}
            onMouseEnter={() => setHoveredApp(app.id)}
            onMouseLeave={() => setHoveredApp(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, width 0.15s ease, height 0.15s ease',
              transform: isHovered ? 'translateY(-8px) scale(1.0)' : 'translateY(0) scale(1.0)',
              position: 'relative',
            }}
          >
            {/* Tooltip */}
            {isHovered && (
              <div
                data-testid={`dock-tooltip-${app.id}`}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {app.name}
              </div>
            )}
            <AppIcon name={app.icon} size={size} />
            {/* Running indicator */}
            <div
              data-testid={`dock-indicator-${app.id}`}
              style={{
                width: isRunning ? 4 : 0,
                height: 4,
                borderRadius: '50%',
                background: 'var(--text-primary)',
                marginTop: 3,
                opacity: isRunning ? 0.7 : 0,
                transition: 'width 0.15s ease, opacity 0.15s ease',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
