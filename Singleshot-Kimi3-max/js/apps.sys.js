/* apps.sys.js — Terminal, Calculator, Calendar, Settings, App Store, Activity Monitor, Preview, Trash, Photo Booth */
'use strict';

// ============================================================ TERMINAL
regApp({
  id: 'terminal', name: 'Terminal', icon: 'terminal',
  size: { w: 660, h: 440 }, min: { w: 420, h: 260 },
  extraMenus: () => [{ title: 'Shell', items: [
    { label: 'New Window', sc: '⌘N', action: () => WM.open('terminal') },
    { label: 'Clear', sc: '⌘K', action: () => { const w = WM.topWindow(); if (w?.appId === 'terminal') w.api.clear(); } },
  ] }],
  build(win) {
    let cwd = FS.HOME;
    const hist = []; let hIdx = -1;
    const out = el('div', { class: 'term-out' });
    const inRow = el('div', { class: 'term-in-row' });
    const promptEl = el('span', { class: 'term-prompt' });
    const input = el('input', { class: 'term-input', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off' });
    inRow.append(promptEl, input);
    win.content.append(el('div', { class: 'term' }, out, inRow));
    const root = win.content.querySelector('.term');
    root.addEventListener('click', () => input.focus());
    setTimeout(() => input.focus(), 50);

    const short = (p) => p === FS.HOME ? '~' : p.startsWith(FS.HOME + '/') ? '~' + p.slice(FS.HOME.length) : p;
    const setPrompt = () => { promptEl.textContent = `mike@macbook-pro ${short(cwd)} % `; win.setTitle(`mike — zsh`); };
    const print = (txt, cls = '') => { out.append(el('div', { class: 'term-line ' + cls, text: txt })); root.scrollTop = root.scrollHeight; };
    const printHtml = (html) => { out.append(el('div', { class: 'term-line', html })); root.scrollTop = root.scrollHeight; };
    const echoCmd = (line) => print(promptEl.textContent + line, 'term-echo');

    function resolve(arg) { return FS.norm(arg || '', cwd); }
    function exec(line) {
      const tokens = (line.match(/"([^"]*)"|'([^']*)'|\S+/g) || []).map(t => t.replace(/^["']|["']$/g, ''));
      const [cmd, ...args] = tokens;
      const flags = args.filter(a => a.startsWith('-'));
      const plain = args.filter(a => !a.startsWith('-'));
      switch ((cmd || '').toLowerCase()) {
        case '': break;
        case 'help': print('Available commands:\n  ls cd pwd cat echo mkdir touch rm open clear whoami date\n  uname sw_vers say top history exit\n\nFiles are shared with Finder — try:  cat ~/Desktop/Welcome.txt'); break;
        case 'pwd': print(cwd); break;
        case 'whoami': print('mike'); break;
        case 'date': print(new Date().toString()); break;
        case 'clear': out.innerHTML = ''; break;
        case 'exit': case 'quit': case 'logout': win.close(); break;
        case 'history': hist.forEach((h, i) => print(`  ${i + 1}  ${h}`)); break;
        case 'uname': print(flags.includes('-a') ? 'Darwin macbook-pro.local 25.1.0 Darwin Kernel Version 25.1.0 ARM64' : 'Darwin'); break;
        case 'sw_vers': print('ProductName:\t\tmacOS\nProductVersion:\t\t26.1\nBuildVersion:\t\t25B78'); break;
        case 'sudo': print('sudo: nice try. This incident will be reported to the Demo Police.'); break;
        case 'top': case 'htop': print('Opening Activity Monitor…'); WM.open('activity'); break;
        case 'say': {
          const txt = plain.join(' ');
          if (window.speechSynthesis && txt) speechSynthesis.speak(new SpeechSynthesisUtterance(txt));
          else print('say: nothing to say');
          break;
        }
        case 'echo': print(plain.join(' ')); break;
        case 'ls': {
          const target = plain[0] ? resolve(plain[0]) : cwd;
          const node = FS.get(target);
          if (!node) return print(`ls: ${plain[0]}: No such file or directory`, 'term-err');
          const showHidden = flags.some(f => f.includes('a'));
          if (node.type === 'file') return print(node.name);
          const items = (FS.list(target) || []).filter(n => showHidden || !n.hidden);
          if (flags.some(f => f.includes('l'))) {
            items.forEach(n => print(`${n.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'}  1 mike  staff  ${String(FS.sizeOf(n)).padStart(8)} ${fmtDate(n.modified)} ${n.name}${n.type === 'dir' ? '/' : ''}`));
          } else {
            printHtml(items.map(n => n.type === 'dir' || n.type === 'app'
              ? `<span class="term-dir">${esc(n.name)}/</span>` : esc(n.name)).join('&nbsp;&nbsp;&nbsp;'));
          }
          break;
        }
        case 'cd': {
          const t = plain[0] ? resolve(plain[0]) : FS.HOME;
          const n = FS.get(t);
          if (!n) return print(`cd: no such file or directory: ${plain[0]}`, 'term-err');
          if (n.type !== 'dir') return print(`cd: not a directory: ${plain[0]}`, 'term-err');
          cwd = t; break;
        }
        case 'cat': {
          if (!plain[0]) return print('usage: cat <file>');
          const n = FS.get(resolve(plain[0]));
          if (!n) return print(`cat: ${plain[0]}: No such file or directory`, 'term-err');
          if (n.type !== 'file') return print(`cat: ${plain[0]}: Is a directory`, 'term-err');
          (n.content || '').split('\n').forEach(l => print(l));
          break;
        }
        case 'mkdir': {
          if (!plain[0]) return print('usage: mkdir <dir>');
          const p = FS.parent(resolve(plain[0]));
          FS.mkdir(p.path, p.name) || print(`mkdir: ${p.name}: File exists`, 'term-err');
          break;
        }
        case 'touch': {
          if (!plain[0]) return print('usage: touch <file>');
          const p = FS.parent(resolve(plain[0]));
          FS.write(p.path, p.name, '', 'text');
          break;
        }
        case 'rm': {
          if (!plain[0]) return print('usage: rm [-rf] <path>');
          const t = resolve(plain[0]);
          FS.toTrash(t) ? print(`(moved to Trash) ${t}`) : print(`rm: ${plain[0]}: No such file or directory`, 'term-err');
          break;
        }
        case 'open': {
          if (flags[0] === '-a' || plain[0] === '-a') {
            const name = plain[0] === '-a' ? plain.slice(1).join(' ') : plain.join(' ');
            const app = Object.values(Apps).find(a => a.name.toLowerCase() === name.toLowerCase() || a.id === name.toLowerCase());
            if (app) { WM.open(app.id); print(`Opening ${app.name}…`); } else print(`Unable to find application named '${name}'`, 'term-err');
          } else {
            const t = resolve(plain[0] || '.');
            const n = FS.get(t);
            if (!n) return print(`open: ${plain[0]}: No such file or directory`, 'term-err');
            openFile(t);
          }
          break;
        }
        default: print(`zsh: command not found: ${cmd}`, 'term-err');
      }
    }
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const line = input.value.trim();
        echoCmd(line);
        if (line) { hist.push(line); hIdx = hist.length; exec(line); }
        input.value = ''; setPrompt();
      } else if (e.key === 'ArrowUp') { if (hIdx > 0) { hIdx--; input.value = hist[hIdx] || ''; setTimeout(() => input.setSelectionRange(999, 999)); } e.preventDefault(); }
      else if (e.key === 'ArrowDown') { if (hIdx < hist.length) { hIdx++; input.value = hist[hIdx] || ''; } e.preventDefault(); }
      else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) { out.innerHTML = ''; e.preventDefault(); }
      else if (e.key === 'c' && e.ctrlKey) { echoCmd(input.value + '^C'); input.value = ''; }
    });
    print('Last login: ' + new Date().toLocaleString() + ' on ttys000');
    print('macOS Tahoe 26.1 — type "help" for commands.');
    setPrompt();
    win.api = { clear: () => out.innerHTML = '' };
  },
});

