import { useState } from 'react';
import { APPS } from '../os/appRegistry';
import { useWindowStore } from '../os/windowStore';
import { useSystemStore } from '../os/systemStore';
import './dock.css';

export default function Dock() {
  const openApp = useWindowStore((s) => s.openApp);
  const windows = useWindowStore((s) => s.windows);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const dockSize = useSystemStore((s) => s.dockSize);
  const dockPosition = useSystemStore((s) => s.dockPosition);
  const [hovered, setHovered] = useState<string | null>(null);
  const [contextApp, setContextApp] = useState<string | null>(null);

  const handleClick = (appId: string) => {
    const running = windows.filter((w) => w.appId === appId);
    if (running.length === 0) {
      openApp(appId);
      return;
    }
    const minimized = running.filter((w) => w.minimized);
    if (minimized.length === running.length) {
      minimized.forEach((w) => restoreWindow(w.id));
    } else {
      focusWindow(running[0].id);
    }
  };

  const isRunning = (appId: string) => windows.some((w) => w.appId === appId);

  return (
    <div className={`dock-wrap dock-${dockPosition}`} onClick={() => setContextApp(null)}>
      <div className="dock" style={{ '--dock-size': `${dockSize}px` } as React.CSSProperties}>
        {APPS.map((app) => (
          <div
            key={app.id}
            className="dock-item-wrap"
            onMouseEnter={() => setHovered(app.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {hovered === app.id && <div className="dock-tooltip">{app.title}</div>}
            <div
              className={`dock-item ${hovered === app.id ? 'hover' : ''}`}
              style={{ background: app.color }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick(app.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextApp(contextApp === app.id ? null : app.id);
              }}
            >
              <span className="dock-icon">{app.icon}</span>
            </div>
            {isRunning(app.id) && <div className="dock-dot" />}
            {contextApp === app.id && (
              <div className="dock-context" onClick={(e) => e.stopPropagation()}>
                <div
                  className="dock-context-item"
                  onClick={() => {
                    handleClick(app.id);
                    setContextApp(null);
                  }}
                >
                  Open
                </div>
                {isRunning(app.id) && (
                  <div
                    className="dock-context-item"
                    onClick={() => {
                      windows.filter((w) => w.appId === app.id).forEach((w) => closeWindow(w.id));
                      setContextApp(null);
                    }}
                  >
                    Quit
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
