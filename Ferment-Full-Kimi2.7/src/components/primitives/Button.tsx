import { type ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'toolbar'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center rounded-tahoe-sm font-tahoe transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-tahoe-accent/40 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary: 'bg-tahoe-accent text-white hover:bg-tahoe-accent-hover shadow-sm',
      secondary: 'bg-tahoe-glass-strong text-tahoe-text hover:bg-white/80 border border-tahoe-border',
      ghost: 'bg-transparent text-tahoe-text hover:bg-black/5',
      toolbar: 'bg-transparent text-tahoe-text hover:bg-black/10 rounded-tahoe-xs',
    }

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-6 px-2 text-xs',
      md: 'h-8 px-3 text-sm',
      lg: 'h-10 px-4 text-base',
      icon: 'h-7 w-7 p-1',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
