/* =====================================================================
   Tahoe Web — data layer: utils, VFS, generated artwork, mock content
   ===================================================================== */
'use strict';

/* ---------------- tiny utils ---------------- */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v,a,b) => Math.min(b, Math.max(a,v));
let __uid = 1;
const uid = () => 'id' + (Date.now().toString(36)) + (__uid++).toString(36);

function h(tag, attrs={}, ...kids){
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs||{})){
    if (v == null) continue;
    if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else e.setAttribute(k, v);
  }
  kids.flat(9).forEach(k => { if (k==null||k===false) return; e.append(k.nodeType ? k : String(k)); });
  return e;
}

function load(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } }
function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

/* date/time helpers */
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_S = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtTime(d=new Date()){ let hh=d.getHours(), mm=String(d.getMinutes()).padStart(2,'0'); const ap=hh>=12?'PM':'AM'; hh=hh%12||12; return `${hh}:${mm} ${ap}`; }
function fmtTime24(d=new Date()){ return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`; }
function fmtDate(d=new Date()){ return `${MONTHS_S[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }
function fmtDateShort(d=new Date()){ return `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`; }
function fmtMenuClock(d=new Date()){ return `${DAYS_S[d.getDay()]} ${MONTHS_S[d.getMonth()]} ${d.getDate()}  ${fmtTime(d)}`; }
function dISO(offset=0){ const d=new Date(); d.setDate(d.getDate()+offset); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function fromISO(iso){ const [y,m,dd]=iso.split('-').map(Number); return new Date(y, m-1, dd); }
function daysAgo(n, hh=10, mm=0){ const d=new Date(); d.setDate(d.getDate()-n); d.setHours(hh,mm,0,0); return d.getTime(); }
function timeAgo(ts){ const s=(Date.now()-ts)/1000; if(s<60) return 'just now'; if(s<3600) return Math.floor(s/60)+'m ago'; if(s<86400) return Math.floor(s/3600)+'h ago'; const d=new Date(ts); return fmtDateShort(d); }
function fmtBytes(n){ if(n<1024) return n+' bytes'; if(n<1048576) return Math.round(n/1024)+' KB'; if(n<1073741824) return (n/1048576).toFixed(1)+' MB'; return (n/1073741824).toFixed(1)+' GB'; }
function hash32(str){ let x=2166136261; for(let i=0;i<str.length;i++){ x^=str.charCodeAt(i); x=Math.imul(x,16777619); } return x>>>0; }
function seedRand(seed){ let a=typeof seed==='number'?seed:hash32(String(seed)); return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const pick = (rnd, arr) => arr[Math.floor(rnd()*arr.length)];

/* =====================================================================
   Virtual File System
   node: {type:'folder', children:{}, date} | {type:'file', kind, content?, img?, appId?, date, size?}
   ===================================================================== */
function folder(children={}, date=daysAgo(30)){ return {type:'folder', children, date}; }
function file(kind, opts={}){ return Object.assign({type:'file', kind, date:daysAgo(4)}, opts); }

const ROOT = folder({
  'Applications': folder({}, daysAgo(60)),   // populated by core with registered apps
  'System': folder({ 'Library': folder({}, daysAgo(300)) }, daysAgo(300)),
  'Library': folder({}, daysAgo(120)),
  'Users': folder({
    'mike': folder({
      'Desktop': folder({
        'Welcome.txt': file('txt', { content:
`Welcome to Tahoe Web!

This entire desktop runs in your browser — every app in the Dock opens, every menu in the menu bar works.

Things to try:
  •  ⌘Space  Spotlight search
  •  F3       Mission Control
  •  ⌘Tab     App switcher
  •  Open Terminal and type:  help
  •  Change the wallpaper in System Settings → Desktop & Dock

Enjoy!`, date: daysAgo(0,8,24) }),
        'Lake Tahoe.png': file('img', { img:'laketahoe', date: daysAgo(1,17,40) }),
      }, daysAgo(1)),
      'Documents': folder({
        'Projects': folder({
          'Tahoe Web': folder({
            'readme.md': file('md', { content:'# Tahoe Web\n\nA pixel-loving recreation of macOS Tahoe that runs entirely in a single web page.\n\n## Stack\n- Vanilla HTML / CSS / JS\n- Zero dependencies\n- localStorage persistence\n', date: daysAgo(0,9,12) }),
            'TODO.txt': file('txt', { content:'- polish dock magnification\n- add more wallpapers\n- ship it\n', date: daysAgo(0,11,2) }),
          }, daysAgo(0)),
        }, daysAgo(6)),
        'Trip Itinerary.txt': file('txt', { content:'LAKE TAHOE — LONG WEEKEND\n\nFri  Drive up, stop at Emerald Bay\nSat  Kayak in the morning, Eagle Falls hike\nSun  Brunch at the lodge, drive home\n\nPack: sunscreen, layers, camera.\n', date: daysAgo(2,15,9) }),
        'Recipes.md': file('md', { content:'# Recipes\n\n## Brown Butter Chocolate Chip Cookies\n- 2 sticks butter, browned\n- 1 cup brown sugar, 1/2 cup white\n- 2 eggs + 1 yolk\n- 2 cups flour, 1 tsp baking soda\n- Flaky salt on top\n\n375°F for 11 minutes. Rest 10.\n', date: daysAgo(5,20,31) }),
        'Cover Letter.txt': file('txt', { content:'Dear Hiring Team,\n\nI build things people love to use...\n', date: daysAgo(9,13,44) }),
        'Q3 Report.pdf': file('pdf', { content:`Q3 ENGINEERING REPORT

Highlights
• Shipped the Liquid Glass redesign to 100% of users
• Crash-free sessions now at 99.8%
• Desktop web traffic up 14% quarter over quarter

Next quarter
• Tahoe Web public launch
• Spotlight performance improvements
• New photo rendering pipeline`, date: daysAgo(3,10,0) }),
      }, daysAgo(3)),
      'Downloads': folder({
        'tahoe-wallpapers.zip': file('zip', { size: 42_000_000, date: daysAgo(1,12,5) }),
        'Screenshot.png': file('img', { img:'screenshot', date: daysAgo(1,12,4) }),
      }, daysAgo(1)),
      'Pictures': folder({
        'Big Sur Coast.png':   file('img', { img:'bigsur',   date: daysAgo(2,16,20) }),
        'Emerald Bay.png':     file('img', { img:'emeraldbay', date: daysAgo(12,11,15) }),
        'Desert Bloom.png':    file('img', { img:'desert',   date: daysAgo(23,18,2) }),
        'Night Sky.png':       file('img', { img:'nightsky', date: daysAgo(31,22,48) }),
      }, daysAgo(2)),
      'Music': folder({}, daysAgo(20)),
      'Public': folder({}, daysAgo(60)),
      '.Trash': folder({}, daysAgo(0)),
    }, daysAgo(90)),
  }, daysAgo(90)),
}, daysAgo(300));

const HOME = '/Users/mike';
const TRASH = HOME + '/.Trash';

function norm(p){
  if(!p) p = '/';
  const parts = [];
  for (const seg of String(p).split('/')){
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop(); else parts.push(seg);
  }
  return '/' + parts.join('/');
}
function joinPath(base, name){ return norm((base === '/' ? '' : base) + '/' + name); }
function baseName(p){ const b = norm(p).split('/').pop(); return b || '/'; }
function parentPath(p){ const parts = norm(p).split('/'); parts.pop(); return parts.join('/') || '/'; }

function fsn(p){
  p = norm(p);
  if (p === '/') return ROOT;
  let n = ROOT;
  for (const seg of p.slice(1).split('/')){
    if (!n || n.type !== 'folder') return null;
    n = n.children[seg];
  }
  return n || null;
}
function fskids(p, showHidden=false){
  const n = fsn(p);
  if (!n || n.type !== 'folder') return [];
  return Object.entries(n.children)
    .filter(([name]) => showHidden || !name.startsWith('.'))
    .map(([name, node]) => ({ name, node, path: joinPath(p, name) }))
    .sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric:true}));
}
function fsadd(dirPath, name, node){
  const dir = fsn(dirPath);
  if (!dir || dir.type !== 'folder') return false;
  if (dir.children[name]) return false;
  node.date = node.date || Date.now();
  dir.children[name] = node;
  return true;
}
function fsrm(p){
  const parent = fsn(parentPath(p));
  if (!parent || parent.type !== 'folder') return false;
  const name = baseName(p);
  if (!(name in parent.children)) return false;
  delete parent.children[name];
  return true;
}
function fsrename(p, newName){
  const parent = fsn(parentPath(p));
  if (!parent || parent.type !== 'folder') return false;
  const oldName = baseName(p);
  if (!parent.children[oldName] || parent.children[newName]) return false;
  parent.children[newName] = parent.children[oldName];
  delete parent.children[oldName];
  return true;
}
function fsUniqueName(dirPath, name){
  const dir = fsn(dirPath);
  if (!dir.children[name]) return name;
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0,dot) : name;
  const ext  = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  while (dir.children[`${stem} ${i}${ext}`]) i++;
  return `${stem} ${i}${ext}`;
}
function fsdeep(node){
  if (node.type !== 'folder') return Object.assign({}, node);
  const c = {};
  for (const [k,v] of Object.entries(node.children)) c[k] = fsdeep(v);
  return folder(c, node.date);
}
function fsduplicate(p){
  const parent = fsn(parentPath(p));
  const name = baseName(p);
  if (!parent || !parent.children[name]) return null;
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0,dot) : name;
  const ext  = dot > 0 ? name.slice(dot) : '';
  const newName = fsUniqueName(parentPath(p), `${stem} copy${ext}`);
  parent.children[newName] = fsdeep(parent.children[name]);
  return joinPath(parentPath(p), newName);
}
function fsMoveToTrash(p){
  const node = fsn(p);
  if (!node) return false;
  fsadd(TRASH, fsUniqueName(TRASH, baseName(p)), node);
  fsrm(p);
  return true;
}
function fsFind(q, start='/', out=[], limit=40){
  if (!q || out.length >= limit) return out;
  const ql = q.toLowerCase();
  (function walk(path){
    const node = fsn(path);
    if (!node || node.type !== 'folder' || out.length >= limit) return;
    for (const [name, child] of Object.entries(node.children)){
      if (out.length >= limit) return;
      if (name.startsWith('.')) continue;
      const cp = joinPath(path, name);
      if (name.toLowerCase().includes(ql)) out.push({ name, node: child, path: cp });
      if (child.type === 'folder' && (cp === '/System' || cp === '/Library')) continue;
      if (child.type === 'folder') walk(cp);
    }
  })(start);
  return out;
}
function fsCountFiles(){
  let files = 0, folders = 0;
  (function walk(n){ for (const c of Object.values(n.children||{})){ if (c.type === 'folder'){ folders++; walk(c); } else files++; } })(ROOT);
  return { files, folders };
}
function nodeSize(node){
  if (!node) return 0;
  if (node.size) return node.size;
  if (node.type === 'file'){
    if (node.content) return node.content.length;
    if (node.img) return 3_200_000;
    if (node.kind === 'app') return 48_000_000;
    return 128;
  }
  return Object.keys(node.children).length;
}

