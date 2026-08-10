/* apps.media.js — Music(player), Photos, Weather(data), Clock, Mail, Messages, Reminders, Maps, Stickies */
'use strict';

// ============================================================ MUSIC PLAYER (global, drives Control Center)
const ALBUMS = [
  { name: 'Tahoe Nights', artist: 'The Shorelines', hue: 215, tracks: [['Alpenglow', '3:42'], ['Emerald Bay', '4:05'], ['Sand Harbor', '2:58'], ['Night Swim', '3:33']] },
  { name: 'Liquid Glass', artist: 'Refraction', hue: 280, tracks: [['Specular', '3:12'], ['Caustics', '4:44'], ['Index 1.5', '3:27']] },
  { name: 'Sequoia Sunrise', artist: 'Granite State', hue: 20, tracks: [['Trailhead', '4:01'], ['Half Dome', '5:12'], ['Valley View', '3:36']] },
  { name: 'Kernel Panic', artist: 'sudo rm', hue: 160, tracks: [['Segmentation Lullaby', '2:47'], ['Null Pointer Waltz', '3:19'], ['Core Dump', '4:20']] },
  { name: 'Cupertino', artist: 'Infinite Loop', hue: 330, tracks: [['One Apple Park Way', '3:55'], ['Keynote', '6:02'], ['Availability', '3:08']] },
  { name: 'Aurora DRM', artist: 'Northern Lights', hue: 120, tracks: [['Magnetosphere', '4:30'], ['Solar Wind', '3:47'], ['Ion Trails', '5:01']] },
];
const dur2s = (d) => { const [m, s] = d.split(':').map(Number); return m * 60 + s; };
const ALL_TRACKS = [];
ALBUMS.forEach((a, ai) => a.tracks.forEach(([t, d], ti) => ALL_TRACKS.push({ title: t, dur: d, secs: dur2s(d), artist: a.artist, album: a.name, hue: a.hue, ai, ti })));

