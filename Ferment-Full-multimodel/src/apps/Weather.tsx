import { useState } from 'react';

interface DailyForecast {
  label: string;
  icon: string;
  hi: number;
  lo: number;
}

interface CityWeather {
  id: string;
  name: string;
  current: {
    icon: string;
    tempF: number;
    condition: string;
    high: number;
    low: number;
    humidity: number;
    wind: number;
  };
  forecast: DailyForecast[];
}

const CITIES: CityWeather[] = [
  {
    id: 'sf',
    name: 'San Francisco',
    current: {
      icon: '⛅',
      tempF: 64,
      condition: 'Partly Cloudy',
      high: 68,
      low: 55,
      humidity: 72,
      wind: 12,
    },
    forecast: [
      { label: 'Today', icon: '⛅', hi: 68, lo: 55 },
      { label: 'Tue', icon: '☀️', hi: 71, lo: 57 },
      { label: 'Wed', icon: '☀️', hi: 73, lo: 58 },
      { label: 'Thu', icon: '🌤️', hi: 70, lo: 56 },
      { label: 'Fri', icon: '🌧️', hi: 64, lo: 54 },
    ],
  },
  {
    id: 'nyc',
    name: 'New York',
    current: {
      icon: '🌤️',
      tempF: 58,
      condition: 'Mostly Sunny',
      high: 62,
      low: 49,
      humidity: 55,
      wind: 9,
    },
    forecast: [
      { label: 'Today', icon: '🌤️', hi: 62, lo: 49 },
      { label: 'Tue', icon: '⛅', hi: 60, lo: 47 },
      { label: 'Wed', icon: '🌧️', hi: 55, lo: 45 },
      { label: 'Thu', icon: '⛈️', hi: 52, lo: 44 },
      { label: 'Fri', icon: '🌧️', hi: 54, lo: 46 },
    ],
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    current: {
      icon: '🌧️',
      tempF: 61,
      condition: 'Light Rain',
      high: 65,
      low: 56,
      humidity: 84,
      wind: 6,
    },
    forecast: [
      { label: 'Today', icon: '🌧️', hi: 65, lo: 56 },
      { label: 'Tue', icon: '⛅', hi: 68, lo: 58 },
      { label: 'Wed', icon: '☀️', hi: 72, lo: 60 },
      { label: 'Thu', icon: '☀️', hi: 74, lo: 61 },
      { label: 'Fri', icon: '🌤️', hi: 70, lo: 59 },
    ],
  },
  {
    id: 'london',
    name: 'London',
    current: {
      icon: '🌥️',
      tempF: 52,
      condition: 'Overcast',
      high: 56,
      low: 46,
      humidity: 78,
      wind: 14,
    },
    forecast: [
      { label: 'Today', icon: '🌥️', hi: 56, lo: 46 },
      { label: 'Tue', icon: '🌧️', hi: 53, lo: 45 },
      { label: 'Wed', icon: '🌧️', hi: 51, lo: 44 },
      { label: 'Thu', icon: '⛅', hi: 54, lo: 45 },
      { label: 'Fri', icon: '🌤️', hi: 58, lo: 47 },
    ],
  },
  {
    id: 'sydney',
    name: 'Sydney',
    current: {
      icon: '☀️',
      tempF: 78,
      condition: 'Sunny',
      high: 82,
      low: 68,
      humidity: 50,
      wind: 8,
    },
    forecast: [
      { label: 'Today', icon: '☀️', hi: 82, lo: 68 },
      { label: 'Tue', icon: '☀️', hi: 84, lo: 70 },
      { label: 'Wed', icon: '🌤️', hi: 80, lo: 67 },
      { label: 'Thu', icon: '⛅', hi: 76, lo: 64 },
      { label: 'Fri', icon: '🌦️', hi: 72, lo: 62 },
    ],
  },
];

export function Weather(): JSX.Element {
  const [cityId, setCityId] = useState<string>(CITIES[0]!.id);
  const city = CITIES.find((c) => c.id === cityId) ?? CITIES[0]!;

  return (
    <div className="weather-root">
      <div className="weather-current">
        <div className="weather-current__city">{city.name}</div>
        <div className="weather-current__icon">{city.current.icon}</div>
        <div className="weather-current__temp">{city.current.tempF}°</div>
        <div className="weather-current__cond">{city.current.condition}</div>
        <div className="weather-current__detail">
          <span>H: {city.current.high}°</span>
          <span>L: {city.current.low}°</span>
          <span>Humidity: {city.current.humidity}%</span>
          <span>Wind: {city.current.wind} mph</span>
        </div>
      </div>

      <div className="weather-forecast">
        <div className="weather-forecast__title">5-Day Forecast</div>
        <div className="weather-forecast__days">
          {city.forecast.map((day) => (
            <div className="weather-day" key={day.label}>
              <span className="weather-day__label">{day.label}</span>
              <span className="weather-day__icon">{day.icon}</span>
              <span className="weather-day__hi">{day.hi}°</span>
              <span className="weather-day__lo">{day.lo}°</span>
            </div>
          ))}
        </div>
      </div>

      <div className="weather-cities">
        {CITIES.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`weather-city-chip${c.id === cityId ? ' weather-city-chip--active' : ''}`}
            onClick={() => setCityId(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Weather;
