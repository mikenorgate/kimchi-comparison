import { App, registerApp } from '../../js/appRegistry.js';


class WeatherApp extends App {
  constructor() {
    super({ id: 'weather', name: 'Weather', width: 480, height: 520, canResize: false, emoji: '🌤️', iconGradient: ['#4facfe', '#00f2fe'], iconColor: '#fff' });
    this.cities = [
      { name: 'Cupertino', temp: 72, condition: 'Sunny' },
      { name: 'San Francisco', temp: 64, condition: 'Foggy' },
      { name: 'New York', temp: 58, condition: 'Cloudy' },
      { name: 'London', temp: 54, condition: 'Rainy' }
    ];
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'weather';
    const city = this.cities[0];
    root.innerHTML = `
      <div class="weather-current">
        <div class="weather-city">${city.name}</div>
        <div class="weather-temp">${city.temp}°</div>
        <div class="weather-cond">${city.condition}</div>
        <div class="weather-hl">H:${city.temp + 8}° L:${city.temp - 7}°</div>
      </div>
      <div class="weather-forecast">
        <h4>5-Day Forecast</h4>
        ${['Today','Tue','Wed','Thu','Fri'].map((d, i) => `<div class="wf-row"><span>${d}</span><span>${city.temp + (i - 2) * 3}°</span></div>`).join('')}
      </div>
      <div class="weather-cities">
        ${this.cities.map(c => `<div class="wc-city">${c.name}<span>${c.temp}°</span></div>`).join('')}
      </div>
    `;
    return root;
  }
}

registerApp(new WeatherApp());
