/* =====================================================================
   Tahoe Web — core: settings, windows, menus, dock, panels, power
   ===================================================================== */
'use strict';

/* ================= settings state ================= */
let S = load('tahoe_settings', {
  wallpaper: 0, appearance: 'auto', accent: '#0a84ff',
  wifi: true, bt: true, airdrop: true, dnd: false,
  volume: .6, brightness: 1,
  dockSize: 50, dockMag: true, dockMagSize: 1.7, dockAutohide: false, dockIndicators: true,
  siriOn: true, notifAllowed: {}, reduceMotion: false, contrast: false,
  userName: 'mike', fullName: 'Mike', computerName: "Mike's MacBook Pro",
  battery: 87, lowPower: false, charging: false,
  deskPos: {},
});
const saveS = () => save('tahoe_settings', S);

/* ================= audio ================= */
let AC = null, MASTER = null;
function audioCtx(){
  if (!AC){
    AC = new (window.AudioContext || window.webkitAudioContext)();
    MASTER = AC.createGain(); MASTER.gain.value = S.volume; MASTER.connect(AC.destination);
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(freq, dur=.15, type='sine', vol=.4, when=0){
  try{
    const ac = audioCtx(), t = ac.currentTime + when;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(MASTER);
    o.start(t); o.stop(t + dur + .05);
  }catch{}
}
function popSound(){ tone(880,.09,'sine',.22); tone(1320,.12,'sine',.16,.06); }
function clickSound(){ tone(1600,.04,'triangle',.05); }
function bootChime(){ tone(261.63,1.4,'sine',.5); tone(392,1.4,'sine',.4,.02); tone(523.25,1.6,'sine',.35,.04); }
function alarmBeep(){ for(let i=0;i<3;i++){ tone(1046,.16,'square',.25,i*.28); tone(784,.16,'square',.2,i*.28+.14); } }
function trashSound(){ tone(190,.18,'sawtooth',.18); tone(120,.22,'sawtooth',.12,.05); }

/* ================= app registry ================= */
const Apps = {};
const LAUNCH_ORDER = [];
function registerApp(id, def){
  Apps[id] = Object.assign({ single:true, inApps:true, size:{w:860,h:560}, minSize:{w:360,h:260} }, def, { id });
  LAUNCH_ORDER.push(id);
}
function populateApplicationsFolder(){
  const dir = fsn('/Applications');
  for (const id of LAUNCH_ORDER){
    if (!Apps[id].inApps) continue;
    dir.children[Apps[id].name + '.app'] = file('app', { appId:id, date: daysAgo(45) });
  }
}

/* ================= window manager ================= */
const WINS = [];
const HIDDEN_APPS = new Set();
const MRU = [];           // app ids, most-recent first
let Z = 30, ACTIVE = null, cascade = 0;

function winRectFor(def){
  const w = Math.min(def.size.w, innerWidth - 60), h2 = Math.min(def.size.h, innerHeight - 120);
  const n = cascade++ % 7;
  return { w:w, h:h2, x: clamp(90 + n*34, 20, Math.max(20, innerWidth - w - 20)), y: clamp(56 + n*26, 40, Math.max(40, innerHeight - h2 - 80)) };
}
function mruTouch(appId){ const i = MRU.indexOf(appId); if (i>=0) MRU.splice(i,1); MRU.unshift(appId); }

function openApp(appId, payload){
  const def = Apps[appId];
  if (!def){ console.warn('no app', appId); return null; }
  pushRecent('apps', def.name, { app:appId });
  if (def.single !== false){
    const existing = WINS.find(w => w.appId === appId);
    if (existing){
      existing.hidden = false; HIDDEN_APPS.delete(appId);
      if (existing.minimized) restoreWin(existing); else existing.el.style.display = 'flex';
      focusWin(existing);
      if (payload !== undefined) def.onReopen && def.onReopen(existing, payload);
      return existing;
    }
  }
  const r = winRectFor(def);
  const el = h('div', { class:'win win-enter', style:`left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;z-index:${++Z}` });
  const win = {
    id: uid(), appId, def, el, payload,
    minimized:false, maximized:false, hidden:false, prevRect:null, cleanup:[],
    onCleanup(fn){ this.cleanup.push(fn); },
    setTitle(t){ this.title = t; titleEl.textContent = t; document.title = t + ' — Tahoe Web'; },
    post(fn){ fn(this); },
  };
  win.title = def.name;

  const tl = h('div', { class:'tl-group' },
    h('button', { class:'tl close', title:'Close', html:'<svg viewBox="0 0 12 12"><path d="M3 3l6 6M9 3L3 9" stroke="currentColor" stroke-width="1.4"/></svg>', onclick:e=>{e.stopPropagation(); closeWin(win);} }),
    h('button', { class:'tl min', title:'Minimize', html:'<svg viewBox="0 0 12 12"><path d="M2.5 6h7" stroke="currentColor" stroke-width="1.4"/></svg>', onclick:e=>{e.stopPropagation(); minWin(win);} }),
    h('button', { class:'tl zoom', title:'Full Screen / Zoom', html:'<svg viewBox="0 0 12 12"><path d="M3 7.5V9.5h2M9 4.5V2.5H7M7.5 4.5L9 3M4.5 7.5L3 9" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>', onclick:e=>{e.stopPropagation(); zoomWin(win);} }),
  );
  const titleEl = h('div', { class:'win-title' }, def.name);
  const tb = h('div', { class:'win-titlebar' + (def.slim ? ' slim' : '') }, tl, titleEl);
  el.append(tb);
  win.body = h('div', { class:'win-body' });
  el.append(win.body);
  for (const dir of ['n','s','e','w','ne','nw','se','sw']) el.append(h('div', { class:'rz rz-'+dir, dataset:{dir} }));

  $('#windows').append(el);
  WINS.push(win);
  wireWinEvents(win);
  try { def.render(win, payload); } catch (err){ console.error(appId, err); win.body.append(h('div',{class:'empty'}, h('div',{class:'big'},'⚠️'), h('div',{},'This app encountered an error: '+err.message))); }
  focusWin(win); updateDock(); bounceDock(appId);
  mruTouch(appId);
  return win;
}
function runningApps(){ return [...new Set(WINS.map(w => w.appId))]; }

function closeWin(win){
  win.cleanup.forEach(fn => { try{ fn(); }catch{} });
  win.el.remove();
  const i = WINS.indexOf(win); if (i>=0) WINS.splice(i,1);
  if (ACTIVE === win){ const next = WINS[WINS.length-1]; next ? focusWin(next) : setActive(null); }
  updateDock();
}
function quitApp(appId){ WINS.filter(w=>w.appId===appId).slice().forEach(closeWin); HIDDEN_APPS.delete(appId); updateDock(); }

function setActive(win){
  ACTIVE = win;
  WINS.forEach(w => w.el.classList.toggle('active', w === win));
  updateMenubar();
}
function focusWin(win){
  win.el.style.zIndex = ++Z;
  mruTouch(win.appId);
  setActive(win);
}
function dockIconEl(appId){ return $('#dock .dk-item[data-app="'+appId+'"] .dk-icon'); }
function minWin(win){
  if (win.minimized) return;
  win.minimized = true;
  const ic = dockIconEl(win.appId);
  const target = ic ? ic.getBoundingClientRect() : { left: innerWidth/2, top: innerHeight, width: 50, height: 50 };
  const r = win.el.getBoundingClientRect();
  const dx = target.left + target.width/2 - (r.left + r.width/2);
  const dy = target.top + target.height/2 - (r.top + r.height/2);
  win.el.style.transition = 'transform .32s cubic-bezier(.4,0,.7,.4), opacity .32s';
  win.el.style.transformOrigin = 'center center';
  win.el.style.transform = `translate(${dx}px, ${dy}px) scale(.02, .04)`;
  win.el.style.opacity = '0';
  setTimeout(() => { win.el.style.display = 'none'; win.el.style.transition = ''; }, 330);
  setTimeout(() => updateDock(), 340);
  const next = WINS.filter(w => !w.minimized && w !== win && !w.hidden).pop();
  if (next && ACTIVE === win) focusWin(next); else if (ACTIVE === win) setActive(null);
}
function restoreWin(win){
  win.minimized = false; win.hidden = false;
  win.el.style.display = 'flex';
  requestAnimationFrame(() => {
    win.el.style.transition = 'transform .3s cubic-bezier(.2,.9,.3,1), opacity .25s';
    win.el.style.transform = 'none'; win.el.style.opacity = '1';
    setTimeout(() => { win.el.style.transition = ''; }, 310);
  });
  focusWin(win); updateDock();
}
function zoomWin(win){
  const el = win.el;
  el.style.transition = 'left .22s, top .22s, width .22s, height .22s';
  if (!win.maximized){
    win.prevRect = { x:el.offsetLeft, y:el.offsetTop, w:el.offsetWidth, h:el.offsetHeight };
    el.style.left = '0px'; el.style.top = '32px';
    el.style.width = '100vw';
    el.style.height = 'calc(100vh - 32px)';
    el.style.borderRadius = '0';
    win.maximized = true;
  } else {
    const p = win.prevRect;
    el.style.left = p.x+'px'; el.style.top = p.y+'px'; el.style.width = p.w+'px'; el.style.height = p.h+'px';
    el.style.borderRadius = '';
    win.maximized = false;
  }
  setTimeout(() => { el.style.transition = ''; }, 230);
}
function hideApp(appId){
  HIDDEN_APPS.add(appId);
  WINS.filter(w => w.appId === appId).forEach(w => { w.hidden = true; w.el.style.display = 'none'; });
  const next = WINS.filter(w => !w.hidden && !w.minimized && w.appId !== appId).pop();
  setActive(next || null); if (next) focusWin(next);
  updateDock();
}
function hideOthers(appId){
  WINS.filter(w => w.appId !== appId).forEach(w => { w.hidden = true; HIDDEN_APPS.add(w.appId); w.el.style.display='none'; });
  updateDock();
}
function appWindowVisible(win){ return !win.minimized && !win.hidden; }

function wireWinEvents(win){
  const el = win.el;
  el.addEventListener('pointerdown', () => { if (ACTIVE !== win) focusWin(win); }, true);
  // drag
  const tb = $('.win-titlebar', el);
  tb.addEventListener('pointerdown', e => {
    if (e.target.closest('.tl') || e.target.closest('.tb-extra') || win.maximized) return;
    const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
    el.classList.add('dragging');
    const mv = ev => { el.style.left = clamp(ox + ev.clientX - sx, 8 - el.offsetWidth + 80, innerWidth - 90) + 'px'; el.style.top = clamp(oy + ev.clientY - sy, 32, innerHeight - 60) + 'px'; };
    const up = () => { el.classList.remove('dragging'); removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
  tb.addEventListener('dblclick', e => { if (!e.target.closest('.tl')) zoomWin(win); });
  // resize
  el.addEventListener('pointerdown', e => {
    const rz = e.target.closest('.rz'); if (!rz) return;
    e.preventDefault();
    const dir = rz.dataset.dir;
    const sx = e.clientX, sy = e.clientY;
    const r = { x:el.offsetLeft, y:el.offsetTop, w:el.offsetWidth, h:el.offsetHeight };
    const min = win.def.minSize || { w:340, h:240 };
    el.classList.add('resizing');
    const mv = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      let { x, y, w, h:hh } = r;
      if (dir.includes('e')) w = Math.max(min.w, r.w + dx);
      if (dir.includes('s')) hh = Math.max(min.h, r.h + dy);
      if (dir.includes('w')){ w = Math.max(min.w, r.w - dx); x = r.x + r.w - w; }
      if (dir.includes('n')){ hh = Math.max(min.h, r.h - dy); y = r.y + r.h - hh; }
      el.style.left = x+'px'; el.style.top = y+'px'; el.style.width = w+'px'; el.style.height = hh+'px';
    };
    const up = () => { el.classList.remove('resizing'); removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  });
}

/* ================= menu engine ================= */
const menuLayer = $('#menu-layer');
let barMenuOpen = null;              // menubar title element currently expanded
let barMenuDef = null;

function closeMenus(){ menuLayer.classList.add('gone'); menuLayer.innerHTML=''; barMenuOpen = null; $$('.mb-item.open').forEach(x => x.classList.remove('open')); }
menuLayer.addEventListener('pointerdown', e => { if (e.target === menuLayer) closeMenus(); });

function makePopup(items, x, y){
  const pop = h('div', { class:'menu-popup' });
  pop.style.left = Math.min(x, innerWidth - 250) + 'px';
  pop.style.top = Math.min(y, innerHeight - Math.min(items.length, 18) * 26 - 20) + 'px';
  let subPop = null, subTimer = null;
  const closeSub = () => { subPop && subPop.remove(); subPop = null; };
  for (const it of (items || [])){
    if (!it || it.sep){ pop.append(h('div', { class:'menu-sep' })); continue; }
    const row = h('div', { class:'menu-item' + (it.disabled ? ' disabled' : '') },
      h('span', { class:'mi-check' }, it.checked ? '✓' : ''),
      it.icon ? h('span', { html: G(it.icon, 13), style:'display:flex' }) : '',
      h('span', { class:'mi-label' }, it.label),
      it.key ? h('span', { class:'mi-key' }, it.key) : '',
      it.sub ? h('span', { class:'mi-arrow', html: G('chevR', 11) }) : '',
    );
    if (!it.disabled){
      row.addEventListener('click', e => {
        e.stopPropagation();
        if (it.sub) return;
        closeMenus();
        it.action && it.action();
      });
      row.addEventListener('pointerenter', () => {
        closeSub(); clearTimeout(subTimer);
        if (it.sub){
          const r = row.getBoundingClientRect();
          subTimer = setTimeout(() => { subPop = makePopup(it.sub, r.right - 2, r.top - 5); menuLayer.append(subPop); }, 120);
        }
      });
    }
    pop.append(row);
  }
  pop.addEventListener('pointerdown', e => e.stopPropagation());
  return pop;
}
function openBarMenu(anchorEl, title, items){
  closeMenus();
  barMenuOpen = anchorEl; anchorEl.classList.add('open');
  menuLayer.classList.remove('gone');
  const r = anchorEl.getBoundingClientRect();
  menuLayer.append(makePopup(items, r.left - 5, 32));
}
function ctxMenu(items, x, y){
  closeMenus();
  menuLayer.classList.remove('gone');
  menuLayer.append(makePopup(items, x, y));
}

/* ---------- shortcut registry (rebuilt with menubar) ---------- */
let SHORTCUTS = {};
function collectKeys(items){
  for (const it of (items || [])){
    if (!it || it.sep) continue;
    if (it.sub){ collectKeys(it.sub); continue; }
    if (it.keyId && it.action && !it.disabled) SHORTCUTS[it.keyId] = it.action;
  }
}
function keyIdOf(e){
  let k = e.key.toLowerCase();
  if (k === ' ') k = 'space';
  let id = '';
  if (e.shiftKey) id += 'shift+';
  if (e.altKey) id += 'alt+';
  if (e.ctrlKey) id += 'ctrl+';
  if (e.metaKey) id += 'cmd+';
  return id + k;
}

/* ---------- standard menus ---------- */
function appleMenu(){
  const recentApps = (RECENT.apps||[]).slice(0,7).map(x => ({ label:x.name, icon:'app', action:() => openApp(x.app) }));
  const recentDocs = (RECENT.docs||[]).slice(0,7).map(x => ({ label:x.name, action:() => openFile(x.path) }));
  return [
    { label:'About This Mac', action: aboutMac },
    { sep:true },
    { label:'System Settings…', action: () => openApp('settings') },
    { label:'App Store…', action: () => openApp('appstore') },
    { sep:true },
    { label:'Recent Items', sub: [
        ...(recentApps.length ? [{ label:'Applications', disabled:true, icon:'app' }, ...recentApps, { sep:true }] : []),
        ...(recentDocs.length ? [{ label:'Documents', disabled:true }, ...recentDocs, { sep:true }] : []),
        ...(recentApps.length || recentDocs.length ? [{ label:'Clear Menu', action:() => { RECENT = {apps:[],docs:[]}; save('tahoe_recent', RECENT); } }] : [{ label:'No Recent Items', disabled:true }]),
    ]},
    { sep:true },
    { label:'Force Quit…', key:'⌥⌘⎋', keyId:'alt+cmd+escape', action: forceQuitDialog },
    { sep:true },
    { label:'Sleep', action: sleepMac },
    { label:'Restart…', action: () => confirmDlg('Are you sure you want to restart your computer?', 'Restart', () => restartMac()) },
    { label:'Shut Down…', action: () => confirmDlg('Are you sure you want to shut down your computer?', 'Shut Down', () => shutdownMac()) },
    { sep:true },
    { label:'Lock Screen', key:'⌃⌘Q', keyId:'ctrl+cmd+q', action: lockScreen },
    { label:`Log Out ${S.fullName}…`, key:'⇧⌘Q', keyId:'shift+cmd+q', action: () => confirmDlg('Are you sure you want to log out now?', 'Log Out', lockScreen) },
  ];
}
function appMenuFor(win){
  const def = win ? win.def : Apps.finder;
  const name = def.name;
  const items = [
    { label:'About ' + name, action: () => alertDlg(name, 'A Tahoe Web simulation of ' + name + '.') },
    { sep:true },
  ];
  if (def.prefs) items.push({ label:'Settings…', key:'⌘,', keyId:'cmd+,', action: () => def.prefs(win) });
  else items.push({ label:'Settings…', key:'⌘,', keyId:'cmd+,', action: () => openApp('settings') });
  items.push(
    { sep:true },
    { label:'Hide ' + name, key:'⌘H', keyId:'cmd+h', action: () => hideApp(def.id) },
    { label:'Hide Others', key:'⌥⌘H', keyId:'alt+cmd+h', action: () => hideOthers(def.id) },
    { label:'Show All', action: () => { HIDDEN_APPS.clear(); WINS.forEach(w => { if (!w.minimized){ w.hidden=false; w.el.style.display='flex'; } }); updateDock(); } },
    { sep:true },
    { label:'Quit ' + name, key:'⌘Q', keyId:'cmd+q', action: () => quitApp(def.id) },
  );
  if (def.id === 'finder') items[items.length-1].disabled = false;
  return items;
}
function editMenuItems(){
  const exec = cmd => () => { document.execCommand(cmd); };
  return [
    { label:'Undo', key:'⌘Z', keyId:'cmd+z', action: exec('undo') },
    { label:'Redo', key:'⇧⌘Z', keyId:'shift+cmd+z', action: exec('redo') },
    { sep:true },
    { label:'Cut', key:'⌘X', keyId:'cmd+x', action: exec('cut') },
    { label:'Copy', key:'⌘C', keyId:'cmd+c', action: exec('copy') },
    { label:'Paste', key:'⌘V', keyId:'cmd+v', action: () => navigator.clipboard?.readText().then(t => { if(t) document.execCommand('insertText', false, t); }).catch(()=>{}) },
    { label:'Select All', key:'⌘A', keyId:'cmd+a', action: exec('selectAll') },
  ];
}
function windowMenuItems(){
  const items = [
    { label:'Minimize', key:'⌘M', keyId:'cmd+m', action: () => ACTIVE && minWin(ACTIVE) },
    { label:'Zoom', action: () => ACTIVE && zoomWin(ACTIVE) },
    { sep:true },
    { label:'Bring All to Front', action: () => WINS.forEach(w => { if (w.minimized) restoreWin(w); else if (w.hidden){ w.hidden=false; w.el.style.display='flex'; } }) },
  ];
  const list = WINS.filter(w => appWindowVisible(w) || w.minimized);
  if (list.length){
    items.push({ sep:true });
    for (const w of list) items.push({ label:(w.minimized ? '◦ ' : '') + w.title, checked: w === ACTIVE, action: () => w.minimized ? restoreWin(w) : focusWin(w) });
  }
  return items;
}
function helpMenuItems(appName){
  return [
    { label:'Tahoe Web Help', action: () => showHelp() },
    { sep:true },
    { label: appName + ' Help', action: () => showHelp(appName) },
    { sep:true },
    { label:'Keyboard Shortcuts', action: () => showHelp('shortcuts') },
  ];
}

function currentMenus(){
  const win = ACTIVE;
  const def = win ? win.def : null;
  const menus = [
    { title:'apple', items: appleMenu() },
    { title: def ? def.name : 'Finder', cls:'appname', items: appMenuFor(win) },
  ];
  if (def && def.menus) menus.push(...def.menus(win));
  if (def && def.menus && !def.menus(win).some(m => m.title === 'Edit')) menus.push({ title:'Edit', items: editMenuItems() });
  menus.push({ title:'Window', items: windowMenuItems() });
  menus.push({ title:'Help', items: helpMenuItems(def ? def.name : 'Finder') });
  return menus;
}

function updateMenubar(){
  SHORTCUTS = {};
  const left = $('#mb-left');
  left.innerHTML = '';
  const menus = currentMenus();
  menus.forEach(m => collectKeys(m.items));
  for (const m of menus){
    const el = m.title === 'apple'
      ? h('div', { class:'mb-item', html: appleSVG('#fff'), style:'padding:3px 10px' })
      : h('div', { class:'mb-item' + (m.cls ? ' ' + m.cls : '') }, m.title);
    if (m.title === 'apple') el.style.width = '32px';
    el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      if (barMenuOpen === el){ closeMenus(); barMenuOpen = null; return; }
      openBarMenu(el, m.title, m.items);
    });
    el.addEventListener('pointerenter', () => { if (barMenuOpen && barMenuOpen !== el) openBarMenu(el, m.title, m.items); });
    if (m.title === 'apple') el.style.width = '32px';
    left.append(el);
  }
}

/* ================= menubar right side ================= */
function batterySVG(){
  const pct = S.battery, w = Math.round(18 * pct / 100);
  const fill = (S.lowPower || pct <= 20) ? '#ff9f0a' : '#fff';
  return `<svg viewBox="0 0 27 13" width="25" height="13"><rect x="0.5" y="0.5" width="21" height="12" rx="3.5" fill="none" stroke="rgba(255,255,255,.55)"/><rect x="2.5" y="2.5" width="${w}" height="8" rx="2" fill="${fill}"/><path d="M23.5 4.5v4a2.2 2.2 0 0 0 0-4z" fill="rgba(255,255,255,.55)"/>${S.charging?`<path d="M9 2L7 7h3l-2 4 6-6h-3l2-3z" fill="#ffd60a"/>`:''}</svg>`;
}
function wifiSVG(){
  const c = S.wifi ? '#fff' : 'rgba(255,255,255,.45)';
  return `<svg viewBox="0 0 17 13" width="17" height="13" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><path d="M1.5 5a10 10 0 0 1 14 0M4 7.8a6.4 6.4 0 0 1 9 0M6.6 10.4a2.8 2.8 0 0 1 1.9.8"/>${S.wifi?'':`<path d="M1 1.5l15 10" stroke="rgba(255,255,255,.75)"/>`}</svg>`;
}
function siriSVG(){
  return `<svg viewBox="0 0 18 18" width="17" height="17"><defs><linearGradient id="siriG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8ab8"/><stop offset=".5" stop-color="#c08cff"/><stop offset="1" stop-color="#7cd4ff"/></linearGradient></defs><circle cx="9" cy="9" r="7.4" fill="none" stroke="url(#siriG)" stroke-width="1.7" opacity=".95"/><circle cx="9" cy="9" r="4" fill="url(#siriG)" opacity=".75"/></svg>`;
}
function ccSVG(){ return `<svg viewBox="0 0 16 14" width="16" height="14" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="1" width="14" height="3.4" rx="1.7"/><rect x="1" y="9" width="14" height="3.4" rx="1.7"/><circle cx="5" cy="2.7" r="2.1" fill="#fff" stroke="none"/><circle cx="11" cy="10.7" r="2.1" fill="#fff" stroke="none"/></svg>`; }

function buildMenuExtras(){
  const right = $('#mb-right');
  right.innerHTML = '';
  const mk = (html, title, onclick, cls='') => {
    const el = h('div', { class:'mb-item ' + cls, title, html });
    if (onclick) el.addEventListener('pointerdown', e => { e.stopPropagation(); onclick(el); });
    right.append(el); return el;
  };
  mk(batterySVG(), 'Battery', el => openBarMenu(el, 'battery', [
    { label:`Battery: ${S.battery}%`, disabled:true },
    { label: S.charging ? 'Power Source: Power Adapter' : 'Power Source: Battery', disabled:true },
    { sep:true },
    { label:'Low Power Mode', checked:S.lowPower, action:() => { S.lowPower = !S.lowPower; saveS(); buildMenuExtras(); } },
    { sep:true },
    { label:'Battery Settings…', action:() => openApp('settings','battery') },
  ]));
  mk(wifiSVG(), 'Wi-Fi', el => openBarMenu(el, 'wifi', [
    { label:'Wi-Fi', checked:S.wifi, icon:'wifi', action:() => { S.wifi = !S.wifi; saveS(); applySettings(); } },
    { sep:true },
    ...(S.wifi ? [{ label:'HomeNet-5G', checked:true }, { label:'xfinitywifi' }, { label:'CoffeeShop Guest' }] : [{ label:'Not Connected', disabled:true }]),
    { sep:true },
    { label:'Wi-Fi Settings…', action:() => openApp('settings','wifi') },
  ]));
  mk(G('search', 15), 'Spotlight Search (⌘Space)', () => openSpotlight());
  if (S.siriOn) mk(siriSVG(), 'Siri', () => toggleSiri());
  mk(ccSVG(), 'Control Center', () => toggleCC());
  const clock = mk('', 'Notification Center', () => toggleNC(), 'mb-clock');
  clock.id = 'mb-clock';
  tickClock();
  applySettings();
}

let __clockTimer = null;
let __lastAlarmMin = '';
function tickClock(){
  const now = new Date();
  const el = $('#mb-clock'); if (el) el.textContent = fmtMenuClock(now);
  const lc = $('#lock-clock'); if (lc) lc.textContent = fmtTime(now).replace(/ (AM|PM)$/, '');
  const ld = $('#lock-date'); if (ld) ld.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  // alarms
  const hm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  if (hm !== __lastAlarmMin){
    __lastAlarmMin = hm;
    for (const a of ALARMS){
      if (a.on && a.time === hm){
        alarmBeep();
        notify({ appId:'clock', title:'⏰ ' + (a.label || 'Alarm'), body:`It's ${fmtTime(now)}.` });
      }
    }
    // calendar events (fire at :00 of their hour, once a day)
    for (const ev of CAL_EVENTS){
      if (ev.date === dISO(0) && ev.time && ev.time.slice(0,2) === String(now.getHours()).padStart(2,'0') && now.getMinutes() < 1){
        notify({ appId:'calendar', title:'Calendar — ' + ev.title, body:`Today at ${ev.time}` });
      }
    }
  }
  if (!__clockTimer) __clockTimer = setInterval(tickClock, 1000);
}

/* ================= dock ================= */
const PINNED = ['finder','launchpad','safari','mail','messages','facetime','maps','photos','calendar','notes','reminders','music','appstore','terminal','settings'];
let __dockBound = false;

function updateDock(){
  const dock = $('#dock');
  dock.innerHTML = '';
  dock.style.setProperty('--dk-size', S.dockSize + 'px');
  const mkItem = (appId) => {
    const def = Apps[appId];
    const running = WINS.some(w => w.appId === appId);
    const item = h('div', { class:'dk-item' + (running ? ' running' : '') + (HIDDEN_APPS.has(appId) ? ' hidden-app' : ''), dataset:{app:appId} },
      h('div', { class:'dk-icon', html: ICON(appId) }),
      h('div', { class:'dk-dot', style: S.dockIndicators ? '' : 'display:none' }),
      h('div', { class:'dk-tip' }, def.name),
    );
    item.addEventListener('click', () => {
      const wins = WINS.filter(w => w.appId === appId);
      if (!wins.length){ openApp(appId); return; }
      clickSound();
      HIDDEN_APPS.delete(appId);
      const anyVisible = wins.some(w => appWindowVisible(w));
      if (!anyVisible){
        wins.forEach(w => { w.hidden = false; if (w.minimized) restoreWin(w); else w.el.style.display = 'flex'; });
        focusWin(wins[0]);
      } else focusWin(wins[0]);
    });
    item.addEventListener('contextmenu', e => {
      e.preventDefault();
      const running2 = WINS.some(w => w.appId === appId);
      ctxMenu([
        { label:def.name, disabled:true },
        { sep:true },
        ...(running2 ? WINS.filter(w=>w.appId===appId).map(w => ({ label:w.title, action:() => focusWin(w) })) : []),
        { label: running2 ? 'Show' : 'Open', action: () => openApp(appId) },
        ...(running2 ? [{ label:'Hide', action:() => hideApp(appId) }] : []),
        { sep:true },
        { label:'Quit', disabled: !running2, action: () => quitApp(appId) },
      ], e.clientX, e.clientY - 10);
    });
    dock.append(item);
  };
  for (const id of PINNED) mkItem(id);
  const runningExtra = runningApps().filter(id => !PINNED.includes(id));
  if (runningExtra.length){ dock.append(h('div', { class:'dk-sep' })); runningExtra.forEach(mkItem); }
  dock.append(h('div', { class:'dk-sep' }));
  // Trash
  const trashKids = fskids(TRASH);
  const trash = h('div', { class:'dk-item', dataset:{app:'__trash'} },
    h('div', { class:'dk-icon', html: trashSVG(trashKids.length > 0) }),
    h('div', { class:'dk-dot', style:'visibility:hidden' }),
    h('div', { class:'dk-tip' }, 'Trash'),
  );
  trash.addEventListener('click', () => openApp('finder', TRASH));
  trash.addEventListener('contextmenu', e => {
    e.preventDefault();
    ctxMenu([
      { label:'Open', action:() => openApp('finder', TRASH) },
      { sep:true },
      { label:'Empty Trash', disabled: !trashKids.length, action: emptyTrash },
    ], e.clientX, e.clientY - 10);
  });
  dock.append(trash);
  if (!__dockBound){
    __dockBound = true;
    dock.addEventListener('mousemove', e => {
      if (!S.dockMag) return;
      for (const ic of $$('.dk-icon', dock)){
        const r = ic.getBoundingClientRect();
        if (r.width < 10) continue;
        const d = Math.abs(e.clientX - (r.left + r.width/2));
        const s = 1 + (S.dockMagSize - 1) * Math.max(0, 1 - d / 110);
        ic.style.transform = `scale(${s})`;
      }
    });
    dock.addEventListener('mouseleave', () => { $$('.dk-icon', dock).forEach(ic => ic.style.transform = ''); });
  }
  applyDockVisibility();
}
function applyDockVisibility(){
  document.body.classList.toggle('dock-hidden', S.dockAutohide);
  let edge = $('#dock-edge');
  if (!edge){ edge = h('div', { id:'dock-edge' }); $('#screen').append(edge); edge.addEventListener('pointerenter', () => { $('#dock-wrap').classList.add('peek'); }); $('#dock-wrap').addEventListener('pointerleave', () => { $('#dock-wrap').classList.remove('peek'); }); }
}
function bounceDock(appId, once=true){
  const ic = dockIconEl(appId);
  if (!ic) return;
  ic.classList.remove('bounce'); void ic.offsetWidth; ic.classList.add('bounce');
  setTimeout(() => ic.classList.remove('bounce'), once ? 1700 : 1);
}
function emptyTrash(){
  const kids = fskids(TRASH);
  if (!kids.length) return;
  confirmDlg(`Are you sure you want to permanently erase the ${kids.length} item(s) in the Trash? You can't undo this action.`, 'Empty Trash', () => {
    for (const k of kids) fsrm(k.path);
    trashSound(); updateDock();
    WINS.filter(w => w.appId === 'finder').forEach(w => w.def.onReopen && w.def.onReopen(w, 'refresh'));
  });
}

/* ================= notifications ================= */
let NOTIFS = load('tahoe_notifs', []);
function notify({ appId, title, body, payload, silent }){
  const n = { id:uid(), appId, title, body, ts:Date.now(), payload };
  NOTIFS.unshift(n); NOTIFS = NOTIFS.slice(0, 40); save('tahoe_notifs', NOTIFS);
  const allowed = S.notifAllowed[appId] !== false;
  if (allowed && !S.dnd && !silent){
    if (!$('#nc').classList.contains('gone')) renderNC();
    const b = h('div', { class:'banner' },
      h('div', { class:'b-icon', html: ICON(appId) }),
      h('div', { class:'grow' }, h('div', { class:'b-title' }, title), h('div', { class:'b-body' }, body || '')),
    );
    b.addEventListener('click', () => { dismiss(b); openApp(appId, payload); });
    $('#banners').append(b);
    popSound();
    setTimeout(() => dismiss(b), 4600);
  } else if (!$('#nc').classList.contains('gone')) renderNC();
  function dismiss(el){ el.classList.add('out'); setTimeout(() => el.remove(), 320); }
}
function clearNotifs(){ NOTIFS = []; save('tahoe_notifs', NOTIFS); renderNC(); }

/* ================= overlays: generic ================= */
function anyOverlayOpen(){ return ['cc','nc','spotlight','launchpad','mission','switcher'].some(id => !$('#'+id).classList.contains('gone')); }
function closeOverlays(except){
  for (const id of ['cc','nc','spotlight','launchpad','mission','switcher']){
    if (id === except) continue;
    $('#'+id).classList.add('gone');
  }
  $('#siri-bubble').classList.add('gone');
  closeMenus();
}
function bindOverlayDismiss(id){
  $('#'+id).addEventListener('pointerdown', e => { if (e.target.id === id) closeOverlays(); });
}

/* ================= control center ================= */
function toggleCC(){
  const cc = $('#cc');
  if (!cc.classList.contains('gone')){ cc.classList.add('gone'); return; }
  closeOverlays('cc'); renderCC(); cc.classList.remove('gone');
  setTimeout(() => addEventListener('pointerdown', function f(ev){ if (!cc.contains(ev.target) && !ev.target.closest('#mb-right')){ cc.classList.add('gone'); removeEventListener('pointerdown', f); } }), 0);
}
function ccPill(icon, on, label, sub, onclick){
  return h('div', { class:'cc-menu-item', onclick },
    h('div', { class:'cc-pill' + (on ? ' on' : ''), html: G(icon, 15) }),
    h('div', { class:'col' }, h('span', { class:'cc-big' }, label), h('span', { class:'cc-sub' }, sub)));
}
function renderCC(){
  const cc = $('#cc'); cc.innerHTML = '';
  const conn = h('div', { class:'cc-card wide' },
    ccPill('wifi', S.wifi, 'Wi-Fi', S.wifi ? 'HomeNet-5G' : 'Off', () => { S.wifi = !S.wifi; saveS(); applySettings(); renderCC(); }),
    h('div', { class:'divider', style:'margin:2px 4px' }),
    ccPill('bt', S.bt, 'Bluetooth', S.bt ? 'On' : 'Off', () => { S.bt = !S.bt; saveS(); renderCC(); buildMenuExtras(); }),
    h('div', { class:'divider', style:'margin:2px 4px' }),
    ccPill('airdrop', S.airdrop, 'AirDrop', S.airdrop ? 'Contacts Only' : 'Off', () => { S.airdrop = !S.airdrop; saveS(); renderCC(); }),
  );
  const focus = h('div', { class:'cc-card' }, h('span', { class:'cc-title' }, 'Focus'),
    ccPill('moon', S.dnd, 'Do Not Disturb', S.dnd ? 'On' : 'Off', () => { S.dnd = !S.dnd; saveS(); renderCC(); notify({ appId:'settings', title:'Focus', body:'Do Not Disturb ' + (S.dnd ? 'on' : 'off'), silent:true }); }));
  const dMode = h('div', { class:'cc-card' }, h('span', { class:'cc-title' }, 'Display'),
    ccPill('moon', effectiveDark(), 'Dark Mode', effectiveDark() ? 'On' : 'Off', () => { S.appearance = effectiveDark() ? 'light' : 'dark'; saveS(); applySettings(); renderCC(); }));
  const sound = h('div', { class:'cc-card' }, h('span', { class:'cc-title' }, 'Sound'),
    h('div', { class:'cc-slider' },
      h('div', { class:'lbl', html: G('mic', 13) + '<span>Output</span>' }),
      (() => { const r = h('input', { type:'range', min:0, max:100, value: Math.round(S.volume*100) });
        r.addEventListener('input', () => { S.volume = r.value/100; saveS(); if (MASTER) MASTER.gain.value = S.volume; });
        r.addEventListener('change', () => { tone(660,.1,'sine',.3); }); return r; })()));
  const disp = h('div', { class:'cc-card' }, h('span', { class:'cc-title' }, 'Display Brightness'),
    h('div', { class:'cc-slider' },
      h('div', { class:'lbl', html: G('sun', 13) + '<span>Brightness</span>' }),
      (() => { const r = h('input', { type:'range', min:20, max:100, value: Math.round(S.brightness*100) });
        r.addEventListener('input', () => { S.brightness = r.value/100; saveS(); applySettings(); }); return r; })()));
  const musicCard = h('div', { class:'cc-card wide' }, h('span', { class:'cc-title' }, 'Now Playing'),
    (window.__nowPlaying && window.__nowPlaying()
      ? h('div', { class:'cc-menu-item' }, h('div', { class:'cc-pill on', html: G('play', 13) }), h('div', { class:'col' }, h('span', { class:'cc-big' }, window.__nowPlaying() ), h('span', { class:'cc-sub' }, 'Music')))
      : h('div', { class:'cc-sub', style:'padding:4px 2px' }, 'Not Playing')));
  cc.append(conn, focus, dMode, sound, disp, musicCard);
}

/* ================= notification center ================= */
function toggleNC(){
  const nc = $('#nc');
  if (!nc.classList.contains('gone')){ nc.classList.add('gone'); return; }
  closeOverlays('nc'); renderNC(); nc.classList.remove('gone');
  setTimeout(() => addEventListener('pointerdown', function f(ev){ if (!nc.contains(ev.target) && !ev.target.closest('#mb-right')){ nc.classList.add('gone'); removeEventListener('pointerdown', f); } }), 0);
}
function renderNC(){
  const nc = $('#nc'); nc.innerHTML = '';
  const now = new Date();
  nc.append(h('div', { class:'nc-date' }, `${DAYS[now.getDay()]}<br>${MONTHS[now.getMonth()]} ${now.getDate()}`));
  // widgets
  const widgets = h('div', { class:'nc-widgets' });
  // weather widget
  const w0 = WEATHER_CITIES[0];
  widgets.append(h('div', { class:'nc-widget wide', onclick:() => openApp('weather') },
    h('div', { class:'row', style:'justify-content:space-between' },
      h('div', {}, h('div', { class:'cc-big' }, w0.name), h('div', { class:'cc-sub' }, w0.cond)),
      h('div', { style:'font-size:24px' }, w0.ic)),
    h('div', { style:'font-size:27px;font-weight:300;margin-top:4px' }, w0.t + '°')));
  // clock widget
  widgets.append(h('div', { class:'nc-widget', onclick:() => openApp('clock') },
    h('div', { class:'cc-sub' }, 'Clock'),
    h('div', { style:'font-size:24px;font-weight:600;margin-top:6px' }, fmtTime(now).replace(/ (AM|PM)$/,'\n$1').split('\n').map((x,i)=>h('div',{},x)))));
  // battery widget
  widgets.append(h('div', { class:'nc-widget' },
    h('div', { class:'cc-sub' }, 'Battery'),
    h('div', { style:'font-size:27px;font-weight:600;margin-top:6px;color:' + ((S.lowPower||S.battery<=20)?'#ff9f0a':'inherit') }, S.battery + '%'),
    h('div', { class:'cc-sub' }, S.charging ? 'Charging' : 'On Battery')));
  nc.append(widgets);
  // notifications
  const list = h('div', { class:'nc-notifs' });
  if (NOTIFS.length){
    list.append(h('button', { class:'nc-clear', onclick: clearNotifs }, 'Clear All'));
    for (const n of NOTIFS){
      const el = h('div', { class:'nc-notif' },
        h('div', { class:'b-icon', html: ICON(n.appId), style:'width:30px;height:30px' }),
        h('div', { class:'grow' },
          h('div', { class:'row', style:'justify-content:space-between' }, h('div', { class:'b-title' }, n.title), h('div', { class:'cc-sub' }, timeAgo(n.ts))),
          h('div', { class:'b-body' }, n.body || '')));
      el.addEventListener('click', () => { openApp(n.appId, n.payload); });
      list.append(el);
    }
  } else list.append(h('div', { class:'cc-sub', style:'text-align:center;padding:26px 0' }, 'No New Notifications'));
  nc.append(list);
}

/* ================= spotlight ================= */
const SPOT_PROVIDERS = [];
let __spotSel = 0, __spotItems = [];
function openSpotlight(){
  closeOverlays('spotlight');
  const sp = $('#spotlight'); sp.innerHTML = '';
  const input = h('input', { placeholder:'Spotlight Search', spellcheck:'false' });
  const results = h('div', { class:'sp-results gone' });
  sp.append(h('div', { class:'sp-box' },
    h('div', { class:'sp-input', html: G('search', 20) }), results));
  $('.sp-input', sp).append(input);
  sp.classList.remove('gone');
  input.focus();
  __spotSel = 0;
  input.addEventListener('input', () => { __spotSel = 0; drawSpot(input.value, results); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); __spotSel = Math.min(__spotItems.length - 1, __spotSel + 1); markSpot(results); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); __spotSel = Math.max(0, __spotSel - 1); markSpot(results); }
    else if (e.key === 'Enter'){ const it = __spotItems[__spotSel]; if (it){ closeOverlays(); it.action(); } }
    else if (e.key === 'Escape') closeOverlays();
  });
}
function markSpot(results){ $$('.sp-item', results).forEach((el, i) => el.classList.toggle('on', i === __spotSel)); }
function drawSpot(q, results){
  q = q.trim(); results.innerHTML = '';
  if (!q){ results.classList.add('gone'); __spotItems = []; return; }
  results.classList.remove('gone');
  __spotItems = [];
  const groups = [];
  // calculator
  if (/^[\d\s+\-*/().%^]+$/.test(q) && /[+\-*/%^]/.test(q)){
    try{
      const val = Function('"use strict"; return (' + q.replace(/\^/g,'**').replace(/%/g,'/100') + ')')();
      if (Number.isFinite(val)) groups.push(['Calculator', [{ title: q + ' = ' + (+val.toFixed(6)), sub:'Calculator', icon:'calculator', action:() => openApp('calculator', String(+val.toFixed(6))) }]]);
    }catch{}
  }
  // apps
  const apps = LAUNCH_ORDER.filter(id => Apps[id].inApps && Apps[id].name.toLowerCase().includes(q.toLowerCase())).slice(0,4)
    .map(id => ({ title: Apps[id].name, sub:'Application', icon:id, action:() => openApp(id) }));
  if (apps.length) groups.push(['Applications', apps]);
  // providers
  for (const p of SPOT_PROVIDERS){
    try{ const r = p.match(q); if (r && r.length) groups.push([p.name, r]); }catch{}
  }
  // files
  const files = fsFind(q).slice(0,6).map(f => ({ title: f.name, sub: f.path.replace('/Users/mike/', '~/'), fnode:f, action:() => openFile(f.path) }));
  if (files.length) groups.push(['Documents & Folders', files]);
  // web
  groups.push(['Web', [{ title:`Search the web for “${q}”`, sub:'Safari', icon:'safari', action:() => openApp('safari', 'search:' + q) }]]);
  for (const [cat, items] of groups){
    const catEl = h('div', {}, h('div', { class:'sp-cat' }, cat));
    for (const it of items){
      const ic = it.icon ? h('div', { class:'sp-ic', html: ICON(it.icon, 28) }) : (it.fnode ? h('div', { class:'sp-ic', html: FICON(it.title, it.fnode.node, 28) }) : h('div',{class:'sp-ic'}));
      const el = h('div', { class:'sp-item' }, ic, h('div', { class:'grow' }, h('div', { class:'b-title' }, it.title), h('div', { class:'b-sub' }, it.sub || '')));
      const idx = __spotItems.push(it) - 1;
      el.addEventListener('click', () => { closeOverlays(); it.action(); });
      el.addEventListener('pointerenter', () => { __spotSel = idx; markSpot(results); });
      catEl.append(el);
    }
    results.append(catEl);
  }
  __spotSel = 0; markSpot(results);
}

