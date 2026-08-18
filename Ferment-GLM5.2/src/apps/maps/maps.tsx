import { useState, useEffect, useRef, useCallback } from 'react'

export interface SavedPlace {
  id: string
  name: string
  lat: number
  lng: number
  address: string
}

export interface MapPin {
  id: string
  lat: number
  lng: number
  label: string
}

const PLACES_KEY = 'tahoe.maps-places'

// Mock geocoding — maps a search query to coordinates
const MOCK_LOCATIONS: Record<string, { lat: number; lng: number; address: string }> = {
  'cupertino': { lat: 37.3230, lng: -122.0322, address: 'Cupertino, CA' },
  'san francisco': { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA' },
  'new york': { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
  'london': { lat: 51.5074, lng: -0.1278, address: 'London, UK' },
  'tokyo': { lat: 35.6762, lng: 139.6503, address: 'Tokyo, Japan' },
  'paris': { lat: 48.8566, lng: 2.3522, address: 'Paris, France' },
  'sydney': { lat: -33.8688, lng: 151.2093, address: 'Sydney, Australia' },
  'berlin': { lat: 52.5200, lng: 13.4050, address: 'Berlin, Germany' },
}

const DEFAULT_PLACES: SavedPlace[] = [
  { id: 'sp1', name: 'Apple Park', lat: 37.3349, lng: -122.0090, address: 'Cupertino, CA' },
  { id: 'sp2', name: 'Times Square', lat: 40.7580, lng: -73.9855, address: 'New York, NY' },
]

const genId = () => `sp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

function loadPlaces(): SavedPlace[] {
  try { const s = localStorage.getItem(PLACES_KEY); return s ? JSON.parse(s) : DEFAULT_PLACES } catch { return DEFAULT_PLACES }
}
function persistPlaces(p: SavedPlace[]) { try { localStorage.setItem(PLACES_KEY, JSON.stringify(p)) } catch {} }

function searchLocation(query: string): { lat: number; lng: number; address: string } | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  // Direct match
  if (MOCK_LOCATIONS[q]) return MOCK_LOCATIONS[q]
  // Partial match
  const key = Object.keys(MOCK_LOCATIONS).find((k) => k.includes(q) || q.includes(k))
  if (key) return MOCK_LOCATIONS[key]
  // Default: return a random-ish location
  return { lat: 37.3230 + (Math.random() - 0.5) * 0.1, lng: -122.0322 + (Math.random() - 0.5) * 0.1, address: query }
}

export function Maps({ windowId: _windowId }: { windowId: string }) {
  const [places, setPlaces] = useState<SavedPlace[]>(loadPlaces)
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [pins, setPins] = useState<MapPin[]>([])
  const [center, setCenter] = useState({ lat: 37.3230, lng: -122.0322 })
  const [zoom, setZoom] = useState(13)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [mapError, setMapError] = useState(false)
  const mapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { persistPlaces(places) }, [places])

  // Try to load Leaflet dynamically; fall back to mock if unavailable
  useEffect(() => {
    let mounted = true
    import('leaflet').then((LModule) => {
      if (!mounted || !mapRef.current) return
      try {
        const L = LModule.default || LModule
        const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
        }).addTo(map)
        ;(mapRef.current as any)._leafletMap = map
      } catch {
        setMapError(true)
      }
    }).catch(() => {
      setMapError(true)
    })
    return () => {
      mounted = false
      if (mapRef.current && (mapRef.current as any)._leafletMap) {
        (mapRef.current as any)._leafletMap.remove()
        ;(mapRef.current as any)._leafletMap = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update map view when center/zoom changes
  useEffect(() => {
    if (mapRef.current && (mapRef.current as any)._leafletMap) {
      const map = (mapRef.current as any)._leafletMap
      map.setView([center.lat, center.lng], zoom)
    }
  }, [center, zoom])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const result = searchLocation(searchInput)
    if (result) {
      setSearchResults(result)
      setCenter({ lat: result.lat, lng: result.lng })
      const pin: MapPin = {
        id: genId(),
        lat: result.lat,
        lng: result.lng,
        label: result.address,
      }
      setPins((prev) => [...prev, pin])
    }
  }, [searchInput])

  const locate = useCallback(() => {
    // Mock geolocation — "locate" sets center to Cupertino
    setCenter({ lat: 37.3230, lng: -122.0322 })
    setSearchResults({ lat: 37.3230, lng: -122.0322, address: 'Current Location' })
  }, [])

  const dropPin = useCallback((lat: number, lng: number, label: string) => {
    const pin: MapPin = { id: genId(), lat, lng, label }
    setPins((prev) => [...prev, pin])
  }, [])

  const saveCurrentAsPlace = useCallback(() => {
    if (!searchResults) return
    const name = searchInput.trim() || searchResults.address
    const place: SavedPlace = {
      id: genId(),
      name,
      lat: searchResults.lat,
      lng: searchResults.lng,
      address: searchResults.address,
    }
    setPlaces((prev) => [...prev, place])
  }, [searchResults, searchInput])

  const navigateToPlace = useCallback((place: SavedPlace) => {
    setCenter({ lat: place.lat, lng: place.lng })
    setSearchResults({ lat: place.lat, lng: place.lng, address: place.address })
    setSelectedPlaceId(place.id)
    dropPin(place.lat, place.lng, place.name)
  }, [dropPin])

  const removePlace = useCallback((placeId: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== placeId))
    if (selectedPlaceId === placeId) setSelectedPlaceId(null)
  }, [selectedPlaceId])

  const zoomIn = useCallback(() => setZoom((z) => Math.min(18, z + 1)), [])
  const zoomOut = useCallback(() => setZoom((z) => Math.max(1, z - 1)), [])

  const clearPins = useCallback(() => setPins([]), [])

  return (
    <div data-testid="maps-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar */}
      <div data-testid="maps-sidebar" style={{ width: 220, borderRight: '0.5px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Search */}
        <div style={{ padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 4 }}>
            <input
              data-testid="maps-search"
              type="text"
              placeholder="Search places…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1, padding: '4px 8px', border: '0.5px solid var(--glass-border)', borderRadius: 6, background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
            />
            <button data-testid="search-btn" type="submit" style={{ border: 'none', background: 'var(--accent-blue)', color: 'white', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>🔍</button>
          </form>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)' }}>
          <button data-testid="locate-btn" onClick={locate} style={sideBtn}>📍 Locate</button>
          <button data-testid="save-place-btn" onClick={saveCurrentAsPlace} disabled={!searchResults} style={{ ...sideBtn, opacity: searchResults ? 1 : 0.4, cursor: searchResults ? 'pointer' : 'not-allowed' }}>⭐ Save</button>
          <button data-testid="clear-pins-btn" onClick={clearPins} disabled={pins.length === 0} style={{ ...sideBtn, opacity: pins.length > 0 ? 1 : 0.4, cursor: pins.length > 0 ? 'pointer' : 'not-allowed' }}>Clear</button>
        </div>

        {/* Saved places */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px 4px', textTransform: 'uppercase' }}>Saved Places</div>
          {places.length === 0 ? (
            <div data-testid="places-empty" style={{ padding: 12, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>No saved places</div>
          ) : (
            places.map((place) => (
              <button
                key={place.id}
                data-testid={`place-${place.id}`}
                onClick={() => navigateToPlace(place)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '6px 12px',
                  border: 'none',
                  background: selectedPlaceId === place.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: 600 }}>{place.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{place.address}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</div>
              </button>
            ))
          )}
        </div>

        {/* Pins list */}
        {pins.length > 0 && (
          <div style={{ borderTop: '0.5px solid var(--glass-border)', maxHeight: 150, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px 4px', textTransform: 'uppercase' }}>Pins ({pins.length})</div>
            {pins.map((pin) => (
              <div key={pin.id} data-testid={`pin-${pin.id}`} style={{ padding: '4px 12px', fontSize: 11, color: 'var(--text-primary)', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                📍 {pin.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Map container */}
        <div
          ref={mapRef}
          data-testid="map-container"
          style={{ width: '100%', height: '100%', background: '#e8eef3' }}
        >
          {mapError && (
            <div data-testid="map-fallback" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8eef3, #d4dde6)' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🗺️</div>
              <div style={{ fontSize: 14, color: '#333', fontWeight: 600 }}>{searchResults?.address || 'Map View'}</div>
              <div style={{ fontSize: 12, color: '#666' }}>{center.lat.toFixed(4)}, {center.lng.toFixed(4)} · Zoom: {zoom}</div>
              {pins.map((pin) => (
                <div key={pin.id} data-testid={`map-pin-${pin.id}`} style={{ position: 'absolute', fontSize: 20 }}>📍</div>
              ))}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button data-testid="zoom-in" onClick={zoomIn} style={zoomBtn}>+</button>
          <button data-testid="zoom-out" onClick={zoomOut} style={zoomBtn}>−</button>
        </div>

        {/* Info badge */}
        {searchResults && (
          <div data-testid="map-info" style={{ position: 'absolute', bottom: 12, left: 12, padding: '6px 12px', background: 'var(--glass-bg)', borderRadius: 8, border: '0.5px solid var(--glass-border)', fontSize: 12, color: 'var(--text-primary)' }}>
            📍 {searchResults.address} ({searchResults.lat.toFixed(4)}, {searchResults.lng.toFixed(4)})
          </div>
        )}
      </div>
    </div>
  )
}

const sideBtn: React.CSSProperties = {
  border: '0.5px solid var(--glass-border)',
  background: 'var(--glass-bg)',
  color: 'var(--text-primary)',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: 11,
}

const zoomBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  border: '0.5px solid var(--glass-border)',
  background: 'var(--glass-bg)',
  color: 'var(--text-primary)',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
