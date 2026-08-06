/* ============================================================
   macOS Tahoe 26 — Core OS / Window Manager
   ============================================================ */
(function(){
'use strict';

const OS = window.OS = {
  windows: [],
  zTop: 100,
  activeWin: null,
  state: {
    wifi: true, bluetooth: true, airdrop: true, focus: false, darkMode: true,
    brightness: 85, volume: 60, stageManager: false, doNotDisturb: false,
  },
};

/* ---------- Utilities ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const el = (tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const fmtTime = d=>{let h=d.getHours(),m=d.getMinutes();const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${m<10?'0'+m:m} ${ap}`;};
const fmtDate = d=>d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
function svgIcon(path,vb){return `<svg viewBox="${vb}" width="100%" height="100%">${path}</svg>`;}

/* ---------- Boot ---------- */
window.addEventListener('load',()=>{
  setTimeout(()=>{
    $('#boot-screen').style.opacity='0';
    $('#boot-screen').style.transition='opacity .4s';
    setTimeout(()=>{$('#boot-screen').remove();$('#desktop').classList.remove('hidden');OS.init();},380);
  },1500);
});

/* ---------- Init ---------- */
OS.init = function(){
  OS.buildDock();
  OS.buildMenuBar();
  OS.buildControlCenter();
  OS.buildSpotlight();
  OS.buildLaunchpad();
  OS.startClock();
  OS.bindGlobal();
  // Open Finder by default
  setTimeout(()=>OS.openApp('finder'),350);
};

/* ============================================================
   WINDOW MANAGER
   ============================================================ */
OS.createWindow = function(opts){
  const w = Object.assign({
    id:'win-'+Date.now()+Math.random().toString(36).slice(2,6),
    appId:null, title:'', width:720, height:480, x:null, y:null,
    minWidth:280, minHeight:200, resizable:true, fullscreen:false,
    unified:false, sidebar:false, toolbar:false, statusbar:false, maximized:false,
  }, opts);

  const win = el('div','win opening');
  win.dataset.id = w.id;
  win.style.width = w.width+'px';
  win.style.height = w.height+'px';
  const ww = window.innerWidth, wh = window.innerHeight;
  w.x = w.x!=null ? w.x : clamp((ww-w.width)/2 + (OS.windows.length%5)*28, 8, ww-w.width-8);
  w.y = w.y!=null ? w.y : clamp((wh-w.height)/2 - 30 + (OS.windows.length%5)*24, 36, wh-w.height-90);
  win.style.left = w.x+'px';
  win.style.top = w.y+'px';
  win.style.zIndex = ++OS.zTop;

  // titlebar
  const tb = el('div','win-titlebar');
  if(w.unified) win.classList.add('unified');
  tb.innerHTML = `
    <div class="traffic">
      <div class="tl tl-close" title="Close"><svg viewBox="0 0 8 8"><path stroke="#4d0000" stroke-width="1.2" stroke-linecap="round" d="M2 2 6 6M6 2 2 6"/></svg></div>
      <div class="tl tl-min" title="Minimize"><svg viewBox="0 0 8 8"><path stroke="#4a3200" stroke-width="1.4" stroke-linecap="round" d="M2 4h4"/></svg></div>
      <div class="tl tl-max" title="Zoom"><svg viewBox="0 0 8 8"><path fill="#0d5100" d="M2 2h4v4H2z"/></svg></div>
    </div>
    <div class="win-title">${w.title}</div>`;
  win.appendChild(tb);

  // body
  const body = el('div','win-body');
  const content = el('div','win-content');
  body.appendChild(content);
  win.appendChild(body);

  // resize handles
  if(w.resizable){
    ['n','s','e','w','ne','nw','se','sw'].forEach(d=>{
      const r=el('div','win-resize wr-'+d);win.appendChild(r);
    });
  }

  $('#windows-layer').appendChild(win);
  w.el = win; w.titleEl = $('.win-title',tb); w.contentEl = content; w.titleBarEl = tb;

  OS.windows.push(w);
  OS.focus(w);

  // traffic lights
  $('.tl-close',tb).onclick=e=>{e.stopPropagation();OS.closeWindow(w);};
  $('.tl-min',tb).onclick=e=>{e.stopPropagation();OS.minimize(w);};
  $('.tl-max',tb).onclick=e=>{e.stopPropagation();OS.toggleZoom(w);};
  tb.addEventListener('mousedown',e=>{
    if(e.target.closest('.traffic'))return;
    if(w.fullscreen||w.maximized)return;
    OS.dragStart(w,e);
  });
  tb.addEventListener('dblclick',e=>{if(!e.target.closest('.traffic'))OS.toggleZoom(w);});

  if(w.resizable) OS.bindResize(w);
  win.addEventListener('mousedown',()=>OS.focus(w),true);

  setTimeout(()=>win.classList.remove('opening'),240);
  OS.updateDockRunning();
  return w;
};

OS.focus = function(w){
  if(OS.activeWin===w){w.el.style.zIndex=++OS.zTop;return;}
  OS.activeWin = w;
  OS.windows.forEach(x=>x.el.classList.toggle('focused', x===w));
  w.el.style.zIndex = ++OS.zTop;
  OS.updateMenuBar(w.appId);
};

OS.closeWindow = function(w){
  w.el.classList.add('closing');
  setTimeout(()=>{
    w.el.remove();
    OS.windows = OS.windows.filter(x=>x!==w);
    if(OS.activeWin===w) OS.activeWin = OS.windows[OS.windows.length-1]||null;
    if(OS.activeWin) OS.focus(OS.activeWin); else OS.updateMenuBar(null);
    if(w.onClose) w.onClose();
    OS.updateDockRunning();
  },150);
};

OS.minimize = function(w){
  w.minimized = true;
  w.el.classList.add('minimized');
  OS.updateDockRunning();
};

OS.restoreMin = function(w){
  w.minimized = false;
  w.el.classList.remove('minimized');
  OS.focus(w);
  OS.updateDockRunning();
};

OS.toggleZoom = function(w){
  if(w.fullscreen){OS.exitFullscreen(w);return;}
  // smart zoom: maximize to fill below menubar above dock
  w._prevRect = {x:w.x,y:w.y,width:w.width,height:w.height};
  w.maximized = true;
  w.el.style.transition='all .22s cubic-bezier(.2,.9,.3,1)';
  w.el.style.left='4px';w.el.style.top='32px';
  w.el.style.width=(window.innerWidth-8)+'px';
  w.el.style.height=(window.innerHeight-32-86)+'px';
  setTimeout(()=>w.el.style.transition='',230);
};

OS.enterFullscreen = function(w){
  w.fullscreen=true;w.maximized=false;
  w._prevRect={x:w.x,y:w.y,width:w.width,height:w.height};
  w.el.classList.add('fullscreen');
  w.el.style.transition='all .22s ease';
  w.el.style.left='0';w.el.style.top='0';
  w.el.style.width=window.innerWidth+'px';
  w.el.style.height=window.innerHeight+'px';
  setTimeout(()=>w.el.style.transition='',230);
};
OS.exitFullscreen = function(w){
  const r=w._prevRect;
  w.fullscreen=false;
  w.el.classList.remove('fullscreen');
  w.el.style.transition='all .22s ease';
  w.el.style.left=r.x+'px';w.el.style.top=r.y+'px';
  w.el.style.width=r.width+'px';w.el.style.height=r.height+'px';
  w.x=r.x;w.y=r.y;w.width=r.width;w.height=r.height;
  setTimeout(()=>w.el.style.transition='',230);
};

/* drag */
OS.dragStart = function(w,e){
  const sx=e.clientX, sy=e.clientY, ox=w.x, oy=w.y;
  const move=ev=>{
    w.x=clamp(ox+ev.clientX-sx,-w.width+80,window.innerWidth-80);
    w.y=clamp(oy+ev.clientY-sy,28,window.innerHeight-40);
    w.el.style.left=w.x+'px';w.el.style.top=w.y+'px';
  };
  const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);};
  document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
};

