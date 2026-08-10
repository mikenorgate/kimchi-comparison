// System Settings — appearance, wallpaper, menu bar, about. Actually works.
import { bus, getState, setState, WALLPAPERS, toast } from '../store.js';
import { glyph, APP_ICONS } from '../icons.js';

export const windowConfig = { width: 820, height: 560 };

const SECTIONS = [
  { id:'about',   name:'About',           icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('apple',20)}</svg>` },
  { id:'appearance', name:'Appearance',   icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('moon',20)}</svg>` },
  { id:'wallpaper', name:'Wallpaper',     icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('image',20)}</svg>` },
  { id:'menubar', name:'Menu Bar',        icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('desktop',20)}</svg>` },
  { id:'controlcenter', name:'Control Center', icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('control',20)}</svg>` },
  { id:'dock', name:'Dock & Menu Bar',   icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('applications',20)}</svg>` },
  { id:'network', name:'Network',         icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('wifi',20)}</svg>` },
  { id:'sound', name:'Sound',             icon:`<svg viewBox="0 0 24 24" width="20" height="20">${glyph('volume',20)}</svg>` },
];

let activeSection = 'about';

export function mount(el) {
  el.innerHTML = `
    <div class="settings-root">
      <div class="settings-side scroll">
        <div style="padding:10px 12px;display:flex;align-items:center;gap:10px;border-bottom:0.5px solid rgba(0,0,0,.1)">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#5ec8ff,#0a5fbf);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">M</div>
          <div><div style="font-size:13px;font-weight:600">Mike</div><div style="font-size:11px;opacity:.6">Apple Account</div></div>
        </div>
        ${SECTIONS.map(s=>`<div class="ss-item ${s.id===activeSection?'sel':''}" data-sec="${s.id}">${s.icon}<span>${s.name}</span></div>`).join('')}
      </div>
      <div class="settings-main scroll" data-main></div>
    </div>
  `;
  const main = el.querySelector('[data-main]');
  el.querySelectorAll('.ss-item').forEach(i => i.addEventListener('click', () => {
    activeSection = i.dataset.sec;
    el.querySelectorAll('.ss-item').forEach(x => x.classList.toggle('sel', x === i));
    renderMain(main);
  }));
  // live update on state change
  bus.on('state:change', () => renderMain(main));
  renderMain(main);
}

function renderMain(main) {
  const s = getState();
  if (activeSection === 'about') {
    main.innerHTML = `
      <h2>About</h2>
      <div style="display:flex;gap:20px;align-items:center;margin-bottom:20px">
        <div style="width:80px;height:80px">${APP_ICONS.finder}</div>
        <div>
          <div style="font-size:22px;font-weight:600">macOS Tahoe</div>
          <div style="font-size:13px;opacity:.6">Version 26.0 (Web Edition)</div>
        </div>
      </div>
      <div class="settings-row"><span>MacBook Pro</span><span style="opacity:.6">14-inch, 2025</span></div>
      <div class="settings-row"><span>Chip</span><span style="opacity:.6">Apple M5 (Virtual)</span></div>
      <div class="settings-row"><span>Memory</span><span style="opacity:.6">16 GB</span></div>
      <div class="settings-row"><span>Startup Disk</span><span style="opacity:.6">Macintosh HD</span></div>
      <div class="settings-row"><span>Serial Number</span><span style="opacity:.6">TWHOE26WEB001</span></div>
      <div style="margin-top:20px;font-size:12px;opacity:.5">macOS Tahoe Web — a Liquid Glass recreation.</div>
    `;
  } else if (activeSection === 'appearance') {
    main.innerHTML = `
      <h2>Appearance</h2>
      <div class="settings-row">
        <span>Appearance Mode</span>
        <div style="display:flex;gap:10px">
          <div data-app="light" style="cursor:default;text-align:center"><div style="width:56px;height:36px;border-radius:8px;background:linear-gradient(180deg,#e8e8ee,#c8c8ce);border:${s.appearance==='light'?'2px solid var(--accent)':'1px solid #ccc'}"></div><div style="font-size:11px;margin-top:4px">Light</div></div>
          <div data-app="dark" style="cursor:default;text-align:center"><div style="width:56px;height:36px;border-radius:8px;background:linear-gradient(180deg,#3a3a3e,#1a1a1e);border:${s.appearance==='dark'?'2px solid var(--accent)':'1px solid #555'}"></div><div style="font-size:11px;margin-top:4px">Dark</div></div>
        </div>
      </div>
      <div class="settings-row"><span>Accent Color</span><div class="swatch-row">
        ${['#0a84ff','#ff375f','#ff9f0a','#28c840','#bf5af2','#ff6482','#5ac8fa'].map(c=>`<div class="swatch ${s.accent===c?'sel':''}" style="background:${c}" data-accent="${c}"></div>`).join('')}
      </div></div>
      <div class="settings-row"><span>Show scroll bars</span><span style="opacity:.6">Automatic</span></div>
    `;
    main.querySelectorAll('[data-app]').forEach(a => a.addEventListener('click', () => setState({ appearance: a.dataset.app })));
    main.querySelectorAll('[data-accent]').forEach(a => a.addEventListener('click', () => { setState({ accent: a.dataset.accent }); document.documentElement.style.setProperty('--accent', a.dataset.accent); }));
  } else if (activeSection === 'wallpaper') {
    main.innerHTML = `
      <h2>Wallpaper</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
        ${Object.entries(WALLPAPERS).map(([k,v]) => `
          <div data-wp="${k}" style="cursor:default">
            <div style="height:90px;border-radius:10px;background:${v};border:${s.wallpaper===k?'2px solid var(--accent)':'1px solid rgba(0,0,0,.1)'}"></div>
            <div style="font-size:12px;margin-top:5px;text-align:center;text-transform:capitalize">${k}</div>
          </div>
        `).join('')}
      </div>
    `;
    main.querySelectorAll('[data-wp]').forEach(w => w.addEventListener('click', () => { setState({ wallpaper: w.dataset.wp }); bus.emit('wallpaper:change', w.dataset.wp); toast('Wallpaper changed'); }));
  } else if (activeSection === 'menubar') {
    main.innerHTML = `
      <h2>Menu Bar</h2>
      <div class="settings-row"><span>Show menu bar background</span><div class="toggle ${s.menubarOpaque?'on':''}" data-t="menubarOpaque"></div></div>
      <div class="settings-row"><span>Automatically hide and show the menu bar</span><div class="toggle" data-t="autohide"></div></div>
      <div style="margin-top:16px;font-size:13px;opacity:.6">When off, the menu bar is transparent (Liquid Glass), letting the wallpaper extend to full height — the default Tahoe look.</div>
    `;
    main.querySelectorAll('[data-t]').forEach(t => t.addEventListener('click', () => {
      if (t.dataset.t === 'menubarOpaque') setState({ menubarOpaque: !s.menubarOpaque });
      else toast('That option is not available in this build.');
    }));
  } else if (activeSection === 'controlcenter') {
    main.innerHTML = `
      <h2>Control Center</h2>
      <div class="settings-row"><span>Wi-Fi</span><div class="toggle ${s.wifi?'on':''}" data-t="wifi"></div></div>
      <div class="settings-row"><span>Bluetooth</span><div class="toggle ${s.bluetooth?'on':''}" data-t="bluetooth"></div></div>
      <div class="settings-row"><span>AirDrop</span><div class="toggle ${s.airdrop?'on':''}" data-t="airdrop"></div></div>
      <div class="settings-row"><span>Focus</span><div class="toggle ${s.focus?'on':''}" data-t="focus"></div></div>
      <div class="settings-row"><span>Brightness</span><input type="range" min="20" max="100" value="${s.brightness}" data-t="brightness" style="width:160px"></div>
      <div class="settings-row"><span>Volume</span><input type="range" min="0" max="100" value="${s.volume}" data-t="volume" style="width:160px"></div>
    `;
    main.querySelectorAll('[data-t]').forEach(t => {
      const key = t.dataset.t;
      if (t.type === 'range') t.addEventListener('input', () => setState({ [key]: +t.value }));
      else t.addEventListener('click', () => setState({ [key]: !s[key] }));
    });
  } else if (activeSection === 'dock') {
    main.innerHTML = `
      <h2>Dock & Menu Bar</h2>
      <div class="settings-row"><span>Dock Size</span><input type="range" min="60" max="90" value="70" style="width:160px"></div>
      <div class="settings-row"><span>Magnification</span><div class="toggle on"></div></div>
      <div class="settings-row"><span>Position on screen</span><span style="opacity:.6">Bottom</span></div>
      <div class="settings-row"><span>Minimize windows using</span><span style="opacity:.6">Genie Effect</span></div>
      <div class="settings-row"><span>Automatically hide and show the Dock</span><div class="toggle"></div></div>
    `;
  } else if (activeSection === 'network') {
    main.innerHTML = `
      <h2>Network</h2>
      <div class="settings-row"><span>Wi-Fi</span><div class="toggle ${s.wifi?'on':''}" data-t="wifi"></div></div>
      <div class="settings-row"><span>Network Name</span><span style="opacity:.6">${s.wifi?'Home Network':'Off'}</span></div>
      <div class="settings-row"><span>IP Address</span><span style="opacity:.6">192.168.1.42</span></div>
      <div class="settings-row"><span>Router</span><span style="opacity:.6">192.168.1.1</span></div>
      <div class="settings-row"><span>DNS</span><span style="opacity:.6">8.8.8.8</span></div>
    `;
    main.querySelector('[data-t="wifi"]')?.addEventListener('click', () => setState({ wifi: !s.wifi }));
  } else if (activeSection === 'sound') {
    main.innerHTML = `
      <h2>Sound</h2>
      <div class="settings-row"><span>Output Volume</span><input type="range" min="0" max="100" value="${s.volume}" data-t="volume" style="width:160px"></div>
      <div class="settings-row"><span>Alert Volume</span><input type="range" min="0" max="100" value="60" style="width:160px"></div>
      <div class="settings-row"><span>Play sound on startup</span><div class="toggle on"></div></div>
      <div class="settings-row"><span>Output Device</span><span style="opacity:.6">Built-in Speakers</span></div>
    `;
    main.querySelector('[data-t="volume"]')?.addEventListener('input', () => setState({ volume: +main.querySelector('[data-t="volume"]').value }));
  }
}
