import { useState } from 'react';
import './Settings.css';

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'display', label: 'Displays', icon: '🖥️' },
  { id: 'sound', label: 'Sound', icon: '🔊' },
  { id: 'network', label: 'Network', icon: '🌐' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
  { id: 'users', label: 'Users & Groups', icon: '👤' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [prefs, setPrefs] = useState({
    darkMode: false,
    autoHideDock: false,
    nightShift: false,
    reduceMotion: false,
    doNotDisturb: false,
    locationServices: true,
    analytics: false,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const section = SETTINGS_SECTIONS.find((s) => s.id === activeSection) || SETTINGS_SECTIONS[0];

  return (
    <div className="settings" data-testid="settings-app">
      <aside className="settings-sidebar">
        <div className="settings-search">
          <input type="search" placeholder="Search settings" aria-label="Search settings" />
        </div>
        {SETTINGS_SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`settings-row ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            <span className="settings-row-icon">{s.icon}</span>
            <span className="settings-row-label">{s.label}</span>
          </button>
        ))}
      </aside>
      <main className="settings-main">
        <header className="settings-header">
          <span className="settings-header-icon">{section.icon}</span>
          <h2 className="settings-header-title">{section.label}</h2>
        </header>
        {activeSection === 'general' && (
          <div className="settings-panel">
            <div className="settings-group">
              <span className="settings-label">About This Mac</span>
              <span className="settings-value">macOS Tahoe 26.0 · MacBook Pro</span>
            </div>
            <div className="settings-group">
              <span className="settings-label">Software Update</span>
              <span className="settings-value">Your Mac is up to date.</span>
            </div>
            <div className="settings-group">
              <span className="settings-label">Default web browser</span>
              <select className="settings-select">
                <option>Safari</option>
                <option>Chrome</option>
                <option>Firefox</option>
              </select>
            </div>
          </div>
        )}
        {activeSection === 'appearance' && (
          <div className="settings-panel">
            <ToggleRow label="Dark mode" checked={prefs.darkMode} onChange={() => toggle('darkMode')} />
            <ToggleRow label="Auto-hide Dock" checked={prefs.autoHideDock} onChange={() => toggle('autoHideDock')} />
            <ToggleRow label="Reduce motion" checked={prefs.reduceMotion} onChange={() => toggle('reduceMotion')} />
          </div>
        )}
        {activeSection === 'display' && (
          <div className="settings-panel">
            <ToggleRow label="Night Shift" checked={prefs.nightShift} onChange={() => toggle('nightShift')} />
            <div className="settings-group">
              <span className="settings-label">Brightness</span>
              <input type="range" min="0" max="100" defaultValue="75" className="settings-slider" aria-label="Brightness" />
            </div>
          </div>
        )}
        {activeSection === 'sound' && (
          <div className="settings-panel">
            <div className="settings-group">
              <span className="settings-label">Output volume</span>
              <input type="range" min="0" max="100" defaultValue="50" className="settings-slider" aria-label="Output volume" />
            </div>
            <ToggleRow label="Mute" checked={prefs.doNotDisturb} onChange={() => toggle('doNotDisturb')} />
          </div>
        )}
        {activeSection === 'network' && (
          <div className="settings-panel">
            <div className="settings-group">
              <span className="settings-label">Wi-Fi</span>
              <span className="settings-value">Connected to LiquidGlass</span>
            </div>
            <div className="settings-group">
              <span className="settings-label">Bluetooth</span>
              <span className="settings-value">On</span>
            </div>
          </div>
        )}
        {activeSection === 'notifications' && (
          <div className="settings-panel">
            <ToggleRow label="Do Not Disturb" checked={prefs.doNotDisturb} onChange={() => toggle('doNotDisturb')} />
          </div>
        )}
        {activeSection === 'privacy' && (
          <div className="settings-panel">
            <ToggleRow label="Location Services" checked={prefs.locationServices} onChange={() => toggle('locationServices')} />
            <ToggleRow label="Share Mac analytics" checked={prefs.analytics} onChange={() => toggle('analytics')} />
          </div>
        )}
        {activeSection === 'users' && (
          <div className="settings-panel">
            <div className="settings-group">
              <span className="settings-label">Current user</span>
              <span className="settings-value">Developer (Admin)</span>
            </div>
            <div className="settings-group">
              <span className="settings-label">Login items</span>
              <span className="settings-value">Finder, Docker, Music</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="settings-row toggle">
      <span className="settings-label">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} />
      <span className="settings-toggle" aria-hidden="true" />
    </label>
  );
}
