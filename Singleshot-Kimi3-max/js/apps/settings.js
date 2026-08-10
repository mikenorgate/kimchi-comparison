/* settings.js — System Settings: live appearance / wallpaper / dock / system panes */
(function () {
  const Mac = window.Mac, h = Mac.h;
  const S = () => Mac.Settings;

  const PANES = [
    ['Wi-Fi', 'wifi'], ['Bluetooth', 'bt'], ['Network', 'globe'],
    null,
    ['General', 'gear'], ['Appearance', 'display'], ['Wallpaper', 'photo'], ['Desktop & Dock', 'desktop'], ['Control Center', 'cc'],
    null,
    ['Displays', 'display'], ['Sound', 'speaker'], ['Focus', 'moon'], ['Notifications', 'bell'],
    null,
    ['Battery', 'battery'], ['Lock Screen', 'lock'], ['Privacy & Security', 'lock'], ['Users & Groups', 'user'], ['Date & Time', 'clock'], ['Software Update', 'update'],
  ];

  function openSettings(args) {
    args = args || {};
    const st = { pane: args.pane || 'Wi-Fi', query: '' };
    const existing = Mac.wm.windowsFor('settings')[0];
    if (existing && !existing.closed) {
      existing._setState.pane = st.pane;
      renderSettings(existing);
      existing.focus();
      return existing;
    }
    const win = Mac.wm.createWindow({
      app: 'settings', title: 'System Settings', width: 880, height: 600, minW: 720, minH: 440, simpleBar: true,
      build(body, w) { buildSettings(body, w, st); },
    });
    win._setState = st;
    return win;
  }

  function buildSettings(body, win, st) {
    const side = h('div', { class: 'set-side' });
    const search = h('input', { class: 'inp', placeholder: 'Search' });
    search.addEventListener('input', Mac.debounce(() => { st.query = search.value.trim().toLowerCase(); renderSide(win); }, 160));
    side.append(search);
    const list = h('div');
    side.append(list);
    const main = h('div', { class: 'set-main' });
    body.append(h('div', { class: 'set-root' }, side, main));
    Object.assign(win, { _setSide: list, _setMain: main });
    renderSettings(win);
  }

  function renderSide(win) {
    const st = win._setState, list = win._setSide;
    list.innerHTML = '';
    PANES.forEach(p => {
      if (!p) { if (!st.query) list.append(h('div', { style: { height: '10px' } })); return; }
      const [name, ico] = p;
      if (st.query && !name.toLowerCase().includes(st.query)) return;
      const el = h('div', { class: 'set-item' + (st.pane === name ? ' sel' : '') },
        h('span', { class: 'set-icobg', style: { background: paneColor(name) }, html: Mac.GLYPH[ico] }), name);
      el.addEventListener('click', () => { st.pane = name; st.query = ''; win._setSide.parentElement.querySelector('input').value = ''; renderSettings(win); });
      list.append(el);
    });
    if (!list.children.length) list.append(h('div', { class: 'empty-pane', style: { height: '100px' } }, 'No Results'));
  }

  function paneColor(name) {
    return { 'Wi-Fi': '#0A84FF', 'Bluetooth': '#0A84FF', 'Network': '#8E8E93', 'General': '#8E8E93', 'Appearance': '#1D1D1F', 'Wallpaper': '#30B0C7', 'Desktop & Dock': '#1D1D1F', 'Control Center': '#8E8E93', 'Displays': '#0A84FF', 'Sound': '#FF375F', 'Focus': '#5E5CE6', 'Notifications': '#FF453A', 'Battery': '#30D158', 'Lock Screen': '#0A84FF', 'Privacy & Security': '#0A84FF', 'Users & Groups': '#8E8E93', 'Date & Time': '#8E8E93', 'Software Update': '#8E8E93' }[name] || '#8E8E93';
  }

  /* pane builders return elements */
  function group(...rows) { return h('div', { class: 'set-group' }, ...rows); }
  function row(label, control, sub) {
    return h('div', { class: 'set-row' },
      h('div', { class: 'sr-label' }, label, sub ? h('div', { class: 'sub' }, sub) : null), control);
  }
  function toggleFor(key, after) {
    const t = h('div', { class: 'toggle' + (S().get(key) ? ' on' : '') });
    t.addEventListener('click', () => { const v = !S().get(key); S().set(key, v); t.classList.toggle('on', v); if (after) after(v); });
    return t;
  }
  function sliderFor(key, fmt) {
    const r = h('input', { type: 'range', class: 'mac-range', min: 0, max: 100, value: Math.round((S().get(key) || 0) * 100), style: { width: '180px' } });
    const set = () => r.style.setProperty('--fill', r.value + '%');
    r.addEventListener('input', () => { S().set(key, r.value / 100); set(); });
    set(); return r;
  }
  function chevRow(label, paneName, win) {
    const el = h('div', { class: 'set-row', style: { cursor: 'default' } }, h('div', { class: 'sr-label' }, label), h('span', { class: 'chev' }, '›'));
    el.addEventListener('click', () => { win._setState.pane = paneName; renderSettings(win); });
    return h('div', {}, el);
  }

  const BUILDERS = {
    'Wi-Fi'(win) {
      const nets = ['HomeNet 5G', 'HomeNet', 'Coffee Shop Guest', 'xfinitywifi', 'iPhone (Mike)'];
      return [
        h('div', { class: 'set-title' }, 'Wi-Fi'),
        group(row('Wi-Fi', toggleFor('wifi', v => Mac.Menus.renderExtras()))),
        h('div', { style: { fontSize: '11px', color: 'var(--text2)', margin: '14px 0 6px' } }, S().get('wifi') ? 'My Networks' : 'Enable Wi-Fi to see networks'),
        ...(S().get('wifi') ? [group(...nets.map(n =>
          row(n + (n === S().get('wifiNetwork') ? '  ✓' : ''), h('span', { class: 'glyph', html: Mac.GLYPH.wifi }))))
        ] : []),
      ];
    },
    'Bluetooth'() {
      return [h('div', { class: 'set-title' }, 'Bluetooth'),
      group(row('Bluetooth', toggleFor('bluetooth'))),
      h('div', { style: { fontSize: '11px', color: 'var(--text2)', margin: '14px 0 6px' } }, 'My Devices'),
      group(row('AirPods Pro (2nd generation)', h('span', { class: 'chev' }, S().get('bluetooth') ? 'Connected' : 'Not Connected'), ' battery: 82%')),
      ];
    },
    'Network'(win) { return [h('div', { class: 'set-title' }, 'Network'), group(chevRow('Wi-Fi', 'Wi-Fi', win)), group(row('VPN', h('span', { class: 'chev' }, 'Not Connected'), 'Add VPN…')), group(row('Firewall', toggleFor('firewall')), )]; },
    'General'() {
      return [h('div', { class: 'set-title' }, 'General'),
      group(row('About', h('button', { class: 'btn', onclick: () => Mac.System.aboutThisMac() }, 'Open…'), 'Name, chip, memory, serial number'),
        chevRowInline('Software Update…')),
      group(row('Storage', h('span', {}, usedStorage()), '512 GB MacBook Air flash storage'), row('AirDrop', toggleFor('airdrop'))),
      group(row('Language & Region', h('span', {}, 'English — US', ), 'Preferred languages: English')),
      ];
      function chevRowInline(l) { const el = h('div', { class: 'set-row' }, h('div', { class: 'sr-label' }, l), h('span', { class: 'chev' }, '›')); el.addEventListener('click', () => openSettingsFromPane('Software Update')); return el; }
      function openSettingsFromPane(p) { const w = Mac.wm.windowsFor('settings')[0]; if (w) { w._setState.pane = p; renderSettings(w); } }
    },
    'Appearance'() {
      const themeWrap = h('div', { style: { display: 'flex', gap: '16px', padding: '14px' } });
      [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Auto']].forEach(([v, l]) => {
        const card = h('div', { style: { textAlign: 'center', cursor: 'default' } },
          h('div', {
            style: {
              width: '86px', height: '58px', borderRadius: '8px', border: S().get('theme') === v ? '2.5px solid var(--accent)' : '1px solid var(--hairline)',
              background: v === 'dark' ? 'linear-gradient(#333,#111)' : v === 'light' ? 'linear-gradient(#fff,#eee)' : 'linear-gradient(90deg,#fff 50%,#111 50%)',
              margin: '0 auto 6px', boxShadow: '0 2px 8px rgba(0,0,0,.12)'
            }
          }), h('div', { style: { fontSize: '12px' } }, l));
        card.addEventListener('click', () => { S().set('theme', v); refreshPane(); });
        themeWrap.append(card);
      });
      const accentWrap = h('div', { class: 'swatches' });
      Object.entries(Mac.System.ACCENTS).forEach(([name, col]) => {
        const s = h('div', { class: 'swatch' + (S().get('accent') === name ? ' sel' : ''), style: { background: col }, title: name });
        s.addEventListener('click', () => { S().set('accent', name); refreshPane(); });
        accentWrap.append(s);
      });
      function refreshPane() { const w = Mac.wm.windowsFor('settings')[0]; if (w) renderSettings(w); }
      return [h('div', { class: 'set-title' }, 'Appearance'),
      group(themeWrap),
      group(row('Accent color', accentWrap), row('Highlight color', h('span', {}, 'Accent color')), row('Sidebar icon size', h('span', {}, 'Medium')))];
    },
    'Wallpaper'() {
      const grid = h('div', { class: 'wp-picks' });
      Mac.System.WALLPAPERS.forEach(wp => {
        const el = h('div', { class: 'wp-pick' + (S().get('wallpaper') === wp.id ? ' sel' : '') + ' wp-' + wp.id }, h('div', { class: 'wp-name' }, wp.name));
        el.addEventListener('click', () => {
          S().set('wallpaper', wp.id);
          grid.querySelectorAll('.wp-pick').forEach(x => x.classList.remove('sel'));
          el.classList.add('sel');
        });
        grid.append(el);
      });
      return [h('div', { class: 'set-title' }, 'Wallpaper'), group(h('div', {}, grid)),
        group(row('Show on all displays', (() => { const t = h('div', { class: 'toggle on' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })()))];
    },
    'Desktop & Dock'() {
      const size = h('input', { type: 'range', class: 'mac-range', min: 36, max: 74, value: S().get('dockSize'), style: { width: '180px' } });
      const fillSize = () => size.style.setProperty('--fill', ((size.value - 36) / 38 * 100) + '%');
      size.addEventListener('input', () => { S().set('dockSize', +size.value); fillSize(); });
      fillSize();
      const mag = h('input', { type: 'range', class: 'mac-range', min: 10, max: 26, value: Math.round(S().get('dockMagScale') * 10), style: { width: '180px' } });
      const fillM = () => mag.style.setProperty('--fill', ((mag.value - 10) / 16 * 100) + '%');
      mag.addEventListener('input', () => { S().set('dockMagScale', mag.value / 10); fillM(); });
      fillM();
      const pos = h('div', { class: 'seg' }, ...[['left', 'Left'], ['bottom', 'Bottom'], ['right', 'Right']].map(([v, l]) => {
        const b = h('button', { class: S().get('dockPos') === v ? 'on' : '' }, l);
        b.addEventListener('click', () => { S().set('dockPos', v); pos.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
        return b;
      }));
      return [h('div', { class: 'set-title' }, 'Desktop & Dock'),
      group(row('Size', size), row('Magnification', h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center', width: '60%' } }, toggleFor('dockMag'), mag)), row('Position on screen', pos), row('Automatically hide and show the Dock', toggleFor('dockAutohide'))),
      group(row('Show items in Desktop folders', (() => { const t = h('div', { class: 'toggle on' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })()))];
    },
    'Control Center'() {
      return [h('div', { class: 'set-title' }, 'Control Center'),
      group(row('Wi-Fi', h('span', {}, 'Show in Control Center')), row('Bluetooth', h('span', {}, 'Show in Control Center')), row('AirDrop', h('span', {}, 'Show in Control Center'))),
      group(row('Focus', h('span', {}, S().get('focus') ? 'On' : 'Off')), row('Sound', h('span', {}, 'Show in Control Center')), row('Now Playing', h('span', {}, 'Show in Control Center')))];
    },
    'Displays'() { return [h('div', { class: 'set-title' }, 'Displays'), group(row('Brightness', sliderFor('brightness')), row('True Tone', (() => { const t = h('div', { class: 'toggle on' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })())), group(row('Resolution', h('span', {}, 'Default for display')), row('Refresh rate', h('span', {}, 'ProMotion 120 Hz × 0'))) ]; },
    'Sound'() { return [h('div', { class: 'set-title' }, 'Sound'), group(row('Output volume', sliderFor('volume')), row('Output device', h('span', {}, 'MacBook Speakers'))), group(row('Alert sound', h('span', {}, 'Glass (simulated)')), row('Play user interface sound effects', (() => { const t = h('div', { class: 'toggle on' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })()))]; },
    'Focus'() { return [h('div', { class: 'set-title' }, 'Focus'), group(row('Do Not Disturb', toggleFor('focus', v => Mac.Menus.renderExtras()), 'Silences notification banners')), h('div', { style: { fontSize: '11.5px', color: 'var(--text2)' } }, 'When Do Not Disturb is on, a moon icon appears in the menu bar and banners are suppressed.')]; },
    'Notifications'() { return [h('div', { class: 'set-title' }, 'Notifications'), group(row('Show previews', h('span', {}, 'Always')), row('Notification Center widgets', h('span', {}, 'Calendar, Weather, Clock, Music'))), h('div', { style: { fontSize: '11.5px', color: 'var(--text2)' } }, 'App notifications appear as banners top-right and collect in Notification Center (click the menu-bar clock).')]; },
    'Battery'() { return [h('div', { class: 'set-title' }, 'Battery'), group(row('Battery level', h('b', {}, S().get('battery') + '%'), 'Power source: ' + (S().get('charging') ? 'Power Adapter' : 'Battery')), row('Low Power Mode', (() => { const t = h('div', { class: 'toggle' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })())), group(row('Battery health', h('span', {}, '100% — Normal')), )]; },
    'Lock Screen'() { return [h('div', { class: 'set-title' }, 'Lock Screen'), group(row('Require password', h('span', {}, 'Immediately'), 'Any password works in the simulation')), group(row('Lock Screen clock', h('span', {}, 'Large')), )]; },
    'Privacy & Security'() { return [h('div', { class: 'set-title' }, 'Privacy & Security'), group(row('Location Services', (() => { const t = h('div', { class: 'toggle on' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })()), row('Camera access', h('span', {}, 'FaceTime (with permission)'))), group(row('Analytics & Improvements', h('span', {}, 'None — this simulation sends nothing anywhere'))), ]; },
    'Users & Groups'() { return [h('div', { class: 'set-title' }, 'Users & Groups'), group(row('', h('div', { style: { display: 'flex', gap: '10px', alignItems: 'center' } }, h('div', { html: Mac.avatar(S().get('username'), 40) }), h('div', {}, h('b', {}, S().get('username')), h('div', { style: { fontSize: '11px', color: 'var(--text2)' } }, 'Administrator — current user'))))), group(row('Automatic login', (() => { const t = h('div', { class: 'toggle on' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })())), ]; },
    'Date & Time'() { return [h('div', { class: 'set-title' }, 'Date & Time'), group(row('Date', h('span', {}, new Date().toLocaleDateString())), row('Time', h('span', {}, new Date().toLocaleTimeString())), row('Time zone', h('span', {}, Intl.DateTimeFormat().resolvedOptions().timeZone || 'Automatic'))), ]; },
    'Software Update'() {
      const box = h('div', { style: { textAlign: 'center', padding: '30px 10px' } },
        h('div', { style: { fontSize: '42px' } }, ''),
        h('div', { style: { fontWeight: '700', marginTop: '6px' } }, 'macOS Tahoe'),
        h('div', { style: { color: 'var(--text2)', fontSize: '12px', marginTop: '2px' } }, 'Version 26.1 (Web Edition)'),
        h('button', { class: 'btn', style: { marginTop: '14px' } }, 'Check for Updates'));
      box.querySelector('button').addEventListener('click', e => {
        const b = e.target; b.textContent = 'Checking…'; b.disabled = true;
        setTimeout(() => { b.textContent = 'macOS is up to date ✓'; }, 1600);
      });
      return [h('div', { class: 'set-title' }, 'Software Update'), group(box), group(row('Automatic updates', (() => { const t = h('div', { class: 'toggle on' }); t.addEventListener('click', () => t.classList.toggle('on')); return t; })()))];
    },
  };

  function usedStorage() {
    let bytes = 0;
    Mac.FS.walk((p, n) => { if (n.type === 'file') bytes += n.size || 0; });
    return Mac.fmtBytes(bytes) + ' of 512 GB used';
  }

  function renderSettings(win) {
    const st = win._setState;
    renderSide(win);
    const main = win._setMain;
    main.innerHTML = '';
    const b = BUILDERS[st.pane] || (() => [h('div', { class: 'empty-pane' }, 'Not available')]);
    b(win).forEach(el => main.append(el));
    // storage visualization appended on General
    if (st.pane === 'General') {
      const segs = [['Apps', '#8E8E93', 21], ['Documents', '#0A84FF', 47], ['Photos', '#F5D60A', 66], ['Music', '#E83B4F', 31], ['System Data', '#5E5CE6', 93], ['macOS', '#98989D', 42]];
      const totalGB = segs.reduce((a, s) => a + s[2], 0);
      const bar = h('div', { class: 'storage-bar' }, ...segs.map(sg => h('div', { style: { background: sg[1], width: (sg[2] / totalGB * 100) + '%' } })));
      const legend = h('div', { class: 'stor-legend' }, ...segs.map(sg => h('span', {}, h('i', { style: { background: sg[1] } }), sg[0] + ' (' + sg[2] + ' GB)')));
      main.append(h('div', { class: 'set-group' }, h('div', { class: 'set-row', style: { display: 'block' } },
        h('div', { style: { fontWeight: '700', marginBottom: '6px' } }, 'Macintosh HD'),
        bar, legend,
        h('div', { style: { fontSize: '11px', color: 'var(--text2)', marginTop: '8px' } }, usedStorage() + ' — the rest is delightfully free'))));
    }
    win.setTitle('System Settings');
  }

  Mac.System.openSetting = name => {
    const w = openSettings({ pane: name });
    return w;
  };

  Mac.wm.register({
    id: 'settings', name: 'System Settings', icon: 'settings', simpleBar: true,
    menus: () => [{
      title: 'File', items: [Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'settings') t.close(); })]
    }, Mac.Std.editMenu()],
    help: 'This is the one source of truth: appearance, wallpaper, dock, sound, Wi-Fi and Focus changes all apply live.',
    open: null,
  });
  Mac.wm.apps.settings.open = openSettings;
})();
