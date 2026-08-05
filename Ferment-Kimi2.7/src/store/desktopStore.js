import { create } from 'zustand'
import { BUILT_IN_APPS, getAppById } from '../data/apps'

let windowIdCounter = 0
let zIndexCounter = 100

function nextWindowId() {
  windowIdCounter += 1
  return `win-${windowIdCounter}`
}

function nextZIndex() {
  zIndexCounter += 1
  return zIndexCounter
}

function getDefaultWindowPosition(app, openWindows) {
  const base = app.defaultPosition || { x: 120, y: 80 }
  const offset = openWindows.length * 24
  return {
    x: base.x + offset,
    y: base.y + offset,
  }
}

export const useDesktopStore = create((set, get) => ({
  apps: BUILT_IN_APPS,
  windows: [],
  activeWindowId: null,

  openApp: (appId) => {
    const app = getAppById(appId)
    if (!app) return

    const state = get()
    const position = getDefaultWindowPosition(app, state.windows)
    const id = nextWindowId()
    const zIndex = nextZIndex()

    const newWindow = {
      id,
      appId,
      title: app.name,
      x: position.x,
      y: position.y,
      width: app.defaultSize?.width ?? 480,
      height: app.defaultSize?.height ?? 320,
      minimized: false,
      zIndex,
    }

    set({
      windows: [...state.windows, newWindow],
      activeWindowId: id,
    })
  },

  closeWindow: (windowId) => {
    set((state) => {
      const remaining = state.windows.filter((w) => w.id !== windowId)
      const nextActive =
        state.activeWindowId === windowId
          ? remaining.length > 0
            ? remaining[remaining.length - 1].id
            : null
          : state.activeWindowId
      return { windows: remaining, activeWindowId: nextActive }
    })
  },

  focusWindow: (windowId) => {
    set((state) => {
      const target = state.windows.find((w) => w.id === windowId)
      if (!target) return {}

      return {
        activeWindowId: windowId,
        windows: state.windows.map((w) =>
          w.id === windowId ? { ...w, minimized: false, zIndex: nextZIndex() } : w
        ),
      }
    })
  },

  minimizeWindow: (windowId) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, minimized: true } : w
      ),
      activeWindowId:
        state.activeWindowId === windowId ? null : state.activeWindowId,
    }))
  },

  moveWindow: (windowId, x, y) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === windowId ? { ...w, x, y } : w)),
    }))
  },

  resizeWindow: (windowId, width, height) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, width, height } : w
      ),
    }))
  },

  getActiveWindow: () => {
    const state = get()
    return state.windows.find((w) => w.id === state.activeWindowId) || null
  },

  getActiveApp: () => {
    const state = get()
    const activeWindow = state.windows.find((w) => w.id === state.activeWindowId)
    return activeWindow ? getAppById(activeWindow.appId) : null
  },
}))

export default useDesktopStore
