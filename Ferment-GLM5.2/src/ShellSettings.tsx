import { createContext, useContext, useState, type ReactNode } from 'react'

export interface ShellSettings {
  darkMode: boolean
  wallpaper: string
  dockMagnification: boolean
  dockIconSize: 'S' | 'M' | 'L'
}

export interface ShellSettingsContextValue extends ShellSettings {
  setDarkMode: (v: boolean) => void
  setWallpaper: (v: string) => void
  setDockMagnification: (v: boolean) => void
  setDockIconSize: (v: 'S' | 'M' | 'L') => void
}

const DEFAULT_WALLPAPER = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #1a1a2e 100%)'

const ShellSettingsContext = createContext<ShellSettingsContextValue | null>(null)

export function useShellSettings() {
  const ctx = useContext(ShellSettingsContext)
  if (!ctx) throw new Error('useShellSettings must be used within ShellSettingsProvider')
  return ctx
}

export function ShellSettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true)
  const [wallpaper, setWallpaper] = useState(DEFAULT_WALLPAPER)
  const [dockMagnification, setDockMagnification] = useState(true)
  const [dockIconSize, setDockIconSize] = useState<'S' | 'M' | 'L'>('M')

  return (
    <ShellSettingsContext.Provider value={{
      darkMode, wallpaper, dockMagnification, dockIconSize,
      setDarkMode, setWallpaper, setDockMagnification, setDockIconSize,
    }}>
      {children}
    </ShellSettingsContext.Provider>
  )
}
