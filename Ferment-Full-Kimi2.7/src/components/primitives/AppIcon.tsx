import { type LucideIcon } from 'lucide-react'

export interface AppIconProps {
  icon: LucideIcon
  label?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  running?: boolean
  active?: boolean
  onClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

const sizeClasses: Record<NonNullable<AppIconProps['size']>, string> = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

export function AppIcon({
  icon: Icon,
  label,
  color = 'bg-gradient-to-br from-tahoe-accent to-tahoe-teal',
  size = 'md',
  running = false,
  active = false,
  onClick,
  onContextMenu,
}: AppIconProps) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="group flex flex-col items-center gap-1 focus:outline-none"
      aria-label={label}
    >
      <div
        className={`
          ${sizeClasses[size]} ${color}
          rounded-2xl flex items-center justify-center text-white shadow-lg
          transition-transform duration-150 group-hover:scale-105 group-active:scale-95
          ${active ? 'ring-2 ring-white/60' : ''}
        `}
      >
        <Icon size={size === 'lg' ? 32 : size === 'md' ? 24 : 20} strokeWidth={1.5} />
      </div>
      {running && (
        <div data-testid="running-indicator" className="w-1 h-1 rounded-full bg-tahoe-text-secondary mt-0.5" />
      )}
    </button>
  )
}
