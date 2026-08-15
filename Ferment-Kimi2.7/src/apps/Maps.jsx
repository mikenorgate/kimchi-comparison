import { useState, useRef } from 'react';
import './Maps.css';

const MOCK_PLACES = [
  { id: 1, name: 'Apple Park', address: 'One Apple Park Way, Cupertino, CA', x: 32, y: 48 },
  { id: 2, name: 'Golden Gate Bridge', address: 'San Francisco, CA', x: 22, y: 36 },
  { id: 3, name: 'Lake Tahoe', address: 'California / Nevada', x: 58, y: 28 },
  { id: 4, name: 'Yosemite National Park', address: 'California', x: 48, y: 42 },
  { id: 5, name: 'Big Sur', address: 'California Coast', x: 28, y: 58 },
  { id: 6, name: 'Times Square', address: 'New York, NY', x: 82, y: 38 },
  { id: 7, name: 'Big Ben', address: 'London, UK', x: 46, y: 24 },
];

export default function Maps() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(1);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mapRef = useRef(null);

  const selected = MOCK_PLACES.find((p) => p.id === selectedId) || MOCK_PLACES[0];
  const filtered = query.trim()
    ? MOCK_PLACES.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : MOCK_PLACES;

  const handleSearch = (e) => {
    e.preventDefault();
    const match = filtered[0];
    if (match) setSelectedId(match.id);
  };

  const onPointerDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y };
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    setMapOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const onPointerUp = () => setDragging(false);

  return (
    <div className="maps" data-testid="maps-app">
      <div className="maps-sidebar">
        <form className="maps-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search Maps"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search maps"
          />
          <button type="submit" aria-label="Search">⌕</button>
        </form>
        <div className="maps-results" data-testid="maps-results">
          {filtered.map((place) => (
            <button
              key={place.id}
              className={`maps-result ${selectedId === place.id ? 'active' : ''}`}
              onClick={() => setSelectedId(place.id)}
            >
              <span className="maps-result-name">{place.name}</span>
              <span className="maps-result-address">{place.address}</span>
            </button>
          ))}
        </div>
        <div className="maps-card" data-testid="maps-card">
          <strong data-testid="maps-card-title">{selected.name}</strong>
          <p>{selected.address}</p>
          <button className="maps-directions">Directions</button>
        </div>
      </div>
      <div
        className={`maps-canvas ${dragging ? 'dragging' : ''}`}
        ref={mapRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="maps-map"
          style={{ transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)` }}
        >
          {MOCK_PLACES.map((place) => (
            <button
              key={place.id}
              className={`maps-pin ${selectedId === place.id ? 'active' : ''}`}
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(place.id);
              }}
              aria-label={place.name}
            >
              <span className="maps-pin-dot" />
              <span className="maps-pin-label">{place.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
