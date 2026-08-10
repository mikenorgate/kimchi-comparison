import { useRef, useCallback } from 'react'
import { useTheme } from '../../theme'

export interface WindowProps {
  id: string
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  x: number
  y: number
  width: number
  height: number
  minWidth?: number
  minHeight?: number
  zIndex?: number
  isFocused?: boolean
  isMinimized?: boolean
  isMaximized?: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFocus: () => void
  onMove?: (x: number, y: number) => void
  onResize?: (width: number, height: number) => void
}

const DEFAULT_MIN_WIDTH = 240
const DEFAULT_MIN_HEIGHT = 160
const MENUBAR_HEIGHT = 32

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function TrafficLight({
  color,
  hover,
  onClick,
  ariaLabel,
}: {
  color: string
  hover: string
  onClick: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={`w-3 h-3 rounded-full transition-colors ${hover}`}
      style={{ backgroundColor: color }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    />
  )
}

export function Window({
  id,
  title,
  icon,
  children,
  x,
  y,
  width,
  height,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  zIndex = 50,
  isFocused = true,
  isMinimized = false,
  isMaximized = false,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
}: WindowProps) {
  const { mode } = useTheme()
  const contentRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)
  const resizeStartRef = useRef<{ x: number; y: number; startWidth: number; startHeight: number } | null>(null)

  const layout = isMaximized
    ? { left: 0, top: MENUBAR_HEIGHT, width: window.innerWidth, height: Math.max(MENUBAR_HEIGHT, window.innerHeight - MENUBAR_HEIGHT) }
    : { left: x, top: y, width, height }

  const handleTitlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onFocus()
      if (isMaximized || !onMove) return
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest('button')) return
      e.preventDefault()
      const currentTarget = e.currentTarget
      if (typeof currentTarget.setPointerCapture === 'function' && e.pointerId != null) {
        currentTarget.setPointerCapture(e.pointerId)
      }
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startX: x,
        startY: y,
      }
    },
    [isMaximized, onMove, onFocus, x, y],
  )

  const handleTitlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current || !onMove) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      const nextX = clamp(
        dragStartRef.current.startX + dx,
        0,
        Math.max(0, window.innerWidth - width),
      )
      const nextY = clamp(
        dragStartRef.current.startY + dy,
        0,
        Math.max(0, window.innerHeight - height),
      )
      onMove(nextX, nextY)
    },
    [onMove, width, height],
  )

  const handleTitlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStartRef.current) return
      dragStartRef.current = null
      if (typeof e.currentTarget.releasePointerCapture === 'function' && e.pointerId != null) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    },
    [],
  )

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isMaximized || !onResize) return
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      const target = e.currentTarget
      if (typeof target.setPointerCapture === 'function' && e.pointerId != null) {
        target.setPointerCapture(e.pointerId)
      }
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startWidth: width,
        startHeight: height,
      }
    },
    [isMaximized, onResize, width, height],
  )

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeStartRef.current || !onResize) return
      const dx = e.clientX - resizeStartRef.current.x
      const dy = e.clientY - resizeStartRef.current.y
      const nextWidth = clamp(
        resizeStartRef.current.startWidth + dx,
        minWidth,
        Math.max(minWidth, window.innerWidth - x),
      )
      const nextHeight = clamp(
        resizeStartRef.current.startHeight + dy,
        minHeight,
        Math.max(minHeight, window.innerHeight - y),
      )
      onResize(nextWidth, nextHeight)
    },
    [onResize, minWidth, minHeight, x, y],
  )

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeStartRef.current) return
      resizeStartRef.current = null
      if (typeof e.currentTarget.releasePointerCapture === 'function' && e.pointerId != null) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    },
    [],
  )

  if (isMinimized) return null

  return (
    <div
      data-testid="window-frame"
      data-window-id={id}
      className="absolute flex flex-col overflow-hidden rounded-tahoe transition-shadow duration-150"
      style={{
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        zIndex,
        background:
          mode === 'dark'
            ? 'rgba(35,35,35,0.72)'
            : 'rgba(255,255,255,0.76)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: `1px solid ${
          mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)'
        }`,
        boxShadow: isFocused
          ? '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)'
          : '0 12px 40px rgba(0,0,0,0.25)',
      }}
      onPointerDown={onFocus}
      role="dialog"
      aria-modal="false"
      aria-label={title}
    >
      <div
        data-testid="window-titlebar"
        className={`h-10 flex items-center px-4 select-none ${
          mode === 'dark' ? 'border-white/10' : 'border-black/5'
        } ${isMaximized ? '' : 'cursor-default'}`}
        style={{ borderBottomWidth: '1px' }}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
      >
        <div className="flex items-center gap-2">
          <TrafficLight
            color="#ff5f57"
            hover="hover:bg-[#ff5f57]/90"
            onClick={onClose}
            ariaLabel="Close"
          />
          <TrafficLight
            color="#febc2e"
            hover="hover:bg-[#febc2e]/90"
            onClick={onMinimize}
            ariaLabel="Minimize"
          />
          <TrafficLight
            color="#28c840"
            hover="hover:bg-[#28c840]/90"
            onClick={onMaximize}
            ariaLabel="Maximize"
          />
        </div>
        <div className="flex-1 flex justify-center items-center gap-2 pointer-events-none">
          {icon}
          <span
            className={`text-sm font-medium ${
              mode === 'dark' ? 'text-white/90' : 'text-black/80'
            }`}
          >
            {title}
          </span>
        </div>
        <div className="w-16" />
      </div>
      <div ref={contentRef} className="flex-1 overflow-hidden relative">
        {children}
      </div>
      {!isMaximized && (
        <div
          data-testid="window-resize-handle"
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
          style={{ zIndex: 10 }}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        />
      )}
    </div>
  )
}
