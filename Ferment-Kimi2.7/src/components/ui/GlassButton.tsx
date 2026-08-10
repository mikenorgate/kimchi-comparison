import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function GlassButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: GlassButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-1 text-xs'
      : size === 'lg'
        ? 'px-5 py-2.5 text-base'
        : 'px-3 py-1.5 text-sm'

  const variantClass =
    variant === 'primary'
      ? 'bg-tahoe-accent text-white shadow-tahoe-button hover:bg-tahoe-accent/90 hover:shadow-md'
      : variant === 'ghost'
        ? 'bg-transparent text-tahoe-text hover:bg-white/20 dark:hover:bg-white/10 active:bg-white/30 dark:active:bg-white/20'
        : 'tahoe-glass text-tahoe-text hover:brightness-110 hover:bg-tahoe-glass-hover active:brightness-95'

  return (
    <button
      className={`${base} ${sizeClass} ${variantClass} ${className}`}
      aria-disabled={props.disabled ? 'true' : undefined}
      {...props}
    >
      {children}
    </button>
  )
}
