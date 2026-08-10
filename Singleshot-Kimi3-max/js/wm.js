/* wm.js — window manager + app registry */
(function () {
  const Mac = window.Mac, Bus = Mac.Bus, h = Mac.h;
  const windows = [];
  let zTop = 100, cascade = 0;

  function winArea() { return document.getElementById('windows'); }

  class Win {
    constructor(opts) {
      const wm = Mac.wm;
      this.id = Mac.uid();
      this.appId = opts.app;
      this.app = wm.apps[opts.app] || {};
      this.opts = opts;
      this.state = 'normal'; // normal | min | max | hidden
      this._prevFrame = null;
      this.closed = false;

      this.el = h('div', { class: 'win' + (opts.simpleBar ? ' simple-bar' : ''), role: 'dialog' });
      const W = winArea().clientWidth, H = winArea().clientHeight;
      const w = Math.min(opts.width || 760, W - 30), ht = Math.min(opts.height || 500, H - 30);
      const x = opts.x != null ? opts.x : Math.max(12, (W - w) / 2 + (cascade % 5) * 28 - 46);
      const y = opts.y != null ? opts.y : Math.max(10, (H - ht) / 2.6 + (cascade % 5) * 24 - 20);
      cascade++;
      Object.assign(this.el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: ht + 'px', zIndex: ++zTop });

      // chrome
      this.btnClose = h('div', { class: 'tl tl-close', title: 'Close' });
      this.btnMin = h('div', { class: 'tl tl-min', title: 'Minimize' });
      this.btnZoom = h('div', { class: 'tl tl-zoom', title: 'Zoom' });
      const traffic = h('div', { class: 'traffic' }, this.btnClose, this.btnMin, this.btnZoom);
      this.titleEl = h('div', { class: 'win-title' }, opts.title || this.app.name || 'Window');
      this.bar = h('div', { class: 'win-bar' }, traffic, this.titleEl);
      this.body = h('div', { class: 'win-body' });
      this.el.append(this.bar, this.body);

      if (opts.resizable !== false) ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(d => {
        this.el.append(h('div', { class: 'rz rz-' + d, onpointerdown: e => this._startResize(e, d) }));
      });

      // events
      this.el.addEventListener('pointerdown', () => this.focus(), true);
      this.bar.addEventListener('pointerdown', e => {
        if (e.target.closest('.tl') || e.target.closest('button') || e.target.closest('input')) return;
        this._startDrag(e);
      });
      this.bar.addEventListener('dblclick', e => { if (!e.target.closest('.tl')) this.zoom(); });
      this.btnClose.addEventListener('click', e => { e.stopPropagation(); this.close(); });
      this.btnMin.addEventListener('click', e => { e.stopPropagation(); this.minimize(); });
      this.btnZoom.addEventListener('click', e => { e.stopPropagation(); this.zoom(); });

      winArea().append(this.el);
      windows.push(this);
      if (opts.build) { try { opts.build(this.body, this); } catch (err) { console.error('build of ' + opts.app, err); } }
      Bus.emit('windows');
      this.focus();
    }

    setTitle(t) { this.titleEl.textContent = t; }
    setDirty(d) { this._dirty = d; this.titleEl.innerHTML = (d ? '<span class="dirty">● </span>' : '') + Mac.esc(this.titleEl.textContent.replace(/^● /, '')); }

    focus() {
      if (this.closed) return;
      if (this.state === 'min' || this.state === 'hidden') this.restore();
      windows.forEach(w => w.el.classList.remove('active'));
      this.el.classList.add('active');
      this.el.style.zIndex = ++zTop;
      const wm = Mac.wm;
      if (wm.activeApp !== this.appId) { wm.activeApp = this.appId; Bus.emit('activeapp', this.appId); }
      else Bus.emit('activeapp', this.appId); // still refresh menus (window list may change)
      if (this.opts.onFocus) this.opts.onFocus(this);
    }

    frame() { return { x: this.el.offsetLeft, y: this.el.offsetTop, w: this.el.offsetWidth, h: this.el.offsetHeight }; }
    setFrame(f) { Object.assign(this.el.style, { left: f.x + 'px', top: f.y + 'px', width: f.w + 'px', height: f.h + 'px' }); }

    zoom() {
      if (this.state === 'min') return;
      if (this.state === 'max' && this._prevFrame) {
        this.setFrame(this._prevFrame); this.state = 'normal';
      } else {
        this._prevFrame = this.frame();
        const W = winArea().clientWidth, H = winArea().clientHeight;
        const S = Mac.Settings;
        let rx = 6, ry = 4, rw = W - 12, rh = H - 8;
        if (!S.get('dockAutohide')) {
          const reserve = (S.get('dockSize') || 54) + 22;
          if (S.get('dockPos') === 'bottom') rh -= reserve;
          else if (S.get('dockPos') === 'left') { rx += reserve; rw -= reserve; }
          else rw -= reserve;
        }
        this.setFrame({ x: rx, y: ry, w: rw, h: rh });
        this.state = 'max';
      }
      this.focus();
    }

    minimize() {
      if (this.state === 'min') return;
      const target = Mac.Dock ? Mac.Dock.iconRect(this.appId) : null;
      const f = this.frame();
      const host = winArea().getBoundingClientRect();
      const tx = target ? (target.left + target.width / 2 - host.left) : winArea().clientWidth / 2;
      const ty = target ? (target.top + target.height / 2 - host.top) : winArea().clientHeight;
      this.el.classList.add('min-anim');
      this.el.style.transformOrigin = '50% 100%';
      const dx = tx - (f.x + f.w / 2), dy = ty - (f.y + f.h);
      this.el.style.transform = `translate(${dx}px, ${dy * 0.62}px) scale(0.08, 0.02)`;
      this.el.style.opacity = '0';
      this.state = 'min';
      setTimeout(() => { if (this.state === 'min') this.el.style.display = 'none'; }, 400);
      if (Mac.Dock) Mac.Dock.addMini(this);
      Bus.emit('windows');
      // focus next window
      const next = Mac.wm._topmost(w => !w.isMin() && w !== this);
      if (next) next.focus();
      else { Mac.wm.activeApp = 'finder'; Bus.emit('activeapp', 'finder'); }
    }

    restore() {
      if (this.closed) return;
      if (this.state === 'min') {
        this.el.style.display = 'flex';
        // force layout then transition back
        void this.el.offsetWidth;
        this.el.style.transform = 'none';
        this.el.style.opacity = '1';
        setTimeout(() => { this.el.classList.remove('min-anim'); this.el.style.transformOrigin = ''; }, 380);
        if (Mac.Dock) Mac.Dock.removeMini(this);
      }
      const wasHidden = this.state === 'hidden';
      this.state = wasHidden ? 'normal' : 'normal';
      Bus.emit('windows');
    }

    isMin() { return this.state === 'min' || this.state === 'hidden'; }

    close() {
      if (this.closed) return;
      this.closed = true;
      const idx = windows.indexOf(this);
      if (idx >= 0) windows.splice(idx, 1);
      if (Mac.Dock) Mac.Dock.removeMini(this);
      this.el.classList.add('closing');
      setTimeout(() => this.el.remove(), 150);
      if (this.opts.onClose) { try { this.opts.onClose(this); } catch (e) { console.error(e); } }
      Bus.emit('windows');
      const wm = Mac.wm;
      const next = wm._topmost(w => !w.isMin());
      if (next) next.focus();
      else if (wm.activeApp === this.appId) { wm.activeApp = 'finder'; Bus.emit('activeapp', 'finder'); }
    }

    _startDrag(e) {
      e.preventDefault();
      this.focus();
      const start = this.frame(), sx = e.clientX, sy = e.clientY;
      const host = winArea();
      const move = ev => {
        let x = start.x + ev.clientX - sx, y = start.y + ev.clientY - sy;
        y = Mac.clamp(y, 0, host.clientHeight - 40);
        x = Mac.clamp(x, -start.w + 120, host.clientWidth - 80);
        Object.assign(this.el.style, { left: x + 'px', top: y + 'px' });
        if (this.state === 'max') this.state = 'normal';
      };
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }

    _startResize(e, dir) {
      e.preventDefault(); e.stopPropagation();
      this.focus();
      const start = this.frame(), sx = e.clientX, sy = e.clientY;
      const minW = this.opts.minW || 300, minH = this.opts.minH || 200;
      const move = ev => {
        let { x, y, w, h } = start;
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (dir.includes('e')) w = start.w + dx;
        if (dir.includes('s')) h = start.h + dy;
        if (dir.includes('w')) { w = start.w - dx; x = start.x + dx; }
        if (dir.includes('n')) { h = start.h - dy; y = start.y + dy; }
        if (w < minW) { if (dir.includes('w')) x -= (minW - w); w = minW; }
        if (h < minH) { if (dir.includes('n')) y -= (minH - h); h = minH; }
        Object.assign(this.el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      };
      const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    }
  }

  const wm = {
    windows, Win, activeApp: 'finder', apps: {},

    register(app) { this.apps[app.id] = app; Bus.emit('apps', app.id); },
    getApp(id) { return this.apps[id]; },

    launch(id, args) {
      const app = this.apps[id];
      if (!app) { console.warn('no app', id); return null; }
      const wasRunning = !!app._running;
      app._running = true;
      if (app._hidden) { app._hidden = false; windows.forEach(w => { if (w.appId === id && w.state === 'hidden') w.state = 'normal'; }); }
      Bus.emit('running', id);
      // un-hide existing windows on re-launch
      const existing = windows.filter(w => w.appId === id && !w.closed);
      if (!wasRunning && Mac.Dock) Mac.Dock.bounce(id);
      if (existing.length && !args) {
        existing.forEach(w => { if (w.state === 'hidden') w.state = 'normal'; });
        existing[0].focus();
        // an app re-opened with no visible windows (e.g. all closed but not quit per-app policy gets reopenAllWindows style: if there are no windows at all, reopen)
        return existing[0];
      }
      let win = null;
      try { win = app.open(args); } catch (err) { console.error('open ' + id, err); }
      if (!win && existing.length) { existing[0].focus(); return existing[0]; }
      if (win === undefined || win === null) win = windows.filter(w => w.appId === id).pop() || null;
      if (win && !win.closed) win.focus();
      return win;
    },

    createWindow(opts) { return new Win(opts); },

    quitApp(id, force) {
      const app = this.apps[id];
      if (!app) return;
      windows.filter(w => w.appId === id && !w.closed).slice().forEach(w => w.close());
      app._running = false; app._hidden = false;
      Bus.emit('running', id);
      if (this.activeApp === id) { this.activeApp = 'finder'; Bus.emit('activeapp', 'finder'); }
    },

    hideApp(id) {
      const app = this.apps[id];
      if (!app) return;
      app._hidden = true;
      windows.forEach(w => { if (w.appId === id && !w.closed) w.el.style.display = 'none'; });
      windows.forEach(w => { if (w.appId === id && !w.closed) w.state = 'hidden'; });
      const next = this._topmost(w => w.appId !== id && w.state === 'normal');
      if (next) next.focus(); else { this.activeApp = 'finder'; Bus.emit('activeapp', 'finder'); }
      Bus.emit('running', id); Bus.emit('windows');
    },

    unhideAllExcept(id) {
      // Hide Others
      windows.forEach(w => { if (!w.closed && w.appId !== id) w.el.style.display = 'none', w.state = 'hidden'; });
      Bus.emit('running'); Bus.emit('windows');
    },
    showAllHidden() { windows.forEach(w => { if (w.state === 'hidden') { w.state = 'normal'; w.el.style.display = 'flex'; } }); Bus.emit('windows'); },

    windowsFor(appId) { return windows.filter(w => w.appId === appId && !w.closed); },
    topWin() { return this._topmost(() => true); },
    _topmost(pred) {
      let best = null, bz = -1;
      windows.forEach(w => { if (!w.closed && pred(w) && +w.el.style.zIndex > bz && w.state !== 'hidden') { best = w; bz = +w.el.style.zIndex; } });
      return best;
    },
    runningApps() { return Object.values(this.apps).filter(a => a._running); },
    setActiveApp(id) { if (this.activeApp !== id) { this.activeApp = id; Bus.emit('activeapp', id); } },
  };
  Mac.wm = wm;
  Mac.launch = (id, args) => wm.launch(id, args);
})();
