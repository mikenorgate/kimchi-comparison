import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Show the specular top-edge gradient */
  specular?: boolean
}

/**
 * Toolbar — a top toolbar bar with Liquid Glass treatment.
 *
 * Uses the bar variant of backdrop-filter (slightly stronger blur)
 * plus a subtle chrome gradient. Typically sits at the top of a window
 * or panel.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, specular = true, className = '', style, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'glass-surface-bar',
          'flex items-center gap-2 px-3 h-11',
          'border-b border-black/5 dark:border-white/5',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          backgroundImage: specular
            ? 'var(--gradient-chrome-bar)'
            : undefined,
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    )
  },
)

Toolbar.displayName = 'Toolbar'
