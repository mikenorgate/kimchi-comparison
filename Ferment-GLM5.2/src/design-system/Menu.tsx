import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type MouseEventHandler,
} from 'react'

// ── MenuItem ──────────────────────────────────────────────────────

export interface MenuItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Display label (required unless separator is true) */
  label?: string
  /** Optional SF Symbol-style icon (React node) */
  icon?: ReactNode
  /** Optional keyboard shortcut display (e.g. "⌘C") */
  shortcut?: string
  /** Render as a separator line (ignores label/icon/shortcut) */
  separator?: boolean
  /** Disabled items show greyed out and are not clickable */
  disabled?: boolean
  /** Click handler */
  onClick?: MouseEventHandler<HTMLLIElement>
}

/**
 * MenuItem — a single row in a macOS-style dropdown menu.
 *
 * Supports label, optional icon, keyboard shortcut display, separator
 * lines, and disabled state.
 */
export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
  (
    { label, icon, shortcut, separator = false, disabled = false, onClick, className = '', ...rest },
    ref,
  ) => {
    if (separator) {
      return (
        <li
          ref={ref}
          role="separator"
          className="my-1 h-px bg-black/10 dark:bg-white/10"
          {...rest}
        />
      )
    }

    return (
      <li
        ref={ref}
        role="menuitem"
        onClick={disabled ? undefined : onClick}
        aria-disabled={disabled}
        className={[
          'flex items-center gap-2 px-3 py-1 text-sm rounded-md',
          'transition-colors duration-100',
          disabled
            ? 'opacity-40 cursor-default'
            : 'cursor-pointer hover:bg-[#0a84ff] hover:text-white',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {icon && <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span>}
        <span className="flex-1">{label}</span>
        {shortcut && (
          <span className="text-xs opacity-60 ml-4">{shortcut}</span>
        )}
      </li>
    )
  },
)

MenuItem.displayName = 'MenuItem'

// ── Menu ──────────────────────────────────────────────────────────

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Menu — a macOS-style dropdown menu container.
 *
 * Renders a glass-surface panel with the standard menu shadow and
 * rounded corners. Contains a list of MenuItem children.
 */
export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ children, className = '', ...rest }, ref) => {
    return (
      <div
        ref={ref}
        role="menu"
        className={[
          'glass-surface-bar',
          'bg-white/70 dark:bg-gray-800/70',
          'rounded-menu shadow-menu',
          'py-1 px-1 min-w-[200px]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          boxShadow: 'var(--shadow-menu), var(--shadow-specular)',
        }}
        {...rest}
      >
        <ul className="list-none m-0 p-0">{children}</ul>
      </div>
    )
  },
)

Menu.displayName = 'Menu'
