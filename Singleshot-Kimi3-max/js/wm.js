/* wm.js — window manager: open/close/focus/minimize/zoom/snap/Mission Control */
'use strict';

const WM = {
  windows: [],
  z: 100,
  cascade: 0,
  activeApp: 'finder',

  open(appId, args) {
    const app = Apps[appId];
    if (!app) return null;
    Bus.emit('launching', appId);
    if (app.single) {
      const w = this.windows.find(w => w.appId === appId);
      if (w) {
        if (w.minimized) this.restore(w); else this.focus(w);
        if (app.onArgs) app.onArgs(w, args || {});
        return w;
      }
    }
    const size = typeof app.size === 'function' ? app.size(args) : (app.size || { w: 860, h: 560 });
    const off = (this.cascade++ % 8) * 26;
    const rect = {
      w: Math.min(size.w, innerWidth - 24),
      h: Math.min(size.h, innerHeight - 60),
    };
    rect.x = clamp(innerWidth / 2 - rect.w / 2 + off - 60, 8, Math.max(8, innerWidth - rect.w - 8));
    rect.y = clamp(70 + off - 20, 34, Math.max(34, innerHeight - rect.h - 90));

    const titleEl = el('span', { class: 'win-title', text: app.name });
    const tl = (cls, svg, title) => {
      const b = el('button', { class: 'tl ' + cls, title, html: svg });
      return b;
    };
    const closeB = tl('tl-r', '<svg viewBox="0 0 12 12"><path d="M3 3 L9 9 M9 3 L3 9" stroke="#7a1010" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>', 'Close');
    const minB = tl('tl-y', '<svg viewBox="0 0 12 12"><path d="M2.5 6 H9.5" stroke="#8a5a00" stroke-width="1.5" stroke-linecap="round"/></svg>', 'Minimize');
    const zoomB = tl('tl-g', '<svg viewBox="0 0 12 12"><path d="M3.5 6.5 V3.5 H6.5 M8.5 5.5 V8.5 H5.5" stroke="#0a6016" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>', 'Zoom');
    const content = el('div', { class: 'content' });
    const toolbar = el('div', { class: 'win-toolbar' });
    const winEl = el('div', { class: 'win', style: { left: rect.x + 'px', top: rect.y + 'px', width: rect.w + 'px', height: rect.h + 'px' } },
      el('div', { class: 'titlebar' },
        el('div', { class: 'tl-wrap' }, closeB, minB, zoomB),
        titleEl, toolbar),
      content,
      ...['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(d => el('div', { class: 'rz rz-' + d, dataset: { d } }))
    );

    const win = {
      id: uid(), appId, app, el: winEl, content, titleEl, toolbar, rect,
      minimized: false, maximized: false, prevRect: null,
      setTitle(t) { titleEl.textContent = t; },
      close() { WM.close(win); },
      flashTitle() { titleEl.classList.add('flash'); setTimeout(() => titleEl.classList.remove('flash'), 900); },
    };
    closeB.onclick = (e) => { e.stopPropagation(); this.close(win); };
    minB.onclick = (e) => { e.stopPropagation(); this.minimize(win); };
    zoomB.onclick = (e) => { e.stopPropagation(); this.toggleMax(win); };
    titleEl.parentElement.addEventListener('dblclick', (e) => { if (!e.target.closest('.tl, .win-toolbar, button, input')) this.toggleMax(win); });

    this.makeDraggable(win);
    this.makeResizable(win);
    winEl.addEventListener('pointerdown', () => this.focus(win), true);
    document.getElementById('windows').append(winEl);
    this.windows.push(win);
    app.build(win, args || {});
    this.focus(win);
    winEl.classList.add('opening');
    setTimeout(() => winEl.classList.remove('opening'), 260);
    Bus.emit('win-open', win);
    return win;
  },

  focus(win) {
    if (win.minimized) return;
    this.windows.forEach(w => w.el.classList.remove('active'));
    win.el.classList.add('active');
    win.el.style.zIndex = ++this.z;
    this.activeApp = win.appId;
    Bus.emit('active-app', win.appId);
  },

  close(win) {
    const i = this.windows.indexOf(win);
    if (i < 0) return;
    if (win.app.onClose) try { win.app.onClose(win); } catch {}
    this.windows.splice(i, 1);
    win.el.classList.add(minimizeAnim.has(win) ? 'closing' : 'closing');
    setTimeout(() => win.el.remove(), 180);
    Bus.emit('win-close', win);
    const top = this.windows.filter(w => !w.minimized).sort((a, b) => (+b.el.style.zIndex) - (+a.el.style.zIndex))[0];
    if (top) this.focus(top);
  },

  closeActive() { const w = this.topWindow(); if (w) this.close(w); },
  quitApp(appId) {
    this.windows.filter(w => w.appId === appId).slice().forEach(w => this.close(w));
  },

  windowsOf(appId) { return this.windows.filter(w => w.appId === appId); },
  topWindow() {
    return this.windows.filter(w => !w.minimized).sort((a, b) => (+b.el.style.zIndex) - (+a.el.style.zIndex))[0] || null;
  },

  minimize(win) {
    if (win.minimized) return;
    const r = Dock.iconRect(win.appId);
    win.minimized = true;
    win.el.classList.add('minimizing');
    const wr = win.el.getBoundingClientRect();
    if (r) {
      const dx = r.x + r.width / 2 - (wr.left + wr.width / 2);
      const dy = r.y + r.height / 2 - (wr.top + wr.height / 2);
      win.el.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy * 0.75}px) scale(0.28,0.12)`, opacity: 0.15 },
      ], { duration: 380, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' });
      minimizeAnim.add(win);
      setTimeout(() => { win.el.hidden = true; win.el.classList.remove('active'); Bus.emit('win-min', win); }, 380);
    } else {
      win.el.hidden = true; Bus.emit('win-min', win);
    }
    const top = this.topWindow();
    if (top) this.focus(top);
    Bus.emit('dock-update');
  },

  restore(win) {
    if (!win.minimized) return;
    win.minimized = false;
    win.el.hidden = false;
    win.el.classList.remove('minimizing');
    const r = Dock.iconRect(win.appId);
    if (r) {
      const wr = win.el.getBoundingClientRect();
      const dx = r.x + r.width / 2 - (wr.left + wr.width / 2);
      const dy = r.y + r.height / 2 - (wr.top + wr.height / 2);
      win.el.animate([
        { transform: `translate(${dx}px, ${dy * 0.75}px) scale(0.28,0.12)`, opacity: 0.15 },
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
      ], { duration: 330, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      minimizeAnim.delete(win);
      setTimeout(() => win.el.getAnimations().forEach(a => a.cancel()), 360);
    }
    this.focus(win);
    Bus.emit('win-restore', win);
    Bus.emit('dock-update');
  },

  toggleMax(win) {
    if (win.maximized) {
      Object.assign(win.rect, win.prevRect);
      win.maximized = false;
    } else {
      win.prevRect = { ...win.rect };
      win.rect = { x: 6, y: 32, w: innerWidth - 12, h: innerHeight - 32 - 78 };
      win.maximized = true;
    }
    this.applyRect(win);
  },
  applyRect(win, animate = true) {
    if (animate) win.el.classList.add('win-anim');
    Object.assign(win.el.style, { left: win.rect.x + 'px', top: win.rect.y + 'px', width: win.rect.w + 'px', height: win.rect.h + 'px' });
    if (animate) setTimeout(() => win.el.classList.remove('win-anim'), 260);
    Bus.emit('win-rect', win);
  },

  makeDraggable(win) {
    const bar = win.el.querySelector('.titlebar');
    let sx, sy, ox, oy, ghost = null;
    bar.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.tl, input, select, textarea, button, .win-toolbar')) return;
      if (win.maximized) return;
      sx = e.clientX; sy = e.clientY; ox = win.rect.x; oy = win.rect.y;
      bar.setPointerCapture(e.pointerId);
      win.el.classList.add('dragging');
      const move = (ev) => {
        win.rect.x = ox + ev.clientX - sx;
        win.rect.y = Math.max(30, oy + ev.clientY - sy);
        this.applyRect(win, false);
        this.snapPreview(ev);
      };
      const up = (ev) => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        win.el.classList.remove('dragging');
        this.hideSnapPreview();
        if (ev.clientY <= 32) { this.toggleMax(win); }
        else if (ev.clientX <= 4) { win.prevRect = { x: ox, y: oy, w: win.rect.w, h: win.rect.h }; win.rect = { x: 6, y: 32, w: innerWidth / 2 - 9, h: innerHeight - 32 - 78 }; this.applyRect(win); }
        else if (ev.clientX >= innerWidth - 4) { win.prevRect = { x: ox, y: oy, w: win.rect.w, h: win.rect.h }; win.rect = { x: innerWidth / 2 + 3, y: 32, w: innerWidth / 2 - 9, h: innerHeight - 32 - 78 }; this.applyRect(win); }
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
    });
  },
  snapPreview(ev) {
    let g = document.getElementById('snap-ghost');
    let rect = null;
    if (ev.clientY <= 32) rect = { x: 6, y: 32, w: innerWidth - 12, h: innerHeight - 32 - 78 };
    else if (ev.clientX <= 4) rect = { x: 6, y: 32, w: innerWidth / 2 - 9, h: innerHeight - 32 - 78 };
    else if (ev.clientX >= innerWidth - 4) rect = { x: innerWidth / 2 + 3, y: 32, w: innerWidth / 2 - 9, h: innerHeight - 32 - 78 };
    if (!rect) return this.hideSnapPreview();
    if (!g) { g = el('div', { id: 'snap-ghost' }); (document.getElementById('snap-layer') || document.getElementById('windows')).append(g); }
    Object.assign(g.style, { display: 'block', left: rect.x + 'px', top: rect.y + 'px', width: rect.w + 'px', height: rect.h + 'px' });
  },
  hideSnapPreview() { const g = document.getElementById('snap-ghost'); if (g) g.remove(); },

  makeResizable(win) {
    win.el.querySelectorAll('.rz').forEach(h => {
      h.addEventListener('pointerdown', (e) => {
        if (win.maximized) return;
        e.preventDefault(); e.stopPropagation();
        const d = h.dataset.d, s = { x: e.clientX, y: e.clientY, ...win.rect };
        const min = win.app.min || { w: 360, h: 240 };
        h.setPointerCapture(e.pointerId);
        const move = (ev) => {
          const dx = ev.clientX - s.x, dy = ev.clientY - s.y;
          const r = { ...win.rect };
          if (d.includes('e')) r.w = Math.max(min.w, s.w + dx);
          if (d.includes('s')) r.h = Math.max(min.h, s.h + dy);
          if (d.includes('w')) { r.w = Math.max(min.w, s.w - dx); if (r.w > min.w) r.x = s.x + dx; }
          if (d.includes('n')) { r.h = Math.max(min.h, s.h - dy); if (r.h > min.h) r.y = Math.max(30, s.y + dy); }
          win.rect = r; this.applyRect(win, false);
        };
        const up = () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); };
        h.addEventListener('pointermove', move);
        h.addEventListener('pointerup', up);
      });
    });
  },

  // Mission Control
  mcOn: false,
  missionControl() {
    const layer = document.getElementById('mc');
    if (this.mcOn) return this.mcExit();
    const wins = this.windows.filter(w => !w.minimized);
    this.mcOn = true;
    layer.innerHTML = ''; layer.hidden = false;
    requestAnimationFrame(() => layer.classList.add('show'));
    const cols = Math.ceil(Math.sqrt(wins.length * innerWidth / innerHeight)) || 1;
    const rows = Math.ceil(wins.length / cols) || 1;
    const cw = innerWidth * 0.86 / cols, chh = (innerHeight - 160) * 0.8 / rows;
    wins.forEach((w, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const scale = Math.min(cw / w.rect.w, chh / w.rect.h, 1) * 0.94;
      const tx = (innerWidth - cols * cw) / 2 + col * cw + cw / 2 - (w.rect.x + w.rect.w / 2);
      const ty = 70 + row * chh + chh / 2 - (w.rect.y + w.rect.h / 2);
      w.el.classList.add('win-anim', 'mc-win');
      w.el.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      w.el.style.zIndex = 2000 + i;
      w.el.onclick = (e) => { e.stopPropagation(); this.mcExit(); this.focus(w); };
    });
    layer.onclick = () => this.mcExit();
    this._mcKey = (e) => { if (e.key === 'Escape') this.mcExit(); };
    document.addEventListener('keydown', this._mcKey, true);
  },
  mcExit() {
    const layer = document.getElementById('mc');
    this.mcOn = false;
    layer.classList.remove('show');
    setTimeout(() => { layer.hidden = true; layer.innerHTML = ''; }, 250);
    this.windows.forEach(w => {
      w.el.classList.remove('mc-win');
      w.el.style.transform = '';
      w.el.onclick = null;
      setTimeout(() => w.el.classList.remove('win-anim'), 280);
    });
    if (this._mcKey) document.removeEventListener('keydown', this._mcKey, true);
  },
};
const minimizeAnim = new WeakSet();

// App registry — populated by apps.*.js files
const Apps = {};
function regApp(def) { Apps[def.id] = def; }