const MusicPlayer = {
  idx: -1, playing: false, pos: 0, timer: null,
  current() { return ALL_TRACKS[this.idx] || null; },
  play(i) {
    if (i != null) { this.idx = i; this.pos = 0; }
    if (this.idx < 0) this.idx = 0;
    this.playing = true;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 1000);
    this.sync();
  },
  pause() { this.playing = false; clearInterval(this.timer); this.sync(); },
  toggle() { this.playing ? this.pause() : this.play(); },
  next() { this.idx = (this.idx + 1) % ALL_TRACKS.length; this.play(this.idx); },
  prev() { this.idx = (this.idx - 1 + ALL_TRACKS.length) % ALL_TRACKS.length; this.play(this.idx); },
  tick() {
    const t = this.current(); if (!t) return;
    this.pos++;
    if (this.pos >= t.secs) return this.next();
    this.syncUIOnly();
  },
  sync() { this.syncUIOnly(); Bus.emit('music'); },
  syncUIOnly() { this.syncCC(); Bus.emit('music-tick'); },
  syncCC() {
    const s = document.getElementById('cc-song');
    if (!s) return;
    const t = this.current();
    s.textContent = t ? t.title : 'Not Playing';
    document.getElementById('cc-artist').textContent = t ? t.artist : 'Music';
    const art = document.getElementById('cc-art');
    if (art) art.style.background = t ? `linear-gradient(135deg, hsl(${t.hue},80%,60%), hsl(${(t.hue + 40) % 360},70%,40%))` : 'var(--milk)';
    const play = document.getElementById('cc-play');
    if (play) { play.innerHTML = ''; play.append(glyphEl(this.playing ? 'pause' : 'play', 16)); }
  },
};
regApp({
  id: 'music', name: 'Music', icon: 'music', single: true,
  size: { w: 940, h: 600 }, min: { w: 720, h: 480 },
  build(win) {
    let view = 'home';
    let album = null;
    const side = el('div', {});
    const main = el('div', { class: 'mus-main' });
    const bar = el('div', { class: 'mus-bar' });
    win.content.append(el('div', { class: 'mus-app' },
      el('div', { class: 'two-pane mus-top' }, el('div', { class: 'sidebar' }, side), el('div', { class: 'main-pane' }, main)), bar));

    function renderSide() {
      side.innerHTML = '';
      side.append(el('div', { class: 'side-sec', text: 'Library' }));
      side.append(sideItem('music', 'Home', view === 'home', () => { view = 'home'; render(); }));
      side.append(sideItem('clock', 'Recently Added', false, () => { view = 'songs'; render(); }));
      side.append(el('div', { class: 'side-sec', text: 'Playlists' }));
      side.append(sideItem('heart', 'Favorites', view === 'songs', () => { view = 'songs'; render(); }));
    }
    function render() {
      renderSide(); renderMain(); renderBar();
    }
    function renderMain() {
      main.innerHTML = '';
      if (album) {
        const t0 = ALL_TRACKS.findIndex(t => t.album === album.name);
        main.append(el('div', { class: 'mus-album-head' },
          el('button', { class: 'tb-btn', onclick: () => { album = null; render(); } }, glyphEl('chevL', 16)),
          el('span', { class: 'mus-art big', style: { background: artCss(album.hue) } }),
          el('span', {}, el('h2', { text: album.name }), el('p', { text: album.artist + ' · ' + album.tracks.length + ' songs' })),
          el('button', { class: 'btn primary pill', text: '▶ Play', onclick: () => MusicPlayer.play(t0) })));
        album.tracks.forEach(([t, d], i) => main.append(songRow(t0 + i)));
        return;
      }
      if (view === 'home') {
        main.append(el('h1', { class: 'mus-h', text: 'Home' }));
        main.append(el('div', { class: 'mus-grid' }, ALBUMS.map(a => {
          const card = el('div', { class: 'mus-card' },
            el('span', { class: 'mus-art', style: { background: artCss(a.hue) }, html: '<span class="mus-note">♪</span>' }),
            el('b', { text: a.name }), el('i', { text: a.artist }));
          card.onclick = () => { album = a; render(); };
          return card;
        })));
        main.append(el('h2', { class: 'mus-h2', text: 'Recently Played' }));
        ALL_TRACKS.slice(0, 6).forEach((_, i) => main.append(songRow(i)));
      } else {
        main.append(el('h1', { class: 'mus-h', text: 'Songs' }));
        ALL_TRACKS.forEach((_, i) => main.append(songRow(i)));
      }
    }
    function artCss(hue) { return `linear-gradient(135deg, hsl(${hue},82%,62%), hsl(${(hue + 45) % 360},72%,42%))`; }
    function songRow(i) {
      const t = ALL_TRACKS[i];
      const playing = MusicPlayer.idx === i;
      const row = el('div', { class: 'mus-row' + (playing ? ' sel' : '') },
        el('span', { class: 'mus-eq' }, playing && MusicPlayer.playing ? '<span class="eq"><i></i><i></i><i></i></span>' : (i + 1)),
        el('span', { class: 'mus-art sm', style: { background: artCss(t.hue) } }),
        el('span', { class: 'mus-t' }, el('b', { text: t.title }), el('i', { text: t.artist + ' — ' + t.album })),
        el('span', { class: 'mus-dur', text: t.dur }));
      row.ondblclick = () => MusicPlayer.play(i);
      row.onclick = () => {};
      row.addEventListener('contextmenu', (e) => { e.preventDefault(); ctxMenu(e.clientX, e.clientY, [{ label: 'Play', action: () => MusicPlayer.play(i) }, { label: 'Love', action: (e) => Notif.push('Music', 'Loved', `${t.title} added to Favorites.`, 'music') }]); });
      return row;
    }
    function renderBar() {
      const t = MusicPlayer.current();
      bar.innerHTML = '';
      bar.append(
        el('span', { class: 'mus-art sm bar-art', style: { background: t ? artCss(t.hue) : 'var(--milk)' } }),
        el('span', { class: 'mus-bar-txt' },
          el('b', { text: t ? t.title : 'Not Playing' }),
          el('i', { text: t ? t.artist : '' })),
        el('span', { class: 'mus-ctl' },
          el('button', { class: 'cc-btn', onclick: () => MusicPlayer.prev() }, glyphEl('prev', 17)),
          el('button', { class: 'cc-btn big', onclick: () => MusicPlayer.toggle() }, glyphEl(MusicPlayer.playing ? 'pause' : 'play', 20)),
          el('button', { class: 'cc-btn', onclick: () => MusicPlayer.next() }, glyphEl('next', 17))),
        el('span', { class: 'mus-prog' },
          (() => { const g = el('div', { class: 'mus-prog-fill' }); const p = t ? MusicPlayer.pos / t.secs : 0; g.style.width = (p * 100) + '%'; g.id = 'mus-fill'; return el('div', { class: 'mus-prog-bg' }, g); })(),
          el('span', { class: 'mus-time', text: t ? `${Math.floor(MusicPlayer.pos / 60)}:${pad2(MusicPlayer.pos % 60)} / ${t.dur}` : '' })),
        (() => { const s = sliderRow(Sys.get('volume'), v => Sys.set('volume', v)); s.style.width = '110px'; return s; })());
    }
    Bus.on('music-tick', () => {
      const f = document.getElementById('mus-fill');
      const t = MusicPlayer.current();
      if (f && t) f.style.width = (MusicPlayer.pos / t.secs * 100) + '%';
    });
    Bus.on('music', () => { if (WM.windows.includes(win)) render(); });
    render();
    win.setTitle('Music');
  },
});

