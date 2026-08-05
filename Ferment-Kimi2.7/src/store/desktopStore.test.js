import { describe, it, expect, beforeEach } from 'vitest'
import { useDesktopStore } from './desktopStore'
import { APP_IDS } from '../data/apps'

describe('desktopStore', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('loads built-in apps', () => {
    const apps = useDesktopStore.getState().apps
    expect(apps.length).toBeGreaterThan(0)
    expect(apps.some((app) => app.id === APP_IDS.FINDER)).toBe(true)
  })

  it('opens a window when openApp is called', () => {
    useDesktopStore.getState().openApp(APP_IDS.CALCULATOR)
    const state = useDesktopStore.getState()
    expect(state.windows).toHaveLength(1)
    expect(state.windows[0].appId).toBe(APP_IDS.CALCULATOR)
    expect(state.activeWindowId).toBe(state.windows[0].id)
  })

  it('focuses a window and brings it to front', () => {
    const { openApp, focusWindow } = useDesktopStore.getState()
    openApp(APP_IDS.CALCULATOR)
    openApp(APP_IDS.NOTES)

    const firstWindow = useDesktopStore.getState().windows[0]
    focusWindow(firstWindow.id)

    const state = useDesktopStore.getState()
    expect(state.activeWindowId).toBe(firstWindow.id)
    expect(state.windows[0].zIndex).toBeGreaterThan(state.windows[1].zIndex)
  })

  it('closes a window and updates active window', () => {
    const { openApp, closeWindow } = useDesktopStore.getState()
    openApp(APP_IDS.CALCULATOR)
    openApp(APP_IDS.NOTES)

    const firstWindow = useDesktopStore.getState().windows[0]
    closeWindow(firstWindow.id)

    const state = useDesktopStore.getState()
    expect(state.windows).toHaveLength(1)
    expect(state.activeWindowId).toBe(state.windows[0].id)
  })

  it('minimizes a window and clears active window', () => {
    const { openApp, minimizeWindow } = useDesktopStore.getState()
    openApp(APP_IDS.CALCULATOR)
    const windowId = useDesktopStore.getState().windows[0].id

    minimizeWindow(windowId)

    const state = useDesktopStore.getState()
    expect(state.windows[0].minimized).toBe(true)
    expect(state.activeWindowId).toBeNull()
  })

  it('moves and resizes a window', () => {
    const { openApp, moveWindow, resizeWindow } = useDesktopStore.getState()
    openApp(APP_IDS.CALCULATOR)
    const windowId = useDesktopStore.getState().windows[0].id

    moveWindow(windowId, 50, 60)
    resizeWindow(windowId, 300, 400)

    const w = useDesktopStore.getState().windows[0]
    expect(w.x).toBe(50)
    expect(w.y).toBe(60)
    expect(w.width).toBe(300)
    expect(w.height).toBe(400)
  })

  it('returns the active app from the active window', () => {
    const { openApp } = useDesktopStore.getState()
    openApp(APP_IDS.NOTES)
    const activeApp = useDesktopStore.getState().getActiveApp()
    expect(activeApp.id).toBe(APP_IDS.NOTES)
  })
})
