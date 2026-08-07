import type { CSSProperties } from 'react'
import { WALLPAPERS, type WallpaperName } from '../../lib/wallpapers'

export interface WallpaperProps {
  name?: WallpaperName
}

/**
 * Wallpaper — the Tahoe desktop backdrop. Renders the selected bundled
 * gradient full-bleed behind the shell. The selection is driven by the theme
 * store (App reads theme.wallpaper and passes it here).
 */
export function Wallpaper({ name = 'tahoe' }: WallpaperProps) {
  const style: CSSProperties = { background: WALLPAPERS[name] }
  return (
    <div
      className="absolute inset-0 -z-0"
      style={style}
      data-testid="wallpaper"
      data-wallpaper={name}
    />
  )
}

export default Wallpaper
