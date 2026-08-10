import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  OverlaysContext,
  type OverlayKind,
} from '@/lib/overlays-context'

/**
 * Manages which OS overlay is open. Only one at a time — opening a new overlay
 * replaces the current one (closing it), matching macOS behavior.
 */
export function OverlaysProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<OverlayKind | null>(null)

  const open = useCallback((kind: OverlayKind) => setActive(kind), [])
  const close = useCallback(() => setActive(null), [])
  const toggle = useCallback(
    (kind: OverlayKind) =>
      setActive((cur) => (cur === kind ? null : kind)),
    [],
  )
  const isOpen = useCallback(
    (kind: OverlayKind) => active === kind,
    [active],
  )

  const value = useMemo(
    () => ({ active, open, close, toggle, isOpen }),
    [active, open, close, toggle, isOpen],
  )

  return (
    <OverlaysContext.Provider value={value}>
      {children}
    </OverlaysContext.Provider>
  )
}
