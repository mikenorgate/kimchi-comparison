/* systemui.js — Control Center, Spotlight, Notification Center */
'use strict';

function switchEl(on, cb) {
  const s = el('button', { class: 'switch' + (on ? ' on' : ''), role: 'switch' });
  s.onclick = (e) => { e.stopPropagation(); s.classList.toggle('on'); cb(s.classList.contains('on')); };
  return s;
}
function sliderRow(val, cb, min = 0) {
  const i = el('input', { type: 'range', class: 'slider', min: String(min), max: '100', value: String(Math.round(val * 100)) });
  i.addEventListener('input', () => cb(+i.value / 100));
  i.addEventListener('pointerdown', e => e.stopPropagation());
  return i;
}

const SystemUI = {
  ccOpen: false, ncOpen: false,

  // ---------- Control Center ----------
  toggleCC() { this.ccOpen ? this.closeCC() : this.openCC(); },
  openCC() {
    this.closeNC(); this.ccOpen = true;
    const cc = document.getElementById('cc');
    cc.innerHTML = ''; cc.hidden = false;
    const panel = el('div', { class: 'cc-panel' });

    const row = (icon, icBg, title, sub, sw) => el('div', { class: 'cc-row' },
      el('span', { class: 'cc-ic', style: { background: icBg } }, glyphEl(icon, 15)),
      el('span', { class: 'cc-row-t' }, el('b', { text: title }), el('i', { text: sub })), sw);

    const wifi = Sys.get('wifi'), bt = Sys.get('bt');
    panel.append(el('div', { class: 'cc-tile' },
      row('wifi', '#0a84ff', 'Wi-Fi', wifi.on ? wifi.network : 'Off', switchEl(wifi.on, v => Sys.set('wifi', { ...Sys.get('wifi'), on: v }))),
      row('bt', '#0a84ff', 'Bluetooth', bt.on ? 'On' : 'Off', switchEl(bt.on, v => Sys.set('bt', { ...Sys.get('bt'), on: v }))),
      row('airdrop', '#0a84ff', 'AirDrop', 'Contacts Only', switchEl(true, () => Notif.push('AirDrop', 'AirDrop', 'No nearby devices found.', 'finder'))),
    ));
    panel.append(el('div', { class: 'cc-tile' },
      row('moon', '#5e5ce6', 'Focus', Sys.get('dnd') ? 'Do Not Disturb' : 'Off', switchEl(Sys.get('dnd'), v => Sys.set('dnd', v))),
    ));

    const bright = el('div', { class: 'cc-slider-row' }, el('span', { class: 'cc-s-label', text: 'Display' }));
    bright.append(sliderRow(Sys.get('brightness'), v => { Sys.set('brightness', v); applyBrightness(); }));
    panel.append(el('div', { class: 'cc-tile pad' },
      el('b', { class: 'cc-tile-title', text: 'Display' }),
      el('div', { class: 'cc-line' }, el('span', { class: 'cc-sub', text: 'Dark Mode' }), switchEl(Sys.get('appearance') === 'dark', v => { Sys.set('appearance', v ? 'dark' : 'light'); applyAppearance(); })),
      bright));

    const vol = el('div', { class: 'cc-slider-row' });
    vol.append(sliderRow(Sys.get('volume'), v => Sys.set('volume', v)));
    panel.append(el('div', { class: 'cc-tile pad' },
      el('b', { class: 'cc-tile-title', text: 'Sound' }),
      el('div', { class: 'cc-line' }, el('span', { class: 'cc-sub', text: 'MacBook Pro Speakers' })),
      vol));

    // Music mini-player
    const mp = el('div', { class: 'cc-music' },
      el('span', { class: 'cc-art', id: 'cc-art' }),
      el('span', { class: 'cc-m-txt' }, el('b', { id: 'cc-song', text: 'Not Playing' }), el('i', { id: 'cc-artist', text: 'Music' })),
      el('span', { class: 'cc-m-ctl' },
        el('button', { class: 'cc-btn', onclick: () => MusicPlayer.prev() }, glyphEl('prev', 16)),
        el('button', { class: 'cc-btn', id: 'cc-play', onclick: () => MusicPlayer.toggle() }, glyphEl('play', 16)),
        el('button', { class: 'cc-btn', onclick: () => MusicPlayer.next() }, glyphEl('next', 16))));
    panel.append(el('div', { class: 'cc-tile pad' }, mp));
    MusicPlayer.syncCC();

    cc.append(panel);
    cc.classList.add('show');
    this._ccOutside = (e) => { if (!e.target.closest('.cc-panel') && !e.target.closest('.mb-item')) this.closeCC(); };
    setTimeout(() => document.addEventListener('pointerdown', this._ccOutside), 0);
    this._ccKey = (e) => { if (e.key === 'Escape') this.closeCC(); };
    document.addEventListener('keydown', this._ccKey);
  },
  closeCC() {
    const cc = document.getElementById('cc');
    this.ccOpen = false; cc.classList.remove('show');
    setTimeout(() => { cc.hidden = true; cc.innerHTML = ''; }, 200);
    document.removeEventListener('pointerdown', this._ccOutside);
    document.removeEventListener('keydown', this._ccKey);
  },

  // ---------- Notification Center ----------
  toggleNC() { this.ncOpen ? this.closeNC() : this.openNC(); },
  openNC() {
    this.closeCC(); this.ncOpen = true;
    const nc = document.getElementById('nc');
    nc.innerHTML = ''; nc.hidden = false;
    const now = new Date();
    const panel = el('div', { class: 'nc-panel' });
    panel.append(el('div', { class: 'nc-head' },
      el('div', {},
        el('div', { class: 'nc-date', text: DAYS[now.getDay()] + ', ' + MONTHS[now.getMonth()] + ' ' + now.getDate() }),
        el('div', { class: 'nc-sub', text: 'Notification Center' })),
      el('button', { class: 'btn small', text: 'Clear All', onclick: () => { Notif.clear(); this.openNC(); } })));

    // Widgets
    const w = el('div', { class: 'nc-widgets' });
    // Calendar widget
    const cal = el('div', { class: 'nwidget cal-w' });
    cal.append(el('div', { class: 'cal-w-day', text: DAYS[now.getDay()].toUpperCase() }),
      el('div', { class: 'cal-w-num', text: now.getDate() }));
    const evs = (CalendarStore.eventsFor(now.toDateString()) || []).slice(0, 2);
    cal.append(el('div', { class: 'cal-w-ev' }, evs.length ? evs.map(e => el('div', { class: 'cal-w-evrow', text: e.time + ' ' + e.title })) : 'No Events'));
    cal.onclick = () => { this.closeNC(); WM.open('calendar'); };
    // Weather widget
    const wx = WeatherData.current;
    const wxW = el('div', { class: 'nwidget wx-w' },
      el('div', { class: 'wx-w-city', text: wx.city }),
      el('div', { class: 'wx-w-temp', text: wx.temp + '°' }),
      el('div', { class: 'wx-w-cond', text: wx.cond }),
      el('div', { class: 'wx-w-hl', text: `H:${wx.hi} L:${wx.lo}` }));
    wxW.onclick = () => { this.closeNC(); WM.open('weather'); };
    // Screen time widget
    const st = el('div', { class: 'nwidget st-w' },
      el('div', { class: 'nwidget-title', text: 'SCREEN TIME' }),
      el('div', { class: 'st-w-big', text: '3h 42m' }),
      el('div', { class: 'st-w-sub', text: 'Safari · 1h 12m today' }));
    st.onclick = () => { this.closeNC(); WM.open('settings'); };
    w.append(cal, wxW, st);
    panel.append(w);

    const list = el('div', { class: 'nc-list' });
    const items = Notif.list.slice().reverse();
    if (!items.length) list.append(el('div', { class: 'nc-empty', text: 'No New Notifications' }));
    for (const n of items.slice(0, 20)) {
      const row = el('div', { class: 'notif-card' },
        el('span', { class: 'notif-ic' }, iconEl(n.icon || 'finder', 30)),
        el('span', { class: 'notif-txt' },
          el('div', { class: 'notif-head' }, el('b', { text: n.title }), el('em', { text: timeAgo(n.ts) })),
          el('div', { class: 'notif-body', text: n.body })));
      row.onclick = () => { this.closeNC(); Bus.emit('notif-click', n); };
      list.append(row);
    }
    panel.append(list);
    nc.append(panel);
    nc.classList.add('show');
    this._ncOutside = (e) => { if (!e.target.closest('.nc-panel') && !e.target.closest('.mb-item')) this.closeNC(); };
    setTimeout(() => document.addEventListener('pointerdown', this._ncOutside), 0);
    this._ncKey = (e) => { if (e.key === 'Escape') this.closeNC(); };
    document.addEventListener('keydown', this._ncKey);
  },
  closeNC() {
    const nc = document.getElementById('nc');
    this.ncOpen = false; nc.classList.remove('show');
    setTimeout(() => { nc.hidden = true; nc.innerHTML = ''; }, 200);
    document.removeEventListener('pointerdown', this._ncOutside);
    document.removeEventListener('keydown', this._ncKey);
  },
};

