import { create } from 'zustand'

/**
 * Window manager store — the backbone of the Tahoe windowing system.
 *
 * Owns the ordered set of open windows and exposes the classic
 * open/close/focus/minimize/restore/zoom(zoom) geometry + z-order
 * operations. Components read window state and dispatch actions here.
 *
 * Z-ordering is a monotonic counter: focusing or opening a window assigns
 * it zCounter+1, guaranteeing the most-recently-interacted window is on top.
 */

export interface WindowBounds {
  x: number
  y: number
  w: number
  h: number
}

export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  w: number
  h: number
  zIndex: number
  isMinimized: boolean
  isFocused: boolean
  isMaximized: boolean
  /** Saved geometry to restore after un-zooming. */
  restoreBounds?: WindowBounds
}

interface OpenOptions {
  appId: string
  title: string
  bounds: WindowBounds
}

interface WindowStore {
  windows: WindowState[]
  zCounter: number
  open: (opts: OpenOptions) => string
  close: (id: string) => void
  focus: (id: string) => void
  minimize: (id: string) => void
  restore: (id: string) => void
  toggleMaximize: (id: string) => void
  setBounds: (id: string, bounds: Partial<WindowBounds>) => void
}

let idCounter = 0
const nextId = () => `win-${++idCounter}`

/** Pick the topmost (highest z) non-minimized window, or undefined. */
function topmostVisible(windows: WindowState[]): WindowState | undefined {
  return [...windows]
    .filter((w) => !w.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  zCounter: 10,

  open: ({ appId, title, bounds }) => {
    const id = nextId()
    const z = get().zCounter + 1
    const win: WindowState = {
      id,
      appId,
      title,
      x: bounds.x,
      y: bounds.y,
      w: bounds.w,
      h: bounds.h,
      zIndex: z,
      isMinimized: false,
      isFocused: true,
      isMaximized: false,
    }
    set((s) => ({
      zCounter: z,
      windows: [...s.windows.map((w) => ({ ...w, isFocused: false })), win],
    }))
    return id
  },

  close: (id) =>
    set((s) => {
      const windows = s.windows.filter((w) => w.id !== id)
      const top = topmostVisible(windows)
      return {
        windows: windows.map((w) => ({ ...w, isFocused: w.id === top?.id })),
      }
    }),

  focus: (id) =>
    set((s) => {
      const z = s.zCounter + 1
      return {
        zCounter: z,
        windows: s.windows.map((w) =>
          w.id === id
            ? { ...w, isFocused: true, isMinimized: false, zIndex: z }
            : { ...w, isFocused: false },
        ),
      }
    }),

  minimize: (id) =>
    set((s) => {
      const windows = s.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w,
      )
      const top = topmostVisible(windows)
      return {
        windows: windows.map((w) => ({ ...w, isFocused: w.id === top?.id })),
      }
    }),

  restore: (id) =>
    set((s) => {
      const z = s.zCounter + 1
      return {
        zCounter: z,
        windows: s.windows.map((w) =>
          w.id === id
            ? { ...w, isMinimized: false, isFocused: true, zIndex: z }
            : { ...w, isFocused: false },
        ),
      }
    }),

  toggleMaximize: (id) =>
    set((s) => {
      const z = s.zCounter + 1
      return {
        zCounter: z,
        windows: s.windows.map((w) => {
          if (w.id !== id) return { ...w, isFocused: false }
          if (w.isMaximized) {
            // un-zoom: restore saved geometry
            const r = w.restoreBounds
            return r
              ? {
                  ...w,
                  ...r,
                  isMaximized: false,
                  isFocused: true,
                  zIndex: z,
                  restoreBounds: undefined,
                }
              : { ...w, isMaximized: false, isFocused: true, zIndex: z }
          }
          // zoom: save current geometry, mark maximized
          return {
            ...w,
            restoreBounds: { x: w.x, y: w.y, w: w.w, h: w.h },
            isMaximized: true,
            isFocused: true,
            zIndex: z,
          }
        }),
      }
    }),

  setBounds: (id, bounds) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, ...bounds } : w,
      ),
    })),
}))
