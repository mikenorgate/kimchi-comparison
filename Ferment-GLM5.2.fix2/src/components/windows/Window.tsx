import {
  useCallback,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import type { WindowState } from '@/lib/windows-context'
import { useWindows } from '@/lib/windows-context'

const TOPBAR_H = 28

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

const HANDLE_SIZE = 8
const CORNER_SIZE = 14

/**
 * A single window with macOS Tahoe chrome:
 *  - Liquid Glass title bar with traffic-light buttons (close/minimize/maximize)
 *  - Draggable by the title bar
 *  - 8 resize handles (4 edges + 4 corners)
 *  - Content area hosting the app component
 *  - Click anywhere → focus (z-order + menu-bar retitle)
 *
 * Minimized windows are not rendered (the WindowManager filters them).
 */
export function Window({
  win,
  children,
}: {
  win: WindowState
  children: ReactNode
}) {
  const {
    focusedId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    moveWindow,
    resizeWindow,
  } = useWindows()
  const isFocused = focusedId === win.id

  const dragState = useRef<{
    startX: number
    startY: number
    origX: number
    origY: number
  } | null>(null)

  const resizeState = useRef<{
    dir: ResizeDir
    startX: number
    startY: number
    origX: number
    origY: number
    origW: number
    origH: number
  } | null>(null)

  /* ---- Drag handlers (title bar) ---- */
  const onTitlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      // Don't start drag when clicking a traffic light.
      if ((e.target as HTMLElement).closest('[data-traffic]')) return
      focusWindow(win.id)
      if (win.maximized) return // can't drag a maximized window
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
      }
    },
    [focusWindow, win.id, win.x, win.y, win.maximized],
  )

  const onTitlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = dragState.current
      if (!s) return
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      moveWindow(win.id, s.origX + dx, s.origY + dy)
    },
    [moveWindow, win.id],
  )

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (dragState.current) {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      dragState.current = null
    }
  }, [])

  /* ---- Resize handlers (edges + corners) ---- */
  const onResizePointerDown = useCallback(
    (dir: ResizeDir) => (e: React.PointerEvent) => {
      if (e.button !== 0) return
      e.stopPropagation()
      focusWindow(win.id)
      if (win.maximized) return
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      resizeState.current = {
        dir,
        startX: e.clientX,
        startY: e.clientY,
        origX: win.x,
        origY: win.y,
        origW: win.width,
        origH: win.height,
      }
    },
    [focusWindow, win.id, win.x, win.y, win.width, win.height, win.maximized],
  )

  const onResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = resizeState.current
      if (!s) return
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      let { origX: x, origY: y, origW: w, origH: h } = s
      const minW = 320
      const minH = 200

      if (s.dir.includes('e')) w = Math.max(minW, s.origW + dx)
      if (s.dir.includes('s')) h = Math.max(minH, s.origH + dy)
      if (s.dir.includes('w')) {
        const newW = Math.max(minW, s.origW - dx)
        x = s.origX + (s.origW - newW)
        w = newW
      }
      if (s.dir.includes('n')) {
        const newH = Math.max(minH, s.origH - dy)
        y = Math.max(TOPBAR_H, s.origY + (s.origH - newH))
        h = newH
      }
      resizeWindow(win.id, { x, y, width: w, height: h })
    },
    [resizeWindow, win.id],
  )

  const endResize = useCallback((e: React.PointerEvent) => {
    if (resizeState.current) {
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      resizeState.current = null
    }
  }, [])

  /* ---- ESC closes an unfocused menu, but we don't intercept window-level ---- */

  const winStyle: CSSProperties = {
    position: 'absolute',
    left: win.x,
    top: win.y,
    width: win.width,
    height: win.height,
    zIndex: win.z,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--window-bg)',
    backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
    WebkitBackdropFilter:
      'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
    borderRadius: win.maximized ? 0 : 12,
    boxShadow: isFocused
      ? '0 24px 70px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.18)'
      : '0 12px 32px rgba(0,0,0,0.2)',
    border: '0.5px solid var(--glass-border)',
    overflow: 'hidden',
    color: 'var(--text-on-glass)',
  }

  return (
    <div
      style={winStyle}
      onPointerDown={() => {
        if (!isFocused) focusWindow(win.id)
      }}
    >
      {/* Title bar */}
      <div
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => toggleMaximize(win.id)}
        style={{
          height: '38px',
          flex: '0 0 38px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '13px',
          paddingRight: '13px',
          gap: '8px',
          cursor: win.maximized ? 'default' : 'grab',
          borderBottom: '0.5px solid var(--glass-border-inner)',
          background: 'var(--glass-sheen)',
          userSelect: 'none',
        }}
      >
        <TrafficLights
          focused={isFocused}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => toggleMaximize(win.id)}
        />
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 600,
            opacity: isFocused ? 1 : 0.55,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {win.title}
        </div>
        {/* Spacer to balance traffic lights on the left */}
        <div style={{ width: '52px', flex: '0 0 52px' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
      </div>

      {/* Resize handles (8) */}
      {!win.maximized && (
        <>
          <ResizeHandle dir="n" style={edgeN} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
          <ResizeHandle dir="s" style={edgeS} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
          <ResizeHandle dir="e" style={edgeE} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
          <ResizeHandle dir="w" style={edgeW} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
          <ResizeHandle dir="ne" style={cornerNE} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
          <ResizeHandle dir="nw" style={cornerNW} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
          <ResizeHandle dir="se" style={cornerSE} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
          <ResizeHandle dir="sw" style={cornerSW} onDown={onResizePointerDown} onMove={onResizePointerMove} onUp={endResize} />
        </>
      )}
    </div>
  )
}