/* ================= launchpad ================= */
function openLaunchpad(){
  closeOverlays('launchpad');
  const lp = $('#launchpad'); lp.innerHTML = '';
  const input = h('input', { placeholder:'Search' });
  const grid = h('div', { class:'lp-grid' });
  lp.append(h('div', { class:'lp-search', html: G('search', 14) }, input), grid);
  lp.classList.remove('gone');
  input.focus();
  const draw = () => {
    const q = input.value.trim().toLowerCase(); grid.innerHTML = '';
    const apps = LAUNCH_ORDER.filter(id => Apps[id].inApps && (!q || Apps[id].name.toLowerCase().includes(q)));
    for (const id of apps){
      grid.append(h('div', { class:'lp-app', onclick:() => { closeOverlays(); openApp(id); } },
        h('div', { class:'lp-ic', html: ICON(id, 76) }), h('div', { class:'lp-name' }, Apps[id].name)));
    }
    for (const sid of INSTALLED){
      const a = STORE_APPS.find(x => x.id === sid); if (!a) continue;
      if (q && !a.name.toLowerCase().includes(q)) continue;
      grid.append(h('div', { class:'lp-app', onclick:() => { closeOverlays(); openApp('safari', a.url); } },
        h('div', { class:'lp-ic', style:`border-radius:16px;overflow:hidden;background:url('${coverArt(a.seed,152,152)}');background-size:cover` }), h('div', { class:'lp-name' }, a.name)));
    }
    if (!grid.children.length) grid.append(h('div', { class:'lp-name', style:'grid-column:1/-1;text-align:center;opacity:.7' }, 'No Results'));
  };
  input.addEventListener('input', draw);
  input.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlays(); });
  draw();
}

