/**
 * ControlCenter — macOS Tahoe Control Center panel.
 *
 * - Toggled from the MenuBar Control Center icon
 * - Right-aligned glass panel below the menu bar
 * - Contains: connectivity toggles (Wi-Fi, Bluetooth, AirDrop), Do Not Disturb,
 *   brightness/sound sliders, and appearance mode shortcut
 * - Esc or click-outside closes
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '@/store/settings';

export interface ControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Toggle pill (connectivity module) ──────────────────────────

interface ToggleModuleProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  active: boolean;
  onToggle: () => void;
  testId: string;
}

function ToggleModule({ icon, label, sublabel, active, onToggle, testId }: ToggleModuleProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/10"
      data-testid={testId}
    >
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${
          active
            ? 'bg-[#0a84ff] text-white'
            : 'bg-white/15 text-white/70'
        }`}
      >
        {icon}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-xs font-semibold text-white truncate">{label}</div>
        {sublabel && <div className="text-[10px] text-white/60 truncate">{sublabel}</div>}
      </div>
    </button>
  );
}

// ── Slider module ──────────────────────────────────────────────

interface SliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  testId: string;
}

function Slider({ label, icon, value, onChange, testId }: SliderProps) {
  return (
    <div className="px-3 py-2" data-testid={testId}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-white/80 text-xs">{icon}</span>
        <span className="text-white/80 text-xs font-medium">{label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-6 rounded-full appearance-none cursor-pointer bg-white/20
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
        data-testid={`${testId}-slider`}
      />
    </div>
  );
}

// ── ControlCenter ──────────────────────────────────────────────

export function ControlCenter({ isOpen, onClose }: ControlCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Local toggle state (mock — not persisted to settings)
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airdrop, setAirdrop] = useState(false);
  const [dnd, setDnd] = useState(false);
  const [brightness, setBrightness] = useState(80);
  const [sound, setSound] = useState(60);

  // Settings store for appearance
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isOpen, onClose]);

  // No document mousedown listener — the backdrop div handles click-outside.
  // This avoids race conditions with menubar icon clicks.

  const cycleAppearance = useCallback(() => {
    if (appearance === 'light') setAppearance('dark');
    else if (appearance === 'dark') setAppearance('tinted');
    else setAppearance('light');
  }, [appearance, setAppearance]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 w-screen h-screen"
      style={{ zIndex: 1150, pointerEvents: 'none' }}
    >
      {/* Backdrop: covers full screen below the menubar, click closes panel */}
      <div
        className="absolute inset-0"
        style={{ top: 'var(--height-menubar)', pointerEvents: 'auto' }}
        onClick={onClose}
        data-testid="control-center-backdrop"
      />
      <div
        ref={panelRef}
        className="glass-surface-heavy bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-panel m-2 p-3 relative"
        style={{
          width: '320px',
          marginTop: 'calc(var(--height-menubar) + 4px)',
          boxShadow: 'var(--shadow-panel), var(--shadow-specular)',
          pointerEvents: 'auto',
        }}
        data-testid="control-center-panel"
      >
        {/* Connectivity grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <ToggleModule
            icon={<span className="text-sm font-bold">Wi-Fi</span>}
            label={wifi ? 'Home Network' : 'Off'}
            sublabel={wifi ? 'Connected' : 'Wi-Fi'}
            active={wifi}
            onToggle={() => setWifi(!wifi)}
            testId="cc-wifi"
          />
          <ToggleModule
            icon={<span className="text-sm font-bold">BT</span>}
            label="Bluetooth"
            sublabel={bluetooth ? 'On' : 'Off'}
            active={bluetooth}
            onToggle={() => setBluetooth(!bluetooth)}
            testId="cc-bluetooth"
          />
          <ToggleModule
            icon={<span className="text-xs font-bold">AirDrop</span>}
            label="AirDrop"
            sublabel={airdrop ? 'Everyone' : 'Contacts Only'}
            active={airdrop}
            onToggle={() => setAirdrop(!airdrop)}
            testId="cc-airdrop"
          />
          <ToggleModule
            icon={<span className="text-xs font-bold">DND</span>}
            label="Focus"
            sublabel={dnd ? 'On' : 'Off'}
            active={dnd}
            onToggle={() => setDnd(!dnd)}
            testId="cc-focus"
          />
        </div>

        {/* Sliders */}
        <div className="rounded-xl bg-white/10 p-1 mb-3">
          <Slider
            label="Display"
            icon={<span>☀</span>}
            value={brightness}
            onChange={setBrightness}
            testId="cc-brightness"
          />
          <Slider
            label="Sound"
            icon={<span>🔊</span>}
            value={sound}
            onChange={setSound}
            testId="cc-sound"
          />
        </div>

        {/* Appearance toggle */}
        <div className="rounded-xl bg-white/10 p-3 flex items-center justify-between">
          <span className="text-white/80 text-xs font-medium">Appearance</span>
          <button
            onClick={cycleAppearance}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-medium capitalize"
            data-testid="cc-appearance"
          >
            {appearance}
          </button>
        </div>
      </div>
    </div>
  );
}
