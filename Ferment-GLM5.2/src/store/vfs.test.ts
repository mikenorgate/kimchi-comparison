import { beforeEach, describe, expect, it } from 'vitest'
import {
  useVfsStore,
  VfsError,
  kindFor,
  appForFile,
  fileExtension,
  type VfsNode,
} from './vfs'

/**
 * Virtual filesystem store — tree CRUD, path resolution, and persistence.
 * Each test starts from a clean seed (clear localStorage + reseed) so the
 * singleton store is deterministic.
 */

function reseed() {
  localStorage.clear()
  useVfsStore.getState().reseed()
  // The subscribe listener persists asynchronously after setState; flush it
  // synchronously so a fresh store read in the same tick is consistent.
  const s = useVfsStore.getState()
  localStorage.setItem('tahoe.vfs.nodes', JSON.stringify(s.nodes))
  localStorage.setItem('tahoe.vfs.cwd', JSON.stringify(s.cwd))
}

beforeEach(() => {
  reseed()
})

describe('seed data', () => {
  it('seeds root with Desktop/Documents/Downloads/Pictures/Projects', () => {
    const { nodes } = useVfsStore.getState()
    const root = nodes.root
    expect(root.type).toBe('folder')
    expect(root.parentId).toBeNull()
    const names = root.childrenIds!.map((id) => nodes[id].name)
    expect(names).toEqual([
      'Desktop',
      'Documents',
      'Downloads',
      'Pictures',
      'Projects',
    ])
  })

  it('seeds Welcome.txt on Desktop with content', () => {
    const { nodes } = useVfsStore.getState()
    const welcome = nodes.welcome
    expect(welcome.type).toBe('file')
    expect(welcome.name).toBe('Welcome.txt')
    expect(welcome.kind).toBe('text')
    expect(welcome.content).toContain('Welcome to macOS Tahoe')
    expect(welcome.parentId).toBe('desktop')
  })
})

describe('path resolution', () => {
  it('resolves absolute paths from root', () => {
    const s = useVfsStore.getState()
    expect(s.resolvePath('/Documents', 'root')).toBe('documents')
    expect(s.resolvePath('/Desktop/Welcome.txt', 'root')).toBe('welcome')
  })

  it('resolves relative paths from the cwd', () => {
    const s = useVfsStore.getState()
    expect(s.resolvePath('Documents', 'root')).toBe('documents')
  })

  it('resolves . and .. segments', () => {
    const s = useVfsStore.getState()
    expect(s.resolvePath('/Documents/.', 'root')).toBe('documents')
    expect(s.resolvePath('/Documents/..', 'root')).toBe('root')
    // .. at root stays at root
    expect(s.resolvePath('/..', 'root')).toBe('root')
  })

  it('throws VfsError on missing segments', () => {
    const s = useVfsStore.getState()
    expect(() => s.resolvePath('/Nope', 'root')).toThrow(VfsError)
    expect(() => s.resolvePath('/Documents/missing.txt', 'root')).toThrow(
      VfsError,
    )
  })

  it('computes the full path of a node', () => {
    const s = useVfsStore.getState()
    expect(s.pathOf('welcome')).toBe('/Desktop/Welcome.txt')
    expect(s.pathOf('documents')).toBe('/Documents')
    expect(s.pathOf('root')).toBe('/')
  })
})

describe('createNode', () => {
  it('creates a file under a folder and lists it', () => {
    const s = useVfsStore.getState()
    const id = s.createNode({
      name: 'todo.txt',
      type: 'file',
      parentId: 'desktop',
      content: 'buy milk',
    })
    const node = useVfsStore.getState().getNode(id)
    expect(node?.type).toBe('file')
    expect(node?.content).toBe('buy milk')
    expect(node?.kind).toBe('text')
    const children = useVfsStore.getState().listChildren('desktop')
    expect(children.map((c) => c.name)).toContain('todo.txt')
  })

  it('creates an empty folder', () => {
    const s = useVfsStore.getState()
    const id = s.createNode({
      name: 'Stuff',
      type: 'folder',
      parentId: 'documents',
    })
    const node = useVfsStore.getState().getNode(id)
    expect(node?.type).toBe('folder')
    expect(node?.childrenIds).toEqual([])
  })

  it('rejects duplicate names in the same folder', () => {
    const s = useVfsStore.getState()
    expect(() =>
      s.createNode({ name: 'Welcome.txt', type: 'file', parentId: 'desktop' }),
    ).toThrow(VfsError)
  })

  it('rejects creating under a file', () => {
    const s = useVfsStore.getState()
    expect(() =>
      s.createNode({ name: 'x', type: 'file', parentId: 'welcome' }),
    ).toThrow(VfsError)
  })
})

describe('deleteNode', () => {
  it('deletes a file and removes it from its parent', () => {
    const s = useVfsStore.getState()
    s.deleteNode('welcome')
    expect(useVfsStore.getState().getNode('welcome')).toBeUndefined()
    const names = useVfsStore
      .getState()
      .listChildren('desktop')
      .map((c) => c.name)
    expect(names).not.toContain('Welcome.txt')
  })

  it('recursively deletes a folder subtree', () => {
    const s = useVfsStore.getState()
    // Documents contains readme + Notes folder
    s.deleteNode('documents')
    expect(useVfsStore.getState().getNode('documents')).toBeUndefined()
    expect(useVfsStore.getState().getNode('readme')).toBeUndefined()
    expect(useVfsStore.getState().getNode('notes-folder')).toBeUndefined()
    const rootChildren = useVfsStore
      .getState()
      .listChildren('root')
      .map((c) => c.name)
    expect(rootChildren).not.toContain('Documents')
  })

  it('refuses to delete root', () => {
    const s = useVfsStore.getState()
    expect(() => s.deleteNode('root')).toThrow(VfsError)
  })
})