/* =====================================================================
   Generated artwork (deterministic SVG scenes)
   ===================================================================== */
function svgURI(svg){ return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

function svgArt(seed, w=800, h=600){
  const rnd = seedRand(seed);
  const palettes = [
    ['#7ec8ff','#c8e8ff','#ffd9a0','#3b6ea5','#274b73'],
    ['#ff9a9e','#fecfef','#fad0c4','#b0487a','#5b2a5c'],
    ['#a8edea','#fed6e3','#89f7fe','#3a7bd5','#283e7a'],
    ['#fbc2eb','#a6c1ee','#84fab0','#4a569d','#2c3e70'],
    ['#fddb92','#d1fdff','#fd6e6a','#8360c3','#2ebf91'],
    ['#0f2027','#203a43','#2c5364','#5f9ea0','#8fd3c7'],
  ];
  const night = rnd() < 0.22;
  const pal = night ? ['#0b1026','#1b2340','#41295a','#2F0743','#0b1026'] : pick(rnd, pal);
  const sunX = 15 + rnd()*70, sunY = 12 + rnd()*30, sunR = 8 + rnd()*7;
  const peaks = (base, amp, color, op) => {
    let pts = `0,${base}`;
    const n = 5 + Math.floor(rnd()*4);
    for (let i=0;i<=n;i++) pts += ` ${(i/n*100).toFixed(1)},${(base - rnd()*amp).toFixed(1)}`;
    pts += ` 100,${base}`;
    return `<polygon points="0,100 ${pts} 100,100" fill="${color}" opacity="${op}"/>`;
  };
  let stars = '';
  if (night){
    for (let i=0;i<40;i++) stars += `<circle cx="${(rnd()*100).toFixed(1)}" cy="${(rnd()*55).toFixed(1)}" r="${(rnd()*0.45+0.1).toFixed(2)}" fill="#fff" opacity="${(rnd()*0.8+0.2).toFixed(2)}"/>`;
  }
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${pal[0]}"/><stop offset="0.5" stop-color="${pal[1]}"/><stop offset="1" stop-color="${pal[2]}"/>
</linearGradient></defs>
<rect width="100" height="100" fill="url(#s)"/>
${stars}
<circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(1)}" fill="${night ? '#f2f4ff' : '#fff5d6'}" opacity="${night ? '.95' : '.9'}"/>
<circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${(sunR*1.9).toFixed(1)}" fill="${night ? '#cdd6ff' : '#ffdf8e'}" opacity=".25"/>
${peaks(72, 26, pal[3], .92)}
${peaks(84, 20, pal[4], .95)}
<rect y="88" width="100" height="12" fill="${pal[3]}" opacity=".55"/>
<rect y="88" width="100" height="2" fill="#fff" opacity=".35"/>
</svg>`;
  return svgURI(svg);
}

function coverArt(seed, w=400, h=400){
  const rnd = seedRand('cov' + seed);
  const hues = [rnd()*360|0, rnd()*360|0, rnd()*360|0];
  let shapes = '';
  for (let i=0;i<4;i++){
    shapes += `<circle cx="${rnd()*100}" cy="${rnd()*100}" r="${14+rnd()*30}" fill="hsl(${hues[i%3]},80%,${55+rnd()*25}%)" opacity="${.35+rnd()*.4}"/>`;
  }
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${w}" height="${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hues[0]},70%,38%)"/><stop offset="1" stop-color="hsl(${hues[1]},75%,60%)"/>
</linearGradient></defs>
<rect width="100" height="100" fill="url(#g)"/>${shapes}
<rect width="100" height="100" fill="url(#g)" opacity=".12"/>
</svg>`;
  return svgURI(svg);
}
function avatarColor(name){ const h_ = hash32(name) % 360; return `hsl(${h_},55%,${45 + (hash32(name+'x') % 14)}%)`; }
function avatar(name, size=40, cls=''){
  const initials = name.split(/\s+/).map(w=>w[0]||'').join('').slice(0,2).toUpperCase();
  const el = h('div', { class:'av ' + cls, style:`width:${size}px;height:${size}px;background:${avatarColor(name)};font-size:${Math.round(size*.38)}px` }, initials || '?');
  return el;
}

