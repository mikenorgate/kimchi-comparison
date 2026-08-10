import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Brush,
  Layers,
  Monitor,
  RotateCcw,
  Sliders,
  Trash2,
} from 'lucide-react';
import { useSystemStore } from '../stores/systemStore';
import { useDockStore } from '../stores/dockStore';
import { useAppDataStore } from '../stores/appDataStore';
import { listWallpapers } from '../lib/wallpapers';
import type { AccentColor, Appearance, DockPosition } from '../types';

interface SettingsProps {
  windowId: string;
}

type PaneId = 'general' | 'desktop' | 'dock' | 'reset';

const ACCENT_COLORS: { id: AccentColor; name: string; swatch: string }[] = [
  { id: 'blue', name: 'Blue', swatch: '#0a84ff' },
  { id: 'purple', name: 'Purple', swatch: '#bf5af2' },
  { id: 'pink', name: 'Pink', swatch: '#ff375f' },
  { id: 'red', name: 'Red', swatch: '#ff453a' },
  { id: 'orange', name: 'Orange', swatch: '#ff9f0a' },
  { id: 'yellow', name: 'Yellow', swatch: '#ffd60a' },
  { id: 'green', name: 'Green', swatch: '#30d158' },
  { id: 'graphite', name: 'Graphite', swatch: '#8e8e93' },
];

const PANES: { id: PaneId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'dock', label: 'Dock', icon: Layers },
  { id: 'reset', label: 'Reset', icon: Brush },
];

