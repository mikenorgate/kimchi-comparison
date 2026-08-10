import { useEffect, useRef, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GlassSurface } from '@/components/glass/GlassSurface'
import { useTheme, type AccentColor } from '@/lib/theme-context'
import { useSystem } from '@/lib/system-context'
import { useOverlays } from '@/lib/overlays-context'

/**
 * macOS Control Center — the top-right glass panel.
 *
 * Groups:
 * - Connectivity tiles (Wi-Fi, Bluetooth, AirDrop, Focus) — clickable tiles
 *   that highlight when active.
 * - Dark Mode toggle (writes through ThemeProvider → re-tints everything).
 * - Brightness slider (dims the screen via a full-screen overlay).
 * - Volume slider (in-session value).
 * - Accent color + Reduce Transparency (Appearance group).
 *
 * Opened from the menu-bar Control Center icon; closes on click-outside or
 * Escape. This replaces the Phase 1 ThemePanel — the theming controls now live
 * here as the "Appearance" group.
 */
export function ControlCenter() {
  const { isOpen, close } = useOverlaysState()
  const sys = useSystem()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen('control-center')) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    // Defer so the opening click doesn't immediately close it.
    const t = setTimeout(() => {
      document.addEventListener('mousedown', onDown)
      document.addEventListener('keydown', onKey)
    }, 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen('control-center') && (
        <div
          ref={ref}
          style={{
            position: 'fixed',
            top: 30,
            right: 8,
            zIndex: 9600,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <GlassSurface
              variant="prominent"
              style={{ width: 300, padding: 12, borderRadius: 18 }}
            >
              {/* Connectivity tiles */}
              <ConnectivityGroup />

              <Divider />

              {/* Brightness */}
              <SliderRow
                icon={<SunIcon />}
                value={sys.brightness}
                onChange={sys.setBrightness}
              />

              <div style={{ height: 10 }} />

              {/* Volume */}
              <SliderRow
                icon={<SpeakerIcon />}
                value={sys.volume}
                onChange={sys.setVolume}
              />

              <Divider />

              <AppearanceGroup />
            </GlassSurface>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* -------------------------------------------------------------------------- */
/* Connectivity tiles                                                          */
/* -------------------------------------------------------------------------- */

function ConnectivityGroup() {
  const sys = useSystem()
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <ConnectivityTile
        icon={<WifiIcon />}
        label="Wi-Fi"
        sub={sys.wifi ? 'Home' : 'Off'}
        active={sys.wifi}
        onClick={sys.toggleWifi}
      />
      <ConnectivityTile
        icon={<BluetoothIcon />}
        label="Bluetooth"
        sub={sys.bluetooth ? 'On' : 'Off'}
        active={sys.bluetooth}
        onClick={sys.toggleBluetooth}
      />
      <ConnectivityTile
        icon={<AirDropIcon />}
        label="AirDrop"
        sub={sys.airdrop ? 'Everyone' : 'Off'}
        active={sys.airdrop}
        onClick={sys.toggleAirdrop}
      />
      <ConnectivityTile
        icon={<MoonIcon />}
        label="Focus"
        sub={sys.focus ? 'On' : 'Off'}
        active={sys.focus}
        onClick={sys.toggleFocus}
      />
    </div>
  )
}

function ConnectivityTile({
  icon,
  label,
  sub,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  sub: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} ${active ? 'on' : 'off'}`}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 8px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: active
          ? 'rgba(var(--accent-rgb), 0.9)'
          : 'rgba(120,120,128,0.24)',
        color: active ? '#fff' : 'var(--text-primary)',
        transition: 'background 0.15s',
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', justifyContent: 'center' }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center' }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 9,
          opacity: 0.85,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {sub}
      </span>
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Brightness / Volume sliders                                                 */
/* -------------------------------------------------------------------------- */

function SliderRow({
  icon,
  value,
  onChange,
}: {
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div
      style={{
        position: 'relative',
        height: 30,
        borderRadius: 10,
        overflow: 'hidden',
        background: 'rgba(120,120,128,0.24)',
      }}
    >
      {/* Filled portion */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${value}%`,
          background: '#fff',
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 10,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          color: 'var(--text-secondary)',
          zIndex: 2,
        }}
      >
        {icon}
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="slider"
        style={rangeStyle}
      />
    </div>
  )
}

const rangeStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  margin: 0,
  opacity: 0,
  cursor: 'pointer',
  background: 'transparent',
}

/* -------------------------------------------------------------------------- */
/* Appearance group (Dark Mode + accent + Reduce Transparency)                 */
/* -------------------------------------------------------------------------- */

function AppearanceGroup() {
  const theme = useTheme()
  const accents: AccentColor[] = [
    'blue',
    'purple',
    'pink',
    'red',
    'orange',
    'green',
    'graphite',
  ]
  return (
    <div>
      <div style={labelStyle}>Appearance</div>
      <ToggleRow
        label="Dark Mode"
        on={theme.mode === 'dark'}
        onToggle={theme.toggleMode}
      />
      <ToggleRow
        label="Reduce Transparency"
        on={theme.reduceTransparency}
        onToggle={() => theme.setReduceTransparency(!theme.reduceTransparency)}
      />
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
        {accents.map((a) => (
          <button
            key={a}
            title={a}
            aria-label={`accent ${a}`}
            onClick={() => theme.setAccent(a)}
            style={accentSwatchStyle(theme.accent === a)}
          >
            <span
              style={{
                display: 'block',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: accentHex(a),
              }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
}

function ToggleRow({
  label,
  on,
  onToggle,
}: {
  label: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 0',
      }}
    >
      <span style={{ fontSize: 13 }}>{label}</span>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={label}
        style={{
          width: 36,
          height: 22,
          borderRadius: 11,
          border: 'none',
          background: on ? 'var(--accent)' : 'rgba(120,120,128,0.32)',
          position: 'relative',
          transition: 'background 0.18s',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 16 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'left 0.18s',
          }}
        />
      </button>
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        margin: '10px 0',
        background: 'var(--glass-border-inner)',
      }}
    />
  )
}

function accentSwatchStyle(selected: boolean): CSSProperties {
  return {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: selected ? '2px solid var(--accent)' : '2px solid transparent',
    background: 'transparent',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  }
}

function accentHex(a: AccentColor): string {
  const map: Record<AccentColor, string> = {
    blue: '#0a84ff',
    purple: '#bf5af2',
    pink: '#ff375f',
    red: '#ff453a',
    orange: '#ff9f0a',
    green: '#30d158',
    graphite: '#98989d',
  }
  return map[a]
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="5" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.5" y1="4.5" x2="6" y2="6" />
        <line x1="18" y1="18" x2="19.5" y2="19.5" />
        <line x1="4.5" y1="19.5" x2="6" y2="18" />
        <line x1="18" y1="6" x2="19.5" y2="4.5" />
      </g>
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 9v6h4l5 5V4L8 9H4z" />
      <path
        d="M16 8a5 5 0 0 1 0 8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 18.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
      <path
        d="M5.5 12a9 9 0 0 1 13 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M8 14.5a5.5 5.5 0 0 1 8 0"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BluetoothIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2v8.5l4-3.5 1.5 1.5L12 14.5v.5l5.5 4.5L16 21l-4-3.5V22h-.5L7 18.5l4-4.5V8L7 4.5 11.5 1l.5 1z" />
    </svg>
  )
}

function AirDropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4a8 8 0 0 1 8 8 8 8 0 0 1-1 4h-2.5a6 6 0 1 0-9 0H5a8 8 0 0 1-1-4 8 8 0 0 1 8-8z" opacity="0.5" />
      <path d="M12 11a3 3 0 0 1 3 3l-3 5-3-5a3 3 0 0 1 3-3z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 14a8 8 0 1 1-10-10 6 6 0 0 0 10 10z" />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/* hook wrapper                                                                 */
/* -------------------------------------------------------------------------- */

function useOverlaysState() {
  const overlays = useOverlays()
  return {
    isOpen: overlays.isOpen,
    close: overlays.close,
  }
}

/**
 * Full-screen brightness dimming overlay.
 *
 * Renders a black layer whose opacity = (100 - brightness) * 0.007, clamped to
 * 0.6 so the desktop never goes fully black. Sits above everything except
 * Control Center itself so the dim is visible but the slider stays usable.
 */
export function BrightnessOverlay() {
  const { brightness } = useSystem()
  const opacity = Math.min(0.6, (100 - brightness) * 0.007)
  if (opacity <= 0) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        opacity,
        pointerEvents: 'none',
        zIndex: 9100,
        transition: 'opacity 0.2s',
      }}
    />
  )
}
