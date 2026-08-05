import type { FileSystemNode } from './types'

export const fileTree: FileSystemNode = {
  id: 'root',
  name: 'Macintosh HD',
  kind: 'folder',
  children: [
    {
      id: 'applications',
      name: 'Applications',
      kind: 'folder',
      children: [
        { id: 'app-finder', name: 'Finder.app', kind: 'app', size: '12 MB', modified: 'Today, 9:00 AM' },
        { id: 'app-safari', name: 'Safari.app', kind: 'app', size: '28 MB', modified: 'Yesterday, 4:20 PM' },
        { id: 'app-terminal', name: 'Terminal.app', kind: 'app', size: '8 MB', modified: 'Aug 1, 2026' },
        { id: 'app-settings', name: 'System Settings.app', kind: 'app', size: '22 MB', modified: 'Aug 5, 2026' },
        { id: 'app-calculator', name: 'Calculator.app', kind: 'app', size: '5 MB', modified: 'Aug 5, 2026' },
        { id: 'app-notes', name: 'Notes.app', kind: 'app', size: '18 MB', modified: 'Aug 5, 2026' },
        { id: 'app-mail', name: 'Mail.app', kind: 'app', size: '45 MB', modified: 'Aug 5, 2026' },
        { id: 'app-messages', name: 'Messages.app', kind: 'app', size: '38 MB', modified: 'Aug 5, 2026' },
        { id: 'app-calendar', name: 'Calendar.app', kind: 'app', size: '25 MB', modified: 'Aug 5, 2026' },
        { id: 'app-photos', name: 'Photos.app', kind: 'app', size: '120 MB', modified: 'Aug 5, 2026' },
        { id: 'app-music', name: 'Music.app', kind: 'app', size: '95 MB', modified: 'Aug 5, 2026' },
        { id: 'app-maps', name: 'Maps.app', kind: 'app', size: '88 MB', modified: 'Aug 5, 2026' },
        { id: 'app-tv', name: 'TV.app', kind: 'app', size: '72 MB', modified: 'Aug 5, 2026' },
        { id: 'app-weather', name: 'Weather.app', kind: 'app', size: '15 MB', modified: 'Aug 5, 2026' },
        { id: 'app-clock', name: 'Clock.app', kind: 'app', size: '10 MB', modified: 'Aug 5, 2026' },
        { id: 'app-facetime', name: 'FaceTime.app', kind: 'app', size: '42 MB', modified: 'Aug 5, 2026' },
        { id: 'app-reminders', name: 'Reminders.app', kind: 'app', size: '20 MB', modified: 'Aug 5, 2026' },
        { id: 'app-appstore', name: 'App Store.app', kind: 'app', size: '110 MB', modified: 'Aug 5, 2026' },
        { id: 'app-contacts', name: 'Contacts.app', kind: 'app', size: '30 MB', modified: 'Aug 5, 2026' },
        { id: 'app-books', name: 'Books.app', kind: 'app', size: '55 MB', modified: 'Aug 5, 2026' },
        { id: 'app-podcasts', name: 'Podcasts.app', kind: 'app', size: '48 MB', modified: 'Aug 5, 2026' },
        { id: 'app-news', name: 'News.app', kind: 'app', size: '35 MB', modified: 'Aug 5, 2026' },
        { id: 'app-stocks', name: 'Stocks.app', kind: 'app', size: '28 MB', modified: 'Aug 5, 2026' },
        { id: 'app-home', name: 'Home.app', kind: 'app', size: '40 MB', modified: 'Aug 5, 2026' },
        { id: 'app-voicememos', name: 'Voice Memos.app', kind: 'app', size: '22 MB', modified: 'Aug 5, 2026' },
        { id: 'app-freeform', name: 'Freeform.app', kind: 'app', size: '60 MB', modified: 'Aug 5, 2026' },
        { id: 'app-passwords', name: 'Passwords.app', kind: 'app', size: '33 MB', modified: 'Aug 5, 2026' },
      ],
    },
    {
      id: 'users',
      name: 'Users',
      kind: 'folder',
      children: [
        {
          id: 'user-mike',
          name: 'mike',
          kind: 'folder',
          children: [
            {
              id: 'documents',
              name: 'Documents',
              kind: 'folder',
              children: [
                { id: 'resume', name: 'Resume.pdf', kind: 'file', size: '240 KB', modified: 'Aug 3, 2026' },
                { id: 'budget', name: 'Budget.xlsx', kind: 'file', size: '18 KB', modified: 'Aug 2, 2026' },
              ],
            },
            {
              id: 'downloads',
              name: 'Downloads',
              kind: 'folder',
              children: [
                { id: 'installer', name: 'installer.dmg', kind: 'file', size: '1.2 GB', modified: 'Jul 30, 2026' },
              ],
            },
            {
              id: 'pictures',
              name: 'Pictures',
              kind: 'folder',
              children: [
                { id: 'photo1', name: 'Vacation.jpg', kind: 'file', size: '3.4 MB', modified: 'Jul 25, 2026' },
                { id: 'photo2', name: 'Screenshot.png', kind: 'file', size: '1.1 MB', modified: 'Jul 28, 2026' },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'system',
      name: 'System',
      kind: 'folder',
      children: [
        { id: 'library', name: 'Library', kind: 'folder', children: [] },
        { id: 'logs', name: 'Logs', kind: 'folder', children: [] },
      ],
    },
  ],
}

export const favorites: { id: string; name: string; nodeId: string }[] = [
  { id: 'fav-airdrop', name: 'AirDrop', nodeId: 'root' },
  { id: 'fav-recents', name: 'Recents', nodeId: 'root' },
  { id: 'fav-applications', name: 'Applications', nodeId: 'applications' },
  { id: 'fav-documents', name: 'Documents', nodeId: 'documents' },
  { id: 'fav-downloads', name: 'Downloads', nodeId: 'downloads' },
  { id: 'fav-pictures', name: 'Pictures', nodeId: 'pictures' },
]

export function findNodeById(node: FileSystemNode, id: string): FileSystemNode | null {
  if (node.id === id) return node
  if (!node.children) return null
  for (const child of node.children) {
    const found = findNodeById(child, id)
    if (found) return found
  }
  return null
}

export function getPath(node: FileSystemNode, id: string): FileSystemNode[] {
  const walk = (current: FileSystemNode, targetId: string, acc: FileSystemNode[]): FileSystemNode[] | null => {
    if (current.id === targetId) return [...acc, current]
    if (!current.children) return null
    for (const child of current.children) {
      const result = walk(child, targetId, [...acc, current])
      if (result) return result
    }
    return null
  }
  return walk(node, id, []) ?? [node]
}
