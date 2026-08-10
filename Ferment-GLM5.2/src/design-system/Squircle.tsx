import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface SquircleProps extends HTMLAttributes<HTMLDivElement> {
  /** CSS border-radius value — defaults to the Tahoe window radius */
  radius?: string
  children: ReactNode
}

/**
 * Squircle — a container that applies Tahoe's signature large border-radius.
 *
 * CSS `border-radius` approximates the squircle (superellipse) shape that
 * Apple uses. For pixel-perfect squircles an SVG mask approach would be
 * needed, but border-radius is the pragmatic cross-browser solution and
 * is visually indistinguishable at typical UI sizes.
 */
export const Squircle = forwardRef<HTMLDivElement, SquircleProps>(
  ({ radius = 'var(--radius-window)', className = '', children, style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          borderRadius: radius,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

Squircle.displayName = 'Squircle'