/* =====================================================================
   Wallpapers
   ===================================================================== */
const WALLPAPERS = [
  { name:'Tahoe Day', css:'radial-gradient(900px 480px at 78% 12%, rgba(255,236,180,.9), transparent 60%), radial-gradient(1200px 700px at 20% 110%, rgba(38,120,110,.55), transparent 60%), linear-gradient(180deg,#79b8f2 0%, #a8d4f7 34%, #6fbfae 62%, #2f7a6b 100%)' },
  { name:'Tahoe Night', css:'radial-gradient(700px 400px at 22% 18%, rgba(180,200,255,.5), transparent 55%), radial-gradient(1000px 700px at 80% 120%, rgba(70,40,120,.8), transparent 65%), linear-gradient(180deg,#0b1026 0%, #1b2340 45%, #412a5e 78%, #1a1230 100%)' },
  { name:'Sierra Dusk', css:'radial-gradient(800px 420px at 68% 74%, rgba(255,130,90,.75), transparent 60%), radial-gradient(900px 500px at 20% 20%, rgba(255,205,140,.5), transparent 55%), linear-gradient(180deg,#35507a 0%, #7a5a8c 46%, #d9825f 78%, #3a2c4a 100%)' },
  { name:'Sequoia Bloom', css:'radial-gradient(1000px 640px at 85% 20%, rgba(214,150,255,.5), transparent 60%), radial-gradient(800px 500px at 12% 95%, rgba(90,160,255,.45), transparent 60%), linear-gradient(160deg,#4b48b8 0%, #7a4fc0 45%, #b857a0 100%)' },
  { name:'Monterey Fog', css:'radial-gradient(1100px 600px at 50% -10%, rgba(255,255,255,.75), transparent 55%), linear-gradient(180deg,#c9d6df 0%, #9fb4c7 52%, #5d7d90 100%)' },
  { name:'Graphite', css:'radial-gradient(900px 500px at 80% 100%, rgba(90,90,110,.6), transparent 60%), linear-gradient(160deg,#232326 0%, #3a3a41 55%, #17171a 100%)' },
];

