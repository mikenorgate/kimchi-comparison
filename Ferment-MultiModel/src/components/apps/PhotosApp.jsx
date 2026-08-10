import { useState, useCallback } from 'react';
import { Grid2x2, LayoutGrid, X } from 'lucide-react';

/**
 * PhotosApp
 *
 * Tahoe-style Photos window. Renders a grid of sample photo thumbnails as
 * coloured placeholder divs (no real image assets). Clicking a thumbnail
 * opens a lightbox/detail viewer overlay inside the app showing the larger
 * placeholder plus caption and date. A close button dismisses the lightbox.
 *
 * The toolbar exposes a grid-size toggle (small / large thumbnails).
 *
 * Pure UI mock — no persistence, no network, no real image data.
 *
 * Exposes `data-testid` hooks used by the test suite:
 *   - photos-app
 *   - photos-toolbar
 *   - photos-grid-size-toggle
 *   - photos-grid (with data-size attribute)
 *   - photos-thumbnail (one per photo, with data-photo-id)
 *   - photos-lightbox (overlay + panel)
 *   - photos-lightbox-image
 *   - photos-lightbox-caption
 *   - photos-lightbox-date
 *   - photos-lightbox-close
 *   - photos-empty
 */

const PHOTOS = Object.freeze([
  { id: 'p1', caption: 'Tahoe sunset',          date: '2026-07-12', color: 'from-orange-400 to-rose-600' },
  { id: 'p2', caption: 'Mountain trail',        date: '2026-06-30', color: 'from-emerald-400 to-teal-600' },
  { id: 'p3', caption: 'Lakeside morning',      date: '2026-05-18', color: 'from-sky-400 to-indigo-600'    },
  { id: 'p4', caption: 'Forest path',           date: '2026-04-04', color: 'from-lime-400 to-emerald-700'  },
  { id: 'p5', caption: 'Desert dunes',          date: '2026-03-22', color: 'from-amber-300 to-orange-600'  },
  { id: 'p6', caption: 'City lights',           date: '2026-02-14', color: 'from-fuchsia-500 to-violet-700'},
  { id: 'p7', caption: 'Snowy peaks',           date: '2026-01-09', color: 'from-slate-300 to-blue-700'    },
  { id: 'p8', caption: 'Spring blossoms',       date: '2025-12-21', color: 'from-pink-300 to-rose-500'     },
  { id: 'p9', caption: 'Autumn leaves',         date: '2025-11-05', color: 'from-yellow-400 to-red-600'    },
  { id: 'p10', caption: 'Northern lights',      date: '2025-10-19', color: 'from-green-400 to-purple-700'  },
  { id: 'p11', caption: 'Cobblestone street',   date: '2025-09-02', color: 'from-stone-400 to-stone-700'   },
  { id: 'p12', caption: 'Ocean horizon',        date: '2025-08-15', color: 'from-cyan-400 to-blue-700'     },
]);

const SIZE_OPTIONS = Object.freeze([
  { id: 'grid',    label: 'Small grid',    icon: Grid2x2,    cellClass: 'gap-1.5', thumbPad: 'p-1.5' },
  { id: 'large',   label: 'Large grid',    icon: LayoutGrid, cellClass: 'gap-3',   thumbPad: 'p-2.5' },
]);

function formatDate(iso) {
  if (typeof iso !== 'string') return '';
  // Keep the mock deterministic — avoid locale-dependent formatting.
  return iso;
}

