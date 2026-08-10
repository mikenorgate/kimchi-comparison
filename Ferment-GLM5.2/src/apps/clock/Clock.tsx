import { useState, useEffect } from 'react';

interface CityClock { id: string; city: string; timezone: number; }

const CITIES: CityClock[] = [
  { id: 'c1', city: 'Cupertino', timezone: -7 },
  { id: 'c2', city: 'New York', timezone: -4 },
  { id: 'c3', city: 'London', timezone: 1 },
  { id: 'c4', city: 'Tokyo', timezone: 9 },
  { id: 'c5', city: 'Sydney', timezone: 10 },
];

export function Clock({ appId: _appId }: { appId: string }) {
  const [now, setNow] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState('c1');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selected = CITIES.find(c => c.id === selectedCity)!;
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utcTime + selected.timezone * 3600000);
  const hours = cityTime.getHours();
  const minutes = cityTime.getMinutes();
  const seconds = cityTime.getSeconds();
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex h-full w-full" data-testid="clock-root">
      <div className="w-48 shrink-0 border-r border-black/5 dark:border-white/5 p-2 overflow-y-auto" data-testid="clock-sidebar">
        {CITIES.map(city => {
          const ut = new Date(utcTime + city.timezone * 3600000);
          return (
            <button
              key={city.id}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCity === city.id ? 'bg-[#0a84ff] text-white' : 'text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              onClick={() => setSelectedCity(city.id)}
              data-testid={`clock-city-${city.id}`}
            >
              <span>{city.city}</span>
              <span className="text-xs opacity-70">{ut.getHours().toString().padStart(2, '0')}:{ut.getMinutes().toString().padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4" data-testid="clock-face">
        <div className="text-lg font-medium text-black/70 dark:text-white/70" data-testid="clock-city-name">{selected.city}</div>
        <div className="relative w-40 h-40 rounded-full border-4 border-black/10 dark:border-white/10">
          <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-black/60 dark:bg-white/60 rounded-full origin-bottom" style={{ transform: `translate(-50%, -100%) rotate(${hourAngle}deg)` }} />
          <div className="absolute top-1/2 left-1/2 w-0.5 h-16 bg-black/60 dark:bg-white/60 rounded-full origin-bottom" style={{ transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)` }} />
          <div className="absolute top-1/2 left-1/2 w-0.5 rounded-full bg-[#ff5f57] origin-bottom" style={{ transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`, height: '72px' }} />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-black/60 dark:bg-white/60 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-3xl font-thin tabular-nums text-black/80 dark:text-white/80" data-testid="clock-time">{timeStr}</div>
      </div>
    </div>
  );
}
