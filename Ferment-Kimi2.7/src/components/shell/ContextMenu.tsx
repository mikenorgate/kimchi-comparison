import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTheme } from '../../theme'

interface ContextMenuItem {
  id: string
  label: string
  shortcut?: string
  separator?: boolean
  onClick?: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items?: ContextMenuItem[]
  onClose: () => void
}

const defaultItems: ContextMenuItem[] = [
  { id: 'new-folder', label: 'New Folder', shortcut: '⇧⌘N' },
  { id: 'get-info', label: 'Get Info', shortcut: '⌘I' },
  { id: 'sep-1', label: '', separator: true },
  { id: 'change-wallpaper', label: 'Change Wallpaper…' },
  { id: 'edit-widgets', label: 'Edit Widgets…' },
  { id: 'sep-2', label: '', separator: true },
  { id: 'view-options', label: 'Show View Options', shortcut: '⌘J' },
]

function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  return {
    x: Math.max(0, Math.min(x, viewportWidth - width)),
    y: Math.max(0, Math.min(y, viewportHeight - height)),
  }
}

export function ContextMenu({ x, y, items = defaultItems, onClose }: ContextMenuProps) {
  const { mode } = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x, y })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = rect.width || 200
    const height = rect.height || 180
    const clamped = clampPosition(x, y, width, height, window.innerWidth, window.innerHeight)
    setPosition(clamped)
  }, [x, y])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      className={`fixed min-w-[200px] rounded-tahoe py-1 text-sm z-[10000] select-none ${
        mode === 'dark' ? 'text-white/90' : 'text-black/90'
      }`}
      style={{
        left: position.x,
        top: position.y,
        background: mode === 'dark' ? 'rgba(45,45,45,0.72)' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)'}`,
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
      }}
    >
      {items.map((item) =>
        item.separator ? (
          <div
            key={item.id}
            className="my-1 h-px"
            style={{
              background: mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            }}
          />
        ) : (
          <button
            key={item.id}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
              mode === 'dark' ? 'hover:bg-[#0a84ff] hover:text-white' : 'hover:bg-[#007aff] hover:text-white'
            }`}
            onClick={() => {
              item.onClick?.()
              onClose()
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs opacity-60 ml-4 tabular-nums">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  )
}
