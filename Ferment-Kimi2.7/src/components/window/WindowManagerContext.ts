import { createContext } from 'react'
import type { WindowManagerState, WindowItem } from './windowStore'

export interface WindowManagerContextValue {
  state: WindowManagerState
  openWindow: (window: Omit<WindowItem, 'zIndex'> & { zIndex?: number }) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
}

export const WindowManagerContext = createContext<WindowManagerContextValue | null>(null)
