import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Sidebar width in CSS units */
  width?: string
  /** Show the specular top-edge gradient */
  specular?: boolean
}

/**
 * Sidebar — a glass side panel (Tahoe floating/inset sidebar style).
 *
 * Uses the standard glass surface treatment with a chrome gradient
 * and a right border separator. Typically holds navigation items.
 */
export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  (
    { children, width = 'var(--width-sidebar-default)', specular = true, className = '', style, ...rest },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={[
          'glass-surface',
          'flex flex-col gap-1 p-2 overflow-y-auto',
          'border-r border-black/5 dark:border-white/5',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          width,
          minWidth: 'var(--min-width-sidebar)',
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

Sidebar.displayName = 'Sidebar'
