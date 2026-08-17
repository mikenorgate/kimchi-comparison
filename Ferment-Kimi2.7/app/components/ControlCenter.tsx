'use client';

import { useCallback, useState } from 'react';
import {
  Wifi,
  Bluetooth,
  Sun,
  Moon,
  Volume2,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ControlCenterProps {
  open: boolean;
}

export function ControlCenter({ open }: ControlCenterProps) {
  const { theme, toggleTheme } = useTheme();
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(true);
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(60);

  const toggleWifi = useCallback(() => setWifiOn((v) => !v), []);
  const toggleBluetooth = useCallback(() => setBluetoothOn((v) => !v), []);

  if (!open) return null;

  return (
    <div
      data-testid="control-center"
      className="glass fixed right-4 top-[calc(var(--menubar-height)+8px)] z-[9500] w-72 rounded-2xl p-4 text-sm text-foreground shadow-xl"
      style={{
        background: 'var(--control-center-bg)',
        border: '1px solid var(--menubar-border)',
      }}
      role="dialog"
      aria-label="Control Center"
    >
      <div className="grid grid-cols-2 gap-3">
        <button
          data-testid="cc-wifi"
          onClick={toggleWifi}
          aria-pressed={wifiOn}
          className={`flex flex-col items-start justify-between rounded-xl p-3 transition-colors ${
            wifiOn
              ? 'bg-accent text-accent-foreground'
              : 'bg-black/5 text-foreground dark:bg-white/10'
          }`}
        >
          <Wifi className="h-5 w-5" />
          <span className="mt-3 text-xs font-medium">
            {wifiOn ? 'Wi-Fi On' : 'Wi-Fi Off'}
          </span>
        </button>

        <button
          data-testid="cc-bluetooth"
          onClick={toggleBluetooth}
          aria-pressed={bluetoothOn}
          className={`flex flex-col items-start justify-between rounded-xl p-3 transition-colors ${
            bluetoothOn
              ? 'bg-accent text-accent-foreground'
              : 'bg-black/5 text-foreground dark:bg-white/10'
          }`}
        >
          <Bluetooth className="h-5 w-5" />
          <span className="mt-3 text-xs font-medium">
            {bluetoothOn ? 'Bluetooth On' : 'Bluetooth Off'}
          </span>
        </button>

        <div
          data-testid="cc-brightness"
          className="col-span-2 flex items-center gap-3 rounded-xl bg-black/5 p-3 dark:bg-white/10"
        >
          <Sun className="h-5 w-5 shrink-0" />
          <input
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-foreground/20 accent-accent"
            aria-label="Brightness"
          />
          <span data-testid="cc-brightness-value" className="w-8 text-right text-xs tabular-nums">
            {brightness}%
          </span>
        </div>

        <div
          data-testid="cc-volume"
          className="col-span-2 flex items-center gap-3 rounded-xl bg-black/5 p-3 dark:bg-white/10"
        >
          <Volume2 className="h-5 w-5 shrink-0" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-foreground/20 accent-accent"
            aria-label="Volume"
          />
          <span data-testid="cc-volume-value" className="w-8 text-right text-xs tabular-nums">
            {volume}%
          </span>
        </div>

        <button
          data-testid="cc-theme"
          onClick={toggleTheme}
          className="col-span-2 flex items-center justify-between rounded-xl bg-black/5 p-3 transition-colors dark:bg-white/10"
        >
          <span className="flex items-center gap-2 text-xs font-medium">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
          <span className="h-2 w-2 rounded-full bg-accent" />
        </button>
      </div>
    </div>
  );
}
