/**
 * Mock file index for Spotlight search results (separate from Finder's data
 * so Spotlight is self-contained). In a real OS these would be filesystem
 * entries; here they're representative canned content.
 */
export interface SearchEntry {
  kind: 'app' | 'file' | 'folder'
  id: string
  name: string
  /** For apps: the app id to launch. */
  appId?: string
  icon: string
  detail: string
}

export const FILES: SearchEntry[] = [
  { kind: 'file', id: 'f1', name: 'Resume.pdf', icon: '📄', detail: 'Documents' },
  { kind: 'file', id: 'f2', name: 'Budget.xlsx', icon: '📊', detail: 'Documents' },
  { kind: 'file', id: 'f3', name: 'vacation.jpg', icon: '🖼', detail: 'Pictures' },
  { kind: 'file', id: 'f4', name: 'playlist.m3u', icon: '🎵', detail: 'Music' },
  { kind: 'file', id: 'f5', name: 'trip-notes.txt', icon: '📝', detail: 'Documents' },
  { kind: 'folder', id: 'd1', name: 'Projects', icon: '📁', detail: 'Documents' },
  { kind: 'folder', id: 'd2', name: 'Screenshots', icon: '📁', detail: 'Pictures' },
]
