import { useEffect, useRef, useState, type ChangeEvent } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  art: string; // emoji glyph
}

const SAMPLE_TRACKS: Track[] = [
  { id: 't1', title: 'Sunrise Drive', artist: 'Pacific Echo', album: 'Coastline', durationSec: 214, art: '🌅' },
  { id: 't2', title: 'Nightfall', artist: 'Lumen', album: 'After Hours', durationSec: 268, art: '🌙' },
  { id: 't3', title: 'Forest Loop', artist: 'Greenwood', album: 'Trails', durationSec: 192, art: '🌲' },
  { id: 't4', title: 'Skyline', artist: 'Hiro', album: 'Tokyo', durationSec: 233, art: '🏙️' },
  { id: 't5', title: 'Desert Wind', artist: 'Mira', album: 'Dunes', durationSec: 287, art: '🏜️' },
  { id: 't6', title: 'Rainfall', artist: 'Quiet Hours', album: 'Ambient II', durationSec: 312, art: '🌧️' },
];

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function Music(): JSX.Element {
  const [tracks] = useState<Track[]>(SAMPLE_TRACKS);
  const [activeId, setActiveId] = useState<string>(SAMPLE_TRACKS[0]!.id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // seconds within active track
  const intervalRef = useRef<number | null>(null);

  const active = tracks.find((t) => t.id === activeId) ?? tracks[0]!;

  useEffect(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!isPlaying) return undefined;
    intervalRef.current = window.setInterval(() => {
      setPosition((p) => {
        const next = p + 1;
        if (next >= active.durationSec) {
          // Advance to next track.
          const idx = tracks.findIndex((t) => t.id === activeId);
          const nextTrack = tracks[(idx + 1) % tracks.length]!;
          setActiveId(nextTrack.id);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, active, activeId, tracks]);

  const handleSelect = (id: string): void => {
    setActiveId(id);
    setPosition(0);
    setIsPlaying(true);
  };

  const handlePlayPause = (): void => {
    setIsPlaying((p) => !p);
  };

  const handlePrev = (): void => {
    const idx = tracks.findIndex((t) => t.id === activeId);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length]!;
    setActiveId(prev.id);
    setPosition(0);
  };

  const handleNext = (): void => {
    const idx = tracks.findIndex((t) => t.id === activeId);
    const next = tracks[(idx + 1) % tracks.length]!;
    setActiveId(next.id);
    setPosition(0);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>): void => {
    const v = Number(e.target.value);
    setPosition(v);
  };

  return (
    <div className="music-root">
      <div className="app-toolbar">
        <span className="app-toolbar__title">Library</span>
        <span className="app-toolbar__spacer" />
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {tracks.length} tracks
        </span>
      </div>

      <div className="music-library">
        <div className="music-section-title">Recently Added</div>
        {tracks.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`music-track-row${t.id === activeId ? ' music-track-row--active' : ''}`}
            onClick={() => handleSelect(t.id)}
            style={{ background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
          >
            <div className="music-track-row__art">{t.art}</div>
            <div className="music-track-row__title">{t.title}</div>
            <div className="music-track-row__artist">{t.artist}</div>
            <div style={{ width: 40, textAlign: 'right', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {formatTime(t.durationSec)}
            </div>
          </button>
        ))}
      </div>

      <div className="music-progress">
        <span className="music-progress__time">{formatTime(position)}</span>
        <input
          type="range"
          className="music-progress__bar"
          min={0}
          max={active.durationSec}
          value={position}
          onChange={handleSeek}
          aria-label="Seek"
        />
        <span className="music-progress__time">{formatTime(active.durationSec)}</span>
      </div>

      <div className="music-now-playing">
        <div className="music-now-playing__art">{active.art}</div>
        <div className="music-now-playing__meta">
          <div className="music-now-playing__title">{active.title}</div>
          <div className="music-now-playing__artist">
            {active.artist} — {active.album}
          </div>
        </div>
        <div className="music-controls">
          <button
            type="button"
            className="music-control-btn"
            onClick={handlePrev}
            aria-label="Previous track"
            title="Previous"
          >
            ⏮
          </button>
          <button
            type="button"
            className="music-control-btn music-control-btn--play"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="music-control-btn"
            onClick={handleNext}
            aria-label="Next track"
            title="Next"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
}

export default Music;
