/* ============================================
   App: Music
   ============================================ */

const Music = {
  playlists: [
    { name: 'Listen Now', icon: '▶', system: true },
    { name: 'Browse', icon: '⋁', system: true },
    { name: 'Radio', icon: '📻', system: true },
  ],
  library: [
    { name: 'Recently Added', icon: '🕐', system: true },
    { name: 'Artists', icon: '🎤', system: true },
    { name: 'Albums', icon: '💿', system: true },
    { name: 'Songs', icon: '🎵', system: true },
  ],
  userPlaylists: [
    { name: 'Chill Vibes', count: 42 },
    { name: 'Workout Mix', count: 28 },
    { name: 'Focus & Study', count: 56 },
    { name: 'Road Trip', count: 35 },
    { name: 'Throwbacks', count: 64 },
  ],
  songs: [
    { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration: '4:03', color1: '#5e5ce6', color2: '#bf5af2' },
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', color1: '#ff2d55', color2: '#ff9f0a' },
    { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:23', color1: '#ff453a', color2: '#ff9f0a' },
    { title: 'Starboy', artist: 'The Weeknd', album: 'Starboy', duration: '3:50', color1: '#1a1a2e', color2: '#5e5ce6' },
    { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', color1: '#ff2d55', color2: '#ff9f0a' },
    { title: 'Electric Feel', artist: 'MGMT', album: 'Oracular Spectacular', duration: '3:49', color1: '#30d158', color2: '#64d2ff' },
    { title: 'Take a Walk', artist: 'Passion Pit', album: 'Gossamer', duration: '4:23', color1: '#0a84ff', color2: '#5e5ce6' },
    { title: 'Safe and Sound', artist: 'Capital Cities', album: 'In a Tidal Wave of Mystery', duration: '3:14', color1: '#ffd60a', color2: '#ff9f0a' },
    { title: 'Pumped Up Kicks', artist: 'Foster the People', album: 'Torches', duration: '3:59', color1: '#ff9f0a', color2: '#ff453a' },
    { title: 'Sweater Weather', artist: 'The Neighbourhood', album: 'I Love You.', duration: '3:44', color1: '#1a1a2e', color2: '#0a84ff' },
  ],
  currentSong: null,
  isPlaying: false,
  progress: 0,
  progressInterval: null,
  activeView: 'songs',

  render(container, winData) {
    container.innerHTML = `
      <div class="music-app">
        <div class="music-sidebar">
          <div class="sidebar-section">Apple Music</div>
          ${this.playlists.map(p => `
            <div class="music-playlist-item" data-view="${p.name}">
              <span style="font-size:14px;">${p.icon}</span> ${p.name}
            </div>
          `).join('')}
          <div class="sidebar-section">Library</div>
          ${this.library.map(l => `
            <div class="music-playlist-item ${l.name === 'Songs' ? 'active' : ''}" data-view="${l.name.toLowerCase()}">
              <span style="font-size:14px;">${l.icon}</span> ${l.name}
            </div>
          `).join('')}
          <div class="sidebar-section">Playlists</div>
          ${this.userPlaylists.map(p => `
            <div class="music-playlist-item" data-view="${p.name}">
              <span style="font-size:14px;">🎵</span> ${p.name}
            </div>
          `).join('')}
        </div>
        <div class="music-main" id="${winData.id}-main">
          ${this.renderMainContent()}
        </div>
        <div class="music-player-bar" id="${winData.id}-player">
          ${this.renderPlayerBar()}
        </div>
      </div>
    `;

    this.attachEvents(winData);
  },

  renderMainContent() {
    return `
      <div style="margin-bottom:20px;">
        <h1 style="font-size:28px;font-weight:700;">Songs</h1>
      </div>
      <div>
        ${this.songs.map((song, i) => `
          <div class="music-list-item" data-idx="${i}">
            <span class="track-num">${i + 1}</span>
            <div style="width:40px;height:40px;border-radius:6px;background:linear-gradient(135deg,${song.color1},${song.color2});flex-shrink:0;"></div>
            <div style="flex:1;min-width:0;">
              <div class="track-title">${song.title}</div>
              <div style="font-size:12px;color:var(--text-secondary);">${song.artist} — ${song.album}</div>
            </div>
            <span class="track-duration">${song.duration}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderPlayerBar() {
    const song = this.currentSong || this.songs[0];
    const playBtn = this.isPlaying ? Icons.pause : Icons.play;
    const progress = this.currentSong ? this.progress : 0;

    return `
      <div class="music-art" style="background:linear-gradient(135deg,${song.color1},${song.color2});">
        <span style="font-size:16px;">♪</span>
      </div>
      <div class="music-info">
        <div class="music-track-name">${song.title}</div>
        <div class="music-artist-name">${song.artist}</div>
      </div>
      <div class="music-controls">
        <button class="music-control-btn" id="music-prev">${Icons.prev}</button>
        <button class="music-control-btn play" id="music-play">${playBtn}</button>
        <button class="music-control-btn" id="music-next">${Icons.next}</button>
      </div>
      <div class="music-progress" id="music-progress-bar">
        <div class="music-progress-fill" style="width:${progress}%;"></div>
      </div>
      <span style="font-size:11px;color:var(--text-secondary);min-width:40px;text-align:right;">${this.formatTime(progress, song.duration)}</span>
    `;
  },

  attachEvents(winData) {
    const container = winData.el.querySelector('.window-content');
    const player = document.getElementById(`${winData.id}-player`);

    // Song list clicks
    container.querySelectorAll('.music-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx);
        this.playSong(idx, winData);
      });
    });

    // Sidebar navigation
    container.querySelectorAll('.music-playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        container.querySelectorAll('.music-playlist-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeView = item.dataset.view;
      });
    });

    // Player controls
    if (player) {
      const playBtn = player.querySelector('#music-play');
      const prevBtn = player.querySelector('#music-prev');
      const nextBtn = player.querySelector('#music-next');
      const progressBar = player.querySelector('#music-progress-bar');

      if (playBtn) playBtn.addEventListener('click', () => this.togglePlay(winData));
      if (prevBtn) prevBtn.addEventListener('click', () => this.prevSong(winData));
      if (nextBtn) nextBtn.addEventListener('click', () => this.nextSong(winData));
      if (progressBar) progressBar.addEventListener('click', (e) => this.seek(e, winData));
    }
  },

  playSong(idx, winData) {
    this.currentSong = this.songs[idx];
    this.isPlaying = true;
    this.progress = 0;
    this.updatePlayer(winData);

    if (this.progressInterval) clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.progress += 0.5;
      if (this.progress >= 100) {
        this.nextSong(winData);
      } else {
        this.updatePlayer(winData);
      }
    }, 1000);
  },

  togglePlay(winData) {
    if (!this.currentSong) {
      this.playSong(0, winData);
      return;
    }
    this.isPlaying = !this.isPlaying;
    this.updatePlayer(winData);
  },

  prevSong(winData) {
    const idx = this.currentSong ? this.songs.indexOf(this.currentSong) : 0;
    const prevIdx = idx > 0 ? idx - 1 : this.songs.length - 1;
    this.playSong(prevIdx, winData);
  },

  nextSong(winData) {
    const idx = this.currentSong ? this.songs.indexOf(this.currentSong) : 0;
    const nextIdx = (idx + 1) % this.songs.length;
    this.playSong(nextIdx, winData);
  },

  seek(e, winData) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    this.progress = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    this.updatePlayer(winData);
  },

  updatePlayer(winData) {
    const player = document.getElementById(`${winData.id}-player`);
    if (!player) return;
    player.innerHTML = this.renderPlayerBar();

    const playBtn = player.querySelector('#music-play');
    const prevBtn = player.querySelector('#music-prev');
    const nextBtn = player.querySelector('#music-next');
    const progressBar = player.querySelector('#music-progress-bar');

    if (playBtn) playBtn.addEventListener('click', () => this.togglePlay(winData));
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSong(winData));
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSong(winData));
    if (progressBar) progressBar.addEventListener('click', (e) => this.seek(e, winData));
  },

  formatTime(progress, duration) {
    if (!duration) return '0:00';
    const [m, s] = duration.split(':').map(Number);
    const totalSec = m * 60 + s;
    const currentSec = Math.floor(totalSec * progress / 100);
    const cm = Math.floor(currentSec / 60);
    const cs = currentSec % 60;
    return `${cm}:${cs.toString().padStart(2, '0')}`;
  },
};
