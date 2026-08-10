import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ThemeContext,
  type AccentColor,
  type ThemeMode,
  type ThemeState,
} from '@/lib/theme-context'

const DEFAULT_MODE: ThemeMode =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
const DEFAULT_ACCENT: AccentColor = 'blue'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_MODE)
  const [accent, setAccent] = useState<AccentColor>(DEFAULT_ACCENT)
  const [reduceTransparency, setReduceTransparency] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
  }, [accent])

  useEffect(() => {
    document.documentElement.classList.toggle(
      'reduce-transparency',
      reduceTransparency,
    )
  }, [reduceTransparency])

  const value = useMemo<ThemeState>(
    () => ({
      mode,
      accent,
      reduceTransparency,
      setMode,
      setAccent,
      setReduceTransparency,
      toggleMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode, accent, reduceTransparency],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
