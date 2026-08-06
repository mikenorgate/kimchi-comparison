import { useMemo, useState } from 'react';
import { useSystemStore, WALLPAPERS } from '../os/systemStore';
import { useFsStore } from '../os/fsStore';
import { useWindowStore } from '../os/windowStore';
import './desktop.css';

export default function Desktop({ children }: { children: React.ReactNode }) {
  const wallpaperId = useSystemStore((s) => s.wallpaperId);
  const setWallpaper = useSystemStore((s) => s.setWallpaper);
  const wallpaper = WALLPAPERS.find((w) => w.id === wallpaperId) ?? WALLPAPERS[0];
  const nodes = useFsStore((s) => s.nodes);
  const desktopChildren = useMemo(() => nodes.filter((n) => n.parentId === 'desktop'), [nodes]);
  const createFolder = useFsStore((s) => s.createFolder);
  const openApp = useWindowStore((s) => s.openApp);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [wallpaperPicker, setWallpaperPicker] = useState(false);

  return (
    <div
      className="desktop"
      style={{ background: wallpaper.gradient }}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => setMenu(null)}
    >
      <div className="desktop-icons">
        {desktopChildren.map((n) => (
          <div key={n.id} className="desktop-icon" onDoubleClick={() => n.type === 'folder' && openApp('finder')}>
            <div className="desktop-icon-glyph">{n.type === 'folder' ? '📁' : '📝'}</div>
            <div className="desktop-icon-label">{n.name}</div>
          </div>
        ))}
      </div>

      {children}

      {menu && (
        <div className="desktop-context" style={{ left: menu.x, top: menu.y }} onClick={(e) => e.stopPropagation()}>
          <div
            className="desktop-context-item"
            onClick={() => {
              createFolder('desktop');
              setMenu(null);
            }}
          >
            New Folder
          </div>
          <div
            className="desktop-context-item"
            onClick={() => {
              setWallpaperPicker(true);
              setMenu(null);
            }}
          >
            Change Wallpaper…
          </div>
        </div>
      )}

      {wallpaperPicker && (
        <div className="wallpaper-picker-overlay" onClick={() => setWallpaperPicker(false)}>
          <div className="wallpaper-picker" onClick={(e) => e.stopPropagation()}>
            <h3>Choose a Wallpaper</h3>
            <div className="wallpaper-picker-grid">
              {WALLPAPERS.map((w) => (
                <div
                  key={w.id}
                  className={`wallpaper-swatch ${wallpaperId === w.id ? 'active' : ''}`}
                  style={{ background: w.gradient }}
                  onClick={() => {
                    setWallpaper(w.id);
                    setWallpaperPicker(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
