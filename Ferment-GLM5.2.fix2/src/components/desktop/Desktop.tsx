import type { ReactNode } from 'react'

/**
 * Desktop layer — full-screen wallpaper background that sits behind the menu
 * bar, Dock, and windows. In Phase 3 the wallpaper choice will come from
 * System Settings; for now a CSS gradient derived from the theme tokens.
 */
export function Desktop({ children }: { children?: ReactNode }) {
  return (
    <div className="desktop-surface" style={{ position: 'fixed', inset: 0 }}>
      {children}
    </div>
  )
}
