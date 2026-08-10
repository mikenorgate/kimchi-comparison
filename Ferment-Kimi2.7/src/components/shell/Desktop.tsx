import { useState, useCallback, type ReactNode } from 'react'
import { Wallpaper } from './Wallpaper'
import { MenuBar } from './MenuBar'
import { ContextMenu } from './ContextMenu'

interface DesktopProps {
  children?: ReactNode
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
      <div className="absolute inset-0 pt-8">{children}</div>
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={closeContextMenu} />
      )}
    </div>
  )
}
