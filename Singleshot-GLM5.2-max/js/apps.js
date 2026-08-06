/* ============================================================
   macOS Tahoe 26 — Applications (part 1)
   Finder, Safari, Notes, Calculator, Terminal, Settings, About, Trash, Help, Siri
   ============================================================ */
(function(){
'use strict';
const Apps = window.Apps = window.Apps || {};
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const el = (t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const store = {get:(k,d)=>{try{return JSON.parse(localStorage.getItem('mac_'+k))??d}catch(e){return d}},set:(k,v)=>localStorage.setItem('mac_'+k,JSON.stringify(v))};

/* ============================================================
   FAKE FILESYSTEM (shared by Finder & Terminal)
   ============================================================ */
const FS = {
  '/':{
    type:'folder',children:{
      'Applications':{type:'folder',children:{
        'Safari.app':{type:'app',app:'safari'},
        'Notes.app':{type:'app',app:'notes'},
        'Calculator.app':{type:'app',app:'calculator'},
        'Terminal.app':{type:'app',app:'terminal'},
        'Music.app':{type:'app',app:'music'},
        'Maps.app':{type:'app',app:'maps'},
        'Mail.app':{type:'app',app:'mail'},
      }},
      'Users':{type:'folder',children:{
        'mike':{type:'folder',children:{
          'Desktop':{type:'folder',children:{
            'Screenshot.png':{type:'file',icon:'🖼',kind:'PNG image',size:'2.4 MB'},
            'Project Ideas.txt':{type:'file',icon:'📄',kind:'Text',size:'1 KB',content:'- Build a macOS clone\n- Learn Liquid Glass\n- Ship it'},
          }},
          'Documents':{type:'folder',children:{
            'Resume.pdf':{type:'file',icon:'📕',kind:'PDF',size:'186 KB'},
            'Budget.xlsx':{type:'file',icon:'📗',kind:'Spreadsheet',size:'42 KB'},
            'Notes.txt':{type:'file',icon:'📄',kind:'Text',size:'3 KB',content:'Remember to backup everything.'},
          }},
          'Downloads':{type:'folder',children:{
            'macOS_Tahoe.dmg':{type:'file',icon:'💿',kind:'Disk Image',size:'14.2 GB'},
            'wallpaper.jpg':{type:'file',icon:'🖼',kind:'JPEG',size:'5.1 MB'},
          }},
          'Pictures':{type:'folder',children:{
            'vacation.jpg':{type:'file',icon:'🖼',kind:'JPEG',size:'3.8 MB'},
            'family.jpg':{type:'file',icon:'🖼',kind:'JPEG',size:'2.1 MB'},
          }},
          'Music':{type:'folder',children:{}},
          'Movies':{type:'folder',children:{}},
        }}
      }},
      'System':{type:'folder',children:{
        'Library':{type:'folder',children:{}},
      }},
    }}
  },
  resolve(path){
    if(path==='/')return this['/'];
    const parts=path.split('/').filter(Boolean);
    let node=this['/'];
    for(const p of parts){if(!node||node.type!=='folder')return null;node=node.children[p];}
    return node;
  },
  parent(path){const i=path.lastIndexOf('/');return i<=0?'/':path.slice(0,i);},
  name(path){return path.split('/').filter(Boolean).pop()||'/';},
};
window.FS = FS;

/* ============================================================
   FINDER
   ============================================================ */
Apps.finder = {
  name:'Finder', iconClass:'ic-finder', glyph:'',
  width:820, height:520, minWidth:480, minHeight:300,
  iconHTML(){return '<svg viewBox="0 0 64 64" width="60%" height="60%"><path fill="#1d7bf0" d="M40 4c-3.3 0-6.3 1.3-8.5 3.4C29.3 5.3 26.3 4 23 4 16.4 4 11 9.4 11 16v32c0 6.6 5.4 12 12 12 3.3 0 6.3-1.3 8.5-3.4C33.7 58.7 36.7 60 40 60c6.6 0 12-5.4 12-12V16c0-6.6-5.4-12-12-12z"/><path fill="#1d7bf0" d="M33 7.4V57.6C31.1 56 29 55 26.7 54.4 24.7 53.9 22.5 54 21 54c-3.9 0-7-3.1-7-7V18c0-3.9 3.1-7 7-7h2c3 0 6 .9 8.5 2.4 1 .6 1.5-3.5 1.5-6z" opacity=".5"/></svg>';},
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`
      <div class="sidebar-section">Favorites</div>
      <ul class="sidebar-list">
        <li class="sidebar-item" data-path="/Users/mike"><span class="si-icon">🏠</span>Home</li>
        <li class="sidebar-item" data-path="/Users/mike/Desktop"><span class="si-icon">🖥</span>Desktop</li>
        <li class="sidebar-item" data-path="/Users/mike/Documents"><span class="si-icon">📄</span>Documents</li>
        <li class="sidebar-item" data-path="/Users/mike/Downloads"><span class="si-icon">⬇️</span>Downloads</li>
        <li class="sidebar-item" data-path="/Users/mike/Pictures"><span class="si-icon">🖼</span>Pictures</li>
        <li class="sidebar-item" data-path="/Applications"><span class="si-icon">ABB</span>Applications</li>
      </ul>
      <div class="sidebar-section">iCloud</div>
      <ul class="sidebar-list"><li class="sidebar-item"><span class="si-icon">☁️</span>iCloud Drive</li></ul>`;
    body.insertBefore(sidebar, body.firstChild);
    const tb=el('div','win-toolbar');
    tb.innerHTML=`
      <div class="toolbar-btn" data-act="back" title="Back">‹</div>
      <div class="toolbar-btn" data-act="fwd" title="Forward">›</div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-btn ic" style="width:24px;height:24px;background:linear-gradient(180deg,#3aa6ff,#0a6fff);font-size:12px">F</div>
      <div class="win-title" style="flex:0 0 auto;font-size:13px;font-weight:600">Finder</div>
      <div class="f1"></div>
      <div class="toolbar-btn" data-act="icon" title="Icons">▦</div>
      <div class="toolbar-btn" data-act="list" title="List">☰</div>
      <div class="toolbar-sep"></div>
      <div class="toolbar-btn" data-act="new" title="New Folder">＋</div>`;
    w.el.querySelector('.win-titlebar').after(tb);
    // path bar
    const pb=el('div');pb.style.cssText='flex:0 0 auto;height:26px;display:flex;align-items:center;gap:4px;padding:0 12px;font-size:12px;background:rgba(0,0,0,0.2);border-top:0.5px solid rgba(255,255,255,0.08);';
    const content=w.contentEl;
    content.style.cssText='display:flex;flex-direction:column';
    content.appendChild(pb);
    const viewWrap=el('div');viewWrap.style.cssText='flex:1;overflow:auto;padding:14px';
    content.appendChild(viewWrap);

    let path='/Users/mike';const history=[path];let hi=0;
    let viewMode=store.get('finder_view','icon');
    const setMode=m=>{viewMode=m;store.set('finder_view',m);$$('.toolbar-btn[data-act]',tb).forEach(b=>b.classList.toggle('active',b.dataset.act===m));};

    function render(){
      pb.innerHTML='';
      const parts=['/',...path.split('/').filter(Boolean)];
      let acc='';
      parts.forEach((p,i)=>{
        acc=acc==='/'?'/'+p:acc+'/'+p;
        const span=el('span','',p==='/'?'Macintosh HD':p);span.style.cssText='cursor:default;padding:2px 4px;border-radius:4px';
        if(i<parts.length-1){span.innerHTML+=' ›';span.onclick=()=>{path=acc==='/'?'/':acc;navigate();};}
        pb.appendChild(span);
      });
      const node=FS.resolve(path);
      viewWrap.innerHTML='';
      if(!node||node.type!=='folder'){viewWrap.innerHTML='<div class="muted pad">Empty folder</div>';return;}
      const kids=node.children||{};
      const entries=Object.entries(kids);
      if(!entries.length){viewWrap.innerHTML='<div class="muted pad center">This folder is empty.</div>';return;}
      if(viewMode==='icon'){
        viewWrap.style.cssText='flex:1;overflow:auto;padding:20px;display:grid;grid-template-columns:repeat(auto-fill,96px);gap:18px;align-content:start';
        entries.forEach(([name,node])=>{
          const it=el('div');it.style.cssText='display:flex;flex-direction:column;align-items:center;gap:6px;width:96px;cursor:default;border-radius:8px;padding:8px 4px';
          it.onmouseover=()=>it.style.background='rgba(255,255,255,0.1)';
          it.onmouseout=()=>it.style.background='';
          const icon=el('div');icon.style.cssText='width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:40px';
          icon.innerHTML=node.type==='folder'?'<svg viewBox="0 0 64 64" width="100%"><path fill="#74b9ff" d="M6 16c0-2 2-4 4-4h14l4 4h22c2 0 4 2 4 4v6H6z"/><path fill="#0984e3" d="M6 22h52c2 0 4 2 4 4v24c0 2-2 4-4 4H10c-2 0-4-2-4-4z"/></svg>':node.icon||'📄';
          if(node.type==='app'){icon.innerHTML='<div class="ic '+(Apps[node.app]&&Apps[node.app].iconClass||'')+'" style="width:56px;height:56px;border-radius:12px">'+(Apps[node.app]&&Apps[node.app].glyph||'')+'</div>';}
          const lbl=el('div','',name);lbl.style.cssText='font-size:12px;text-align:center;word-break:break-word;max-width:90px;line-height:1.2';
          it.appendChild(icon);it.appendChild(lbl);viewWrap.appendChild(it);
          it.ondblclick=()=>{
            if(node.type==='folder'){path=join(path,name);navigate(true);}
            else if(node.type==='app'){OS.openApp(node.app);}
            else if(node.content){OS.openApp('textedit',{file:name,content:node.content});}
            else{OS.toast?OS.toast('No app to open '+name):null;}
          };
          it.onclick=()=>{$$('.finder-sel',viewWrap).forEach(e=>e.classList.remove('finder-sel'));it.classList.add('finder-sel');};
        });
      } else {
        viewWrap.style.cssText='flex:1;overflow:auto;padding:0';
        const tbl=el('table');tbl.style.cssText='width:100%;border-collapse:collapse;font-size:13px';
        tbl.innerHTML='<thead><tr><th style="text-align:left;padding:6px 12px;opacity:.5;font-weight:500">Name</th><th style="text-align:left;padding:6px 12px;opacity:.5;font-weight:500">Kind</th><th style="text-align:right;padding:6px 12px;opacity:.5;font-weight:500">Size</th></tr></thead><tbody>';
        entries.forEach(([name,node])=>{
          const tr=el('tr');tr.style.cssText='cursor:default';
          tr.onmouseover=()=>tr.style.background='rgba(255,255,255,0.08)';
          tr.onmouseout=()=>tr.style.background='';
          tr.innerHTML=`<td style="padding:5px 12px">${node.type==='folder'?'🗂':(node.icon||'📄')} ${name}</td><td style="padding:5px 12px;opacity:.7">${node.type==='folder'?'Folder':(node.kind||'File')}</td><td style="padding:5px 12px;text-align:right;opacity:.7">${node.size||'—'}</td>`;
          tr.ondblclick=()=>{if(node.type==='folder'){path=join(path,name);navigate(true);}else if(node.type==='app'){OS.openApp(node.app);}else if(node.content){OS.openApp('textedit',{file:name,content:node.content});}};
          tbl.appendChild(tr);
        });
        viewWrap.appendChild(tbl);
      }
    }
    function join(base,name){return base==='/'?'/'+name:base+'/'+name;}
    function navigate(push){
      if(push){history.splice(hi+1);history.push(path);hi=history.length-1;}
      render();
    }
    $$('.sidebar-item[data-path]',sidebar).forEach(it=>it.onclick=()=>{path=it.dataset.path;navigate(true);});
    tb.querySelector('[data-act=back]').onclick=()=>{if(hi>0){hi--;path=history[hi];render();}};
    tb.querySelector('[data-act=fwd]').onclick=()=>{if(hi<history.length-1){hi++;path=history[hi];render();}};
    tb.querySelector('[data-act=icon]').onclick=()=>setMode('icon');
    tb.querySelector('[data-act=list]').onclick=()=>setMode('list');
    tb.querySelector('[data-act=new]').onclick=()=>{OS.toast&&OS.toast('New folder created');};
    setMode(viewMode);
    navigate(false);
  },
  menus:{
    view:w=>[{label:'as Icons',action:()=>{},shortcut:''},{label:'as List'},{sep:true},{label:'Show Path Bar'},{label:'Show Toolbar'}],
    file:w=>[{label:'New Folder',shortcut:'⇧⌘N',action:()=>OS.toast&&OS.toast('New folder')},{label:'New Tab',shortcut:'⌘T'},{sep:true},{label:'Get Info',shortcut:'⌘I'},{label:'Move to Trash',shortcut:'⌘⌫'}],
  }
};
function joinPath(b,n){return b==='/'?'/'+n:b+'/'+n;}

/* ============================================================
   SAFARI
   ============================================================ */
Apps.safari = {
  name:'Safari', iconClass:'ic-safari', glyph:'',
  width:960, height:620, minWidth:480, minHeight:320, singleInstance:false,
  onOpen(w){
    w.unified=true;
    const tb=el('div','win-toolbar');
    tb.style.cssText='gap:6px';
    tb.innerHTML=`
      <div class="toolbar-btn" data-act="back" title="Back">‹</div>
      <div class="toolbar-btn" data-act="fwd" title="Forward">›</div>
      <div class="toolbar-btn" data-act="reload" title="Reload">⟳</div>
      <div class="f1" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);border-radius:8px;padding:4px 10px;margin:0 8px">
        <span style="opacity:.6;font-size:12px">🔒</span>
        <input type="text" id="safari-url" placeholder="Search or enter website name" style="flex:1;background:none;border:none;font-size:13px;color:#fff">
      </div>
      <div class="toolbar-btn" data-act="share" title="Share">⤴</div>
      <div class="toolbar-btn" data-act="tabs" title="Tabs">⊓</div>`;
    w.el.querySelector('.win-titlebar').after(tb);
    const content=w.contentEl;
    content.style.cssText='background:#fff;color:#000;display:flex;flex-direction:column';
    const startPage=`
      <div style="flex:1;overflow:auto;background:linear-gradient(180deg,#1a1140,#3b1d6e);color:#fff;padding:30px">
        <h2 style="font-weight:600;margin-bottom:20px;font-size:20px">Favorites</h2>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:16px" id="sf-fav"></div>
        <h2 style="font-weight:600;margin:26px 0 14px;font-size:20px">Privacy Report</h2>
        <div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px">In the last 7 days, Safari has prevented <b>138 trackers</b> from profiling you.</div>
      </div>`;
    content.innerHTML=startPage;
    const favs=[{n:'Apple',u:'https://www.apple.com',c:'#333',g:''},{n:'Google',u:'https://www.google.com',c:'#4285f4',g:'G'},{n:'Wikipedia',u:'https://en.m.wikipedia.org',c:'#000',g:'W'},{n:'YouTube',u:'https://www.youtube.com',c:'#ff0000',g:'▶'},{n:'GitHub',u:'https://github.com',c:'#24292e',g:''},{n:'Reddit',u:'https://www.reddit.com',c:'#ff4500',g:'r'},{n:'Maps',u:'maps',c:'#3b82f6',g:'📍'},{n:'Weather',u:'weather',c:'#1e3a8a',g:'☁'},{n:'News',u:'https://news.apple.com',c:'#fb2c36',g:'📰'},{n:'Music',u:'music',c:'#fb2c36',g:'♪'},{n:'Mail',u:'mail',c:'#0a84ff',g:'✉'},{n:'Photos',u:'photos',c:'#fff',g:'🌅'}];
    const favWrap=$('#sf-fav',content);
    favs.forEach(f=>{
      const it=el('div');it.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;cursor:default';
      const ic=el('div','ic');ic.style.cssText=`width:56px;height:56px;border-radius:14px;background:${f.c};display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.3)`;ic.textContent=f.g;
      const lbl=el('div','',f.n);lbl.style.cssText='font-size:12px';
      it.appendChild(ic);it.appendChild(lbl);favWrap.appendChild(it);
      it.onclick=()=>navigate(f.u);
    });
    const urlInp=$('#safari-url',tb);
    let history2=[],hi2=-1;
    function navigate(url,silent){
      if(!url){return;}
      const internal={maps:'maps',weather:'weather',music:'music',mail:'mail',photos:'photos'};
      if(internal[url]){OS.openApp(internal[url]);return;}
      let full=url;
      if(!/^https?:\/\//.test(full)){
        if(full.includes('.')&&!full.includes(' ')){full='https://'+full;}
        else{full='https://duckduckgo.com/?q='+encodeURIComponent(full);}
      }
      urlInp.value=url.includes('duckduckgo.com')?decodeURIComponent(url.split('q=')[1]||''):url;
      if(!silent){history2.splice(hi2+1);history2.push(url);hi2=history2.length-1;}
      content.innerHTML=`<div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;background:#1a1140;color:#fff">
        <div style="width:60px;height:60px;border-radius:16px;background:${favs.find(f=>f.u===url)?.c||'#0a84ff'};display:flex;align-items:center;justify-content:center;font-size:30px">${favs.find(f=>f.u===url)?.g||'🌐'}</div>
        <div style="font-weight:600;font-size:16px">Loading ${url.replace(/^https?:\/\//,'').split('/')[0]}…</div>
        <div class="small muted">Safari can't display some sites in a sandboxed frame.</div>
        <iframe src="${full}" style="width:100%;flex:1;border:none;min-height:300px;background:#fff"></iframe>
      </div>`;
      // note: many sites block iframes; the frame shows their fallback
      setTimeout(()=>{
        const fr=$('iframe',content);
        if(fr){fr.onerror=()=>{content.innerHTML='<div class="pad center muted">Page could not be loaded.</div>';};}
      },100);
    }
    tb.querySelector('[data-act=back]').onclick=()=>{if(hi2>0){hi2--;navigate(history2[hi2],true);}};
    tb.querySelector('[data-act=fwd]').onclick=()=>{if(hi2<history2.length-1){hi2++;navigate(history2[hi2],true);}};
    tb.querySelector('[data-act=reload]').onclick=()=>navigate(urlInp.value,true);
    urlInp.addEventListener('keydown',e=>{if(e.key==='Enter')navigate(urlInp.value);});
    w.navigate=navigate;
  },
  menus:{file:w=>[{label:'New Window',shortcut:'⌘N'},{label:'New Tab',shortcut:'⌘T'},{sep:true},{label:'Close',shortcut:'⌘W',action:()=>OS.closeWindow(w)}]},
};

/* ============================================================
   NOTES
   ============================================================ */
Apps.notes = {
  name:'Notes', iconClass:'ic-notes', glyph:'📝',
  width:780, height:520, minWidth:480, minHeight:300,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');
    sidebar.innerHTML=`<div class="sidebar-section">iCloud</div>
      <ul class="sidebar-list">
        <li class="sidebar-item active" data-flt="all"><span class="si-icon">📒</span>All iCloud</li>
        <li class="sidebar-item" data-flt="notes"><span class="si-icon">📝</span>Notes</li>
      </ul>
      <div class="sidebar-section">Folders</div>
      <ul class="sidebar-list"><li class="sidebar-item"><span class="si-icon">🗂</span>Personal</li><li class="sidebar-item"><span class="si-icon">🗂</span>Work</li></ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const tb=el('div','win-toolbar');
    tb.innerHTML=`<div class="toolbar-btn" data-act="new" title="New Note">✎</div>
      <div class="toolbar-btn" data-act="del" title="Delete">🗑</div>
      <div class="toolbar-sep"></div>
      <input type="search" id="notes-search" placeholder="Search" style="width:160px">
      <div class="f1"></div><div class="small muted" id="notes-count"></div>`;
    w.el.querySelector('.win-titlebar').after(tb);
    // two-pane: list + editor
    const content=w.contentEl;
    content.style.cssText='display:flex;flex-direction:row';
    const listPane=el('div');listPane.style.cssText='width:220px;flex:0 0 auto;border-right:0.5px solid rgba(255,255,255,0.08);overflow:auto;background:rgba(0,0,0,0.1)';
    const editorPane=el('div');editorPane.style.cssText='flex:1;display:flex;flex-direction:column;min-width:0';
    content.appendChild(listPane);content.appendChild(editorPane);
    let notes=store.get('notes',[{id:1,title:'Welcome to Notes',body:'<h2>Welcome to Notes</h2><p>This is your first note. It saves automatically to your browser.</p><p>Click ✎ to create a new note.</p>',ts:Date.now()}]);
    let curId=notes[0]?.id;
    function save(){store.set('notes',notes);}
    function renderList(){
      const q=($('#notes-search',tb).value||'').toLowerCase();
      listPane.innerHTML='';
      notes.filter(n=>!q||n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q)).forEach(n=>{
        const it=el('div');it.style.cssText=`padding:10px 12px;cursor:default;border-bottom:0.5px solid rgba(255,255,255,0.06);border-radius:0;${n.id===curId?'background:rgba(255,255,255,0.12)':''}`;
        const plain=n.body.replace(/<[^>]+>/g,' ').slice(0,40);
        it.innerHTML=`<div style="font-weight:600;font-size:13px;margin-bottom:2px">${n.title||'New Note'}</div><div class="small muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${plain||'No additional text'}</div>`;
        it.onclick=()=>{curId=n.id;renderList();renderEditor();};
        listPane.appendChild(it);
      });
      $('#notes-count',tb).textContent=notes.length+' Notes';
    }
    function renderEditor(){
      const n=notes.find(x=>x.id===curId);
      if(!n){editorPane.innerHTML='<div class="pad muted center" style="margin:auto">No Note Selected</div>';return;}
      editorPane.innerHTML=`
        <div style="padding:8px 16px;font-size:11px;opacity:.5;border-bottom:0.5px solid rgba(255,255,255,0.06)">${new Date(n.ts).toLocaleString()}</div>
        <input id="note-title" value="${(n.title||'').replace(/"/g,'&quot;')}" style="border:none;background:none;font-size:20px;font-weight:700;padding:8px 16px;color:#fff;outline:none">
        <div id="note-body" contenteditable="true" style="flex:1;overflow:auto;padding:8px 16px 20px;outline:none;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.92)">${n.body}</div>`;
      const ti=$('#note-title',editorPane),bo=$('#note-body',editorPane);
      ti.oninput=()=>{n.title=ti.value;n.ts=Date.now();save();renderList();};
      bo.oninput=()=>{n.body=bo.innerHTML;n.ts=Date.now();save();renderList();};
    }
    function newNote(){const id=Date.now();notes.unshift({id,title:'',body:'<p></p>',ts:Date.now()});curId=id;save();renderList();renderEditor();$('#note-title',editorPane)&&$('#note-title',editorPane).focus();}
    w.newNote=newNote;
    tb.querySelector('[data-act=new]').onclick=newNote;
    tb.querySelector('[data-act=del]').onclick=()=>{notes=notes.filter(n=>n.id!==curId);curId=notes[0]?.id;save();renderList();renderEditor();};
    $('#notes-search',tb).oninput=renderList;
    renderList();renderEditor();
  },
};

