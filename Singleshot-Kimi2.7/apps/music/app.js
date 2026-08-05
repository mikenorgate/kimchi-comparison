import { App, registerApp } from '../../js/appRegistry.js';
import { $ } from '../../js/utils.js';

class MusicApp extends App {
  constructor() {
    super({ id: 'music', name: 'Music', width: 840, height: 560, emoji: '🎵', iconGradient: ['#ff2d55', '#c2185b'], iconColor: '#fff' });
    this.songs = [
      { title: 'Morning Glow', artist: 'Chill Wave', duration: '3:24' },
      { title: 'Neon Drive', artist: 'Synth Pop', duration: '4:01' },
      { title: 'Ocean Breeze', artist: 'Acoustic', duration: '2:58' },
      { title: 'City Lights', artist: 'Lo-Fi', duration: '3:12' },
      { title: 'Mountain Air', artist: 'Ambient', duration: '5:30' }
    ];
    this.current = null;
  }

  getContent(_w) {
    const root = document.createElement('div');
    root.className = 'music';
    root.innerHTML = `
      <aside class="music-sidebar">
        <div class="music-item active">Listen Now</div>
        <div class="music-item">Browse</div>
        <div class="music-item">Library</div>
      </aside>
      <main class="music-main">
        <h2>Library</h2>
        <div class="music-list" id="list"></div>
        <div class="music-player" id="player">
          <div id="now">Select a song</div>
          <div class="music-controls">
            <button id="prev">⏮</button><button id="play">▶</button><button id="next">⏭</button>
          </div>
        </div>
      </main>
    `;

    const list = $('#list', root);
    const now = $('#now', root);
    const playBtn = $('#play', root);
    let playing = false;

    const render = () => {
      list.innerHTML = '';
      this.songs.forEach((s, i) => {
        const row = document.createElement('div');
        row.className = 'music-row' + (this.current === i ? ' active' : '');
        row.innerHTML = `<span>${i + 1}. ${s.title}</span><span>${s.artist}</span><span>${s.duration}</span>`;
        row.addEventListener('dblclick', () => { this.current = i; playing = true; playBtn.textContent = '⏸'; update(); });
        list.appendChild(row);
      });
    };

    const update = () => {
      render();
      now.textContent = this.current !== null ? `${this.songs[this.current].title} — ${this.songs[this.current].artist}` : 'Select a song';
    };

    playBtn.addEventListener('click', () => {
      if (this.current === null) this.current = 0;
      playing = !playing;
      playBtn.textContent = playing ? '⏸' : '▶';
      update();
    });

    $('#prev', root).addEventListener('click', () => { if (this.current > 0) this.current--; update(); });
    $('#next', root).addEventListener('click', () => { if (this.current < this.songs.length - 1) this.current++; update(); });

    update();
    return root;
  }
}

registerApp(new MusicApp());
