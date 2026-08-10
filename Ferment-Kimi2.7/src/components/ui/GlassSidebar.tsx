import type { ReactNode } from 'react'

export interface GlassSidebarProps {
  children: ReactNode
  width?: number | string
  className?: string
  'data-testid'?: string
}

export function GlassSidebar({
  children,
  width = 220,
  className = '',
  'data-testid': testId,
}: GlassSidebarProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width

  return (
    <aside
      className={`tahoe-glass-strong flex flex-col h-full rounded-l-tahoe-window border-r border-white/20 dark:border-white/10 overflow-hidden transition-colors duration-200 ${className}`}
      style={{ width: widthStyle, flexShrink: 0 }}
      data-testid={testId}
    >
      {children}
    </aside>
  )
}

export interface GlassSidebarItemProps {
  children: ReactNode
  active?: boolean
  className?: string
  onClick?: () => void
  'data-testid'?: string
}

export function GlassSidebarItem({
  children,
  active = false,
  className = '',
  onClick,
  'data-testid': testId,
}: GlassSidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      data-testid={testId}
      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 active:scale-[0.98] ${
        active
          ? 'font-medium bg-white/20 dark:bg-white/15'
          : 'opacity-80 hover:bg-white/10 dark:hover:bg-white/10 hover:opacity-100 active:bg-white/15'
      } ${className}`}
    >
      {children}
    </button>
  )
}
