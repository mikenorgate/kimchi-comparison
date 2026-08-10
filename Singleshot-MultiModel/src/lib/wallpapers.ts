export interface Wallpaper {
  id: string;
  name: string;
  /** CSS `background` value applied to the desktop layer. */
  background: string;
}

/**
 * Built-in wallpapers. We rely on CSS gradients so the prototype has no image
 * asset dependency. New wallpapers can be added by appending to this list — the
 * system store stores the wallpaper id and `getWallpaperById` resolves it.
 */
export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'wallpaper-1',
    name: 'Tahoe Sunset',
    background:
      'linear-gradient(180deg, #1a2a6c 0%, #b21f1f 45%, #fdbb2d 100%)',
  },
  {
    id: 'wallpaper-2',
    name: 'Sierra Blue',
    background:
      'radial-gradient(circle at 30% 20%, #4f9bff 0%, #1a4fc4 40%, #0a1e5c 100%)',
  },
  {
    id: 'wallpaper-3',
    name: 'Monterey Dunes',
    background:
      'linear-gradient(160deg, #f6d365 0%, #fda085 40%, #ff7e5f 70%, #3a1c71 100%)',
  },
  {
    id: 'wallpaper-4',
    name: 'Big Sur Dusk',
    background:
      'linear-gradient(180deg, #0f2027 0%, #203a43 40%, #2c5364 100%)',
  },
];

const FALLBACK: Wallpaper = WALLPAPERS[0];

export function getWallpaperById(id: string): Wallpaper {
  return WALLPAPERS.find((w) => w.id === id) ?? FALLBACK;
}

export function listWallpapers(): Wallpaper[] {
  return WALLPAPERS;
}