/* =====================================================================
   Mock content + persisted stores
   ===================================================================== */
const ACCENTS = ['#0a84ff','#bf5af2','#ff375f','#ff9f0a','#ffd60a','#32d74b','#8e8e93'];
const ACCENT_NAMES = {'#0a84ff':'Blue','#bf5af2':'Purple','#ff375f':'Pink','#ff9f0a':'Orange','#ffd60a':'Yellow','#32d74b':'Green','#8e8e93':'Graphite'};

/* ---- Contacts ---- */
let CONTACTS = load('tahoe_contacts', null);
if (!CONTACTS){
  CONTACTS = [
    { id:uid(), first:'Ava', last:'Chen', company:'Radiant Labs', phone:'(415) 555-0182', email:'ava@radiantlabs.example', addr:'1 Infinite Loop, Cupertino CA', note:'Met at WWDC. Loves trail running.', fav:true },
    { id:uid(), first:'Maya', last:'Rivera', company:'Freelance', phone:'(628) 555-0141', email:'maya.r@example.net', addr:'Dolores Park, San Francisco', note:'Sister. Call mom before Friday!!' },
    { id:uid(), first:'Jordan', last:'Kim', company:'Northwind', phone:'(408) 555-0177', email:'j.kim@northwind.example', addr:'', note:'Trivia team captain.' },
    { id:uid(), first:'Sam', last:'Ortiz', company:'Sun Cafe', phone:'(650) 555-0119', email:'sam@suncafe.example', addr:'2240 Bryant St, Palo Alto', note:'Best pour-over in town.' },
    { id:uid(), first:'Priya', last:'Natarajan', company:'Helio Health', phone:'(510) 555-0163', email:'priya.n@helio.example', addr:'', note:'Book club — October pick is hers.' },
    { id:uid(), first:'Leo', last:'Martinez', company:'Bay Frames', phone:'(415) 555-0120', email:'leo@bayframes.example', addr:'', note:'Photo walks every other Sunday.' },
    { id:uid(), first:'Nina', last:'Patel', company:'Caltrain', phone:'(669) 555-0154', email:'nina.patel@example.org', addr:'', note:'' },
    { id:uid(), first:'Theo', last:'Brooks', company:'Moss & Vine', phone:'(925) 555-0136', email:'theo@mossvine.example', addr:'Oakland, CA', note:'Plant guy. Water the fiddle-leaf.' },
    { id:uid(), first:'Grace', last:'Lin', company:'Apple', phone:'(408) 555-0102', email:'gracelin@example.com', addr:'Cupertino, CA', note:'', fav:true },
    { id:uid(), first:'Owen', last:'Shaw', company:'', phone:'(707) 555-0198', email:'owen.shaw@example.com', addr:'Sea Ranch, CA', note:'Has the good kayak. Ask nicely.' },
  ];
  save('tahoe_contacts', CONTACTS);
}
const persistContacts = () => save('tahoe_contacts', CONTACTS);

