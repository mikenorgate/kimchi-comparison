import { create } from 'zustand'
import { readPersistent, writePersistent } from '../hooks/usePersistentState'

/**
 * Virtual filesystem store.
 *
 * A flat map of nodes (id → VfsNode) rooted at 'root'. Folders carry an
 * ordered `childrenIds`; files carry `content` + a `kind` that lets the
 * owning app open them (e.g. .txt/.md → Notes). Path resolution supports
 * absolute (`/Documents`), relative (`Notes`, `../Desktop`), `.` and `..`.
 *
 * Persistence uses the shared readPersistent/writePersistent primitives (the
 * same backing usePersistentState) so the FS survives reloads. Duplicate
 * names within a folder are rejected so name-based path resolution stays
 * unambiguous (macOS Finder behaves the same way).
 */

export type VfsNodeType = 'file' | 'folder'
export type FileKind = 'text' | 'markdown' | 'image' | 'unknown'

export interface VfsNode {
  id: string
  name: string
  type: VfsNodeType
  parentId: string | null // null only for root
  childrenIds?: string[] // folders only, ordered
  content?: string // files only
  kind?: FileKind // files only
  createdAt: number
  modifiedAt: number
}

export class VfsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VfsError'
  }
}

export function fileExtension(name: string): string {
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function kindFor(name: string): FileKind {
  const ext = fileExtension(name)
  if (ext === 'md' || ext === 'markdown') return 'markdown'
  if (ext === 'txt' || ext === 'text' || ext === 'log') return 'text'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic'].includes(ext))
    return 'image'
  return 'unknown'
}

/** Maps a file node to the appId that should open it (null if none). */
export function appForFile(node: VfsNode): string | null {
  if (node.type !== 'file') return null
  const kind = node.kind ?? kindFor(node.name)
  if (kind === 'text' || kind === 'markdown') return 'notes'
  return null
}

const STORAGE_KEY = 'tahoe.vfs'

let idCounter = 0
function nextId(): string {
  return `n${++idCounter}`
}

/** Build a fresh seed tree. Fixed ids for root + top-level folders so tests
 *  and apps can reference them deterministically; generated nodes get `n*`. */
function makeSeed(): Record<string, VfsNode> {
  const now = Date.now()
  const nodes: Record<string, VfsNode> = {}

  const folder = (
    id: string,
    name: string,
    parentId: string | null,
    childrenIds: string[] = [],
  ): VfsNode => ({ id, name, type: 'folder', parentId, childrenIds, createdAt: now, modifiedAt: now })

  const file = (
    id: string,
    name: string,
    parentId: string,
    content: string,
  ): VfsNode => ({
    id,
    name,
    type: 'file',
    parentId,
    content,
    kind: kindFor(name),
    createdAt: now,
    modifiedAt: now,
  })

  const welcome = file('welcome', 'Welcome.txt', 'desktop',
    'Welcome to macOS Tahoe!\n\nThis is a virtual filesystem.\nOpen Terminal and try: ls, pwd, cd Documents, cat Welcome.txt')
  const readme = file('readme', 'readme.md', 'documents', '# Documents\n\nYour files live here.')
  const hello = file('hello', 'hello.txt', 'projects', 'Hello, world!')

  nodes.root = folder('root', '', null, [
    'desktop', 'documents', 'downloads', 'pictures', 'projects',
  ])
  nodes.desktop = folder('desktop', 'Desktop', 'root', ['welcome'])
  nodes.documents = folder('documents', 'Documents', 'root', ['notes-folder', 'readme'])
  nodes.downloads = folder('downloads', 'Downloads', 'root')
  nodes.pictures = folder('pictures', 'Pictures', 'root')
  nodes.projects = folder('projects', 'Projects', 'root', ['hello'])
  nodes['notes-folder'] = folder('notes-folder', 'Notes', 'documents')
  nodes.welcome = welcome
  nodes.readme = readme
  nodes.hello = hello

  return nodes
}

export interface CreateNodeInput {
  name: string
  type: VfsNodeType
  parentId: string
  content?: string
}

export interface VfsState {
  nodes: Record<string, VfsNode>
  /** Current working directory node id (Terminal sessions). */
  cwd: string
  // --- queries ---
  getNode: (id: string) => VfsNode | undefined
  listChildren: (id: string) => VfsNode[]
  resolvePath: (path: string, fromId?: string) => string
  pathOf: (id: string) => string
  // --- mutations ---
  createNode: (input: CreateNodeInput) => string
  deleteNode: (id: string) => void
  renameNode: (id: string, name: string) => void
  moveNode: (id: string, newParentId: string) => void
  updateContent: (id: string, content: string) => void
  // --- cwd ---
  setCwd: (path: string) => void
  // --- maintenance ---
  reseed: () => void
}

function childByName(
  nodes: Record<string, VfsNode>,
  parentId: string,
  name: string,
): VfsNode | undefined {
  const parent = nodes[parentId]
  if (!parent || !parent.childrenIds) return undefined
  return parent.childrenIds.map((cid) => nodes[cid]).find((c) => c?.name === name)
}

function isDescendant(
  nodes: Record<string, VfsNode>,
  ancestorId: string,
  nodeId: string,
): boolean {
  let cur: string | null = nodeId
  while (cur) {
    if (cur === ancestorId) return true
    cur = nodes[cur]?.parentId ?? null
  }
  return false
}

function collectDescendants(
  nodes: Record<string, VfsNode>,
  id: string,
): string[] {
  const out: string[] = [id]
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()!
    const node = nodes[cur]
    if (node?.childrenIds) stack.push(...node.childrenIds)
    if (cur !== id) out.push(cur)
  }
  return out
}

