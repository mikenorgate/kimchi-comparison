/* safari.js — tabbed browser with internal fake sites, history, bookmarks */
(function () {
  const Mac = window.Mac, h = Mac.h;
  const S = () => Mac.Settings;

  /* ---------------- fake web ---------------- */
  const SITES = {
    'apple.com': {
      title: 'Apple', fav: '#333', favT: '',
      html: `<div class="site-apple">
        <div class="sa-nav"><span></span><span>Store</span><span>Mac</span><span>iPad</span><span>iPhone</span><span>Watch</span><span>Vision</span><span>AirPods</span><span>TV & Home</span><span>Support</span></div>
        <div class="sa-hero"><h1>MacBook Pro</h1><h2>Mind-blowing. Head-turning.</h2>
          <div class="sa-cta"><a>Learn more ›</a><a>Buy ›</a></div></div>
        <div class="sa-tiles">
          <div class="sa-tile" style="background:linear-gradient(160deg,#0f4bd8,#7b5cff)"><div class="t1">macOS Tahoe</div><div class="t2">Liquid Glass. Solid performance.</div></div>
          <div class="sa-tile" style="background:linear-gradient(160deg,#111,#555)"><div class="t1">M4 Pro chip</div><div class="t2">The most advanced chip ever in a pro laptop.</div></div>
          <div class="sa-tile" style="background:linear-gradient(160deg,#e8801a,#f7c45f)"><div class="t1">iPhone 17</div><div class="t2">Beyond fast.</div></div>
          <div class="sa-tile" style="background:linear-gradient(160deg,#00a8b8,#7fe0d0)"><div class="t1">Vision Pro</div><div class="t2">Welcome to spatial computing.</div></div>
        </div></div>`
    },
    'wikipedia.org': {
      title: 'macOS Tahoe - Wikipedia', fav: '#000', favT: 'W',
      html: `<div class="site-wiki">
        <h1>macOS Tahoe</h1>
        <div class="sw-box"><div class="hdr">macOS Tahoe</div>
          <p><b>Developer</b><br>Apple Inc.</p><p><b>OS family</b><br>macOS</p>
          <p><b>Version</b><br>26.1 (Web simulation)</p><p><b>Kernel</b><br>XNU-ish canvas</p></div>
        <p><b>macOS Tahoe</b> (version 26) is the twenty-second major release of macOS, Apple Inc.'s operating system for Macintosh computers. Announced at WWDC 2025 and named after Lake Tahoe, it introduced the <i>Liquid Glass</i> design language across the entire interface.</p>
        <p>Notable features include the translucent menu bar, a redesigned Dock and window chrome with deeper rounding, unified Control Center modules, and expanded cross-device continuity. This web edition recreates the experience using only HTML, CSS and JavaScript, persisting user documents to localStorage.</p>
        <p>Critical response praised the coherent translucency model while noting that simulated UNIX shells are, as a rule, noticeably less grumpy than real ones.</p></div>`
    },
    'github.com': {
      title: 'GitHub: Where the world builds software', fav: '#24292f', favT: '',
      html: `<div class="site-gh"><div class="gh-nav"><span>◉ GitHub</span><span>Pull requests</span><span>Issues</span><span>Codespaces</span><span>Explore</span></div>
        <div class="gh-repo"><div class="gh-head">apple-web / macos-tahoe ★ 41,209</div>
        <div class="gh-files">
          ${['index.html', 'css/base.css', 'css/apps.css', 'js/util.js', 'js/fs.js', 'js/wm.js', 'js/menubar.js', 'js/dock.js', 'js/system.js', 'js/apps/finder.js', 'js/apps/safari.js'].map(f => `<div><span>📄 ${f}</span><span>✨ Liquid Glass pass</span><span>2 hours ago</span></div>`).join('')}
        </div></div>
        <div style="text-align:center;color:#7d8590;font-size:12px;padding:0 0 30px">© 2026 GitHub, Inc. (simulated)</div></div>`
    },
    'news': {
      title: 'The Tahoe Times', fav: '#b00', favT: 'T',
      html: `<div class="site-wiki"><h1 style="font-family:Georgia">The Tahoe Times</h1>
        ${[['Local browser gains dock, becomes productive', 'In a stunning turn of events, a single browser tab now contains what witnesses describe as "an entire computer". Experts remain divided on whether this counts as cloud computing or extremely grounded computing.'],
        ['Window manager physics praised as "swimmy"', 'Drag latency measured at zero milliseconds across all fourteen virtual desktops.'],
        ['Finder finds everything, again', 'Citizens report that pressing ⌘Space continues to locate files, apps and the occasional arithmetic result.']]
        .map(a => `<h2 style="font-size:18px;margin:14px 0 2px">${a[0]}</h2><p>${a[1]}</p>`).join('')}</div>`
    },
  };
  const BOOKMARKS_DEFAULT = [
    { name: 'Apple', url: 'apple.com' }, { name: 'Wikipedia', url: 'wikipedia.org' },
    { name: 'GitHub', url: 'github.com' }, { name: 'The Tahoe Times', url: 'news' },
  ];
  let bookmarks = Mac.loadJSON('mac.safari.bookmarks', BOOKMARKS_DEFAULT);
  let history = Mac.loadJSON('mac.safari.history', []);
  let bmBar = Mac.loadJSON('mac.safari.bmbar', true);

  const saveBookmarks = () => Mac.saveJSON('mac.safari.bookmarks', bookmarks);
  const saveHistory = () => Mac.saveJSON('mac.safari.history', history.slice(-200));

  function resolveUrl(input) {
    let q = input.trim();
    if (!q) return { type: 'start' };
    q = q.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '').toLowerCase();
    if (q === 'start' || q === 'about:blank') return { type: 'start' };
    if (SITES[q]) return { type: 'site', key: q };
    const first = q.split('/')[0];
    if (SITES[first]) return { type: 'site', key: first };
    if (q.includes('.') && !q.includes(' ')) return { type: 'error', host: q };
    return { type: 'search', q: input.trim() };
  }

  function searchPage(q) {
    const results = [
      ['apple.com', 'Apple', 'Discover the innovative world of Apple and shop everything iPhone, iPad, Apple Watch, Mac, and Apple TV.'],
      ['wikipedia.org', q + ' - Wikipedia', 'The free encyclopedia article on “' + q + '”, edited by volunteers around the world (and one simulated browser).'],
      ['github.com', 'GitHub: ' + q, 'More than a million developers use GitHub to build, ship, and maintain their software — including this page.'],
      ['news', 'The Tahoe Times: ' + q, 'Breaking coverage of “' + q + '”, plus weather that is always sunny in Cupertino.'],
    ];
    return { title: q + ' — Search', html: `<div class="site-search">
      <div style="font-size:13px;color:var(--text2);margin-bottom:18px">About 4 results (0.31 seconds) on the simulated web</div>
      ${results.map(r => `<div class="ss-item" data-url="${r[0]}"><div class="ss-url">${r[0]}</div><div class="ss-title">${Mac.esc(r[1])}</div><div class="ss-desc">${Mac.esc(r[2])}</div></div>`).join('')}</div>` };
  }

  function errorPage(host) {
    return { title: 'Safari Can’t Find the Server', html: `<div class="site-err"><h1>Safari Can’t Find the Server</h1>
      <p>Safari can’t open the page “<b>${Mac.esc(host)}</b>” because the server can’t be found.<br><br>
      (The simulated internet in this build reaches <b>apple.com</b>, <b>wikipedia.org</b>, <b>github.com</b> and <b>news</b>.)</p></div>` };
  }

  /* ---------------- per-window state ---------------- */
  const ws = new Map();
  function st(win) { return ws.get(win.id); }
  function tab(win) { return st(win).tabs[st(win).idx]; }

  function openSafari(args) {
    args = args || {};
    const win = Mac.wm.createWindow({
      app: 'safari', title: 'Safari', width: 980, height: 620, minW: 560, minH: 360,
      build(body, w) {
        ws.set(w.id, { tabs: [], idx: -1 });
        buildChrome(body, w);
        newTab(w, args.url || (args.search ? 'search:' + args.search : null));
      },
      onClose(w) { ws.delete(w.id); },
      menus: undefined,
    });
    return win;
  }

  function buildChrome(body, win) {
    const tabsBar = h('div', { class: 'saf-tabs' });
    const back = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-l'], title: 'Back' });
    const fwd = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-r'], title: 'Forward' });
    const lock = h('span', { class: 'glyph', html: Mac.GLYPH.lock });
    const urlInp = h('input', { autocomplete: 'off', spellcheck: 'false' });
    const reload = h('button', { class: 'tb-btn', html: Mac.GLYPH.update, title: 'Reload' });
    const share = h('button', { class: 'tb-btn', html: Mac.GLYPH.share, title: 'Share…' });
    const plus = h('button', { class: 'tb-btn', html: Mac.GLYPH.plus, title: 'New Tab' });
    const urlBox = h('div', { class: 'saf-url' }, lock, urlInp);
    const bar = h('div', { class: 'saf-bar' }, back, fwd, urlBox, reload, share, plus);
    const bmBarEl = h('div', { class: 'saf-bm-bar' });
    const content = h('div', { class: 'saf-content' });
    body.append(tabsBar, bar, bmBarEl, content);
    Object.assign(win, { _tabsBar: tabsBar, _url: urlInp, _content: content, _bmBar: bmBarEl, _back: back, _fwd: fwd });

    back.addEventListener('click', () => histGo(win, -1));
    fwd.addEventListener('click', () => histGo(win, 1));
    reload.addEventListener('click', () => renderTab(win, true));
    plus.addEventListener('click', () => newTab(win));
    share.addEventListener('click', () => Mac.System.notify({ title: 'Safari', body: 'Page link copied to Clipboard.', icon: 'safari' }));
    urlInp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); navigate(win, urlInp.value); urlInp.blur(); }
      e.stopPropagation();
    });
    urlInp.addEventListener('focus', () => urlInp.select());
    renderBookmarks(win);
  }

  function renderBookmarks(win) {
    win._bmBar.innerHTML = '';
    win._bmBar.style.display = bmBar ? '' : 'none';
    bookmarks.forEach(b => {
      const el = h('div', { class: 'saf-bm' }, h('span', { class: 'bm-dot', style: { background: (SITES[b.url] || {}).fav || '#888', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '8.5px' } }, (SITES[b.url] || {}).favT || b.name.charAt(0)), b.name);
      el.addEventListener('click', () => navigate(win, b.url));
      el.addEventListener('contextmenu', e => {
        e.preventDefault();
        Mac.System.contextMenu(e.clientX, e.clientY, [
          Mac.Menus.item('Open', null, () => navigate(win, b.url)),
          Mac.Menus.item('Delete', null, () => { bookmarks = bookmarks.filter(x => x !== b); saveBookmarks(); refreshAllBmBars(); }),
        ]);
      });
      win._bmBar.append(el);
    });
  }
  function refreshAllBmBars() { Mac.wm.windowsFor('safari').forEach(w => renderBookmarks(w)); }

  function newTab(win, url) {
    const s = st(win);
    s.tabs.push({ hist: [], hIdx: -1, title: 'Start Page' });
    s.idx = s.tabs.length - 1;
    if (url) navigate(win, url);
    else renderTab(win);
  }
  function closeTab(win, i) {
    const s = st(win);
    s.tabs.splice(i, 1);
    if (!s.tabs.length) { win.close(); return; }
    s.idx = Math.min(s.idx, s.tabs.length - 1);
    renderTab(win);
  }

  function navigate(win, input) {
    const t = tab(win), s = st(win);
    if (input.startsWith('search:')) input = input.slice(7);
    t.hist = t.hist.slice(0, t.hIdx + 1);
    t.hist.push(input); t.hIdx++;
    const r = resolveUrl(input);
    if (r.type === 'site') history.push({ url: r.key, title: SITES[r.key].title, time: Date.now() });
    saveHistory();
    renderTab(win);
  }
  function histGo(win, d) {
    const t = tab(win);
    if (!t) return;
    const ni = t.hIdx + d;
    if (ni < 0 || ni >= t.hist.length) return;
    t.hIdx = ni;
    renderTab(win);
  }

  function renderTab(win, reloadAnim) {
    const s = st(win), t = tab(win);
    if (!t) return;
    const url = t.hist[t.hIdx] || '';
    const r = resolveUrl(url);
    win._url.value = url;
    win._back.disabled = t.hIdx <= 0;
    win._fwd.disabled = t.hIdx >= t.hist.length - 1;
    const c = win._content;
    c.innerHTML = '';
    let page = null, key = null;
    if (r.type === 'start') { renderStartPage(win); t.title = 'Start Page'; }
    else if (r.type === 'site') { key = r.key; page = SITES[r.key]; t.title = page.title; c.innerHTML = page.html; }
    else if (r.type === 'search') { page = searchPage(r.q); t.title = page.title; c.innerHTML = page.html; c.querySelectorAll('.ss-item').forEach(el => el.addEventListener('click', () => navigate(win, el.dataset.url))); }
    else if (r.type === 'error') { page = errorPage(r.host); t.title = page.title; c.innerHTML = page.html; }
    win.setTitle(t.title);
    // tabs bar
    const tb = win._tabsBar; tb.innerHTML = '';
    s.tabs.forEach((tt, i) => {
      const site = tt.hist.length && resolveUrl(tt.hist[tt.hIdx]).type === 'site' ? SITES[resolveUrl(tt.hist[tt.hIdx]).key] : null;
      const el = h('div', { class: 'saf-tab' + (i === s.idx ? ' on' : '') },
        h('span', { class: 't-fav', style: { background: site ? site.fav : '#c9ccd2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px' } }, site ? site.favT : ''),
        h('span', { class: 't-title' }, tt.title || 'Start Page'),
        h('button', { class: 't-x', html: '×' }));
      el.addEventListener('click', e => { if (e.target.closest('.t-x')) closeTab(win, i); else { s.idx = i; renderTab(win); } });
      tb.append(el);
    });
  }

  function renderStartPage(win) {
    const c = win._content;
    c.innerHTML = '';
    const wrap = h('div', { class: 'sp-wrap' });
    wrap.append(h('div', { class: 'sp-h' }, 'Favorites'));
    const grid = h('div', { class: 'sp-grid' });
    bookmarks.concat([{ name: 'New Tab', url: 'start' }]).forEach(b => {
      const site = SITES[b.url];
      const tile = h('div', { class: 'sp-fav' },
        h('div', { class: 'fv', style: site ? { background: '#f5f5f7', color: site.fav } : {} },
          h('span', {}, site ? (site.favT || b.name.charAt(0)) : '+')),
        b.name);
      tile.addEventListener('click', () => navigate(win, b.url));
      grid.append(tile);
    });
    // fill row
    ['Dribbble', 'Figma', 'Netflix', 'Ars Technica', 'Hacker News'].forEach(n => {
      const tile = h('div', { class: 'sp-fav' }, h('div', { class: 'fv' }, h('span', { style: { color: 'var(--accent)' } }, n.charAt(0))), n);
      tile.addEventListener('click', () => navigate(win, n.toLowerCase().replace(/ /g, '')));
      grid.append(tile);
    });
    wrap.append(grid);
    wrap.append(h('div', { class: 'sp-h' }, 'Privacy Report'));
    wrap.append(h('div', { class: 'sp-cards' },
      h('div', { class: 'sp-card' }, `<b>🛡 0 trackers blocked</b><br>In the simulated web, nobody is watching. Enjoy it.`),
      h('div', { class: 'sp-card' }, `<b>☁️ iCloud Private Relay</b><br>Off — this browser is already its own universe.`)));
    wrap.append(h('div', { class: 'sp-h' }, 'Reading List'));
    wrap.append(h('div', { class: 'sp-cards' }, h('div', { class: 'sp-card' }, `<b>Liquid Glass: a design retrospective</b><br>Saved from Wikipedia just now. Translucency is not a phase.`)));
    c.append(wrap);
  }

  /* ---------------- menus ---------------- */
  function aw() { const t = Mac.wm.topWin(); return t && t.appId === 'safari' && ws.has(t.id) ? t : null; }
  function menus() {
    const w = aw();
    return [
      {
        title: 'File', items: [
          Mac.Menus.item('New Tab', '⌘T', () => w && newTab(w), { enabled: !!w }),
          Mac.Menus.item('New Window', '⌘N', () => openSafari({})),
          Mac.Menus.item('New Private Window', '⇧⌘N', () => openSafari({})),
          Mac.Menus.SEP,
          Mac.Menus.item('Close Tab', '⌘W', () => w && closeTab(w, st(w).idx), { enabled: !!w }),
          Mac.Menus.item('Close Window', null, () => w && w.close(), { enabled: !!w }),
          Mac.Menus.SEP,
          Mac.Menus.item('Import Bookmarks…', null, null, { enabled: false }),
          Mac.Menus.item('Export Bookmarks…', null, () => Mac.System.notify({ title: 'Safari', body: 'Bookmarks exported (mentally).', icon: 'safari' })),
          Mac.Menus.SEP,
          Mac.Menus.item('Print…', '⌘P', () => Mac.System.alert({ title: 'Print', message: 'The simulated printer is out of simulated toner.', icon: 'safari' }), { enabled: !!w }),
        ]
      },
      Mac.Std.editMenu(),
      {
        title: 'View', items: [
          Mac.Menus.item('Show Bookmarks Bar', '⇧⌘B', () => { bmBar = !bmBar; Mac.saveJSON('mac.safari.bmbar', bmBar); refreshAllBmBars(); }, { checked: bmBar }),
          Mac.Menus.item('Reload Page', '⌘R', () => w && renderTab(w, true), { enabled: !!w }),
          Mac.Menus.SEP,
          Mac.Menus.item('Enter Full Screen', '^⌘F', () => w && w.zoom(), { enabled: !!w }),
          Mac.Menus.item('Actual Size', '⌘0', () => w && (w._content.style.zoom = '100%'), { enabled: !!w }),
          Mac.Menus.item('Zoom In', '⌘+', () => w && (w._content.style.zoom = (parseFloat(w._content.style.zoom || 100) + 10) + '%'), { enabled: !!w }),
          Mac.Menus.item('Zoom Out', '⌘–', () => { if (w) { const z = parseFloat(w._content.style.zoom || 100) - 10; w._content.style.zoom = Math.max(50, z) + '%'; } }, { enabled: !!w }),
        ]
      },
      {
        title: 'History', items: [
          Mac.Menus.item('Back', '⌘[', () => w && histGo(w, -1), { enabled: w && tab(w) && tab(w).hIdx > 0 }),
          Mac.Menus.item('Forward', '⌘]', () => w && histGo(w, 1), { enabled: w && tab(w) && tab(w).hIdx < tab(w).hist.length - 1 }),
          Mac.Menus.item('Home', '⇧⌘H', () => w && navigate(win0(w), 'start'), { enabled: !!w }),
          Mac.Menus.SEP,
          ...history.slice(-8).reverse().map(en => Mac.Menus.item(en.title, null, () => w && navigate(w, en.url))),
          ...(history.length ? [Mac.Menus.SEP] : []),
          Mac.Menus.item('Show All History', '⌘Y', () => showHistory(w), { enabled: !!w }),
          Mac.Menus.item('Clear History…', null, () => Mac.System.confirm('Clearing history will remove related website data. This cannot be undone.', 'Clear').then(ok => { if (ok) { history = []; saveHistory(); } })),
        ]
      },
      {
        title: 'Bookmarks', items: [
          Mac.Menus.item('Add Bookmark', '⌘D', () => {
            if (!w) return; const t = tab(w); const url = t.hist[t.hIdx]; if (!url) return;
            const r = resolveUrl(url);
            if (r.type !== 'site') return Mac.System.notify({ title: 'Safari', body: 'Only simulated sites can be bookmarked.', icon: 'safari' });
            bookmarks.push({ name: SITES[r.key].title.split(' - ')[0].split(':')[0], url: r.key });
            saveBookmarks(); refreshAllBmBars();
          }, { enabled: w && tab(w) && tab(w).hist.length > 0 }),
          Mac.Menus.item('Show Bookmarks', '⌥⌘B', () => { bmBar = !bmBar; Mac.saveJSON('mac.safari.bmbar', bmBar); refreshAllBmBars(); }),
          Mac.Menus.SEP,
          Mac.Menus.item('Edit Bookmarks…', null, () => showBookmarksEditor(w), { enabled: !!w }),
        ]
      },
    ];
  }
  function win0(w) { return w; }

  function showHistory(w) {
    newTab(w);
    const t = tab(w);
    t.hist = ['start']; t.hIdx = 0; t.title = 'History';
    w._content.innerHTML = '';
    const wrap = h('div', { style: { padding: '18px 8px' } }, h('div', { style: { fontSize: '19px', fontWeight: '700', padding: '0 16px 10px' } }, 'History'));
    if (!history.length) wrap.append(h('div', { style: { padding: '20px 16px', color: 'var(--text2)' } }, 'No history yet — go browse the 4-site internet.'));
    history.slice().reverse().forEach(en => {
      const row = h('div', { class: 'hist-item' }, h('span', { class: 'bm-dot', style: { background: (SITES[en.url] || {}).fav || '#888', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '9px' } }, (SITES[en.url] || {}).favT || '?'),
        h('span', {}, en.title), h('span', { style: { marginLeft: 'auto', color: 'var(--text2)', fontSize: '11px' } }, Mac.fmtTime(en.time)));
      row.addEventListener('click', () => navigate(w, en.url));
      wrap.append(row);
    });
    w._content.append(wrap);
    w.setTitle('History');
    renderTabHeaderOnly(w);
  }
  function renderTabHeaderOnly(w) { const s = st(w); w.setTitle(tab(w).title); }
  function showBookmarksEditor(w) {
    newTab(w);
    const t = tab(w); t.title = 'Bookmarks'; t.hist = ['start']; t.hIdx = 0;
    const c = w._content; c.innerHTML = '';
    const wrap = h('div', { style: { padding: '18px' } }, h('div', { style: { fontSize: '19px', fontWeight: '700', marginBottom: '10px' } }, 'Bookmarks'));
    bookmarks.forEach((b, i) => {
      wrap.append(h('div', { class: 'hist-item' },
        h('span', {}, b.name), h('span', { style: { color: 'var(--text2)', fontSize: '12px' } }, b.url),
        h('button', { class: 'btn', style: { marginLeft: 'auto', fontSize: '11px', padding: '0 10px' }, onclick: e => { e.stopPropagation(); bookmarks.splice(i, 1); saveBookmarks(); refreshAllBmBars(); showBookmarksEditorRefresh(w); } }, 'Remove')));
    });
    c.append(wrap);
    w.setTitle('Bookmarks');
  }
  function showBookmarksEditorRefresh(w) { closeTab(w, st(w).idx); showBookmarksEditor(w); }

  Mac.wm.register({
    id: 'safari', name: 'Safari', icon: 'safari', menus,
    help: 'Browse the simulated web (apple.com, wikipedia.org, github.com, news) in tabs. Anything else becomes a search page; the bookmarks bar and history are real (persisted).',
    open: openSafari,
  });
})();