/* resize */
OS.bindResize = function(w){
  $$('.win-resize',w.el).forEach(h=>{
    h.addEventListener('mousedown',e=>{
      e.stopPropagation();
      const d=h.className.match(/wr-(\w+)/)[1];
      const sx=e.clientX,sy=e.clientY,ox=w.x,oy=w.y,ow=w.width,oh=w.height;
      const move=ev=>{
        const dx=ev.clientX-sx, dy=ev.clientY-sy;
        let nx=ox,ny=oy,nw=ow,nh=oh;
        if(d.includes('e')) nw=clamp(ow+dx,w.minWidth,window.innerWidth-ox-4);
        if(d.includes('s')) nh=clamp(oh+dy,w.minHeight,window.innerHeight-oy-4);
        if(d.includes('w')){nw=clamp(ow-dx,w.minWidth,ox+ow-4);nx=ox+ow-nw;}
        if(d.includes('n')){nh=clamp(oh-dy,w.minHeight,oy+oh-4);ny=oy+oh-nh;}
        w.x=nx;w.y=ny;w.width=nw;w.height=nh;
        w.el.style.left=nx+'px';w.el.style.top=ny+'px';w.el.style.width=nw+'px';w.el.style.height=nh+'px';
      };
      const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);};
      document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
    });
  });
};

