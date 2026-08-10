/* menubar.js — menu bar engine: Apple menu, app menus, accelerators, extras */
(function () {
  const Mac = window.Mac, Bus = Mac.Bus, h = Mac.h;
  const S = () => Mac.Settings;
  let openMenu = null; // {el, item}
  let accelMap = [];   // [{mods, key, action, enabled}]

  /* ---------------- menu spec helpers ---------------- */
  const SEP = { sep: true };
  const item = (label, accel, action, opts) => Object.assign({ label, accel, action }, opts || {});

  function itemEnabled(it) { if (it.disabled) return false; if (typeof it.enabled === 'function') return !!it.enabled(); if (it.enabled === false) return false; return true; }
  function itemChecked(it) { if (typeof it.checked === 'function') return !!it.checked(); return !!it.checked; }

  /* Collect accelerators from spec (called on every render) */
  function collectAccels(spec) {
    accelMap = [];
    (function walk(items) {
      items.forEach(it => {
        if (it.submenu) walk(it.submenu);
        if (it.accel && it.action) {
          const m = parseAccel(it.accel);
          if (m) accelMap.push({ mods: m.mods, key: m.key, action: it.action, enabled: () => itemEnabled(it) });
        }
      });
    })(spec.flatMap(s => s.items));
  }
  function parseAccel(a) {
    // e.g. "⇧⌘N", "⌘," "⌥⌘H" "⌘⌫" "⌥⇧⌘G"
    let mods = { meta: false, shift: false, alt: false };
    let key = null;
    for (const ch of a) {
      if (ch === '⌘') mods.meta = true;
      else if (ch === '⇧') mods.shift = true;
      else if (ch === '⌥') mods.alt = true;
      else key = ch.toLowerCase();
    }
    if (!mods.meta || !key) return null;
    const keyMap = { '⌫': 'backspace', '⏎': 'enter', '↑': 'arrowup', '↓': 'arrowdown', '←': 'arrowleft', '→': 'arrowright', '+': '=', '–': '-' };
    return { mods, key: keyMap[key] || key };
  }

  /* ---------------- rendering ---------------- */
  function menuEl(spec, onPick) {
    const el = h('div', { class: 'menu' });
    spec.forEach(it => {
      if (it.sep) { el.append(h('div', { class: 'mi-sep' })); return; }
      if (it.custom) { const wrap = h('div'); it.custom(wrap); el.append(wrap); return; }
      const enabled = itemEnabled(it);
      const row = h('div', { class: 'mi' + (enabled ? '' : ' disabled') },
        h('span', {}, h('span', { class: 'mi-check' }, it.checked ? (itemChecked(it) ? '✓' : '') : ''), document.createTextNode(it.label)),
        it.accel ? h('span', { class: 'mi-accel' }, it.accel) : (it.submenu ? h('span', { class: 'mi-sub' }, '▶') : null)
      );
      if (enabled) {
        if (it.submenu) {
          let subEl = null, hideT = null;
          row.addEventListener('pointerenter', () => {
            clearTimeout(hideT);
            const r = row.getBoundingClientRect();
            subEl = menuEl(it.submenu, onPick);
            subEl.classList.add('submenu');
            document.body.append(subEl);
            subEl.style.left = (r.right - 4) + 'px';
            subEl.style.top = (r.top - 5) + 'px';
            const sr = subEl.getBoundingClientRect();
            if (sr.right > innerWidth - 6) subEl.style.left = (r.left - sr.width + 4) + 'px';
            if (sr.bottom > innerHeight - 6) subEl.style.top = Math.max(6, innerHeight - sr.height - 6) + 'px';
          });
          row.addEventListener('pointerleave', () => { hideT = setTimeout(() => { if (subEl && !subEl.matches(':hover')) { subEl.remove(); subEl = null; } }, 120); });
        } else {
          row.addEventListener('click', e => {
            e.stopPropagation();
            onPick();
            if (it.action) { try { it.action(); } catch (err) { console.error(err); } }
          });
        }
      }
      el.append(row);
    });
    return el;
  }

  function closeMenus() {
    if (openMenu) { openMenu.el.remove(); openMenu.item.classList.remove('open'); openMenu = null; }
  }

  function showMenu(anchorEl, spec) {
    closeMenus();
    const el = menuEl(spec, closeMenus);
    document.body.append(el);
    const r = anchorEl.getBoundingClientRect();
    el.style.left = Math.min(r.left, innerWidth - 250) + 'px';
    el.style.top = (r.bottom + 4) + 'px';
    const er = el.getBoundingClientRect();
    if (er.right > innerWidth - 6) el.style.left = (innerWidth - er.width - 6) + 'px';
    if (er.bottom > innerHeight - 6) el.style.top = Math.max(30, innerHeight - er.height - 6) + 'px';
    anchorEl.classList.add('open');
    openMenu = { el, item: anchorEl };
  }

  /* ---------------- spec builders ---------------- */
  function appleMenu() {
    return [{
      title: null, apple: true, items: [
        item('About This Mac', null, () => Mac.System.aboutThisMac()),
        SEP,
        item('System Settings…', null, () => Mac.launch('settings')),
        item('App Store…', null, () => Mac.launch('appstore')),
        SEP,
        item('Recent Items', null, null, {
          submenu: recentItems(), enabled: recentItems().length > 0
        }),
        SEP,
        item('Force Quit…', '⌥⌘⎋', () => Mac.System.forceQuit()),
        SEP,
        item('Sleep', null, () => Mac.System.sleep()),
        item('Restart…', null, () => Mac.System.confirm('Are you sure you want to restart your computer now?', 'Restart').then(ok => ok && Mac.System.restart())),
        item('Shut Down…', null, () => Mac.System.confirm('Are you sure you want to shut down your computer now?', 'Shut Down').then(ok => ok && Mac.System.shutdown())),
        SEP,
        item('Lock Screen', '⌃⌘Q', () => Mac.System.lock()),
        item('Log Out ' + S().get('username') + '…', '⇧⌘Q', () => Mac.System.confirm('Are you sure you want to log out now?', 'Log Out').then(ok => ok && Mac.System.logout())),
      ]
    }];
  }
  function recentItems() {
    return Mac.FS.recent(8, (_node, p) => p.startsWith(Mac.FS.TRASH)).map(r =>
      item(r.node.name, null, () => Mac.System.openPath(r.path))
    );
  }

  function stdAppMenu(app) {
    const name = app.name;
    const canQuit = app.id !== 'finder';
    return {
      title: name, bold: true, items: [
        item('About ' + name, null, () => Mac.System.aboutApp(app)),
        SEP,
        item('Settings…', '⌘,', () => app.settings ? app.settings() : Mac.launch('settings')),
        SEP,
        item('Hide ' + name, '⌘H', () => Mac.wm.hideApp(app.id)),
        item('Hide Others', '⌥⌘H', () => Mac.wm.unhideAllExcept(app.id)),
        item('Show All', null, () => Mac.wm.showAllHidden()),
        SEP,
        item('Quit ' + name, '⌘Q', () => Mac.wm.quitApp(app.id), { enabled: canQuit }),
      ]
    };
  }

  function stdWindowMenu(appId) {
    const wins = Mac.wm.windowsFor(appId);
    const top = Mac.wm.topWin();
    const mine = top && top.appId === appId ? top : (wins[0] || null);
    return {
      title: 'Window', items: [
        item('Minimize', '⌘M', () => mine && mine.minimize(), { enabled: !!mine }),
        item('Zoom', null, () => mine && mine.zoom(), { enabled: !!mine }),
        SEP,
        item('Bring All to Front', null, () => wins.forEach(w => w.focus()), { enabled: wins.length > 0 }),
        SEP,
        ...wins.map(w => item(w.titleEl.textContent.replace(/^● /, '') || 'Window', null, () => w.focus(), { checked: Mac.wm.activeApp === appId && Mac.wm.topWin() === w })),
        ...(wins.length ? [SEP, item('Merge All Windows', null, null, { enabled: false })] : []),
      ]
    };
  }

  function stdHelpMenu(app) {
    return {
      title: 'Help', items: [
        {
          custom: body => {
            const input = h('input', { class: 'inp', placeholder: 'Search' });
            const res = h('div');
            const flat = [];
            currentSpec.forEach(sec => sec.items.forEach(it => { if (!it.sep && !it.submenu && it.label) flat.push(it); }));
            input.addEventListener('input', () => {
              res.innerHTML = '';
              const q = input.value.trim().toLowerCase();
              if (!q) return;
              flat.filter(it => it.label.toLowerCase().includes(q)).slice(0, 6).forEach(it => {
                res.append(h('div', {
                  class: 'mi' + (itemEnabled(it) ? '' : ' disabled'), onclick: () => { closeMenus(); it.action && it.action(); }
                }, h('span', {}, h('span', { class: 'mi-check' }, ''), it.label)));
              });
            });
            body.append(h('div', { class: 'menu-search' }, input), res);
            setTimeout(() => input.focus(), 30);
          }
        },
        SEP,
        item('Keyboard Shortcuts', null, () => Mac.System.showShortcuts(app)),
        item('macOS User Guide', null, () => Mac.System.confirm('The web edition help book is built in — try Help ▸ Keyboard Shortcuts for a cheat sheet.', 'OK')),
        item(app.name + ' Help', null, () => Mac.System.alert({ title: app.name + ' Help', message: app.help || (app.name + ' is fully functional in this web edition of macOS Tahoe. Explore its menus for everything it can do.'), icon: app.icon })),
      ]
    };
  }

  /* ---------------- bar render ---------------- */
  let currentSpec = [];
  function render() {
    const wm = Mac.wm, app = wm.apps[wm.activeApp] || wm.apps.finder;
    const left = document.getElementById('mb-left');
    left.innerHTML = '';
    const segs = [];
    appleMenu().forEach(s => segs.push(s));
    segs.push(stdAppMenu(app));
    if (app.menus) {
      try {
        const extra = app.menus(Mac.wm.topWin() && Mac.wm.topWin().appId === app.id ? Mac.wm.topWin() : null) || [];
        extra.forEach(s => segs.push(s));
      } catch (e) { console.error('menus of ' + app.id, e); }
    }
    segs.push(stdWindowMenu(app.id));
    segs.push(stdHelpMenu(app));
    currentSpec = segs;

    segs.forEach((sec) => {
      const el = h('div', { class: 'mb-item' + (sec.bold ? ' appname' : '') + (sec.apple ? ' mb-apple' : '') }, sec.apple ? '' : sec.title);
      el.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (openMenu && openMenu.item === el) { closeMenus(); return; }
        showMenu(el, sec.items);
      });
      el.addEventListener('pointerenter', () => { if (openMenu && openMenu.item !== el) showMenu(el, sec.items); });
      left.append(el);
    });
    collectAccels(segs);
  }

  /* ---------------- right-side extras ---------------- */
  function buildExtras() {
    const r = document.getElementById('mb-right');
    r.innerHTML = '';
    const S2 = Mac.Settings;
    // Focus (moon) indicator
    if (S2.get('focus')) r.append(h('div', { class: 'mb-item mb-extra', title: 'Do Not Disturb is on', html: Mac.GLYPH.moon }));
    r.append(
      mbExtra(Mac.GLYPH.battery, () => batterySpec(), 'Battery'),
      mbExtra(Mac.GLYPH.wifi, () => wifiSpec(), 'Wi-Fi'),
      mbExtra(Mac.GLYPH.search, null, 'Spotlight', () => Mac.System.openSpotlight()),
      mbExtra(Mac.GLYPH.cc, null, 'Control Center', () => Mac.System.toggleCC()),
      h('div', { class: 'mb-item', id: 'mb-clock', onclick: () => Mac.System.toggleNC() }, '')
    );
    tickClock();
  }
  function mbExtra(svg, specFn, title, clickFn) {
    const el = h('div', { class: 'mb-item mb-extra', title, html: svg });
    el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (clickFn) { closeMenus(); clickFn(); return; }
      if (openMenu && openMenu.item === el) { closeMenus(); return; }
      showMenu(el, specFn());
    });
    el.addEventListener('pointerenter', () => { if (openMenu && openMenu.item !== el && !clickFn) showMenu(el, specFn()); });
    return el;
  }
  function wifiSpec() {
    const S2 = Mac.Settings;
    const nets = ['HomeNet 5G', 'HomeNet', 'Coffee Shop Guest', 'xfinitywifi', 'iPhone (Mike)'];
    return [
      item('Wi-Fi', null, () => S2.set('wifi', !S2.get('wifi')), { checked: S2.get('wifi') }),
      SEP,
      ...nets.map(n => item(n, null, () => { S2.set('wifi', true); S2.set('wifiNetwork', n); render(); }, { checked: S2.get('wifi') && S2.get('wifiNetwork') === n })),
      SEP,
      item('Network Settings…', null, () => Mac.System.openSetting('Wi-Fi')),
    ];
  }
  function batterySpec() {
    const S2 = Mac.Settings, b = S2.get('battery') | 0, ch = S2.get('charging');
    return [
      item('Battery: ' + b + '%', null, null, { enabled: false }),
      item('Power Source: ' + (ch ? 'Power Adapter' : 'Battery'), null, null, { enabled: false }),
      SEP,
      item(ch ? 'Running on Battery' : 'Connect Charger', null, () => { S2.set('charging', !ch); S2.set('battery', Mac.clamp(b + (ch ? -9 : 11), 4, 100)); render(); }),
      SEP,
      item('Battery Settings…', null, () => Mac.System.openSetting('Battery')),
    ];
  }
  function tickClock() {
    const elc = document.getElementById('mb-clock');
    if (!elc) return;
    const d = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    elc.textContent = `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}  ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  setInterval(tickClock, 5000);

  /* ---------------- keyboard shortcuts ---------------- */
  document.addEventListener('keydown', e => {
    // global system keys handled in system.js (spotlight etc.) via 'syskey' capture
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    for (const acc of accelMap) {
      if (acc.key !== key) continue;
      if (!!e.shiftKey !== !!acc.mods.shift || !!e.altKey !== !!acc.mods.alt) continue;
      if (!acc.enabled()) continue;
      e.preventDefault();
      try { acc.action(); } catch (err) { console.error(err); }
      return;
    }
  });

  document.addEventListener('pointerdown', e => {
    if (openMenu && !e.target.closest('.menu') && !e.target.closest('.mb-item')) closeMenus();
  }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenus(); });

  Mac.Menus = { render, closeMenus, item, SEP, renderExtras: buildExtras };
  Bus.on('activeapp', render);
  Bus.on('windows', () => render());
  Bus.on('setting:focus', buildExtras);
})();
