import { useMemo, useState } from 'react'
import { Cloud, CloudRain, Heart, Search, Snowflake, Sun, Wind } from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/**
 * Weather — city list, current conditions + forecast from a bundled mock
 * dataset, favorites persisted.
 *
 * All weather data is a static bundled dataset (no network). The left sidebar
 * lists all cities with a search filter; favorites are pinned to the top and
 * persisted to localStorage. Selecting a city shows its current conditions
 * (temperature, condition, high/low) and a 5-day forecast.
 */

type Condition = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy'

interface ForecastDay {
  day: string
  cond: Condition
  high: number
  low: number
}

interface CityWeather {
  id: string
  city: string
  region: string
  temp: number
  cond: Condition
  high: number
  low: number
  humidity: number
  wind: number
  forecast: ForecastDay[]
}

const STORAGE_KEY = 'tahoe.weather.favorites'

const DATASET: CityWeather[] = [
  {
    id: 'cupertino', city: 'Cupertino', region: 'California',
    temp: 72, cond: 'sunny', high: 78, low: 58, humidity: 45, wind: 8,
    forecast: [
      { day: 'Mon', cond: 'sunny', high: 78, low: 58 },
      { day: 'Tue', cond: 'sunny', high: 80, low: 60 },
      { day: 'Wed', cond: 'cloudy', high: 74, low: 56 },
      { day: 'Thu', cond: 'rainy', high: 68, low: 54 },
      { day: 'Fri', cond: 'sunny', high: 75, low: 57 },
    ],
  },
  {
    id: 'new-york', city: 'New York', region: 'New York',
    temp: 64, cond: 'cloudy', high: 70, low: 52, humidity: 60, wind: 12,
    forecast: [
      { day: 'Mon', cond: 'cloudy', high: 70, low: 52 },
      { day: 'Tue', cond: 'rainy', high: 66, low: 50 },
      { day: 'Wed', cond: 'rainy', high: 64, low: 48 },
      { day: 'Thu', cond: 'cloudy', high: 68, low: 50 },
      { day: 'Fri', cond: 'sunny', high: 72, low: 54 },
    ],
  },
  {
    id: 'london', city: 'London', region: 'United Kingdom',
    temp: 55, cond: 'rainy', high: 58, low: 47, humidity: 80, wind: 15,
    forecast: [
      { day: 'Mon', cond: 'rainy', high: 58, low: 47 },
      { day: 'Tue', cond: 'rainy', high: 56, low: 46 },
      { day: 'Wed', cond: 'cloudy', high: 60, low: 49 },
      { day: 'Thu', cond: 'cloudy', high: 62, low: 50 },
      { day: 'Fri', cond: 'sunny', high: 64, low: 52 },
    ],
  },
  {
    id: 'tokyo', city: 'Tokyo', region: 'Japan',
    temp: 79, cond: 'windy', high: 83, low: 70, humidity: 65, wind: 18,
    forecast: [
      { day: 'Mon', cond: 'windy', high: 83, low: 70 },
      { day: 'Tue', cond: 'sunny', high: 85, low: 72 },
      { day: 'Wed', cond: 'sunny', high: 86, low: 73 },
      { day: 'Thu', cond: 'cloudy', high: 80, low: 71 },
      { day: 'Fri', cond: 'rainy', high: 76, low: 68 },
    ],
  },
  {
    id: 'reykjavik', city: 'Reykjavik', region: 'Iceland',
    temp: 30, cond: 'snowy', high: 34, low: 22, humidity: 75, wind: 22,
    forecast: [
      { day: 'Mon', cond: 'snowy', high: 34, low: 22 },
      { day: 'Tue', cond: 'snowy', high: 32, low: 20 },
      { day: 'Wed', cond: 'cloudy', high: 36, low: 24 },
      { day: 'Thu', cond: 'windy', high: 38, low: 26 },
      { day: 'Fri', cond: 'snowy', high: 33, low: 21 },
    ],
  },
  {
    id: 'sydney', city: 'Sydney', region: 'Australia',
    temp: 68, cond: 'sunny', high: 74, low: 60, humidity: 55, wind: 10,
    forecast: [
      { day: 'Mon', cond: 'sunny', high: 74, low: 60 },
      { day: 'Tue', cond: 'sunny', high: 76, low: 62 },
      { day: 'Wed', cond: 'cloudy', high: 72, low: 58 },
      { day: 'Thu', cond: 'rainy', high: 68, low: 56 },
      { day: 'Fri', cond: 'sunny', high: 73, low: 59 },
    ],
  },
]

const CONDITION_META: Record<Condition, { label: string; icon: typeof Sun }> = {
  sunny: { label: 'Sunny', icon: Sun },
  cloudy: { label: 'Cloudy', icon: Cloud },
  rainy: { label: 'Rainy', icon: CloudRain },
  snowy: { label: 'Snowy', icon: Snowflake },
  windy: { label: 'Windy', icon: Wind },
}

