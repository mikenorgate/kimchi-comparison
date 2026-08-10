/* ============================================
   App: Weather
   ============================================ */

const Weather = {
  currentLocation: 'Cupertino, CA',
  currentTemp: 72,
  currentCondition: 'Mostly Sunny',
  currentHigh: 78,
  currentLow: 58,

  hourlyForecast: [
    { hour: 'Now', temp: 72, icon: 'sun' },
    { hour: '1PM', temp: 73, icon: 'sun' },
    { hour: '2PM', temp: 75, icon: 'sun' },
    { hour: '3PM', temp: 76, icon: 'partly' },
    { hour: '4PM', temp: 75, icon: 'partly' },
    { hour: '5PM', temp: 73, icon: 'partly' },
    { hour: '6PM', temp: 70, icon: 'cloudy' },
    { hour: '7PM', temp: 67, icon: 'cloudy' },
    { hour: '8PM', temp: 64, icon: 'cloudy' },
    { hour: '9PM', temp: 62, icon: 'clear' },
    { hour: '10PM', temp: 60, icon: 'clear' },
    { hour: '11PM', temp: 59, icon: 'clear' },
  ],

  dailyForecast: [
    { day: 'Today', high: 78, low: 58, icon: 'sun', precip: '0%' },
    { day: 'Mon', high: 80, low: 60, icon: 'sun', precip: '0%' },
    { day: 'Tue', high: 82, low: 62, icon: 'partly', precip: '10%' },
    { day: 'Wed', high: 75, low: 58, icon: 'cloudy', precip: '30%' },
    { day: 'Thu', high: 68, low: 54, icon: 'rain', precip: '80%' },
    { day: 'Fri', high: 70, low: 55, icon: 'partly', precip: '20%' },
    { day: 'Sat', high: 76, low: 58, icon: 'sun', precip: '0%' },
    { day: 'Sun', high: 79, low: 60, icon: 'sun', precip: '0%' },
  ],

  extraInfo: [
    { label: 'UV INDEX', value: '6', sub: 'High' },
    { label: 'SUNSET', value: '8:12 PM', sub: 'Sunrise: 6:18 AM' },
    { label: 'WIND', value: '8 mph', sub: 'SW' },
    { label: 'HUMIDITY', value: '45%', sub: 'Dew point: 52°' },
    { label: 'VISIBILITY', value: '10 mi', sub: 'Clear' },
    { label: 'PRESSURE', value: '30.12', sub: 'Rising' },
  ],

  weatherIcons: {
    sun: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="8" fill="#ffd60a"/><g stroke="#ffd60a" stroke-width="2" stroke-linecap="round"><line x1="20" y1="2" x2="20" y2="8"/><line x1="20" y1="32" x2="20" y2="38"/><line x1="2" y1="20" x2="8" y2="20"/><line x1="32" y1="20" x2="38" y2="20"/><line x1="7" y1="7" x2="11" y2="11"/><line x1="29" y1="29" x2="33" y2="33"/><line x1="7" y1="33" x2="11" y2="29"/><line x1="29" y1="11" x2="33" y2="7"/></g></svg>`,
    partly: `<svg viewBox="0 0 40 40"><circle cx="14" cy="14" r="6" fill="#ffd60a"/><path d="M18 28 Q12 28 12 22 Q12 16 18 16 Q20 12 26 12 Q34 12 34 20 Q38 20 38 26 Q38 32 32 32 L18 32 Q14 32 14 28 Q14 28 18 28 Z" fill="#e0e0e0"/></svg>`,
    cloudy: `<svg viewBox="0 0 40 40"><path d="M10 26 Q4 26 4 20 Q4 14 10 14 Q12 10 18 10 Q26 10 26 18 Q30 18 30 24 Q30 30 24 30 L10 30 Q6 30 6 26 Q6 26 10 26 Z" fill="#ccc"/></svg>`,
    rain: `<svg viewBox="0 0 40 40"><path d="M10 22 Q4 22 4 16 Q4 10 10 10 Q12 6 18 6 Q26 6 26 14 Q30 14 30 20 Q30 26 24 26 L10 26 Q6 26 6 22 Q6 22 10 22 Z" fill="#aaa"/><g stroke="#4a90d9" stroke-width="2" stroke-linecap="round"><line x1="12" y1="30" x2="10" y2="36"/><line x1="20" y1="30" x2="18" y2="36"/><line x1="28" y1="30" x2="26" y2="36"/></g></svg>`,
    clear: `<svg viewBox="0 0 40 40"><path d="M24 4 A12 12 0 1 0 24 28 A10 10 0 1 1 24 4 Z" fill="#ffd60a"/></svg>`,
  },

  render(container, winData) {
    container.innerHTML = `
      <div class="weather-app">
        <div class="weather-current">
          <div class="weather-location">${this.currentLocation}</div>
          <div class="weather-temp">${this.currentTemp}°</div>
          <div class="weather-condition">${this.currentCondition}</div>
          <div class="weather-hilo">H:${this.currentHigh}° L:${this.currentLow}°</div>
        </div>
        <div class="weather-hourly">
          ${this.hourlyForecast.map(h => `
            <div class="weather-hour">
              <div>${h.hour}</div>
              <div class="hour-icon">${this.weatherIcons[h.icon]}</div>
              <div>${h.temp}°</div>
            </div>
          `).join('')}
        </div>
        <div class="weather-daily">
          ${this.dailyForecast.map(d => `
            <div class="weather-day-row">
              <div class="day-name">${d.day}</div>
              <div class="day-precip">${d.precip}</div>
              <div class="day-icon">${this.weatherIcons[d.icon]}</div>
              <div class="day-temps">
                <span class="temp-low">${d.low}°</span>
                <span class="temp-high">${d.high}°</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px;">
          ${this.extraInfo.map(info => `
            <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
              <div style="font-size:10px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.5px;">${info.label}</div>
              <div style="font-size:24px;font-weight:300;margin:4px 0;">${info.value}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.6);">${info.sub}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },
};