window.addEventListener('resize',()=>{
  OS.windows.forEach(w=>{
    if(w.fullscreen){w.el.style.width=window.innerWidth+'px';w.el.style.height=window.innerHeight+'px';return;}
    if(w.maximized){w.el.style.width=(window.innerWidth-8)+'px';w.el.style.height=(window.innerHeight-32-86)+'px';return;}
    w.x=clamp(w.x,0,Math.max(0,window.innerWidth-w.width));
    w.y=clamp(w.y,28,Math.max(28,window.innerHeight-100));
    w.el.style.left=w.x+'px';w.el.style.top=w.y+'px';
  });
});

/* ============================================================
   APP OPENING
   ============================================================ */
OS.openApp = function(id, opts){
  const app = window.Apps[id];
  if(!app){console.warn('No app:',id);return;}
  // single-instance apps: focus existing
  if(app.singleInstance){
    const ex = OS.windows.find(w=>w.appId===id && !w.minimized);
    if(ex){OS.focus(ex);return ex;}
    const min = OS.windows.find(w=>w.appId===id);
    if(min){OS.restoreMin(min);return min;}
  }
  const w = OS.createWindow(Object.assign({
    appId:id, title:app.name, width:app.width||720, height:app.height||480,
    resizable:app.resizable!==false, minWidth:app.minWidth, minHeight:app.minHeight,
    unified:app.unified, sidebar:app.sidebar,
  }, opts||{}));
  w.app = app;
  // dock bounce
  const di = $(`.dock-item[data-app="${id}"]`);
  if(di){di.classList.add('dock-bounce');setTimeout(()=>di.classList.remove('dock-bounce'),500);}
  try{ app.onOpen && app.onOpen(w, OS); }catch(err){console.error('App open error',id,err); w.contentEl.innerHTML='<div class="pad center muted">App failed to load.</div>';}
  OS.focus(w);
  return w;
};

/* ============================================================
   MENU BAR
   ============================================================ */
OS.menus = {};
OS.buildMenuBar = function(){
  $$('.menubar-left .mb-item[data-menu]').forEach(item=>{
    item.addEventListener('click',e=>{
      e.stopPropagation();
      const key=item.dataset.menu;
      if($('#menu-dropdown').classList.contains('hidden')===false && OS._lastMenu===key){
        OS.hideMenu();return;
      }
      OS.showMenu(key, item);
    });
    item.addEventListener('mouseenter',()=>{
      if(!$('#menu-dropdown').classList.contains('hidden')){
        OS.showMenu(item.dataset.menu, item);
      }
    });
  });
  // right side
  $('#mb-control-center').onclick=e=>{e.stopPropagation();OS.toggleControlCenter();};
  $('#mb-spotlight').onclick=e=>{e.stopPropagation();OS.openSpotlight();};
  $('#mb-siri').onclick=e=>{e.stopPropagation();OS.openApp('siri');};
  document.addEventListener('click',()=>{OS.hideMenu();OS.hideControlCenter();});
};

