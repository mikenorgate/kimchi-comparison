import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface DockProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  /** Tahoe Dock is a heavily-rounded, vibrantly-frosted light glass capsule. */
  variant?: 'light' | 'dark'
  testId?: string
}

/**
 * Dock — Tahoe-style desktop Dock surface.
 *
 * A wide, short capsule of Liquid Glass anchored to the bottom of the screen.
 * Built directly (rather than via GlassPanel) so it owns its capsule shape,
 * stronger blur, and a brighter specular sheen characteristic of the Dock.
 * Step 4 adds app icons, running indicators, and hover magnification; this
 * step provides the visual container.
 */
export function Dock({
  children,
  className,
  style,
  variant = 'light',
  testId,
}: DockProps) {
  const isDark = variant === 'dark'
  const dockStyle: CSSProperties = {
    background: isDark
      ? 'rgba(28, 28, 30, 0.45)'
      : 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(40px) saturate(200%)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%)',
    border: `0.5px solid ${
      isDark ? 'var(--color-glass-dark-border)' : 'var(--color-glass-light-border)'
    }`,
    borderRadius: 'var(--radius-3xl)',
    boxShadow: 'var(--shadow-dock)',
    backgroundImage:
      'linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0) 45%)',
    ...style,
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2',
        className,
      )}
      style={dockStyle}
      data-testid={testId}
      data-dock="true"
      data-variant={variant}
    >
      {children}
    </div>
  )
}

export default Dock
