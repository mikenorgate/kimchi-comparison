import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './ControlCenter.css';

export default function ControlCenter({ open, onClose }) {
  const [brightness, setBrightness] = useState(75);
  const [volume, setVolume] = useState(50);
  const [connectivity, setConnectivity] = useState({
    wifi: true,
    bluetooth: true,
    airdrop: true,
    cellular: false,
  });
  const [focus, setFocus] = useState('off');
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';

  const toggle = (key) => {
    setConnectivity((c) => ({ ...c, [key]: !c[key] }));
  };

  if (!open) return null;

  return (
    <div className="control-center-overlay" onClick={onClose} role="presentation" data-testid="control-center-overlay">
      <div
        className="control-center-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Control Center"
      >
        <div className="control-center-grid">
          <div className="control-center-connectivity">
            <button
              className={`cc-toggle ${connectivity.wifi ? 'active' : ''}`}
              onClick={() => toggle('wifi')}
              aria-pressed={connectivity.wifi}
              aria-label="Wi-Fi"
            >
              <span className="cc-toggle-icon">📶</span>
              <span className="cc-toggle-label">Wi-Fi</span>
              <span className="cc-toggle-status">{connectivity.wifi ? 'On' : 'Off'}</span>
            </button>
            <button
              className={`cc-toggle ${connectivity.bluetooth ? 'active' : ''}`}
              onClick={() => toggle('bluetooth')}
              aria-pressed={connectivity.bluetooth}
            >
              <span className="cc-toggle-icon">🔵</span>
              <span className="cc-toggle-label">Bluetooth</span>
              <span className="cc-toggle-status">{connectivity.bluetooth ? 'On' : 'Off'}</span>
            </button>
            <button
              className={`cc-toggle ${connectivity.airdrop ? 'active' : ''}`}
              onClick={() => toggle('airdrop')}
              aria-pressed={connectivity.airdrop}
            >
              <span className="cc-toggle-icon">⧉</span>
              <span className="cc-toggle-label">AirDrop</span>
              <span className="cc-toggle-status">{connectivity.airdrop ? 'On' : 'Off'}</span>
            </button>
            <button
              className={`cc-toggle ${connectivity.cellular ? 'active' : ''}`}
              onClick={() => toggle('cellular')}
              aria-pressed={connectivity.cellular}
            >
              <span className="cc-toggle-icon">📡</span>
              <span className="cc-toggle-label">Cellular</span>
              <span className="cc-toggle-status">{connectivity.cellular ? 'On' : 'Off'}</span>
            </button>
          </div>

          <div className="control-center-focus">
            <button
              className={`cc-focus ${focus === 'on' ? 'active' : ''}`}
              onClick={() => setFocus((f) => (f === 'on' ? 'off' : 'on'))}
              aria-pressed={focus === 'on'}
            >
              <span className="cc-focus-icon">🌙</span>
              <span className="cc-focus-label">Focus</span>
              <span className="cc-focus-status">{focus === 'on' ? 'On' : 'Off'}</span>
            </button>
            <button
              className={`cc-focus ${darkMode ? 'active' : ''}`}
              onClick={toggleTheme}
              aria-pressed={darkMode}
            >
              <span className="cc-focus-icon">◐</span>
              <span className="cc-focus-label">Dark Mode</span>
              <span className="cc-focus-status">{darkMode ? 'On' : 'Off'}</span>
            </button>
          </div>

          <div className="control-center-slider-card">
            <div className="cc-slider-row">
              <span className="cc-slider-icon">☀️</span>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                aria-label="Brightness"
                className="cc-slider"
              />
            </div>
            <div className="cc-slider-row">
              <span className="cc-slider-icon">🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="cc-slider"
              />
            </div>
          </div>

          <div className="control-center-music">
            <div className="cc-music-info">
              <span className="cc-music-title">Not Playing</span>
              <span className="cc-music-subtitle">Music</span>
            </div>
            <div className="cc-music-controls">
              <button aria-label="Previous">⏮</button>
              <button aria-label="Play">▶</button>
              <button aria-label="Next">⏭</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
