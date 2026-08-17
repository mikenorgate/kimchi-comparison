'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music2 } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
  color: string;
}

const SONGS: Song[] = [
  { id: '1', title: 'Sierra Sunrise', artist: 'Tahoe Collective', duration: 214, color: '#f97316' },
  { id: '2', title: 'Pine Forest', artist: 'Echo Lake', duration: 184, color: '#22c55e' },
  { id: '3', title: 'Starlight Drive', artist: 'Neon Drift', duration: 245, color: '#8b5cf6' },
  { id: '4', title: 'Ocean Air', artist: 'Coastal', duration: 198, color: '#06b6d4' },
  { id: '5', title: 'Mountain Pass', artist: 'Alpine', duration: 222, color: '#64748b' },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function Music() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const song = SONGS[currentIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= song.duration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, song.duration]);

  const progressPercent = useMemo(
    () => (song.duration > 0 ? Math.min((progress / song.duration) * 100, 100) : 0),
    [progress, song.duration]
  );

  const togglePlay = () => setIsPlaying((p) => !p);

  const playSong = (index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    setIsPlaying(true);
  };

  const next = () => {
    setCurrentIndex((i) => (i + 1) % SONGS.length);
    setProgress(0);
  };

  const previous = () => {
    setCurrentIndex((i) => (i - 1 + SONGS.length) % SONGS.length);
    setProgress(0);
  };

  return (
    <div className="flex h-full w-full flex-col bg-background" data-testid="music">
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div
          data-testid="music-artwork"
          className="mb-6 flex h-48 w-48 items-center justify-center rounded-2xl shadow-lg"
          style={{ background: song.color }}
        >
          <Music2 className="h-16 w-16 text-white/90" />
        </div>
        <div data-testid="music-title" className="text-xl font-semibold">
          {song.title}
        </div>
        <div data-testid="music-artist" className="text-sm text-muted-foreground">
          {song.artist}
        </div>

        <div className="mt-6 w-full max-w-md space-y-2">
          <div
            data-testid="music-progress-track"
            className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-muted"
            onClick={() => setProgress(Math.min(progress + 10, song.duration))}
          >
            <div
              data-testid="music-progress-fill"
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span data-testid="music-current-time">{formatTime(progress)}</span>
            <span data-testid="music-duration">{formatTime(song.duration)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            data-testid="music-prev"
            onClick={previous}
            className="rounded-full p-2 hover:bg-accent"
          >
            <SkipBack className="h-6 w-6" />
          </button>
          <button
            data-testid="music-play-pause"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={togglePlay}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
          <button
            data-testid="music-next"
            onClick={next}
            className="rounded-full p-2 hover:bg-accent"
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 px-4 py-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Up Next
        </h3>
        <ul data-testid="music-song-list" className="space-y-1">
          {SONGS.map((s, index) => (
            <li key={s.id}>
              <button
                data-testid={`music-song-${s.id}`}
                onClick={() => playSong(index)}
                className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm transition-colors hover:bg-accent ${
                  index === currentIndex ? 'bg-accent/50 font-medium' : ''
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: s.color }}
                  />
                  {s.title}
                </span>
                <span className="text-xs text-muted-foreground">{formatTime(s.duration)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
