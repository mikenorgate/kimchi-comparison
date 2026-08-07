import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

/**
 * StatusBar — the right-hand side of the menu bar.
 *
 * Carries the Spotlight trigger, the Control Center trigger, and a live
 * clock. Both triggers toggle their respective panels; the active state is
 * reflected so the icon can show a pressed look.
 */
export interface StatusBarProps {
  onToggleSpotlight: () => void
  onToggleControlCenter: () => void
  spotlightOpen: boolean
  controlCenterOpen: boolean
}

function formatClock(d: Date): string {
  const day = d.toLocaleDateString('en-US', { weekday: 'short' })
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${day} ${h}:${m} ${ampm}`
}

export function StatusBar({
  onToggleSpotlight,
  onToggleControlCenter,
  spotlightOpen,
  controlCenterOpen,
}: StatusBarProps) {
  const [now, setNow] = useState(() => formatClock(new Date()))

  useEffect(() => {
    const id = setInterval(() => setNow(formatClock(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  const btn =
    'grid h-6 w-6 place-items-center rounded hover:bg-white/15 transition'

  return (
    <div className="flex items-center gap-1" data-testid="status-bar">
      <button
        type="button"
        className={`${btn} ${spotlightOpen ? 'bg-white/20' : ''}`}
        data-testid="spotlight-trigger"
        aria-label="Spotlight"
        onClick={onToggleSpotlight}
      >
        <Search size={15} />
      </button>
      <button
        type="button"
        className={`${btn} ${controlCenterOpen ? 'bg-white/20' : ''}`}
        data-testid="control-center-trigger"
        aria-label="Control Center"
        onClick={onToggleControlCenter}
      >
        <SlidersHorizontal size={15} />
      </button>
      <span
        className="ml-1 text-[13px] tabular-nums text-white/90"
        data-testid="clock"
      >
        {now}
      </span>
    </div>
  )
}

export default StatusBar
