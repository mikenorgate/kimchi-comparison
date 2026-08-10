import { useState } from 'react';

interface DayForecast { day: string; high: number; low: number; icon: string; condition: string; }

const SEED_FORECAST: DayForecast[] = [
  { day: 'Today', high: 72, low: 58, icon: '☀️', condition: 'Sunny' },
  { day: 'Tue', high: 68, low: 55, icon: '⛅', condition: 'Partly Cloudy' },
  { day: 'Wed', high: 65, low: 52, icon: '🌧', condition: 'Rain' },
  { day: 'Thu', high: 70, low: 56, icon: '☀️', condition: 'Sunny' },
  { day: 'Fri', high: 74, low: 60, icon: '⛅', condition: 'Partly Cloudy' },
  { day: 'Sat', high: 78, low: 62, icon: '☀️', condition: 'Sunny' },
  { day: 'Sun', high: 75, low: 59, icon: '⛅', condition: 'Partly Cloudy' },
];

export function Weather({ appId: _appId }: { appId: string }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const day = SEED_FORECAST[selectedDay];
  return (
    <div className="flex flex-col h-full w-full" data-testid="weather-root">
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-400 to-blue-600 text-white" data-testid="weather-main">
        <div className="text-lg font-medium" data-testid="weather-city">Cupertino</div>
        <div className="text-7xl font-thin">{day.high}°</div>
        <div className="text-4xl">{day.icon}</div>
        <div className="text-sm opacity-80" data-testid="weather-condition">{day.condition}</div>
        <div className="text-sm opacity-60">H:{day.high}° L:{day.low}°</div>
      </div>
      <div className="border-t border-black/5 dark:border-white/5 p-3 overflow-x-auto" data-testid="weather-forecast">
        <div className="flex gap-4">
          {SEED_FORECAST.map((d, i) => (
            <button
              key={i}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-16 ${
                selectedDay === i ? 'bg-[#0a84ff]/15' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              onClick={() => setSelectedDay(i)}
              data-testid={`weather-day-${i}`}
            >
              <span className="text-xs font-medium text-black/70 dark:text-white/70">{d.day}</span>
              <span className="text-2xl">{d.icon}</span>
              <span className="text-xs text-black/50 dark:text-white/50">{d.high}°</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
