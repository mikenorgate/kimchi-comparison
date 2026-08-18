import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

export interface WallpaperDef {
  id: string
  name: string
  colors: [string, string, string]
}

export const WALLPAPERS: WallpaperDef[] = [
  { id: 'tahoe', name: 'Tahoe', colors: ['#4a90d9', '#7b5fc4', '#d96aaa'] },
  { id: 'sunrise', name: 'Sunrise', colors: ['#ff6e7f', '#ff9a44', '#ffd194'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0093E9', '#80D0C7', '#e0f7fa'] },
  { id: 'forest', name: 'Forest', colors: ['#134e5e', '#3a7d44', '#71b280'] },
  { id: 'mono', name: 'Mono', colors: ['#232526', '#414345', '#414345'] },
  { id: 'sunset', name: 'Sunset', colors: ['#355c7d', '#6c5b7b', '#c06c84'] },
]

export const ACCENT_COLORS = ['#0a84ff', '#ff453a', '#30d158', '#ffd60a', '#bf5af2', '#ff9f0a']

interface ThemeState {
  mode: ThemeMode
  accent: string
  wallpaperId: string
  setMode: (mode: ThemeMode) => void
  toggle: () => void
  setAccent: (color: string) => void
  setWallpaper: (id: string) => void
}

const STORED_MODE = typeof window !== 'undefined' ? localStorage.getItem('tahoe.theme') : null
const initialMode: ThemeMode = STORED_MODE === 'dark' || STORED_MODE === 'light' ? STORED_MODE : 'light'
const STORED_ACCENT = typeof window !== 'undefined' ? localStorage.getItem('tahoe.accent') : null
const initialAccent = STORED_ACCENT ?? '#0a84ff'
const STORED_WALLPAPER = typeof window !== 'undefined' ? localStorage.getItem('tahoe.wallpaper') : null
const initialWallpaper = STORED_WALLPAPER ?? 'tahoe'

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,
  accent: initialAccent,
  wallpaperId: initialWallpaper,
  setMode: (mode) => {
    localStorage.setItem('tahoe.theme', mode)
    set({ mode })
  },
  toggle: () => {
    const next = get().mode === 'light' ? 'dark' : 'light'
    localStorage.setItem('tahoe.theme', next)
    set({ mode: next })
  },
  setAccent: (accent) => {
    localStorage.setItem('tahoe.accent', accent)
    set({ accent })
  },
  setWallpaper: (wallpaperId) => {
    localStorage.setItem('tahoe.wallpaper', wallpaperId)
    set({ wallpaperId })
  },
}))