// ============================================================ PHOTOS
const PhotoFavs = {
  KEY: 'tahoe-favs',
  get: () => JSON.parse(localStorage.getItem('tahoe-favs') || '[]'),
  toggle(name) { const f = this.get(); const i = f.indexOf(name); i >= 0 ? f.splice(i, 1) : f.push(name); localStorage.setItem('tahoe-favs', JSON.stringify(f)); },
};
regApp({
  id: 'photos', name: 'Photos', icon: 'photos', single: true,
  size: { w: 980, h: 620 }, min: { w: 700, h: 460 },
  build(win) {
    let view = 'library';
    let viewing = null;
    const side = el('div', {});
    const main = el('div', { class: 'ph-main' });
    win.toolbar.append(tbBtn('play', 'Slideshow', () => slideshow()), el('span', { class: 'tb-spacer' }));
    win.content.append(el('div', { class: 'two-pane photos-app' }, el('div', { class: 'sidebar' }, side), el('div', { class: 'main-pane' }, main)));

    function all() {
      const pics = (FS.get(FS.HOME + '/Pictures').children ? Object.values(FS.get(FS.HOME + '/Pictures').children) : []);
      const caps = JSON.parse(localStorage.getItem('tahoe-captures') || '[]').map((c, i) => ({ name: 'Capture ' + (i + 1) + '.jpg', img: null, data: c, kind: 'image' }));
      return [...caps, ...pics];
    }
    function renderSide() {
      side.innerHTML = '';
      side.append(el('div', { class: 'side-sec', text: 'Photos' }));
      side.append(sideItem('photos', 'Library', view === 'library', () => { view = 'library'; render(); }, all().length));
      side.append(sideItem('heart', 'Favorites', view === 'favs', () => { view = 'favs'; render(); }, PhotoFavs.get().length));
      side.append(el('div', { class: 'side-sec', text: 'Albums' }));
      side.append(sideItem('folder', 'Sessions', false, () => { view = 'library'; render(); }));
    }
    function items() {
      const a = all();
      if (view === 'favs') return a.filter(p => PhotoFavs.get().includes(p.name));
      return a;
    }
    function render() {
      renderSide();
      main.innerHTML = '';
      if (viewing) return renderSingle(viewing);
      main.append(el('h1', { class: 'ph-h', text: view === 'favs' ? 'Favorites' : 'Library' }));
      const grid = el('div', { class: 'ph-grid' });
      items().forEach(p => {
        const cell = el('button', { class: 'ph-cell', style: p.img ? { background: p.img } : {} });
        if (p.data) cell.append(el('img', { src: p.data, class: 'ph-real' }));
        if (PhotoFavs.get().includes(p.name)) cell.append(el('span', { class: 'ph-favdot' }, glyphEl('heart', 12)));
        cell.onclick = () => { viewing = p; render(); };
        grid.append(cell);
      });
      if (!items().length) grid.append(el('div', { class: 'empty-hint', text: 'No Photos' }));
      main.append(grid);
    }
    function renderSingle(p) {
      const fav = PhotoFavs.get().includes(p.name);
      const hero = el('div', { class: 'ph-hero', style: p.img ? { background: p.img } : {} });
      if (p.data) hero.append(el('img', { src: p.data }));
      main.append(el('div', { class: 'ph-single' },
        el('div', { class: 'ph-single-bar' },
          el('button', { class: 'tb-btn', onclick: () => { viewing = null; render(); } }, glyphEl('chevL', 16)),
          el('span', { class: 'tb-spacer' }),
          el('button', { class: 'tb-btn' + (fav ? ' loved' : ''), title: 'Favorite', onclick: (e) => { PhotoFavs.toggle(p.name); render(); } }, glyphEl('heart', 16)),
          tbBtn('share', 'Share', () => Notif.push('Photos', 'Shared', p.name + ' sent via AirDrop.', 'photos'))),
        hero,
        el('div', { class: 'ph-meta' }, el('b', { text: p.name }), el('i', { text: 'From ' + (p.data ? 'Photo Booth' : 'Pictures') }))));
    }
    function slideshow() {
      const arr = items(); if (!arr.length) return;
      let i = 0;
      viewing = arr[0]; render();
      const iv = setInterval(() => {
        if (!WM.windows.includes(win)) return clearInterval(iv);
        i = (i + 1) % arr.length; viewing = arr[i]; render();
      }, 2400);
    }
    render();
    win.setTitle('Photos');
  },
});

// ============================================================ WEATHER
const WeatherData = {
  current: { city: 'Cupertino', temp: 72, cond: 'Sunny', hi: 78, lo: 59 },
  hourly: Array.from({ length: 12 }, (_, i) => ({ h: (() => { const d = new Date(Date.now() + i * 3600000); let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; return (h % 12 || 12) + ' ' + ap; })(), t: 66 + Math.round(9 * Math.sin((i + 2) / 12 * Math.PI)), c: i < 6 ? 'sun' : i < 8 ? 'part' : 'clear' })),
  daily: [['Today', 59, 78, 'sun'], ['Fri', 58, 76, 'sun'], ['Sat', 60, 74, 'part'], ['Sun', 61, 73, 'rain'], ['Mon', 60, 75, 'part'], ['Tue', 62, 77, 'sun'], ['Wed', 63, 79, 'sun'], ['Thu', 62, 80, 'sun'], ['Fri', 61, 78, 'sun'], ['Sat', 60, 75, 'part']],
};
const WX_ICONS = { sun: '☀️', part: '⛅', rain: '🌧️', clear: '🌙', snow: '❄️' };
regApp({
  id: 'weather', name: 'Weather', icon: 'weather', single: true,
  size: { w: 760, h: 620 }, min: { w: 560, h: 520 },
  build(win) {
    const c = WeatherData.current;
    const main = el('div', { class: 'wx-app' },
      el('div', { class: 'wx-hero' },
        el('div', { class: 'wx-city', text: c.city }),
        el('div', { class: 'wx-temp', text: c.temp + '°' }),
        el('div', { class: 'wx-cond', text: c.cond }),
        el('div', { class: 'wx-hl', text: `H:${c.hi}°  L:${c.lo}°` })),
      el('div', { class: 'wx-card' },
        el('div', { class: 'wx-card-title', text: 'HOURLY FORECAST' }),
        el('div', { class: 'wx-hours' }, WeatherData.hourly.map(h => el('div', { class: 'wx-hour' },
          el('span', { text: h.h }), el('span', { class: 'wx-ico', text: WX_ICONS[h.c] }), el('b', { text: h.t + '°' }))))),
      el('div', { class: 'wx-card' },
        el('div', { class: 'wx-card-title', text: '10-DAY FORECAST' }),
        ...WeatherData.daily.map(([d, lo, hi, ic]) => {
          const loA = 55, hiA = 82;
          const left = (lo - loA) / (hiA - loA) * 100, w = (hi - lo) / (hiA - loA) * 100;
          return el('div', { class: 'wx-day' },
            el('span', { class: 'wx-d', text: d }), el('span', { class: 'wx-ico', text: WX_ICONS[ic] }),
            el('span', { class: 'wx-lo', text: lo + '°' }),
            el('span', { class: 'wx-bar' }, el('span', { class: 'wx-bar-fill', style: { left: left + '%', width: w + '%' } })),
            el('b', { text: hi + '°' }));
        })),
      el('div', { class: 'wx-tiles' },
        ...[['UV INDEX', '4', 'Moderate'], ['WIND', '8 mph', 'NW'], ['HUMIDITY', '46%', 'Comfortable'], ['AIR QUALITY', '28', 'Good'], ['SUNRISE', '6:42 AM', 'Sunset 7:58 PM'], ['FEELS LIKE', '74°', 'Humidity is making it feel warmer']]
          .map(([t, v, s]) => el('div', { class: 'wx-tile' }, el('div', { class: 'wx-card-title', text: t }), el('b', { text: v }), el('i', { text: s })))));
    win.content.append(main);
    win.setTitle('Weather — ' + c.city);
  },
});

