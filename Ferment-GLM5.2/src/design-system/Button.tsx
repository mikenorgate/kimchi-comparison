import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0a84ff] text-white hover:bg-[#0a6fff] active:bg-[#0050cc] shadow-sm',
  secondary:
    'glass-surface text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-white/10',
  ghost:
    'bg-transparent text-gray-900 dark:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10',
  destructive:
    'bg-[#ff453a] text-white hover:bg-[#ff375f] active:bg-[#d70015] shadow-sm',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs rounded-md',
  md: 'px-3 py-1.5 text-sm rounded-lg',
  lg: 'px-4 py-2 text-base rounded-lg',
}

/**
 * Button — glass-styled button with Tahoe variants.
 *
 * `secondary` uses the glass surface treatment (backdrop-filter).
 * `primary` / `destructive` use solid accent colors.
 * `ghost` is transparent with hover feedback.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          'inline-flex items-center justify-center font-medium',
          'transition-colors duration-150 select-none outline-none',
          variantClass[variant],
          sizeClass[size],
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