/* ================= mission control / app switcher ================= */
function missionControl(){
  const m = $('#mission');
  if (!m.classList.contains('gone')){ m.classList.add('gone'); return; }
  const wins = WINS.filter(w => appWindowVisible(w));
  closeOverlays('mission');
  m.innerHTML = '';
  if (!wins.length){ m.append(h('div', { class:'lp-name', style:'opacity:.8' }, 'No open windows')); }
  for (const w of wins){
    const tile = h('div', { class:'ms-tile', style:'width:230px;height:160px' },
      h('div', { class:'ms-head' }, w.title),
      h('div', { class:'ms-preview', html: ICON(w.appId, 56) }));
    tile.addEventListener('click', () => { m.classList.add('gone'); focusWin(w); });
    m.append(tile);
  }
  m.classList.remove('gone');
}
let __swIdx = 0, __swList = [];
function appSwitcher(cycle=1){
  const sw = $('#switcher');
  if (sw.classList.contains('gone')){
    __swList = [...new Set(MRU)].filter(id => WINS.some(w => w.appId === id));
    if (__swList.length < 2) return flashSwitcher();
    __swIdx = 0;
  }
  __swIdx = (__swIdx + cycle + __swList.length) % __swList.length;
  drawSwitcher();
  sw.classList.remove('gone');
}
function flashSwitcher(){ /* nothing to switch to */ }
function drawSwitcher(){
  const sw = $('#switcher'); sw.innerHTML = '';
  const box = h('div', { class:'sw-box' });
  __swList.forEach((id, i) => {
    const el = h('div', { class:'sw-app' + (i === __swIdx ? ' on' : '') }, h('div', { html: ICON(id, 52) }), h('span', {}, Apps[id].name));
    el.addEventListener('click', () => { sw.classList.add('gone'); openSwitcherApp(); });
    box.append(el);
  });
  sw.append(box);
}
function openSwitcherApp(){
  const id = __swList[__swIdx]; if (!id) return;
  HIDDEN_APPS.delete(id);
  const wins = WINS.filter(w => w.appId === id);
  const w = wins.find(x => x.minimized) || wins[0];
  if (!w) return;
  if (w.minimized) restoreWin(w); else { w.hidden = false; w.el.style.display = 'flex'; focusWin(w); }
}
function commitSwitcher(){ $('#switcher').classList.add('gone'); openSwitcherApp(); }

