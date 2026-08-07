import { useMemo, useState } from 'react'
import { ChevronLeft, Heart, Images } from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/**
 * Photos — gallery grid of bundled sample images, detail view, favorite
 * toggle, persisted favorites.
 *
 * "Photos" are bundled CSS gradients (no network), each with metadata. The
 * library shows a grid; clicking a photo opens the detail view with a larger
 * preview + favorite toggle. Favorites persist to localStorage.
 * A sidebar filters between Library and Favorites.
 */

export interface Photo {
  id: string
  title: string
  gradient: string
}

const STORAGE_KEY = 'tahoe.photos.favorites'

const PHOTOS: Photo[] = [
  { id: 'p1', title: 'Sunrise', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)' },
  { id: 'p2', title: 'Ocean', gradient: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)' },
  { id: 'p3', title: 'Forest', gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'p4', title: 'Desert', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 'p5', title: 'Aurora', gradient: 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)' },
  { id: 'p6', title: 'Sunset', gradient: 'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)' },
  { id: 'p7', title: 'Lavender', gradient: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)' },
  { id: 'p8', title: 'Mint', gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
  { id: 'p9', title: 'Peach', gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
  { id: 'p10', title: 'Steel', gradient: 'linear-gradient(135deg, #485563 0%, #29323c 100%)' },
  { id: 'p11', title: 'Coral', gradient: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)' },
  { id: 'p12', title: 'Sky', gradient: 'linear-gradient(135deg, #73c8a9 0%, #373b44 100%)' },
]

type View = 'library' | 'favorites'

export function Photos() {
  const [favorites, setFavorites] = usePersistentState<string[]>(STORAGE_KEY, [])
  const [view, setView] = useState<View>('library')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const shown = useMemo(() => {
    if (view === 'favorites') return PHOTOS.filter((p) => favorites.includes(p.id))
    return PHOTOS
  }, [view, favorites])

  const selected = PHOTOS.find((p) => p.id === selectedId) ?? null

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    )
  }

  return (
    <div data-testid="photos-content" className="flex h-full text-[13px]">
      {/* Sidebar */}
      <aside className="w-44 border-r border-black/10 bg-black/[0.04] p-2">
        <button
          data-testid="photos-view-library"
          onClick={() => { setView('library'); setSelectedId(null) }}
          className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 ${
            view === 'library' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'hover:bg-black/5'
          }`}
        >
          <Images size={14} />
          <span>Library</span>
        </button>
        <button
          data-testid="photos-view-favorites"
          onClick={() => { setView('favorites'); setSelectedId(null) }}
          className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 ${
            view === 'favorites' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'hover:bg-black/5'
          }`}
        >
          <Heart size={14} />
          <span>Favorites</span>
        </button>
        <div className="mt-2 px-2 text-[11px] text-black/40">
          {favorites.length} favorited
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        {selected ? (
          // Detail view
          <div data-testid="photos-detail" className="flex h-full flex-col">
            <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
              <button
                data-testid="photos-back"
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-black/10"
              >
                <ChevronLeft size={15} />
                <span className="text-[12px]">Library</span>
              </button>
              <h2 data-testid="photos-detail-title" className="flex-1 text-center text-[13px] font-medium">
                {selected.title}
              </h2>
              <button
                data-testid="photos-favorite-toggle"
                onClick={() => toggleFavorite(selected.id)}
                className="rounded-md p-1 hover:bg-black/10"
                aria-label="Toggle favorite"
              >
                <Heart
                  size={16}
                  className={favorites.includes(selected.id) ? 'fill-[var(--accent)] text-[var(--accent)]' : 'text-black/40'}
                />
              </button>
            </div>
            <div className="grid flex-1 place-items-center p-6">
              <div
                data-testid="photos-detail-image"
                className="aspect-square w-full max-w-md rounded-xl shadow-lg"
                style={{ background: selected.gradient }}
              />
            </div>
          </div>
        ) : (
          // Grid view
          <div className="p-3">
            {shown.length === 0 ? (
              <div
                data-testid="photos-empty"
                className="grid h-64 place-items-center text-black/40"
              >
                No favorites yet. Tap the heart on a photo.
              </div>
            ) : (
              <div
                data-testid="photos-grid"
                className="grid grid-cols-3 gap-2 sm:grid-cols-4"
              >
                {shown.map((p) => {
                  const fav = favorites.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      data-testid="photos-thumb"
                      data-photo-id={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className="group relative aspect-square overflow-hidden rounded-lg"
                    >
                      <div
                        className="h-full w-full"
                        style={{ background: p.gradient }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1 opacity-0 transition group-hover:opacity-100">
                        <span className="text-[11px] text-white">{p.title}</span>
                      </div>
                      {fav && (
                        <Heart
                          data-testid="photos-thumb-fav"
                          size={14}
                          className="absolute right-1 top-1 fill-white text-white drop-shadow"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Photos
