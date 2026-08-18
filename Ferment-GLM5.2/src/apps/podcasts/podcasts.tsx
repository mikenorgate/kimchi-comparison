import { useState, useRef, useEffect, useCallback } from 'react'

export interface PodcastShow {
  id: string
  title: string
  author: string
  description: string
  episodes: PodcastEpisode[]
}

export interface PodcastEpisode {
  id: string
  showId: string
  title: string
  duration: number
  date: string
  description: string
}

const SUBSCRIPTIONS_KEY = 'tahoe.podcasts-subscriptions'
const PROGRESS_KEY = 'tahoe.podcasts-progress'

const SAMPLE_SHOWS: PodcastShow[] = [
  {
    id: 'ps1',
    title: 'Tech Today',
    author: 'Daily Tech',
    description: 'Your daily dose of technology news.',
    episodes: [
      { id: 'ps1e1', showId: 'ps1', title: 'AI and the Future', duration: 2640, date: '2026-08-15', description: 'Exploring AI breakthroughs.' },
      { id: 'ps1e2', showId: 'ps1', title: 'The Cloud Wars', duration: 2380, date: '2026-08-14', description: 'Cloud providers battle it out.' },
      { id: 'ps1e3', showId: 'ps1', title: 'Quantum Computing 101', duration: 3120, date: '2026-08-13', description: 'A beginner-friendly intro.' },
    ],
  },
  {
    id: 'ps2',
    title: 'Mindful Moments',
    author: 'Wellness Daily',
    description: 'Daily meditation and mindfulness.',
    episodes: [
      { id: 'ps2e1', showId: 'ps2', title: 'Breathing Exercise', duration: 600, date: '2026-08-15', description: 'A 10-minute breathing exercise.' },
      { id: 'ps2e2', showId: 'ps2', title: 'Body Scan', duration: 900, date: '2026-08-14', description: 'Relax your body step by step.' },
      { id: 'ps2e3', showId: 'ps2', title: 'Morning Calm', duration: 720, date: '2026-08-13', description: 'Start your day peacefully.' },
    ],
  },
  {
    id: 'ps3',
    title: 'History Uncovered',
    author: 'Time Travels',
    description: 'Untold stories from the past.',
    episodes: [
      { id: 'ps3e1', showId: 'ps3', title: 'The Lost City', duration: 3360, date: '2026-08-15', description: 'Discovering ancient ruins.' },
      { id: 'ps3e2', showId: 'ps3', title: 'Voices of Revolution', duration: 2940, date: '2026-08-14', description: 'Firsthand accounts of change.' },
      { id: 'ps3e3', showId: 'ps3', title: 'Forgotten Empires', duration: 3180, date: '2026-08-13', description: 'Civilizations lost to time.' },
    ],
  },
  {
    id: 'ps4',
    title: 'The Startup Story',
    author: 'Venture Lab',
    description: 'How great companies were built.',
    episodes: [
      { id: 'ps4e1', showId: 'ps4', title: 'From Garage to Global', duration: 2760, date: '2026-08-15', description: 'The origin story of a tech giant.' },
      { id: 'ps4e2', showId: 'ps4', title: 'Pivot or Perish', duration: 2520, date: '2026-08-14', description: 'When changing direction saves the company.' },
      { id: 'ps4e3', showId: 'ps4', title: 'The Pitch', duration: 2280, date: '2026-08-13', description: 'What makes investors say yes.' },
    ],
  },
]

function loadSubscriptions(): Set<string> {
  try {
    const s = localStorage.getItem(SUBSCRIPTIONS_KEY)
    return s ? new Set(JSON.parse(s)) : new Set()
  } catch { return new Set() }
}

function persistSubscriptions(subs: Set<string>) {
  try { localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify([...subs])) } catch { /* ignore */ }
}

