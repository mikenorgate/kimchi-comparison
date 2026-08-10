// Photos — gallery of CSS-gradient generated "photos".
import { glyph } from '../icons.js';

export const windowConfig = { width: 820, height: 540 };

const PHOTOS = [
  { id:1, name:'Sunset',     grad:'linear-gradient(180deg,#ff9a5a,#ff5a7a,#3a1a5a)' },
  { id:2, name:'Ocean',      grad:'linear-gradient(180deg,#5ec8ff,#0a5fbf,#0a2a5a)' },
  { id:3, name:'Forest',     grad:'linear-gradient(180deg,#4ad86a,#1a8e3a,#0a4a1a)' },
  { id:4, name:'Mountains',  grad:'linear-gradient(180deg,#e8e8ee,#9aa0aa,#5a5a62)' },
  { id:5, name:'Aurora',     grad:'linear-gradient(180deg,#0a2a4a,#1a5a8a,#3ace8a,#aaf0d0)' },
  { id:6, name:'Desert',     grad:'linear-gradient(180deg,#ffd640,#ff9a3a,#d06020)' },
  { id:7, name:'Night Sky',  grad:'radial-gradient(circle at 30% 20%,#5a3a8a,#1a1a3a,#0a0a1a)' },
  { id:8, name:'Cherry Blossom', grad:'linear-gradient(180deg,#ffc8d8,#ff9ab8,#d06a8a)' },
  { id:9, name:'Lavender',   grad:'linear-gradient(180deg,#c8b0ff,#9a7adf,#5a3a8a)' },
  { id:10, name:'Coral Reef',grad:'linear-gradient(180deg,#5ad8ff,#3a9aaf,#1a5a6a)' },
  { id:11, name:'Autumn',    grad:'linear-gradient(180deg,#ff9a3a,#d05a1a,#8a3a0a)' },
  { id:12, name:'Glacier',   grad:'linear-gradient(180deg,#d8f0ff,#a0d8ff,#5a9adf)' },
];

export function mount(el) {
  el.innerHTML = `
    <div style="display:flex;height:100%">
      <div class="sidebar scroll" style="width:180px">
        <div class="sb-h">Library</div>
        <div class="sb-item sel"><span>Photos</span></div>
        <div class="sb-item"><span>Memories</span></div>
        <div class="sb-item"><span>Favorites</span></div>
        <div class="sb-h">Albums</div>
        <div class="sb-item">${glyph('star',15)}<span>Recents</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Nature</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Travel</span></div>
        <div class="sb-h">Media Types</div>
        <div class="sb-item">${glyph('image',15)}<span>Videos</span></div>
        <div class="sb-item">${glyph('image',15)}<span>Selfies</span></div>
      </div>
      <div style="flex:1;overflow:auto;padding:14px">
        <div style="font-size:17px;font-weight:600;margin-bottom:10px">Photos · ${PHOTOS.length} Items</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px" data-grid></div>
      </div>
    </div>
  `;
  const grid = el.querySelector('[data-grid]');
  grid.innerHTML = PHOTOS.map(p => `
    <div data-id="${p.id}" style="cursor:default">
      <div class="photo-thumb" data-id="${p.id}" style="height:140px;border-radius:10px;background:${p.grad};box-shadow:0 2px 8px rgba(0,0,0,.15)"></div>
      <div style="font-size:12px;margin-top:4px;text-align:center">${p.name}</div>
    </div>
  `).join('');
  grid.querySelectorAll('.photo-thumb').forEach(t => {
    t.addEventListener('click', () => openPhoto(el, +t.dataset.id));
  });
}

function openPhoto(el, id) {
  const p = PHOTOS.find(x => x.id === id);
  if (!p) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.8);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px';
  overlay.innerHTML = `
    <div style="color:#fff;font-size:16px;font-weight:600">${p.name}</div>
    <div style="width:min(80%,640px);height:min(70vh,420px);border-radius:12px;background:${p.grad};box-shadow:0 10px 40px rgba(0,0,0,.4)"></div>
    <button class="btn" style="background:rgba(255,255,255,.2);color:#fff">Close</button>
  `;
  el.appendChild(overlay);
  overlay.querySelector('button').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}