/* ================= force quit / about / help ================= */
function forceQuitDialog(){
  const apps = runningApps().filter(id => id !== 'finder');
  apps.unshift('finder');
  let sel = 0;
  const list = h('div', { class:'fq-list' });
  const draw = () => {
    list.innerHTML = '';
    apps.forEach((id, i) => {
      const el = h('div', { class:'fq-item' + (i === sel ? ' on' : ''), html: ICON(id, 22) + '<span>' + Apps[id].name + '</span>' });
      el.addEventListener('click', () => { sel = i; draw(); });
      list.append(el);
    });
  };
  draw();
  modal({
    title:'Force Quit Applications',
    custom: h('div', {}, list),
    buttons:[
      { label:'Cancel' },
      { label:'Force Quit', primary:true, action:() => {
        const id = apps[sel];
        if (id !== 'finder') quitApp(id);
        notify({ appId:'settings', title: Apps[id].name + ' quit', body:'The application was forced to quit.', silent:true });
      }},
    ], width:340,
  });
}
function chipSVG(){
  return `<svg viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="gChip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a4a55"/><stop offset="1" stop-color="#17171d"/></linearGradient></defs>
  ${[...Array(7)].map((_,i)=>`<rect x="${14+i*17}" y="8" width="6" height="12" rx="2" fill="#3f3f48"/><rect x="${14+i*17}" y="130" width="6" height="12" rx="2" fill="#3f3f48"/><rect x="8" y="${14+i*17}" width="12" height="6" rx="2" fill="#3f3f48"/><rect x="130" y="${14+i*17}" width="12" height="6" rx="2" fill="#3f3f48"/>`).join('')}
  <rect x="22" y="22" width="106" height="106" rx="14" fill="url(#gChip)" stroke="#5a5a66"/>
  <text x="75" y="70" text-anchor="middle" font-family="-apple-system,Helvetica" font-size="11" fill="#8e8e96" letter-spacing="2">APPLE</text>
  <text x="75" y="94" text-anchor="middle" font-family="-apple-system,Helvetica" font-size="24" font-weight="700" fill="#e8e8ee">M4 Pro</text></svg>`;
}
function aboutMac(){
  const body = h('div', { class:'about-mac' },
    h('div', { class:'chip', html: chipSVG() }),
    h('div', { style:'font-size:23px;font-weight:700' }, 'MacBook Pro'),
    h('div', { class:'muted', style:'font-size:12.5px;margin-bottom:12px' }, '14-inch, Nov 2024'),
    specRow('Chip', 'Apple M4 Pro'), specRow('Memory', '24 GB'),
    specRow('Serial number', 'C02XW0H4JHD3'), specRow('macOS', 'Tahoe 26.0'),
    h('div', { class:'row', style:'gap:8px;margin-top:16px' },
      h('button', { class:'btn', onclick:ev => { openApp('settings','about'); } }, 'More Info…'),
      h('button', { class:'btn', onclick:ev => { openApp('settings','update'); } }, 'Software Update…')),
    h('div', { class:'muted', style:'font-size:10.5px;margin-top:16px;max-width:380px' }, 'Regulatory Certification'),
  );
  function specRow(k, v){ return h('div', { class:'spec-row', style:'width:280px' }, h('span', { class:'k' }, k), h('span', { style:'font-weight:500' }, v)); }
  const w = openApp('about', body);
  return w;
}
function showHelp(topic){
  const rows = [
    ['Spotlight', '⌘ Space'], ['App Switcher', '⌘ Tab'], ['Mission Control', 'F3 or ⌃↑'],
    ['Quit app', '⌘ Q'], ['Close window', '⌘ W'], ['Minimize', '⌘ M'], ['Hide app', '⌘ H'],
    ['Force Quit', '⌥ ⌘ ⎋'], ['Lock Screen', '⌃ ⌘ Q'], ['Launchpad', 'Dock rocket'],
  ];
  const body = h('div', { class:'tips' },
    h('h2', { style:'margin-bottom:4px' }, topic && topic !== 'shortcuts' ? topic + ' Help' : 'Tahoe Web Help'),
    h('p', { class:'muted', style:'margin-bottom:12px;font-size:12.5px' }, 'Every menu in the menu bar works. Try the Apple menu → System Settings, or right-click the desktop.'),
    h('h4', { style:'margin-bottom:4px' }, 'Keyboard shortcuts'),
    ...rows.map(([k, v]) => h('div', { class:'trow' }, h('span', {}, k), h('span', {}, h('kbd', {}, v)))),
  );
  openApp('help', body);
}

