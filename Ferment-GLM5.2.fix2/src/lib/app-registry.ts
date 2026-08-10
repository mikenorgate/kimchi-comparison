/**
 * App registry for the Dock (and Launchpad/Spotlight in Phase 2).
 *
 * Each dock app has an id (matches the os-store registry id), display name,
 * a gradient for its icon, a glyph, and a default window size. The actual app
 * content renderers are wired in App.tsx (Phase 1 stubs; Phase 3 real apps).
 */

export interface DockApp {
  id: string
  name: string
  /** Icon background gradient (CSS). */
  gradient: string
  /** Single emoji/glyph rendered on the gradient. */
  glyph: string
  defaultWidth: number
  defaultHeight: number
}

export const DOCK_APPS: DockApp[] = [
  { id: 'finder', name: 'Finder', gradient: 'linear-gradient(180deg,#7bb3e8,#3a7bd5)', glyph: '🗂', defaultWidth: 680, defaultHeight: 440 },
  { id: 'safari', name: 'Safari', gradient: 'linear-gradient(180deg,#e8e8ec,#b4c6d8)', glyph: '🧭', defaultWidth: 900, defaultHeight: 600 },
  { id: 'notes', name: 'Notes', gradient: 'linear-gradient(180deg,#fff5b8,#f5d76e)', glyph: '📝', defaultWidth: 720, defaultHeight: 480 },
  { id: 'calculator', name: 'Calculator', gradient: 'linear-gradient(180deg,#3a3a3c,#1c1c1e)', glyph: '🧮', defaultWidth: 280, defaultHeight: 420 },
  { id: 'terminal', name: 'Terminal', gradient: 'linear-gradient(180deg,#2a2a2e,#0a0a0a)', glyph: '⌨', defaultWidth: 640, defaultHeight: 420 },
  { id: 'system-settings', name: 'System Settings', gradient: 'linear-gradient(180deg,#8a8a8e,#4a4a4e)', glyph: '⚙', defaultWidth: 760, defaultHeight: 540 },
  { id: 'mail', name: 'Mail', gradient: 'linear-gradient(180deg,#5ac8fa,#0a84ff)', glyph: '✉', defaultWidth: 820, defaultHeight: 560 },
  { id: 'calendar', name: 'Calendar', gradient: 'linear-gradient(180deg,#ffffff,#e0e0e4)', glyph: '📅', defaultWidth: 780, defaultHeight: 540 },
  { id: 'messages', name: 'Messages', gradient: 'linear-gradient(180deg,#5fe35f,#28c840)', glyph: '💬', defaultWidth: 720, defaultHeight: 500 },
  { id: 'textedit', name: 'TextEdit', gradient: 'linear-gradient(180deg,#e8e8ec,#a0a0a4)', glyph: '📄', defaultWidth: 640, defaultHeight: 520 },
  { id: 'music', name: 'Music', gradient: 'linear-gradient(180deg,#ff6482,#fa2d48)', glyph: '🎵', defaultWidth: 820, defaultHeight: 560 },
  { id: 'photos', name: 'Photos', gradient: 'linear-gradient(135deg,#fff5b8,#ff9f0a,#ff453a,#bf5af2)', glyph: '🌺', defaultWidth: 820, defaultHeight: 560 },
  { id: 'maps', name: 'Maps', gradient: 'linear-gradient(180deg,#a8d8a8,#5ec85e)', glyph: '🗺', defaultWidth: 840, defaultHeight: 560 },
  { id: 'clock', name: 'Clock', gradient: 'linear-gradient(180deg,#3a3a3c,#1c1c1e)', glyph: '🕐', defaultWidth: 600, defaultHeight: 440 },
]

export function getDockApp(id: string): DockApp | undefined {
  return DOCK_APPS.find((a) => a.id === id)
}
