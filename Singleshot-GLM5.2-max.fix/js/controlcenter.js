// Control Center — Tahoe glass panel with Wi-Fi/BT/AirDrop/Focus toggles
// and brightness/sound sliders that actually affect the system.
import { bus, getState, setState } from './store.js';
import { glyph } from './icons.js';

const cc = () => document.getElementById('control-center');
let open = false;

export function initControlCenter() {
  bus.on('cc:toggle', toggle);
  document.addEventListener('click', (e) => {
    if (!open) return;
    if (!e.target.closest('#control-center') && !e.target.closest('[data-cc="control"]') && !e.target.closest('[data-cc="battery"]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) close(); });
}

function toggle() { open ? close() : openCC(); }

function openCC() {
  open = true;
  render();
  cc().classList.remove('hidden');
}

function close() {
  open = false;
  cc().classList.add('hidden');
}

function render() {
  const s = getState();
  const el = cc();
  el.innerHTML = `
    <div class="cc-tile wide">
      <div class="cc-row" style="gap:16px">
        <div class="cc-pill ${s.wifi?'on':''}" data-tog="wifi"><div class="cc-ico">${glyph('wifi',16)}</div><div class="cc-txt"><b>Wi-Fi</b><span>${s.wifi?'Home':'Off'}</span></div></div>
        <div class="cc-pill ${s.bluetooth?'on':''}" data-tog="bluetooth"><div class="cc-ico">${glyph('bluetooth',16)}</div><div class="cc-txt"><b>Bluetooth</b><span>${s.bluetooth?'On':'Off'}</span></div></div>
        <div class="cc-pill ${s.airdrop?'on':''}" data-tog="airdrop"><div class="cc-ico">${glyph('airdrop',16)}</div><div class="cc-txt"><b>AirDrop</b><span>${s.airdrop?'Contacts':'Off'}</span></div></div>
      </div>
    </div>
    <div class="cc-tile wide">
      <div class="cc-row">
        <div class="cc-pill ${s.focus?'on':''}" data-tog="focus" style="flex:1"><div class="cc-ico">${glyph('moon',16)}</div><div class="cc-txt"><b>Focus</b><span>${s.focus?'On':'Off'}</span></div></div>
        <div class="cc-pill ${s.appearance==='dark'?'on':''}" data-tog="dark" style="flex:1"><div class="cc-ico">${s.appearance==='dark'?glyph('moon',16):glyph('sun',16)}</div><div class="cc-txt"><b>${s.appearance==='dark'?'Dark':'Light'}</b><span>Appearance</span></div></div>
      </div>
    </div>
    <div class="cc-tile">
      <div class="cc-title">Display</div>
      <div class="cc-slider wrap">${brightnessSlider()}<span class="cc-sico">${glyph('sun',16)}</span></div>
    </div>
    <div class="cc-tile">
      <div class="cc-title">Sound</div>
      <div class="cc-slider wrap">${soundSlider()}<span class="cc-sico">${glyph('volume',16)}</span></div>
    </div>
    <div class="cc-tile wide" style="display:flex;gap:10px;align-items:center">
      <div class="cc-pill" style="flex:1"><div class="cc-ico">${glyph('lock',16)}</div><div class="cc-txt"><b>Stage Manager</b><span>Off</span></div></div>
      <div class="cc-pill" style="flex:1"><div class="cc-ico">${glyph('desktop',16)}</div><div class="cc-txt"><b>Screen Mirroring</b><span>Off</span></div></div>
    </div>
  `;
  // fix brightness slider icon position
  el.querySelectorAll('.cc-slider input[type=range]').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const v = +e.target.value;
      if (e.target.dataset.kind === 'bright') setState({ brightness: v });
      else if (e.target.dataset.kind === 'sound') { setState({ volume: v }); bus.emit('audio:volume', v); }
    });
  });
  el.querySelectorAll('[data-tog]').forEach(p => {
    p.addEventListener('click', () => {
      const t = p.dataset.tog;
      if (t === 'wifi') setState({ wifi: !s.wifi });
      else if (t === 'bluetooth') setState({ bluetooth: !s.bluetooth });
      else if (t === 'airdrop') setState({ airdrop: !s.airdrop });
      else if (t === 'focus') setState({ focus: !s.focus });
      else if (t === 'dark') setState({ appearance: s.appearance === 'dark' ? 'light' : 'dark' });
      render();
    });
  });
}

function brightnessSlider() {
  const s = getState();
  const pct = ((s.brightness - 20) / 80) * 100;
  return `<input type="range" min="20" max="100" value="${s.brightness}" data-kind="bright" style="background:linear-gradient(90deg,#fff ${pct}%,rgba(0,0,0,.2) ${pct}%)">`;
}
function soundSlider() {
  const s = getState();
  return `<input type="range" min="0" max="100" value="${s.volume}" data-kind="sound">`;
}
