import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DOCK_APPS } from '@/lib/app-registry'
import { useOverlays } from '@/lib/overlays-context'
import { useAppLauncher } from '@/lib/launch'

/**
 * macOS Launchpad — a full-screen blurred grid of every app.
 *
 * - Opens via the Dock's Launchpad icon (or F4 / pinch-on-trackpad gesture in
 *   real macOS; here it's the Dock icon).
 * - Search filters the icon grid by name.
 * - Clicking an icon launches that app (via the shared launcher) and closes
 *   Launchpad.
 * - Clicking the blurred backdrop or pressing Escape also closes it.
 */
export function Launchpad() {
  const { isOpen, close } = useOverlaysState()
  const [query, setQuery] = useState('')
  const launch = useAppLauncher()

  const apps = DOCK_APPS.filter((a) =>
    a.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  const handleLaunch = (appId: string) => {
    launch(appId)
    close()
  }

  return (
    <AnimatePresence>
      {isOpen('launchpad') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9700,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '14vh',
            background: 'rgba(0,0,0,0.25)',
            backdropFilter: 'blur(40px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
          }}
          onClick={close}
        >
          {/* Search field */}
          <div
            style={{
              width: 280,
              maxWidth: '70vw',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.18)',
              border: '0.5px solid rgba(255,255,255,0.25)',
              marginBottom: 40,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ opacity: 0.7, fontSize: 14 }}>🔍</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') close()
                if (e.key === 'Enter' && apps.length > 0) handleLaunch(apps[0].id)
              }}
              placeholder="Search"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 15,
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Icon grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 96px)',
              gap: '36px 28px',
              maxWidth: '880px',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {apps.map((app, i) => (
              <motion.button
                key={app.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.02 * i, duration: 0.2, ease: 'easeOut' }}
                onClick={() => handleLaunch(app.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 18,
                    background: app.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 40,
                    boxShadow:
                      '0 8px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)',
                  }}
                >
                  {app.glyph}
                </div>
                <span
                  style={{
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 500,
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                    maxWidth: 96,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {app.name}
                </span>
              </motion.button>
            ))}
          </div>

          {apps.length === 0 && (
            <div style={{ color: '#fff', opacity: 0.7, fontSize: 15, marginTop: 40 }}>
              No apps match "{query}"
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function useOverlaysState() {
  const overlays = useOverlays()
  return {
    isOpen: overlays.isOpen,
    close: overlays.close,
  }
}