// ============================================================ CLOCK
regApp({
  id: 'clock', name: 'Clock', icon: 'clock', single: true,
  size: { w: 640, h: 520 }, min: { w: 520, h: 460 },
  build(win) {
    let tab = 'World Clock';
    const main = el('div', { class: 'clk-main' });
    win.toolbar.append(seg([['clock', 'World Clock', 'World Clock'], ['moon', 'Alarms', 'Alarms'], ['play', 'Stopwatch', 'Stopwatch'], ['plus', 'Timer', 'Timer']].map(([i, k]) => [i, k, k]), tab, (k) => { tab = k; render(); }));
    win.content.append(main);
    const CITIES = [['Cupertino', 'America/Los_Angeles'], ['New York', 'America/New_York'], ['London', 'Europe/London'], ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney']];
    const alarms = JSON.parse(localStorage.getItem('tahoe-alarms') || '[{"time":"7:30 AM","label":"Wake up","on":true}]');
    const saveAlarms = () => localStorage.setItem('tahoe-alarms', JSON.stringify(alarms));
    let iv = null;
    const clearIv = () => { if (iv) { clearInterval(iv); iv = null; } };

    const sw = { t: 0, run: false, laps: [] };
    const tm = { left: 0, total: 0, run: false };

    function render() {
      clearIv();
      main.innerHTML = '';
      if (tab === 'World Clock') {
        const wrap = el('div', { class: 'clk-list' });
        main.append(wrap);
        const paint = () => {
          wrap.innerHTML = '';
          CITIES.forEach(([name, tz]) => {
            const d = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
            let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM';
            const night = h < 6 || h >= 19;
            wrap.append(el('div', { class: 'clk-row' + (night ? ' night' : '') },
              el('span', { class: 'clk-city', text: name }),
              el('span', { class: 'clk-diff', text: `${(d.getHours() - new Date().getHours() + 24) % 24 >= 0 ? '+' : ''}${d.getHours() - new Date().getHours()} hrs` }),
              el('b', { class: 'clk-time', text: `${h % 12 || 12}:${pad2(d.getMinutes())} ${ap}` })));
          });
        };
        paint(); iv = setInterval(paint, 15000);
      } else if (tab === 'Alarms') {
        main.append(el('div', { class: 'clk-list al' },
          ...alarms.map((a, i) => el('div', { class: 'clk-row' },
            el('span', {}, el('b', { class: 'clk-time', text: a.time }), el('i', { class: 'clk-lab', text: a.label })),
            el('span', { class: 'clk-al-ctl' },
              (() => { const s = switchEl(a.on, v => { a.on = v; saveAlarms(); }); return s; })(),
              el('button', { class: 'mini-x', text: '×', onclick: () => { alarms.splice(i, 1); saveAlarms(); render(); } })))),
          el('button', { class: 'btn small full', text: '＋ Add Alarm', onclick: () => {
            const inp = el('input', { class: 'fld', value: '8:00 AM' });
            modal({ title: 'New Alarm', icon: 'clock', width: 300, body: inp, buttons: [{ label: 'Cancel' }, { label: 'Save', primary: true, action: () => { alarms.push({ time: inp.value.trim() || '8:00 AM', label: 'Alarm', on: true }); saveAlarms(); render(); } }] });
          } })));
      } else if (tab === 'Stopwatch') {
        const disp = el('div', { class: 'sw-disp', text: '00:00.00' });
        const lapList = el('div', { class: 'sw-laps' });
        const btnRow = el('div', { class: 'sw-btns' });
        main.append(el('div', { class: 'sw' }, disp, btnRow, lapList));
        const fmt = (ms) => { const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, cs = Math.floor(ms / 10) % 100; return `${pad2(m)}:${pad2(s)}.${pad2(cs)}`; };
        const paintBtns = () => {
          btnRow.innerHTML = '';
          btnRow.append(
            el('button', { class: 'btn small', text: sw.run ? 'Lap' : 'Reset', onclick: () => {
              if (sw.run) { sw.laps.unshift(sw.t); lapList.innerHTML = ''; sw.laps.forEach((l, i) => lapList.append(el('div', { class: 'sw-lap' }, el('span', { text: 'Lap ' + (sw.laps.length - i) }), el('b', { text: fmt(l) })))); }
              else { sw.t = 0; sw.laps = []; disp.textContent = '00:00.00'; lapList.innerHTML = ''; }
            } }),
            el('button', { class: 'btn small ' + (sw.run ? 'danger' : 'primary'), text: sw.run ? 'Stop' : 'Start', onclick: () => { sw.run ? clearIv() : start(); sw.run = !sw.run; paintBtns(); } }));
        };
        const start = () => { let last = Date.now(); iv = setInterval(() => { const n = Date.now(); sw.t += n - last; last = n; disp.textContent = fmt(sw.t); }, 33); };
        paintBtns();
      } else { // Timer
        const disp = el('div', { class: 'sw-disp', text: fmtT(tm.left) });
        main.append(el('div', { class: 'sw' }, disp,
          el('div', { class: 'sw-btns wrap' }, [1, 5, 10, 20].map(m => el('button', { class: 'btn small', text: m + ' min', onclick: () => { tm.left = tm.total = m * 60; disp.textContent = fmtT(tm.left); } }))),
          el('div', { class: 'sw-btns' },
            el('button', { class: 'btn small', text: 'Cancel', onclick: () => { tm.run = false; tm.left = 0; clearIv(); disp.textContent = fmtT(0); } }),
            el('button', { class: 'btn small primary', text: tm.run ? 'Running…' : 'Start', onclick: (e) => {
              if (!tm.left || tm.run) return;
              tm.run = true; e.target.textContent = 'Running…';
              iv = setInterval(() => {
                tm.left--; disp.textContent = fmtT(tm.left);
                if (tm.left <= 0) {
                  clearIv(); tm.run = false;
                  beep(880, 0.6, 'sine', 0.2); setTimeout(() => beep(880, 0.6, 'sine', 0.2), 700);
                  Notif.push('Timer', 'Timer Done', 'Your countdown finished.', 'clock');
                  Bus.emit('notif-click', {}); // no-op focus safety
                }
              }, 1000);
            } }))));
      }
    }
    function fmtT(s) { return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`; }
    Bus.on('win-close', (w) => { if (w === win) clearIv(); });
    render();
    win.setTitle('Clock');
  },
});

// ============================================================ MAIL
const MailStore = {
  KEY: 'tahoe-mail',
  load() {
    let m; try { m = JSON.parse(localStorage.getItem(this.KEY)); } catch {}
    if (!m) {
      m = [
        { id: uid(), box: 'Inbox', from: 'Apple', subj: 'macOS Tahoe is here', body: 'Meet Liquid Glass — a translucent new material that reflects and refracts its surroundings.\n\nYour Mac has never looked this good.\n\n— The macOS team', ts: Date.now() - 3600000, unread: true },
        { id: uid(), box: 'Inbox', from: 'App Store', subj: 'Your receipt from Apple', body: 'Dear Customer,\n\nThank you for your purchase.\n\nPixel Pals — $0.00 (demo)\n\nApple Store, Infinite Loop', ts: Date.now() - 86400000, unread: true },
        { id: uid(), box: 'Inbox', from: 'Design Team', subj: 'Specular highlights spec', body: 'Hey Mike,\n\nLatest Liquid Glass highlights are looking great in the Dock. Can you review the menu bar transparency before Friday?\n\nThanks!', ts: Date.now() - 3600000 * 30, unread: false },
        { id: uid(), box: 'VIP', from: 'Tim Apple', subj: 'One more thing…', body: 'Great work on the Tahoe demo. The Dock magnification curve is *chef\'s kiss*.\n\nT.', ts: Date.now() - 3600000 * 50, unread: false },
        { id: uid(), box: 'Junk', from: 'Free Cruise!!!', subj: 'You WON a cruise to Lake Tahoe', body: 'CONGRATULATIONS!!!!! Click now!!!!\n\n(This is a demo: real Macs move mail like this to Junk automatically.)', ts: Date.now() - 86400000 * 2, unread: false },
      ];
      localStorage.setItem(this.KEY, JSON.stringify(m));
    }
    return m;
  },
  save(m) { localStorage.setItem(this.KEY, JSON.stringify(m)); },
};
regApp({
  id: 'mail', name: 'Mail', icon: 'mail', single: true,
  size: { w: 1000, h: 620 }, min: { w: 760, h: 480 },
  build(win) {
    let msgs = MailStore.load();
    let box = 'Inbox', selId = null, q = '';
    const boxes = [['Inbox', 'mail'], ['VIP', 'heart'], ['Sent', 'share'], ['Junk', 'gearSm'], ['Trash', 'trashg']];
    const sideEl = el('div', {});
    const listEl = el('div', { class: 'mail-list' });
    const readEl = el('div', { class: 'mail-read' });
    const searchIn = el('input', { class: 'fld seek', placeholder: 'Search' });
    searchIn.addEventListener('input', () => { q = searchIn.value.toLowerCase(); renderList(); });
    win.toolbar.append(tbBtn('compose', 'New message', () => compose()), tbBtn('trashg', 'Delete', () => del()), el('span', { class: 'tb-spacer' }), searchIn);
    win.content.append(el('div', { class: 'mail-app' },
      el('div', { class: 'sidebar mail-side' }, sideEl), listEl, readEl));

    function inBox() { return msgs.filter(m => m.box === box && (!q || (m.from + m.subj + m.body).toLowerCase().includes(q))).sort((a, b) => b.ts - a.ts); }
    function renderSide() {
      sideEl.innerHTML = '';
      sideEl.append(el('div', { class: 'side-sec', text: 'Mailboxes' }));
      boxes.forEach(([b, ic]) => {
        const unread = msgs.filter(m => m.box === b && m.unread).length;
        sideEl.append(sideItem(ic, b, box === b, () => { box = b; selId = null; render(); }, b === 'Inbox' && unread ? unread : null));
      });
      sideEl.append(el('div', { class: 'side-sec', text: 'Accounts' }), sideItem('mail', 'iCloud', false, null));
    }
    function renderList() {
      listEl.innerHTML = '';
      inBox().forEach(m => {
        const row = el('div', { class: 'mail-row' + (m.id === selId ? ' sel' : '') + (m.unread ? ' unread' : '') },
          el('div', { class: 'mail-row-top' }, el('b', { text: m.from }), el('em', { text: fmtDate(m.ts) })),
          el('div', { class: 'mail-subj', text: m.subj }),
          el('div', { class: 'mail-prev', text: m.body.split('\n')[0] }));
        row.onclick = () => { selId = m.id; m.unread = false; MailStore.save(msgs); renderSide(); renderList(); renderRead(); };
        listEl.append(row);
      });
      if (!inBox().length) listEl.append(el('div', { class: 'empty-hint', text: 'No Mail' }));
    }
    function renderRead() {
      const m = msgs.find(x => x.id === selId);
      readEl.innerHTML = '';
      if (!m) { readEl.append(el('div', { class: 'empty-hint', text: 'No Message Selected' })); return; }
      readEl.append(
        el('div', { class: 'mail-r-head' },
          el('div', { class: 'mail-r-subj', text: m.subj }),
          el('div', { class: 'mail-r-from' }, el('span', { class: 'mail-avatar', text: m.from[0] }),
            el('span', {}, el('b', { text: m.from }), el('i', { text: 'To: mike@icloud.com' })),
            el('em', { text: new Date(m.ts).toLocaleString() })),
          el('div', { class: 'mail-r-actions' },
            el('button', { class: 'btn small', text: 'Reply', onclick: () => compose(m) }),
            el('button', { class: 'btn small', text: 'Forward', onclick: () => compose(null, m) }))),
        el('div', { class: 'mail-r-body', text: m.body }));
    }
    function render() { renderSide(); renderList(); renderRead(); DockBadge.mail(msgs.filter(m => m.box === 'Inbox' && m.unread).length); }
    function del() {
      const m = msgs.find(x => x.id === selId); if (!m) return;
      if (m.box === 'Trash') msgs = msgs.filter(x => x !== m); else m.box = 'Trash';
      selId = null; MailStore.save(msgs); render();
    }
    function compose(replyTo, fwd) {
      const to = el('input', { class: 'fld', placeholder: 'To:', value: replyTo ? replyTo.from + ' <demo@apple.com>' : '' });
      const subj = el('input', { class: 'fld', placeholder: 'Subject:', value: replyTo ? 'Re: ' + replyTo.subj : fwd ? 'Fwd: ' + fwd.subj : '' });
      const body = el('textarea', { class: 'fld mail-compose-body', placeholder: 'Write your message…' });
      if (fwd) body.value = '\n\nBegin forwarded message:\n\n' + fwd.body;
      modal({
        title: 'New Message', icon: 'mail', width: 520,
        body: el('div', { class: 'dlg-col' }, to, subj, body),
        buttons: [{ label: 'Discard' }, { label: 'Send', primary: true, action: () => {
          msgs.push({ id: uid(), box: 'Sent', from: 'mike — to ' + (to.value || 'unknown'), subj: subj.value || '(no subject)', body: body.value, ts: Date.now(), unread: false });
          MailStore.save(msgs); render();
          Notif.push('Mail', 'Message sent', subj.value || '(no subject)', 'mail');
        } }],
      });
    }
    render();
    win.setTitle('Mail');
  },
});
const DockBadge = {
  mail(n) { if (WM.windowsOf('mail').length || n) Dock.setBadge('mail', n || null); },
};

// ============================================================ MESSAGES
const REPLIES = ['Sounds good! 🎉', 'On my way.', 'Did you see the new Liquid Glass?', 'lol', 'Can we do it tomorrow instead?', 'Perfect, see you then!', 'Sending it now…', 'That wallpaper is gorgeous 😍', 'ok cool', 'Say hi to everyone for me!'];
regApp({
  id: 'messages', name: 'Messages', icon: 'messages', single: true,
  size: { w: 860, h: 560 }, min: { w: 640, h: 420 },
  build(win) {
    const convos = [
      { name: 'Tim Apple', color: '#5e5ce6', msgs: [{ me: false, text: 'How’s the Tahoe demo coming?' }, { me: true, text: 'The Dock magnification is *chef’s kiss*' }, { me: false, text: 'Ha! Can’t wait to see it.' }] },
      { name: 'Design Team', color: '#0a84ff', msgs: [{ me: false, text: 'New specular highlights are in Figma' }, { me: true, text: 'On it — reviewing tonight' }] },
      { name: 'Mom', color: '#30d158', msgs: [{ me: false, text: 'Call when you get a chance ❤️' }] },
      { name: 'Sam', color: '#ff9f0a', msgs: [{ me: true, text: 'Lunch Friday?' }, { me: false, text: 'Yes! Tahoe Inn at noon' }] }];
    let cur = 0;
    const sideEl = el('div', {});
    const chatEl = el('div', { class: 'im-chat' });
    win.toolbar.append(tbBtn('compose', 'New message', () => {
      const name = prompt('Send message to:', 'New Friend');
      if (!name) return;
      convos.push({ name, color: '#bf5af2', msgs: [] });
      cur = convos.length - 1; render();
    }));
    win.content.append(el('div', { class: 'two-pane im-app' },
      el('div', { class: 'sidebar im-side' }, sideEl), el('div', { class: 'main-pane' }, chatEl)));

    function render() { renderSide(); renderChat(); }
    function renderSide() {
      sideEl.innerHTML = '';
      convos.forEach((c, i) => {
        const last = c.msgs[c.msgs.length - 1];
        const row = el('div', { class: 'im-row' + (i === cur ? ' active' : '') },
          el('span', { class: 'mail-avatar', style: { background: c.color }, text: c.name[0] }),
          el('span', { class: 'im-row-txt' }, el('b', { text: c.name }), el('i', { text: last ? (last.me ? 'You: ' : '') + last.text : 'No messages' })),
          c.unread ? el('span', { class: 'im-unread', text: c.unread }) : null);
        row.onclick = () => { cur = i; c.unread = 0; updateBadge(); render(); };
        sideEl.append(row);
      });
    }
    function renderChat() {
      const c = convos[cur];
      chatEl.innerHTML = '';
      const scroll = el('div', { class: 'im-scroll' });
      c.msgs.forEach(m => scroll.append(el('div', { class: 'im-bubble-row ' + (m.me ? 'me' : 'them') },
        el('div', { class: 'im-bubble', text: m.text }))));
      const input = el('input', { class: 'fld im-input', placeholder: 'iMessage' });
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' || !input.value.trim()) return;
        e.stopPropagation();
        send(input.value.trim()); input.value = '';
      });
      input.addEventListener('keydown', (e) => e.stopPropagation());
      chatEl.append(el('div', { class: 'im-head' }, el('span', { class: 'mail-avatar', style: { background: c.color }, text: c.name[0] }), el('b', { text: c.name })), scroll, el('div', { class: 'im-input-row' }, input));
      scroll.scrollTop = scroll.scrollHeight;
      setTimeout(() => input.focus(), 60);
    }
    function send(text) {
      const c = convos[cur];
      c.msgs.push({ me: true, text });
      renderChat(); renderSide();
      const scroll = chatEl.querySelector('.im-scroll');
      const typing = el('div', { class: 'im-bubble-row them' }, el('div', { class: 'im-bubble typing', html: '<span></span><span></span><span></span>' }));
      scroll.append(typing); scroll.scrollTop = scroll.scrollHeight;
      const target = c;
      setTimeout(() => {
        typing.remove();
        const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
        target.msgs.push({ me: false, text: reply });
        const focused = WM.topWindow() === win && convos[cur] === target && !win.minimized && WM.windows.includes(win);
        if (focused) { renderChat(); renderSide(); }
        else {
          target.unread = (target.unread || 0) + 1;
          updateBadge();
          Notif.push('Messages', target.name, reply, 'messages');
          if (WM.windows.includes(win)) { renderSide(); if (convos[cur] === target) renderChat(); }
        }
        beep(1046, 0.12, 'sine', 0.08);
      }, 1400 + Math.random() * 1600);
    }
    function updateBadge() {
      const n = convos.reduce((s, c) => s + (c.unread || 0), 0);
      Dock.setBadge('messages', n || null);
    }
    Bus.on('notif-click', (n) => { if (n.app !== 'Messages') return; const i = convos.findIndex(c => c.name === n.title); if (i >= 0) { cur = i; convos[i].unread = 0; updateBadge(); WM.windows.includes(win) ? (win.minimized ? WM.restore(win) : WM.focus(win), render()) : null; } });
    render();
    win.setTitle('Messages');
  },
});

// ============================================================ REMINDERS
const RemindersStore = {
  KEY: 'tahoe-rem',
  load() {
    let r; try { r = JSON.parse(localStorage.getItem(this.KEY)); } catch {}
    if (!r) {
      r = [
        { name: 'Reminders', color: '#0a84ff', items: [{ id: uid(), text: 'Review Liquid Glass PRs', done: false }, { id: uid(), text: 'Back up photo library', done: true }] },
        { name: 'Groceries', color: '#30d158', items: [{ id: uid(), text: 'Oat milk', done: false }, { id: uid(), text: 'Eggs', done: false }, { id: uid(), text: 'Strawberries', done: true }] },
        { name: 'Work', color: '#ff9f0a', items: [{ id: uid(), text: 'Ship Tahoe demo', done: false }] },
      ];
      localStorage.setItem(this.KEY, JSON.stringify(r));
    }
    return r;
  },
  save(r) { localStorage.setItem(this.KEY, JSON.stringify(r)); },
};
regApp({
  id: 'reminders', name: 'Reminders', icon: 'reminders', single: true,
  size: { w: 800, h: 540 }, min: { w: 620, h: 420 },
  build(win) {
    let lists = RemindersStore.load();
    let cur = 0;
    const sideEl = el('div', {});
    const main = el('div', { class: 'rem-main' });
    win.toolbar.append(tbBtn('plus', 'New list', () => {
      const name = prompt('List name:', 'New List');
      if (!name) return;
      lists.push({ name, color: '#bf5af2', items: [] });
      cur = lists.length - 1; RemindersStore.save(lists); render();
    }));
    win.content.append(el('div', { class: 'two-pane rem-app' }, el('div', { class: 'sidebar' }, sideEl), el('div', { class: 'main-pane' }, main)));
    function render() {
      sideEl.innerHTML = '';
      sideEl.append(el('div', { class: 'side-sec', text: 'My Lists' }));
      lists.forEach((l, i) => sideEl.append(sideItem(l.color, l.name, i === cur, () => { cur = i; render(); }, l.items.filter(x => !x.done).length)));
      renderMain();
      win.setTitle('Reminders');
    }
    function renderMain() {
      const l = lists[cur];
      main.innerHTML = '';
      main.append(el('h1', { class: 'rem-h', style: { color: l.color }, text: l.name }));
      const active = l.items.filter(x => !x.done);
      const done = l.items.filter(x => x.done);
      const mk = (it) => {
        const row = el('div', { class: 'rem-row' + (it.done ? ' done' : '') },
          el('button', { class: 'rem-check' + (it.done ? ' on' : ''), style: it.done ? { background: l.color, borderColor: l.color } : {} }),
          el('span', { class: 'rem-text', text: it.text }),
          el('button', { class: 'mini-x', text: '×', onclick: () => { l.items = l.items.filter(x => x !== it); RemindersStore.save(lists); render(); } }));
        row.querySelector('.rem-check').onclick = () => { it.done = !it.done; RemindersStore.save(lists); render(); };
        return row;
      };
      active.forEach(it => main.append(mk(it)));
      const addIn = el('input', { class: 'rem-add', placeholder: '＋ New Reminder' });
      addIn.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter' && addIn.value.trim()) {
          l.items.push({ id: uid(), text: addIn.value.trim(), done: false });
          RemindersStore.save(lists); render();
          setTimeout(() => main.querySelector('.rem-add')?.focus(), 30);
        }
      });
      main.append(addIn);
      if (done.length) {
        main.append(el('div', { class: 'side-sec', text: `Completed (${done.length})` }));
        done.forEach(it => main.append(mk(it)));
      }
    }
    render();
  },
});

// ============================================================ MAPS
regApp({
  id: 'maps', name: 'Maps', icon: 'maps', single: true,
  size: { w: 900, h: 600 }, min: { w: 620, h: 440 },
  build(win) {
    const PLACES = [
      ['Apple Park', -122.0352, 37.3220, -122.0052, 37.3420, 37.3320, -122.0202],
      ['Golden Gate Bridge', -122.4967, 37.8085, -122.4567, 37.8385, 37.8199, -122.4783],
      ['Lake Tahoe', -120.15, 38.90, -119.85, 39.20, 39.05, -120.00],
      ['New York City', -74.03, 40.68, -73.88, 40.82, 40.75, -73.97],
      ['London', -0.20, 51.45, 0.02, 51.56, 51.505, -0.10],
    ];
    const frame = el('iframe', { class: 'maps-frame', title: 'Map' });
    const goto = (p) => {
      const [name, lon1, lat1, lon2, lat2, mlon, mlat] = p;
      frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon1},${lat1},${lon2},${lat2}&layer=mapnik&marker=${mlat},${mlon}`;
      win.setTitle('Maps — ' + name);
    };
    const search = el('input', { class: 'fld seek', placeholder: 'Search for a place', list: 'maps-places' });
    const dl = el('datalist', { id: 'maps-places' }, ...PLACES.map(p => el('option', { value: p[0] })));
    search.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const p = PLACES.find(x => x[0].toLowerCase().includes(search.value.toLowerCase()));
      if (p) goto(p); else Notif.push('Maps', 'No results', `Nothing found for “${search.value}”. Try a suggested place.`, 'maps');
    });
    win.toolbar.append(search, tbBtn('search', 'Search', () => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))), el('span', { class: 'tb-spacer' }),
      ...PLACES.slice(0, 3).map(p => el('button', { class: 'btn small', text: p[0].split(' ')[0], onclick: () => goto(p) })));
    win.content.append(el('div', { class: 'maps-wrap' }, dl, frame,
      el('div', { class: 'maps-hint', text: 'Map data © OpenStreetMap contributors · Needs internet' })));
    goto(PLACES[0]);
  },
});