describe('renameNode', () => {
  it('renames a node', () => {
    const s = useVfsStore.getState()
    s.renameNode('welcome', 'Hello.txt')
    expect(useVfsStore.getState().getNode('welcome')?.name).toBe('Hello.txt')
  })

  it('rejects a name that already exists in the folder', () => {
    const s = useVfsStore.getState()
    // Desktop already has Welcome.txt; make a second file then collide
    const id = s.createNode({ name: 'a.txt', type: 'file', parentId: 'desktop' })
    expect(() => s.renameNode(id, 'Welcome.txt')).toThrow(VfsError)
  })

  it('rejects empty names', () => {
    expect(() => useVfsStore.getState().renameNode('welcome', '')).toThrow(
      VfsError,
    )
  })
})

describe('moveNode', () => {
  it('moves a node to another folder', () => {
    const s = useVfsStore.getState()
    s.moveNode('welcome', 'documents')
    expect(useVfsStore.getState().getNode('welcome')?.parentId).toBe(
      'documents',
    )
    expect(
      useVfsStore.getState().listChildren('desktop').map((c) => c.name),
    ).not.toContain('Welcome.txt')
    expect(
      useVfsStore.getState().listChildren('documents').map((c) => c.name),
    ).toContain('Welcome.txt')
  })

  it('refuses to move a folder into itself', () => {
    const s = useVfsStore.getState()
    expect(() => s.moveNode('documents', 'documents')).toThrow(VfsError)
  })

  it('refuses to move a folder into a descendant', () => {
    const s = useVfsStore.getState()
    // documents contains notes-folder; moving documents into notes-folder is illegal
    expect(() => s.moveNode('documents', 'notes-folder')).toThrow(VfsError)
  })

  it('refuses to move into a name collision', () => {
    const s = useVfsStore.getState()
    // readme.md lives in Documents; create a readme.md in Projects, move it to Documents → collision
    const id = s.createNode({
      name: 'readme.md',
      type: 'file',
      parentId: 'projects',
    })
    expect(() => s.moveNode(id, 'documents')).toThrow(VfsError)
  })
})

describe('updateContent', () => {
  it('updates file content and modifiedAt', () => {
    const s = useVfsStore.getState()
    const before = s.getNode('welcome')!.modifiedAt
    s.updateContent('welcome', 'new content')
    const after = useVfsStore.getState().getNode('welcome')!
    expect(after.content).toBe('new content')
    expect(after.modifiedAt).toBeGreaterThanOrEqual(before)
  })

  it('refuses to update a folder', () => {
    expect(() => useVfsStore.getState().updateContent('documents', 'x')).toThrow(
      VfsError,
    )
  })
})

describe('cwd', () => {
  it('setCwd resolves and sets the working directory', () => {
    const s = useVfsStore.getState()
    s.setCwd('/Documents')
    expect(useVfsStore.getState().cwd).toBe('documents')
  })

  it('setCwd rejects files', () => {
    expect(() => useVfsStore.getState().setCwd('/Desktop/Welcome.txt')).toThrow(
      VfsError,
    )
  })
})

describe('helpers', () => {
  it('fileExtension and kindFor classify files', () => {
    expect(fileExtension('readme.md')).toBe('md')
    expect(fileExtension('noext')).toBe('')
    expect(kindFor('readme.md')).toBe('markdown')
    expect(kindFor('notes.txt')).toBe('text')
    expect(kindFor('pic.png')).toBe('image')
    expect(kindFor('data.bin')).toBe('unknown')
  })

  it('appForFile maps text/markdown to notes app', () => {
    const text: VfsNode = {
      id: 'x',
      name: 'a.txt',
      type: 'file',
      parentId: 'root',
      content: '',
      kind: 'text',
      createdAt: 0,
      modifiedAt: 0,
    }
    expect(appForFile(text)).toBe('notes')
    const folder: VfsNode = { ...text, type: 'folder' }
    expect(appForFile(folder)).toBeNull()
  })
})

describe('persistence', () => {
  it('mutations are written to localStorage', () => {
    const s = useVfsStore.getState()
    s.createNode({ name: 'persisted.txt', type: 'file', parentId: 'desktop' })
    const raw = localStorage.getItem('tahoe.vfs.nodes')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!) as Record<string, VfsNode>
    const created = Object.values(parsed).find(
      (n) => n.name === 'persisted.txt',
    )
    expect(created).toBeDefined()
    expect(created!.content).toBe('')
  })

  it('reseed writes a fresh tree to localStorage', () => {
    const s = useVfsStore.getState()
    s.createNode({ name: 'temp.txt', type: 'file', parentId: 'desktop' })
    expect(
      useVfsStore.getState().listChildren('desktop').map((c) => c.name),
    ).toContain('temp.txt')
    useVfsStore.getState().reseed()
    expect(
      useVfsStore.getState().listChildren('desktop').map((c) => c.name),
    ).toEqual(['Welcome.txt'])
  })
})
