/* ============================================
   App: Maps
   ============================================ */

const Maps = {
  zoom: 13,
  center: { lat: 37.3318, lng: -122.0312 }, // Apple Park
  markers: [
    { name: 'Apple Park', lat: 37.3318, lng: -122.0312, type: 'landmark' },
    { name: 'Cupertino Main Street', lat: 37.3230, lng: -122.0322, type: 'shop' },
    { name: 'Vallco Park', lat: 37.3300, lng: -122.0170, type: 'park' },
    { name: 'Stevens Creek Blvd', lat: 37.3240, lng: -122.0300, type: 'street' },
    { name: 'De Anza College', lat: 37.3200, lng: -122.0470, type: 'school' },
  ],
  searchResults: [],

  render(container, winData) {
    container.innerHTML = `
      <div class="maps-app">
        <div class="maps-canvas" id="${winData.id}-canvas">
          ${this.renderMapContent(winData)}
        </div>
        <div class="maps-overlay">
          <input type="text" class="maps-search" placeholder="Search Maps" id="${winData.id}-search" autocomplete="off">
          <div id="${winData.id}-results"></div>
        </div>
        <div class="maps-controls">
          <button class="maps-btn" id="${winData.id}-zoomin">+</button>
          <button class="maps-btn" id="${winData.id}-zoomout">−</button>
          <button class="maps-btn" id="${winData.id}-locate">⊙</button>
        </div>
      </div>
    `;

    this.attachEvents(winData);
  },

  renderMapContent(winData) {
    // Generate a stylized map with roads, blocks, parks
    const markers = this.markers.map((m, i) => {
      const x = 50 + (m.lng - this.center.lng) * 500 * (this.zoom / 13);
      const y = 50 - (m.lat - this.center.lat) * 500 * (this.zoom / 13);
      return `
        <div style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-100%);cursor:pointer;" data-marker="${i}" title="${m.name}">
          <svg width="28" height="36" viewBox="0 0 28 36"><path d="M14 0 C6 0 0 6 0 14 C0 24 14 36 14 36 C14 36 28 24 28 14 C28 6 22 0 14 0 Z" fill="#ff3b30"/><circle cx="14" cy="14" r="5" fill="#fff"/></svg>
          <div style="background:rgba(30,30,35,0.85);backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.1);border-radius:6px;padding:2px 8px;font-size:11px;white-space:nowrap;margin-top:2px;">${m.name}</div>
        </div>
      `;
    }).join('');

    return `
      <div style="position:absolute;inset:0;overflow:hidden;">
        <!-- Map blocks/grid -->
        <svg style="position:absolute;inset:0;width:100%;height:100%;" viewBox="0 0 100 100" preserveAspectRatio="none">
          <!-- Water -->
          <rect x="0" y="0" width="100" height="100" fill="#1a2a3e"/>
          <!-- Park areas -->
          <rect x="20" y="30" width="25" height="20" fill="rgba(48,209,88,0.15)" rx="2"/>
          <rect x="60" y="55" width="20" height="25" fill="rgba(48,209,88,0.15)" rx="2"/>
          <!-- Building blocks -->
          ${this.generateBlocks()}
          <!-- Roads -->
          ${this.generateRoads()}
        </svg>
        <!-- Markers -->
        ${markers}
      </div>
    `;
  },

  generateBlocks() {
    let html = '';
    const colors = ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.05)', 'rgba(100,210,255,0.05)'];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (Math.random() > 0.3) {
          const x = i * 12.5 + 2;
          const y = j * 12.5 + 2;
          const w = 8 + Math.random() * 3;
          const h = 8 + Math.random() * 3;
          const c = colors[Math.floor(Math.random() * colors.length)];
          html += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" rx="0.5"/>`;
        }
      }
    }
    return html;
  },

  generateRoads() {
    let html = '';
    for (let i = 1; i < 8; i++) {
      const pos = i * 12.5;
      html += `<line x1="${pos}" y1="0" x2="${pos}" y2="100" stroke="rgba(255,255,255,0.08)" stroke-width="0.3"/>`;
      html += `<line x1="0" y1="${pos}" x2="100" y2="${pos}" stroke="rgba(255,255,255,0.08)" stroke-width="0.3"/>`;
    }
    // Main roads
    html += `<line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>`;
    html += `<line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.15)" stroke-width="0.6"/>`;
    return html;
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');
    const canvas = document.getElementById(`${winData.id}-canvas`);
    const search = document.getElementById(`${winData.id}-search`);
    const zoomIn = document.getElementById(`${winData.id}-zoomin`);
    const zoomOut = document.getElementById(`${winData.id}-zoomout`);
    const locate = document.getElementById(`${winData.id}-locate`);
    const results = document.getElementById(`${winData.id}-results`);

    // Marker clicks
    container.querySelectorAll('[data-marker]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(el.dataset.marker);
        const marker = this.markers[idx];
        this.showLocationInfo(marker, winData);
      });
    });

    // Search
    if (search) {
      search.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          results.innerHTML = '';
          return;
        }
        const matched = this.markers.filter(m => m.name.toLowerCase().includes(query));
        if (matched.length > 0) {
          results.innerHTML = matched.map(m => `
            <div class="spotlight-result-item" data-name="${m.name}" style="background:rgba(30,30,35,0.85);backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.1);border-radius:8px;margin-top:4px;">
              <div class="result-icon"><span style="font-size:20px;">📍</span></div>
              <div>
                <div class="result-name">${m.name}</div>
                <div class="result-type">Location</div>
              </div>
            </div>
          `).join('');
          results.querySelectorAll('[data-name]').forEach(r => {
            r.addEventListener('click', () => {
              const m = this.markers.find(mk => mk.name === r.dataset.name);
              if (m) this.showLocationInfo(m, winData);
              results.innerHTML = '';
              search.value = '';
            });
          });
        } else {
          results.innerHTML = '<div style="background:rgba(30,30,35,0.85);backdrop-filter:blur(20px);border-radius:8px;padding:12px;font-size:13px;color:var(--text-secondary);margin-top:4px;">No results found</div>';
        }
      });
    }

    // Zoom
    if (zoomIn) zoomIn.addEventListener('click', () => {
      this.zoom = Math.min(18, this.zoom + 1);
      canvas.innerHTML = this.renderMapContent(winData);
      this.attachEvents(winData);
    });

    if (zoomOut) zoomOut.addEventListener('click', () => {
      this.zoom = Math.max(1, this.zoom - 1);
      canvas.innerHTML = this.renderMapContent(winData);
      this.attachEvents(winData);
    });

    if (locate) locate.addEventListener('click', () => {
      Tahoe.showNotification('Maps', 'Locating your position...');
    });
  },

  showLocationInfo(marker, winData) {
    const info = document.createElement('div');
    info.className = 'glass-panel';
    info.style.cssText = 'position:absolute;bottom:60px;left:50%;transform:translateX(-50%);padding:16px;width:280px;border-radius:14px;animation:scaleIn 0.2s ease;';
    info.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <div style="font-size:24px;">📍</div>
        <div>
          <div style="font-size:15px;font-weight:600;">${marker.name}</div>
          <div style="font-size:12px;color:var(--text-secondary);">${marker.lat.toFixed(4)}, ${marker.lng.toFixed(4)}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-accent" style="flex:1;font-size:12px;">Directions</button>
        <button class="btn-glass" style="flex:1;font-size:12px;">Share</button>
      </div>
    `;
    const canvas = document.getElementById(`${winData.id}-canvas`);
    // Remove existing info
    canvas.querySelectorAll('.glass-panel').forEach(p => p.remove());
    canvas.appendChild(info);

    info.querySelector('.btn-accent').addEventListener('click', () => {
      Tahoe.showNotification('Maps', `Getting directions to ${marker.name}...`);
      info.remove();
    });
    info.querySelector('.btn-glass').addEventListener('click', () => {
      Tahoe.showNotification('Maps', `Sharing location: ${marker.name}`);
    });

    setTimeout(() => info.remove(), 8000);
  },
};
