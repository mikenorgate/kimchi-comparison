import { useState, useMemo, useCallback } from 'react'
import {
  Play,
  X,
  Volume2,
  Maximize,
  SkipBack,
  SkipForward,
  Pause,
} from 'lucide-react'
import { categories, movies } from './data'

export function Tv() {
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const featured = useMemo(
    () => movies.find((m) => m.featured) ?? movies[0],
    []
  )
  const selectedMovie = useMemo(
    () => movies.find((m) => m.id === selectedMovieId) ?? null,
    [selectedMovieId]
  )

  const openMovie = useCallback((id: string) => {
    setSelectedMovieId(id)
    setIsPlaying(false)
  }, [])

  const closeMovie = useCallback(() => {
    setSelectedMovieId(null)
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p)
  }, [])

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto bg-tahoe-glass/30 text-tahoe-text"
      data-testid="tv-app"
    >
      {/* Hero */}
      <div
        className="relative mx-4 mt-4 h-56 overflow-hidden rounded-tahoe-lg"
        data-testid="tv-hero"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${featured.gradient}`}
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6">
          <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/80">
            Featured
          </span>
          <h2 className="text-2xl font-bold text-white">{featured.title}</h2>
          <p className="max-w-lg text-sm text-white/80">
            {featured.description}
          </p>
          <button
            onClick={() => openMovie(featured.id)}
            className="mt-3 flex w-fit items-center gap-2 rounded-tahoe-xs bg-white px-4 py-2 font-medium text-black hover:bg-white/90"
            data-testid={`tv-play-${featured.id}`}
          >
            <Play className="w-4 h-4 fill-current" />
            Play
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.map((category) => (
        <div
          key={category.id}
          className="mt-4 px-4"
          data-testid={`tv-row-${category.id}`}
        >
          <h3 className="mb-2 text-sm font-semibold">{category.name}</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {category.movieIds
              .map((id) => movies.find((m) => m.id === id))
              .filter(Boolean)
              .map((movie) => (
                <button
                  key={movie!.id}
                  onClick={() => openMovie(movie!.id)}
                  className="flex-shrink-0 text-left"
                  data-testid={`tv-item-${category.id}-${movie!.id}`}
                >
                  <div
                    className={`h-28 w-44 rounded-tahoe-xs bg-gradient-to-br ${movie!.gradient}`}
                  />
                  <div className="mt-1 max-w-[11rem] truncate text-xs font-medium">
                    {movie!.title}
                  </div>
                  <div className="text-xs text-tahoe-text-secondary">
                    {movie!.genre}
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}

      {/* Player modal */}
      {selectedMovie && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 p-8"
          data-testid="tv-player"
        >
          <button
            onClick={closeMovie}
            className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            data-testid="tv-player-close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex w-full max-w-3xl flex-col items-center">
            <div
              className={`h-[50vh] w-full rounded-tahoe-lg bg-gradient-to-br ${selectedMovie.gradient}`}
              data-testid="tv-player-screen"
            />
            <div className="mt-4 flex w-full items-center justify-between text-white">
              <div>
                <div className="text-lg font-semibold" data-testid="tv-player-title">
                  {selectedMovie.title}
                </div>
                <div className="text-sm text-white/70">
                  {selectedMovie.genre} • {selectedMovie.duration}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                  data-testid="tv-player-play"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                </button>
                <button
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                  data-testid="tv-player-forward"
                  aria-label="Forward"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <button
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                  data-testid="tv-player-back"
                  aria-label="Back"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                  data-testid="tv-player-volume"
                  aria-label="Volume"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  className="rounded-full bg-white/20 p-2 hover:bg-white/30"
                  data-testid="tv-player-fullscreen"
                  aria-label="Full screen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
