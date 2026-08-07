import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bluetooth,
  Moon,
  Sun,
  Volume1,
  Volume2,
  Wifi,
  WifiOff,
  Radio,
} from 'lucide-react'
import { useSystemStore } from '../../store/system'

/**
 * Control Center — Tahoe's quick-settings panel.
 *
 * Slides down from the top-right beneath the menu bar. Connectivity tiles
 * (Wi-Fi / Bluetooth / AirDrop / Focus) toggle the system store; the
 * Brightness and Volume sliders mutate the numeric store values. State
 * lives in useSystemStore; step 6 persists it.
 */

export interface ControlCenterProps {
  open: boolean
  onClose: () => void
}

export function ControlCenter({ open, onClose }: ControlCenterProps) {
  const wifi = useSystemStore((s) => s.wifi)
  const bluetooth = useSystemStore((s) => s.bluetooth)
  const airDrop = useSystemStore((s) => s.airDrop)
  const doNotDisturb = useSystemStore((s) => s.doNotDisturb)
  const brightness = useSystemStore((s) => s.brightness)
  const volume = useSystemStore((s) => s.volume)
  const toggleWifi = useSystemStore((s) => s.toggleWifi)
  const toggleBluetooth = useSystemStore((s) => s.toggleBluetooth)
  const toggleAirDrop = useSystemStore((s) => s.toggleAirDrop)
  const toggleDoNotDisturb = useSystemStore((s) => s.toggleDoNotDisturb)
  const setBrightness = useSystemStore((s) => s.setBrightness)
  const setVolume = useSystemStore((s) => s.setVolume)

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Click-away scrim */}
          <div
            className="fixed inset-0 z-[1999999]"
            data-testid="control-center-scrim"
            onMouseDown={onClose}
          />
          <motion.div
            className="fixed right-2 top-8 z-[2000000] w-[320px] p-3"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            style={{
              background: 'rgba(245,245,247,0.78)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '0.5px solid var(--color-glass-light-border)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-menu)',
            }}
            data-testid="control-center"
          >
            {/* Connectivity tiles */}
            <div className="grid grid-cols-2 gap-2">
              <ToggleTile
                testId="tile-wifi"
                active={wifi}
                label="Wi-Fi"
                sub={wifi ? 'On' : 'Off'}
                onClick={toggleWifi}
              >
                {wifi ? <Wifi size={18} /> : <WifiOff size={18} />}
              </ToggleTile>
              <ToggleTile
                testId="tile-bluetooth"
                active={bluetooth}
                label="Bluetooth"
                sub={bluetooth ? 'On' : 'Off'}
                onClick={toggleBluetooth}
              >
                <Bluetooth size={18} />
              </ToggleTile>
              <ToggleTile
                testId="tile-airdrop"
                active={airDrop}
                label="AirDrop"
                sub={airDrop ? 'On' : 'Off'}
                onClick={toggleAirDrop}
              >
                <Radio size={18} />
              </ToggleTile>
              <ToggleTile
                testId="tile-focus"
                active={doNotDisturb}
                label="Focus"
                sub={doNotDisturb ? 'On' : 'Off'}
                onClick={toggleDoNotDisturb}
              >
                <Moon size={18} />
              </ToggleTile>
            </div>

            {/* Brightness slider */}
            <Slider
              testId="slider-brightness"
              label="Display"
              icon={<Sun size={16} />}
              value={brightness}
              onChange={setBrightness}
            />

            {/* Volume slider */}
            <Slider
              testId="slider-volume"
              label="Sound"
              icon={volume === 0 ? <Volume1 size={16} /> : <Volume2 size={16} />}
              value={volume}
              onChange={setVolume}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ToggleTileProps {
  testId: string
  active: boolean
  label: string
  sub: string
  onClick: () => void
  children: React.ReactNode
}

function ToggleTile({
  testId,
  active,
  label,
  sub,
  onClick,
  children,
}: ToggleTileProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition"
      style={{
        background: active
          ? 'var(--color-accent-blue)'
          : 'rgba(255,255,255,0.55)',
        color: active ? 'white' : 'rgba(0,0,0,0.85)',
      }}
      data-testid={testId}
      data-active={active ? 'true' : 'false'}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/25">
        {children}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[12px] font-semibold">{label}</span>
        <span className="text-[10px] opacity-80">{sub}</span>
      </span>
    </button>
  )
}

interface SliderProps {
  testId: string
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
}

function Slider({ testId, label, icon, value, onChange }: SliderProps) {
  return (
    <div
      className="mt-2 rounded-xl p-3"
      style={{ background: 'rgba(255,255,255,0.55)' }}
      data-testid={testId}
      data-value={value}
    >
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-black/60">
        {icon}
        <span>{label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-black/15 accent-[var(--color-accent-blue)]"
        data-testid={`${testId}-input`}
        aria-label={label}
      />
    </div>
  )
}

export default ControlCenter
