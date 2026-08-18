"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PHOTO_ORDER,
  getPhotoById,
  initialMockPhotos,
} from "./mockPhotos";
import type { Photo } from "./mockPhotos";

/**
 * Photos window content.
 *
 * Renders a macOS-Photos-inspired layout:
 *
 *   | responsive thumbnail grid (with caption beneath each cell) |
 *
 * Clicking a thumbnail opens a simple "lightbox" detail view that
 * shows the photo at a larger size along with its title, capture
 * date, and optional description. Pressing the close button (or
 * hitting `Escape` on the keyboard) returns to the grid.
 *
 * Behavioural notes:
 * - The dataset is read-only. The component never mutates
 *   {@link initialMockPhotos}; selection is purely local state.
 * - The selected photo id is also exposed as a `data-selected` /
 *   `data-detail-open` attribute on the root element so the test
 *   suite can assert against the current view deterministically.
 * - When the detail view is open, an Escape keypress closes it. The
 *   listener is mounted only while the detail is open so we don't
 *   leak global handlers.
 * - An optional `initialSelectedId` / `initialPhotos` prop lets the
 *   window manager (and tests) boot Photos into a deterministic
 *   state — both default to "no selection" / the shared seed.
 */
export interface PhotosProps {
  /**
   * Optional starting selection. When omitted the Photos window
   * opens to the grid with nothing selected. Unknown ids are
   * silently dropped so the Photos UI never opens to an empty
   * detail view.
   */
  readonly initialSelectedId?: string;
  /**
   * Optional override for the seed dataset. Defaults to
   * {@link initialMockPhotos}. Kept as an escape hatch so tests can
   * pass a smaller fixture without touching the shared constant.
   */
  readonly initialPhotos?: readonly Photo[];
}

/**
 * Resolve the initial selection. Returns `undefined` when the
 * requested id is missing so the UI can fall back to "no
 * selection" instead of showing an empty detail view.
 */
function resolveInitialSelection(
  requested: string | undefined,
  photos: readonly Photo[]
): string | undefined {
  if (!requested) return undefined;
  return photos.some((photo) => photo.id === requested)
    ? requested
    : undefined;
}

/**
 * Format the ISO timestamp into a friendly "Month Day, Year"
 * label. The Photos UI keeps the date string deterministic by
 * pinning the locale and timezone so tests can assert against
 * the rendered output without stubbing `Intl`.
 */
function formatTakenAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = date.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  return `${month} ${day}, ${year}`;
}

