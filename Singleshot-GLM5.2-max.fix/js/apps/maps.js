// Maps — stylized map with search + pins. (No external tile service.)
import { glyph } from '../icons.js';
import { toast } from '../store.js';

export const windowConfig = { width: 880, height: 560 };

const PLACES = [
  { name:'Apple Park',      lat:37.33, lng:-122.01, x:55, y:48 },
  { name:'Cupertino',        lat:37.32, lng:-122.03, x:50, y:52 },
  { name:'San Francisco',   lat:37.77, lng:-122.42, x:42, y:30 },
  { name:'Sausalito',       lat:37.86, lng:-122.49, x:40, y:24 },
  { name:'Oakland',         lat:37.80, lng:-122.27, x:48, y:30 },
  { name:'Palo Alto',       lat:37.44, lng:-122.14, x:62, y:54 },
  { name:'San Jose',        lat:37.34, lng:-121.89, x:60, y:62 },
  { name:'Half Moon Bay',   lat:37.46, lng:-122.43, x:30, y:54 },
  { name:'Fremont',         lat:37.55, lng:-121.99, x:68, y:58 },
];

export function mount(el) {
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%">
      <div style="padding:8px 12px;border-bottom:0.5px solid rgba(0,0,0,.1);display:flex;gap:8px;align-items:center">
        <div class="nav-btn" data-act="back" style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;opacity:.7">${glyph('chevronLeft',16)}</div>
        <div class="nav-btn" data-act="fwd" style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;opacity:.7">${glyph('chevronRight',16)}</div>
        <input class="field" placeholder="Search Maps" data-search style="flex:1;text-align:center" />
      </div>
      <div style="flex:1;position:relative;overflow:hidden" data-mapwrap>
        <div data-map style="position:absolute;inset:0;cursor:grab"></div>
        <div data-info style="position:absolute;bottom:10px;left:10px;background:var(--glass-bg);backdrop-filter:blur(20px);padding:10px 14px;border-radius:12px;box-shadow:var(--glass-shadow);max-width:240px;display:none;color:var(--text);border:0.5px solid var(--glass-border)"></div>
      </div>
    </div>
  `;
  const map = el.querySelector('[data-map]');
  const search = el.querySelector('[data-search]');
  const info = el.querySelector('[data-info]');

  // Stylized vector-ish map background (CSS gradients + roads)
  map.innerHTML = `
    <div style="position:absolute;inset:0;background:
      radial-gradient(circle at 30% 40%,#d8e8d0 0%,transparent 30%),
      radial-gradient(circle at 70% 60%,#d0e0f0 0%,transparent 35%),
      linear-gradient(135deg,#e8f0e8 0%,#d8e8e0 50%,#d0dfe8 100%)">
    </div>
    <svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <!-- water -->
      <path d="M0 0 L40 0 L35 30 L30 40 L20 55 L0 60 Z" fill="#a0d8f0" opacity="0.7"/>
      <path d="M0 80 L100 75 L100 100 L0 100 Z" fill="#a0d8f0" opacity="0.5"/>
      <!-- parks -->
      <ellipse cx="65" cy="35" rx="10" ry="8" fill="#b0d890" opacity="0.6"/>
      <ellipse cx="30" cy="70" rx="8" ry="6" fill="#b0d890" opacity="0.6"/>
      <!-- major roads -->
      <path d="M0 50 L100 50" stroke="#fff" stroke-width="1.2" opacity="0.9"/>
      <path d="M50 0 L50 100" stroke="#fff" stroke-width="1.2" opacity="0.9"/>
      <path d="M0 30 L100 35" stroke="#fff" stroke-width="0.6" opacity="0.7"/>
      <path d="M0 70 L100 65" stroke="#fff" stroke-width="0.6" opacity="0.7"/>
      <path d="M25 0 L30 100" stroke="#fff" stroke-width="0.6" opacity="0.7"/>
      <path d="M75 0 L70 100" stroke="#fff" stroke-width="0.6" opacity="0.7"/>
      <!-- highway -->
      <path d="M0 45 Q50 40 100 55" stroke="#ffc840" stroke-width="1.5" fill="none" opacity="0.8"/>
      <!-- city blocks -->
      <g fill="#e0e0d8" opacity="0.5">
        <rect x="52" y="36" width="6" height="6"/><rect x="60" y="36" width="6" height="6"/>
        <rect x="52" y="44" width="6" height="6"/><rect x="60" y="44" width="6" height="6"/>
        <rect x="32" y="52" width="6" height="6"/><rect x="40" y="52" width="6" height="6"/>
      </g>
    </svg>
    <div data-pins style="position:absolute;inset:0"></div>
  `;
  const pinsLayer = map.querySelector('[data-pins]');
  pinsLayer.innerHTML = PLACES.map(p => `
    <div class="map-pin" data-name="${p.name}" style="position:absolute;left:${p.x}%;top:${p.y}%;transform:translate(-50%,-100%);cursor:default">
      <svg viewBox="0 0 24 24" width="28" height="28"><path d="M12 2C7 2 3 6 3 11c0 6 9 11 9 11s9-5 9-11c0-5-4-9-9-9z" fill="#ff3b30"/><circle cx="12" cy="11" r="3.5" fill="#fff"/></svg>
    </div>
  `).join('');

  pinsLayer.querySelectorAll('.map-pin').forEach(pin => {
    pin.addEventListener('click', () => {
      const p = PLACES.find(x => x.name === pin.dataset.name);
      info.style.display = 'block';
      info.innerHTML = `<div style="font-weight:600;font-size:14px">${p.name}</div><div style="font-size:12px;opacity:.6;margin-top:2px">${p.lat.toFixed(2)}°N, ${Math.abs(p.lng).toFixed(2)}°W</div>`;
      pinsLayer.querySelectorAll('.map-pin').forEach(x => x.style.transform = 'translate(-50%,-100%)');
      pin.style.transform = 'translate(-50%,-100%) scale(1.3)';
    });
  });

  search.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = search.value.trim().toLowerCase();
    const found = PLACES.find(p => p.name.toLowerCase().includes(q));
    if (found) {
      info.style.display = 'block';
      info.innerHTML = `<div style="font-weight:600;font-size:14px">${found.name}</div><div style="font-size:12px;opacity:.6;margin-top:2px">${found.lat.toFixed(2)}°N, ${Math.abs(found.lng).toFixed(2)}°W</div>`;
      toast('Found ' + found.name);
    } else {
      toast('No places match “' + search.value + '”');
    }
  });
}
