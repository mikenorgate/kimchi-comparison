// App Store — featured apps with "Get" buttons that launch installed apps.
import { glyph } from '../icons.js';
import { APPS } from '../appregistry.js';
import { toast } from '../store.js';
import { launchApp } from '../appregistry.js';

export const windowConfig = { width: 880, height: 560 };

const FEATURED = [
  { id:'notes', cat:'Productivity', rating:4.8, age:'4+', price:'Installed' },
  { id:'safari', cat:'Utilities', rating:4.9, age:'4+', price:'Installed' },
  { id:'music', cat:'Entertainment', rating:4.7, age:'4+', price:'Installed' },
  { id:'photos', cat:'Photography', rating:4.6, age:'4+', price:'Installed' },
  { id:'maps', cat:'Navigation', rating:4.5, age:'4+', price:'Installed' },
  { id:'mail', cat:'Productivity', rating:4.4, age:'4+', price:'Installed' },
  { id:'calendar', cat:'Productivity', rating:4.7, age:'4+', price:'Installed' },
  { id:'terminal', cat:'Developer', rating:4.9, age:'4+', price:'Installed' },
];

export function mount(el) {
  el.innerHTML = `
    <div style="display:flex;height:100%">
      <div class="sidebar scroll" style="width:180px">
        <div class="sb-h">Discover</div>
        <div class="sb-item sel">${glyph('star',15)}<span>Today</span></div>
        <div class="sb-item">${glyph('applications',15)}<span>Games</span></div>
        <div class="sb-item">${glyph('applications',15)}<span>Apps</span></div>
        <div class="sb-item">${glyph('clock',15)}<span>Arcade</span></div>
        <div class="sb-h">Create</div>
        <div class="sb-item">${glyph('image',15)}<span>Photo & Video</span></div>
        <div class="sb-item">${glyph('doc',15)}<span>Design</span></div>
        <div class="sb-h">Work</div>
        <div class="sb-item">${glyph('doc',15)}<span>Productivity</span></div>
        <div class="sb-item">${glyph('doc',15)}<span>Developer</span></div>
      </div>
      <div style="flex:1;overflow:auto;padding:18px 20px">
        <div style="font-size:13px;opacity:.6;margin-bottom:4px">FRIDAY, AUGUST 9</div>
        <div style="font-size:28px;font-weight:700;margin-bottom:6px">Today's Apps</div>
        <div style="font-size:14px;opacity:.7;margin-bottom:18px">Hand-picked apps, all ready to launch right now.</div>
        <div data-grid style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px"></div>
      </div>
    </div>
  `;
  const grid = el.querySelector('[data-grid]');
  grid.innerHTML = FEATURED.map(f => {
    const app = APPS.find(a => a.id === f.id);
    if (!app) return '';
    return `
      <div data-app="${f.id}" style="background:rgba(255,255,255,0.4);border-radius:14px;padding:14px;border:0.5px solid rgba(0,0,0,0.06)">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px">
          <div style="width:56px;height:56px;flex:none">${app.icon}</div>
          <div style="min-width:0;flex:1">
            <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${app.name}</div>
            <div style="font-size:11px;opacity:.6">${f.cat}</div>
            <div style="font-size:10px;opacity:.5;margin-top:1px">★ ${f.rating}  ·  ${f.age}+</div>
          </div>
        </div>
        <div style="font-size:12px;opacity:.6;line-height:1.4;margin-bottom:10px">The full ${app.name} experience, built into macOS Tahoe.</div>
        <button class="btn primary" data-open="${f.id}" style="width:100%;font-size:12px;padding:5px">Open</button>
      </div>
    `;
  }).join('');
  grid.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      toast('Opening ' + APPS.find(a=>a.id===btn.dataset.open).name);
      launchApp(btn.dataset.open);
    });
  });
}
