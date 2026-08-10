/* apps.core.js — shared app UI helpers + Finder, Safari, Notes, TextEdit */
'use strict';

// ---------- Shared building blocks ----------
function tb(...children) { return el('div', { class: 'tb' }, ...children); }
function tbBtn(icon, title, cb, disabled = false) {
  const b = el('button', { class: 'tb-btn', title, disabled: disabled ? 'disabled' : null }, glyphEl(icon, 17));
  if (cb) b.onclick = cb;
  return b;
}
function seg(opts, initial, cb) {
  const s = el('div', { class: 'seg' });
  const items = opts.map(([icon, key, title]) => {
    const b = el('button', { class: 'seg-item' + (key === initial ? ' active' : ''), title }, glyphEl(icon, 15));
    b.onclick = () => { s.querySelectorAll('.seg-item').forEach(x => x.classList.remove('active')); b.classList.add('active'); cb(key); };
    return b;
  });
  s.append(...items);
  return s;
}
function sideLayout(sideW, sideEl, mainEl) {
  return el('div', { class: 'two-pane' },
    el('div', { class: 'sidebar', style: sideW ? { width: sideW + 'px' } : null }, sideEl),
    el('div', { class: 'main-pane' }, mainEl));
}
function sideSection(name) { return el('div', { class: 'side-sec', text: name }); }
function sideItem(iconOrColor, label, active, cb, count) {
  const row = el('div', { class: 'side-item' + (active ? ' active' : '') },
    typeof iconOrColor === 'string' && iconOrColor.startsWith('#')
      ? el('span', { class: 'side-dot', style: { background: iconOrColor } })
      : el('span', { class: 'side-ic' }, iconOrColor && iconOrColor.nodeType ? iconOrColor : glyphEl(iconOrColor || 'grid', 15)),
    el('span', { class: 'side-label', text: label }),
    count != null ? el('span', { class: 'side-count', text: String(count) }) : null);
  if (cb) row.onclick = cb;
  return row;
}
function fileIcon(node, size = 40) {
  if (node.type === 'dir') return iconEl(node.emoji ? 'folder' : 'folder', size);
  if (node.type === 'app') return iconEl(Apps[node.appId] ? Apps[node.appId].icon : 'file', size);
  if (node.kind === 'image') return iconEl('imgfile', size);
  if (node.kind === 'pdf') return iconEl('pdf', size);
  if (node.kind === 'text') return iconEl('txt', size);
  return iconEl('file', size);
}
function kindLabel(n) {
  if (n.type === 'dir') return 'Folder';
  if (n.type === 'app') return 'Application';
  return { image: 'Image', pdf: 'PDF document', text: 'Plain text' }[n.kind] || 'Document';
}
const fmtDate = (ts) => {
  const d = new Date(ts), today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
  return sameDay ? `${h}:${pad2(d.getMinutes())} ${ap}` : `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
};

// ============================================================ FINDER
regApp({
  id: 'finder', name: 'Finder', icon: 'finder',
  size: { w: 920, h: 580 }, min: { w: 620, h: 400 },
  fileItems: () => [
    { label: 'New Finder Window', sc: '⌘N', action: () => WM.open('finder') },
    { label: 'New Folder', sc: '⇧⌘N', action: () => { const w = WM.topWindow(); if (w && w.appId === 'finder' && w.api) w.api.newFolder(); } },
  ],
  extraMenus: () => [{ title: 'Go', items: [
    { label: 'Computer', sc: '⇧⌘C', action: () => WM.open('finder', { path: '/' }) },
    { label: 'Home', sc: '⇧⌘H', action: () => WM.open('finder', { path: FS.HOME }) },
    { separator: true },
    { label: 'Desktop', sc: '⌥⌘D', action: () => WM.open('finder', { path: FS.HOME + '/Desktop' }) },
    { label: 'Documents', sc: '⇧⌘O', action: () => WM.open('finder', { path: FS.HOME + '/Documents' }) },
    { label: 'Downloads', sc: '⌥⌘L', action: () => WM.open('finder', { path: FS.HOME + '/Downloads' }) },
    { separator: true },
    { label: 'Applications', sc: '⇧⌘A', action: () => WM.open('finder', { path: '/Applications' }) },
  ] }],
  build(win, args) {
    const st = { cwd: args.path || FS.HOME + '/Desktop', backS: [], fwdS: [], view: 'icons', sel: new Set(), search: '' };
    const FAVORITES = [
      ['Recents', '__recents'], ['Applications', '/Applications'], ['Desktop', FS.HOME + '/Desktop'],
      ['Documents', FS.HOME + '/Documents'], ['Downloads', FS.HOME + '/Downloads'],
    ];
    const layout = el('div', { class: 'finder' });
    win.content.append(layout);

    function nav(path) {
      const n = FS.get(path);
      if (!n || n.type !== 'dir') return;
      st.backS.push(st.cwd); st.fwdS.length = 0;
      st.cwd = path; st.sel.clear(); st.search = '';
      render();
    }
    function goBack() { if (!st.backS.length) return; st.fwdS.push(st.cwd); st.cwd = st.backS.pop(); st.sel.clear(); st.search = ''; render(); }
    function goFwd() { if (!st.fwdS.length) return; st.backS.push(st.cwd); st.cwd = st.fwdS.pop(); st.sel.clear(); st.search = ''; render(); }

    // Toolbar
    win.toolbar.append(
      tbBtn('chevL', 'Back', goBack), tbBtn('chevR', 'Forward', goFwd),
    );
    const viewSeg = seg([['grid', 'icons', 'Icon view'], ['listg', 'list', 'List view'], ['cols', 'cols', 'Column view']], 'icons', (v) => { st.view = v; render(); });
    const searchIn = el('input', { class: 'fld seek', placeholder: 'Search', type: 'search' });
    searchIn.addEventListener('input', () => { st.search = searchIn.value.toLowerCase(); renderMain(); });
    win.toolbar.append(el('span', { class: 'tb-spacer' }), viewSeg, el('span', { class: 'tb-gap' }),
      tbBtn('share', 'Share', () => Notif.push('Finder', 'Share', 'Shared 0 items. (No people nearby.)', 'finder')),
      el('span', { class: 'tb-gap' }), searchIn);

    function render() { renderSide(); renderMain(); win.setTitle(titleFor()); }
    function titleFor() { return st.cwd === '__recents' ? 'Recents' : st.cwd === '/' ? 'Macintosh HD' : st.cwd.split('/').pop(); }

    function renderSide() {
      const s = el('div', {});
      s.append(sideSection('Favorites'));
      FAVORITES.forEach(([label, path]) => s.append(sideItem(
        label === 'Recents' ? 'clock' : label === 'Applications' ? 'grid' : 'folder',
        label, st.cwd === path, () => nav(path))));
      s.append(sideSection('Locations'));
      s.append(sideItem('hd', 'Macintosh HD', st.cwd === '/', () => nav('/')));
      s.append(sideItem('grid', 'iCloud Drive', false, () => Notif.push('Finder', 'iCloud Drive', 'Not signed in to iCloud in this demo.', 'finder')));
      layout.querySelector('.sidebar-slot')?.replaceWith(el('div', { class: 'sidebar-slot' }, s));
      if (!layout.querySelector('.sidebar-slot')) layout.prepend(el('div', { class: 'sidebar-slot' }, s));
    }

    function items() {
      if (st.cwd === '__recents') {
        const out = [];
        FS.walk((n, p) => { if (n.type === 'file' && !n.hidden) out.push({ n, p }); }, '/Users');
        return out.sort((a, b) => b.n.modified - a.n.modified).slice(0, 30)
          .filter(x => !st.search || x.n.name.toLowerCase().includes(st.search))
          .map(x => ({ node: x.n, path: x.p }));
      }
      return (FS.list(st.cwd) || [])
        .filter(n => !n.hidden && (!st.search || n.name.toLowerCase().includes(st.search)))
        .map(n => ({ node: n, path: (st.cwd === '/' ? '' : st.cwd) + '/' + n.name }));
    }

    function renderMain() {
      let main = layout.querySelector('.main-slot');
      if (!main) { main = el('div', { class: 'main-slot' }); layout.append(main); }
      main.innerHTML = '';
      const list = items();
      if (st.view === 'icons') main.append(renderIcons(list));
      else if (st.view === 'list') main.append(renderList(list));
      else main.append(renderCols(list));
      main.append(el('div', { class: 'status-bar', text: `${list.length} item${list.length === 1 ? '' : 's'}, 42.5 GB available` }));
    }

    function rowAct(path, isDbl) {
      const n = FS.get(path); if (!n) return;
      if (n.type === 'dir') nav(path);
      else openFile(path);
    }
    function ctxItems(path) {
      const n = FS.get(path);
      return [
        { label: 'Open', action: () => rowAct(path, true) },
        { label: 'Get Info', action: () => infoPanel(path) },
        { separator: true },
        { label: 'Rename', action: () => startRename(path) },
        { label: 'Duplicate', action: () => duplicate(path) },
        { separator: true },
        { label: 'Move to Trash', danger: true, action: () => { FS.toTrash(path); } },
      ];
    }
    function bgCtx(e) {
      ctxMenu(e.clientX, e.clientY, [
        { label: 'New Folder', action: () => newFolder() },
        { label: 'Get Info', action: () => infoPanel(st.cwd) },
        { separator: true },
        { label: 'Icon view', checked: st.view === 'icons', action: () => { st.view = 'icons'; render(); } },
        { label: 'List view', checked: st.view === 'list', action: () => { st.view = 'list'; render(); } },
        { label: 'Column view', checked: st.view === 'cols', action: () => { st.view = 'cols'; render(); } },
      ]);
    }
    function renderIcons(listArr) {
      const g = el('div', { class: 'fgrid' });
      g.addEventListener('contextmenu', (e) => { if (e.target === g) { e.preventDefault(); bgCtx(e); } });
      for (const { node, path } of listArr) {
        const it = el('div', { class: 'fitem' + (st.sel.has(path) ? ' sel' : '') },
          fileIcon(node, 46), el('span', { class: 'fname', text: node.name + (node.emoji ? ' ' + node.emoji : '') }));
        it.onclick = (e) => { if (!e.metaKey && !e.ctrlKey) st.sel.clear(); st.sel.add(path); renderMain(); };
        it.ondblclick = () => rowAct(path, true);
        it.addEventListener('contextmenu', (e) => { e.preventDefault(); st.sel.clear(); st.sel.add(path); renderMain(); ctxMenu(e.clientX, e.clientY, ctxItems(path)); });
        g.append(it);
      }
      if (!listArr.length) g.append(el('div', { class: 'empty-hint', text: st.search ? `No results for “${st.search}”` : 'Folder is empty' }));
      return g;
    }
    function renderList(listArr) {
      const t = el('div', { class: 'flist' });
      t.append(el('div', { class: 'flist-head' },
        el('span', { text: 'Name' }), el('span', { text: 'Date Modified' }), el('span', { text: 'Size' }), el('span', { text: 'Kind' })));
      t.addEventListener('contextmenu', (e) => { if (e.target === t) { e.preventDefault(); bgCtx(e); } });
      for (const { node, path } of listArr) {
        const r = el('div', { class: 'flist-row' + (st.sel.has(path) ? ' sel' : '') },
          el('span', { class: 'fl-name' }, fileIcon(node, 18), el('span', { text: node.name })),
          el('span', { class: 'fl-dim', text: fmtDate(node.modified) }),
          el('span', { class: 'fl-dim', text: node.type === 'dir' ? '--' : fmtKB(FS.sizeOf(node)) }),
          el('span', { class: 'fl-dim', text: kindLabel(node) }));
        r.onclick = (e) => { if (!e.metaKey) st.sel.clear(); st.sel.add(path); renderMain(); };
        r.ondblclick = () => rowAct(path, true);
        r.addEventListener('contextmenu', (e) => { e.preventDefault(); st.sel.clear(); st.sel.add(path); renderMain(); ctxMenu(e.clientX, e.clientY, ctxItems(path)); });
        t.append(r);
      }
      return t;
    }
    function renderCols() {
      const wrap = el('div', { class: 'fcols' });
      wrap.addEventListener('contextmenu', (e) => { if (e.target === wrap) { e.preventDefault(); bgCtx(e); } });
      if (st.cwd === '__recents') { wrap.append(el('div', { class: 'empty-hint', text: 'Column view unavailable for Recents' })); return wrap; }
      const chain = [];
      const parts = st.cwd.split('/').filter(Boolean);
      let acc = '';
      chain.push('/');
      for (const p of parts) { acc += '/' + p; chain.push(acc); }
      chain.forEach((path, ci) => {
        const col = el('div', { class: 'fcol' });
        for (const n of FS.list(path) || []) {
          if (n.hidden) continue;
          const childPath = (path === '/' ? '' : path) + '/' + n.name;
          const r = el('div', { class: 'flist-row c' + (chain[ci + 1] === childPath ? ' sel' : '') },
            el('span', { class: 'fl-name' }, fileIcon(n, 18), el('span', { text: n.name })),
            n.type === 'dir' ? el('span', { class: 'fl-chev' }, glyphEl('chevR', 12)) : null);
          r.onclick = () => { if (n.type === 'dir') nav(childPath); else { st.sel = new Set([childPath]); selFileCol(wrap, childPath); } };
          r.ondblclick = () => { if (n.type !== 'dir') openFile(childPath); };
          r.addEventListener('contextmenu', (e) => { e.preventDefault(); ctxMenu(e.clientX, e.clientY, ctxItems(childPath)); });
          col.append(r);
        }
        wrap.append(col);
      });
      return wrap;
    }
    function selFileCol(wrap, path) {
      const n = FS.get(path);
      const col = el('div', { class: 'fcol preview-col' },
        el('div', { class: 'pv-ic' }, fileIcon(n, 72)),
        el('div', { class: 'pv-name', text: n.name }),
        el('div', { class: 'pv-dim', text: `${kindLabel(n)} · ${fmtKB(FS.sizeOf(n))}` }),
        el('button', { class: 'btn primary', text: 'Open', onclick: () => openFile(path) }));
      const old = wrap.querySelector('.preview-col'); if (old) old.remove();
      wrap.append(col);
    }
    function infoPanel(path) {
      const n = FS.get(path); if (!n) return;
      modal({
        title: n.name + ' Info', width: 340,
        body: el('div', { class: 'info-panel' },
          el('div', { class: 'pv-ic' }, fileIcon(n, 64)),
          ...[['Kind', kindLabel(n)], ['Size', fmtKB(FS.sizeOf(n))], ['Where', path === '/' ? '/' : path.replace('/' + n.name, '') || '/'], ['Modified', new Date(n.modified).toLocaleString()]]
            .map(([k, v]) => el('div', { class: 'info-row' }, el('b', { text: k + ':' }), el('span', { text: v })))),
        buttons: [{ label: 'OK', primary: true }],
      });
    }
    function startRename(path) {
      const { node } = (function(){ const p = FS.parent(path); return { node: p.dir.children[p.name] }; })();
      renderMain();
      const nm = layout.querySelector('.flist-row.sel .fl-name span:last-child, .fitem.sel .fname');
      if (!nm) return;
      const input = el('input', { class: 'rename-in', value: node.name });
      nm.replaceWith(input);
      input.focus(); input.select();
      const commit = () => { FS.rename(FS.parent(path).path, node.name, input.value); renderMain(); };
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') renderMain(); e.stopPropagation(); });
      input.addEventListener('blur', commit);
    }
    function duplicate(path) {
      const p = FS.parent(path);
      const src = p.dir.children[p.name];
      const copy = JSON.parse(JSON.stringify(src));
      let name = src.name.replace(/(\.[^.]+)?$/, ' copy$1');
      copy.name = name; copy.modified = Date.now();
      p.dir.children[name] = copy; FS.save();
    }
    function newFolder() {
      if (st.cwd === '__recents') return;
      let name = 'untitled folder', i = 2;
      while (FS.get(st.cwd).children[name]) name = `untitled folder ${i++}`;
      FS.mkdir(st.cwd, name);
      st.sel = new Set([(st.cwd === '/' ? '' : st.cwd) + '/' + name]);
      startRename((st.cwd === '/' ? '' : st.cwd) + '/' + name);
    }
    win.api = { newFolder, nav };
    fsSubs.push({ win, render: renderMain });
    render();
  },
});
// FS-change subscriptions for finder windows (prunes closed windows)
const fsSubs = [];
Bus.on('fs', () => {
  for (let i = fsSubs.length - 1; i >= 0; i--) if (!WM.windows.includes(fsSubs[i].win)) fsSubs.splice(i, 1);
  fsSubs.forEach(s => s.render());
});

// ============================================================ SAFARI
const SafariPages = {
  'apple.com': () => el('div', { class: 'pg apple' },
    el('div', { class: 'pg-nav', html: '<b>\uF8FF</b><span>Store</span><span>Mac</span><span>iPad</span><span>iPhone</span><span>Watch</span><span>Vision</span><span>AirPods</span><span>Support</span>' }),
    el('div', { class: 'pg-hero' },
      el('h1', { text: 'MacBook Pro' }),
      el('p', { class: 'pg-tag', text: 'Mind-blowing. Head-turning.' }),
      el('div', { class: 'pg-cta' }, el('a', { text: 'Learn more' }), el('a', { text: 'Buy' })),
      el('div', { class: 'pg-art macart' })),
    el('div', { class: 'pg-strip' },
      el('h2', { text: 'Which Mac is for you?' }),
      el('p', { text: 'MacBook Air · MacBook Pro · iMac · Mac mini · Mac Studio · Mac Pro' }))),
  'wikipedia.org': () => el('div', { class: 'pg wiki' },
    el('div', { class: 'wiki-head', html: '<b>WIKIPEDIA</b><span>The Free Encyclopedia</span>' }),
    el('h1', { text: 'macOS Tahoe' }),
    el('div', { class: 'wiki-rule' }),
    el('p', { html: '<b>macOS Tahoe</b> (version 26) is the twenty-second major release of macOS, Apple Inc.\'s operating system for Macintosh computers. Announced at WWDC 2025, it introduces the <b>Liquid Glass</b> design language, a translucent material that reflects and refracts its surroundings.' }),
    el('h2', { text: 'Design' }),
    el('p', { text: 'The menu bar is completely transparent, making the display feel larger. The Dock, sidebars, toolbars, and app icons are crafted from Liquid Glass, with specular highlights and more rounded corners.' }),
    el('h2', { text: 'New features' }),
    el('p', { text: 'Spotlight gains hundreds of direct actions. The Phone app arrives on Mac via Continuity, and Live Activities appear in the menu bar. Control Center is redesigned with a Controls Gallery.' })),
  'news.ycombinator.com': () => {
    const items = [
      ['macOS Tahoe web clone is pure CSS', 'apple.example', 412],
      ['Liquid Glass: the physics of refraction in UI', 'design.example', 288],
      ['Show HN: Window manager in 400 lines of JS', 'hackers.example', 193],
      ['Apple M4 Pro benchmarks', 'chips.example', 154],
      ['The art of the squircle', 'typography.example', 121],
      ['Ask HN: Best menu bar apps?', 'mac.example', 98],
    ];
    return el('div', { class: 'pg hn' },
      el('div', { class: 'hn-head', html: '<b>Y</b> Hacker News <span>new | past | comments | ask | show | jobs</span>' }),
      ...items.map(([t, src, pts], i) => el('div', { class: 'hn-row' },
        el('span', { class: 'hn-n', text: (i + 1) + '.' }), el('span', { class: 'hn-t', text: t }),
        el('span', { class: 'hn-s', text: `(${src})` }), el('span', { class: 'hn-p', text: `${pts} points` }))));
  },
  'developer.apple.com': () => el('div', { class: 'pg devpg' },
    el('div', { class: 'pg-nav dark', html: '<b>\uF8FF Developer</b><span>Discover</span><span>Design</span><span>Develop</span><span>Distribute</span><span>Support</span>' }),
    el('div', { class: 'pg-hero dark-hero' },
      el('h1', { text: 'Build apps for macOS Tahoe' }),
      el('p', { class: 'pg-tag', text: 'Liquid Glass. SwiftUI. AppKit. Everything shimmers.' }),
      el('div', { class: 'pg-art glassart' }))),
};
function safariSearchPage(q) {
  return el('div', { class: 'pg sres' },
    el('h2', { html: `Results for “${esc(q)}”` }),
    ...Object.keys(SafariPages).map(u => el('div', { class: 'sres-item' },
      el('a', { text: u, href: '#' + u }), el('span', { text: `Top hit for ${q} — ${SafariPages[u]().querySelector('h1')?.textContent || u}` }))));
}
regApp({
  id: 'safari', name: 'Safari', icon: 'safari',
  size: { w: 1020, h: 640 }, min: { w: 560, h: 380 },
  fileItems: () => [
    { label: 'New Tab', sc: '⌘T', action: () => { const w = WM.topWindow(); if (w?.appId === 'safari') w.api.newTab(); else WM.open('safari'); } },
  ],
  extraMenus: () => [{ title: 'History', items: [
    { label: 'Back', sc: '⌘[', action: () => { const w = WM.topWindow(); if (w?.appId === 'safari') w.api.back(); } },
    { label: 'Forward', sc: '⌘]', action: () => { const w = WM.topWindow(); if (w?.appId === 'safari') w.api.fwd(); } },
    { separator: true },
    { label: 'Home', action: () => { const w = WM.topWindow(); if (w?.appId === 'safari') w.api.go('start'); } },
  ] }],
  build(win, args) {
    const tabs = [];
    let active = null;
    const FAVS = [['Apple', 'apple.com', 'safari'], ['Wikipedia', 'wikipedia.org/wiki/macOS_Tahoe', 'txt'], ['Hacker News', 'news.ycombinator.com', 'listg'], ['Developer', 'developer.apple.com', 'gearSm']];

    const tabbar = el('div', { class: 'saf-tabs' });
    const addr = el('input', { class: 'fld addr', placeholder: 'Search or enter website name', spellcheck: 'false' });
    const bkmk = el('div', { class: 'saf-bkmk' });
    FAVS.forEach(([label, url]) => bkmk.append(el('button', { class: 'bkmk-item', text: label, onclick: () => go(url) })));
    const body = el('div', { class: 'saf-body' });
    win.content.append(tabbar, tb(
      tbBtn('chevL', 'Back', () => back()), tbBtn('chevR', 'Forward', () => fwd()),
      tbBtn('sidebar', 'Bookmarks', () => bkmk.classList.toggle('hidden')),
      addr,
      tbBtn('share', 'Share', () => Notif.push('Safari', 'Shared page', (active?.url || 'Page') + ' sent via AirDrop.', 'safari')),
      tbBtn('plus', 'New Tab', () => newTab()),
    ), bkmk, body);

    addr.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const raw = addr.value.trim();
      if (!raw) return;
      go(raw.includes(' ') || !raw.includes('.') || raw === 'start' ? raw : raw.replace(/^https?:\/\//, '').replace(/^www\./, ''));
    });
    function norm(u) { return u.replace(/^https?:\/\//, '').replace(/^www\./, ''); }
    function pageFor(u) {
      u = norm(u);
      if (u === 'start' || !u) return startPage;
      const key = Object.keys(SafariPages).find(k => u === k || u.startsWith(k));
      if (key) return () => SafariPages[key]();
      if (!u.includes('.') || u.includes(' ')) return () => safariSearchPage(u);
      return () => el('div', { class: 'pg servfail' },
        el('h2', { text: 'Safari Can’t Find the Server' }),
        el('p', { html: `Safari can’t open the page “<b>${esc(u)}</b>” because the server can’t be found in this demo. Try one of the bookmarks instead.` }));
    }
    function startPage() {
      return el('div', { class: 'pg startpg' },
        el('h2', { text: 'Favorites' }),
        el('div', { class: 'fav-grid' }, FAVS.map(([label, url, icon]) => el('button', { class: 'fav', onclick: () => go(url) },
          el('span', { class: 'fav-ic' }, glyphEl(icon, 22)), el('span', { text: label })))),
        el('h2', { text: 'Privacy Report' }),
        el('div', { class: 'priv-card' },
          el('b', { text: '7 trackers prevented' }),
          el('p', { text: 'Intelligent Tracking Prevention stopped 7 trackers from profiling you in the last seven days.' })));
    }
    function renderBody() {
      body.innerHTML = '';
      body.append(pageFor(active.url)());
      addr.value = active.url === 'start' ? '' : 'https://www.' + norm(active.url);
      win.setTitle(active.url === 'start' ? 'Start Page' : (norm(active.url).split('/')[0]));
      renderTabs();
    }
    function renderTabs() {
      tabbar.innerHTML = '';
      if (tabs.length < 2) { tabbar.style.display = 'none'; return; }
      tabbar.style.display = '';
      tabs.forEach(t => {
        const elT = el('div', { class: 'saf-tab' + (t === active ? ' active' : '') },
          el('span', { class: 'saf-tab-t', text: t.url === 'start' ? 'Start Page' : norm(t.url).split('/')[0] }),
          el('button', { class: 'saf-tab-x', text: '×', onclick: (e) => { e.stopPropagation(); closeTab(t); } }));
        elT.onclick = () => { active = t; renderBody(); };
        tabbar.append(elT);
      });
    }
    function newTab(url = 'start') { const t = { url, hist: [url], hi: 0 }; tabs.push(t); active = t; renderBody(); }
    function closeTab(t) {
      const i = tabs.indexOf(t);
      tabs.splice(i, 1);
      if (!tabs.length) return win.close();
      if (active === t) active = tabs[Math.max(0, i - 1)];
      renderBody();
    }
    function go(url) { active.url = url; active.hist = active.hist.slice(0, active.hi + 1); active.hist.push(url); active.hi++; renderBody(); }
    function back() { if (active.hi > 0) { active.hi--; active.url = active.hist[active.hi]; renderBody(); } }
    function fwd() { if (active.hi < active.hist.length - 1) { active.hi++; active.url = active.hist[active.hi]; renderBody(); } }
    win.api = { newTab, back, fwd, go };
    if (args.q) newTab(String(args.q)); else newTab('start');
  },
});

// ============================================================ NOTES
const NotesStore = {
  KEY: 'tahoe-notes',
  load() {
    let n; try { n = JSON.parse(localStorage.getItem(this.KEY)); } catch {}
    if (!n) {
      n = [
        { id: uid(), folder: 'Notes', title: 'Welcome to Notes', body: '<h1>Welcome to Notes</h1><p>Notes in this Tahoe demo are <b>fully editable</b> and saved automatically to your browser.</p><ul><li>Create notes with the compose button</li><li>Search across everything</li><li>Right-click a note to delete it</li></ul>', ts: Date.now() - 86400000 },
        { id: uid(), folder: 'Notes', title: 'Packing list', body: 'Packing list\n\nPassport\nChargers — USB-C\nCamera + SD cards\nHiking boots\nSunglasses', ts: Date.now() - 3600000 * 5 },
      ];
      localStorage.setItem(this.KEY, JSON.stringify(n));
    }
    return n;
  },
  save(n) { localStorage.setItem(this.KEY, JSON.stringify(n)); },
};
regApp({
  id: 'notes', name: 'Notes', icon: 'notes', single: true,
  size: { w: 960, h: 600 }, min: { w: 700, h: 440 },
  build(win) {
    let notes = NotesStore.load();
    let folder = 'All', selId = notes[0]?.id, q = '';
    const foldersEl = el('div', {});
    const listEl = el('div', { class: 'notes-list' });
    const editor = el('div', { class: 'note-editor', contenteditable: 'true', spellcheck: 'false' });
    const stamp = el('div', { class: 'note-stamp' });
    const right = el('div', { class: 'note-right' }, stamp, editor);
    const layout = el('div', { class: 'notes-app' },
      el('div', { class: 'sidebar notes-side' }, foldersEl),
      el('div', { class: 'notes-mid' },
        el('div', { class: 'notes-mid-top' },
          (() => { const s = el('input', { class: 'fld seek', placeholder: 'Search all notes' }); s.addEventListener('input', () => { q = s.value.toLowerCase(); renderList(); }); return s; })()),
        listEl),
      right);
    win.toolbar.append(
      tbBtn('compose', 'New note', () => newNote()),
      tbBtn('trashg', 'Delete note', () => delNote()),
      el('span', { class: 'tb-spacer' }),
      tbBtn('plus', 'New folder', () => {
        const name = prompt('Folder name:', 'New Folder');
        if (!name) return;
        notes.push({ id: uid(), folder: name, title: 'New Note', body: '', ts: Date.now() });
        folder = name; selId = notes[notes.length - 1].id; saveAll(); renderAll();
      }));

    function saveAll() { NotesStore.save(notes); }
    function cur() { return notes.find(n => n.id === selId); }
    function folders() { return ['All', ...new Set(notes.map(n => n.folder))]; }
    function renderAll() { renderFolders(); renderList(); renderEditor(); win.setTitle('Notes'); }
    function renderFolders() {
      foldersEl.innerHTML = '';
      foldersEl.append(el('div', { class: 'side-sec', text: 'iCloud' }));
      folders().forEach(f => foldersEl.append(sideItem('folder', f, folder === f, () => { folder = f; const first = visible()[0]; selId = first?.id; renderAll(); }, f === 'All' ? notes.length : notes.filter(n => n.folder === f).length)));
    }
    function visible() {
      return notes.filter(n => (folder === 'All' || n.folder === folder) &&
        (!q || (n.title + ' ' + strip(n.body)).toLowerCase().includes(q)))
        .sort((a, b) => b.ts - a.ts);
    }
    function strip(html) { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; }
    function renderList() {
      listEl.innerHTML = '';
      visible().forEach(n => {
        const row = el('div', { class: 'note-row' + (n.id === selId ? ' sel' : '') },
          el('b', { text: n.title || 'New Note' }),
          el('span', { class: 'note-prev' },
            el('em', { text: fmtDate(n.ts) }),
            el('i', { text: (strip(n.body).replace(n.title, '').trim() || 'No additional text').slice(0, 46) })));
        row.onclick = () => { selId = n.id; renderList(); renderEditor(); };
        row.addEventListener('contextmenu', (e) => { e.preventDefault(); selId = n.id; renderList(); ctxMenu(e.clientX, e.clientY, [{ label: 'Delete Note', danger: true, action: delNote }]); });
        listEl.append(row);
      });
      if (!visible().length) listEl.append(el('div', { class: 'empty-hint', text: 'No Notes' }));
    }
    function renderEditor() {
      const n = cur();
      editor.innerHTML = n ? n.body : '';
      stamp.textContent = n ? new Date(n.ts).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
    }
    let saveT = null;
    editor.addEventListener('input', () => {
      const n = cur(); if (!n) return;
      n.body = editor.innerHTML;
      n.title = (strip(n.body).split('\n')[0] || 'New Note').slice(0, 42);
      n.ts = Date.now();
      clearTimeout(saveT); saveT = setTimeout(() => { saveAll(); renderList(); }, 350);
    });
    function newNote() {
      const n = { id: uid(), folder: folder === 'All' ? 'Notes' : folder, title: 'New Note', body: '', ts: Date.now() };
      notes.push(n); selId = n.id; saveAll(); renderAll(); editor.focus();
    }
    function delNote() {
      const n = cur(); if (!n) return;
      notes = notes.filter(x => x.id !== n.id);
      selId = visible()[0]?.id; saveAll(); renderAll();
    }
    renderAll();
  },
});

// ============================================================ TEXTEDIT
regApp({
  id: 'textedit', name: 'TextEdit', icon: 'textedit',
  size: { w: 720, h: 540 }, min: { w: 420, h: 300 },
  build(win, args) {
    let path = args.path || null;
    let dirty = false;
    const area = el('div', { class: 'te-area', contenteditable: 'true', spellcheck: 'false' });
    const title = () => (path ? path.split('/').pop() : 'Untitled') + (dirty ? ' — Edited' : '');
    const fontSel = el('select', { class: 'fld sel-sm' },
      ...[['System', '-apple-system, sans-serif'], ['Serif', 'New York, Georgia, serif'], ['Mono', 'Menlo, Monaco, monospace'], ['Rounded', 'ui-rounded, -apple-system, sans-serif']]
        .map(([l, v]) => el('option', { value: v, text: l })));
    fontSel.onchange = () => { area.style.fontFamily = fontSel.value; area.focus(); };
    const sizeSel = el('select', { class: 'fld sel-sm' }, ...[12, 14, 16, 18, 24, 32].map(s => el('option', { value: s, text: s + ' pt' })));
    sizeSel.value = '14';
    sizeSel.onchange = () => { document.execCommand('fontSize', false, '7'); area.querySelectorAll('font[size="7"]').forEach(f => { f.removeAttribute('size'); f.style.fontSize = sizeSel.value + 'px'; }); area.focus(); };
    const mkB = (label, cmd, t) => el('button', { class: 'tb-btn te-fmt', title: t, text: label, onclick: () => { document.execCommand(cmd, false, null); area.focus(); } });
    win.toolbar.append(fontSel, sizeSel, el('span', { class: 'tb-gap' }), mkB('B', 'bold', 'Bold'), mkB('I', 'italic', 'Italic'), mkB('U', 'underline', 'Underline'),
      el('span', { class: 'tb-spacer' }),
      tbBtn('plus', 'New document', () => { path = null; area.innerHTML = ''; dirty = false; win.setTitle(title()); }),
      el('button', { class: 'btn small', text: 'Save', onclick: save }));
    if (path) { const n = FS.get(path); if (n) area.textContent = n.content || ''; }
    else area.innerHTML = '';
    area.addEventListener('input', () => { dirty = true; win.setTitle(title()); });
    win.content.append(area);
    function save() {
      if (!path) {
        const m = modal({
          title: 'Save As', icon: 'textedit', width: 360,
          body: el('div', {}, el('label', { class: 'dlg-label', text: 'Name:' }), (() => { const i = el('input', { class: 'fld', value: 'Untitled.txt', id: 'save-name' }); setTimeout(() => { i.focus(); i.select(); }, 50); return i; })()),
          buttons: [{ label: 'Cancel' }, { label: 'Save', primary: true, action: () => {
            let name = document.getElementById('save-name').value.trim() || 'Untitled.txt';
            if (!name.includes('.')) name += '.txt';
            path = FS.HOME + '/Documents/' + name;
            doWrite();
          } }],
        });
        return;
      }
      doWrite();
    }
    function doWrite() {
      const p = FS.parent(path);
      FS.write(p.path, p.name, area.textContent, 'text');
      dirty = false; win.setTitle(title());
      Notif.push('TextEdit', 'Document saved', path.replace('/Users/mike/', '~/'), 'textedit');
    }
    win.el.addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); } });
    win.setTitle(title());
  },
});
