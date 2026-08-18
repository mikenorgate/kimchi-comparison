import { useState } from 'react'
import { useThemeStore, WALLPAPERS, ACCENT_COLORS } from '../../store/theme-store'
import { useSystemStore } from '../../store/system-store'

type PaneId = 'appearance' | 'wallpaper' | 'dock' | 'control-center' | 'sound' | 'network'

const PANES: { id: PaneId; label: string; icon: string }[] = [
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'wallpaper', label: 'Wallpaper', icon: '🖼' },
  { id: 'dock', label: 'Dock & Menu Bar', icon: '📐' },
  { id: 'control-center', label: 'Control Center', icon: '⚙' },
  { id: 'sound', label: 'Sound', icon: '🔊' },
  { id: 'network', label: 'Network', icon: '📶' },
]

const sidebarBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '6px 10px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 13,
  textAlign: 'left',
  borderRadius: 6,
}

const paneContainer: React.CSSProperties = {
  flex: 1,
  padding: 24,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  marginBottom: 4,
}

const cardStyle: React.CSSProperties = {
  background: 'var(--glass-bg)',
  border: '0.5px solid var(--glass-border)',
  borderRadius: 8,
  padding: 16,
}

const toggleBtn = (active: boolean): React.CSSProperties => ({
  border: '0.5px solid var(--glass-border)',
  borderRadius: 6,
  padding: '6px 16px',
  cursor: 'pointer',
  fontSize: 13,
  background: active ? 'var(--accent-blue)' : 'var(--glass-bg)',
  color: active ? 'white' : 'var(--text-primary)',
  fontWeight: active ? 600 : 400,
})

export function SystemSettings({ windowId: _windowId }: { windowId: string }) {
  const [activePane, setActivePane] = useState<PaneId>('appearance')
  const { mode, accent, wallpaperId, setMode, setAccent, setWallpaper } = useThemeStore()
  const sys = useSystemStore()

  return (
    <div data-testid="settings-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar */}
      <div
        data-testid="settings-sidebar"
        style={{ width: 200, borderRight: '0.5px solid var(--glass-border)', background: 'rgba(128,128,128,0.06)', overflowY: 'auto', flexShrink: 0, padding: '8px 6px' }}
      >
        {PANES.map((p) => (
          <button
            key={p.id}
            data-testid={`settings-pane-${p.id}`}
            onClick={() => setActivePane(p.id)}
            style={{ ...sidebarBtn, background: activePane === p.id ? 'var(--accent-blue)' : 'transparent', color: activePane === p.id ? 'white' : 'var(--text-primary)' }}
          >
            <span style={{ fontSize: 14 }}>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={paneContainer} data-testid="settings-content">
        {activePane === 'appearance' && (
          <div data-testid="pane-appearance">
            <div style={sectionLabel}>Appearance</div>
            <div style={{ ...cardStyle, display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  data-testid="appearance-light-preview"
                  onClick={() => setMode('light')}
                  style={{
                    width: 80, height: 56, borderRadius: 8, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f0f0f0, #ffffff)',
                    border: mode === 'light' ? '3px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: mode === 'light' ? 700 : 400 }}>Light</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  data-testid="appearance-dark-preview"
                  onClick={() => setMode('dark')}
                  style={{
                    width: 80, height: 56, borderRadius: 8, cursor: 'pointer',
                    background: 'linear-gradient(135deg, #1a1a2e, #2d2d44)',
                    border: mode === 'dark' ? '3px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                  }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: mode === 'dark' ? 700 : 400 }}>Dark</span>
              </div>
            </div>

            <div style={sectionLabel}>Accent Color</div>
            <div style={{ ...cardStyle, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  data-testid={`accent-${c}`}
                  onClick={() => setAccent(c)}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', border: accent === c ? '3px solid white' : '2px solid transparent',
                    background: c, cursor: 'pointer', padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {activePane === 'wallpaper' && (
          <div data-testid="pane-wallpaper">
            <div style={sectionLabel}>Wallpaper</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  data-testid={`wallpaper-${wp.id}`}
                  onClick={() => setWallpaper(wp.id)}
                  style={{
                    border: wallpaperId === wp.id ? '3px solid var(--accent-blue)' : '1px solid var(--glass-border)',
                    borderRadius: 8, cursor: 'pointer', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  }}
                >
                  <div style={{ width: '100%', height: 60, background: `linear-gradient(135deg, ${wp.colors[0]}, ${wp.colors[1]}, ${wp.colors[2]})` }} />
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', padding: '4px 6px', textAlign: 'center' }}>{wp.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activePane === 'dock' && (
          <div data-testid="pane-dock">
            <div style={sectionLabel}>Dock & Menu Bar</div>
            <div style={cardStyle}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>Dock magnification, position, and size settings.</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>These settings are managed by the Dock component.</div>
            </div>
          </div>
        )}

        {activePane === 'control-center' && (
          <div data-testid="pane-control-center">
            <div style={sectionLabel}>Control Center</div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Wi-Fi</span>
                <button data-testid="cc-wifi-toggle" onClick={() => sys.setWifi(!sys.wifi)} style={toggleBtn(sys.wifi)}>
                  {sys.wifi ? 'On' : 'Off'}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Bluetooth</span>
                <button data-testid="cc-bt-toggle" onClick={() => sys.setBluetooth(!sys.bluetooth)} style={toggleBtn(sys.bluetooth)}>
                  {sys.bluetooth ? 'On' : 'Off'}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>AirDrop</span>
                <button data-testid="cc-airdrop-toggle" onClick={() => sys.setAirdrop(!sys.airdrop)} style={toggleBtn(sys.airdrop)}>
                  {sys.airdrop ? 'On' : 'Off'}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Do Not Disturb</span>
                <button data-testid="cc-dnd-toggle" onClick={() => sys.setDoNotDisturb(!sys.doNotDisturb)} style={toggleBtn(sys.doNotDisturb)}>
                  {sys.doNotDisturb ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activePane === 'sound' && (
          <div data-testid="pane-sound">
            <div style={sectionLabel}>Sound</div>
            <div style={cardStyle}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                  Volume: {sys.volume}%
                </label>
                <input
                  data-testid="sound-volume-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={sys.volume}
                  onChange={(e) => sys.setVolume(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div style={sectionLabel}>Output</div>
            <div style={cardStyle}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Built-in Speakers</div>
            </div>
          </div>
        )}

        {activePane === 'network' && (
          <div data-testid="pane-network">
            <div style={sectionLabel}>Network</div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Wi-Fi</span>
                <button data-testid="net-wifi-toggle" onClick={() => sys.setWifi(!sys.wifi)} style={toggleBtn(sys.wifi)}>
                  {sys.wifi ? 'Connected' : 'Off'}
                </button>
              </div>
              {sys.wifi && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Connected to: Tahoe-Network (mock)</div>
              )}
            </div>
            <div style={sectionLabel}>Other</div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Bluetooth</span>
                <button data-testid="net-bt-toggle" onClick={() => sys.setBluetooth(!sys.bluetooth)} style={toggleBtn(sys.bluetooth)}>
                  {sys.bluetooth ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