/* ================= dialogs ================= */
function modal({ icon, title, msg, custom, buttons, input, width }){
  const root = $('#modal-root'); root.style.pointerEvents = 'auto';
  const inp = input ? h('input', { class:'m-text', placeholder: input.placeholder || '', value: input.value || '' }) : null;
  const backdrop = h('div', { class:'modal-backdrop' });
  const box = h('div', { class:'modal', style: width ? `width:${width}px` : '' },
    icon ? h('div', { class:'m-icon', html: icon }) : '',
    title ? h('div', { class:'m-title' }, title) : '',
    msg ? h('div', { class:'m-msg' }, msg) : '',
    custom || '', inp || '',
    h('div', { class:'m-btns' }, (buttons || [{ label:'OK', primary:true }]).map((b, i) =>
      h('button', { class:'btn' + (b.primary ? ' primary' : ''), onclick:() => { close(); b.action && b.action(inp ? inp.value : undefined); } }, b.label))));
  backdrop.append(box);
  backdrop.addEventListener('pointerdown', e => { if (e.target === backdrop) close(); });
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter'){ close(); const b = (buttons||[]).find(x=>x.primary); b && b.action ? b.action(inp.value) : null; } if (e.key === 'Escape') close(); });
  root.append(backdrop);
  setTimeout(() => (inp || $('.btn.primary', box) || $('.btn', box))?.focus(), 30);
  function close(){ backdrop.remove(); if (!root.children.length) root.style.pointerEvents = 'none'; }
  return close;
}
function confirmDlg(msg, okLabel, cb){ modal({ icon: ICON('finder', 56), title: msg, buttons:[{ label:'Cancel' }, { label: okLabel || 'OK', primary:true, action: cb }] }); }
function alertDlg(title, msg, icon){ modal({ icon: icon || ICON('tips', 56), title, msg, buttons:[{ label:'OK', primary:true }] }); }
function inputDlg(title, placeholder, cb, value){ modal({ title, input:{ placeholder, value }, buttons:[{ label:'Cancel' }, { label:'OK', primary:true, action: v => v && cb(v) }] }); }
function printDlg(what){
  const pr = h('div', { style:'width:120px;height:150px;margin:0 auto 14px;background:#fff;border-radius:4px;box-shadow:0 2px 12px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:5px;padding:14px 12px' },
    ...[90,60,80,70,40].map(w => h('div', { style:`height:5px;border-radius:2px;background:#d5d5da;width:${w}%` })));
  modal({
    title:'Print',
    custom: h('div', {}, pr, h('div', { class:'m-msg', style:'-webkit-user-select:text' }, `Printer: <b>Studio HP LaserJet</b><br>Copies: 1 · Layout: Portrait`)),
    buttons:[ { label:'Cancel' }, { label:'Print', primary:true, action:() => {
      setTimeout(() => notify({ appId:'settings', title:'Printing', body:`“${what || 'Document'}” was sent to Studio HP LaserJet.` }), 900);
    }}],
    width:320,
  });
}

