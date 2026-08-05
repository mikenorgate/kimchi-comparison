import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Music as MusicIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
} from 'lucide-react'
import { playlists, sampleTracks } from './data'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Music() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    playlists[0].id
  )
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [shuffle, setShuffle] = useState(false)

  const tracks = useMemo(() => {
    if (selectedPlaylistId === 'favorites')
      return sampleTracks.filter((t) => favorites.has(t.id))
    if (selectedPlaylistId === 'recently-played')
      return [...sampleTracks].reverse()
    return sampleTracks
  }, [selectedPlaylistId, favorites])

  const currentTrack = useMemo(
    () => sampleTracks.find((t) => t.id === currentTrackId) ?? null,
    [currentTrackId]
  )

  const currentIndex = useMemo(
    () => tracks.findIndex((t) => t.id === currentTrackId),
    [tracks, currentTrackId]
  )

  const playTrack = useCallback((id: string) => {
    setCurrentTrackId(id)
    setIsPlaying(true)
    setProgress(0)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  const playNext = useCallback(() => {
    if (tracks.length === 0) return
    let nextIndex: number
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length)
    } else {
      nextIndex =
        currentIndex >= 0 ? (currentIndex + 1) % tracks.length : 0
    }
    playTrack(tracks[nextIndex].id)
  }, [tracks, currentIndex, shuffle, playTrack])

  const playPrev = useCallback(() => {
    if (tracks.length === 0) return
    const prevIndex =
      currentIndex >= 0
        ? (currentIndex - 1 + tracks.length) % tracks.length
        : 0
    playTrack(tracks[prevIndex].id)
  }, [tracks, currentIndex, playTrack])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    if (!isPlaying || !currentTrack) return
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= currentTrack.duration) {
          clearInterval(interval)
          return currentTrack.duration
        }
        return p + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying, currentTrack])

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="music-app"
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-44 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3"
          data-testid="music-sidebar"
        >
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
            Library
          </h2>
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => setSelectedPlaylistId(playlist.id)}
              className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                selectedPlaylistId === playlist.id
                  ? 'bg-tahoe-accent/20 text-tahoe-text'
                  : 'hover:bg-white/5 text-tahoe-text-secondary'
              }`}
              data-testid={`music-playlist-${playlist.id}`}
            >
              <MusicIcon className="w-4 h-4" />
              {playlist.name}
            </button>
          ))}
        </div>

        {/* Track list */}
        <div className="flex flex-1 flex-col bg-tahoe-window/80">
          <div className="flex h-12 items-center justify-between border-b border-tahoe-glass-border px-4">
            <span className="font-medium">
              {playlists.find((p) => p.id === selectedPlaylistId)?.name}
            </span>
            <span className="text-sm text-tahoe-text-secondary">
              {tracks.length} song{tracks.length === 1 ? '' : 's'}
            </span>
          </div>
          {tracks.length === 0 ? (
            <div
              className="flex flex-1 items-center justify-center text-sm text-tahoe-text-secondary"
              data-testid="music-empty"
            >
              No songs in this playlist
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto"
              data-testid="music-track-list"
            >
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex cursor-pointer items-center gap-3 border-b border-tahoe-glass-border px-4 py-2 transition-colors hover:bg-white/5 ${
                    currentTrackId === track.id
                      ? 'bg-white/10'
                      : ''
                  }`}
                  onClick={() => playTrack(track.id)}
                  data-testid={`music-track-${track.id}`}
                >
                  <span className="w-5 text-center text-sm text-tahoe-text-secondary">
                    {currentTrackId === track.id && isPlaying ? '♪' : index + 1}
                  </span>
                  <div
                    className={`h-10 w-10 rounded-tahoe-xs bg-gradient-to-br ${track.cover}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{track.title}</div>
                    <div className="truncate text-sm text-tahoe-text-secondary">
                      {track.artist} — {track.album}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(track.id)
                    }}
                    className="p-1"
                    data-testid={`music-favorite-${track.id}`}
                    aria-label="Favorite"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favorites.has(track.id)
                          ? 'fill-tahoe-red text-tahoe-red'
                          : 'text-tahoe-text-secondary'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-tahoe-text-secondary">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player */}
      <div
        className="flex h-20 items-center gap-4 border-t border-tahoe-glass-border bg-tahoe-window/90 px-4"
        data-testid="music-player"
      >
        {currentTrack ? (
          <>
            <div className="flex w-1/3 items-center gap-3">
              <div
                className={`h-10 w-10 rounded-tahoe-xs bg-gradient-to-br ${currentTrack.cover}`}
              />
              <div className="min-w-0">
                <div className="truncate font-medium" data-testid="music-current-title">
                  {currentTrack.title}
                </div>
                <div className="truncate text-sm text-tahoe-text-secondary">
                  {currentTrack.artist}
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShuffle((s) => !s)}
                  className={`p-1 ${shuffle ? 'text-tahoe-accent' : 'text-tahoe-text-secondary'}`}
                  data-testid="music-shuffle"
                  aria-label="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={playPrev}
                  className="p-1 text-tahoe-text-secondary hover:text-tahoe-text"
                  data-testid="music-prev"
                  aria-label="Previous"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="rounded-full bg-tahoe-text p-2 text-tahoe-window hover:opacity-90"
                  data-testid="music-play-pause"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                </button>
                <button
                  onClick={playNext}
                  className="p-1 text-tahoe-text-secondary hover:text-tahoe-text"
                  data-testid="music-next"
                  aria-label="Next"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <button
                  className="p-1 text-tahoe-text-secondary"
                  data-testid="music-repeat"
                  aria-label="Repeat"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>
              <div className="flex w-full max-w-md items-center gap-2 text-xs text-tahoe-text-secondary">
                <span>{formatDuration(progress)}</span>
                <div
                  className="relative h-1 flex-1 cursor-pointer rounded-full bg-white/20"
                  data-testid="music-progress"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pct = (e.clientX - rect.left) / rect.width
                    setProgress(
                      Math.min(
                        Math.max(0, Math.floor(pct * currentTrack.duration)),
                        currentTrack.duration
                      )
                    )
                  }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-tahoe-accent"
                    style={{
                      width: `${(progress / currentTrack.duration) * 100}%`,
                    }}
                  />
                </div>
                <span>{formatDuration(currentTrack.duration)}</span>
              </div>
            </div>
            <div className="w-1/3" />
          </>
        ) : (
          <div className="text-sm text-tahoe-text-secondary">
            Select a song to start playing
          </div>
        )}
      </div>
    </div>
  )
}
