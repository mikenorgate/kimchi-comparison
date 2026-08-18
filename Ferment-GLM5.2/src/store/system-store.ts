import { create } from 'zustand'

export interface SystemSettings {
  wifi: boolean
  bluetooth: boolean
  airdrop: boolean
  brightness: number // 0-100
  volume: number // 0-100
  doNotDisturb: boolean
}

interface SystemStore extends SystemSettings {
  setWifi: (on: boolean) => void
  setBluetooth: (on: boolean) => void
  setAirdrop: (on: boolean) => void
  setBrightness: (v: number) => void
  setVolume: (v: number) => void
  setDoNotDisturb: (on: boolean) => void
}

const SETTINGS_KEY = 'tahoe.system-settings'

function loadSettings(): SystemSettings {
  const defaults: SystemSettings = {
    wifi: true,
    bluetooth: true,
    airdrop: false,
    brightness: 80,
    volume: 60,
    doNotDisturb: false,
  }
  if (typeof window === 'undefined') return defaults
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY)
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
  } catch {
    return defaults
  }
}

function persistSettings(s: SystemSettings) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

const initial = loadSettings()

export const useSystemStore = create<SystemStore>((set, get) => ({
  ...initial,
  setWifi: (wifi) => {
    set({ wifi })
    persistSettings({ ...get(), wifi })
  },
  setBluetooth: (bluetooth) => {
    set({ bluetooth })
    persistSettings({ ...get(), bluetooth })
  },
  setAirdrop: (airdrop) => {
    set({ airdrop })
    persistSettings({ ...get(), airdrop })
  },
  setBrightness: (brightness) => {
    set({ brightness })
    persistSettings({ ...get(), brightness })
  },
  setVolume: (volume) => {
    set({ volume })
    persistSettings({ ...get(), volume })
  },
  setDoNotDisturb: (doNotDisturb) => {
    set({ doNotDisturb })
    persistSettings({ ...get(), doNotDisturb })
  },
}))
