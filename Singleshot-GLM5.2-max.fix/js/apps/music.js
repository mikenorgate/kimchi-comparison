// Music — player UI with Web Audio synth tones for "preview" playback.
import { glyph } from '../icons.js';
import { getState, bus } from '../store.js';

export const windowConfig = { width: 820, height: 520 };

const TRACKS = [
  { n:1, title:'Midnight Drive',     artist:'Neon Pulse',     dur:'3:42', key:220, type:'sine' },
  { n:2, title:'Liquid Glass',       artist:'Tahoe Dreams',   dur:'4:18', key:261.63, type:'sine' },
  { n:3, title:'Crystal Clear',      artist:'Aurora',         dur:'3:05', key:293.66, type:'triangle' },
  { n:4, title:'Ocean Breeze',       artist:'Coastal',       dur:'5:12', key:329.63, type:'sine' },
  { n:5, title:'Mountain High',      artist:'Summit',         dur:'4:44', key:392, type:'triangle' },
  { n:6, title:'Electric Sunset',    artist:'Horizon',       dur:'3:28', key:440, type:'sine' },
  { n:7, title:'Deep Focus',         artist:'Ambient Co.',    dur:'6:01', key:174.61, type:'sine' },
  { n:8, title:'Golden Hour',        artist:'Daylight',       dur:'3:55', key:349.23, type:'triangle' },
  { n:9, title:'Starlight',          artist:'Nocturne',       dur:'4:30', key:233.08, type:'sine' },
];

let audioCtx = null;
let osc = null, gain = null;
let playing = null;
let progress = 0;
let timer = null;

export function mount(el) {
  el.innerHTML = `
    <div class="music-root">
      <div class="sidebar scroll" style="width:180px">
        <div class="sb-h">Apple Music</div>
        <div class="sb-item sel">${glyph('play',15)}<span>Listen Now</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Browse</span></div>
        <div class="sb-item">${glyph('tag',15)}<span>Radio</span></div>
        <div class="sb-h">Library</div>
        <div class="sb-item">${glyph('clock',15)}<span>Recently Added</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Artists</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Albums</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Songs</span></div>
        <div class="sb-h">Playlists</div>
        <div class="sb-item">${glyph('star',15)}<span>Chill Vibes</span></div>
        <div class="sb-item">${glyph('star',15)}<span>Focus</span></div>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div style="padding:14px 18px 6px;font-size:18px;font-weight:700">Songs</div>
        <div class="music-list scroll" data-list></div>
        <div class="music-bar" data-bar>
          <div class="mb-art" style="background:linear-gradient(135deg,#ff5a6e,#b02050)">♪</div>
          <div class="mb-info"><b data-nowtitle>Not Playing</b><span data-nowartist></span></div>
          <div class="mb-btns">
            <div data-act="prev">${glyph('skipPrev',22)}</div>
            <div data-act="play">${glyph('play',26)}</div>
            <div data-act="next">${glyph('skipNext',22)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
  const list = el.querySelector('[data-list]');
  list.innerHTML = TRACKS.map(t => `
    <div class="music-track" data-id="${t.n}">
      <span class="mt-num">${t.n}</span>
      <span class="mt-title">${t.title}</span>
      <span style="opacity:.5">${t.artist}</span>
      <span class="mt-dur">${t.dur}</span>
    </div>
  `).join('');
  const playBtn = el.querySelector('[data-act="play"]');
  list.querySelectorAll('.music-track').forEach(row => {
    row.addEventListener('click', () => {
      const t = TRACKS.find(x => x.n === +row.dataset.id);
      if (playing && playing.n === t.n) { pause(el); return; }
      play(el, t);
    });
  });
  el.querySelector('[data-act="play"]').addEventListener('click', () => {
    if (!playing) { if (TRACKS[0]) play(el, TRACKS[0]); return; }
    if (osc) pause(el); else play(el, playing);
  });
  el.querySelector('[data-act="next"]').addEventListener('click', () => {
    if (!playing) return; const idx = TRACKS.findIndex(t => t.n === playing.n); const nx = TRACKS[(idx+1)%TRACKS.length]; play(el, nx);
  });
  el.querySelector('[data-act="prev"]').addEventListener('click', () => {
    if (!playing) return; const idx = TRACKS.findIndex(t => t.n === playing.n); const pv = TRACKS[(idx-1+TRACKS.length)%TRACKS.length]; play(el, pv);
  });

  function play(el, t) {
    if (osc) { try { osc.stop(); } catch {} osc = null; }
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    osc = audioCtx.createOscillator();
    gain = audioCtx.createGain();
    osc.type = t.type || 'sine';
    osc.frequency.value = t.key;
    gain.gain.value = 0;
    osc.connect(gain); gain.connect(audioCtx.destination);
    const s = getState();
    const vol = (s.volume / 100) * 0.12;
    gain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.05);
    osc.start();
    playing = t; progress = 0;
    el.querySelector('[data-nowtitle]').textContent = t.title;
    el.querySelector('[data-nowartist]').textContent = t.artist;
    playBtn.innerHTML = glyph('pause', 26);
    list.querySelectorAll('.music-track').forEach(r => r.classList.toggle('playing', +r.dataset.id === t.n));
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      progress += 1;
      const total = parseDur(t.dur);
      if (progress >= total) { const idx = TRACKS.findIndex(x => x.n === t.n); play(el, TRACKS[(idx+1)%TRACKS.length]); }
    }, 1000);
  }
  function pause(el) {
    if (gain) gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    setTimeout(() => { try { osc?.stop(); } catch {} osc = null; }, 100);
    playBtn.innerHTML = glyph('play', 26);
    if (timer) { clearInterval(timer); timer = null; }
  }
}

function parseDur(d) { const [m,s] = d.split(':').map(Number); return m*60+s; }

// volume changes from control center
bus.on('audio:volume', (v) => {
  if (gain && audioCtx) gain.gain.setTargetAtTime((v/100)*0.12, audioCtx.currentTime, 0.05);
});