// ---------- Spotlight ----------
const Spotlight = {
  idx: 0, results: [], openState: false,
  open() {
    if (this.openState) return this.close();
    this.openState = true;
    const s = document.getElementById('spot');
    s.innerHTML = ''; s.hidden = false;
    const input = el('input', { class: 'spot-input', placeholder: 'Spotlight Search', spellcheck: 'false' });
    const list = el('div', { class: 'spot-list' });
    s.append(el('div', { class: 'spot-panel' }, el('div', { class: 'spot-top' }, glyphEl('search', 20), input), list));
    requestAnimationFrame(() => s.classList.add('show'));
    input.focus();
    input.addEventListener('input', () => { this.idx = 0; this.render(input.value, list); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); this.idx = Math.min(this.idx + 1, this.results.length - 1); this.paint(list); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); this.idx = Math.max(this.idx - 1, 0); this.paint(list); }
      else if (e.key === 'Enter') { const r = this.results[this.idx]; if (r) { this.close(); r.action(); } }
      else if (e.key === 'Escape') this.close();
    });
    s.addEventListener('pointerdown', (e) => { if (!e.target.closest('.spot-panel')) this.close(); });
    this.render('', list);
  },
  close() {
    this.openState = false;
    const s = document.getElementById('spot');
    s.classList.remove('show');
    setTimeout(() => { s.hidden = true; s.innerHTML = ''; }, 150);
  },
  render(q, list) {
    q = q.trim().toLowerCase();
    const res = [];
    for (const app of Object.values(Apps)) {
      if (!q || app.name.toLowerCase().includes(q))
        res.push({ icon: app.icon, name: app.name, sub: 'Application', action: () => WM.open(app.id) });
    }
    if (q) {
      let count = 0;
      FS.walk((n, p) => {
        if (count > 5 || n.hidden) return;
        if (n.type === 'file' && n.name.toLowerCase().includes(q)) { count++; res.push({ icon: n.kind === 'image' ? 'imgfile' : n.kind === 'pdf' ? 'pdf' : 'txt', name: n.name, sub: p.replace('/' + n.name, ''), action: () => openFile(p) }); }
      }, '/Users');
      const panes = [['wifi', 'Wi-Fi'], ['bluetooth', 'Bluetooth'], ['appearance', 'Appearance'], ['wallpaper', 'Wallpaper'], ['sound', 'Sound'], ['displays', 'Displays'], ['focus', 'Focus'], ['general', 'General']];
      panes.forEach(([id, n]) => { if (n.toLowerCase().includes(q)) res.push({ icon: 'settings', name: n, sub: 'System Settings', action: () => WM.open('settings', { pane: id }) }); });
      res.push({ icon: 'safari', name: `Search the web for “${q}”`, sub: 'Safari', action: () => WM.open('safari', { q }) });
    }
    this.results = res.slice(0, 12);
    this.paint(list);
  },
  paint(list) {
    list.innerHTML = '';
    this.results.forEach((r, i) => {
      const row = el('div', { class: 'spot-res' + (i === this.idx ? ' sel' : '') },
        el('span', { class: 'spot-ic' }, iconEl(r.icon, 30)),
        el('span', {}, el('b', { text: r.name }), el('i', { text: r.sub })));
      row.onpointerenter = () => { this.idx = i; this.paint(list); };
      row.onclick = () => { this.close(); r.action(); };
      list.append(row);
    });
    if (!this.results.length) list.append(el('div', { class: 'spot-empty', text: 'No Results' }));
  },
};
