import { type ReactNode } from 'react'

export interface AppIconProps {
  /** Icon name — matches a key in the icon registry */
  name: string
  /** Pixel size of the icon tile (default 64) */
  size?: number
  className?: string
}

/**
 * SVG icon registry — hand-built SVGs in Apple's visual style.
 * Each entry renders a rounded-square app tile with a distinct glyph.
 * These are original SVGs, not Apple's copyrighted assets.
 */
const ICON_REGISTRY: Record<string, ReactNode> = {
  finder: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="finder-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ab8ff" />
          <stop offset="100%" stopColor="#2a7fff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#finder-bg)" />
      <path d="M32 14 L32 50 M32 28 Q26 22 22 28" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M32 28 Q38 22 42 28" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#fefeb8" />
      <line x1="14" y1="22" x2="50" y2="22" stroke="#e0c040" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="32" x2="50" y2="32" stroke="#e0c040" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="42" x2="40" y2="42" stroke="#e0c040" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  reminders: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#f5f5f0" />
      <circle cx="22" cy="24" r="5" fill="#ff3b30" />
      <line x1="32" y1="24" x2="50" y2="24" stroke="#888" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="40" r="5" fill="none" stroke="#ccc" strokeWidth="2" />
      <line x1="32" y1="40" x2="50" y2="40" stroke="#888" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="white" />
      <rect width="64" height="16" rx="14" fill="#ff3b30" />
      <rect y="8" width="64" height="8" fill="#ff3b30" />
      <text x="32" y="46" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1a1a1a" fontFamily="Helvetica">17</text>
    </svg>
  ),
  calculator: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#1a1a1a" />
      <rect x="12" y="10" width="40" height="14" rx="3" fill="#333" />
      <text x="48" y="21" textAnchor="end" fontSize="11" fill="#fff" fontFamily="Helvetica">0</text>
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect key={`${row}-${col}`} x={12 + col * 11} y={30 + row * 9} width="8" height="6" rx="2" fill="#555" />
        ))
      )}
      <rect x="45" y="30" width="8" height="6" rx="2" fill="#ff9f0a" />
      <rect x="45" y="39" width="8" height="6" rx="2" fill="#ff9f0a" />
      <rect x="45" y="48" width="8" height="6" rx="2" fill="#ff9f0a" />
    </svg>
  ),
  textedit: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#e8e8e8" />
      <path d="M16 18 L48 18 M16 28 L48 28 M16 38 L38 38" stroke="#888" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 14 L50 20 L36 34 L30 34 L30 28 Z" fill="#ff9f0a" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#8e8e93" />
      <g transform="translate(32 32)">
        <path d="M0 -18 L4 -18 L6 -14 L12 -14 L14 -10 L12 -6 L14 -2 L18 0 L18 4 L14 6 L12 10 L14 14 L10 14 L6 12 L2 14 L0 18 L-2 14 L-6 12 L-10 14 L-14 10 L-12 6 L-14 2 L-18 0 L-14 -2 L-12 -6 L-14 -10 L-12 -14 L-6 -14 L-4 -18 Z" fill="white" />
        <circle r="6" fill="#8e8e93" />
      </g>
    </svg>
  ),
  terminal: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#2d2d2d" />
      <rect x="10" y="10" width="44" height="44" rx="6" fill="#1a1a1a" />
      <path d="M18 24 L26 32 L18 40" stroke="#3aff7a" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="30" y1="40" x2="44" y2="40" stroke="#3aff7a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#1a1a2e" />
      <polyline points="10,40 22,40 28,24 36,48 42,32 54,32" fill="none" stroke="#3aff7a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#1a1a1a" />
      <circle cx="32" cy="32" r="22" fill="white" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      <line x1="32" y1="32" x2="32" y2="16" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="32" x2="44" y2="32" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  photos: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="white" />
      <g transform="translate(32 32)">
        <ellipse rx="20" ry="8" fill="#ffd60a" opacity="0.9" />
        <ellipse rx="20" ry="8" fill="#ff9f0a" opacity="0.7" transform="rotate(60)" />
        <ellipse rx="20" ry="8" fill="#ff453a" opacity="0.7" transform="rotate(120)" />
      </g>
    </svg>
  ),
  music: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="music-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb5c74" />
          <stop offset="100%" stopColor="#fa233b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#music-bg)" />
      <path d="M26 16 L26 42 M26 16 L46 12 L46 38" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="44" r="6" fill="white" />
      <circle cx="42" cy="40" r="6" fill="white" />
    </svg>
  ),
  tv: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#1a1a1a" />
      <text x="32" y="42" textAnchor="middle" fontSize="22" fontWeight="800" fill="white" fontFamily="Helvetica">tv</text>
    </svg>
  ),
  podcasts: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="pod-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dba0fc" />
          <stop offset="100%" stopColor="#9b4dff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#pod-bg)" />
      <circle cx="32" cy="26" r="6" fill="white" />
      <path d="M24 48 Q32 36 40 48" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#0a84ff" />
      <rect x="12" y="18" width="40" height="28" rx="4" fill="white" />
      <path d="M12 22 L32 36 L52 22" fill="none" stroke="#0a84ff" strokeWidth="3" />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="msg-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ee86a" />
          <stop offset="100%" stopColor="#34c759" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#msg-bg)" />
      <path d="M32 18 Q18 18 18 32 Q18 42 26 46 L24 52 L34 46 Q46 42 46 32 Q46 18 32 18 Z" fill="white" />
    </svg>
  ),
  facetime: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#34c759" />
      <rect x="14" y="22" width="28" height="20" rx="4" fill="white" />
      <path d="M44 28 L52 22 L52 42 L44 36 Z" fill="white" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="phone-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ee86a" />
          <stop offset="100%" stopColor="#34c759" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#phone-bg)" />
      <path d="M22 20 Q22 16 26 16 L30 16 Q34 16 34 20 L34 24 L38 28 L34 32 L28 26 L26 26 Q22 26 22 30 Z" fill="white" />
    </svg>
  ),
  safari: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="safari-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8e8" />
          <stop offset="100%" stopColor="#b0b0b8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#safari-bg)" />
      <circle cx="32" cy="32" r="20" fill="#1a84ff" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="white" strokeWidth="1" />
      <polygon points="32,32 44,20 36,36" fill="#ff3b30" />
      <polygon points="32,32 20,44 28,28" fill="white" />
    </svg>
  ),
  maps: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#e8e8e8" />
      <path d="M10 20 L24 14 L40 20 L54 14 L54 48 L40 42 L24 48 L10 42 Z" fill="#a8e0a8" stroke="#88c888" strokeWidth="1" />
      <path d="M24 14 L24 48 M40 20 L40 42" stroke="#88c888" strokeWidth="1" />
      <path d="M32 22 L36 30 L32 44 L28 30 Z" fill="#ff3b30" />
    </svg>
  ),
  weather: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id="weather-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ab8ff" />
          <stop offset="100%" stopColor="#2a7fff" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#weather-bg)" />
      <circle cx="38" cy="26" r="8" fill="#ffd60a" />
      <ellipse cx="28" cy="38" rx="14" ry="8" fill="white" />
    </svg>
  ),
  stocks: (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <rect width="64" height="64" rx="14" fill="#1a1a1a" />
      <polyline points="10,44 22,36 30,40 42,24 54,30" fill="none" stroke="#34c759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  // System / shell icons
  apple: (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.65 3.22 2.6 1.29-.05 1.78-.83 3.34-.83 1.56 0 2 .83 3.37.81 1.39-.03 2.27-1.27 3.12-2.53.98-1.45 1.39-2.85 1.41-2.92-.03-.01-2.71-1.04-2.74-4.13zM14.2 4.66c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z"/>
    </svg>
  ),
  spotlight: (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16" y1="16" x2="21" y2="21" />
    </svg>
  ),
  controlcenter: (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  wifi: (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14 0" />
      <path d="M8.5 16.1a6 6 0 0 1 7 0" />
      <line x1="12" y1="20" x2="12" y2="20" />
    </svg>
  ),
  bluetooth: (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12-6 6V0l6 6L6 18" />
    </svg>
  ),
  battery: (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <rect x="4" y="9" width="12" height="6" rx="0.5" fill="currentColor" />
      <line x1="22" y1="10" x2="22" y2="14" strokeLinecap="round" strokeWidth="2" />
    </svg>
  ),
  notification: (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
}

/**
 * AppIcon — renders a hand-built SVG app icon tile.
 * Falls back to a generic gradient tile if the name is not in the registry.
 */
export function AppIcon({ name, size = 64, className = '' }: AppIconProps) {
  const icon = ICON_REGISTRY[name]
  return (
    <div
      className={`app-icon-tile${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, borderRadius: `${size * 0.22}px`, overflow: 'hidden', flexShrink: 0 }}
      data-testid={`app-icon-${name}`}
    >
      {icon ?? (
        <svg viewBox="0 0 64 64" width="100%" height="100%">
          <defs>
            <linearGradient id={`fallback-${name}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6a8eff" />
              <stop offset="100%" stopColor="#9b4dff" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" fill={`url(#fallback-${name})`} />
          <text x="32" y="38" textAnchor="middle" fontSize="20" fontWeight="700" fill="white" fontFamily="Helvetica">
            {name.slice(0, 2).toUpperCase()}
          </text>
        </svg>
      )}
    </div>
  )
}
