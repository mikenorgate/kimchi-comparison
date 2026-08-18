import { useState, useCallback } from 'react'
import { APP_REGISTRY } from '../apps/registry'
import { useWindowManager } from '../WindowManager'

/**
 * Dock component — the frosted Liquid Glass Dock at the bottom of the screen.
 * Features: squircle app icons, hover magnification (scale + neighbors),
 * running-app indicator dots, and click-to-open via WindowManager.openApp.
 */
export default function Dock() {
  const { windows, openApp } = useWindowManager()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const runningApps = new Set(windows.map(w => w.appId))

  const getScale = useCallback(
    (index: number) => {
      if (hoveredIndex === null) return 1
      const distance = Math.abs(index - hoveredIndex)
      if (distance === 0) return 1.6
      if (distance === 1) return 1.3
      if (distance === 2) return 1.1
      return 1
    },
    [hoveredIndex]
  )

  return (
    <div
      data-testid="dock"
      className="glass fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex items-end gap-1.5 px-2 py-2"
      style={{
        borderRadius: '22px',
        minHeight: '64px',
      }}
    >
      {APP_REGISTRY.map((app, index) => (
        <div key={app.id} className="flex flex-col items-center justify-end" style={{ width: '52px' }}>
          <button
            data-testid={`dock-icon-${app.id}`}
            data-app-id={app.id}
            onClick={() => openApp(app.id)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative cursor-default select-none transition-transform duration-150 ease-out"
            style={{
              transform: `scale(${getScale(index)})`,
              transformOrigin: 'bottom center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: app.gradient,
              padding: 0,
              border: 'none',
              outline: 'none',
            }}
            aria-label={app.name}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <path d={app.iconPath} />
            </svg>
          </button>
          {/* Running app indicator dot */}
          <div
            data-testid={`dock-indicator-${app.id}`}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              marginTop: '3px',
              background: runningApps.has(app.id) ? 'rgba(255,255,255,0.9)' : 'transparent',
            }}
          />
        </div>
      ))}
    </div>
  )
}
