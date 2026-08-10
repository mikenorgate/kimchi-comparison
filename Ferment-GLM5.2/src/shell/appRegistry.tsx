/**
 * App Registry — defines the apps available in the Dock and Spotlight.
 *
 * Each app has an id, name, and an SVG icon component (original approximation).
 * Apps that are always running (Finder) start with `running: true`.
 * The `builtin` flag marks apps that will have real implementations in later phases.
 */

import type { ComponentType } from 'react';

export interface AppDef {
  id: string;
  name: string;
  /** Original SVG icon component for the Dock / Spotlight */
  icon: ComponentType<{ className?: string }>;
  /** Whether this app is built-in (has a real implementation) vs placeholder */
  builtin: boolean;
  /** Whether the app is always running (Finder) */
  alwaysRunning?: boolean;
}

// ── Original SVG App Icons (approximations, not copyrighted Apple assets) ──

function FinderIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="finder-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#finder-bg)" />
      <path d="M20 18 L20 46 M44 18 L44 46" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M20 46 Q32 52 44 46" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="20" cy="14" r="2.5" fill="white" />
      <circle cx="44" cy="14" r="2.5" fill="white" />
    </svg>
  );
}

function SafariIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="safari-bg" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#e8f0fe" />
          <stop offset="100%" stopColor="#a0c4ff" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#safari-bg)" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
      <path d="M32 14 L36 30 L50 34 L36 34 L32 50 L28 34 L14 34 L28 30 Z" fill="#ff453a" />
      <path d="M32 14 L36 30 L32 50 L28 30 Z" fill="#e0e0e0" />
      <circle cx="32" cy="32" r="3" fill="#3b82f6" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mail-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#mail-bg)" />
      <rect x="14" y="20" width="36" height="24" rx="4" fill="white" />
      <path d="M14 24 L32 36 L50 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NotesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="notes-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#notes-bg)" />
      <rect x="14" y="14" width="36" height="36" rx="4" fill="white" opacity="0.9" />
      <line x1="20" y1="24" x2="44" y2="24" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="32" x2="44" y2="32" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="40" x2="36" y2="40" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="calc-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#calc-bg)" />
      <rect x="14" y="12" width="36" height="12" rx="3" fill="#1f2937" />
      <text x="44" y="22" fill="#34d399" fontSize="8" fontFamily="monospace" textAnchor="end">0</text>
      <circle cx="20" cy="34" r="4" fill="#9ca3af" />
      <circle cx="32" cy="34" r="4" fill="#9ca3af" />
      <circle cx="44" cy="34" r="4" fill="#ff9f0a" />
      <circle cx="20" cy="46" r="4" fill="#9ca3af" />
      <circle cx="32" cy="46" r="4" fill="#9ca3af" />
      <circle cx="44" cy="46" r="4" fill="#ff9f0a" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="settings-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#settings-bg)" />
      <g transform="translate(32 32)">
        <g fill="white" opacity="0.9">
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x="-3" y="-18" width="6" height="10" rx="2"
              transform={`rotate(${i * 45})`}
            />
          ))}
        </g>
        <circle r="10" fill="#374151" stroke="white" strokeWidth="2" />
        <circle r="4" fill="#9ca3af" />
      </g>
    </svg>
  );
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="music-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#music-bg)" />
      <path d="M26 42 L26 22 L44 18 L44 38" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="23" cy="42" r="5" fill="white" />
      <circle cx="41" cy="38" r="5" fill="white" />
    </svg>
  );
}

function PhotosIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="white" />
      {['#ff453a', '#ff9f0a', '#ffd60a', '#32d74b', '#0a84ff', '#bf5af2'].map((c, i) => {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        const cx = 32 + Math.cos(angle) * 12;
        const cy = 32 + Math.sin(angle) * 12;
        return <circle key={i} cx={cx} cy={cy} r="8" fill={c} opacity="0.85" />;
      })}
      <circle cx="32" cy="32" r="6" fill="white" />
    </svg>
  );
}

function MessagesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="msg-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#msg-bg)" />
      <path d="M14 26 Q14 16 24 16 L40 16 Q50 16 50 26 L50 36 Q50 46 40 46 L28 46 L18 52 L20 46 Q14 46 14 36 Z" fill="white" />
    </svg>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1c1c1e" />
      <rect x="10" y="10" width="44" height="44" rx="6" fill="#0a0a0a" stroke="#3a3a3c" strokeWidth="1" />
      <path d="M18 24 L26 30 L18 36" stroke="#32d74b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="30" y1="36" x2="42" y2="36" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="white" />
      <rect x="12" y="12" width="40" height="40" rx="4" fill="none" stroke="#d1d1d6" strokeWidth="1.5" />
      <rect x="12" y="12" width="40" height="10" rx="4" fill="#ff453a" />
      <text x="32" y="44" fill="#1c1c1e" fontSize="22" fontFamily="-apple-system" fontWeight="600" textAnchor="middle">
        {new Date().getDate()}
      </text>
    </svg>
  );
}

function WeatherIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="weather-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#weather-bg)" />
      <circle cx="24" cy="24" r="8" fill="#fbbf24" />
      <path d="M20 40 Q16 40 16 36 Q16 30 22 30 Q24 24 32 24 Q40 24 42 32 Q48 32 48 38 Q48 44 42 44 L22 44 Q20 44 20 40 Z" fill="white" opacity="0.9" />
    </svg>
  );
}

function StocksIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="stocks-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1c1e" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#stocks-bg)" />
      <polyline points="12,44 24,30 32,36 52,16" stroke="#32d74b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polyline points="12,52 24,42 32,46 52,32" stroke="#8e8e93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#1c1c1e" />
      <circle cx="32" cy="32" r="22" fill="none" stroke="white" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="32" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="32" x2="44" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2" fill="#ff9f0a" />
    </svg>
  );
}

function RemindersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="remind-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#remind-bg)" />
      <circle cx="20" cy="24" r="4" fill="none" stroke="white" strokeWidth="2" />
      <line x1="28" y1="24" x2="46" y2="24" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="38" r="4" fill="white" />
      <path d="M18 38 L20 40 L22 36" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="28" y1="38" x2="46" y2="38" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="rgba(255,255,255,0.1)" />
      <g transform="translate(32 32)" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M-10 -6 L-8 16 Q-8 18 -6 18 L6 18 Q8 18 8 16 L10 -6 Z" />
        <line x1="-12" y1="-6" x2="12" y2="-6" />
        <line x1="-4" y1="-6" x2="-4" y2="-10" />
        <line x1="4" y1="-6" x2="4" y2="-10" />
      </g>
    </svg>
  );
}

// ── App Registry ─────────────────────────────────────────────────

export const appRegistry: AppDef[] = [
  { id: 'finder', name: 'Finder', icon: FinderIcon, builtin: true, alwaysRunning: true },
  { id: 'safari', name: 'Safari', icon: SafariIcon, builtin: true },
  { id: 'mail', name: 'Mail', icon: MailIcon, builtin: true },
  { id: 'notes', name: 'Notes', icon: NotesIcon, builtin: true },
  { id: 'calculator', name: 'Calculator', icon: CalculatorIcon, builtin: true },
  { id: 'settings', name: 'System Settings', icon: SettingsIcon, builtin: true },
  { id: 'music', name: 'Music', icon: MusicIcon, builtin: true },
  { id: 'photos', name: 'Photos', icon: PhotosIcon, builtin: true },
  { id: 'messages', name: 'Messages', icon: MessagesIcon, builtin: true },
  { id: 'terminal', name: 'Terminal', icon: TerminalIcon, builtin: true },
  { id: 'calendar', name: 'Calendar', icon: CalendarIcon, builtin: true },
  { id: 'weather', name: 'Weather', icon: WeatherIcon, builtin: true },
  { id: 'stocks', name: 'Stocks', icon: StocksIcon, builtin: true },
  { id: 'clock', name: 'Clock', icon: ClockIcon, builtin: true },
  { id: 'reminders', name: 'Reminders', icon: RemindersIcon, builtin: true },
];

export const trashIcon = TrashIcon;

export function getApp(id: string): AppDef | undefined {
  return appRegistry.find((a) => a.id === id);
}
