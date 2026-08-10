/**
 * Desktop
 *
 * Full-viewport background layer for the Tahoe Web Desktop.
 *
 * Renders a fixed-position container that paints a wallpaper (CSS gradient
 * or image URL), applies a subtle vignette for Liquid Glass depth, and
 * exposes a relative positioned child layer where absolutely-positioned
 * windows can be dropped in.
 *
 * Props:
 *   - wallpaper (string, optional): one of:
 *       1. A CSS gradient (e.g. "linear-gradient(...)").
 *       2. An image URL (e.g. "/wallpapers/foo.jpg", "https://...").
 *       3. A built-in wallpaper id from WALLPAPERS (e.g. "aurora").
 *     When omitted, the default wallpaper is used.
 *   - children (React node, optional): the window layer content rendered
 *     inside a relative-positioned layer above the wallpaper.
 *   - className (string, optional): extra classes appended to the root.
 */

export const DEFAULT_WALLPAPER_ID = 'aurora';

/**
 * Built-in wallpapers. Each entry is a CSS gradient — no Apple assets
 * are bundled, so this works offline and ships with zero binary assets.
 */
export const WALLPAPERS = Object.freeze([
  Object.freeze({
    id: 'aurora',
    name: 'Aurora',
    gradient:
      'linear-gradient(135deg, #0b1437 0%, #1d2a78 30%, #4c1d95 65%, #831843 100%)',
  }),
  Object.freeze({
    id: 'mountains',
    name: 'Mountains',
    gradient:
      'linear-gradient(180deg, #0c4a6e 0%, #0369a1 25%, #38bdf8 55%, #bae6fd 90%, #e0f2fe 100%)',
  }),
  Object.freeze({
    id: 'waves',
    name: 'Waves',
    gradient:
      'linear-gradient(180deg, #042f2e 0%, #0f766e 35%, #14b8a6 65%, #5eead4 90%, #ccfbf1 100%)',
  }),
  Object.freeze({
    id: 'sunset',
    name: 'Sunset',
    gradient:
      'linear-gradient(180deg, #1e1b4b 0%, #6d28d9 30%, #db2777 60%, #f59e0b 90%, #fef3c7 100%)',
  }),
  Object.freeze({
    id: 'forest',
    name: 'Forest',
    gradient:
      'linear-gradient(180deg, #052e16 0%, #14532d 35%, #166534 60%, #4d7c0f 85%, #ecfccb 100%)',
  }),
]);

const URL_PREFIXES = ['http://', 'https://', '/', 'data:'];
const GRADIENT_PREFIXES = ['linear-gradient(', 'radial-gradient(', 'conic-gradient('];

export function getWallpaper(id) {
  if (typeof id === 'string') {
    const found = WALLPAPERS.find((w) => w.id === id);
    if (found) return found;
  }
  return WALLPAPERS.find((w) => w.id === DEFAULT_WALLPAPER_ID) ?? WALLPAPERS[0];
}

function resolveWallpaper(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return getWallpaper(DEFAULT_WALLPAPER_ID);
  }
  const trimmed = value.trim();
  if (URL_PREFIXES.some((p) => trimmed.startsWith(p))) {
    return { id: trimmed, name: trimmed, gradient: `url("${trimmed}")` };
  }
  if (GRADIENT_PREFIXES.some((p) => trimmed.startsWith(p))) {
    return { id: trimmed, name: trimmed, gradient: trimmed };
  }
  const byId = WALLPAPERS.find((w) => w.id === trimmed);
  if (byId) return byId;
  return getWallpaper(DEFAULT_WALLPAPER_ID);
}

function Desktop({ wallpaper, children, className = '' }) {
  const resolved = resolveWallpaper(wallpaper);
  const wallpaperBackground = resolved.gradient;
  const isImage = wallpaperBackground.startsWith('url(');

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${className}`.trim()}
      data-testid="desktop-root"
      data-wallpaper-id={resolved.id}
    >
      {/* Wallpaper layer */}
      <div
        aria-hidden="true"
        data-testid="desktop-wallpaper"
        className={`absolute inset-0 ${
          isImage ? 'bg-cover bg-center bg-no-repeat' : ''
        }`}
        style={{ background: wallpaperBackground }}
      />

      {/* Vignette overlay for Liquid Glass depth */}
      <div
        aria-hidden="true"
        data-testid="desktop-vignette"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.28) 100%)',
        }}
      />

      {/* Window layer — relative so absolutely-positioned windows anchor here */}
      <div
        data-testid="desktop-window-layer"
        className="relative w-full h-full"
      >
        {children}
      </div>
    </div>
  );
}

export default Desktop;
