import type { AppMenu } from '@/lib/menu-types'
import { separator } from '@/lib/menu-types'
import type { OsState } from '@/lib/os-context'
import type { ThemeState } from '@/lib/theme-context'

/**
 * The global Apple () menu. Resolved at render time so it can dispatch into
 * the OS store (power overlays) and theme (for "System Settings…").
 */
export function buildAppleMenu(os: OsState, _theme: ThemeState): AppMenu {
  return {
    label: '',
    items: [
      {
        type: 'action',
        label: 'About This Mac',
        onAction: () => os.setPowerOverlay('about'),
      },
      separator(),
      {
        type: 'action',
        label: 'System Settings…',
        onAction: () => os.setActiveAppId('system-settings'),
      },
      separator(),
      {
        type: 'action',
        label: 'Sleep',
        onAction: () => os.setPowerOverlay('sleep'),
      },
      {
        type: 'action',
        label: 'Restart…',
        onAction: () => os.setPowerOverlay('restart'),
      },
      {
        type: 'action',
        label: 'Shut Down…',
        onAction: () => os.setPowerOverlay('shutdown'),
      },
      separator(),
      {
        type: 'action',
        label: 'Lock Screen',
        shortcut: '⌃⌘Q',
        onAction: () => os.setPowerOverlay('lock'),
      },
    ],
  }
}

/**
 * Standard menus every app exposes, plus placeholders for app-specific ones.
 * Apps will extend this with their own menus in Step 3 (registry) / Phase 3.
 */
export function buildDefaultAppMenus(appName: string): AppMenu[] {
  return [
    {
      label: 'File',
      items: [
        { type: 'action', label: 'New Window', shortcut: '⌘N' },
        { type: 'action', label: 'New Tab', shortcut: '⌘T', disabled: true },
        { type: 'separator' },
        { type: 'action', label: 'Open…', shortcut: '⌘O' },
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
        { type: 'action', label: 'Select All', shortcut: '⌘A' },
      ],
    },
    {
      label: 'View',
      items: [
        { type: 'action', label: 'as Icons', shortcut: '⌘1' },
        { type: 'action', label: 'as List', shortcut: '⌘2' },
        { type: 'separator' },
        { type: 'action', label: 'Show Toolbar' },
        { type: 'action', label: 'Enter Full Screen', shortcut: '⌃⌘F' },
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
      items: [{ type: 'action', label: `${appName} Help` }],
    },
  ]
}
