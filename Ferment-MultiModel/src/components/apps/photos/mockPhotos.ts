/**
 * In-memory mock dataset for the Photos app.
 *
 * Conventions:
 * - Photo entries are stored as a frozen array of {@link Photo}
 *   records. The Photos UI is read-only, so the dataset does not
 *   expose any mutating helpers — clicking a thumbnail simply
 *   updates local component state.
 * - Image URLs use deterministic via.placeholder.com URLs so the
 *   tests don't depend on the network and the visual content is
 *   stable between renders.
 * - Each photo carries an ISO-8601 timestamp so the UI can render a
 *   deterministic "Taken" date without parsing strings at render
 *   time.
 * - {@link PHOTO_ORDER} is the canonical order in which the Photos
 *   grid renders thumbnails. The Photos UI never re-orders photos
 *   on its own; users may eventually get a sort menu but this step
 *   intentionally ships with a single deterministic ordering.
 * - {@link initialMockPhotos} is deeply frozen at module load with
 *   `Object.freeze` so accidental mutation throws in strict mode
 *   rather than silently corrupting the seed dataset.
 */

/**
 * A single photo in the library.
 *
 * `src` is the public image URL (mocked here to via.placeholder.com
 * with a per-photo tint so thumbnails render with a unique colour
 * even though the seed dataset is otherwise uniform).
 */
export interface Photo {
  /** Stable unique identifier (e.g. "photo-001"). */
  readonly id: string;
  /** Headline shown as the caption in the grid and detail header. */
  readonly title: string;
  /** Public URL the `<img>` element loads. */
  readonly src: string;
  /** Alt text for the `<img>` element. Falls back to `title` when omitted. */
  readonly alt: string;
  /** ISO-8601 timestamp the photo was "taken". */
  readonly takenAt: string;
  /**
   * Width × height pair used to reserve space for the thumbnail so
   * the grid does not jump while images load. Both values are in
   * CSS pixels.
   */
  readonly width: number;
  readonly height: number;
  /**
   * Optional short description shown beneath the title in the
   * detail view. The Photos UI falls back to the title when this
   * field is missing.
   */
  readonly description?: string;
}

/**
 * The seed collection of mock photos. Twelve entries is large enough
 * to exercise a multi-row responsive grid without overwhelming the
 * UI on first launch.
 */
