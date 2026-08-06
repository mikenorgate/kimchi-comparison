import { useState } from 'react';

import {
  BatteryFull,
  Bluetooth,
  Image as ImageIcon,
  Moon,
  Network,
  Palette,
  Volume2,
  Wifi,
} from 'lucide-react';

import { useOSStore } from '../store/osStore';
import type { Appearance } from '../types/os';

interface SettingsPane {
  id: string;
  label: string;
  /** Icon component from lucide-react. */
  icon: typeof Wifi;
}

const PANES: SettingsPane[] = [
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'wallpaper', label: 'Wallpaper', icon: ImageIcon },
  { id: 'sound', label: 'Sound', icon: Volume2 },
  { id: 'battery', label: 'Battery', icon: BatteryFull },
  { id: 'network', label: 'Network', icon: Network },
];

const WALLPAPERS: { id: string; label: string; gradient: string }[] = [
  {
    id: 'wallpaper',
    label: 'Tahoe',
    gradient: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 35%, #74e0bb 65%, #f4d35e 100%)',
  },
  {
    id: 'wave',
    label: 'Wave',
    gradient: 'linear-gradient(135deg, #6a82fb 0%, #fc5c7d 100%)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
  },
  {
    id: 'forest',
    label: 'Forest',
    gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  },
];

/**
 * System Settings app — sidebar with preference panes. Panes update
 * local state for toggles/sliders; Appearance and Wallpaper panes also
 * dispatch to the OS store via `setAppearance` / `setWallpaper`.
 */
