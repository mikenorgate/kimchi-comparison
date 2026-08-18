import { useRef, useCallback, type ReactNode } from 'react'
import { useWindowStore, type WindowState } from '../store/window-store'

interface WindowProps {
  win: WindowState
  children: ReactNode
}

type DragState =
  | { type: 'move'; offsetX: number; offsetY: number }
  | { type: 'resize'; dir: ResizeDir; startX: number; startY: number; startW: number; startH: number; startWinX: number; startWinY: number }
  | null

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const RESIZE_HANDLES: { dir: ResizeDir; className: string }[] = [
  { dir: 'n', className: 'top-0 left-2 right-2 h-1 cursor-n-resize' },
  { dir: 's', className: 'bottom-0 left-2 right-2 h-1 cursor-s-resize' },
  { dir: 'e', className: 'right-0 top-2 bottom-2 w-1 cursor-e-resize' },
  { dir: 'w', className: 'left-0 top-2 bottom-2 w-1 cursor-w-resize' },
  { dir: 'ne', className: 'top-0 right-0 w-2 h-2 cursor-ne-resize' },
  { dir: 'nw', className: 'top-0 left-0 w-2 h-2 cursor-nw-resize' },
  { dir: 'se', className: 'bottom-0 right-0 w-2 h-2 cursor-se-resize' },
  { dir: 'sw', className: 'bottom-0 left-0 w-2 h-2 cursor-sw-resize' },
]

const MIN_WIDTH = 320
const MIN_HEIGHT = 200

export function Window({ win, children }: WindowProps) {
  const { closeWindow, minimizeWindow, toggleMaximize, focusWindow, moveWindow, resizeWindow } =
    useWindowStore()
  const dragRef = useRef<DragState>(null)
  const isFocused = useWindowStore((s) => s.focusedId === win.id)

  const onTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.isMaximized) return
      focusWindow(win.id)
      dragRef.current = {
        type: 'move',
        offsetX: e.clientX - win.x,
        offsetY: e.clientY - win.y,
      }
      const onMove = (ev: MouseEvent) => {
        const d = dragRef.current
        if (d?.type !== 'move') return
        moveWindow(win.id, ev.clientX - d.offsetX, ev.clientY - d.offsetY)
      }
      const onUp = () => {
        dragRef.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [win.id, win.x, win.y, win.isMaximized, focusWindow, moveWindow]
  )

  const onResizeMouseDown = useCallback(
    (dir: ResizeDir) => (e: React.MouseEvent) => {
      e.stopPropagation()
      if (win.isMaximized) return
      focusWindow(win.id)
      dragRef.current = {
        type: 'resize',
        dir,
        startX: e.clientX,
        startY: e.clientY,
        startW: win.width,
        startH: win.height,
        startWinX: win.x,
        startWinY: win.y,
      }
      const onMove = (ev: MouseEvent) => {
        const d = dragRef.current
        if (d?.type !== 'resize') return
        const dx = ev.clientX - d.startX
        const dy = ev.clientY - d.startY
        let { startW: w, startH: h, startWinX: x, startWinY: y } = d
        if (d.dir.includes('e')) w = Math.max(MIN_WIDTH, d.startW + dx)
        if (d.dir.includes('s')) h = Math.max(MIN_HEIGHT, d.startH + dy)
        if (d.dir.includes('w')) {
          w = Math.max(MIN_WIDTH, d.startW - dx)
          x = d.startWinX + (d.startW - w)
        }
        if (d.dir.includes('n')) {
          h = Math.max(MIN_HEIGHT, d.startH - dy)
          y = d.startWinY + (d.startH - h)
        }
        resizeWindow(win.id, w, h)
        if (d.dir.includes('w') || d.dir.includes('n')) {
          moveWindow(win.id, x, y)
        }
      }
      const onUp = () => {
        dragRef.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [win.id, win.width, win.height, win.x, win.y, win.isMaximized, focusWindow, resizeWindow, moveWindow]
  )

  if (win.isMinimized) return null

  const maximizedStyle = win.isMaximized
    ? { left: 0, top: 28, width: '100vw', height: 'calc(100vh - 28px - 90px)' }
    : {}

  return (
    <div
      className="glass-panel window-shell"
      data-testid={`window-${win.id}`}
      data-app={win.appId}
      data-focused={isFocused || undefined}
      onMouseDown={() => focusWindow(win.id)}
      style={{
        position: 'absolute',
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isFocused
          ? '0 12px 48px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(0,0,0,0.12)'
          : '0 6px 24px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.1)',
        ...maximizedStyle,
      }}
    >
      {/* Title bar with traffic lights */}
      <div
        className="window-titlebar"
        data-testid={`titlebar-${win.id}`}
        onMouseDown={onTitleMouseDown}
        onDoubleClick={() => toggleMaximize(win.id)}
        style={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          cursor: win.isMaximized ? 'default' : 'move',
          flexShrink: 0,
          gap: 8,
          borderBottom: '0.5px solid var(--glass-border)',
          userSelect: 'none',
        }}
      >
        <div className="traffic-lights" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            aria-label="Close"
            data-testid={`close-${win.id}`}
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id) }}
            style={trafficLightStyle('#ff5f57')}
          />
          <button
            aria-label="Minimize"
            data-testid={`minimize-${win.id}`}
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id) }}
            style={trafficLightStyle('#febc2e')}
          />
          <button
            aria-label="Maximize"
            data-testid={`maximize-${win.id}`}
            onClick={(e) => { e.stopPropagation(); toggleMaximize(win.id) }}
            style={trafficLightStyle('#28c840')}
          />
        </div>
        <span
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            pointerEvents: 'none',
          }}
        >
          {win.title}
        </span>
      </div>

      {/* Window content */}
      <div
        className="window-content"
        style={{ flex: 1, overflow: 'auto', position: 'relative' }}
      >
        {children}
      </div>

      {/* Resize handles */}
      {!win.isMaximized &&
        RESIZE_HANDLES.map((h) => (
          <div
            key={h.dir}
            data-testid={`resize-${h.dir}-${win.id}`}
            onMouseDown={onResizeMouseDown(h.dir)}
            style={{
              position: 'absolute',
              zIndex: 1,
              ...h.className
                .split(' ')
                .reduce((acc, cls) => {
                  const styleMap: Record<string, React.CSSProperties> = {
                    'top-0': { top: 0 },
                    'bottom-0': { bottom: 0 },
                    'left-0': { left: 0 },
                    'right-0': { right: 0 },
                    'h-1': { height: 4 },
                    'w-1': { width: 4 },
                    'w-2': { width: 8 },
                    'h-2': { height: 8 },
                    'left-2': { left: 8 },
                    'right-2': { right: 8 },
                    'top-2': { top: 8 },
                    'bottom-2': { bottom: 8 },
                  }
                  return { ...acc, ...(styleMap[cls] || {}) }
                }, {} as React.CSSProperties),
            }}
          />
        ))}
    </div>
  )
}

function trafficLightStyle(color: string): React.CSSProperties {
  return {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: color,
    border: '0.5px solid rgba(0,0,0,0.15)',
    cursor: 'pointer',
    padding: 0,
  }
}
