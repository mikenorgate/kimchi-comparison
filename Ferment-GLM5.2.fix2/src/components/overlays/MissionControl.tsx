import { AnimatePresence, motion } from 'framer-motion'
import { useOverlays } from '@/lib/overlays-context'
import { useWindows, type WindowState } from '@/lib/windows-context'
import { getDockApp } from '@/lib/app-registry'

/**
 * macOS Mission Control — an overview of all open windows.
 *
 * - Triggered from the Dock's Mission Control icon (or F3 / Ctrl+↑ in real
 *   macOS; here it's the Dock icon).
 * - Each open window shrinks into a thumbnail arranged in a grid.
 * - Tahoe "glass-pane descend" animation: the desktop blurs and dims, and each
 *   window thumbnail descends/scales into place via Framer Motion.
 * - Clicking a thumbnail focuses that window and exits Mission Control.
 * - Escape or clicking the backdrop also exits.
 */
export function MissionControl() {
  const { isOpen, close } = useOverlaysState()
  const { windows, focusWindow } = useWindows()

  // Only non-minimized windows appear in the overview.
  const visible = windows.filter((w) => !w.minimized)

  const handleSelect = (id: string) => {
    focusWindow(id)
    close()
  }

  return (
    <AnimatePresence>
      {isOpen('mission-control') && (
        <motion.div
          data-testid="mission-control"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 40px',
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(30px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(30px) saturate(1.3)',
          }}
          onClick={close}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close()
          }}
          tabIndex={-1}
        >
          {visible.length === 0 ? (
            <div
              style={{
                color: '#fff',
                fontSize: 20,
                opacity: 0.8,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              No open windows
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 40,
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: 1100,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {visible.map((w, i) => (
                <Thumbnail
                  key={w.id}
                  win={w}
                  index={i}
                  total={visible.length}
                  onSelect={() => handleSelect(w.id)}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * A single window thumbnail in the Mission Control overview. Descends and
 * scales into place with a spring; hover lifts it slightly.
 */
function Thumbnail({
  win,
  index,
  total,
  onSelect,
}: {
  win: WindowState
  index: number
  total: number
  onSelect: () => void
}) {
  const app = getDockApp(win.appId)
  // Scale the window rect to a thumbnail while preserving aspect ratio.
  const maxW = total <= 2 ? 520 : 360
  const maxH = total <= 2 ? 340 : 240
  const scale = Math.min(maxW / win.width, maxH / win.height, 1)
  const thumbW = win.width * scale
  const thumbH = win.height * scale

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7, y: -40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -40 }}
      transition={{
        delay: 0.04 * index,
        type: 'spring',
        stiffness: 260,
        damping: 26,
      }}
      whileHover={{ scale: 1.04, y: -6 }}
      onClick={onSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {/* Thumbnail pane */}
      <div
        style={{
          width: thumbW,
          height: thumbH,
          borderRadius: 12,
          overflow: 'hidden',
          background: 'var(--window-bg)',
          border: '0.5px solid rgba(255,255,255,0.25)',
          boxShadow:
            '0 20px 50px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(0,0,0,0.2)',
        }}
      >
        {/* Mini title bar */}
        <div
          style={{
            height: 24,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 12,
            gap: 6,
            background: 'rgba(255,255,255,0.06)',
            borderBottom: '0.5px solid var(--glass-border-inner)',
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#ff5f57',
            }}
          />
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#febc2e',
            }}
          />
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#28c840',
            }}
          />
        </div>
        {/* Placeholder content area */}
        <div
          style={{
            height: 'calc(100% - 24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48 * scale,
          }}
        >
          {app?.glyph ?? '📦'}
        </div>
      </div>
      {/* Window title + app name */}
      <div
        style={{
          color: '#fff',
          textAlign: 'center',
          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600 }}>{win.title}</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{app?.name ?? win.appId}</div>
      </div>
    </motion.button>
  )
}

function useOverlaysState() {
  const overlays = useOverlays()
  return {
    isOpen: overlays.isOpen,
    close: overlays.close,
  }
}
