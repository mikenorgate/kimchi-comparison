/* ============================================================
   macOS Tahoe 26 — Applications (part 2)
   Calendar, Music, Photos, Maps, Clock, Weather, Messages, Mail, TextEdit, Reminders, App Store
   ============================================================ */
(function(){
'use strict';
const Apps = window.Apps = window.Apps || {};
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const el = (t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const store = {get:(k,d)=>{try{return JSON.parse(localStorage.getItem('mac_'+k))??d}catch(e){return d}},set:(k,v)=>localStorage.setItem('mac_'+k,JSON.stringify(v))};
const fmtTime = d=>{let h=d.getHours(),m=d.getMinutes();const ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${m<10?'0'+m:m} ${ap}`;};

/* ============================================================
   CALENDAR
   ============================================================ */
Apps.calendar = {
  name:'Calendar', iconClass:'ic-cal', glyph:'📅',
  width:880, height:560, minWidth:520, minHeight:360,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`<div class="sidebar-section">iCloud</div>
      <ul class="sidebar-list">
        <li class="sidebar-item active"><span class="si-icon">🗓</span>Home</li>
        <li class="sidebar-item"><span class="si-icon">💼</span>Work</li>
        <li class="sidebar-item"><span class="si-icon">🎉</span>Social</li>
      </ul>
      <div class="sidebar-section">Other</div>
      <ul class="sidebar-list"><li class="sidebar-item"><span class="si-icon">🇺🇸</span>US Holidays</li><li class="sidebar-item"><span class="si-icon">🎂</span>Birthdays</li></ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const tb=el('div','win-toolbar');
    tb.innerHTML=`<div class="toolbar-btn" id="cal-prev" title="Previous">‹</div>
      <div class="toolbar-btn" id="cal-next" title="Next">›</div>
      <div class="win-title" id="cal-month" style="flex:0 0 auto;font-size:15px;font-weight:700"></div>
      <div class="f1"></div>
      <button class="btn" id="cal-today">Today</button>`;
    w.el.querySelector('.win-titlebar').after(tb);
    const content=w.contentEl;
    let viewDate=new Date();
    const events=store.get('cal_events',[
      {date:todayStr(),title:'Team Standup',time:'09:00',color:'#0a84ff'},
      {date:todayStr(),title:'Lunch with Sarah',time:'12:30',color:'#30d158'},
      {date:todayStr(),title:'Code Review',time:'15:00',color:'#ff9f0a'},
    ]);
    function todayStr(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
    function dateStr(d){return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
    function render(){
      const y=viewDate.getFullYear(),m=viewDate.getMonth();
      const monthName=viewDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
      $('#cal-month',tb).textContent=monthName;
      const first=new Date(y,m,1).getDay();
      const days=new Date(y,m+1,0).getDate();
      const prevDays=new Date(y,m,0).getDate();
      const today=new Date();
      content.style.cssText='display:flex;flex-direction:column';
      content.innerHTML='';
      const hdr=el('div');hdr.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);border-bottom:0.5px solid rgba(255,255,255,0.08)';
      ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{const c=el('div','',d);c.style.cssText='padding:6px;text-align:center;font-size:11px;opacity:0.5;font-weight:600';hdr.appendChild(c);});
      content.appendChild(hdr);
      const grid=el('div');grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);flex:1;min-height:0';
      for(let i=0;i<first;i++){const c=el('div');c.style.cssText='border-right:0.5px solid rgba(255,255,255,0.05);border-bottom:0.5px solid rgba(255,255,255,0.05);padding:4px;opacity:0.3';c.textContent=prevDays-first+i+1;grid.appendChild(c);}
      for(let d=1;d<=days;d++){
        const c=el('div');const ds=`${y}-${m}-${d}`;
        const isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
        c.style.cssText='border-right:0.5px solid rgba(255,255,255,0.05);border-bottom:0.5px solid rgba(255,255,255,0.05);padding:4px;cursor:default;overflow:hidden;min-height:60px';
        const num=el('div','',String(d));num.style.cssText=`width:22px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:12px;${isToday?'background:var(--accent);color:#fff;font-weight:600':''}`;
        c.appendChild(num);
        events.filter(e=>e.date===ds).forEach(e=>{
          const dot=el('div');dot.style.cssText=`font-size:10px;margin-top:2px;padding:1px 4px;border-radius:4px;background:${e.color};color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`;
          dot.textContent=e.time+' '+e.title;dot.title=e.title;
          c.appendChild(dot);
        });
        grid.appendChild(c);
      }
      const cells=42-first-days;for(let i=1;i<=cells&&grid.children.length<42;i++){const c=el('div');c.style.cssText='border-right:0.5px solid rgba(255,255,255,0.05);border-bottom:0.5px solid rgba(255,255,255,0.05);padding:4px;opacity:0.3';c.textContent=i;grid.appendChild(c);}
      content.appendChild(grid);
    }
    $('#cal-prev',tb).onclick=()=>{viewDate.setMonth(viewDate.getMonth()-1);render();};
    $('#cal-next',tb).onclick=()=>{viewDate.setMonth(viewDate.getMonth()+1);render();};
    $('#cal-today',tb).onclick=()=>{viewDate=new Date();render();};
    render();
  },
};

/* ============================================================
   MUSIC
   ============================================================ */
Apps.music = {
  name:'Music', iconClass:'ic-music', glyph:'♪',
  width:900, height:580, minWidth:560, minHeight:360, singleInstance:true,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`<div class="sidebar-section">Apple Music</div>
      <ul class="sidebar-list">
        <li class="sidebar-item active" data-p="listen"><span class="si-icon">▶</span>Listen Now</li>
        <li class="sidebar-item" data-p="browse"><span class="si-icon">📡</span>Browse</li>
        <li class="sidebar-item" data-p="radio"><span class="si-icon">📻</span>Radio</li>
      </ul>
      <div class="sidebar-section">Library</div>
      <ul class="sidebar-list">
        <li class="sidebar-item" data-p="songs"><span class="si-icon">🎵</span>Songs</li>
        <li class="sidebar-item" data-p="albums"><span class="si-icon">💿</span>Albums</li>
        <li class="sidebar-item" data-p="artists"><span class="si-icon">🎤</span>Artists</li>
      </ul>
      <div class="sidebar-section">Playlists</div>
      <ul class="sidebar-list"><li class="sidebar-item"><span class="si-icon">⚡</span>Chill Vibes</li><li class="sidebar-item"><span class="si-icon">🔥</span>Workout</li></ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const content=w.contentEl;
    content.style.cssText='display:flex;flex-direction:column';
    const trackList=el('div');trackList.style.cssText='flex:1;overflow:auto;padding:8px';
    content.appendChild(trackList);
    // player bar
    const player=el('div');player.style.cssText='flex:0 0 auto;height:64px;display:flex;align-items:center;gap:12px;padding:0 16px;background:rgba(0,0,0,0.3);border-top:0.5px solid rgba(255,255,255,0.1)';
    content.appendChild(player);
    const songs=[
      {id:1,title:'Midnight City',artist:'Synthwave Dreams',album:'Neon Nights',dur:'4:03',col:'#7a2a8f'},
      {id:2,title:'Ocean Eyes',artist:'Aurora Light',album:'Horizon',dur:'3:45',col:'#0a6fff'},
      {id:3,title:'Golden Hour',artist:'Sun Chasers',album:'Daylight',dur:'4:21',col:'#ff9f0a'},
      {id:4,title:'Electric Soul',artist:'Voltage',album:'Circuit',dur:'3:12',col:'#30d158'},
      {id:5,title:'Velvet Sky',artist:'Moonlit',album:'Dusk',dur:'5:01',col:'#bf5af2'},
      {id:6,title:'Crystal Clear',artist:'Glass Lake',album:'Mirror',dur:'3:33',col:'#64d2ff'},
      {id:7,title:'Paper Planes',artist:'Folded',album:'Origami',dur:'2:58',col:'#ff375f'},
      {id:8,title:'Desert Wind',artist:'Mirage',album:'Sahara',dur:'4:44',col:'#ff9f0a'},
    ];
    let curId=1,playing=false;
    function renderList(){
      trackList.innerHTML='';
      songs.forEach((s,i)=>{
        const row=el('div');row.style.cssText='display:grid;grid-template-columns:30px 1fr 1fr 50px;gap:10px;padding:8px 12px;align-items:center;border-radius:6px;cursor:default';
        row.onmouseover=()=>row.style.background='rgba(255,255,255,0.08)';
        row.onmouseout=()=>row.style.background=s.id===curId?'rgba(255,255,255,0.12)':'';
        if(s.id===curId)row.style.background='rgba(255,255,255,0.12)';
        row.innerHTML=`<div style="width:28px;height:28px;border-radius:5px;background:${s.col};display:flex;align-items:center;justify-content:center;font-size:12px">${s.id===curId&&playing?'▶':'♪'}</div><div><div style="font-weight:500">${s.title}</div></div><div class="muted small">${s.artist}</div><div class="muted small" style="text-align:right">${s.dur}</div>`;
        row.onclick=()=>{curId=s.id;playing=true;renderList();renderPlayer();};
        trackList.appendChild(row);
      });
    }
    function renderPlayer(){
      const s=songs.find(x=>x.id===curId);
      player.innerHTML=`
        <div style="width:44px;height:44px;border-radius:8px;background:${s.col};display:flex;align-items:center;justify-content:center;font-size:18px">♪</div>
        <div style="flex:0 0 auto"><div style="font-weight:600;font-size:13px">${s.title}</div><div class="small muted">${s.artist}</div></div>
        <div class="f1"></div>
        <div class="toolbar-btn" id="m-prev">⏮</div>
        <div class="toolbar-btn" id="m-play" style="font-size:18px">${playing?'⏸':'▶'}</div>
        <div class="toolbar-btn" id="m-next">⏭</div>
        <div style="width:120px"><div style="height:4px;background:rgba(255,255,255,0.2);border-radius:2px;overflow:hidden"><div id="m-prog" style="height:100%;width:35%;background:#fff"></div></div></div>`;
      $('#m-play',player).onclick=()=>{playing=!playing;renderPlayer();renderList();};
      $('#m-prev',player).onclick=()=>{curId=Math.max(1,curId-1);renderList();renderPlayer();};
      $('#m-next',player).onclick=()=>{curId=Math.min(songs.length,curId+1);renderList();renderPlayer();};
    }
    renderList();renderPlayer();
  },
};

/* ============================================================
   PHOTOS
   ============================================================ */
Apps.photos = {
  name:'Photos', iconClass:'ic-photos', glyph:'🌅',
  width:880, height:560, minWidth:480, minHeight:360,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`<div class="sidebar-section">Photos</div>
      <ul class="sidebar-list">
        <li class="sidebar-item active"><span class="si-icon">🖼</span>Library</li>
        <li class="sidebar-item"><span class="si-icon">📅</span>Memories</li>
        <li class="sidebar-item"><span class="si-icon">❤️</span>Favorites</li>
        <li class="sidebar-item"><span class="si-icon">👤</span>People</li>
      </ul>
      <div class="sidebar-section">Albums</div>
      <ul class="sidebar-list"><li class="sidebar-item"><span class="si-icon">✈️</span>Travel</li><li class="sidebar-item"><span class="si-icon">🎉</span>Events</li></ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const tb=el('div','win-toolbar');
    tb.innerHTML=`<div class="win-title" style="flex:0 0 auto;font-weight:600">Photos</div><div class="f1"></div><div class="toolbar-btn">⤴</div><div class="toolbar-btn">✎</div>`;
    w.el.querySelector('.win-titlebar').after(tb);
    const content=w.contentEl;
    const colors=['linear-gradient(135deg,#ff9a9e,#fecfef)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#fad0c4,#ffd1ff)','linear-gradient(135deg,#84fab0,#8fd3f4)','linear-gradient(135deg,#a1c4fd,#c2e9fb)','linear-gradient(135deg,#fbc2eb,#a6c1ee)','linear-gradient(135deg,#fdcbf1,#e6dee9)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#30cfd0,#330867)','linear-gradient(135deg,#a8edea,#fed6e3)'];
    const labels=['Sunset','Beach','Mountains','City','Flowers','Ocean','Forest','Skyline','Garden','Desert','Aurora','Snow'];
    content.style.cssText='padding:16px;overflow:auto';
    content.innerHTML=`<h2 style="font-size:18px;font-weight:600;margin-bottom:14px">Library · ${colors.length} Photos</h2><div id="photo-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px"></div>`;
    const grid=$('#photo-grid',content);
    colors.forEach((g,i)=>{
      const it=el('div');it.style.cssText=`height:140px;border-radius:10px;background:${g};cursor:default;position:relative;overflow:hidden`;
      it.innerHTML=`<div style="position:absolute;bottom:0;left:0;right:0;padding:6px 8px;font-size:11px;background:linear-gradient(transparent,rgba(0,0,0,0.4));color:#fff">${labels[i]}</div>`;
      it.onclick=()=>{content.innerHTML=`<div style="display:flex;flex-direction:column;height:100%"><div style="flex:1;background:${g};border-radius:12px;margin-bottom:12px;display:flex;align-items:flex-end;padding:16px;font-size:18px;font-weight:600">${labels[i]}</div><button class="btn" id="ph-back">‹ Back to Library</button></div>`;$('#ph-back',content).onclick=()=>{OS.closeWindow(w);OS.openApp('photos');};};
      grid.appendChild(it);
    });
  },
};

