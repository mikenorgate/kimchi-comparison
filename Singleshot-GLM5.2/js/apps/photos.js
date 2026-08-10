/* ============================================
   App: Photos
   ============================================ */

const Photos = {
  sidebarItems: [
    { section: 'Photos', items: [
      { name: 'Library', icon: '🖼' },
      { name: 'Memories', icon: '✨' },
      { name: 'Favorites', icon: '❤️' },
      { name: 'Recents', icon: '🕐' },
    ]},
    { section: 'Albums', items: [
      { name: 'Vacation 2025', icon: '🏖' },
      { name: 'Family', icon: '👨‍👩‍👧‍👦' },
      { name: 'Screenshots', icon: '📸' },
      { name: 'Nature', icon: '🌳' },
      { name: 'Food', icon: '🍜' },
    ]},
    { section: 'Media Types', items: [
      { name: 'Videos', icon: '🎬' },
      { name: 'Selfies', icon: '🤳' },
      { name: 'Live Photos', icon: '💫' },
    ]},
  ],

  // Generate gradient "photos"
  photos: Array.from({ length: 48 }, (_, i) => ({
    id: i,
    gradient: [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #30cfd0, #330867)',
      'linear-gradient(135deg, #a8edea, #fed6e3)',
      'linear-gradient(135deg, #ff9a9e, #fecfef)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)',
      'linear-gradient(135deg, #84fab0, #8fd3f4)',
      'linear-gradient(135deg, #c2e9fb, #a1c4fd)',
      'linear-gradient(135deg, #fbc2eb, #a18cd1)',
    ][i % 12],
    date: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  })),

  activeAlbum: 'Library',
  selectedPhoto: null,

  render(container, winData) {
    container.innerHTML = `
      <div class="photos-app">
        <div class="photos-sidebar">
          <div style="padding:8px;margin-bottom:4px;">
            <input type="text" class="toolbar-search" placeholder="Search Photos" style="width:100%;">
          </div>
          ${this.sidebarItems.map(section => `
            <div class="sidebar-section">${section.section}</div>
            ${section.items.map(item => `
              <div class="sidebar-item ${item.name === this.activeAlbum ? 'active' : ''}" data-album="${item.name}">
                <span style="font-size:14px;width:16px;text-align:center;">${item.icon}</span>
                ${item.name}
              </div>
            `).join('')}
          `).join('')}
        </div>
        <div class="photos-main">
          <div style="display:flex;align-items:center;margin-bottom:12px;gap:8px;">
            <h2 style="font-size:20px;font-weight:700;">${this.activeAlbum}</h2>
            <span style="font-size:13px;color:var(--text-secondary);">${this.photos.length} Photos</span>
            <div style="flex:1"></div>
            <div class="segmented-control">
              <button class="segment-btn active">${Icons.grid}</button>
              <button class="segment-btn">${Icons.list}</button>
            </div>
          </div>
          <div class="photos-grid" id="${winData.id}-grid">
            ${this.photos.map(photo => `
              <div class="photo-thumb" data-id="${photo.id}" style="background:${photo.gradient};">
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.attachEvents(winData);
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');

    // Photo clicks
    container.querySelectorAll('.photo-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const id = parseInt(thumb.dataset.id);
        const photo = this.photos[id];
        this.showPhotoViewer(photo, winData);
      });
    });

    // Sidebar navigation
    container.querySelectorAll('.sidebar-item[data-album]').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeAlbum = item.dataset.album;
        const main = container.querySelector('.photos-main');
        if (main) {
          main.querySelector('h2').textContent = this.activeAlbum;
        }
      });
    });
  },

  showPhotoViewer(photo, winData) {
    // Create a separate viewer window
    const viewerConfig = {
      width: 600,
      height: 500,
      x: 150,
      y: 100,
      minW: 400,
      minH: 300,
      resizable: false,
      light: false,
      render: (c) => {
        c.innerHTML = `
          <div style="flex:1;display:flex;flex-direction:column;background:#000;">
            <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;">
              <div style="width:100%;aspect-ratio:1;background:${photo.gradient};border-radius:8px;max-width:500px;max-height:400px;"></div>
            </div>
            <div style="padding:12px 20px;display:flex;align-items:center;gap:12px;border-top:0.5px solid rgba(255,255,255,0.1);">
              <div style="width:40px;height:40px;border-radius:50%;background:${photo.gradient};"></div>
              <div>
                <div style="font-size:13px;font-weight:600;">Photo ${photo.id + 1}</div>
                <div style="font-size:11px;color:var(--text-secondary);">${photo.date}</div>
              </div>
              <div style="flex:1"></div>
              <button class="toolbar-btn" title="Share">${Icons.share}</button>
              <button class="toolbar-btn" title="Favorite">❤️</button>
              <button class="toolbar-btn" title="Delete">${Icons.close}</button>
            </div>
          </div>
        `;
      },
    };
    WindowManager.createWindow('photos', 'Photos', viewerConfig);
  },
};
