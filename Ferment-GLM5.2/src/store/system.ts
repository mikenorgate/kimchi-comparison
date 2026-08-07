import { create } from 'zustand'

/**
 * System state store — the mutable system settings surfaced by Control
 * Center: connectivity (Wi-Fi/Bluetooth/AirDrop), focus (Do Not Disturb),
 * and display/audio levels (Brightness/Volume).
 *
 * Step 6 wraps this in localStorage persistence; here the store is the
 * single source of truth that Control Center mutates and other shell
 * surfaces may read (e.g. the menu bar can show a Wi-Fi glyph later).
 */

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))

export interface SystemState {
  wifi: boolean
  bluetooth: boolean
  airDrop: boolean
  doNotDisturb: boolean
  brightness: number // 0-100
  volume: number // 0-100
  toggleWifi: () => void
  toggleBluetooth: () => void
  toggleAirDrop: () => void
  toggleDoNotDisturb: () => void
  setBrightness: (v: number) => void
  setVolume: (v: number) => void
}

export const useSystemStore = create<SystemState>((set) => ({
  wifi: true,
  bluetooth: true,
  airDrop: false,
  doNotDisturb: false,
  brightness: 80,
  volume: 60,
  toggleWifi: () => set((s) => ({ wifi: !s.wifi })),
  toggleBluetooth: () => set((s) => ({ bluetooth: !s.bluetooth })),
  toggleAirDrop: () => set((s) => ({ airDrop: !s.airDrop })),
  toggleDoNotDisturb: () => set((s) => ({ doNotDisturb: !s.doNotDisturb })),
  setBrightness: (v) => set({ brightness: clamp(v) }),
  setVolume: (v) => set({ volume: clamp(v) }),
}))
