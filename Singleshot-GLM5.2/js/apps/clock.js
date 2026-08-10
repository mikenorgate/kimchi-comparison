/* ============================================
   App: Clock
   ============================================ */

const Clock = {
  activeTab: 'world',
  worldClocks: [
    { city: 'Cupertino', tz: 'America/Los_Angeles', offset: 'PDT' },
    { city: 'New York', tz: 'America/New_York', offset: 'EDT' },
    { city: 'London', tz: 'Europe/London', offset: 'BST' },
    { city: 'Tokyo', tz: 'Asia/Tokyo', offset: 'JST' },
    { city: 'Sydney', tz: 'Australia/Sydney', offset: 'AEST' },
    { city: 'Dubai', tz: 'Asia/Dubai', offset: 'GST' },
  ],
  stopwatch: {
    running: false,
    elapsed: 0,
    startTime: 0,
    laps: [],
    interval: null,
  },
  timer: {
    running: false,
    remaining: 0,
    total: 0,
    interval: null,
  },
  alarms: [
    { id: 1, time: '7:00 AM', label: 'Wake Up', enabled: true },
    { id: 2, time: '8:30 AM', label: 'Workout', enabled: false },
    { id: 3, time: '9:00 PM', label: 'Wind Down', enabled: true },
  ],

  render(container, winData) {
    container.innerHTML = `
      <div class="clock-app">
        <div class="clock-tabs">
          <div class="clock-tab ${this.activeTab === 'world' ? 'active' : ''}" data-tab="world">World Clock</div>
          <div class="clock-tab ${this.activeTab === 'alarm' ? 'active' : ''}" data-tab="alarm">Alarms</div>
          <div class="clock-tab ${this.activeTab === 'stopwatch' ? 'active' : ''}" data-tab="stopwatch">Stopwatch</div>
          <div class="clock-tab ${this.activeTab === 'timer' ? 'active' : ''}" data-tab="timer">Timer</div>
        </div>
        <div class="clock-content" id="${winData.id}-content"></div>
      </div>
    `;

    this.renderTab(winData);
    this.attachEvents(winData);
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');
    container.querySelectorAll('.clock-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = tab.dataset.tab;
        container.querySelectorAll('.clock-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderTab(winData);
      });
    });
  },

  renderTab(winData) {
    const content = document.getElementById(`${winData.id}-content`);
    if (!content) return;

    switch (this.activeTab) {
      case 'world': this.renderWorldClock(content, winData); break;
      case 'alarm': this.renderAlarms(content, winData); break;
      case 'stopwatch': this.renderStopwatch(content, winData); break;
      case 'timer': this.renderTimer(content, winData); break;
    }
  },

  renderWorldClock(content, winData) {
    content.innerHTML = `
      <div class="world-clock-list">
        ${this.worldClocks.map(c => `
          <div class="world-clock-item">
            <div class="city-info">
              <div class="city-name">${c.city}</div>
              <div class="city-offset">${c.offset}</div>
            </div>
            <div class="city-time" data-clock="${c.tz}">--:--</div>
          </div>
        `).join('')}
      </div>
    `;
    // Trigger initial clock update
    Tahoe.startClock();
  },

  renderAlarms(content, winData) {
    content.innerHTML = `
      <div style="display:flex;align-items:center;margin-bottom:16px;">
        <h2 style="font-size:20px;font-weight:700;">Alarms</h2>
        <button class="toolbar-btn" style="margin-left:auto;" id="${winData.id}-add-alarm">${Icons.add}</button>
      </div>
      <div class="world-clock-list">
        ${this.alarms.map(a => `
          <div class="world-clock-item" style="gap:16px;">
            <div class="city-info">
              <div class="city-name" style="${a.enabled ? '' : 'opacity:0.4;'}">${a.time}</div>
              <div class="city-offset">${a.label}</div>
            </div>
            <div class="toggle-switch ${a.enabled ? 'on' : ''}" data-alarm="${a.id}"></div>
          </div>
        `).join('')}
      </div>
    `;

    content.querySelectorAll('[data-alarm]').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const id = parseInt(toggle.dataset.alarm);
        const alarm = this.alarms.find(a => a.id === id);
        if (alarm) {
          alarm.enabled = !alarm.enabled;
          toggle.classList.toggle('on');
          Tahoe.showNotification('Alarm', `${alarm.label}: ${alarm.time} ${alarm.enabled ? 'enabled' : 'disabled'}`);
        }
      });
    });

    const addBtn = document.getElementById(`${winData.id}-add-alarm`);
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const id = this.alarms.length + 1;
        this.alarms.push({ id, time: '9:00 AM', label: 'Alarm', enabled: true });
        this.renderAlarms(content, winData);
      });
    }
  },

  renderStopwatch(content, winData) {
    const elapsed = this.stopwatch.elapsed;
    const h = Math.floor(elapsed / 3600000);
    const m = Math.floor((elapsed % 3600000) / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);

    content.innerHTML = `
      <div class="stopwatch-display" id="${winData.id}-sw-display">${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${ms.toString().padStart(2,'0')}</div>
      <div class="stopwatch-controls">
        <button class="stopwatch-btn lap" id="${winData.id}-sw-lap">${this.stopwatch.running ? 'Lap' : 'Reset'}</button>
        <button class="stopwatch-btn ${this.stopwatch.running ? 'stop' : 'start'}" id="${winData.id}-sw-toggle">${this.stopwatch.running ? 'Stop' : 'Start'}</button>
      </div>
      ${this.stopwatch.laps.length > 0 ? `
        <div style="margin-top:20px;">
          <div style="font-size:12px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:8px;">Laps</div>
          ${this.stopwatch.laps.map((lap, i) => {
            const lh = Math.floor(lap / 3600000);
            const lm = Math.floor((lap % 3600000) / 60000);
            const ls = Math.floor((lap % 60000) / 1000);
            const lms = Math.floor((lap % 1000) / 10);
            return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.06);font-size:14px;">
              <span>Lap ${i + 1}</span>
              <span style="font-variant-numeric:tabular-nums;">${lh.toString().padStart(2,'0')}:${lm.toString().padStart(2,'0')}:${ls.toString().padStart(2,'0')}.${lms.toString().padStart(2,'0')}</span>
            </div>`;
          }).join('')}
        </div>
      ` : ''}
    `;

    const toggle = document.getElementById(`${winData.id}-sw-toggle`);
    const lapBtn = document.getElementById(`${winData.id}-sw-lap`);
    const display = document.getElementById(`${winData.id}-sw-display`);

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (this.stopwatch.running) {
          this.stopStopwatch(winData);
        } else {
          this.startStopwatch(winData);
        }
      });
    }

    if (lapBtn) {
      lapBtn.addEventListener('click', () => {
        if (this.stopwatch.running) {
          this.stopwatch.laps.unshift(this.stopwatch.elapsed);
          this.renderStopwatch(content, winData);
        } else {
          this.stopwatch.elapsed = 0;
          this.stopwatch.laps = [];
          this.renderStopwatch(content, winData);
        }
      });
    }
  },

  startStopwatch(winData) {
    this.stopwatch.running = true;
    this.stopwatch.startTime = Date.now() - this.stopwatch.elapsed;
    this.stopwatch.interval = setInterval(() => {
      this.stopwatch.elapsed = Date.now() - this.stopwatch.startTime;
      const content = document.getElementById(`${winData.id}-content`);
      if (content) this.renderStopwatch(content, winData);
    }, 50);
    const content = document.getElementById(`${winData.id}-content`);
    if (content) this.renderStopwatch(content, winData);
  },

  stopStopwatch(winData) {
    this.stopwatch.running = false;
    clearInterval(this.stopwatch.interval);
    const content = document.getElementById(`${winData.id}-content`);
    if (content) this.renderStopwatch(content, winData);
  },

  renderTimer(content, winData) {
    if (this.timer.running) {
      const remaining = this.timer.remaining;
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      content.innerHTML = `
        <div class="timer-display" id="${winData.id}-timer-display">${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}</div>
        <div class="stopwatch-controls">
          <button class="stopwatch-btn stop" id="${winData.id}-timer-stop">Stop</button>
        </div>
      `;
      const stopBtn = document.getElementById(`${winData.id}-timer-stop`);
      if (stopBtn) stopBtn.addEventListener('click', () => {
        this.timer.running = false;
        clearInterval(this.timer.interval);
        this.timer.remaining = 0;
        this.renderTimer(content, winData);
      });
    } else {
      content.innerHTML = `
        <div class="timer-display">00:00</div>
        <div class="timer-presets">
          <button class="timer-preset" data-min="1">1 min</button>
          <button class="timer-preset" data-min="5">5 min</button>
          <button class="timer-preset" data-min="10">10 min</button>
          <button class="timer-preset" data-min="15">15 min</button>
          <button class="timer-preset" data-min="30">30 min</button>
          <button class="timer-preset" data-min="60">1 hour</button>
        </div>
        <div style="text-align:center;margin-top:20px;font-size:13px;color:var(--text-secondary);">Select a duration to start the timer</div>
      `;

      content.querySelectorAll('.timer-preset').forEach(btn => {
        btn.addEventListener('click', () => {
          const mins = parseInt(btn.dataset.min);
          this.timer.total = mins * 60000;
          this.timer.remaining = mins * 60000;
          this.timer.running = true;
          this.startTimer(winData);
        });
      });
    }
  },

  startTimer(winData) {
    const content = document.getElementById(`${winData.id}-content`);
    if (content) this.renderTimer(content, winData);

    this.timer.interval = setInterval(() => {
      this.timer.remaining -= 1000;
      if (this.timer.remaining <= 0) {
        this.timer.remaining = 0;
        this.timer.running = false;
        clearInterval(this.timer.interval);
        Tahoe.showNotification('Timer', 'Timer finished! 🎉');
        const c = document.getElementById(`${winData.id}-content`);
        if (c) this.renderTimer(c, winData);
      } else {
        const display = document.getElementById(`${winData.id}-timer-display`);
        if (display) {
          const m = Math.floor(this.timer.remaining / 60000);
          const s = Math.floor((this.timer.remaining % 60000) / 1000);
          display.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        }
      }
    }, 1000);
  },
};
