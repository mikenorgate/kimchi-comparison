import { useState } from 'react';

interface Track { id: string; title: string; artist: string; duration: string; gradient: string; }

const SEED_TRACKS: Track[] = [
  { id: 'tr1', title: 'Midnight Drive', artist: 'Neon Skyline', duration: '3:42', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'tr2', title: 'Ocean Breeze', artist: 'Coastal Dreams', duration: '4:15', gradient: 'linear-gradient(135deg, #00b4db, #0083b0)' },
  { id: 'tr3', title: 'Golden Sunset', artist: 'Horizon', duration: '3:28', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'tr4', title: 'Forest Echo', artist: 'Green Vale', duration: '5:02', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'tr5', title: 'City Lights', artist: 'Urban Pulse', duration: '3:55', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { id: 'tr6', title: 'Starlight', artist: 'Cosmic Wave', duration: '4:30', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
];

export function Music({ appId: _appId }: { appId: string }) {
  const [playing, setPlaying] = useState<Track | null>(SEED_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const playTrack = (track: Track) => { setPlaying(track); setIsPlaying(true); setProgress(0); };
  const togglePlay = () => { if (playing) setIsPlaying(!isPlaying); };
  const next = () => { if (!playing) return; const idx = SEED_TRACKS.findIndex(t => t.id === playing.id); setPlaying(SEED_TRACKS[(idx + 1) % SEED_TRACKS.length]); setProgress(0); };
  const prev = () => { if (!playing) return; const idx = SEED_TRACKS.findIndex(t => t.id === playing.id); setPlaying(SEED_TRACKS[(idx - 1 + SEED_TRACKS.length) % SEED_TRACKS.length]); setProgress(0); };

  return (
    <div className="flex h-full w-full" data-testid="music-root">
      <div className="flex-1 overflow-y-auto p-3" data-testid="music-library">
        <div className="text-sm font-semibold text-black/40 dark:text-white/40 uppercase mb-2 px-1">Library</div>
        {SEED_TRACKS.map((track) => (
          <button
            key={track.id}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
              playing?.id === track.id ? 'bg-[#0a84ff]/15' : 'hover:bg-black/3 dark:hover:bg-white/3'
            }`}
            onClick={() => playTrack(track)}
            data-testid={`music-track-${track.id}`}
          >
            <div className="w-10 h-10 rounded-lg shadow-md shrink-0" style={{ background: track.gradient }} />
            <div className="flex-1 min-w-0 text-left">
              <div className={`text-sm truncate ${playing?.id === track.id ? 'text-[#0a84ff] font-medium' : 'text-black/80 dark:text-white/80'}`}>{track.title}</div>
              <div className="text-xs text-black/40 dark:text-white/40 truncate">{track.artist}</div>
            </div>
            <span className="text-xs text-black/30 dark:text-white/30">{track.duration}</span>
          </button>
        ))}
      </div>
      <div className="w-56 shrink-0 border-l border-black/5 dark:border-white/5 flex flex-col items-center justify-center p-4 gap-3" data-testid="music-player">
        {playing && (
          <>
            <div className="w-32 h-32 rounded-2xl shadow-xl" style={{ background: playing.gradient }} data-testid="music-artwork" />
            <div className="text-center">
              <div className="text-sm font-medium text-black/80 dark:text-white/80">{playing.title}</div>
              <div className="text-xs text-black/40 dark:text-white/40">{playing.artist}</div>
            </div>
            <div className="w-full h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-[#0a84ff] transition-all" style={{ width: `${progress}%` }} data-testid="music-progress" />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={prev} className="text-black/60 dark:text-white/60 text-lg" data-testid="music-prev">⏮</button>
              <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#0a84ff] text-white flex items-center justify-center text-lg" data-testid="music-play">{isPlaying ? '⏸' : '▶'}</button>
              <button onClick={next} className="text-black/60 dark:text-white/60 text-lg" data-testid="music-next">⏭</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
