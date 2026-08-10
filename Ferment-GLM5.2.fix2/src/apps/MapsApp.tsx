import { useState } from 'react'
import { GlassSurface } from '@/components/glass/GlassSurface'

interface Pin {
  id: string
  label: string
  top: string
  left: string
  color: string
}

const PINS: Pin[] = [
  { id: 'ap', label: 'Apple Park', top: '42%', left: '38%', color: '#ff3b30' },
  { id: 'cf', label: 'Coffee', top: '28%', left: '22%', color: '#bf5af2' },
  { id: 'cv', label: 'Cafe', top: '64%', left: '70%', color: '#ff9500' },
]

export default function MapsApp() {
  const [activePin, setActivePin] = useState<Pin | null>(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', color: 'var(--text-primary)' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(to right, transparent 18%, rgba(255,255,255,0.15) 18%, rgba(255,255,255,0.15) 19%, transparent 19%),
            linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.12) 31%, transparent 31%),
            linear-gradient(to right, transparent 60%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0.15) 61%, transparent 61%),
            linear-gradient(to bottom, transparent 70%, rgba(255,255,255,0.12) 70%, rgba(255,255,255,0.12) 71%, transparent 71%),
            linear-gradient(135deg, #5a8f5a 0%, #5a8f5a 45%, #7aa3c7 45%, #7aa3c7 70%, #8e8e93 70%, #8e8e93 100%)
          `,
        }}
      />

      <GlassSurface
        variant="regular"
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(360px, 70%)',
          padding: '8px 12px',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ opacity: 0.6, fontSize: 14 }}>🔍</span>
        <input
          type="text"
          placeholder="Search Maps"
          readOnly
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 14,
            outline: 'none',
            font: 'inherit',
          }}
        />
      </GlassSurface>

      {PINS.map((pin) => (
        <button
          key={pin.id}
          type="button"
          onClick={() => setActivePin(pin)}
          style={{
            position: 'absolute',
            top: pin.top,
            left: pin.left,
            transform: 'translate(-50%, -100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div
            style={{
              padding: '3px 8px',
              borderRadius: 8,
              background: 'var(--window-bg)',
              color: 'var(--text-primary)',
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            {pin.label}
          </div>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
              background: pin.color,
              border: '2px solid #fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            }}
          />
        </button>
      ))}

      {activePin && (
        <GlassSurface
          variant="prominent"
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            width: 240,
            padding: 14,
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{activePin.label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {activePin.label === 'Apple Park' ? '1 Apple Park Way' : 'Directions available'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" style={ctaBtn}>Directions</button>
            <button type="button" style={ctaBtn}>Call</button>
          </div>
          <button
            type="button"
            onClick={() => setActivePin(null)}
            aria-label="Close card"
            style={{ position: 'absolute', top: 6, right: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
          >
            ✕
          </button>
        </GlassSurface>
      )}

      <GlassSurface
        variant="regular"
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          padding: 4,
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <button type="button" aria-label="Zoom in" style={zoomBtn}>＋</button>
        <div style={{ height: 1, background: 'var(--glass-border-inner)' }} />
        <button type="button" aria-label="Zoom out" style={zoomBtn}>－</button>
      </GlassSurface>
    </div>
  )
}

const ctaBtn: React.CSSProperties = {
  flex: 1,
  padding: '6px 10px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  font: 'inherit',
}

const zoomBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 16,
}
