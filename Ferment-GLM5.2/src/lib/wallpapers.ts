/**
 * Bundled Tahoe wallpapers. Real macOS wallpapers can't be shipped (licensing),
 * so these are gradients that evoke the Tahoe/Sonoma/Sequoia aesthetic. Kept
 * in a shared lib (not the Wallpaper component) so the theme store can depend
 * on the type/catalog without pulling in a React component.
 */
export type WallpaperName = 'tahoe' | 'sonoma' | 'sequoia' | 'graphite'

export const WALLPAPERS: Record<WallpaperName, string> = {
  tahoe: 'linear-gradient(135deg, #4a90d9 0%, #7bb8e8 35%, #d48fb9 70%, #f5a86b 100%)',
  sonoma: 'linear-gradient(160deg, #2b5876 0%, #4e4376 50%, #b21f1f 100%)',
  sequoia: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  graphite: 'linear-gradient(135deg, #3a3a3c 0%, #1c1c1e 100%)',
}

export const WALLPAPER_NAMES = Object.keys(WALLPAPERS) as WallpaperName[]
