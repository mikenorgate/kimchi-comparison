import { useEffect, useState, type ReactNode } from 'react'

export interface ContextMenuItem {
  id: string
  label: string
  disabled?: boolean
  separator?: boolean
  onClick?: () => void
}

export interface ContextMenuProps {
  children: ReactNode
  items: ContextMenuItem[]
}

export function ContextMenu({ children, items }: ContextMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  return (
    <div onContextMenu={handleContextMenu} className="w-full h-full">
      {children}
      {open && (
        <div
          data-testid="desktop-context-menu"
          style={{ left: position.x, top: position.y }}
          className="fixed min-w-[10rem] rounded-tahoe bg-tahoe-menu backdrop-blur-tahoe shadow-context border border-tahoe-glass-border py-1 z-[100]"
        >
          {items.map((item) =>
            item.separator ? (
              <div key={item.id} className="my-1 h-px bg-tahoe-divider" />
            ) : (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-1 text-sm text-tahoe-text hover:bg-tahoe-accent hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-tahoe-text"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
