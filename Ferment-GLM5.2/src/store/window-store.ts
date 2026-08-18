import { create } from 'zustand'

export interface WindowState {
  id: string
  appId: string
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isMinimized: boolean
  isMaximized: boolean
  // Pre-maximize geometry to restore
  prevRect?: { x: number; y: number; width: number; height: number }
}

interface WindowStore {
  windows: WindowState[]
  focusedId: string | null
  topZ: number
  openWindow: (appId: string, title: string, opts?: Partial<Omit<WindowState, 'id' | 'appId' | 'title'>>) => string
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
  restoreWindow: (id: string) => void
  getWindow: (id: string) => WindowState | undefined
}

let idCounter = 0
const nextId = () => `win-${++idCounter}`

const DEFAULT_WIDTH = 720
const DEFAULT_HEIGHT = 480

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedId: null,
  topZ: 10,

  openWindow: (appId, title, opts) => {
    const id = nextId()
    const topZ = get().topZ + 1
    const win: WindowState = {
      id,
      appId,
      title,
      x: opts?.x ?? 120 + (get().windows.length % 5) * 30,
      y: opts?.y ?? 80 + (get().windows.length % 5) * 30,
      width: opts?.width ?? DEFAULT_WIDTH,
      height: opts?.height ?? DEFAULT_HEIGHT,
      zIndex: topZ,
      isMinimized: false,
      isMaximized: opts?.isMaximized ?? false,
    }
    set((s) => ({
      windows: [...s.windows, win],
      focusedId: id,
      topZ,
    }))
    return id
  },

  closeWindow: (id) =>
    set((s) => ({
      windows: s.windows.filter((w) => w.id !== id),
      focusedId: s.focusedId === id ? null : s.focusedId,
    })),

  minimizeWindow: (id) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      focusedId: s.focusedId === id ? null : s.focusedId,
    }))
  },

  restoreWindow: (id) => {
    const topZ = get().topZ + 1
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: topZ } : w
      ),
      focusedId: id,
      topZ,
    }))
  },

  toggleMaximize: (id) => {
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w
        if (w.isMaximized) {
          const r = w.prevRect ?? { x: 120, y: 80, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
          return { ...w, isMaximized: false, x: r.x, y: r.y, width: r.width, height: r.height, prevRect: undefined }
        }
        return {
          ...w,
          isMaximized: true,
          prevRect: { x: w.x, y: w.y, width: w.width, height: w.height },
        }
      }),
    }))
    get().focusWindow(id)
  },

  focusWindow: (id) => {
    const topZ = get().topZ + 1
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, zIndex: topZ, isMinimized: false } : w
      ),
      focusedId: id,
      topZ,
    }))
  },

  moveWindow: (id, x, y) =>
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),

  resizeWindow: (id, width, height) =>
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),

  getWindow: (id) => get().windows.find((w) => w.id === id),
}))
