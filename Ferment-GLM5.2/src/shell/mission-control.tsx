import { useUIStore } from '../store/ui-store'
import { useWindowStore } from '../store/window-store'

export function MissionControl() {
  const open = useUIStore((s) => s.missionControlOpen)
  const setOpen = useUIStore((s) => s.setMissionControlOpen)
  const windows = useWindowStore((s) => s.windows)
  const focusWindow = useWindowStore((s) => s.focusWindow)

  if (!open) return null

  const visibleWindows = windows.filter((w) => !w.isMinimized)

  return (
    <div
      data-testid="mission-control-overlay"
      onClick={() => setOpen(false)}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10003,
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {visibleWindows.length === 0 ? (
        <div data-testid="mission-control-empty" style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
          No Open Windows
        </div>
      ) : (
        <div
          data-testid="mission-control-grid"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'center',
            maxWidth: '80vw',
          }}
        >
          {visibleWindows.map((win) => (
            <div
              key={win.id}
              data-testid={`mc-window-${win.id}`}
              onClick={(e) => {
                e.stopPropagation()
                focusWindow(win.id)
                setOpen(false)
              }}
              className="glass-panel"
              style={{
                width: 240,
                height: 150,
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{win.title}</span>
              <div
                style={{
                  flex: 1,
                  borderRadius: 6,
                  background: 'rgba(128,128,128,0.15)',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
