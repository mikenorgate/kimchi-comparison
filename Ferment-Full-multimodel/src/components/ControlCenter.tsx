import { useCallback, useEffect, useRef, useState } from 'react';

import {
  Airplay,
  Bell,
  Bluetooth,
  Focus,
  Moon,
  Sun,
  Volume2,
  Wifi,
} from 'lucide-react';

import { useOSStore } from '../store/osStore';
import type { Appearance } from '../types/os';
import { IconButton } from './ui/IconButton';

interface ToggleStates {
  wifi: boolean;
  bluetooth: boolean;
  airdrop: boolean;
  focus: boolean;
}

const INITIAL_TOGGLES: ToggleStates = {
  wifi: true,
  bluetooth: true,
  airdrop: false,
  focus: false,
};

/**
 * Dropdown panel from the menu bar with mock system toggles (Wi-Fi,
 * Bluetooth, AirDrop), appearance / focus mode, brightness / sound sliders,
 * and quick toggles.
 */
export function ControlCenter(): JSX.Element {
  const isOpen = useOSStore((state) => state.controlCenterOpen);
  const closeControlCenter = useOSStore((state) => state.closeControlCenter);
  const appearance = useOSStore((state) => state.appearance);
  const setAppearance = useOSStore((state) => state.setAppearance);

  const [toggles, setToggles] = useState<ToggleStates>(INITIAL_TOGGLES);
  const [brightness, setBrightness] = useState(80);
  const [sound, setSound] = useState(60);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Click-outside: close when clicking anywhere outside the panel. The menu
  // bar toggle button itself sits outside the panel so we must not close
  // when clicking it (handled by App-level toggle).
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (event: globalThis.MouseEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      // Don't close when clicking the menu bar (its toggle button handles
      // re-opening).
      const menuBar = document.querySelector('.menubar');
      if (menuBar && menuBar.contains(target)) return;
      closeControlCenter();
    };
    const handleKey = (event: globalThis.KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeControlCenter();
      }
    };
    // Defer attaching the click handler so the click that opened this
    // overlay doesn't immediately close it.
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 0);
    document.addEventListener('keydown', handleKey, true);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey, true);
    };
  }, [closeControlCenter, isOpen]);

  const toggle = useCallback((key: keyof ToggleStates) => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const toggleAppearance = useCallback(() => {
    setAppearance(appearance === 'light' ? 'dark' : 'light');
  }, [appearance, setAppearance]);

  if (!isOpen) return <></>;

  return (
    <div
      ref={containerRef}
      className="control-center"
      role="dialog"
      aria-modal="false"
      aria-label="Control Center"
    >
      <section className="control-center__section">
        <div className="control-center__section-row">
          <button
            type="button"
            className={[
              'control-center__tile',
              toggles.wifi ? 'control-center__tile--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => toggle('wifi')}
            aria-pressed={toggles.wifi}
            aria-label="Wi-Fi"
          >
            <span className="control-center__tile-icon">
              <Wifi aria-hidden="true" />
            </span>
            <span className="control-center__tile-label">Wi-Fi</span>
          </button>
          <button
            type="button"
            className={[
              'control-center__tile',
              toggles.bluetooth ? 'control-center__tile--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => toggle('bluetooth')}
            aria-pressed={toggles.bluetooth}
            aria-label="Bluetooth"
          >
            <span className="control-center__tile-icon">
              <Bluetooth aria-hidden="true" />
            </span>
            <span className="control-center__tile-label">Bluetooth</span>
          </button>
        </div>
        <div className="control-center__section-row">
          <button
            type="button"
            className={[
              'control-center__tile',
              toggles.airdrop ? 'control-center__tile--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => toggle('airdrop')}
            aria-pressed={toggles.airdrop}
            aria-label="AirDrop"
          >
            <span className="control-center__tile-icon">
              <Airplay aria-hidden="true" />
            </span>
            <span className="control-center__tile-label">AirDrop</span>
          </button>
          <button
            type="button"
            className={[
              'control-center__tile',
              toggles.focus ? 'control-center__tile--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => toggle('focus')}
            aria-pressed={toggles.focus}
            aria-label="Focus"
          >
            <span className="control-center__tile-icon">
              <Focus aria-hidden="true" />
            </span>
            <span className="control-center__tile-label">Focus</span>
          </button>
        </div>
      </section>

      <section className="control-center__section">
        <div className="control-center__slider-row">
          <span className="control-center__slider-icon" aria-hidden="true">
            <Sun />
          </span>
          <input
            className="control-center__slider"
            type="range"
            min={0}
            max={100}
            value={brightness}
            onChange={(event) => setBrightness(Number(event.target.value))}
            aria-label="Brightness"
          />
        </div>
        <div className="control-center__slider-row">
          <span className="control-center__slider-icon" aria-hidden="true">
            <Volume2 />
          </span>
          <input
            className="control-center__slider"
            type="range"
            min={0}
            max={100}
            value={sound}
            onChange={(event) => setSound(Number(event.target.value))}
            aria-label="Sound"
          />
        </div>
      </section>

      <section className="control-center__section">
        <div className="control-center__section-row">
          <button
            type="button"
            className={[
              'control-center__tile',
              appearance === 'light' ? 'control-center__tile--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setAppearance('light' as Appearance)}
            aria-pressed={appearance === 'light'}
            aria-label="Light appearance"
          >
            <span className="control-center__tile-icon">
              <Sun aria-hidden="true" />
            </span>
            <span className="control-center__tile-label">Light</span>
          </button>
          <button
            type="button"
            className={[
              'control-center__tile',
              appearance === 'dark' ? 'control-center__tile--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setAppearance('dark' as Appearance)}
            aria-pressed={appearance === 'dark'}
            aria-label="Dark appearance"
          >
            <span className="control-center__tile-icon">
              <Moon aria-hidden="true" />
            </span>
            <span className="control-center__tile-label">Dark</span>
          </button>
          <button
            type="button"
            className="control-center__tile"
            onClick={toggleAppearance}
            aria-label="Toggle appearance"
          >
            <span className="control-center__tile-icon">
              <Bell aria-hidden="true" />
            </span>
            <span className="control-center__tile-label">Toggle</span>
          </button>
        </div>
      </section>

      <section className="control-center__section">
        <div className="control-center__heading">Quick actions</div>
        <div style={{ display: 'flex', gap: 8, padding: '0 4px' }}>
          <IconButton label="Wi-Fi" active={toggles.wifi} onClick={() => toggle('wifi')}>
            <Wifi />
          </IconButton>
          <IconButton label="Bluetooth" active={toggles.bluetooth} onClick={() => toggle('bluetooth')}>
            <Bluetooth />
          </IconButton>
          <IconButton label="Focus" active={toggles.focus} onClick={() => toggle('focus')}>
            <Focus />
          </IconButton>
        </div>
      </section>
    </div>
  );
}

export default ControlCenter;