OS.updateMenuBar = function(appId){
  const app = appId?window.Apps[appId]:null;
  const nameEl = $('.mb-bold[data-menu="app-name"]');
  nameEl.textContent = app?app.name:'Finder';
  // toggle visibility of standard menus
  const std = {file:'File',edit:'Edit',view:'View',window:'Window',help:'Help'};
  Object.keys(std).forEach(k=>{
    const it=$(`.mb-item[data-menu="${k}"]`); if(it) it.textContent=std[k];
  });
};

OS.showMenu = function(key, anchor){
  OS._lastMenu = key;
  $$('.menubar-left .mb-item').forEach(i=>i.classList.remove('active'));
  anchor.classList.add('active');
  let items = [];
  const activeApp = OS.activeWin && OS.activeWin.appId ? window.Apps[OS.activeWin.appId] : null;
  if(key==='apple'){
    items = [
      {label:'About This Mac',action:()=>OS.openApp('about')},
      {sep:true},
      {label:'System Settings…',action:()=>OS.openApp('settings')},
      {label:'App Store…',action:()=>OS.openApp('appstore')},
      {sep:true},
      {label:'Sleep',action:()=>OS.sleep()},
      {label:'Restart…',action:()=>OS.restart()},
      {label:'Shut Down…',action:()=>OS.shutdown()},
      {sep:true},
      {label:'Lock Screen',shortcut:'⌃⌘Q',action:()=>OS.lock()},
      {label:'Log Out…',shortcut:'⇧⌘Q',action:()=>OS.lock()},
    ];
  } else if(key==='app-name'){
    items = activeApp && activeApp.appMenu ? activeApp.appMenu(OS.activeWin) : [
      {label:'About '+(activeApp?activeApp.name:'Finder'),action:()=>OS.openApp('about')},
      {sep:true},{label:'Settings…',shortcut:'⌘,',action:()=>OS.openApp('settings'),disabled:!(activeApp&&activeApp.settings)},
      {sep:true},{label:'Hide '+(activeApp?activeApp.name:'Finder'),shortcut:'⌘H',action:()=>{if(OS.activeWin)OS.minimize(OS.activeWin);}},
      {label:'Hide Others',shortcut:'⌥⌘H',action:()=>OS.windows.forEach(w=>{if(w!==OS.activeWin)OS.minimize(w);})},
      {sep:true},{label:'Quit '+(activeApp?activeApp.name:'Finder'),shortcut:'⌘Q',action:()=>{if(OS.activeWin)OS.closeWindow(OS.activeWin);}},
    ];
  } else if(activeApp && activeApp.menus && activeApp.menus[key]){
    items = activeApp.menus[key](OS.activeWin);
  } else {
    items = OS.defaultMenus[key]||[{label:'No actions',disabled:true}];
  }
  const dd = $('#menu-dropdown');
  dd.innerHTML='';
  items.forEach(it=>{
    if(it.sep){dd.appendChild(el('div','md-sep'));return;}
    const mi=el('div','md-item'+(it.disabled?' disabled':''));
    mi.innerHTML=`<span class="md-label">${it.label}</span>${it.shortcut?'<span class="md-shortcut">'+it.shortcut+'</span>':''}`;
    if(!it.disabled) mi.onclick=ev=>{ev.stopPropagation();OS.hideMenu();it.action&&it.action();};
    dd.appendChild(mi);
  });
  dd.classList.remove('hidden');
  const r = anchor.getBoundingClientRect();
  dd.style.left = r.left+'px';
  dd.style.top = (r.bottom)+'px';
};

OS.hideMenu = function(){
  $('#menu-dropdown').classList.add('hidden');
  $$('.menubar-left .mb-item').forEach(i=>i.classList.remove('active'));
};

