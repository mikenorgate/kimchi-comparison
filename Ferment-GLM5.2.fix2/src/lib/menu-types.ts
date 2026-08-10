/**
 * Menu data model for the macOS Tahoe menu bar.
 *
 * A menu bar is an ordered list of AppMenu entries. Each AppMenu has a top-level
 * label and a list of MenuEntry items. MenuEntry is either a separator or a
 * leaf action (with an optional keyboard shortcut, checked/disabled state, and
 * an optional submenu).
 *
 * Menus are resolved per-app at render time; the Apple menu is global.
 */

export interface MenuAction {
  type: 'action'
  label: string
  shortcut?: string
  checked?: boolean
  disabled?: boolean
  onAction?: () => void
  submenu?: MenuEntry[]
}

export interface MenuSeparator {
  type: 'separator'
}

export type MenuEntry = MenuAction | MenuSeparator

export interface AppMenu {
  label: string
  items: MenuEntry[]
}

export function separator(): MenuSeparator {
  return { type: 'separator' }
}
