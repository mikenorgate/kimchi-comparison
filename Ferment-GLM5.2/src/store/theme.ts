import { create } from 'zustand'
import { useEffect, useState } from 'react'
import { readPersistent, writePersistent } from '../hooks/usePersistentState'
import type { WallpaperName } from '../lib/wallpapers'

/**
 * Theme store — the user's appearance preferences, persisted to localStorage.
 *
 * - appearance: 'light' | 'dark' | 'auto' (auto follows the OS via
 *   prefers-color-scheme; resolved by useResolvedAppearance)
 * - accent: one of the Tahoe accent colors, mapped to a hex applied as the
 *   `--accent` CSS variable on the document root
 * - iconStyle: 'tinted' (colorful) | 'clear' (monochrome) — applies a CSS
 *   filter to Dock icons
 * - wallpaper: which bundled gradient wallpaper the desktop shows
 *
 * Persistence is handled with readPersistent/writePersistent (the same
 * primitives backing usePersistentState) so the theme survives reloads
 * without a second persistence mechanism.
 */

export type Appearance = 'light' | 'dark' | 'auto'
export type AccentColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'graphite'
export type IconStyle = 'tinted' | 'clear'
export type ResolvedAppearance = 'light' | 'dark'

export interface ThemeState {
  appearance: Appearance
  accent: AccentColor
  iconStyle: IconStyle
  wallpaper: WallpaperName
  setAppearance: (a: Appearance) => void
  setAccent: (a: AccentColor) => void
  setIconStyle: (s: IconStyle) => void
  setWallpaper: (w: WallpaperName) => void
}

const STORAGE_KEY = 'tahoe.theme'

export const ACCENT_HEX: Record<AccentColor, string> = {
  blue: '#0a84ff',
  purple: '#bf5af2',
  pink: '#ff375f',
  red: '#ff453a',
  orange: '#ff9f0a',
  yellow: '#ffd60a',
  green: '#30d158',
  graphite: '#8e8e93',
}

export function accentHex(a: AccentColor): string {
  return ACCENT_HEX[a]
}

export const ACCENT_COLORS = Object.keys(ACCENT_HEX) as AccentColor[]

const persisted = readPersistent<Partial<ThemeState>>(STORAGE_KEY, {})

export const useThemeStore = create<ThemeState>((set) => ({
  appearance: persisted.appearance ?? 'auto',
  accent: persisted.accent ?? 'blue',
  iconStyle: persisted.iconStyle ?? 'tinted',
  wallpaper: persisted.wallpaper ?? 'tahoe',
  setAppearance: (appearance) => set({ appearance }),
  setAccent: (accent) => set({ accent }),
  setIconStyle: (iconStyle) => set({ iconStyle }),
  setWallpaper: (wallpaper) => set({ wallpaper }),
}))

// Persist the user-facing fields whenever they change.
useThemeStore.subscribe((state) => {
  writePersistent(STORAGE_KEY, {
    appearance: state.appearance,
    accent: state.accent,
    iconStyle: state.iconStyle,
    wallpaper: state.wallpaper,
  })
})

/** Tracks the OS dark-mode preference via matchMedia (light when unsupported). */
export function usePrefersDark(): boolean {
  const [dark, setDark] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  )
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
      return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return dark
}

/** Resolves 'auto' to the concrete light/dark using the OS preference. */
export function useResolvedAppearance(): ResolvedAppearance {
  const appearance = useThemeStore((s) => s.appearance)
  const prefersDark = usePrefersDark()
  if (appearance === 'auto') return prefersDark ? 'dark' : 'light'
  return appearance
}

// Dev-only test hook: exposes the store's getState/setState so Playwright can
// drive appearance changes before the System Settings UI ships (later phase).
// Stripped from production builds via import.meta.env.DEV.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const w = window as unknown as { __tahoeTheme?: typeof useThemeStore }
  w.__tahoeTheme = useThemeStore
}