/* ================= open files / get info ================= */
function openFile(path){
  const node = fsn(path);
  if (!node) return alertDlg('Finder', 'The item can’t be found.', ICON('finder', 56));
  pushRecent('docs', baseName(path), { path });
  if (node.type === 'folder') return openApp('finder', path);
  switch (node.kind){
    case 'app': return openApp(node.appId);
    case 'img': case 'pdf': return openApp('preview', path);
    case 'txt': case 'md': return openApp('textedit', path);
    case 'zip': return alertDlg('Archive Utility', `“${baseName(path)}” is a compressed archive. Extraction isn't supported in this simulation.`, ICON('finder', 56));
    default: return openApp('textedit', path);
  }
}
function getInfo(path){
  const node = fsn(path), name = baseName(path);
  if (!node) return;
  const kind = node.type === 'folder' ? 'Folder' : ({ app:'Application', img:'PNG image', txt:'Plain text', md:'Markdown', pdf:'PDF document', zip:'ZIP archive' }[node.kind] || 'Document');
  const sz = nodeSize(node);
  const body = h('div', { class:'pad', style:'width:280px' },
    h('div', { class:'col', style:'align-items:center;gap:8px;margin-bottom:12px' },
      h('div', { style:'width:64px;height:64px', html: FICON(name, node, 64) }),
      h('div', { style:'font-weight:700;font-size:13.5px;text-align:center' }, name)),
    ...[
      ['Kind', kind],
      ['Size', node.type === 'folder' ? sz + ' items' : fmtBytes(sz)],
      ['Where', parentPath(path).replace('/Users/mike', '~')],
      ['Modified', fmtDate(new Date(node.date || Date.now())) + ' ' + fmtTime(new Date(node.date || Date.now()))],
    ].map(([k, v]) => h('div', { class:'spec-row' }, h('span', { class:'k' }, k), h('span', { style:'text-align:right' }, v))),
  );
  openApp('getinfo', { body, title: name + ' Info' });
}