// ============================================================ STICKIES
regApp({
  id: 'stickies', name: 'Stickies', icon: 'stickies', single: true,
  size: { w: 620, h: 460 }, min: { w: 420, h: 320 },
  build(win) {
    let notes = JSON.parse(localStorage.getItem('tahoe-stickies') || 'null') || [
      { id: uid(), text: 'Buy milk 🥛', color: 'yellow' },
      { id: uid(), text: 'Tahoe demo → Friday!', color: 'pink' },
      { id: uid(), text: 'Call mom', color: 'green' },
    ];
    const save = () => localStorage.setItem('tahoe-stickies', JSON.stringify(notes));
    const grid = el('div', { class: 'st-grid' });
    win.toolbar.append(tbBtn('plus', 'New sticky', () => {
      const colors = ['yellow', 'pink', 'green', 'blue'];
      notes.push({ id: uid(), text: '', color: colors[notes.length % colors.length] });
      save(); render();
      setTimeout(() => grid.lastChild?.querySelector('.st-note')?.focus(), 40);
    }));
    win.content.append(grid);
    function render() {
      grid.innerHTML = '';
      notes.forEach(n => {
        const area = el('div', { class: 'st-note', contenteditable: 'true', spellcheck: 'false', html: esc(n.text) });
        area.addEventListener('input', () => { n.text = area.textContent; clearTimeout(n._t); n._t = setTimeout(save, 300); });
        const card = el('div', { class: 'st-card ' + n.color },
          el('button', { class: 'st-x', text: '×', onclick: () => { notes = notes.filter(x => x !== n); save(); render(); } }), area);
        grid.append(card);
      });
    }
    render();
    win.setTitle('Stickies');
  },
});
