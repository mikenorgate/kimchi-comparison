import { useState, type ReactNode } from 'react'

export interface MenuItem {
  id: string
  label: string
  shortcut?: string
  disabled?: boolean
  separator?: boolean
  onClick?: () => void
}

export interface MenuProps {
  label: ReactNode
  items: MenuItem[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  'data-testid'?: string
}

export function Menu({ label, items, open: controlledOpen, onOpenChange, 'data-testid': testId }: MenuProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (value: boolean) => {
    setInternalOpen(value)
    onOpenChange?.(value)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      data-testid={testId ? `${testId}-wrapper` : undefined}
    >
      <div data-testid={testId ? `${testId}-button` : undefined} className="px-3 py-1 text-sm text-tahoe-text rounded-tahoe-xs hover:bg-black/5 cursor-default">
        {label}
      </div>
      {open && (
        <div data-testid={testId ? `${testId}-popover` : undefined} className="absolute top-full left-0 mt-1 min-w-[12rem] rounded-tahoe bg-tahoe-menu backdrop-blur-tahoe shadow-menu border border-tahoe-glass-border py-1 z-50">
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
                className="w-full flex items-center justify-between px-3 py-1 text-sm text-tahoe-text hover:bg-tahoe-accent hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-tahoe-text"
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-tahoe-text-secondary ml-4">{item.shortcut}</span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
