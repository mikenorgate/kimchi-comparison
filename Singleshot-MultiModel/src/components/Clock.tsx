import { useEffect, useState } from 'react';

function format(now: Date): string {
  // macOS clock: e.g. "Mon 10:24 AM"
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[now.getDay()];
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${hours}:${minutes} ${ampm}`;
}

/**
 * Live clock used in the menu bar. Updates once a minute; uses a single
 * setInterval so it does not thrash React with each tick.
 */
export default function Clock() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    // Tick every 30 seconds so the displayed minute flips near the boundary
    // without firing off a render every second.
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span
      data-testid="menu-bar-clock"
      className="select-none px-2 py-1 text-xs text-white/90"
    >
      {format(now)}
    </span>
  );
}