export const initialMockPhotos: readonly Photo[] = Object.freeze([
  {
    id: "photo-001",
    title: "Tahoe Sunrise",
    src: "https://via.placeholder.com/640x480/3b6ea5/ffffff?text=Tahoe+Sunrise",
    alt: "Sunrise over Lake Tahoe with pink and orange clouds.",
    takenAt: "2025-01-12T07:42:00.000Z",
    width: 640,
    height: 480,
    description: "Caught the first light hitting Emerald Bay.",
  },
  {
    id: "photo-002",
    title: "Desert Dunes",
    src: "https://via.placeholder.com/640x480/c97b3a/ffffff?text=Desert+Dunes",
    alt: "Rolling orange dunes at sunset in the Sahara.",
    takenAt: "2025-01-08T18:14:00.000Z",
    width: 640,
    height: 480,
    description: "The dunes looked like a sea of copper at golden hour.",
  },
  {
    id: "photo-003",
    title: "City Lights",
    src: "https://via.placeholder.com/640x480/2c2c54/ffffff?text=City+Lights",
    alt: "Skyline at night with thousands of lights.",
    takenAt: "2025-01-04T22:03:00.000Z",
    width: 640,
    height: 480,
    description: "Long exposure from the rooftop after the rain.",
  },
  {
    id: "photo-004",
    title: "Forest Trail",
    src: "https://via.placeholder.com/640x480/2d6a4f/ffffff?text=Forest+Trail",
    alt: "A mossy trail winding through tall evergreens.",
    takenAt: "2024-12-29T10:21:00.000Z",
    width: 640,
    height: 480,
    description: "Ferns and fog along the lower Salmon River loop.",
  },
  {
    id: "photo-005",
    title: "Latte Art",
    src: "https://via.placeholder.com/640x480/8d6e63/ffffff?text=Latte+Art",
    alt: "A latte with a rosetta pattern on a wooden table.",
    takenAt: "2024-12-22T08:05:00.000Z",
    width: 640,
    height: 480,
    description: "Saturday morning at the corner cafe.",
  },
  {
    id: "photo-006",
    title: "Snowy Peaks",
    src: "https://via.placeholder.com/640x480/8aa1b8/ffffff?text=Snowy+Peaks",
    alt: "Snow-capped mountain range under a blue sky.",
    takenAt: "2024-12-15T13:48:00.000Z",
    width: 640,
    height: 480,
    description: "Above the treeline on the Sierra High Route.",
  },
  {
    id: "photo-007",
    title: "Tide Pools",
    src: "https://via.placeholder.com/640x480/118ab2/ffffff?text=Tide+Pools",
    alt: "A rocky tide pool with bright orange starfish.",
    takenAt: "2024-12-09T16:30:00.000Z",
    width: 640,
    height: 480,
    description: "Low tide at Point Reyes on a clear afternoon.",
  },
  {
    id: "photo-008",
    title: "Northern Lights",
    src: "https://via.placeholder.com/640x480/073b4c/ffffff?text=Northern+Lights",
    alt: "Aurora borealis ribbons of green and purple in the sky.",
    takenAt: "2024-12-02T23:55:00.000Z",
    width: 640,
    height: 480,
    description: "Three hours of patience finally paid off.",
  },
  {
    id: "photo-009",
    title: "Open Road",
    src: "https://via.placeholder.com/640x480/d90429/ffffff?text=Open+Road",
    alt: "An empty highway stretching into the horizon.",
    takenAt: "2024-11-26T15:12:00.000Z",
    width: 640,
    height: 480,
    description: "Highway 50 east of Fallon, not a car in sight.",
  },
  {
    id: "photo-010",
    title: "Studio Portrait",
    src: "https://via.placeholder.com/640x480/6a4c93/ffffff?text=Studio+Portrait",
    alt: "Black and white portrait against a plain backdrop.",
    takenAt: "2024-11-19T19:00:00.000Z",
    width: 640,
    height: 480,
    description: "Quick test shot for the new softbox setup.",
  },
  {
    id: "photo-011",
    title: "Autumn Leaves",
    src: "https://via.placeholder.com/640x480/9c5a3c/ffffff?text=Autumn+Leaves",
    alt: "Bright red and orange maple leaves on the ground.",
    takenAt: "2024-11-08T11:45:00.000Z",
    width: 640,
    height: 480,
    description: "The maples finally turned after the first frost.",
  },
  {
    id: "photo-012",
    title: "Lighthouse",
    src: "https://via.placeholder.com/640x480/1d3557/ffffff?text=Lighthouse",
    alt: "A lighthouse silhouetted against an orange sunset.",
    takenAt: "2024-10-30T20:10:00.000Z",
    width: 640,
    height: 480,
    description: "Pigeon Point at the end of a foggy October day.",
  },
] as readonly Photo[]);

/**
 * Canonical order of photo ids. Mirrors the index order of
 * {@link initialMockPhotos}; the Photos grid iterates this array
 * directly so the visual ordering stays stable even if the seed
 * dataset is later extended or filtered.
 */
export const PHOTO_ORDER: readonly string[] = Object.freeze(
  initialMockPhotos.map((photo) => photo.id)
);

/**
 * Look up a photo by id. Returns `undefined` when the id is unknown
 * so callers can decide how to degrade — typically by clearing the
 * detail selection.
 */
export function getPhotoById(
  id: string,
  photos: readonly Photo[] = initialMockPhotos
): Photo | undefined {
  return photos.find((photo) => photo.id === id);
}
