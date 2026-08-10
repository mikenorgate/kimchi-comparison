/* ============================ macOS Tahoe 26 - Applications ============================ */
// This file defines all app render/init functions and registers them with MacOS.apps

MacOS.apps = {

  // ============================ FINDER ============================
  finder: {
    name: 'Finder',
    windowConfig: { width: 840, height: 540, title: 'Finder' },
    state: { currentFolder: 'Recents', selectedFile: null },
    folders: {
      'Recents': [
        { name: 'Project Report.pdf', type: 'pdf' },
        { name: 'Vacation Photos', type: 'folder' },
        { name: 'Budget.xlsx', type: 'spreadsheet' },
        { name: 'Meeting Notes.txt', type: 'text' },
        { name: 'Presentation.key', type: 'presentation' },
      ],
      'Desktop': [
        { name: 'Screenshot 2026.png', type: 'image' },
        { name: 'Untitled.txt', type: 'text' },
      ],
      'Documents': [
        { name: 'Resume.pdf', type: 'pdf' },
        { name: 'Invoice.docx', type: 'document' },
        { name: 'Taxes', type: 'folder' },
        { name: 'Notes.txt', type: 'text' },
      ],
      'Downloads': [
        { name: 'installer.dmg', type: 'archive' },
        { name: 'photo.jpg', type: 'image' },
        { name: 'song.mp3', type: 'audio' },
        { name: 'video.mov', type: 'video' },
      ],
      'Applications': [
        { name: 'Safari', type: 'app-safari' },
        { name: 'Notes', type: 'app-notes' },
        { name: 'Calculator', type: 'app-calc' },
        { name: 'Terminal', type: 'app-term' },
        { name: 'Settings', type: 'app-settings' },
        { name: 'Music', type: 'app-music' },
        { name: 'Photos', type: 'app-photos' },
        { name: 'Maps', type: 'app-maps' },
      ],
      'Pictures': [
        { name: 'Sunset.jpg', type: 'image' },
        { name: 'Family.jpg', type: 'image' },
        { name: 'Beach.jpg', type: 'image' },
      ],
      'AirDrop': [],
      'iCloud Drive': [
        { name: 'Cloud Docs', type: 'folder' },
        { name: 'Shared', type: 'folder' },
      ],
    },
    fileIcons: {
      'folder': '<svg viewBox="0 0 64 64"><path fill="#5ab4ff" d="M6 14a4 4 0 0 1 4-4h14l4 6h26a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"/></svg>',
      'pdf': '<svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="52" rx="4" fill="#ff3b30"/><text x="32" y="40" fill="#fff" font-size="12" font-weight="700" text-anchor="middle" font-family="Inter">PDF</text></svg>',
      'text': '<svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="52" rx="4" fill="#e8e8e8"/><line x1="18" y1="20" x2="46" y2="20" stroke="#888" stroke-width="2"/><line x1="18" y1="30" x2="46" y2="30" stroke="#888" stroke-width="2"/><line x1="18" y1="40" x2="38" y2="40" stroke="#888" stroke-width="2"/></svg>',
      'image': '<svg viewBox="0 0 64 64"><rect x="6" y="8" width="52" height="48" rx="4" fill="#34c759"/><circle cx="22" cy="24" r="4" fill="#fff"/><path d="M6 48l14-14 10 8 10-6 18 14v2a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill="#fff" opacity="0.6"/></svg>',
      'spreadsheet': '<svg viewBox="0 0 64 64"><rect x="8" y="6" width="48" height="52" rx="4" fill="#34c759"/><rect x="14" y="12" width="36" height="8" fill="#fff" opacity="0.3"/><rect x="14" y="22" width="36" height="8" fill="#fff" opacity="0.2"/><rect x="14" y="32" width="36" height="8" fill="#fff" opacity="0.3"/></svg>',
      'presentation': '<svg viewBox="0 0 64 64"><rect x="6" y="8" width="52" height="40" rx="4" fill="#ff9500"/><rect x="12" y="14" width="20" height="12" fill="#fff" opacity="0.5"/><rect x="36" y="14" width="16" height="6" fill="#fff" opacity="0.3"/><rect x="36" y="24" width="16" height="6" fill="#fff" opacity="0.3"/><rect x="28" y="50" width="8" height="8" fill="#666"/><rect x="20" y="56" width="24" height="4" fill="#666"/></svg>',
      'document': '<svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="52" rx="4" fill="#4a9eff"/><text x="32" y="40" fill="#fff" font-size="10" font-weight="700" text-anchor="middle" font-family="Inter">DOC</text></svg>',
      'archive': '<svg viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="4" fill="#8a8a9e"/><rect x="22" y="16" width="20" height="32" fill="#fff" opacity="0.3"/><line x1="26" y1="22" x2="38" y2="22" stroke="#fff" stroke-width="2"/><line x1="26" y1="28" x2="38" y2="28" stroke="#fff" stroke-width="2"/><line x1="26" y1="34" x2="38" y2="34" stroke="#fff" stroke-width="2"/></svg>',
      'audio': '<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="6" fill="#fa233b"/><path fill="#fff" d="M28 18l16-4v24c0 3-2 5-5 5s-5-2-5-5 2-5 5-5c.7 0 1.3.1 2 .3V22l-8 2v16c0 3-2 5-5 5s-5-2-5-5 2-5 5-5c.7 0 1.3.1 2 .3V18z"/></svg>',
      'video': '<svg viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="4" fill="#1a1a2e"/><polygon points="28,24 28,40 42,32" fill="#fff"/></svg>',
      'app-safari': '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1a1a2e"/><path d="M32 8l4 22-4 4-4-4z" fill="#ff3b30"/><path d="M56 32l-22 4-4-4 4-4z" fill="#fff"/></svg>',
      'app-notes': '<svg viewBox="0 0 64 64"><rect x="10" y="8" width="44" height="48" rx="6" fill="#fff"/><rect x="10" y="8" width="44" height="12" rx="6" fill="#febb2e"/></svg>',
      'app-calc': '<svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="52" rx="8" fill="#1a1a2e"/><rect x="16" y="12" width="32" height="12" rx="3" fill="#2a2a3e"/></svg>',
      'app-term': '<svg viewBox="0 0 64 64"><rect x="6" y="8" width="52" height="48" rx="8" fill="#1a1a1a"/><text x="14" y="36" fill="#4ade80" font-family="monospace" font-size="14" font-weight="bold">&gt;_</text></svg>',
      'app-settings': '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#8a8a9e"/><path fill="#fff" d="M32 18l2 4 4-1 1 4 4 2-1 4 1 4-4 2-1 4-4-1-2 4-2-4-4 1-1-4-4-2 1-4-1-4 4-2 1-4 4 1z"/></svg>',
      'app-music': '<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="10" fill="#fa233b"/><path fill="#fff" d="M26 20l16-4v24c0 3-2 5-5 5s-5-2-5-5 2-5 5-5c.7 0 1.3.1 2 .3V24l-8 2v16c0 3-2 5-5 5s-5-2-5-5 2-5 5-5c.7 0 1.3.1 2 .3V20z"/></svg>',
      'app-photos': '<svg viewBox="0 0 64 64"><rect x="6" y="10" width="52" height="44" rx="8" fill="#fff"/><circle cx="20" cy="24" r="4" fill="#fbbf24"/><path d="M6 44l14-14 10 10 10-8 18 16z" fill="#34d399"/></svg>',
      'app-maps': '<svg viewBox="0 0 64 64"><rect x="6" y="8" width="52" height="48" rx="6" fill="#a8d8a8"/><path d="M32 20c4 0 6 3 6 6 0 4-6 10-6 10s-6-6-6-10c0-3 2-6 6-6z" fill="#ff3b30"/></svg>',
    },
    render() {
      const sidebarItems = [
        { section: 'Favorites', items: ['AirDrop', 'Recents', 'Applications'] },
        { section: 'iCloud', items: ['iCloud Drive', 'Desktop', 'Documents'] },
        { section: 'Locations', items: ['Pictures', 'Downloads'] },
      ];
      let sidebarHtml = '';
      sidebarItems.forEach(group => {
        sidebarHtml += `<div class="finder-sidebar-section">${group.section}</div>`;
        group.items.forEach(item => {
          const active = this.state.currentFolder === item ? 'active' : '';
          sidebarHtml += `<div class="finder-sidebar-item ${active}" data-folder="${item}">${this.sidebarIcon(item)}${item}</div>`;
        });
      });
      const files = this.folders[this.state.currentFolder] || [];
      const fileGrid = files.map(f => {
        const icon = this.fileIcons[f.type] || this.fileIcons['text'];
        return `<div class="finder-file" data-name="${f.name}" data-type="${f.type}">
          ${icon}
          <div class="file-name">${f.name}</div>
        </div>`;
      }).join('');
      return `
        <div style="display:flex;flex:1;overflow:hidden;">
          <div class="finder-sidebar">${sidebarHtml}</div>
          <div class="finder-main">
            <div class="finder-toolbar">
              <div class="finder-toolbar-btn" onclick="MacOS.apps.finder.navBack()">‹</div>
              <div class="finder-toolbar-btn" onclick="MacOS.apps.finder.navForward()">›</div>
              <div class="finder-path">${this.state.currentFolder}</div>
              <div class="finder-toolbar-btn" onclick="MacOS.apps.finder.newFolder()">+ New</div>
            </div>
            <div class="finder-content">
              <div class="finder-grid">${fileGrid}</div>
            </div>
          </div>
        </div>`;
    },
    sidebarIcon(name) {
      const icons = {
        'AirDrop': '📡', 'Recents': '🕐', 'Applications': '📦',
        'iCloud Drive': '☁️', 'Desktop': '🖥️', 'Documents': '📄',
        'Pictures': '🖼️', 'Downloads': '⬇️',
      };
      return `<span style="font-size:14px;width:16px;text-align:center;">${icons[name] || '📁'}</span>`;
    },
    init(win) {
      win.querySelectorAll('.finder-sidebar-item').forEach(el => {
        el.addEventListener('click', () => {
          this.state.currentFolder = el.dataset.folder;
          this.refresh(win);
        });
      });
      win.querySelectorAll('.finder-file').forEach(el => {
        el.addEventListener('click', () => {
          win.querySelectorAll('.finder-file').forEach(f => f.classList.remove('selected'));
          el.classList.add('selected');
          this.state.selectedFile = el.dataset.name;
        });
        el.addEventListener('dblclick', () => {
          const type = el.dataset.type;
          const name = el.dataset.name;
          if (type === 'folder') {
            MacOS.toast(`Opening folder: ${name}`);
          } else if (type.startsWith('app-')) {
            const appId = type.replace('app-', '');
            const appMap = { safari: 'safari', notes: 'notes', calc: 'calculator', term: 'terminal', settings: 'settings', music: 'music', photos: 'photos', maps: 'maps' };
            MacOS.openApp(appMap[appId]);
          } else if (type === 'text') {
            MacOS.openApp('textedit');
          } else {
            MacOS.toast(`Opening: ${name}`);
          }
        });
      });
    },
    refresh(win) {
      const content = win.querySelector('.window-content');
      content.innerHTML = this.render();
      // Re-render strips the outer wrapper, so rebuild
      this.init(win);
    },
    navBack() { MacOS.toast('Back'); },
    navForward() { MacOS.toast('Forward'); },
    newFolder() {
      const folder = this.state.currentFolder;
      this.folders[folder].unshift({ name: 'Untitled Folder', type: 'folder' });
      const win = document.querySelector('.window[data-app="finder"], .window');
      MacOS.toast('New Folder created');
      if (MacOS.windows['finder']) this.refresh(MacOS.windows['finder'].el);
    },
  },

  // ============================ SAFARI ============================
  safari: {
    name: 'Safari',
    windowConfig: { width: 900, height: 600, title: 'Safari', minWidth: 500, minHeight: 300 },
    state: { url: '', history: [], historyIdx: -1, canGoBack: false, canGoForward: false },
    favorites: [
      { name: 'Apple', url: 'apple.com', icon: '', color: '#1d1d1f', emoji: '' },
      { name: 'Google', url: 'google.com', icon: 'G', color: '#4285f4', emoji: '🔍' },
      { name: 'YouTube', url: 'youtube.com', icon: '▶', color: '#ff0000', emoji: '📺' },
      { name: 'Wikipedia', url: 'wikipedia.org', icon: 'W', color: '#636363', emoji: '📚' },
      { name: 'GitHub', url: 'github.com', icon: '', color: '#24292e', emoji: '🐙' },
      { name: 'Reddit', url: 'reddit.com', icon: 'R', color: '#ff4500', emoji: '🤖' },
      { name: 'X', url: 'x.com', icon: 'X', color: '#000', emoji: '✖️' },
      { name: 'News', url: 'news.com', icon: 'N', color: '#cc0000', emoji: '📰' },
    ],
    render() {
      const favs = this.favorites.map(f => `
        <div class="safari-fav-item" data-url="${f.url}" data-name="${f.name}">
          <div class="fav-icon" style="background:${f.color};color:#fff;font-weight:700;font-size:${f.icon ? 22 : 24}px;">${f.icon || f.emoji}</div>
          <div class="fav-name">${f.name}</div>
        </div>`).join('');
      return `
        <div class="safari-toolbar">
          <div class="safari-nav-btn" onclick="MacOS.apps.safari.goBack()">‹</div>
          <div class="safari-nav-btn" onclick="MacOS.apps.safari.goForward()">›</div>
          <div class="safari-nav-btn" onclick="MacOS.apps.safari.reload()">⟳</div>
          <div class="safari-url-bar">
            <span style="color:rgba(0,0,0,0.3);font-size:13px;">🔒</span>
            <input type="text" id="safari-url-input" placeholder="Search or enter website" value="${this.state.url || ''}">
          </div>
          <div class="safari-nav-btn" onclick="MacOS.apps.safari.share()">⤴</div>
          <div class="safari-nav-btn" onclick="MacOS.apps.safari.newTab()">+</div>
        </div>
        <div class="safari-content" id="safari-content">
          <div class="safari-startpage">
            <h2 style="font-size:28px;color:#1d1d1f;margin-bottom:8px;">Start Page</h2>
            <p style="color:#86868b;margin-bottom:24px;">Favorites</p>
            <div class="safari-favorites">${favs}</div>
          </div>
        </div>`;
    },
    init(win) {
      const input = win.querySelector('#safari-url-input');
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.navigate(input.value);
      });
      win.querySelectorAll('.safari-fav-item').forEach(el => {
        el.addEventListener('click', () => this.navigate(el.dataset.url));
      });
    },
    navigate(url) {
      if (!url) return;
      this.state.history.push(url);
      this.state.url = url;
      const input = document.getElementById('safari-url-input');
      if (input) input.value = url;
      const content = document.getElementById('safari-content');
      if (!content) return;
      if (url.includes('apple.com')) {
        content.innerHTML = this.renderApplePage();
      } else if (url.includes('google.com')) {
        content.innerHTML = this.renderGooglePage();
      } else if (url.includes('youtube.com')) {
        content.innerHTML = this.renderYouTubePage();
      } else if (url.includes('wikipedia.org')) {
        content.innerHTML = this.renderWikipediaPage();
      } else if (url.includes('github.com')) {
        content.innerHTML = this.renderGitHubPage();
      } else {
        content.innerHTML = `<div class="safari-startpage"><h2 style="font-size:24px;color:#1d1d1f;">${url}</h2><p style="color:#86868b;margin-top:16px;">This is a simulated page for ${url}.</p><p style="color:#86868b;margin-top:8px;">In this demo, try: apple.com, google.com, youtube.com, wikipedia.org, github.com</p></div>`;
      }
    },
    renderApplePage() {
      return `<div style="padding:60px 40px;text-align:center;background:#fff;">
        <h1 style="font-size:48px;font-weight:700;color:#1d1d1f;margin-bottom:8px;">Apple</h1>
        <p style="font-size:20px;color:#86868b;margin-bottom:32px;">Think different.</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:800px;margin:0 auto;">
          <div style="background:#f5f5f7;border-radius:16px;padding:32px;"><div style="font-size:32px;margin-bottom:8px;">📱</div><h3>iPhone</h3><p style="color:#86868b;">From $799</p></div>
          <div style="background:#f5f5f7;border-radius:16px;padding:32px;"><div style="font-size:32px;margin-bottom:8px;">💻</div><h3>MacBook</h3><p style="color:#86868b;">From $999</p></div>
          <div style="background:#f5f5f7;border-radius:16px;padding:32px;"><div style="font-size:32px;margin-bottom:8px;">⌚</div><h3>Watch</h3><p style="color:#86868b;">From $399</p></div>
        </div>
      </div>`;
    },
    renderGooglePage() {
      return `<div style="padding:80px 40px;text-align:center;background:#fff;">
        <h1 style="font-size:48px;font-weight:700;margin-bottom:32px;"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></h1>
        <div style="max-width:500px;margin:0 auto;">
          <input type="text" placeholder="Search Google or type a URL" style="width:100%;padding:14px 24px;border-radius:24px;border:1px solid #ddd;font-size:16px;outline:none;" id="google-search" onkeydown="if(event.key==='Enter')MacOS.apps.safari.googleSearch(this.value)">
        </div>
        <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;">
          <button onclick="MacOS.apps.safari.googleSearch(document.getElementById('google-search').value)" style="padding:10px 20px;background:#f8f9fa;border:1px solid #f8f9fa;border-radius:4px;cursor:pointer;font-size:13px;">Google Search</button>
          <button onclick="MacOS.toast('Feeling lucky!')" style="padding:10px 20px;background:#f8f9fa;border:1px solid #f8f9fa;border-radius:4px;cursor:pointer;font-size:13px;">I'm Feeling Lucky</button>
        </div>
      </div>`;
    },
    googleSearch(query) {
      if (!query) return;
      const content = document.getElementById('safari-content');
      content.innerHTML = `<div style="padding:24px 40px;background:#fff;max-width:700px;margin:0 auto;">
        <p style="color:#70757a;font-size:12px;margin-bottom:20px;">About 1,230,000,000 results (0.42 seconds)</p>
        <div style="margin-bottom:24px;">
          <a style="color:#1a0dab;font-size:18px;cursor:pointer;" onclick="MacOS.toast('Opening result')">${query} - Best Results</a>
          <p style="color:#4d5156;font-size:14px;margin-top:4px;">https://example.com/${query.replace(/\s+/g,'-')}</p>
          <p style="color:#4d5156;font-size:14px;margin-top:4px;">Comprehensive information about ${query}. Find everything you need to know here.</p>
        </div>
        <div style="margin-bottom:24px;">
          <a style="color:#1a0dab;font-size:18px;cursor:pointer;" onclick="MacOS.toast('Opening result')">${query} Wikipedia</a>
          <p style="color:#4d5156;font-size:14px;margin-top:4px;">https://wikipedia.org/wiki/${query}</p>
          <p style="color:#4d5156;font-size:14px;margin-top:4px;">${query} is a topic of great interest. Learn more about its history and significance.</p>
        </div>
        <div style="margin-bottom:24px;">
          <a style="color:#1a0dab;font-size:18px;cursor:pointer;" onclick="MacOS.toast('Opening result')">${query} - Latest News</a>
          <p style="color:#4d5156;font-size:14px;margin-top:4px;">https://news.example.com/${query}</p>
          <p style="color:#4d5156;font-size:14px;margin-top:4px;">Stay updated with the latest developments about ${query}.</p>
        </div>
      </div>`;
    },
    renderYouTubePage() {
      const videos = [
        { title: 'macOS Tahoe 26 - What\'s New', channel: 'Apple', views: '2.4M', time: '3 days ago', emoji: '🖥️' },
        { title: 'Liquid Glass Design Explained', channel: 'Tech Insights', views: '1.1M', time: '1 week ago', emoji: '✨' },
        { title: 'Building Web Apps with HTML/CSS/JS', channel: 'Code Academy', views: '456K', time: '2 weeks ago', emoji: '💻' },
        { title: 'Top 10 macOS Tips and Tricks', channel: 'Tech Tips', views: '890K', time: '1 month ago', emoji: '⌨️' },
        { title: 'The History of macOS', channel: 'Retro Tech', views: '3.2M', time: '2 months ago', emoji: '📜' },
        { title: 'DIY: Build Your Own Desktop OS', channel: 'Hacker House', views: '234K', time: '3 months ago', emoji: '🔧' },
      ];
      const grid = videos.map(v => `
        <div style="cursor:pointer;margin-bottom:24px;" onclick="MacOS.toast('Playing: ${v.title}')">
          <div style="width:100%;aspect-ratio:16/9;background:#1a1a1a;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:48px;">${v.emoji}</div>
          <div style="display:flex;gap:12px;margin-top:8px;">
            <div style="width:36px;height:36px;border-radius:50%;background:#cc0000;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;flex-shrink:0;">${v.channel[0]}</div>
            <div><h3 style="font-size:14px;color:#0f0f0f;">${v.title}</h3>
            <p style="font-size:12px;color:#606060;">${v.channel} · ${v.views} views · ${v.time}</p></div>
          </div>
        </div>`).join('');
      return `<div style="padding:24px 40px;background:#fff;max-width:900px;margin:0 auto;">
        <h1 style="font-size:24px;margin-bottom:24px;color:#0f0f0f;">YouTube</h1>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;">${grid}</div>
      </div>`;
    },
    renderWikipediaPage() {
      return `<div style="padding:40px;background:#fff;max-width:700px;margin:0 auto;border-left:4px solid #a2a9b1;">
        <h1 style="font-size:28px;font-weight:400;font-family:Georgia,serif;margin-bottom:4px;">macOS Tahoe</h1>
        <p style="color:#54595d;font-size:13px;font-family:Georgia,serif;border-bottom:1px solid #a2a9b1;padding-bottom:8px;margin-bottom:16px;">From Wikipedia, the free encyclopedia</p>
        <p style="font-size:14px;color:#202122;line-height:1.6;font-family:Georgia,serif;margin-bottom:12px;"><b>macOS Tahoe</b> (version 26) is the latest major release of Apple Inc.'s macOS operating system. It was announced at WWDC 2025 and introduces the <b>Liquid Glass</b> design language across the system.</p>
        <h2 style="font-size:20px;font-weight:400;font-family:Georgia,serif;margin:20px 0 8px;border-bottom:1px solid #a2a9b1;padding-bottom:4px;">Features</h2>
        <ul style="padding-left:20px;font-size:14px;color:#202122;line-height:1.8;font-family:Georgia,serif;">
          <li>Liquid Glass design with translucent menu bar, dock, and toolbars</li>
          <li>Completely transparent menu bar</li>
          <li>Redesigned Control Center with customization</li>
          <li>Updated Spotlight with enhanced search capabilities</li>
          <li>Phone app arrives on Mac</li>
          <li>Customizable app icons and folder colors</li>
        </ul>
        <h2 style="font-size:20px;font-weight:400;font-family:Georgia,serif;margin:20px 0 8px;border-bottom:1px solid #a2a9b1;padding-bottom:4px;">System requirements</h2>
        <p style="font-size:14px;color:#202122;line-height:1.6;font-family:Georgia,serif;">macOS Tahoe requires a Mac with Apple Silicon or an Intel-based Mac from 2018 or later.</p>
      </div>`;
    },
    renderGitHubPage() {
      return `<div style="padding:32px;background:#0d1117;color:#c9d1d9;min-height:100%;">
        <div style="max-width:800px;margin:0 auto;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
            <svg viewBox="0 0 16 16" width="32" height="32" fill="#58a6ff"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            <h1 style="font-size:24px;color:#fff;">GitHub</h1>
          </div>
          <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:24px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
              <span style="width:12px;height:12px;border-radius:50%;background:#f1e05a;display:inline-block;"></span>
              <span style="font-size:14px;">JavaScript</span>
              <span style="color:#8b949e;font-size:13px;">· 100%</span>
            </div>
            <h2 style="font-size:20px;color:#58a6ff;margin-bottom:8px;">macos-tahoe-web</h2>
            <p style="color:#8b949e;font-size:14px;">A web-based recreation of macOS Tahoe 26 with Liquid Glass design</p>
            <div style="display:flex;gap:16px;margin-top:16px;">
              <span style="color:#8b949e;font-size:13px;">⭐ 1.2k stars</span>
              <span style="color:#8b949e;font-size:13px;">🔀 89 forks</span>
              <span style="color:#8b949e;font-size:13px;">👁️ 23 watching</span>
            </div>
          </div>
          <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:24px;">
            <h3 style="color:#fff;font-size:16px;margin-bottom:12px;">README.md</h3>
            <p style="color:#c9d1d9;font-size:14px;line-height:1.6;"># macOS Tahoe Web</p>
            <p style="color:#c9d1d9;font-size:14px;line-height:1.6;">A faithful web recreation of macOS Tahoe 26, featuring the Liquid Glass design language, working apps, and a full window management system.</p>
            <p style="color:#8b949e;font-size:13px;margin-top:16px;">Updated 2 days ago</p>
          </div>
        </div>
      </div>`;
    },
    goBack() { MacOS.toast('Back'); },
    goForward() { MacOS.toast('Forward'); },
    reload() { MacOS.toast('Reloaded'); },
    share() { MacOS.toast('Share: Copy Link, AirDrop, Mail...'); },
    newTab() { MacOS.toast('New Tab'); },
  },

  // ============================ NOTES ============================
  notes: {
    name: 'Notes',
    windowConfig: { width: 700, height: 500, title: 'Notes', minWidth: 400 },
    state: { activeNote: 0 },
    notes: [
      { title: 'Welcome to Notes', body: 'Welcome to Notes!\n\nThis is a fully functional notes app. You can:\n• Create new notes\n• Edit existing notes\n• Your changes are saved automatically\n\nClick the + button to create a new note.\n\nTry editing this note right now!' },
      { title: 'Shopping List', body: 'Shopping List\n\n• Milk\n• Bread\n• Eggs\n• Coffee\n• Apples\n• Chicken\n• Rice\n• Olive oil' },
      { title: 'Meeting Notes', body: 'Meeting Notes - Aug 10\n\nAttendees: Sarah, Mike, Jennifer\n\nAgenda:\n1. Q3 Review\n2. Q4 Planning\n3. New product launch\n\nAction items:\n- Sarah: Send budget report\n- Mike: Schedule design review\n- Jennifer: Update roadmap' },
      { title: 'Ideas', body: 'Project Ideas\n\n1. Build a macOS web clone ✓\n2. Learn a new framework\n3. Start a blog\n4. Create a portfolio website\n5. Contribute to open source' },
      { title: 'Books to Read', body: 'Books to Read\n\n• The Pragmatic Programmer\n• Clean Code\n• Designing Data-Intensive Applications\n• System Design Interview\n• The Mythical Man-Month' },
    ],
    render() {
      const list = this.notes.map((note, i) => {
        const active = this.state.activeNote === i ? 'active' : '';
        const preview = note.body.split('\n')[1] || note.body.substring(0, 40);
        return `<div class="notes-list-item ${active}" data-idx="${i}">
          <div class="note-title">${note.title}</div>
          <div class="note-preview">${preview}</div>
        </div>`;
      }).join('');
      const note = this.notes[this.state.activeNote] || this.notes[0];
      return `
        <div class="notes-layout">
          <div class="notes-sidebar">
            <div class="notes-list-header" style="display:flex;justify-content:space-between;align-items:center;">
              <span>All Notes</span>
              <span style="cursor:pointer;font-size:16px;color:var(--accent);" onclick="MacOS.apps.notes.newNote()">+</span>
            </div>
            ${list}
          </div>
          <div class="notes-editor">
            <textarea id="notes-textarea" placeholder="Start typing...">${note.body}</textarea>
          </div>
        </div>`;
    },
    init(win) {
      win.querySelectorAll('.notes-list-item').forEach(el => {
        el.addEventListener('click', () => {
          this.state.activeNote = parseInt(el.dataset.idx);
          this.refresh(win);
        });
      });
      const textarea = win.querySelector('#notes-textarea');
      if (textarea) {
        textarea.addEventListener('input', () => {
          const note = this.notes[this.state.activeNote];
          note.body = textarea.value;
          note.title = textarea.value.split('\n')[0].substring(0, 30) || 'New Note';
          // Update sidebar title
          const item = win.querySelector(`.notes-list-item[data-idx="${this.state.activeNote}"] .note-title`);
          if (item) item.textContent = note.title;
          const preview = win.querySelector(`.notes-list-item[data-idx="${this.state.activeNote}"] .note-preview`);
          if (preview) preview.textContent = textarea.value.split('\n')[1] || '';
        });
      }
    },
    newNote() {
      this.notes.unshift({ title: 'New Note', body: '' });
      this.state.activeNote = 0;
      if (MacOS.windows['notes']) this.refresh(MacOS.windows['notes'].el);
    },
    refresh(win) {
      const content = win.querySelector('.window-content');
      content.innerHTML = this.render();
      this.init(win);
    },
  },

  // ============================ CALCULATOR ============================
  calculator: {
    name: 'Calculator',
    windowConfig: { width: 300, height: 440, title: 'Calculator', minWidth: 280, minHeight: 400, maxWidth: 400 },
    state: { display: '0', prev: null, op: null, waiting: false },
    render() {
      return `
        <div class="calc-body">
          <div class="calc-display" id="calc-display">${this.state.display}</div>
          <div class="calc-buttons">
            <button class="calc-btn fn" onclick="MacOS.apps.calculator.input('AC')">AC</button>
            <button class="calc-btn fn" onclick="MacOS.apps.calculator.input('+/-')">±</button>
            <button class="calc-btn fn" onclick="MacOS.apps.calculator.input('%')">%</button>
            <button class="calc-btn op" onclick="MacOS.apps.calculator.input('÷')">÷</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('7')">7</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('8')">8</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('9')">9</button>
            <button class="calc-btn op" onclick="MacOS.apps.calculator.input('×')">×</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('4')">4</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('5')">5</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('6')">6</button>
            <button class="calc-btn op" onclick="MacOS.apps.calculator.input('-')">−</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('1')">1</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('2')">2</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('3')">3</button>
            <button class="calc-btn op" onclick="MacOS.apps.calculator.input('+')">+</button>
            <button class="calc-btn zero" onclick="MacOS.apps.calculator.input('0')">0</button>
            <button class="calc-btn" onclick="MacOS.apps.calculator.input('.')">.</button>
            <button class="calc-btn op" onclick="MacOS.apps.calculator.input('=')">=</button>
          </div>
        </div>`;
    },
    init(win) {
      win.addEventListener('keydown', (e) => {
        const key = e.key;
        if (/[0-9]/.test(key)) this.input(key);
        else if (key === '.') this.input('.');
        else if (key === '+') this.input('+');
        else if (key === '-') this.input('-');
        else if (key === '*') this.input('×');
        else if (key === '/') { e.preventDefault(); this.input('÷'); }
        else if (key === 'Enter' || key === '=') { e.preventDefault(); this.input('='); }
        else if (key === 'Escape' || key === 'c' || key === 'C') this.input('AC');
        else if (key === 'Backspace') this.backspace();
      });
      win.tabIndex = 0;
      win.focus();
    },
    input(val) {
      const display = document.getElementById('calc-display');
      if (!display) return;
      if (val === 'AC') {
        this.state = { display: '0', prev: null, op: null, waiting: false };
      } else if (val === '+/-') {
        this.state.display = parseFloat(this.state.display) * -1 + '';
      } else if (val === '%') {
        this.state.display = parseFloat(this.state.display) / 100 + '';
      } else if (['+','-','×','÷'].includes(val)) {
        this.state.prev = parseFloat(this.state.display);
        this.state.op = val;
        this.state.waiting = true;
      } else if (val === '=') {
        if (this.state.op && this.state.prev !== null) {
          const curr = parseFloat(this.state.display);
          let result;
          switch(this.state.op) {
            case '+': result = this.state.prev + curr; break;
            case '-': result = this.state.prev - curr; break;
            case '×': result = this.state.prev * curr; break;
            case '÷': result = this.state.prev / curr; break;
          }
          this.state.display = this.formatResult(result);
          this.state.prev = null;
          this.state.op = null;
          this.state.waiting = true;
        }
      } else if (val === '.') {
        if (this.state.waiting) { this.state.display = '0.'; this.state.waiting = false; }
        else if (!this.state.display.includes('.')) this.state.display += '.';
      } else {
        if (this.state.waiting || this.state.display === '0') {
          this.state.display = val;
          this.state.waiting = false;
        } else {
          if (this.state.display.length < 12) this.state.display += val;
        }
      }
      display.textContent = this.state.display;
    },
    backspace() {
      if (this.state.display.length > 1) this.state.display = this.state.display.slice(0, -1);
      else this.state.display = '0';
      const display = document.getElementById('calc-display');
      if (display) display.textContent = this.state.display;
    },
    formatResult(n) {
      if (!isFinite(n)) return 'Error';
      return parseFloat(n.toPrecision(12)).toString();
    },
  },

  // ============================ TERMINAL ============================
  terminal: {
    name: 'Terminal',
    windowConfig: { width: 680, height: 420, title: 'Terminal — bash', minWidth: 400, minHeight: 200 },
    state: { history: [], historyIdx: -1, cwd: '~' },
    commands: {
      help() {
        return 'Available commands:\n  help        - Show this help\n  ls          - List files\n  pwd         - Print working directory\n  cd <dir>    - Change directory\n  echo <text> - Print text\n  date        - Show current date/time\n  whoami      - Print current user\n  clear       - Clear terminal\n  echo        - Print text\n  neofetch    - System info\n  open <app>  - Open an app\n  cat <file>  - Display file contents\n  history     - Show command history\n  about       - About this terminal\n  exit        - Close terminal';
      },
      ls() {
        return 'Desktop    Documents  Downloads  Movies     Music\nPictures   Public     Projects   .config    .bashrc';
      },
      pwd() { return '/Users/mike'; },
      cd(args) {
        if (args[0]) MacOS.apps.terminal.state.cwd = args[0];
        return '';
      },
      echo(args) { return args.join(' '); },
      date() { return new Date().toString(); },
      whoami() { return 'mike'; },
      clear() {
        const body = document.querySelector('.terminal-body');
        if (body) body.innerHTML = '';
        return null;
      },
      neofetch() {
        return `                    'c.          mike@MacBook-Pro
                 ,xNMM.          ---------------
               .OMMMMo           OS: macOS Tahoe 26
               OMMM0,            Host: MacBook Pro
     .;loddo:' loolloddol;.      Kernel: Darwin 26.0.0
   cKMMMMMMMMMMNWMMMMMMMMMM0:    Shell: bash 5.2.0
 .KMMMMMMMMMMMMMMMMMMMMMMMWd.   Resolution: 2560x1600
 XMMMMMMMMMMMMMMMMMMMMMMMX.    WM: Aqua
;MMMMMMMMMMMMMMMMMMMMMMMM:     Terminal: Terminal.app
:MMMMMMMMMMMMMMMMMMMMMMMM:    CPU: Apple M3 Pro
.MMMMMMMMMMMMMMMMMMMMMMMMN.    GPU: Apple M3 Pro
 kMMMMMMMMMMMMMMMMMMMMMMMMWd.  Memory: 18GB
 'XMMMMMMMMMMMMMMMMMMMMMMMMMX.  Disk: 512GB
   .XMMMMMMMMMMMMMMMMMMMMMMMMK    Battery: 100%`;
      },
      open(args) {
        const app = args[0];
        const apps = { safari: 'safari', notes: 'notes', calc: 'calculator', calculator: 'calculator', finder: 'finder', settings: 'settings', music: 'music', photos: 'photos', calendar: 'calendar', messages: 'messages', weather: 'weather', maps: 'maps', textedit: 'textedit' };
        if (apps[app]) { MacOS.openApp(apps[app]); return `Opening ${app}...`; }
        return `open: ${app}: app not found`;
      },
      cat(args) {
        if (!args[0]) return 'cat: missing file operand';
        if (args[0] === '.bashrc') return 'export PS1="\\u@\\h:\\w$ "\nexport PATH=/usr/local/bin:$PATH\nalias ll="ls -la"';
        return `cat: ${args[0]}: No such file or directory`;
      },
      history(args, hist) {
        return hist.map((c, i) => `  ${i+1}  ${c}`).join('\n') || 'No history';
      },
      about() {
        return 'macOS Tahoe 26 Terminal\nA web-based terminal emulator.\nPart of the macOS Tahoe Web project.';
      },
      exit() { MacOS.closeWindow('terminal'); return null; },
    },
    render() {
      return `<div class="terminal-body" id="terminal-body">
        <div class="terminal-line">Last login: ${new Date().toLocaleString()} on ttys000</div>
        <div class="terminal-line">Welcome to macOS Tahoe 26 — Type 'help' for available commands.</div>
        <div class="terminal-line"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">mike@MacBook-Pro ${this.state.cwd} %</span>
          <input type="text" class="terminal-input" id="terminal-input" autofocus>
        </div>
      </div>`;
    },
    init(win) {
      const input = win.querySelector('#terminal-input');
      const body = win.querySelector('#terminal-body');
      input.focus();
      // Click anywhere focuses input
      body.addEventListener('click', () => input.focus());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = input.value;
          this.state.history.push(cmd);
          this.state.historyIdx = this.state.history.length;
          // Echo the command
          const prompt = document.createElement('div');
          prompt.className = 'terminal-line terminal-input-line';
          prompt.innerHTML = `<span class="terminal-prompt">mike@MacBook-Pro ${this.state.cwd} %</span><span>${cmd}</span>`;
          input.parentElement.replaceWith(prompt);

          const output = this.execute(cmd);
          if (output === null) return; // clear or exit
          if (output) {
            const out = document.createElement('div');
            out.className = 'terminal-line';
            out.textContent = output;
            body.appendChild(out);
          }
          // New input line
          const newInput = document.createElement('div');
          newInput.className = 'terminal-input-line';
          newInput.innerHTML = `<span class="terminal-prompt">mike@MacBook-Pro ${this.state.cwd} %</span><input type="text" class="terminal-input" id="terminal-input">`;
          body.appendChild(newInput);
          const newInp = newInput.querySelector('input');
          this.bindInput(newInp, body);
          newInp.focus();
          body.scrollTop = body.scrollHeight;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.state.historyIdx > 0) {
            this.state.historyIdx--;
            input.value = this.state.history[this.state.historyIdx] || '';
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.state.historyIdx < this.state.history.length - 1) {
            this.state.historyIdx++;
            input.value = this.state.history[this.state.historyIdx] || '';
          } else {
            this.state.historyIdx = this.state.history.length;
            input.value = '';
          }
        }
      });
    },
    bindInput(input, body) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const cmd = input.value;
          this.state.history.push(cmd);
          this.state.historyIdx = this.state.history.length;
          const prompt = document.createElement('div');
          prompt.className = 'terminal-line terminal-input-line';
          prompt.innerHTML = `<span class="terminal-prompt">mike@MacBook-Pro ${this.state.cwd} %</span><span>${cmd}</span>`;
          input.parentElement.replaceWith(prompt);
          const output = this.execute(cmd);
          if (output === null) return;
          if (output) {
            const out = document.createElement('div');
            out.className = 'terminal-line';
            out.textContent = output;
            body.appendChild(out);
          }
          const newInput = document.createElement('div');
          newInput.className = 'terminal-input-line';
          newInput.innerHTML = `<span class="terminal-prompt">mike@MacBook-Pro ${this.state.cwd} %</span><input type="text" class="terminal-input">`;
          body.appendChild(newInput);
          this.bindInput(newInput.querySelector('input'), body);
          body.querySelector('input').focus();
          body.scrollTop = body.scrollHeight;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.state.historyIdx > 0) {
            this.state.historyIdx--;
            input.value = this.state.history[this.state.historyIdx] || '';
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.state.historyIdx < this.state.history.length - 1) {
            this.state.historyIdx++;
            input.value = this.state.history[this.state.historyIdx] || '';
          } else {
            this.state.historyIdx = this.state.history.length;
            input.value = '';
          }
        }
      });
    },
    execute(cmdLine) {
      if (!cmdLine.trim()) return '';
      const parts = cmdLine.trim().split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);
      if (this.commands[cmd]) {
        return this.commands[cmd](args, this.state.history);
      }
      return `zsh: command not found: ${cmd}`;
    },
  },

  // ============================ SETTINGS ============================
  settings: {
    name: 'System Settings',
    windowConfig: { width: 800, height: 560, title: 'System Settings', minWidth: 600 },
    state: { section: 'appearance' },
    sections: [
      { id: 'wifi', name: 'Wi-Fi', icon: '📶' },
      { id: 'bluetooth', name: 'Bluetooth', icon: '🔵' },
      { id: 'network', name: 'Network', icon: '🌐' },
      { id: 'appearance', name: 'Appearance', icon: '🎨' },
      { id: 'wallpaper', name: 'Wallpaper', icon: '🖼️' },
      { id: 'screensaver', name: 'Screen Saver', icon: '💤' },
      { id: 'notifications', name: 'Notifications', icon: '🔔' },
      { id: 'sound', name: 'Sound', icon: '🔊' },
      { id: 'display', name: 'Display', icon: '🖥️' },
      { id: 'battery', name: 'Battery', icon: '🔋' },
      { id: 'storage', name: 'Storage', icon: '💾' },
      { id: 'about', name: 'About', icon: 'ℹ️' },
    ],
    render() {
      const sidebar = this.sections.map(s => {
        const active = this.state.section === s.id ? 'active' : '';
        return `<div class="settings-sidebar-item ${active}" data-section="${s.id}">
          <span style="font-size:16px;">${s.icon}</span>
          <span>${s.name}</span>
        </div>`;
      }).join('');
      return `
        <div style="display:flex;flex:1;overflow:hidden;">
          <div class="settings-sidebar">
            <div style="padding:16px;text-align:center;">
              <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#4a9eff,#8e44ad);margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#fff;">M</div>
              <div style="font-size:13px;font-weight:600;color:var(--text-primary);">Mike's Mac</div>
              <div style="font-size:11px;color:var(--text-secondary);">Apple Account</div>
            </div>
            ${sidebar}
          </div>
          <div class="settings-main" id="settings-main">
            ${this.renderSection()}
          </div>
        </div>`;
    },
    renderSection() {
      const s = this.state.section;
      if (s === 'appearance') {
        const appearanceOpts = [
          { id: 'light', name: 'Light', icon: '☀️' },
          { id: 'dark', name: 'Dark', icon: '🌙' },
          { id: 'tinted', name: 'Tinted', icon: '🌈' },
        ];
        const accentColors = ['#0a84ff','#bf5af2','#ff375f','#ff9f0a','#ffd60a','#30d158','#64d2ff','#8e8e93'];
        return `
          <div class="settings-section">
            <div class="settings-section-title">Appearance</div>
            <div style="display:flex;gap:16px;margin-bottom:20px;">
              ${appearanceOpts.map(o => `
                <div onclick="MacOS.setAppearance('${o.id}')" style="cursor:pointer;text-align:center;">
                  <div style="width:80px;height:56px;border-radius:8px;background:${o.id==='light'?'#f5f5f7':o.id==='dark'?'#1a1a2e':'linear-gradient(135deg,#4a9eff,#8e44ad)'};border:2px solid ${MacOS.appearance===o.id?'var(--accent)':'transparent'};margin-bottom:6px;"></div>
                  <span style="font-size:12px;color:var(--text-primary);">${o.name}</span>
                </div>`).join('')}
            </div>
          </div>
          <div class="settings-section">
            <div class="settings-section-title">Accent Color</div>
            <div style="display:flex;gap:12px;">
              ${accentColors.map(c => `<div onclick="MacOS.setAccentColor('${c}')" style="width:24px;height:24px;border-radius:50%;background:${c};cursor:pointer;border:2px solid ${MacOS.accentColor===c?'#fff':'transparent'};box-shadow:0 0 0 1px rgba(0,0,0,0.1);"></div>`).join('')}
            </div>
          </div>
          <div class="settings-section">
            <div class="settings-section-title">Options</div>
            <div class="settings-row"><span class="settings-row-label">Show scroll bars</span><span class="settings-row-value">When scrolling</span></div>
            <div class="settings-row"><span class="settings-row-label">Allow wallpaper tinting</span><div class="toggle-switch on" onclick="this.classList.toggle('on')"></div></div>
            <div class="settings-row"><span class="settings-row-label">Reduce transparency</span><div class="toggle-switch" onclick="this.classList.toggle('on')"></div></div>
          </div>`;
      }
      if (s === 'wallpaper') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Wallpaper</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
              ${MacOS.wallpapers.map((w, i) => `
                <div onclick="MacOS.setWallpaper(${i});MacOS.apps.settings.refresh();" style="cursor:pointer;">
                  <div style="width:100%;aspect-ratio:16/10;border-radius:8px;background:${w};border:2px solid ${MacOS.wallpaperIndex===i?'var(--accent)':'transparent'};"></div>
                </div>`).join('')}
            </div>
          </div>`;
      }
      if (s === 'wifi') {
        const networks = [
          { name: 'Home Network', strength: 4, secured: true, connected: true },
          { name: 'Coffee Shop WiFi', strength: 3, secured: false },
          { name: 'Neighbor 5G', strength: 2, secured: true },
          { name: 'XFINITY WiFi', strength: 1, secured: false },
          { name: 'Starbucks WiFi', strength: 3, secured: false },
        ];
        return `
          <div class="settings-section">
            <div class="settings-section-title">Wi-Fi</div>
            <div class="settings-row">
              <span class="settings-row-label">Wi-Fi</span>
              <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="settings-row">
              <span class="settings-row-label">Network Name</span>
              <span class="settings-row-value">Home Network</span>
            </div>
          </div>
          <div class="settings-section">
            <div class="settings-section-title">Other Networks</div>
            ${networks.filter(n => !n.connected).map(n => `
              <div class="settings-row" onclick="MacOS.toast('Connecting to ${n.name}...')">
                <span class="settings-row-label">${n.name} ${n.secured ? '🔒' : ''}</span>
                <span class="settings-row-value">${'▮'.repeat(n.strength)}${'▯'.repeat(4-n.strength)}</span>
              </div>`).join('')}
          </div>`;
      }
      if (s === 'bluetooth') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Bluetooth</div>
            <div class="settings-row"><span class="settings-row-label">Bluetooth</span><div class="toggle-switch on" onclick="this.classList.toggle('on')"></div></div>
          </div>
          <div class="settings-section">
            <div class="settings-section-title">Devices</div>
            <div class="settings-row"><span class="settings-row-label">AirPods Pro</span><span class="settings-row-value">Connected</span></div>
            <div class="settings-row"><span class="settings-row-label">Magic Mouse</span><span class="settings-row-value">Connected</span></div>
            <div class="settings-row"><span class="settings-row-label">Magic Keyboard</span><span class="settings-row-value">Connected</span></div>
            <div class="settings-row"><span class="settings-row-label">JBL Flip 6</span><span class="settings-row-value">Not Connected</span></div>
          </div>`;
      }
      if (s === 'sound') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Sound Effects</div>
            <div class="settings-row"><span class="settings-row-label">Output volume</span><span class="settings-row-value">60%</span></div>
            <div class="settings-row"><span class="settings-row-label">Alert sound</span><span class="settings-row-value">Glass</span></div>
            <div class="settings-row"><span class="settings-row-label">Play sound on startup</span><div class="toggle-switch on" onclick="this.classList.toggle('on')"></div></div>
            <div class="settings-row"><span class="settings-row-label">Play user interface sound effects</span><div class="toggle-switch" onclick="this.classList.toggle('on')"></div></div>
          </div>
          <div class="settings-section">
            <div class="settings-section-title">Output</div>
            <div class="settings-row"><span class="settings-row-label">Output Device</span><span class="settings-row-value">AirPods Pro</span></div>
            <div class="settings-row"><span class="settings-row-label">Balance</span><span class="settings-row-value">Center</span></div>
          </div>`;
      }
      if (s === 'display') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Display</div>
            <div class="settings-row"><span class="settings-row-label">Brightness</span><span class="settings-row-value">75%</span></div>
            <div class="settings-row"><span class="settings-row-label">True Tone</span><div class="toggle-switch on" onclick="this.classList.toggle('on')"></div></div>
            <div class="settings-row"><span class="settings-row-label">Night Shift</span><div class="toggle-switch" onclick="this.classList.toggle('on')"></div></div>
          </div>
          <div class="settings-section">
            <div class="settings-section-title">Resolution</div>
            <div class="settings-row"><span class="settings-row-label">Resolution</span><span class="settings-row-value">Default (2560 × 1600)</span></div>
            <div class="settings-row"><span class="settings-row-label">Refresh Rate</span><span class="settings-row-value">60 Hz</span></div>
          </div>`;
      }
      if (s === 'battery') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Battery</div>
            <div class="settings-row"><span class="settings-row-label">Battery Level</span><span class="settings-row-value">100% 🔋</span></div>
            <div class="settings-row"><span class="settings-row-label">Power Source</span><span class="settings-row-value">Power Adapter</span></div>
            <div class="settings-row"><span class="settings-row-label">Low Power Mode</span><div class="toggle-switch" onclick="this.classList.toggle('on')"></div></div>
          </div>
          <div class="settings-section">
            <div class="settings-section-title">Usage</div>
            <div class="settings-row"><span class="settings-row-label">Time remaining</span><span class="settings-row-value">12 hours</span></div>
            <div class="settings-row"><span class="settings-row-label">Screen On Time</span><span class="settings-row-value">3h 24m</span></div>
          </div>`;
      }
      if (s === 'storage') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Storage</div>
            <div style="background:rgba(255,255,255,0.2);border-radius:8px;padding:16px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="font-size:14px;font-weight:600;color:var(--text-primary);">Macintosh HD</span>
                <span style="font-size:13px;color:var(--text-secondary);">312 GB of 512 GB available</span>
              </div>
              <div style="height:24px;border-radius:6px;overflow:hidden;display:flex;background:rgba(0,0,0,0.08);">
                <div style="width:25%;background:#4a9eff;" title="Apps"></div>
                <div style="width:15%;background:#34c759;" title="Documents"></div>
                <div style="width:10%;background:#ff9500;" title="Photos"></div>
                <div style="width:5%;background:#ff375f;" title="System"></div>
              </div>
              <div style="display:flex;gap:16px;margin-top:8px;font-size:11px;color:var(--text-secondary);">
                <span>Apps 128GB</span><span>Docs 77GB</span><span>Photos 51GB</span><span>System 26GB</span>
              </div>
            </div>
          </div>`;
      }
      if (s === 'notifications') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Notifications</div>
            <div class="settings-row"><span class="settings-row-label">Allow Notifications</span><div class="toggle-switch on" onclick="this.classList.toggle('on')"></div></div>
            <div class="settings-row"><span class="settings-row-label">Show previews</span><span class="settings-row-value">When unlocked</span></div>
            <div class="settings-row"><span class="settings-row-label">Notification grouping</span><span class="settings-row-value">Automatic</span></div>
          </div>`;
      }
      if (s === 'network') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Network</div>
            <div class="settings-row"><span class="settings-row-label">Status</span><span class="settings-row-value">Connected</span></div>
            <div class="settings-row"><span class="settings-row-label">IP Address</span><span class="settings-row-value">192.168.1.42</span></div>
            <div class="settings-row"><span class="settings-row-label">Router</span><span class="settings-row-value">192.168.1.1</span></div>
            <div class="settings-row"><span class="settings-row-label">DNS</span><span class="settings-row-value">8.8.8.8, 8.8.4.4</span></div>
          </div>`;
      }
      if (s === 'screensaver') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">Screen Saver</div>
            <div class="settings-row"><span class="settings-row-label">Screen Saver</span><span class="settings-row-value">Aerial</span></div>
            <div class="settings-row"><span class="settings-row-label">Start after</span><span class="settings-row-value">5 minutes</span></div>
          </div>`;
      }
      if (s === 'about') {
        return `
          <div class="settings-section">
            <div class="settings-section-title">About</div>
            <div style="text-align:center;padding:20px;">
              <div style="width:80px;height:80px;margin:0 auto 16px;">
                <svg viewBox="0 0 100 100" style="width:100%;height:100%;"><path fill="#1d1d1f" d="M70 55c0-12 10-18 10-18-5-8-13-10-16-10-7 0-13 4-17 4s-9-4-15-4c-8 0-15 4-19 12-8 14-2 34 6 46 4 6 8 12 14 12s8-4 14-4 8 4 14 4c6 0 10-6 13-11 4-7 6-13 6-13z"/></svg>
              </div>
              <h2 style="font-size:22px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">macOS Tahoe 26</h2>
              <p style="color:var(--text-secondary);margin-bottom:20px;">Web Recreation · Liquid Glass Edition</p>
            </div>
            <div class="settings-row"><span class="settings-row-label">Chip</span><span class="settings-row-value">Apple M3 Pro</span></div>
            <div class="settings-row"><span class="settings-row-label">Memory</span><span class="settings-row-value">18 GB</span></div>
            <div class="settings-row"><span class="settings-row-label">Startup disk</span><span class="settings-row-value">Macintosh HD</span></div>
            <div class="settings-row"><span class="settings-row-label">Serial number</span><span class="settings-row-value">TAH26WEB2026</span></div>
            <div class="settings-row"><span class="settings-row-label">macOS</span><span class="settings-row-value">Tahoe 26.0 (Web)</span></div>
          </div>`;
      }
      return `<div class="settings-section"><div class="settings-section-title">Coming Soon</div><p style="color:var(--text-secondary);">This section is under construction.</p></div>`;
    },
    init(win) {
      win.querySelectorAll('.settings-sidebar-item').forEach(el => {
        el.addEventListener('click', () => {
          this.state.section = el.dataset.section;
          const main = win.querySelector('#settings-main');
          main.innerHTML = this.renderSection();
          win.querySelectorAll('.settings-sidebar-item').forEach(s => s.classList.remove('active'));
          el.classList.add('active');
        });
      });
    },
    refresh() {
      if (MacOS.windows['settings']) {
        const win = MacOS.windows['settings'].el;
        const main = win.querySelector('#settings-main');
        if (main) main.innerHTML = this.renderSection();
      }
    },
  },

  // ============================ PHOTOS ============================
  photos: {
    name: 'Photos',
    windowConfig: { width: 820, height: 560, title: 'Photos', minWidth: 500 },
    state: { tab: 'library' },
    gradients: [
      'linear-gradient(135deg,#ff6b6b,#feca57)','linear-gradient(135deg,#48dbfb,#0abde3)','linear-gradient(135deg,#a29bfe,#6c5ce7)',
      'linear-gradient(135deg,#fd79a8,#e84393)','linear-gradient(135deg,#00b894,#00cec9)','linear-gradient(135deg,#fab1a0,#e17055)',
      'linear-gradient(135deg,#74b9ff,#0984e3)','linear-gradient(135deg,#a29bfe,#fd79a8)','linear-gradient(135deg,#55efc4,#00b894)',
      'linear-gradient(135deg,#ffeaa7,#fab1a0)','linear-gradient(135deg,#dfe6e9,#b2bec3)','linear-gradient(135deg,#6c5ce7,#fd79a8)',
      'linear-gradient(135deg,#e17055,#fdcb6e)','linear-gradient(135deg,#0984e3,#6c5ce7)','linear-gradient(135deg,#00cec9,#6c5ce7)',
      'linear-gradient(135deg,#fd79a8,#ffeaa7)','linear-gradient(135deg,#2d3436,#636e72)','linear-gradient(135deg,#ff7675,#fdcb6e)',
      'linear-gradient(135deg,#6c5ce7,#a29bfe)','linear-gradient(135deg,#00b894,#55efc4)','linear-gradient(135deg,#e84393,#fd79a8)',
      'linear-gradient(135deg,#0984e3,#74b9ff)','linear-gradient(135deg,#fab1a0,#e17055)','linear-gradient(135deg,#fdcb6e,#ff7675)',
    ],
    render() {
      const tiles = this.gradients.map((g, i) => `<div class="photos-tile" style="background:${g}" data-idx="${i}" onclick="MacOS.apps.photos.viewPhoto(${i})"></div>`).join('');
      return `
        <div class="photos-toolbar">
          <div class="photos-tab ${this.state.tab==='library'?'active':''}" onclick="MacOS.apps.photos.setTab('library')">Library</div>
          <div class="photos-tab ${this.state.tab==='albums'?'active':''}" onclick="MacOS.apps.photos.setTab('albums')">Albums</div>
          <div class="photos-tab ${this.state.tab==='memories'?'active':''}" onclick="MacOS.apps.photos.setTab('memories')">Memories</div>
          <div class="photos-tab ${this.state.tab==='people'?'active':''}" onclick="MacOS.apps.photos.setTab('people')">People</div>
          <div style="flex:1;"></div>
          <div class="photos-tab">🔍</div>
        </div>
        <div class="photos-grid">${tiles}</div>`;
    },
    init(win) {},
    setTab(tab) {
      this.state.tab = tab;
      if (MacOS.windows['photos']) {
        const win = MacOS.windows['photos'].el;
        const content = win.querySelector('.window-content');
        content.innerHTML = this.render();
        this.init(win);
      }
    },
    viewPhoto(idx) {
      const win = MacOS.windows['photos'].el;
      const content = win.querySelector('.window-content');
      content.innerHTML = `
        <div class="photos-toolbar">
          <div class="photos-tab" onclick="MacOS.apps.photos.setTab('library')">< ‹ Library</div>
          <div style="flex:1;text-align:center;font-size:13px;color:var(--text-secondary);">Photo ${idx+1} of ${this.gradients.length}</div>
          <div class="photos-tab" onclick="MacOS.apps.photos.nextPhoto(${idx})">Next ›</div>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.05);">
          <div style="width:60%;aspect-ratio:1;border-radius:12px;background:${this.gradients[idx]};box-shadow:0 8px 32px rgba(0,0,0,0.15);"></div>
        </div>`;
    },
    nextPhoto(idx) {
      this.viewPhoto((idx + 1) % this.gradients.length);
    },
  },

  // ============================ CALENDAR ============================
  calendar: {
    name: 'Calendar',
    windowConfig: { width: 820, height: 560, title: 'Calendar', minWidth: 600 },
    state: { viewMonth: new Date().getMonth(), viewYear: new Date().getFullYear() },
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    events: {},
    render() {
      const now = new Date();
      const today = { m: now.getMonth(), d: now.getDate(), y: now.getFullYear() };
      // Sample events
      const eventKey = `${today.y}-${today.m}-${today.d}`;
      this.events[eventKey] = this.events[eventKey] || [
        { title: 'Design Review', color: '#ff3b30', time: '10:00' },
        { title: 'Lunch with Team', color: '#34c759', time: '12:30' },
      ];
      const firstDay = new Date(this.state.viewYear, this.state.viewMonth, 1).getDay();
      const daysInMonth = new Date(this.state.viewYear, this.state.viewMonth + 1, 0).getDate();
      const prevMonthDays = new Date(this.state.viewYear, this.state.viewMonth, 0).getDate();
      let days = [];
      // Previous month
      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, other: true, m: this.state.viewMonth - 1 });
      }
      // Current month
      for (let d = 1; d <= daysInMonth; d++) {
        days.push({ day: d, other: false, m: this.state.viewMonth });
      }
      // Next month
      while (days.length % 7 !== 0) {
        days.push({ day: days.length - daysInMonth - firstDay + 1, other: true, m: this.state.viewMonth + 1 });
      }
      const dayHeaders = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const grid = days.map(d => {
        const isToday = !d.other && d.day === today.d && this.state.viewMonth === today.m && this.state.viewYear === today.y;
        const eKey = `${this.state.viewYear}-${this.state.viewMonth}-${d.day}`;
        const events = (this.events[eKey] || []).slice(0, 2);
        const eventHtml = events.map(e => `<div class="cal-event" style="background:${e.color};">${e.time} ${e.title}</div>`).join('');
        return `<div class="cal-day ${d.other ? 'other' : ''} ${isToday ? 'today' : ''}" onclick="MacOS.apps.photos && MacOS.toast('Day ${d.day}')">
          <div class="cal-day-num">${d.day}</div>
          ${eventHtml}
        </div>`;
      }).join('');
      // Mini calendar
      const miniDays = [];
      for (let i = firstDay - 1; i >= 0; i--) miniDays.push(prevMonthDays - i);
      for (let d = 1; d <= daysInMonth; d++) miniDays.push(d);
      while (miniDays.length % 7 !== 0) miniDays.push(miniDays.length - daysInMonth - firstDay + 1);
      const miniGrid = miniDays.map(d => {
        const isToday = typeof d === 'number' && d === today.d && this.state.viewMonth === today.m;
        return `<div class="cal-mini-day ${isToday ? 'today' : ''}">${d}</div>`;
      }).join('');
      return `
        <div class="calendar-layout">
          <div class="cal-sidebar">
            <div class="cal-month-header">${this.months[today.m]} ${today.y}</div>
            <div class="cal-mini-grid">${miniGrid}</div>
            <div style="margin-top:16px;">
              <div style="font-size:11px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;margin-bottom:8px;">Today's Events</div>
              ${(this.events[eventKey]||[]).map(e => `<div style="margin-bottom:8px;"><div style="font-size:12px;font-weight:600;color:var(--text-primary);">${e.title}</div><div style="font-size:11px;color:var(--text-secondary);">${e.time}</div></div>`).join('')}
            </div>
          </div>
          <div class="cal-main">
            <div class="cal-header">
              <h2>${this.months[this.state.viewMonth]} ${this.state.viewYear}</h2>
              <div class="cal-nav">
                <div class="cal-nav-btn" onclick="MacOS.apps.calendar.prevMonth()">‹</div>
                <div class="cal-nav-btn" onclick="MacOS.apps.calendar.today()">Today</div>
                <div class="cal-nav-btn" onclick="MacOS.apps.calendar.nextMonth()">›</div>
              </div>
            </div>
            <div class="cal-grid">
              ${dayHeaders.map(d => `<div class="cal-day-header">${d}</div>`).join('')}
              ${grid}
            </div>
          </div>
        </div>`;
    },
    init(win) {},
    prevMonth() {
      this.state.viewMonth--;
      if (this.state.viewMonth < 0) { this.state.viewMonth = 11; this.state.viewYear--; }
      this.refresh();
    },
    nextMonth() {
      this.state.viewMonth++;
      if (this.state.viewMonth > 11) { this.state.viewMonth = 0; this.state.viewYear++; }
      this.refresh();
    },
    today() {
      const now = new Date();
      this.state.viewMonth = now.getMonth();
      this.state.viewYear = now.getFullYear();
      this.refresh();
    },
    refresh() {
      if (MacOS.windows['calendar']) {
        const win = MacOS.windows['calendar'].el;
        const content = win.querySelector('.window-content');
        content.innerHTML = this.render();
        this.init(win);
      }
    },
  },

  // ============================ MUSIC ============================
  music: {
    name: 'Music',
    windowConfig: { width: 800, height: 560, title: 'Music', minWidth: 600 },
    state: { playing: false, currentTrack: 0, progress: 0 },
    tracks: [
      { title: 'Midnight Drive', artist: 'Neon Lights', duration: 224, album: 'City Nights', color: 'linear-gradient(135deg,#ff6b6b,#ee5a6f)' },
      { title: 'Ocean Breeze', artist: 'Coastal Waves', duration: 198, album: 'Summer Vibes', color: 'linear-gradient(135deg,#48dbfb,#0abde3)' },
      { title: 'Mountain High', artist: 'Alpine Echo', duration: 256, album: 'Peaks', color: 'linear-gradient(135deg,#a29bfe,#6c5ce7)' },
      { title: 'Electric Dreams', artist: 'Synth Wave', duration: 312, album: 'Retrowave', color: 'linear-gradient(135deg,#fd79a8,#e84393)' },
      { title: 'Coffee Shop Jazz', artist: 'Smooth Trio', duration: 187, album: 'Late Night', color: 'linear-gradient(135deg,#feca57,#ff9f43)' },
      { title: 'Forest Walk', artist: 'Nature Sounds', duration: 423, album: 'Calm', color: 'linear-gradient(135deg,#00b894,#00cec9)' },
      { title: 'Urban Beat', artist: 'City Pulse', duration: 201, album: 'Downtown', color: 'linear-gradient(135deg,#2d3436,#636e72)' },
      { title: 'Starlight', artist: 'Cosmic Drift', duration: 278, album: 'Galaxy', color: 'linear-gradient(135deg,#6c5ce7,#a29bfe)' },
    ],
    render() {
      const track = this.tracks[this.state.currentTrack];
      const trackList = this.tracks.map((t, i) => {
        const playing = i === this.state.currentTrack ? 'playing' : '';
        const mins = Math.floor(t.duration / 60);
        const secs = String(t.duration % 60).padStart(2, '0');
        return `<div class="music-list-item ${playing}" onclick="MacOS.apps.music.playTrack(${i})">
          <div class="ml-num">${i === this.state.currentTrack && this.state.playing ? '▶' : i + 1}</div>
          <div class="ml-title">${t.title}</div>
          <div class="ml-artist">${t.artist}</div>
          <div class="ml-duration">${mins}:${secs}</div>
        </div>`;
      }).join('');
      const playIcon = this.state.playing ? '⏸' : '▶';
      const progressPct = (this.state.progress / track.duration) * 100;
      const curMin = Math.floor(this.state.progress / 60);
      const curSec = String(Math.floor(this.state.progress % 60)).padStart(2, '0');
      const totMin = Math.floor(track.duration / 60);
      const totSec = String(track.duration % 60).padStart(2, '0');
      return `
        <div class="music-layout">
          <div class="music-sidebar">
            <div class="music-sidebar-item active">🎵 Library</div>
            <div class="music-sidebar-item">📻 Listen Now</div>
            <div class="music-sidebar-item">🔎 Browse</div>
            <div class="music-sidebar-item">📻 Radio</div>
            <div style="font-size:11px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;padding:16px 16px 4px;">Playlists</div>
            <div class="music-sidebar-item">❤️ Favorites</div>
            <div class="music-sidebar-item">🌙 Chill Vibes</div>
            <div class="music-sidebar-item">🏃 Workout</div>
            <div class="music-sidebar-item">☕ Morning Coffee</div>
            <div class="music-sidebar-item">🌃 Late Night</div>
          </div>
          <div class="music-main">
            <div class="music-now-playing">
              <div class="music-album-art" style="background:${track.color}">${this.state.playing ? '⏸' : '▶'}</div>
              <div class="music-track-title">${track.title}</div>
              <div class="music-track-artist">${track.artist} — ${track.album}</div>
              <div class="music-player-controls">
                <div class="music-player-btn" onclick="MacOS.apps.music.prevTrack()">⏮</div>
                <div class="music-player-btn play" onclick="MacOS.apps.music.togglePlay()">${playIcon}</div>
                <div class="music-player-btn" onclick="MacOS.apps.music.nextTrack()">⏭</div>
              </div>
              <div class="music-progress">
                <span class="music-time">${curMin}:${curSec}</span>
                <div class="music-progress-bar" onclick="MacOS.apps.music.seek(event)">
                  <div class="music-progress-fill" style="width:${progressPct}%;background:var(--accent);"></div>
                </div>
                <span class="music-time">${totMin}:${totSec}</span>
              </div>
            </div>
            <div style="margin-top:24px;">
              <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:12px;">Up Next</h3>
              ${trackList}
            </div>
          </div>
        </div>`;
    },
    init(win) {
      this._updateCC();
      if (this.state.playing) this.startProgress();
    },
    playTrack(idx) {
      this.state.currentTrack = idx;
      this.state.playing = true;
      this.state.progress = 0;
      this.refresh();
    },
    togglePlay() {
      this.state.playing = !this.state.playing;
      if (this.state.playing) this.startProgress();
      else clearInterval(this._interval);
      this.refresh();
    },
    prevTrack() {
      this.state.currentTrack = (this.state.currentTrack - 1 + this.tracks.length) % this.tracks.length;
      this.state.progress = 0;
      this.refresh();
    },
    nextTrack() {
      this.state.currentTrack = (this.state.currentTrack + 1) % this.tracks.length;
      this.state.progress = 0;
      this.refresh();
    },
    seek(e) {
      const track = this.tracks[this.state.currentTrack];
      const bar = e.currentTarget;
      const rect = bar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      this.state.progress = pct * track.duration;
      this.refresh();
    },
    startProgress() {
      clearInterval(this._interval);
      this._interval = setInterval(() => {
        if (!this.state.playing) return;
        const track = this.tracks[this.state.currentTrack];
        this.state.progress++;
        if (this.state.progress >= track.duration) {
          this.nextTrack();
        } else {
          // Update progress bar without full refresh
          const fill = document.querySelector('.music-progress-fill');
          if (fill) {
            fill.style.width = ((this.state.progress / track.duration) * 100) + '%';
          }
          const times = document.querySelectorAll('.music-time');
          if (times[0]) {
            const m = Math.floor(this.state.progress / 60);
            const s = String(Math.floor(this.state.progress % 60)).padStart(2, '0');
            times[0].textContent = `${m}:${s}`;
          }
        }
      }, 1000);
    },
    _updateCC() {
      const track = this.tracks[this.state.currentTrack];
      const titleEl = document.getElementById('cc-np-title');
      const artistEl = document.getElementById('cc-np-artist');
      if (titleEl) titleEl.textContent = this.state.playing ? track.title : 'Not Playing';
      if (artistEl) artistEl.textContent = this.state.playing ? track.artist : '—';
    },
    refresh() {
      this._updateCC();
      if (MacOS.windows['music']) {
        const win = MacOS.windows['music'].el;
        const content = win.querySelector('.window-content');
        content.innerHTML = this.render();
        this.init(win);
      }
    },
  },

  // ============================ MESSAGES ============================
  messages: {
    name: 'Messages',
    windowConfig: { width: 760, height: 540, title: 'Messages', minWidth: 500 },
    state: { activeChat: 0 },
    chats: [
      { name: 'Sarah Chen', avatar: 'S', color: '#ff6b6b', messages: [
        { from: 'them', text: 'Hey! Did you see the new macOS Tahoe?' },
        { from: 'me', text: 'Yes! The Liquid Glass design looks amazing' },
        { from: 'them', text: 'The transparent menu bar is so clean' },
        { from: 'them', text: 'We should update our apps to match the new design language' },
        { from: 'me', text: 'Definitely. Let me schedule a design review' },
      ]},
      { name: 'Mike Johnson', avatar: 'M', color: '#4a9eff', messages: [
        { from: 'them', text: 'Can you review my PR?' },
        { from: 'me', text: 'Sure, send it over' },
        { from: 'them', text: 'Just pushed it to the feature branch' },
      ]},
      { name: 'Family Group', avatar: '👨‍👩‍👧', color: '#34c759', messages: [
        { from: 'them', text: 'Dinner at 7?' },
        { from: 'me', text: 'Sounds good!' },
        { from: 'them', text: 'I\'ll make pasta' },
        { from: 'them', text: 'Can\'t wait!' },
      ]},
      { name: 'Jennifer', avatar: 'J', color: '#bf5af2', messages: [
        { from: 'me', text: 'How\'s the project going?' },
        { from: 'them', text: 'Great! Almost done with the UI' },
        { from: 'them', text: 'Should be ready by Friday' },
      ]},
      { name: 'Work Team', avatar: '💼', color: '#ff9500', messages: [
        { from: 'them', text: 'Standup in 5 minutes' },
        { from: 'me', text: 'On my way' },
      ]},
      { name: 'David', avatar: 'D', color: '#64d2ff', messages: [
        { from: 'them', text: 'Check out this article I sent you' },
        { from: 'me', text: 'Will do, thanks!' },
      ]},
    ],
    render() {
      const chat = this.chats[this.state.activeChat];
      const list = this.chats.map((c, i) => {
        const active = this.state.activeChat === i ? 'active' : '';
        const lastMsg = c.messages[c.messages.length - 1];
        return `<div class="messages-list-item ${active}" data-idx="${i}">
          <div class="messages-avatar" style="background:${c.color}">${c.avatar}</div>
          <div class="messages-list-info">
            <div class="messages-list-name">${c.name}</div>
            <div class="messages-list-preview">${lastMsg.from === 'me' ? 'You: ' : ''}${lastMsg.text}</div>
          </div>
        </div>`;
      }).join('');
      const messages = chat.messages.map(m => {
        const cls = m.from === 'me' ? 'sent' : 'received';
        return `<div class="message-bubble ${cls}">${m.text}</div>`;
      }).join('');
      return `
        <div class="messages-layout">
          <div class="messages-sidebar">${list}</div>
          <div class="messages-main">
            <div class="messages-header">
              <div class="messages-avatar" style="background:${chat.color}">${chat.avatar}</div>
              <div class="messages-header-name">${chat.name}</div>
            </div>
            <div class="messages-chat" id="messages-chat">${messages}</div>
            <div class="messages-input">
              <input type="text" id="messages-input" placeholder="iMessage" onkeydown="if(event.key==='Enter')MacOS.apps.messages.send()">
              <button onclick="MacOS.apps.messages.send()">↑</button>
            </div>
          </div>
        </div>`;
    },
    init(win) {
      win.querySelectorAll('.messages-list-item').forEach(el => {
        el.addEventListener('click', () => {
          this.state.activeChat = parseInt(el.dataset.idx);
          this.refresh();
        });
      });
      const chat = win.querySelector('#messages-chat');
      if (chat) chat.scrollTop = chat.scrollHeight;
    },
    send() {
      const input = document.getElementById('messages-input');
      if (!input || !input.value.trim()) return;
      const chat = this.chats[this.state.activeChat];
      chat.messages.push({ from: 'me', text: input.value.trim() });
      input.value = '';
      this.refresh();
      // Simulate a reply
      setTimeout(() => {
        const replies = ['Sounds good!', 'Got it 👍', 'Thanks for letting me know', 'Awesome!', 'I agree', 'Let me check and get back to you', 'Perfect!'];
        chat.messages.push({ from: 'them', text: replies[Math.floor(Math.random() * replies.length)] });
        if (MacOS.windows['messages']) this.refresh();
      }, 1500 + Math.random() * 2000);
    },
    refresh() {
      if (MacOS.windows['messages']) {
        const win = MacOS.windows['messages'].el;
        const content = win.querySelector('.window-content');
        content.innerHTML = this.render();
        this.init(win);
      }
    },
  },

  // ============================ WEATHER ============================
  weather: {
    name: 'Weather',
    windowConfig: { width: 500, height: 600, title: 'Weather', minWidth: 400, minHeight: 400 },
    state: { location: 'Cupertino' },
    data: {
      'Cupertino': { temp: 72, cond: 'Sunny', hi: 78, lo: 64, hourly: [
        {h:'Now',t:72,i:'☀️'},{h:'1PM',t:74,i:'☀️'},{h:'2PM',t:75,i:'☀️'},{h:'3PM',t:76,i:'⛅'},{h:'4PM',t:75,i:'⛅'},{h:'5PM',t:73,i:'⛅'},{h:'6PM',t:70,i:'🌅'},{h:'7PM',t:68,i:'🌙'},{h:'8PM',t:66,i:'🌙'},{h:'9PM',t:65,i:'🌙'},
      ], daily: [
        {d:'Today',i:'☀️',hi:78,lo:64},{d:'Mon',i:'⛅',hi:75,lo:62},{d:'Tue',i:'🌧️',hi:68,lo:58},{d:'Wed',i:'🌧️',hi:65,lo:55},{d:'Thu',i:'⛅',hi:70,lo:60},{d:'Fri',i:'☀️',hi:76,lo:64},{d:'Sat',i:'☀️',hi:79,lo:66},{d:'Sun',i:'⛅',hi:74,lo:62},
      ]},
      'San Francisco': { temp: 65, cond: 'Foggy', hi: 68, lo: 55, hourly: [
        {h:'Now',t:65,i:'🌫️'},{h:'1PM',t:66,i:'🌫️'},{h:'2PM',t:67,i:'⛅'},{h:'3PM',t:68,i:'⛅'},{h:'4PM',t:67,i:'⛅'},{h:'5PM',t:65,i:'🌫️'},{h:'6PM',t:62,i:'🌙'},{h:'7PM',t:60,i:'🌙'},{h:'8PM',t:58,i:'🌙'},{h:'9PM',t:56,i:'🌙'},
      ], daily: [
        {d:'Today',i:'🌫️',hi:68,lo:55},{d:'Mon',i:'⛅',hi:70,lo:56},{d:'Tue',i:'☀️',hi:72,lo:58},{d:'Wed',i:'⛅',hi:69,lo:55},{d:'Thu',i:'🌧️',hi:64,lo:52},{d:'Fri',i:'🌫️',hi:66,lo:54},{d:'Sat',i:'☀️',hi:71,lo:57},{d:'Sun',i:'⛅',hi:68,lo:55},
      ]},
      'New York': { temp: 82, cond: 'Partly Cloudy', hi: 85, lo: 72, hourly: [
        {h:'Now',t:82,i:'⛅'},{h:'1PM',t:83,i:'⛅'},{h:'2PM',t:84,i:'⛅'},{h:'3PM',t:85,i:'☀️'},{h:'4PM',t:84,i:'⛅'},{h:'5PM',t:82,i:'⛅'},{h:'6PM',t:80,i:'🌆'},{h:'7PM',t:78,i:'🌙'},{h:'8PM',t:76,i:'🌙'},{h:'9PM',t:74,i:'🌙'},
      ], daily: [
        {d:'Today',i:'⛅',hi:85,lo:72},{d:'Mon',i:'☀️',hi:88,lo:74},{d:'Tue',i:'⛈️',hi:80,lo:70},{d:'Wed',i:'🌧️',hi:75,lo:68},{d:'Thu',i:'⛅',hi:82,lo:70},{d:'Fri',i:'☀️',hi:86,lo:73},{d:'Sat',i:'☀️',hi:89,lo:75},{d:'Sun',i:'⛅',hi:84,lo:72},
      ]},
    },
    render() {
      const d = this.data[this.state.location] || this.data['Cupertino'];
      const hourly = d.hourly.map(h => `<div class="weather-hour"><div class="weather-hour-time">${h.h}</div><div class="weather-hour-icon">${h.i}</div><div class="weather-hour-temp">${h.t}°</div></div>`).join('');
      const daily = d.daily.map(day => {
        const range = day.hi - day.lo;
        const left = ((day.lo - 55) / (90 - 55)) * 100;
        const width = (range / (90 - 55)) * 100;
        return `<div class="weather-day-row">
          <div class="weather-day-name">${day.d}</div>
          <div class="weather-day-icon">${day.i}</div>
          <div class="weather-day-bar"><div class="weather-day-bar-fill" style="left:${left}%;width:${width}%;"></div></div>
          <div class="weather-day-temps"><span style="color:rgba(255,255,255,0.6);">${day.lo}°</span><span>${day.hi}°</span></div>
        </div>`;
      }).join('');
      const bg = d.temp >= 75 ? 'linear-gradient(180deg,#4a90d9,#74b9ff)' : d.temp >= 65 ? 'linear-gradient(180deg,#5b7fa8,#7a9fc5)' : 'linear-gradient(180deg,#4a5a7a,#6a7a9a)';
      return `
        <div class="weather-body" style="background:${bg};">
          <div class="weather-current">
            <div class="weather-location">${this.state.location}</div>
            <div class="weather-temp-large">${d.temp}°</div>
            <div class="weather-cond">${d.cond}</div>
            <div class="weather-hilo">H:${d.hi}° L:${d.lo}°</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:16px;padding:16px;margin-bottom:16px;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);">
            <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:8px;">Hourly Forecast</div>
            <div class="weather-hourly">${hourly}</div>
          </div>
          <div style="background:rgba(255,255,255,0.12);border-radius:16px;padding:16px;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);">
            <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:8px;">7-Day Forecast</div>
            ${daily}
          </div>
        </div>`;
    },
    init(win) {},
  },

  // ============================ MAPS ============================
  maps: {
    name: 'Maps',
    windowConfig: { width: 820, height: 560, title: 'Maps', minWidth: 500 },
    state: { zoom: 1, lat: 37.32, lng: -122.04, label: 'Cupertino' },
    render() {
      return `
        <div class="maps-body">
          <div class="maps-canvas" id="maps-canvas">
            <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" id="maps-svg">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <rect width="60" height="60" fill="#c8e6c8"/>
                  <rect width="60" height="60" fill="url(#streets)"/>
                </pattern>
              </defs>
              <rect width="800" height="500" fill="#d4edda"/>
              <!-- Water -->
              <path d="M0,350 Q200,320 400,360 T800,340 L800,500 L0,500 Z" fill="#a8d8e8"/>
              <!-- Park -->
              <ellipse cx="200" cy="150" rx="80" ry="60" fill="#a8d8a8"/>
              <ellipse cx="600" cy="200" rx="100" ry="70" fill="#a8d8a8"/>
              <!-- Roads -->
              <line x1="0" y1="100" x2="800" y2="120" stroke="#fff" stroke-width="6"/>
              <line x1="0" y1="250" x2="800" y2="270" stroke="#fff" stroke-width="8"/>
              <line x1="100" y1="0" x2="120" y2="500" stroke="#fff" stroke-width="6"/>
              <line x1="400" y1="0" x2="420" y2="500" stroke="#fff" stroke-width="8"/>
              <line x1="650" y1="0" x2="660" y2="500" stroke="#fff" stroke-width="4"/>
              <!-- Highway -->
              <line x1="0" y1="300" x2="800" y2="320" stroke="#ffd700" stroke-width="10"/>
              <!-- Buildings -->
              <rect x="130" y="130" width="30" height="20" fill="#b0b0b0" rx="2"/>
              <rect x="170" y="110" width="25" height="30" fill="#b0b0b0" rx="2"/>
              <rect x="440" y="140" width="40" height="40" fill="#a0a0a0" rx="2"/>
              <rect x="500" y="150" width="35" height="25" fill="#b0b0b0" rx="2"/>
              <rect x="150" y="200" width="30" height="30" fill="#b0b0b0" rx="2"/>
              <rect x="440" y="220" width="50" height="30" fill="#a0a0a0" rx="2"/>
              <rect x="550" y="280" width="40" height="40" fill="#b0b0b0" rx="2"/>
              <!-- Pin -->
              <g id="maps-pin" transform="translate(400,200)">
                <circle cx="0" cy="0" r="20" fill="rgba(255,59,48,0.3)"/>
                <path d="M0,-15 C-8,-15 -12,-10 -12,-5 C-12,5 0,15 0,15 C0,15 12,5 12,-5 C12,-10 8,-15 0,-15 Z" fill="#ff3b30"/>
                <circle cx="0" cy="-5" r="4" fill="#fff"/>
              </g>
            </svg>
            <div class="maps-search">
              <input type="text" placeholder="Search Maps" id="maps-search-input" onkeydown="if(event.key==='Enter')MacOS.apps.maps.search(this.value)">
              <div class="safari-nav-btn" style="background:rgba(255,255,255,0.6);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);">🔍</div>
            </div>
            <div class="maps-controls">
              <div class="maps-zoom-btn" onclick="MacOS.apps.maps.zoomIn()">+</div>
              <div class="maps-zoom-btn" onclick="MacOS.apps.maps.zoomOut()">−</div>
              <div class="maps-zoom-btn" onclick="MacOS.apps.maps.locate()">📍</div>
            </div>
            <div id="maps-label" style="position:absolute;bottom:20px;left:20px;background:rgba(255,255,255,0.6);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);padding:8px 16px;border-radius:10px;font-size:13px;color:var(--text-primary);font-weight:600;">📍 ${this.state.label}</div>
          </div>
        </div>`;
    },
    init(win) {
      this._zoom = 1;
      const canvas = win.querySelector('#maps-canvas');
      let isPanning = false, startX, startY, panX = 0, panY = 0;
      canvas.addEventListener('mousedown', (e) => {
        if (e.target.closest('.maps-search') || e.target.closest('.maps-controls')) return;
        isPanning = true;
        startX = e.clientX; startY = e.clientY;
        canvas.style.cursor = 'grabbing';
      });
      document.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const svg = win.querySelector('#maps-svg');
        if (svg) {
          const current = svg.style.transform || '';
          const match = current.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
          const cx = match ? parseFloat(match[1]) : 0;
          const cy = match ? parseFloat(match[2]) : 0;
          svg.style.transform = `translate(${cx + dx}px, ${cy + dy}px) scale(${this._zoom})`;
          svg.style.transformOrigin = 'center';
        }
      });
      document.addEventListener('mouseup', () => {
        isPanning = false;
        canvas.style.cursor = '';
      });
    },
    zoomIn() {
      this._zoom = (this._zoom || 1) + 0.2;
      const svg = document.getElementById('maps-svg');
      if (svg) svg.style.transform = `scale(${this._zoom})`;
    },
    zoomOut() {
      this._zoom = Math.max(0.5, (this._zoom || 1) - 0.2);
      const svg = document.getElementById('maps-svg');
      if (svg) svg.style.transform = `scale(${this._zoom})`;
    },
    locate() {
      this._zoom = 1;
      const svg = document.getElementById('maps-svg');
      if (svg) svg.style.transform = 'scale(1)';
      MacOS.toast('Located: Cupertino, CA');
    },
    search(query) {
      const label = document.getElementById('maps-label');
      if (label) label.textContent = `📍 ${query}`;
      this.state.label = query;
      // Move pin to a random spot
      const pin = document.getElementById('maps-pin');
      if (pin) {
        const x = 200 + Math.random() * 400;
        const y = 100 + Math.random() * 200;
        pin.setAttribute('transform', `translate(${x},${y})`);
      }
      MacOS.toast(`Searching for: ${query}`);
    },
  },

  // ============================ TEXTEDIT ============================
  textedit: {
    name: 'TextEdit',
    windowConfig: { width: 640, height: 500, title: 'Untitled.txt', minWidth: 400 },
    state: { content: 'Welcome to TextEdit!\n\nThis is a fully functional text editor. You can:\n\n• Type and edit text\n• Change font size\n• Change font family\n• Bold, italic, underline\n• Align text\n\nStart typing to create your document.\n\nThe quick brown fox jumps over the lazy dog.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    render() {
      return `
        <div class="textedit-body">
          <div class="textedit-toolbar">
            <select onchange="MacOS.apps.textedit.setFontFamily(this.value)">
              <option value="Inter">Inter</option>
              <option value="Georgia">Georgia</option>
              <option value="Menlo">Menlo</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
            <select onchange="MacOS.apps.textedit.setFontSize(this.value)">
              <option value="12">12</option>
              <option value="14" selected>14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="24">24</option>
              <option value="32">32</option>
            </select>
            <div class="finder-toolbar-btn" onclick="MacOS.apps.textedit.bold()" style="font-weight:700;">B</div>
            <div class="finder-toolbar-btn" onclick="MacOS.apps.textedit.italic()" style="font-style:italic;">I</div>
            <div class="finder-toolbar-btn" onclick="MacOS.apps.textedit.underline()" style="text-decoration:underline;">U</div>
            <div style="width:1px;height:20px;background:rgba(0,0,0,0.1);"></div>
            <div class="finder-toolbar-btn" onclick="MacOS.apps.textedit.align('left')">≡</div>
            <div class="finder-toolbar-btn" onclick="MacOS.apps.textedit.align('center')">≣</div>
            <div class="finder-toolbar-btn" onclick="MacOS.apps.textedit.align('right')">≡</div>
          </div>
          <div class="textedit-area" contenteditable="true" id="textedit-area" style="font-family:Inter;font-size:14px;outline:none;">${this.state.content.replace(/\n/g, '<br>')}</div>
        </div>`;
    },
    init(win) {
      const area = win.querySelector('#textedit-area');
      area.addEventListener('input', () => {
        this.state.content = area.innerText;
      });
    },
    setFontFamily(font) {
      const area = document.getElementById('textedit-area');
      if (area) area.style.fontFamily = font;
    },
    setFontSize(size) {
      const area = document.getElementById('textedit-area');
      if (area) area.style.fontSize = size + 'px';
    },
    bold() { document.execCommand('bold'); },
    italic() { document.execCommand('italic'); },
    underline() { document.execCommand('underline'); },
    align(dir) { document.execCommand('justify' + dir.charAt(0).toUpperCase() + dir.slice(1)); },
  },

  // ============================ TRASH ============================
  trash: {
    name: 'Trash',
    windowConfig: { width: 600, height: 400, title: 'Trash' },
    render() {
      return `
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
          <div class="finder-toolbar">
            <div class="finder-toolbar-btn" onclick="MacOS.apps.trash.emptyTrash()">🗑 Empty Trash</div>
            <div class="finder-path">Trash</div>
          </div>
          <div class="finder-content">
            <div class="finder-grid" id="trash-grid">
              <div class="finder-file"><svg viewBox="0 0 64 64"><rect x="10" y="6" width="44" height="52" rx="4" fill="#e8e8e8"/><line x1="18" y1="20" x2="46" y2="20" stroke="#888" stroke-width="2"/></svg><div class="file-name">Old Document.txt</div></div>
              <div class="finder-file"><svg viewBox="0 0 64 64"><rect x="6" y="8" width="52" height="48" rx="4" fill="#ccc"/></svg><div class="file-name">Screenshot.png</div></div>
            </div>
          </div>
        </div>`;
    },
    init(win) {},
    emptyTrash() {
      const grid = document.getElementById('trash-grid');
      if (grid) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:40px;">Trash is Empty</div>';
      }
      MacOS.toast('Trash emptied');
    },
  },
};
