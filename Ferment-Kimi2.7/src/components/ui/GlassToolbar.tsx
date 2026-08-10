import type { ReactNode } from 'react'

export interface GlassToolbarProps {
  children: ReactNode
  className?: string
  'data-testid'?: string
}

export function GlassToolbar({
  children,
  className = '',
  'data-testid': testId,
}: GlassToolbarProps) {
  return (
    <div
      className={`tahoe-glass flex items-center gap-2 px-3 py-2 rounded-tahoe shadow-tahoe-button transition-all duration-200 ease-out hover:shadow-md focus-within:shadow-md ${className}`}
      data-testid={testId}
    >
      {children}
    </div>
  )
}