function PhotosApp() {
  const [sizeId, setSizeId] = useState('grid');
  const [selectedId, setSelectedId] = useState(null);

  const selectedPhoto = selectedId
    ? PHOTOS.find((p) => p.id === selectedId) ?? null
    : null;

  const sizeMeta = SIZE_OPTIONS.find((s) => s.id === sizeId) ?? SIZE_OPTIONS[0];

  const handleToggleSize = useCallback(() => {
    setSizeId((current) => (current === 'grid' ? 'large' : 'grid'));
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <div
      data-testid="photos-app"
      data-app-id="photos"
      data-size={sizeId}
      className="flex flex-col h-full w-full bg-neutral-100 text-neutral-900 overflow-hidden"
    >
      {/* Toolbar */}
      <div
        data-testid="photos-toolbar"
        role="toolbar"
        aria-label="Photos toolbar"
        className="flex items-center gap-2 px-3 py-2 bg-white/80 border-b border-black/10"
      >
        <div
          data-testid="photos-toolbar-title"
          className="text-sm font-semibold text-neutral-800"
        >
          Library
        </div>
        <div className="flex-1" />
        <button
          type="button"
          data-testid="photos-grid-size-toggle"
          aria-label={`Switch to ${sizeId === 'grid' ? 'large' : 'small'} thumbnails`}
          aria-pressed={sizeId === 'large'}
          data-size={sizeId}
          onClick={handleToggleSize}
          className={
            `inline-flex items-center gap-1.5 px-2 h-7 rounded-md text-xs ` +
            `transition-colors focus:outline-none focus-visible:ring-2 ` +
            `focus-visible:ring-blue-400/70 ` +
            (sizeId === 'large'
              ? 'bg-blue-500/90 text-white'
              : 'bg-neutral-200/80 text-neutral-700 hover:bg-neutral-300/80')
          }
        >
          {(() => {
            const Icon = sizeMeta.icon;
            return <Icon aria-hidden="true" className="w-4 h-4" />;
          })()}
          <span>{sizeMeta.label}</span>
        </button>
      </div>

      {/* Grid */}
      <div
        data-testid="photos-grid"
        data-size={sizeId}
        aria-label="Photos"
        className={
          `flex-1 overflow-auto grid auto-rows-fr ` +
          (sizeId === 'large'
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ' + sizeMeta.cellClass + ' p-4'
            : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 ' + sizeMeta.cellClass + ' p-2')
        }
      >
        {PHOTOS.length === 0 ? (
          <div
            data-testid="photos-empty"
            className="col-span-full flex items-center justify-center text-sm text-neutral-500"
          >
            No photos
          </div>
        ) : (
          PHOTOS.map((photo) => {
            const isSelected = photo.id === selectedId;
            return (
              <button
                key={photo.id}
                type="button"
                data-testid="photos-thumbnail"
                data-photo-id={photo.id}
                data-caption={photo.caption}
                data-date={photo.date}
                aria-label={`Open photo: ${photo.caption}`}
                aria-pressed={isSelected}
                onClick={() => handleSelect(photo.id)}
                className={
                  `group relative flex flex-col rounded-md overflow-hidden ` +
                  `focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 ` +
                  `transition-shadow hover:shadow-md ` +
                  sizeMeta.thumbPad
                }
              >
                <div
                  aria-hidden="true"
                  className={
                    `aspect-square w-full rounded-md bg-gradient-to-br ${photo.color} ` +
                    `flex items-center justify-center text-white/90 text-xs font-medium`
                  }
                >
                  <span className="px-2 text-center leading-tight line-clamp-2">
                    {photo.caption}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-700 truncate text-left">
                  {photo.caption}
                </div>
                <div className="text-[10px] text-neutral-500 truncate text-left">
                  {formatDate(photo.date)}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Lightbox / detail viewer */}
      {selectedPhoto ? (
        <div
          data-testid="photos-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo: ${selectedPhoto.caption}`}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          <button
            type="button"
            data-testid="photos-lightbox-backdrop"
            aria-label="Close photo viewer"
            onClick={handleClose}
            className="absolute inset-0 w-full h-full bg-black/70 cursor-default"
          />
          <div
            data-testid="photos-lightbox-panel"
            className="relative bg-white rounded-lg shadow-2xl max-w-[90%] max-h-[90%] flex flex-col overflow-hidden"
          >
            <div
              data-testid="photos-lightbox-image"
              data-photo-id={selectedPhoto.id}
              className={
                `aspect-square w-[min(70vh,70vw)] bg-gradient-to-br ${selectedPhoto.color} ` +
                `flex items-center justify-center text-white/95 text-lg font-semibold`
              }
            >
              <span className="px-4 text-center">{selectedPhoto.caption}</span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-2 bg-neutral-50 border-t border-black/10">
              <div className="min-w-0">
                <div
                  data-testid="photos-lightbox-caption"
                  className="text-sm font-medium text-neutral-900 truncate"
                >
                  {selectedPhoto.caption}
                </div>
                <div
                  data-testid="photos-lightbox-date"
                  className="text-xs text-neutral-500"
                >
                  {formatDate(selectedPhoto.date)}
                </div>
              </div>
              <button
                type="button"
                data-testid="photos-lightbox-close"
                aria-label="Close"
                title="Close"
                onClick={handleClose}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-700 hover:bg-neutral-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default PhotosApp;
export { PHOTOS, SIZE_OPTIONS };
