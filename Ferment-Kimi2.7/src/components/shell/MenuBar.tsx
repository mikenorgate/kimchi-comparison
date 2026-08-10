import { useTheme } from '../../theme'

interface MenuBarProps {
  currentApp?: string
  onSpotlightClick?: () => void
  onControlCenterClick?: () => void
}

const menuItems = ['File', 'Edit', 'View', 'Go', 'Window', 'Help']

export function MenuBar({
  currentApp = 'Finder',
  onSpotlightClick,
  onControlCenterClick,
}: MenuBarProps) {
  const { mode } = useTheme()
  const textColor = mode === 'dark' ? 'text-white/90' : 'text-black/90'

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  const now = new Date()

  return (
    <div
      className={`absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-sm ${textColor} z-[9999] transition-colors duration-300`}
      style={{
        background: mode === 'dark' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.35)'}`,
      }}
    >
      <div className="flex items-center gap-4">
        <button className="hover:bg-white/20 hover:dark:bg-black/30 rounded px-1 transition-colors" aria-label="Apple menu">
          <svg width="14" height="17" viewBox="0 0 14 17" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.28 2.8c.33-.42.55-.98.55-1.55 0-.08 0-.15-.02-.22-.52.02-1.15.35-1.52.78-.3.36-.58.92-.58 1.49 0 .09.02.17.02.2.04.01.1.01.15.01.47 0 1.06-.31 1.4-.71zm.88 1.58c-.73-.04-1.36.42-1.82.42-.47 0-1.16-.4-1.86-.4-1.35.02-2.64.82-3.35 2.08-.67 1.26-.56 3.02.28 4.6.5.9 1.18 1.91 2.05 1.91.8-.01 1.1-.52 2.03-.52.96 0 1.2.52 1.98.5 1.06-.02 1.78-.98 2.3-1.92.3-.54.42-.9.65-1.48-1.77-.53-2.2-2.88-2.15-4.18.02-1.14.73-2.06 1.38-2.4-.08-.24-.34-.4-.49-.61z" />
          </svg>
        </button>
        <span className="font-semibold">{currentApp}</span>
        {menuItems.map((item) => (
          <button
            key={item}
            className="hidden md:block hover:bg-white/20 hover:dark:bg-black/30 rounded px-2 py-0.5 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          className="hover:bg-white/20 hover:dark:bg-black/30 rounded p-1 transition-colors"
          aria-label="Spotlight"
          onClick={onSpotlightClick}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.7422 10.3439C12.5329 9.2673 13 7.9382 13 6.5C13 2.91015 10.0899 0 6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C7.9382 13 9.2673 12.5329 10.3439 11.7422L14.1464 15.1464C14.3417 15.3417 14.6583 15.3417 14.8536 15.1464L15.1464 14.8536C15.3417 14.6583 15.3417 14.3417 15.1464 14.1464L11.7422 10.3439ZM6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 8.98528 8.98528 11 6.5 11Z" />
          </svg>
        </button>
        <button
          className="hover:bg-white/20 hover:dark:bg-black/30 rounded p-1 transition-colors"
          aria-label="Control Center"
          onClick={onControlCenterClick}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8C0 12.42 3.58 16 8 16C12.42 16 16 12.42 16 8C16 3.58 12.42 0 8 0ZM8 2C11.31 2 14 4.69 14 8C14 11.31 11.31 14 8 14C4.69 14 2 11.31 2 8C2 4.69 4.69 2 8 2ZM8 4C5.79 4 4 5.79 4 8C4 10.21 5.79 12 8 12C10.21 12 12 10.21 12 8C12 5.79 10.21 4 8 4ZM8 6C9.1 6 10 6.9 10 8C10 9.1 9.1 10 8 10C6.9 10 6 9.1 6 8C6 6.9 6.9 6 8 6Z" />
          </svg>
        </button>
        <span className="hidden sm:block tabular-nums">{formatDate(now)} {formatTime(now)}</span>
      </div>
    </div>
  )
}
