import './apps/registry'
import { useEffect, useState } from 'react'
import { MenuBar } from './components/glass'
import { MenuBarMenus } from './components/menubar/MenuBarMenus'
import { StatusBar } from './components/menubar/StatusBar'
import { DockBar } from './components/dock/DockBar'
import { Wallpaper } from './components/desktop/Wallpaper'
import { Window } from './components/window/Window'
import { Spotlight } from './components/spotlight/Spotlight'
import { ControlCenter } from './components/controlcenter/ControlCenter'
import { useWindowStore } from './store/window-manager'
import {
  accentHex,
  useResolvedAppearance,
  useThemeStore,
} from './store/theme'

/**
 * Tahoe desktop root.
 *
 * Composes the wallpaper, the transparent menu bar (Apple + per-app menus on
 * the left; Spotlight/Control Center triggers + clock on the right), the
 * window layer, the Liquid Glass Dock, plus the Spotlight and Control
 * Center overlays. Cmd+Space toggles Spotlight. The theme store drives
 * appearance/accent/icon-style/wallpaper, applied live to <html> and
 * persisted to localStorage.
 */
function App() {
  const windows = useWindowStore((s) => s.windows)
  const wallpaper = useThemeStore((s) => s.wallpaper)
  const appearance = useThemeStore((s) => s.appearance)
  const accent = useThemeStore((s) => s.accent)
  const iconStyle = useThemeStore((s) => s.iconStyle)
  const resolved = useResolvedAppearance()
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)

  // Apply appearance live to the document root so the whole shell (and any
  // CSS targeting html[data-theme]) reacts. data-appearance preserves the raw
  // 'auto' choice; data-theme is the resolved light/dark.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolved
    root.dataset.appearance = appearance
    root.dataset.accent = accent
    root.dataset.iconStyle = iconStyle
    root.style.setProperty('--accent', accentHex(accent))
  }, [resolved, appearance, accent, iconStyle])

  // Cmd+Space (or Ctrl+Space) toggles Spotlight.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault()
        setSpotlightOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      data-testid="desktop"
    >
      <Wallpaper name={wallpaper} />

      <MenuBar testId="menu-bar">
        <MenuBarMenus testId="menu-bar-menus" />
        <div className="flex-1" />
        <StatusBar
          onToggleSpotlight={() => setSpotlightOpen((v) => !v)}
          onToggleControlCenter={() => setControlCenterOpen((v) => !v)}
          spotlightOpen={spotlightOpen}
          controlCenterOpen={controlCenterOpen}
        />
      </MenuBar>

      {/* Window layer */}
      {windows.map((w) => (
        <Window key={w.id} win={w} />
      ))}

      <DockBar />

      <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <ControlCenter
        open={controlCenterOpen}
        onClose={() => setControlCenterOpen(false)}
      />
    </div>
  )
}

export default App
