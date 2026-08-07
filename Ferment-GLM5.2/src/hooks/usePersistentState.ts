import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Persistence primitives over localStorage.
 *
 * `readPersistent` / `writePersistent` are plain functions usable outside
 * React (e.g. by Zustand stores); `usePersistentState` is the React hook
 * counterpart for component/app state (notes, events, etc. in later phases).
 *
 * All access is guarded for environments without `window` (SSR / tests) and
 * swallows quota / serialization errors so a corrupt entry never crashes the
 * shell — it falls back to the provided default.
 */

export function readPersistent<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writePersistent<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota / private-mode errors
  }
}

export function usePersistentState<T>(
  key: string,
  initial: T | (() => T),
): [T, (v: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    const init =
      typeof initial === 'function' ? (initial as () => T)() : initial
    return readPersistent(key, init)
  })

  // Keep the key current if it changes between renders.
  const keyRef = useRef(key)
  keyRef.current = key

  // Persist on every change.
  useEffect(() => {
    writePersistent(keyRef.current, state)
  }, [state])

  const set = useCallback((v: T | ((prev: T) => T)) => {
    setState((prev) =>
      typeof v === 'function' ? (v as (p: T) => T)(prev) : v,
    )
  }, [])

  return [state, set]
}

export default usePersistentState
