import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  WindowsContext,
  type OpenWindowOptions,
  type WindowRect,
  type WindowState,
  type WindowsState,
} from '@/lib/windows-context'
import { useOs } from '@/lib/os-context'

const DEFAULT_W = 720
const DEFAULT_H = 480
const MIN_W = 320
const MIN_H = 200
const TOPBAR_H = 28
const DOCK_H = 90

let zCounter = 100
let idCounter = 0

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

/**
 * Window manager store. Holds the open windows and exposes the operations the
 * Dock, Launchpad/Spotlight, and Window chrome need. On focus, calls
 * `os.setActiveAppId` so the menu bar re-titles to the focused app.
 */
export function WindowsProvider({ children }: { children: ReactNode }) {
  const os = useOs()
  const [windows, setWindows] = useState<WindowState[]>([])
  const [focusedId, setFocusedId] = useState<string | null>(null)

  // Mirror windows in a ref so callbacks can read current state without
  // stale closures — and crucially so setWindows updaters stay PURE (no
  // side effects inside the updater, which StrictMode double-invokes in dev).
  const windowsRef = useRef(windows)
  useEffect(() => {
    windowsRef.current = windows
  }, [windows])

  const focusWindow = useCallback(
    (id: string) => {
      const target = windowsRef.current.find((w) => w.id === id)
      if (!target) return
      zCounter += 1
      const newZ = zCounter
      // Pure updater — no side effects inside.
      setWindows((ws) =>
        ws.map((w) =>
          w.id === id ? { ...w, z: newZ, minimized: false } : w,
        ),
      )
      // Side effects OUTSIDE the updater.
      os.setActiveAppId(target.appId)
      setFocusedId(id)
    },
    [os],
  )

  const openWindow = useCallback(
    (opts: OpenWindowOptions): string => {
      const id = `win-${++idCounter}`
      const w = opts.width ?? DEFAULT_W
      const h = opts.height ?? DEFAULT_H
      const vw = window.innerWidth
      const vh = window.innerHeight
      const win: WindowState = {
        id,
        appId: opts.appId,
        title: opts.title,
        x: opts.x ?? Math.max(40, (vw - w) / 2 + (idCounter % 5) * 28),
        y: opts.y ?? Math.max(TOPBAR_H + 20, (vh - h) / 2 - 20 + (idCounter % 5) * 22),
        width: w,
        height: h,
        z: ++zCounter,
        minimized: false,
        maximized: false,
      }
      setWindows((ws) => [...ws, win])
      setFocusedId(id)
      os.setActiveAppId(opts.appId)
      return id
    },
    [os],
  )

  const closeWindow = useCallback((id: string) => {
    const remaining = windowsRef.current.filter((w) => w.id !== id)
    if (remaining.length > 0) {
      const top = [...remaining].sort((a, b) => b.z - a.z)[0]
      zCounter += 1
      const newZ = zCounter
      // Pure updater.
      setWindows(remaining.map((w) => (w.id === top.id ? { ...w, z: newZ } : w)))
      // Side effects outside.
      os.setActiveAppId(top.appId)
      setFocusedId(top.id)
    } else {
      setWindows(remaining)
      setFocusedId(null)
    }
  }, [os])

  const minimizeWindow = useCallback(
    (id: string) => {
      setWindows((ws) =>
        ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      )
      setFocusedId((cur) => (cur === id ? null : cur))
    },
    [],
  )

  const restoreWindow = useCallback(
    (id: string) => {
      focusWindow(id)
    },
    [focusWindow],
  )

  const toggleMaximize = useCallback((id: string) => {
    setWindows((ws) =>
      ws.map((w) => {
        if (w.id !== id) return w
        if (w.maximized) {
          // Restore.
          const r = w.restoreRect ?? { x: 80, y: TOPBAR_H + 30, width: DEFAULT_W, height: DEFAULT_H }
          return { ...w, maximized: false, ...r, restoreRect: undefined }
        }
        // Maximize (below menu bar, above Dock).
        return {
          ...w,
          maximized: true,
          restoreRect: { x: w.x, y: w.y, width: w.width, height: w.height },
          x: 0,
          y: TOPBAR_H,
          width: window.innerWidth,
          height: window.innerHeight - TOPBAR_H - DOCK_H,
        }
      }),
    )
  }, [])

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id
          ? { ...w, x: clamp(x, -w.width + 80, window.innerWidth - 80), y: clamp(y, TOPBAR_H, window.innerHeight - 40) }
          : w,
      ),
    )
  }, [])

  const resizeWindow = useCallback((id: string, rect: WindowRect) => {
    setWindows((ws) =>
      ws.map((w) =>
        w.id === id
          ? {
              ...w,
              x: rect.x,
              y: clamp(rect.y, TOPBAR_H, window.innerHeight - 40),
              width: Math.max(MIN_W, rect.width),
              height: Math.max(MIN_H, rect.height),
            }
          : w,
      ),
    )
  }, [])

  const isWindowOpen = useCallback(
    (appId: string) => windows.some((w) => w.appId === appId),
    [windows],
  )

  const value = useMemo<WindowsState>(
    () => ({
      windows,
      focusedId,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      toggleMaximize,
      moveWindow,
      resizeWindow,
      isWindowOpen,
    }),
    [
      windows,
      focusedId,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      restoreWindow,
      toggleMaximize,
      moveWindow,
      resizeWindow,
      isWindowOpen,
    ],
  )

  return <WindowsContext.Provider value={value}>{children}</WindowsContext.Provider>
}
