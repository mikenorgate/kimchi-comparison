import { App, registerApp } from '../../js/appRegistry.js';
import { $, load, save } from '../../js/utils.js';

class CalendarApp extends App {
  constructor() {
    super({ id: 'calendar', name: 'Calendar', width: 800, height: 560, singleton: true, emoji: '📅', iconGradient: ['#fff', '#e6e6e6'], iconColor: '#e74c3c' });
    this.events = load('calendar-events', {
      [new Date().toDateString()]: ['Team standup', 'Lunch with friend']
    });
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'calendar';
    root.innerHTML = `
      <header class="cal-header">
        <button id="prev">‹</button>
        <h2 id="month"></h2>
        <button id="next">›</button>
      </header>
      <div class="cal-grid" id="grid"></div>
      <div class="cal-events" id="events"></div>
    `;

    const monthEl = $('#month', root);
    const grid = $('#grid', root);
    const eventsEl = $('#events', root);
    let current = new Date();

    const render = () => {
      grid.innerHTML = '';
      const y = current.getFullYear(), m = current.getMonth();
      monthEl.textContent = current.toLocaleString('default', { month: 'long', year: 'numeric' });
      const first = new Date(y, m, 1);
      const last = new Date(y, m + 1, 0);
      ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
        const h = document.createElement('div'); h.className = 'cal-day-label'; h.textContent = d; grid.appendChild(h);
      });
      for (let i = 0; i < first.getDay(); i++) grid.appendChild(document.createElement('div'));
      for (let d = 1; d <= last.getDate(); d++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.textContent = d;
        const date = new Date(y, m, d).toDateString();
        if (this.events[date]?.length) cell.classList.add('has-event');
        const today = new Date();
        if (d === today.getDate() && m === today.getMonth() && y === today.getFullYear()) cell.classList.add('today');
        cell.addEventListener('click', () => showEvents(date));
        grid.appendChild(cell);
      }
    };

    const showEvents = (date) => {
      const list = this.events[date] || [];
      eventsEl.innerHTML = `<h3>${date}</h3>` + list.map(e => `<div class="cal-event">${e}</div>`).join('') +
        `<button id="add-event">+ Add Event</button>`;
      $('#add-event', eventsEl)?.addEventListener('click', () => {
        const ev = prompt('Event name:');
        if (!ev) return;
        this.events[date] = this.events[date] || [];
        this.events[date].push(ev);
        save('calendar-events', this.events);
        render();
        showEvents(date);
      });
    };

    $('#prev', root).addEventListener('click', () => { current.setMonth(current.getMonth() - 1); render(); });
    $('#next', root).addEventListener('click', () => { current.setMonth(current.getMonth() + 1); render(); });

    render();
    showEvents(new Date().toDateString());
    return root;
  }
}

registerApp(new CalendarApp());
