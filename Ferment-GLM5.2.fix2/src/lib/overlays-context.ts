import { createContext, useContext } from 'react'

/**
 * Which OS overlay (if any) is currently open.
 *
 * Only one overlay is open at a time — opening one closes the others (matches
 * macOS behavior where e.g. opening Spotlight dismisses Launchpad).
 */
export type OverlayKind =
  | 'spotlight'
  | 'control-center'
  | 'launchpad'
  | 'mission-control'
  | 'notification-center'

export interface OverlaysState {
  active: OverlayKind | null
  /** Open the given overlay (closing any other that is open). */
  open: (kind: OverlayKind) => void
  close: () => void
  toggle: (kind: OverlayKind) => void
  isOpen: (kind: OverlayKind) => boolean
}

export const OverlaysContext = createContext<OverlaysState | null>(null)

export function useOverlays(): OverlaysState {
  const ctx = useContext(OverlaysContext)
  if (!ctx) throw new Error('useOverlays must be used within an OverlaysProvider')
  return ctx
}
