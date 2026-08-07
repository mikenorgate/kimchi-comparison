import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { readPersistent, usePersistentState } from './usePersistentState'

/**
 * usePersistentState — the localStorage-backed state primitive used by app
 * data in later phases. Asserts on localStorage contents and returned state
 * (NOT getComputedStyle — these are plain JS values).
 */
describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => usePersistentState('k', 5))
    expect(result.current[0]).toBe(5)
  })

  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => usePersistentState('count', 0))
    act(() => result.current[1](7))
    expect(result.current[0]).toBe(7)
    expect(readPersistent('count', 0)).toBe(7)
  })

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem('name', JSON.stringify('Ada'))
    const { result } = renderHook(() => usePersistentState('name', ''))
    expect(result.current[0]).toBe('Ada')
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => usePersistentState('n', 10))
    act(() => result.current[1]((p) => p + 5))
    expect(result.current[0]).toBe(15)
    expect(readPersistent('n', 0)).toBe(15)
  })

  it('falls back to default when stored value is corrupt', () => {
    localStorage.setItem('bad', '{not json')
    const { result } = renderHook(() => usePersistentState('bad', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })
})
