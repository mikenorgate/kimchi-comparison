import type { DockApp } from '@/lib/app-registry'

/**
 * SF-style app icon: a rounded-square gradient tile with a centered glyph.
 * Sized by `size` (px). Used by the Dock and (later) Launchpad.
 */
export function AppIcon({ app, size = 52 }: { app: DockApp; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: app.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.5),
        lineHeight: 1,
        boxShadow:
          'inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.2)',
        userSelect: 'none',
      }}
    >
      <span style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }}>
        {app.glyph}
      </span>
    </div>
  )
}