/* ============================================================
   MAPS
   ============================================================ */
Apps.maps = {
  name:'Maps', iconClass:'ic-maps', glyph:'📍',
  width:960, height:600, minWidth:480, minHeight:360,
  onOpen(w){
    w.unified=true;
    const content=w.contentEl;
    content.style.cssText='display:flex;position:relative;background:#e8eef5';
    // sidebar search
    const sb=el('div');sb.style.cssText='position:absolute;top:12px;left:12px;width:300px;background:rgba(255,255,255,0.92);backdrop-filter:blur(20px);border-radius:14px;padding:12px;z-index:10;box-shadow:0 6px 20px rgba(0,0,0,0.15);color:#1a1a1a';
    sb.innerHTML=`<div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.06);border-radius:9px;padding:6px 10px"><span>🔍</span><input type="text" id="map-search" placeholder="Search Maps" style="flex:1;background:none;border:none;outline:none;color:#1a1a1a;font-size:14px"></div><div id="map-results" style="margin-top:10px"></div>`;
    content.appendChild(sb);
    // map canvas
    const map=el('div');map.style.cssText='flex:1;position:relative;overflow:hidden;cursor:grab';
    map.innerHTML=`<svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0">
      <rect width="800" height="600" fill="#d4e6f1"/>
      <!-- water bodies -->
      <path d="M0 400 Q200 350 400 420 T800 380 L800 600 L0 600Z" fill="#aed6f1"/>
      <!-- green park -->
      <path d="M500 100 Q600 80 700 120 L720 240 Q620 260 520 230Z" fill="#a9dfbf"/>
      <!-- roads -->
      <g stroke="#fff" stroke-width="3" fill="none" opacity="0.9">
        <path d="M0 200 L800 200"/><path d="M0 350 L800 350"/>
        <path d="M200 0 L200 600"/><path d="M500 0 L500 600"/>
        <path d="M0 150 L800 480" stroke-width="2.5"/>
      </g>
      <g stroke="#fdebd0" stroke-width="5" fill="none" opacity="0.8">
        <path d="M0 280 L800 280"/>
      </g>
      <!-- buildings -->
      <g fill="#d5dbdb"><rect x="220" y="220" width="40" height="40"/><rect x="270" y="210" width="50" height="55"/><rect x="340" y="230" width="45" height="35"/><rect x="540" y="300" width="50" height="40"/><rect x="610" y="310" width="40" height="40"/></g>
      <!-- labels -->
      <text x="610" y="180" fill="#2c3e50" font-size="13" font-weight="600">Central Park</text>
      <text x="80" y="450" fill="#2980b9" font-size="13" font-style="italic">Hudson River</text>
      <text x="350" y="280" fill="#7f8c8d" font-size="11">5th Avenue</text>
    </svg>`;
    content.appendChild(map);
    // current location pin
    const pin=el('div');pin.style.cssText='position:absolute;top:45%;left:45%;width:20px;height:20px;border-radius:50%;background:var(--accent);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);z-index:5';
    pin.innerHTML='<div style="position:absolute;width:40px;height:40px;border-radius:50%;background:var(--accent);opacity:0.3;animation:pinPulse 2s infinite;top:-10px;left:-10px"></div>';
    map.appendChild(pin);
    const style=el('style');style.textContent='@keyframes pinPulse{0%{transform:scale(0.5);opacity:0.5}100%{transform:scale(1.5);opacity:0}}';document.head.appendChild(style);
    // toolbar
    const tools=el('div');tools.style.cssText='position:absolute;bottom:12px;right:12px;display:flex;flex-direction:column;gap:6px';
    tools.innerHTML=`<div class="toolbar-btn" id="map-zin" style="background:rgba(255,255,255,0.92);color:#1a1a1a;width:36px;height:36px;border-radius:8px">＋</div><div class="toolbar-btn" id="map-zout" style="background:rgba(255,255,255,0.92);color:#1a1a1a;width:36px;height:36px;border-radius:8px">－</div>`;
    content.appendChild(tools);
    // search results
    const places=[{n:'Apple Park',addr:'Cupertino, CA',lat:37.3},{n:'Times Square',addr:'New York, NY'},{n:'Golden Gate Bridge',addr:'San Francisco, CA'},{n:'Statue of Liberty',addr:'New York, NY'},{n:'Grand Canyon',addr:'Arizona'},{n:'Niagara Falls',addr:'New York'},{n:'Yellowstone',addr:'Wyoming'},{n:'Las Vegas Strip',addr:'Las Vegas, NV'}];
    const res=$('#map-results',sb);
    function renderRes(q){const f=places.filter(p=>!q||p.n.toLowerCase().includes(q.toLowerCase())||p.addr.toLowerCase().includes(q.toLowerCase()));res.innerHTML=f.map(p=>`<div class="map-res" style="padding:8px;border-radius:8px;cursor:default" onmouseover="this.style.background='rgba(0,0,0,0.06)'" onmouseout="this.style.background=''"><div style="font-weight:600;font-size:13px">${p.n}</div><div class="small" style="opacity:0.6">${p.addr}</div></div>`).join('')||'<div class="small muted" style="padding:8px">No results</div>';}
    $('#map-search',sb).addEventListener('input',e=>renderRes(e.target.value));
    renderRes('');
    // zoom (scale transform)
    let zoom=1;
    $('#map-zin',tools).onclick=()=>{zoom=Math.min(3,zoom+0.3);map.querySelector('svg').style.transform=`scale(${zoom})`;map.querySelector('svg').style.transformOrigin='45% 45%';};
    $('#map-zout',tools).onclick=()=>{zoom=Math.max(0.5,zoom-0.3);map.querySelector('svg').style.transform=`scale(${zoom})`;};
    // drag to pan
    let dragging=false,sx,sy,px=0,py=0;
    map.addEventListener('mousedown',e=>{if(e.target.closest('.map-res'))return;dragging=true;sx=e.clientX;sy=e.clientY;map.style.cursor='grabbing';});
    document.addEventListener('mousemove',e=>{if(!dragging)return;const dx=e.clientX-sx,dy=e.clientY-sy;map.querySelector('svg').style.marginLeft=(px+dx)+'px';map.querySelector('svg').style.marginTop=(py+dy)+'px';pin.style.left=(45+ (dx/window.innerWidth*100))+'%';});
    document.addEventListener('mouseup',()=>{if(dragging){dragging=false;map.style.cursor='grab';}});
  },
};