OS.defaultMenus = {
  file:[
    {label:'New Window',shortcut:'⌘N',action:()=>{const a=OS.activeWin&&OS.activeWin.appId;if(a)OS.openApp(a);}},
    {sep:true},{label:'Close Window',shortcut:'⌘W',action:()=>{if(OS.activeWin)OS.closeWindow(OS.activeWin);}},
  ],
  edit:[
    {label:'Undo',shortcut:'⌘Z',action:()=>document.execCommand('undo')},
    {label:'Redo',shortcut:'⇧⌘Z',action:()=>document.execCommand('redo')},
    {sep:true},{label:'Cut',shortcut:'⌘X',action:()=>document.execCommand('cut')},
    {label:'Copy',shortcut:'⌘C',action:()=>document.execCommand('copy')},
    {label:'Paste',shortcut:'⌘V',action:()=>document.execCommand('paste')},
    {label:'Select All',shortcut:'⌘A',action:()=>document.execCommand('selectAll')},
  ],
  view:[
    {label:'Enter Full Screen',shortcut:'⌃⌘F',action:()=>{if(OS.activeWin)OS.enterFullscreen(OS.activeWin);}},
    {sep:true},{label:'Show Dock',action:()=>$('#dock-container').classList.remove('hidden')},
    {label:'Show Launchpad',action:()=>OS.openLaunchpad()},
  ],
  window:[
    {label:'Minimize',shortcut:'⌘M',action:()=>{if(OS.activeWin)OS.minimize(OS.activeWin);}},
    {label:'Zoom',action:()=>{if(OS.activeWin)OS.toggleZoom(OS.activeWin);}},
    {sep:true},
    ...(()=>{const wins=OS.windows.filter(w=>!w.minimized);if(!wins.length)return[{label:'No Windows',disabled:true}];return wins.map(w=>({label:w.title||'Window',action:()=>OS.focus(w)}));})(),
  ],
  help:[{label:'macOS Help',action:()=>OS.openApp('help')}],
};

/* ============================================================
   DOCK
   ============================================================ */
OS.dockApps = ['finder','safari','mail','messages','notes','calendar','music','photos','maps','clock','weather','reminders','calculator','terminal','textedit','settings','appstore'];

OS.buildDock = function(){
  const dock = $('#dock');
  dock.innerHTML='';
  // Launchpad + Finder first
  OS.addDockItem(dock, {id:'launchpad',name:'Launchpad',iconClass:'ic-launchpad',glyph:'◈',isLauncher:true});
  OS.dockApps.forEach(id=>{
    const app=window.Apps[id]; if(!app)return;
    OS.addDockItem(dock, app);
  });
  // separator + trash
  const sep=el('div','dock-sep');dock.appendChild(sep);
  OS.addDockItem(dock,{id:'trash',name:'Trash',iconClass:'ic-trash',glyph:'🗑',isTrash:true});
  OS.dockMagnify();
};

OS.addDockItem = function(dock, app){
  const it=el('div','dock-item');
  it.dataset.app = app.id;
  it.innerHTML = `<div class="dock-icon ic ${app.iconClass||''}">${app.glyph||''}</div><div class="dock-label">${app.name}</div><div class="dock-running-dot"></div>`;
  it.onclick=e=>{e.stopPropagation();
    if(app.isLauncher){OS.openLaunchpad();return;}
    if(app.isTrash){OS.openApp('trash');return;}
    // toggle: if running & focused-ish, minimize; else open/focus
    const wins=OS.windows.filter(w=>w.appId===app.id);
    if(wins.length){
      const vis=wins.find(w=>!w.minimized);
      if(vis){if(OS.activeWin===vis)OS.minimize(vis);else OS.focus(vis);}
      else OS.restoreMin(wins[0]);
    } else OS.openApp(app.id);
  };
  dock.appendChild(it);
};

