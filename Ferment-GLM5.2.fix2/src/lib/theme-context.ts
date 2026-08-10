import { createContext, useContext } from 'react'

export type ThemeMode = 'light' | 'dark'
export type AccentColor =
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'orange'
  | 'green'
  | 'graphite'

export interface ThemeState {
  mode: ThemeMode
  accent: AccentColor
  reduceTransparency: boolean
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
  setReduceTransparency: (v: boolean) => void
  toggleMode: () => void
}

export const ThemeContext = createContext<ThemeState | null>(null)

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
