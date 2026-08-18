import { useState } from 'react'
import { useShellSettings } from '../../ShellSettings'

const WALLPAPERS = [
  { id: 'tahoe', name: 'Tahoe', gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #1a1a2e 100%)' },
  { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)' },
  { id: 'ocean', name: 'Ocean', gradient: 'linear-gradient(135deg, #006994 0%, #003554 50%, #005f73 100%)' },
  { id: 'forest', name: 'Forest', gradient: 'linear-gradient(135deg, #2d5016 0%, #1a3409 50%, #4a7c1f 100%)' },
  { id: 'monochrome', name: 'Graphite', gradient: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 50%, #3d3d3d 100%)' },
  { id: 'aurora', name: 'Aurora', gradient: 'linear-gradient(135deg, #00c9a7 0%, #845ec2 50%, #2c73d2 100%)' },
]

type Section = 'appearance' | 'wallpaper' | 'dock'

/**
 * System Settings app — sidebar with Appearance, Wallpaper, Dock sections.
 * Appearance: light/dark toggle.
 * Wallpaper: grid of CSS-gradient wallpapers.
 * Dock: magnification toggle + icon size S/M/L.
 */
export default function SystemSettings() {
  const { darkMode, setDarkMode, wallpaper, setWallpaper, dockMagnification, setDockMagnification, dockIconSize, setDockIconSize } = useShellSettings()
  const [section, setSection] = useState<Section>('appearance')

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'wallpaper', label: 'Wallpaper', icon: '🖼️' },
    { id: 'dock', label: 'Dock', icon: '📍' },
  ]

  return (
    <div
      data-testid="system-settings"
      style={{
        display: 'flex',
        height: '100%',
        background: '#1e1e1e',
        color: '#fff',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        data-testid="settings-sidebar"
        style={{
          width: '180px',
          minWidth: '180px',
          background: '#2a2a2a',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          padding: '10px 0',
        }}
      >
        {sections.map(s => (
          <div
            key={s.id}
            data-testid={`settings-section-${s.id}`}
            onClick={() => setSection(s.id)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
              background: section === s.id ? 'rgba(10,132,255,0.3)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>{s.icon}</span>
            {s.label}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {section === 'appearance' && (
          <div data-testid="settings-appearance">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Appearance</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px' }}>Dark Mode</span>
              <button
                data-testid="dark-mode-toggle"
                data-active={darkMode}
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  width: '44px',
                  height: '26px',
                  borderRadius: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  background: darkMode ? '#0a84ff' : '#555',
                  position: 'relative',
                  padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: darkMode ? '20px' : '2px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </button>
              <span data-testid="dark-mode-label" style={{ fontSize: '13px', opacity: 0.7 }}>
                {darkMode ? 'On' : 'Off'}
              </span>
            </div>
          </div>
        )}

        {section === 'wallpaper' && (
          <div data-testid="settings-wallpaper">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Wallpaper</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {WALLPAPERS.map(wp => (
                <div
                  key={wp.id}
                  data-testid={`wallpaper-${wp.id}`}
                  onClick={() => setWallpaper(wp.gradient)}
                  style={{
                    height: '80px',
                    borderRadius: '10px',
                    background: wp.gradient,
                    cursor: 'pointer',
                    border: wallpaper === wp.gradient ? '3px solid #0a84ff' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '4px',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}>
                    {wp.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === 'dock' && (
          <div data-testid="settings-dock">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Dock</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px' }}>Magnification</span>
              <button
                data-testid="dock-magnification-toggle"
                data-active={dockMagnification}
                onClick={() => setDockMagnification(!dockMagnification)}
                style={{
                  width: '44px',
                  height: '26px',
                  borderRadius: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  background: dockMagnification ? '#0a84ff' : '#555',
                  position: 'relative',
                  padding: 0,
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  left: dockMagnification ? '20px' : '2px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px' }}>Icon Size</span>
              {(['S', 'M', 'L'] as const).map(size => (
                <button
                  key={size}
                  data-testid={`dock-size-${size}`}
                  onClick={() => setDockIconSize(size)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    background: dockIconSize === size ? '#0a84ff' : '#333',
                    color: '#fff',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