OS.updateDockRunning = function(){
  $$('.dock-item').forEach(it=>{
    const id=it.dataset.app;
    const running=OS.windows.some(w=>w.appId===id);
    it.classList.toggle('running',running);
  });
};

OS.dockMagnify = function(){
  const dock=$('#dock');
  const base=52, maxG=14;
  dock.addEventListener('mousemove',e=>{
    const items=$$('.dock-item',dock);
    items.forEach(it=>{
      const ic=$('.dock-icon',it);
      const r=ic.getBoundingClientRect();
      const cx=r.left+r.width/2;
      const dist=Math.abs(e.clientX-cx);
      const scale=1+Math.max(0,1-dist/140)*0.42;
      ic.style.transform=`scale(${scale})`;
    });
  });
  dock.addEventListener('mouseleave',()=>{
    $$('.dock-icon',dock).forEach(ic=>ic.style.transform='');
  });
};

/* ============================================================
   CONTROL CENTER
   ============================================================ */
OS.buildControlCenter = function(){
  const cc=$('#control-center');
  cc.innerHTML=`
    <div class="cc-grid">
      <div class="cc-tile" id="cc-wifi"><div class="cc-tile-row"><div class="cc-icon-pill">📶</div><div><div class="cc-tile-title">Wi‑Fi</div><div class="cc-tile-label" id="cc-wifi-label">Home</div></div></div></div>
      <div class="cc-tile" id="cc-bt"><div class="cc-tile-row"><div class="cc-icon-pill">ᛒ</div><div><div class="cc-tile-title">Bluetooth</div><div class="cc-tile-label" id="cc-bt-label">On</div></div></div></div>
      <div class="cc-tile" id="cc-airdrop"><div class="cc-tile-row"><div class="cc-icon-pill">◎</div><div><div class="cc-tile-title">AirDrop</div><div class="cc-tile-label">Contacts</div></div></div></div>
      <div class="cc-tile" id="cc-focus"><div class="cc-tile-row"><div class="cc-icon-pill">🌙</div><div><div class="cc-tile-title">Focus</div><div class="cc-tile-label" id="cc-focus-label">Off</div></div></div></div>
    </div>
    <div class="cc-slider-wrap"><span class="small" style="width:30px">🔆</span><input type="range" min="0" max="100" value="${OS.state.brightness}" id="cc-bright"></div>
    <div class="cc-slider-wrap"><span class="small" style="width:30px">🔊</span><input type="range" min="0" max="100" value="${OS.state.volume}" id="cc-vol"></div>
    <div class="cc-now-playing"><div class="cc-np-art"></div><div class="f1"><div style="font-weight:600;font-size:13px">Not Playing</div><div class="small muted">Music</div></div><div class="toolbar-btn" id="cc-play">▶</div></div>
  `;
  const toggle=(id,key,labelOn,labelOff)=>{
    const t=$('#cc-'+id);
    const active=OS.state[key];
    if(active)t.classList.add('active');
    t.onclick=e=>{e.stopPropagation();OS.state[key]=!OS.state[key];t.classList.toggle('active',OS.state[key]);
      const lb=$('#cc-'+id+'-label');if(lb)lb.textContent=OS.state[key]?labelOn:labelOff;
    };
  };
  toggle('wifi','wifi','Home','Off');
  toggle('bt','bluetooth','On','Off');
  toggle('airdrop','airdrop','Contacts','Off');
  toggle('focus','focus','On','Off');
  $('#cc-bright').oninput=e=>{OS.state.brightness=+e.target.value;$('#desktop').style.filter=`brightness(${0.5+OS.state.brightness/200})`;};
  $('#cc-vol').oninput=e=>{OS.state.volume=+e.target.value;};
};
OS.toggleControlCenter = function(){
  const cc=$('#control-center');
  if(cc.classList.contains('hidden')){cc.classList.remove('hidden');}
  else{cc.classList.add('hidden');}
};
OS.hideControlCenter = function(){$('#control-center').classList.add('hidden');};

/* ============================================================
   SPOTLIGHT
   ============================================================ */
