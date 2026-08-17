'use client';

import { useEffect, useMemo, useState } from 'react';

interface WorldClock {
  id: string;
  city: string;
  region: string;
  timeZone: string;
}

const WORLD_CLOCKS: WorldClock[] = [
  { id: 'cupertino', city: 'Cupertino', region: 'USA', timeZone: 'America/Los_Angeles' },
  { id: 'new-york', city: 'New York', region: 'USA', timeZone: 'America/New_York' },
  { id: 'london', city: 'London', region: 'UK', timeZone: 'Europe/London' },
  { id: 'tokyo', city: 'Tokyo', region: 'Japan', timeZone: 'Asia/Tokyo' },
];

function formatLocalTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatLocalDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatWorldTime(date: Date, timeZone: string) {
  return date.toLocaleTimeString('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatWorldOffset(date: Date, timeZone: string) {
  const localOffset = date.getTimezoneOffset();
  const targetDate = new Date(date.toLocaleString('en-US', { timeZone }));
  const targetOffset = (date.getTime() - targetDate.getTime()) / 60_000 + localOffset;
  const hours = Math.round(targetOffset / 60);
  if (hours === 0) return 'same time';
  return `${hours > 0 ? '+' : ''}${hours} HRS`;
}

export function Clock() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const localTime = useMemo(() => (now ? formatLocalTime(now) : '--:--:--'), [now]);
  const localDate = useMemo(() => (now ? formatLocalDate(now) : '...'), [now]);

  return (
    <div className="flex h-full w-full flex-col bg-background p-6" data-testid="clock">
      <div className="flex flex-col items-center justify-center py-8">
        <div
          data-testid="clock-local-time"
          className="text-6xl font-light tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {localTime}
        </div>
        <div
          data-testid="clock-local-date"
          className="mt-2 text-lg text-muted-foreground"
        >
          {localDate}
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-auto">
        <h3 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          World Clock
        </h3>
        <div className="divide-y divide-border rounded-xl border border-border" data-testid="clock-world-list">
          {WORLD_CLOCKS.map((city) => (
            <div
              key={city.id}
              data-testid={`clock-city-${city.id}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <div data-testid={`clock-city-name-${city.id}`} className="font-medium">
                  {city.city}
                </div>
                <div data-testid={`clock-city-region-${city.id}`} className="text-xs text-muted-foreground">
                  {city.region}
                </div>
              </div>
              <div className="text-right">
                <div data-testid={`clock-city-time-${city.id}`} className="text-xl font-light">
                  {now ? formatWorldTime(now, city.timeZone) : '--:--'}
                </div>
                <div data-testid={`clock-city-offset-${city.id}`} className="text-xs text-muted-foreground">
                  {now ? formatWorldOffset(now, city.timeZone) : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
