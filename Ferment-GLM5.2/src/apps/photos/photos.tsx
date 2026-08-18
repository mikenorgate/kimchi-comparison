import { useState, useCallback, useEffect } from 'react'

export interface Photo {
  id: string
  title: string
  src: string // data URI or URL
  albumId: string
  date: string // ISO date
}

export interface PhotoAlbum {
  id: string
  name: string
}

const FAVORITES_KEY = 'tahoe.photos-favorites'
const ALBUMS_KEY = 'tahoe.photos-albums'

// Generate a sample image as SVG data URI
function sampleImg(seed: number, hue: number): string {
  const w = 400
  const h = 300
  const c1 = `hsl(${hue}, 70%, 60%)`
  const c2 = `hsl(${(hue + 60) % 360}, 70%, 45%)`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="g${seed}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g${seed})"/>
    <circle cx="${w * 0.3}" cy="${h * 0.4}" r="${h * 0.15}" fill="rgba(255,255,255,0.3)"/>
    <circle cx="${w * 0.7}" cy="${h * 0.6}" r="${h * 0.1}" fill="rgba(255,255,255,0.2)"/>
    <text x="${w / 2}" y="${h / 2}" font-family="sans-serif" font-size="20" fill="white" text-anchor="middle" opacity="0.6">Photo ${seed}</text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const DEFAULT_ALBUMS: PhotoAlbum[] = [
  { id: 'all', name: 'All Photos' },
  { id: 'favorites', name: 'Favorites' },
  { id: 'recents', name: 'Recents' },
]

const SAMPLE_PHOTOS: Photo[] = Array.from({ length: 12 }, (_, i) => ({
  id: `photo-${i + 1}`,
  title: `Sample Photo ${i + 1}`,
  src: sampleImg(i + 1, (i * 30) % 360),
  albumId: 'recents',
  date: new Date(2026, 7, i + 1).toISOString(),
}))

function loadFavorites(): Set<string> {
  try {
    const s = localStorage.getItem(FAVORITES_KEY)
    return s ? new Set(JSON.parse(s)) : new Set()
  } catch { return new Set() }
}

function persistFavorites(fav: Set<string>) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...fav])) } catch { /* ignore */ }
}

