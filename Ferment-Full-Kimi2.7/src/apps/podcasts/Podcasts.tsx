import { useState, useMemo, useCallback } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Mic2,
  ListMusic,
} from 'lucide-react'
import { podcasts, episodes } from './data'

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}`
  return `${m} min`
}

export function Podcasts() {
  const [selectedPodcastId, setSelectedPodcastId] = useState<string>(
    podcasts[0].id
  )
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [query, setQuery] = useState('')

  const selectedPodcast = useMemo(
    () => podcasts.find((p) => p.id === selectedPodcastId) ?? podcasts[0],
    [selectedPodcastId]
  )

  const displayedEpisodes = useMemo(() => {
    let list = episodes.filter((ep) => ep.podcastId === selectedPodcastId)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (ep) =>
          ep.title.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [selectedPodcastId, query])

  const currentEpisode = useMemo(
    () => episodes.find((ep) => ep.id === currentEpisodeId) ?? null,
    [currentEpisodeId]
  )

  const playEpisode = useCallback((id: string) => {
    setCurrentEpisodeId(id)
    setIsPlaying(true)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  const playNext = useCallback(() => {
    if (displayedEpisodes.length === 0) return
    const idx = displayedEpisodes.findIndex((ep) => ep.id === currentEpisodeId)
    const next = displayedEpisodes[(idx + 1) % displayedEpisodes.length]
    playEpisode(next.id)
  }, [displayedEpisodes, currentEpisodeId, playEpisode])

  const playPrev = useCallback(() => {
    if (displayedEpisodes.length === 0) return
    const idx = displayedEpisodes.findIndex((ep) => ep.id === currentEpisodeId)
    const prev =
      displayedEpisodes[(idx - 1 + displayedEpisodes.length) % displayedEpisodes.length]
    playEpisode(prev.id)
  }, [displayedEpisodes, currentEpisodeId, playEpisode])

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="podcasts-app"
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Library */}
        <div
          className="w-52 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3"
          data-testid="podcasts-library"
        >
          <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
            Library
          </h2>
          {podcasts.map((podcast) => (
            <button
              key={podcast.id}
              onClick={() => setSelectedPodcastId(podcast.id)}
              className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
                selectedPodcastId === podcast.id
                  ? 'bg-tahoe-accent/20 text-tahoe-text'
                  : 'hover:bg-white/5 text-tahoe-text-secondary'
              }`}
              data-testid={`podcasts-podcast-${podcast.id}`}
            >
              <div
                className={`h-6 w-6 flex-shrink-0 rounded-tahoe-xs bg-gradient-to-br ${podcast.artwork}`}
              />
              <span className="truncate">{podcast.title}</span>
            </button>
          ))}
        </div>

        {/* Episode list */}
        <div className="flex flex-1 flex-col bg-tahoe-window/80">
          <div
            className="flex items-center gap-3 border-b border-tahoe-glass-border p-4"
            data-testid="podcasts-header"
          >
            <div
              className={`h-12 w-12 rounded-tahoe-sm bg-gradient-to-br ${selectedPodcast.artwork}`}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold" data-testid="podcasts-show-title">
                {selectedPodcast.title}
              </h3>
              <p className="text-sm text-tahoe-text-secondary">
                {selectedPodcast.author}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-tahoe-xs bg-white/10 px-2 py-1">
              <ListMusic className="w-4 h-4 text-tahoe-text-secondary" />
              <span className="text-xs text-tahoe-text-secondary">
                {displayedEpisodes.length} episode
                {displayedEpisodes.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="px-4 py-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search episodes"
              className="w-full rounded-tahoe-xs bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-tahoe-text-tertiary"
              data-testid="podcasts-search"
            />
          </div>

          {displayedEpisodes.length === 0 ? (
            <div
              className="flex flex-1 items-center justify-center text-sm text-tahoe-text-secondary"
              data-testid="podcasts-empty"
            >
              No episodes found
            </div>
          ) : (
            <div
              className="flex-1 overflow-y-auto"
              data-testid="podcasts-episode-list"
            >
              {displayedEpisodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => playEpisode(episode.id)}
                  className={`flex cursor-pointer items-center gap-3 border-b border-tahoe-glass-border px-4 py-3 transition-colors hover:bg-white/5 ${
                    currentEpisodeId === episode.id ? 'bg-white/10' : ''
                  }`}
                  data-testid={`podcasts-episode-${episode.id}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (currentEpisodeId === episode.id) {
                        togglePlay()
                      } else {
                        playEpisode(episode.id)
                      }
                    }}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-tahoe-accent text-white hover:opacity-90"
                    data-testid={`podcasts-play-${episode.id}`}
                    aria-label={
                      currentEpisodeId === episode.id && isPlaying
                        ? 'Pause'
                        : 'Play'
                    }
                  >
                    {currentEpisodeId === episode.id && isPlaying ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{episode.title}</div>
                    <div className="truncate text-sm text-tahoe-text-secondary">
                      {episode.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-tahoe-text-secondary">
                    <Clock className="h-3 w-3" />
                    {formatDuration(episode.duration)}
                  </div>
                  <span className="text-xs text-tahoe-text-tertiary">
                    {episode.date}
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
        data-testid="podcasts-player"
      >
        {currentEpisode ? (
          <>
            <Mic2 className="h-8 w-8 text-tahoe-text-secondary" />
            <div className="w-1/3 min-w-0">
              <div
                className="truncate font-medium"
                data-testid="podcasts-current-title"
              >
                {currentEpisode.title}
              </div>
              <div className="truncate text-sm text-tahoe-text-secondary">
                {selectedPodcast.title}
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center gap-3">
              <button
                onClick={playPrev}
                className="p-1 text-tahoe-text-secondary hover:text-tahoe-text"
                data-testid="podcasts-prev"
                aria-label="Previous"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={togglePlay}
                className="rounded-full bg-tahoe-text p-2 text-tahoe-window hover:opacity-90"
                data-testid="podcasts-play-pause"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </button>
              <button
                onClick={playNext}
                className="p-1 text-tahoe-text-secondary hover:text-tahoe-text"
                data-testid="podcasts-next"
                aria-label="Next"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            <div className="w-1/3 text-right text-sm text-tahoe-text-secondary">
              {formatDuration(currentEpisode.duration)}
            </div>
          </>
        ) : (
          <div className="text-sm text-tahoe-text-secondary">
            Select an episode to start listening
          </div>
        )}
      </div>
    </div>
  )
}
