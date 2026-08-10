/* ============================================
   App: Calendar
   ============================================ */

const Calendar = {
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  events: {
    [`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`]: [
      { title: 'Team Standup', time: '9:00 AM' },
      { title: 'Design Review', time: '2:00 PM' },
    ],
    [`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate() + 2}`]: [
      { title: 'Lunch with Sarah', time: '12:30 PM' },
    ],
    [`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate() + 5}`]: [
      { title: 'Product Launch', time: '10:00 AM' },
      { title: 'Q3 Planning', time: '3:00 PM' },
    ],
    [`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate() - 3}`]: [
      { title: 'Dentist Appointment', time: '4:00 PM' },
    ],
  },

  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  render(container, winData) {
    container.innerHTML = `
      <div class="calendar-app">
        <div class="calendar-header">
          <button class="toolbar-btn" id="${winData.id}-prev">${Icons.back}</button>
          <div class="calendar-title">${this.monthNames[this.currentMonth]} ${this.currentYear}</div>
          <button class="toolbar-btn" id="${winData.id}-next">${Icons.forward}</button>
          <div style="flex:1"></div>
          <button class="btn-glass" id="${winData.id}-today">Today</button>
        </div>
        <div class="calendar-body">
          <div class="calendar-weekdays">
            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="calendar-weekday">${d}</div>`).join('')}
          </div>
          <div class="calendar-grid" id="${winData.id}-grid"></div>
        </div>
      </div>
    `;

    this.renderGrid(winData);
    this.attachEvents(winData);
  },

  renderGrid(winData) {
    const grid = document.getElementById(`${winData.id}-grid`);
    if (!grid) return;

    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === this.currentMonth && today.getFullYear() === this.currentYear;

    let html = '';

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      html += `<div class="calendar-day other-month"><div class="day-num">${daysInPrevMonth - i}</div></div>`;
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurrentMonth && d === today.getDate();
      const eventKey = `${this.currentYear}-${this.currentMonth}-${d}`;
      const dayEvents = this.events[eventKey] || [];
      const eventHtml = dayEvents.slice(0, 2).map(e => `<div class="day-event">${e.title}</div>`).join('');
      const moreHtml = dayEvents.length > 2 ? `<div class="day-event" style="opacity:0.6;">+${dayEvents.length - 2} more</div>` : '';

      html += `<div class="calendar-day ${isToday ? 'today' : ''}" data-day="${d}">
        <div class="day-num">${d}</div>
        ${eventHtml}
        ${moreHtml}
      </div>`;
    }

    // Next month days to fill the grid
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="calendar-day other-month"><div class="day-num">${i}</div></div>`;
    }

    grid.innerHTML = html;
  },

  attachEvents(winData) {
    const prev = document.getElementById(`${winData.id}-prev`);
    const next = document.getElementById(`${winData.id}-next`);
    const today = document.getElementById(`${winData.id}-today`);

    if (prev) prev.addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.renderGrid(winData);
      this.updateTitle(winData);
    });

    if (next) next.addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.renderGrid(winData);
      this.updateTitle(winData);
    });

    if (today) today.addEventListener('click', () => {
      const now = new Date();
      this.currentMonth = now.getMonth();
      this.currentYear = now.getFullYear();
      this.renderGrid(winData);
      this.updateTitle(winData);
    });

    // Day click - show events
    const grid = document.getElementById(`${winData.id}-grid`);
    if (grid) {
      grid.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
        day.addEventListener('click', () => {
          const d = parseInt(day.dataset.day);
          const eventKey = `${this.currentYear}-${this.currentMonth}-${d}`;
          const events = this.events[eventKey] || [];
          const dateStr = `${this.monthNames[this.currentMonth]} ${d}, ${this.currentYear}`;
          if (events.length > 0) {
            const eventList = events.map(e => `${e.time} - ${e.title}`).join('\n');
            Tahoe.showNotification(dateStr, eventList);
          } else {
            Tahoe.showNotification(dateStr, 'No events scheduled');
          }
        });
      });
    }
  },

  updateTitle(winData) {
    const title = winData.el.querySelector('.calendar-title');
    if (title) title.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  },
};
