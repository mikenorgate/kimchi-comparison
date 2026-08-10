// Calendar — month navigation, add/view events (persisted).
import { glyph } from '../icons.js';

const LS_KEY = 'tahoe_calendar_v1';
const events = loadEvents();

function loadEvents() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function saveEvents() { localStorage.setItem(LS_KEY, JSON.stringify(events)); }
// events keyed by 'YYYY-MM-DD' -> [{title, time, color}]

export const windowConfig = { width: 780, height: 520 };

let viewDate = new Date();
let selDay = null;

export function mount(el) {
  el.innerHTML = `
    <div class="cal-root">
      <div class="cal-head">
        <div class="nav-btn" data-act="prev" style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center">${glyph('chevronLeft',16)}</div>
        <div class="nav-btn" data-act="next" style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center">${glyph('chevronRight',16)}</div>
        <div class="cal-month" data-month></div>
        <button class="btn primary" data-act="today">Today</button>
        <button class="btn" data-act="addevent">+ Event</button>
      </div>
      <div class="cal-grid" data-grid></div>
      <div data-detail style="padding:10px 14px;border-top:0.5px solid rgba(0,0,0,.1);font-size:13px;min-height:60px"></div>
    </div>
  `;
  const grid = el.querySelector('[data-grid]');
  const monthEl = el.querySelector('[data-month]');
  const detail = el.querySelector('[data-detail]');

  function render() {
    const y = viewDate.getFullYear(), m = viewDate.getMonth();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    monthEl.textContent = `${months[m]} ${y}`;

    const first = new Date(y, m, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();

    let html = '';
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => html += `<div class="cal-dow">${d}</div>`);
    for (let i = startDow - 1; i >= 0; i--) {
      html += `<div class="cal-cell other"><div class="cc-daynum">${prevDays - i}</div></div>`;
    }
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const evs = events[key] || [];
      const isToday = today.getFullYear()===y && today.getMonth()===m && today.getDate()===d;
      html += `<div class="cal-cell ${isToday?'today':''}" data-key="${key}">
        <div class="cc-daynum">${d}</div>
        ${evs.slice(0,2).map(e=>`<div class="cc-evt">${escapeHtml(e.time||'')} ${escapeHtml(e.title)}</div>`).join('')}
        ${evs.length>2?`<div class="cc-evt" style="opacity:.6">+${evs.length-2} more</div>`:''}
      </div>`;
    }
    const totalCells = startDow + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="cal-cell other"><div class="cc-daynum">${i}</div></div>`;
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.cal-cell[data-key]').forEach(c => {
      c.addEventListener('click', () => { selDay = c.dataset.key; renderDetail(); });
    });
    renderDetail();
  }

  function renderDetail() {
    if (!selDay) { detail.innerHTML = '<span style="opacity:.5">Select a day to view or add events</span>'; return; }
    const evs = events[selDay] || [];
    const [y,mm,dd] = selDay.split('-');
    const dateLabel = new Date(+y, +mm - 1, +dd).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
    detail.innerHTML = `<div style="font-weight:600;margin-bottom:6px">${dateLabel}</div>` +
      (evs.length ? evs.map((e, i) => `<div style="padding:4px 0;display:flex;gap:10px"><span style="opacity:.6;width:60px">${escapeHtml(e.time||'')}</span><span style="flex:1">${escapeHtml(e.title)}</span><button class="btn" data-del="${i}" style="padding:2px 8px;font-size:11px">Delete</button></div>`).join('') : '<span style="opacity:.5">No events</span>');
    detail.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      evs.splice(+b.dataset.del, 1);
      if (evs.length === 0) delete events[selDay];
      saveEvents(); render();
    }));
  }

  el.querySelector('[data-act="prev"]').addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth()-1); render(); });
  el.querySelector('[data-act="next"]').addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth()+1); render(); });
  el.querySelector('[data-act="today"]').addEventListener('click', () => { viewDate = new Date(); selDay = fmt(new Date()); render(); });
  el.querySelector('[data-act="addevent"]').addEventListener('click', async () => {
    const key = selDay || fmt(new Date());
    const title = await promptInline(el, 'Event title:');
    if (!title) return;
    const time = (await promptInline(el, 'Time (e.g. 14:00):')) || '';
    if (!events[key]) events[key] = [];
    events[key].push({ title, time, color:'#0a84ff' });
    saveEvents(); selDay = key; render();
  });

  selDay = fmt(new Date());
  render();
}

function fmt(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Promise-based inline modal prompt (no native prompt()).
function promptInline(el, label) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:200;display:flex;align-items:center;justify-content:center';
    const box = document.createElement('div');
    box.style.cssText = 'background:var(--glass-bg);backdrop-filter:blur(30px) saturate(1.6);-webkit-backdrop-filter:blur(30px) saturate(1.6);padding:18px;border-radius:14px;width:300px;box-shadow:var(--glass-shadow);color:var(--text);border:0.5px solid var(--glass-border)';
    box.innerHTML = `<div style="font-size:13px;margin-bottom:10px">${label}</div><input class="field" style="width:100%" /><div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end"><button class="btn" data-cancel>Cancel</button><button class="btn primary" data-ok>OK</button></div>`;
    overlay.appendChild(box);
    el.appendChild(overlay);
    const inp = box.querySelector('input');
    inp.focus();
    const done = (val) => { overlay.remove(); resolve(val); };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(inp.value); if (e.key === 'Escape') done(null); });
    box.querySelector('[data-ok]').addEventListener('click', () => done(inp.value));
    box.querySelector('[data-cancel]').addEventListener('click', () => done(null));
  });
}
