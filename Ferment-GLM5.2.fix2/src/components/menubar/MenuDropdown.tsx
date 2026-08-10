import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { AppMenu, MenuEntry, MenuAction } from '@/lib/menu-types'

const itemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
  padding: '4px 12px',
  fontSize: '13px',
  lineHeight: '18px',
  borderRadius: '6px',
  cursor: 'default',
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

const shortcutStyle: CSSProperties = {
  opacity: 0.55,
  fontSize: '12px',
  marginLeft: '28px',
  fontFamily: 'inherit',
}

/**
 * Renders one dropdown menu (Tahoe glass bubble) with support for:
 *  - separators
 *  - disabled items
 *  - checkmarks
 *  - keyboard shortcuts
 *  - submenus (hover to open, nested flyout)
 *
 * Controlled by the parent MenuBar: `open` decides visibility, `anchorLeft`
 * positions it. Click-outside / Escape is handled by the parent.
 */
export function MenuDropdown({
  menu,
  open,
  anchorLeft,
  onAction,
}: {
  menu: AppMenu
  open: boolean
  anchorLeft: number
  onAction?: (item: MenuAction) => void
}) {
  const [hoveredSubmenu, setHoveredSubmenu] = useState<number | null>(null)
  const rootRef = useRef<HTMLUListElement>(null)

  // Clear submenu hover when the menu closes
  useEffect(() => {
    if (!open) setHoveredSubmenu(null)
  }, [open])

  if (!open) return null

  return (
    <ul
      ref={rootRef}
      role="menu"
      style={{
        position: 'absolute',
        top: '100%',
        left: anchorLeft,
        marginTop: '2px',
        minWidth: '200px',
        padding: '4px',
        listStyle: 'none',
        margin: 0,
        // Liquid Glass dropdown surface
        backgroundColor: 'var(--menu-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter:
          'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        border: '0.5px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
        borderRadius: '12px',
        color: 'var(--text-on-glass)',
        overflow: 'visible',
        zIndex: 10000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menu.items.map((entry, i) => (
        <MenuRow
          key={i}
          entry={entry}
          isHoveredSubmenu={hoveredSubmenu === i}
          onHoverSubmenu={() =>
            entry.type === 'action' && entry.submenu
              ? setHoveredSubmenu(i)
              : setHoveredSubmenu(null)
          }
          onAction={(item) => {
            onAction?.(item)
          }}
        />
      ))}
    </ul>
  )
}

function MenuRow({
  entry,
  isHoveredSubmenu,
  onHoverSubmenu,
  onAction,
}: {
  entry: MenuEntry
  isHoveredSubmenu: boolean
  onHoverSubmenu: () => void
  onAction: (item: MenuAction) => void
}) {
  if (entry.type === 'separator') {
    return (
      <li
        role="separator"
        style={{
          height: '1px',
          margin: '4px 6px',
          background: 'var(--glass-border-inner)',
        }}
      />
    )
  }

  const disabled = entry.disabled

  return (
    <li
      role="menuitem"
      aria-disabled={disabled || undefined}
      onMouseEnter={onHoverSubmenu}
      onClick={() => {
        if (disabled) return
        if (entry.submenu) return // submenu items don't fire onAction directly
        entry.onAction?.()
        onAction(entry)
      }}
      style={{
        ...itemStyle,
        color: disabled ? 'var(--text-secondary)' : 'var(--text-on-glass)',
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.85)'
          e.currentTarget.style.color = '#fff'
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = disabled
          ? 'var(--text-secondary)'
          : 'var(--text-on-glass)'
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {entry.checked !== undefined && (
          <span style={{ width: '14px', textAlign: 'center' }}>
            {entry.checked ? '✓' : ''}
          </span>
        )}
        {entry.label}
      </span>
      {entry.shortcut && <span style={shortcutStyle}>{entry.shortcut}</span>}

      {/* Submenu flyout */}
      {entry.submenu && isHoveredSubmenu && (
        <SubmenuFlyout items={entry.submenu} onAction={onAction} />
      )}
    </li>
  )
}

function SubmenuFlyout({
  items,
  onAction,
}: {
  items: MenuEntry[]
  onAction: (item: MenuAction) => void
}) {
  return (
    <ul
      role="menu"
      style={{
        position: 'absolute',
        left: '100%',
        top: '-5px',
        minWidth: '180px',
        padding: '4px',
        listStyle: 'none',
        margin: 0,
        backgroundColor: 'var(--menu-bg)',
        backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        WebkitBackdropFilter:
          'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        border: '0.5px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        borderRadius: '12px',
        color: 'var(--text-on-glass)',
      }}
    >
      {items.map((entry, i) => (
        <MenuRow
          key={i}
          entry={entry}
          isHoveredSubmenu={false}
          onHoverSubmenu={() => {}}
          onAction={onAction}
        />
      ))}
    </ul>
  )
}
