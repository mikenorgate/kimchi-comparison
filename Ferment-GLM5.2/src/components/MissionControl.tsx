import { useState, useEffect, useCallback } from 'react'
import { useWindowManager, type WindowState } from '../WindowManager'
import { APP_REGISTRY } from '../apps/registry'

/**
 * MissionControl — a fullscreen frosted overlay tiling all open (non-minimized)
 * windows in a grid. Triggered by F3 or Ctrl+Up. Clicking a tile focuses that
 * window and exits overview; Esc exits without focusing.
 */
export default function MissionControl() {
  const { windows, focusWindow } = useWindowManager()
  const [open, setOpen] = useState(false)

  // Global hotkey: F3 or Ctrl+Up to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp')) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Listen for menu bar trigger
  useEffect(() => {
    const handler = () => setOpen(prev => !prev)
    document.addEventListener('toggle-mission-control', handler)
    return () => document.removeEventListener('toggle-mission-control', handler)
  }, [])

  const visibleWindows = windows.filter(w => !w.minimized)

  const handleTileClick = useCallback((win: WindowState) => {
    focusWindow(win.id)
    setOpen(false)
  }, [focusWindow])

  if (!open) return null

  // Grid layout: up to 3 columns
  const cols = Math.min(visibleWindows.length, 3)
  const tileWidth = 240
  const tileHeight = 160

  return (
    <div
      data-testid="mission-control-overlay"
      className="glass"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      }}
    >
      <div
        data-testid="mission-control-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${tileWidth}px)`,
          gap: '20px',
          padding: '20px',
        }}
      >
        {visibleWindows.map(win => {
          const app = APP_REGISTRY.find(a => a.id === win.appId)
          return (
            <div
              key={win.id}
              data-testid={`mission-control-tile-${win.appId}`}
              data-window-id={win.id}
              onClick={() => handleTileClick(win)}
              style={{
                width: `${tileWidth}px`,
                height: `${tileHeight}px`,
                borderRadius: '10px',
                overflow: 'hidden',
                background: 'rgba(30, 30, 40, 0.85)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{
                height: '24px',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '10px',
                flexShrink: 0,
              }}>
                <span style={{ color: 'white', fontSize: '11px', fontWeight: 500 }}>
                  {win.title}
                </span>
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: app?.gradient ?? '#333',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d={app?.iconPath ?? ''} />
                </svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