/* ============================================================
   CALCULATOR
   ============================================================ */
Apps.calculator = {
  name:'Calculator', iconClass:'ic-calc', glyph:'',
  width:240, height:340, resizable:false, minWidth:240, minHeight:340,
  onOpen(w){
    w.unified=true;
    const c=w.contentEl;
    c.style.cssText='display:flex;flex-direction:column;padding:12px;background:rgba(0,0,0,0.25)';
    const disp=el('div');disp.style.cssText='flex:1;display:flex;align-items:flex-end;justify-content:flex-end;padding:16px 8px;font-size:48px;font-weight:300;color:#fff;min-height:80px;overflow:hidden';
    disp.textContent='0';
    c.appendChild(disp);
    const grid=el('div');grid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:8px;flex:0 0 auto';
    c.appendChild(grid);
    let cur='0',prev=null,op=null,fresh=true;
    const fmt=n=>{if(n===''||n==null)return '0';const v=typeof n==='number'?n:parseFloat(n);if(isNaN(v))return '0';return (Math.round(v*1e10)/1e10).toString();};
    function setDisp(){let s=cur;if(s.length>9&&parseFloat(s)>999999999)s=parseFloat(s).toExponential(4);disp.textContent=s;}
    function compute(){if(op&&prev!=null){const a=parseFloat(prev),b=parseFloat(cur);let r=a;switch(op){case '+':r=a+b;break;case '−':r=a-b;break;case '×':r=a*b;break;case '÷':r=b===0?0:a/b;}cur=fmt(r);}}
    const layout=[['AC','±','%','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['0','.','⏨','=']];
    layout.forEach(row=>row.forEach(k=>{
      const b=el('button');
      let bg='rgba(255,255,255,0.14)',fg='#fff';
      if(['÷','×','−','+','='].includes(k))bg='var(--accent)';
      else if(['AC','±','%'].includes(k)){bg='rgba(255,255,255,0.28)';}
      if(k==='0')b.style.cssText=`grid-column:span 2;${k==='0'?'':''}`;
      b.style.cssText=`height:48px;border-radius:24px;font-size:22px;font-weight:500;background:${bg};color:${fg};border:none;cursor:default;transition:filter .1s`;
      if(k==='0')b.style.gridColumn='span 2';
      b.textContent=k;
      b.onmouseover=()=>b.style.filter='brightness(1.15)';
      b.onmouseout=()=>b.style.filter='';
      b.onclick=()=>{
        if(/[0-9]/.test(k)){cur=fresh?k:(cur==='0'?k:cur+k);fresh=false;}
        else if(k==='.'){if(!cur.includes('.'))cur+='.';fresh=false;}
        else if(k==='AC'){cur='0';prev=null;op=null;fresh=true;}
        else if(k==='±'){cur=fmt(parseFloat(cur)*-1);}
        else if(k==='%'){cur=fmt(parseFloat(cur)/100);}
        else if(k==='='){compute();op=null;prev=null;fresh=true;}
        else{if(op&&!fresh)compute();prev=cur;op=k;fresh=true;}
        setDisp();
      };
      grid.appendChild(b);
    }));
    setDisp();
  },
};

/* ============================================================
   TERMINAL
   ============================================================ */
Apps.terminal = {
  name:'Terminal', iconClass:'ic-term', glyph:'',
  width:680, height:420, minWidth:360, minHeight:200,
  onOpen(w){
    const c=w.contentEl;
    c.style.cssText='background:rgba(20,20,22,0.9);color:#2bd576;font-family:"SF Mono",Menlo,Consolas,monospace;font-size:13px;padding:12px;overflow:auto;line-height:1.5';
    let cwd='/Users/mike';
    const out=el('div');c.appendChild(out);
    const line=el('div');line.style.cssText='display:flex';
    const prompt=el('span');prompt.style.cssText='color:#4cd964;white-space:nowrap';
    const inp=el('input');inp.style.cssText='flex:1;background:none;border:none;outline:none;color:#2bd576;font-family:inherit;font-size:inherit';
    line.appendChild(prompt);line.appendChild(inp);c.appendChild(line);
    function setPrompt(){prompt.textContent=`mike@MacBook ${cwd} % `;}
    function print(html){const d=el('div');d.innerHTML=html;out.appendChild(d);c.scrollTop=c.scrollHeight;}
    function run(cmd){
      print(`<span style="color:#4cd964">mike@MacBook ${cwd} %</span> ${cmd}`);
      const [name,...args]=cmd.trim().split(/\s+/);
      switch(name){
        case'':break;
        case'help':print('Available: ls, cd, pwd, cat, echo, clear, whoami, date, open, neofetch, help, mkdir, touch, tree');break;
        case'ls':{const n=FS.resolve(cwd);if(n&&n.children)print(Object.keys(n.children).join('  '));else print('');break;}
        case'pwd':print(cwd);break;
        case'whoami':print('mike');break;
        case'date':print(new Date().toString());break;
        case'cd':{const t=args[0]||'/Users/mike';const np=t.startsWith('/')?t:joinPath(cwd,t);const n=FS.resolve(np);if(n&&n.type==='folder')cwd=np;else print('cd: no such directory: '+t);break;}
        case'cat':{const n=FS.resolve(joinPath(cwd,args[0]||''));if(n&&n.content)print(n.content);else if(n)print('');else print('cat: '+args[0]+': No such file');break;}
        case'echo':print(args.join(' '));break;
        case'clear':out.innerHTML='';break;
        case'mkdir':case'touch':print('');break;
        case'tree':print('Applications  Desktop  Documents  Downloads  Movies  Music  Pictures');break;
        case'open':{const a=args[0]&&args[0].replace('.app','');if(a&&Apps[a]){OS.openApp(a);print('Opening '+a+'...');}else print('open: '+args[0]+': not found');break;}
        case'neofetch':print(`<pre style="color:#fff">                   mike@MacBook
              .:'    ----------------
          __ :'__    OS: macOS Tahoe 26
       .'\`__\`-'__\`\`.  Host: MacBook Pro
      :__________.-'   Kernel: Darwin 26.0
      :_________:      Shell: zsh 5.9
       :_________\`-;   DE: Aqua
        \`.__.-.__.'    WM: Quartz Compositor</pre>`);break;
        case'sudo':print('mike is not in the sudoers file. This incident will be reported.');break;
        default:print(`zsh: command not found: ${name}`);
      }
      setPrompt();
    }
    setPrompt();
    print('Last login: '+new Date().toLocaleString()+' on ttys000');
    print('Welcome to macOS Tahoe Terminal. Type <b>help</b> for commands.');
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){run(inp.value);inp.value='';}});
    c.addEventListener('click',()=>inp.focus());
    setTimeout(()=>inp.focus(),50);
  },
};

