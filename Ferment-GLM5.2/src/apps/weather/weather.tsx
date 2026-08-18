import { useState, useEffect, useCallback } from 'react'

export interface WeatherCity {
  id: string
  name: string
  condition: string
  temp: number
  high: number
  low: number
  humidity: number
  wind: number
  forecast: ForecastDay[]
}

export interface ForecastDay {
  day: string
  icon: string
  condition: string
  high: number
  low: number
}

const CITIES_KEY = 'tahoe.weather-cities'

const WEATHER_ICONS: Record<string, string> = {
  'sunny': '☀️',
  'partly-cloudy': '⛅',
  'cloudy': '☁️',
  'rainy': '🌧️',
  'stormy': '⛈️',
  'snowy': '🌨️',
  'foggy': '🌫️',
  'windy': '💨',
}

const CONDITIONS = ['sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function genForecast(seed: number): ForecastDay[] {
  return DAYS.map((day, i) => {
    const c = CONDITIONS[(seed + i) % CONDITIONS.length]
    return {
      day,
      icon: WEATHER_ICONS[c],
      condition: c,
      high: 65 + ((seed + i * 3) % 25),
      low: 40 + ((seed + i * 2) % 20),
    }
  })
}

const DEFAULT_CITIES: WeatherCity[] = [
  { id: 'wc1', name: 'Cupertino', condition: 'sunny', temp: 78, high: 82, low: 62, humidity: 45, wind: 8, forecast: genForecast(0) },
  { id: 'wc2', name: 'San Francisco', condition: 'foggy', temp: 62, high: 68, low: 55, humidity: 78, wind: 15, forecast: genForecast(2) },
  { id: 'wc3', name: 'New York', condition: 'rainy', temp: 70, high: 75, low: 68, humidity: 85, wind: 12, forecast: genForecast(3) },
]

const AVAILABLE_CITIES = [
  'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Dubai', 'Mumbai', 'Toronto',
  'Chicago', 'Seattle', 'Miami', 'Denver', 'Barcelona', 'Rome', 'Amsterdam',
]

