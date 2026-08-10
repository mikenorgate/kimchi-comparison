/* main.js — boot → lock screen → desktop; desktop icons; global shortcuts */
'use strict';

const LockScreen = {
  shown: false,
  show() {
    const ls = document.getElementById('lockscr');
    ls.hidden = false;
    this.shown = true;
    this.tick();
    ls.classList.remove('away');
    requestAnimationFrame(() => ls.classList.add('in'));
  },
  hide() {
    const ls = document.getElementById('lockscr');
    ls.classList.add('away');
    setTimeout(() => { ls.hidden = true; ls.classList.remove('in', 'away'); }, 650);
    this.shown = false;
    Desktop.start();
  },
  tick() {
    const now = new Date();
    let h = now.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    const t = document.querySelector('.lock-time');
    if (t) t.textContent = `${h}:${pad2(now.getMinutes())}`;
    const d = document.querySelector('.lock-date');
    if (d) d.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  },
};

const Desktop = {
  started: false,
  start() {
    if (!this.started) {
      this.started = true;
      MenuBar.build();
      Dock.build();
      document.getElementById('desktop').hidden = false;
      this.renderIcons();
      Bus.on('fs', () => this.renderIcons());
      this.wireContext();
      chime();
      if (!Sys.get('welcomed')) {
        Sys.set('welcomed', 1);
        setTimeout(() => Notif.push('Finder', 'Welcome to macOS Tahoe', 'Press ⌘Space for Spotlight. Right-click the desktop to change wallpaper.', 'finder'), 1200);
      }
    } else {
      document.getElementById('desktop').hidden = false;
    }
  },

  iconItems() {
    const items = [{ node: { name: 'Macintosh HD', type: 'disk' }, path: '/' }];
    for (const n of FS.list(FS.HOME + '/Desktop') || []) {
      if (n.hidden) continue;
      items.push({ node: n, path: `${FS.HOME}/Desktop/${n.name}` });
    }
    return items;
  },

  renderIcons() {
    const layer = document.getElementById('dsk-icons');
    layer.innerHTML = '';
    const pos = Sys.get('dskpos', {});
    const cellH = 108, cellW = 96, margin = 18, top0 = 44;
    this.iconItems().forEach((it, i) => {
      const p = pos[it.node.name];
      const x = p ? p.x : innerWidth - cellW - margin - Math.floor(i / Math.floor((innerHeight - 200) / cellH)) * (cellW + 8);
      const y = p ? p.y : top0 + (i % Math.floor((innerHeight - 200) / cellH)) * cellH;
      const ic = el('div', { class: 'dsk-icon', style: { left: x + 'px', top: y + 'px' }, tabindex: '0' },
        it.node.type === 'disk' ? iconEl('hd', 46) : fileIcon(it.node, 46),
        el('span', { class: 'dsk-name', text: it.node.name }));
      ic.onclick = (e) => { e.stopPropagation(); layer.querySelectorAll('.dsk-icon').forEach(x => x.classList.remove('sel')); ic.classList.add('sel'); };
      ic.ondblclick = () => { it.node.type === 'disk' ? WM.open('finder', { path: '/' }) : openFile(it.path); };
      ic.addEventListener('contextmenu', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (it.node.type === 'disk') return ctxMenu(e.clientX, e.clientY, [{ label: 'Open', action: () => WM.open('finder', { path: '/' }) }, { label: 'Get Info', action: () => WM.open('settings', { pane: 'general' }) }]);
        ctxMenu(e.clientX, e.clientY, [
          { label: 'Open', action: () => openFile(it.path) },
          { separator: true },
          { label: 'Move to Trash', danger: true, action: () => FS.toTrash(it.path) },
        ]);
      });
      // drag to reposition
      ic.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const sx = e.clientX - ic.offsetLeft, sy = e.clientY - ic.offsetTop;
        let moved = false;
        ic.setPointerCapture(e.pointerId);
        const mv = (ev) => {
          const nx = clamp(ev.clientX - sx, 4, innerWidth - 70), ny = clamp(ev.clientY - sy, 34, innerHeight - 70);
          if (Math.abs(nx - ic.offsetLeft) + Math.abs(ny - ic.offsetTop) > 3) moved = true;
          Object.assign(ic.style, { left: nx + 'px', top: ny + 'px' });
          ic._nx = nx; ic._ny = ny;
        };
        const up = () => {
          ic.removeEventListener('pointermove', mv); ic.removeEventListener('pointerup', up);
          if (moved) { const pos = Sys.get('dskpos', {}); pos[it.node.name] = { x: ic._nx, y: ic._ny }; Sys.set('dskpos', pos); }
        };
        ic.addEventListener('pointermove', mv);
        ic.addEventListener('pointerup', up);
      });
      layer.append(ic);
    });
  },

  wireContext() {
    const desk = document.getElementById('desk-click');
    desk.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.win') || e.target.closest('.dicon') || e.target.closest('.dsk-icon') || e.target.closest('#menubar')) return;
      e.preventDefault();
      ctxMenu(e.clientX, e.clientY, [
        { label: 'New Folder', action: () => {
          let name = 'untitled folder', i = 2;
          while (FS.get(FS.HOME + '/Desktop').children[name]) name = `untitled folder ${i++}`;
          FS.mkdir(FS.HOME + '/Desktop', name);
        } },
        { separator: true },
        { label: 'Change Wallpaper…', action: () => WM.open('settings', { pane: 'wallpaper' }) },
        { label: Sys.get('appearance') === 'dark' ? 'Use Light Appearance' : 'Use Dark Appearance', action: () => { Sys.set('appearance', Sys.get('appearance') === 'dark' ? 'light' : 'dark'); applyAppearance(); } },
        { separator: true },
        { label: 'Show Mission Control', action: () => WM.missionControl() },
        { label: 'Open Launchpad', action: () => Launchpad.open() },
      ]);
    });
    desk.addEventListener('pointerdown', (e) => {
      if (e.target === desk) {
        document.querySelectorAll('.dsk-icon').forEach(x => x.classList.remove('sel'));
        hideCtx();
      }
    });
  },
};

