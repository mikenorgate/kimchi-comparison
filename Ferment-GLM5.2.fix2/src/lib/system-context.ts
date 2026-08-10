import { createContext, useContext } from 'react'

/**
 * System-level hardware state (Brightness, Volume, connectivity toggles).
 *
 * These are ambient OS controls surfaced in Control Center. Brightness and
 * Volume are sliders (0..100); the toggles are boolean on/off.
 */
export interface SystemState {
  brightness: number
  volume: number
  wifi: boolean
  bluetooth: boolean
  airdrop: boolean
  focus: boolean
  setBrightness: (v: number) => void
  setVolume: (v: number) => void
  toggleWifi: () => void
  toggleBluetooth: () => void
  toggleAirdrop: () => void
  toggleFocus: () => void
}

export const SystemContext = createContext<SystemState | null>(null)

export function useSystem(): SystemState {
  const ctx = useContext(SystemContext)
  if (!ctx) throw new Error('useSystem must be used within a SystemProvider')
  return ctx
}
