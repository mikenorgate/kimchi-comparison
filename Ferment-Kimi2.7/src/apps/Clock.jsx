import { useEffect, useState } from 'react'

export const WORLD_CITIES = [
  { id: 'cupertino', name: 'Cupertino', timeZone: 'America/Los_Angeles' },
  { id: 'new-york', name: 'New York', timeZone: 'America/New_York' },
  { id: 'london', name: 'London', timeZone: 'Europe/London' },
  { id: 'tokyo', name: 'Tokyo', timeZone: 'Asia/Tokyo' },
]

export function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
}

export function formatCityTime(date, timeZone) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone })
}

export function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div data-testid="clock-app" style={{ padding: 'var(--space-lg)' }}>
      <div data-testid="clock-time" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-light)', marginBottom: 'var(--space-md)' }}>
        {formatTime(now)}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
        World Clock
      </div>
      {WORLD_CITIES.map((city) => (
        <div
          key={city.id}
          data-testid={`clock-city-${city.id}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-sm)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span>{city.name}</span>
          <span data-testid={`clock-city-time-${city.id}`}>{formatCityTime(now, city.timeZone)}</span>
        </div>
      ))}
    </div>
  )
}

export default Clock
