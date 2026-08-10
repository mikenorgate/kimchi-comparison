/* finder.js — Files app: windows, views, operations, desktop icons, Get Info */
(function () {
  const Mac = window.Mac, Bus = Mac.Bus, h = Mac.h;
  const FS = () => Mac.FS, S = () => Mac.Settings;
  const HOME = Mac.FS.HOME, TRASH = Mac.FS.TRASH;
  Mac.Finder = Mac.Finder || {};

  const SIDEBAR = [
    ['Favorites', [
      ['Recents', 'clock', 'recents:'],
      ['Applications', 'apps', '/Applications'],
      ['Desktop', 'desktop', HOME + '/Desktop'],
      ['Documents', 'doc', HOME + '/Documents'],
      ['Downloads', 'download', HOME + '/Downloads'],
      ['Pictures', 'photo', HOME + '/Pictures'],
      ['Music', 'note', HOME + '/Music'],
    ]],
    ['iCloud', [['iCloud Drive', 'globe', '/'],]],
    ['Locations', [['Macintosh HD', 'desktop', '/'], ['Network', 'globe', null]]],
  ];

  const state = new Map(); // win.id → per-window state
  let clipboard = null;    // {paths:[], cut:bool}

  function st(win) { return state.get(win.id); }

  function titleFor(path) {
    if (path === 'recents:') return 'Recents';
    if (path === TRASH) return 'Trash';
    if (path === '/') return 'Macintosh HD';
    return FS().base(path);
  }

  function itemsFor(win) {
    const s = st(win);
    if (s.path === 'recents:') {
      return FS().recent(60, (n, p) => p.startsWith(TRASH)).map(r => ({ node: r.node, path: r.path }));
    }
    const list = FS().list(s.path);
    return list.map(n => ({ node: n, path: FS().join(s.path, n.name) }));
  }

  function sortItems(items, key, dir) {
    const k = key || 'name', d = dir === 'desc' ? -1 : 1;
    const val = it => k === 'size' ? (it.node.type === 'folder' ? -1 : (it.node.size || 0)) :
      k === 'kind' ? kindOf(it.node) :
        k === 'date' ? it.node.modified : it.node.name.toLowerCase();
    return items.slice().sort((a, b) => {
      if ((a.node.type === 'folder') !== (b.node.type === 'folder')) return a.node.type === 'folder' ? -1 : 1;
      const va = val(a), vb = val(b);
      return (va > vb ? 1 : va < vb ? -1 : 0) * d;
    });
  }

  function kindOf(n) {
    if (n.type === 'folder') return 'Folder';
    if (n.kind === 'app') return 'Application';
    if (n.kind === 'photo' || n.kind === 'image') return 'JPEG image';
    if (n.kind === 'audio') return 'MP3 audio';
    if (n.name.endsWith('.md')) return 'Markdown';
    return 'Plain text';
  }

  function iconHtml(node, sizePx) {
    if (node.type === 'file' && (node.kind === 'photo')) {
      return `<img src="${Mac.genPhoto(node.seed || node.name, 120, 120)}" alt="">`;
    }
    return Mac.fileIcon(node);
  }

  function openItem(win, it) {
    const n = it.node;
    if (n.type === 'folder') { navTo(win, it.path); return; }
    if (n.kind === 'app') { Mac.launch(n.appId); return; }
    Mac.System.openPath(it.path);
  }

  function navTo(win, path, push = true) {
    const s = st(win);
    if (push) { s.history = s.history.slice(0, s.hIdx + 1); s.history.push(path); s.hIdx++; }
    s.path = path; s.sel = new Set();
    win.setTitle(titleFor(path));
    render(win);
  }

  function render(win) {
    const s = st(win);
    const root = win._root;
    // toolbar
    win._backBtn.disabled = s.hIdx <= 0;
    win._fwdBtn.disabled = s.hIdx >= s.history.length - 1;
    win._iconBtn.classList.toggle('on', s.view === 'icons');
    win._listBtn.classList.toggle('on', s.view === 'list');
    // sidebar selection
    root.querySelectorAll('.side-item').forEach(el => el.classList.toggle('sel', el.dataset.path === s.path));
    // content
    let items = itemsFor(win);
    if (s.query) items = items.filter(it => it.node.name.toLowerCase().includes(s.query));
    items = sortItems(items, s.sortKey, s.sortDir);
    const main = win._main;
    main.innerHTML = '';
    const inTrash = s.path === TRASH;
    if (inTrash) {
      main.append(h('div', { class: 'trashbar' },
        h('button', {
          class: 'btn', disabled: FS().trashCount() === 0 ? '' : null,
          onclick: () => Mac.Finder.emptyTrash()
        }, 'Empty')));
    }
    if (!items.length) {
      main.append(h('div', { class: 'empty-pane' }, h('div', { html: `<div style="width:56px;height:56px;opacity:.4">${Mac.ICONS.folder}</div>` }), h('div', {}, s.query ? 'No Results' : 'This folder is empty')));
    } else if (s.view === 'icons') {
      const grid = h('div', { class: 'finder-grid' });
      items.forEach(it => grid.append(iconCell(win, it)));
      main.append(grid);
    } else {
      const tbl = h('div', { class: 'finder-list' });
      const sortBtn = (label, key) => h('div', {
        onclick: () => { if (s.sortKey === key) s.sortDir = s.sortDir === 'asc' ? 'desc' : 'asc'; else { s.sortKey = key; s.sortDir = 'asc'; } render(win); }
      }, label + (s.sortKey === key ? (s.sortDir === 'asc' ? ' ▲' : ' ▼') : ''));
      tbl.append(h('div', { class: 'fl-head' }, sortBtn('Name', 'name'), sortBtn('Date Modified', 'date'), sortBtn('Size', 'size'), sortBtn('Kind', 'kind')));
      items.forEach(it => tbl.append(listRow(win, it)));
      main.append(tbl);
    }
    // status + path bars
    statusBar(win, items);
  }

  function statusBar(win, items) {
    const s = st(win);
    const sb = win._status;
    sb.innerHTML = '';
    sb.append(`${items.length} item${items.length === 1 ? '' : 's'}${s.sel.size ? `, ${s.sel.size} selected` : ''}, 512.34 GB available`);
    win._pathWrap.style.display = S().get('finderPathBar') ? '' : 'none';
    sb.style.display = S().get('finderStatusBar') ? '' : 'none';
    // path bar
    const pb = win._pathBar; pb.innerHTML = '';
    if (s.path !== 'recents:' && s.path !== 'airdrop:') {
      const parts = s.path.split('/').filter(Boolean);
      let cur = '';
      pb.append(h('span', { class: 'pb', onclick: () => navTo(win, '/') }, 'Macintosh HD'), h('span', { class: 'pb-chev' }, '›'));
      parts.forEach((p, i) => {
        cur += '/' + p;
        const path = cur;
        pb.append(h('span', { class: 'pb', onclick: () => navTo(win, path) }, p === 'mike' ? S().get('username') : p));
        if (i < parts.length - 1) pb.append(h('span', { class: 'pb-chev' }, '›'));
      });
    }
  }

  function select(win, name, e) {
    const s = st(win);
    if (e && (e.metaKey || e.ctrlKey)) { s.sel.has(name) ? s.sel.delete(name) : s.sel.add(name); }
    else if (e && e.shiftKey && s.sel.size) { s.sel.add(name); }
    else { s.sel.clear(); s.sel.add(name); }
    refreshSel(win);
  }
  function refreshSel(win) {
    const s = st(win);
    win._main.querySelectorAll('.fitem, .fl-row').forEach(el => el.classList.toggle('sel', s.sel.has(el.dataset.name)));
    statusBar(win, itemsFor(win));
  }

  function iconCell(win, it) {
    const s = st(win), n = it.node;
    const cell = h('div', { class: 'fitem', 'data-name': n.name, tabindex: '0' },
      h('div', { class: 'fi-img', html: iconHtml(n) }),
      h('div', { class: 'fi-label' }, n.name));
    cell.addEventListener('click', e => { e.stopPropagation(); select(win, n.name, e); });
    cell.addEventListener('dblclick', () => openItem(win, it));
    cell.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); if (!s.sel.has(n.name)) select(win, n.name); ctxMenu(win, it, e.clientX, e.clientY); });
    return cell;
  }
  function listRow(win, it) {
    const s = st(win), n = it.node;
    const row = h('div', { class: 'fl-row', 'data-name': n.name },
      h('div', {}, h('span', { class: 'fi-img', html: iconHtml(n) }), h('span', {}, n.name)),
      h('div', { class: 'fl-sub' }, Mac.fmtDateTime(n.modified)),
      h('div', { class: 'fl-sub' }, n.type === 'folder' ? '—' : Mac.fmtBytes(n.size || 0)),
      h('div', { class: 'fl-sub' }, kindOf(n)));
    row.addEventListener('click', e => { e.stopPropagation(); select(win, n.name, e); });
    row.addEventListener('dblclick', () => openItem(win, it));
    row.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); if (!s.sel.has(n.name)) select(win, n.name); ctxMenu(win, it, e.clientX, e.clientY); });
    return row;
  }

  function selectedPaths(win) {
    const s = st(win);
    return itemsFor(win).filter(it => s.sel.has(it.node.name)).map(it => it.path);
  }

  function startRename(win, it) {
    const el = win._main.querySelector(`[data-name="${CSS.escape(it.node.name)}"] .fi-label`) ||
      win._main.querySelector(`[data-name="${CSS.escape(it.node.name)}"] > div:first-child > span:last-child`);
    if (!el) return;
    const inp = h('input', { class: 'fi-rename', value: it.node.name });
    el.replaceWith(inp);
    inp.focus();
    const dot = it.node.name.lastIndexOf('.');
    inp.setSelectionRange(0, dot > 0 ? dot : it.node.name.length);
    const commit = () => {
      const v = inp.value.trim();
      if (v && v !== it.node.name) {
        if (FS().rename(it.path, v)) Mac.System.notify({ title: 'Renamed', body: `${it.node.name} → ${v}`, icon: 'finder' });
      }
      render(win);
    };
    inp.addEventListener('blur', commit);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = it.node.name; inp.blur(); } e.stopPropagation(); });
  }

  function ctxMenu(win, it, x, y) {
    const mi = Mac.Menus.item, inTrash = st(win).path === TRASH;
    const items = [
      mi('Open', null, () => openItem(win, it)),
      mi('Open With', null, null, { submenu: openWithSub(it), enabled: it.node.type === 'file' }),
      Mac.Menus.SEP,
      inTrash
        ? mi('Put Back', null, () => { FS().move(it.path, HOME + '/Desktop'); })
        : mi('Move to Trash', '⌘⌫', () => trashPaths([it.path])),
      mi('Get Info', '⌘I', () => Mac.Finder.getInfo(it.path)),
      mi('Rename', null, () => startRename(win, it)),
      mi('Compress', null, null, { enabled: false }),
      mi('Duplicate', '⌘D', () => FS().copy(it.path, st(win).path === 'recents:' ? FS().parent(it.path) : st(win).path)),
      mi('Make Alias', null, null, { enabled: false }),
      Mac.Menus.SEP,
      mi('Quick Look', 'Space', null, { enabled: it.node.kind === 'photo', actionHack: true }, ),
      mi('Share…', null, null, { enabled: false }),
    ];
    // enable Quick Look properly (Mac.Menus.item signature: label, accel, action, opts)
    items[items.length - 2] = mi('Quick Look', 'Space', () => { if (it.node.kind === 'photo') Mac.launch('preview', { path: it.path }); }, { enabled: it.node.kind === 'photo' });
    Mac.System.contextMenu(x, y, items);
  }

  function openWithSub(it) {
    const n = it.node;
    if (n.kind === 'app' || n.type === 'folder') return [Mac.Menus.item('—', null, null, { enabled: false })];
    const opts = [['TextEdit', 'textedit']];
    if (n.kind === 'photo' || n.kind === 'image') opts.push(['Preview', 'preview']);
    return opts.map(([name, id]) => Mac.Menus.item(name, null, () => Mac.launch(id, { path: it.path }), { checked: (n.kind === 'photo') === (id === 'preview') }));
  }

  function trashPaths(paths) {
    paths.forEach(p => {
      if (p === TRASH || p.startsWith(TRASH + '/')) return;
      const node = FS().get(p);
      if (node && node.kind === 'app') { Mac.wm.quitApp(node.appId); }
      FS().trash(p);
    });
  }

  /* ---------------- window construction ---------------- */
  function openFinder(args) {
    args = args || {};
    const win = Mac.wm.createWindow({
      app: 'finder', title: 'Finder', width: 920, height: 540, minW: 560, minH: 320,
      build(body, w) { buildFinder(body, w, args); },
      onClose(w) { state.delete(w.id); },
    });
    return win;
  }

  function buildFinder(body, win, args) {
    const s = { path: args.path || HOME + '/Desktop', history: [], hIdx: -1, view: 'icons', sel: new Set(), sortKey: 'name', sortDir: 'asc', query: '' };
    if (args.newTabOf) { /* future */ }
    state.set(win.id, s);
    s.history.push(s.path); s.hIdx = 0;
    win.setTitle(titleFor(s.path));

    const back = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-l'], title: 'Back' });
    const fwd = h('button', { class: 'tb-btn', html: Mac.GLYPH['chev-r'], title: 'Forward' });
    back.addEventListener('click', () => { if (s.hIdx > 0) { s.hIdx--; navTo(win, s.history[s.hIdx], false); } });
    fwd.addEventListener('click', () => { if (s.hIdx < s.history.length - 1) { s.hIdx++; navTo(win, s.history[s.hIdx], false); } });
    const iconBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.grid, title: 'Icon View' });
    const listBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.list, title: 'List View' });
    iconBtn.addEventListener('click', () => { s.view = 'icons'; render(win); });
    listBtn.addEventListener('click', () => { s.view = 'list'; render(win); });
    const newFolder = h('button', { class: 'tb-btn', html: Mac.GLYPH.plus, title: 'New Folder' });
    newFolder.addEventListener('click', () => makeFolder(win));
    const gear = h('button', { class: 'tb-btn', html: Mac.GLYPH.gear, title: 'Action' });
    gear.addEventListener('click', e => actionMenu(win, e));
    const search = h('input', { class: 'inp', placeholder: 'Search' });
    search.addEventListener('input', Mac.debounce(() => { s.query = search.value.trim().toLowerCase(); render(win); }, 200));
    const toolbar = h('div', { class: 'toolbar' },
      back, fwd, h('span', { style: { width: '6px' } }), iconBtn, listBtn,
      h('span', { style: { fontWeight: '600', fontSize: '13px', marginLeft: '8px' } }), newFolder, gear,
      h('div', { class: 'tb-search' }, h('span', { class: 'glyph', html: Mac.GLYPH.search }), search));

    // sidebar
    const side = h('div', { class: 'sidebar' });
    SIDEBAR.forEach(([hdr, rows]) => {
      side.append(h('div', { class: 'side-h' }, hdr));
      rows.forEach(([label, ico, path]) => {
        const el = h('div', { class: 'side-item', 'data-path': path || 'net:' }, h('span', { class: 'glyph', html: Mac.GLYPH[ico] }), label);
        el.addEventListener('click', () => {
          if (!path) { Mac.System.alert({ title: 'Network', message: 'There are no other computers on this network. (It’s a simulation of one very happy Mac.)', icon: 'finder' }); return; }
          navTo(win, path);
        });
        side.append(el);
      });
    });

    const main = h('div', { class: 'main-pane' });
    const content = h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minHeight: '0', overflow: 'hidden', position: 'relative' } });
    main.append(content);
    const pathBar = h('div', { class: 'pathbar' });
    const status = h('div', { class: 'statusbar' });
    const pathWrap = h('div', {}, pathBar);
    content.append(h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minHeight: '0', overflow: 'hidden' } }));

    const split = h('div', { class: 'split' }, side, main);
    body.append(toolbar, split);
    // restructure: content host inside main
    const mainHost = h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minHeight: '0' } });
    main.innerHTML = ''; main.append(mainHost, pathWrap, status);
    win._main = mainHost; win._status = status; win._pathBar = pathBar; win._pathWrap = pathWrap; win._root = body;
    win._backBtn = back; win._fwdBtn = fwd; win._iconBtn = iconBtn; win._listBtn = listBtn;

    mainHost.addEventListener('click', e => { if (e.target === mainHost || e.target.classList.contains('finder-grid') || e.target.classList.contains('finder-list')) { s.sel.clear(); refreshSel(win); } });
    mainHost.addEventListener('contextmenu', e => {
      if (e.target.closest('.fitem') || e.target.closest('.fl-row')) return;
      e.preventDefault();
      const mi = Mac.Menus.item;
      Mac.System.contextMenu(e.clientX, e.clientY, [
        mi('New Folder', null, () => makeFolder(win)),
        mi('Get Info', null, () => Mac.Finder.getInfo(st(win).path)),
        Mac.Menus.SEP,
        mi('Sort By', null, null, { submenu: [['Name', 'name'], ['Kind', 'kind'], ['Date Modified', 'date'], ['Size', 'size']].map(([l, k]) => mi(l, null, () => { s.sortKey = k; render(win); }, { checked: s.sortKey === k })) }),
        mi('Show View Options', null, () => Mac.System.openSetting('Desktop & Dock')),
      ]);
    });
    render(win);
  }

  function makeFolder(win) {
    const s = st(win);
    if (s.path === 'recents:') return;
    if (s.path === TRASH) return;
    const p = FS().mkdir(s.path, 'untitled folder');
    s.sel = new Set([FS().base(p)]);
    render(win);
    const it = { node: FS().get(p), path: p };
    startRename(win, it);
  }

  function actionMenu(win, e) {
    const s = st(win);
    const paths = selectedPaths(win);
    const mi = Mac.Menus.item;
    Mac.System.contextMenu(e.clientX, e.clientY, [
      mi('New Folder', null, () => makeFolder(win), { enabled: s.path !== 'recents:' && s.path !== TRASH }),
      mi('New Folder with Selection', null, () => {
        const p = FS().mkdir(s.path, 'New Folder with Items');
        paths.forEach(pp => FS().move(pp, p));
      }, { enabled: paths.length > 0 && s.path !== 'recents:' && s.path !== TRASH }),
      Mac.Menus.SEP,
      mi('Get Info', null, () => paths.length ? Mac.Finder.getInfo(paths[0]) : Mac.Finder.getInfo(s.path)),
      mi('Duplicate', null, () => paths.forEach(p => FS().copy(p, s.path)), { enabled: paths.length > 0 }),
      Mac.Menus.SEP,
      mi('Sort By', null, null, { submenu: [['Name', 'name'], ['Kind', 'kind'], ['Date Modified', 'date'], ['Size', 'size']].map(([l, k]) => mi(l, null, () => { s.sortKey = k; render(win); }, { checked: s.sortKey === k })) }),
    ]);
  }

  /* ---------------- Get Info window ---------------- */
  const infoWins = {};
  Mac.Finder.getInfo = function (path) {
    if (infoWins[path] && !infoWins[path].closed) { infoWins[path].focus(); return; }
    const n = FS().get(path) || (path === 'recents:' ? { name: 'Recents', type: 'folder', modified: Date.now() } : null);
    if (!n) return;
    const win = Mac.wm.createWindow({
      app: 'finder', title: n.name + ' Info', width: 270, height: 360, resizable: false, simpleBar: true, x: 90 + Object.keys(infoWins).length * 26, y: 60,
      build(body) {
        const inTrashPath = path.startsWith(TRASH);
        body.style.overflowY = 'auto';
        body.innerHTML = `
          <div class="getinfo-head">
            <div class="fi-img">${iconHtml(n, 112)}</div>
            <div><div class="gi-name">${Mac.esc(n.name)}</div><div class="gi-sub">${kindOf(n)}</div></div>
          </div>
          <div class="getinfo-body">
            ${[['Kind', kindOf(n)],
          ['Size', n.type === 'folder' ? Mac.fmtBytes(FS().sizeOf(n)) : Mac.fmtBytes(n.size || 0)],
          ['Where', path.startsWith(HOME) ? path.replace(HOME, '~') : path],
          ['Modified', Mac.fmtDateTime(n.modified || Date.now())],
          ...(inTrashPath ? [['Status', 'In Trash — choose “Put Back” to restore']] : []),
          ...(n.kind === 'app' ? [['Version', '1.0 (Web Edition)']] : []),
          ...(n.kind === 'photo' ? [['Dimensions', '640 × 480']] : [])
        ].map(r => `<div class="gi-row"><div class="k">${r[0]}</div><div>${Mac.esc(String(r[1]))}</div></div>`).join('')}
          </div>`;
      },
      onClose() { delete infoWins[path]; }
    });
    infoWins[path] = win;
  };

  Mac.Finder.emptyTrash = function () {
    const c = FS().trashCount();
    if (!c) return;
    Mac.System.confirm(`Are you sure you want to permanently erase the ${c} item${c === 1 ? '' : 's'} in the Trash? You can’t undo this action.`, 'Empty Trash', 'Finder')
      .then(ok => { if (ok) { FS().emptyTrash(); Mac.System.notify({ title: 'Trash emptied', body: 'All items were permanently erased.', icon: 'finder' }); } });
  };

  /* ---------------- menus ---------------- */
  function fw() { const t = Mac.wm.topWin(); return t && t.appId === 'finder' && state.has(t.id) ? t : null; }
  function menus() {
    const w = fw(), s = w ? st(w) : null;
    const selPaths = w ? selectedPaths(w) : [];
    const editStd = Mac.Std.editMenu().items;
    return [
      {
        title: 'File', items: [
          Mac.Menus.item('New Finder Window', '⌘N', () => Mac.launch('finder', { path: HOME + '/Desktop' })),
          Mac.Menus.item('New Folder', '⇧⌘N', () => w && makeFolder(w), { enabled: !!w && s.path !== 'recents:' && s.path !== TRASH }),
          Mac.Menus.item('New Tab', '⌘T', null, { enabled: false }),
          Mac.Menus.SEP,
          Mac.Menus.item('Open', '⌘O', () => w && selPaths.length && Mac.System.openPath(selPaths[0]), { enabled: selPaths.length > 0 }),
          Mac.Menus.item('Close Window', '⌘W', () => w && w.close(), { enabled: !!w }),
          Mac.Menus.SEP,
          Mac.Menus.item('Get Info', '⌘I', () => w && (selPaths.length ? Mac.Finder.getInfo(selPaths[0]) : Mac.Finder.getInfo(s.path)), { enabled: !!w }),
          Mac.Menus.item('Rename', null, () => { if (w && selPaths.length === 1) { const it = itemsFor(w).find(i => i.path === selPaths[0]); if (it) startRename(w, it); } }, { enabled: selPaths.length === 1 }),
          Mac.Menus.item('Compress', null, null, { enabled: false }),
          Mac.Menus.SEP,
          Mac.Menus.item('Duplicate', '⌘D', () => w && selPaths.forEach(p => FS().copy(p, FS().parent(p))), { enabled: selPaths.length > 0 }),
          Mac.Menus.item('Make Alias', null, null, { enabled: false }),
          Mac.Menus.item('Quick Look', 'Space', () => { }, { enabled: false }),
          Mac.Menus.SEP,
          Mac.Menus.item('Move to Trash', '⌘⌫', () => trashPaths(selPaths), { enabled: selPaths.length > 0 }),
          Mac.Menus.item('Eject', '⌘E', null, { enabled: false }),
          Mac.Menus.item('Find', '⌘F', () => { if (w) { const inp = w._root.querySelector('.tb-search input'); if (inp) inp.focus(); } }, { enabled: !!w }),
        ]
      },
      {
        title: 'Edit', items: [
          ...editStd.slice(0, 5),
          Mac.Menus.item('Select All', '⌘A', () => {
            if (w && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { s.sel = new Set(itemsFor(w).map(i => i.node.name)); refreshSel(w); }
            else { try { document.execCommand('selectAll'); } catch (e) { } }
          }),
          Mac.Menus.SEP,
          Mac.Menus.item('Show Clipboard', null, () => {
            Mac.System.alert({ title: 'Clipboard', message: clipboard ? `${clipboard.paths.length} file(s) ${clipboard.cut ? 'to move' : 'to copy'}:<br>${clipboard.paths.map(p => Mac.esc(FS().base(p))).join('<br>')}` : 'The Clipboard is empty. Select files in Finder and press ⌘C or ⌘X.', icon: 'finder' });
          }),
        ]
      },
      {
        title: 'View', items: [
          Mac.Menus.item('as Icons', '⌘1', () => { if (w) { s.view = 'icons'; render(w); } }, { checked: w && s.view === 'icons', enabled: !!w }),
          Mac.Menus.item('as List', '⌘2', () => { if (w) { s.view = 'list'; render(w); } }, { checked: w && s.view === 'list', enabled: !!w }),
          Mac.Menus.item('as Columns', '⌘3', null, { enabled: false }),
          Mac.Menus.item('as Gallery', '⌘4', null, { enabled: false }),
          Mac.Menus.SEP,
          Mac.Menus.item('Sort By', null, null, {
            submenu: [['Name', 'name'], ['Kind', 'kind'], ['Date Modified', 'date'], ['Size', 'size']].map(([l, k]) =>
              Mac.Menus.item(l, null, () => { if (w) { s.sortKey = k; render(w); } }, { checked: w && s.sortKey === k })), enabled: !!w
          }),
          Mac.Menus.SEP,
          Mac.Menus.item('Show Path Bar', '⌥⌘P', () => { Mac.Settings.set('finderPathBar', !Mac.Settings.get('finderPathBar')); if (w) render(w); }, { checked: Mac.Settings.get('finderPathBar') }),
          Mac.Menus.item('Show Status Bar', '⌥⌘S', () => { Mac.Settings.set('finderStatusBar', !Mac.Settings.get('finderStatusBar')); if (w) render(w); }, { checked: Mac.Settings.get('finderStatusBar') }),
          Mac.Menus.item('Customize Toolbar…', null, null, { enabled: false }),
        ]
      },
      {
        title: 'Go', items: [
          Mac.Menus.item('Back', '⌘[', () => { if (w && s.hIdx > 0) { s.hIdx--; navTo(w, s.history[s.hIdx], false); } }, { enabled: w && s.hIdx > 0 }),
          Mac.Menus.item('Forward', '⌘]', () => { if (w && s.hIdx < s.history.length - 1) { s.hIdx++; navTo(w, s.history[s.hIdx], false); } }, { enabled: w && s.hIdx < s.history.length - 1 }),
          Mac.Menus.item('Enclosing Folder', '⌘↑', () => { if (w && s.path !== '/' && s.path !== 'recents:') navTo(w, FS().parent(s.path)); }, { enabled: w && s.path !== '/' && s.path !== 'recents:' }),
          Mac.Menus.SEP,
          Mac.Menus.item('Recents', '⇧⌘F', () => w && navTo(w, 'recents:'), { enabled: !!w }),
          Mac.Menus.item('Documents', '⇧⌘O', () => w && navTo(w, HOME + '/Documents'), { enabled: !!w }),
          Mac.Menus.item('Desktop', '⇧⌘D', () => w && navTo(w, HOME + '/Desktop'), { enabled: !!w }),
          Mac.Menus.item('Downloads', '⌥⌘L', () => w && navTo(w, HOME + '/Downloads'), { enabled: !!w }),
          Mac.Menus.item('Home', '⇧⌘H', () => w && navTo(w, HOME), { enabled: !!w }),
          Mac.Menus.item('Applications', '⇧⌘A', () => w && navTo(w, '/Applications'), { enabled: !!w }),
          Mac.Menus.item('Utilities', '⇧⌘U', () => w && navTo(w, '/Applications'), { enabled: !!w }),
          Mac.Menus.SEP,
          Mac.Menus.item('Go to Folder…', '⇧⌘G', () => goToFolder(w), { enabled: !!w }),
        ]
      },
    ];
  }

  function goToFolder(w) {
    Mac.System.alert({
      title: 'Go to Folder', message: 'Enter the pathname of the folder you want to open:', icon: 'finder',
      extra: Object.assign(h('input', { class: 'inp', placeholder: '/Users/mike/Documents', style: { width: '100%', marginTop: '8px' } }), {}),
      buttons: [{ label: 'Cancel' }, { label: 'Go', primary: true }]
    }).then(i => {
      if (i !== 1) return;
      const inp = document.querySelector('.alert input');
    });
    // wire input + enter manually (alert resolves before we can read input), so query live element:
    setTimeout(() => {
      const inp = document.querySelector('.alert input');
      if (inp) {
        inp.focus();
        document.querySelectorAll('.alert .btn')[1].addEventListener('click', () => {
          const v = inp.value.trim();
          if (FS().get(v) && FS().get(v).type === 'folder') navTo(w, Mac.FS.norm(v));
          else Mac.System.notify({ title: 'Finder', body: `The folder “${v}” can’t be found.`, icon: 'finder' });
        });
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') document.querySelectorAll('.alert .btn')[1].click(); });
      }
    }, 60);
  }

  /* file clipboard */
  document.addEventListener('keydown', e => {
    const w = fw(); if (!w) return;
    if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const meta = e.metaKey || e.ctrlKey;
    if (!meta) return;
    const k = e.key.toLowerCase();
    const s = st(w);
    const selPaths = selectedPaths(w);
    if (k === 'c' && selPaths.length && !e.shiftKey && !e.altKey) { clipboard = { paths: selPaths, cut: false }; e.preventDefault(); }
    if (k === 'x' && selPaths.length) { clipboard = { paths: selPaths, cut: true }; e.preventDefault(); }
    if (k === 'v' && clipboard && s.path !== 'recents:') {
      e.preventDefault();
      clipboard.paths.forEach(p => {
        if (clipboard.cut) FS().move(p, s.path); else FS().copy(p, s.path);
      });
      if (clipboard.cut) clipboard = null;
      render(w);
    }
  });

  /* ---------------- desktop icons ---------------- */
  function renderDesktopIcons() {
    const host = document.getElementById('deskicons');
    if (!host) return;
    host.innerHTML = '';
    // Macintosh HD
    const hdSvg = `<svg viewBox="0 0 48 48" style="width:52px;height:52px"><defs><linearGradient id="g-hd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe3e9"/><stop offset="1" stop-color="#9aa3ae"/></linearGradient></defs><rect x="4" y="20" width="40" height="13" rx="3.5" fill="url(#g-hd)" stroke="#848d97" stroke-width=".8"/><rect x="4" y="30.5" width="40" height="2.5" rx="1" fill="#7d8791"/><circle cx="39" cy="26.5" r="1.6" fill="#5fdc78"/></svg>`;
    host.append(deskIcon('Macintosh HD', hdSvg, () => Mac.openFinder('/')));
    FS().list(HOME + '/Desktop').forEach(n => {
      const path = FS().join(HOME + '/Desktop', n.name);
      const inner = n.kind === 'photo'
        ? `<img src="${Mac.genPhoto(n.seed || n.name, 110, 110)}" style="width:52px;height:52px;object-fit:cover;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,.3)">`
        : (Mac.fileIcon(n));
      host.append(deskIcon(n.name, inner, () => Mac.System.openPath(path), path));
    });
  }
  function deskIcon(name, innerHtml, onOpen, path) {
    const el = h('div', { class: 'deskicon', title: name },
      h('div', { class: 'di-img', html: innerHtml }), h('span', { class: 'di-label' }, name));
    el.addEventListener('click', e => { e.stopPropagation(); Mac.$$('.deskicon').forEach(d => d.classList.remove('sel')); el.classList.add('sel'); });
    el.addEventListener('dblclick', onOpen);
    el.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      const mi = Mac.Menus.item;
      const items = [mi('Open', null, onOpen)];
      if (path) items.push(
        mi('Get Info', null, () => Mac.Finder.getInfo(path)),
        Mac.Menus.SEP,
        mi('Move to Trash', null, () => trashPaths([path])));
      items.push(Mac.Menus.SEP, mi('Change Wallpaper…', null, () => Mac.System.openSetting('Wallpaper')));
      Mac.System.contextMenu(e.clientX, e.clientY, items);
    });
    return el;
  }
  Mac.Finder.renderDesktopIcons = renderDesktopIcons;
  Bus.on('fs', (p) => { if (String(p).startsWith(HOME + '/Desktop')) renderDesktopIcons(); });

  /* keep open windows in sync with FS changes */
  Bus.on('fs', () => { Mac.wm.windowsFor('finder').forEach(w => { if (state.has(w.id)) render(w); }); });

  /* ---------------- registration ---------------- */
  Mac.wm.register({
    id: 'finder', name: 'Finder', icon: 'finder',
    menus, help: 'Browse your files, search, and organize. Double-click to open, right-click for actions. “Recents” shows the newest documents; the Trash lives at the right end of the Dock.',
    open: (args) => openFinder(args),
  });
  Mac.Finder._navTo = (win, path) => navTo(win, path);
  Mac.Finder._state = st;
})();
