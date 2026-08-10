import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

type GlassVariant = 'standard' | 'heavy' | 'bar'
type ShadowLevel = 'window' | 'window-dark' | 'panel' | 'dock' | 'menu' | 'none'

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Which blur/saturate preset to apply */
  variant?: GlassVariant
  /** Depth shadow preset */
  shadow?: ShadowLevel
  /** Whether to add the top-edge specular highlight inset shadow */
  specular?: boolean
  /** CSS border-radius value (use var(--radius-*) tokens) */
  radius?: string
  children: ReactNode
}

const glassClass: Record<GlassVariant, string> = {
  standard: 'glass-surface',
  heavy: 'glass-surface-heavy',
  bar: 'glass-surface-bar',
}

const shadowVar: Record<Exclude<ShadowLevel, 'none'>, string> = {
  window: 'var(--shadow-window)',
  'window-dark': 'var(--shadow-window-dark)',
  panel: 'var(--shadow-panel)',
  dock: 'var(--shadow-dock)',
  menu: 'var(--shadow-menu)',
}

/**
 * GlassPanel — the core Liquid Glass surface container.
 *
 * Applies real CSS `backdrop-filter` (blur + saturate) via the
 * `.glass-surface*` utility classes, a depth box-shadow, an optional
 * specular highlight inset, and squircle border-radius.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      variant = 'standard',
      shadow = 'panel',
      specular = true,
      radius = 'var(--radius-window)',
      className = '',
      children,
      style,
      ...rest
    },
    ref,
  ) => {
    const shadows: string[] = []
    if (shadow !== 'none') shadows.push(shadowVar[shadow])
    if (specular) shadows.push('var(--shadow-specular)')

    return (
      <div
        ref={ref}
        className={`${glassClass[variant]} ${className}`.trim()}
        style={{
          borderRadius: radius,
          ...(shadows.length > 0 ? { boxShadow: shadows.join(', ') } : {}),
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

GlassPanel.displayName = 'GlassPanel'
