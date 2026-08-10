import type { AppMenu } from '@/lib/menu-types'
import { buildDefaultAppMenus } from '@/lib/menus'
import { registerApp } from '@/lib/os-context'
import { DOCK_APPS } from '@/lib/app-registry'

/**
 * Module-level app registration.
 *
 * Apps are static, so registering them once at module load (rather than during
 * a render via useMemo) is correct and avoids side-effects-in-render. Safe to
 * call multiple times — registerApp overwrites by id.
 */
let registered = false

export function registerAllApps() {
  if (registered) return
  registered = true
  for (const app of DOCK_APPS) {
    registerApp({
      id: app.id,
      name: app.name,
      menus: buildDefaultAppMenus(app.name),
    })
  }
  // Finder gets richer menus (it's the default focused app on launch).
  registerApp({ id: 'finder', name: 'Finder', menus: finderMenus() })
}

/** Finder's app-specific menus (also used by tests). */
export function finderMenus(): AppMenu[] {
  return [
    {
      label: 'File',
      items: [
        { type: 'action', label: 'New Finder Window', shortcut: '⌘N' },
        { type: 'action', label: 'New Folder', shortcut: '⇧⌘N' },
        { type: 'separator' },
        { type: 'action', label: 'Open', shortcut: '⌘O' },
        { type: 'action', label: 'Close Window', shortcut: '⌘W' },
      ],
    },
    {
      label: 'Edit',
      items: [
        { type: 'action', label: 'Undo', shortcut: '⌘Z' },
        { type: 'action', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' },
        { type: 'action', label: 'Cut', shortcut: '⌘X' },
        { type: 'action', label: 'Copy', shortcut: '⌘C' },
        { type: 'action', label: 'Paste', shortcut: '⌘V' },
      ],
    },
    {
      label: 'View',
      items: [
        { type: 'action', label: 'as Icons', shortcut: '⌘1' },
        { type: 'action', label: 'as List', shortcut: '⌘2' },
        { type: 'separator' },
        { type: 'action', label: 'Show Toolbar' },
        { type: 'action', label: 'Show Sidebar' },
        { type: 'separator' },
        { type: 'action', label: 'Enter Full Screen', shortcut: '⌃⌘F' },
      ],
    },
    {
      label: 'Go',
      items: [
        { type: 'action', label: 'Back', shortcut: '⌘[' },
        { type: 'action', label: 'Forward', shortcut: '⌘]' },
        { type: 'separator' },
        { type: 'action', label: 'Documents', shortcut: '⇧⌘O' },
        { type: 'action', label: 'Downloads', shortcut: '⌥⌘L' },
        { type: 'action', label: 'Applications', shortcut: '⇧⌘A' },
      ],
    },
    {
      label: 'Window',
      items: [
        { type: 'action', label: 'Minimize', shortcut: '⌘M' },
        { type: 'action', label: 'Zoom' },
        { type: 'separator' },
        { type: 'action', label: 'Bring All to Front' },
      ],
    },
    {
      label: 'Help',
      items: [{ type: 'action', label: 'Finder Help' }],
    },
  ]
}

// Register immediately on import so the menu bar resolves menus before first render.
registerAllApps()
