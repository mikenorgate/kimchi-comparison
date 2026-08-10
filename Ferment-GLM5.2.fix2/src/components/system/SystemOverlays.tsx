import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GlassSurface } from '@/components/glass/GlassSurface'
import { useOs } from '@/lib/os-context'
import { useTheme } from '@/lib/theme-context'

/**
 * System overlays driven by the Apple menu:
 *  - About This Mac: a glass sheet with Tahoe styling.
 *  - Sleep / Restart / Shut Down: a dimming screen with a wake-on-click veil.
 *  - Lock Screen: a blurred lock veil.
 *
 * These make the Apple menu genuinely functional rather than decorative.
 */
export function SystemOverlays() {
  const { powerOverlay, setPowerOverlay } = useOs()
  const { mode } = useTheme()

  return (
    <AnimatePresence>
      {powerOverlay === 'about' && (
        <AboutSheet key="about" onClose={() => setPowerOverlay(null)} />
      )}
      {(powerOverlay === 'sleep' ||
        powerOverlay === 'restart' ||
        powerOverlay === 'shutdown') && (
        <PowerScreen
          key={powerOverlay}
          kind={powerOverlay}
          onClose={() => setPowerOverlay(null)}
        />
      )}
      {powerOverlay === 'lock' && (
        <LockScreen
          key="lock"
          isDark={mode === 'dark'}
          onUnlock={() => setPowerOverlay(null)}
        />
      )}
    </AnimatePresence>
  )
}

function AboutSheet({ onClose }: { onClose: () => void }) {
  return (
    <Backdrop onClose={onClose}>
      <GlassSurface
        variant="vibrant"
        className="px-10 py-8 text-center"
        style={{ width: '320px' }}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}></div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>MacBook Pro</h2>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: '2px 0 12px',
          }}
        >
          macOS Tahoe 26
        </p>
        <SpecTable
          rows={[
            ['Chip', 'Apple M4 Pro'],
            ['Memory', '24 GB'],
            ['Startup Disk', 'Macintosh HD'],
            ['Serial', 'T4H0E3WEB'],
          ]}
        />
        <button onClick={onClose} style={btnStyle}>
          Done
        </button>
      </GlassSurface>
    </Backdrop>
  )
}

function SpecTable({ rows }: { rows: [string, string][] }) {
  return (
    <div
      style={{
        fontSize: '12px',
        textAlign: 'left',
        margin: '0 auto 16px',
        width: 'fit-content',
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: '16px', padding: '2px 0' }}>
          <span style={{ color: 'var(--text-secondary)', width: '90px' }}>{k}</span>
          <span style={{ fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function PowerScreen({
  kind,
  onClose,
}: {
  kind: 'sleep' | 'restart' | 'shutdown'
  onClose: () => void
}) {
  const msg =
    kind === 'sleep'
      ? 'Your Mac is going to sleep…'
      : kind === 'restart'
        ? 'Restarting…'
        : 'Shutting down…'
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={dimStyle}
      onClick={onClose}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}></div>
        <p style={{ fontSize: '16px', fontWeight: 500 }}>{msg}</p>
        <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '6px' }}>
          (Demo — click anywhere to wake)
        </p>
      </div>
    </motion.div>
  )
}

function LockScreen({
  isDark,
  onUnlock,
}: {
  isDark: boolean
  onUnlock: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        ...dimStyle,
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(20,20,30,0.45)',
        backdropFilter: 'blur(40px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
        color: '#fff',
      }}
      onClick={onUnlock}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}
        >
          
        </div>
        <p style={{ fontSize: '20px', fontWeight: 500 }}>Click to unlock</p>
        <p style={{ fontSize: '12px', opacity: 0.6, marginTop: '6px' }}>
          (Demo lock screen)
        </p>
      </div>
    </motion.div>
  )
}

function Backdrop({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={dimStyle}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </motion.div>
  )
}

const dimStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 99000,
  background: 'rgba(0,0,0,0.35)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const btnStyle: CSSProperties = {
  marginTop: '4px',
  padding: '6px 24px',
  borderRadius: '8px',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  fontSize: '13px',
  fontWeight: 500,
}
