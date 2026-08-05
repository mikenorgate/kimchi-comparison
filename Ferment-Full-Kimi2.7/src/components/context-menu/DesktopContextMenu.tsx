import { ContextMenu } from '../primitives'
import type { ReactNode } from 'react'

export interface DesktopContextMenuProps {
  children: ReactNode
}

export function DesktopContextMenu({ children }: DesktopContextMenuProps) {
  const items = [
    { id: 'new-folder', label: 'New Folder', shortcut: '⇧⌘N' },
    { id: 'get-info', label: 'Get Info', shortcut: '⌘I' },
    { id: 'sep1', label: '', separator: true },
    { id: 'change-wallpaper', label: 'Change Desktop Background...' },
    { id: 'edit-widgets', label: 'Edit Widgets...' },
    { id: 'sep2', label: '', separator: true },
    { id: 'use-stacks', label: 'Use Stacks', shortcut: '⌃⌘O' },
    { id: 'show-view-options', label: 'Show View Options', shortcut: '⌘J' },
  ]

  return <ContextMenu items={items}>{children}</ContextMenu>
}