OS.buildSpotlight = function(){
  const sp=$('#spotlight');
  sp.addEventListener('click',e=>{if(e.target===sp)OS.closeSpotlight();});
  const inp=$('#spotlight-input');
  inp.addEventListener('input',()=>OS.spotlightSearch(inp.value));
  $$('.sp-tab').forEach(t=>t.onclick=e=>{e.stopPropagation();$$('.sp-tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');OS.spotlightSearch(inp.value);});
  $$('#spotlight-results').forEach(()=>{});
};
OS.openSpotlight = function(){
  const sp=$('#spotlight');sp.classList.remove('hidden');
  const inp=$('#spotlight-input');inp.value='';inp.focus();
  OS.spotlightSearch('');
};
OS.closeSpotlight = function(){$('#spotlight').classList.add('hidden');};
OS.spotlightSearch = function(q){
  const res=$('#spotlight-results');
  const tab=$('.sp-tab.active').dataset.tab;
  q=q.trim();
  if(tab==='calc'){
    res.innerHTML='';
    let val=q;
    try{val=val.replace(/x/g,'*').replace(/÷/g,'/');
      if(/^[\d\s+\-*/().%^]+$/.test(val)&&val){const r=Function('return ('+val+')')();res.innerHTML=`<div class="sp-calc">${val} = ${r}</div>`;return;}}catch(e){}
    res.innerHTML='<div class="pad muted small">Type a math expression…</div>';return;
  }
  const apps=Object.keys(window.Apps).map(k=>Object.assign({id:k},window.Apps[k]));
  let list=[];
  if(tab==='actions'||(!q)){
    list.push({type:'action',label:'Open Launchpad',glyph:'◈',ic:'ic-launchpad',action:()=>{OS.openLaunchpad();OS.closeSpotlight();}});
    list.push({type:'action',label:'Open System Settings',glyph:'⚙',ic:'ic-settings',action:()=>{OS.openApp('settings');OS.closeSpotlight();}});
    list.push({type:'action',label:'Lock Screen',glyph:'🔒',ic:'ic-settings',action:()=>{OS.closeSpotlight();OS.lock();}});
    list.push({type:'action',label:'New Note',glyph:'📝',ic:'ic-notes',action:()=>{OS.closeSpotlight();const w=OS.openApp('notes');setTimeout(()=>{if(w.app.newNote)w.app.newNote(w);},100);}});
  }
  const fApps=q?apps.filter(a=>a.name&&a.name.toLowerCase().includes(q.toLowerCase())):apps.filter(a=>!a.hidden);
  fApps.forEach(a=>list.push({type:'app',label:a.name,glyph:a.glyph,ic:a.iconClass,action:()=>{OS.openApp(a.id);OS.closeSpotlight();}}));
  if(!list.length){res.innerHTML='<div class="pad muted small center">No results</div>';return;}
  res.innerHTML=list.map((r,i)=>`<div class="sp-result${i===0?' selected':''}" data-i="${i}"><div class="sp-result-icon ic ${r.ic||''}">${r.glyph||''}</div><div><div>${r.label}</div><div class="sp-result-meta">${r.type==='app'?'Application':'Action'}</div></div></div>`).join('');
  $$('.sp-result',res).forEach((r,i)=>r.onclick=e=>{e.stopPropagation();list[i].action();});
};

/* ============================================================
   LAUNCHPAD
   ============================================================ */
OS.buildLaunchpad = function(){
  const lp=$('#launchpad');
  lp.addEventListener('click',e=>{if(e.target===lp||e.target.id==='launchpad-grid')OS.closeLaunchpad();});
};
OS.openLaunchpad = function(){
  const grid=$('#launchpad-grid');grid.innerHTML='';
  Object.keys(window.Apps).forEach(id=>{
    const a=window.Apps[id];if(a.hidden)return;
    const it=el('div','lp-item');
    it.innerHTML=`<div class="lp-icon ic ${a.iconClass||''}">${a.glyph||''}</div><div class="lp-label">${a.name}</div>`;
    it.onclick=()=>{OS.closeLaunchpad();OS.openApp(id);};
    grid.appendChild(it);
  });
  $('#launchpad').classList.remove('hidden');
};
OS.closeLaunchpad = function(){$('#launchpad').classList.add('hidden');};

