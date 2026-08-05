import { useState } from 'react'
import { Icon } from './common/Icon'

function ToggleTile({ icon, label, active, onClick, 'data-testid': testId }) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        background: active ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
        color: active ? '#fff' : 'var(--color-text)',
        cursor: 'pointer',
        minWidth: 72,
        minHeight: 72,
        transition: 'background var(--transition-fast), color var(--transition-fast)',
      }}
    >
      <Icon name={icon} size={22} color={active ? '#fff' : 'var(--color-text)'} />
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}>{label}</span>
    </button>
  )
}

function Slider({ icon, label, value, onChange, 'data-testid': testId }) {
  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-sm) var(--space-md)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border)',
      }}
    >
      <Icon name={icon} size={18} color="var(--color-text)" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--text-xs)', marginBottom: 4, color: 'var(--color-text-secondary)' }}>{label}</div>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  )
}

export function ControlCenter({ isOpen, onClose }) {
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)
  const [dnd, setDnd] = useState(false)
  const [brightness, setBrightness] = useState(75)
  const [volume, setVolume] = useState(60)

  if (!isOpen) return null

  return (
    <>
      <div
        data-testid="control-center-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-control-center)',
          background: 'transparent',
        }}
        onClick={onClose}
      />
      <div
        data-testid="control-center-panel"
        style={{
          position: 'fixed',
          top: 'calc(var(--menu-bar-height) + var(--space-sm))',
          right: 'var(--space-sm)',
          width: 280,
          zIndex: 'var(--z-control-center)',
          background: 'var(--color-surface)',
          backdropFilter: 'blur(var(--blur-xl))',
          WebkitBackdropFilter: 'blur(var(--blur-xl))',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-sm)',
          }}
        >
          <ToggleTile icon="wifi" label="Wi-Fi" active={wifi} onClick={() => setWifi((v) => !v)} data-testid="cc-wifi" />
          <ToggleTile icon="bluetooth" label="Bluetooth" active={bluetooth} onClick={() => setBluetooth((v) => !v)} data-testid="cc-bluetooth" />
          <ToggleTile icon="moon" label="Do Not Disturb" active={dnd} onClick={() => setDnd((v) => !v)} data-testid="cc-dnd" />
        </div>

        <Slider icon="sun" label="Brightness" value={brightness} onChange={setBrightness} data-testid="cc-brightness" />
        <Slider icon="volume" label="Volume" value={volume} onChange={setVolume} data-testid="cc-volume" />
      </div>
    </>
  )
}

export default ControlCenter
