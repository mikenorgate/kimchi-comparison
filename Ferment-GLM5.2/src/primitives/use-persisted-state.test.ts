import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePersistedState, persistedStore, clearPersistedState } from './use-persisted-state'

describe('usePersistedState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => usePersistedState('test.key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('persists value to localStorage on change', () => {
    const { result } = renderHook(() => usePersistedState('test.persist', 'init'))
    act(() => {
      result.current[1]('updated')
    })
    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(localStorage.getItem('test.persist')!)).toBe('updated')
  })

  it('restores value from localStorage on remount', () => {
    localStorage.setItem('test.restore', JSON.stringify('saved-value'))
    const { result } = renderHook(() => usePersistedState('test.restore', 'default'))
    expect(result.current[0]).toBe('saved-value')
  })

  it('handles objects via JSON serialization', () => {
    const initial = { name: 'a', count: 1 }
    const { result } = renderHook(() => usePersistedState('test.obj', initial))
    act(() => {
      result.current[1]({ name: 'b', count: 2 })
    })
    expect(JSON.parse(localStorage.getItem('test.obj')!)).toEqual({ name: 'b', count: 2 })
  })

  it('survives a page reload simulation (re-read from localStorage)', () => {
    const { result, unmount } = renderHook(() => usePersistedState('test.reload', 'v1'))
    act(() => {
      result.current[1]('v2')
    })
    unmount()
    // Simulate reload: new hook instance reads from localStorage
    const { result: result2 } = renderHook(() => usePersistedState('test.reload', 'v1'))
    expect(result2.current[0]).toBe('v2')
  })

  it('falls back to initial value on corrupted JSON', () => {
    localStorage.setItem('test.corrupt', '{invalid json')
    const { result } = renderHook(() => usePersistedState('test.corrupt', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('supports functional state updates', () => {
    const { result } = renderHook(() => usePersistedState('test.fn', 5))
    act(() => {
      result.current[1]((prev: number) => prev + 3)
    })
    expect(result.current[0]).toBe(8)
  })
})

describe('persistedStore (imperative API)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('get returns fallback when key absent', () => {
    expect(persistedStore.get('absent', 'fb')).toBe('fb')
  })

  it('set then get round-trips a value', () => {
    persistedStore.set('rt', { x: 1 })
    expect(persistedStore.get('rt', null)).toEqual({ x: 1 })
  })

  it('remove deletes a key', () => {
    persistedStore.set('rm', 'val')
    persistedStore.remove('rm')
    expect(localStorage.getItem('rm')).toBeNull()
  })

  it('clearPersistedState clears all keys', () => {
    persistedStore.set('a', 1)
    persistedStore.set('b', 2)
    clearPersistedState()
    expect(localStorage.length).toBe(0)
  })
})
