/* system.js — boot/lock, wallpaper/appearance, CC, NC, Spotlight, Launchpad,
   Mission Control, app switcher, notifications, alerts, context menus, power */
(function () {
  const Mac = window.Mac, Bus = Mac.Bus, h = Mac.h;
  const S = () => Mac.Settings;

  /* ================= wallpaper / appearance ================= */
  const WALLPAPERS = [
    { id: 'tahoe', name: 'Tahoe' }, { id: 'aurora', name: 'Aurora' }, { id: 'sequoia', name: 'Sequoia Dusk' },
    { id: 'bloom', name: 'Bloom' }, { id: 'lagoon', name: 'Lagoon' }, { id: 'graphite', name: 'Graphite' },
  ];
  const ACCENTS = { Blue: '#0A84FF', Purple: '#BF5AF2', Pink: '#FF375F', Red: '#FF453A', Orange: '#FF9F0A', Yellow: '#FFD60A', Green: '#30D158', Graphite: '#98989D' };

  function applyWallpaper() {
    const id = S().get('wallpaper');
    document.getElementById('wallpaper').className = 'wp-' + id;
    document.querySelector('.ls-wallpaper').className = 'ls-wallpaper wp-' + id;
  }
  let mq = null;
  function applyAppearance() {
    let theme = S().get('theme');
    if (theme === 'auto') theme = (mq && mq.matches) ? 'dark' : 'light';
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme !== 'dark');
    document.body.style.setProperty('--accent', ACCENTS[S().get('accent')] || ACCENTS.Blue);
    document.body.style.setProperty('--accent-text', '#fff');
  }
  function applyDim() {
    const b = Mac.clamp(S().get('brightness') ?? 1, 0.15, 1);
    document.getElementById('dim').style.opacity = String((1 - b) * 0.72);
  }
  function applyAll() { applyWallpaper(); applyAppearance(); applyDim(); }

  /* ================= open dispatch ================= */
  Mac.openFinder = path => Mac.launch('finder', { path });
  Mac.System = Mac.System || {};
  Mac.Finder = Mac.Finder || {};
  function openPath(path) {
    const n = Mac.FS.get(path);
    if (!n) return;
    if (n.type === 'folder') return Mac.openFinder(path);
    if (n.kind === 'app') return Mac.launch(n.appId);
    if (n.kind === 'photo' || n.kind === 'image') return Mac.launch('preview', { path });
    return Mac.launch('textedit', { path });
  }

  /* ================= boot / lock / login ================= */
  const bootEl = () => document.getElementById('boot');
  const lockEl = () => document.getElementById('lockscreen');
  let unlocked = false;

  function start() {
    mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', applyAppearance);
    applyAll();
    buildDesktopCtx();
    const b = bootEl();
    b.classList.remove('hidden');
    b.querySelector('.boot-logo').style.display = '';
    document.querySelector('.boot-bar').style.display = '';
    document.body.style.cursor = '';
    document.getElementById('boot-msg').classList.add('hidden');
    const prog = document.getElementById('boot-progress');
    prog.style.width = '0%';
    let p = 0;
    const t = setInterval(() => {
      p += 4 + Math.random() * 9;
      prog.style.width = Math.min(p, 100) + '%';
      if (p >= 100) { clearInterval(t); setTimeout(showLock, 380); }
    }, 90);
  }

  function showLock() {
    bootEl().classList.add('hidden');
    lockEl().classList.remove('hidden');
    document.querySelector('.ls-wallpaper').classList.remove('clear');
    const pass = document.getElementById('ls-pass');
    pass.value = '';
    document.getElementById('ls-name').textContent = S().get('username');
    document.getElementById('ls-avatar').textContent = S().get('username').charAt(0).toUpperCase();
    tickLockClock();
    const wake = () => {
      document.querySelector('.ls-bottom').style.opacity = '1';
      setTimeout(() => pass.focus(), 60);
    };
    document.querySelector('.ls-bottom').style.opacity = '.96';
    lockEl().onclick = () => wake();
    setTimeout(wake, 450);
  }
  function tickLockClock() {
    const d = new Date();
    const lt = document.getElementById('ls-time'), ld = document.getElementById('ls-date');
    if (lt) lt.textContent = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '');
    if (ld) ld.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  setInterval(tickLockClock, 5000);
  function tryLogin() {
    const pass = document.getElementById('ls-pass');
    if (pass.value.trim() === '') { pass.classList.remove('shake'); void pass.offsetWidth; pass.classList.add('shake'); return; }
    unlock();
  }
  function unlock() {
    lockEl().style.transition = 'opacity .5s';
    lockEl().style.opacity = '0';
    setTimeout(() => { lockEl().classList.add('hidden'); lockEl().style.opacity = ''; }, 520);
    const wasFirst = !unlocked;
    unlocked = true;
    enterDesktop(wasFirst);
  }
  function enterDesktop(first) {
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('menubar').classList.remove('hidden');
    document.getElementById('dock').classList.remove('hidden');
    Mac.Menus.renderExtras();
    Mac.Menus.render();
    Mac.Dock.render();
    if (Mac.Finder.renderDesktopIcons) Mac.Finder.renderDesktopIcons();
    if (first) {
      Mac.wm.setActiveApp('finder');
      setTimeout(() => Mac.openFinder(Mac.FS.HOME + '/Desktop'), 400);
      setTimeout(() => notify({ title: 'Welcome back, ' + S().get('username'), body: 'Press ⌘Space for Spotlight, or explore the Dock to get started.', icon: 'finder', appId: 'finder' }), 900);
    }
  }

  function lock() {
    closeAllOverlays();
    Mac.Menus.closeMenus();
    lockEl().classList.remove('hidden');
    showLock();
  }
  function logout() {
    Object.keys(Mac.wm.apps).forEach(id => { if (Mac.wm.apps[id]._running && id !== 'finder') Mac.wm.quitApp(id); });
    lock();
    setTimeout(() => notify({ title: 'Logged out', body: 'All apps were closed. Your files remain on Macintosh HD.', icon: 'finder', appId: 'finder' }), 800);
  }
  function sleep() {
    closeAllOverlays();
    const b = bootEl();
    b.classList.remove('hidden');
    b.querySelector('.boot-logo').style.display = 'none';
    document.querySelector('.boot-bar').style.display = 'none';
    document.getElementById('boot-msg').classList.add('hidden');
    const wake = () => {
      document.removeEventListener('keydown', wake, true);
      b.removeEventListener('click', wake);
      b.classList.add('hidden');
      b.querySelector('.boot-logo').style.display = '';
      document.querySelector('.boot-bar').style.display = '';
      lock();
    };
    setTimeout(() => { document.addEventListener('keydown', wake, true); b.addEventListener('click', wake); }, 400);
  }
  function restart() {
    Object.keys(Mac.wm.apps).forEach(id => { if (Mac.wm.apps[id]._running && id !== 'finder') Mac.wm.quitApp(id); });
    ['desktop', 'menubar', 'dock'].forEach(i => document.getElementById(i).classList.add('hidden'));
    unlocked = false;
    start();
  }
  function shutdown() {
    Object.keys(Mac.wm.apps).forEach(id => { if (Mac.wm.apps[id]._running && id !== 'finder') Mac.wm.quitApp(id); });
    ['desktop', 'menubar', 'dock'].forEach(i => document.getElementById(i).classList.add('hidden'));
    lockEl().classList.add('hidden');
    const b = bootEl();
    b.classList.remove('hidden');
    document.getElementById('boot-progress').style.width = '0%';
    const t = setTimeout(() => {
      b.querySelector('.boot-logo').style.display = 'none';
      document.querySelector('.boot-bar').style.display = 'none';
      document.getElementById('boot-msg').classList.remove('hidden');
      document.body.style.cursor = 'none';
    }, 1400);
  }

  /* ================= notifications ================= */
  const notifs = [];
  function notify(n) {
    n.time = Date.now();
    notifs.unshift(n);
    renderNCNotifs();
    // banner
    if (S().get('focus')) return; // DND suppresses banners
    const layer = document.getElementById('banner-layer');
    const b = h('div', { class: 'banner' },
      h('div', { html: Mac.appIcon(n.icon || (n.appId || 'finder')) }),
      h('div', {}, h('div', { class: 'n-title' }, n.title), h('div', { class: 'n-body' }, n.body || ''))
    );
    b.addEventListener('click', () => { b.remove(); if (n.appId) Mac.launch(n.appId, n.openArgs); });
    layer.append(b);
    let ttl = setTimeout(dismiss, 6000);
    b.addEventListener('mouseenter', () => clearTimeout(ttl));
    b.addEventListener('mouseleave', () => ttl = setTimeout(dismiss, 1600));
    function dismiss() { b.classList.add('out'); setTimeout(() => b.remove(), 260); }
  }

  /* ================= Control Center ================= */
  const ccEl = () => document.getElementById('control-center');
  let ccOpen = false, npState = null; // now playing {title, artist, artHtml, playing, pos, dur}
  Bus.on('music:state', st => { npState = st; if (ccOpen) renderCC(); });
  Bus.on('music:request', req => { /* CC play/pause relays through Music app via this bus */ });

  function toggleCC(force) {
    ccOpen = force !== undefined ? force : !ccOpen;
    if (ccOpen) { closeOverlays(['cc']); renderCC(); ccEl().classList.remove('hidden'); }
    else ccEl().classList.add('hidden');
  }
  function ccToggle(label, icon, key, sub) {
    const on = !!S().get(key);
    const el = h('div', { class: 'cc-row' },
      h('div', { class: 'cc-ico' + (on ? ' on' : ''), html: Mac.GLYPH[icon] }),
      h('div', {}, h('div', { class: 'cc-tt' }, label), h('div', { class: 'cc-ts' }, sub || (on ? 'On' : 'Off')))
    );
    el.addEventListener('click', () => { S().set(key, !on); renderCC(); if (key === 'wifi' || key === 'focus') Mac.Menus.renderExtras(); });
    return el;
  }
  function ccSlider(icon, key, fmt) {
    const val = S().get(key);
    const wrap = h('div', { class: 'cc-card span2' });
    const range = h('input', { type: 'range', class: 'mac-range', min: 0, max: 100, value: Math.round(val * 100) });
    const setFill = () => range.style.setProperty('--fill', range.value + '%');
    range.addEventListener('input', () => { S().set(key, range.value / 100); setFill(); });
    setFill();
    wrap.append(
      h('div', { class: 'cc-tt' }, icon === 'sun' ? 'Display' : 'Sound'),
      h('div', { class: 'cc-slider-row' }, h('span', { class: 'glyph', html: Mac.GLYPH[icon] }), range)
    );
    return wrap;
  }
  function renderCC() {
    const el = ccEl(); el.innerHTML = '';
    const music = npState;
    el.append(
      h('div', { class: 'cc-grid' },
        h('div', { class: 'cc-card span2' },
          ccToggle('Wi-Fi', 'wifi', 'wifi', S().get('wifi') ? S().get('wifiNetwork') : 'Off'),
          ccToggle('Bluetooth', 'bt', 'bluetooth'),
          ccToggle('AirDrop', 'airdrop', 'airdrop', S().get('airdrop') ? 'Contacts Only' : 'Off'),
        ),
        h('div', { class: 'cc-card' }, ccToggle('Do Not Disturb', 'moon', 'focus', S().get('focus') ? 'Focus is on' : 'Off'),
          h('div', { class: 'cc-ts', style: { marginTop: '6px' } }, 'Notifications are ' + (S().get('focus') ? 'silenced.' : 'allowed.'))),
        h('div', { class: 'cc-card' },
          ccToggle('Dark Mode', 'display', '__darkcc', ''),
        ),
        ccSlider('sun', 'brightness'),
        ccSlider('speaker', 'volume'),
        (function () {
          const c = h('div', { class: 'cc-card span2' }, h('div', { class: 'cc-tt', style: { marginBottom: '7px' } }, 'Now Playing'));
          if (!music || !music.title) { c.append(h('div', { class: 'cc-ts' }, 'Not playing')); return c; }
          const art = h('div', { class: 'np-art', html: music.artHtml || '' });
          const playBtn = h('button', { html: music.playing ? Mac.GLYPH.pause : Mac.GLYPH.play });
          playBtn.addEventListener('click', () => Bus.emit('music:control', 'toggle'));
          c.append(h('div', { class: 'cc-np' }, art,
            h('div', {}, h('div', { class: 'cc-tt' }, music.title), h('div', { class: 'cc-ts' }, music.artist || '')),
            h('div', { class: 'cc-np-btns' },
              (() => { const b1 = h('button', { html: Mac.GLYPH.back }); b1.onclick = () => Bus.emit('music:control', 'prev'); return b1; })(),
              playBtn,
              (() => { const b2 = h('button', { html: Mac.GLYPH.fwd }); b2.onclick = () => Bus.emit('music:control', 'next'); return b2; })())));
          return c;
        })(),
      )
    );
    // wire dark mode card specially
    const dmRow = el.querySelectorAll('.cc-row')[3];
    if (dmRow) {
      const on = document.body.classList.contains('dark');
      dmRow.querySelector('.cc-ico').classList.toggle('on', on);
      dmRow.querySelector('.cc-ts').textContent = on ? 'On' : 'Off';
      dmRow.onclick = () => { S().set('theme', on ? 'light' : 'dark'); renderCC(); };
    }
  }

  /* ================= Notification Center ================= */
  const ncEl = () => document.getElementById('notif-center');
  let ncOpen = false;
  function toggleNC(force) {
    ncOpen = force !== undefined ? force : !ncOpen;
    if (ncOpen) { closeOverlays(['nc']); renderNC(); ncEl().classList.remove('hidden'); }
    else ncEl().classList.add('hidden');
  }
  function renderNCNotifs() { if (ncOpen) renderNC(); }
  function renderNC() {
    const el = ncEl(); el.innerHTML = '';
    const d = new Date();
    el.append(h('div', { class: 'nc-date' },
      h('div', { class: 'd1' }, d.toLocaleDateString('en-US', { weekday: 'long' })),
      h('div', { class: 'd2' }, d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))));
    // widgets
    const wgrid = h('div', { class: 'nc-wgrid' });
    wgrid.append(calWidget(), wxWidget(), clkWidget(), musicWidgetCard());
    el.append(wgrid);
    // notifications
    if (!notifs.length) el.append(h('div', { class: 'nc-empty' }, 'No New Notifications'));
    else {
      el.append(h('div', { class: 'nc-clear', onclick: () => { notifs.length = 0; renderNC(); } }, 'Clear All'));
      notifs.forEach(n => {
        el.append(h('div', { class: 'nc-card nc-notif' },
          h('div', { html: Mac.appIcon(n.icon || 'finder') }),
          h('div', {}, h('div', { class: 'n-title' }, n.title), h('div', { class: 'n-body' }, n.body || '')),
          h('div', { class: 'n-time' }, Mac.fmtTime(n.time))
        ));
      });
    }
  }
  function calWidget() {
    const today = new Date();
    const evts = (Mac.CalData ? Mac.CalData.eventsFor(Mac.todayStr()) : []) || [];
    const card = h('div', { class: 'nc-card' },
      h('div', { class: 'nc-wtitle' }, today.toLocaleDateString('en-US', { weekday: 'long' }) + ' ' + today.getDate()),
      evts.length ? evts.slice(0, 3).map(e => h('div', { style: { fontSize: '12px', display: 'flex', gap: '6px', marginTop: '3px' } },
        h('span', { style: { width: '8px', height: '8px', borderRadius: '3px', background: e.color || '#0A84FF', marginTop: '4px', flexShrink: '0' } }),
        h('span', {}, (e.time ? e.time + ' ' : '') + e.title))) : h('div', { style: { fontSize: '12px', color: 'var(--text2)' } }, 'No events today')
    );
    card.addEventListener('click', () => Mac.launch('calendar'));
    return card;
  }
  function wxWidget() {
    const w = Mac.WeatherData.current('Cupertino');
    const card = h('div', { class: 'nc-card' },
      h('div', { class: 'nc-wtitle' }, '📍 ' + w.city),
      h('div', { style: { fontSize: '26px', fontWeight: '300' } }, w.temp + '°'),
      h('div', { style: { fontSize: '12px', color: 'var(--text2)' } }, w.cond + ' — H:' + w.hi + '° L:' + w.lo + '°'));
    card.addEventListener('click', () => Mac.launch('weather'));
    return card;
  }
  function clkWidget() {
    const cities = [['Cupertino', 'America/Los_Angeles'], ['New York', 'America/New_York'], ['Tokyo', 'Asia/Tokyo']];
    const card = h('div', { class: 'nc-card' }, h('div', { class: 'nc-wtitle' }, 'World Clock'));
    cities.forEach(([c, tz]) => card.append(h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '3px' } },
      h('span', {}, c), h('b', { style: { fontVariantNumeric: 'tabular-nums' } }, new Date().toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })))));
    card.addEventListener('click', () => Mac.launch('clock'));
    return card;
  }
  function musicWidgetCard() {
    const m = npState;
    const card = h('div', { class: 'nc-card' }, h('div', { class: 'nc-wtitle' }, 'Music'),
      h('div', { style: { fontSize: '12px', color: 'var(--text2)' } }, m && m.title ? `${m.title} — ${m.artist}` : 'Not playing'));
    card.addEventListener('click', () => Mac.launch('music'));
    return card;
  }

  /* Weather shared dataset (used by Weather app + NC widget) */
  Mac.WeatherData = {
    cities: {
      'Cupertino': { temp: 24, cond: 'Sunny', hi: 27, lo: 15, wk: [[0, '☀️'], [1, '☀️'], [2, '⛅'], [3, '🌧️'], [4, '☀️'], [5, '☀️'], [6, '⛅']] },
      'New York': { temp: 18, cond: 'Partly Cloudy', hi: 21, lo: 12, wk: [[0, '⛅'], [1, '🌧️'], [2, '🌧️'], [3, '☀️'], [4, '⛅'], [5, '☀️'], [6, '☀️']] },
      'Tokyo': { temp: 27, cond: 'Humid', hi: 30, lo: 24, wk: [[0, '🌧️'], [1, '🌧️'], [2, '⛅'], [3, '☀️'], [4, '☀️'], [5, '⛅'], [6, '🌧️']] },
      'London': { temp: 14, cond: 'Light Rain', hi: 16, lo: 9, wk: [[0, '🌧️'], [1, '🌧️'], [2, '🌧️'], [3, '⛅'], [4, '🌧️'], [5, '⛅'], [6, '☀️']] },
    },
    current(name) { const c = this.cities[name] || this.cities['Cupertino']; return Object.assign({ city: name }, c); }
  };

  /* ================= Spotlight ================= */
  const spotEl = () => document.getElementById('spotlight');
  let spotOpen = false, spotSel = 0, spotItems = [];
  function openSpotlight() {
    if (spotOpen) return closeSpotlight();
    closeOverlays(['spot']);
    spotOpen = true; spotSel = 0;
    spotEl().classList.remove('hidden');
    document.getElementById('spot-results').classList.add('hidden');
    const inp = document.getElementById('spot-input');
    inp.value = '';
    setTimeout(() => inp.focus(), 30);
  }
  function closeSpotlight() { spotOpen = false; spotEl().classList.add('hidden'); }
  function spotQuery(q) {
    const res = [];
    q = q.trim();
    if (!q) return res;
    if (q.startsWith('=')) {
      const expr = q.slice(1);
      if (/^[0-9+\-*/(). %^]*$/.test(expr) && expr.trim()) {
        try { const v = Function('"use strict";return(' + expr.replace(/\^/g, '**') + ')')(); res.push({ ico: 'calculator', t: String(v), s: 'Calculator', act: () => copyText(String(v)) }); } catch (e) { }
      }
      return res;
    }
    const ql = q.toLowerCase();
    Object.values(Mac.wm.apps).forEach(a => {
      if (a.hidden) return;
      if (a.name.toLowerCase().includes(ql)) res.push({ ico: a.icon, t: a.name, s: 'Application', act: () => Mac.launch(a.id) });
    });
    Mac.FS.walk((p, n) => {
      if (res.length > 14 || p.startsWith(Mac.FS.TRASH) || n.type !== 'file') return;
      if (n.name.toLowerCase().includes(ql)) res.push({ ico: null, fileNode: n, t: n.name, s: p.replace('/' + n.name, ''), act: () => openPath(p) });
    });
    res.push({ ico: 'safari', t: `Search the web for “${q}”`, s: 'Safari', act: () => Mac.launch('safari', { search: q }) });
    return res.slice(0, 12);
  }
  function renderSpotResults() {
    const q = document.getElementById('spot-input').value;
    const box = document.getElementById('spot-results');
    spotItems = spotQuery(q);
    box.innerHTML = '';
    if (spotItems.length) box.classList.remove('hidden'); else { box.classList.add('hidden'); return; }
    let lastS = null;
    spotItems.forEach((it, i) => {
      if (it.s !== lastS && it.ico) { box.append(h('div', { class: 'spot-h' }, it.s === 'Application' ? 'Applications' : (it.s.startsWith('/') ? 'Documents' : it.s))); lastS = it.s; }
      const iconHtml = it.ico ? Mac.appIcon(it.ico) : `<div class="appicon">${Mac.fileIcon(it.fileNode) || Mac.ICONS.doc}</div>`;
      const row = h('div', { class: 'spot-item' + (i === spotSel ? ' sel' : '') },
        h('div', { html: iconHtml }), h('span', {}, it.t), h('span', { class: 'si-sub' }, it.s));
      row.addEventListener('click', () => { closeSpotlight(); it.act(); });
      row.addEventListener('mousemove', () => { if (spotSel !== i) { spotSel = i; renderSpotResults(); } });
      box.append(row);
    });
  }
  function copyText(t) { try { navigator.clipboard.writeText(t); } catch (e) { } notify({ title: 'Copied to Clipboard', body: t, icon: 'calculator' }); }

  /* ================= Launchpad ================= */
  const lpEl = () => document.getElementById('launchpad');
  let lpOpen = false;
  function launchpad(force) {
    lpOpen = force !== undefined ? force : !lpOpen;
    if (lpOpen) { closeOverlays(['lp']); renderLP(); lpEl().classList.remove('hidden'); setTimeout(() => document.getElementById('lp-search').focus(), 40); }
    else lpEl().classList.add('hidden');
  }
  function renderLP() {
    const q = (document.getElementById('lp-search').value || '').toLowerCase();
    const grid = document.getElementById('lp-grid');
    grid.innerHTML = '';
    Object.values(Mac.wm.apps).filter(a => !a.hidden && a.id !== 'finder' && (!q || a.name.toLowerCase().includes(q))).forEach(a => {
      grid.append(h('div', { class: 'lp-icon', onclick: () => { launchpad(false); Mac.launch(a.id); } },
        h('div', { html: Mac.appIcon(a.icon) }), h('div', { class: 'lp-label' }, a.name)));
    });
  }

  /* ================= Mission Control ================= */
  let mcOpen = false;
  const mcEl = () => document.getElementById('mission');
  function missionControl(force) {
    mcOpen = force !== undefined ? force : !mcOpen;
    const el = mcEl();
    if (!mcOpen) { el.classList.add('hidden'); document.getElementById('windows').style.visibility = 'visible'; return; }
    const wins = Mac.wm.windows.filter(w => !w.closed && w.state !== 'min');
    if (!wins.length) { mcOpen = false; return; }
    closeOverlays(['mc']);
    el.innerHTML = '';
    el.classList.remove('hidden');
    const W = innerWidth, pad = 60;
    const cols = Math.min(wins.length, wins.length > 2 ? 3 : wins.length);
    const rows = Math.ceil(wins.length / cols);
    // staggered tiling: scatter by index to feel organic
    const jitter = i => ((i * 37) % 13) - 6;
    wins.forEach((w, i) => {
      const r = (i / cols) | 0, c = i % cols;
      const scale = Math.min((W - pad * 2) / cols / w.el.offsetWidth, ((innerHeight - 200) / rows) / w.el.offsetHeight, 0.62);
      const cw = w.el.offsetWidth * scale, ch = w.el.offsetHeight * scale;
      const cellW = (W - pad * 2) / cols, cellH = (innerHeight - 240) / rows;
      const x = pad + c * cellW + (cellW - cw) / 2 + jitter(i) * 4;
      const y = 90 + r * cellH + (cellH - ch) / 2;
      const clone = w.el.cloneNode(true);
      clone.className = 'mc-win';
      Object.assign(clone.style, { left: x + 'px', top: y + 'px', width: w.el.offsetWidth + 'px', height: w.el.offsetHeight + 'px', transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', zIndex: i + 1 });
      // counteract scaled size in layout: wrap
      const wrap = h('div', { style: { position: 'absolute', left: x + 'px', top: y + 'px', width: cw + 'px', height: ch + 'px', zIndex: i + 1 } });
      clone.style.left = '0px'; clone.style.top = '0px';
      wrap.append(clone);
      wrap.append(h('div', { class: 'mc-label' }, (w.app.name || '') + (w.titleEl.textContent ? ' — ' + w.titleEl.textContent : '')));
      wrap.addEventListener('click', () => { missionControl(false); w.focus(); });
      el.append(wrap);
    });
    document.getElementById('windows').style.visibility = 'hidden';
    el.onclick = e => { if (e.target === el) missionControl(false); };
    // stop video playback visuals in clones
    el.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (e) { } });
  }

  /* ================= App switcher (Ctrl+Tab) ================= */
  let swOpen = false, swIdx = 0, swList = [];
  function openSwitcher() {
    swList = Mac.wm.runningApps().filter(a => !a.hidden).map(a => a.id);
    if (swList.length < 2) return false;
    const ai = swList.indexOf(Mac.wm.activeApp);
    swIdx = (ai + 1) % swList.length;
    renderSwitcher();
    document.getElementById('switcher').classList.remove('hidden');
    swOpen = true;
    return true;
  }
  function renderSwitcher() {
    const box = document.getElementById('switcher');
    box.innerHTML = '';
    const inner = h('div', { class: 'sw-box' });
    swList.forEach((id, i) => {
      const a = Mac.wm.apps[id];
      inner.append(h('div', { class: 'sw-item' + (i === swIdx ? ' sel' : '') },
        h('div', { html: Mac.appIcon(a.icon) }), h('div', { class: 'sw-name' }, a.name)));
    });
    box.append(inner);
  }
  function closeSwitcher(pick) {
    if (!swOpen) return;
    swOpen = false;
    document.getElementById('switcher').classList.add('hidden');
    if (pick && swList[swIdx]) Mac.launch(swList[swIdx]);
  }

  /* ================= alerts / confirm / sheets ================= */
  function alert(opts) {
    return new Promise(resolve => {
      const layer = document.getElementById('alert-layer');
      layer.innerHTML = '';
      layer.classList.remove('hidden');
      const buttons = (opts.buttons && opts.buttons.length ? opts.buttons : [{ label: 'OK', primary: true }]);
      const box = h('div', { class: 'alert' },
        opts.icon ? h('div', { html: Mac.appIcon(opts.icon, 56) }) : null,
        h('div', { class: 'alert-t' }, opts.title || ''),
        opts.message ? h('div', { class: 'alert-m' }, opts.message) : null,
        opts.extra || null,
        h('div', { class: 'alert-btns' + (buttons.length > 2 ? ' col' : '') },
          buttons.map((b, i) => h('button', {
            class: 'btn' + (b.primary ? ' primary' : '') + (b.destructive ? ' destructive' : ''),
            onclick: () => { layer.classList.add('hidden'); layer.innerHTML = ''; resolve(i); }
          }, b.label))
        ));
      layer.append(box);
      const kd = e => { if (e.key === 'Escape') { cleanup(); resolve(-1); } if (e.key === 'Enter') { cleanup(); resolve(buttons.findIndex(b => b.primary) === -1 ? 0 : buttons.findIndex(b => b.primary)); } };
      function cleanup() { document.removeEventListener('keydown', kd, true); layer.classList.add('hidden'); layer.innerHTML = ''; }
      document.addEventListener('keydown', kd, true);
    });
  }
  function confirm(message, okLabel, title) {
    return alert({ title: title || 'macOS', message, icon: null, buttons: [{ label: 'Cancel' }, { label: okLabel || 'OK', primary: true }] }).then(i => i === 1);
  }

  /* ================= context menu ================= */
  function contextMenu(x, y, items) {
    const host = document.getElementById('ctx-menu');
    host.innerHTML = '';
    host.classList.remove('hidden');
    const close = () => { host.classList.add('hidden'); host.innerHTML = ''; };
    const built = buildItems(items, close);
    host.append(built);
    const r = built.getBoundingClientRect();
    host.style.left = Mac.clamp(x, 4, innerWidth - r.width - 4) + 'px';
    host.style.top = Mac.clamp(y, 30, innerHeight - r.height - 4) + 'px';
  }
  function buildItems(items, close) {
    const el = h('div', { class: 'menu', style: { position: 'fixed' } });
    items.forEach(it => {
      if (!it) return;
      if (it.sep) { el.append(h('div', { class: 'mi-sep' })); return; }
      const en = typeof it.enabled === 'function' ? it.enabled() : it.enabled !== false;
      const row = h('div', { class: 'mi' + (en ? '' : ' disabled') },
        h('span', {}, h('span', { class: 'mi-check' }, it.checked ? '✓' : ''), it.label),
        it.submenu ? h('span', { class: 'mi-sub' }, '▶') : null);
      if (en) {
        if (it.submenu) row.addEventListener('pointerenter', () => {
          closeSubs();
          const r = row.getBoundingClientRect();
          const sub = buildItems(it.submenu, close);
          sub.classList.add('submenu');
          sub.style.left = (r.right - 4) + 'px'; sub.style.top = (r.top - 5) + 'px';
          document.body.append(sub);
        });
        else row.addEventListener('click', e => { e.stopPropagation(); close(); it.action && it.action(); });
      }
      el.append(row);
    });
    return el;
  }
  function closeSubs() { document.querySelectorAll('.menu.submenu').forEach(m => m.remove()); }
  document.addEventListener('pointerdown', e => {
    const host = document.getElementById('ctx-menu');
    if (!host.classList.contains('hidden') && !e.target.closest('#ctx-menu .menu')) { host.classList.add('hidden'); host.innerHTML = ''; closeSubs(); }
    if (ccOpen && !e.target.closest('#control-center') && !e.target.closest('.mb-extra')) toggleCC(false);
    if (ncOpen && !e.target.closest('#notif-center') && !e.target.closest('#mb-clock') && !e.target.closest('.banner')) toggleNC(false);
    if (spotOpen && !e.target.closest('.spot-box')) closeSpotlight();
  }, true);
  document.addEventListener('contextmenu', e => { if (!e.target.closest('input,textarea,[contenteditable]')) e.preventDefault(); });

  /* ================= desktop context menu ================= */
  function buildDesktopCtx() {
    const desk = document.getElementById('desktop');
    desk.addEventListener('contextmenu', e => {
      if (e.target.closest('.win') || e.target.closest('.deskicon')) return;
      e.preventDefault();
      const mi = Mac.Menus.item;
      contextMenu(e.clientX, e.clientY, [
        mi('New Folder', null, () => { const p = Mac.FS.mkdir(Mac.FS.HOME + '/Desktop', 'untitled folder'); }),
        Mac.Menus.SEP,
        mi('Get Info', null, () => Mac.Finder.getInfo(Mac.FS.HOME + '/Desktop')),
        Mac.Menus.SEP,
        mi('Change Wallpaper…', null, () => openSetting('Wallpaper')),
        mi('Show View Options', null, () => openSetting('Desktop & Dock')),
      ]);
    });
    desk.addEventListener('pointerdown', e => {
      if (e.target.closest('.win') || e.target.closest('.deskicon') || e.target.closest('#menubar') || e.target.closest('#dock')) return;
      Mac.wm.windows.forEach(w => w.el.classList.remove('active'));
      Mac.wm.setActiveApp('finder');
    });
  }

  /* ================= About / Force Quit / shortcuts ================= */
  function aboutThisMac() {
    const macSvg = `<svg viewBox="0 0 120 84" width="150"><defs><linearGradient id="abg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f47"/><stop offset="1" stop-color="#14161a"/></linearGradient></defs><rect x="8" y="4" width="104" height="66" rx="7" fill="url(#abg)"/><rect x="14" y="10" width="92" height="54" rx="3" fill="url(#abscr)"/><defs><linearGradient id="abscr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1557d6"/><stop offset=".5" stop-color="#6c59ef"/><stop offset="1" stop-color="#00b8c8"/></linearGradient></defs><path d="M8 74h104l6 6H2Z" fill="#9aa0a8"/><rect x="50" y="74" width="20" height="3" rx="1.5" fill="#6f757d"/></svg>`;
    Mac.wm.createWindow({
      app: 'finder', title: 'About This Mac', width: 640, height: 420, resizable: false,
      build(body) {
        body.style.padding = '26px 30px';
        body.style.overflowY = 'auto';
        body.innerHTML = `
          <div style="display:flex;gap:28px;align-items:center">
            <div>${macSvg}</div>
            <div style="flex:1">
              <div style="font-size:26px;font-weight:800">MacBook Pro</div>
              <div style="color:var(--text2);margin-top:2px">14-inch, Nov 2024</div>
              <div class="am-chip" style="margin-top:10px">macOS Tahoe 26.1</div>
            </div>
          </div>
          <div class="about-rows" style="margin-top:24px">
            ${[['Chip', 'Apple M4 Pro'], ['Memory', '24 GB'], ['Startup disk', 'Macintosh HD'], ['Serial number', 'C02T4HV3Q6N7'], ['macOS', 'Tahoe 26.1 (25B5046k)']].map(r => `<div class="gi-row"><div class="k">${r[0]}</div><div>${r[1]}</div></div>`).join('')}
          </div>
          <div style="display:flex;gap:10px;margin-top:22px">
            <button class="btn" id="am-more">More Info…</button>
            <button class="btn" id="am-update">Software Update…</button>
          </div>
          <div style="font-size:10.5px;color:var(--text3);margin-top:18px">Regulatory Certification<br>™ and © 1983–2026 Apple Inc. All Rights Reserved.<br>License Agreement &nbsp;•&nbsp; Web simulation — not affiliated with Apple Inc.</div>`;
        body.querySelector('#am-more').onclick = () => openSetting('General');
        body.querySelector('#am-update').onclick = () => openSetting('Software Update');
      }
    });
  }
  function aboutApp(app) {
    alert({ title: app.name, message: `Version 1.0 (Web Edition)<br>Part of the macOS Tahoe simulation.`, icon: app.icon });
  }
  function forceQuit() {
    Mac.wm.createWindow({
      app: 'finder', title: 'Force Quit Applications', width: 400, height: 380, resizable: false,
      build(body, win) {
        let sel = null;
        const listEl = h('div', { class: 'fq-list' });
        const render = () => {
          listEl.innerHTML = '';
          const apps = [Mac.wm.apps.finder, ...Mac.wm.runningApps().filter(a => a.id !== 'finder')];
          apps.forEach(a => {
            const nr = a.hung ? h('span', { class: 'nr' }, '(not responding)') : null;
            const row = h('div', { class: 'fq-row' + (sel === a.id ? ' sel' : '') }, h('div', { html: Mac.appIcon(a.icon) }), h('span', {}, a.name), nr);
            row.addEventListener('click', () => { sel = a.id; render(); });
            row.addEventListener('dblclick', () => doQuit());
            listEl.append(row);
          });
        };
        const doQuit = () => {
          if (!sel) return;
          if (sel === 'finder') { notify({ title: 'Finder', body: 'Finder relaunched.', icon: 'finder' }); }
          else Mac.wm.quitApp(sel, true);
          render();
        };
        body.append(
          h('div', { style: { padding: '14px 16px 6px', fontSize: '13px' } }, 'If an app doesn’t respond for a while, select its name and click Force Quit.'),
          listEl,
          h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '10px 14px', borderTop: '.5px solid var(--hairline)' } },
            h('button', { class: 'btn', onclick: () => win.close() }, 'Cancel'),
            h('button', { class: 'btn primary', onclick: doQuit }, 'Force Quit'))
        );
        render();
      }
    });
  }
  function showShortcuts(app) {
    const rows = [
      ['⌘Space', 'Open Spotlight'], ['⌘N', 'New window / new item'], ['⌘T', 'New tab (Safari)'],
      ['⌘W', 'Close window / tab'], ['⌘M', 'Minimize window'], ['⌘Q', 'Quit app'],
      ['⌘H', 'Hide app'], ['⌘,', 'App settings'], ['⌘[ / ⌘]', 'Back / Forward'],
      ['⇧⌘N', 'New folder (Finder)'], ['⌘I', 'Get Info (Finder)'], ['⌘⌫', 'Move to Trash'],
      ['⌘1 / ⌘2', 'Icon / List view (Finder)'], ['^↑', 'Mission Control'], ['^Tab', 'App switcher'],
      ['F4', 'Launchpad'], ['Esc', 'Close menus & overlays'],
    ];
    alert({
      title: app.name + ' — Keyboard Shortcuts', icon: app.icon,
      extra: h('div', { style: { textAlign: 'left', marginTop: '10px', maxHeight: '300px', overflowY: 'auto' } },
        ...rows.map(r => h('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '12px', gap: '14px' } },
          h('span', { style: { color: 'var(--text2)' } }, r[1]), h('span', { class: 'kbd' }, r[0])))),
      buttons: [{ label: 'OK', primary: true }]
    });
  }

  function openSetting(paneName) {
    Mac.launch('settings', { pane: paneName });
  }

  /* ================= overlay bookkeeping ================= */
  function closeOverlays(except) {
    except = except || [];
    if (!except.includes('cc') && ccOpen) toggleCC(false);
    if (!except.includes('nc') && ncOpen) toggleNC(false);
    if (!except.includes('spot') && spotOpen) closeSpotlight();
    if (!except.includes('lp') && lpOpen) launchpad(false);
    if (!except.includes('mc') && mcOpen) missionControl(false);
  }
  function closeAllOverlays() { closeOverlays([]); }

  /* ================= global keys ================= */
  document.addEventListener('keydown', e => {
    if (e.key === 'F4' || (e.key === 'F3')) { e.preventDefault(); e.key === 'F4' ? launchpad() : missionControl(); return; }
    if ((e.metaKey || e.ctrlKey) && e.code === 'Space' && !e.repeat) { e.preventDefault(); openSpotlight(); return; }
    if (e.ctrlKey && e.key === 'ArrowUp') { e.preventDefault(); missionControl(); return; }
    if (e.ctrlKey && e.key === 'Tab') { e.preventDefault(); if (!swOpen) openSwitcher(); else { swIdx = (swIdx + (e.shiftKey ? swList.length - 1 : 1)) % swList.length; renderSwitcher(); } return; }
    if (e.key === 'Escape') { if (spotOpen) closeSpotlight(); if (lpOpen) launchpad(false); if (mcOpen) missionControl(false); }
    if (e.key === 'Escape' && swOpen) closeSwitcher(false);
  });
  document.addEventListener('keyup', e => { if (e.key === 'Control' && swOpen) closeSwitcher(true); });

  /* spotlight input handlers */
  document.getElementById('spot-input').addEventListener('input', renderSpotResults);
  document.getElementById('spot-input').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); spotSel = Math.min(spotSel + 1, spotItems.length - 1); renderSpotResults(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); spotSel = Math.max(spotSel - 1, 0); renderSpotResults(); }
    if (e.key === 'Enter') { const it = spotItems[spotSel]; if (it) { closeSpotlight(); it.act(); } }
  });
  document.getElementById('lp-search').addEventListener('input', renderLP);
  document.getElementById('lp-search').addEventListener('keydown', e => { if (e.key === 'Enter') { const first = document.querySelector('.lp-icon'); if (first) first.click(); } });
  document.getElementById('lockscreen').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); }, true);
  document.getElementById('ls-go').addEventListener('click', tryLogin);
  document.getElementById('ls-pass').addEventListener('input', () => document.getElementById('ls-hint').classList.add('show'));

  /* live re-apply reactions */
  Bus.on('setting:wallpaper', applyWallpaper);
  Bus.on('setting:theme', applyAppearance);
  Bus.on('setting:accent', applyAppearance);
  Bus.on('setting:brightness', applyDim);
  Bus.on('setting:theme', () => { if (ccOpen) renderCC(); });

  /* shared standard edit menu for apps */
  Mac.Std = {
    editMenu: () => ({
      title: 'Edit', items: [
        Mac.Menus.item('Undo', '⌘Z', () => { try { document.execCommand('undo'); } catch (e) { } }),
        Mac.Menus.item('Redo', '⇧⌘Z', () => { try { document.execCommand('redo'); } catch (e) { } }),
        Mac.Menus.SEP,
        Mac.Menus.item('Cut', '⌘X', () => { try { document.execCommand('cut'); } catch (e) { } }),
        Mac.Menus.item('Copy', '⌘C', () => { try { document.execCommand('copy'); } catch (e) { } }),
        Mac.Menus.item('Paste', '⌘V', () => { try { document.execCommand('paste'); } catch (e) { } }),
        Mac.Menus.item('Select All', '⌘A', () => { try { document.execCommand('selectAll'); } catch (e) { } }),
      ]
    }),
  };

  /* exports */
  Mac.System = Object.assign(Mac.System || {}, {
    start, sleep, restart, shutdown, lock, logout, unlock,
    notify, alert, confirm, contextMenu,
    openSpotlight, toggleCC, toggleNC, launchpad, missionControl,
    aboutThisMac, aboutApp, forceQuit, showShortcuts, openSetting, openPath,
    applyWallpaper, applyAppearance, applyDim, applyAll,
    WALLPAPERS, ACCENTS,
    closeAllOverlays,
  });
})();
