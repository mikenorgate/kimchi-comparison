import type { CSSProperties, ReactNode } from 'react'

export type GlassPanelVariant = 'default' | 'strong' | 'tinted'

export interface GlassPanelProps {
  children: ReactNode
  variant?: GlassPanelVariant
  hoverable?: boolean
  className?: string
  style?: CSSProperties
  'data-testid'?: string
}

export function GlassPanel({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  style,
  'data-testid': testId,
}: GlassPanelProps) {
  const isStrong = variant === 'strong'
  const glassClass = isStrong ? 'tahoe-glass-strong' : 'tahoe-glass'
  const radiusShadow = 'rounded-tahoe shadow-tahoe-popover'
  const hoverClass = hoverable ? 'transition-all duration-200 ease-out hover:shadow-tahoe-window hover:brightness-105 focus-within:brightness-105' : ''
  const tintedStyle: CSSProperties = variant === 'tinted' ? { backgroundColor: 'var(--tahoe-glass-tint)' } : {}
  const glassStyle: CSSProperties = {
    backdropFilter: isStrong ? 'blur(36px) saturate(200%)' : 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: isStrong ? 'blur(36px) saturate(200%)' : 'blur(24px) saturate(180%)',
  }

  return (
    <div
      className={`${glassClass} ${radiusShadow} ${hoverClass} ${className}`}
      style={{ ...glassStyle, ...tintedStyle, ...style }}
      data-testid={testId}
    >
      {children}
    </div>
  )
}
