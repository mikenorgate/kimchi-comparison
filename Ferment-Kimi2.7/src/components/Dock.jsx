import { useState, useMemo } from 'react';
import { stockApps } from '../config/apps';
import { useWindows } from '../context/WindowContext';
import AppIcon from './AppIcon';
import './Dock.css';

export default function Dock() {
  const [hoveredId, setHoveredId] = useState(null);
  const { windows, activeId, openWindow, focusWindow, minimizeWindow } = useWindows();

  const openAppIds = useMemo(
    () => Array.from(new Set(windows.map((w) => w.appId))),
    [windows]
  );

  const activeWindow = useMemo(
    () => windows.find((w) => w.id === activeId),
    [windows, activeId]
  );
  const activeAppId = activeWindow?.appId || null;

  function handleAppClick(appId) {
    const existing = windows.find((w) => w.appId === appId);
    if (!existing) {
      openWindow(appId);
      return;
    }
    if (activeAppId === appId && !existing.minimized) {
      minimizeWindow(existing.id);
    } else {
      focusWindow(existing.id);
    }
  }

  return (
    <div className="dock-container">
      <div className="dock glass">
        {stockApps.map((app) => {
          const isOpen = openAppIds.includes(app.id);
          const isActive = activeAppId === app.id;
          return (
            <button
              key={app.id}
              className={`dock-item ${isOpen ? 'open' : ''} ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredId(app.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleAppClick(app.id)}
              aria-label={app.name}
            >
              <div className="dock-tooltip-wrapper">
                {hoveredId === app.id && (
                  <div className="dock-tooltip glass-menu">{app.name}</div>
                )}
              </div>
              <AppIcon app={app} size={46} variant="dock" />
              <div className="dock-indicator" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
