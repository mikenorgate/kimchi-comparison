import { App, registerApp } from '../../js/appRegistry.js';
import { $, $$, load, save } from '../../js/utils.js';

class ClockApp extends App {
  constructor() {
    super({ id: 'clock', name: 'Clock', width: 420, height: 420, canResize: false, emoji: '🕐', iconGradient: ['#000', '#333'], iconColor: '#fff' });
    this.alarms = load('alarms', [{ time: '07:00', label: 'Wake up', on: true }]);
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'clock';
    root.innerHTML = `
      <div class="clock-face" id="face"></div>
      <div class="clock-digital" id="digital"></div>
      <div class="clock-alarms" id="alarms"></div>
    `;

    const face = $('#face', root);
    const digital = $('#digital', root);

    for (let i = 1; i <= 12; i++) {
      const m = document.createElement('div');
      m.className = 'clock-marker';
      m.textContent = i;
      const a = (i * 30 - 90) * Math.PI / 180;
      m.style.left = `${50 + 38 * Math.cos(a)}%`;
      m.style.top = `${50 + 38 * Math.sin(a)}%`;
      face.appendChild(m);
    }

    const hands = { h: document.createElement('div'), m: document.createElement('div'), s: document.createElement('div') };
    hands.h.className = 'clock-hand hour'; hands.m.className = 'clock-hand minute'; hands.s.className = 'clock-hand second';
    Object.values(hands).forEach(h => face.appendChild(h));

    const tick = () => {
      const now = new Date();
      digital.textContent = now.toLocaleTimeString();
      const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours();
      hands.s.style.transform = `rotate(${s * 6}deg)`;
      hands.m.style.transform = `rotate(${m * 6 + s * 0.1}deg)`;
      hands.h.style.transform = `rotate(${(h % 12) * 30 + m * 0.5}deg)`;
    };

    const alarmEl = $('#alarms', root);
    const renderAlarms = () => {
      alarmEl.innerHTML = '<h4>Alarms</h4>' + this.alarms.map((a, i) =>
        `<div class="alarm-row"><span>${a.time} — ${a.label}</span><input type="checkbox" ${a.on ? 'checked' : ''} data-i="${i}"></div>`
      ).join('');
      $$('input', alarmEl).forEach(cb => cb.addEventListener('change', () => {
        this.alarms[cb.dataset.i].on = cb.checked;
        save('alarms', this.alarms);
      }));
    };

    tick();
    const timer = setInterval(tick, 1000);
    root.dataset.timer = timer;
    renderAlarms();
    return root;
  }

  onClose(_w) { if (this.el?.dataset.timer) clearInterval(Number(this.el.dataset.timer)); }
}

registerApp(new ClockApp());
