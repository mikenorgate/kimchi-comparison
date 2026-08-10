import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { SystemContext } from '@/lib/system-context'

/**
 * Ambient system state for Control Center.
 *
 * Brightness (0..100) is rendered as a full-screen dark overlay whose opacity
 * scales with how far below 100 it is — dimming the whole desktop. Volume is
 * in-session only (no audio output wired). Toggles flip connectivity booleans.
 */
export function SystemProvider({ children }: { children: ReactNode }) {
  const [brightness, setBrightness] = useState(90)
  const [volume, setVolume] = useState(65)
  const [wifi, setWifi] = useState(true)
  const [bluetooth, setBluetooth] = useState(true)
  const [airdrop, setAirdrop] = useState(false)
  const [focus, setFocus] = useState(false)

  const toggleWifi = useCallback(() => setWifi((v) => !v), [])
  const toggleBluetooth = useCallback(() => setBluetooth((v) => !v), [])
  const toggleAirdrop = useCallback(() => setAirdrop((v) => !v), [])
  const toggleFocus = useCallback(() => setFocus((v) => !v), [])

  const value = useMemo(
    () => ({
      brightness,
      volume,
      wifi,
      bluetooth,
      airdrop,
      focus,
      setBrightness,
      setVolume,
      toggleWifi,
      toggleBluetooth,
      toggleAirdrop,
      toggleFocus,
    }),
    [
      brightness,
      volume,
      wifi,
      bluetooth,
      airdrop,
      focus,
      toggleWifi,
      toggleBluetooth,
      toggleAirdrop,
      toggleFocus,
    ],
  )

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>
}
