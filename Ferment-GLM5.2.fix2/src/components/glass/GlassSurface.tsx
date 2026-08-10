import type { CSSProperties, ReactNode } from 'react'

/**
 * Liquid Glass surface.
 *
 * A translucent material that reflects and refracts its surroundings via
 * backdrop-filter (blur + saturate), layered with a tinted fill, a specular
 * top-edge highlight, and a diagonal sheen. Mirrors macOS Tahoe's
 * "Liquid Glass" material in a CSS approximation.
 *
 * Under `.reduce-transparency` (set by ThemeProvider), the CSS variables
 * resolve to near-opaque flat surfaces automatically — no JS branching needed.
 *
 * Variants:
 *   - regular:   standard translucent panel (menus, popovers)
 *   - prominent: stronger tint (Dock, Control Center)
 *   - vibrant:   highest opacity (selected states, sheets)
 *
 * Optional `tint="accent"` renders an accent-tinted glass.
 */
export type GlassVariant = 'regular' | 'prominent' | 'vibrant'

export interface GlassSurfaceProps {
  children?: ReactNode
  variant?: GlassVariant
  tint?: 'accent' | 'none'
  className?: string
  style?: CSSProperties
  /** Render as a different element (default div). */
  as?: 'div' | 'section' | 'aside' | 'nav' | 'header' | 'ul'
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  role?: string
  ariaLabel?: string
}

const VARIANT_BG: Record<GlassVariant, string> = {
  regular: 'var(--glass-bg-regular)',
  prominent: 'var(--glass-bg-prominent)',
  vibrant: 'var(--glass-bg-vibrant)',
}

export function GlassSurface({
  children,
  variant = 'regular',
  tint = 'none',
  className,
  style,
  as = 'div',
  onClick,
  role,
  ariaLabel,
}: GlassSurfaceProps) {
  const Tag = as as 'div'
  const bg = VARIANT_BG[variant]
  const accentFill =
    tint === 'accent' ? `rgba(var(--accent-rgb), 0.18)` : 'transparent'

  const mergedStyle: CSSProperties = {
    position: 'relative',
    backgroundColor: bg,
    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
    WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
    border: `0.5px solid var(--glass-border)`,
    boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
    borderRadius: '14px',
    overflow: 'hidden',
    color: 'var(--text-on-glass)',
    ...style,
  }

  return (
    <Tag
      className={className}
      style={mergedStyle}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
    >
      {/* Tint layer */}
      {tint === 'accent' && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: accentFill,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Specular sheen */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--glass-sheen)',
          pointerEvents: 'none',
          borderRadius: 'inherit',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </Tag>
  )
}