/* ================= desktop ================= */
let deskSel = null;
function renderDesktop(){
  const el = $('#desktop-icons'); el.innerHTML = '';
  const items = [{ path:'/', icon: hdSVG(), label:'Macintosh HD' }];
  for (const k of fskids(HOME + '/Desktop')) items.push({ path:k.path, icon: FICON(k.name, k.node, 52), label:k.name });
  items.forEach((it, i) => {
    const pos = S.deskPos[it.path];
    const d = h('div', { class:'dicon', style: pos ? `left:${pos[0]}px;top:${pos[1]}px` : `right:${Math.floor(i/6)*106}px;top:${(i%6)*106}px` },
      h('div', { class:'dimg', html: it.icon }), h('div', { class:'dname' }, it.label));
    d.addEventListener('click', e => { e.stopPropagation(); deskSel && deskSel.classList.remove('sel'); deskSel = d; d.classList.add('sel'); });
    d.addEventListener('dblclick', () => it.path === '/' ? openApp('finder', '/') : openFile(it.path));
    d.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      deskSel && deskSel.classList.remove('sel'); deskSel = d; d.classList.add('sel');
      ctxMenu([
        { label:'Open', action:() => it.path === '/' ? openApp('finder', '/') : openFile(it.path) },
        { sep:true },
        { label:'Get Info', key:'⌘I', action:() => getInfo(it.path) },
        ...(it.path !== '/' ? [{ label:'Move to Trash', action:() => { fsMoveToTrash(it.path); trashSound(); updateDock(); renderDesktop(); } },
        { label:'Rename', action:() => renameInline($('.dname', d), it.path, renderDesktop) }] : []),
        { sep:true },
        { label:'Clean Up', action:() => { S.deskPos = {}; saveS(); renderDesktop(); } },
      ], e.clientX, e.clientY);
    });
    // drag
    d.addEventListener('pointerdown', e => {
      const sx = e.clientX, sy = e.clientY, ox = d.offsetLeft, oy = d.offsetTop;
      let moved = false;
      const mv = ev => { moved = true; d.style.left = ox + ev.clientX - sx + 'px'; d.style.top = oy + ev.clientY - sy + 'px'; d.style.right = 'auto'; };
      const up = () => {
        removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
        if (moved){ S.deskPos[it.path] = [d.offsetLeft, d.offsetTop]; saveS(); }
      };
      addEventListener('pointermove', mv); addEventListener('pointerup', up);
    });
    el.append(d);
  });
}
function renameInline(labelEl, path, done){
  const old = baseName(path);
  const input = h('input', { value: old });
  labelEl.textContent = ''; labelEl.append(input);
  input.focus(); input.select();
  const commit = () => {
    const v = input.value.trim();
    if (v && v !== old && !fsn(parentPath(path)).children[v]) fsrename(path, v);
    done();
  };
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') done(); });
}
function desktopCtx(e){
  ctxMenu([
    { label:'New Folder', action:() => {
      const name = fsUniqueName(HOME + '/Desktop', 'untitled folder');
      fsadd(HOME + '/Desktop', name, folder({})); renderDesktop();
      WINS.filter(w => w.appId === 'finder').forEach(w => w.def.onReopen && w.def.onReopen(w, 'refresh'));
    }},
    { sep:true },
    { label:'Get Info', action:() => getInfo(HOME + '/Desktop') },
    { sep:true },
    { label:'Change Wallpaper…', action:() => openApp('settings', 'wallpaper') },
    { label:'Clean Up Icons', action:() => { S.deskPos = {}; saveS(); renderDesktop(); } },
    { sep:true },
    { label:'Sort By', sub:[ 'Name', 'Date Modified' ].map((x, i) => ({ label:x, action:() => { /* desktop auto-sorts only */ renderDesktop(); } })) },
  ], e.clientX, e.clientY);
}

