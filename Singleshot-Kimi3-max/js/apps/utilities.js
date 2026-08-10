/* utilities.js — Calculator, Terminal, Activity Monitor, Clock, Weather */
(function () {
  const Mac = window.Mac, h = Mac.h;

  /* ============================ CALCULATOR ============================ */
  function openCalculator() {
    const win = Mac.wm.createWindow({
      app: 'calculator', title: 'Calculator', width: 278, height: 420, resizable: false, simpleBar: true,
      build(body, w) { buildCalc(body, w); },
    });
    return win;
  }
  function buildCalc(body, win) {
    let acc = 0, pending = null, typing = false, cur = '0', lastOp = null, lastVal = null;
    const disp = h('div', { class: 'calc-disp' }, '0');
    const fmt = v => {
      if (typeof v === 'string') v = parseFloat(v);
      if (isNaN(v)) return '0';
      if (Math.abs(v) >= 1e9 || (Math.abs(v) < 1e-6 && v !== 0)) return v.toExponential(4);
      const s = String(Math.round(v * 1e8) / 1e8);
      const [i, d] = s.split('.');
      return (i.length > 3 && i[0] !== '-' ? Number(i).toLocaleString('en-US') : i) + (d ? '.' + d : '');
    };
    const show = () => disp.textContent = fmt(cur);
    const applyOp = () => {
      const v = parseFloat(cur);
      if (pending == null) acc = v;
      else if (!typing && lastOp === pending) { /* repeat = */ }
      else {
        acc = pending === '+' ? acc + v : pending === '−' ? acc - v : pending === '×' ? acc * v : pending === '÷' ? (v === 0 ? NaN : acc / v) : acc;
      }
      cur = String(acc);
    };
    const press = key => {
      if (/^[0-9]$/.test(key)) { cur = typing ? cur + key : (key === '0' && cur === '0' ? '0' : key); typing = true; }
      else if (key === '.') { if (!typing) cur = '0'; if (!cur.includes('.')) cur += '.'; typing = true; }
      else if (key === 'AC') { acc = 0; pending = null; cur = '0'; typing = false; lastOp = null; }
      else if (key === '±') { cur = String(-parseFloat(cur)); }
      else if (key === '%') { cur = String(parseFloat(cur) / 100); typing = false; }
      else if (['+', '−', '×', '÷'].includes(key)) { if (typing) { applyOp(); lastVal = parseFloat(cur); } pending = key; lastOp = key; typing = false; }
      else if (key === '=') {
        if (pending && typing) { applyOp(); lastVal = parseFloat(cur); lastOp = pending; pending = null; }
        else if (pending) { cur = String(pending === '+' ? acc + acc : pending === '−' ? 0 : pending === '×' ? acc * acc : 1); pending = null; lastOp = null; }
        typing = false;
      }
      show(); litOps();
    };
    const grid = h('div', { class: 'calc-grid' });
    const buttons = [
      ['AC', 'fn'], ['±', 'fn'], ['%', 'fn'], ['÷', 'op'],
      ['7'], ['8'], ['9'], ['×', 'op'],
      ['4'], ['5'], ['6'], ['−', 'op'],
      ['1'], ['2'], ['3'], ['+', 'op'],
      ['0', 'zero'], ['.', ''], ['=', 'op'],
    ];
    const opBtns = {};
    buttons.forEach(([label, cls]) => {
      const b = h('button', { class: 'calc-btn ' + (cls || '') }, label);
      b.addEventListener('click', () => press(label));
      if (['+', '−', '×', '÷'].includes(label)) opBtns[label] = b;
      grid.append(b);
    });
    const litOps = () => Object.entries(opBtns).forEach(([k, b]) => b.classList.toggle('lit', pending === k && !typing));
    body.append(h('div', { class: 'calc-root' }, disp, grid));
    // keyboard
    win._keyHandler = e => {
      const map = { 'Enter': '=', '=': '=', 'Escape': 'AC', 'c': 'AC', 'Backspace': null, '/': '÷', '*': '×', '-': '−', '+': '+', '.': '.' };
      if (Mac.wm.activeApp !== 'calculator' || Mac.wm.topWin() !== win) return;
      let k = e.key;
      if (map.hasOwnProperty(k)) k = map[k];
      if (k === null) { if (typing && cur.length > 1) { cur = cur.slice(0, -1); show(); } e.preventDefault(); return; }
      if (/^[0-9]$/.test(k) || ['AC', '±', '%', '+', '−', '×', '÷', '='].includes(k)) { e.preventDefault(); press(k); }
      else if (k === '%') { e.preventDefault(); press('%'); }
    };
    document.addEventListener('keydown', win._keyHandler);
  }

  /* ============================ TERMINAL ============================ */
  function openTerminal() {
    const win = Mac.wm.createWindow({
      app: 'terminal', title: 'Terminal — zsh', width: 680, height: 460, minW: 420, minH: 260, simpleBar: true,
      build(body, w) { buildTerm(body, w); },
    });
    return win;
  }
  function buildTerm(body, win) {
    const root = h('div', { class: 'term-root' });
    body.append(root);
    let cwd = Mac.FS.HOME;
    const histArr = []; let hIdx = -1;
    const short = p => p === Mac.FS.HOME ? '~' : p.startsWith(Mac.FS.HOME) ? '~' + p.slice(Mac.FS.HOME.length) : p;
    const print = (txt, cls) => { if (txt === undefined) return; String(txt).split('\n').forEach(l => root.insertBefore(h('div', { class: 'term-line' + (cls ? ' ' + cls : '') }, l || ' '), inwrap)); root.scrollTop = root.scrollHeight; };
    print('Last login: ' + new Date(Date.now() - 3600000).toString().slice(0, 24) + ' on ttys000');
    print('Type "help" for the simulated shell’s commands.\n');
    const inEl = h('input', { class: 'term-in', spellcheck: 'false', autocomplete: 'off' });
    const promptEl = h('span', { class: 'term-prompt' });
    const promptStr = () => `${S_().get('username').toLowerCase()}@macbook-pro ${short(cwd) === '~' ? '~' : Mac.FS.base(short(cwd))} % `;
    let inwrap = h('div', { class: 'term-inwrap' }, promptEl, inEl);
    function S_() { return Mac.Settings; }
    promptEl.textContent = promptStr();
    root.append(inwrap);
    root.addEventListener('click', () => inEl.focus());
    setTimeout(() => inEl.focus(), 60);

    const resolve = arg => {
      if (!arg) return cwd;
      if (arg.startsWith('~')) arg = Mac.FS.HOME + arg.slice(1);
      return Mac.FS.norm(arg.startsWith('/') ? arg : cwd + '/' + arg);
    };
    const COMMANDS = {
      help: () => print('Simulated zsh — commands:\n  ls [path]      list files        cat <file>    show file\n  cd <path>      change directory  echo <text>   print text\n  pwd            current dir       open <app>    launch app (e.g. open safari)\n  touch <file>   create file       mkdir <dir>   create folder\n  rm <path>      delete            history       past commands\n  whoami         you               date          now\n  uname          Darwin            sw_vers       macOS version\n  clear          clear screen'),
      ls: a => {
        const p = resolve(a[0]);
        const nodes = Mac.FS.list(p);
        if (!Mac.FS.get(p)) return print('ls: ' + (a[0] || short(cwd)) + ': No such file or directory');
        print(nodes.map(n => n.type === 'folder' ? n.name + '/' : n.name).join('  '));
      },
      cd: a => {
        const p = resolve(a[0] || '~');
        const n = Mac.FS.get(p);
        if (n && n.type === 'folder') { cwd = p; promptEl.textContent = promptStr(); }
        else print('cd: no such file or directory: ' + (a[0] || ''));
      },
      pwd: () => print(cwd),
      cat: a => { const c = Mac.FS.read(resolve(a[0])); print(c == null ? 'cat: ' + (a[0] || '') + ': No such file' : c || '(empty file)'); },
      echo: a => print(a.join(' ')),
      date: () => print(new Date().toString()),
      whoami: () => print(Mac.Settings.get('username').toLowerCase()),
      uname: () => print('Darwin'),
      sw_vers: () => print('ProductName:\t\tmacOS\nProductVersion:\t\t26.1\nBuildVersion:\t\t25B5046k (Web)'),
      clear: () => { root.querySelectorAll('.term-line').forEach(el => el.remove()); },
      history: () => histArr.forEach((c, i) => print('  ' + (i + 1) + '  ' + c)),
      open: a => {
        if (!a[0]) return print('Usage: open <app-name>');
        const name = a.join(' ').toLowerCase();
        const app = Object.values(Mac.wm.apps).find(x => x.name.toLowerCase() === name || x.id === name);
        if (app) { Mac.launch(app.id); print('Opening ' + app.name + '…'); }
        else print('The application ' + a.join(' ') + ' does not exist.');
      },
      touch: a => { Mac.FS.write(resolve(a[0] || 'untitled.txt'), ''); },
      mkdir: a => { Mac.FS.mkdir(resolve(a[0] || '.'), a[1] || 'untitled folder'); },
      rm: a => { const p = resolve(a[0]); if (Mac.FS.exists(p)) { Mac.FS.trash(p); print('Moved to Trash: ' + Mac.FS.base(p)); } else print('rm: ' + (a[0] || '') + ': No such file or directory'); },
      sudo: () => print('mike is not in the sudoers file (this incident will be simulated).'),
      exit: () => win.close(),
      neofetch: () => print('macOS Tahoe 26.1 (Web)\nHost: Browser ' + navigator.userAgent.split(' ').slice(-1)[0] + '\nShell: zsh (sim)\nWM: wm.js\nIcons: 24 hand-drawn SVGs\nUptime: ' + Math.round(performance.now() / 1000) + 's'),
    };
    inEl.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        const line = inEl.value.trim();
        const echoEl = h('div', { class: 'term-line' }, ''); echoEl.innerHTML = `<span class="term-prompt">${Mac.esc(promptStr())}</span>${Mac.esc(line)}`;
        root.insertBefore(echoEl, inwrap);
        inEl.value = '';
        if (line) { histArr.push(line); hIdx = histArr.length; const [cmd, ...args] = line.split(/\s+/); const fn = COMMANDS[cmd]; if (fn) fn(args); else print('zsh: command not found: ' + cmd); }
        promptEl.textContent = promptStr();
        root.scrollTop = root.scrollHeight;
      } else if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) inEl.value = histArr[--hIdx] || ''; }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hIdx < histArr.length) inEl.value = ++hIdx === histArr.length ? '' : histArr[hIdx]; }
      else if (e.key === 'l' && (e.ctrlKey)) { e.preventDefault(); COMMANDS.clear(); }
    });
  }

  /* ============================ ACTIVITY MONITOR ============================ */
  const PROC_SEED = [
    ['WindowServer', 78, 802], ['kernel_task', 210, 1204], ['Finder', 41, 402], ['Dock', 12, 120], ['SystemUIServer', 22, 96],
    ['Spotlight', 8, 64], ['Safari', 88, 1771], ['Music', 31, 610], ['mds_stores', 5, 48], ['Terminal', 6, 132],
    ['CalendarAgent', 4, 88], ['bird', 2, 12], ['cloudd', 5, 42], ['loginwindow', 9, 76], ['distnoted', 3, 22],
    ['com.apple.WebKit.Networking', 15, 210], ['TextEdit', 7, 140], ['Activity Monitor', 11, 156],
  ];
  function openActivity() {
    let procs = PROC_SEED.map(([name, mem, threads], i) => ({ pid: 100 + i * 17, name, cpu: Math.random() * 14, mem: mem * 0.9 + Math.random() * mem * 0.2, alive: true }));
    let sel = null;
    const win = Mac.wm.createWindow({
      app: 'activity', title: 'Activity Monitor', width: 760, height: 520, minW: 560, minH: 320,
      build(body, w) { buildAM(body, w); },
      onClose() { clearInterval(win._amTimer); }
    });
    function buildAM(body, w) {
      const quitBtn = h('button', { class: 'tb-btn', html: Mac.GLYPH.x, title: 'Quit Process' });
      quitBtn.addEventListener('click', () => {
        if (!sel) return;
        const p = procs.find(x => x.pid === sel);
        Mac.System.confirm(`Are you sure you want to quit “${p.name}”?`, 'Quit').then(ok => { if (ok) { p.alive = false; sel = null; render(); } });
      });
      const toolbar = h('div', { class: 'toolbar' }, quitBtn, h('span', { style: { fontWeight: '600' } }, 'CPU'), h('div', { class: 'seg', style: { marginLeft: 'auto' } }, ['CPU', 'Memory', 'Energy', 'Disk', 'Network'].map((t, i) => h('button', { class: i === 0 ? 'on' : '' }, t))));
      const wrap = h('div', { class: 'am-table' });
      const foot = h('div', { class: 'am-foot' });
      body.append(toolbar, wrap, foot);
      const render = () => {
        wrap.innerHTML = '';
        wrap.append(h('div', { class: 'am-head' }, h('div', {}, 'Process Name'), h('div', {}, '% CPU'), h('div', {}, 'PID'), h('div', {}, 'Memory'), h('div', {}, 'Threads')));
        procs.filter(p => p.alive).sort((a, b) => b.cpu - a.cpu).forEach(p => {
          const row = h('div', { class: 'am-row' + (sel === p.pid ? ' sel' : '') },
            h('div', {}, p.name), h('div', {}, p.cpu.toFixed(1)), h('div', {}, p.pid), h('div', {}, Math.round(p.mem) + ' MB'), h('div', {}, Math.round(3 + p.mem / 8)));
          row.addEventListener('click', () => { sel = p.pid; render(); });
          wrap.append(row);
        });
        const sys = procs.filter(p => p.alive).reduce((a, p) => a + p.cpu, 0);
        const usr = sys * 0.42;
        foot.innerHTML = '';
        foot.append(
          h('div', {}, 'System: ', h('b', {}, (sys * 0.58).toFixed(1) + '%')),
          h('div', {}, 'User: ', h('b', {}, usr.toFixed(1) + '%')),
          h('div', {}, 'Idle: ', h('b', {}, Math.max(0, 100 - sys).toFixed(1) + '%')),
          h('div', {}, 'Processes: ', h('b', {}, procs.filter(p => p.alive).length)),
          h('div', {}, 'Memory Used: ', h('b', {}, (procs.filter(p => p.alive).reduce((a, p) => a + p.mem, 0) / 1024).toFixed(1) + ' GB')));
      };
      render();
      win._amTimer = setInterval(() => {
        if (win.closed) return;
        procs.forEach(p => { if (p.alive) p.cpu = Math.max(0, p.cpu + (Math.random() - 0.48) * 3); });
        procs[0].cpu = Math.max(4, procs[0].cpu);
        render();
      }, 1600);
    }
    return win;
  }

  /* ============================ CLOCK ============================ */
  function openClock() {
    const st = { tab: 'World Clock' };
    const win = Mac.wm.createWindow({
      app: 'clock', title: 'Clock', width: 640, height: 500, minW: 480, minH: 340,
      build(body, w) { buildClock(body, w, st); },
    });
    win._clkState = st;
    return win;
  }
  function buildClock(body, win, st) {
    const tabs = h('div', { class: 'clk-tabs' });
    const seg = h('div', { class: 'seg' });
    [['World Clock', 'globe'], ['Alarms', 'bell'], ['Stopwatch', 'clock'], ['Timer', 'clock']].forEach(([t]) => {
      const b = h('button', { class: st.tab === t ? 'on' : '' }, t);
      b.addEventListener('click', () => { st.tab = t; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.textContent === t)); renderClk(win); });
      seg.append(b);
    });
    tabs.append(seg);
    const bodyEl = h('div', { class: 'clk-body' });
    body.append(tabs, bodyEl);
    win._clkBody = bodyEl;
    renderClk(win);
  }
  function fmtMS(ms) {
    const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000), cs = Math.floor(ms % 1000 / 10);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(cs).padStart(2, '0');
  }
  function renderClk(win) {
    const st = win._clkState, b = win._clkBody;
    b.innerHTML = '';
    if (st.tab === 'World Clock') {
      const cities = [['Cupertino', 'America/Los_Angeles'], ['New York', 'America/New_York'], ['London', 'Europe/London'], ['Paris', 'Europe/Paris'], ['Tokyo', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney']];
      const tick = () => {
        b.querySelectorAll('[data-tz]').forEach(el => {
          el.textContent = new Date().toLocaleTimeString('en-US', { timeZone: el.dataset.tz, hour: 'numeric', minute: '2-digit' });
        });
      };
      cities.forEach(([name, tz]) => {
        const off = Math.round((new Date(new Date().toLocaleString('en-US', { timeZone: tz })) - Date.now()) / 3600000);
        b.append(h('div', { class: 'clk-city' },
          h('div', {}, h('div', { class: 'c-name' }, name), h('div', { class: 'c-sub' }, (off >= 0 ? '+' : '') + off + ' hours')),
          h('span', { class: 'c-time', 'data-tz': tz }, '')));
      });
      tick();
      clearInterval(win._clkTimer); win._clkTimer = setInterval(() => { if (st.tab === 'World Clock') tick(); }, 5000);
      return;
    }
    if (st.tab === 'Alarms') {
      let alarms = Mac.loadJSON('mac.clock.alarms', [{ time: '07:30', label: 'Wake up', on: false }, { time: '09:00', label: 'Standup', on: false }]);
      const save = () => Mac.saveJSON('mac.clock.alarms', alarms);
      alarms.forEach((a, i) => {
        const tog = h('div', { class: 'toggle' + (a.on ? ' on' : '') });
        tog.addEventListener('click', () => { a.on = !a.on; tog.classList.toggle('on', a.on); save(); armAlarms(); });
        b.append(h('div', { class: 'clk-city' }, h('div', {}, h('div', { class: 'c-name' }, a.time), h('div', { class: 'c-sub' }, a.label)), h('span', { style: { marginLeft: 'auto' } }, tog)));
      });
      const add = h('button', { class: 'btn', style: { marginTop: '12px' } }, 'Add Alarm');
      add.addEventListener('click', () => { alarms.push({ time: '08:00', label: 'Alarm', on: false }); save(); renderClk(win); armAlarms(); });
      b.append(add, h('div', { style: { marginTop: '10px', fontSize: '12px', color: 'var(--text2)' } }, 'Enabled alarms fire a notification at their time (within the minute).'));
      return;
    }
    if (st.tab === 'Stopwatch') {
      let running = false, t0 = 0, acc = 0, laps = [];
      const big = h('div', { class: 'clk-big' }, '00:00.00');
      const ctrl = h('div', { class: 'clk-ctrl' });
      const lapsEl = h('div', { class: 'clk-laps' });
      const startBtn = h('button', { class: 'btn primary', style: { borderRadius: '16px', padding: '6px 22px' } }, 'Start');
      const lapBtn = h('button', { class: 'btn', style: { borderRadius: '16px', padding: '6px 22px' } }, 'Lap');
      const total = () => acc + (running ? Date.now() - t0 : 0);
      const draw = () => big.textContent = fmtMS(total());
      startBtn.addEventListener('click', () => {
        running = !running;
        if (running) t0 = Date.now(); else acc = total();
        startBtn.textContent = running ? 'Stop' : 'Start';
        startBtn.classList.toggle('primary', !running);
        lapBtn.textContent = running ? 'Lap' : 'Reset';
      });
      lapBtn.addEventListener('click', () => {
        if (running) { laps.unshift(total()); lapsEl.innerHTML = ''; laps.forEach((l, i) => lapsEl.append(h('div', { class: 'clk-lap' }, h('span', {}, 'Lap ' + (laps.length - i)), h('span', {}, fmtMS(l))))); }
        else { running = false; acc = 0; laps = []; lapsEl.innerHTML = ''; startBtn.textContent = 'Start'; startBtn.classList.add('primary'); draw(); }
      });
      ctrl.append(lapBtn, startBtn);
      clearInterval(win._clkTimer);
      win._clkTimer = setInterval(() => { if (running) draw(); }, 33);
      b.append(big, ctrl, lapsEl);
      return;
    }
    // Timer
    let remain = 0, running = false, endAt = 0;
    const big = h('div', { class: 'clk-big' }, '05:00');
    const ctrl = h('div', { class: 'clk-ctrl' });
    const startBtn = h('button', { class: 'btn primary', style: { borderRadius: '16px', padding: '6px 22px' } }, 'Start');
    const setRow = h('div', { style: { display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', marginTop: '10px' } });
    const minInp = h('input', { class: 'inp', type: 'number', value: 5, min: 1, style: { width: '70px', textAlign: 'center' } });
    startBtn.addEventListener('click', () => {
      if (!running) {
        if (remain <= 0) remain = Math.max(1, +minInp.value || 5) * 60000;
        running = true; endAt = Date.now() + remain;
        startBtn.textContent = 'Pause';
        Mac.System.notify({ title: 'Clock', body: 'Timer started (' + Math.max(1, +minInp.value || 5) + ' min).', icon: 'clock' });
      } else {
        running = false; remain = Math.max(0, endAt - Date.now());
        startBtn.textContent = remain ? 'Resume' : 'Start';
      }
    });
    ctrl.append(startBtn, h('button', {
      class: 'btn', style: { borderRadius: '16px', padding: '6px 22px' }, onclick: () => { running = false; remain = 0; startBtn.textContent = 'Start'; big.textContent = String(Math.max(1, +minInp.value || 5)).padStart(2, '0') + ':00'; }
    }, 'Reset'));
    clearInterval(win._clkTimer);
    win._clkTimer = setInterval(() => {
      if (!running) return;
      const r = Math.max(0, endAt - Date.now());
      const m = Math.floor(r / 60000), s = Math.ceil(r % 60000 / 1000) % 60;
      big.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      if (r <= 0) {
        running = false; remain = 0; startBtn.textContent = 'Start';
        Mac.System.notify({ title: 'Timer Done', body: 'Your ' + Math.max(1, +minInp.value || 5) + ' minute timer has finished.', icon: 'clock', appId: 'clock' });
      }
    }, 500);
    setRow.append(h('span', {}, 'Minutes:'), minInp);
    b.append(big, ctrl, setRow);
  }
  function armAlarms() {
    clearInterval(Mac._alarmTimer);
    Mac._alarmTimer = setInterval(() => {
      const alarms = Mac.loadJSON('mac.clock.alarms', []);
      const now = new Date();
      const hm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      alarms.forEach(a => {
        if (a.on && a.time === hm && a._fired !== hm) { a._fired = hm; Mac.System.notify({ title: '⏰ Alarm: ' + a.label, body: 'It’s ' + a.time + '.', icon: 'clock', appId: 'clock' }); }
      });
    }, 20000);
  }

  /* ============================ WEATHER ============================ */
  function openWeather() {
    const st = { city: 'Cupertino' };
    const win = Mac.wm.createWindow({
      app: 'weather', title: 'Weather', width: 760, height: 560, minW: 560, minH: 420,
      build(body, w) { buildWx(body, w, st); },
    });
    win._wxState = st;
    return win;
  }
  function buildWx(body, win, st) {
    const side = h('div', { class: 'sidebar', style: { width: '160px' } });
    Object.keys(Mac.WeatherData.cities).forEach(c => {
      const el = h('div', { class: 'side-item' + (st.city === c ? ' sel' : '') }, h('span', { class: 'glyph', html: Mac.GLYPH['map-pin'] }), c);
      el.addEventListener('click', () => { st.city = c; renderWx(win); });
      side.append(el);
    });
    const root = h('div', { class: 'wx-root' });
    body.append(h('div', { class: 'split' }, side, h('div', { class: 'main-pane' }, root)));
    Object.assign(win, { _wxSide: side, _wxRoot: root });
    renderWx(win);
  }
  function renderWx(win) {
    const st = win._wxState, root = win._wxRoot;
    const d = Mac.WeatherData.current(st.city);
    win._wxSide.querySelectorAll('.side-item').forEach(el => el.classList.toggle('sel', el.textContent === st.city));
    root.innerHTML = '';
    const condEmoji = d.cond.includes('Sun') ? '☀️' : d.cond.includes('Rain') ? '🌧️' : d.cond.includes('Cloud') ? '⛅' : d.cond.includes('Humid') ? '🌤️' : '⛅';
    const hours = [];
    const nowH = new Date().getHours();
    for (let i = 0; i < 12; i++) {
      const hr = (nowH + i) % 24;
      const emoji = d.cond.includes('Rain') && (i === 2 || i === 3) ? '🌧️' : hr >= 20 || hr < 6 ? '🌙' : condEmoji;
      hours.push([i === 0 ? 'Now' : hr % 12 === 0 ? 12 : hr % 12, emoji, d.temp + Math.round(Math.sin(i / 3) * 3 + (Math.random() * 2 - 1))]);
    }
    const dows = ['Today'];
    for (let i = 1; i < 7; i++) { const t = new Date(Date.now() + i * 86400000); dows.push(t.toLocaleDateString('en-US', { weekday: 'short' })); }
    root.append(
      h('div', { class: 'wx-loc' },
        h('div', { class: 'wx-city' }, d.city),
        h('div', { class: 'wx-temp' }, d.temp + '°'),
        h('div', { class: 'wx-cond' }, d.cond + ' ' + condEmoji),
        h('div', { class: 'wx-hilo' }, 'H:' + d.hi + '°  L:' + d.lo + '°')),
      h('div', { class: 'wx-card' }, h('div', { class: 'wc-h' }, 'HOURLY FORECAST'),
        h('div', { class: 'wx-hours' }, hours.map(hh => h('div', { class: 'wx-hour' }, h('div', {}, hh[0] + (hh[0] === 'Now' ? '' : (nowH % 24 >= 12 !== (nowH + hours.indexOf(hh)) % 24 >= 12 ? '' : ''))), h('div', { class: 'e' }, hh[1]), h('div', {}, hh[2] + '°'))))),
      h('div', { class: 'wx-card wx-days' }, h('div', { class: 'wc-h' }, '7-DAY FORECAST'),
        d.wk.map((wk, i) => {
          const lo = d.lo + Math.round(Math.sin(i * 1.3) * 3), hi = d.hi + Math.round(Math.cos(i) * 4);
          const span = hi - lo || 1;
          return h('div', { class: 'd' }, h('span', { class: 'dn' }, dows[i]), h('span', { class: 'e' }, wk[1]), h('span', { class: 'lo' }, lo + '°'),
            h('div', { class: 'bar' }, h('i', { style: { left: '10%', width: Math.min(90, 20 + span * 4) + '%' } })), h('span', { class: 'hi' }, hi + '°'));
        })),
      h('div', { class: 'wx-card', style: { display: 'flex', gap: '22px', fontSize: '12px', flexWrap: 'wrap' } },
        h('div', {}, h('div', { class: 'wc-h' }, 'FEELS LIKE'), (d.temp - 1) + '°'),
        h('div', {}, h('div', { class: 'wc-h' }, 'HUMIDITY'), (48 + Mac.hash(d.city) % 30) + '%'),
        h('div', {}, h('div', { class: 'wc-h' }, 'WIND'), (6 + Mac.hash(d.city) % 9) + ' mph'),
        h('div', {}, h('div', { class: 'wc-h' }, 'UV INDEX'), d.cond.includes('Sun') ? '7 High' : '3 Moderate'))
    );
  }

  /* ============================ menus ============================ */
  const calcMenus = () => [{
    title: 'File', items: [Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'calculator') t.close(); })]
  }, Mac.Std.editMenu()];
  const termMenus = () => [{
    title: 'Shell', items: [
      Mac.Menus.item('New Window', '⌘N', () => openTerminal()),
      Mac.Menus.item('Clear', '⌘K', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'terminal') t.body.querySelectorAll('.term-line').forEach(el => el.remove()); }),
      Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'terminal') t.close(); }),
    ]
  }, Mac.Std.editMenu()];
  const amMenus = () => [{
    title: 'File', items: [Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'activity') t.close(); })]
  }, Mac.Std.editMenu()];
  const clkMenus = () => [{
    title: 'File', items: [Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'clock') t.close(); })]
  }, Mac.Std.editMenu()];
  const wxMenus = () => [{
    title: 'File', items: [Mac.Menus.item('Close Window', '⌘W', () => { const t = Mac.wm.topWin(); if (t && t.appId === 'weather') t.close(); })]
  }, Mac.Std.editMenu()];

  Mac.wm.register({ id: 'calculator', name: 'Calculator', icon: 'calculator', menus: calcMenus, help: 'A working calculator with keyboard support (digits, operators, Enter, Esc).', open: openCalculator });
  Mac.wm.register({ id: 'terminal', name: 'Terminal', icon: 'terminal', menus: termMenus, help: 'A simulated zsh sharing the virtual filesystem. Try: ls, cd Documents, cat Welcome.txt, open safari, sw_vers.', open: openTerminal });
  Mac.wm.register({ id: 'activity', name: 'Activity Monitor', icon: 'activity', menus: amMenus, help: 'Live simulated processes sorted by CPU. Select one and hit ✕ to “quit” it.', open: openActivity });
  Mac.wm.register({ id: 'clock', name: 'Clock', icon: 'clock', menus: clkMenus, help: 'World clock (live), alarms that notify, a stopwatch with laps, and a real countdown timer.', open: openClock });
  Mac.wm.register({ id: 'weather', name: 'Weather', icon: 'weather', menus: wxMenus, help: 'Simulated forecasts for four cities, with hourly and 7-day views.', open: openWeather });
})();
