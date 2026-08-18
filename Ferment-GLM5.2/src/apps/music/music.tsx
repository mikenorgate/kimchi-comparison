import { useState, useRef, useEffect, useCallback } from 'react'

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number // seconds
}

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
}

const PLAYLISTS_KEY = 'tahoe.music-playlists'

const DEFAULT_TRACKS: Track[] = [
  { id: 't1', title: 'Morning Light', artist: 'Aurora Bay', album: 'Horizon', duration: 214 },
  { id: 't2', title: 'Electric Dreams', artist: 'Neon Pulse', album: 'Synthwave Nights', duration: 198 },
  { id: 't3', title: 'Mountain Trail', artist: 'The Wanderers', album: 'Open Roads', duration: 245 },
  { id: 't4', title: 'Ocean Breeze', artist: 'Marina', album: 'Tides', duration: 187 },
  { id: 't5', title: 'City Lights', artist: 'Urban Echo', album: 'Midnight', duration: 223 },
  { id: 't6', title: 'Desert Wind', artist: 'Sahara', album: 'Mirage', duration: 256 },
  { id: 't7', title: 'Rainy Day', artist: 'Cloud Nine', album: 'Weather', duration: 172 },
  { id: 't8', title: 'Starlight', artist: 'Cosmos', album: 'Galaxy', duration: 301 },
  { id: 't9', title: 'Autumn Leaves', artist: 'Amber', album: 'Seasons', duration: 209 },
  { id: 't10', title: 'Summer Jam', artist: 'Solar', album: 'Heatwave', duration: 191 },
]

