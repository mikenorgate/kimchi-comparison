/* dock.js — Liquid Glass Dock: pins, running apps, magnification, badges, Trash + Launchpad */
'use strict';

const Dock = {
  badges: {},
  build() {
    const dock = document.getElementById('dock');
    this.render();
    Bus.on('launching', (id) => this.bounce(id));
    ['win-open', 'win-close', 'win-min', 'win-restore', 'dock-update', 'trash'].forEach(ev => Bus.on(ev, () => this.render()));
    Sys.on('dockPins', () => this.render());
    // Magnification
    dock.addEventListener('mousemove', (e) => {
      const icons = dock.querySelectorAll('.dicon');
      icons.forEach(ic => {
        const r = ic.getBoundingClientRect();
        const dist = Math.abs(e.clientX - (r.left + r.width / 2));
        const t = Math.max(0, 1 - dist / 130);
        const s = 1 + t * t * 0.85;
        ic.style.setProperty('--mag', s);
      });
    });
    dock.addEventListener('mouseleave', () => dock.querySelectorAll('.dicon').forEach(ic => ic.style.setProperty('--mag', 1)));
    Bus.on('notif-click', (n) => {
      const map = { Messages: 'messages', Mail: 'mail', 'App Store': 'appstore', Music: 'music', Timer: 'clock', Photos: 'photos' };
      if (map[n.app]) WM.open(map[n.app]);
    });
  },

  render() {
    const dock = document.getElementById('dock');
    dock.innerHTML = '';
    const pins = Sys.get('dockPins');
    const running = [...new Set(WM.windows.map(w => w.appId))].filter(id => !pins.includes(id) && id !== 'trash');
    const ids = [...pins, ...running];
    ids.forEach((id, i) => {
      const app = Apps[id]; if (!app) return;
      if (i === pins.length && running.length) dock.append(el('div', { class: 'dock-sep' }));
      dock.append(this.mkIcon(app));
    });
    dock.append(el('div', { class: 'dock-sep' }));
    dock.append(this.mkIcon({ id: 'trash', name: 'Trash', icon: FS.trash.length ? 'trashfull' : 'trash' }, true));
  },

  mkIcon(app, isTrash = false) {
    const wrap = el('div', { class: 'dicon', dataset: { app: app.id } },
      el('span', { class: 'dlabel', text: app.name }),
      iconEl(app.icon, 52),
      this.badges[app.id] ? el('span', { class: 'badge', text: String(this.badges[app.id]) }) : null,
      el('span', { class: 'dot' }));
    const running = WM.windowsOf(app.id).length > 0;
    wrap.classList.toggle('running', running);
    wrap.onclick = () => {
      const wins = WM.windowsOf(app.id);
      if (!wins.length) return WM.open(app.id);
      const min = wins.filter(w => w.minimized);
      if (min.length) return WM.restore(min[min.length - 1]);
      const top = WM.topWindow();
      if (top && top.appId === app.id) return;
      WM.focus(wins.sort((a, b) => (+b.el.style.zIndex) - (+a.el.style.zIndex))[0]);
    };
    wrap.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const wins = WM.windowsOf(app.id);
      const pinned = Sys.get('dockPins').includes(app.id);
      const items = [];
      if (wins.length) items.push({ label: 'Show All Windows', action: () => wins.forEach(w => { if (w.minimized) WM.restore(w); WM.focus(w); }) });
      if (!isTrash && app.id !== 'finder') items.push({ label: wins.length ? 'New Window' : 'Open', action: () => WM.open(app.id) });
      if (isTrash) {
        items.push({ label: 'Open', action: () => WM.open('trash') });
        items.push({ label: 'Empty Trash', disabled: !FS.trash.length, action: () => this.confirmEmptyTrash() });
      } else {
        items.push({ separator: true });
        items.push(pinned
          ? { label: app.id === 'finder' ? 'Keep in Dock' : 'Remove from Dock', disabled: app.id === 'finder', action: () => Sys.set('dockPins', Sys.get('dockPins').filter(p => p !== app.id)) }
          : { label: 'Keep in Dock', action: () => Sys.set('dockPins', [...Sys.get('dockPins'), app.id]) });
        if (wins.length && app.id !== 'finder') { items.push({ separator: true }); items.push({ label: 'Quit', action: () => WM.quitApp(app.id) }); }
      }
      ctxMenu(e.clientX, e.clientY, items);
    });
    if (!isTrash) wrap.addEventListener('dblclick', () => {});
    return wrap;
  },

  confirmEmptyTrash() {
    modal({
      title: 'Empty Trash', icon: 'trashfull', width: 380,
      body: `Are you sure you want to permanently erase the ${FS.trash.length} item${FS.trash.length === 1 ? '' : 's'} in the Trash? You can't undo this action.`,
      buttons: [{ label: 'Cancel' }, { label: 'Empty Trash', danger: true, action: () => FS.emptyTrash() }],
    });
  },

  bounce(appId) {
    const ic = document.querySelector(`.dicon[data-app="${appId}"]`);
    if (!ic) return;
    ic.animate([
      { transform: 'translateY(0)' }, { transform: 'translateY(-26px)' },
      { transform: 'translateY(0)' }, { transform: 'translateY(-12px)' }, { transform: 'translateY(0)' },
    ], { duration: 620, easing: 'ease-out' });
  },

  iconRect(appId) {
    const ic = document.querySelector(`.dicon[data-app="${appId}"]`);
    return ic ? ic.getBoundingClientRect() : null;
  },

  setBadge(appId, n) {
    if (n) this.badges[appId] = n; else delete this.badges[appId];
    this.render();
  },
};

// ---------- Launchpad ----------
const Launchpad = {
  isOpen: false,
  open() {
    if (this.isOpen) return this.close();
    this.isOpen = true;
    const lp = document.getElementById('launchpad');
    lp.innerHTML = ''; lp.hidden = false;
    const input = el('input', { class: 'lp-search', placeholder: 'Search' });
    const grid = el('div', { class: 'lp-grid' });
    lp.append(el('div', { class: 'lp-inner' }, input, grid));
    requestAnimationFrame(() => lp.classList.add('show'));
    const render = (q = '') => {
      grid.innerHTML = '';
      Object.values(Apps)
        .filter(a => !['trash'].includes(a.id) && a.name.toLowerCase().includes(q.toLowerCase()))
        .forEach(a => {
          const item = el('div', { class: 'lp-item' }, iconEl(a.icon, 62), el('span', { text: a.name }));
          item.onclick = () => { this.close(); WM.open(a.id); };
          grid.append(item);
        });
    };
    render();
    input.addEventListener('input', () => render(input.value));
    input.focus();
    lp.addEventListener('pointerdown', (e) => { if (!e.target.closest('.lp-item') && !e.target.closest('.lp-search')) this.close(); });
    this._key = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._key, true);
  },
  close() {
    this.isOpen = false;
    const lp = document.getElementById('launchpad');
    lp.classList.remove('show');
    setTimeout(() => { lp.hidden = true; lp.innerHTML = ''; }, 220);
    document.removeEventListener('keydown', this._key, true);
  },
};
