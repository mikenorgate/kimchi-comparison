import { useState, useRef, useEffect, useCallback } from 'react'

export interface Show {
  id: string
  title: string
  genre: string
  episodes: Episode[]
}

export interface Episode {
  id: string
  title: string
  season: number
  episode: number
  duration: number // seconds
  description: string
}

const WATCH_PROGRESS_KEY = 'tahoe.tv-progress'

const SAMPLE_SHOWS: Show[] = [
  {
    id: 's1',
    title: 'The Horizon',
    genre: 'Drama',
    episodes: [
      { id: 's1e1', title: 'Pilot', season: 1, episode: 1, duration: 2840, description: 'A new beginning.' },
      { id: 's1e2', title: 'The Journey', season: 1, episode: 2, duration: 2680, description: 'The team sets out.' },
      { id: 's1e3', title: 'Crossroads', season: 1, episode: 3, duration: 2920, description: 'A difficult choice.' },
    ],
  },
  {
    id: 's2',
    title: 'City Nights',
    genre: 'Comedy',
    episodes: [
      { id: 's2e1', title: 'Pilot', season: 1, episode: 1, duration: 1820, description: 'Welcome to the city.' },
      { id: 's2e2', title: 'Roommates', season: 1, episode: 2, duration: 1740, description: 'Living together.' },
      { id: 's2e3', title: 'The Party', season: 1, episode: 3, duration: 1900, description: 'A night to remember.' },
    ],
  },
  {
    id: 's3',
    title: 'Deep Space',
    genre: 'Sci-Fi',
    episodes: [
      { id: 's3e1', title: 'Awakening', season: 1, episode: 1, duration: 3120, description: 'Far from home.' },
      { id: 's3e2', title: 'First Contact', season: 1, episode: 2, duration: 2980, description: 'We are not alone.' },
      { id: 's3e3', title: 'The Signal', season: 1, episode: 3, duration: 3040, description: 'A mysterious message.' },
    ],
  },
]

