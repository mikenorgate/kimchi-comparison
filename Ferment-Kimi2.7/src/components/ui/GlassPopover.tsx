import type { CSSProperties, ReactNode } from 'react'

export interface GlassPopoverProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  showArrow?: boolean
  arrowPosition?: 'top' | 'bottom' | 'left' | 'right'
  'data-testid'?: string
}

export function GlassPopover({
  children,
  className = '',
  style,
  showArrow = true,
  arrowPosition = 'top',
  'data-testid': testId,
}: GlassPopoverProps) {
  const arrowClasses = {
    top: 'absolute -top-2 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white/40',
    bottom:
      'absolute -bottom-2 left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/40',
    left: 'absolute -left-2 top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white/40',
    right:
      'absolute -right-2 top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white/40',
  }

  return (
    <div
      className={`relative tahoe-glass rounded-tahoe shadow-tahoe-popover p-3 transition-all duration-200 ease-out focus-within:shadow-tahoe-window focus-within:ring-2 focus-within:ring-tahoe-accent/30 ${className}`}
      style={style}
      data-testid={testId}
      tabIndex={-1}
    >
      {showArrow && <div className={arrowClasses[arrowPosition]} aria-hidden="true" />}
      {children}
    </div>
  )
}
