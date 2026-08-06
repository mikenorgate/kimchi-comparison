import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useWindowStore, type WindowState } from '../../store/window-manager'
import { getApp } from '../../lib/registry'
import { WindowChrome } from './WindowChrome'

/**
 * Window — a Tahoe desktop window.
 *
 * Absolutely positioned by its stored bounds (left/top/width/height) with a
 * z-index from the window manager. The titlebar (WindowChrome) drives drag;
 * eight edge/corner handles drive resize; the green traffic light zooms the
 * window to fill the screen (below the menu bar / above the Dock).
 *
 * Mounts the focused app's body via the registry contract.
 */

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

interface ResizeHandle {
  dir: ResizeDir
  className: string
  cursor: string
}

const RESIZE_HANDLES: ResizeHandle[] = [
  { dir: 'n', className: 'top-0 left-2 right-2 h-1.5', cursor: 'ns-resize' },
  { dir: 's', className: 'bottom-0 left-2 right-2 h-1.5', cursor: 'ns-resize' },
  { dir: 'e', className: 'right-0 top-2 bottom-2 w-1.5', cursor: 'ew-resize' },
  { dir: 'w', className: 'left-0 top-2 bottom-2 w-1.5', cursor: 'ew-resize' },
  { dir: 'ne', className: 'top-0 right-0 h-3 w-3', cursor: 'nesw-resize' },
  { dir: 'nw', className: 'top-0 left-0 h-3 w-3', cursor: 'nwse-resize' },
  { dir: 'se', className: 'bottom-0 right-0 h-3 w-3', cursor: 'nwse-resize' },
  { dir: 'sw', className: 'bottom-0 left-0 h-3 w-3', cursor: 'nesw-resize' },
]

const MIN_W = 320
const MIN_H = 200
const MENUBAR_H = 28
const DOCK_RESERVE = 96

export function Window({ win }: { win: WindowState }) {
  const focus = useWindowStore((s) => s.focus)
  const close = useWindowStore((s) => s.close)
  const minimize = useWindowStore((s) => s.minimize)
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize)
  const setBounds = useWindowStore((s) => s.setBounds)
  const app = getApp(win.appId)

  if (win.isMinimized) return null

  const startDrag = (e: ReactMouseEvent) => {
    if (win.isMaximized) return
    e.preventDefault()
    e.stopPropagation()
    focus(win.id)
    const startX = e.clientX
    const startY = e.clientY
    const origX = win.x
    const origY = win.y
    const onMove = (ev: MouseEvent) => {
      setBounds(win.id, { x: origX + ev.clientX - startX, y: origY + ev.clientY - startY })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const startResize = (e: ReactMouseEvent, dir: ResizeDir) => {
    if (win.isMaximized) return
    e.preventDefault()
    e.stopPropagation()
    focus(win.id)
    const startX = e.clientX
    const startY = e.clientY
    const orig = { x: win.x, y: win.y, w: win.w, h: win.h }
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let { x, y, w, h } = orig
      if (dir.includes('e')) w = Math.max(MIN_W, orig.w + dx)
      if (dir.includes('s')) h = Math.max(MIN_H, orig.h + dy)
      if (dir.includes('w')) {
        w = Math.max(MIN_W, orig.w - dx)
        x = orig.x + (orig.w - w)
      }
      if (dir.includes('n')) {
        h = Math.max(MIN_H, orig.h - dy)
        y = orig.y + (orig.h - h)
      }
      setBounds(win.id, { x, y, w, h })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const baseStyle: CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-window)',
    background: 'rgba(255,255,255,0.92)',
    border: '0.5px solid var(--color-glass-light-border)',
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    zIndex: win.zIndex,
  }

  const geom: CSSProperties = win.isMaximized
    ? {
        left: 0,
        top: MENUBAR_H,
        width: window.innerWidth,
        height: window.innerHeight - MENUBAR_H - DOCK_RESERVE,
      }
    : { left: win.x, top: win.y, width: win.w, height: win.h }

  return (
    <section
      className="absolute flex flex-col overflow-hidden"
      style={{ ...baseStyle, ...geom }}
      data-testid="window"
      data-window-id={win.id}
      data-focused={win.isFocused ? 'true' : 'false'}
      data-maximized={win.isMaximized ? 'true' : 'false'}
      onPointerDown={() => focus(win.id)}
    >
      <WindowChrome
        title={win.title}
        isFocused={win.isFocused}
        onClose={() => close(win.id)}
        onMinimize={() => minimize(win.id)}
        onMaximize={() => toggleMaximize(win.id)}
        onMouseDown={startDrag}
      />
      <div
        className="relative flex-1 overflow-auto"
        data-testid="window-content"
      >
        {app?.render() ?? (
          <div className="p-4 text-sm text-black/50">Unknown app: {win.appId}</div>
        )}
      </div>

      {!win.isMaximized &&
        RESIZE_HANDLES.map((h) => (
          <div
            key={h.dir}
            className={`absolute z-20 ${h.className}`}
            style={{ cursor: h.cursor }}
            data-testid={`resize-${h.dir}`}
            onMouseDown={(e) => startResize(e, h.dir)}
          />
        ))}
    </section>
  )
}

export default Window