function loadProgress(): Record<string, number> {
  try {
    const s = localStorage.getItem(WATCH_PROGRESS_KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

function persistProgress(progress: Record<string, number>) {
  try { localStorage.setItem(WATCH_PROGRESS_KEY, JSON.stringify(progress)) } catch { /* ignore */ }
}

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function TV({ windowId: _windowId }: { windowId: string }) {
  const [shows] = useState<Show[]>(SAMPLE_SHOWS)
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null)
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [progress, setProgress] = useState<Record<string, number>>(loadProgress)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const positionRef = useRef(0)
  positionRef.current = position

  useEffect(() => {
    persistProgress(progress)
  }, [progress])

  // Simulate playback
  useEffect(() => {
    if (!isPlaying || !playingEpisode) return
    intervalRef.current = setInterval(() => {
      const next = positionRef.current + 1
      if (playingEpisode && next >= playingEpisode.duration) {
        setProgress((prev) => ({ ...prev, [playingEpisode.id]: playingEpisode.duration }))
        setIsPlaying(false)
        setPosition(playingEpisode.duration)
        positionRef.current = playingEpisode.duration
        return
      }
      setPosition(next)
      positionRef.current = next
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, playingEpisode])

  const selectedShow = shows.find((s) => s.id === selectedShowId)

  const playEpisode = useCallback((episode: Episode) => {
    setPlayingEpisode(episode)
    const savedPos = progress[episode.id] ?? 0
    const startPos = savedPos >= episode.duration ? 0 : savedPos
    setPosition(startPos)
    positionRef.current = startPos
    setIsPlaying(true)
  }, [progress])

  const togglePlay = useCallback(() => {
    if (playingEpisode && position >= playingEpisode.duration) {
      // Restart if finished
      setPosition(0)
      positionRef.current = 0
      setIsPlaying(true)
      return
    }
    setIsPlaying((p) => !p)
  }, [playingEpisode, position])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setPosition(val)
    positionRef.current = val
  }, [])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f)
  }, [])

  // Save progress when switching away
  const closePlayer = useCallback(() => {
    if (playingEpisode) {
      const pos = positionRef.current
      setProgress((prev) => ({ ...prev, [playingEpisode.id]: pos }))
    }
    setIsPlaying(false)
    setPlayingEpisode(null)
    setPosition(0)
    positionRef.current = 0
    setIsFullscreen(false)
  }, [playingEpisode])

  return (
    <div data-testid="tv-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar — show list */}
      <div data-testid="tv-sidebar" style={{ width: 200, borderRight: '0.5px solid var(--glass-border)', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px 4px', textTransform: 'uppercase' }}>Library</div>
        {shows.map((show) => (
          <button
            key={show.id}
            data-testid={`show-${show.id}`}
            onClick={() => setSelectedShowId(show.id)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              border: 'none',
              background: selectedShowId === show.id ? 'var(--accent-blue)' : 'transparent',
              color: selectedShowId === show.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600 }}>{show.title}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>{show.genre} · {show.episodes.length} episodes</div>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {playingEpisode ? (
          /* Player view */
          <div
            data-testid="tv-player"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: isFullscreen ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.8)',
              position: isFullscreen ? 'absolute' as const : 'relative' as const,
              inset: isFullscreen ? 0 : 'auto',
              zIndex: isFullscreen ? 200 : 'auto',
            }}
          >
            {/* Video area (simulated) */}
            <div
              data-testid="tv-video-area"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}
              onClick={togglePlay}
            >
              <div data-testid="tv-video-placeholder" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: 48 }}>{isPlaying ? '▶' : '⏸'}</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>{playingEpisode.title}</div>
              </div>
            </div>

            {/* Controls bar */}
            <div data-testid="tv-controls" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <button data-testid="tv-back" onClick={closePlayer} style={playerBtn}>‹ Library</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span data-testid="tv-position" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'SF Mono, monospace', minWidth: 40 }}>
                  {formatTime(position)}
                </span>
                <input
                  data-testid="tv-seek"
                  type="range"
                  min={0}
                  max={playingEpisode.duration}
                  value={position}
                  onChange={handleSeek}
                  style={{ flex: 1, accentColor: 'var(--accent-blue)' }}
                />
                <span data-testid="tv-duration" style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'SF Mono, monospace', minWidth: 40 }}>
                  {formatTime(playingEpisode.duration)}
                </span>
              </div>
              <button data-testid="tv-play" onClick={togglePlay} style={playerBtn}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button data-testid="tv-fullscreen" onClick={toggleFullscreen} style={playerBtn}>
                {isFullscreen ? '⤓' : '⤢'}
              </button>
            </div>
          </div>
        ) : selectedShow ? (
          /* Episode list */
          <div style={{ padding: 16 }}>
            <h2 data-testid="show-title" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{selectedShow.title}</h2>
            <div data-testid="show-genre" style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{selectedShow.genre}</div>
            <div data-testid="episode-list" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selectedShow.episodes.map((ep) => {
                const epProgress = progress[ep.id] ?? 0
                const watched = epProgress >= ep.duration
                const partiallyWatched = epProgress > 0 && epProgress < ep.duration
                return (
                  <button
                    key={ep.id}
                    data-testid={`episode-${ep.id}`}
                    onClick={() => playEpisode(ep)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      border: '0.5px solid var(--glass-border)',
                      borderRadius: 8,
                      background: 'var(--glass-bg)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div data-testid={`episode-icon-${ep.id}`} style={{ fontSize: 20, color: watched ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                      {watched ? '✓' : '▶'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        S{ep.season} E{ep.episode} — {ep.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ep.description}</div>
                      {partiallyWatched && (
                        <div data-testid={`episode-progress-${ep.id}`} style={{ fontSize: 10, color: 'var(--accent-blue)', marginTop: 2 }}>
                          Resume at {formatTime(epProgress)}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'SF Mono, monospace' }}>
                      {formatTime(ep.duration)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Shows grid */
          <div style={{ padding: 16 }}>
            <div data-testid="tv-welcome" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>TV Shows</div>
            <div data-testid="shows-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {shows.map((show) => (
                <div
                  key={show.id}
                  data-testid={`show-card-${show.id}`}
                  onClick={() => setSelectedShowId(show.id)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '0.5px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                  }}
                >
                  <div style={{ height: 100, background: `hsl(${show.id.charCodeAt(1) * 50}, 60%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{show.title[0]}</span>
                  </div>
                  <div style={{ padding: '6px 8px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{show.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{show.episodes.length} episodes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const playerBtn: React.CSSProperties = {
  border: 'none',
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  cursor: 'pointer',
  fontSize: 14,
  padding: '4px 10px',
  borderRadius: 6,
}