export function Weather() {
  const [favorites, setFavorites] = usePersistentState<string[]>(STORAGE_KEY, ['cupertino'])
  const [selectedId, setSelectedId] = useState<string>('cupertino')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = q
      ? DATASET.filter((c) => c.city.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
      : DATASET
    // Favorites first, then the rest, preserving dataset order within each.
    const favs = matches.filter((c) => favorites.includes(c.id))
    const rest = matches.filter((c) => !favorites.includes(c.id))
    return [...favs, ...rest]
  }, [query, favorites])

  const selected = DATASET.find((c) => c.id === selectedId) ?? DATASET[0]

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
  }

  const SelectedIcon = CONDITION_META[selected.cond].icon
  const isFav = favorites.includes(selected.id)

  return (
    <div data-testid="weather-content" className="flex h-full text-[13px]">
      {/* Sidebar */}
      <aside className="flex w-52 flex-col border-r border-black/10 bg-black/[0.04]">
        <div className="p-2">
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              data-testid="weather-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city"
              className="w-full rounded-md border border-black/10 py-1 pl-7 pr-2 outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
        <div data-testid="weather-list" className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-black/40">No cities found.</div>
          ) : (
            filtered.map((c) => {
              const active = c.id === selectedId
              const Icon = CONDITION_META[c.cond].icon
              return (
                <div
                  key={c.id}
                  data-testid="weather-city"
                  data-city-id={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`group flex cursor-pointer items-center justify-between px-3 py-2 ${
                    active ? 'bg-[var(--accent)]/15' : 'hover:bg-black/5'
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      data-testid="weather-city-name"
                      className={`truncate font-medium ${active ? 'text-[var(--accent)]' : 'text-black/80'}`}
                    >
                      {c.city}
                    </div>
                    <div className="truncate text-[11px] text-black/40">{c.region}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-black/50" />
                    <span data-testid="weather-city-temp" className="text-[12px] text-black/60">
                      {c.temp}°
                    </span>
                    {favorites.includes(c.id) && (
                      <Heart size={11} className="fill-[var(--accent)] text-[var(--accent)]" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Detail */}
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Current conditions */}
        <div data-testid="weather-current" className="px-6 pt-6 pb-4 text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <h2 data-testid="weather-city-title" className="text-lg font-semibold">
              {selected.city}
            </h2>
            <button
              data-testid="weather-favorite-toggle"
              onClick={() => toggleFavorite(selected.id)}
              className="rounded-md p-1 hover:bg-black/10"
              aria-label="Toggle favorite"
            >
              <Heart
                size={15}
                className={isFav ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-black/40'}
              />
            </button>
          </div>
          <div data-testid="weather-region" className="text-[12px] text-black/50">
            {selected.region}
          </div>
          <div className="my-3 flex items-center justify-center">
            <SelectedIcon size={56} className="text-[var(--accent)]" />
          </div>
          <div data-testid="weather-temp" className="text-5xl font-extralight">
            {selected.temp}°
          </div>
          <div data-testid="weather-condition" className="mt-1 text-[14px] text-black/60">
            {CONDITION_META[selected.cond].label}
          </div>
          <div className="mt-1 flex items-center justify-center gap-3 text-[12px] text-black/50">
            <span>H:{selected.high}°</span>
            <span>L:{selected.low}°</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-black/5 px-4">
          <div className="bg-white/70 p-3 text-center">
            <div className="text-[11px] text-black/40">Humidity</div>
            <div data-testid="weather-humidity" className="text-[15px] font-medium">
              {selected.humidity}%
            </div>
          </div>
          <div className="bg-white/70 p-3 text-center">
            <div className="text-[11px] text-black/40">Wind</div>
            <div data-testid="weather-wind" className="text-[15px] font-medium">
              {selected.wind} mph
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div data-testid="weather-forecast" className="mt-2 px-4 pb-4">
          <div className="mb-1 px-2 text-[11px] font-medium text-black/40">
            5-DAY FORECAST
          </div>
          <div data-testid="weather-forecast-days" className="divide-y divide-black/5">
            {selected.forecast.map((f) => {
              const Icon = CONDITION_META[f.cond].icon
              return (
                <div
                  key={f.day}
                  data-testid="weather-forecast-day"
                  className="flex items-center gap-3 px-2 py-2"
                >
                  <span data-testid="weather-forecast-day-name" className="w-10 text-[13px]">
                    {f.day}
                  </span>
                  <Icon size={18} className="text-black/50" />
                  <span data-testid="weather-forecast-cond" className="flex-1 text-[12px] text-black/50">
                    {CONDITION_META[f.cond].label}
                  </span>
                  <span data-testid="weather-forecast-high" className="text-[13px] font-medium">
                    {f.high}°
                  </span>
                  <span data-testid="weather-forecast-low" className="w-8 text-right text-[13px] text-black/40">
                    {f.low}°
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Weather
