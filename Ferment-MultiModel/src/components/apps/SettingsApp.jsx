import { useState } from 'react';
import {
  Palette,
  Image as ImageIcon,
  LayoutGrid,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';

/**
 * SettingsApp
 *
 * A pure presentational mock of the macOS System Settings window.
 *
 *   Left sidebar   – vertical list of preference categories
 *                    (Appearance, Wallpaper, Dock & Menu Bar).
 *   Right pane     – the detail view for the selected category.
 *
 * Three categories are shown in the sidebar. Only Appearance and
 * Wallpaper are functional mocks: Appearance lets the user pick a
 * Light / Dark / Auto mode and an accent colour; Wallpaper lets the
 * user pick one of a fixed set of gradient thumbnails. Dock & Menu
 * Bar is a placeholder pane to keep the layout realistic.
 *
 * No persistence, no global theme wiring – selection lives in local
 * React state and resets on remount. Mock data (categories, accent
 * colours, wallpaper gradients) is co-located at the top of this
 * file.
 *
 * Props: none. Mounted inside a `<Window>` body by WindowManager
 * when the window's appId is `'settings'`.
 */

const CATEGORIES = Object.freeze([
  { id: 'appearance', name: 'Appearance', Icon: Palette },
  { id: 'wallpaper', name: 'Wallpaper', Icon: ImageIcon },
  { id: 'dock', name: 'Dock & Menu Bar', Icon: LayoutGrid },
]);

const APPEARANCE_MODES = Object.freeze([
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'auto', label: 'Auto', Icon: Monitor },
]);

const ACCENT_COLORS = Object.freeze([
  { id: 'blue', label: 'Blue', swatch: 'bg-blue-500' },
  { id: 'purple', label: 'Purple', swatch: 'bg-purple-500' },
  { id: 'pink', label: 'Pink', swatch: 'bg-pink-500' },
  { id: 'red', label: 'Red', swatch: 'bg-red-500' },
  { id: 'orange', label: 'Orange', swatch: 'bg-orange-500' },
  { id: 'yellow', label: 'Yellow', swatch: 'bg-yellow-500' },
  { id: 'green', label: 'Green', swatch: 'bg-green-500' },
  { id: 'graphite', label: 'Graphite', swatch: 'bg-slate-500' },
]);

const WALLPAPERS = Object.freeze([
  {
    id: 'sonoma',
    name: 'Sonoma',
    background:
      'linear-gradient(135deg, #1e3a8a 0%, #5b21b6 45%, #831843 100%)',
  },
  {
    id: 'ventura',
    name: 'Ventura',
    background:
      'linear-gradient(135deg, #f97316 0%, #dc2626 45%, #7c2d12 100%)',
  },
  {
    id: 'monterey',
    name: 'Monterey',
    background:
      'linear-gradient(135deg, #f59e0b 0%, #d97706 45%, #1e40af 100%)',
  },
  {
    id: 'bigsur',
    name: 'Big Sur',
    background:
      'linear-gradient(135deg, #0891b2 0%, #1d4ed8 45%, #312e81 100%)',
  },
  {
    id: 'catalina',
    name: 'Catalina',
    background:
      'linear-gradient(135deg, #06b6d4 0%, #f97316 45%, #be123c 100%)',
  },
  {
    id: 'mojave',
    name: 'Mojave',
    background:
      'linear-gradient(135deg, #18181b 0%, #7c2d12 45%, #451a03 100%)',
  },
  {
    id: 'highsierra',
    name: 'High Sierra',
    background:
      'linear-gradient(135deg, #0c4a6e 0%, #1e1b4b 45%, #0f172a 100%)',
  },
  {
    id: 'sequoia',
    name: 'Sequoia',
    background:
      'linear-gradient(135deg, #166534 0%, #14532d 45%, #052e16 100%)',
  },
]);

const DEFAULT_CATEGORY = 'appearance';
const DEFAULT_MODE = 'auto';
const DEFAULT_ACCENT = 'blue';
const DEFAULT_WALLPAPER = 'sonoma';

