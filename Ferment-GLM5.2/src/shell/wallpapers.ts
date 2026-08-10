/**
 * Original gradient wallpapers for the Tahoe desktop.
 *
 * No copyrighted Apple assets — each wallpaper is a multi-layer CSS
 * background (radial accents over a linear gradient) that approximates
 * the Tahoe aesthetic with original artwork.
 */

export interface Wallpaper {
  id: string;
  name: string;
  /** Multi-layer CSS background value (radial accents + linear base) */
  css: string;
  /** Whether this wallpaper is better suited for dark appearance */
  darkPreferred?: boolean;
}

export const wallpapers: Wallpaper[] = [
  {
    id: 'tahoe-gradient-1',
    name: 'Tahoe Blue',
    css: [
      'radial-gradient(ellipse at 25% 15%, rgba(255, 200, 120, 0.12) 0%, transparent 45%)',
      'radial-gradient(ellipse at 75% 85%, rgba(64, 160, 220, 0.15) 0%, transparent 50%)',
      'linear-gradient(160deg, #0c1e3e 0%, #1a3a5c 25%, #2c5f7c 50%, #3a7a8e 75%, #5ba8b0 100%)',
    ].join(', '),
  },
  {
    id: 'tahoe-gradient-2',
    name: 'Sierra Sunset',
    css: [
      'radial-gradient(ellipse at 30% 20%, rgba(255, 180, 100, 0.18) 0%, transparent 40%)',
      'radial-gradient(ellipse at 70% 75%, rgba(180, 60, 120, 0.12) 0%, transparent 45%)',
      'linear-gradient(160deg, #1a0c2e 0%, #4a1c4e 20%, #8e2d5a 40%, #c64f4f 60%, #e88a3c 80%, #f5c563 100%)',
    ].join(', '),
  },
  {
    id: 'tahoe-gradient-3',
    name: 'Midnight',
    css: [
      'radial-gradient(ellipse at 40% 10%, rgba(80, 80, 140, 0.10) 0%, transparent 40%)',
      'radial-gradient(ellipse at 60% 90%, rgba(40, 60, 100, 0.08) 0%, transparent 45%)',
      'linear-gradient(160deg, #050510 0%, #0c0c20 30%, #1a1a35 50%, #0c1e2c 80%, #051015 100%)',
    ].join(', '),
    darkPreferred: true,
  },
  {
    id: 'tahoe-gradient-4',
    name: 'Forest',
    css: [
      'radial-gradient(ellipse at 35% 25%, rgba(120, 200, 100, 0.10) 0%, transparent 40%)',
      'radial-gradient(ellipse at 65% 80%, rgba(60, 120, 80, 0.12) 0%, transparent 45%)',
      'linear-gradient(160deg, #0a1c0a 0%, #1a3c1a 30%, #2c5c2c 50%, #3a6e3a 70%, #4a8a4a 100%)',
    ].join(', '),
  },
  {
    id: 'tahoe-gradient-5',
    name: 'Aurora',
    css: [
      'radial-gradient(ellipse at 20% 30%, rgba(100, 200, 180, 0.15) 0%, transparent 40%)',
      'radial-gradient(ellipse at 80% 70%, rgba(200, 160, 60, 0.12) 0%, transparent 40%)',
      'linear-gradient(160deg, #001a2e 0%, #003d5c 20%, #006b6b 35%, #2d8e5a 50%, #6b8e3d 65%, #c4a03d 85%, #e8852c 100%)',
    ].join(', '),
  },
];

/** Get a wallpaper by ID, falling back to the first (default) */
export function getWallpaper(id: string): Wallpaper {
  return wallpapers.find((w) => w.id === id) ?? wallpapers[0];
}