function loadUserAlbums(): PhotoAlbum[] {
  try {
    const s = localStorage.getItem(ALBUMS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function persistUserAlbums(albums: PhotoAlbum[]) {
  try { localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums)) } catch { /* ignore */ }
}

export function Photos({ windowId: _windowId }: { windowId: string }) {
  const [photos] = useState<Photo[]>(SAMPLE_PHOTOS)
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)
  const [userAlbums, setUserAlbums] = useState<PhotoAlbum[]>(loadUserAlbums)
  const [selectedAlbum, setSelectedAlbum] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [showAlbumInput, setShowAlbumInput] = useState(false)

  useEffect(() => {
    persistFavorites(favorites)
  }, [favorites])

  useEffect(() => {
    persistUserAlbums(userAlbums)
  }, [userAlbums])

  const allAlbums = [...DEFAULT_ALBUMS, ...userAlbums]

  const visiblePhotos = selectedAlbum === 'all'
    ? photos
    : selectedAlbum === 'favorites'
      ? photos.filter((p) => favorites.has(p.id))
      : selectedAlbum === 'recents'
        ? photos
        : photos.filter((p) => p.albumId === selectedAlbum)

  const toggleFavorite = useCallback((photoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }, [])

  const navigatePhoto = useCallback((direction: number) => {
    if (!selectedPhoto) return
    const idx = visiblePhotos.findIndex((p) => p.id === selectedPhoto.id)
    const nextIdx = (idx + direction + visiblePhotos.length) % visiblePhotos.length
    setSelectedPhoto(visiblePhotos[nextIdx])
  }, [selectedPhoto, visiblePhotos])

  const createAlbum = useCallback(() => {
    const name = newAlbumName.trim()
    if (!name) return
    const album: PhotoAlbum = { id: `album-${Date.now()}`, name }
    setUserAlbums((prev) => [...prev, album])
    setNewAlbumName('')
    setShowAlbumInput(false)
  }, [newAlbumName])

  // Keyboard navigation in viewer
  useEffect(() => {
    if (!selectedPhoto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigatePhoto(-1)
      else if (e.key === 'ArrowRight') navigatePhoto(1)
      else if (e.key === 'Escape') setSelectedPhoto(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedPhoto, navigatePhoto])

  const photoIdx = selectedPhoto ? visiblePhotos.findIndex((p) => p.id === selectedPhoto.id) : -1

  return (
    <div data-testid="photos-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar */}
      <div data-testid="photos-sidebar" style={{ width: 180, borderRight: '0.5px solid var(--glass-border)', padding: '8px 0', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '4px 12px', textTransform: 'uppercase' }}>Library</div>
        {allAlbums.map((album) => (
          <button
            key={album.id}
            data-testid={`album-${album.id}`}
            onClick={() => setSelectedAlbum(album.id)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '5px 12px',
              border: 'none',
              background: selectedAlbum === album.id ? 'var(--accent-blue)' : 'transparent',
              color: selectedAlbum === album.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {album.name}
            {album.id === 'favorites' && favorites.size > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>{favorites.size}</span>
            )}
          </button>
        ))}
        {showAlbumInput ? (
          <div style={{ padding: '4px 12px' }}>
            <input
              data-testid="album-name-input"
              type="text"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createAlbum() }}
              placeholder="Album name…"
              autoFocus
              style={{
                width: '100%',
                padding: '3px 6px',
                border: '0.5px solid var(--glass-border)',
                borderRadius: 4,
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                fontSize: 12,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button data-testid="album-create" onClick={createAlbum} style={{ marginTop: 4, fontSize: 11, padding: '2px 8px', cursor: 'pointer', border: '0.5px solid var(--glass-border)', borderRadius: 4, background: 'var(--accent-blue)', color: 'white' }}>
              Create
            </button>
          </div>
        ) : (
          <button
            data-testid="album-add"
            onClick={() => setShowAlbumInput(true)}
            style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 12px', border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 13 }}
          >
            + New Album
          </button>
        )}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <div data-testid="photos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {visiblePhotos.length === 0 ? (
            <div data-testid="photos-empty" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              No photos in this album
            </div>
          ) : (
            visiblePhotos.map((photo) => (
              <div
                key={photo.id}
                data-testid={`photo-${photo.id}`}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  borderRadius: 6,
                  overflow: 'hidden',
                  aspectRatio: '4 / 3',
                  background: 'var(--glass-bg)',
                }}
              >
                <img src={photo.src} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {favorites.has(photo.id) && (
                  <span data-testid={`fav-${photo.id}`} style={{ position: 'absolute', top: 4, right: 4, fontSize: 16, color: '#ffd60a', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>★</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Photo viewer overlay */}
      {selectedPhoto && (
        <div
          data-testid="photo-viewer"
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          {/* Prev button */}
          <button
            data-testid="viewer-prev"
            onClick={(e) => { e.stopPropagation(); navigatePhoto(-1) }}
            style={navBtn}
          >‹</button>

          {/* Photo */}
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <img
              data-testid="viewer-image"
              src={selectedPhoto.src}
              alt={selectedPhoto.title}
              style={{ maxWidth: '70%', maxHeight: '70%', borderRadius: 8, objectFit: 'contain' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span data-testid="viewer-title" style={{ color: 'white', fontSize: 14 }}>{selectedPhoto.title}</span>
              <span data-testid="viewer-counter" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{photoIdx + 1} / {visiblePhotos.length}</span>
              <button
                data-testid="viewer-favorite"
                onClick={() => toggleFavorite(selectedPhoto.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 20,
                  color: favorites.has(selectedPhoto.id) ? '#ffd60a' : 'rgba(255,255,255,0.4)',
                }}
              >
                {favorites.has(selectedPhoto.id) ? '★' : '☆'}
              </button>
            </div>
          </div>

          {/* Next button */}
          <button
            data-testid="viewer-next"
            onClick={(e) => { e.stopPropagation(); navigatePhoto(1) }}
            style={navBtn}
          >›</button>

          {/* Close */}
          <button
            data-testid="viewer-close"
            onClick={() => setSelectedPhoto(null)}
            style={{ position: 'absolute', top: 12, right: 12, ...navBtn }}
          >✕</button>
        </div>
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  border: 'none',
  background: 'rgba(255,255,255,0.1)',
  color: 'white',
  fontSize: 28,
  cursor: 'pointer',
  borderRadius: '50%',
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}
