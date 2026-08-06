import { useMemo, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react';

interface Pin {
  id: string;
  name: string;
  /** Position in the synthetic 1000x600 world, before pan/zoom. */
  x: number;
  y: number;
  category: 'restaurant' | 'park' | 'landmark' | 'transit';
}

const PINS: Pin[] = [
  { id: 'p-golden-gate', name: 'Golden Gate Bridge', x: 180, y: 220, category: 'landmark' },
  { id: 'p-marina', name: 'Marina District', x: 320, y: 240, category: 'landmark' },
  { id: 'p-fishermans', name: "Fisherman's Wharf", x: 360, y: 200, category: 'restaurant' },
  { id: 'p-golden-gate-park', name: 'Golden Gate Park', x: 280, y: 340, category: 'park' },
  { id: 'p-mission', name: 'Mission Dolores', x: 460, y: 360, category: 'park' },
  { id: 'p-soma', name: 'SoMa', x: 540, y: 300, category: 'landmark' },
  { id: 'p-union-sq', name: 'Union Square', x: 560, y: 260, category: 'landmark' },
  { id: 'p-embarcadero', name: 'Embarcadero', x: 620, y: 220, category: 'transit' },
  { id: 'p-chinatown', name: 'Chinatown', x: 600, y: 250, category: 'restaurant' },
  { id: 'p-oakland', name: 'Oakland', x: 800, y: 280, category: 'landmark' },
  { id: 'p-berkeley', name: 'Berkeley', x: 760, y: 200, category: 'landmark' },
  { id: 'p-sausalito', name: 'Sausalito', x: 200, y: 380, category: 'restaurant' },
  { id: 'p-muir', name: 'Muir Woods', x: 120, y: 460, category: 'park' },
];

const CATEGORY_ICONS: Record<Pin['category'], string> = {
  restaurant: '🍽️',
  park: '🌳',
  landmark: '📍',
  transit: '🚉',
};

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 600;
const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

export function Maps(): JSX.Element {
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const dragOriginRef = useRef<{ clientX: number; clientY: number; panX: number; panY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const filteredPins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PINS;
    return PINS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  }, [search]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    // Only start a drag when the pointer is on the canvas itself (not a pin).
    if (event.target !== event.currentTarget) return;
    if (event.button !== 0) return;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    setDragging(true);
    dragOriginRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!dragging) return;
    const origin = dragOriginRef.current;
    if (!origin) return;
    setPan({
      x: origin.panX + (event.clientX - origin.clientX),
      y: origin.panY + (event.clientY - origin.clientY),
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!dragging) return;
    setDragging(false);
    dragOriginRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const zoomIn = (): void => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const zoomOut = (): void => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  const reset = (): void => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
  };

  return (
    <div className="maps-root">
      <div className="maps-controls">
        <input
          type="text"
          className="app-input maps-controls__search"
          placeholder="Search places…"
          value={search}
          onChange={handleSearchChange}
        />
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {filteredPins.length} pins
        </span>
      </div>
      <div
        ref={canvasRef}
        className={`maps-canvas${dragging ? ' maps-canvas--grabbing' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="application"
        aria-label="Map"
      >
        <div
          className="maps-world"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <div className="maps-world__background" aria-hidden="true" />
          {filteredPins.map((pin) => (
            <button
              type="button"
              key={pin.id}
              className="maps-pin"
              style={{ left: pin.x, top: pin.y }}
              aria-label={pin.name}
              title={pin.name}
            >
              <span className="maps-pin__label">{pin.name}</span>
              <span aria-hidden="true">{CATEGORY_ICONS[pin.category]}</span>
            </button>
          ))}
        </div>

        <div className="maps-zoom">
          <button type="button" className="maps-zoom__btn" onClick={zoomIn} aria-label="Zoom in">
            +
          </button>
          <button type="button" className="maps-zoom__btn" onClick={zoomOut} aria-label="Zoom out">
            −
          </button>
          <button
            type="button"
            className="maps-zoom__btn"
            onClick={reset}
            aria-label="Reset view"
            style={{ fontSize: 12 }}
          >
            ⟳
          </button>
        </div>
      </div>
    </div>
  );
}

export default Maps;
