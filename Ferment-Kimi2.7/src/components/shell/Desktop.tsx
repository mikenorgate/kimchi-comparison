import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { Wallpaper } from './Wallpaper'
import { MenuBar } from './MenuBar'
import { ContextMenu } from './ContextMenu'
import { Dock } from './Dock'
import { Spotlight } from './Spotlight'
import { ControlCenter } from './ControlCenter'
import { WindowManager, useWindowManager } from '../window'

interface DesktopProps {
  children?: ReactNode
}

function SampleWindows() {
  const { openWindow } = useWindowManager()

  useEffect(() => {
    openWindow({
      id: 'finder-1',
      appId: 'finder',
      title: 'Finder',
      x: 120,
      y: 100,
      width: 520,
      height: 320,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
    })
    openWindow({
      id: 'safari-1',
      appId: 'safari',
      title: 'Safari',
      x: 700,
      y: 200,
      width: 480,
      height: 320,
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
    })
  }, [openWindow])

  return null
}

export function Desktop({ children }: DesktopProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const openSpotlight = useCallback(() => {
    setControlCenterOpen(false)
    setSpotlightOpen(true)
  }, [])

  const closeSpotlight = useCallback(() => {
    setSpotlightOpen(false)
  }, [])

  const toggleControlCenter = useCallback(() => {
    setSpotlightOpen(false)
    setControlCenterOpen((open) => !open)
  }, [])

  const closeControlCenter = useCallback(() => {
    setControlCenterOpen(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.metaKey) {
        e.preventDefault()
        setSpotlightOpen((open) => !open)
      }
      if (e.key === 'Escape' && spotlightOpen) {
        e.preventDefault()
        setSpotlightOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [spotlightOpen])

  return (
    <div className="relative z-0 w-full h-full overflow-hidden" onContextMenu={handleContextMenu}>
      <Wallpaper />
      <MenuBar onSpotlightClick={openSpotlight} onControlCenterClick={toggleControlCenter} />
      <div className="absolute inset-0 pt-8">
        {children}
        <WindowManager />
        <SampleWindows />
      </div>
      <Dock />
      <Spotlight open={spotlightOpen} onClose={closeSpotlight} />
      <ControlCenter open={controlCenterOpen} onClose={closeControlCenter} />
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}
    </div>
  )
}