const genId = () => `wc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

function loadCities(): WeatherCity[] {
  try { const s = localStorage.getItem(CITIES_KEY); return s ? JSON.parse(s) : DEFAULT_CITIES } catch { return DEFAULT_CITIES }
}
function persistCities(c: WeatherCity[]) { try { localStorage.setItem(CITIES_KEY, JSON.stringify(c)) } catch {} }

function getConditionBg(condition: string): string {
  const map: Record<string, string> = {
    'sunny': 'linear-gradient(135deg, #4eb3e8, #8ecdf0)',
    'partly-cloudy': 'linear-gradient(135deg, #6ba3c8, #a8c8d8)',
    'cloudy': 'linear-gradient(135deg, #8a9ba8, #b0c0cc)',
    'rainy': 'linear-gradient(135deg, #4a6580, #6b8aa3)',
    'stormy': 'linear-gradient(135deg, #2a3a4a, #4a5a6a)',
    'snowy': 'linear-gradient(135deg, #b8d4e3, #d8e8f0)',
    'foggy': 'linear-gradient(135deg, #9a9a9a, #b8b8b8)',
    'windy': 'linear-gradient(135deg, #7a9aaa, #a0b8c8)',
  }
  return map[condition] || 'linear-gradient(135deg, #4eb3e8, #8ecdf0)'
}

export function Weather({ windowId: _windowId }: { windowId: string }) {
  const [cities, setCities] = useState<WeatherCity[]>(loadCities)
  const [selectedCityId, setSelectedCityId] = useState<string>(cities[0]?.id || '')
  const [searchInput, setSearchInput] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => { persistCities(cities) }, [cities])

  const selectedCity = cities.find((c) => c.id === selectedCityId) || cities[0]

  const addCity = useCallback((cityName: string) => {
    if (cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase())) return
    const seed = cityName.charCodeAt(0) + cityName.length
    const condition = CONDITIONS[seed % CONDITIONS.length]
    const city: WeatherCity = {
      id: genId(),
      name: cityName,
      condition,
      temp: 55 + (seed % 30),
      high: 65 + (seed % 25),
      low: 45 + (seed % 20),
      humidity: 40 + (seed % 50),
      wind: 5 + (seed % 20),
      forecast: genForecast(seed),
    }
    setCities((prev) => [...prev, city])
    setSelectedCityId(city.id)
    setShowAdd(false)
    setSearchInput('')
  }, [cities])

  const removeCity = useCallback((cityId: string) => {
    setCities((prev) => {
      const filtered = prev.filter((c) => c.id !== cityId)
      if (selectedCityId === cityId && filtered.length > 0) {
        setSelectedCityId(filtered[0].id)
      }
      return filtered
    })
  }, [selectedCityId])

  const availableToAdd = AVAILABLE_CITIES.filter(
    (c) => !cities.some((ec) => ec.name.toLowerCase() === c.toLowerCase())
  )

  if (!selectedCity) {
    return (
      <div data-testid="weather-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        No cities
      </div>
    )
  }

  return (
    <div data-testid="weather-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar */}
      <div data-testid="weather-sidebar" style={{ width: 200, borderRight: '0.5px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px 4px', textTransform: 'uppercase' }}>Cities</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cities.map((city) => (
            <button
              key={city.id}
              data-testid={`city-${city.id}`}
              onClick={() => setSelectedCityId(city.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                textAlign: 'left',
                padding: '6px 12px',
                border: 'none',
                background: selectedCityId === city.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              <span style={{ fontSize: 20 }}>{WEATHER_ICONS[city.condition]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{city.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{city.condition}</div>
              </div>
              <span style={{ fontSize: 16, fontWeight: 300 }}>{city.temp}°</span>
            </button>
          ))}
        </div>
        {showAdd ? (
          <div style={{ padding: '4px 12px' }}>
            <div style={{ maxHeight: 120, overflowY: 'auto' }}>
              {availableToAdd.map((cityName) => (
                <button
                  key={cityName}
                  data-testid={`add-city-${cityName.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => addCity(cityName)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '4px 8px',
                    border: '0.5px solid var(--glass-border)',
                    borderRadius: 4,
                    background: 'var(--glass-bg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >{cityName}</button>
              ))}
            </div>
          </div>
        ) : (
          <button
            data-testid="add-city-btn"
            onClick={() => setShowAdd(true)}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 13 }}
          >+ Add City</button>
        )}
      </div>

      {/* Detail view */}
      <div
        data-testid="weather-detail"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: getConditionBg(selectedCity.condition),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background circles */}
        <div data-testid="weather-bg" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '15%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', animation: 'weatherPulse 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'weatherPulse 10s ease-in-out infinite' }} />
        </div>

        {/* Current weather */}
        <div data-testid="current-weather" style={{ padding: '32px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div data-testid="city-name" style={{ fontSize: 24, fontWeight: 600, color: 'white' }}>{selectedCity.name}</div>
          <div data-testid="city-temp" style={{ fontSize: 72, fontWeight: 200, color: 'white', lineHeight: 1 }}>{selectedCity.temp}°</div>
          <div data-testid="city-condition" style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)' }}>
            {WEATHER_ICONS[selectedCity.condition]} {selectedCity.condition.replace('-', ' ')}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span data-testid="city-high" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>H: {selectedCity.high}°</span>
            <span data-testid="city-low" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>L: {selectedCity.low}°</span>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', gap: 12, padding: '0 24px 16px', position: 'relative', zIndex: 1 }}>
          <div data-testid="detail-humidity" style={detailCard}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Humidity</div>
            <div style={{ fontSize: 18, color: 'white', fontWeight: 600 }}>{selectedCity.humidity}%</div>
          </div>
          <div data-testid="detail-wind" style={detailCard}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Wind</div>
            <div style={{ fontSize: 18, color: 'white', fontWeight: 600 }}>{selectedCity.wind} mph</div>
          </div>
          <button data-testid="remove-city" onClick={() => removeCity(selectedCity.id)} style={{ ...detailCard, border: 'none', cursor: 'pointer', background: 'rgba(255,69,58,0.3)', color: 'white' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>Remove</div>
            <div style={{ fontSize: 18 }}>🗑</div>
          </button>
        </div>

        {/* Forecast */}
        <div data-testid="forecast" style={{ flex: 1, display: 'flex', gap: 4, padding: '8px 16px', overflowX: 'auto', position: 'relative', zIndex: 1 }}>
          {selectedCity.forecast.map((day, i) => (
            <div key={i} data-testid={`forecast-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', minWidth: 64 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{day.day}</div>
              <div style={{ fontSize: 24 }}>{day.icon}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{day.condition}</div>
              <div style={{ fontSize: 12, color: 'white' }}>
                <span style={{ fontWeight: 600 }}>{day.high}°</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}> {day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const detailCard: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
  padding: '8px 16px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.1)',
  minWidth: 80,
}