/* ============================================================
   CLOCK
   ============================================================ */
Apps.clock = {
  name:'Clock', iconClass:'ic-clock', glyph:'🕐',
  width:480, height:380, resizable:false, minWidth:480, minHeight:380,
  onOpen(w){
    w.unified=true;
    const content=w.contentEl;
    content.style.cssText='display:flex;flex-direction:column';
    const tabs=el('div');tabs.style.cssText='display:flex;gap:6px;padding:8px 12px;border-bottom:0.5px solid rgba(255,255,255,0.08)';
    tabs.innerHTML=`<button class="sp-tab active" data-t="world">World Clock</button><button class="sp-tab" data-t="alarm">Alarm</button><button class="sp-tab" data-t="stop">Stopwatch</button><button class="sp-tab" data-t="timer">Timer</button>`;
    content.appendChild(tabs);
    const view=el('div');view.style.cssText='flex:1;overflow:auto;padding:16px';content.appendChild(view);
    function show(t){
      $$('.sp-tab',tabs).forEach(b=>b.classList.toggle('active',b.dataset.t===t));
      if(t==='world'){
        const zones=[['Cupertino','America/Los_Angeles'],['New York','America/New_York'],['London','Europe/London'],['Paris','Europe/Paris'],['Tokyo','Asia/Tokyo'],['Sydney','Australia/Sydney']];
        view.innerHTML=zones.map(([n,z])=>{const d=new Date().toLocaleTimeString('en-US',{timeZone:z,hour:'numeric',minute:'2-digit'});return `<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div><div style="font-size:13px;opacity:0.6">${n}</div><div style="font-weight:600">${z.split('/').pop()}</div></div><div style="font-size:28px;font-weight:300">${d}</div></div>`;}).join('');
      } else if(t==='alarm'){
        view.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div><div style="font-size:28px;font-weight:300">7:00 AM</div><div class="small muted">Wake up</div></div><div style="width:44px;height:26px;background:var(--accent);border-radius:13px;position:relative"><div style="position:absolute;right:2px;top:2px;width:22px;height:22px;background:#fff;border-radius:50%"></div></div></div><div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div><div style="font-size:28px;font-weight:300">9:30 AM</div><div class="small muted">Morning meeting</div></div><div style="width:44px;height:26px;background:rgba(255,255,255,0.2);border-radius:13px;position:relative"><div style="position:absolute;left:2px;top:2px;width:22px;height:22px;background:#fff;border-radius:50%"></div></div></div>`;
      } else if(t==='stop'){
        view.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:24px;padding:30px"><div id="stop-time" style="font-size:64px;font-weight:200">00:00.00</div><div style="display:flex;gap:20px"><button class="btn btn-primary" id="stop-go" style="width:80px;height:80px;border-radius:40px;font-size:16px">Start</button><button class="btn" id="stop-lap" style="width:80px;height:80px;border-radius:40px;font-size:14px">Lap</button></div><div id="stop-laps" style="width:100%"></div></div>`;
        let st=0,running=false,startT=0,laps=[];const disp=$('#stop-time',view);
        const go=$('#stop-go',view),lapB=$('#stop-lap',view),lapWrap=$('#stop-laps',view);
        const tick=()=>{if(!running)return;const e=Date.now()-startT+st;disp.textContent=fmtStop(e);requestAnimationFrame(tick);};
        function fmtStop(ms){const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000),cs=Math.floor((ms%1000)/10);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;}
        go.onclick=()=>{if(running){running=false;st+=Date.now()-startT;go.textContent='Start';}else{running=true;startT=Date.now();go.textContent='Stop';tick();}};
        lapB.onclick=()=>{if(running){const e=Date.now()-startT+st;laps.unshift(fmtStop(e));lapWrap.innerHTML=laps.map((l,i)=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.06)"><span class="muted">Lap ${laps.length-i}</span><span>${l}</span></div>`).join('');}};
      } else if(t==='timer'){
        view.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:24px;padding:30px"><div id="tmr-disp" style="font-size:64px;font-weight:200">00:30</div><div style="display:flex;gap:20px"><button class="btn btn-primary" id="tmr-go" style="width:80px;height:80px;border-radius:40px">Start</button><button class="btn" id="tmr-rst" style="width:80px;height:80px;border-radius:40px">Reset</button></div></div>`;
        let left=30,running=false,intv=null;const disp=$('#tmr-disp',view);
        const upd=()=>{disp.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;};
        $('#tmr-go',view).onclick=()=>{if(running){clearInterval(intv);running=false;$('#tmr-go',view).textContent='Start';}else{running=true;$('#tmr-go',view).textContent='Pause';intv=setInterval(()=>{left--;upd();if(left<=0){clearInterval(intv);running=false;disp.textContent='Done!';$('#tmr-go',view).textContent='Start';}},1000);}};
        $('#tmr-rst',view).onclick=()=>{clearInterval(intv);running=false;left=30;upd();$('#tmr-go',view).textContent='Start';};
        upd();
      }
    }
    $$('.sp-tab',tabs).forEach(b=>b.onclick=()=>show(b.dataset.t));
    show('world');
  },
};

/* ============================================================
   WEATHER
   ============================================================ */
Apps.weather = {
  name:'Weather', iconClass:'ic-weather', glyph:'☀',
  width:440, height:580, minWidth:380, minHeight:480,
  onOpen(w){
    w.unified=true;
    const content=w.contentEl;
    content.style.cssText='overflow:auto;background:linear-gradient(180deg,#1e3a8a,#3b82f6,#60a5fa);padding:24px';
    const cities=store.get('weather_city',[
      {n:'Cupertino',temp:72,cond:'Mostly Sunny',hi:78,lo:62,h:45,w:8,icon:'☀'},
      {n:'New York',temp:58,cond:'Rain',hi:64,lo:52,h:82,w:15,icon:'🌧'},
      {n:'London',temp:50,cond:'Cloudy',hi:55,lo:46,h:70,w:12,icon:'☁'},
      {n:'Tokyo',temp:66,cond:'Clear',hi:70,lo:60,h:55,w:6,icon:'☀'},
    ]);
    let idx=0;
    function render(){
      const c=cities[idx];
      const hourly=[...Array(12)].map((_,i)=>{const h=(new Date().getHours()+i)%24;const t=c.temp+Math.round(Math.sin(i/3)*6-3);return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:50px"><div class="small muted">${h}:00</div><div style="font-size:20px">${c.icon}</div><div style="font-weight:600">${t}°</div></div>`;}).join('');
      const daily=[['Today',c.icon,c.hi,c.lo],['Tue','☀',80,65],['Wed','⛅',76,60],['Thu','🌧',68,55],['Fri','☁',70,58],['Sat','☀',82,66],['Sun','☀',84,68]];
      content.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="display:flex;gap:6px">${cities.map((cc,i)=>`<div class="ct-tab" data-i="${i}" style="padding:4px 10px;border-radius:12px;background:${i===idx?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.1)'};font-size:12px;cursor:default">${cc.n}</div>`).join('')}</div>
        </div>
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:20px;font-weight:600">${c.n}</div>
          <div style="font-size:84px;font-weight:200">${c.temp}°</div>
          <div style="font-size:16px">${c.cond}</div>
          <div class="small" style="opacity:0.8;margin-top:4px">H:${c.hi}° L:${c.lo}°</div>
        </div>
        <div style="background:rgba(255,255,255,0.15);border-radius:14px;padding:14px;margin-bottom:12px;backdrop-filter:blur(10px)">
          <div style="display:flex;overflow-x:auto;gap:4px;justify-content:space-around">${hourly}</div>
        </div>
        <div style="background:rgba(255,255,255,0.15);border-radius:14px;padding:14px;margin-bottom:12px">
          ${daily.map(([d,ic,hi,lo])=>`<div style="display:flex;align-items:center;gap:12px;padding:7px 0;border-bottom:0.5px solid rgba(255,255,255,0.1)"><div style="width:60px">${d}</div><div style="flex:1;text-align:center;font-size:20px">${ic}</div><div class="muted" style="width:40px">${lo}°</div><div style="width:40px;font-weight:600">${hi}°</div></div>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:12px"><div class="small muted">HUMIDITY</div><div style="font-size:24px;font-weight:300">${c.h}%</div></div>
          <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:12px"><div class="small muted">WIND</div><div style="font-size:24px;font-weight:300">${c.w} mph</div></div>
          <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:12px"><div class="small muted">FEELS LIKE</div><div style="font-size:24px;font-weight:300">${c.temp+2}°</div></div>
          <div style="background:rgba(255,255,255,0.15);border-radius:12px;padding:12px"><div class="small muted">UV INDEX</div><div style="font-size:24px;font-weight:300">5</div></div>
        </div>`;
      $$('.ct-tab',content).forEach(t=>t.onclick=()=>{idx=+t.dataset.i;render();});
    }
    render();
  },
};

/* ============================================================
   MESSAGES
   ============================================================ */
Apps.messages = {
  name:'Messages', iconClass:'ic-msg', glyph:'💬',
  width:820, height:540, minWidth:480, minHeight:360, singleInstance:true,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');sidebar.style.width='240px';
    sidebar.innerHTML=`<input type="search" placeholder="Search" style="width:100%;margin-bottom:8px"><div id="msg-list"></div>`;
    body.insertBefore(sidebar,body.firstChild);
    const content=w.contentEl;
    content.style.cssText='display:flex;flex-direction:column';
    const convs=store.get('msg_convs',[
      {id:1,n:'Sarah Chen',av:'#ff375f',msgs:[{f:0,t:'Hey! Are we still on for lunch?'},{f:1,t:'Yes! 12:30 at the usual place?'},{f:0,t:'Perfect, see you then 😊'}]},
      {id:2,n:'Mom',av:'#30d158',msgs:[{f:0,t:'Did you eat yet?'},{f:1,t:'Yes mom 😄'},{f:0,t:'Good. Call me later.'}]},
      {id:3,n:'Work Group',av:'#0a84ff',msgs:[{f:0,t:'Standup in 5 min'},{f:1,t:'On my way'},{f:2,t:'Joining'}]},
      {id:4,n:'Alex',av:'#bf5af2',msgs:[{f:1,t:'Did you see the game?'},{f:0,t:'Incredible finish!'}]},
    ]);
    let curId=1;
    function renderList(){
      const wrap=$('#msg-list',sidebar);wrap.innerHTML='';
      convs.forEach(c=>{
        const last=c.msgs[c.msgs.length-1];
        const it=el('div');it.style.cssText=`display:flex;gap:10px;padding:10px;border-radius:8px;cursor:default;${c.id===curId?'background:var(--accent)':''}`;
        it.onmouseover=()=>{if(c.id!==curId)it.style.background='rgba(255,255,255,0.08)';};
        it.onmouseout=()=>{if(c.id!==curId)it.style.background='';};
        it.innerHTML=`<div style="width:36px;height:36px;border-radius:50%;background:${c.av};flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-weight:600">${c.n[0]}</div><div style="min-width:0"><div style="font-weight:600;font-size:13px">${c.n}</div><div class="small ${c.id===curId?'':'muted'}" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${(last.f===1?'You: ':'')+last.t}</div></div>`;
        it.onclick=()=>{curId=c.id;renderList();renderChat();};
        wrap.appendChild(it);
      });
    }
    function renderChat(){
      const c=convs.find(x=>x.id===curId);
      if(!c){content.innerHTML='<div class="muted" style="margin:auto">Select a conversation</div>';return;}
      content.innerHTML=`<div style="padding:10px;border-bottom:0.5px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px"><div style="width:32px;height:32px;border-radius:50%;background:${c.av};display:flex;align-items:center;justify-content:center;font-weight:600">${c.n[0]}</div><div style="font-weight:600">${c.n}</div></div><div id="msg-scroll" style="flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:6px"></div><div style="display:flex;gap:8px;padding:10px;border-top:0.5px solid rgba(255,255,255,0.08)"><input id="msg-in" type="text" placeholder="iMessage" style="flex:1"><button class="btn btn-primary" id="msg-send">↑</button></div>`;
      const sc=$('#msg-scroll',content);
      c.msgs.forEach(m=>{
        const b=el('div');const me=m.f===1;
        b.style.cssText=`align-self:${me?'flex-end':'flex-start'};max-width:70%;padding:8px 14px;border-radius:18px;${me?'background:var(--accent);color:#fff':'background:rgba(255,255,255,0.14)'}`;
        b.textContent=m.t;sc.appendChild(b);
      });
      sc.scrollTop=sc.scrollHeight;
      const inp=$('#msg-in',content);
      const send=()=>{if(!inp.value.trim())return;c.msgs.push({f:1,t:inp.value});inp.value='';store.set('msg_convs',convs);renderChat();renderList();
        // auto-reply
        setTimeout(()=>{const replies=['Cool!','Sure','👍','Got it','Haha','Okay sounds good','Let me check','Maybe later'];c.msgs.push({f:0,t:replies[Math.floor(Math.random()*replies.length)]});store.set('msg_convs',convs);renderChat();renderList();},1200+Math.random()*1500);
      };
      $('#msg-send',content).onclick=send;
      inp.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
      inp.focus();
    }
    renderList();renderChat();
  },
};

/* ============================================================
   MAIL
   ============================================================ */
Apps.mail = {
  name:'Mail', iconClass:'ic-mail', glyph:'✉',
  width:920, height:580, minWidth:560, minHeight:360, singleInstance:true,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`<div style="display:flex;align-items:center;gap:8px;padding:4px 0 12px"><button class="btn btn-primary" id="mail-new">✎ New</button></div>
      <div class="sidebar-section">Mailboxes</div>
      <ul class="sidebar-list">
        <li class="sidebar-item active" data-box="inbox"><span class="si-icon">📥</span>Inbox <span class="muted small" style="margin-left:auto">4</span></li>
        <li class="sidebar-item" data-box="sent"><span class="si-icon">📤</span>Sent</li>
        <li class="sidebar-item" data-box="drafts"><span class="si-icon">📝</span>Drafts</li>
        <li class="sidebar-item" data-box="trash"><span class="si-icon">🗑</span>Trash</li>
      </ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const tb=el('div','win-toolbar');
    tb.innerHTML=`<div class="toolbar-btn">‹</div><div class="toolbar-btn">›</div><div class="toolbar-btn">🗂</div><div class="toolbar-btn">🗑</div><div class="toolbar-sep"></div><div class="win-title" id="mail-title" style="flex:0 0 auto;font-weight:600">Inbox</div><div class="f1"></div>`;
    w.el.querySelector('.win-titlebar').after(tb);
    const content=w.contentEl;
    content.style.cssText='display:flex';
    const listPane=el('div');listPane.style.cssText='width:300px;flex:0 0 auto;border-right:0.5px solid rgba(255,255,255,0.08);overflow:auto';
    const readPane=el('div');readPane.style.cssText='flex:1;display:flex;flex-direction:column;min-width:0';
    content.appendChild(listPane);content.appendChild(readPane);
    const mails=[
      {id:1,from:'Apple',subj:'Welcome to macOS Tahoe',prev:'Discover what\'s new in Tahoe…',body:'<h2>Welcome to macOS Tahoe!</h2><p>Experience the all-new Liquid Glass design, enhanced Spotlight, and more.</p><p>We hope you enjoy the new macOS.</p><p>— The Apple Team</p>',time:'9:42 AM',read:false,av:'#333',box:'inbox'},
      {id:2,from:'GitHub',subj:'[your/repo] New pull request',prev:'A new PR was opened by contributor…',body:'<h3>New Pull Request</h3><p>Repository: your/repo<br>Title: Add dark mode support<br>Opened by: contributor</p><p><a href="#">View on GitHub →</a></p>',time:'8:15 AM',read:false,av:'#24292e',box:'inbox'},
      {id:3,from:'Netflix',subj:'New releases this week',prev:'Check out what\'s new on Netflix…',body:'<h2>New This Week</h2><ul><li>Movie A</li><li>Series B</li><li>Documentary C</li></ul>',time:'Yesterday',read:false,av:'#e50914',box:'inbox'},
      {id:4,from:'Sarah Chen',subj:'Lunch tomorrow?',prev:'Hey, want to grab lunch tomorrow?',body:'<p>Hey!</p><p>Want to grab lunch tomorrow? 12:30 at the usual spot?</p><p>Let me know!<br>Sarah</p>',time:'Yesterday',read:false,av:'#ff375f',box:'inbox'},
      {id:5,from:'Me',subj:'Re: Project update',prev:'Thanks for the update!',body:'<p>Thanks for the update!</p>',time:'Mon',read:true,av:'#0a84ff',box:'sent'},
    ];
    let box='inbox',selId=1;
    function renderList(){
      const list=mails.filter(m=>m.box===box);
      $('#mail-title',tb).textContent=box.charAt(0).toUpperCase()+box.slice(1);
      listPane.innerHTML='';
      list.forEach(m=>{
        const it=el('div');it.style.cssText=`padding:12px;border-bottom:0.5px solid rgba(255,255,255,0.06);cursor:default;${m.id===selId?'background:rgba(255,255,255,0.1)':''}`;
        it.onmouseover=()=>{if(m.id!==selId)it.style.background='rgba(255,255,255,0.05)';};
        it.onmouseout=()=>{if(m.id!==selId)it.style.background='';};
        it.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;gap:8px;align-items:center"><div style="width:8px;height:8px;border-radius:50%;background:${m.read?'transparent':'var(--accent)'}"></div><div style="font-weight:${m.read?400:600}">${m.from}</div></div><div class="small muted">${m.time}</div></div><div style="margin:4px 0 2px;font-weight:${m.read?400:600};font-size:13px">${m.subj}</div><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.prev}</div>`;
        it.onclick=()=>{selId=m.id;m.read=true;renderList();renderRead();};
        listPane.appendChild(it);
      });
    }
    function renderRead(){
      const m=mails.find(x=>x.id===selId);
      if(!m){readPane.innerHTML='<div class="muted" style="margin:auto">No message selected</div>';return;}
      readPane.innerHTML=`<div style="padding:16px;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><div style="width:40px;height:40px;border-radius:50%;background:${m.av};display:flex;align-items:center;justify-content:center;font-weight:600">${m.from[0]}</div><div><div style="font-weight:600">${m.from}</div><div class="small muted">to me · ${m.time}</div></div></div><h2 style="font-size:18px;margin-bottom:8px">${m.subj}</h2></div><div style="flex:1;overflow:auto;padding:0 16px 20px;line-height:1.6">${m.body}</div><div style="display:flex;gap:8px;padding:12px;border-top:0.5px solid rgba(255,255,255,0.08)"><button class="btn">↩ Reply</button><button class="btn">↪ Forward</button><button class="btn">🗑 Delete</button></div>`;
    }
    $$('.sidebar-item[data-box]',sidebar).forEach(it=>it.onclick=()=>{$$('.sidebar-item[data-box]',sidebar).forEach(x=>x.classList.remove('active'));it.classList.add('active');box=it.dataset.box;renderList();});
    $('#mail-new',sidebar).onclick=()=>{readPane.innerHTML=`<div style="padding:16px;display:flex;flex-direction:column;gap:10px;height:100%"><input placeholder="To:" ><input placeholder="Subject:"><textarea style="flex:1" placeholder="Compose your message…"></textarea><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn">Cancel</button><button class="btn btn-primary" onclick="OS.toast&&OS.toast('Message sent')">Send</button></div></div>`;};
    renderList();renderRead();
  },
};

