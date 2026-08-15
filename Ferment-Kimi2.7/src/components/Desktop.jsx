import { useState, useEffect, useRef } from 'react';
import './Desktop.css';

const contextMenuItems = [
  'New Folder',
  'Get Info',
  'View Options',
  null,
  'Import from iPhone',
  null,
  'Sort By',
  'Clean Up',
  'Clean Up By',
  null,
  'Show View Options',
  'Change Wallpaper…',
];

export default function Desktop({ children, onWallpaperChange, wallpaperStyle }) {
  const [menu, setMenu] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick() {
      setMenu(null);
    }
    if (menu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [menu]);

  function handleContextMenu(event) {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY });
  }

  return (
    <div
      ref={containerRef}
      className="desktop"
      style={wallpaperStyle}
      onContextMenu={handleContextMenu}
    >
      {children}
      {menu && (
        <div
          className="desktop-context-menu glass-menu"
          style={{ top: menu.y, left: menu.x }}
        >
          {contextMenuItems.map((item, i) =>
            item === null ? (
              <div key={i} className="context-menu-separator" />
            ) : (
              <button
                key={i}
                className="context-menu-item"
                onClick={() => {
                  if (item === 'Change Wallpaper…') {
                    onWallpaperChange?.();
                  }
                  setMenu(null);
                }}
              >
                {item}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
