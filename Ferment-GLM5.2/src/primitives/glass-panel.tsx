import { type ReactNode, type CSSProperties } from 'react'

export interface GlassPanelProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** Stronger opacity variant for content-heavy panels */
  strong?: boolean
  /** HTML element to render as */
  as?: 'div' | 'section' | 'nav' | 'aside' | 'header' | 'footer'
}

/**
 * Liquid Glass panel primitive.
 * Renders a translucent surface with backdrop-filter blur,
 * specular highlight (top gradient), and border glow.
 * The visual treatment is defined by the `.glass-panel` CSS class
 * in index.css; this component is the typed React wrapper.
 */
export function GlassPanel({
  children,
  className = '',
  style,
  strong = false,
  as = 'div',
}: GlassPanelProps) {
  const Tag = as
  const classes = `glass-panel${strong ? ' glass-strong' : ''}${className ? ` ${className}` : ''}`
  return (
    <Tag className={classes} style={style} data-testid="glass-panel">
      {children}
    </Tag>
  )
}
