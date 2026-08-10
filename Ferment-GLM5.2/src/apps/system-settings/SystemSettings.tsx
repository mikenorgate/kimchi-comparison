/**
 * System Settings — macOS Tahoe system preferences app.
 *
 * Features:
 * - Sidebar navigation with sections (Appearance, Wallpaper, Desktop & Dock, Network, etc.)
 * - Appearance pane: Light/Dark/Tinted mode toggle + Reduce Transparency toggle
 * - Wallpaper pane: select from original gradient wallpapers
 * - Desktop & Dock pane: dock size, magnification toggles (local state for display)
 * - Network pane: shows mock Wi-Fi status
 * - All appearance/wallpaper controls wired to useSettingsStore (persisted)
 */

import { useState } from 'react';
import { useSettingsStore } from '@/store/settings';
import { wallpapers } from '@/shell/wallpapers';
import type { AppearanceMode } from '@/design-system/tokens';

// ── Types ─────────────────────────────────────────────────────────

interface SystemSettingsProps {
  appId: string;
}

type PaneId = 'appearance' | 'wallpaper' | 'desktop-dock' | 'network' | 'sound' | 'general';

interface SidebarItem {
  id: PaneId;
  name: string;
  icon: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'general', name: 'General', icon: '⚙' },
  { id: 'appearance', name: 'Appearance', icon: '🎨' },
  { id: 'wallpaper', name: 'Wallpaper', icon: '🖼' },
  { id: 'desktop-dock', name: 'Desktop & Dock', icon: '📊' },
  { id: 'network', name: 'Network', icon: '📶' },
  { id: 'sound', name: 'Sound', icon: '🔊' },
];

// ── Pane Components ───────────────────────────────────────────────

