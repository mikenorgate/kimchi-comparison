import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'

/**
 * useState that persists to localStorage. Survives page reloads.
 * Serializes via JSON. SSR-safe (no-op when window undefined).
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // quota exceeded or serialization error — silently ignore
    }
  }, [key, state])

  return [state, setState]
}

/**
 * Imperative read/write helpers for non-hook contexts (stores, utilities).
 */
export const persistedStore = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore
    }
  },
  remove(key: string): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  },
}

/**
 * Clear all persisted state (used in tests).
 */
export function clearPersistedState(): void {
  if (typeof window !== 'undefined') window.localStorage.clear()
}
