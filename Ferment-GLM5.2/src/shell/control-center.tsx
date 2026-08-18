import { useUIStore } from '../store/ui-store'
import { useSystemStore } from '../store/system-store'
import { useThemeStore } from '../store/theme-store'

function ToggleTile({
  label,
  icon,
  active,
  onToggle,
  testId,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onToggle: () => void
  testId: string
}) {
  return (
    <div
      data-testid={testId}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 12,
        background: active ? 'var(--accent-blue)' : 'rgba(128,128,128,0.2)',
        cursor: 'pointer',
        color: active ? 'white' : 'var(--text-primary)',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </div>
  )
}

function SliderRow({
  label,
  icon,
  value,
  onChange,
  testId,
}: {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  testId: string
}) {
  return (
    <div data-testid={testId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
      <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
        {icon}
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={`${testId}-slider`}
        style={{ flex: 1, accentColor: 'var(--accent-blue)' }}
      />
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', minWidth: 28, textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

export function ControlCenter() {
  const open = useUIStore((s) => s.controlCenterOpen)
  const setOpen = useUIStore((s) => s.setControlCenterOpen)
  const {
    wifi, bluetooth, airdrop, brightness, volume,
    setWifi, setBluetooth, setAirdrop, setBrightness, setVolume,
  } = useSystemStore()
  const { mode, toggle } = useThemeStore()

  if (!open) return null

  return (
    <>
      {/* Click-away backdrop */}
      <div
        data-testid="control-center-backdrop"
        onClick={() => setOpen(false)}
        style={{ position: 'absolute', inset: 0, zIndex: 10001 }}
      />
      <div
        data-testid="control-center-panel"
        className="glass-panel"
        style={{
          position: 'absolute',
          top: 32,
          right: 8,
          width: 320,
          borderRadius: 16,
          padding: 12,
          zIndex: 10002,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Connectivity tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <ToggleTile
            testId="cc-wifi"
            label={wifi ? 'Wi-Fi' : 'Wi-Fi Off'}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.55a11 11 0 0 1 14 0" />
                <path d="M8.5 16.1a6 6 0 0 1 7 0" />
                <line x1="12" y1="20" x2="12" y2="20" />
              </svg>
            }
            active={wifi}
            onToggle={() => setWifi(!wifi)}
          />
          <ToggleTile
            testId="cc-bluetooth"
            label={bluetooth ? 'Bluetooth' : 'BT Off'}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12-6 6V0l6 6L6 18" />
              </svg>
            }
            active={bluetooth}
            onToggle={() => setBluetooth(!bluetooth)}
          />
          <ToggleTile
            testId="cc-airdrop"
            label="AirDrop"
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 0-7 7c0 3 2 5 4 7l3 4 3-4c2-2 4-4 4-7a7 7 0 0 0-7-7z" />
              </svg>
            }
            active={airdrop}
            onToggle={() => setAirdrop(!airdrop)}
          />
          <ToggleTile
            testId="cc-darkmode"
            label={mode === 'dark' ? 'Dark' : 'Light'}
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            }
            active={mode === 'dark'}
            onToggle={toggle}
          />
        </div>

        {/* Brightness slider */}
        <div className="glass-panel" style={{ borderRadius: 12, padding: '4px 0' }}>
          <SliderRow
            testId="cc-brightness"
            label="Display"
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
                <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
              </svg>
            }
            value={brightness}
            onChange={setBrightness}
          />
        </div>

        {/* Volume slider */}
        <div className="glass-panel" style={{ borderRadius: 12, padding: '4px 0' }}>
          <SliderRow
            testId="cc-volume"
            label="Sound"
            icon={
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            }
            value={volume}
            onChange={setVolume}
          />
        </div>
      </div>
    </>
  )
}