function AppearancePane() {
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const reduceTransparency = useSettingsStore((s) => s.reduceTransparency);
  const setReduceTransparency = useSettingsStore((s) => s.setReduceTransparency);

  const modes: { mode: AppearanceMode; label: string; preview: string }[] = [
    { mode: 'light', label: 'Light', preview: 'linear-gradient(135deg, #f0f0f0, #d0d0d0)' },
    { mode: 'dark', label: 'Dark', preview: 'linear-gradient(135deg, #2c2c2c, #1a1a1a)' },
    { mode: 'tinted', label: 'Tinted', preview: 'linear-gradient(135deg, #6a7ac0, #5a6ab0)' },
  ];

  return (
    <div className="p-6 max-w-2xl" data-testid="settings-appearance-pane">
      <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">Appearance</h2>

      {/* Appearance mode selector */}
      <div className="mb-6">
        <label className="text-sm font-medium text-black/60 dark:text-white/60 mb-2 block">Appearance Mode</label>
        <div className="flex gap-4">
          {modes.map(({ mode, label, preview }) => (
            <button
              key={mode}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                appearance === mode
                  ? 'border-[#0a84ff]'
                  : 'border-transparent hover:border-black/10 dark:hover:border-white/10'
              }`}
              onClick={() => setAppearance(mode)}
              data-testid={`settings-appearance-${mode}`}
            >
              <div
                className="w-20 h-14 rounded-lg shadow-md"
                style={{ background: preview }}
              />
              <span className={`text-xs ${appearance === mode ? 'text-[#0a84ff] font-medium' : 'text-black/60 dark:text-white/60'}`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reduce Transparency toggle */}
      <div className="flex items-center justify-between py-3 border-t border-black/5 dark:border-white/5">
        <div>
          <div className="text-sm font-medium text-black/80 dark:text-white/80">Reduce Transparency</div>
          <div className="text-xs text-black/40 dark:text-white/40">Reduces backdrop blur and transparency effects</div>
        </div>
        <ToggleSwitch
          checked={reduceTransparency}
          onChange={setReduceTransparency}
          testId="settings-reduce-transparency"
        />
      </div>

      {/* Current state display */}
      <div className="mt-6 p-3 rounded-lg bg-black/5 dark:bg-white/5 text-xs text-black/50 dark:text-white/50">
        Current: <span data-testid="settings-current-appearance" className="font-medium">{appearance}</span>
        {reduceTransparency && <span className="ml-2">(reduced transparency)</span>}
      </div>
    </div>
  );
}

function WallpaperPane() {
  const wallpaper = useSettingsStore((s) => s.wallpaper);
  const setWallpaper = useSettingsStore((s) => s.setWallpaper);

  return (
    <div className="p-6 max-w-3xl" data-testid="settings-wallpaper-pane">
      <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">Wallpaper</h2>
      <div className="grid grid-cols-3 gap-4">
        {wallpapers.map((wp) => (
          <button
            key={wp.id}
            className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-colors ${
              wallpaper === wp.id
                ? 'border-[#0a84ff]'
                : 'border-transparent hover:border-black/10 dark:hover:border-white/10'
            }`}
            onClick={() => setWallpaper(wp.id)}
            data-testid={`settings-wallpaper-${wp.id}`}
          >
            <div
              className="w-full h-24 rounded-lg shadow-md"
              style={{ background: wp.css }}
            />
            <span className={`text-xs ${wallpaper === wp.id ? 'text-[#0a84ff] font-medium' : 'text-black/60 dark:text-white/60'}`}>
              {wp.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DesktopDockPane() {
  const [dockMagnification, setDockMagnification] = useState(true);
  const [dockSize, setDockSize] = useState(50);
  const [showRecentApps, setShowRecentApps] = useState(false);

  return (
    <div className="p-6 max-w-2xl" data-testid="settings-desktop-dock-pane">
      <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">Desktop & Dock</h2>

      <div className="flex items-center justify-between py-3 border-t border-black/5 dark:border-white/5">
        <div className="text-sm font-medium text-black/80 dark:text-white/80">Magnification</div>
        <ToggleSwitch
          checked={dockMagnification}
          onChange={setDockMagnification}
          testId="settings-dock-magnification"
        />
      </div>

      <div className="py-3 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-black/80 dark:text-white/80">Dock Size</div>
          <span className="text-xs text-black/40 dark:text-white/40">{dockSize}px</span>
        </div>
        <input
          type="range"
          min="30"
          max="80"
          value={dockSize}
          onChange={(e) => setDockSize(Number(e.target.value))}
          className="w-full"
          data-testid="settings-dock-size"
        />
      </div>

      <div className="flex items-center justify-between py-3 border-t border-black/5 dark:border-white/5">
        <div className="text-sm font-medium text-black/80 dark:text-white/80">Show recent applications</div>
        <ToggleSwitch
          checked={showRecentApps}
          onChange={setShowRecentApps}
          testId="settings-show-recent-apps"
        />
      </div>
    </div>
  );
}

function NetworkPane() {
  return (
    <div className="p-6 max-w-2xl" data-testid="settings-network-pane">
      <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">Network</h2>
      <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📶</span>
          <div>
            <div className="text-sm font-medium text-black/80 dark:text-white/80">Wi-Fi</div>
            <div className="text-xs text-black/50 dark:text-white/50">Connected to "Tahoe-Network"</div>
          </div>
          <div className="ml-auto">
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-600 dark:text-green-400" data-testid="settings-network-status">
              Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SoundPane() {
  const [volume, setVolume] = useState(60);
  const [outputDevice, setOutputDevice] = useState('Built-in Speakers');

  return (
    <div className="p-6 max-w-2xl" data-testid="settings-sound-pane">
      <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">Sound</h2>
      <div className="py-3 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-black/80 dark:text-white/80">Output Volume</div>
          <span className="text-xs text-black/40 dark:text-white/40">{volume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full"
          data-testid="settings-volume"
        />
      </div>
      <div className="py-3 border-t border-black/5 dark:border-white/5">
        <div className="text-sm font-medium text-black/80 dark:text-white/80 mb-2">Output Device</div>
        <select
          className="w-full px-3 py-2 rounded-lg bg-black/5 dark:bg-white/10 text-sm text-black/80 dark:text-white/80"
          value={outputDevice}
          onChange={(e) => setOutputDevice(e.target.value)}
          data-testid="settings-output-device"
        >
          <option>Built-in Speakers</option>
          <option>AirPods Pro</option>
          <option>External Display</option>
        </select>
      </div>
    </div>
  );
}

function GeneralPane() {
  return (
    <div className="p-6 max-w-2xl" data-testid="settings-general-pane">
      <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-4">General</h2>
      <div className="p-4 rounded-lg bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💻</span>
          <div>
            <div className="text-sm font-medium text-black/80 dark:text-white/80">MacBook Pro (Tahoe Web)</div>
            <div className="text-xs text-black/50 dark:text-white/50">macOS Tahoe 26 · Web Recreation</div>
          </div>
        </div>
      </div>
      <div className="py-3 border-t border-black/5 dark:border-white/5">
        <div className="text-sm font-medium text-black/80 dark:text-white/80">Computer Name</div>
        <div className="text-xs text-black/50 dark:text-white/50 mt-1">MacBook Pro</div>
      </div>
      <div className="py-3 border-t border-black/5 dark:border-white/5">
        <div className="text-sm font-medium text-black/80 dark:text-white/80">Software Version</div>
        <div className="text-xs text-black/50 dark:text-white/50 mt-1">Tahoe 26.0 (Build 20A360)</div>
      </div>
    </div>
  );
}

// ── Toggle Switch ────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  testId,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  testId: string;
}) {
  return (
    <button
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-[#30d158]' : 'bg-black/15 dark:bg-white/20'
      }`}
      onClick={() => onChange(!checked)}
      data-testid={testId}
      role="switch"
      aria-checked={checked}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ── Main System Settings Component ───────────────────────────────

export function SystemSettings({ appId: _appId }: SystemSettingsProps) {
  const [activePane, setActivePane] = useState<PaneId>('appearance');

  return (
    <div className="flex h-full w-full" data-testid="settings-root">
      {/* Sidebar */}
      <div
        className="glass-surface w-52 shrink-0 border-r border-black/5 dark:border-white/5 p-2 overflow-y-auto"
        data-testid="settings-sidebar"
      >
        {SIDEBAR_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              activePane === item.id
                ? 'bg-[#0a84ff] text-white'
                : 'text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            onClick={() => setActivePane(item.id)}
            data-testid={`settings-nav-${item.id}`}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto" data-testid="settings-content">
        {activePane === 'general' && <GeneralPane />}
        {activePane === 'appearance' && <AppearancePane />}
        {activePane === 'wallpaper' && <WallpaperPane />}
        {activePane === 'desktop-dock' && <DesktopDockPane />}
        {activePane === 'network' && <NetworkPane />}
        {activePane === 'sound' && <SoundPane />}
      </div>
    </div>
  );
}
