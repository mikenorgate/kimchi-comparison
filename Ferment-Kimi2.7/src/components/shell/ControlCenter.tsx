import { useState, useCallback, useEffect } from 'react'
import { GlassPanel } from '../ui'
import { useTheme } from '../../theme'

interface ControlCenterToggleProps {
  id: string
  icon: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ControlCenterToggle({ id, icon, label, checked, onChange }: ControlCenterToggleProps) {
  const handleClick = useCallback(() => onChange(!checked), [checked, onChange])
  return (
    <button
      type="button"
      data-testid={`control-center-${id}-toggle`}
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`relative flex flex-col justify-between items-start p-3 rounded-2xl aspect-square transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
        checked
          ? 'bg-tahoe-accent text-white'
          : 'bg-white/10 text-tahoe-label hover:bg-white/15'
      }`}
    >
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <span className="text-xs font-medium text-left">{label}</span>
      <span
        className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-colors ${
          checked ? 'bg-white' : 'bg-current opacity-50'
        }`}
        aria-hidden="true"
      />
    </button>
  )
}

interface ControlCenterSliderProps {
  id: string
  icon: string
  label: string
  value: number
  onChange: (value: number) => void
}

function ControlCenterSlider({ id, icon, label, value, onChange }: ControlCenterSliderProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 text-tahoe-label">
      <span className="text-xl" aria-hidden="true">{icon}</span>
      <div className="flex-1 flex flex-col gap-1">
        <label htmlFor={`control-center-${id}-slider`} className="text-xs font-medium">
          {label}
        </label>
        <input
          id={`control-center-${id}-slider`}
          data-testid={`control-center-${id}-slider`}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none bg-white/20 accent-tahoe-accent cursor-pointer"
        />
      </div>
      <span className="text-xs tabular-nums w-8 text-right">{value}%</span>
    </div>
  )
}

interface ControlCenterProps {
  open: boolean
  onClose: () => void
}

export function ControlCenter({ open, onClose }: ControlCenterProps) {
  const { mode, setMode } = useTheme()
  const [toggles, setToggles] = useState({
    wifi: true,
    bluetooth: true,
    airplane: false,
    focus: false,
  })
  const [brightness, setBrightness] = useState(75)
  const [volume, setVolume] = useState(60)

  const setToggle = useCallback(
    (key: keyof typeof toggles, value: boolean) => {
      setToggles((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9998]"
      style={{ backgroundColor: 'transparent' }}
      onClick={onClose}
      data-testid="control-center-overlay"
      role="presentation"
    >
      <div
        className="absolute top-10 right-4 w-72"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassPanel
          variant="strong"
          className="p-4 flex flex-col gap-4 shadow-2xl"
          data-testid="control-center-panel"
        >
          <div className="grid grid-cols-2 gap-3">
            <ControlCenterToggle
              id="wifi"
              icon="📶"
              label="Wi-Fi"
              checked={toggles.wifi}
              onChange={(checked) => setToggle('wifi', checked)}
            />
            <ControlCenterToggle
              id="bluetooth"
              icon="🔵"
              label="Bluetooth"
              checked={toggles.bluetooth}
              onChange={(checked) => setToggle('bluetooth', checked)}
            />
            <ControlCenterToggle
              id="airplane"
              icon="✈️"
              label="Airplane Mode"
              checked={toggles.airplane}
              onChange={(checked) => setToggle('airplane', checked)}
            />
            <ControlCenterToggle
              id="focus"
              icon="🌙"
              label="Focus"
              checked={toggles.focus}
              onChange={(checked) => setToggle('focus', checked)}
            />
          </div>
          <ControlCenterSlider
            id="brightness"
            icon="☀️"
            label="Brightness"
            value={brightness}
            onChange={setBrightness}
          />
          <ControlCenterSlider
            id="volume"
            icon="🔊"
            label="Volume"
            value={volume}
            onChange={setVolume}
          />
          <button
            type="button"
            data-testid="control-center-theme-toggle"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between rounded-2xl bg-white/10 p-3 text-sm text-tahoe-label hover:bg-white/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50"
          >
            <span>Appearance</span>
            <span className="text-xs opacity-70 capitalize">{mode} Mode</span>
          </button>
        </GlassPanel>
      </div>
    </div>
  )
}