/* ---- Mail ---- */
let MAIL_DATA = load('tahoe_mail', null);
if (!MAIL_DATA){
  MAIL_DATA = [
    { id:uid(), box:'inbox', from:'Ava Chen <ava@radiantlabs.example>', to:'me', subj:'Tahoe weekend — final plan', date:daysAgo(0,9,2), read:false, flagged:true,
      body:'<p>Hey!</p><p>Locked in: cabin is booked for Friday through Sunday. I\'ll grab groceries on the way up — bring the kayak straps if you have them.</p><p>Forecast is 75 and sunny. Basically perfect.</p><p>— Ava</p>' },
    { id:uid(), box:'inbox', from:'Apple <no-reply@apple.example>', to:'me', subj:'Your receipt from the App Store', date:daysAgo(0,7,41), read:true,
      body:'<p>Dear Mike,</p><p>Thank you for your purchase.</p><p><strong>Procreate-like Paint App</strong> — $12.99</p><p>If you did not make this purchase, visit Report a Problem.</p>' },
    { id:uid(), box:'inbox', from:'Maya Rivera <maya.r@example.net>', to:'me', subj:'Call mom!!', date:daysAgo(1,18,22), read:false,
      body:'<p>Mike.</p><p>It\'s her birthday on Friday and she keeps asking when you\'re calling. Don\'t make me the responsible one.</p><p>Love you. Call her. — M</p>' },
    { id:uid(), box:'inbox', from:'Sun Cafe <hello@suncafe.example>', to:'me', subj:'Your table for Saturday', date:daysAgo(1,9,15), read:true,
      body:'<p>Hi Mike — you\'re confirmed for two, Saturday at 10:30 AM on the patio. See you then!</p>' },
    { id:uid(), box:'inbox', from:'GitHub <noreply@github.example>', to:'me', subj:'[tahoe-web] Build succeeded', date:daysAgo(2,16,58), read:true, flagged:true,
      body:'<p>✅ Deploy preview ready.</p><p>Branch: <strong>main</strong><br>Commit: 4f2a91c — "liquid glass polish"</p>' },
    { id:uid(), box:'inbox', from:'Leo Martinez <leo@bayframes.example>', to:'me', subj:'Prints are ready', date:daysAgo(3,14,7), read:true,
      body:'<p>Yo — the 16×20s from our Big Sur shoot came out gorgeous. Swing by the shop this week?</p>' },
    { id:uid(), box:'inbox', from:'App Store <no-reply@appstore.example>', to:'me', subj:'New: apps that play well with widgets', date:daysAgo(4,8,0), read:true,
      body:'<p>Handpicked for you: five apps rebuilt for the Liquid Glass era.</p>' },
    { id:uid(), box:'inbox', from:'Priya Natarajan <priya.n@helio.example>', to:'me', subj:'Book club — October', date:daysAgo(5,19,33), read:true,
      body:'<p>My pick this month: a slim sci-fi novella about a language model that dreams. Too on the nose? We\'ll discuss. 😄</p>' },
    { id:uid(), box:'junk', from:'Prize Central <winner@prizecentral.example>', to:'me', subj:'CONGRATULATIONS you won!!!', date:daysAgo(2,3,12), read:false,
      body:'<p>You have been selected to receive a FREE boat. Click here to claim now.</p>' },
    { id:uid(), box:'sent', from:'me', to:'ava@radiantlabs.example', subj:'Re: Tahoe weekend — final plan', date:daysAgo(0,9,30), read:true,
      body:'<p>Perfect — straps are in the garage. I\'ll handle coffee and snacks. See you Friday at 5!</p>' },
  ];
  save('tahoe_mail', MAIL_DATA);
}
const persistMail = () => save('tahoe_mail', MAIL_DATA);

/* ---- Messages ---- */
let THREADS = load('tahoe_threads', null);
if (!THREADS){
  const c = i => CONTACTS[i % CONTACTS.length].id;
  THREADS = [
    { id:uid(), contact:c(8), msgs:[
      { me:false, text:'Did you see the new Tahoe wallpapers?', ts:daysAgo(0,8,50) },
      { me:true, text:'The night one is stunning', ts:daysAgo(0,8,54) },
      { me:false, text:'Right?? I set it on everything. Even my watch.', ts:daysAgo(0,8,55) },
    ]},
    { id:uid(), contact:c(1), msgs:[
      { me:false, text:'Are you calling mom or am I disowning you', ts:daysAgo(0,7,30) },
      { me:true, text:'Calling her tonight I promise 😅', ts:daysAgo(0,7,44) },
      { me:false, text:'That\'s what you said Tuesday', ts:daysAgo(0,7,45) },
    ]},
    { id:uid(), contact:c(0), msgs:[
      { me:false, text:'Cabin booked!! 🏔️', ts:daysAgo(1,16,10) },
      { me:true, text:'Yesss. I\'ll bring the straps', ts:daysAgo(1,16,22) },
      { me:false, text:'And your famous cookie batch?', ts:daysAgo(1,16,23) },
      { me:true, text:'Obviously', ts:daysAgo(1,16,24) },
    ]},
    { id:uid(), contact:c(2), msgs:[
      { me:false, text:'Trivia moved to 8 this week', ts:daysAgo(2,19,5) },
      { me:true, text:'I\'ll be there. Studying 90s sitcoms now', ts:daysAgo(2,19,7) },
    ]},
    { id:uid(), contact:c(5), msgs:[
      { me:false, text:'Big Sur prints are back. They look unreal.', ts:daysAgo(3,12,40) },
      { me:true, text:'Can\'t wait — picking up Saturday?', ts:daysAgo(3,13,2) },
      { me:false, text:'Perfect, shop\'s open til 6', ts:daysAgo(3,13,5) },
    ]},
  ];
  save('tahoe_threads', THREADS);
}
const persistThreads = () => save('tahoe_threads', THREADS);