function Section({
  title,
  description,
  children,
  testId,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section data-testid={testId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({
  label,
  description,
  children,
  testId,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-1 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {description && (
          <div className="text-xs text-slate-500">{description}</div>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  testId,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? 'Toggle'}
      data-testid={testId}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-blue-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function Settings(_props: SettingsProps) {
  const appearance = useSystemStore((s) => s.appearance);
  const wallpaper = useSystemStore((s) => s.wallpaper);
  const accentColor = useSystemStore((s) => s.accentColor);
  const computerName = useSystemStore((s) => s.computerName);
  const setAppearance = useSystemStore((s) => s.setAppearance);
  const setWallpaper = useSystemStore((s) => s.setWallpaper);
  const setAccentColor = useSystemStore((s) => s.setAccentColor);
  const setComputerName = useSystemStore((s) => s.setComputerName);

  const dockSize = useDockStore((s) => s.size);
  const dockMag = useDockStore((s) => s.magnificationEnabled);
  const dockPosition = useDockStore((s) => s.position);
  const setDockSize = useDockStore((s) => s.setDockSize);
  const setDockMag = useDockStore((s) => s.setDockMagnification);
  const setDockPos = useDockStore((s) => s.setDockPosition);

  const clearSafariRecents = useAppDataStore((s) => s.clearRecentUrls);

  const wallpapers = useMemo(() => listWallpapers(), []);

  const [pane, setPane] = useState<PaneId>('general');
  const [nameDraft, setNameDraft] = useState(computerName);
  const lastSyncedName = useRef(computerName);

  // Keep the draft in sync if the store value changes externally (e.g. via
  // reset or another settings window).
  useEffect(() => {
    if (computerName !== lastSyncedName.current) {
      lastSyncedName.current = computerName;
      setNameDraft(computerName);
    }
  }, [computerName]);

  const handleAccent = useCallback(
    (next: AccentColor) => {
      setAccentColor(next);
    },
    [setAccentColor],
  );

  const handleAppearance = useCallback(
    (next: Appearance) => {
      setAppearance(next);
    },
    [setAppearance],
  );

  const handleComputerNameBlur = useCallback(() => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== computerName) {
      setComputerName(trimmed);
    } else if (!trimmed) {
      setNameDraft(computerName);
    }
  }, [computerName, nameDraft, setComputerName]);

  const handleReset = useCallback(() => {
    // Clear every persisted key the stores use, then reload.
    try {
      localStorage.removeItem('tahoe.system');
      localStorage.removeItem('tahoe.filesystem');
      localStorage.removeItem('tahoe.dock');
      localStorage.removeItem('tahoe.appdata');
    } catch {
      // localStorage may be unavailable in some sandboxes — ignore.
    }
    window.location.reload();
  }, []);

  const renderGeneral = () => (
    <div className="space-y-4">
      <Section title="Appearance" description="Choose how Tahoe looks." testId="settings-general-appearance">
        <Row label="Mode" description="Light, Dark, or follow system.">
          <div
            data-testid="appearance-toggle"
            className="flex overflow-hidden rounded-md border border-slate-200"
          >
            {(['light', 'dark', 'auto'] as Appearance[]).map((opt) => {
              const active = appearance === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  data-testid={`appearance-${opt}`}
                  onClick={() => handleAppearance(opt)}
                  className={`px-3 py-1 text-xs capitalize transition ${
                    active
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </Row>
        <Row label="Accent color" description="Used for highlights and controls.">
          <div data-testid="accent-picker" className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => {
              const active = accentColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  data-testid={`accent-${color.id}`}
                  aria-label={color.name}
                  aria-pressed={active}
                  onClick={() => handleAccent(color.id)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                    active ? 'border-slate-900 ring-2 ring-blue-300' : 'border-white shadow'
                  }`}
                  style={{ backgroundColor: color.swatch }}
                />
              );
            })}
          </div>
        </Row>
      </Section>

      <Section title="Computer name" description="Shown in shared services and AirDrop." testId="settings-general-name">
        <Row label="Name">
          <input
            type="text"
            data-testid="computer-name-input"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={handleComputerNameBlur}
            className="w-56 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
            placeholder="Tahoe"
          />
        </Row>
      </Section>
    </div>
  );

  const renderDesktop = () => (
    <Section
      title="Wallpaper"
      description="Pick a backdrop. Changes apply instantly."
      testId="settings-desktop-wallpaper"
    >
      <div data-testid="wallpaper-picker" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {wallpapers.map((wp) => {
          const active = wp.id === wallpaper;
          return (
            <button
              key={wp.id}
              type="button"
              data-testid={`wallpaper-${wp.id}`}
              aria-pressed={active}
              onClick={() => setWallpaper(wp.id)}
              className={`group flex flex-col overflow-hidden rounded-lg border-2 text-left transition ${
                active
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <div
                className="h-20 w-full"
                style={{ background: wp.background }}
                aria-hidden
              />
              <div className="bg-white px-2 py-1.5">
                <div className="text-xs font-medium text-slate-800">{wp.name}</div>
                <div className="text-[10px] text-slate-500">{wp.id}</div>
              </div>
            </button>
          );
        })}
      </div>
    </Section>
  );

  const renderDock = () => (
    <div className="space-y-4">
      <Section title="Size & magnification" testId="settings-dock-size">
        <Row label="Size" description={`Current: ${dockSize}`}>
          <input
            type="range"
            data-testid="dock-size-slider"
            min={10}
            max={100}
            value={dockSize}
            onChange={(e) => setDockSize(Number(e.target.value))}
            className="h-2 w-56 cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500"
          />
        </Row>
        <Row label="Magnification" description="Enlarge icons as the cursor passes over them.">
          <ToggleSwitch
            testId="dock-magnification-toggle"
            checked={dockMag}
            onChange={(next) => setDockMag(next)}
            label="Toggle magnification"
          />
        </Row>
      </Section>

      <Section title="Position on screen" testId="settings-dock-position">
        <Row label="Position" description="Choose where the Dock lives.">
          <div
            data-testid="dock-position-group"
            role="radiogroup"
            aria-label="Dock position"
            className="flex overflow-hidden rounded-md border border-slate-200"
          >
            {(['bottom', 'left', 'right'] as DockPosition[]).map((opt) => {
              const active = dockPosition === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-testid={`dock-position-${opt}`}
                  onClick={() => setDockPos(opt)}
                  className={`px-3 py-1 text-xs capitalize transition ${
                    active
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </Row>
      </Section>
    </div>
  );

  const renderReset = () => (
    <Section
      title="Reset to Defaults"
      description="Restore system, dock, file system, and app data to their original state. This clears localStorage and reloads the page."
      testId="settings-reset"
    >
      <Row label="Clear persisted data">
        <button
          type="button"
          data-testid="reset-defaults-btn"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Defaults
        </button>
      </Row>
      <Row label="Safari recents" description="Wipe recently visited URLs only.">
        <button
          type="button"
          data-testid="clear-safari-recent-btn"
          onClick={() => clearSafariRecents()}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Recents
        </button>
      </Row>
    </Section>
  );

  return (
    <div
      data-testid="settings-root"
      data-window-id={_props.windowId}
      className="flex h-full w-full bg-slate-100 text-slate-800"
    >
      <nav
        aria-label="Settings panes"
        className="hidden w-48 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3 sm:block"
      >
        <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Settings
        </div>
        <ul className="space-y-0.5">
          {PANES.map((p) => {
            const Icon = p.icon;
            const active = pane === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  data-testid={`settings-pane-${p.id}`}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setPane(p.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {p.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className="flex-1 overflow-y-auto p-6">
        <header className="mb-4">
          <h1 className="text-xl font-semibold text-slate-800">
            {PANES.find((p) => p.id === pane)?.label}
          </h1>
          <p className="text-xs text-slate-500">
            Changes are saved automatically.
          </p>
        </header>
        <div data-testid={`settings-pane-content-${pane}`}>
          {pane === 'general' && renderGeneral()}
          {pane === 'desktop' && renderDesktop()}
          {pane === 'dock' && renderDock()}
          {pane === 'reset' && renderReset()}
        </div>
      </main>
    </div>
  );
}
