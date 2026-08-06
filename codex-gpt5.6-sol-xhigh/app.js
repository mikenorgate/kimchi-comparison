(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const desktop = $('#desktop');
  const windowLayer = $('#window-layer');
  const controlCenter = $('#control-center');
  const notificationCenter = $('#notification-center');
  const spotlight = $('#spotlight');
  const spotlightInput = $('#spotlight-input');
  const spotlightResults = $('#spotlight-results');
  const menuPopover = $('#menu-popover');
  const contextMenu = $('#context-menu');
  let zCounter = 40;
  let windowCounter = 0;
  let activeWindow = null;
  let activeApp = 'finder';
  let openMenu = null;
  let isPlaying = false;
  let musicTimer = null;

  const apps = {
    finder: { name: 'Finder', icon: 'finder-icon', size: [820, 535], build: finderTemplate },
    safari: { name: 'Safari', icon: 'safari-icon', size: [900, 585], build: safariTemplate },
    messages: { name: 'Messages', icon: 'messages-icon', size: [790, 535], build: messagesTemplate },
    mail: { name: 'Mail', icon: 'mail-icon', size: [880, 550], build: mailTemplate },
    maps: { name: 'Maps', icon: 'maps-icon', size: [820, 535], build: mapsTemplate },
    photos: { name: 'Photos', icon: 'photos-icon', size: [850, 550], build: photosTemplate },
    phone: { name: 'Phone', icon: 'phone-icon', size: [430, 560], build: phoneTemplate },
    music: { name: 'Music', icon: 'music-icon', size: [840, 545], build: musicTemplate },
    notes: { name: 'Notes', icon: 'notes-icon', size: [760, 525], build: notesTemplate },
    calendar: { name: 'Calendar', icon: 'calendar-icon', size: [850, 560], build: calendarTemplate },
    terminal: { name: 'Terminal', icon: 'terminal-icon', size: [690, 435], build: terminalTemplate },
    apps: { name: 'Applications', icon: 'apps-icon', size: [690, 510], build: applicationsTemplate },
    settings: { name: 'System Settings', icon: 'settings-icon', size: [780, 550], build: settingsTemplate },
    trash: { name: 'Trash', icon: 'trash-icon', size: [650, 430], build: trashTemplate },
    weather: { name: 'Weather', icon: 'weather-app-icon', size: [650, 500], build: weatherTemplate },
    calculator: { name: 'Calculator', icon: 'calculator-app-icon', size: [295, 430], build: calculatorTemplate },
    clock: { name: 'Clock', icon: 'clock-app-icon', size: [590, 430], build: clockTemplate },
    appstore: { name: 'App Store', icon: 'appstore-app-icon', size: [760, 520], build: appStoreTemplate },
    textedit: { name: 'TextEdit', icon: 'textedit-app-icon', size: [650, 500], build: textEditTemplate },
    preview: { name: 'Preview', icon: 'preview-app-icon', size: [700, 510], build: previewTemplate },
    facetime: { name: 'FaceTime', icon: 'facetime-app-icon', size: [670, 480], build: facetimeTemplate }
  };

  const iconMarkup = appId => `<span class="app-icon ${apps[appId]?.icon || 'apps-icon'}"></span>`;

  function updateClock() {
    const now = new Date();
    const dayMonth = now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    $('#clock-day').textContent = dayMonth;
    $('#clock-time').textContent = time;
    $$('.lock-time').forEach(el => el.textContent = time);
    $$('.lock-status').forEach(el => el.textContent = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }));
    $('#widget-weekday').textContent = now.toLocaleDateString([], { weekday: 'long' }).toUpperCase();
    $('#widget-date').textContent = now.getDate();
    $('#dock-date').textContent = now.getDate();
    $('#panel-weekday').textContent = now.toLocaleDateString([], { weekday: 'long' });
    $('#panel-date').textContent = now.toLocaleDateString([], { day: 'numeric', month: 'long' });
  }

  function toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    $('#toast-region').appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  function closeOverlays(except) {
    if (except !== 'control') controlCenter.classList.remove('open');
    if (except !== 'notifications') notificationCenter.classList.remove('open');
    if (except !== 'spotlight') spotlight.classList.remove('open');
    if (except !== 'menu') closeMenus();
    if (except !== 'context') contextMenu.classList.remove('open');
    controlCenter.setAttribute('aria-hidden', !controlCenter.classList.contains('open'));
    notificationCenter.setAttribute('aria-hidden', !notificationCenter.classList.contains('open'));
    spotlight.setAttribute('aria-hidden', !spotlight.classList.contains('open'));
  }

  function focusWindow(win) {
    if (!win || !document.body.contains(win)) return;
    $$('.window', windowLayer).forEach(w => w.classList.toggle('inactive', w !== win));
    win.style.zIndex = ++zCounter;
    activeWindow = win;
    activeApp = win.dataset.app;
    $('.active-app-name').textContent = apps[activeApp]?.name || 'Finder';
  }

  function nextWindowPosition(width, height) {
    const area = windowLayer.getBoundingClientRect();
    const stagger = (windowCounter++ % 7) * 24;
    const left = Math.max(8, Math.min(area.width - width - 8, (area.width - width) / 2 + stagger - 52));
    const top = Math.max(4, Math.min(area.height - height - 4, (area.height - height) / 2 + stagger - 28));
    return [left, top];
  }

  function openApp(appId, options = {}) {
    const app = apps[appId];
    if (!app) return toast(`${appId} is not available`);
    closeOverlays();
    const existing = $(`.window[data-app="${appId}"]:not(.closing)`, windowLayer);
    if (existing && !options.newWindow) {
      if (existing.hidden) restoreWindow(existing);
      focusWindow(existing);
      if (options.view) setFinderView(existing, options.view);
      return existing;
    }
    const [width, height] = app.size;
    const win = document.createElement('article');
    win.className = 'window';
    win.dataset.app = appId;
    win.dataset.windowId = `${appId}-${Date.now()}`;
    win.style.setProperty('--window-w', `${width}px`);
    win.style.setProperty('--window-h', `${height}px`);
    const [left, top] = nextWindowPosition(width, height);
    win.style.left = `${left}px`;
    win.style.top = `${top}px`;
    win.innerHTML = app.build(options);
    windowLayer.appendChild(win);
    wireWindow(win);
    wireApp(win, appId);
    if (appId === 'finder' && options.view) setFinderView(win, options.view);
    focusWindow(win);
    const dockItem = $(`.dock-item[data-app="${appId}"]`);
    if (dockItem) dockItem.classList.add('running');
    return win;
  }

  function wireWindow(win) {
    const titlebar = $('.titlebar', win);
    $('.close-btn', win)?.addEventListener('click', e => { e.stopPropagation(); closeWindow(win); });
    $('.min-btn', win)?.addEventListener('click', e => { e.stopPropagation(); minimizeWindow(win); });
    $('.max-btn', win)?.addEventListener('click', e => { e.stopPropagation(); toggleMaximize(win); });
    titlebar?.addEventListener('dblclick', e => { if (!e.target.closest('button,input')) toggleMaximize(win); });
    win.addEventListener('pointerdown', () => focusWindow(win));
    let drag = null;
    titlebar?.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button,input') || win.classList.contains('maximized')) return;
      const rect = win.getBoundingClientRect();
      const layerRect = windowLayer.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, left: rect.left - layerRect.left, top: rect.top - layerRect.top };
      titlebar.setPointerCapture(e.pointerId);
    });
    titlebar?.addEventListener('pointermove', e => {
      if (!drag) return;
      const maxLeft = windowLayer.clientWidth - 120;
      const maxTop = windowLayer.clientHeight - 65;
      win.style.left = `${Math.max(-win.offsetWidth + 120, Math.min(maxLeft, drag.left + e.clientX - drag.x))}px`;
      win.style.top = `${Math.max(0, Math.min(maxTop, drag.top + e.clientY - drag.y))}px`;
    });
    titlebar?.addEventListener('pointerup', () => { drag = null; });
  }

  function closeWindow(win) {
    if (!win) return;
    const appId = win.dataset.app;
    win.classList.add('closing');
    setTimeout(() => {
      win.remove();
      if (!$(`.window[data-app="${appId}"]`, windowLayer)) $(`.dock-item[data-app="${appId}"]`)?.classList.remove('running');
      const remaining = $$('.window:not([hidden])', windowLayer).sort((a,b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0));
      if (remaining[0]) focusWindow(remaining[0]); else setActiveFinder();
    }, 180);
  }

  function minimizeWindow(win) {
    if (!win) return;
    const rect = win.getBoundingClientRect();
    win.style.setProperty('--x', `${rect.left}px`);
    win.style.setProperty('--y', `${rect.top}px`);
    win.classList.add('minimizing');
    setTimeout(() => { win.hidden = true; win.classList.remove('minimizing'); }, 300);
    setActiveFinder();
  }

  function restoreWindow(win) {
    win.hidden = false;
    win.animate([{opacity:0, transform:'translateY(40px) scale(.2)'},{opacity:1,transform:'none'}], {duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});
  }

  function toggleMaximize(win) {
    if (!win) return;
    win.classList.toggle('maximized');
  }

  function setActiveFinder() {
    activeWindow = null;
    activeApp = 'finder';
    $('.active-app-name').textContent = 'Finder';
  }

  function titlebar(title, extra = '', toolbarClass = '') {
    return `<header class="titlebar ${toolbarClass}"><div class="traffic-lights"><button class="close-btn" aria-label="Close"></button><button class="min-btn" aria-label="Minimize"></button><button class="max-btn" aria-label="Zoom"></button></div><strong class="window-title">${title}</strong>${extra}</header>`;
  }

  function finderTemplate(options) {
    return `${titlebar('iCloud Drive', `<div class="title-actions"><button class="toolbar-button finder-back">‹</button><button class="toolbar-button finder-view-toggle">▦</button><button class="toolbar-button finder-new">＋</button><button class="toolbar-button finder-search">⌕</button></div>`, 'app-toolbar')}
    <div class="window-body finder-body"><aside class="app-sidebar">
      <div class="sidebar-heading">Favorites</div>
      ${sideRow('recents','◷','Recents')}${sideRow('applications','▦','Applications')}${sideRow('desktop','▤','Desktop')}${sideRow('documents','▧','Documents')}${sideRow('downloads','↓','Downloads')}
      <div class="sidebar-heading">iCloud</div>${sideRow('icloud','☁','iCloud Drive', true)}${sideRow('shared','♧','Shared')}
      <div class="sidebar-heading">Locations</div>${sideRow('mac','▣','Macintosh HD')}${sideRow('network','⌁','Network')}
      <div class="sidebar-heading">Tags</div>${sideRow('red','●','Red')}${sideRow('orange','●','Orange')}${sideRow('blue','●','Blue')}
    </aside><section class="content-pane finder-main"></section></div>`;
  }

  function sideRow(view, symbol, label, active = false) {
    return `<button class="sidebar-row${active?' active':''}" data-view="${view}"><span class="side-symbol">${symbol}</span>${label}</button>`;
  }

  const finderFiles = {
    icloud: [['folder','Desktop','▤'],['folder','Documents','▧'],['folder','Keynote','K'],['folder','Projects','⌘'],['photo','Tahoe Trip','◈'],['doc','Welcome.pdf','PDF'],['doc','Ideas.txt','TXT'],['dark','Web Desktop','›_']],
    recents: [['doc','Design brief.pdf','PDF'],['photo','Lake Tahoe.png','◈'],['doc','Meeting notes.txt','TXT'],['folder','Project Aurora','⌘'],['dark','app.js','JS']],
    applications: Object.keys(apps).slice(0,14).map(id => ['doc', apps[id].name, 'APP']),
    desktop: [['folder','iCloud Drive','☁'],['folder','Projects','⌘'],['photo','Tahoe Trip','◈']],
    documents: [['doc','Design brief.pdf','PDF'],['doc','Project scope.pages','P'],['doc','Ideas.txt','TXT'],['folder','Archive','⌁']],
    downloads: [['doc','macOS-Tahoe.dmg','DMG'],['photo','Wallpaper.png','◈'],['doc','Receipt.pdf','PDF']],
    projects: [['folder','Tahoe Web Desktop','⌘'],['folder','Project Aurora','✦'],['doc','Design brief.pdf','PDF'],['dark','app.js','JS'],['doc','styles.css','CSS']],
    shared: [['folder','Family','♧'],['folder','Design Team','♧']], mac: [['folder','Applications','▦'],['folder','Library','⌁'],['folder','System','⌘'],['folder','Users','♙']], network: []
  };

  function setFinderView(win, view = 'icloud') {
    const files = finderFiles[view] || finderFiles.icloud;
    $$('.sidebar-row', win).forEach(row => row.classList.toggle('active', row.dataset.view === view));
    const label = $(`.sidebar-row[data-view="${view}"]`, win)?.textContent.trim() || (view === 'projects' ? 'Projects' : 'iCloud Drive');
    $('.window-title', win).textContent = label;
    const main = $('.finder-main', win);
    main.innerHTML = `<div class="finder-heading"><h2>${label}</h2><small>${files.length} items</small></div>${files.length ? `<div class="file-grid">${files.map(f => `<button class="file-card" data-file="${f[1]}"><span class="file-thumb ${f[0]}">${f[2]}</span><span>${f[1]}</span></button>`).join('')}</div>` : `<div class="empty-state"><span class="empty-symbol">⌁</span><b>No items</b><span>This location is empty.</span></div>`}`;
    $$('.file-card', main).forEach(card => {
      card.addEventListener('click', () => { $$('.file-card',main).forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); });
      card.addEventListener('dblclick', () => openFinderFile(card.dataset.file));
    });
  }

  function openFinderFile(name) {
    if (name === 'Applications') return openApp('apps');
    if (/Tahoe|Wallpaper|\.png/i.test(name)) return openApp('photos');
    if (/\.txt|\.pages/i.test(name)) return openApp('textedit', {title:name, newWindow:true});
    if (/\.pdf/i.test(name)) return openApp('preview', {title:name, newWindow:true});
    if (/app\.js|Web Desktop/i.test(name)) return openApp('terminal');
    toast(`Opened “${name}”`);
  }

  function safariTemplate() {
    return `${titlebar('Start Page', `<div class="nav-buttons"><button class="toolbar-button safari-back">‹</button><button class="toolbar-button safari-forward">›</button></div><input class="safari-address" value="" placeholder="Search or enter website name"><div class="title-actions"><button class="toolbar-button safari-share">⇧</button><button class="toolbar-button safari-new-tab">＋</button><button class="toolbar-button">▣</button></div>`, 'app-toolbar safari-toolbar')}<div class="window-body safari-content"><section class="safari-page"></section></div>`;
  }

  function safariPage(win, url = '') {
    const page = $('.safari-page', win); const address = $('.safari-address', win);
    if (!url) {
      address.value = '';
      page.innerHTML = `<h1>Good afternoon.</h1><p>Where would you like to go?</p><div class="favorites-grid">${[['Apple','●','#222'],['iCloud','☁','#4aa6f7'],['News','N','#ef4349'],['Maps','➤','#50ad7d'],['Design','✦','#8b61d9'],['Music','♪','#f14667'],['Photos','✿','#f28c40'],['Tahoe','◈','#338fd7']].map(f=>`<button class="favorite" data-url="${f[0].toLowerCase()}.com"><i style="--fav:${f[2]}">${f[1]}</i>${f[0]}</button>`).join('')}</div><div class="privacy-card"><b>Privacy Report</b><p>Safari has prevented 17 trackers from profiling you in the last seven days.</p></div>`;
    } else {
      const nice = url.replace(/^https?:\/\//,'').replace(/\/$/,''); address.value = nice;
      if (/apple/i.test(url)) page.innerHTML = `<div style="font-size:55px;margin-top:28px">●</div><h1>Think different.</h1><p>Welcome to a lightweight demo of the Apple homepage.</p><div class="privacy-card"><b>macOS Tahoe</b><p>A new design with Liquid Glass makes your desktop more expressive, delightful and personal.</p><button class="toolbar-button" data-open-app="settings">Explore the design</button></div>`;
      else if (/maps/i.test(url)) { openApp('maps'); return; }
      else if (/music/i.test(url)) { openApp('music'); return; }
      else if (/photos/i.test(url)) { openApp('photos'); return; }
      else page.innerHTML = `<div style="font-size:47px;margin-top:42px">◉</div><h1>${escapeHtml(nice)}</h1><p>This Tahoe web desktop stays private and offline.</p><div class="privacy-card"><b>Demo Browser</b><p>External websites are not loaded inside this simulation, but navigation, history, tabs, and app links all work.</p></div>`;
    }
    $$('.favorite', page).forEach(f => f.onclick = () => { win.safariHistory ||= []; win.safariHistory.push(f.dataset.url); safariPage(win,f.dataset.url); });
    $$('[data-open-app]',page).forEach(b=>b.onclick=()=>openApp(b.dataset.openApp));
  }

  function messagesTemplate() {
    const people = [['Alex','That Tahoe mockup looks incredible!','now','#d47a65'],['Sam','See you at 6?','12m','#6e99d3'],['Design Team','I shared the latest files.','1h','#8a71c9'],['Mum','Lovely photo!','Yesterday','#d99c56']];
    return `${titlebar('Messages', `<div class="title-actions"><button class="toolbar-button new-message">✎</button></div>`, 'app-toolbar')}<div class="window-body"><aside class="list-pane"><input class="list-search" placeholder="Search">${people.map((p,i)=>`<button class="list-row${i===0?' active':''}" data-person="${p[0]}"><span class="avatar" style="--avatar:${p[3]}">${p[0][0]}</span><span class="list-copy"><b>${p[0]}</b><time>${p[2]}</time><p>${p[1]}</p></span></button>`).join('')}</aside><section class="detail-pane"><div class="conversation-head">Alex</div><div class="messages-area"><div class="bubble">Hey! Did you see the new desktop?</div><div class="bubble me">Just finished the glass effects ✨</div><div class="bubble">That Tahoe mockup looks incredible!</div></div><form class="message-compose"><input placeholder="iMessage" autocomplete="off"><button>↑</button></form></section></div>`;
  }

  function mailTemplate() {
    const messages = [['Apple','Welcome to macOS Tahoe','Your Mac has an expressive new look.','10:42'],['United','Flight confirmation','Your trip to San Francisco is confirmed.','09:15'],['Morgan','Design handoff','The final assets are in the shared folder.','Yesterday'],['Notion','Your weekly digest','Seven updates across your workspace.','Mon']];
    return `${titlebar('Inbox', `<div class="title-actions"><button class="toolbar-button mail-refresh">↻</button><button class="toolbar-button mail-compose">✎</button></div>`, 'app-toolbar')}<div class="window-body"><aside class="app-sidebar"><div class="sidebar-heading">Favorites</div>${sideRow('inbox','⌄','Inbox',true)}${sideRow('flagged','⚑','Flagged')}${sideRow('drafts','▧','Drafts')}${sideRow('sent','↑','Sent')}${sideRow('junk','⊘','Junk')}${sideRow('trashmail','♲','Bin')}</aside><aside class="list-pane mail-list"><input class="list-search" placeholder="Search">${messages.map((m,i)=>`<button class="list-row${i===0?' active':''}" data-mail="${i}"><span class="list-copy"><b>${m[0]}</b><time>${m[3]}</time><p><b>${m[1]}</b><br>${m[2]}</p></span></button>`).join('')}</aside><section class="detail-pane mail-detail"></section></div>`;
  }

  const mailContent = [
    ['Welcome to macOS Tahoe','Apple','Your Mac has an expressive new look.\n\nDiscover a refined desktop, clear app icons, and sidebars crafted from Liquid Glass. Everything feels familiar, yet completely new.'],
    ['Flight confirmation','United','Hello Mike,\n\nYour trip to San Francisco is confirmed. Departure is Friday at 10:20 from London Heathrow.\n\nConfirmation: TAH026'],
    ['Design handoff','Morgan','Hi,\n\nThe final assets are in the shared folder. Let me know what you think of the colour pass.'],
    ['Your weekly digest','Notion','Here is what happened this week: 7 page updates, 3 mentions, and 2 new comments.']
  ];

  function selectMail(win, index) {
    const m = mailContent[index];
    $('.mail-detail',win).innerHTML = `<small>INBOX</small><h2>${m[0]}</h2><div class="mail-meta"><span class="avatar">${m[1][0]}</span><span><b>${m[1]}</b><br><small>to me</small></span></div><p class="mail-copy">${m[2]}</p>`;
    $$('.mail-list .list-row',win).forEach((r,i)=>r.classList.toggle('active',i===index));
  }

  function composeMail(win) {
    if ($('.compose-sheet',win)) return;
    const sheet=document.createElement('section'); sheet.className='compose-sheet';
    sheet.innerHTML=`<div class="compose-head">New Message<button class="compose-close">×</button></div><div class="compose-fields"><input class="to-field" placeholder="To:"><input placeholder="Subject:"><textarea placeholder="Write something…"></textarea></div><button class="send-mail">Send</button>`;
    win.appendChild(sheet); $('.compose-close',sheet).onclick=()=>sheet.remove();
    $('.send-mail',sheet).onclick=()=>{const to=$('.to-field',sheet).value; if(!to)return toast('Add a recipient');sheet.remove();toast(`Message sent to ${to}`)};
    $('.to-field',sheet).focus();
  }

  function mapsTemplate() {
    return `${titlebar('Maps', `<div class="title-actions"><button class="toolbar-button map-locate">◎</button><button class="toolbar-button">3D</button></div>`, 'app-toolbar')}<div class="window-body maps-body"><div class="map-canvas"></div><div class="map-water"></div><span class="map-label" style="left:48%;top:28%">Soho</span><span class="map-label" style="left:64%;top:52%">Covent Garden</span><span class="map-label" style="left:26%;top:67%">Hyde Park</span><span class="map-pin" style="left:54%;top:44%"></span><aside class="maps-search"><input placeholder="Search Maps"><div class="map-result"><b>Current Location</b><br><small>London, United Kingdom</small></div><div class="map-result"><b>Lake Tahoe</b><br><small>California & Nevada</small></div></aside></div>`;
  }

  const photoColors = [
    'linear-gradient(145deg,#6dd9ef,#2566b6 60%,#163d79)', 'linear-gradient(155deg,#ffb273,#ee607d 60%,#7a3b91)', 'linear-gradient(25deg,#234c64,#63b1a0 55%,#d5d076)', 'linear-gradient(145deg,#b4d7ef,#697ec4 50%,#463d88)', 'linear-gradient(25deg,#e9c6a2,#cc6b5d 52%,#783e53)', 'linear-gradient(155deg,#78c5d4,#2c759f 50%,#123e61)', 'linear-gradient(25deg,#3b4e64,#f29d70 50%,#f1d19a)', 'linear-gradient(155deg,#aae5e5,#68adba 50%,#347186)', 'linear-gradient(30deg,#17295b,#7055a5 50%,#eb709a)', 'linear-gradient(145deg,#9ed570,#438653 60%,#264d37)', 'linear-gradient(35deg,#efcca3,#b9726e 56%,#674a68)', 'linear-gradient(145deg,#8dbdeb,#4779bf 50%,#224c8b)'
  ];

  function photosTemplate() {
    return `${titlebar('Photos', `<div class="title-actions"><button class="toolbar-button">♡</button><button class="toolbar-button">⇧</button><button class="toolbar-button photos-add">＋</button></div>`, 'app-toolbar')}<div class="window-body photos-body"><div class="photos-head"><h2>Library</h2><span><button class="toolbar-button">Years</button> <button class="toolbar-button">Months</button> <button class="toolbar-button" style="background:rgba(var(--accent-rgb),.15)">All Photos</button></span></div><div class="photo-grid">${photoColors.map((c,i)=>`<button class="photo-tile" aria-label="Photo ${i+1}" style="--photo:${c};--ph:${105+(i%4)*22}px"></button>`).join('')}</div></div>`;
  }

  function musicTemplate() {
    return `${titlebar('Music', `<div class="title-actions"><input class="list-search music-search" style="width:170px" placeholder="Search"></div>`, 'app-toolbar')}<div class="window-body music-body"><aside class="app-sidebar"><div class="sidebar-heading">Apple Music</div>${sideRow('home','⌂','Home',true)}${sideRow('new','▦','New')}${sideRow('radio','◉','Radio')}<div class="sidebar-heading">Library</div>${sideRow('recent','◷','Recently Added')}${sideRow('artists','♙','Artists')}${sideRow('albums','▣','Albums')}${sideRow('songs','♫','Songs')}<div class="sidebar-heading">Playlists</div>${sideRow('favorites','♡','Favourite Songs')}${sideRow('focusmusic','☾','Deep Focus')}</aside><section class="content-pane music-main"><h1>Listen Now</h1><div class="hero-album"><small>FEATURED ALBUM</small><strong>Beyond the Horizon</strong><span>Tycho</span></div><h3>Made For You</h3>${['Horizon|Tycho|3:48','Midnight City|M83|4:03','Sunset Lover|Petit Biscuit|3:57','A Walk|ODESZA|3:46'].map((t,i)=>{const [a,b,c]=t.split('|');return `<div class="track-row"><button class="track-play" data-track="${a}" data-artist="${b}">${i===0?'▶':i+1}</button><span><b>${a}</b><br><small>${b}</small></span><time>${c}</time></div>`}).join('')}</section><footer class="music-player"><span class="player-title"><b>Horizon</b><small>Tycho</small></span><button class="music-prev">‹‹</button><button class="music-play">▶</button><button class="music-next">››</button><input type="range" min="0" max="100" value="32" style="width:150px"></footer></div>`;
  }

  function notesTemplate() {
    return `${titlebar('Notes', `<div class="title-actions"><button class="toolbar-button note-delete">♲</button><button class="toolbar-button note-new">✎</button></div>`, 'app-toolbar')}<div class="window-body"><aside class="app-sidebar"><div class="sidebar-heading">iCloud</div>${sideRow('allnotes','▧','All iCloud',true)}${sideRow('notes','▤','Notes')}${sideRow('recentlydeleted','♲','Recently Deleted')}</aside><aside class="notes-list"></aside><section class="note-editor"><input class="note-title" value="Tahoe ideas"><textarea class="note-text">A little desktop that feels alive.\n\n• Translucent Liquid Glass\n• Working app windows\n• Search everything with Spotlight\n• Keep the familiar Mac details\n\nEvery interaction should feel considered.</textarea></section></div>`;
  }

  const defaultNotes = [
    {title:'Tahoe ideas', text:'A little desktop that feels alive.\n\n• Translucent Liquid Glass\n• Working app windows\n• Search everything with Spotlight\n• Keep the familiar Mac details\n\nEvery interaction should feel considered.'},
    {title:'Groceries', text:'Oat milk\nCoffee\nBlueberries\nSourdough'},
    {title:'Trip plan', text:'Friday — arrive and check in\nSaturday — Emerald Bay\nSunday — hike and picnic'},
    {title:'Books to read', text:'The Creative Act\nTomorrow, and Tomorrow, and Tomorrow\nWays of Seeing'}
  ];

  function renderNotes(win, select = 0) {
    win.notes ||= JSON.parse(localStorage.getItem('tahoe-notes') || 'null') || structuredClone(defaultNotes);
    $('.notes-list',win).innerHTML=win.notes.map((n,i)=>`<button class="note-card${i===select?' active':''}" data-note="${i}"><b>${escapeHtml(n.title||'New Note')}</b><span>${escapeHtml(n.text.slice(0,42)||'No additional text')}</span></button>`).join('');
    win.noteIndex=select; const n=win.notes[select];
    if(n){$('.note-title',win).value=n.title;$('.note-text',win).value=n.text}
    $$('.note-card',win).forEach(c=>c.onclick=()=>saveAndSelectNote(win,+c.dataset.note));
  }
  function saveNotes(win){if(win.noteIndex==null)return;win.notes[win.noteIndex]={title:$('.note-title',win).value,text:$('.note-text',win).value};localStorage.setItem('tahoe-notes',JSON.stringify(win.notes))}
  function saveAndSelectNote(win,i){saveNotes(win);renderNotes(win,i)}

  function calendarTemplate() {
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const cells = Array.from({length:35},(_,i)=>i<4?27+i:i-3);
    return `${titlebar('August 2026', `<div class="title-actions"><button class="toolbar-button cal-today">Today</button><button class="toolbar-button">‹</button><button class="toolbar-button">›</button><button class="toolbar-button cal-add">＋</button></div>`, 'app-toolbar')}<div class="window-body calendar-body"><div class="calendar-top"><h2>August 2026</h2><span>Month⌄</span></div><div class="calendar-grid">${days.map(d=>`<div class="cal-cell head">${d}</div>`).join('')}${cells.map((d,i)=>`<div class="cal-cell${d===6?' today':''}"><span>${d}</span>${d===6?'<i class="cal-event">Design review</i><i class="cal-event purple">Project sync</i>':''}${d===9?'<i class="cal-event blue">Dinner with Sam</i>':''}${d===14?'<i class="cal-event">Flight SFO</i>':''}</div>`).join('')}</div></div>`;
  }

  function terminalTemplate() {
    return `${titlebar('mike — zsh', `<div class="title-actions"><button class="toolbar-button terminal-clear">Clear</button></div>`)}<div class="window-body terminal-body"><div class="terminal-output">Last login: Wed Aug 6 12:15:04 on ttys001\nWelcome to macOS Tahoe 26\n\n</div><form class="terminal-line"><span class="terminal-prompt">mike@Tahoe ~ %</span><input class="terminal-input" autocomplete="off" spellcheck="false"></form></div>`;
  }

  function applicationsTemplate() {
    const ids=['safari','mail','messages','photos','maps','facetime','calendar','notes','music','phone','calculator','clock','appstore','textedit','preview','terminal','settings','weather'];
    return `${titlebar('Applications', `<div class="title-actions"><input class="list-search app-search" style="width:180px" placeholder="Search Applications"></div>`, 'app-toolbar')}<div class="window-body apps-body"><h2>Applications</h2><div class="apps-grid">${ids.map(id=>`<button class="launch-app" data-launch="${id}">${iconMarkup(id)}<span>${apps[id].name}</span></button>`).join('')}</div></div>`;
  }

  function settingsTemplate() {
    return `${titlebar('System Settings', '', 'app-toolbar')}<div class="window-body settings-body"><aside class="app-sidebar settings-sidebar"><div class="settings-account"><span class="avatar">M</span><span><b>Mike</b><br><small>Apple Account</small></span></div><input class="list-search" placeholder="Search">${sideRow('appearance','◐','Appearance',true)}${sideRow('wifi','◔','Wi‑Fi')}${sideRow('bluetooth','ᛒ','Bluetooth')}${sideRow('sound','◖','Sound')}${sideRow('focus','☾','Focus')}${sideRow('wallpaper','▣','Wallpaper')}${sideRow('desktopdock','▥','Desktop & Dock')}${sideRow('displays','▭','Displays')}${sideRow('privacy','◉','Privacy & Security')}</aside><section class="content-pane settings-detail"></section></div>`;
  }

  const settingsPages = {
    appearance: `<h1>Appearance</h1><div class="setting-group"><div class="setting-row"><span class="setting-symbol">◐</span><span>Appearance<small>Choose how windows and controls look</small></span><div><button class="toolbar-button theme-choice" data-theme="light">Light</button> <button class="toolbar-button theme-choice" data-theme="dark">Dark</button></div></div><div class="setting-row"><span class="setting-symbol" style="--set:#8e5de7">●</span><span>Accent colour</span><div class="accent-options">${[['#0a84ff','10,132,255'],['#bf5af2','191,90,242'],['#ff375f','255,55,95'],['#ff9f0a','255,159,10'],['#30d158','48,209,88']].map(c=>`<button class="accent-dot" style="--dot:${c[0]}" data-accent="${c.join('|')}"></button>`).join('')}</div></div><div class="setting-row"><span class="setting-symbol" style="--set:#4ab1e8">◫</span><span>Allow wallpaper tinting in windows</span><button class="switch on" data-setting="tint"></button></div></div><div class="setting-group"><div class="setting-row"><span class="setting-symbol" style="--set:#6d7480">A</span><span>Sidebar icon size</span><button class="toolbar-button">Medium⌄</button></div></div>`,
    wifi: `<h1>Wi‑Fi</h1><div class="setting-group"><div class="setting-row"><span class="setting-symbol">◔</span><span>Wi‑Fi<small>Connected to Studio 5G</small></span><button class="switch on" data-setting="wifi"></button></div></div><h3>Known Networks</h3><div class="setting-group"><div class="setting-row"><span>Studio 5G</span><b>✓</b></div><div class="setting-row"><span>Cafe Wi‑Fi</span><small>•••</small></div><div class="setting-row"><span>iPhone</span><small>•••</small></div></div>`,
    bluetooth: `<h1>Bluetooth</h1><div class="setting-group"><div class="setting-row"><span class="setting-symbol" style="--set:#147bea">ᛒ</span><span>Bluetooth<small>Now discoverable as “Mike’s Mac”</small></span><button class="switch on" data-setting="bluetooth"></button></div></div><h3>My Devices</h3><div class="setting-group"><div class="setting-row"><span>AirPods Pro</span><small>Connected · 82%</small></div><div class="setting-row"><span>Magic Mouse</span><small>67%</small></div></div>`,
    sound: `<h1>Sound</h1><div class="setting-group"><div class="setting-row"><span class="setting-symbol" style="--set:#e85d7e">◖</span><span>Output volume</span><input type="range" min="0" max="100" value="68"></div><div class="setting-row"><span>Play sound on startup</span><button class="switch on"></button></div></div>`,
    focus: `<h1>Focus</h1><div class="setting-group"><div class="setting-row"><span class="setting-symbol" style="--set:#6755cf">☾</span><span>Work<small>Allow people and apps you choose</small></span><button class="switch on"></button></div><div class="setting-row"><span class="setting-symbol" style="--set:#584cb4">☾</span><span>Do Not Disturb</span><button class="switch"></button></div></div>`,
    wallpaper: `<h1>Wallpaper</h1><div class="setting-group"><div class="setting-row" style="display:block"><b>Tahoe</b><div style="height:150px;border-radius:12px;margin-top:10px;background:linear-gradient(135deg,#78d8ee,#397dcc 44%,#514cb8 70%,#e47cac)"></div></div></div>`,
    desktopdock: `<h1>Desktop & Dock</h1><div class="setting-group"><div class="setting-row"><span>Size</span><input type="range" value="55"></div><div class="setting-row"><span>Magnification</span><button class="switch on"></button></div><div class="setting-row"><span>Automatically hide and show the Dock</span><button class="switch"></button></div></div>`,
    displays: `<h1>Displays</h1><div class="setting-group"><div class="setting-row"><span class="setting-symbol">▭</span><span>Built-in Retina Display<small>Optimised for this display</small></span></div><div class="setting-row"><span>Brightness</span><input class="settings-brightness" type="range" min="35" max="100" value="88"></div></div>`,
    privacy: `<h1>Privacy & Security</h1><div class="setting-group"><div class="setting-row"><span class="setting-symbol" style="--set:#4269aa">◉</span><span>Location Services<small>Maps has access</small></span><button class="switch on"></button></div><div class="setting-row"><span class="setting-symbol" style="--set:#5d6c84">⌾</span><span>Analytics & Improvements</span><button class="switch"></button></div></div>`
  };

  function renderSettings(win, page='appearance') {
    $('.settings-detail',win).innerHTML=settingsPages[page]||settingsPages.appearance;
    $$('.settings-sidebar .sidebar-row',win).forEach(r=>r.classList.toggle('active',r.dataset.view===page));
    $$('.switch',win).forEach(s=>s.onclick=()=>{s.classList.toggle('on');toast(`${s.dataset.setting||'Setting'} ${s.classList.contains('on')?'enabled':'disabled'}`)});
    $$('.accent-dot',win).forEach(b=>b.onclick=()=>{const [hex,rgb]=b.dataset.accent.split('|');document.documentElement.style.setProperty('--accent',hex);document.documentElement.style.setProperty('--accent-rgb',rgb);toast('Accent colour updated')});
    $$('.theme-choice',win).forEach(b=>b.onclick=()=>{document.body.classList.toggle('dark-mode',b.dataset.theme==='dark');toast(`${capitalize(b.dataset.theme)} appearance selected`)});
    $('.settings-brightness',win)?.addEventListener('input',e=>{document.documentElement.style.setProperty('--brightness',e.target.value/92);$('#brightness-slider').value=e.target.value});
  }

  function trashTemplate() {
    return `${titlebar('Trash', `<button class="empty-trash">Empty</button>`, 'app-toolbar')}<div class="window-body"><div class="trash-list"><div class="trash-row trash-head"><i></i><span>Name</span><span>Date Deleted</span><span>Size</span></div><div class="trash-row"><i>▧</i><span>Old brief.pdf</span><span>2 Aug 2026</span><span>2.4 MB</span></div><div class="trash-row"><i>◈</i><span>Screenshot 12.04.png</span><span>1 Aug 2026</span><span>1.1 MB</span></div><div class="trash-row"><i>⌁</i><span>Archive</span><span>28 Jul 2026</span><span>18 MB</span></div></div></div>`;
  }

  function weatherTemplate() {
    return `${titlebar('Weather', `<div class="title-actions"><button class="toolbar-button">＋</button></div>`, 'app-toolbar')}<div class="window-body weather-body"><section class="weather-big"><h2>London</h2><div class="degree">21°</div><span>Mostly Sunny</span><p>H:23° &nbsp; L:14°</p></section><div class="forecast">${['Now|☀︎|21°','1PM|☀︎|22°','2PM|☀︎|23°','3PM|◒|23°','4PM|◒|22°','5PM|☁|21°','6PM|☁|20°'].map(x=>{const [a,b,c]=x.split('|');return `<div>${a}<b>${b}</b><span>${c}</span></div>`}).join('')}</div><div class="weather-card-row"><div class="weather-info"><b>Feels Like</b><strong>21°</strong><span>Similar to actual temperature.</span></div><div class="weather-info"><b>Wind</b><strong>8 km/h</strong><span>Westerly</span></div></div></div>`;
  }

  function phoneTemplate() {
    return `${titlebar('Phone', '', 'app-toolbar')}<div class="window-body phone-body"><h2>Keypad</h2><div class="dial-display"></div><div class="dial-pad">${[['1',''],['2','ABC'],['3','DEF'],['4','GHI'],['5','JKL'],['6','MNO'],['7','PQRS'],['8','TUV'],['9','WXYZ'],['*',''],['0','+'],['#','']].map(k=>`<button class="dial-key" data-key="${k[0]}">${k[0]}<small>${k[1]}</small></button>`).join('')}</div><button class="call-button">☎</button><div class="call-status"></div></div>`;
  }

  function calculatorTemplate() {
    const keys=['AC','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='];
    return `${titlebar('Calculator')}<div class="window-body" style="display:block;background:#22242a;padding:12px"><div class="calc-display" style="height:68px;color:white;text-align:right;font-size:43px;font-weight:200;padding:6px;overflow:hidden">0</div><div class="calc-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:7px">${keys.map(k=>`<button data-calc="${k}" style="height:52px;border:0;border-radius:50%;background:${'÷×−+='.includes(k)?'#ff9f0a':['AC','±','%'].includes(k)?'#a6a6a8':'#4a4b50'};color:white;font-size:18px;${k==='0'?'grid-column:span 2;border-radius:28px':''}">${k}</button>`).join('')}</div></div>`;
  }

  function clockTemplate() {
    return `${titlebar('Clock', '', 'app-toolbar')}<div class="window-body" style="display:block;padding:30px;text-align:center;background:rgba(250,250,252,.78)"><h2>World Clock</h2><div class="world-time" style="font-size:62px;font-weight:200;margin:42px 0 4px">12:15:00</div><p>London · Today, +0HRS</p><div class="setting-group" style="margin-top:35px;text-align:left"><div class="setting-row"><b>Cupertino</b><span style="text-align:right">04:15</span></div><div class="setting-row"><b>Tokyo</b><span style="text-align:right">20:15</span></div></div></div>`;
  }

  function appStoreTemplate() {
    return `${titlebar('App Store', `<div class="title-actions"><input class="list-search" style="width:180px" placeholder="Search"></div>`, 'app-toolbar')}<div class="window-body"><aside class="app-sidebar">${sideRow('discover','✦','Discover',true)}${sideRow('arcade','▦','Arcade')}${sideRow('create','⌘','Create')}${sideRow('work','▣','Work')}${sideRow('play','▶','Play')}${sideRow('updates','↻','Updates')}</aside><section class="content-pane" style="padding:25px"><small style="color:var(--accent);font-weight:700">EDITOR'S CHOICE</small><h1 style="margin:5px 0">Apps we love right now</h1><div class="hero-album" style="background:linear-gradient(120deg,#2c4f8b,#5d87cc,#8fd1dd)"><small>DESIGN</small><strong>Make something wonderful.</strong></div><div class="setting-group" style="margin-top:15px">${[['Pixelmator Pro','Creative photo editing'],['Things','Thoughtful task manager'],['Craft','Write beautifully']].map(a=>`<div class="setting-row"><span class="setting-symbol">${a[0][0]}</span><span><b>${a[0]}</b><small>${a[1]}</small></span><button class="toolbar-button app-get">GET</button></div>`).join('')}</div></section></div>`;
  }

  function textEditTemplate(options={}) {
    const title=options.title||'Untitled';
    return `${titlebar(title, `<div class="title-actions"><button class="toolbar-button"><b>B</b></button><button class="toolbar-button"><i>I</i></button><button class="toolbar-button">Aa⌄</button></div>`, 'app-toolbar')}<div class="window-body" style="display:block;background:#fff;padding:38px 55px;overflow:auto"><textarea class="textedit-area" style="border:0;outline:0;resize:none;width:100%;height:100%;font:15px/1.65 Georgia,serif" placeholder="Start writing…">${title==='Untitled'?'':`Notes for ${title}\n\nOpened in TextEdit on macOS Tahoe.`}</textarea></div>`;
  }

  function previewTemplate(options={}) {
    const title=options.title||'Welcome.pdf';
    return `${titlebar(title, `<div class="title-actions"><button class="toolbar-button">−</button><button class="toolbar-button">100%</button><button class="toolbar-button">＋</button><button class="toolbar-button">✎</button></div>`, 'app-toolbar')}<div class="window-body" style="background:#555a64;padding:24px;display:grid;place-items:center;overflow:auto"><div style="width:72%;min-height:94%;background:white;box-shadow:0 5px 24px rgba(0,0,0,.35);padding:50px;color:#222;user-select:text"><small>MACOS TAHOE</small><h1 style="font-size:30px">Welcome to a more expressive Mac.</h1><p style="line-height:1.6">A new design brings greater focus to your content while keeping everything familiar. Translucent controls reflect and refract the desktop around them.</p><div style="height:160px;margin:30px 0;border-radius:16px;background:linear-gradient(135deg,#7de1ec,#3d7dcc 43%,#5e4dbc 70%,#e576aa)"></div><p style="line-height:1.6">This document is open in a functional Preview window inside the Tahoe web desktop.</p></div></div>`;
  }

  function facetimeTemplate() {
    return `${titlebar('FaceTime', `<div class="title-actions"><button class="toolbar-button facetime-new">New FaceTime</button></div>`, 'app-toolbar')}<div class="window-body" style="background:linear-gradient(145deg,#2c3849,#121821);display:grid;place-items:center;color:white"><section style="text-align:center"><span class="avatar" style="width:86px;height:86px;margin:auto;font-size:32px;background:#6c8fbd">A</span><h2>Alex</h2><p style="opacity:.6">Available</p><button class="call-button facetime-call" style="font-size:18px">▰</button></section></div>`;
  }

  function wireApp(win, appId) {
    if (appId === 'finder') {
      setFinderView(win, 'icloud');
      $$('.sidebar-row',win).forEach(row=>row.onclick=()=>setFinderView(win,row.dataset.view));
      $('.finder-new',win).onclick=()=>{const main=$('.file-grid',win);if(!main)return;const card=document.createElement('button');card.className='file-card';card.innerHTML='<span class="file-thumb folder">＋</span><span>untitled folder</span>';main.prepend(card);toast('New folder created')};
      $('.finder-search',win).onclick=()=>openSpotlight();
      $('.finder-back',win).onclick=()=>setFinderView(win,'icloud');
      $('.finder-view-toggle',win).onclick=()=>{const grid=$('.file-grid',win);if(!grid)return;grid.classList.toggle('list-mode');toast(grid.classList.contains('list-mode')?'List view':'Icon view')};
    }
    if (appId === 'safari') {
      win.safariHistory=[]; safariPage(win);
      $('.safari-address',win).addEventListener('keydown',e=>{if(e.key==='Enter'){let url=e.target.value.trim();if(!url)return;safariPage(win,url);win.safariHistory.push(url)}});
      $('.safari-back',win).onclick=()=>{win.safariHistory.pop();safariPage(win,win.safariHistory.at(-1)||'')};
      $('.safari-new-tab',win).onclick=()=>safariPage(win);
      $('.safari-share',win).onclick=()=>toast('Page link copied');
    }
    if (appId === 'messages') {
      $$('.list-row',win).forEach(row=>row.onclick=()=>{ $$('.list-row',win).forEach(r=>r.classList.remove('active'));row.classList.add('active');$('.conversation-head',win).textContent=row.dataset.person;$('.messages-area',win).innerHTML=`<div class="bubble">Hi from ${row.dataset.person}!</div><div class="bubble me">Great to hear from you.</div>`; });
      $('.message-compose',win).onsubmit=e=>{e.preventDefault();const input=$('input',e.currentTarget);if(!input.value.trim())return;const b=document.createElement('div');b.className='bubble me';b.textContent=input.value;$('.messages-area',win).appendChild(b);input.value='';b.scrollIntoView({behavior:'smooth'});setTimeout(()=>{const r=document.createElement('div');r.className='bubble';r.textContent='Sounds good!';$('.messages-area',win)?.appendChild(r)},700)};
      $('.new-message',win).onclick=()=>toast('Choose a contact to start a new message');
    }
    if (appId === 'mail') {
      selectMail(win,0); $$('.mail-list .list-row',win).forEach((r,i)=>r.onclick=()=>selectMail(win,i));
      $('.mail-compose',win).onclick=()=>composeMail(win); $('.mail-refresh',win).onclick=()=>toast('Inbox is up to date');
    }
    if (appId === 'maps') {
      $('.maps-search input',win).addEventListener('keydown',e=>{if(e.key==='Enter'){toast(`Showing results for “${e.target.value}”`);$('.map-pin',win).style.left=`${35+Math.random()*35}%`;$('.map-pin',win).style.top=`${25+Math.random()*40}%`}});
      $('.map-locate',win).onclick=()=>toast('Centered on your current location');
    }
    if (appId === 'photos') {
      $$('.photo-tile',win).forEach(tile=>tile.onclick=()=>{const viewer=document.createElement('div');viewer.className='photo-viewer';viewer.style.setProperty('--photo',tile.style.getPropertyValue('--photo'));viewer.innerHTML='<button>‹ Back</button><div></div>';win.appendChild(viewer);$('button',viewer).onclick=()=>viewer.remove()});
      $('.photos-add',win).onclick=()=>toast('Import sheet opened');
    }
    if (appId === 'music') {
      const play=$('.music-play',win);play.onclick=()=>toggleMusic(play);
      $$('.track-play',win).forEach(b=>b.onclick=()=>{$('.player-title b',win).textContent=b.dataset.track;$('.player-title small',win).textContent=b.dataset.artist;if(!isPlaying)toggleMusic(play)});
      $('.music-prev',win).onclick=()=>toast('Previous track'); $('.music-next',win).onclick=()=>toast('Next track');
    }
    if (appId === 'notes') {
      renderNotes(win); $('.note-title',win).oninput=()=>saveNotes(win);$('.note-text',win).oninput=()=>saveNotes(win);
      $('.note-new',win).onclick=()=>{saveNotes(win);win.notes.unshift({title:'New Note',text:''});renderNotes(win,0);$('.note-title',win).select()};
      $('.note-delete',win).onclick=()=>{if(win.notes.length<=1)return toast('Keep at least one note');win.notes.splice(win.noteIndex,1);renderNotes(win,0);saveNotes(win);toast('Note moved to Recently Deleted')};
    }
    if (appId === 'calendar') { $('.cal-add',win).onclick=()=>{const today=$('.cal-cell.today',win);const e=document.createElement('i');e.className='cal-event blue';e.textContent='New Event';today.appendChild(e);toast('New event added')};$('.cal-today',win).onclick=()=>toast('Showing today, 6 August'); }
    if (appId === 'terminal') wireTerminal(win);
    if (appId === 'apps') { $$('.launch-app',win).forEach(b=>b.onclick=()=>openApp(b.dataset.launch));$('.app-search',win).oninput=e=>$$('.launch-app',win).forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase())); }
    if (appId === 'settings') { renderSettings(win); $$('.settings-sidebar .sidebar-row',win).forEach(r=>r.onclick=()=>renderSettings(win,r.dataset.view)); }
    if (appId === 'trash') { $('.empty-trash',win).onclick=()=>{if(!confirm('Permanently erase the items in the Trash?'))return;$('.trash-list',win).innerHTML='<div class="empty-state"><span class="empty-symbol">♲</span><b>Trash is Empty</b></div>';toast('Trash emptied')}; }
    if (appId === 'phone') wirePhone(win);
    if (appId === 'calculator') wireCalculator(win);
    if (appId === 'clock') {const tick=()=>{const el=$('.world-time',win);if(el)el.textContent=new Date().toLocaleTimeString([],{hour12:false})};tick();win.clockInterval=setInterval(tick,1000)}
    if (appId === 'appstore') $$('.app-get',win).forEach(b=>b.onclick=()=>{b.textContent='OPEN';toast('App ready to open')});
    if (appId === 'facetime') $('.facetime-call',win).onclick=()=>startFaceTime(win);
    if (!['finder','settings'].includes(appId)) {
      $$('.app-sidebar .sidebar-row',win).forEach(row => row.onclick ||= () => {
        $$('.app-sidebar .sidebar-row',win).forEach(r=>r.classList.remove('active')); row.classList.add('active');
        const label=row.textContent.trim();
        if(appId==='mail') $('.window-title',win).textContent=label;
        if(appId==='music') $('.music-main h1',win).textContent=label;
        if(appId==='notes' && row.dataset.view==='recentlydeleted') {$('.notes-list',win).innerHTML='<div class="empty-state"><b>No Recently Deleted Notes</b></div>';$('.note-title',win).value='';$('.note-text',win).value=''}
        else if(appId==='notes') renderNotes(win,0);
        toast(`${label} selected`);
      });
    }
    $$('.toolbar-button',win).forEach(button => button.onclick ||= () => toast(`${button.textContent.trim() || 'Toolbar action'} selected`));
  }

  function toggleMusic(button) {
    isPlaying=!isPlaying;button.textContent=isPlaying?'❚❚':'▶';$('#cc-play').textContent=isPlaying?'❚❚':'▶';
    clearInterval(musicTimer);if(isPlaying){toast('Now playing “Horizon”');let seconds=32;musicTimer=setInterval(()=>{$$('.music-player input').forEach(r=>r.value=++seconds%101)},900)}
  }

  function wireTerminal(win) {
    const form=$('.terminal-line',win),input=$('.terminal-input',win),output=$('.terminal-output',win);
    const command = cmd => {
      const safe=escapeHtml(cmd); let reply=''; const parts=cmd.trim().split(/\s+/); const base=parts[0]?.toLowerCase();
      const commands={help:'Available commands: help, ls, pwd, date, whoami, uname, echo, clear, open, say, theme',ls:'Applications  Desktop  Documents  Downloads  Library  Music  Pictures',pwd:'/Users/mike',whoami:'mike',uname:'Darwin Tahoe 26.0.0 arm64',date:new Date().toString()};
      if(base==='clear'){output.innerHTML='';return} else if(base==='echo')reply=parts.slice(1).join(' ');else if(base==='say')reply=`🔊 ${parts.slice(1).join(' ')}`;else if(base==='open'){const query=parts.slice(1).join(' ').toLowerCase();const id=Object.keys(apps).find(k=>k===query||apps[k].name.toLowerCase()===query);if(id){openApp(id);reply=`Opening ${apps[id].name}…`}else reply=`open: ${query}: application not found`;}else if(base==='theme'){document.body.classList.toggle('dark-mode');reply='Appearance toggled.'}else reply=commands[base]??(base?`zsh: command not found: ${safe}`:'');
      output.innerHTML+=`<span class="terminal-prompt">mike@Tahoe ~ %</span> ${safe}\n${escapeHtml(reply)}${reply?'\n':''}`;
    };
    form.onsubmit=e=>{e.preventDefault();command(input.value);input.value='';$('.terminal-body',win).scrollTop=99999};
    $('.terminal-clear',win).onclick=()=>output.innerHTML=''; input.focus();
  }

  function wirePhone(win) {
    let number='';const display=$('.dial-display',win);$$('.dial-key',win).forEach(k=>k.onclick=()=>{number+=k.dataset.key;display.textContent=number});
    $('.call-button',win).onclick=()=>{if(!number)return toast('Enter a number');const call=document.createElement('div');call.className='active-call';call.innerHTML=`<span class="avatar">${number.at(-1)}</span><h2>${escapeHtml(number)}</h2><span>calling…</span><button class="hangup">☎</button>`;$('.phone-body',win).appendChild(call);setTimeout(()=>{$('span:nth-of-type(2)',call).textContent='00:01'},1400);$('.hangup',call).onclick=()=>call.remove()};
  }

  function wireCalculator(win) {
    let expr='',display=$('.calc-display',win);$$('[data-calc]',win).forEach(b=>b.onclick=()=>{const k=b.dataset.calc;if(k==='AC'){expr='';display.textContent='0';return}if(k==='±'){if(expr)expr=String(-Number(expr));display.textContent=expr;return}if(k==='%'){expr=String(Number(expr)/100);display.textContent=expr;return}if(k==='='){try{const safe=expr.replaceAll('×','*').replaceAll('÷','/').replaceAll('−','-');if(!/^[0-9+\-*/. ()]+$/.test(safe))throw 0;expr=String(Function(`"use strict";return (${safe})`)());display.textContent=expr}catch{display.textContent='Error';expr=''}return}expr+=k;display.textContent=expr.slice(-12)});
  }

  function startFaceTime(win){const body=$('.window-body',win);body.innerHTML=`<div style="position:absolute;inset:0;background:linear-gradient(145deg,#56728d,#222c3b);display:flex;align-items:center;justify-content:center;color:white"><div style="text-align:center"><span class="avatar" style="width:100px;height:100px;font-size:40px;background:#6c8fbd">A</span><h2>Alex</h2><p class="facetime-status">connecting…</p></div><button class="hangup" style="position:absolute;bottom:25px">☎</button></div>`;setTimeout(()=>$('.facetime-status',win)&&($('.facetime-status',win).textContent='connected'),1000);$('.hangup',win).onclick=()=>{closeWindow(win);toast('FaceTime call ended')}}

  const menuData = {
    apple: [
      ['About This Mac','about'],['sep'],['System Settings…','settings','⌘,'],['App Store…','appstore'],['sep'],['Recent Items','recent'],['sep'],['Force Quit…','forcequit','⌥⌘⎋'],['sep'],['Sleep','sleep'],['Restart…','restart'],['Shut Down…','shutdown'],['sep'],['Lock Screen','lock','⌃⌘Q'],['Log Out Mike…','logout','⇧⌘Q']
    ],
    app: [['About APP','aboutapp'],['sep'],['Settings…','settings','⌘,'],['sep'],['Services','services'],['sep'],['Hide APP','hide','⌘H'],['Hide Others','hideothers','⌥⌘H'],['Show All','showall'],['sep'],['Quit APP','quit','⌘Q']],
    file: [['New Window','newwindow','⌘N'],['New Folder','newfolder','⇧⌘N'],['New Tab','newtab','⌘T'],['sep'],['Open…','open','⌘O'],['Open Recent','recent'],['sep'],['Close Window','close','⌘W'],['Save','save','⌘S'],['Share…','share'],['sep'],['Print…','print','⌘P']],
    edit: [['Undo','undo','⌘Z'],['Redo','redo','⇧⌘Z'],['sep'],['Cut','cut','⌘X'],['Copy','copy','⌘C'],['Paste','paste','⌘V'],['Select All','selectall','⌘A'],['sep'],['Find…','find','⌘F'],['Spelling and Grammar','spelling'],['Start Dictation…','dictation','🎙'],['Emoji & Symbols','emoji','⌃⌘Space']],
    view: [['as Icons','icons','⌘1'],['as List','list','⌘2'],['as Columns','columns','⌘3'],['as Gallery','gallery','⌘4'],['sep'],['Show Sidebar','sidebar','⌃⌘S'],['Show Toolbar','toolbar','⌥⌘T'],['Enter Full Screen','fullscreen','⌃⌘F']],
    go: [['Back','back','⌘['],['Forward','forward','⌘]'],['Enclosing Folder','enclosing','⌘↑'],['sep'],['Recents','go-recents','⇧⌘F'],['Documents','go-documents','⇧⌘O'],['Desktop','go-desktop','⇧⌘D'],['Downloads','go-downloads','⌥⌘L'],['Home','go-icloud','⇧⌘H'],['Applications','applications','⇧⌘A'],['sep'],['Go to Folder…','gotofolder','⇧⌘G']],
    window: [['Minimize','minimize','⌘M'],['Zoom','zoom'],['Move & Resize','move'],['sep'],['Bring All to Front','front'],['Cycle Through Windows','cycle','⌘`']],
    help: [['macOS Help','help-search'],['What’s New in macOS Tahoe','whatsnew'],['Keyboard Shortcuts','shortcuts']]
  };

  function showMenu(type, trigger) {
    closeOverlays('menu');
    if(openMenu===type){closeMenus();return}
    openMenu=type; $$('.menu-trigger').forEach(b=>b.classList.toggle('open',b===trigger));
    const appName=apps[activeApp]?.name||'Finder';
    const items=menuData[type].map(item=>item[0]==='sep'?'<div class="context-separator"></div>':`<button class="context-item" data-action="${item[1]}"><span>${item[0].replace('APP',appName)}</span><span>${item[2]||''}</span></button>`).join('');
    menuPopover.innerHTML=items; const rect=trigger.getBoundingClientRect();menuPopover.style.left=`${Math.min(rect.left,innerWidth-245)}px`;menuPopover.classList.add('open');menuPopover.setAttribute('aria-hidden','false');
    $$('.context-item',menuPopover).forEach(i=>i.onclick=()=>{handleAction(i.dataset.action);closeMenus()});
  }
  function closeMenus(){openMenu=null;menuPopover.classList.remove('open');menuPopover.setAttribute('aria-hidden','true');$$('.menu-trigger').forEach(b=>b.classList.remove('open'))}

  function handleAction(action) {
    const name=apps[activeApp]?.name||'Finder';
    const appActions={settings:()=>openApp('settings'),appstore:()=>openApp('appstore'),lock:lockScreen,sleep:lockScreen,shutdown:()=>restartSequence('Shutting down…'),restart:()=>restartSequence('Restarting…'),logout:lockScreen,newwindow:()=>openApp(activeApp,{newWindow:true}),newtab:()=>activeApp==='safari'?openApp('safari'):toast('New tab opened'),newfolder:()=>activeApp==='finder'?$('.finder-new',activeWindow)?.click():toast('New folder created'),close:()=>closeWindow(activeWindow),minimize:()=>minimizeWindow(activeWindow),zoom:()=>toggleMaximize(activeWindow),fullscreen:()=>toggleMaximize(activeWindow),applications:()=>openApp('apps'),'go-recents':()=>goFinder('recents'),'go-documents':()=>goFinder('documents'),'go-desktop':()=>goFinder('desktop'),'go-downloads':()=>goFinder('downloads'),'go-icloud':()=>goFinder('icloud'),find:openSpotlight,'help-search':openSpotlight,whatsnew:()=>openApp('preview',{title:'What’s New in macOS Tahoe',newWindow:true}),quit:()=>{$$('.window[data-app="'+activeApp+'"]').forEach(closeWindow)},hide:()=>minimizeWindow(activeWindow),showall:()=>$$('.window[hidden]').forEach(restoreWindow),about:showAbout,aboutapp:()=>toast(`${name} for macOS Tahoe 26`),save:()=>toast('Saved'),share:()=>toast('Share menu opened'),print:()=>toast('Print dialog opened'),copy:()=>toast('Copied to Clipboard'),paste:()=>toast('Pasted'),cut:()=>toast('Cut'),undo:()=>toast('Undone'),redo:()=>toast('Redone'),selectall:()=>window.getSelection()?.selectAllChildren(activeWindow||desktop),forcequit:()=>toast('All applications are responding'),front:()=>activeWindow&&focusWindow(activeWindow),cycle:cycleWindows,shortcuts:()=>toast('Try ⌘Space for Spotlight and ⌘W to close'),emoji:()=>toast('Emoji & Symbols: ✨ 🌊 ☀️ 💻'),dictation:()=>toast('Dictation listening…')};
    (appActions[action]||(()=>toast(`${capitalize(action.replaceAll('-',' '))} selected`)))();
  }

  function goFinder(view){const w=openApp('finder');setFinderView(w,view)}
  function cycleWindows(){const wins=$$('.window:not([hidden])',windowLayer);if(wins.length<2)return;const i=wins.indexOf(activeWindow);focusWindow(wins[(i+1)%wins.length])}
  function showAbout(){const win=openApp('settings');renderSettings(win,'appearance');toast('macOS Tahoe 26 · Web Edition')}
  function restartSequence(message){closeOverlays();const boot=$('#boot');boot.classList.remove('done');$('.boot-track i',boot).style.animation='none';$('.boot-mark',boot).setAttribute('aria-label',message);setTimeout(()=>{void $('.boot-track i',boot).offsetWidth;$('.boot-track i',boot).style.animation='boot 1.2s ease forwards'},30);setTimeout(()=>boot.classList.add('done'),1500)}
  function lockScreen(){closeOverlays();const lock=$('#lock-screen');lock.classList.add('open');lock.setAttribute('aria-hidden','false')}

  function openSpotlight() {
    closeOverlays('spotlight');spotlight.classList.add('open');spotlight.setAttribute('aria-hidden','false');spotlightInput.value='';renderSpotlight('');setTimeout(()=>spotlightInput.focus(),50);
  }
  function renderSpotlight(query) {
    const q=query.toLowerCase().trim();const matches=Object.entries(apps).filter(([,a])=>!q||a.name.toLowerCase().includes(q)).slice(0,q?8:4);
    spotlightResults.innerHTML=`<div class="sidebar-heading">${q?'Top Hits':'Suggestions'}</div>${matches.map(([id,a],i)=>`<button class="spotlight-result${i===0?' active':''}" data-result="${id}">${iconMarkup(id)}<span><b>${a.name}</b><small>Application</small></span></button>`).join('')}${q&&!matches.length?`<button class="spotlight-result active" data-web="${escapeHtml(q)}"><span class="app-icon safari-icon"><i></i><b>➤</b></span><span><b>Search the web for “${escapeHtml(q)}”</b><small>Safari</small></span></button>`:''}`;
    $$('.spotlight-result',spotlightResults).forEach(r=>r.onclick=()=>{if(r.dataset.result)openApp(r.dataset.result);else{const w=openApp('safari');safariPage(w,r.dataset.web)}});
  }

  function showDesktopContext(x,y) {
    closeOverlays('context');
    contextMenu.innerHTML=`<button class="context-item" data-action="newfolder"><span>New Folder</span><span>⇧⌘N</span></button><div class="context-separator"></div><button class="context-item" data-action="about"><span>Get Info</span><span>⌘I</span></button><button class="context-item" data-action="icons"><span>Use Stacks</span></button><button class="context-item" data-action="view"><span>Show View Options</span><span>⌘J</span></button><div class="context-separator"></div><button class="context-item" data-action="wallpaper"><span>Change Wallpaper…</span></button><button class="context-item" data-action="settings"><span>Edit Widgets…</span></button>`;
    contextMenu.style.left=`${Math.min(x,innerWidth-245)}px`;contextMenu.style.top=`${Math.min(y,innerHeight-300)}px`;contextMenu.classList.add('open');contextMenu.setAttribute('aria-hidden','false');$$('.context-item',contextMenu).forEach(i=>i.onclick=()=>{if(i.dataset.action==='wallpaper'){const w=openApp('settings');renderSettings(w,'wallpaper')}else handleAction(i.dataset.action);contextMenu.classList.remove('open')});
  }

  function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  function capitalize(s=''){return s.charAt(0).toUpperCase()+s.slice(1)}

  // Global interaction wiring
  $$('.dock-item').forEach(item=>item.addEventListener('click',()=>{const id=item.dataset.app;const existing=$(`.window[data-app="${id}"]`,windowLayer);if(existing&&activeWindow===existing&&!existing.hidden){minimizeWindow(existing)}else openApp(id)}));
  $$('[data-open-app]').forEach(item=>item.addEventListener('dblclick',()=>openApp(item.dataset.openApp,{view:item.dataset.finderView})));
  $$('.widget[data-open-app]').forEach(item=>item.addEventListener('click',()=>openApp(item.dataset.openApp)));
  $$('.desktop-item').forEach(item=>item.addEventListener('click',()=>{$$('.desktop-item').forEach(i=>i.classList.remove('selected'));item.classList.add('selected')}));
  $$('.menu-trigger').forEach(trigger=>trigger.addEventListener('click',e=>{e.stopPropagation();showMenu(trigger.dataset.menu,trigger)}));
  $('#control-button').onclick=e=>{e.stopPropagation();const opening=!controlCenter.classList.contains('open');closeOverlays(opening?'control':null);controlCenter.classList.toggle('open',opening);controlCenter.setAttribute('aria-hidden',!opening)};
  $('#clock-button').onclick=e=>{e.stopPropagation();const opening=!notificationCenter.classList.contains('open');closeOverlays(opening?'notifications':null);notificationCenter.classList.toggle('open',opening);notificationCenter.setAttribute('aria-hidden',!opening)};
  $('#spotlight-button').onclick=e=>{e.stopPropagation();openSpotlight()};
  $('#wifi-button').onclick=()=>$('#control-button').click(); $('#battery-button').onclick=()=>{const open=!controlCenter.classList.contains('open');if(open)$('#control-button').click();toast('Battery 86% · Power Source: Battery')};
  $('#focus-pill').onclick=()=>{const tile=$('[data-toggle-control="focus"]');tile.classList.toggle('active');toast(tile.classList.contains('active')?'Work Focus on':'Focus off')};
  $$('[data-toggle-control]').forEach(tile=>tile.onclick=()=>{tile.classList.toggle('active');const small=$('small',tile);if(small)small.textContent=tile.classList.contains('active')?(tile.dataset.toggleControl==='wifi'?'Studio 5G':'On'):'Off'});
  $('#brightness-slider').oninput=e=>document.documentElement.style.setProperty('--brightness',e.target.value/92);
  $('#volume-slider').oninput=e=>toast(e.target.value==='0'?'Muted':`Volume ${e.target.value}%`);
  $('#cc-play').onclick=e=>toggleMusic(e.currentTarget);
  $('#lock-screen-button').onclick=lockScreen;$('#power-button').onclick=()=>restartSequence('Restarting…');$('#unlock-button').onclick=()=>{const lock=$('#lock-screen');lock.classList.remove('open');lock.setAttribute('aria-hidden','true')};
  $('.clear-notifications').onclick=()=>{$('.notification-stack').innerHTML='<div class="empty-state" style="height:120px"><b>No New Notifications</b></div>';toast('Notifications cleared')};
  spotlightInput.addEventListener('input',e=>renderSpotlight(e.target.value));
  spotlightInput.addEventListener('keydown',e=>{const results=$$('.spotlight-result',spotlightResults);let i=results.findIndex(r=>r.classList.contains('active'));if(e.key==='ArrowDown'){e.preventDefault();results[i]?.classList.remove('active');results[(i+1)%results.length]?.classList.add('active')}if(e.key==='ArrowUp'){e.preventDefault();results[i]?.classList.remove('active');results[(i-1+results.length)%results.length]?.classList.add('active')}if(e.key==='Enter')results.find(r=>r.classList.contains('active'))?.click();if(e.key==='Escape')closeOverlays()});
  desktop.addEventListener('contextmenu',e=>{if(e.target.closest('.window,#dock,#menu-bar,.glass-popover,.side-panel'))return;e.preventDefault();showDesktopContext(e.clientX,e.clientY)});
  desktop.addEventListener('click',e=>{if(!e.target.closest('.glass-popover,.side-panel,.spotlight,.context-menu,.menu-trigger,#control-button,#clock-button,#spotlight-button'))closeOverlays();if(!e.target.closest('.desktop-item'))$$('.desktop-item').forEach(i=>i.classList.remove('selected'))});
  document.addEventListener('keydown',e=>{
    const cmd=e.metaKey||e.ctrlKey;
    if(cmd&&e.code==='Space'){e.preventDefault();spotlight.classList.contains('open')?closeOverlays():openSpotlight()}
    if(e.key==='Escape')closeOverlays();
    if(cmd&&e.key.toLowerCase()==='w'&&activeWindow){e.preventDefault();closeWindow(activeWindow)}
    if(cmd&&e.key.toLowerCase()==='m'&&activeWindow){e.preventDefault();minimizeWindow(activeWindow)}
    if(cmd&&e.key.toLowerCase()==='n'){e.preventDefault();handleAction('newwindow')}
    if(cmd&&e.key.toLowerCase()==='q'&&activeWindow){e.preventDefault();handleAction('quit')}
  });
  window.addEventListener('resize',()=>$$('.window',windowLayer).forEach(win=>{if(win.offsetLeft>innerWidth-100)win.style.left=`${innerWidth-win.offsetWidth-12}px`;if(win.offsetTop>innerHeight-120)win.style.top='10px'}));

  updateClock();setInterval(updateClock,1000);setTimeout(()=>$('#boot').classList.add('done'),1350);setTimeout(()=>openApp('finder'),1600);
})();
