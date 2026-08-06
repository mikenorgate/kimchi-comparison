import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Liquid Glass material variant.
 * - light: frosted light glass (default for light-mode sidebars/toolbars)
 * - dark: frosted dark glass
 */
export type GlassVariant = 'light' | 'dark'

/** Radius presets mapped to the Tahoe @theme tokens in index.css. */
export type GlassRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'

/** Shadow presets mapped to the Tahoe @theme tokens. */
export type GlassShadow = 'none' | 'window' | 'dock' | 'menu'

const RADIUS_VAR: Record<GlassRadius, string> = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  '3xl': 'var(--radius-3xl)',
}

const SHADOW_VAR: Record<GlassShadow, string> = {
  none: 'none',
  window: 'var(--shadow-window)',
  dock: 'var(--shadow-dock)',
  menu: 'var(--shadow-menu)',
}

export interface GlassPanelProps {
  children?: ReactNode
  variant?: GlassVariant
  radius?: GlassRadius
  shadow?: GlassShadow
  /** Blur amount in px (default 30 — Tahoe's perceptible-but-soft blur). */
  blur?: number
  /** Saturation percentage for the backdrop filter (default 180). */
  saturate?: number
  /** Extra translucency over the base tint (0-1). Higher = more opaque. */
  opacity?: number
  className?: string
  style?: CSSProperties
  /** Rendered element (default div). */
  as?: 'div' | 'aside' | 'header' | 'footer' | 'section' | 'nav'
  /** Accessibility/test id. */
  testId?: string
}

/**
 * GlassPanel — the foundational Liquid Glass surface.
 *
 * Tahoe's Liquid Glass reflects and refracts what's underneath. In CSS we
 * approximate that with:
 *   - backdrop-filter: blur() saturate() (refraction + vibrancy)
 *   - a semi-translucent background tint (the "glass" layer)
 *   - a 0.5px specular top-edge highlight (the light catching the rim)
 *   - a soft outer shadow for depth separation
 *
 * The menu bar is intentionally NOT built on GlassPanel — Tahoe's menu bar
 * is fully transparent (see <MenuBar/>).
 */
export function GlassPanel({
  children,
  variant = 'light',
  radius = 'lg',
  shadow = 'window',
  blur = 30,
  saturate = 180,
  opacity = 0.55,
  className,
  style,
  as = 'div',
  testId,
}: GlassPanelProps) {
  const isDark = variant === 'dark'
  const Tag = as

  const glassStyle: CSSProperties = {
    background: isDark
      ? `rgba(28, 28, 30, ${opacity})`
      : `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturate}%)`,
    border: `0.5px solid ${
      isDark ? 'var(--color-glass-dark-border)' : 'var(--color-glass-light-border)'
    }`,
    borderRadius: RADIUS_VAR[radius],
    boxShadow: SHADOW_VAR[shadow],
    // Specular top-edge highlight: a thin gradient inset that catches light,
    // approximating the Liquid Glass specular rim.
    backgroundImage:
      'linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0) 40%)',
    ...style,
  }

  return (
    <Tag
      className={cn('relative', className)}
      style={glassStyle}
      data-testid={testId}
      data-glass="true"
      data-variant={variant}
    >
      {children}
    </Tag>
  )
}

export default GlassPanel
