export interface FinderEntry { name: string; kind: 'folder' | 'file'; icon: string }
export interface FinderSection { id: string; label: string; entries: FinderEntry[] }
export const FINDER_SECTIONS: FinderSection[] = [
  { id: 'recents', label: 'Recents', entries: [
    { name: 'Resume.pdf', kind: 'file', icon: '📄' },
    { name: 'Screenshot.png', kind: 'file', icon: '🖼' },
    { name: 'Budget.xlsx', kind: 'file', icon: '📊' },
  ]},
  { id: 'applications', label: 'Applications', entries: [
    { name: 'Safari', kind: 'folder', icon: '🧭' },
    { name: 'Mail', kind: 'folder', icon: '✉' },
    { name: 'Notes', kind: 'folder', icon: '📝' },
    { name: 'Calculator', kind: 'folder', icon: '🧮' },
    { name: 'Terminal', kind: 'folder', icon: '⌨' },
    { name: 'System Settings', kind: 'folder', icon: '⚙' },
  ]},
  { id: 'desktop', label: 'Desktop', entries: [
    { name: 'Projects', kind: 'folder', icon: '📁' },
    { name: 'todo.txt', kind: 'file', icon: '📝' },
    { name: 'wallpaper.jpg', kind: 'file', icon: '🖼' },
  ]},
  { id: 'documents', label: 'Documents', entries: [
    { name: 'Work', kind: 'folder', icon: '📁' },
    { name: 'Personal', kind: 'folder', icon: '📁' },
    { name: 'Invoice.pdf', kind: 'file', icon: '📄' },
    { name: 'Notes.txt', kind: 'file', icon: '📝' },
  ]},
  { id: 'downloads', label: 'Downloads', entries: [
    { name: 'installer.dmg', kind: 'file', icon: '💿' },
    { name: 'photo.jpg', kind: 'file', icon: '🖼' },
    { name: 'archive.zip', kind: 'file', icon: '🗜' },
  ]},
  { id: 'icloud', label: 'iCloud Drive', entries: [
    { name: 'Cloud Docs', kind: 'folder', icon: '☁' },
    { name: 'Shared', kind: 'folder', icon: '📁' },
  ]},
]
