import { createContext } from 'react'
import type { ThemeMode, TahoeTokens } from './tokens'

export interface ThemeContextValue {
  mode: ThemeMode
  tokens: TahoeTokens
  toggleMode: () => void
  setMode: (mode: ThemeMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
