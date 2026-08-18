import { useCallback, type ReactNode } from 'react'
import type { WindowState } from '../WindowManager'
import { useWindowManager } from '../WindowManager'

const MIN_W = 200
const MIN_H = 150

interface WindowFrameProps {
  win: WindowState
  children: ReactNode
}

export default function WindowFrame({ win, children }: WindowFrameProps) {
  const { closeWindow, minimizeWindow, focusWindow, moveWindow, resizeWindow } = useWindowManager()

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()

    focusWindow(win.id)

    const startX = e.clientX
    const startY = e.clientY
    const winX = win.x
    const winY = win.y

    const handleMove = (e: MouseEvent) => {
      moveWindow(win.id, winX + (e.clientX - startX), winY + (e.clientY - startY))
    }

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [win.id, win.x, win.y, focusWindow, moveWindow])

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    focusWindow(win.id)

    const startX = e.clientX
    const startY = e.clientY
    const winX = win.x
    const winY = win.y
    const winW = win.w
    const winH = win.h

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      let newX = winX, newY = winY, newW = winW, newH = winH

      if (direction.includes('e')) {
        newW = Math.max(MIN_W, winW + dx)
      }
      if (direction.includes('s')) {
        newH = Math.max(MIN_H, winH + dy)
      }
      if (direction.includes('w')) {
        newW = Math.max(MIN_W, winW - dx)
        newX = winX + (winW - newW)
      }
      if (direction.includes('n')) {
        newH = Math.max(MIN_H, winH - dy)
        newY = winY + (winH - newH)
      }

      resizeWindow(win.id, newW, newH, newX, newY)
    }

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [win.id, win.x, win.y, win.w, win.h, focusWindow, resizeWindow])

  const resizeHandles = [
    { dir: 'n', style: { top: 0, left: 0, right: 0, height: '4px', cursor: 'ns-resize' } },
    { dir: 's', style: { bottom: 0, left: 0, right: 0, height: '4px', cursor: 'ns-resize' } },
    { dir: 'e', style: { right: 0, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize' } },
    { dir: 'w', style: { left: 0, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize' } },
    { dir: 'ne', style: { top: 0, right: 0, width: '10px', height: '10px', cursor: 'nesw-resize' } },
    { dir: 'nw', style: { top: 0, left: 0, width: '10px', height: '10px', cursor: 'nwse-resize' } },
    { dir: 'se', style: { bottom: 0, right: 0, width: '10px', height: '10px', cursor: 'nwse-resize' } },
    { dir: 'sw', style: { bottom: 0, left: 0, width: '10px', height: '10px', cursor: 'nesw-resize' } },
  ] as const

  return (
    <div
      data-testid="window-frame"
      data-window-id={win.id}
      data-app-id={win.appId}
      onMouseDown={() => focusWindow(win.id)}
      style={{
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.w}px`,
        height: `${win.h}px`,
        zIndex: win.z,
        display: win.minimized ? 'none' : 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        overflow: 'hidden',
        background: 'rgba(30, 30, 40, 0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Titlebar */}
      <div
        data-testid="window-titlebar"
        onMouseDown={handleDragStart}
        style={{
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '12px',
          paddingRight: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          cursor: 'default',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: '8px', marginRight: '12px' }}>
          <button
            data-testid="window-close"
            onClick={() => closeWindow(win.id)}
            style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label="Close"
          />
          <button
            data-testid="window-minimize"
            onClick={() => minimizeWindow(win.id)}
            style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label="Minimize"
          />
          <button
            data-testid="window-maximize"
            style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28c840', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label="Maximize"
          />
        </div>
        {/* Title */}
        <span style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>{win.title}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* Resize handles */}
      {resizeHandles.map(({ dir, style }) => (
        <div
          key={dir}
          data-testid={`window-resize-${dir}`}
          onMouseDown={(e) => handleResizeStart(e, dir)}
          style={{
            position: 'absolute',
            ...style,
          }}
        />
      ))}
    </div>
  )
}