function TrafficLights({
  focused,
  onClose,
  onMinimize,
  onMaximize,
}: {
  focused: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
}) {
  return (
    <div
      data-traffic
      className="traffic-lights"
      style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
    >
      <TrafficLight color="#ff5f57" symbol="✕" focused={focused} onClick={onClose} title="Close" />
      <TrafficLight color="#febc2e" symbol="−" focused={focused} onClick={onMinimize} title="Minimize" />
      <TrafficLight color="#28c840" symbol="+" focused={focused} onClick={onMaximize} title="Zoom" />
    </div>
  )
}

function TrafficLight({
  color,
  symbol,
  focused,
  onClick,
  title,
}: {
  color: string
  symbol: string
  focused: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: focused ? color : 'rgba(120,120,120,0.35)',
        border: 'none',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        color: 'rgba(0,0,0,0.5)',
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      <span className="traffic-symbol" style={{ opacity: 0 }}>{symbol}</span>
    </button>
  )
}

function ResizeHandle({
  dir,
  style,
  onDown,
  onMove,
  onUp,
}: {
  dir: ResizeDir
  style: CSSProperties
  onDown: (dir: ResizeDir) => (e: React.PointerEvent) => void
  onMove: (e: React.PointerEvent) => void
  onUp: (e: React.PointerEvent) => void
}) {
  return (
    <div
      data-resize={dir}
      onPointerDown={onDown(dir)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ position: 'absolute', zIndex: 5, touchAction: 'none', ...style }}
    />
  )
}

/* ---- Handle positions ---- */
const edgeN: CSSProperties = { top: 0, left: CORNER_SIZE, right: CORNER_SIZE, height: HANDLE_SIZE, cursor: 'ns-resize' }
const edgeS: CSSProperties = { bottom: 0, left: CORNER_SIZE, right: CORNER_SIZE, height: HANDLE_SIZE, cursor: 'ns-resize' }
const edgeE: CSSProperties = { top: CORNER_SIZE, right: 0, bottom: CORNER_SIZE, width: HANDLE_SIZE, cursor: 'ew-resize' }
const edgeW: CSSProperties = { top: CORNER_SIZE, left: 0, bottom: CORNER_SIZE, width: HANDLE_SIZE, cursor: 'ew-resize' }
const cornerNE: CSSProperties = { top: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, cursor: 'nesw-resize' }
const cornerNW: CSSProperties = { top: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, cursor: 'nwse-resize' }
const cornerSE: CSSProperties = { bottom: 0, right: 0, width: CORNER_SIZE, height: CORNER_SIZE, cursor: 'nwse-resize' }
const cornerSW: CSSProperties = { bottom: 0, left: 0, width: CORNER_SIZE, height: CORNER_SIZE, cursor: 'nesw-resize' }
