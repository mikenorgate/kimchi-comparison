import { useState } from 'react';
import { useSystemStore, WALLPAPERS } from '../../os/systemStore';
import './settings.css';

const SECTIONS = ['Appearance', 'Wallpaper', 'Dock', 'Sound', 'About'] as const;
type Section = (typeof SECTIONS)[number];

export default function Settings(_props: { windowId: string }) {
  const [section, setSection] = useState<Section>('Appearance');
  const system = useSystemStore();

  return (
    <div className="settings">
      <div className="settings-sidebar">
        {SECTIONS.map((s) => (
          <div key={s} className={`settings-nav-item ${section === s ? 'active' : ''}`} onClick={() => setSection(s)}>
            {s}
          </div>
        ))}
      </div>
      <div className="settings-content">
        {section === 'Appearance' && (
          <div>
            <h2>Appearance</h2>
            <div className="settings-row">
              <button
                className={`settings-theme-btn ${system.theme === 'light' ? 'active' : ''}`}
                onClick={() => system.setTheme('light')}
              >
                ☀️ Light
              </button>
              <button
                className={`settings-theme-btn ${system.theme === 'dark' ? 'active' : ''}`}
                onClick={() => system.setTheme('dark')}
              >
                🌙 Dark
              </button>
            </div>
          </div>
        )}

        {section === 'Wallpaper' && (
          <div>
            <h2>Wallpaper</h2>
            <div className="settings-wallpaper-grid">
              {WALLPAPERS.map((w) => (
                <div
                  key={w.id}
                  className={`settings-wallpaper-swatch ${system.wallpaperId === w.id ? 'active' : ''}`}
                  style={{ background: w.gradient }}
                  onClick={() => system.setWallpaper(w.id)}
                  title={w.name}
                />
              ))}
            </div>
          </div>
        )}

        {section === 'Dock' && (
          <div>
            <h2>Dock &amp; Menu Bar</h2>
            <label className="settings-label">Size</label>
            <input
              type="range"
              min={40}
              max={80}
              value={system.dockSize}
              onChange={(e) => system.setDockSize(Number(e.target.value))}
            />
            <label className="settings-label">Position on screen</label>
            <div className="settings-row">
              {(['left', 'bottom', 'right'] as const).map((p) => (
                <button
                  key={p}
                  className={`settings-theme-btn ${system.dockPosition === p ? 'active' : ''}`}
                  onClick={() => system.setDockPosition(p)}
                >
                  {p[0].toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {section === 'Sound' && (
          <div>
            <h2>Sound &amp; Display</h2>
            <label className="settings-label">Output Volume</label>
            <input
              type="range"
              min={0}
              max={100}
              value={system.volume}
              onChange={(e) => system.setVolume(Number(e.target.value))}
            />
            <label className="settings-label">Brightness</label>
            <input
              type="range"
              min={10}
              max={100}
              value={system.brightness}
              onChange={(e) => system.setBrightness(Number(e.target.value))}
            />
          </div>
        )}

        {section === 'About' && (
          <div>
            <h2>About This Mac</h2>
            <div className="settings-about">
              <div className="settings-about-icon">🍎</div>
              <div>
                <div className="settings-about-title">macOS Tahoe</div>
                <div>Version 26.0 (Web Edition)</div>
                <div>Chip: Browser Engine</div>
                <div>Memory: Whatever your tab has</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
