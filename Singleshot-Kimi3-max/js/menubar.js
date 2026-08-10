/* menubar.js — transparent Tahoe menu bar: Apple menu, per-app menus, status items */
'use strict';

const MenuBar = {
  appId: 'finder',
  openTitle: null,

  build() {
    const bar = document.getElementById('menubar');
    bar.innerHTML = '';
    const left = el('div', { class: 'mb-left' });
    const logo = el('button', { class: 'mb-item mb-logo', text: '\uF8FF', title: 'Apple menu' });
    logo.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMenu('apple', logo); });
    left.append(logo);
    this.menuWrap = el('div', { class: 'mb-menus', id: 'mb-menus' });
    left.append(this.menuWrap);
    bar.append(left);

    const right = el('div', { class: 'mb-right' });
    // Battery
    this.battBtn = el('button', { class: 'mb-item mb-ic' }, glyphEl('battery', 24));
    this.battBtn.addEventListener('click', (e) => { e.stopPropagation(); this.batteryMenu(this.battBtn); });
    this.battPct = el('span', { class: 'mb-batt-pct', text: '100%' });
    right.append(el('span', { class: 'mb-group' }, this.battPct, this.battBtn));
    if (navigator.getBattery) navigator.getBattery().then(b => {
      const upd = () => this.battPct.textContent = Math.round(b.level * 100) + '%';
      upd(); b.addEventListener('levelchange', upd);
      this._batt = b;
    }).catch(() => {});
    // Wi-Fi
    this.wifiBtn = el('button', { class: 'mb-item mb-ic' }, glyphEl(Sys.get('wifi').on ? 'wifi' : 'wifiOff', 16));
    this.wifiBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMenu('wifi', this.wifiBtn); });
    right.append(this.wifiBtn);
    Sys.on('wifi', () => { this.wifiBtn.innerHTML = ''; this.wifiBtn.append(glyphEl(Sys.get('wifi').on ? 'wifi' : 'wifiOff', 16)); });
    // DND indicator
    this.dndBtn = el('button', { class: 'mb-item mb-ic moon', title: 'Do Not Disturb' }, glyphEl('moon', 13));
    this.dndBtn.style.display = Sys.get('dnd') ? '' : 'none';
    this.dndBtn.addEventListener('click', () => Sys.set('dnd', false));
    Sys.on('dnd', (v) => this.dndBtn.style.display = v ? '' : 'none');
    right.append(this.dndBtn);
    // Control Center
    const ccBtn = el('button', { class: 'mb-item mb-ic', title: 'Control Center' }, glyphEl('cc', 19));
    ccBtn.addEventListener('click', (e) => { e.stopPropagation(); SystemUI.toggleCC(); });
    right.append(ccBtn);
    // Spotlight
    const spBtn = el('button', { class: 'mb-item mb-ic', title: 'Spotlight (⌘Space)' }, glyphEl('search', 15));
    spBtn.addEventListener('click', (e) => { e.stopPropagation(); Spotlight.open(); });
    right.append(spBtn);
    // Clock
    this.clockBtn = el('button', { class: 'mb-item mb-clock' });
    this.clockBtn.addEventListener('click', (e) => { e.stopPropagation(); SystemUI.toggleNC(); });
    right.append(this.clockBtn);
    bar.append(right);
    this.tick(); setInterval(() => this.tick(), 5000);

    Bus.on('active-app', (id) => { this.appId = id; this.renderMenus(); });
    document.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('#menu-pop') && !e.target.closest('.mb-item')) this.closeMenu();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeMenu(); });
    this.renderMenus();
  },

  tick() { this.clockBtn.textContent = fmtDateMenuBar(new Date()); },

  menusFor(appId) {
    const app = Apps[appId] || Apps.finder;
    const win = WM.topWindow();
    const q = () => WM.quitApp(appId);
    const menus = [
      { title: app.name, bold: true, items: [
        { label: `About ${app.name}`, action: () => MenuBar.aboutApp(app) },
        { separator: true },
        ...(app.hasPrefs !== false && appId !== 'finder' ? [{ label: `Settings…`, sc: '⌘,', action: () => WM.open('settings') }] : []),
        { separator: true },
        { label: `Quit ${app.name}`, sc: '⌘Q', action: q },
        appId === 'finder' ? { label: '(Finder stays running)', disabled: true } : null,
      ].filter(Boolean) },
      { title: 'File', items: [
        ...(app.fileItems ? app.fileItems() : []),
        app.id !== 'finder' && !app.single ? { label: 'New Window', sc: '⌘N', action: () => WM.open(appId) } : null,
        app.single && app.newAction ? { label: app.newLabel || 'New', sc: '⌘N', action: app.newAction } : null,
        { label: 'Close Window', sc: '⌘W', action: () => WM.closeActive() },
      ].filter(Boolean) },
      { title: 'Edit', items: [
        { label: 'Undo', sc: '⌘Z', action: () => document.execCommand('undo') },
        { label: 'Redo', sc: '⇧⌘Z', action: () => document.execCommand('redo') },
        { separator: true },
        { label: 'Cut', sc: '⌘X', action: () => document.execCommand('cut') },
        { label: 'Copy', sc: '⌘C', action: () => document.execCommand('copy') },
        { label: 'Paste', sc: '⌘V', action: () => { document.execCommand('paste'); navigator.clipboard?.readText?.().then(t => { const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable) && t) document.execCommand('insertText', false, t); }).catch(() => {}); } },
        { label: 'Select All', sc: '⌘A', action: () => document.execCommand('selectAll') },
      ] },
      { title: 'View', items: [
        ...(app.viewItems ? app.viewItems() : []),
        { label: win && win.maximized ? 'Exit Full Screen' : 'Enter Full Screen', sc: '⌃⌘F', action: () => { const w = WM.topWindow(); if (w) WM.toggleMax(w); } },
      ] },
      ...(app.extraMenus ? app.extraMenus() : []),
      { title: 'Window', dynamic: () => [
        { label: 'Minimize', sc: '⌘M', action: () => { const w = WM.topWindow(); if (w) WM.minimize(w); } },
        { label: 'Zoom', action: () => { const w = WM.topWindow(); if (w) WM.toggleMax(w); } },
        { separator: true },
        ...WM.windowsOf(appId).map(w => ({
          label: w.titleEl.textContent || app.name,
          checked: WM.topWindow() === w,
          action: () => { if (w.minimized) WM.restore(w); else WM.focus(w); },
        })),
        { separator: true },
        { label: 'Bring All to Front', action: () => WM.windowsOf(appId).forEach(w => { if (w.minimized) WM.restore(w); WM.focus(w); }) },
      ] },
      { title: 'Help', items: [
        { label: `${app.name} Help`, action: () => this.appHelp(app) },
      ] },
    ];
    return menus;
  },

  appleMenuItems: () => [
    { label: 'About This Mac', action: aboutThisMac },
    { separator: true },
    { label: 'System Settings…', action: () => WM.open('settings') },
    { label: 'App Store…', action: () => WM.open('appstore') },
    { separator: true },
    { label: 'Force Quit…', sc: '⌥⌘⎋', action: () => MenuBar.forceQuit() },
    { separator: true },
    { label: 'Sleep', action: () => powerScreen('sleep') },
    { label: 'Restart…', action: () => modal({ title: 'Restart', icon: 'settings', body: 'Are you sure you want to restart your computer?', buttons: [{ label: 'Cancel' }, { label: 'Restart', primary: true, action: () => powerScreen('restart') }] }) },
    { label: 'Shut Down…', action: () => modal({ title: 'Shut Down', icon: 'settings', body: 'Are you sure you want to shut down your computer?', buttons: [{ label: 'Cancel' }, { label: 'Shut Down', primary: true, action: () => powerScreen('shutdown') }] }) },
    { separator: true },
    { label: 'Lock Screen', sc: '⌃⌘Q', action: () => LockScreen.show() },
    { label: `Log Out ${Sys.get('user')}…`, sc: '⇧⌘Q', action: () => LockScreen.show() },
  ],

  renderMenus() {
    this.menuWrap.innerHTML = '';
    for (const m of this.menusFor(this.appId)) {
      const b = el('button', { class: 'mb-item' + (m.bold ? ' mb-bold' : ''), text: m.title });
      b.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMenu(m.title, b); });
      b.addEventListener('mouseenter', () => { if (this.openTitle && this.openTitle !== m.title) this.showMenu(this.menuDef(m.title), b, m.title); });
      this.menuWrap.append(b);
    }
  },
  menuDef(title) {
    if (title === 'apple') return { title: '', items: this.appleMenuItems() };
    const m = this.menusFor(this.appId).find(m => m.title === title);
    if (m && m.dynamic) return { title, items: m.dynamic() };
    return m || { title, items: [] };
  },
  toggleMenu(title, anchor) { this.openTitle === title ? this.closeMenu() : this.showMenu(this.menuDef(title), anchor, title); },
  showMenu(def, anchor, titleKey) {
    this.openTitle = titleKey;
    const pop = document.getElementById('menu-pop');
    pop.innerHTML = ''; pop.hidden = false;
    pop.className = titleKey === 'apple' ? 'apple-menu' : '';
    for (const it of def.items) {
      if (!it) continue;
      if (it.separator) { pop.append(el('div', { class: 'sep' })); continue; }
      const row = el('div', { class: 'mi' + (it.disabled ? ' dis' : '') },
        el('span', { class: 'mi-check', text: it.checked ? '✓' : '' }),
        el('span', { class: 'mi-label', text: it.label }),
        it.sc ? el('span', { class: 'mi-sc', text: it.sc }) : null);
      if (!it.disabled && it.action) row.onclick = () => { this.closeMenu(); setTimeout(() => it.action(), 0); };
      pop.append(row);
    }
    const r = anchor.getBoundingClientRect();
    pop.style.left = clamp(r.left - 6, 4, innerWidth - 260) + 'px';
    pop.style.top = '30px';
    // re-clamp after render
    const pr = pop.getBoundingClientRect();
    if (pr.right > innerWidth - 6) pop.style.left = (innerWidth - pr.width - 6) + 'px';
  },
  closeMenu() { this.openTitle = null; const p = document.getElementById('menu-pop'); p.hidden = true; p.innerHTML = ''; },

  batteryMenu(anchor) {
    const lvl = this._batt ? Math.round(this._batt.level * 100) : 100;
    this.showMenu({ title: 'Battery', items: [
      { label: `Battery: ${lvl}%`, disabled: true },
      { label: 'Power Source: Power Adapter', disabled: true },
      { separator: true },
      { label: 'Battery Settings…', action: () => WM.open('settings', { pane: 'displays' }) },
    ]}, anchor, 'battery');
  },

  aboutApp(app) {
    modal({
      title: '', width: 300,
      body: el('div', { class: 'about-app' },
        el('div', { class: 'about-ic' }, iconEl(app.icon, 84)),
        el('div', { class: 'about-name', text: app.name }),
        el('div', { class: 'about-ver', text: 'Version 26.1' }),
        el('div', { class: 'about-c', text: 'macOS Tahoe Web Edition' })),
      buttons: [{ label: 'OK', primary: true }],
    });
  },
  appHelp(app) {
    modal({
      title: `${app.name} Help`, icon: app.icon, width: 420,
      body: `<p style="margin:.2em 0 .8em">Everything in <b>${esc(app.name)}</b> is fully interactive:</p>
        <ul style="margin:0;padding-left:1.2em;line-height:1.7;color:var(--text-dim)">
        <li>Use the toolbar buttons and menus — every one has a real action.</li>
        <li>Drag windows by their title bar; drag edges to resize.</li>
        <li>Right-click items for contextual menus.</li>
        <li>Press <b>⌘Space</b> anywhere for Spotlight.</li></ul>`,
      buttons: [{ label: 'OK', primary: true }],
    });
  },
  forceQuit() {
    const ids = ['finder', ...new Set(WM.windows.map(w => w.appId))];
    const mk = () => {
      const body = el('div', { class: 'fq-list' });
      const running = ['finder', ...new Set(WM.windows.map(w => w.appId))];
      running.forEach(id => {
        const app = Apps[id]; if (!app) return;
        body.append(el('div', { class: 'fq-row' },
          el('span', { class: 'fq-ic' }, iconEl(app.icon, 30)),
          el('span', { class: 'fq-name', text: app.name }),
          el('button', { class: 'btn', text: 'Force Quit', onclick: () => {
            if (id === 'finder') { WM.windowsOf('finder').forEach(w => WM.close(w)); }
            else WM.quitApp(id);
            Notif.push('System', app.name, 'was forced to quit.', app.icon);
            m.close(); MenuBar.forceQuit();
          } })));
      });
      return body;
    };
    const m = modal({ title: 'Force Quit Applications', width: 400, body: mk(), buttons: [{ label: 'Done', primary: true }] });
  },
};
