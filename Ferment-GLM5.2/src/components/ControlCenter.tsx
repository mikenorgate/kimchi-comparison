import { useState, useEffect, useRef } from 'react'

/**
 * ControlCenter component — a frosted panel toggled from the menu bar icon.
 * Contains toggles (Wi-Fi, Bluetooth, AirDrop) and sliders (brightness, volume).
 * State is in-memory only.
 */
export default function ControlCenter() {
  const [open, setOpen] = useState(false)
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)
  const [airdrop, setAirdrop] = useState(false)
  const [brightness, setBrightness] = useState(80)
  const [volume, setVolume] = useState(60)
  const ref = useRef<HTMLDivElement>(null)

  // Listen for menu bar toggle via custom event
  useEffect(() => {
    const handler = () => setOpen(prev => !prev)
    document.addEventListener('toggle-control-center', handler)
    return () => document.removeEventListener('toggle-control-center', handler)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-testid="control-center-button"]')) {
          setOpen(false)
        }
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!open) return null

  return (
    <div
      ref={ref}
      data-testid="control-center-panel"
      className="glass"
      style={{
        position: 'fixed',
        top: '32px',
        right: '8px',
        width: '300px',
        borderRadius: '14px',
        padding: '14px',
        zIndex: 100,
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Toggles row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <ToggleTile label="Wi-Fi" active={wifi} onClick={() => setWifi(v => !v)} testId="toggle-wifi" />
        <ToggleTile label="Bluetooth" active={bluetooth} onClick={() => setBluetooth(v => !v)} testId="toggle-bluetooth" />
        <ToggleTile label="AirDrop" active={airdrop} onClick={() => setAirdrop(v => !v)} testId="toggle-airdrop" />
      </div>

      {/* Brightness slider */}
      <div data-testid="control-center-brightness">
        <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
          Display
        </div>
        <input
          data-testid="brightness-slider"
          type="range"
          min={0}
          max={100}
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'white' }}
        />
        <div data-testid="brightness-value" style={{ color: 'white', fontSize: '11px', opacity: 0.6 }}>
          {brightness}%
        </div>
      </div>

      {/* Volume slider */}
      <div data-testid="control-center-volume">
        <div style={{ color: 'white', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
          Sound
        </div>
        <input
          data-testid="volume-slider"
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'white' }}
        />
        <div data-testid="volume-value" style={{ color: 'white', fontSize: '11px', opacity: 0.6 }}>
          {volume}%
        </div>
      </div>
    </div>
  )
}

function ToggleTile({ label, active, onClick, testId }: {
  label: string
  active: boolean
  onClick: () => void
  testId: string
}) {
  return (
    <button
      data-testid={testId}
      data-active={active}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 8px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        background: active ? 'rgba(100, 160, 255, 0.5)' : 'rgba(255,255,255,0.1)',
        color: 'white',
        fontSize: '11px',
        fontWeight: '500',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: active ? '#4a9eff' : '#666' }} />
      {label}
    </button>
  )
}