/* ============================================================
   TEXT EDIT
   ============================================================ */
Apps.textedit = {
  name:'TextEdit', iconClass:'ic-text', glyph:'📄',
  width:680, height:520, minWidth:360, minHeight:240,
  onOpen(w, opts){
    w.unified=true;
    const tb=el('div','win-toolbar');
    tb.innerHTML=`<div class="toolbar-btn" data-act="bold" title="Bold"><b>B</b></div>
      <div class="toolbar-btn" data-act="italic" title="Italic"><i>I</i></div>
      <div class="toolbar-btn" data-act="under" title="Underline"><u>U</u></div>
      <div class="toolbar-sep"></div>
      <select id="te-size" style="background:rgba(255,255,255,0.1);color:#fff;border:0.5px solid rgba(255,255,255,0.16);border-radius:6px;padding:2px 6px"><option>13</option><option>14</option><option>16</option><option>18</option><option>24</option></select>
      <div class="f1"></div>
      <div class="toolbar-btn" data-act="save" title="Save">💾</div>`;
    w.el.querySelector('.win-titlebar').after(tb);
    const content=w.contentEl;
    const editor=el('div');editor.contentEditable=true;
    editor.style.cssText='flex:1;overflow:auto;padding:24px 40px;outline:none;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.92);min-height:100%';
    editor.innerHTML=opts&&opts.content?`<pre style="white-space:pre-wrap">${opts.content}</pre>`:(opts&&opts.file?`<h1>${opts.file}</h1>`:'<h1>Untitled</h1><p>Start typing…</p>');
    content.appendChild(editor);
    const exec=(cmd,val=null)=>document.execCommand(cmd,false,val);
    tb.querySelector('[data-act=bold]').onclick=()=>exec('bold');
    tb.querySelector('[data-act=italic]').onclick=()=>exec('italic');
    tb.querySelector('[data-act=under]').onclick=()=>exec('underline');
    $('#te-size',tb).onchange=e=>{editor.style.fontSize=e.target.value+'px';};
    tb.querySelector('[data-act=save]').onclick=()=>{store.set('textedit_'+(opts&&opts.file||'untitled'),editor.innerHTML);OS.toast&&OS.toast('Saved');};
    setTimeout(()=>editor.focus(),50);
  },
};