/* ---- Notes ---- */
let NOTES = load('tahoe_notes', null);
if (!NOTES){
  NOTES = [
    { id:uid(), folder:'Notes', title:'Welcome to Notes', html:'<h1>Welcome to Notes</h1><p>Everything you type here <b>saves automatically</b> — bold it, <i>italicize</i>, make lists. Try the toolbar above.</p><p>Your notes stick around between visits, too.</p>', updated:daysAgo(0,8,12) },
    { id:uid(), folder:'Notes', title:'Trip checklist', html:'<h1>Trip checklist</h1><p>☐ Kayak straps<br>☐ Sunscreen<br>☐ Camera batteries<br>☐ Cookies (double batch)<br>☐ Layers for the lake</p>', updated:daysAgo(1,11,3) },
    { id:uid(), folder:'Ideas', title:'App ideas', html:'<h1>App ideas</h1><p>1. A browser that is also an operating system<br>2. A wallpaper that changes with the weather<br>3. A keyboard that learns your typos</p>', updated:daysAgo(6,22,41) },
  ];
  save('tahoe_notes', NOTES);
}
const persistNotes = () => save('tahoe_notes', NOTES);

/* ---- Reminders ---- */
let REM_DATA = load('tahoe_reminders', null);
if (!REM_DATA){
  REM_DATA = {
    lists: [
      { id:'personal', name:'Personal', color:'#0a84ff' },
      { id:'groceries', name:'Groceries', color:'#32d74b' },
      { id:'work', name:'Work', color:'#ff9f0a' },
    ],
    tasks: [
      { id:uid(), list:'personal', title:'Call mom for her birthday', done:false, flagged:true, due:1 },
      { id:uid(), list:'personal', title:'Book cabin for Tahoe weekend', done:true, flagged:false },
      { id:uid(), list:'personal', title:'Get kayak straps from garage', done:false, flagged:false },
      { id:uid(), list:'groceries', title:'Eggs', done:false, flagged:false },
      { id:uid(), list:'groceries', title:'Brown butter (for cookies)', done:false, flagged:false },
      { id:uid(), list:'groceries', title:'Coffee beans — Sun Cafe roast', done:true, flagged:false },
      { id:uid(), list:'work', title:'Ship Tahoe Web', done:false, flagged:true, due:0 },
      { id:uid(), list:'work', title:'Review launch checklist', done:false, flagged:false },
    ],
  };
  save('tahoe_reminders', REM_DATA);
}
const persistRem = () => save('tahoe_reminders', REM_DATA);

/* ---- Calendar ---- */
let CAL_EVENTS = load('tahoe_events', null);
if (!CAL_EVENTS){
  CAL_EVENTS = [
    { id:uid(), title:'Design review', date:dISO(0), time:'10:00', color:'#0a84ff' },
    { id:uid(), title:'Lunch with Sam', date:dISO(0), time:'12:30', color:'#32d74b' },
    { id:uid(), title:'Mom\'s birthday 🎂', date:dISO(1), time:'', color:'#ff375f' },
    { id:uid(), title:'Trivia night', date:dISO(3), time:'20:00', color:'#ff9f0a' },
    { id:uid(), title:'Tahoe weekend', date:dISO(9), time:'', color:'#bf5af2' },
    { id:uid(), title:'Dentist', date:dISO(6), time:'09:00', color:'#8e8e93' },
    { id:uid(), title:'Photo walk — Sea Ranch', date:dISO(-12), time:'15:00', color:'#0a84ff' },
  ];
  save('tahoe_events', CAL_EVENTS);
}
const persistEvents = () => save('tahoe_events', CAL_EVENTS);

/* ---- Photos ---- */
let PHOTO_LIB = load('tahoe_photos', null);
if (!PHOTO_LIB){
  PHOTO_LIB = [
    ['Big Sur Coast','bigsur',2], ['Emerald Bay','emeraldbay',12], ['Golden Hour Dunes','dunes',5],
    ['Fog over the Bridge','karlthefog',9], ['Yosemite Falls','yosemite',16], ['Night Sky, Sea Ranch','nightsky',31],
    ['Poppy Fields','poppies',25], ['Half Dome at Dawn','halfdome',18], ['Lake Crescent','crescent',7],
    ['Desert Bloom','desert',23], ['Tide Pools','tidepools',4], ['Redwood Cathedral','redwoods',28],
    ['Sunset Cliffs','sunsetcliffs',1], ['Alpine Meadow','meadow',34], ['Monsoon Sky','monsoon',40],
    ['Winter Shore','wintershore',44], ['City Lights','citylights',37], ['Morning Paddle','paddle',3],
  ].map(([name, seed, ago], i) => ({ id:uid(), name, seed, date:daysAgo(ago, 9+i, 12), fav: i%5===0, deleted:false }));
  save('tahoe_photos', PHOTO_LIB);
}
const persistPhotos = () => save('tahoe_photos', PHOTO_LIB);

