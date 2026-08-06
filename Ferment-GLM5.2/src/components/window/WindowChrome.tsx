import type { CSSProperties, MouseEvent } from 'react'
import { cn } from '../../lib/cn'

export interface WindowChromeProps {
  title: string
  isFocused: boolean
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  /** Mouse-down on the titlebar starts a window drag. */
  onMouseDown: (e: MouseEvent) => void
}

/**
 * WindowChrome — the Tahoe window titlebar.
 *
 * Carries the three traffic-light controls (close / minimize / zoom) on the
 * left and a centered title. The whole bar is the drag handle; double-click
 * zooms. Traffic-light buttons stop propagation so clicking them never starts
 * a drag.
 */
export function WindowChrome({
  title,
  isFocused,
  onClose,
  onMinimize,
  onMaximize,
  onMouseDown,
}: WindowChromeProps) {
  const style: CSSProperties = {
    background: isFocused ? 'rgba(245,245,247,0.75)' : 'rgba(235,235,240,0.6)',
  }

  const light = (color: string): CSSProperties => ({
    background: color,
  })

  return (
    <div
      className="relative z-10 flex h-9 shrink-0 cursor-default items-center gap-2 px-3"
      style={style}
      data-testid="window-chrome"
      onMouseDown={onMouseDown}
      onDoubleClick={onMaximize}
    >
      <div className="flex items-center gap-2" data-testid="traffic-lights">
        <button
          type="button"
          aria-label="Close"
          className="h-3 w-3 rounded-full"
          style={light('var(--color-traffic-close)')}
          data-testid="traffic-close"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        />
        <button
          type="button"
          aria-label="Minimize"
          className="h-3 w-3 rounded-full"
          style={light('var(--color-traffic-min)')}
          data-testid="traffic-minimize"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onMinimize()
          }}
        />
        <button
          type="button"
          aria-label="Zoom"
          className="h-3 w-3 rounded-full"
          style={light('var(--color-traffic-max)')}
          data-testid="traffic-maximize"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onMaximize()
          }}
        />
      </div>
      <span
        className={cn(
          'pointer-events-none flex-1 truncate text-center text-[13px] font-medium',
          isFocused ? 'text-black/85' : 'text-black/50',
        )}
      >
        {title}
      </span>
    </div>
  )
}

export default WindowChrome
