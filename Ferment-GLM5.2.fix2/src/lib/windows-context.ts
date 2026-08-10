import { createContext, useContext } from 'react'

export interface WindowRect {
  x: number
  y: number
  width: number
  height: number
}

export interface WindowState extends WindowRect {
  id: string
  appId: string
  title: string
  z: number
  minimized: boolean
  maximized: boolean
  /** Saved rect for restoring from maximize. */
  restoreRect?: WindowRect
}

export interface OpenWindowOptions extends Partial<WindowRect> {
  appId: string
  title: string
  minWidth?: number
  minHeight?: number
}

export interface WindowsState {
  windows: WindowState[]
  focusedId: string | null
  openWindow: (opts: OpenWindowOptions) => string
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, rect: WindowRect) => void
  isWindowOpen: (appId: string) => boolean
}

export const WindowsContext = createContext<WindowsState | null>(null)

export function useWindows(): WindowsState {
  const ctx = useContext(WindowsContext)
  if (!ctx) throw new Error('useWindows must be used within a WindowsProvider')
  return ctx
}