/* ---- Music (synth-engine driven) ---- */
const SCALE_MAJOR = [0,2,4,7,9];
const SCALE_MINOR = [0,3,5,7,10];
const TRACKS = [
  { id:'t1',  title:'Glasshouse',        artist:'Neural Bloom',  album:'Glasshouse',        dur:186, seed:'nb1', root:220.0, bpm:112, scale:SCALE_MAJOR, mood:.7 },
  { id:'t2',  title:'Specular',          artist:'Neural Bloom',  album:'Glasshouse',        dur:172, seed:'nb2', root:196.0, bpm:104, scale:SCALE_MAJOR, mood:.5 },
  { id:'t3',  title:'Translucent',       artist:'Neural Bloom',  album:'Glasshouse',        dur:201, seed:'nb3', root:174.6, bpm:96,  scale:SCALE_MINOR, mood:.4 },
  { id:'t4',  title:'Frost Line',        artist:'Neural Bloom',  album:'Glasshouse',        dur:159, seed:'nb4', root:233.1, bpm:120, scale:SCALE_MAJOR, mood:.8 },
  { id:'t5',  title:'Midnight Gradient', artist:'Vector Fields', album:'Midnight Gradient', dur:214, seed:'vf1', root:146.8, bpm:88,  scale:SCALE_MINOR, mood:.35 },
  { id:'t6',  title:'Neon Tide',         artist:'Vector Fields', album:'Midnight Gradient', dur:177, seed:'vf2', root:164.8, bpm:98,  scale:SCALE_MINOR, mood:.55 },
  { id:'t7',  title:'CRT Garden',        artist:'Vector Fields', album:'Midnight Gradient', dur:193, seed:'vf3', root:155.6, bpm:92,  scale:SCALE_MINOR, mood:.45 },
  { id:'t8',  title:'Lake Sessions I',   artist:'Sierra Echo',   album:'Lake Sessions',     dur:233, seed:'se1', root:261.6, bpm:72,  scale:SCALE_MAJOR, mood:.3 },
  { id:'t9',  title:'Granite & Pine',    artist:'Sierra Echo',   album:'Lake Sessions',     dur:206, seed:'se2', root:246.9, bpm:78,  scale:SCALE_MAJOR, mood:.4 },
  { id:'t10', title:'Emerald Bay',       artist:'Sierra Echo',   album:'Lake Sessions',     dur:221, seed:'se3', root:220.0, bpm:66,  scale:SCALE_MAJOR, mood:.25 },
];
const ALBUMS = [...new Set(TRACKS.map(t=>t.album))].map(name => ({ name, artist: TRACKS.find(t=>t.album===name).artist, seed:'alb'+name.split(' ')[0], tracks: TRACKS.filter(t=>t.album===name) }));
let MUSIC_STATE = load('tahoe_music', { loved:{}, lastTrack:null });
const persistMusic = () => save('tahoe_music', MUSIC_STATE);

/* ---- Weather ---- */
function wxHourly(baseT, icon, spread=4){
  const out = [{h:'Now', t:baseT, ic:icon}];
  const cur = new Date().getHours();
  for (let i=1;i<=10;i++){
    const hr = (cur + i) % 24;
    const dk = hr < 6 || hr > 20;
    out.push({ h: fmtTime(new Date().setHours(hr,0,0,0)).replace(':00 ',' '), t: baseT + Math.round((Math.sin(i/2.2)*spread) - i*0.3), ic: dk && (icon==='☀️'||icon==='⛅') ? '🌙' : icon });
  }
  return out;
}
function wxDays(city, baseT, lo, icons){
  const out = [{d:'Today', ic:icons[0], hi:baseT+3, lo:lo, rain: city.rain||0}];
  for (let i=1;i<10;i++){
    const d = new Date(); d.setDate(d.getDate()+i);
    out.push({ d: DAYS_S[d.getDay()], ic: icons[i % icons.length], hi: baseT + ((i*7)%6) - 1, lo: lo + ((i*3)%4), rain: (i*city.rainSeed)%3===0 ? 40 : (city.rain||0) });
  }
  return out;
}
const WEATHER_CITIES = [
  { name:'Cupertino', cond:'Sunny', t:74, ic:'☀️', hum:'41%', wind:'7 mph', uv:'6 High', feels:74, aqi:'24 Good', rain:0, rainSeed:5, vis:'18 mi', press:'29.98 inHg',
    hourly: wxHourly(74,'☀️'), sky:'linear-gradient(180deg,#4a90d9,#7ec8ff)' },
  { name:'New York', cond:'Rain', t:59, ic:'🌧️', hum:'84%', wind:'14 mph', uv:'2 Low', feels:57, aqi:'31 Good', rain:80, rainSeed:1, vis:'5 mi', press:'29.71 inHg',
    hourly: wxHourly(59,'🌧️',3), sky:'linear-gradient(180deg,#55616e,#8a99a8)' },
  { name:'Tokyo', cond:'Partly Cloudy', t:66, ic:'⛅', hum:'58%', wind:'9 mph', uv:'4 Moderate', feels:66, aqi:'42 Good', rain:20, rainSeed:2, vis:'10 mi', press:'30.04 inHg',
    hourly: wxHourly(66,'⛅'), sky:'linear-gradient(180deg,#5a7fa8,#b8cfe8)' },
  { name:'London', cond:'Cloudy', t:54, ic:'☁️', hum:'71%', wind:'11 mph', uv:'1 Low', feels:52, aqi:'38 Good', rain:30, rainSeed:1, vis:'7 mi', press:'29.88 inHg',
    hourly: wxHourly(54,'☁️',3), sky:'linear-gradient(180deg,#6b7686,#a8b2c0)' },
  { name:'Sydney', cond:'Clear', t:80, ic:'🌤️', hum:'36%', wind:'6 mph', uv:'8 Very High', feels:81, aqi:'18 Good', rain:0, rainSeed:4, vis:'20 mi', press:'30.10 inHg',
    hourly: wxHourly(80,'🌤️'), sky:'linear-gradient(180deg,#3d84c6,#a8e0ff)' },
];
WEATHER_CITIES.forEach(c => { c.days = wxDays(c, c.t, c.t-12, [c.ic, c.ic, '⛅', '☀️', c.ic, '🌧️'].slice(0,6)); });

