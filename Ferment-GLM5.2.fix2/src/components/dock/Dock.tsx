import { useState } from 'react'
import { motion } from 'framer-motion'
import { DOCK_APPS, getDockApp, type DockApp } from '@/lib/app-registry'
import { AppIcon } from '@/components/dock/AppIcon'
import { useWindows } from '@/lib/windows-context'
import { useOs } from '@/lib/os-context'
import { useOverlays } from '@/lib/overlays-context'

/**
 * Liquid Glass Dock with macOS-style magnification.
 *
 * - Translucent glass capsule anchored to the bottom-center of the screen.
 * - Each icon magnifies based on proximity to the cursor (Framer Motion
 *   spring-animated scale).
 * - Click launches the app: opens a new window if none is open, otherwise
 *   focuses/restores the most recent window of that app.
 * - A running indicator dot sits under apps with open windows.
 */
export function Dock() {
  const { openWindow, focusWindow, restoreWindow, windows, focusedId } =
    useWindows()
  const { setActiveAppId } = useOs()
  const overlays = useOverlays()
  const [mouseX, setMouseX] = useState<number | null>(null)

  const BASE = 48
  const MAX = 76
  const RANGE = 140 // px of influence each side

  const launch = (appId: string) => {
    const app = getDockApp(appId)
    if (!app) return
    // Find open windows for this app.
    const appWindows = windows
      .filter((w) => w.appId === appId)
      .sort((a, b) => b.z - a.z)
    if (appWindows.length > 0) {
      const top = appWindows[0]
      if (top.minimized) {
        restoreWindow(top.id)
      } else {
        focusWindow(top.id)
      }
      setActiveAppId(appId)
    } else {
      openWindow({
        appId,
        title: app.name,
        width: app.defaultWidth,
        height: app.defaultHeight,
      })
    }
  }

  const sizeFor = (centerX: number) => {
    if (mouseX === null) return BASE
    const dist = Math.abs(mouseX - centerX)
    if (dist > RANGE) return BASE
    const t = 1 - dist / RANGE
    // Ease (smoothstep) for a natural magnification curve.
    const eased = t * t * (3 - 2 * t)
    return BASE + (MAX - BASE) * eased
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 8000,
      }}
    >
      <motion.div
        onMouseMove={(e) => setMouseX(e.clientX)}
        onMouseLeave={() => setMouseX(null)}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          padding: '6px 8px',
          backgroundColor: 'var(--glass-bg-prominent)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          WebkitBackdropFilter:
            'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          border: '0.5px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
          borderRadius: '22px',
        }}
      >
        <LaunchpadIcon onOpen={() => overlays.open('launchpad')} />
        <MissionControlIcon onOpen={() => overlays.open('mission-control')} />
        {DOCK_APPS.map((app, i) => {
          // Estimate icon center: each slot ~ BASE+gap. Refinement via ref is
          // possible but the approx is visually correct for magnification.
          const slotCenter = i * (BASE + 6) + BASE / 2
          const size = sizeFor(slotCenter)
          const isOpen = windows.some((w) => w.appId === app.id)
          const isFocused = windows.some(
            (w) => w.appId === app.id && w.id === focusedId && !w.minimized,
          )
          return (
            <DockItem
              key={app.id}
              app={app}
              size={size}
              isOpen={isOpen}
              isFocused={isFocused}
              onLaunch={() => launch(app.id)}
            />
          )
        })}
      </motion.div>
    </div>
  )
}

function DockItem({
  app,
  size,
  isOpen,
  isFocused,
  onLaunch,
}: {
  app: DockApp
  size: number
  isOpen: boolean
  isFocused: boolean
  onLaunch: () => void
}) {
  return (
    <motion.div
      layout
      onClick={onLaunch}
      whileTap={{ scale: 0.9 }}
      role="button"
      aria-label={`Launch ${app.name}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        cursor: 'pointer',
        originY: 1,
      }}
      animate={{ width: size }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <motion.div
        animate={{ width: size, height: size }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ originY: 1 }}
      >
        <AppIcon app={app} size={size} />
      </motion.div>
      {/* Running indicator dot */}
      <div
        style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: isFocused
            ? 'var(--accent)'
            : isOpen
              ? 'var(--text-secondary)'
              : 'transparent',
          transition: 'background 0.15s',
        }}
      />
    </motion.div>
  )
}

/**
 * Mission Control trigger icon — sits beside Launchpad at the left edge of
 * the Dock and opens the window-overview overlay. Rendered at the base icon
 * size (no magnification).
 */
function MissionControlIcon({ onOpen }: { onOpen: () => void }) {
  const BASE = 48
  return (
    <motion.div
      onClick={onOpen}
      whileTap={{ scale: 0.9 }}
      role="button"
      aria-label="Mission Control"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        cursor: 'pointer',
        paddingBottom: '7px',
      }}
    >
      <div
        style={{
          width: BASE,
          height: BASE,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #5a5a5e, #2a2a2e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.25)',
          color: '#fff',
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
          <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.9" />
        </svg>
      </div>
    </motion.div>
  )
}

/**
 * Launchpad trigger icon — sits at the left edge of the Dock and opens the
 * full-screen app grid overlay. Rendered at the base icon size (no
 * magnification, to keep a stable anchor point).
 */
function LaunchpadIcon({ onOpen }: { onOpen: () => void }) {
  const BASE = 48
  return (
    <motion.div
      onClick={onOpen}
      whileTap={{ scale: 0.9 }}
      role="button"
      aria-label="Launchpad"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        cursor: 'pointer',
        paddingBottom: '7px',
      }}
    >
      <div
        style={{
          width: BASE,
          height: BASE,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #d6d6da, #9a9a9e)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          padding: 9,
          boxSizing: 'border-box',
          boxShadow:
            '0 4px 10px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.4)',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              borderRadius: 4,
              background: 'rgba(255,255,255,0.85)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