export default function Photos({
  initialSelectedId,
  initialPhotos,
}: PhotosProps): JSX.Element {
  const photos = initialPhotos ?? initialMockPhotos;

  const [selectedId, setSelectedId] = useState<string | undefined>(() =>
    resolveInitialSelection(initialSelectedId, photos)
  );

  /**
   * Open the detail view for the given photo id. No-op when the id
   * is unknown so we don't accidentally clear an existing selection
   * on a stale click.
   */
  const handleOpen = useCallback(
    (id: string) => {
      if (!photos.some((photo) => photo.id === id)) return;
      setSelectedId(id);
    },
    [photos]
  );

  /** Close the detail view and return to the grid. */
  const handleClose = useCallback(() => {
    setSelectedId(undefined);
  }, []);

  /**
   * Escape closes the detail view. The listener is mounted only
   * while the detail is open so we never leak a global handler, and
   * it never prevents the click handler on the overlay from firing.
   */
  useEffect(() => {
    if (selectedId === undefined) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId(undefined);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedId]);

  const selectedPhoto = useMemo(
    () => (selectedId ? getPhotoById(selectedId, photos) : undefined),
    [selectedId, photos]
  );

  const orderedPhotos = useMemo(() => {
    // Iterate the canonical PHOTO_ORDER so the rendered ordering is
    // stable regardless of how the seed array is sorted. Unknown ids
    // are skipped so a partial dataset still renders cleanly.
    return PHOTO_ORDER.flatMap((id) => {
      const photo = photos.find((p) => p.id === id);
      return photo ? [photo] : [];
    });
  }, [photos]);

  return (
    <div
      className="photos"
      data-testid="photos"
      data-selected={selectedId ?? ""}
      data-detail-open={selectedPhoto ? "true" : "false"}
      aria-label="Photos"
    >
      <header
        className="photos__toolbar"
        data-testid="photos-toolbar"
        aria-label="Photos toolbar"
      >
        <span className="photos__toolbar-title">Library</span>
        <span
          className="photos__toolbar-count"
          data-testid="photos-toolbar-count"
          data-count={orderedPhotos.length}
        >
          {orderedPhotos.length} photo{orderedPhotos.length === 1 ? "" : "s"}
        </span>
      </header>

      <Grid photos={orderedPhotos} onOpen={handleOpen} />

      {selectedPhoto ? (
        <Detail photo={selectedPhoto} onClose={handleClose} />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid
// ---------------------------------------------------------------------------

interface GridProps {
  readonly photos: readonly Photo[];
  readonly onOpen: (id: string) => void;
}

/**
 * Responsive thumbnail grid. The `auto-fill / minmax` rule on
 * `.photos__grid` keeps cells between 140 px and 1fr so the layout
 * scales gracefully between a phone-sized window and a full
 * 1080p desktop.
 */
function Grid({ photos, onOpen }: GridProps): JSX.Element {
  if (photos.length === 0) {
    return (
      <div
        className="photos__empty"
        data-testid="photos-empty"
        role="status"
      >
        No photos
      </div>
    );
  }

  return (
    <ul
      className="photos__grid"
      data-testid="photos-grid"
      aria-label="Photo library"
    >
      {photos.map((photo) => (
        <Thumbnail key={photo.id} photo={photo} onOpen={onOpen} />
      ))}
    </ul>
  );
}

interface ThumbnailProps {
  readonly photo: Photo;
  readonly onOpen: (id: string) => void;
}

/**
 * Single tile in the grid: image (rendered as a plain `<img>` to
 * match the Finder preview approach) with the title beneath. The
 * whole tile is a button so keyboard users get the same affordance
 * as mouse users.
 */
function Thumbnail({ photo, onOpen }: ThumbnailProps): JSX.Element {
  return (
    <li
      className="photos__cell"
      data-testid={`photos-cell-${photo.id}`}
      data-photo-id={photo.id}
    >
      <button
        type="button"
        className="photos__thumb-button"
        data-testid={`photos-thumb-${photo.id}`}
        aria-label={`Open ${photo.title}`}
        onClick={() => onOpen(photo.id)}
      >
        <span className="photos__thumb-frame">
          <img
            className="photos__thumb-image"
            data-testid={`photos-thumb-image-${photo.id}`}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </span>
        <span
          className="photos__caption"
          data-testid={`photos-caption-${photo.id}`}
        >
          {photo.title}
        </span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Detail / lightbox
// ---------------------------------------------------------------------------

interface DetailProps {
  readonly photo: Photo;
  readonly onClose: () => void;
}

/**
 * Lightbox-style detail view. Renders an overlay above the grid
 * that shows the photo at a comfortable size along with its title,
 * capture date, and optional description. The backdrop itself is
 * clickable so clicking outside the image closes the detail — the
 * stop-propagation on the panel keeps the close button isolated.
 */
function Detail({ photo, onClose }: DetailProps): JSX.Element {
  return (
    <div
      className="photos__detail"
      data-testid="photos-detail"
      data-photo-id={photo.id}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} — photo detail`}
      onClick={onClose}
    >
      <div
        className="photos__detail-panel"
        data-testid="photos-detail-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header
          className="photos__detail-header"
          data-testid="photos-detail-header"
        >
          <h2
            className="photos__detail-title"
            data-testid="photos-detail-title"
          >
            {photo.title}
          </h2>
          <button
            type="button"
            className="photos__detail-close"
            data-testid="photos-detail-close"
            aria-label="Close photo detail"
            onClick={onClose}
          >
            {"\u2715"}
          </button>
        </header>
        <div className="photos__detail-body" data-testid="photos-detail-body">
          <img
            className="photos__detail-image"
            data-testid="photos-detail-image"
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            draggable={false}
          />
          <dl
            className="photos__detail-meta"
            data-testid="photos-detail-meta"
          >
            <dt className="photos__detail-label">Taken</dt>
            <dd
              className="photos__detail-value"
              data-testid="photos-detail-date"
            >
              {formatTakenAt(photo.takenAt)}
            </dd>
            {photo.description ? (
              <>
                <dt className="photos__detail-label">Notes</dt>
                <dd
                  className="photos__detail-value"
                  data-testid="photos-detail-description"
                >
                  {photo.description}
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  );
}