/* ---- App Store ---- */
const STORE_APPS = [
  { id:'nebula', name:'Nebula Paint', by:'Radiant Labs', cat:'Graphics & Design', rating:4.8, size:'84 MB', price:'$12.99', seed:'nebulapaint', url:'nebula.app',
    tag:'Paint with light itself.', desc:'A liquid-glass native canvas with brushes that feel like real media. Layers, blend modes, and an undo stack that never judges.' },
  { id:'tides', name:'Tides & Trails', by:'Sierra Echo Co.', cat:'Travel', rating:4.9, size:'42 MB', price:'Free', seed:'tidestrails', url:'tides.app',
    tag:'Every trail, every tide.', desc:'Offline trail maps and tide tables for the entire coast. Beautiful enough to frame, useful enough to save your weekend.' },
  { id:'tempo', name:'Tempo', by:'Metronome Works', cat:'Music', rating:4.6, size:'26 MB', price:'$4.99', seed:'tempoapp', url:'tempo.app',
    tag:'Practice makes perfect.', desc:'A metronome you will actually keep open. Haptics, subdivisions, and setlists that follow your band practice.' },
  { id:'harvest', name:'Harvest', by:'Moss & Vine', cat:'Food & Drink', rating:4.7, size:'61 MB', price:'Free', seed:'harvestapp', url:'harvest.app',
    tag:'Your garden, organized.', desc:'Track what you planted, when to water, and when to harvest. Syncs with local frost dates automatically.' },
  { id:'drift', name:'Drift Sleep', by:'Quiet Machine', cat:'Health & Fitness', rating:4.5, size:'112 MB', price:'$9.99', seed:'driftsleep', url:'drift.app',
    tag:'Fall asleep to weather.', desc:'Generative soundscapes that follow the forecast — rain when it rains, crickets when it clears.' },
  { id:'ledger', name:'Ledgerline', by:'Paper Plane Inc.', cat:'Finance', rating:4.4, size:'33 MB', price:'Free', seed:'ledgerline', url:'ledger.app',
    tag:'Money, minus the anxiety.', desc:'A calm ledger for humans. Envelopes, gentle nudges, and charts that don\'t yell at you.' },
];
let INSTALLED = load('tahoe_installed', []);
const persistInstalled = () => save('tahoe_installed', INSTALLED);

/* ---- Safari ---- */
let BOOKMARKS = load('tahoe_bookmarks', [
  { title:'Apple', url:'apple.com' }, { title:'Wikipedia', url:'en.wikipedia.org/wiki/macOS' },
  { title:'MDN', url:'developer.mozilla.org' }, { title:'GitHub', url:'github.com' }, { title:'Hacker News', url:'news.ycombinator.com' },
]);
let HISTORY = load('tahoe_history', []);
const persistBookmarks = () => save('tahoe_bookmarks', BOOKMARKS);
const persistHistory = () => { HISTORY = HISTORY.slice(-150); save('tahoe_history', HISTORY); };

/* ---- Recent items ---- */
let RECENT = load('tahoe_recent', { apps:[], docs:[] });
function pushRecent(kind, name, meta){
  const list = RECENT[kind] || (RECENT[kind] = []);
  const i = list.findIndex(x => x.name === name);
  if (i >= 0) list.splice(i,1);
  list.unshift(Object.assign({ name }, meta||{}));
  RECENT[kind] = list.slice(0,10);
  save('tahoe_recent', RECENT);
}

/* ---- Misc stores ---- */
let CLOCK_CITIES = load('tahoe_clock', [
  { name:'Cupertino', tz:Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles' },
  { name:'New York', tz:'America/New_York' }, { name:'London', tz:'Europe/London' }, { name:'Tokyo', tz:'Asia/Tokyo' }, { name:'Sydney', tz:'Australia/Sydney' },
]);
const persistClock = () => save('tahoe_clock', CLOCK_CITIES);
let ALARMS = load('tahoe_alarms', [ { id:uid(), time:'07:30', label:'Wake up', on:true }, { id:uid(), time:'09:00', label:'Standup', on:false } ]);
const persistAlarms = () => save('tahoe_alarms', ALARMS);
let TIPS_DISMISSED = load('tahoe_tips_dismissed', false);
