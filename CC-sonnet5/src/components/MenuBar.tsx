import { useEffect, useState } from 'react';
import { useWindowStore } from '../os/windowStore';
import { useSystemStore } from '../os/systemStore';
import { getApp } from '../os/appRegistry';
import { menusForApp } from '../os/menuDefs';
import { useMenuActionStore } from '../os/menuActionStore';
import type { MenuEntry } from '../os/types';
import ControlCenter from './ControlCenter';
import './menubar.css';

export default function MenuBar() {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const lock = useSystemStore((s) => s.lock);
  const runAction = useMenuActionStore((s) => s.run);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showPowerModal, setShowPowerModal] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const focusedWindow = windows.find((w) => w.id === focusedId) ?? null;
  const app = focusedWindow ? getApp(focusedWindow.appId) : undefined;
  const menus = app ? menusForApp(app.id) : [];

  const handleItemClick = (actionKey?: string) => {
    setOpenMenu(null);
    if (!actionKey || !focusedWindow) return;
    if (actionKey === 'close') return closeWindow(focusedWindow.id);
    if (actionKey === 'minimize') return minimizeWindow(focusedWindow.id);
    if (actionKey === 'zoom') return toggleMaximize(focusedWindow.id);
    runAction(focusedWindow.id, actionKey);
  };

  const dateStr = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="menubar" onClick={() => setOpenMenu(null)}>
      <div className="menubar-left">
        <div className="menubar-item apple-menu" onClick={(e) => e.stopPropagation()}>
          <span className="apple-logo" onClick={() => setOpenMenu(openMenu === 'apple' ? null : 'apple')}>
            🍎
          </span>
          {openMenu === 'apple' && (
            <div className="menu-dropdown">
              <div
                className="menu-entry"
                onClick={() => {
                  setShowAbout(true);
                  setOpenMenu(null);
                }}
              >
                About This Mac
              </div>
              <div className="menu-separator" />
              <div
                className="menu-entry"
                onClick={() => {
                  windows.forEach((w) => closeWindow(w.id));
                  setOpenMenu(null);
                }}
              >
                Force Quit All
              </div>
              <div className="menu-separator" />
              <div
                className="menu-entry"
                onClick={() => {
                  lock();
                  setOpenMenu(null);
                }}
              >
                Lock Screen
              </div>
              <div
                className="menu-entry"
                onClick={() => {
                  lock();
                  setOpenMenu(null);
                }}
              >
                Log Out…
              </div>
              <div className="menu-separator" />
              {['Sleep', 'Restart…', 'Shut Down…'].map((label) => (
                <div
                  key={label}
                  className="menu-entry"
                  onClick={() => {
                    setShowPowerModal(label);
                    setOpenMenu(null);
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
        {app && <div className="menubar-item bold">{app.title}</div>}
        {menus.map((m) => (
          <div key={m.label} className="menubar-item" onClick={(e) => e.stopPropagation()}>
            <span onClick={() => setOpenMenu(openMenu === m.label ? null : m.label)}>{m.label}</span>
            {openMenu === m.label && (
              <div className="menu-dropdown">
                {m.items.map((item: MenuEntry, i) =>
                  'separator' in item && item.separator ? (
                    <div key={i} className="menu-separator" />
                  ) : (
                    <div
                      key={item.label}
                      className={`menu-entry ${item.disabled ? 'disabled' : ''}`}
                      onClick={() => !item.disabled && handleItemClick(item.actionKey)}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="menubar-right">
        <span className="menubar-icon" onClick={(e) => { e.stopPropagation(); setShowControlCenter((v) => !v); }}>
          ⌃
        </span>
        <span className="menubar-clock">
          {dateStr} {timeStr}
        </span>
      </div>

      {showControlCenter && <ControlCenter onClose={() => setShowControlCenter(false)} />}

      {showAbout && (
        <div className="modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🍎</div>
            <h3>macOS Tahoe</h3>
            <p>Version 26.0 (Web Edition)</p>
            <button onClick={() => setShowAbout(false)}>OK</button>
          </div>
        </div>
      )}

      {showPowerModal && (
        <div className="modal-overlay" onClick={() => setShowPowerModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>{showPowerModal}</h3>
            <p>This is a web demo — nothing will actually happen.</p>
            <button onClick={() => setShowPowerModal(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
