import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getThemeTokens, type ThemeMode, type TahoeTokens } from './tokens'

interface ThemeContextValue {
  mode: ThemeMode
  tokens: TahoeTokens
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children, initialMode = 'light' }: { children: ReactNode; initialMode?: ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode)
  const tokens = useMemo(() => getThemeTokens(mode), [mode])

  useEffect(() => {
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [mode])

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      tokens,
      toggleMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
      setMode,
    }),
    [mode, tokens],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
