// Clock — world clock + timer.
import { glyph } from '../icons.js';

export const windowConfig = { width: 560, height: 420 };

const CITIES = [
  { city:'Cupertino',  tz:'America/Los_Angeles' },
  { city:'New York',   tz:'America/New_York' },
  { city:'London',     tz:'Europe/London' },
  { city:'Paris',      tz:'Europe/Paris' },
  { city:'Tokyo',      tz:'Asia/Tokyo' },
  { city:'Sydney',     tz:'Australia/Sydney' },
];

export function mount(el) {
  let tab = 'world';
  el.innerHTML = `
    <div class="clock-root">
      <div class="clock-tabs">
        <div class="clock-tab sel" data-tab="world">World Clock</div>
        <div class="clock-tab" data-tab="timer">Timer</div>
      </div>
      <div data-pane style="flex:1;overflow:auto"></div>
    </div>
  `;
  const pane = el.querySelector('[data-pane]');
  let timerInt = null;
  let timerSec = 0, timerRunning = false;

  function render() {
    if (tab === 'world') {
      pane.innerHTML = `<div class="world-clocks"></div>`;
      const wc = pane.querySelector('.world-clocks');
      CITIES.forEach(c => {
        const row = document.createElement('div');
        row.className = 'wc-row';
        wc.appendChild(row);
      });
      const tick = () => {
        const now = new Date();
        wc.querySelectorAll('.wc-row').forEach((row, i) => {
          const c = CITIES[i];
          const t = now.toLocaleTimeString('en-US', { timeZone:c.tz, hour:'2-digit', minute:'2-digit', hour12:false });
          const d = now.toLocaleDateString('en-US', { timeZone:c.tz, weekday:'short', month:'short', day:'numeric' });
          row.innerHTML = `<div><div class="wc-city">${c.city}</div><div style="font-size:11px;opacity:.5">${d}</div></div><div class="wc-time">${t}</div>`;
        });
      };
      tick();
      if (timerInt) clearInterval(timerInt);
      timerInt = setInterval(tick, 1000);
    } else {
      if (timerInt) { clearInterval(timerInt); timerInt = null; }
      pane.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;height:100%;justify-content:center">
          <div class="timer-display" data-td>00:00</div>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="btn" data-t="m+" style="font-size:20px;padding:8px 14px">+</button>
            <input type="number" value="0" min="0" max="59" data-min style="width:50px;text-align:center;font-size:18px" class="field" placeholder="min" />
            <span style="opacity:.5">min</span>
            <button class="btn" data-t="m-" style="font-size:20px;padding:8px 14px">−</button>
          </div>
          <div class="timer-controls">
            <button class="btn primary" data-tact="start">${timerRunning?'Pause':'Start'}</button>
            <button class="btn" data-tact="reset">Reset</button>
          </div>
        </div>
      `;
      const td = pane.querySelector('[data-td]');
      const minInp = pane.querySelector('[data-min]');
      const paintT = () => { const m = Math.floor(timerSec/60); const s = timerSec%60; td.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; };
      paintT();
      minInp.value = Math.floor(timerSec/60);
      pane.querySelector('[data-t="m+"]').addEventListener('click', () => { timerSec += 60; minInp.value = Math.floor(timerSec/60); paintT(); });
      pane.querySelector('[data-t="m-"]').addEventListener('click', () => { timerSec = Math.max(0, timerSec-60); minInp.value = Math.floor(timerSec/60); paintT(); });
      pane.querySelector('[data-tact="start"]').addEventListener('click', () => {
        if (!timerRunning) {
          if (timerSec <= 0) timerSec = (+minInp.value||0)*60;
          if (timerSec <= 0) return;
          timerRunning = true;
          timerInt = setInterval(() => { timerSec--; paintT(); if (timerSec<=0) { clearInterval(timerInt); timerRunning=false; pane.querySelector('[data-tact="start"]').textContent='Start'; } }, 1000);
          pane.querySelector('[data-tact="start"]').textContent='Pause';
        } else { clearInterval(timerInt); timerRunning=false; pane.querySelector('[data-tact="start"]').textContent='Start'; }
      });
      pane.querySelector('[data-tact="reset"]').addEventListener('click', () => { clearInterval(timerInt); timerRunning=false; timerSec=0; minInp.value=0; paintT(); pane.querySelector('[data-tact="start"]').textContent='Start'; });
    }
  }

  el.querySelectorAll('.clock-tab').forEach(t => t.addEventListener('click', () => {
    tab = t.dataset.tab;
    el.querySelectorAll('.clock-tab').forEach(x => x.classList.toggle('sel', x === t));
    render();
  }));
  render();
}