/* ================= siri ================= */
function toggleSiri(){
  const b = $('#siri-bubble');
  if (!b.classList.contains('gone')){ b.classList.add('gone'); return; }
  b.innerHTML = '';
  const text = h('div', { class:'siri-text' }, 'Hi — I\'m Siri. Try “open Safari”, “what time is it”, or “tell me a joke”.');
  const input = h('input', { placeholder:'Ask Siri…' });
  b.append(h('div', { class:'siri-row' }, h('div', { class:'siri-orb' }), text), input);
  b.classList.remove('gone');
  input.focus();
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = input.value.trim().toLowerCase(); input.value = '';
    if (!q) return;
    tone(987,.12,'sine',.25); tone(1174,.14,'sine',.2,.1);
    let a = null;
    const appHit = Object.entries(Apps).find(([id, d]) => d.inApps && (q.includes(d.name.toLowerCase()) || q.includes(id)));
    if (q.startsWith('open') && appHit){ a = `Opening ${appHit[1].name}.`; setTimeout(() => openApp(appHit[0]), 400); }
    else if (/time|clock/.test(q)) a = `It's ${fmtTime()}.`;
    else if (/date|day/.test(q)) a = `Today is ${DAYS[new Date().getDay()]}, ${fmtDate()}.`;
    else if (/weather/.test(q)){ const w = WEATHER_CITIES[0]; a = `It's ${w.t}° and ${w.cond.toLowerCase()} in ${w.name}.`; }
    else if (/joke/.test(q)) a = 'I would tell you a UDP joke, but you might not get it.';
    else if (/wallpaper/.test(q)){ S.wallpaper = (S.wallpaper + 1) % WALLPAPERS.length; saveS(); applySettings(); a = 'Done — fresh wallpaper, who dis?'; }
    else if (/dark/.test(q)){ S.appearance = effectiveDark() ? 'light' : 'dark'; saveS(); applySettings(); a = 'Appearance toggled.'; }
    else if (/who are you|your name/.test(q)) a = "I'm Siri — well, a simulation of Siri. Close enough for jazz.";
    else if (/hello|hi|hey/.test(q)) a = 'Hey there.';
    else a = "I'm just a simulation, but I can open apps, check the time and weather, change the wallpaper, and tell one (1) joke.";
    text.textContent = a;
    if (window.speechSynthesis){ const u = new SpeechSynthesisUtterance(a); u.rate = 1.05; speechSynthesis.speak(u); }
  });
}

/* ================= appearance ================= */
function effectiveDark(){
  if (S.appearance === 'auto') return matchMedia('(prefers-color-scheme: dark)').matches;
  return S.appearance === 'dark';
}
function applySettings(){
  document.body.classList.toggle('dark', effectiveDark());
  document.body.classList.toggle('reduce-motion', !!S.reduceMotion);
  document.documentElement.style.setProperty('--accent', S.accent);
  document.documentElement.style.setProperty('--dk-size', S.dockSize + 'px');
  const wp = WALLPAPERS[S.wallpaper] || WALLPAPERS[0];
  $('#wallpaper').style.backgroundImage = wp.css;
  const lock = $('#lock'); if (lock){ lock.style.backgroundImage = wp.css; lock.style.backgroundSize = 'cover'; }
  $('#brightness-overlay').style.opacity = (1 - S.brightness) * 0.55;
  if (MASTER) MASTER.gain.value = S.volume;
  applyDockVisibility();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.appearance === 'auto') applySettings(); });

/* ================= power ================= */
function bootTo(target){
  $('#off').classList.add('gone'); $('#screen').classList.add('gone'); $('#lock').classList.add('gone');
  const boot = $('#boot'); boot.classList.remove('gone');
  $('#boot-apple').innerHTML = appleSVG('#e8e8e8');
  const fill = $('#boot-fill'); fill.style.width = '0%';
  let p = 0;
  const iv = setInterval(() => {
    p = Math.min(100, p + 2 + Math.random() * 4);
    fill.style.width = p + '%';
    if (p >= 100){
      clearInterval(iv);
      setTimeout(() => {
        boot.classList.add('gone');
        if (target === 'desktop') showDesktop(true);
        else lockScreen();
      }, 450);
    }
  }, 55);
}
function showDesktop(first=false){
  $('#screen').classList.remove('gone');
  if (first){
    setTimeout(() => {
      notify({ appId:'tips', title:'Welcome to Tahoe Web', body:'Everything here works — open apps, try the Apple menu, press ⌘Space.' });
      if (!TIPS_DISMISSED){ openApp('help'); }
    }, 700);
    setTimeout(() => notify({ appId:'mail', title:'Ava Chen', body:'Tahoe weekend — final plan 🏔️' }), 14000);
  }
}
function lockScreen(){
  closeOverlays(); closeMenus();
  $('#off').classList.add('gone'); $('#boot').classList.add('gone');
  $('#screen').classList.add('gone');
  $('#lock-avatar').style.background = `radial-gradient(circle at 30% 25%, #8ec5f7, #2b5fd9)`;
  $('#lock-name').textContent = S.fullName;
  $('#lock').classList.remove('gone');
  tickClock();
}
function unlock(){ $('#lock').classList.add('gone'); showDesktop(); }
function sleepMac(){
  closeOverlays();
  const off = $('#off');
  $('.off-hint', off).textContent = '';
  off.classList.remove('gone');
  off.dataset.mode = 'sleep';
}
function shutdownMac(){
  closeOverlays();
  $('#screen').classList.add('gone'); $('#lock').classList.add('gone');
  const off = $('#off');
  $('.off-hint', off).textContent = 'Click to turn on your Mac';
  off.classList.remove('gone');
  off.dataset.mode = 'off';
}
function restartMac(){ closeOverlays(); $('#screen').classList.add('gone'); $('#lock').classList.add('gone'); $('#off').classList.remove('gone'); $('.off-hint', off).textContent=''; bootTo('lock'); }

/* ================= system init ================= */
function initSystem(){
  populateApplicationsFolder();
  // system-internal "apps" that host floating panels
  registerApp('about', { name:'About This Mac', inApps:false, slim:true, size:{w:520,h:520}, render: (w, body) => w.body.append(body) });
  registerApp('help',  { name:'Help', inApps:false, slim:true, size:{w:470,h:480}, render: (w, body) => { if (typeof body === 'object' && body.nodeType) w.body.append(body); else { w.setTitle('Tahoe Web Help'); w.body.append(showHelpBody()); } } });
  registerApp('getinfo', { name:'Info', inApps:false, slim:true, size:{w:320,h:340}, single:false, render: (w, p) => { if (p && p.title) w.setTitle(p.title); w.body.append(p.body); } });
  renderDesktop();
  buildMenuExtras();
  updateMenubar();
  updateDock();
  applySettings();
  tickClock();
  for (const id of ['cc','nc','spotlight','launchpad','mission','switcher']) bindOverlayDismiss(id);
  $('#desktop-icons').addEventListener('contextmenu', e => { if (e.target.id === 'desktop-icons') desktopCtx(e); });
  $('#screen').addEventListener('contextmenu', e => { if (e.target.id === 'wallpaper' || e.target.id === 'desktop-icons') desktopCtx(e); });
  $('#screen').addEventListener('pointerdown', e => {
    if ((e.target.id === 'wallpaper' || e.target.id === 'desktop-icons')){ setActive(null); deskSel && deskSel.classList.remove('sel'); deskSel = null; }
  });
  $('#lock').addEventListener('pointerdown', unlock);
  addEventListener('keydown', e => { if (!$('#lock').classList.contains('gone')) unlock(); }, true);
  $('#off').addEventListener('pointerdown', () => {
    if ($('#off').dataset.mode === 'off'){ bootChime(); bootTo('lock'); }
    else { $('#off').classList.add('gone'); }
  });
}
function showHelpBody(){
  const rows = [['Spotlight','⌘ Space'],['App Switcher','⌘ Tab'],['Mission Control','F3 or ⌃↑'],['Quit app','⌘ Q'],['Close window','⌘ W'],['Minimize','⌘ M'],['Hide app','⌘ H'],['Force Quit','⌥ ⌘ ⎋'],['Lock Screen','⌃ ⌘ Q']];
  return h('div', { class:'tips' },
    h('h2', { style:'margin-bottom:4px' }, 'Tahoe Web Help'),
    h('p', { class:'muted', style:'margin-bottom:12px;font-size:12.5px' }, 'A full macOS Tahoe simulation in your browser. Every Dock app and menu works.'),
    h('h4', { style:'margin-bottom:4px' }, 'Keyboard shortcuts'),
    ...rows.map(([k, v]) => h('div', { class:'trow' }, h('span', {}, k), h('span', {}, h('kbd', {}, v)))),
    h('p', { class:'muted', style:'margin-top:14px;font-size:11.5px' }, 'Tip: say things to Terminal — try `say hello` or `open -a safari`.'),
  );
}
