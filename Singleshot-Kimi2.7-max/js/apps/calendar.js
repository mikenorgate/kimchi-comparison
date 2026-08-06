import { openWindow } from '../windowManager.js';
import { markAppRunning } from '../dock.js';

let openCount = 0;

export function openCalendar() {
  openCount++;
  const today = new Date();
  openWindow('calendar', 'Calendar', renderCalendar(today.getFullYear(), today.getMonth()), {
    width: 560, height: 440,
    onMount: (el) => {
      markAppRunning('calendar', true);
      initCalendar(el, today.getFullYear(), today.getMonth());
      el.addEventListener('windowclose', () => {
        if (!document.querySelector('.window[data-app="calendar"]')) markAppRunning('calendar', false);
      });
    }
  });
}

function renderCalendar(year, month) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();
  const total = last.getDate();
  const prevLast = new Date(year, month, 0).getDate();
  const today = new Date();

  let cells = '';
  for (let i = startDay - 1; i >= 0; i--) {
    cells += `<div class="calendar-day other">${prevLast - i}</div>`;
  }
  for (let d = 1; d <= total; d++) {
    const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
    cells += `<div class="calendar-day ${isToday ? 'today' : ''}">${d}</div>`;
  }
  const remaining = (7 - ((startDay + total) % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    cells += `<div class="calendar-day other">${d}</div>`;
  }

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
  return `
    <div class="calendar">
      <div class="calendar-header">
        <h2>${monthName}</h2>
        <div class="calendar-nav">
          <button data-nav="prev">‹</button>
          <button data-nav="today">Today</button>
          <button data-nav="next">›</button>
        </div>
      </div>
      <div class="calendar-grid">
        ${days.map(d => `<div class="calendar-day-label">${d}</div>`).join('')}
        ${cells}
      </div>
    </div>
  `;
}

function initCalendar(el, year, month) {
  const content = el.querySelector('.window-content');
  const refresh = () => {
    content.innerHTML = renderCalendar(year, month);
    bind(el);
  };

  function bind() {
    content.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nav = btn.dataset.nav;
        if (nav === 'prev') month--;
        else if (nav === 'next') month++;
        else if (nav === 'today') { const t = new Date(); year = t.getFullYear(); month = t.getMonth(); }
        if (month < 0) { month = 11; year--; }
        if (month > 11) { month = 0; year++; }
        refresh();
      });
    });
  }
  bind();
}
