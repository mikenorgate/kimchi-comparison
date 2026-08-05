import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class MapsApp extends App {
  constructor() {
    super({ id: 'maps', name: 'Maps', width: 800, height: 560, emoji: '🗺️', iconGradient: ['#f1f2f6', '#dfe4ea'], iconColor: '#2f3542' });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'maps';
    root.innerHTML = `
      <div class="maps-search">
        <input type="text" id="search" placeholder="Search Maps" />
        <button id="go">🔍</button>
      </div>
      <div class="maps-canvas" id="canvas"></div>
      <div class="maps-info" id="info">Search for a location to begin.</div>
    `;

    const canvas = $('#canvas', root);
    const info = $('#info', root);
    const search = $('#search', root);

    const locations = {
      'apple park': 'Apple Park, Cupertino, CA',
      'golden gate': 'Golden Gate Bridge, San Francisco, CA',
      'central park': 'Central Park, New York, NY',
      'big ben': 'Big Ben, London, UK'
    };

    const drawMap = (label) => {
      canvas.innerHTML = '';
      for (let i = 0; i < 40; i++) {
        const b = document.createElement('div');
        b.className = 'map-block';
        b.style.left = Math.random() * 90 + '%';
        b.style.top = Math.random() * 90 + '%';
        b.style.width = Math.random() * 60 + 20 + 'px';
        b.style.height = Math.random() * 40 + 15 + 'px';
        canvas.appendChild(b);
      }
      const pin = document.createElement('div');
      pin.className = 'map-pin';
      pin.style.left = '50%';
      pin.style.top = '50%';
      pin.textContent = '📍';
      canvas.appendChild(pin);
      info.textContent = label;
    };

    $('#go', root).addEventListener('click', () => {
      const q = search.value.toLowerCase().trim();
      drawMap(locations[q] || `${search.value || 'Selected location'} (simulated)`);
    });

    search.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#go', root).click(); });
    drawMap('Apple Park, Cupertino, CA');
    return root;
  }
}

registerApp(new MapsApp());