/* ============================================================
   SYSTEM SETTINGS
   ============================================================ */
Apps.settings = {
  name:'System Settings', iconClass:'ic-settings', glyph:'⚙',
  width:780, height:540, minWidth:560, minHeight:380, singleInstance:true,
  onOpen(w){
    w.sidebar=true;
    const body=w.el.querySelector('.win-body');
    const sidebar=el('div','win-sidebar');sidebar.style.width='210px';
    sidebar.innerHTML=`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:6px">
      <div class="ic ic-settings" style="width:38px;height:38px;border-radius:50%">⚙</div>
      <div><div style="font-weight:600;font-size:13px">Mike</div><div class="small muted">Apple Account</div></div></div>
      <input type="search" placeholder="Search" style="width:100%;margin-bottom:8px">
      <ul class="sidebar-list" id="set-nav">
        <li class="sidebar-item active" data-p="appearance"><span class="si-icon">🎨</span>Appearance</li>
        <li class="sidebar-item" data-p="wallpaper"><span class="si-icon">🌅</span>Wallpaper</li>
        <li class="sidebar-item" data-p="wifi"><span class="si-icon">📶</span>Wi‑Fi</li>
        <li class="sidebar-item" data-p="bluetooth"><span class="si-icon">ᛒ</span>Bluetooth</li>
        <li class="sidebar-item" data-p="network"><span class="si-icon">🌐</span>Network</li>
        <li class="sidebar-item" data-p="general"><span class="si-icon">⚙</span>General</li>
        <li class="sidebar-item" data-p="sound"><span class="si-icon">🔊</span>Sound</li>
        <li class="sidebar-item" data-p="display"><span class="si-icon">🖥</span>Displays</li>
        <li class="sidebar-item" data-p="desktop"><span class="si-icon">🪟</span>Desktop & Dock</li>
        <li class="sidebar-item" data-p="battery"><span class="si-icon">🔋</span>Battery</li>
        <li class="sidebar-item" data-p="privacy"><span class="si-icon">🔒</span>Privacy & Security</li>
      </ul>`;
    body.insertBefore(sidebar,body.firstChild);
    const content=w.contentEl;
    content.style.cssText='padding:0';
    const panes={
      appearance(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Appearance</h2>
        <div style="padding:0 24px;display:flex;gap:24px">
          <div style="text-align:center"><div style="width:90px;height:60px;border-radius:8px;background:linear-gradient(135deg,#fff,#ddd);border:2px solid var(--accent)"></div><div class="small" style="margin-top:6px">Light</div></div>
          <div style="text-align:center"><div style="width:90px;height:60px;border-radius:8px;background:linear-gradient(135deg,#1a1140,#3b1d6e);border:2px solid var(--accent)"></div><div class="small" style="margin-top:6px">Dark</div></div>
          <div style="text-align:center"><div style="width:90px;height:60px;border-radius:8px;background:linear-gradient(135deg,#1a1140,#f0a050)"></div><div class="small" style="margin-top:6px">Auto</div></div>
        </div>
        <div style="padding:20px 24px"><div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>Accent color</span><div style="display:flex;gap:6px">${['#0a84ff','#ff375f','#ff9f0a','#30d158','#bf5af2','#64d2ff'].map(c=>`<div style="width:18px;height:18px;border-radius:50%;background:${c};${c==='#0a84ff'?'box-shadow:0 0 0 2px #fff':''}"></div>`).join('')}</div></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>Show scroll bars</span><span class="muted small">Automatic</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0"><span>Allow wallpaper tinting in windows</span><div style="width:38px;height:22px;background:var(--accent);border-radius:11px;position:relative"><div style="position:absolute;right:2px;top:2px;width:18px;height:18px;background:#fff;border-radius:50%"></div></div></div></div>`;},
      wallpaper(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Wallpaper</h2>
        <div style="padding:0 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">${[
          ['radial-gradient(circle at 20% 20%,rgba(120,90,255,.45),transparent 45%),radial-gradient(circle at 80% 90%,rgba(40,120,255,.5),transparent 50%),linear-gradient(135deg,#1a1140,#7a2a8f,#f0a050)','Tahoe'],
          ['linear-gradient(135deg,#0f2027,#203a43,#2c5364)','Midnight'],
          ['linear-gradient(135deg,#ff9a9e,#fecfef)','Sunrise'],
          ['linear-gradient(135deg,#42275a,#734b6d)','Purple'],
          ['linear-gradient(135deg,#000,#434343)','Graphite'],
          ['radial-gradient(circle at 50% 0%,#1a2a6c,#b21f1f,#fdbb2d)','Solar'],
          ['linear-gradient(135deg,#5614b0,#dbd65c)','Citrus'],
          ['linear-gradient(135deg,#003973,#e5e5be)','Horizon'],
        ].map(([g,n],i)=>`<div class="wp-opt" data-bg="${g}" style="height:80px;border-radius:10px;background:${g};cursor:default;display:flex;align-items:flex-end;padding:6px;font-size:11px;text-shadow:0 1px 2px rgba(0,0,0,.5)">${n}</div>`).join('')}</div>`;},
      wifi(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Wi‑Fi</h2>
        <div style="padding:0 24px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div><div style="font-weight:600">Wi‑Fi</div><div class="small muted">Connected to Home Network</div></div><div style="width:42px;height:24px;background:var(--accent);border-radius:12px;position:relative" id="wifi-tog"><div style="position:absolute;right:2px;top:2px;width:20px;height:20px;background:#fff;border-radius:50%"></div></div></div>
          ${['Home Network','CoffeeShop_Guest','Neighbor_5G','ATT-WIFI'].map((n,i)=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid rgba(255,255,255,0.05)"><span>${n}${i===0?' <span class="small muted">(connected)</span>':''}</span><span>${i===0?'🔒':'📶'}</span></div>`).join('')}
        </div>`;},
      bluetooth(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Bluetooth</h2><div style="padding:0 24px"><div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>Bluetooth</span><div class="small muted">On</div></div>${['AirPods Pro','Magic Mouse','Magic Keyboard','HomePod mini'].map(n=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:0.5px solid rgba(255,255,255,0.05)"><span>${n}</span><span class="small muted">Connected</span></div>`).join('')}</div>`;},
      network(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Network</h2><div style="padding:0 24px"><div style="background:rgba(255,255,255,0.06);border-radius:10px;padding:14px"><div style="font-weight:600;margin-bottom:8px">Wi‑Fi · Home Network</div><div class="small muted">Status: Connected · IP: 192.168.1.42</div></div></div>`;},
      general(){return `<h2 style="padding:20px 24px 8px;font-size:20px">General</h2><div style="padding:0 24px">
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>About</span><span class="muted small">macOS Tahoe 26.0</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>Software Update</span><span class="muted small">Up to date</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>Storage</span><span class="muted small">412 GB available</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0"><span>AirDrop & Handoff</span><span class="muted small">On</span></div></div>`;},
      sound(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Sound</h2><div style="padding:0 24px"><div style="padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div style="margin-bottom:6px">Output volume</div><input type="range" min="0" max="100" value="${OS.state.volume}" style="width:100%" oninput="OS.state.volume=this.value"></div></div>`;},
      display(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Displays</h2><div style="padding:0 24px"><div style="padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div style="margin-bottom:6px">Brightness</div><input type="range" min="20" max="100" value="${OS.state.brightness}" style="width:100%" oninput="document.getElementById('desktop').style.filter='brightness('+(0.5+this.value/200)+')';OS.state.brightness=this.value"></div><div style="display:flex;justify-content:space-between;padding:10px 0"><span>True Tone</span><div style="width:38px;height:22px;background:var(--accent);border-radius:11px;position:relative"><div style="position:absolute;right:2px;top:2px;width:18px;height:18px;background:#fff;border-radius:50%"></div></div></div></div>`;},
      desktop(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Desktop & Dock</h2><div style="padding:0 24px"><div style="padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div style="margin-bottom:6px">Dock size</div><input type="range" min="40" max="90" value="${OS.dockH||72}" style="width:100%"></div><div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>Magnification</span><div style="width:38px;height:22px;background:var(--accent);border-radius:11px;position:relative"><div style="position:absolute;right:2px;top:2px;width:18px;height:18px;background:#fff;border-radius:50%"></div></div></div><div style="display:flex;justify-content:space-between;padding:10px 0"><span>Automatically hide the Dock</span><div style="width:38px;height:22px;background:rgba(255,255,255,0.2);border-radius:11px;position:relative"><div style="position:absolute;left:2px;top:2px;width:18px;height:18px;background:#fff;border-radius:50%"></div></div></div></div>`;},
      battery(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Battery</h2><div style="padding:0 24px"><div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><div style="width:44px;height:22px;border:1px solid rgba(255,255,255,.4);border-radius:4px;position:relative;padding:2px"><div style="width:80%;height:100%;background:#30d158;border-radius:2px"></div></div><div><div style="font-weight:600">82%</div><div class="small muted">Charging · 6:42 remaining</div></div></div><div style="display:flex;justify-content:space-between;padding:10px 0"><span>Low Power Mode</span><div style="width:38px;height:22px;background:rgba(255,255,255,0.2);border-radius:11px;position:relative"><div style="position:absolute;left:2px;top:2px;width:18px;height:18px;background:#fff;border-radius:50%"></div></div></div></div>`;},
      privacy(){return `<h2 style="padding:20px 24px 8px;font-size:20px">Privacy & Security</h2><div style="padding:0 24px">${['Location Services','Contacts','Calendars','Reminders','Photos','Camera','Microphone'].map(s=>`<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span>${s}</span><span class="muted small">On</span></div>`).join('')}</div>`;},
    };
    function show(p){content.innerHTML=`<div style="overflow:auto;height:100%">${panes[p]?panes[p]():'<div class="pad muted">Coming soon</div>'}</div>`;
      if(p==='wallpaper'){$$('.wp-opt',content).forEach(o=>o.onclick=()=>{document.getElementById('desktop').style.background=o.dataset.bg;});}
    }
    $$('#set-nav .sidebar-item',sidebar).forEach(it=>it.onclick=()=>{$$('#set-nav .sidebar-item',sidebar).forEach(x=>x.classList.remove('active'));it.classList.add('active');show(it.dataset.p);});
    show('appearance');
  },
};

/* ============================================================
   ABOUT THIS MAC
   ============================================================ */
Apps.about = {
  name:'About', iconClass:'ic-settings', glyph:'',
  width:420, height:480, resizable:false, hidden:true,
  onOpen(w){
    w.unified=true;w.title='About This Mac';
    const c=w.contentEl;
    c.style.cssText='display:flex;flex-direction:column;align-items:center;padding:30px;text-align:center';
    c.innerHTML=`
      <svg viewBox="0 0 170 170" width="64" height="64" style="margin-bottom:14px"><path fill="#fff" d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.96-3.17-14.33-3.17-4.58 0-9.49 1.05-14.74 3.17-5.25 2.13-9.48 3.24-12.71 3.35-4.93.21-9.84-1.96-14.75-6.52-3.13-2.73-7.04-7.41-11.72-14.04-5.02-7.08-9.15-15.29-12.39-24.66-3.46-10.07-5.19-19.81-5.19-29.21 0-10.82 2.34-20.14 7.03-27.94a41.0 41.0 0 0 1 14.58-14.93A39.2 39.2 0 0 1 49.04 48c3.89 0 8.99 1.2 15.32 3.57 6.32 2.37 10.38 3.57 12.16 3.57 1.33 0 5.84-1.4 13.49-4.21 7.23-2.61 13.33-3.69 18.31-3.26 13.54 1.09 23.72 6.42 30.49 16.01-12.12 7.35-18.1 17.65-17.94 30.86.15 10.29 3.84 18.84 11.06 25.61a36.3 36.3 0 0 0 11.06 7.25c-.89 2.57-1.82 5.04-2.82 7.41zM119.11 7.24c0 8.07-2.95 15.6-8.82 22.55-7.09 8.28-15.66 13.05-24.95 12.3a25.1 25.1 0 0 1-.19-3.06c0-7.74 3.37-16.03 9.35-22.81a38.6 38.6 0 0 1 12.3-9.64c4.96-2.41 9.65-3.74 14.06-3.98.13 1.11.18 2.23.18 3.33z"/></svg>
      <h1 style="font-size:24px;font-weight:600">MacBook Pro</h1>
      <div class="muted" style="margin-bottom:18px">macOS Tahoe 26.0</div>
      <div style="width:100%;text-align:left;font-size:13px;display:flex;flex-direction:column;gap:0">
        ${[['Chip','Apple M3 Pro'],['Memory','18 GB'],['Startup disk','Macintosh HD'],['Serial number','C02XK1TAJG7H'],['macOS','Tahoe 26.0 (25A3002)']].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:0.5px solid rgba(255,255,255,0.08)"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn">More Info…</button>
        <button class="btn btn-primary" onclick="OS.openApp('settings')">System Settings…</button>
      </div>`;
  },
};

/* ============================================================
   TRASH
   ============================================================ */
Apps.trash = {
  name:'Trash', iconClass:'ic-trash', glyph:'🗑', hidden:true,
  width:560, height:380,
  onOpen(w){
    w.unified=true;w.title='Trash';
    const c=w.contentEl;
    c.innerHTML=`<div class="pad center" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px">
      <div style="font-size:64px">🗑</div>
      <h2 style="font-weight:600">Trash is Empty</h2>
      <p class="muted">Items you delete will appear here.</p>
      <button class="btn">Empty</button></div>`;
  },
};

/* ============================================================
   HELP
   ============================================================ */
Apps.help = {
  name:'Help', iconClass:'ic-settings', glyph:'?', hidden:true,
  width:560, height:420,
  onOpen(w){
    w.title='macOS Help';
    const c=w.contentEl;
    c.style.padding='20px';
    c.innerHTML=`<h2 style="font-size:20px;margin-bottom:14px">macOS Tahoe Help</h2>
      <input type="search" placeholder="Search Help" style="width:100%;margin-bottom:18px">
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[['Get started with Mac','Learn the basics of your Mac.'],['What\'s new in macOS Tahoe','Discover Liquid Glass and new features.'],['Customize your desktop','Change wallpaper, Dock, and more.'],['Use Spotlight','Press ⌘Space to search apps and files.'],['Keyboard shortcuts','Learn common shortcuts.']].map(([t,d])=>`<div style="padding:12px;background:rgba(255,255,255,0.06);border-radius:10px;cursor:default" onmouseover="this.style.background='rgba(255,255,255,0.12)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'"><div style="font-weight:600">${t}</div><div class="small muted">${d}</div></div>`).join('')}
      </div>`;
  },
};

/* ============================================================
   SIRI
   ============================================================ */
Apps.siri = {
  name:'Siri', iconClass:'ic-settings', glyph:'', hidden:true,
  width:420, height:340, resizable:false,
  onOpen(w){
    w.unified=true;w.title='Siri';
    const c=w.contentEl;
    c.style.cssText='display:flex;flex-direction:column;align-items:center;padding:24px;gap:16px';
    c.innerHTML=`
      <div id="siri-orb" style="width:100px;height:100px;border-radius:50%;background:conic-gradient(from 0deg,#ff5e62,#a855f7,#3b82f6,#ff5e62);animation:siriSpin 3s linear infinite;display:flex;align-items:center;justify-content:center;filter:blur(0.5px)"></div>
      <div id="siri-out" class="muted" style="min-height:40px;text-align:center">Hi, I'm Siri. How can I help?</div>
      <div style="display:flex;gap:8px;width:100%"><input id="siri-in" type="text" placeholder="Type to Siri…" style="flex:1"><button class="btn btn-primary" id="siri-go">Ask</button></div>`;
    const style=el('style');style.textContent='@keyframes siriSpin{to{transform:rotate(360deg)}}';document.head.appendChild(style);
    const inp=$('#siri-in',c),out=$('#siri-out',c);
    function respond(q){
      const ql=q.toLowerCase();
      let a='I\'m not sure about that.';
      if(ql.includes('time'))a='It\'s '+new Date().toLocaleTimeString();
      else if(ql.includes('date'))a='Today is '+new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      else if(ql.includes('weather'))a='It\'s 72°F and sunny. Want me to open Weather?';
      else if(ql.includes('open ')||ql.includes('launch')){const m=ql.match(/open (an? )?(\w+)/);if(m&&Apps[m[2]]){OS.openApp(m[2]);a='Opening '+m[2]+'.';}else a='I can\'t find that app.';}
      else if(ql.includes('joke'))a='Why did the Mac go to therapy? It had too many tabs open.';
      else if(ql.includes('hello')||ql.includes('hi'))a='Hello! What can I do for you?';
      else if(ql.includes('search')||ql.includes('spotlight')){OS.openSpotlight();a='Opening Spotlight.';}
      out.textContent=a;
    }
    const ask=()=>{if(inp.value.trim()){respond(inp.value);inp.value='';}};
    $('#siri-go',c).onclick=ask;inp.addEventListener('keydown',e=>{if(e.key==='Enter')ask();});
  },
};

})();
