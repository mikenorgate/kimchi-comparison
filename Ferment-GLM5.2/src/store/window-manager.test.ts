import { describe, it, expect, beforeEach } from 'vitest'
import { useWindowStore } from './window-manager'

const BOUNDS = { x: 0, y: 0, w: 100, h: 100 }

describe('window manager store', () => {
  beforeEach(() => {
    useWindowStore.setState({ windows: [], zCounter: 10 })
  })

  it('opens a focused window with an ascending z-index', () => {
    const { open } = useWindowStore.getState()
    const id1 = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    const id2 = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    const { windows } = useWindowStore.getState()
    const w1 = windows.find((w) => w.id === id1)!
    const w2 = windows.find((w) => w.id === id2)!
    expect(w1.isFocused).toBe(false)
    expect(w2.isFocused).toBe(true)
    expect(w2.zIndex).toBeGreaterThan(w1.zIndex)
  })

  it('close removes the window', () => {
    const { open, close } = useWindowStore.getState()
    const id = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    close(id)
    expect(useWindowStore.getState().windows).toHaveLength(0)
  })

  it('minimize hides a window and focuses the next topmost', () => {
    const { open, minimize } = useWindowStore.getState()
    const a = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    const b = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    minimize(b)
    const { windows } = useWindowStore.getState()
    const bw = windows.find((w) => w.id === b)!
    const aw = windows.find((w) => w.id === a)!
    expect(bw.isMinimized).toBe(true)
    expect(bw.isFocused).toBe(false)
    expect(aw.isFocused).toBe(true)
  })

  it('focus raises the z-index above all others', () => {
    const { open, focus } = useWindowStore.getState()
    const a = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    const b = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    const before = useWindowStore.getState().windows.find((w) => w.id === a)!.zIndex
    focus(a)
    const s = useWindowStore.getState()
    const after = s.windows.find((w) => w.id === a)!.zIndex
    const bZ = s.windows.find((w) => w.id === b)!.zIndex
    expect(after).toBeGreaterThan(before)
    expect(after).toBeGreaterThan(bZ)
    expect(s.windows.find((w) => w.id === b)!.isFocused).toBe(false)
  })

  it('setBounds updates geometry partially', () => {
    const { open, setBounds } = useWindowStore.getState()
    const id = open({ appId: 'test', title: 'T', bounds: BOUNDS })
    setBounds(id, { x: 50, w: 200 })
    const w = useWindowStore.getState().windows.find((x) => x.id === id)!
    expect(w.x).toBe(50)
    expect(w.y).toBe(0)
    expect(w.w).toBe(200)
    expect(w.h).toBe(100)
  })

  it('toggleMaximize saves and restores bounds', () => {
    const { open, toggleMaximize } = useWindowStore.getState()
    const id = open({ appId: 'test', title: 'T', bounds: { x: 10, y: 20, w: 100, h: 100 } })
    toggleMaximize(id)
    let w = useWindowStore.getState().windows.find((x) => x.id === id)!
    expect(w.isMaximized).toBe(true)
    expect(w.restoreBounds).toEqual({ x: 10, y: 20, w: 100, h: 100 })
    toggleMaximize(id)
    w = useWindowStore.getState().windows.find((x) => x.id === id)!
    expect(w.isMaximized).toBe(false)
    expect(w.restoreBounds).toBeUndefined()
    expect(w.x).toBe(10)
    expect(w.w).toBe(100)
  })
})
