import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface MenuBarProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  testId?: string
}

/**
 * MenuBar — Tahoe's fully transparent top menu bar.
 *
 * Per Apple: "The menu bar is now completely transparent, making the display
 * feel even larger." So unlike GlassPanel/Dock this applies NO backdrop blur
 * and NO tint by default — it is a transparent strip that lets the wallpaper
 * show through, carrying only the menu text. An optional `subtle` prop is
 * reserved for low-contrast wallpapers but defaults off to honor Tahoe.
 */
export function MenuBar({ children, className, style, testId }: MenuBarProps) {
  const menuBarStyle: CSSProperties = {
    // Tahoe: completely transparent. No backdrop-filter, no tint.
    background: 'transparent',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
    ...style,
  }

  return (
    <header
      className={cn(
        'absolute inset-x-0 top-0 z-50 flex h-7 items-center px-3',
        'text-[13px] text-white/90',
        className,
      )}
      style={menuBarStyle}
      data-testid={testId}
      data-menubar="true"
    >
      {children}
    </header>
  )
}

export default MenuBar
