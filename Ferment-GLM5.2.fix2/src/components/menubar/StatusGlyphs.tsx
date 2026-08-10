/** Lightweight status-bar glyphs (battery, wifi, control-center, spotlight). */
export function BatteryIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 10) / 16} viewBox="0 0 16 10" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="13" height="9" rx="2.2" stroke="currentColor" opacity="0.5" />
      <rect x="2" y="2" width="9" height="6" rx="1" fill="currentColor" />
      <rect x="14" y="3.2" width="1.4" height="3.6" rx="0.7" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

export function WifiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 12) / 16} viewBox="0 0 16 12" fill="currentColor" aria-hidden>
      <path d="M8 10.5a1.1 1.1 0 100-2.2 1.1 1.1 0 000 2.2z" />
      <path d="M8 7.2a3 3 0 012.1.9l1-1A4.5 4.5 0 008 5.8 4.5 4.5 0 004.9 7.1l1 1A3 3 0 018 7.2z" opacity="0.9" />
      <path d="M8 4a5.8 5.8 0 014.1 1.7l1-1A7.3 7.3 0 008 2.5 7.3 7.3 0 002.9 4.7l1 1A5.8 5.8 0 018 4z" opacity="0.6" />
    </svg>
  )
}

export function SpotlightIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function ControlCenterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="3.5" width="6" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="8.5" y="9.5" width="6" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6.5" cy="5" r="1.1" fill="currentColor" />
      <circle cx="11.5" cy="11" r="1.1" fill="currentColor" />
    </svg>
  )
}
