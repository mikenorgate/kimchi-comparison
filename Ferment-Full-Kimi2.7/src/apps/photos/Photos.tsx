import { useState, useCallback, useEffect, useMemo } from 'react'
import { Image as ImageIcon, Heart, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { albums, samplePhotos } from './data'

export function Photos() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(albums[0].id)
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(samplePhotos.filter((p) => p.albums.includes('favorites')).map((p) => p.id))
  )

  const filteredPhotos = useMemo(() => {
    if (selectedAlbumId === 'library') return samplePhotos
    if (selectedAlbumId === 'favorites')
      return samplePhotos.filter((p) => favorites.has(p.id))
    return samplePhotos.filter((p) => p.albums.includes(selectedAlbumId))
  }, [selectedAlbumId, favorites])

  const selectedIndex = useMemo(
    () => filteredPhotos.findIndex((p) => p.id === selectedPhotoId),
    [filteredPhotos, selectedPhotoId]
  )

  const closeViewer = useCallback(() => setSelectedPhotoId(null), [])

  const showNext = useCallback(() => {
    if (selectedIndex < 0 || filteredPhotos.length === 0) return
    const nextIndex = (selectedIndex + 1) % filteredPhotos.length
    setSelectedPhotoId(filteredPhotos[nextIndex].id)
  }, [filteredPhotos, selectedIndex])

  const showPrev = useCallback(() => {
    if (selectedIndex < 0 || filteredPhotos.length === 0) return
    const prevIndex =
      (selectedIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    setSelectedPhotoId(filteredPhotos[prevIndex].id)
  }, [filteredPhotos, selectedIndex])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedPhotoId) return
      if (e.key === 'Escape') closeViewer()
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhotoId, closeViewer, showNext, showPrev])

  return (
    <div
      className="flex h-full w-full bg-tahoe-glass/30 text-tahoe-text overflow-hidden"
      data-testid="photos-app"
    >
      {/* Album sidebar */}
      <div
        className="w-48 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3"
        data-testid="photos-sidebar"
      >
        <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-tahoe-text-secondary">
          Albums
        </h2>
        {albums.map((album) => (
          <button
            key={album.id}
            onClick={() => {
              setSelectedAlbumId(album.id)
              setSelectedPhotoId(null)
            }}
            className={`flex w-full items-center gap-2 rounded-tahoe-xs px-3 py-2 text-left text-sm transition-colors ${
              selectedAlbumId === album.id
                ? 'bg-tahoe-accent/20 text-tahoe-text'
                : 'hover:bg-white/5 text-tahoe-text-secondary'
            }`}
            data-testid={`photos-album-${album.id}`}
          >
            <ImageIcon className="w-4 h-4" />
            {album.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex flex-1 flex-col bg-tahoe-window/80">
        <div className="flex h-12 items-center justify-between border-b border-tahoe-glass-border px-4">
          <span className="font-medium">
            {albums.find((a) => a.id === selectedAlbumId)?.name}
          </span>
          <span className="text-sm text-tahoe-text-secondary">
            {filteredPhotos.length} photo
            {filteredPhotos.length === 1 ? '' : 's'}
          </span>
        </div>
        {filteredPhotos.length === 0 ? (
          <div
            className="flex flex-1 items-center justify-center text-sm text-tahoe-text-secondary"
            data-testid="photos-empty"
          >
            No photos in this album
          </div>
        ) : (
          <div
            className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto p-4 sm:grid-cols-4 lg:grid-cols-5"
            data-testid="photos-grid"
          >
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-tahoe-xs"
                onClick={() => setSelectedPhotoId(photo.id)}
                data-testid={`photos-photo-${photo.id}`}
              >
                <div
                  className={`h-full w-full bg-gradient-to-br ${photo.gradient}`}
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs text-white">{photo.title}</span>
                </div>
                {favorites.has(photo.id) && (
                  <Heart className="absolute right-2 top-2 h-4 w-4 fill-tahoe-red text-tahoe-red" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Viewer modal */}
      {selectedPhotoId && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
          data-testid="photos-viewer"
          onClick={closeViewer}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeViewer()
            }}
            className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
            data-testid="photos-viewer-close"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              showPrev()
            }}
            className="absolute left-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 disabled:opacity-30"
            data-testid="photos-viewer-prev"
            aria-label="Previous"
            disabled={filteredPhotos.length <= 1}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              showNext()
            }}
            className="absolute right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 disabled:opacity-30"
            data-testid="photos-viewer-next"
            aria-label="Next"
            disabled={filteredPhotos.length <= 1}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div
            className="flex max-h-[80%] max-w-[80%] flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`h-[60vh] w-[70vw] max-w-2xl rounded-tahoe-lg bg-gradient-to-br ${
                filteredPhotos[selectedIndex]?.gradient ?? ''
              }`}
              data-testid="photos-viewer-image"
            />
            <div className="mt-3 flex w-full items-center justify-between text-white">
              <div>
                <div className="font-medium" data-testid="photos-viewer-title">
                  {filteredPhotos[selectedIndex]?.title}
                </div>
                <div className="text-sm text-white/70" data-testid="photos-viewer-date">
                  {filteredPhotos[selectedIndex]?.date}
                </div>
              </div>
              <button
                onClick={() =>
                  selectedPhotoId && toggleFavorite(selectedPhotoId)
                }
                className="p-2 rounded-full hover:bg-white/10"
                data-testid="photos-viewer-favorite"
                aria-label="Favorite"
              >
                <Heart
                  className={`h-5 w-5 ${
                    selectedPhotoId && favorites.has(selectedPhotoId)
                      ? 'fill-tahoe-red text-tahoe-red'
                      : 'text-white'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
