/* ============================================
   App: Safari
   ============================================ */

const Safari = {
  currentUrl: '',
  history: [],
  historyIdx: -1,
  favorites: [
    { name: 'Apple', url: 'apple.com', color: '#333', letter: '' },
    { name: 'Google', url: 'google.com', color: '#4285f4', letter: 'G' },
    { name: 'YouTube', url: 'youtube.com', color: '#ff0000', letter: '▶' },
    { name: 'GitHub', url: 'github.com', color: '#181717', letter: '' },
    { name: 'Wikipedia', url: 'wikipedia.org', color: '#000', letter: 'W' },
    { name: 'Reddit', url: 'reddit.com', color: '#ff4500', letter: 'R' },
    { name: 'Amazon', url: 'amazon.com', color: '#ff9900', letter: 'a' },
    { name: 'Netflix', url: 'netflix.com', color: '#e50914', letter: 'N' },
    { name: 'Twitter', url: 'x.com', color: '#000', letter: 'X' },
    { name: 'Instagram', url: 'instagram.com', color: '#c13584', letter: '' },
    { name: 'Maps', url: 'maps.apple.com', color: '#30d158', letter: '' },
    { name: 'Weather', url: 'weather.com', color: '#0a84ff', letter: '☁' },
  ],

  render(container, winData) {
    container.innerHTML = `
      <div class="safari-app">
        <div class="safari-toolbar">
          <div class="safari-nav-btns">
            <button class="toolbar-btn" id="${winData.id}-back">${Icons.back}</button>
            <button class="toolbar-btn" id="${winData.id}-fwd">${Icons.forward}</button>
          </div>
          <div class="safari-url-bar">
            <span style="color:var(--text-secondary);">${Icons.lock}</span>
            <input type="text" id="${winData.id}-url" placeholder="Search or enter website name" value="" autocomplete="off">
          </div>
          <button class="toolbar-btn" id="${winData.id}-reload">${Icons.reload}</button>
          <button class="toolbar-btn" id="${winData.id}-share">${Icons.share}</button>
          <button class="toolbar-btn" id="${winData.id}-newtab">${Icons.add}</button>
        </div>
        <div class="safari-content" id="${winData.id}-content"></div>
      </div>
    `;

    this.showStartPage(winData);
    this.attachEvents(winData);
  },

  showStartPage(winData) {
    const content = document.getElementById(`${winData.id}-content`);
    if (!content) return;
    content.innerHTML = `
      <div class="safari-startpage">
        <div style="text-align:center;margin-bottom:20px;">
          <h1 style="font-size:32px;font-weight:300;color:#fff;">Favorites</h1>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;">Click a favorite to visit</p>
        </div>
        <div class="safari-favorites">
          ${this.favorites.map(fav => `
            <div class="safari-fav-item" data-url="${fav.url}">
              <div class="safari-fav-icon" style="background:${fav.color};">${fav.letter || fav.name[0]}</div>
              <div class="safari-fav-name">${fav.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    content.querySelectorAll('.safari-fav-item').forEach(el => {
      el.addEventListener('click', () => {
        const url = el.dataset.url;
        const urlInput = document.getElementById(`${winData.id}-url`);
        if (urlInput) urlInput.value = url;
        this.navigate(url, winData);
      });
    });
  },

  attachEvents(winData) {
    const urlInput = document.getElementById(`${winData.id}-url`);
    const backBtn = document.getElementById(`${winData.id}-back`);
    const fwdBtn = document.getElementById(`${winData.id}-fwd`);
    const reloadBtn = document.getElementById(`${winData.id}-reload`);
    const shareBtn = document.getElementById(`${winData.id}-share`);

    if (urlInput) {
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.navigate(urlInput.value, winData);
        }
      });
    }

    if (backBtn) backBtn.addEventListener('click', () => this.back(winData));
    if (fwdBtn) fwdBtn.addEventListener('click', () => this.forward(winData));
    if (reloadBtn) reloadBtn.addEventListener('click', () => this.reload(winData));
    if (shareBtn) shareBtn.addEventListener('click', () => {
      Tahoe.showNotification('Safari', 'Share link: ' + (this.currentUrl || 'Start Page'));
    });
  },

  navigate(url, winData) {
    url = url.trim().toLowerCase();
    if (!url) return;

    // Add to history
    this.history = this.history.slice(0, this.historyIdx + 1);
    this.history.push(url);
    this.historyIdx = this.history.length - 1;
    this.currentUrl = url;

    const content = document.getElementById(`${winData.id}-content`);
    const urlInput = document.getElementById(`${winData.id}-url`);
    if (urlInput) urlInput.value = url;

    // Render simulated page
    const page = this.generatePage(url);
    content.innerHTML = page;
    content.scrollTop = 0;
  },

  generatePage(url) {
    const domain = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    if (domain.includes('google')) {
      return `
        <div style="min-height:100%;background:#fff;color:#333;font-family:Inter,sans-serif;">
          <div style="display:flex;align-items:center;gap:20px;padding:14px 24px;border-bottom:1px solid #eee;">
            <div style="font-size:22px;font-weight:500;color:#4285f4;"><span style="color:#ea4335;">G</span><span style="color:#fbbc05;">o</span><span style="color:#4285f4;">o</span><span style="color:#34a853;">g</span><span style="color:#ea4335;">l</span><span style="color:#fbbc05;">e</span></div>
            <div style="flex:1;max-width:500px;background:#f1f3f4;border-radius:24px;padding:10px 20px;display:flex;align-items:center;gap:10px;">
              <span style="color:#999;">🔍</span>
              <span style="color:#999;font-size:14px;">Search Google or type a URL</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;padding:60px 20px;gap:30px;">
            <div style="font-size:48px;font-weight:300;color:#333;">Google</div>
            <div style="width:500px;max-width:90%;background:#f1f3f4;border-radius:24px;padding:12px 24px;display:flex;align-items:center;gap:12px;">
              <span style="color:#999;">🔍</span>
              <input type="text" style="border:none;background:transparent;outline:none;font-size:16px;width:100%;color:#333;" placeholder="Search Google" id="google-search">
            </div>
            <div style="display:flex;gap:12px;">
              <button style="background:#f8f9fa;border:1px solid #f8f9fa;padding:8px 16px;border-radius:4px;color:#333;cursor:pointer;font-size:14px;">Google Search</button>
              <button style="background:#f8f9fa;border:1px solid #f8f9fa;padding:8px 16px;border-radius:4px;color:#333;cursor:pointer;font-size:14px;">I'm Feeling Lucky</button>
            </div>
          </div>
          <div style="position:absolute;bottom:0;left:0;right:0;background:#f2f2f2;padding:10px 24px;display:flex;justify-content:space-between;font-size:13px;color:#999;">
            <span>United States</span>
            <span>Privacy · Terms · Settings</span>
          </div>
        </div>
      `;
    }

    if (domain.includes('youtube')) {
      return `
        <div style="min-height:100%;background:#0f0f0f;color:#fff;font-family:Inter,sans-serif;">
          <div style="display:flex;align-items:center;gap:16px;padding:12px 24px;">
            <div style="font-size:20px;font-weight:700;color:#ff0000;">▶ YouTube</div>
            <div style="flex:1;max-width:400px;background:#121212;border:1px solid #303030;border-radius:20px;padding:8px 16px;display:flex;align-items:center;gap:10px;">
              <span style="color:#aaa;">🔍</span>
              <span style="color:#aaa;font-size:14px;">Search</span>
            </div>
          </div>
          <div style="padding:0 24px;">
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px;margin-top:20px;">
              ${[1,2,3,4,5,6].map(i => `
                <div style="cursor:pointer;">
                  <div style="aspect-ratio:16/9;background:linear-gradient(135deg,#${Math.floor(Math.random()*16777215).toString(16)}66,#${Math.floor(Math.random()*16777215).toString(16)}66);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;">▶</div>
                  <div style="display:flex;gap:8px;margin-top:8px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:#333;flex-shrink:0;"></div>
                    <div>
                      <div style="font-size:14px;font-weight:500;">Amazing Video Title #${i}</div>
                      <div style="font-size:12px;color:#aaa;">Channel Name</div>
                      <div style="font-size:12px;color:#aaa;">${Math.floor(Math.random()*999)}K views · ${Math.floor(Math.random()*12)} hours ago</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (domain.includes('apple')) {
      return `
        <div style="min-height:100%;background:#fff;color:#1d1d1f;font-family:Inter,sans-serif;">
          <div style="display:flex;align-items:center;justify-content:center;gap:30px;padding:12px 24px;background:rgba(0,0,0,0.8);backdrop-filter:blur(20px);">
            <span style="color:#fff;font-size:14px;cursor:pointer;">Store</span>
            <span style="color:#fff;font-size:14px;cursor:pointer;">Mac</span>
            <span style="color:#fff;font-size:14px;cursor:pointer;">iPad</span>
            <span style="color:#fff;font-size:14px;cursor:pointer;">iPhone</span>
            <span style="color:#fff;font-size:14px;cursor:pointer;">Watch</span>
            <span style="color:#fff;font-size:14px;cursor:pointer;">Vision</span>
            <span style="color:#fff;font-size:14px;cursor:pointer;">AirPods</span>
            <span style="color:#fff;font-size:14px;cursor:pointer;">Support</span>
          </div>
          <div style="text-align:center;padding:80px 20px 40px;">
            <h1 style="font-size:56px;font-weight:600;letter-spacing:-1px;">MacBook Pro</h1>
            <h2 style="font-size:28px;font-weight:400;color:#86868b;">A work of smart.</h2>
            <div style="margin-top:20px;">
              <span style="color:#0066cc;font-size:17px;cursor:pointer;">Learn more &nbsp;›</span>
              <span style="color:#0066cc;font-size:17px;cursor:pointer;margin-left:20px;">Buy &nbsp;›</span>
            </div>
          </div>
          <div style="text-align:center;padding:40px 20px;">
            <div style="max-width:600px;margin:0 auto;background:linear-gradient(135deg,#1a1a2e,#2a2a4e);border-radius:20px;padding:60px 40px;">
              <div style="font-size:32px;font-weight:600;">macOS Tahoe</div>
              <div style="font-size:20px;color:#86868b;margin-top:8px;">The Liquid Glass era begins.</div>
              <div style="margin-top:16px;">
                <span style="color:#64d2ff;font-size:17px;cursor:pointer;">Discover &nbsp;›</span>
              </div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;padding:0 12px 40px;">
            ${['iPhone', 'iPad', 'Apple Watch'].map(p => `
              <div style="background:#f5f5f7;border-radius:16px;padding:40px 20px;text-align:center;">
                <div style="font-size:24px;font-weight:600;">${p}</div>
                <div style="font-size:16px;color:#86868b;margin-top:4px;">Pro. Beyond.</div>
                <div style="margin-top:12px;color:#0066cc;font-size:14px;cursor:pointer;">Learn more ›</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (domain.includes('wikipedia')) {
      return `
        <div style="min-height:100%;background:#fff;color:#202122;font-family:Inter,sans-serif;padding:40px 60px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
            <div style="font-size:28px;">W</div>
            <div style="font-size:28px;font-family:serif;">WIKIPEDIA</div>
          </div>
          <div style="border:1px solid #a2a9b1;padding:8px 16px;border-radius:4px;margin-bottom:24px;display:inline-block;">The Free Encyclopedia</div>
          <h1 style="font-size:32px;font-weight:400;border-bottom:1px solid #a2a9b1;padding-bottom:8px;">Welcome to Wikipedia,</h1>
          <p style="font-size:16px;line-height:1.6;margin-top:16px;">the free encyclopedia that anyone can edit. Wikipedia is a free online encyclopedia, created and edited by volunteers around the world and hosted by the Wikimedia Foundation.</p>
          <h2 style="font-size:24px;font-weight:400;margin-top:32px;border-bottom:1px solid #a2a9b1;padding-bottom:4px;">From today's featured article</h2>
          <p style="font-size:14px;line-height:1.6;margin-top:12px;">macOS Tahoe (version 26) is the latest major release of Apple's desktop operating system. It introduces the "Liquid Glass" design language, a translucent interface that adapts dynamically to content beneath windows. The update also brings enhanced AI capabilities, a redesigned Spotlight, and new Continuity features across Apple devices.</p>
          <h2 style="font-size:24px;font-weight:400;margin-top:32px;border-bottom:1px solid #a2a9b1;padding-bottom:4px;">In the news</h2>
          <ul style="margin-top:12px;padding-left:20px;font-size:14px;line-height:1.8;">
            <li>Apple announces macOS Tahoe with Liquid Glass design</li>
            <li>New M3 Pro MacBook Pro benchmarks set records</li>
            <li>Vision OS 3 brings spatial widgets to the home view</li>
          </ul>
        </div>
      `;
    }

    // Generic page
    return `
      <div style="min-height:100%;background:#fff;color:#333;font-family:Inter,sans-serif;">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:60px 40px;text-align:center;color:#fff;">
          <div style="font-size:14px;opacity:0.8;text-transform:uppercase;letter-spacing:2px;">Welcome to</div>
          <h1 style="font-size:48px;font-weight:300;margin:8px 0;">${domain}</h1>
          <div style="font-size:16px;opacity:0.8;">This is a simulated web page</div>
        </div>
        <div style="max-width:800px;margin:0 auto;padding:40px 20px;">
          <h2 style="font-size:28px;font-weight:600;">About</h2>
          <p style="font-size:16px;line-height:1.6;color:#666;margin-top:12px;">
            Welcome to ${domain}. This is a simulated webpage rendered by macOS Tahoe's Safari browser.
            In a real browser, you would see the actual website content here.
          </p>
          <h2 style="font-size:28px;font-weight:600;margin-top:32px;">Latest News</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:16px;">
            <div style="background:#f5f5f7;border-radius:12px;padding:20px;">
              <div style="font-size:14px;font-weight:600;">Article Title One</div>
              <div style="font-size:13px;color:#999;margin-top:4px;">Lorem ipsum dolor sit amet...</div>
            </div>
            <div style="background:#f5f5f7;border-radius:12px;padding:20px;">
              <div style="font-size:14px;font-weight:600;">Article Title Two</div>
              <div style="font-size:13px;color:#999;margin-top:4px;">Consectetur adipiscing elit...</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  back(winData) {
    if (this.historyIdx > 0) {
      this.historyIdx--;
      this.currentUrl = this.history[this.historyIdx];
      const content = document.getElementById(`${winData.id}-content`);
      const urlInput = document.getElementById(`${winData.id}-url`);
      if (urlInput) urlInput.value = this.currentUrl;
      if (this.currentUrl) {
        content.innerHTML = this.generatePage(this.currentUrl);
      } else {
        this.showStartPage(winData);
      }
    }
  },

  forward(winData) {
    if (this.historyIdx < this.history.length - 1) {
      this.historyIdx++;
      this.currentUrl = this.history[this.historyIdx];
      const content = document.getElementById(`${winData.id}-content`);
      const urlInput = document.getElementById(`${winData.id}-url`);
      if (urlInput) urlInput.value = this.currentUrl;
      if (this.currentUrl) {
        content.innerHTML = this.generatePage(this.currentUrl);
      } else {
        this.showStartPage(winData);
      }
    }
  },

  reload(winData) {
    if (this.currentUrl) {
      const content = document.getElementById(`${winData.id}-content`);
      content.innerHTML = this.generatePage(this.currentUrl);
    }
  },
};
