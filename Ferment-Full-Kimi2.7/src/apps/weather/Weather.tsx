import { useState, useCallback } from 'react'
import { Search, Wind, Droplets, Cloud, Sun, CloudRain, CloudSnow, CloudLightning } from 'lucide-react'
import type { WeatherCondition, ForecastDay } from './types'

const mockedData: Record<string, WeatherCondition & { forecast: ForecastDay[] }> = {
  Cupertino: {
    id: 'cupertino',
    city: 'Cupertino',
    tempC: 18,
    condition: 'Partly Cloudy',
    highC: 22,
    lowC: 14,
    humidity: 62,
    windKph: 12,
    forecast: [
      { day: 'Today', highC: 22, lowC: 14, condition: 'Partly Cloudy' },
      { day: 'Tue', highC: 24, lowC: 15, condition: 'Sunny' },
      { day: 'Wed', highC: 20, lowC: 13, condition: 'Cloudy' },
      { day: 'Thu', highC: 18, lowC: 12, condition: 'Rainy' },
      { day: 'Fri', highC: 21, lowC: 14, condition: 'Partly Cloudy' },
    ],
  },
  London: {
    id: 'london',
    city: 'London',
    tempC: 13,
    condition: 'Rainy',
    highC: 15,
    lowC: 9,
    humidity: 78,
    windKph: 18,
    forecast: [
      { day: 'Today', highC: 15, lowC: 9, condition: 'Rainy' },
      { day: 'Tue', highC: 14, lowC: 8, condition: 'Cloudy' },
      { day: 'Wed', highC: 16, lowC: 10, condition: 'Partly Cloudy' },
      { day: 'Thu', highC: 13, lowC: 8, condition: 'Rainy' },
      { day: 'Fri', highC: 15, lowC: 9, condition: 'Cloudy' },
    ],
  },
  Tokyo: {
    id: 'tokyo',
    city: 'Tokyo',
    tempC: 24,
    condition: 'Sunny',
    highC: 27,
    lowC: 20,
    humidity: 55,
    windKph: 10,
    forecast: [
      { day: 'Today', highC: 27, lowC: 20, condition: 'Sunny' },
      { day: 'Tue', highC: 28, lowC: 21, condition: 'Sunny' },
      { day: 'Wed', highC: 26, lowC: 20, condition: 'Partly Cloudy' },
      { day: 'Thu', highC: 24, lowC: 19, condition: 'Cloudy' },
      { day: 'Fri', highC: 25, lowC: 20, condition: 'Rainy' },
    ],
  },
}

function cToF(c: number) {
  return Math.round((c * 9) / 5 + 32)
}

function ConditionIcon({ condition }: { condition: string }) {
  switch (condition) {
    case 'Sunny':
      return <Sun className="w-full h-full text-yellow-400" />
    case 'Rainy':
      return <CloudRain className="w-full h-full text-blue-300" />
    case 'Cloudy':
      return <Cloud className="w-full h-full text-gray-300" />
    case 'Snowy':
      return <CloudSnow className="w-full h-full text-white" />
    case 'Thunderstorm':
      return <CloudLightning className="w-full h-full text-yellow-300" />
    default:
      return <Sun className="w-full h-full text-yellow-400" />
  }
}

export function Weather() {
  const [city, setCity] = useState('Cupertino')
  const [input, setInput] = useState('')
  const [unit, setUnit] = useState<'C' | 'F'>('C')

  const data = mockedData[city] ?? mockedData['Cupertino']

  const displayTemp = useCallback((c: number) => {
    return unit === 'C' ? `${c}°` : `${cToF(c)}°`
  }, [unit])

  const handleSearch = useCallback(() => {
    const query = input.trim()
    if (!query) return
    const match = Object.keys(mockedData).find((name) => name.toLowerCase() === query.toLowerCase())
    if (match) {
      setCity(match)
    } else {
      setCity('Cupertino')
    }
    setInput('')
  }, [input])

  return (
    <div className="flex flex-col h-full bg-tahoe-surface text-tahoe-text overflow-auto p-4" data-testid="weather-app">
      <div className="flex items-center gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch()
          }}
          placeholder="Search city"
          className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm outline-none placeholder-white/40"
          data-testid="weather-search-input"
        />
        <button
          onClick={handleSearch}
          className="p-2 rounded-lg bg-tahoe-accent text-white hover:brightness-110"
          data-testid="weather-search-button"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
          data-testid="weather-unit-toggle"
        >
          °{unit}
        </button>
      </div>

      <div className="flex items-center justify-between bg-white/5 rounded-2xl p-5 mb-4" data-testid="weather-current">
        <div>
          <h2 className="text-2xl font-semibold" data-testid="weather-city">{data.city}</h2>
          <div className="text-sm text-tahoe-text-secondary" data-testid="weather-condition">{data.condition}</div>
          <div className="text-6xl font-light mt-2" data-testid="weather-temp">{displayTemp(data.tempC)}</div>
          <div className="text-sm text-tahoe-text-secondary mt-1">
            H: {displayTemp(data.highC)}  L: {displayTemp(data.lowC)}
          </div>
        </div>
        <div className="w-24 h-24">
          <ConditionIcon condition={data.condition} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3" data-testid="weather-humidity">
          <Droplets className="w-6 h-6 text-blue-300" />
          <div>
            <div className="text-xs text-tahoe-text-secondary">Humidity</div>
            <div className="text-lg font-medium">{data.humidity}%</div>
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 flex items-center gap-3" data-testid="weather-wind">
          <Wind className="w-6 h-6 text-gray-300" />
          <div>
            <div className="text-xs text-tahoe-text-secondary">Wind</div>
            <div className="text-lg font-medium">{data.windKph} km/h</div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-4" data-testid="weather-forecast">
        <h3 className="text-sm font-semibold text-tahoe-text-secondary mb-3">5-Day Forecast</h3>
        <div className="space-y-2">
          {data.forecast.map((day) => (
            <div key={day.day} className="flex items-center justify-between py-1" data-testid={`weather-day-${day.day.toLowerCase()}`}>
              <span className="w-16 text-sm">{day.day}</span>
              <div className="w-6 h-6">
                <ConditionIcon condition={day.condition} />
              </div>
              <div className="text-sm text-tahoe-text-secondary w-24 text-right">
                {displayTemp(day.lowC)} / {displayTemp(day.highC)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
