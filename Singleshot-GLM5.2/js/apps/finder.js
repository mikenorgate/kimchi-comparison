/* ============================================
   App: Finder
   ============================================ */

const Finder = {
  currentView: 'icons',
  currentPath: 'Home',
  history: [],
  historyIdx: 0,

  fileSystem: {
    'Home': [
      { name: 'Desktop', type: 'folder' },
      { name: 'Documents', type: 'folder' },
      { name: 'Downloads', type: 'folder' },
      { name: 'Pictures', type: 'folder' },
      { name: 'Movies', type: 'folder' },
      { name: 'Music', type: 'folder' },
      { name: 'Applications', type: 'folder' },
    ],
    'Desktop': [
      { name: 'Screenshot 2026-08-09.png', type: 'image' },
      { name: 'Notes.txt', type: 'file' },
      { name: 'Project Ideas', type: 'folder' },
    ],
    'Documents': [
      { name: 'Resume.pdf', type: 'file' },
      { name: 'Budget 2026.numbers', type: 'file' },
      { name: 'Meeting Notes', type: 'folder' },
      { name: 'Tax Returns', type: 'folder' },
      { name: 'Presentation.key', type: 'file' },
    ],
    'Downloads': [
      { name: 'macOS_Tahoe_Installer.dmg', type: 'file' },
      { name: 'Xcode_16_beta.dmg', type: 'file' },
      { name: 'wallpaper_4k.jpg', type: 'image' },
      { name: 'recipe_book.pdf', type: 'file' },
    ],
    'Pictures': [
      { name: 'Vacation 2025', type: 'folder' },
      { name: 'Family Photos', type: 'folder' },
      { name: 'Screenshots', type: 'folder' },
      { name: 'IMG_0001.jpg', type: 'image' },
      { name: 'IMG_0002.jpg', type: 'image' },
      { name: 'IMG_0003.jpg', type: 'image' },
      { name: 'IMG_0004.jpg', type: 'image' },
      { name: 'IMG_0005.jpg', type: 'image' },
    ],
    'Movies': [
      { name: 'Home Videos', type: 'folder' },
      { name: 'Movie Collection', type: 'folder' },
    ],
    'Music': [
      { name: 'Playlists', type: 'folder' },
      { name: 'Albums', type: 'folder' },
    ],
    'Applications': [
      { name: 'Calculator', type: 'app', appId: 'calculator' },
      { name: 'Calendar', type: 'app', appId: 'calendar' },
      { name: 'Clock', type: 'app', appId: 'clock' },
      { name: 'Mail', type: 'app', appId: 'mail' },
      { name: 'Maps', type: 'app', appId: 'maps' },
      { name: 'Messages', type: 'app', appId: 'messages' },
      { name: 'Music', type: 'app', appId: 'music' },
      { name: 'Notes', type: 'app', appId: 'notes' },
      { name: 'Photos', type: 'app', appId: 'photos' },
      { name: 'Safari', type: 'app', appId: 'safari' },
      { name: 'System Settings', type: 'app', appId: 'settings' },
      { name: 'Terminal', type: 'app', appId: 'terminal' },
      { name: 'TextEdit', type: 'app', appId: 'textedit' },
      { name: 'Weather', type: 'app', appId: 'weather' },
    ],
    'Project Ideas': [
      { name: 'Tahoe App.psd', type: 'file' },
      { name: 'wireframes', type: 'folder' },
      { name: 'TODO.md', type: 'file' },
    ],
  },

  sidebarItems: [
    { section: 'Favorites', items: [
      { name: 'AirDrop', icon: Icons.share },
      { name: 'Recents', icon: Icons.clock },
      { name: 'Applications', icon: Icons.app },
      { name: 'Desktop', icon: Icons.folder },
      { name: 'Documents', icon: Icons.folder },
      { name: 'Downloads', icon: Icons.folder },
    ]},
    { section: 'iCloud', items: [
      { name: 'iCloud Drive', icon: Icons.folder },
      { name: 'Shared', icon: Icons.share },
    ]},
    { section: 'Tags', items: [
      { name: 'Red', icon: Icons.folder, color: '#ff453a' },
      { name: 'Blue', icon: Icons.folder, color: '#0a84ff' },
      { name: 'Green', icon: Icons.folder, color: '#30d158' },
    ]},
  ],

  render(container, winData) {
    container.innerHTML = `
      <div class="window-split" style="flex:1;">
        <div class="window-sidebar">
          ${this.sidebarItems.map(section => `
            <div class="sidebar-section">${section.section}</div>
            ${section.items.map(item => `
              <div class="sidebar-item" data-path="${item.name}">
                <div class="sidebar-icon" ${item.color ? `style="color:${item.color}"` : ''}>${item.icon || Icons.folder}</div>
                ${item.name}
              </div>
            `).join('')}
          `).join('')}
        </div>
        <div class="finder-main">
          <div class="window-toolbar">
            <div class="safari-nav-btns">
              <button class="toolbar-btn" id="${winData.id}-back">${Icons.back}</button>
              <button class="toolbar-btn" id="${winData.id}-fwd">${Icons.forward}</button>
            </div>
            <div class="segmented-control">
              <button class="segment-btn ${this.currentView === 'icons' ? 'active' : ''}" data-view="icons">${Icons.grid}</button>
              <button class="segment-btn ${this.currentView === 'list' ? 'active' : ''}" data-view="list">${Icons.list}</button>
            </div>
            <div style="flex:1"></div>
            <input type="text" class="toolbar-search" placeholder="Search" id="${winData.id}-search">
          </div>
          <div class="finder-pathbar">
            <span class="path-item" data-path="Home">Home</span>
            <span> › </span>
            <span class="path-item">${this.currentPath}</span>
          </div>
          <div class="finder-content" id="${winData.id}-files"></div>
        </div>
      </div>
    `;

    this.renderFiles(winData);
    this.attachFinderEvents(winData);
  },

  renderFiles(winData) {
    const content = document.getElementById(`${winData.id}-files`);
    if (!content) return;
    const items = this.fileSystem[this.currentPath] || [];

    if (this.currentView === 'icons') {
      content.innerHTML = `<div class="finder-grid">${
        items.map((item, i) => this.renderIcon(item, i)).join('')
      }</div>`;
    } else {
      content.innerHTML = `
        <div class="finder-list">
          <div class="finder-list-header">
            <span style="width:24px;"></span>
            <span style="flex:1;">Name</span>
            <span style="width:120px;">Kind</span>
            <span style="width:100px;">Size</span>
            <span style="width:100px;">Date Modified</span>
          </div>
          ${items.map((item, i) => this.renderListRow(item, i)).join('')}
        </div>
      `;
    }

    // Attach item click handlers
    content.querySelectorAll('.finder-item, .finder-list-row').forEach(el => {
      el.addEventListener('click', () => {
        content.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
      });
      el.addEventListener('dblclick', () => {
        const idx = parseInt(el.dataset.idx);
        const item = items[idx];
        this.openItem(item, winData);
      });
    });
  },

  renderIcon(item, i) {
    let icon;
    if (item.type === 'folder') icon = Icons.folder;
    else if (item.type === 'app') icon = Tahoe.state.apps[item.appId].icon;
    else if (item.type === 'image') icon = Icons.image;
    else icon = Icons.file;

    return `
      <div class="finder-item" data-idx="${i}">
        <div class="finder-icon">${icon}</div>
        <div class="finder-name">${item.name}</div>
      </div>
    `;
  },

  renderListRow(item, i) {
    let icon;
    if (item.type === 'folder') icon = Icons.folder;
    else if (item.type === 'app') icon = Tahoe.state.apps[item.appId].icon;
    else if (item.type === 'image') icon = Icons.image;
    else icon = Icons.file;

    const kind = item.type === 'folder' ? 'Folder' : item.type === 'app' ? 'Application' : item.type === 'image' ? 'Image' : 'Document';
    const size = item.type === 'folder' ? '--' : Math.floor(Math.random() * 500 + 50) + ' KB';
    const date = `${Math.floor(Math.random() * 28 + 1)} Aug 2026`;

    return `
      <div class="finder-list-row" data-idx="${i}">
        <div class="row-icon">${icon}</div>
        <span style="flex:1;">${item.name}</span>
        <span style="width:120px;color:var(--text-secondary);">${kind}</span>
        <span style="width:100px;color:var(--text-secondary);">${size}</span>
        <span style="width:100px;color:var(--text-secondary);">${date}</span>
      </div>
    `;
  },

  attachFinderEvents(winData) {
    // Sidebar navigation
    const container = winData.el.querySelector('.window-content');
    container.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const path = item.dataset.path;
        if (this.fileSystem[path] || ['Desktop', 'Documents', 'Downloads', 'Applications', 'Pictures'].includes(path)) {
          this.goTo(path);
        }
      });
    });

    // View toggle
    container.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setView(btn.dataset.view);
      });
    });

    // Back/Forward
    const backBtn = document.getElementById(`${winData.id}-back`);
    const fwdBtn = document.getElementById(`${winData.id}-fwd`);
    if (backBtn) backBtn.addEventListener('click', () => this.back());
    if (fwdBtn) fwdBtn.addEventListener('click', () => this.forward());

    // Search
    const search = document.getElementById(`${winData.id}-search`);
    if (search) {
      search.addEventListener('input', (e) => this.search(e.target.value, winData));
    }
  },

  openItem(item, winData) {
    if (item.type === 'folder' && this.fileSystem[item.name]) {
      this.goTo(item.name);
    } else if (item.type === 'app' && item.appId) {
      Tahoe.launchApp(item.appId);
    } else if (item.type === 'image') {
      // Quick look - open in a new window
      Tahoe.showNotification('Quick Look', `Previewing ${item.name}`);
    } else {
      Tahoe.showNotification('Finder', `Opening ${item.name}...`);
    }
  },

  setView(view) {
    this.currentView = view;
    // Re-render all finder windows
    this.refresh();
  },

  goTo(path) {
    if (this.fileSystem[path] || path === 'Home') {
      this.history = this.history.slice(0, this.historyIdx + 1);
      this.history.push(path);
      this.historyIdx = this.history.length - 1;
      this.currentPath = path;
      this.refresh();
    }
  },

  back() {
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this.currentPath = this.history[this.historyIdx];
      this.refresh();
    }
  },

  forward() {
    if (this.historyIdx < this.history.length - 1) {
      this.historyIdx++;
      this.currentPath = this.history[this.historyIdx];
      this.refresh();
    }
  },

  refresh() {
    Tahoe.state.windows.filter(w => w.appId === 'finder').forEach(win => {
      this.render(win.el.querySelector('.window-content'), win);
    });
  },

  search(query, winData) {
    const content = document.getElementById(`${winData.id}-files`);
    if (!content) return;
    query = query.toLowerCase();
    const items = this.fileSystem[this.currentPath] || [];
    const filtered = query ? items.filter(i => i.name.toLowerCase().includes(query)) : items;

    if (this.currentView === 'icons') {
      content.innerHTML = `<div class="finder-grid">${
        filtered.map((item, i) => this.renderIcon(item, i)).join('')
      }</div>`;
    } else {
      content.innerHTML = `
        <div class="finder-list">
          <div class="finder-list-header">
            <span style="width:24px;"></span>
            <span style="flex:1;">Name</span>
          </div>
          ${filtered.map((item, i) => this.renderListRow(item, i)).join('')}
        </div>
      `;
    }

    content.querySelectorAll('.finder-item, .finder-list-row').forEach(el => {
      el.addEventListener('click', () => {
        content.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
      });
      el.addEventListener('dblclick', () => {
        const idx = parseInt(el.dataset.idx);
        const item = filtered[idx];
        if (item) this.openItem(item, winData);
      });
    });
  },

  newFolder() {
    const path = this.currentPath;
    if (!this.fileSystem[path]) this.fileSystem[path] = [];
    const name = 'New Folder';
    let finalName = name;
    let counter = 2;
    while (this.fileSystem[path].some(i => i.name === finalName)) {
      finalName = `${name} ${counter++}`;
    }
    this.fileSystem[path].push({ name: finalName, type: 'folder' });
    this.refresh();
    Tahoe.showNotification('Finder', `Created "${finalName}" in ${path}`);
  },

  openSelected() {
    const selected = document.querySelector('.finder-item.selected, .finder-list-row.selected');
    if (!selected) return;
    const items = this.fileSystem[this.currentPath] || [];
    const idx = parseInt(selected.dataset.idx);
    const item = items[idx];
    if (item) this.openItem(item, null);
  },
};