export function SystemSettings({ windowId: _windowId }: { windowId: string }): JSX.Element {
  void _windowId;
  const appearance = useOSStore((state) => state.appearance);
  const setAppearance = useOSStore((state) => state.setAppearance);
  const wallpaper = useOSStore((state) => state.wallpaper);
  const setWallpaper = useOSStore((state) => state.setWallpaper);

  const [activePane, setActivePane] = useState<string>('appearance');

  // Local mock state.
  const [wifiOn, setWifiOn] = useState(true);
  const [wifiNetwork, setWifiNetwork] = useState('Tahoe-Guest');
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [volume, setVolume] = useState(60);
  const [batteryPercent] = useState(87);
  const [batteryCharging] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: '#f5f5f7',
        color: '#1d1d1f',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          borderRight: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.6)',
          padding: '12px 8px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            padding: '4px 8px 8px 8px',
            fontSize: 11,
            fontWeight: 600,
            color: '#6e6e73',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          Preferences
        </div>
        {PANES.map((pane) => {
          const Icon = pane.icon;
          const isActive = pane.id === activePane;
          return (
            <button
              key={pane.id}
              type="button"
              onClick={() => setActivePane(pane.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '6px 8px',
                borderRadius: 6,
                background: isActive ? 'var(--color-accent)' : 'transparent',
                color: isActive ? '#ffffff' : '#1d1d1f',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{pane.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Pane content */}
      <main
        style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'auto',
          background: '#ffffff',
        }}
      >
        {activePane === 'wifi' && (
          <PaneShell title="Wi-Fi" description="Connect to a wireless network.">
            <Toggle
              label="Wi-Fi"
              checked={wifiOn}
              onChange={setWifiOn}
              description={wifiOn ? `Connected to ${wifiNetwork}` : 'Wi-Fi is off'}
            />
            {wifiOn && (
              <div style={{ marginTop: 16 }}>
                <div style={sectionHeading}>Network</div>
                <select
                  value={wifiNetwork}
                  onChange={(event) => setWifiNetwork(event.target.value)}
                  style={selectStyle}
                  aria-label="Wi-Fi network"
                >
                  <option value="Tahoe-Guest">Tahoe-Guest</option>
                  <option value="Home-5G">Home-5G</option>
                  <option value="Coffee-Shop">Coffee-Shop</option>
                  <option value="Office-Mesh">Office-Mesh</option>
                </select>
              </div>
            )}
          </PaneShell>
        )}

        {activePane === 'bluetooth' && (
          <PaneShell title="Bluetooth" description="Connect to Bluetooth devices.">
            <Toggle
              label="Bluetooth"
              checked={bluetoothOn}
              onChange={setBluetoothOn}
              description={bluetoothOn ? 'On' : 'Off'}
            />
            {bluetoothOn && (
              <div style={{ marginTop: 16 }}>
                <div style={sectionHeading}>Devices</div>
                <ul style={listStyle}>
                  <li>Magic Mouse — Connected</li>
                  <li>AirPods Pro — Connected</li>
                  <li>Magic Keyboard — Connected</li>
                </ul>
              </div>
            )}
          </PaneShell>
        )}

        {activePane === 'appearance' && (
          <PaneShell title="Appearance" description="Choose Light or Dark mode.">
            <div style={{ display: 'flex', gap: 12 }}>
              <AppearanceCard
                label="Light"
                active={appearance === 'light'}
                onClick={() => setAppearance('light' as Appearance)}
              />
              <AppearanceCard
                label="Dark"
                active={appearance === 'dark'}
                onClick={() => setAppearance('dark' as Appearance)}
              />
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: '#6e6e73' }}>
              Changes apply immediately to the OS shell.
            </div>
          </PaneShell>
        )}

        {activePane === 'wallpaper' && (
          <PaneShell title="Wallpaper" description="Pick a desktop background.">
            <div style={wallpaperGridStyle}>
              {WALLPAPERS.map((w) => {
                const active = wallpaper === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWallpaper(w.id)}
                    aria-pressed={active}
                    aria-label={`Set wallpaper to ${w.label}`}
                    style={{
                      width: '100%',
                      height: 96,
                      borderRadius: 8,
                      background: w.gradient,
                      border: active ? '3px solid var(--color-accent)' : '1px solid rgba(0,0,0,0.12)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 6,
                        left: 8,
                        fontSize: 12,
                        color: '#ffffff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        fontWeight: 600,
                      }}
                    >
                      {w.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </PaneShell>
        )}

        {activePane === 'sound' && (
          <PaneShell title="Sound" description="Adjust system volume and output.">
            <Slider
              label="Output volume"
              value={volume}
              min={0}
              max={100}
              onChange={setVolume}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: '#6e6e73' }}>
              Output device: MacBook Pro Speakers
            </div>
          </PaneShell>
        )}

        {activePane === 'battery' && (
          <PaneShell title="Battery" description="Status and energy options.">
            <div style={batteryCardStyle}>
              <div style={{ fontSize: 36, fontWeight: 600 }}>{batteryPercent}%</div>
              <div style={{ fontSize: 12, color: '#6e6e73' }}>
                {batteryCharging ? 'Charging' : 'On battery'} · ~4 hours remaining
              </div>
            </div>
            <ul style={listStyle}>
              <li>Battery health: Normal</li>
              <li>Cycle count: 124</li>
              <li>Condition: Good</li>
            </ul>
          </PaneShell>
        )}

        {activePane === 'network' && (
          <PaneShell title="Network" description="Active interfaces and IP addresses.">
            <ul style={listStyle}>
              <li>Wi-Fi (en0): 192.168.1.42 · Connected</li>
              <li>Bluetooth PAN: Not connected</li>
              <li>Thunderbolt Bridge: Inactive</li>
            </ul>
          </PaneShell>
        )}
      </main>
    </div>
  );
}

interface PaneShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function PaneShell({ title, description, children }: PaneShellProps): JSX.Element {
  return (
    <div>
      <h2 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 600 }}>{title}</h2>
      <p style={{ margin: '0 0 16px 0', fontSize: 12, color: '#6e6e73' }}>{description}</p>
      {children}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

function Toggle({ label, checked, onChange, description }: ToggleProps): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 0',
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        style={{
          width: 38,
          height: 22,
          borderRadius: 11,
          background: checked ? 'var(--color-accent)' : '#c0c0c5',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.15s ease',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'left 0.15s ease',
          }}
        />
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 11, color: '#6e6e73' }}>{description}</div>
        )}
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, onChange }: SliderProps): JSX.Element {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12, color: '#6e6e73', marginBottom: 6 }}>
        {label}: {value}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: '100%' }}
        aria-label={label}
      />
    </label>
  );
}

function AppearanceCard({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): JSX.Element {
  const isLight = label === 'Light';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        flex: 1,
        height: 120,
        borderRadius: 12,
        border: active
          ? '3px solid var(--color-accent)'
          : '1px solid rgba(0,0,0,0.12)',
        cursor: 'pointer',
        padding: 8,
        background: isLight ? '#ffffff' : '#1d1d1f',
        color: isLight ? '#1d1d1f' : '#f5f5f7',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          color: isLight ? '#f4d35e' : '#5ac8fa',
          fontSize: 18,
        }}
        aria-hidden="true"
      >
        {isLight ? <Palette /> : <Moon />}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

const sectionHeading: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#6e6e73',
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  marginBottom: 6,
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  fontSize: 13,
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: 6,
  border: '1px solid rgba(0,0,0,0.12)',
  background: '#ffffff',
  fontSize: 13,
};

const wallpaperGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
};

const batteryCardStyle: React.CSSProperties = {
  padding: '16px 20px',
  background: '#f5f5f7',
  borderRadius: 10,
  marginBottom: 16,
};

export default SystemSettings;
