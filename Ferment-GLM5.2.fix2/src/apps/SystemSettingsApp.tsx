import { useState } from 'react'
import { useTheme, type AccentColor } from '@/lib/theme-context'

interface SidebarItem { id: SectionId; label: string; icon: string }

type SectionId = 'appearance' | 'wallpaper' | 'accent' | 'displays' | 'sound' | 'network'

const SECTIONS: SidebarItem[] = [
  { id: 'appearance', label: 'Appearance', icon: '🌗' },
  { id: 'wallpaper', label: 'Wallpaper', icon: '🖼' },
  { id: 'accent', label: 'Accent Color', icon: '🎨' },
  { id: 'displays', label: 'Displays', icon: '🖥' },
  { id: 'sound', label: 'Sound', icon: '🔊' },
  { id: 'network', label: 'Network', icon: '🌐' },
]

const ACCENTS: Array<{ color: AccentColor; hex: string; label: string }> = [
  { color: 'blue', hex: '#0a84ff', label: 'Blue' },
  { color: 'purple', hex: '#bf5af2', label: 'Purple' },
  { color: 'pink', hex: '#ff375f', label: 'Pink' },
  { color: 'red', hex: '#ff453a', label: 'Red' },
  { color: 'orange', hex: '#ff9f0a', label: 'Orange' },
  { color: 'green', hex: '#30d158', label: 'Green' },
  { color: 'graphite', hex: '#8e8e93', label: 'Graphite' },
]

const WALLPAPERS: Array<{ label: string; gradient: string }> = [
  { label: 'Tahoe', gradient: 'linear-gradient(135deg, #5b86e5 0%, #36d1dc 100%)' },
  { label: 'Sunset', gradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
  { label: 'Aurora', gradient: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  { label: 'Mono', gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { label: 'Mint', gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)' },
  { label: 'Grape', gradient: 'linear-gradient(135deg, #6a3093 0%, #a044ff 100%)' },
]

export default function SystemSettingsApp() {
  const [section, setSection] = useState<SectionId>('appearance')
  const theme = useTheme()
  const [reduceTransparency, setReduceTransparency] = useState<boolean>(theme.reduceTransparency)

  const renderContent = () => {
    switch (section) {
      case 'appearance':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Appearance</h2>
            <ToggleRow
              label="Dark Mode"
              description="Use a dark appearance for the interface"
              value={theme.mode === 'dark'}
              onChange={() => theme.toggleMode()}
              testId="toggle-dark-mode"
            />
            <ToggleRow
              label="Reduce Transparency"
              description="Reduce the translucency of windows and surfaces"
              value={reduceTransparency}
              onChange={(v) => {
                setReduceTransparency(v)
                theme.setReduceTransparency(v)
              }}
              testId="toggle-reduce-transparency"
            />
          </div>
        )
      case 'wallpaper':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Wallpaper</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.label}
                  onClick={() => {
                    document.documentElement.style.setProperty('--desktop-gradient', wp.gradient)
                  }}
                  style={{
                    border: '1px solid var(--glass-border-inner)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    padding: 0,
                    cursor: 'pointer',
                    background: wp.gradient,
                    height: 90,
                  }}
                  aria-label={`Set wallpaper ${wp.label}`}
                >
                  <span style={{ display: 'block', height: '100%', color: '#fff', fontSize: 12, fontWeight: 600, textAlign: 'center', lineHeight: '90px', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                    {wp.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )
      case 'accent':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Accent Color</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ACCENTS.map((acc) => {
                const active = theme.accent === acc.color
                return (
                  <button
                    key={acc.color}
                    onClick={() => theme.setAccent(acc.color)}
                    aria-label={acc.label}
                    title={acc.label}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: active ? '3px solid var(--text-primary)' : '1px solid var(--glass-border-inner)',
                      background: acc.hex,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                )
              })}
            </div>
          </div>
        )
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              {SECTIONS.find((s) => s.id === section)?.label}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              {SECTIONS.find((s) => s.id === section)?.label} settings are not available in this preview.
            </p>
          </div>
        )
    }
  }

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', color: 'var(--text-primary)' }}>
      <div
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: '1px solid var(--glass-border-inner)',
          padding: '12px 8px',
          overflowY: 'auto',
        }}
      >
        {SECTIONS.map((item) => {
          const active = item.id === section
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 13,
                borderRadius: 6,
                textAlign: 'left',
                marginBottom: 2,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, minWidth: 0 }}>
        {renderContent()}
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
  testId,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
  testId?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        aria-label={label}
        data-testid={testId}
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          border: 'none',
          background: value ? 'var(--accent)' : 'var(--glass-border-inner)',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 20 : 2,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.15s ease',
          }}
        />
      </button>
    </div>
  )
}
