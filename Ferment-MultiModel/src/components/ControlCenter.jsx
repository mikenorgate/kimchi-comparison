import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SlidersHorizontal,
  Wifi,
  Bluetooth,
  Sun,
  Volume2,
  Plane,
  Moon,
  Flashlight,
  Cast,
} from 'lucide-react';
import SystemIcon from './SystemIcon.jsx';

/**
 * ControlCenter
 *
 * The tray-style Control Center used in the macOS Tahoe-style menu bar.
 * Renders a single toggle button (the "tray"). Clicking the tray opens
 * an absolutely-positioned dropdown panel anchored to the tray; clicking
 * the tray again, pressing Escape, or clicking outside the panel closes
 * it.
 *
 * The panel exposes approximate system toggles grouped into rows that
 * mimic the Tahoe Control Center layout:
 *   - Connectivity: Wi-Fi, Bluetooth
 *   - Media / Display: Brightness slider, Volume slider
 *   - Quick actions: Airplane Mode, Do Not Disturb, Flashlight,
 *     Screen Mirroring
 *
 * Each toggle is a real <button aria-pressed=...> with local React state;
 * each slider is a real <input type="range">. There is no real system
 * integration — this is a pure UI mock.
 *
 * Props:
 *   - className (string, optional): appended to the root wrapper.
 *   - onToggle (function, optional): invoked as `onToggle(id, value)` when
 *     a toggle button is clicked. `id` is one of the toggle ids below;
 *     `value` is the new boolean state. Not invoked for slider changes.
 *   - onClose (function, optional): invoked when the panel transitions
 *     from open to closed (tray click while open, Escape, outside click).
 */

export const CONTROL_CENTER_TOGGLE_IDS = Object.freeze([
  'wifi',
  'bluetooth',
  'airplane',
  'dnd',
  'flashlight',
  'screenMirror',
]);

export const CONTROL_CENTER_SLIDER_IDS = Object.freeze([
  'brightness',
  'volume',
]);

const TOGGLE_LABELS = Object.freeze({
  wifi: 'Wi-Fi',
  bluetooth: 'Bluetooth',
  airplane: 'Airplane Mode',
  dnd: 'Do Not Disturb',
  flashlight: 'Flashlight',
  screenMirror: 'Screen Mirroring',
});

const TOGGLE_ICONS = Object.freeze({
  wifi: Wifi,
  bluetooth: Bluetooth,
  airplane: Plane,
  dnd: Moon,
  flashlight: Flashlight,
  screenMirror: Cast,
});

const SLIDER_CONFIG = Object.freeze({
  brightness: {
    label: 'Brightness',
    icon: Sun,
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 80,
    formatValue: (v) => `${Math.round(v)}%`,
  },
  volume: {
    label: 'Volume',
    icon: Volume2,
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 60,
    formatValue: (v) => `${Math.round(v)}%`,
  },
});

const TRAY_LABEL = 'Control Center';