/* ============================================================
   CLOCK
   ============================================================ */
OS.startClock = function(){
  const upd=()=>{const d=new Date();$('#mb-datetime').innerHTML=`<span>${fmtDate(d)}</span>&nbsp;&nbsp;<span>${fmtTime(d)}</span>`;};
  upd();setInterval(upd,1000);
};

/* ============================================================
   POWER ACTIONS
   ============================================================ */
OS.sleep = function(){OS.lock();};
OS.restart = function(){
  const o=el('div','hidden');o.id='power-overlay';o.style.cssText='position:fixed;inset:0;z-index:99998;background:#000;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;';o.textContent='Restarting…';document.body.appendChild(o);
  setTimeout(()=>location.reload(),1600);
};
OS.shutdown = function(){
  const o=el('div');o.id='power-overlay';o.style.cssText='position:fixed;inset:0;z-index:99998;background:#000;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;';o.textContent='Shut Down. Click to power on.';o.onclick=()=>location.reload();document.body.appendChild(o);
};
OS.lock = function(){
  let ls=$('#lock-screen');
  if(!ls){
    ls=el('div');ls.id='lock-screen';
    ls.innerHTML=`<div class="lock-time">${fmtTime(new Date())}</div><div class="lock-date">${fmtDate(new Date())}</div><div class="lock-avatar">M</div><div style="font-weight:600;font-size:16px">Mike</div><div class="lock-pwd"><input type="password" placeholder="Enter Password"></div><div class="lock-hint">Press Return to unlock</div>`;
    document.body.appendChild(ls);
    ls.querySelector('input').addEventListener('keydown',e=>{if(e.key==='Enter')ls.remove();});
    ls.querySelector('input').focus();
  }
};

/* ============================================================
   GLOBAL KEYBOARD
   ============================================================ */
OS.bindGlobal = function(){
  document.addEventListener('keydown',e=>{
    const cmd=e.metaKey||e.ctrlKey;
    // Spotlight
    if(cmd&&e.code==='Space'){e.preventDefault();OS.openSpotlight();return;}
    if(e.key==='Escape'){OS.closeSpotlight();OS.closeLaunchpad();OS.hideMenu();OS.hideControlCenter();}
    // Cmd+W close, Cmd+M minimize, Cmd+Q quit
    if(cmd&&e.key==='w'&&OS.activeWin){e.preventDefault();OS.closeWindow(OS.activeWin);}
    if(cmd&&e.key==='m'&&OS.activeWin){e.preventDefault();OS.minimize(OS.activeWin);}
    if(cmd&&e.key==='q'&&OS.activeWin){e.preventDefault();OS.closeWindow(OS.activeWin);}
    if(cmd&&e.key==='l'){e.preventDefault();OS.lock();}
    // arrow nav in spotlight
    if(!$('#spotlight').classList.contains('hidden')){
      const sel=$('#spotlight .sp-result.selected');const all=$$('#spotlight .sp-result');
      if(e.key==='ArrowDown'&&all.length){e.preventDefault();let i=all.indexOf(sel)+1;if(i>=all.length)i=0;all.forEach(r=>r.classList.remove('selected'));all[i].classList.add('selected');all[i].scrollIntoView({block:'nearest'});}
      if(e.key==='ArrowUp'&&all.length){e.preventDefault();let i=all.indexOf(sel)-1;if(i<0)i=all.length-1;all.forEach(r=>r.classList.remove('selected'));all[i].classList.add('selected');all[i].scrollIntoView({block:'nearest'});}
      if(e.key==='Enter'&&sel){e.preventDefault();sel.click();}
    }
  });
};

/* expose helpers to apps */
OS.$=$; OS.$$=$$; OS.el=el; OS.svgIcon=svgIcon; OS.clamp=clamp;

})();
