import { useEffect } from 'react'
import { useThemeStore, WALLPAPERS } from '../store/theme-store'
import { MenuBar } from './menu-bar'
import { Dock } from './dock'
import { WindowLayer } from './window-layer'
import { Spotlight } from './spotlight'
import { ControlCenter } from './control-center'
import { NotificationCenter } from './notification-center'
import { MissionControl } from './mission-control'

/**
 * Root Desktop component.
 * Renders the generated wallpaper, applies the theme mode (light/dark)
 * to the root element by toggling the `dark` CSS class, and composes
 * the full Tahoe shell: menu bar, window layer, Dock, Spotlight,
 * Control Center, Notification Center, and Mission Control.
 */
export function Desktop({ children }: { children?: React.ReactNode }) {
  const mode = useThemeStore((s) => s.mode)
  const accent = useThemeStore((s) => s.accent)
  const wallpaperId = useThemeStore((s) => s.wallpaperId)

  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      root.classList.toggle('dark', mode === 'dark')
    }
  }, [mode])

  useEffect(() => {
    const wp = WALLPAPERS.find((w) => w.id === wallpaperId) ?? WALLPAPERS[0]
    const root = document.getElementById('root')
    if (root) {
      root.style.setProperty('--wallpaper-1', wp.colors[0])
      root.style.setProperty('--wallpaper-2', wp.colors[1])
      root.style.setProperty('--wallpaper-3', wp.colors[2])
    }
  }, [wallpaperId])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-blue', accent)
  }, [accent])

  return (
    <div className="wallpaper-tahoe" data-testid="desktop-wallpaper">
      <MenuBar />
      <WindowLayer />
      <Dock />
      <Spotlight />
      <ControlCenter />
      <NotificationCenter />
      <MissionControl />
      {children}
    </div>
  )
}