/* ============================================================
   REMINDERS
   ============================================================ */
Apps.reminders = {
  name:'Reminders', iconClass:'ic-remind', glyph:'✓',
  width:680, height:520, minWidth:420, minHeight:320,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`<div class="sidebar-section">My Lists</div>
      <ul class="sidebar-list">
        <li class="sidebar-item active" data-l="today"><span class="si-icon">📅</span>Today</li>
        <li class="sidebar-item" data-l="scheduled"><span class="si-icon">⏰</span>Scheduled</li>
        <li class="sidebar-item" data-l="all"><span class="si-icon">📋</span>All</li>
        <li class="sidebar-item" data-l="flagged"><span class="si-icon">🚩</span>Flagged</li>
      </ul>
      <div class="sidebar-section">Lists</div>
      <ul class="sidebar-list"><li class="sidebar-item" data-l="reminders"><span class="si-icon">🔁</span>Reminders</li><li class="sidebar-item" data-l="shopping"><span class="si-icon">🛒</span>Shopping</li></ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const tb=el('div','win-toolbar');
    tb.innerHTML=`<div class="toolbar-btn" id="rem-add">＋</div><div class="win-title" style="flex:0 0 auto;font-weight:600" id="rem-title">Today</div><div class="f1"></div>`;
    w.el.querySelector('.win-titlebar').after(tb);
    const content=w.contentEl;
    content.style.cssText='padding:8px 16px;overflow:auto';
    let items=store.get('reminders',[
      {id:1,t:'Review pull requests',done:false,list:'today'},
      {id:2,t:'Call dentist',done:false,list:'today'},
      {id:3,t:'Buy groceries',done:true,list:'today'},
      {id:4,t:'Submit expense report',done:false,list:'today'},
    ]);
    let curList='today';
    function save(){store.set('reminders',items);}
    function render(){
      const list=items.filter(i=>curList==='all'||i.list===curList);
      $('#rem-title',tb).textContent=curList.charAt(0).toUpperCase()+curList.slice(1);
      content.innerHTML='';
      const doneCt=list.filter(i=>i.done).length;
      const hdr=el('div','',`${list.length-doneCt} remaining · ${doneCt} completed`);hdr.style.cssText='padding:8px 4px;font-size:13px;opacity:0.6';content.appendChild(hdr);
      list.forEach(it=>{
        const row=el('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:0.5px solid rgba(255,255,255,0.06)';
        const cb=el('div');cb.style.cssText=`width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center;flex:0 0 auto;cursor:default;${it.done?'background:var(--accent);border-color:var(--accent)':''}`;
        cb.innerHTML=it.done?'<span style="color:#fff;font-size:12px">✓</span>':'';
        cb.onclick=()=>{it.done=!it.done;save();render();};
        const lbl=el('div','',it.t);lbl.style.cssText=`flex:1;${it.done?'text-decoration:line-through;opacity:0.5':''}`;
        row.appendChild(cb);row.appendChild(lbl);
        const del=el('div','toolbar-btn','🗑');del.onclick=()=>{items=items.filter(x=>x.id!==it.id);save();render();};row.appendChild(del);
        content.appendChild(row);
      });
      const add=el('div');add.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 4px';
      add.innerHTML=`<div style="width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(255,255,255,0.3);flex:0 0 auto"></div><input id="rem-in" type="text" placeholder="New Reminder" style="flex:1">`;
      content.appendChild(add);
      const inp=$('#rem-in',add);
      inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&inp.value.trim()){items.push({id:Date.now(),t:inp.value,done:false,list:curList});inp.value='';save();render();$('#rem-in',content)&&$('#rem-in',content).focus();}});
      $('#rem-add',tb).onclick=()=>inp.focus();
    }
    $$('.sidebar-item[data-l]',sidebar).forEach(it=>it.onclick=()=>{$$('.sidebar-item[data-l]',sidebar).forEach(x=>x.classList.remove('active'));it.classList.add('active');curList=it.dataset.l;render();});
    render();
  },
};

/* ============================================================
   APP STORE
   ============================================================ */
Apps.appstore = {
  name:'App Store', iconClass:'ic-appstore', glyph:'A',
  width:900, height:580, minWidth:560, minHeight:380, singleInstance:true,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`<ul class="sidebar-list">
        <li class="sidebar-item active" data-t="discover"><span class="si-icon">🔍</span>Discover</li>
        <li class="sidebar-item" data-t="arcade"><span class="si-icon">🎮</span>Arcade</li>
        <li class="sidebar-item" data-t="create"><span class="si-icon">🎨</span>Create</li>
        <li class="sidebar-item" data-t="work"><span class="si-icon">💼</span>Work</li>
        <li class="sidebar-item" data-t="play"><span class="si-icon">▶</span>Play</li>
        <li class="sidebar-item" data-t="dev"><span class="si-icon">⌨</span>Develop</li>
        <li class="sidebar-item" data-t="cat"><span class="si-icon">☰</span>Categories</li>
        <li class="sidebar-item" data-t="upd"><span class="si-icon">⬇</span>Updates</li>
      </ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const content=w.contentEl;
    content.style.cssText='overflow:auto;padding:0';
    const apps=[
      {n:'Pixelmator Pro',d:'Photo editing, reinvented',p:'$49.99',ic:'#bf5af2',g:'🖼',cat:'create'},
      {n:'Final Cut Pro',d:'Apple\'s pro video editor',p:'$299.99',ic:'#ff375f',g:'🎬',cat:'create'},
      {n:'Logic Pro',d:'Music production studio',p:'$199.99',ic:'#ff9f0a',g:'🎵',cat:'create'},
      {n:'Xcode',d:'Build apps for Apple platforms',p:'Free',ic:'#0a84ff',g:'⌨',cat:'dev'},
      {n:'Things 3',d:'The award-winning to-do app',p:'$49.99',ic:'#64d2ff',g:'✓',cat:'work'},
      {n:'Bear',d:'Beautiful note-taking',p:'Free',ic:'#fff',g:'🐻',cat:'work'},
      {n:'Minecraft',d:'Build your world',p:'$29.99',ic:'#30d158',g:'⛏',cat:'play'},
      {n:'Stardew Valley',d:'Farming sim adventure',p:'$14.99',ic:'#ff9f0a',g:'🌾',cat:'play'},
      {n:'1Password',d:'Password manager',p:'Free',ic:'#0a84ff',g:'🔑',cat:'work'},
      {n:'CleanMyMac X',d:'Clean & optimize your Mac',p:'$39.95',ic:'#30d158',g:'🧹',cat:'work'},
    ];
    function render(tab){
      content.innerHTML='';
      const hero=el('div');hero.style.cssText='padding:30px;background:linear-gradient(135deg,#6a5cff,#0a84ff);margin:16px;border-radius:16px';
      hero.innerHTML=`<div class="small" style="opacity:0.8;margin-bottom:6px">APP OF THE DAY</div><h1 style="font-size:28px;margin-bottom:8px">Discover Great Apps</h1><p style="opacity:0.9">Handpicked apps that shine on macOS Tahoe.</p><button class="btn" style="margin-top:14px;background:rgba(255,255,255,0.2)">Get</button>`;
      content.appendChild(hero);
      const list=tab==='discover'?apps:apps.filter(a=>a.cat===tab);
      const grid=el('div');grid.style.cssText='padding:0 20px 20px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px';
      content.appendChild(grid);
      list.forEach(a=>{
        const card=el('div');card.style.cssText='display:flex;align-items:center;gap:14px;padding:12px;background:rgba(255,255,255,0.06);border-radius:12px';
        card.innerHTML=`<div class="ic" style="width:56px;height:56px;border-radius:13px;background:${a.ic};display:flex;align-items:center;justify-content:center;font-size:28px;flex:0 0 auto">${a.g}</div><div style="flex:1;min-width:0"><div style="font-weight:600">${a.n}</div><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.d}</div></div><button class="btn btn-primary" style="flex:0 0 auto">${a.p}</button>`;
        grid.appendChild(card);
      });
    }
    $$('.sidebar-item[data-t]',sidebar).forEach(it=>it.onclick=()=>{$$('.sidebar-item[data-t]',sidebar).forEach(x=>x.classList.remove('active'));it.classList.add('active');render(it.dataset.t);});
    render('discover');
  },
};

})();
