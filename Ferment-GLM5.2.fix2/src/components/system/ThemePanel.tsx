import { useEffect, useRef, type CSSProperties } from 'react'
import { GlassSurface } from '@/components/glass/GlassSurface'
import { useTheme, type AccentColor } from '@/lib/theme-context'

/**
 * Compact theme panel (a preview of the Phase 2 Control Center).
 *
 * Toggles dark mode, picks an accent color, and flips Reduce Transparency —
 * all of which write through the ThemeProvider to <html> data-attributes,
 * which every Liquid Glass surface reads via CSS variables. So toggling here
 * re-tints the menu bar, Dock, windows, and menus app-wide instantly.
 *
 * Wired to the menu bar's Control Center button (Phase 2 expands this into
 * the full Control Center with brightness/volume/wifi/etc.).
 */
export function ThemePanel({
  open,
  onClose,
  anchorRight = 12,
}: {
  open: boolean
  onClose: () => void
  anchorRight?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { mode, accent, reduceTransparency, toggleMode, setAccent, setReduceTransparency } =
    useTheme()

  // Close on click-outside or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

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
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 34,
        right: anchorRight,
        zIndex: 9500,
      }}
    >
      <GlassSurface variant="prominent" className="p-3" style={{ width: 260 }}>
        <Section label="Appearance">
          <ToggleRow
            label="Dark Mode"
            on={mode === 'dark'}
            onToggle={toggleMode}
          />
          <ToggleRow
            label="Reduce Transparency"
            on={reduceTransparency}
            onToggle={() => setReduceTransparency(!reduceTransparency)}
          />
        </Section>

        <Divider />

        <Section label="Accent Color">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {accents.map((a) => (
              <button
                key={a}
                title={a}
                aria-label={a}
                onClick={() => setAccent(a)}
                style={accentSwatchStyle(accent === a)}
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
        </Section>
      </GlassSurface>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
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
      <span style={{ fontSize: '13px' }}>{label}</span>
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
        margin: '8px 0',
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
    border: selected
      ? '2px solid var(--accent)'
      : '2px solid transparent',
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
