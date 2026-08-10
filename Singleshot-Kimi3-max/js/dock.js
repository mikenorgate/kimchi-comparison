/* dock.js — the Dock: pinned/running apps, minimized windows, Trash, magnification, autohide */
(function () {
  const Mac = window.Mac, Bus = Mac.Bus, h = Mac.h;
  let minis = []; // Win[]
  const dockEl = () => document.getElementById('dock');

  function pinned() { return Mac.Settings.get('dockPinned').filter(id => id === 'launchpad' || Mac.wm.apps[id] !== undefined); }
  function isPinned(id) { return Mac.Settings.get('dockPinned').includes(id); }

  function runningExtra() {
    return Mac.wm.runningApps().filter(a => !a.hidden && !isPinned(a.id)).map(a => a.id);
  }

  function appIconEl(id, size) {
    const icon = id === 'launchpad' ? Mac.appIcon('launchpad') : Mac.appIcon((Mac.wm.apps[id] || {}).icon || id);
    const el = h('div', { class: 'dicon', 'data-app': id });
    el.innerHTML = icon;
    el.append(h('div', { class: 'dtip' }, id === 'launchpad' ? 'Launchpad' : Mac.wm.apps[id].name));
    return el;
  }

  function render() {
    const S = Mac.Settings;
    const dock = dockEl();
    dock.className = '';
    dock.classList.toggle('autohide', S.get('dockAutohide'));
    dock.classList.toggle('pos-left', S.get('dockPos') === 'left');
    dock.classList.toggle('pos-right', S.get('dockPos') === 'right');
    dock.style.setProperty('--dsize', (S.get('dockSize') || 54) + 'px');

    const appsEl = document.getElementById('dock-apps');
    const rightEl = document.getElementById('dock-right');
    appsEl.innerHTML = ''; rightEl.innerHTML = '';

    const ids = [...pinned(), ...runningExtra()];
    ids.forEach(id => {
      const el = appIconEl(id);
      const app = Mac.wm.apps[id];
      const running = app && app._running;
      const hasWins = app && Mac.wm.windowsFor(id).length > 0;
      if (running) el.append(h('div', { class: 'drun' }));
      el.addEventListener('click', () => {
        if (id === 'launchpad') { Mac.System.launchpad(); return; }
        if (app._hidden) { Mac.launch(id); return; }
        const wins = Mac.wm.windowsFor(id);
        if (wins.length) {
          const top = wins[wins.length - 1];
          if (Mac.wm.activeApp === id && !top.isMin() && wins.length > 1) top.minimize();
          else top.focus();
        } else Mac.launch(id);
      });
      el.addEventListener('contextmenu', e => {
        e.preventDefault(); e.stopPropagation();
        if (id === 'launchpad') return;
        const items = [];
        const wins = Mac.wm.windowsFor(id);
        if (wins.length) items.push(...wins.map(w => Mac.Menus.item(w.titleEl.textContent || w.app.name, null, () => w.focus())), Mac.Menus.SEP);
        items.push(
          Mac.Menus.item('Options', null, null, {
            submenu: [
              Mac.Menus.item('Keep in Dock', null, () => togglePin(id), { checked: isPinned(id) }),
              Mac.Menus.item('Show in Finder', null, () => Mac.openFinder('/Applications')),
            ]
          }),
          Mac.Menus.item(app._hidden ? 'Show' : 'Hide', null, () => app._hidden ? Mac.launch(id) : Mac.wm.hideApp(id), { enabled: running }),
          Mac.Menus.SEP,
          Mac.Menus.item('Quit', null, () => Mac.wm.quitApp(id), { enabled: running && id !== 'finder' })
        );
        Mac.System.contextMenu(e.clientX, e.clientY, items);
      });
      appsEl.append(el);
    });

    // minimized windows
    minis = minis.filter(w => !w.closed && w.state === 'min');
    minis.forEach(w => {
      const el = h('div', { class: 'dicon dmin', title: w.titleEl.textContent });
      el.innerHTML = Mac.appIcon(w.app.icon || w.appId);
      el.append(h('div', { class: 'dtip' }, w.titleEl.textContent || w.app.name));
      el.addEventListener('click', () => w.focus());
      el.addEventListener('contextmenu', e => {
        e.preventDefault(); e.stopPropagation();
        Mac.System.contextMenu(e.clientX, e.clientY, [
          Mac.Menus.item('Restore', null, () => w.focus()),
          Mac.Menus.item('Close Window', null, () => w.close()),
        ]);
      });
      rightEl.append(el);
    });

    // trash
    const full = Mac.FS.trashCount() > 0;
    const tr = h('div', { class: 'dicon', 'data-app': 'trash' });
    tr.innerHTML = `<div class="appicon">${full ? Mac.ICONS.trashFull : Mac.ICONS.trash}</div>`;
    tr.append(h('div', { class: 'dtip' }, 'Trash'));
    tr.addEventListener('click', () => Mac.openFinder(Mac.FS.TRASH));
    tr.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      Mac.System.contextMenu(e.clientX, e.clientY, [
        Mac.Menus.item('Open', null, () => Mac.openFinder(Mac.FS.TRASH)),
        Mac.Menus.item('Empty Trash…', null, () => Mac.Finder.emptyTrash(), { enabled: full }),
      ]);
    });
    rightEl.append(tr);
  }

  function togglePin(id) {
    const p = Mac.Settings.get('dockPinned').slice();
    const i = p.indexOf(id);
    if (i >= 0) { if (!Mac.wm.apps[id]._running) p.splice(i, 1); else return; }
    else p.splice(Math.max(1, p.length - 1), 0, id);
    Mac.Settings.set('dockPinned', p);
  }

  /* magnification */
  document.addEventListener('mousemove', e => {
    const S = Mac.Settings;
    if (!S.get('dockMag')) { resetScale(); return; }
    const inner = document.getElementById('dock-inner');
    if (!inner) return;
    const r = inner.getBoundingClientRect();
    const vertical = S.get('dockPos') !== 'bottom';
    const coord = vertical ? e.clientY : e.clientX;
    const other = vertical ? e.clientX : e.clientY;
    const near = coord > (vertical ? r.top : r.left) - 90 && coord < (vertical ? r.bottom : r.right) + 90 &&
      other > (vertical ? r.left : r.top) - 60 && other < (vertical ? r.right : r.bottom) + 60;
    const icons = inner.querySelectorAll('.dicon');
    if (!near) { icons.forEach(ic => { ic.style.width = ic.style.height = ''; }); return; }
    const base = S.get('dockSize'), mag = S.get('dockMagScale');
    const R = base * 2.6;
    icons.forEach(ic => {
      const ir = ic.getBoundingClientRect();
      const c = vertical ? ir.top + ir.height / 2 : ir.left + ir.width / 2;
      const d = Math.abs(coord - c);
      let s = 1;
      if (d < R) s = 1 + (mag - 1) * Math.cos((d / R) * Math.PI / 2) ** 1.4;
      const px = Math.round(base * s);
      ic.style.width = px + 'px'; ic.style.height = px + 'px';
    });
  });
  function resetScale() { document.querySelectorAll('#dock .dicon').forEach(ic => { ic.style.width = ic.style.height = ''; }); }

  /* autohide reveal strip */
  document.addEventListener('mousemove', e => {
    const S = Mac.Settings;
    if (!S.get('dockAutohide')) return;
    const dock = dockEl();
    const pos = S.get('dockPos');
    const nearEdge = pos === 'bottom' ? e.clientY > innerHeight - 3 : pos === 'left' ? e.clientX < 3 : e.clientX > innerWidth - 3;
    if (nearEdge) dock.classList.add('reveal');
    const r = dock.getBoundingClientRect();
    if (dock.classList.contains('reveal') && (e.clientX < r.left - 30 || e.clientX > r.right + 30 || e.clientY < r.top - 30 || e.clientY > r.bottom + 30))
      dock.classList.remove('reveal');
  });

  Mac.Dock = {
    render,
    iconRect(appId) {
      const el = document.querySelector(`.dicon[data-app="${appId}"]`);
      return el ? el.getBoundingClientRect() : dockEl().getBoundingClientRect();
    },
    bounce(appId) {
      const el = document.querySelector(`.dicon[data-app="${appId}"]`);
      if (el) { el.classList.remove('bounce'); void el.offsetWidth; el.classList.add('bounce'); setTimeout(() => el.classList.remove('bounce'), 1900); }
    },
    addMini(win) { if (!minis.includes(win)) { minis.push(win); render(); } },
    removeMini(win) { const i = minis.indexOf(win); if (i >= 0) { minis.splice(i, 1); render(); } },
    reRenderMinis: render,
  };
  Bus.on('windows', render);
  Bus.on('running', render);
  Bus.on('apps', render);
  Bus.on('fs', render);
  Bus.on('setting:dockPinned', render);
  Bus.on('setting:dockSize', render);
  Bus.on('setting:dockPos', render);
  Bus.on('setting:dockAutohide', render);
})();
