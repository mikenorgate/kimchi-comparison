import { create } from 'zustand'

export type FileType = 'file' | 'folder'

export interface FSNode {
  id: string
  name: string
  type: FileType
  parentId: string | null
  content?: string // for files
  createdAt: number
  modifiedAt: number
}

export type FSTree = Record<string, FSNode>

const FS_KEY = 'tahoe.filesystem'

function createDefaultFS(): FSTree {
  const now = Date.now()
  const root: FSNode = { id: 'root', name: 'Macintosh HD', type: 'folder', parentId: null, createdAt: now, modifiedAt: now }
  const desktop: FSNode = { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'root', createdAt: now, modifiedAt: now }
  const documents: FSNode = { id: 'documents', name: 'Documents', type: 'folder', parentId: 'root', createdAt: now, modifiedAt: now }
  const downloads: FSNode = { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'root', createdAt: now, modifiedAt: now }
  const pictures: FSNode = { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'root', createdAt: now, modifiedAt: now }
  const apps: FSNode = { id: 'apps', name: 'Applications', type: 'folder', parentId: 'root', createdAt: now, modifiedAt: now }
  const welcome: FSNode = { id: 'welcome-txt', name: 'Welcome.txt', type: 'file', parentId: 'documents', content: 'Welcome to macOS Tahoe Web!', createdAt: now, modifiedAt: now }
  return {
    root, desktop, documents, downloads, pictures, apps, 'welcome-txt': welcome,
  }
}

function loadFS(): FSTree {
  if (typeof window === 'undefined') return createDefaultFS()
  try {
    const stored = localStorage.getItem(FS_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  const def = createDefaultFS()
  persistFS(def)
  return def
}

function persistFS(tree: FSTree) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(FS_KEY, JSON.stringify(tree))
  } catch { /* ignore */ }
}

let nodeCounter = 0
function genId(): string {
  return `node-${Date.now()}-${++nodeCounter}`
}

interface FileStore {
  tree: FSTree
  createNode: (name: string, type: FileType, parentId: string) => string
  deleteNode: (id: string) => void
  renameNode: (id: string, name: string) => void
  getNode: (id: string) => FSNode | undefined
  getChildren: (parentId: string) => FSNode[]
  getPath: (id: string) => FSNode[]
  updateContent: (id: string, content: string) => void
  moveNode: (id: string, newParentId: string) => void
  reset: () => void
}

const initial = loadFS()

export const useFileStore = create<FileStore>((set, get) => ({
  tree: initial,
  createNode: (name, type, parentId) => {
    const id = genId()
    const now = Date.now()
    const node: FSNode = { id, name, type, parentId, createdAt: now, modifiedAt: now, content: type === 'file' ? '' : undefined }
    const tree = { ...get().tree, [id]: node }
    persistFS(tree)
    set({ tree })
    return id
  },
  deleteNode: (id) => {
    const tree = { ...get().tree }
    // Recursively delete children
    const toDelete: string[] = [id]
    let changed = true
    while (changed) {
      changed = false
      for (const node of Object.values(tree)) {
        if (node.parentId && toDelete.includes(node.parentId) && !toDelete.includes(node.id)) {
          toDelete.push(node.id)
          changed = true
        }
      }
    }
    for (const did of toDelete) delete tree[did]
    persistFS(tree)
    set({ tree })
  },
  renameNode: (id, name) => {
    const tree = { ...get().tree }
    if (!tree[id]) return
    tree[id] = { ...tree[id], name, modifiedAt: Date.now() }
    persistFS(tree)
    set({ tree })
  },
  getNode: (id) => get().tree[id],
  getChildren: (parentId) =>
    Object.values(get().tree)
      .filter((n) => n.parentId === parentId)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
        return a.name.localeCompare(b.name)
      }),
  getPath: (id) => {
    const path: FSNode[] = []
    let cur: FSNode | undefined = get().tree[id]
    while (cur) {
      path.unshift(cur)
      cur = cur.parentId ? get().tree[cur.parentId] : undefined
    }
    return path
  },
  updateContent: (id, content) => {
    const tree = { ...get().tree }
    if (!tree[id]) return
    tree[id] = { ...tree[id], content, modifiedAt: Date.now() }
    persistFS(tree)
    set({ tree })
  },
  moveNode: (id, newParentId) => {
    const tree = { ...get().tree }
    if (!tree[id] || !tree[newParentId]) return
    tree[id] = { ...tree[id], parentId: newParentId, modifiedAt: Date.now() }
    persistFS(tree)
    set({ tree })
  },
  reset: () => {
    const def = createDefaultFS()
    persistFS(def)
    set({ tree: def })
  },
}))
