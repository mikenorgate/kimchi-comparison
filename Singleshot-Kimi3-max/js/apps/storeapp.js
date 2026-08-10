/* storeapp.js — App Store (Get → Install → Open, Updates) */
(function () {
  const Mac = window.Mac, h = Mac.h;

  const STORE_APPS = [
    { id: 'safari', blurb: 'Web browsing, but simulated.', tag: 'Now with 4 whole sites' },
    { id: 'notes', blurb: 'Rich notes that autosave.', tag: 'Editors’ Choice' },
    { id: 'music', blurb: 'All the hits, none of the royalties.', tag: 'Free tier: all of it' },
    { id: 'photos', blurb: 'Procedural memories.', tag: 'New: import art' },
    { id: 'terminal', blurb: 'zsh, minus the panic.', tag: 'Pro UNIX cosplay' },
    { id: 'weather', blurb: 'Sunny in Cupertino, always.', tag: 'Hyperlocal-ish' },
    { id: 'calendar', blurb: 'Your month, colorized.', tag: 'Plan things' },
    { id: 'messages', blurb: 'Friends who answer in 2s.', tag: 'Very loyal friends' },
    { id: 'facetime', blurb: 'Call people. Almost.', tag: 'Video optional' },
    { id: 'calculator', blurb: 'Math. Fast-ish.', tag: 'The classic' },
    { id: 'clock', blurb: 'Time, in many places.', tag: 'Temporal suite' },
    { id: 'tv', blurb: 'Streams that respect your time.', tag: 'Pre-paused' },
  ];
  let installed = Mac.loadJSON('mac.appstore.installed', STORE_APPS.map(a => a.id).slice(0, 6).concat(['notes']));
  let updated = Mac.loadJSON('mac.appstore.updated', []);
  const save = () => { Mac.saveJSON('mac.appstore.installed', installed); Mac.saveJSON('mac.appstore.updated', updated); };

  function openAppStore(args) {
    const st = { tab: 'discover' };
    const win = Mac.wm.createWindow({
      app: 'appstore', title: 'App Store', width: 880, height: 580, minW: 560, minH: 360,
      build(body, w) { buildStore(body, w, st); },
    });
    win._asState = st;
    return win;
  }

  function buildStore(body, win, st) {
    const side = h('div', { class: 'sidebar' });
    side.append(h('div', { class: 'side-h' }, 'Store'));
    [['Discover', 'discover', 'apps'], ['Apps', 'apps', 'grid'], ['Updates', 'updates', 'update']].forEach(([label, id, ico]) => {
      const pending = STORE_APPS.length - updated.length - 0;
      const badge = id === 'updates' && pending > 0 ? h('span', { class: 'si-count' }, 3) : null;
      const el = h('div', { class: 'side-item' + (st.tab === id ? ' sel' : ''), 'data-t': id },
        h('span', { class: 'glyph', html: Mac.GLYPH[ico] }), label, badge);
      el.addEventListener('click', () => { st.tab = id; renderStore(win); });
      side.append(el);
    });
    const search = h('input', { class: 'inp', placeholder: 'Search', style: { margin: '6px 8px 0', width: 'calc(100% - 16px)' } });
    side.append(h('div', {}, search));
    const main = h('div', { class: 'mus-main' });
    body.append(h('div', { class: 'split' }, side, h('div', { class: 'main-pane' }, main)));
    Object.assign(win, { _asSide: side, _asMain: main, _asSearch: search });
    search.addEventListener('input', Mac.debounce(() => { st.query = search.value.trim().toLowerCase(); renderStore(win); }, 180));
    renderStore(win);
  }

  function appBtn(a, win) {
    const isIn = installed.includes(a.id) || a.id === 'appstore' || a.id === 'settings' || a.id === 'finder';
    let btn;
    if (isIn) {
      btn = h('button', { class: 'as-get installed' }, 'OPEN');
      btn.addEventListener('click', () => Mac.launch(a.id));
    } else {
      btn = h('button', { class: 'as-get' }, 'GET');
      btn.addEventListener('click', () => {
        btn.textContent = '';
        const ring = h('div', { style: { width: '14px', height: '14px', border: '2px solid var(--hairline)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' } });
        btn.append(ring);
        setTimeout(() => {
          installed.push(a.id); save();
          btn.innerHTML = 'OPEN'; btn.classList.add('installed');
          Mac.System.notify({ title: 'App Store', body: '“' + Mac.wm.apps[a.id].name + '” was installed.', icon: 'appstore' });
          Mac.Dock.render();
        }, 1400);
      });
    }
    return btn;
  }

  function renderStore(win) {
    const st = win._asState, main = win._asMain;
    main.innerHTML = '';
    win._asSide.querySelectorAll('.side-item[data-t]').forEach(el => el.classList.toggle('sel', el.dataset.t === st.tab));
    let apps = STORE_APPS.filter(a => Mac.wm.apps[a.id]);
    if (st.query) apps = apps.filter(a => Mac.wm.apps[a.id].name.toLowerCase().includes(st.query) || a.blurb.toLowerCase().includes(st.query));
    if (st.tab === 'updates') {
      main.append(h('div', { class: 'mus-h1' }, 'Updates'));
      const avail = STORE_APPS.filter(a => !updated.includes(a.id)).slice(0, 3);
      if (!avail.length) { main.append(h('div', { class: 'empty-pane', style: { height: '200px' } }, 'You’re up to date 🎉')); return; }
      const all = h('button', { class: 'btn primary', style: { marginBottom: '12px' } }, 'Update All');
      all.addEventListener('click', () => {
        avail.forEach(a => updateRow(win, a.id, true));
      });
      main.append(all);
      avail.forEach(a => {
        const row = h('div', { class: 'as-upd-row' },
          h('div', { html: Mac.appIcon(a.id) }),
          h('div', {}, h('div', { style: { fontWeight: '700', fontSize: '13.5px' } }, Mac.wm.apps[a.id].name),
            h('div', { style: { fontSize: '11.5px', color: 'var(--text2)' } }, 'Version 1.' + (1 + Mac.hash(a.id) % 7) + ' — bug fixes, shinier glass')),
          h('button', { class: 'as-get', style: { marginLeft: 'auto' } }, 'UPDATE'));
        row.lastChild.addEventListener('click', () => updateRow(win, a.id, false));
        main.append(row);
      });
      return;
    }
    if (st.tab === 'apps' && !st.query) { /* plain grid below */ }
    if (!st.query && st.tab === 'discover') {
      const hero = h('div', { class: 'as-hero' },
        h('div', { html: Mac.appIcon('terminal') }),
        h('div', {}, h('div', { class: 'h1' }, 'APP OF THE DAY'), h('div', { class: 'h2' }, 'Terminal — a whole simulated UNIX in your browser. It even has neofetch.'), h('button', { class: 'btn', style: { marginTop: '10px' }, onclick: () => Mac.launch('terminal') }, 'Try it')));
      main.append(hero);
      main.append(h('div', { class: 'mus-h1' }, 'Essentials'));
    } else if (st.tab === 'apps') {
      main.append(h('div', { class: 'mus-h1' }, 'All Apps'));
    }
    const grid = h('div', { class: 'as-grid' });
    apps.forEach(a => {
      grid.append(h('div', { class: 'as-card' },
        h('div', { html: Mac.appIcon(a.id) }),
        h('div', {}, h('div', { class: 't' }, Mac.wm.apps[a.id].name), h('div', { class: 's' }, a.blurb), h('div', { class: 's', style: { color: 'var(--accent)' } }, a.tag)),
        appBtn(a, win)));
    });
    if (!apps.length) grid.append(h('div', { class: 'empty-pane', style: { height: '160px', width: '100%' } }, 'No Results'));
    main.append(grid);
  }
  function updateRow(win, appId, batch) {
    const store = win;
    const rows = store._asMain.querySelectorAll('.as-upd-row');
    rows.forEach(r => {
      const nm = r.querySelector('div > div').textContent;
      if (nm === Mac.wm.apps[appId].name || batch) {
        const btn = r.querySelector('.as-get');
        if (!btn || btn.dataset.busy) return;
        btn.dataset.busy = '1';
        btn.textContent = '…';
        setTimeout(() => {
          if (!updated.includes(appId)) updated.push(appId);
          save();
          Mac.System.notify({ title: 'App Store', body: Mac.wm.apps[appId].name + ' was updated.', icon: 'appstore' });
          renderStore(store);
        }, batch ? 1800 : 1100);
      }
    });
  }

  Mac.wm.register({
    id: 'appstore', name: 'App Store', icon: 'appstore',
    menus: () => [{
      title: 'File', items: [Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'appstore') t.close(); })]
    }, Mac.Std.editMenu()],
    help: 'Acquire simulated software. GET buttons install (already-installed apps just open).',
    open: openAppStore,
  });
})();