function loadPlaylists(): Playlist[] {
  try {
    const s = localStorage.getItem(PLAYLISTS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function persistPlaylists(playlists: Playlist[]) {
  try { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists)) } catch { /* ignore */ }
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function Music({ windowId: _windowId }: { windowId: string }) {
  const [tracks] = useState<Track[]>(DEFAULT_TRACKS)
  const [playlists, setPlaylists] = useState<Playlist[]>(loadPlaylists)
  const [selectedView, setSelectedView] = useState<'library' | string>('library')
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0) // seconds
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showPlaylistInput, setShowPlaylistInput] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const positionRef = useRef(0)
  positionRef.current = position

  useEffect(() => {
    persistPlaylists(playlists)
  }, [playlists])

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying || !currentTrackId) return
    intervalRef.current = setInterval(() => {
      const track = tracks.find((t) => t.id === currentTrackId)
      const next = positionRef.current + 1
      if (track && next >= track.duration) {
        // Auto-advance to next track
        const idx = visibleTracksRef.current.findIndex((t) => t.id === currentTrackId)
        const nextIdx = (idx + 1) % visibleTracksRef.current.length
        if (visibleTracksRef.current[nextIdx]) {
          setCurrentTrackId(visibleTracksRef.current[nextIdx].id)
          setPosition(0)
          positionRef.current = 0
        }
        return
      }
      setPosition(next)
      positionRef.current = next
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, currentTrackId]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentTrack = tracks.find((t) => t.id === currentTrackId)

  const visibleTracks = selectedView === 'library'
    ? tracks
    : playlists.find((p) => p.id === selectedView)?.trackIds
        .map((id) => tracks.find((t) => t.id === id))
        .filter(Boolean) as Track[] ?? []

  const visibleTracksRef = useRef<Track[]>([])
  visibleTracksRef.current = visibleTracks

  const playTrack = useCallback((trackId: string) => {
    setCurrentTrackId(trackId)
    setPosition(0)
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback(() => {
    if (currentTrackId) setIsPlaying((p) => !p)
  }, [currentTrackId])

  const handleNext = useCallback(() => {
    if (!currentTrackId) return
    const idx = visibleTracks.findIndex((t) => t.id === currentTrackId)
    const nextIdx = (idx + 1) % visibleTracks.length
    if (visibleTracks[nextIdx]) {
      setCurrentTrackId(visibleTracks[nextIdx].id)
      setPosition(0)
    }
  }, [currentTrackId, visibleTracks])

  const handlePrev = useCallback(() => {
    if (!currentTrackId) return
    if (position > 3) {
      setPosition(0)
      return
    }
    const idx = visibleTracks.findIndex((t) => t.id === currentTrackId)
    const prevIdx = (idx - 1 + visibleTracks.length) % visibleTracks.length
    if (visibleTracks[prevIdx]) {
      setCurrentTrackId(visibleTracks[prevIdx].id)
      setPosition(0)
    }
  }, [currentTrackId, position, visibleTracks])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(parseFloat(e.target.value))
  }, [])

  const createPlaylist = useCallback(() => {
    const name = newPlaylistName.trim()
    if (!name) return
    const playlist: Playlist = { id: `pl-${Date.now()}`, name, trackIds: [] }
    setPlaylists((prev) => [...prev, playlist])
    setNewPlaylistName('')
    setShowPlaylistInput(false)
  }, [newPlaylistName])

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? { ...p, trackIds: [...p.trackIds, trackId] }
          : p
      )
    )
  }, [])

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) }
          : p
      )
    )
  }, [])

  const sidebarItem = (id: string): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: '5px 12px',
    border: 'none',
    background: selectedView === id ? 'var(--accent-blue)' : 'transparent',
    color: selectedView === id ? 'white' : 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: 13,
  })

  return (
    <div data-testid="music-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div data-testid="music-sidebar" style={{ width: 180, borderRight: '0.5px solid var(--glass-border)', padding: '8px 0', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '4px 12px', textTransform: 'uppercase' }}>Library</div>
          <button data-testid="view-library" onClick={() => setSelectedView('library')} style={sidebarItem('library')}>
            Songs {tracks.length > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>{tracks.length}</span>}
          </button>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '4px 12px', marginTop: 8, textTransform: 'uppercase' }}>Playlists</div>
          {playlists.map((pl) => (
            <button
              key={pl.id}
              data-testid={`playlist-${pl.id}`}
              onClick={() => setSelectedView(pl.id)}
              style={sidebarItem(pl.id)}
            >
              {pl.name} {pl.trackIds.length > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>{pl.trackIds.length}</span>}
            </button>
          ))}
          {showPlaylistInput ? (
            <div style={{ padding: '4px 12px' }}>
              <input
                data-testid="playlist-name-input"
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createPlaylist() }}
                placeholder="Playlist name…"
                autoFocus
                style={{ width: '100%', padding: '3px 6px', border: '0.5px solid var(--glass-border)', borderRadius: 4, background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
              <button data-testid="playlist-create" onClick={createPlaylist} style={{ marginTop: 4, fontSize: 11, padding: '2px 8px', cursor: 'pointer', border: '0.5px solid var(--glass-border)', borderRadius: 4, background: 'var(--accent-blue)', color: 'white' }}>
                Create
              </button>
            </div>
          ) : (
            <button data-testid="playlist-add" onClick={() => setShowPlaylistInput(true)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 12px', border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 13 }}>
              + New Playlist
            </button>
          )}
        </div>

        {/* Track list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table data-testid="music-tracklist" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Artist</th>
                <th style={thStyle}>Album</th>
                <th style={thStyle}>Duration</th>
                {selectedView !== 'library' && <th style={thStyle}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleTracks.length === 0 ? (
                <tr><td colSpan={selectedView !== 'library' ? 6 : 5} data-testid="music-empty" style={{ ...tdStyle, textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                  No tracks
                </td></tr>
              ) : (
                visibleTracks.map((track, i) => (
                  <tr
                    key={track.id}
                    data-testid={`track-${track.id}`}
                    onClick={() => playTrack(track.id)}
                    onDoubleClick={() => playTrack(track.id)}
                    style={{
                      cursor: 'pointer',
                      background: currentTrackId === track.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                    }}
                  >
                    <td style={tdStyle}>{currentTrackId === track.id && isPlaying ? '▶' : i + 1}</td>
                    <td style={{ ...tdStyle, fontWeight: currentTrackId === track.id ? 600 : 400 }}>{track.title}</td>
                    <td style={tdStyle}>{track.artist}</td>
                    <td style={tdStyle}>{track.album}</td>
                    <td style={tdStyle}>{formatTime(track.duration)}</td>
                    {selectedView !== 'library' && (
                      <td style={tdStyle}>
                        <button
                          data-testid={`remove-from-${track.id}`}
                          onClick={(e) => { e.stopPropagation(); removeFromPlaylist(selectedView, track.id) }}
                          style={{ border: 'none', background: 'transparent', color: '#ff5f57', cursor: 'pointer', fontSize: 14 }}
                        >✕</button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Add to playlist buttons when in library view */}
          {selectedView === 'library' && playlists.length > 0 && (
            <div style={{ padding: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
              Right-click a track to add to playlist. Or click a track's + button.
            </div>
          )}
          {selectedView === 'library' && playlists.length > 0 && tracks.slice(0, 3).map((track) => (
            <div key={`add-${track.id}`} style={{ padding: '2px 12px', display: 'flex', gap: 4 }}>
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  data-testid={`add-${track.id}-to-${pl.id}`}
                  onClick={() => addToPlaylist(pl.id, track.id)}
                  style={{ fontSize: 10, padding: '1px 6px', border: '0.5px solid var(--glass-border)', borderRadius: 3, background: 'var(--glass-bg)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  + {pl.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Now-playing bar */}
      <div data-testid="now-playing" style={{ borderTop: '0.5px solid var(--glass-border)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'var(--glass-bg)' }}>
        {/* Track info */}
        <div style={{ minWidth: 120, flexShrink: 0 }}>
          {currentTrack ? (
            <>
              <div data-testid="np-title" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{currentTrack.title}</div>
              <div data-testid="np-artist" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{currentTrack.artist}</div>
            </>
          ) : (
            <div data-testid="np-title" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Not Playing</div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button data-testid="btn-prev" onClick={handlePrev} disabled={!currentTrackId} style={ctrlBtn(!!currentTrackId)}>⏮</button>
            <button data-testid="btn-play" onClick={togglePlay} disabled={!currentTrackId} style={{ ...ctrlBtn(!!currentTrackId), fontSize: 18 }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button data-testid="btn-next" onClick={handleNext} disabled={!currentTrackId} style={ctrlBtn(!!currentTrackId)}>⏭</button>
          </div>
          {/* Seek bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 400 }}>
            <span data-testid="np-position" style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'SF Mono, monospace', minWidth: 32 }}>
              {formatTime(position)}
            </span>
            <input
              data-testid="seek-bar"
              type="range"
              min={0}
              max={currentTrack?.duration ?? 0}
              value={position}
              onChange={handleSeek}
              disabled={!currentTrackId}
              style={{ flex: 1, accentColor: 'var(--accent-blue)' }}
            />
            <span data-testid="np-duration" style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'SF Mono, monospace', minWidth: 32 }}>
              {currentTrack ? formatTime(currentTrack.duration) : '0:00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-secondary)',
  padding: '4px 8px',
  borderBottom: '1px solid var(--glass-border)',
}

const tdStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--text-primary)',
  padding: '3px 8px',
  borderBottom: '0.5px solid rgba(255,255,255,0.05)',
}

const ctrlBtn = (enabled: boolean): React.CSSProperties => ({
  border: 'none',
  background: 'transparent',
  color: enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 14,
  opacity: enabled ? 1 : 0.4,
  padding: '2px 6px',
})