function ControlCenter({
  className = '',
  onToggle,
  onClose,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(true);
  const [airplane, setAirplane] = useState(false);
  const [dnd, setDnd] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [screenMirror, setScreenMirror] = useState(false);
  const [brightness, setBrightness] = useState(SLIDER_CONFIG.brightness.defaultValue);
  const [volume, setVolume] = useState(SLIDER_CONFIG.volume.defaultValue);

  const rootRef = useRef(null);
  const trayRef = useRef(null);

  const fireToggle = useCallback(
    (id, value) => {
      if (typeof onToggle === 'function') {
        onToggle(id, value);
      }
    },
    [onToggle],
  );

  const fireClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  const handleToggle = useCallback(
    (id) => {
      const setters = {
        wifi: [wifi, setWifi],
        bluetooth: [bluetooth, setBluetooth],
        airplane: [airplane, setAirplane],
        dnd: [dnd, setDnd],
        flashlight: [flashlight, setFlashlight],
        screenMirror: [screenMirror, setScreenMirror],
      };
      const pair = setters[id];
      if (!pair) return;
      const [current, setter] = pair;
      const next = !current;
      setter(next);
      fireToggle(id, next);
    },
    [
      wifi,
      bluetooth,
      airplane,
      dnd,
      flashlight,
      screenMirror,
      fireToggle,
    ],
  );

  // Close on Escape and on outside pointer events while open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        fireClose();
      }
    };

    const handlePointerDown = (event) => {
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && root.contains(event.target)) {
        return;
      }
      setIsOpen(false);
      fireClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, fireClose]);

  const handleTrayClick = useCallback(() => {
    if (isOpen) {
      setIsOpen(false);
      fireClose();
    } else {
      setIsOpen(true);
    }
  }, [isOpen, fireClose]);

  const trayClassName = [
    'inline-flex items-center justify-center w-7 h-7 rounded-md',
    'transition-colors focus:outline-none focus-visible:ring-2',
    'focus-visible:ring-white/70',
    isOpen ? 'bg-white/25' : 'hover:bg-white/15',
  ].join(' ');

  const panelClassName = [
    'absolute right-0 top-full mt-2 z-50',
    'w-72 p-3 text-gray-900 dark:text-gray-50',
    'window-glass',
  ].join(' ');

  return (
    <div
      ref={rootRef}
      data-testid="control-center-root"
      className={`relative inline-flex ${className}`.trim()}
    >
      <button
        ref={trayRef}
        type="button"
        data-testid="control-center-tray"
        aria-label={TRAY_LABEL}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title={TRAY_LABEL}
        onClick={handleTrayClick}
        className={trayClassName}
      >
        <SystemIcon
          icon={SlidersHorizontal}
          size="sm"
          className="text-white"
        />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label={TRAY_LABEL}
          data-testid="control-center-panel"
          className={panelClassName}
        >
          {/* Connectivity row */}
          <section
            data-testid="control-center-row-connectivity"
            aria-label="Connectivity"
            className="grid grid-cols-2 gap-2 mb-2"
          >
            <ToggleButton
              id="wifi"
              label={TOGGLE_LABELS.wifi}
              icon={TOGGLE_ICONS.wifi}
              pressed={wifi}
              onToggle={handleToggle}
            />
            <ToggleButton
              id="bluetooth"
              label={TOGGLE_LABELS.bluetooth}
              icon={TOGGLE_ICONS.bluetooth}
              pressed={bluetooth}
              onToggle={handleToggle}
            />
          </section>

          {/* Media / Display row */}
          <section
            data-testid="control-center-row-media"
            aria-label="Display and Sound"
            className="flex flex-col gap-2 mb-2 p-2 rounded-lg bg-white/40 dark:bg-white/5"
          >
            <SliderRow
              id="brightness"
              config={SLIDER_CONFIG.brightness}
              value={brightness}
              onChange={setBrightness}
            />
            <SliderRow
              id="volume"
              config={SLIDER_CONFIG.volume}
              value={volume}
              onChange={setVolume}
            />
          </section>

          {/* Quick actions row */}
          <section
            data-testid="control-center-row-quick"
            aria-label="Quick actions"
            className="grid grid-cols-2 gap-2"
          >
            <ToggleButton
              id="airplane"
              label={TOGGLE_LABELS.airplane}
              icon={TOGGLE_ICONS.airplane}
              pressed={airplane}
              onToggle={handleToggle}
            />
            <ToggleButton
              id="dnd"
              label={TOGGLE_LABELS.dnd}
              icon={TOGGLE_ICONS.dnd}
              pressed={dnd}
              onToggle={handleToggle}
            />
            <ToggleButton
              id="flashlight"
              label={TOGGLE_LABELS.flashlight}
              icon={TOGGLE_ICONS.flashlight}
              pressed={flashlight}
              onToggle={handleToggle}
            />
            <ToggleButton
              id="screenMirror"
              label={TOGGLE_LABELS.screenMirror}
              icon={TOGGLE_ICONS.screenMirror}
              pressed={screenMirror}
              onToggle={handleToggle}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}

/**
 * ToggleButton
 *
 * Internal helper for the round/square quick-toggle buttons inside the
 * panel. Always renders a real <button> with aria-pressed so screen
 * readers and tests can detect the on/off state.
 */
function ToggleButton({ id, label, icon: IconComponent, pressed, onToggle }) {
  const stateClass = pressed
    ? 'bg-blue-500/90 text-white shadow-inner ring-1 ring-blue-400/70'
    : 'bg-white/55 dark:bg-white/10 text-gray-800 dark:text-gray-100 hover:bg-white/70 dark:hover:bg-white/20';

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      data-testid={`control-center-toggle-${id}`}
      data-pressed={pressed ? 'true' : 'false'}
      onClick={() => onToggle(id)}
      className={[
        'flex items-center justify-center gap-2 h-10 px-3 rounded-lg',
        'text-sm font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70',
        stateClass,
      ].join(' ')}
    >
      {IconComponent ? (
        <SystemIcon icon={IconComponent} size="sm" strokeWidth={1.5} />
      ) : null}
      <span data-testid={`control-center-toggle-${id}-label`}>{label}</span>
    </button>
  );
}

/**
 * SliderRow
 *
 * Internal helper for the icon + label + range input rows in the
 * media/display section of the panel.
 */
function SliderRow({ id, config, value, onChange }) {
  const handleChange = (event) => {
    const next = Number(event.target.value);
    if (!Number.isNaN(next)) {
      onChange(next);
    }
  };

  const display = config.formatValue ? config.formatValue(value) : String(value);

  return (
    <div
      data-testid={`control-center-slider-${id}`}
      className="flex items-center gap-2"
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-100"
      >
        <SystemIcon icon={config.icon} size="sm" strokeWidth={1.5} />
      </span>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs">
          <label
            htmlFor={`control-center-slider-${id}-input`}
            className="font-medium"
          >
            {config.label}
          </label>
          <span
            data-testid={`control-center-slider-${id}-value`}
            className="tabular-nums text-gray-700 dark:text-gray-200"
          >
            {display}
          </span>
        </div>
        <input
          id={`control-center-slider-${id}-input`}
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={value}
          aria-label={config.label}
          aria-valuemin={config.min}
          aria-valuemax={config.max}
          aria-valuenow={value}
          data-testid={`control-center-slider-${id}-input`}
          onChange={handleChange}
          className="w-full accent-blue-500"
        />
      </div>
    </div>
  );
}

export default ControlCenter;
export {
  TRAY_LABEL,
  TOGGLE_LABELS,
  TOGGLE_ICONS,
  SLIDER_CONFIG,
};
