import { useMemo, useState } from 'react'
import {
  Map as MapIcon,
  Search,
  MapPin,
  Navigation,
  X,
} from 'lucide-react'
import { locations } from './data'

export function Maps() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    )
  }, [query])

  const selected = useMemo(
    () => locations.find((l) => l.id === selectedId) ?? null,
    [selectedId]
  )

  return (
    <div
      className="relative flex h-full w-full overflow-hidden bg-tahoe-glass/30 text-tahoe-text"
      data-testid="maps-app"
    >
      {/* Sidebar */}
      <div
        className="z-10 flex w-64 flex-shrink-0 flex-col border-r border-tahoe-glass-border bg-tahoe-window/80 backdrop-blur-tahoe"
        data-testid="maps-sidebar"
      >
        <div className="flex h-12 items-center gap-2 border-b border-tahoe-glass-border px-3">
          <MapIcon className="h-5 w-5 text-tahoe-accent" />
          <span className="font-medium">Maps</span>
        </div>
        <div className="relative border-b border-tahoe-glass-border p-3">
          <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-tahoe-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search places"
            className="w-full rounded-tahoe-sm bg-tahoe-glass/30 py-2 pl-9 pr-3 text-sm text-tahoe-text placeholder-tahoe-text-secondary outline-none focus:ring-1 focus:ring-tahoe-accent"
            data-testid="maps-search"
            aria-label="Search places"
          />
        </div>
        <div className="flex-1 overflow-y-auto" data-testid="maps-results">
          {filtered.length === 0 ? (
            <div
              className="p-4 text-sm text-tahoe-text-secondary"
              data-testid="maps-empty"
            >
              No places found
            </div>
          ) : (
            filtered.map((location) => (
              <button
                key={location.id}
                onClick={() => setSelectedId(location.id)}
                className={`flex w-full items-start gap-3 border-b border-tahoe-glass-border p-3 text-left transition-colors hover:bg-white/5 ${
                  selectedId === location.id ? 'bg-white/10' : ''
                }`}
                data-testid={`maps-location-${location.id}`}
              >
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-tahoe-red" />
                <div className="min-w-0">
                  <div className="truncate font-medium">{location.name}</div>
                  <div className="truncate text-xs text-tahoe-text-secondary">
                    {location.address}
                  </div>
                  <div className="mt-1 inline-block rounded-tahoe-xs bg-tahoe-glass/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-tahoe-text-secondary">
                    {location.category}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map area */}
      <div className="relative flex-1 bg-tahoe-glass/20" data-testid="maps-canvas">
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        {filtered.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedId(location.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            data-testid={`maps-pin-${location.id}`}
            aria-label={location.name}
          >
            <MapPin
              className={`h-7 w-7 drop-shadow ${
                selectedId === location.id
                  ? 'fill-tahoe-accent text-tahoe-accent'
                  : 'fill-tahoe-red text-tahoe-red'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Info card */}
      {selected && (
        <div
          className="absolute bottom-4 right-4 z-20 w-64 rounded-tahoe-lg border border-tahoe-glass-border bg-tahoe-window/90 p-4 shadow-tahoe backdrop-blur-tahoe"
          data-testid="maps-info-card"
        >
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="font-medium" data-testid="maps-info-title">
                {selected.name}
              </div>
              <div className="text-sm text-tahoe-text-secondary">
                {selected.category}
              </div>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="rounded-full p-1 hover:bg-white/10"
              data-testid="maps-info-close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-3 text-sm text-tahoe-text-secondary">
            {selected.address}
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-tahoe-sm bg-tahoe-accent py-2 text-sm font-medium text-white hover:opacity-90"
            data-testid="maps-info-directions"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </button>
        </div>
      )}
    </div>
  )
}
