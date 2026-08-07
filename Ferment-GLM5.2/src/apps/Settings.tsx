import { useState } from 'react'
import { Monitor, Palette, Image, Sun, Info } from 'lucide-react'
import { useThemeStore, ACCENT_COLORS, accentHex, type Appearance, type IconStyle } from '../store/theme'
import { useSystemStore } from '../store/system'
import { WALLPAPERS, WALLPAPER_NAMES, type WallpaperName } from '../lib/wallpapers'

/**
 * System Settings — macOS Tahoe–style settings app.
 *
 * Four panes wired to the theme + system stores so every change applies live
 * to the shell and persists across reloads (the stores own persistence):
 *  - Appearance: Light/Dark/Auto, accent color swatches, icon style tinted/clear
 *  - Wallpaper: gradient thumbnails (Tahoe/Sonoma/Sequoia/Graphite)
 *  - Displays: brightness slider (mutates the system store)
 *  - About: static system info
 */

type Pane = 'appearance' | 'wallpaper' | 'displays' | 'about'

const PANES: { id: Pane; label: string; icon: typeof Monitor }[] = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'wallpaper', label: 'Wallpaper', icon: Image },
  { id: 'displays', label: 'Displays', icon: Monitor },
  { id: 'about', label: 'About', icon: Info },
]

const APPEARANCES: { id: Appearance; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
]

const ICON_STYLES: { id: IconStyle; label: string }[] = [
  { id: 'tinted', label: 'Tinted' },
  { id: 'clear', label: 'Clear' },
]

export function Settings() {
  const [pane, setPane] = useState<Pane>('appearance')

  const appearance = useThemeStore((s) => s.appearance)
  const accent = useThemeStore((s) => s.accent)
  const iconStyle = useThemeStore((s) => s.iconStyle)
  const wallpaper = useThemeStore((s) => s.wallpaper)
  const setAppearance = useThemeStore((s) => s.setAppearance)
  const setAccent = useThemeStore((s) => s.setAccent)
  const setIconStyle = useThemeStore((s) => s.setIconStyle)
  const setWallpaper = useThemeStore((s) => s.setWallpaper)

  const brightness = useSystemStore((s) => s.brightness)
  const setBrightness = useSystemStore((s) => s.setBrightness)

  return (
    <div data-testid="settings-content" className="flex h-full text-[13px]">
      {/* Sidebar */}
      <aside className="w-48 border-r border-black/10 bg-black/[0.04] p-2">
        {PANES.map((p) => {
          const Icon = p.icon
          const active = pane === p.id
          return (
            <button
              key={p.id}
              data-testid={`settings-pane-${p.id}`}
              onClick={() => setPane(p.id)}
              className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${
                active ? 'bg-[var(--accent)] text-white' : 'hover:bg-black/5'
              }`}
            >
              <Icon size={15} />
              <span>{p.label}</span>
            </button>
          )
        })}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-5">
        {pane === 'appearance' && (
          <div data-testid="settings-appearance-pane" className="space-y-6">
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50">
                Appearance
              </h2>
              <div className="flex gap-2">
                {APPEARANCES.map((a) => (
                  <button
                    key={a.id}
                    data-testid={`settings-appearance-${a.id}`}
                    onClick={() => setAppearance(a.id)}
                    className={`rounded-lg border px-4 py-2 ${
                      appearance === a.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-black/10 bg-white/60 hover:bg-black/5'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50">
                Accent Color
              </h2>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    data-testid={`settings-accent-${c}`}
                    onClick={() => setAccent(c)}
                    aria-label={c}
                    className={`h-7 w-7 rounded-full transition ${
                      accent === c ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{
                      backgroundColor: accentHex(c),
                      // @ts-expect-error CSS custom prop via inline style
                      '--tw-ring-color': accentHex(c),
                    }}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/50">
                Icon Style
              </h2>
              <div className="flex gap-2">
                {ICON_STYLES.map((s) => (
                  <button
                    key={s.id}
                    data-testid={`settings-icon-${s.id}`}
                    onClick={() => setIconStyle(s.id)}
                    className={`rounded-lg border px-4 py-2 ${
                      iconStyle === s.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-black/10 bg-white/60 hover:bg-black/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {pane === 'wallpaper' && (
          <div data-testid="settings-wallpaper-pane">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
              Wallpaper
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {WALLPAPER_NAMES.map((name) => (
                <button
                  key={name}
                  data-testid={`settings-wallpaper-${name}`}
                  onClick={() => setWallpaper(name as WallpaperName)}
                  className={`overflow-hidden rounded-lg border-2 text-left ${
                    wallpaper === name ? 'border-[var(--accent)]' : 'border-black/10'
                  }`}
                >
                  <div
                    className="h-20 w-full"
                    style={{ background: WALLPAPERS[name] }}
                  />
                  <div className="px-2 py-1.5 text-xs capitalize">{name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {pane === 'displays' && (
          <div data-testid="settings-displays-pane">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
              Displays
            </h2>
            <label className="flex items-center gap-3">
              <Sun size={16} className="text-black/50" />
              <input
                id="settings-brightness"
                data-testid="settings-brightness"
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="flex-1"
              />
              <span
                data-testid="settings-brightness-value"
                className="w-10 text-right tabular-nums"
              >
                {brightness}%
              </span>
            </label>
          </div>
        )}

        {pane === 'about' && (
          <div data-testid="settings-about-pane">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-black/50">
              About
            </h2>
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-black/50">Name</dt>
                <dd>Tahoe MacBook</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">Chip</dt>
                <dd>Tahoe M3</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">Memory</dt>
                <dd>16 GB</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">macOS</dt>
                <dd data-testid="settings-version">Tahoe 26.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/50">Serial</dt>
                <dd>T4H0E0000W</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