function resolve(
  nodes: Record<string, VfsNode>,
  path: string,
  fromId: string,
): string {
  if (!path) throw new VfsError('empty path')
  let current = path.startsWith('/') ? 'root' : fromId
  const segments = path.split('/').filter((s) => s.length > 0)
  for (const seg of segments) {
    const node: VfsNode | undefined = nodes[current]
    if (!node) throw new VfsError(`no such directory: ${path}`)
    if (seg === '.') continue
    if (seg === '..') {
      if (node.parentId) current = node.parentId
      continue // already at root → stay
    }
    const child = childByName(nodes, current, seg)
    if (!child) throw new VfsError(`no such file or directory: ${seg}`)
    current = child.id
  }
  return current
}

function buildPath(nodes: Record<string, VfsNode>, id: string): string {
  const parts: string[] = []
  let cur: string | null = id
  while (cur) {
    const node: VfsNode | undefined = nodes[cur]
    if (!node) break
    if (node.parentId === null) break // root
    parts.unshift(node.name)
    cur = node.parentId
  }
  return '/' + parts.join('/')
}

export const useVfsStore = create<VfsState>((set, get) => ({
  nodes: readPersistent(STORAGE_KEY + '.nodes', makeSeed()),
  cwd: readPersistent<string>(STORAGE_KEY + '.cwd', 'root'),

  getNode: (id) => get().nodes[id],

  listChildren: (id) => {
    const { nodes } = get()
    const node = nodes[id]
    if (!node?.childrenIds) return []
    return node.childrenIds.map((cid) => nodes[cid]).filter(Boolean)
  },

  resolvePath: (path, fromId) => resolve(get().nodes, path, fromId ?? get().cwd),

  pathOf: (id) => {
    const { nodes } = get()
    if (!nodes[id]) throw new VfsError(`no such node: ${id}`)
    return buildPath(nodes, id)
  },

  createNode: ({ name, type, parentId, content }) => {
    const { nodes } = get()
    const parent = nodes[parentId]
    if (!parent) throw new VfsError(`parent not found: ${parentId}`)
    if (parent.type !== 'folder')
      throw new VfsError('parent is not a folder')
    if (childByName(nodes, parentId, name))
      throw new VfsError(`name already exists: ${name}`)
    const id = nextId()
    const now = Date.now()
    const node: VfsNode = {
      id,
      name,
      type,
      parentId,
      createdAt: now,
      modifiedAt: now,
      ...(type === 'folder'
        ? { childrenIds: [] }
        : { content: content ?? '', kind: kindFor(name) }),
    }
    set((s) => ({
      nodes: {
        ...s.nodes,
        [parentId]: {
          ...parent,
          childrenIds: [...(parent.childrenIds ?? []), id],
          modifiedAt: now,
        },
        [id]: node,
      },
    }))
    return id
  },

  deleteNode: (id) => {
    const { nodes } = get()
    if (!nodes[id]) throw new VfsError(`node not found: ${id}`)
    if (id === 'root') throw new VfsError('cannot delete root')
    const node = nodes[id]
    const parentId = node.parentId
    if (!parentId) throw new VfsError('cannot delete root')
    const toDelete = collectDescendants(nodes, id)
    set((s) => {
      const next = { ...s.nodes }
      for (const did of toDelete) delete next[did]
      const parent = next[parentId]
      if (parent) {
        next[parentId] = {
          ...parent,
          childrenIds: (parent.childrenIds ?? []).filter((cid) => cid !== id),
          modifiedAt: Date.now(),
        }
      }
      return { nodes: next, cwd: s.cwd === id ? parentId : s.cwd }
    })
  },

  renameNode: (id, name) => {
    const { nodes } = get()
    const node = nodes[id]
    if (!node) throw new VfsError(`node not found: ${id}`)
    if (!name) throw new VfsError('name cannot be empty')
    if (node.parentId === null) throw new VfsError('cannot rename root')
    if (childByName(nodes, node.parentId, name) && node.name !== name)
      throw new VfsError(`name already exists: ${name}`)
    set((s) => ({
      nodes: {
        ...s.nodes,
        [id]: { ...node, name, modifiedAt: Date.now() },
      },
    }))
  },

  moveNode: (id, newParentId) => {
    const { nodes } = get()
    const node = nodes[id]
    if (!node) throw new VfsError(`node not found: ${id}`)
    const parent = nodes[newParentId]
    if (!parent) throw new VfsError(`parent not found: ${newParentId}`)
    if (parent.type !== 'folder')
      throw new VfsError('target is not a folder')
    if (id === newParentId || isDescendant(nodes, id, newParentId))
      throw new VfsError('cannot move a folder into itself or a descendant')
    if (node.parentId === newParentId) return // no-op
    if (childByName(nodes, newParentId, node.name))
      throw new VfsError(`name already exists in target: ${node.name}`)
    const oldParentId = node.parentId!
    const now = Date.now()
    set((s) => {
      const next = { ...s.nodes }
      const oldParent = next[oldParentId]
      if (oldParent) {
        next[oldParentId] = {
          ...oldParent,
          childrenIds: (oldParent.childrenIds ?? []).filter(
            (cid) => cid !== id,
          ),
          modifiedAt: now,
        }
      }
      next[newParentId] = {
        ...parent,
        childrenIds: [...(parent.childrenIds ?? []), id],
        modifiedAt: now,
      }
      next[id] = { ...node, parentId: newParentId, modifiedAt: now }
      return { nodes: next }
    })
  },

  updateContent: (id, content) => {
    const { nodes } = get()
    const node = nodes[id]
    if (!node) throw new VfsError(`node not found: ${id}`)
    if (node.type !== 'file') throw new VfsError('not a file')
    set((s) => ({
      nodes: {
        ...s.nodes,
        [id]: { ...node, content, modifiedAt: Date.now() },
      },
    }))
  },

  setCwd: (path) => {
    const id = resolve(get().nodes, path, get().cwd)
    const node = get().nodes[id]
    if (!node) throw new VfsError(`no such directory: ${path}`)
    if (node.type !== 'folder') throw new VfsError(`not a directory: ${path}`)
    set({ cwd: id })
  },

  reseed: () => set({ nodes: makeSeed(), cwd: 'root' }),
}))

// Persist nodes + cwd whenever they change.
useVfsStore.subscribe((s) => {
  writePersistent(STORAGE_KEY + '.nodes', s.nodes)
  writePersistent(STORAGE_KEY + '.cwd', s.cwd)
})
