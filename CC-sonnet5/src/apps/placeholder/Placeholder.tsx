import { getApp } from '../../os/appRegistry';
import { useWindowStore } from '../../os/windowStore';
import './placeholder.css';

export default function Placeholder({ windowId }: { windowId: string }) {
  const win = useWindowStore((s) => s.windows.find((w) => w.id === windowId));
  const app = win ? getApp(win.appId) : undefined;

  return (
    <div className="placeholder-app">
      <div className="placeholder-icon" style={{ background: app?.color }}>
        {app?.icon}
      </div>
      <div className="placeholder-title">{app?.title}</div>
      <div className="placeholder-sub">This app isn't implemented yet in this demo.</div>
    </div>
  );
}
