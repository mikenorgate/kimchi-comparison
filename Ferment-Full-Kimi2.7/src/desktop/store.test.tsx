import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { DesktopProvider, initialState, reducer, useDesktop } from './store'
import { clearRegistry, registerApp } from '../apps/registry'
import { Folder } from 'lucide-react'

const TestApp = () => null

describe('desktop reducer', () => {
  beforeEach(() => {
    clearRegistry()
  })

  it('opens a window', () => {
    const state = reducer(initialState, {
      type: 'OPEN_WINDOW',
      payload: { appId: 'finder', title: 'Finder', width: 800, height: 500 },
    })
    expect(state.windows).toHaveLength(1)
    expect(state.windows[0].appId).toBe('finder')
    expect(state.activeWindowId).toBe(state.windows[0].id)
    expect(state.nextZ).toBe(2)
  })

  it('focuses a window and brings it to front', () => {
    let state = reducer(initialState, { type: 'OPEN_WINDOW', payload: { appId: 'a', title: 'A', width: 100, height: 100 } })
    state = reducer(state, { type: 'OPEN_WINDOW', payload: { appId: 'b', title: 'B', width: 100, height: 100 } })
    const firstId = state.windows[0].id
    state = reducer(state, { type: 'FOCUS_WINDOW', payload: { id: firstId } })
    expect(state.activeWindowId).toBe(firstId)
    expect(state.windows[0].z).toBe(3)
  })

  it('closes a window', () => {
    let state = reducer(initialState, { type: 'OPEN_WINDOW', payload: { appId: 'a', title: 'A', width: 100, height: 100 } })
    const id = state.windows[0].id
    state = reducer(state, { type: 'CLOSE_WINDOW', payload: { id } })
    expect(state.windows).toHaveLength(0)
    expect(state.activeWindowId).toBeNull()
  })
})

describe('useDesktop', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: TestApp, defaultSize: { width: 800, height: 500 } })
  })

  it('opens a registered app window', () => {
    const { result } = renderHook(() => useDesktop(), { wrapper: DesktopProvider })
    act(() => {
      result.current.openWindow('finder')
    })
    expect(result.current.windows).toHaveLength(1)
    expect(result.current.windows[0].title).toBe('Finder')
  })

  it('focuses a window', () => {
    const { result } = renderHook(() => useDesktop(), { wrapper: DesktopProvider })
    act(() => {
      result.current.openWindow('finder')
      result.current.openWindow('finder')
    })
    const [first, second] = result.current.windows
    act(() => {
      result.current.focusWindow(first.id)
    })
    expect(result.current.activeWindowId).toBe(first.id)
    expect(result.current.windows.find((w) => w.id === first.id)?.z).toBeGreaterThan(second.z)
  })
})