function loadProgress(): Record<string, number> {
  try {
    const s = localStorage.getItem(PROGRESS_KEY)
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

function persistProgress(progress: Record<string, number>) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)) } catch { /* ignore */ }
}

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function Podcasts({ windowId: _windowId }: { windowId: string }) {
  const [shows] = useState<PodcastShow[]>(SAMPLE_SHOWS)
  const [subscriptions, setSubscriptions] = useState<Set<string>>(loadSubscriptions)
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null)
  const [playingEpisode, setPlayingEpisode] = useState<PodcastEpisode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [progress, setProgress] = useState<Record<string, number>>(loadProgress)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const positionRef = useRef(0)
  positionRef.current = position

  useEffect(() => {
    persistSubscriptions(subscriptions)
  }, [subscriptions])

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

  const subscribedShows = shows.filter((s) => subscriptions.has(s.id))
  const browseShows = shows

  const selectedShow = shows.find((s) => s.id === selectedShowId)

  const playEpisode = useCallback((episode: PodcastEpisode) => {
    setPlayingEpisode(episode)
    const savedPos = progress[episode.id] ?? 0
    const startPos = savedPos >= episode.duration ? 0 : savedPos
    setPosition(startPos)
    positionRef.current = startPos
    setIsPlaying(true)
  }, [progress])

  const togglePlay = useCallback(() => {
    if (playingEpisode && position >= playingEpisode.duration) {
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

  const toggleSubscribe = useCallback((showId: string) => {
    setSubscriptions((prev) => {
      const next = new Set(prev)
      if (next.has(showId)) next.delete(showId)
      else next.add(showId)
      return next
    })
  }, [])

  const skip = useCallback((direction: number) => {
    if (!playingEpisode) return
    const show = shows.find((s) => s.id === playingEpisode.showId)
    if (!show) return
    const idx = show.episodes.findIndex((e) => e.id === playingEpisode.id)
    const nextIdx = idx + direction
    if (nextIdx >= 0 && nextIdx < show.episodes.length) {
      const ep = show.episodes[nextIdx]
      setProgress((prev) => ({ ...prev, [playingEpisode.id]: positionRef.current }))
      playEpisode(ep)
    }
  }, [playingEpisode, shows, playEpisode])

  return (
    <div data-testid="podcasts-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div data-testid="podcasts-sidebar" style={{ width: 200, borderRight: '0.5px solid var(--glass-border)', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px 4px', textTransform: 'uppercase' }}>Library</div>
          <button
            data-testid="view-browse"
            onClick={() => { setSelectedShowId(null) }}
            style={sidebarBtn(selectedShowId === null)}
          >
            Browse
          </button>
          {subscribedShows.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px 4px', marginTop: 4, textTransform: 'uppercase' }}>Subscriptions</div>
              {subscribedShows.map((show) => (
                <button
                  key={show.id}
                  data-testid={`sub-show-${show.id}`}
                  onClick={() => setSelectedShowId(show.id)}
                  style={sidebarBtn(selectedShowId === show.id)}
                >
                  {show.title}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {selectedShow ? (
            /* Show detail with episodes */
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, background: `hsl(${selectedShow.id.charCodeAt(2) * 40}, 60%, 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontSize: 32, fontWeight: 700 }}>{selectedShow.title[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 data-testid="podcast-title" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{selectedShow.title}</h2>
                  <div data-testid="podcast-author" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedShow.author}</div>
                  <div data-testid="podcast-description" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{selectedShow.description}</div>
                  <button
                    data-testid="subscribe-btn"
                    onClick={() => toggleSubscribe(selectedShow.id)}
                    style={{
                      marginTop: 8,
                      padding: '4px 16px',
                      border: 'none',
                      borderRadius: 16,
                      background: subscriptions.has(selectedShow.id) ? 'var(--glass-bg)' : 'var(--accent-blue)',
                      color: subscriptions.has(selectedShow.id) ? 'var(--text-primary)' : 'white',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {subscriptions.has(selectedShow.id) ? '✓ Subscribed' : '+ Subscribe'}
                  </button>
                </div>
              </div>
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
                      <div data-testid={`episode-icon-${ep.id}`} style={{ fontSize: 16, color: watched ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                        {watched ? '✓' : '▶'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{ep.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ep.description}</div>
                        {partiallyWatched && (
                          <div data-testid={`episode-resume-${ep.id}`} style={{ fontSize: 10, color: 'var(--accent-blue)', marginTop: 2 }}>
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
            /* Browse view */
            <div style={{ padding: 16 }}>
              <div data-testid="podcasts-browse" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Browse Podcasts</div>
              <div data-testid="shows-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {browseShows.map((show) => (
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
                    <div style={{ height: 100, background: `hsl(${show.id.charCodeAt(2) * 40}, 60%, 45%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{show.title[0]}</span>
                    </div>
                    <div style={{ padding: '6px 8px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{show.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{show.author}</div>
                      {subscriptions.has(show.id) && (
                        <div data-testid={`sub-badge-${show.id}`} style={{ fontSize: 9, color: 'var(--accent-blue)', marginTop: 2 }}>✓ Subscribed</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Now playing bar */}
      <div data-testid="now-playing" style={{ borderTop: '0.5px solid var(--glass-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'var(--glass-bg)' }}>
        <div style={{ minWidth: 120, flexShrink: 0 }}>
          {playingEpisode ? (
            <>
              <div data-testid="np-title" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{playingEpisode.title}</div>
              <div data-testid="np-show" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {shows.find((s) => s.id === playingEpisode.showId)?.title}
              </div>
            </>
          ) : (
            <div data-testid="np-title" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Not Playing</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <button data-testid="btn-prev" onClick={() => skip(-1)} disabled={!playingEpisode} style={ctrlBtn(!!playingEpisode)}>⏮</button>
          <button data-testid="btn-play" onClick={togglePlay} disabled={!playingEpisode} style={{ ...ctrlBtn(!!playingEpisode), fontSize: 16 }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button data-testid="btn-next" onClick={() => skip(1)} disabled={!playingEpisode} style={ctrlBtn(!!playingEpisode)}>⏭</button>
          <span data-testid="np-position" style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'SF Mono, monospace', minWidth: 36 }}>
            {formatTime(position)}
          </span>
          <input
            data-testid="seek-bar"
            type="range"
            min={0}
            max={playingEpisode?.duration ?? 0}
            value={position}
            onChange={handleSeek}
            disabled={!playingEpisode}
            style={{ flex: 1, accentColor: 'var(--accent-blue)' }}
          />
          <span data-testid="np-duration" style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'SF Mono, monospace', minWidth: 36 }}>
            {playingEpisode ? formatTime(playingEpisode.duration) : '0:00'}
          </span>
        </div>
      </div>
    </div>
  )
}

const sidebarBtn = (active: boolean): React.CSSProperties => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '5px 12px',
  border: 'none',
  background: active ? 'var(--accent-blue)' : 'transparent',
  color: active ? 'white' : 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 13,
})

const ctrlBtn = (enabled: boolean): React.CSSProperties => ({
  border: 'none',
  background: 'transparent',
  color: enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 14,
  opacity: enabled ? 1 : 0.4,
  padding: '2px 6px',
})