// ============================================================ CALCULATOR
regApp({
  id: 'calculator', name: 'Calculator', icon: 'calculator', single: true,
  size: { w: 300, h: 440 }, min: { w: 280, h: 420 },
  build(win) {
    const disp = el('div', { class: 'calc-disp', text: '0' });
    const grid = el('div', { class: 'calc-grid' });
    let cur = '0', acc = null, op = null, fresh = true;
    win.content.append(el('div', { class: 'calc' }, disp, grid));
    const keys = [
      ['AC', 'fn'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'],
      ['7'], ['8'], ['9'], ['×', 'op'],
      ['4'], ['5'], ['6'], ['−', 'op'],
      ['1'], ['2'], ['3'], ['+', 'op'],
      ['0', 'wide'], ['.', ''], ['=', 'op'],
    ];
    function update() { disp.textContent = cur.length > 10 ? Number(cur).toExponential(5) : cur; }
    function num(d) {
      if (fresh) { cur = d === '.' ? '0.' : d; fresh = false; }
      else if (d === '.' && cur.includes('.')) return;
      else cur = cur === '0' && d !== '.' ? d : cur + d;
      update();
    }
    function calc(a, b, o) { return o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : b === 0 ? NaN : a / b; }
    function setOp(o) {
      const v = parseFloat(cur);
      if (acc != null && !fresh) { acc = calc(acc, v, op); cur = String(+acc.toFixed(10)); }
      else acc = v;
      op = o; fresh = true; update();
    }
    function equals() {
      if (op == null || acc == null) return;
      cur = String(+calc(acc, parseFloat(cur), op).toFixed(10));
      acc = null; op = null; fresh = true; update();
    }
    function fn(k) {
      if (k === 'AC') { cur = '0'; acc = null; op = null; fresh = true; }
      else if (k === '±') cur = String(-parseFloat(cur) || 0);
      else if (k === '%') cur = String((parseFloat(cur) || 0) / 100);
      update();
    }
    keys.forEach(([k, cls]) => grid.append(el('button', {
      class: 'calc-key ' + (cls || ''), text: k,
      onclick: () => {
        if (/[0-9.]/.test(k)) num(k);
        else if (k === '=') equals();
        else if (['+', '−', '×', '÷'].includes(k)) setOp(k);
        else fn(k);
        beep(1200, 0.03, 'square', 0.02);
      },
    })));
    win.el.addEventListener('keydown', (e) => {
      const map = { '/': '÷', '*': '×', '-': '−', '+': '+', Enter: '=', '=': '=', Escape: 'AC', Backspace: 'bs', '%': '%' };
      if (/^[0-9.]$/.test(e.key)) num(e.key);
      else if (map[e.key] !== undefined) {
        e.preventDefault();
        const k = map[e.key];
        if (k === 'bs') { cur = cur.length > 1 ? cur.slice(0, -1) : '0'; update(); }
        else if (k === '=') equals();
        else if (['+', '−', '×', '÷'].includes(k)) setOp(k);
        else fn(k);
      }
      e.stopPropagation();
    });
    update();
  },
});

// ============================================================ CALENDAR
const CalendarStore = {
  KEY: 'tahoe-cal',
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.KEY)); } catch {}
    if (!this.data) {
      const t = new Date();
      const ds = (d) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + d).toDateString();
      this.data = {};
      this.data[ds(0)] = [{ id: uid(), title: 'Design sync', time: '10:00 AM' }, { id: uid(), title: 'Lunch with Sam', time: '12:30 PM' }];
      this.data[ds(2)] = [{ id: uid(), title: 'Tahoe demo day', time: '2:00 PM' }];
      this.data[ds(5)] = [{ id: uid(), title: 'Flight to Lake Tahoe', time: '8:15 AM' }];
      this.save();
    }
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.data)); },
  eventsFor(dateStr) { return (this.data[dateStr] || []).slice().sort((a, b) => a.time.localeCompare(b.time)); },
};
CalendarStore.load();
regApp({
  id: 'calendar', name: 'Calendar', icon: 'calendar', single: true,
  size: { w: 960, h: 600 }, min: { w: 720, h: 480 },
  build(win) {
    const today = new Date();
    let viewY = today.getFullYear(), viewM = today.getMonth();
    let selected = today.toDateString();
    const head = el('div', { class: 'cal-head' });
    const grid = el('div', { class: 'cal-grid' });
    const side = el('div', { class: 'cal-side' });
    win.toolbar.append(
      tbBtn('chevL', 'Previous month', () => { viewM--; if (viewM < 0) { viewM = 11; viewY--; } renderMonth(); }),
      tbBtn('chevR', 'Next month', () => { viewM++; if (viewM > 11) { viewM = 0; viewY++; } renderMonth(); }),
      el('button', { class: 'btn small', text: 'Today', onclick: () => { viewY = today.getFullYear(); viewM = today.getMonth(); selected = today.toDateString(); renderMonth(); } }),
      el('span', { class: 'tb-spacer' }),
      tbBtn('plus', 'Add event', () => addEvent()));
    win.content.append(el('div', { class: 'cal-app' },
      el('div', { class: 'cal-main' }, head, el('div', { class: 'cal-dow' }, ...['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => el('span', { text: d }))), grid),
      side));

    function renderMonth() {
      head.innerHTML = '';
      head.append(el('span', { class: 'cal-month', text: MONTHS[viewM] + ' ' + viewY }));
      win.setTitle(MONTHS[viewM] + ' ' + viewY);
      grid.innerHTML = '';
      const first = new Date(viewY, viewM, 1).getDay();
      const dim = new Date(viewY, viewM + 1, 0).getDate();
      const prevDim = new Date(viewY, viewM, 0).getDate();
      for (let i = 0; i < 42; i++) {
        let dNum, inMonth = true, cellDate;
        if (i < first) { dNum = prevDim - first + i + 1; inMonth = false; cellDate = new Date(viewY, viewM - 1, dNum); }
        else if (i - first >= dim) { dNum = i - first - dim + 1; inMonth = false; cellDate = new Date(viewY, viewM + 1, dNum); }
        else { dNum = i - first + 1; cellDate = new Date(viewY, viewM, dNum); }
        const ds = cellDate.toDateString();
        const cell = el('div', { class: 'cal-cell' + (inMonth ? '' : ' dim') + (ds === today.toDateString() ? ' today' : '') + (ds === selected ? ' sel' : '') },
          el('span', { class: 'cal-num', text: dNum }));
        CalendarStore.eventsFor(ds).slice(0, 3).forEach(ev => cell.append(el('div', { class: 'cal-ev', text: ev.title })));
        cell.onclick = () => { selected = ds; renderMonth(); };
        cell.ondblclick = () => { selected = ds; addEvent(); };
        cell.addEventListener('contextmenu', (e) => { e.preventDefault(); selected = ds; ctxMenu(e.clientX, e.clientY, [{ label: 'New Event', action: addEvent }]); });
        grid.append(cell);
      }
      renderSide();
    }
    function renderSide() {
      side.innerHTML = '';
      const d = new Date(selected);
      side.append(el('div', { class: 'cal-side-date' },
        el('b', { text: DAYS[d.getDay()] }), el('span', { text: MONTHS[d.getMonth()] + ' ' + d.getDate() })));
      const evs = CalendarStore.eventsFor(selected);
      if (!evs.length) side.append(el('div', { class: 'empty-hint', text: 'No Events' }));
      evs.forEach(ev => {
        const row = el('div', { class: 'cal-evrow' },
          el('span', { class: 'cal-evdot' }),
          el('span', {}, el('b', { text: ev.title }), el('i', { text: ev.time })),
          el('button', { class: 'mini-x', text: '×', onclick: () => { CalendarStore.data[selected] = CalendarStore.data[selected].filter(x => x.id !== ev.id); CalendarStore.save(); renderMonth(); } }));
        side.append(row);
      });
      side.append(el('button', { class: 'btn small full', text: '＋ New Event', onclick: addEvent }));
    }
    function addEvent() {
      const nameIn = el('input', { class: 'fld', placeholder: 'Event title' });
      const timeIn = el('input', { class: 'fld', placeholder: 'Time (e.g. 3:00 PM)', value: '12:00 PM' });
      modal({
        title: 'New Event — ' + selected, icon: 'calendar', width: 340,
        body: el('div', { class: 'dlg-col' }, nameIn, timeIn),
        buttons: [{ label: 'Cancel' }, { label: 'Add', primary: true, action: () => {
          if (!nameIn.value.trim()) return;
          (CalendarStore.data[selected] ||= []).push({ id: uid(), title: nameIn.value.trim(), time: timeIn.value.trim() || 'All day' });
          CalendarStore.save(); renderMonth();
        } }],
      });
    }
    renderMonth();
  },
});

// ============================================================ SYSTEM SETTINGS
regApp({
  id: 'settings', name: 'System Settings', icon: 'settings', single: true,
  size: { w: 780, h: 560 }, min: { w: 680, h: 480 },
  onArgs(win, args) { if (args.pane && win.api) win.api.select(args.pane); },
  build(win, args) {
    const PANES = [
      ['wifi', 'Wi-Fi', 'wifi'], ['bluetooth', 'Bluetooth', 'bt'], ['appearance', 'Appearance', 'moon'],
      ['wallpaper', 'Wallpaper', 'photos'], ['sound', 'Sound', 'music'], ['displays', 'Displays', 'cc'],
      ['focus', 'Focus', 'moon'], ['general', 'General', 'gearSm'],
    ];
    let cur = args.pane || 'appearance';
    const sideEl = el('div', {});
    const pane = el('div', { class: 'set-pane' });
    const search = el('input', { class: 'fld seek', placeholder: 'Search' });
    search.addEventListener('input', () => renderSide());
    win.toolbar.append(el('span', { class: 'set-search' }, search));
    win.content.append(el('div', { class: 'two-pane settings' }, el('div', { class: 'sidebar' }, sideEl), el('div', { class: 'main-pane' }, pane)));
    function renderSide() {
      const q = search.value.toLowerCase();
      sideEl.innerHTML = '';
      PANES.filter(([, n]) => n.toLowerCase().includes(q)).forEach(([id, name, icon]) =>
        sideEl.append(sideItem(icon, name, cur === id, () => select(id))));
    }
    function select(id) { cur = id; renderSide(); renderPane(); }
    win.api = { select };
    function toggleRow(label, sub, val, cb) {
      return el('div', { class: 'set-row' },
        el('span', {}, el('b', { text: label }), sub ? el('i', { text: sub }) : null),
        switchEl(val, cb));
    }
    function group(title, ...rows) { return el('div', { class: 'set-group' }, el('div', { class: 'set-g-title', text: title }), ...rows); }
    function renderPane() {
      pane.innerHTML = '';
      const title = PANES.find(p => p[0] === cur)[1];
      pane.append(el('h2', { class: 'set-title', text: title }));
      if (cur === 'wifi') {
        const w = Sys.get('wifi');
        pane.append(group('Wi-Fi', toggleRow('Wi-Fi', w.on ? 'Connected to ' + w.network : 'Off', w.on, (v) => { Sys.set('wifi', { ...Sys.get('wifi'), on: v }); renderPane(); })));
        if (w.on) {
          const nets = ['Tahoe Home 5G', 'Coffee Shop Guest', 'xfinitywifi', 'Pretty Fly for a Wi-Fi'];
          pane.append(group('Known Networks', ...nets.map(n => el('div', { class: 'set-row' },
            el('span', {}, el('b', { text: n }), el('i', { text: n === w.network ? 'Connected' : '' })),
            n === w.network ? el('span', { class: 'set-check', text: '✓ Connected' })
              : el('button', { class: 'btn small', text: 'Join', onclick: () => { Sys.set('wifi', { ...Sys.get('wifi'), network: n }); Notif.push('Wi-Fi', 'Network joined', n, 'settings'); renderPane(); } })))));
        }
      } else if (cur === 'bluetooth') {
        const bt = Sys.get('bt');
        pane.append(group('Bluetooth', toggleRow('Bluetooth', bt.on ? 'Discoverable as “MacBook Pro”' : 'Off', bt.on, (v) => { Sys.set('bt', { ...Sys.get('bt'), on: v }); renderPane(); })));
        if (bt.on) pane.append(group('My Devices', ...Object.entries(bt.devices).map(([name, conn]) => el('div', { class: 'set-row' },
          el('span', {}, el('b', { text: name }), el('i', { text: conn ? 'Connected' : 'Not Connected' })),
          el('button', { class: 'btn small', text: conn ? 'Disconnect' : 'Connect', onclick: () => { bt.devices[name] = !conn; Sys.set('bt', bt); renderPane(); } })))));
      } else if (cur === 'appearance') {
        const mk = (mode, label, bg) => el('button', { class: 'app-card' + (Sys.get('appearance') === mode ? ' sel' : ''), onclick: () => { Sys.set('appearance', mode); applyAppearance(); renderPane(); } },
          el('span', { class: 'app-thumb', style: { background: bg } }), el('span', { text: label }));
        pane.append(el('div', { class: 'app-cards' },
          mk('light', 'Light', 'linear-gradient(180deg,#f5f7fa,#dfe5ee)'),
          mk('dark', 'Dark', 'linear-gradient(180deg,#3a3a40,#1a1a1f)')));
        const accents = ['#0a84ff', '#bf5af2', '#ff2d55', '#ff453a', '#ff9f0a', '#ffd60a', '#30d158', '#8e8e93'];
        pane.append(el('div', { class: 'set-g-title', text: 'Accent color' }),
          el('div', { class: 'accents' }, accents.map(c => el('button', {
            class: 'accent-dot' + (Sys.get('accent') === c ? ' sel' : ''), style: { background: c },
            onclick: () => { Sys.set('accent', c); applyAppearance(); renderPane(); },
          }))));
      } else if (cur === 'wallpaper') {
        pane.append(el('div', { class: 'wall-grid' }, WALLPAPERS.map((wp, i) => el('button', {
          class: 'wall-thumb' + (Sys.get('wallpaper') === i ? ' sel' : ''), style: { background: wp.css },
          onclick: () => { Sys.set('wallpaper', i); applyWallpaper(); renderPane(); },
        }, el('span', { text: wp.name })))));
      } else if (cur === 'sound') {
        pane.append(group('Output',
          el('div', { class: 'set-row' }, el('span', {}, el('b', { text: 'MacBook Pro Speakers' }), el('i', { text: 'Output volume' })),
            (() => { const s = sliderRow(Sys.get('volume'), v => Sys.set('volume', v)); s.style.width = '180px'; return s; })()),
          toggleRow('Mute', 'Silence all sounds', Sys.get('muted'), v => Sys.set('muted', v)),
          el('div', { class: 'set-row' }, el('span', {}, el('b', { text: 'Play feedback' })),
            el('button', { class: 'btn small', text: 'Test Sound', onclick: () => chime() }))));
      } else if (cur === 'displays') {
        pane.append(group('Brightness',
          el('div', { class: 'set-row' }, el('span', {}, el('b', { text: 'Brightness' }), el('i', { text: 'Built-in Liquid Retina XDR display' })),
            (() => { const s = sliderRow(Sys.get('brightness'), v => { Sys.set('brightness', v); applyBrightness(); }); s.style.width = '200px'; return s; })()),
          toggleRow('True Tone', 'Automatically adapt display colors (demo)', true, () => {})));
        pane.append(group('Resolution', el('div', { class: 'set-row' }, el('span', {}, el('b', { text: '1512 × 982 Retina' }), el('i', { text: 'Default' })), el('span', { class: 'set-check', text: 'Active' }))));
      } else if (cur === 'focus') {
        pane.append(group('Focus',
          toggleRow('Do Not Disturb', 'Silence calls, alerts, and notifications', Sys.get('dnd'), v => Sys.set('dnd', v)),
          el('div', { class: 'set-row' }, el('span', {}, el('b', { text: 'Schedule' }), el('i', { text: 'No schedule set' })),
            el('button', { class: 'btn small', text: 'Add Schedule…', onclick: () => Notif.push('Focus', 'Schedule', 'Scheduled Focus is not part of this demo.', 'settings') }))));
      } else if (cur === 'general') {
        pane.append(group('About',
          ...[['Name', 'MacBook Pro'], ['Chip', 'Apple M4 Pro'], ['Memory', '24 GB'], ['Serial number', 'C02T4HV0XQ03'], ['macOS', 'Tahoe 26.1']]
            .map(([k, v]) => el('div', { class: 'set-row' }, el('b', { text: k }), el('span', { class: 'set-val', text: v })))),
          group('Software Update', el('div', { class: 'set-row' },
            el('span', {}, el('b', { text: 'macOS Tahoe 26.1' }), el('i', { text: 'Your Mac is up to date' })),
            el('button', { class: 'btn small', text: 'Check Now', onclick: (e) => { e.target.textContent = 'Checking…'; setTimeout(() => { e.target.textContent = 'Up to Date ✓'; Notif.push('Software Update', 'macOS is up to date', 'macOS Tahoe 26.1 is the newest version.', 'settings'); }, 1200); } }))));
      }
    }
    renderSide(); renderPane();
    win.setTitle('System Settings');
  },
});

// ============================================================ APP STORE
regApp({
  id: 'appstore', name: 'App Store', icon: 'appstore', single: true,
  size: { w: 940, h: 620 }, min: { w: 760, h: 500 },
  build(win) {
    const paid = {};
    const TABS = ['Discover', 'Arcade', 'Create', 'Work', 'Play', 'Develop', 'Updates'];
    let tab = 'Discover';
    const sideEl = el('div', {});
    const main = el('div', { class: 'store-main' });
    const sideIcons = { Discover: 'grid', Arcade: 'play', Create: 'compose', Work: 'listg', Play: 'next', Develop: 'gearSm', Updates: 'share' };
    win.content.append(el('div', { class: 'two-pane store' }, el('div', { class: 'sidebar' }, sideEl), el('div', { class: 'main-pane' }, main)));
    const STORE_APPS = [
      { id: 'pixelpals', name: 'Pixel Pals', cat: 'Graphics & Design', rating: '4.8', icon: 'photos', size: '88 MB' },
      { id: 'notewave', name: 'NoteWave', cat: 'Productivity', rating: '4.6', icon: 'notes', size: '42 MB' },
      { id: 'terminal', name: 'Terminal', cat: 'Developer Tools', rating: '4.9', icon: 'terminal', size: '6 MB' },
      { id: 'photobooth', name: 'Photo Booth', cat: 'Photo & Video', rating: '4.2', icon: 'photobooth', size: '21 MB' },
      { id: 'calculator', name: 'Calculator', cat: 'Utilities', rating: '4.7', icon: 'calculator', size: '3 MB' },
      { id: 'stickies', name: 'Stickies', cat: 'Utilities', rating: '4.4', icon: 'stickies', size: '2 MB' },
    ];
    function renderSide() {
      sideEl.innerHTML = '';
      TABS.forEach(t => sideEl.append(sideItem(sideIcons[t], t, tab === t, () => { tab = t; render(); })));
    }
    function getBtn(a) {
      const b = el('button', { class: 'btn small pill store-get', text: 'GET' });
      b.onclick = () => {
        if (b.dataset.busy) return;
        b.dataset.busy = '1'; b.textContent = ''; b.classList.add('loading');
        let p = 0;
        const iv = setInterval(() => {
          p += 25;
          if (p >= 100) {
            clearInterval(iv);
            b.classList.remove('loading'); b.textContent = 'OPEN'; b.dataset.busy = '';
            paid[a.id] = true;
            Notif.push('App Store', a.name, 'was installed successfully.', a.icon);
            b.onclick = () => Apps[a.id] ? WM.open(a.id) : Notif.push('App Store', a.name, 'This third-party app is not part of the demo.', a.icon);
          }
        }, 260);
      };
      if (paid[a.id]) { b.textContent = 'OPEN'; b.onclick = () => Apps[a.id] ? WM.open(a.id) : null; }
      return b;
    }
    function render() {
      main.innerHTML = '';
      if (tab === 'Updates') {
        main.append(el('h1', { class: 'store-h', text: 'Updates' }));
        [['Safari Technology Preview', 'Release 214'], ['Pixel Pals', '2.4 — Liquid Glass effects']].forEach(([n, v]) =>
          main.append(el('div', { class: 'store-row' }, iconEl('safari', 44),
            el('span', { class: 'store-txt' }, el('b', { text: n }), el('i', { text: v })),
            el('button', { class: 'btn small pill', text: 'UPDATE', onclick: (e) => { e.target.textContent = 'UPDATING…'; setTimeout(() => { e.target.textContent = 'OPEN'; Notif.push('App Store', n, 'was updated.', 'safari'); }, 1400); } }))));
        return;
      }
      main.append(el('div', { class: 'store-hero' },
        el('span', { class: 'store-hero-k', text: 'NOW AVAILABLE' }),
        el('h1', { text: 'macOS Tahoe 26.1' }),
        el('p', { text: 'Liquid Glass everywhere. Discover apps that shimmer.' }),
        el('button', { class: 'btn primary pill', text: 'Explore', onclick: () => WM.open('settings', { pane: 'general' }) })));
      main.append(el('h1', { class: 'store-h', text: tab === 'Discover' ? 'Apps We Love' : tab }));
      STORE_APPS.forEach(a => main.append(el('div', { class: 'store-row' },
        iconEl(a.icon, 44),
        el('span', { class: 'store-txt' }, el('b', { text: a.name }), el('i', { text: `${a.cat} · ★ ${a.rating} · ${a.size}` })),
        getBtn(a))));
    }
    renderSide(); render();
    win.setTitle('App Store');
  },
});

// ============================================================ ACTIVITY MONITOR
const PROC_NAMES = ['kernel_task', 'WindowServer', 'mds_stores', 'syslogd', 'coreaudiod', 'bluetoothd', 'distnoted', 'cfprefsd', 'loginwindow', 'spotlightd'];
regApp({
  id: 'activity', name: 'Activity Monitor', icon: 'activity', single: true,
  size: { w: 720, h: 520 }, min: { w: 560, h: 400 },
  build(win) {
    let tab = 'CPU';
    const tableEl = el('div', { class: 'act-table' });
    const foot = el('div', { class: 'act-foot' });
    const canvas = el('canvas', { class: 'act-canvas', width: 640, height: 90 });
    const cpuHist = [];
    const tabSeg = seg([['listg', 'CPU', 'CPU'], ['grid', 'Memory', 'Memory'], ['search', 'Energy', 'Energy'], ['cols', 'Disk', 'Disk'], ['share', 'Network', 'Network']].map(([i, k]) => [i, k, k]), 'CPU', (k) => { tab = k; render(); });
    win.toolbar.append(el('span', { class: 'act-title', text: 'All Processes' }), el('span', { class: 'tb-spacer' }), tabSeg);
    win.content.append(el('div', { class: 'act' }, tableEl, foot.append ? foot : foot));
    foot.append(el('div', { class: 'act-stats' },
      el('span', { id: 'act-sys' }), el('span', { id: 'act-user' }), el('span', { id: 'act-idle' })), canvas);

    function rows() {
      const procs = PROC_NAMES.map((n, i) => ({ name: n, pid: 80 + i * 7, sys: true, cpu: Math.random() * 3, mem: 40 + Math.random() * 300 }));
      WM.windows.forEach((w, i) => procs.push({ name: Apps[w.appId].name, pid: 400 + i, cpu: 2 + Math.random() * 14, mem: 120 + Math.random() * 800 }));
      return procs.sort((a, b) => b.cpu - a.cpu);
    }
    function render() {
      tableEl.innerHTML = '';
      tableEl.append(el('div', { class: 'act-head' },
        el('span', { text: 'Process Name' }), el('span', { text: 'PID' }),
        el('span', { text: tab === 'Memory' ? 'Memory' : '% CPU' }), el('span', { text: 'User' })));
      rows().forEach(p => tableEl.append(el('div', { class: 'act-row' },
        el('span', { class: 'act-name', text: p.name }), el('span', { text: String(p.pid) }),
        el('span', { class: 'act-bar-cell' },
          tab === 'Memory' ? `${p.mem.toFixed(0)} MB` : p.cpu.toFixed(1),
          tab !== 'Memory' ? el('span', { class: 'act-bar', style: { width: Math.min(100, p.cpu * 6) + '%' } }) : null),
        el('span', { text: p.sys ? 'root' : 'mike' }))));
      const total = Math.min(38, 6 + Math.random() * 22);
      cpuHist.push(total); if (cpuHist.length > 60) cpuHist.shift();
      const sys = total.toFixed(1), user = (total * 0.6).toFixed(1);
      const spans = foot.querySelectorAll('.act-stats span');
      if (spans[0]) { spans[0].textContent = `System: ${sys}%`; spans[1].textContent = `User: ${user}%`; spans[2].textContent = `Idle: ${(100 - total).toFixed(1)}%`; }
      draw();
    }
    function draw() {
      const c = canvas, x = c.getContext('2d');
      x.clearRect(0, 0, c.width, c.height);
      x.strokeStyle = 'rgba(120,130,145,0.25)'; x.lineWidth = 1;
      for (let gy = 0; gy < c.height; gy += 22) { x.beginPath(); x.moveTo(0, gy); x.lineTo(c.width, gy); x.stroke(); }
      x.strokeStyle = '#32d74b'; x.lineWidth = 2; x.beginPath();
      cpuHist.forEach((v, i) => { const px = i * (c.width / 60), py = c.height - (v / 45) * c.height; i ? x.lineTo(px, py) : x.moveTo(px, py); });
      x.stroke();
    }
    const iv = setInterval(render, 1500);
    const origClose = win.close.bind(win);
    win.close = () => { clearInterval(iv); origClose(); };
    Bus.on('win-close', (w) => { if (w === win) clearInterval(iv); });
    render();
    win.setTitle('Activity Monitor');
  },
});

// ============================================================ PREVIEW
regApp({
  id: 'preview', name: 'Preview', icon: 'preview',
  size: { w: 820, h: 580 }, min: { w: 480, h: 320 },
  build(win, args) {
    let path = args.path;
    let zoom = 1, rot = 0;
    const thumbs = el('div', { class: 'prev-thumbs' });
    const stage = el('div', { class: 'prev-stage' });
    const img = el('div', { class: 'prev-img' });
    stage.append(img);
    const folderImgs = () => {
      const dir = FS.parent(path).dir.children;
      return Object.values(dir).filter(n => n.type === 'file' && n.kind === 'image');
    };
    win.toolbar.append(
      tbBtn('search', 'Zoom out', () => { zoom = Math.max(0.4, zoom - 0.25); paint(); }),
      tbBtn('plus', 'Zoom in', () => { zoom = Math.min(4, zoom + 0.25); paint(); }),
      el('button', { class: 'btn small', text: 'Fit', onclick: () => { zoom = 1; rot = 0; paint(); } }),
      el('span', { class: 'tb-spacer' }),
      tbBtn('share', 'Share', () => Notif.push('Preview', 'Shared', path.split('/').pop() + ' sent via AirDrop.', 'preview')));
    win.content.append(el('div', { class: 'two-pane preview-app' },
      el('div', { class: 'sidebar prev-side' }, thumbs), el('div', { class: 'main-pane' }, stage)));
    function paint() {
      const n = FS.get(path);
      if (!n) { img.textContent = 'File not found'; return; }
      img.className = 'prev-img' + (n.kind === 'pdf' ? ' pdf-mode' : '');
      img.style.background = n.img || 'repeating-linear-gradient(45deg,#cfd6e0 0 14px,#e8edf4 14px 28px)';
      img.style.transform = `scale(${zoom}) rotate(${rot}deg)`;
      img.innerHTML = n.kind === 'pdf' ? '<div class="pdf-badge">PDF</div>' : '';
      win.setTitle(n.name);
      renderThumbs();
    }
    function renderThumbs() {
      thumbs.innerHTML = '';
      folderImgs().forEach(n => {
        const p = FS.parent(path).path + '/' + n.name;
        const t = el('button', { class: 'prev-thumb' + (p === path ? ' sel' : ''), style: { background: n.img } });
        t.onclick = () => { path = p; zoom = 1; rot = 0; paint(); };
        thumbs.append(t);
      });
    }
    paint();
  },
});

// ============================================================ TRASH
regApp({
  id: 'trash', name: 'Trash', icon: 'trash', single: true,
  size: { w: 700, h: 420 }, min: { w: 480, h: 300 },
  fileItems: () => [],
  build(win) {
    const list = el('div', { class: 'flist trash-list' });
    win.toolbar.append(el('span', { class: 'tb-spacer' }),
      el('button', { class: 'btn small', text: 'Empty', onclick: () => { if (FS.trash.length) Dock.confirmEmptyTrash(); } }));
    win.content.append(list);
    function render() {
      list.innerHTML = '';
      win.setTitle(FS.trash.length ? `Trash — ${FS.trash.length} item${FS.trash.length === 1 ? '' : 's'}` : 'Trash');
      if (!FS.trash.length) { list.append(el('div', { class: 'empty-hint', text: 'Trash is Empty' })); return; }
      FS.trash.forEach((t, i) => {
        const r = el('div', { class: 'flist-row' },
          el('span', { class: 'fl-name' }, fileIcon(t.node, 18), el('span', { text: t.node.name })),
          el('span', { class: 'fl-dim', text: 'From ' + t.from.replace('/Users/mike', '~') }),
          el('span', { class: 'fl-dim' }, el('button', { class: 'btn small', text: 'Put Back', onclick: () => { FS.restoreTrash(i); render(); } })));
        r.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          ctxMenu(e.clientX, e.clientY, [
            { label: 'Put Back', action: () => { FS.restoreTrash(i); render(); } },
            { separator: true },
            { label: 'Delete Immediately…', danger: true, action: () => modal({ title: 'Delete Immediately', body: `Delete “${esc(t.node.name)}” permanently?`, buttons: [{ label: 'Cancel' }, { label: 'Delete', danger: true, action: () => { FS.trash.splice(i, 1); FS.saveTrash(); render(); } }] }) },
          ]);
        });
        list.append(r);
      });
    }
    Bus.on('trash', () => { if (WM.windows.includes(win)) render(); });
    render();
  },
});

// ============================================================ PHOTO BOOTH
regApp({
  id: 'photobooth', name: 'Photo Booth', icon: 'photobooth', single: true,
  size: { w: 640, h: 520 }, min: { w: 480, h: 420 },
  build(win) {
    const effects = [['Normal', 'none'], ['Sepia', 'sepia(0.8)'], ['Mono', 'grayscale(1)'], ['Vivid', 'saturate(1.8) contrast(1.1)']];
    let effect = 'none';
    const video = el('video', { class: 'pb-video', autoplay: true, playsinline: true, muted: true });
    const fallback = el('div', { class: 'pb-fallback', hidden: true },
      glyphEl('camera', 42), el('p', { text: 'Camera not available' }), el('span', { text: 'Grant camera permission in your browser to use Photo Booth.' }));
    const stage = el('div', { class: 'pb-stage' }, video, fallback);
    const flash = el('div', { class: 'pb-flash' });
    const strip = el('div', { class: 'pb-strip' });
    const shutter = el('button', { class: 'pb-shutter', title: 'Take photo' });
    const effRow = el('div', { class: 'pb-effects' }, effects.map(([n, f]) =>
      el('button', { class: 'pb-eff' + (f === 'none' ? ' sel' : ''), text: n, onclick: (e) => { effect = f; video.style.filter = f; win.content.querySelectorAll('.pb-eff').forEach(x => x.classList.remove('sel')); e.target.classList.add('sel'); } })));
    win.content.append(el('div', { class: 'pb' }, stage, flash, strip, el('div', { class: 'pb-bottom' }, effRow, shutter, el('span', { class: 'pb-spacer' }))));
    let stream = null;
    navigator.mediaDevices?.getUserMedia?.({ video: true }).then(s => { stream = s; video.srcObject = s; }).catch(() => { video.hidden = true; fallback.hidden = false; });
    let captures = JSON.parse(localStorage.getItem('tahoe-captures') || '[]');
    function paintStrip() {
      strip.innerHTML = '';
      captures.slice(-6).forEach((c, i) => strip.append(el('img', { class: 'pb-thumb', src: c })));
    }
    shutter.onclick = () => {
      flash.classList.add('go'); beep(1500, 0.06, 'square', 0.04);
      setTimeout(() => flash.classList.remove('go'), 260);
      if (stream) {
        const c = document.createElement('canvas');
        c.width = video.videoWidth || 640; c.height = video.videoHeight || 480;
        const x = c.getContext('2d');
        x.filter = effect; x.drawImage(video, 0, 0);
        captures.push(c.toDataURL('image/jpeg', 0.7));
        localStorage.setItem('tahoe-captures', JSON.stringify(captures.slice(-12)));
        paintStrip();
        Notif.push('Photo Booth', 'Photo captured', 'Saved to this session’s film strip.', 'photobooth');
      }
    };
    Bus.on('win-close', (w) => { if (w === win && stream) stream.getTracks().forEach(t => t.stop()); });
    paintStrip();
    win.setTitle('Photo Booth');
  },
});
