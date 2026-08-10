/* media.js — Photos, Music, Podcasts, TV, Preview */
(function () {
  const Mac = window.Mac, h = Mac.h;

  /* ============================ PHOTOS ============================ */
  const PHOTO_SEEDS = ['yosemite-dawn', 'big-sur', 'half-dome', 'sf-golden-gate', 'lake-tahoe', 'mono-lake', 'joshua-tree', 'zion-canyon', 'glacier-point', 'venice-beach', 'maui-coast', 'banff-lake', 'sierra-nevada', 'point-lobos', 'crater-lake', 'saguaro', 'acadia', 'denali', 'olympic-coast', 'horseshoe-bend', 'antelope', 'badlands', 'everglades', 'redwoods'];
  let favs = Mac.loadJSON('mac.photos.favs', []);
  let deleted = Mac.loadJSON('mac.photos.deleted', []);
  const savePhotos = () => { Mac.saveJSON('mac.photos.favs', favs); Mac.saveJSON('mac.photos.deleted', deleted); };

  function photos(view) {
    let list = PHOTO_SEEDS.filter(s => !deleted.includes(s));
    if (view === 'favorites') list = list.filter(s => favs.includes(s));
    return list;
  }

  function openPhotos() {
    const st = { view: 'library' };
    const win = Mac.wm.createWindow({
      app: 'photos', title: 'Photos', width: 940, height: 600, minW: 620, minH: 380,
      build(body, w) { buildPhotos(body, w, st); },
    });
    win._phState = st;
    return win;
  }

  function buildPhotos(body, win, st) {
    const side = h('div', { class: 'sidebar' });
    side.append(h('div', { class: 'side-h' }, 'Library'));
    [['Library', 'library', 'photo'], ['Favorites', 'favorites', 'flag']].forEach(([label, id, ico]) => {
      const el = h('div', { class: 'side-item' + (st.view === id ? ' sel' : ''), 'data-v': id }, h('span', { class: 'glyph', html: Mac.GLYPH[ico] }), label);
      el.addEventListener('click', () => { st.view = id; renderPhotoGrid(win); });
      side.append(el);
    });
    side.append(h('div', { class: 'side-h' }, 'Albums'));
    const importBtn = h('div', { class: 'side-item' }, h('span', { class: 'glyph', html: Mac.GLYPH.download }), 'Import Simulated Photo');
    importBtn.addEventListener('click', () => {
      const seed = 'import-' + Date.now();
      PHOTO_SEEDS.unshift(seed);
      Mac.FS.write(Mac.FS.HOME + '/Pictures/' + seed + '.jpg', '', { kind: 'photo', seed, size: 320000 });
      renderPhotoGrid(win);
      Mac.System.notify({ title: 'Photos', body: 'Imported 1 generated photo.', icon: 'photos' });
    });
    side.append(importBtn);
    const gridWrap = h('div', { class: 'main-pane' });
    body.append(h('div', { class: 'split' }, side, gridWrap));
    Object.assign(win, { _phSide: side, _phMain: gridWrap });
    renderPhotoGrid(win);
    Bus_renderOnFs(win);
  }
  function Bus_renderOnFs(win) { const f = () => { if (!win.closed) renderPhotoGrid(win); }; Mac.Bus.on('fs', f); }

  function renderPhotoGrid(win) {
    const st = win._phState, main = win._phMain;
    main.innerHTML = '';
    win._phSide.querySelectorAll('.side-item[data-v]').forEach(el => el.classList.toggle('sel', el.dataset.v === st.view));
    const list = photos(st.view);
    if (!list.length) { main.append(h('div', { class: 'empty-pane' }, 'No photos here yet')); return; }
    const grid = h('div', { class: 'ph-grid' });
    list.forEach(seed => {
      const cell = h('div', { class: 'ph-cell' },
        h('img', { src: Mac.genPhoto(seed, 320, 320), draggable: 'false' }),
        favs.includes(seed) ? h('span', { class: 'ph-fav' }, '❤') : null);
      cell.addEventListener('click', () => photoViewer(win, seed));
      grid.append(cell);
    });
    main.append(grid);
  }

  function photoViewer(win, seed) {
    const st = win._phState;
    const main = win._phMain;
    main.innerHTML = '';
    const list = photos(st.view);
    const view = h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minHeight: '0', background: '#000' } });
    const render = () => {
      view.innerHTML = '';
      const stage = h('div', { class: 'ph-view' }, h('img', { src: Mac.genPhoto(seed, 1200, 900) }));
      const prev = h('button', { class: 'ph-nav l', html: Mac.GLYPH['chev-l'] });
      const next = h('button', { class: 'ph-nav r', html: Mac.GLYPH['chev-r'] });
      const i = list.indexOf(seed);
      prev.addEventListener('click', e => { e.stopPropagation(); seed = list[(i - 1 + list.length) % list.length]; render(); });
      next.addEventListener('click', e => { e.stopPropagation(); seed = list[(i + 1) % list.length]; render(); });
      if (list.length > 1) stage.append(prev, next);
      view.append(stage, h('div', { class: 'statusbar', style: { background: '#111', color: '#aaa', borderTop: 'none' } }, seed + ' — ' + (favs.includes(seed) ? '♥ Favorite' : '')));
    };
    const tb = h('div', { class: 'toolbar', style: { background: 'var(--chrome)' } });
    const back = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-l'], title: 'Back to grid' });
    back.addEventListener('click', () => renderPhotoGrid(win));
    const favBtn = h('button', { class: 'tb-btn', title: 'Favorite' }, '♡');
    const updFav = () => favBtn.innerHTML = favs.includes(seed) ? '❤️' : '♡'; updFav();
    favBtn.addEventListener('click', () => {
      favs = favs.includes(seed) ? favs.filter(s => s !== seed) : [...favs, seed];
      savePhotos(); updFav();
      if (st.view === 'favorites' && !favs.includes(seed)) renderPhotoGrid(win);
      else render();
    });
    const delBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.trash, title: 'Delete Photo' });
    delBtn.addEventListener('click', () => {
      deleted.push(seed); favs = favs.filter(s => s !== seed); savePhotos();
      const p = Mac.FS.HOME + '/Pictures/' + seed + '.jpg';
      if (Mac.FS.exists(p)) Mac.FS.trash(p);
      Mac.System.notify({ title: 'Photos', body: 'Photo moved to Recently Deleted (and the Trash).', icon: 'photos' });
      renderPhotoGrid(win);
    });
    const infoBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.info, title: 'Info' });
    infoBtn.addEventListener('click', () => Mac.System.alert({ title: seed + '.jpg', message: 'JPEG, 640 × 480<br>Generated deterministically from its seed.<br>Captured somewhere beautiful, presumably.', icon: 'photos' }));
    tb.append(back, h('span', { style: { fontWeight: '600' } }, seed), h('div', { style: { flex: '1' } }), favBtn, infoBtn, delBtn);
    main.append(tb, view);
    render();
  }

  /* ============================ MUSIC ============================ */
  const MUSIC_DB = [
    { id: 'al1', title: 'After Hours', artist: 'The Weeknd', tracks: [['Alone Again', 246], ['Too Late', 240], ['Hardest To Love', 211], ['Scared to Live', 191], ['Blinding Lights', 200]] },
    { id: 'al2', title: 'Random Access Memories', artist: 'Daft Punk', tracks: [['Give Life Back to Music', 275], ['The Game of Love', 321], ['Giorgio by Moroder', 544], ['Instant Crush', 337], ['Get Lucky', 369]] },
    { id: 'al3', title: 'Currents', artist: 'Tame Impala', tracks: [['Let It Happen', 447], ['Nangs', 105], ['The Moment', 255], ['The Less I Know the Better', 216]] },
    { id: 'al4', title: '1989', artist: 'Taylor Swift', tracks: [['Welcome to New York', 212], ['Blank Space', 231], ['Style', 231], ['Out of the Woods', 235]] },
    { id: 'al5', title: 'Blonde', artist: 'Frank Ocean', tracks: [['Nikes', 314], ['Ivy', 249], ['Pink + White', 184], ['Solo', 257]] },
    { id: 'al6', title: 'Lemonade', artist: 'Beyoncé', tracks: [['Pray You Catch Me', 196], ['Hold Up', 221], ['Don’t Hurt Yourself', 234], ['Sorry', 233]] },
    { id: 'al7', title: 'Rumours', artist: 'Fleetwood Mac', tracks: [['Second Hand News', 168], ['Dreams', 257], ['Never Going Back Again', 146], ['Go Your Own Way', 224]] },
    { id: 'al8', title: 'Thriller', artist: 'Michael Jackson', tracks: [['Wanna Be Startin’ Somethin’', 363], ['Thriller', 357], ['Beat It', 258], ['Billie Jean', 294]] },
  ];
  const mus = {
    album: null, trackIdx: 0, playing: false, pos: 0, timer: null,
    track() { return this.album ? this.album.tracks[this.trackIdx] : null; },
    emit() {
      const t = this.track();
      Mac.Bus.emit('music:state', t ? { title: t[0], artist: this.album.artist, playing: this.playing, artHtml: Mac.albumArt(this.album.id, this.album.title), pos: this.pos, dur: t[1] } : { title: null });
      updatePlayerUI();
    },
    play(album, idx) {
      this.stopTimer();
      this.album = album; this.trackIdx = idx; this.pos = 0; this.playing = true;
      this.timer = setInterval(() => {
        this.pos++;
        const t = this.track();
        if (t && this.pos >= t[1]) this.next(); else { updProgress(); updCC(); }
      }, 1000);
      this.emit();
    },
    toggle() {
      if (!this.album) return;
      this.playing = !this.playing;
      if (this.playing) { this.play(this.album, this.trackIdx); this.pos = Math.max(0, this.pos - 1); }
      else this.stopTimer();
      this.emit();
    },
    next(dir) { if (!this.album) return; let i = this.trackIdx + (dir === -1 ? -1 : 1); i = (i + this.album.tracks.length) % this.album.tracks.length; this.play(this.album, i); },
    stopTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } },
  };
  function updCC() { /* CC reads via music:state; cheap re-emit */ }
  function updProgress() {
    document.querySelectorAll('.mp-fill').forEach(el => {
      const t = mus.track();
      if (t) el.style.width = (mus.pos / t[1] * 100) + '%';
    });
  }
  Mac.Bus.on('music:control', cmd => {
    if (cmd === 'toggle') mus.toggle();
    else if (cmd === 'next') mus.next(1);
    else if (cmd === 'prev') mus.next(-1);
    updatePlayerUI();
  });
  function updatePlayerUI() {
    document.querySelectorAll('.mp-play-toggle').forEach(b => b.innerHTML = mus.playing ? Mac.GLYPH.pause : Mac.GLYPH.play);
    document.querySelectorAll('.mp-t').forEach(el => el.textContent = mus.track() ? mus.track()[0] : 'Not Playing');
    document.querySelectorAll('.mp-a').forEach(el => el.textContent = mus.album ? mus.album.artist : '');
    document.querySelectorAll('.mp-art').forEach(el => el.innerHTML = mus.album ? Mac.albumArt(mus.album.id, mus.album.title) : '');
    updProgress();
  }

  function openMusic(args) {
    const st = { view: 'albums', album: null };
    const win = Mac.wm.createWindow({
      app: 'music', title: 'Music', width: 920, height: 600, minW: 620, minH: 400,
      build(body, w) { buildMusic(body, w, st, args); },
    });
    win._musState = st;
    return win;
  }

  function buildMusic(body, win, st, args) {
    const side = h('div', { class: 'sidebar' });
    side.append(h('div', { class: 'side-h' }, 'Apple Music'));
    [['Listen Now', 'albums', 'note'], ['Browse', 'albums2', 'globe'], ['Songs', 'songs', 'music2']].forEach(([label, id, ico]) => {
      const el = h('div', { class: 'side-item' + ((st.view === 'albums' && id === 'albums') ? ' sel' : ''), 'data-v': id }, h('span', { class: 'glyph', style: { color: '#fa2d48' }, html: Mac.GLYPH[ico] }), label);
      el.addEventListener('click', () => { st.view = id === 'albums2' ? 'albums' : id; st.album = null; renderMusic(win); });
      side.append(el);
    });
    side.append(h('div', { class: 'side-h' }, 'Library'), h('div', { class: 'side-item' }, h('span', { class: 'glyph', style: { color: '#fa2d48' }, html: Mac.GLYPH.download }), 'Recently Added'));
    const mainWrap = h('div', { class: 'main-pane', style: { position: 'relative' } });
    const main = h('div', { class: 'mus-main' });
    // player
    const player = h('div', { class: 'mus-player' });
    const art = h('div', { class: 'mp-art' });
    const prev = h('button', { html: Mac.GLYPH.back }); prev.addEventListener('click', () => mus.next(-1));
    const playBtn = h('button', { class: 'mp-play-toggle', html: Mac.GLYPH.play });
    playBtn.addEventListener('click', () => mus.toggle());
    const next = h('button', { html: Mac.GLYPH.fwd }); next.addEventListener('click', () => mus.next(1));
    const tEl = h('div', { class: 'mp-t' }, 'Not Playing');
    const aEl = h('div', { class: 'mp-a' });
    const bar = h('div', { class: 'mp-bar' }, h('div', { class: 'mp-fill' }));
    bar.addEventListener('click', e => {
      const t = mus.track(); if (!t) return;
      const r = bar.getBoundingClientRect();
      mus.pos = Math.round((e.clientX - r.left) / r.width * t[1]); updProgress();
    });
    player.append(art, h('div', { class: 'mp-btns' }, prev, playBtn, next), h('div', { class: 'mp-mid' }, tEl, aEl, bar));
    mainWrap.append(main, player);
    body.append(h('div', { class: 'music-root' }, side, mainWrap));
    Object.assign(win, { _musMain: main });
    renderMusic(win);
    if (args && args.playFirst) { mus.play(MUSIC_DB[0], 0); }
    updatePlayerUI();
  }

  function renderMusic(win) {
    const st = win._musState, main = win._musMain;
    main.innerHTML = '';
    if (st.view === 'songs') {
      main.append(h('div', { class: 'mus-h1' }, 'Songs'));
      MUSIC_DB.forEach(al => al.tracks.forEach((t, i) => main.append(trackRow(al, i))));
      return;
    }
    if (st.album) { renderAlbum(win, st.album); return; }
    main.append(h('div', { class: 'mus-h1' }, st.view === 'albums' ? 'Listen Now' : 'Browse'));
    const grid = h('div', { class: 'mus-albums' });
    MUSIC_DB.forEach(al => {
      const card = h('div', { class: 'mus-album' },
        h('div', { class: 'ma-art', html: Mac.albumArt(al.id, al.title) }),
        h('div', { class: 'ma-t' }, al.title), h('div', { class: 'ma-a' }, al.artist));
      card.addEventListener('click', () => { st.album = al; renderMusic(win); });
      grid.append(card);
    });
    main.append(grid);
  }
  function trackRow(al, i) {
    const t = al.tracks[i];
    const row = h('div', { class: 'mus-track' + (mus.album === al && mus.trackIdx === i && (mus.playing || mus.pos > 0) ? ' playing' : '') },
      h('span', { class: 'mt-num' }, i + 1), h('span', {}, t[0] + ' — ' + al.artist), h('span', { class: 'mt-dur' }, fmtDur(t[1])));
    row.addEventListener('dblclick', () => { mus.play(al, i); renderAllMusic(); });
    row.addEventListener('click', () => { mus.play(al, i); renderAllMusic(); });
    return row;
  }
  function renderAlbum(win, al) {
    const main = win._musMain;
    const back = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-l'] });
    back.addEventListener('click', () => { win._musState.album = null; renderMusic(win); });
    const playAll = h('button', { class: 'btn primary', style: { borderRadius: '12px' } }, '▶ Play');
    playAll.addEventListener('click', () => { mus.play(al, 0); renderAllMusic(); });
    main.append(
      h('div', { style: { display: 'flex', gap: '18px', alignItems: 'flex-end', marginBottom: '16px' } },
        h('div', { style: { width: '130px', height: '130px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.3)' }, html: Mac.albumArt(al.id, al.title) }),
        h('div', {}, h('div', { style: { fontSize: '22px', fontWeight: '800' } }, al.title), h('div', { style: { color: '#fa2d48', fontSize: '15px', margin: '2px 0 10px' } }, al.artist), h('div', { style: { display: 'flex', gap: '8px' } }, playAll, back))));
    const list = h('div', { class: 'mus-tracklist' });
    al.tracks.forEach((t, i) => list.append(trackRow(al, i)));
    main.append(list);
  }
  function renderAllMusic() { Mac.wm.windowsFor('music').forEach(w => w._musState && renderMusic(w)); updatePlayerUI(); }
  function fmtDur(s) { return ((s / 60) | 0) + ':' + String(s % 60).padStart(2, '0'); }

  /* ============================ PODCASTS ============================ */
  const POD_DB = [
    ['Upgrade', 'Relay FM', '#7b4ae8', 'Weekly tech talk with Myke and Jason.'],
    ['ATP', 'Accidental Tech Podcast', '#2aa3e8', 'Three nerds discussing Apple, to exhaustion.'],
    ['Connected', 'Relay FM', '#e85a2a', 'A weekly panel about computers and how they shape us.'],
    ['The Talk Show', 'Daring Fireball', '#333', 'With John Gruber.'],
    ['MacBreak Weekly', 'TWiT', '#e8b62a', 'Get the latest Apple news.'],
    ['Laser Time', 'Laser Time Net', '#e82a9d', 'Pop culture deep dives.'],
  ];
  let podSubs = Mac.loadJSON('mac.podcasts.subs', []);
  const savePods = () => Mac.saveJSON('mac.podcasts.subs', podSubs);

  function openPodcasts() {
    const win = Mac.wm.createWindow({
      app: 'podcasts', title: 'Podcasts', width: 840, height: 560, minW: 560, minH: 360,
      build(body, w) {
        const side = h('div', { class: 'sidebar' });
        side.append(h('div', { class: 'side-h' }, 'Apple Podcasts'));
        [['Listen Now', 'note'], ['Browse', 'globe'], ['Library', 'download']].forEach(([label, ico], i) => {
          side.append(h('div', { class: 'side-item' + (i === 0 ? ' sel' : '') }, h('span', { class: 'glyph', style: { color: '#a04ae8' }, html: Mac.GLYPH[ico] }), label));
        });
        const main = h('div', { class: 'mus-main' });
        main.append(h('div', { class: 'mus-h1' }, 'Browse'));
        const grid = h('div', { class: 'pod-grid' });
        POD_DB.forEach(([title, artist, col, desc]) => {
          const sub = podSubs.includes(title);
          const btn = h('button', { class: 'btn' + (sub ? '' : ' primary'), style: { borderRadius: '12px' } }, sub ? '✓ Following' : 'Follow');
          btn.addEventListener('click', () => {
            podSubs = podSubs.includes(title) ? podSubs.filter(x => x !== title) : [...podSubs, title];
            savePods();
            btn.textContent = podSubs.includes(title) ? '✓ Following' : 'Follow';
            btn.classList.toggle('primary', !podSubs.includes(title));
          });
          const card = h('div', { class: 'pod-card' },
            h('div', { class: 'pc-art', style: { background: `linear-gradient(135deg, ${col}, #222)` }, html: Mac.albumArt(title, title) }),
            h('div', { class: 'pc-t' }, title), h('div', { class: 'pc-a' }, artist),
            h('div', { style: { fontSize: '11px', color: 'var(--text2)', marginTop: '4px' } }, desc), btn);
          card.querySelector('.pc-art').addEventListener('click', () => {
            Mac.System.notify({ title: 'Podcasts', body: '▶ Now playing “' + title + '” (simulated audio).', icon: 'podcasts' });
          });
          grid.append(card);
        });
        main.append(grid);
        body.append(h('div', { class: 'split' }, side, h('div', { class: 'main-pane' }, main)));
      }
    });
    return win;
  }

  /* ============================ TV ============================ */
  const TV_SHOWS = [
    ['Severance', '#122134'], ['Ted Lasso', '#1d5c38'], ['Silo', '#3a2f1d'], ['Foundation', '#1d3a5c'],
    ['Slow Horses', '#4d1d2c'], ['The Morning Show', '#5c3a1d'], ['Shrinking', '#2c4d1d'], ['Masters of the Air', '#1d2c5c'],
    ['Pluribus', '#3a1d5c'], ['For All Mankind', '#5c1d1d'],
  ];
  function openTV() {
    const win = Mac.wm.createWindow({
      app: 'tv', name: 'TV', title: 'Apple TV', width: 940, height: 600, minW: 620, minH: 400, simpleBar: true,
      build(body) {
        const wrap = h('div', { style: { flex: '1', overflowY: 'auto', background: '#0d0d10', color: '#eee', paddingTop: '18px' } });
        wrap.append(h('div', { class: 'tv-hero', style: { background: 'linear-gradient(130deg,#122134,#1d3a5c 60%,#2c5c8c)' } },
          h('div', { class: 'h1' }, 'Severance'), h('div', { class: 'h2' }, 'New season now streaming • Drama'),
          h('button', { class: 'btn primary', style: { width: 'fit-content', marginTop: '10px', borderRadius: '14px' }, onclick: () => playShow('Severance') }, '▶ Play')));
        const rows = h('div', { class: 'tv-rows' });
        [['Watch Now', TV_SHOWS], ['Trending', TV_SHOWS.slice().reverse()], ['Sci-Fi & Drama', TV_SHOWS.slice(4)]].forEach(([label, shows]) => {
          rows.append(h('div', { class: 'tv-row-h' }, label));
          const strip = h('div', { class: 'tv-strip' });
          shows.forEach(([name, col]) => {
            const card = h('div', { class: 'tv-card' },
              h('div', { class: 'tv-poster', style: { background: `linear-gradient(140deg, ${col}, #0a0a0c)` } }, name),
              h('div', { class: 'tv-t' }, name + ' — Apple Original'));
            card.addEventListener('click', () => playShow(name));
            strip.append(card);
          });
          rows.append(strip);
        });
        wrap.append(rows);
        body.append(h('div', { class: 'app-root', style: { background: '#0d0d10' } }, wrap));
        function playShow(name) {
          const pw = Mac.wm.createWindow({
            app: 'tv', title: name, width: 720, height: 440, minW: 480, minH: 300, simpleBar: true,
            build(b2, w2) {
              const stage = h('div', { style: { flex: '1', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
              stage.append(h('div', { style: { color: 'rgba(255,255,255,.55)', fontSize: '14px' } }, '⏸ “' + name + '” — simulated stream paused at 00:41'));
              const bar2 = h('div', { style: { position: 'absolute', left: '20px', right: '20px', bottom: '18px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,.22)' } },
                h('div', { style: { width: '12%', height: '100%', borderRadius: '3px', background: '#fff' } }));
              stage.append(bar2);
              b2.append(stage);
            }
          });
        }
      }
    });
    return win;
  }

  /* ============================ PREVIEW ============================ */
  function openPreview(args) {
    args = args || {};
    const node = args.path ? Mac.FS.get(args.path) : null;
    const seed = node ? (node.seed || node.name) : 'preview';
    const win = Mac.wm.createWindow({
      app: 'preview', title: node ? node.name : 'Preview', width: 720, height: 560, minW: 400, minH: 300, simpleBar: true,
      build(body, w) {
        const root = h('div', { class: 'pv-root' });
        if (node && (node.kind === 'photo' || node.kind === 'image')) {
          root.append(h('img', { src: Mac.genPhoto(seed, 1280, 960) }));
        } else if (node) {
          root.append(h('div', { style: { background: '#fff', color: '#222', padding: '40px 48px', maxWidth: '80%', maxHeight: '86%', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,.5)', whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', fontSize: '12.5px' } }, node.content || '(empty file)'));
        } else {
          root.append(h('div', { style: { color: '#bbb' } }, 'No document'));
        }
        body.append(root);
      }
    });
    return win;
  }

  /* ============================ menus ============================ */
  const photoMenus = () => [{
    title: 'File', items: [
      Mac.Menus.item('Import Simulated Photo…', '⌘N', () => {
        const seed = 'import-' + Date.now();
        PHOTO_SEEDS.unshift(seed);
        Mac.FS.write(Mac.FS.HOME + '/Pictures/' + seed + '.jpg', '', { kind: 'photo', seed, size: 320000 });
        Mac.System.notify({ title: 'Photos', body: 'Imported 1 generated photo.', icon: 'photos' });
      }),
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'photos') t.close(); }),
    ]
  }, Mac.Std.editMenu()];
  const musicMenus = () => [{
    title: 'File', items: [
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'music') t.close(); }),
    ]
  }, Mac.Std.editMenu(),
  {
    title: 'Controls', items: [
      Mac.Menus.item('Play/Pause', 'Space', () => mus.toggle()),
      Mac.Menus.item('Next Track', '⌘→', () => mus.next(1)),
      Mac.Menus.item('Previous Track', '⌘←', () => mus.next(-1)),
      Mac.Menus.SEP,
      Mac.Menus.item('Stop', '⌘.', () => { mus.stopTimer(); mus.playing = false; mus.album = null; mus.pos = 0; mus.emit(); renderAllMusic(); }),
    ]
  }];
  const simpleMenus = (appId) => () => [{
    title: 'File', items: [Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === appId) t.close(); })]
  }, Mac.Std.editMenu()];

  /* ============================ registration ============================ */
  Mac.wm.register({ id: 'photos', name: 'Photos', icon: 'photos', menus: photoMenus, help: 'A gallery of procedurally-generated landscapes. Favorite with ♡, import fresh art, or view full-screen.', open: openPhotos });
  Mac.wm.register({ id: 'music', name: 'Music', icon: 'music', menus: musicMenus, help: 'Play simulated albums with a real progress bar. Control Center’s Now Playing stays in sync — try Space to pause.', open: openMusic });
  Mac.wm.register({ id: 'podcasts', name: 'Podcasts', icon: 'podcasts', menus: simpleMenus('podcasts'), help: 'Browse and follow simulated shows. Playback is a state of mind.', open: openPodcasts });
  Mac.wm.register({ id: 'tv', name: 'TV', icon: 'tv', menus: simpleMenus('tv'), help: 'Apple Originals, simulated. Click a poster to open its (paused) stream window.', open: openTV });
  Mac.wm.register({ id: 'preview', name: 'Preview', icon: 'preview', menus: simpleMenus('preview'), help: 'Opens images and text files from the virtual filesystem.', open: openPreview, hidden: false });
})();