// ---------- Global keyboard shortcuts ----------
document.addEventListener('keydown', (e) => {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.code === 'Space') { e.preventDefault(); Spotlight.open(); return; }
  if (e.key === 'F4') { e.preventDefault(); Launchpad.open(); return; }
  if (e.ctrlKey && !mod && e.key === 'ArrowUp') { e.preventDefault(); WM.missionControl(); return; }
  if (LockScreen.shown) {
    if (e.key === 'Enter' || e.key === ' ') { LockScreen.hide(); }
    return;
  }
  if (!mod) return;
  const k = e.key.toLowerCase();
  if (e.target.closest('input, textarea, [contenteditable="true"]')) return;
  const top = WM.topWindow();
  if (k === 'w') { e.preventDefault(); if (top) WM.close(top); }
  else if (k === 'm') { e.preventDefault(); if (top) WM.minimize(top); }
  else if (k === 'q') {
    e.preventDefault();
    const appId = WM.activeApp;
    if (appId === 'finder') { WM.windowsOf('finder').forEach(w => WM.close(w)); }
    else WM.quitApp(appId);
  }
  else if (k === 'n' && top) {
    e.preventDefault();
    const app = Apps[top.appId];
    if (app && !app.single) WM.open(top.appId);
  }
  else if (k === 't' && top && top.appId === 'safari') { e.preventDefault(); top.api?.newTab(); }
});

// ---------- Boot ----------
(function boot() {
  applyAppearance(); applyWallpaper();
  const fill = document.querySelector('.boot-bar-fill');
  setTimeout(() => fill.classList.add('go'), 60);
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    const bootEl = document.getElementById('boot');
    if (!bootEl) return;
    bootEl.classList.add('done');
    setTimeout(() => bootEl.remove(), 500);
    LockScreen.show();
  };
  setTimeout(finish, 2100);
  document.getElementById('boot').addEventListener('click', finish, { once: true });
  // unlock interactions
  const ls = document.getElementById('lockscr');
  ls.addEventListener('click', () => { if (LockScreen.shown) LockScreen.hide(); });
  document.addEventListener('keydown', (e) => { if (LockScreen.shown && (e.key === 'Enter' || e.key === ' ')) LockScreen.hide(); });
  setInterval(() => LockScreen.shown && LockScreen.tick(), 10000);
})();
