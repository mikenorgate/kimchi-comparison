import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { Wallpaper } from './Wallpaper'
import { MenuBar } from './MenuBar'
import { ContextMenu } from './ContextMenu'
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

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  return (
    <div className="relative z-0 w-full h-full overflow-hidden" onContextMenu={handleContextMenu}>
      <Wallpaper />
      <MenuBar />
      <div className="absolute inset-0 pt-8">
        {children}
        <WindowManager />
        <SampleWindows />
      </div>
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}
    </div>
  )
}