function SettingsApp() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [accent, setAccent] = useState(DEFAULT_ACCENT);
  const [wallpaper, setWallpaper] = useState(DEFAULT_WALLPAPER);

  return (
    <div
      data-testid="settings-app"
      data-active-category={category}
      className="flex h-full w-full text-white/90 text-sm overflow-hidden"
    >
      <aside
        data-testid="settings-sidebar"
        aria-label="Settings categories"
        className="w-56 shrink-0 overflow-y-auto p-2 border-r border-white/10 bg-white/5"
      >
        <div
          data-testid="settings-sidebar-heading"
          className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/60"
        >
          Settings
        </div>
        <ul
          data-testid="settings-category-list"
          className="flex flex-col gap-0.5"
        >
          {CATEGORIES.map((entry) => {
            const isActive = entry.id === category;
            const Icon = entry.Icon;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  data-testid="settings-category"
                  data-category-id={entry.id}
                  data-selected={isActive ? 'true' : 'false'}
                  aria-pressed={isActive}
                  onClick={() => setCategory(entry.id)}
                  className={
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ' +
                    (isActive
                      ? 'bg-white/25 text-white'
                      : 'hover:bg-white/15 text-white/85')
                  }
                >
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center w-5 h-5 shrink-0 text-white/80"
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="truncate">{entry.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        data-testid="settings-pane"
        data-pane={category}
        aria-label={`${categoryName(category)} settings`}
        className="flex-1 overflow-y-auto p-6"
      >
        {category === 'appearance' ? (
          <AppearancePane
            mode={mode}
            accent={accent}
            onSelectMode={setMode}
            onSelectAccent={setAccent}
          />
        ) : null}

        {category === 'wallpaper' ? (
          <WallpaperPane
            wallpaper={wallpaper}
            onSelectWallpaper={setWallpaper}
          />
        ) : null}

        {category === 'dock' ? <DockPane /> : null}
      </section>
    </div>
  );
}

function categoryName(id) {
  const found = CATEGORIES.find((c) => c.id === id);
  return found ? found.name : '';
}

function AppearancePane({ mode, accent, onSelectMode, onSelectAccent }) {
  return (
    <div data-testid="settings-appearance" className="flex flex-col gap-6">
      <header>
        <h2
          data-testid="settings-appearance-heading"
          className="text-lg font-semibold"
        >
          Appearance
        </h2>
        <p className="text-xs text-white/60 mt-1">
          Choose how Tahoe looks for you. Changes apply locally only.
        </p>
      </header>

      <section data-testid="settings-appearance-mode" aria-label="Mode">
        <h3 className="text-sm font-medium mb-2">Mode</h3>
        <div
          className="inline-flex p-0.5 rounded-lg bg-white/10 border border-white/10"
          role="radiogroup"
          aria-label="Light, dark or auto"
        >
          {APPEARANCE_MODES.map((m) => {
            const isSelected = m.id === mode;
            const Icon = m.Icon;
            return (
              <button
                key={m.id}
                type="button"
                data-testid="settings-light-dark-auto"
                data-mode={m.id}
                data-selected={isSelected ? 'true' : 'false'}
                role="radio"
                aria-checked={isSelected}
                onClick={() => onSelectMode(m.id)}
                className={
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ' +
                  (isSelected
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/80 hover:text-white')
                }
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        data-testid="settings-appearance-accent"
        aria-label="Accent color"
      >
        <h3 className="text-sm font-medium mb-2">Accent colour</h3>
        <div
          className="flex flex-wrap gap-3"
          role="radiogroup"
          aria-label="Accent color"
        >
          {ACCENT_COLORS.map((c) => {
            const isSelected = c.id === accent;
            return (
              <button
                key={c.id}
                type="button"
                data-testid="settings-accent-color"
                data-color-id={c.id}
                data-selected={isSelected ? 'true' : 'false'}
                role="radio"
                aria-checked={isSelected}
                aria-label={c.label}
                onClick={() => onSelectAccent(c.id)}
                className={
                  'group relative flex items-center justify-center w-8 h-8 rounded-full transition-transform ' +
                  (isSelected
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                    : 'hover:scale-110')
                }
              >
                <span
                  aria-hidden="true"
                  className={`block w-7 h-7 rounded-full ${c.swatch} shadow-inner border border-white/20`}
                />
                {isSelected ? (
                  <Check
                    aria-hidden="true"
                    className="absolute w-4 h-4 text-white drop-shadow"
                  />
                ) : null}
                <span className="sr-only">{c.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function WallpaperPane({ wallpaper, onSelectWallpaper }) {
  return (
    <div data-testid="settings-wallpaper" className="flex flex-col gap-4">
      <header>
        <h2
          data-testid="settings-wallpaper-heading"
          className="text-lg font-semibold"
        >
          Wallpaper
        </h2>
        <p className="text-xs text-white/60 mt-1">
          Pick a desktop background. Click a thumbnail to select it.
        </p>
      </header>

      <div
        data-testid="settings-wallpaper-grid"
        role="radiogroup"
        aria-label="Wallpaper"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
      >
        {WALLPAPERS.map((w) => {
          const isSelected = w.id === wallpaper;
          return (
            <button
              key={w.id}
              type="button"
              data-testid="settings-wallpaper-thumbnail"
              data-wallpaper-id={w.id}
              data-selected={isSelected ? 'true' : 'false'}
              role="radio"
              aria-checked={isSelected}
              aria-label={w.name}
              onClick={() => onSelectWallpaper(w.id)}
              className={
                'group flex flex-col items-stretch gap-1 rounded-lg p-1 text-left transition-all ' +
                (isSelected
                  ? 'ring-2 ring-white bg-white/10'
                  : 'hover:bg-white/10 ring-1 ring-transparent')
              }
            >
              <span
                aria-hidden="true"
                data-testid="settings-wallpaper-preview"
                className="block w-full aspect-video rounded-md border border-white/15"
                style={{ background: w.background }}
              />
              <span className="flex items-center justify-between px-1">
                <span className="text-xs text-white/90 truncate">
                  {w.name}
                </span>
                {isSelected ? (
                  <Check
                    aria-hidden="true"
                    className="w-3.5 h-3.5 text-white"
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DockPane() {
  return (
    <div data-testid="settings-dock" className="flex flex-col gap-4">
      <header>
        <h2 className="text-lg font-semibold">Dock & Menu Bar</h2>
        <p className="text-xs text-white/60 mt-1">
          Adjust the Dock and Menu Bar appearance.
        </p>
      </header>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        Dock and Menu Bar preferences are not yet implemented in this mock.
      </div>
    </div>
  );
}

export default SettingsApp;
export { SettingsApp };
