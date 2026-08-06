import { useEffect, useState } from 'react';
import { useSystemStore, WALLPAPERS } from '../os/systemStore';
import './lockscreen.css';

export default function LockScreen() {
  const unlock = useSystemStore((s) => s.unlock);
  const wallpaperId = useSystemStore((s) => s.wallpaperId);
  const [now, setNow] = useState(() => new Date());
  const wallpaper = WALLPAPERS.find((w) => w.id === wallpaperId) ?? WALLPAPERS[0];

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    const handler = () => unlock();
    window.addEventListener('keydown', handler);
    return () => {
      clearInterval(t);
      window.removeEventListener('keydown', handler);
    };
  }, [unlock]);

  return (
    <div className="lockscreen" style={{ background: wallpaper.gradient }} onClick={unlock}>
      <div className="lockscreen-time">{now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</div>
      <div className="lockscreen-date">
        {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
      <div className="lockscreen-hint">Click or press any key to unlock</div>
    </div>
  );
}
