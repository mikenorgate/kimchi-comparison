import { useRef, useState, useCallback, type ReactNode, type MouseEvent } from 'react'
import { useDesktop, type WindowState } from '../../desktop/store'

export interface WindowProps {
  window: WindowState
  children?: ReactNode
}

export function Window({ window: win, children }: WindowProps) {
  const {
    activeWindowId,
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    resizeWindow,
  } = useDesktop()
  const isActive = activeWindowId === win.id

  const [prevBounds, setPrevBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const dragStart = useRef<{ x: number; y: number; originX: number; originY: number } | null>(null)
  const resizeStart = useRef<{ x: number; y: number; originW: number; originH: number } | null>(null)

  const handleMouseDown = useCallback(() => {
    focusWindow(win.id)
  }, [focusWindow, win.id])

  const handleClose = useCallback(() => closeWindow(win.id), [closeWindow, win.id])
  const handleMinimize = useCallback(() => minimizeWindow(win.id), [minimizeWindow, win.id])
  const handleMaximize = useCallback(() => {
    if (win.maximized) {
      if (prevBounds) {
        restoreWindow(win.id, prevBounds.x, prevBounds.y, prevBounds.width, prevBounds.height)
        setPrevBounds(null)
      }
    } else {
      setPrevBounds({ x: win.x, y: win.y, width: win.width, height: win.height })
      maximizeWindow(win.id)
    }
  }, [closeWindow, minimizeWindow, maximizeWindow, restoreWindow, win, prevBounds])

  const onTitleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (win.maximized) return
    dragStart.current = { x: e.clientX, y: e.clientY, originX: win.x, originY: win.y }
    focusWindow(win.id)
    const onMove = (ev: globalThis.MouseEvent) => {
      if (!dragStart.current) return
      const dx = ev.clientX - dragStart.current.x
      const dy = ev.clientY - dragStart.current.y
      moveWindow(win.id, dragStart.current.originX + dx, dragStart.current.originY + dy)
    }
    const onUp = () => {
      dragStart.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [win, moveWindow, focusWindow])

  const onResizeMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    resizeStart.current = { x: e.clientX, y: e.clientY, originW: win.width, originH: win.height }
    const onMove = (ev: globalThis.MouseEvent) => {
      if (!resizeStart.current) return
      const dw = ev.clientX - resizeStart.current.x
      const dh = ev.clientY - resizeStart.current.y
      resizeWindow(win.id, Math.max(200, resizeStart.current.originW + dw), Math.max(150, resizeStart.current.originH + dh))
    }
    const onUp = () => {
      resizeStart.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [win, resizeWindow])

  if (win.minimized) return null

  return (
    <div
      data-testid={`window-${win.id}`}
      className={`absolute rounded-tahoe-lg shadow-window overflow-hidden border transition-colors duration-150 ${
        isActive ? 'border-tahoe-glass-border bg-tahoe-window' : 'border-tahoe-glass-border/50 bg-tahoe-window/90'
      }`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.z,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        data-testid="window-title-bar"
        className="h-9 flex items-center justify-between px-3 bg-tahoe-titlebar backdrop-blur-tahoe rounded-t-tahoe-lg"
        onMouseDown={onTitleMouseDown}
      >
        <div className="flex items-center gap-2">
          <button
            data-testid="window-close"
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-tahoe-red hover:brightness-90"
            onClick={handleClose}
          />
          <button
            data-testid="window-minimize"
            aria-label="Minimize"
            className="w-3 h-3 rounded-full bg-tahoe-yellow hover:brightness-90"
            onClick={handleMinimize}
          />
          <button
            data-testid="window-maximize"
            aria-label="Maximize"
            className="w-3 h-3 rounded-full bg-tahoe-green hover:brightness-90"
            onClick={handleMaximize}
          />
        </div>
        <span className={`text-sm font-medium ${isActive ? 'text-tahoe-text' : 'text-tahoe-text-tertiary'}`}>
          {win.title}
        </span>
        <div className="w-10" />
      </div>
      <div className="p-1 h-[calc(100%-2.25rem)] overflow-auto">
        {children}
      </div>
      <div
        data-testid="window-resize"
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={onResizeMouseDown}
      />
    </div>
  )
}
