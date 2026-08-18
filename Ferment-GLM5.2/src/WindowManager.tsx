import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { APP_REGISTRY } from './apps/registry'
import Calculator from './apps/calculator/Calculator'
import Notes from './apps/notes/Notes'
import Calendar from './apps/calendar/Calendar'
import Finder from './apps/finder/Finder'
import Safari from './apps/safari/Safari'
import Mail from './apps/mail/Mail'
import Terminal from './apps/terminal/Terminal'
import SystemSettings from './apps/settings/SystemSettings'

export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
}

interface WindowManagerContextValue {
  windows: WindowState[]
  openApp: (appId: string) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, w: number, h: number, x?: number, y?: number) => void
}

const WindowManagerContext = createContext<WindowManagerContextValue | null>(null)

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider')
  return ctx
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([])

  const openApp = useCallback((appId: string) => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__lastOpenApp = appId
    }

    setWindows(prev => {
      const nextZ = prev.length > 0 ? Math.max(...prev.map(w => w.z)) + 1 : 1
      const existing = prev.find(w => w.appId === appId)
      if (existing) {
        return prev.map(w =>
          w.id === existing.id
            ? { ...w, minimized: false, z: nextZ }
            : w
        )
      }
      const appConfig = APP_REGISTRY.find(a => a.id === appId)
      const id = `win-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const offset = (prev.length % 5) * 30
      return [...prev, {
        id,
        appId,
        title: appConfig?.name ?? appId,
        x: 120 + offset,
        y: 60 + offset,
        w: appConfig?.defaultWidth ?? 600,
        h: appConfig?.defaultHeight ?? 400,
        z: nextZ,
        minimized: false,
      }]
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
  }, [])

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const nextZ = prev.length > 0 ? Math.max(...prev.map(w => w.z)) + 1 : 1
      return prev.map(w => w.id === id ? { ...w, z: nextZ } : w)
    })
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w))
  }, [])

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev => {
      const nextZ = prev.length > 0 ? Math.max(...prev.map(w => w.z)) + 1 : 1
      return prev.map(w => w.id === id ? { ...w, minimized: false, z: nextZ } : w)
    })
  }, [])

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w))
  }, [])

  const resizeWindow = useCallback((id: string, w: number, h: number, x?: number, y?: number) => {
    setWindows(prev => prev.map(win =>
      win.id === id ? { ...win, w, h, x: x ?? win.x, y: y ?? win.y } : win
    ))
  }, [])

  return (
    <WindowManagerContext.Provider value={{
      windows, openApp, closeWindow, focusWindow, minimizeWindow, restoreWindow, moveWindow, resizeWindow
    }}>
      {children}
    </WindowManagerContext.Provider>
  )
}

/** Renders the actual app component for a given appId */
export function AppContent({ appId }: { appId: string }) {
  switch (appId) {
    case 'calculator': return <Calculator />
    case 'notes': return <Notes />
    case 'calendar': return <Calendar />
    case 'finder': return <Finder />
    case 'safari': return <Safari />
    case 'mail': return <Mail />
    case 'terminal': return <Terminal />
    case 'settings': return <SystemSettings />
    default:
      return (
        <div style={{ padding: '24px', color: 'white', height: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            {APP_REGISTRY.find(a => a.id === appId)?.name ?? appId}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            This app is not yet implemented.
          </p>
        </div>
      )
  }
}
