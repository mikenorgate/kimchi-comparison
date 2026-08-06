import { Rnd } from 'react-rnd';
import { useWindowStore } from '../os/windowStore';
import { getApp } from '../os/appRegistry';
import type { WindowState } from '../os/types';
import './window.css';

export default function Window({ win }: { win: WindowState }) {
  const app = getApp(win.appId);
  const focusedId = useWindowStore((s) => s.focusedId);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize);
  const moveResize = useWindowStore((s) => s.moveResize);

  if (!app || win.minimized) return null;

  const isFocused = focusedId === win.id;

  return (
    <Rnd
      size={{ width: win.width, height: win.height }}
      position={{ x: win.x, y: win.y }}
      onDragStop={(_e, d) => moveResize(win.id, { x: d.x, y: d.y })}
      onResizeStop={(_e, _dir, ref, _delta, pos) =>
        moveResize(win.id, { width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y })
      }
      minWidth={app.minSize?.width ?? 300}
      minHeight={app.minSize?.height ?? 200}
      dragHandleClassName="window-titlebar"
      style={{ zIndex: win.z }}
      disableDragging={win.maximized}
      enableResizing={!win.maximized}
      onMouseDown={() => focusWindow(win.id)}
      bounds="parent"
    >
      <div className={`window-frame ${isFocused ? 'focused' : ''}`}>
        <div className="window-titlebar" onDoubleClick={() => toggleMaximize(win.id)}>
          <div className="window-controls">
            <button className="window-btn close" onClick={() => closeWindow(win.id)} />
            <button className="window-btn minimize" onClick={() => minimizeWindow(win.id)} />
            <button className="window-btn maximize" onClick={() => toggleMaximize(win.id)} />
          </div>
          <div className="window-title">{win.title}</div>
        </div>
        <div className="window-content">
          <app.component windowId={win.id} />
        </div>
      </div>
    </Rnd>
  );
}
