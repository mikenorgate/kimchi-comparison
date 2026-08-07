import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Folder,
  FileText,
  FolderPlus,
  Trash2,
  Pencil,
} from 'lucide-react'
import {
  useVfsStore,
  appForFile,
  type VfsNode,
} from '../store/vfs'
import { useWindowStore } from '../store/window-manager'
import { useIntentStore } from '../store/intent'
import { getApp } from '../lib/registry'

/**
 * Finder — the macOS file browser.
 *
 * Sidebar favorites (Desktop/Documents/Downloads/Pictures/Projects) navigate
 * on click. The browser view lists the current folder's children; double-
 * click opens a folder (navigate) or dispatches a file to its owning app
 * (text/markdown → Notes). Back/forward walk a per-window history stack.
 * New Folder, Delete, and Rename mutate the shared VFS store (persisted).
 */

const FAVORITES: { id: string; name: string }[] = [
  { id: 'desktop', name: 'Desktop' },
  { id: 'documents', name: 'Documents' },
  { id: 'downloads', name: 'Downloads' },
  { id: 'pictures', name: 'Pictures' },
  { id: 'projects', name: 'Projects' },
]

function uniqueFolderName(existing: VfsNode[]): string {
  const names = new Set(existing.map((n) => n.name))
  let n = 0
  let name = 'untitled folder'
  while (names.has(name)) {
    n++
    name = `untitled folder ${n}`
  }
  return name
}

export function Finder() {
  const nodes = useVfsStore((s) => s.nodes)
  const createNode = useVfsStore((s) => s.createNode)
  const deleteNode = useVfsStore((s) => s.deleteNode)
  const renameNode = useVfsStore((s) => s.renameNode)

  const windows = useWindowStore((s) => s.windows)
  const openWindow = useWindowStore((s) => s.open)
  const focusWindow = useWindowStore((s) => s.focus)
  const openFile = useIntentStore((s) => s.openFile)

  const [cwdId, setCwdId] = useState('documents')
  const [history, setHistory] = useState<string[]>(['documents'])
  const [idx, setIdx] = useState(0)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')

  // Guard: if the current folder was deleted elsewhere, snap back to Documents.
  useEffect(() => {
    if (!nodes[cwdId]) {
      setCwdId('documents')
      setHistory(['documents'])
      setIdx(0)
    }
  }, [nodes, cwdId])

  const navigate = (id: string) => {
    const next = history.slice(0, idx + 1).concat(id)
    setHistory(next)
    setIdx(next.length - 1)
    setCwdId(id)
    setRenamingId(null)
  }

  const back = () => {
    if (idx > 0) {
      const i = idx - 1
      setIdx(i)
      setCwdId(history[i])
      setRenamingId(null)
    }
  }

  const forward = () => {
    if (idx < history.length - 1) {
      const i = idx + 1
      setIdx(i)
      setCwdId(history[i])
      setRenamingId(null)
    }
  }

  const cwd = nodes[cwdId]
  const children: VfsNode[] = (cwd?.childrenIds ?? [])
    .map((id) => nodes[id])
    .filter((n): n is VfsNode => Boolean(n))

  // Compute the breadcrumb path from root.
  const pathParts: string[] = []
  let cur: string | null = cwdId
  while (cur) {
    const n: VfsNode | undefined = nodes[cur]
    if (!n || n.parentId === null) break
    pathParts.unshift(n.name)
    cur = n.parentId
  }
  const currentPath = '/' + pathParts.join('/')

  const handleNewFolder = () => {
    const name = uniqueFolderName(children)
    const id = createNode({ name, type: 'folder', parentId: cwdId })
    setRenamingId(id)
    setRenameVal(name)
  }

  const handleDelete = (id: string) => {
    deleteNode(id)
    if (renamingId === id) setRenamingId(null)
  }

  const startRename = (node: VfsNode) => {
    setRenamingId(node.id)
    setRenameVal(node.name)
  }

  const commitRename = () => {
    if (renamingId && renameVal.trim()) {
      try {
        renameNode(renamingId, renameVal.trim())
      } catch {
        // duplicate name — ignore, revert
      }
    }
    setRenamingId(null)
  }

  const openItem = (node: VfsNode) => {
    if (node.type === 'folder') {
      navigate(node.id)
      return
    }
    const appId = appForFile(node)
    if (!appId) return
    const existing = windows
      .filter((w) => w.appId === appId)
      .sort((a, b) => b.zIndex - a.zIndex)
    if (existing.length > 0) {
      focusWindow(existing[0].id)
    } else {
      const app = getApp(appId)
      const size = app?.defaultSize ?? { w: 560, h: 400 }
      const offset = windows.length * 28
      openWindow({
        appId,
        title: app?.title ?? appId,
        bounds: { x: 200 + offset, y: 100 + offset, w: size.w, h: size.h },
      })
    }
    openFile(node.id)
  }

  return (
    <div
      data-testid="finder-content"
      className="flex h-full text-[13px]"
    >
      {/* Sidebar */}
      <aside
        data-testid="finder-sidebar"
        className="flex w-44 flex-col gap-0.5 overflow-auto border-r border-black/10 bg-black/[0.04] p-2"
      >
        <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-black/40">
          Favorites
        </div>
        {FAVORITES.map((f) => {
          const node = nodes[f.id]
          if (!node) return null
          const active = cwdId === f.id
          return (
            <button
              key={f.id}
              data-testid={`finder-fav-${f.id}`}
              onClick={() => navigate(f.id)}
              className={`flex items-center gap-2 rounded-md px-2 py-1 text-left ${
                active
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-black/80 hover:bg-black/10'
              }`}
            >
              <Folder size={14} />
              <span className="truncate">{f.name}</span>
            </button>
          )
        })}
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-black/10 px-3 py-2">
          <button
            data-testid="finder-back"
            onClick={back}
            disabled={idx === 0}
            className="rounded p-1 hover:bg-black/10 disabled:opacity-30"
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            data-testid="finder-forward"
            onClick={forward}
            disabled={idx >= history.length - 1}
            className="rounded p-1 hover:bg-black/10 disabled:opacity-30"
            aria-label="Forward"
          >
            <ChevronRight size={16} />
          </button>
          <span
            data-testid="finder-path"
            className="ml-2 truncate text-black/60"
          >
            {currentPath}
          </span>
          <div className="flex-1" />
          <button
            data-testid="finder-new-folder"
            onClick={handleNewFolder}
            className="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-black/10"
          >
            <FolderPlus size={16} />
            <span className="text-xs">New Folder</span>
          </button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto">
          {children.length === 0 ? (
            <div className="p-4 text-black/40">This folder is empty.</div>
          ) : (
            children.map((node) => (
              <div
                key={node.id}
                data-testid={`finder-item-${node.id}`}
                data-name={node.name}
                className="group flex items-center gap-2 border-b border-black/[0.03] px-3 py-1.5 hover:bg-black/5"
                onDoubleClick={() => openItem(node)}
              >
                {node.type === 'folder' ? (
                  <Folder size={16} className="shrink-0 text-[var(--color-accent-blue)]" />
                ) : (
                  <FileText size={16} className="shrink-0 text-black/50" />
                )}
                {renamingId === node.id ? (
                  <input
                    data-testid={`finder-rename-input`}
                    value={renameVal}
                    autoFocus
                    onChange={(e) => setRenameVal(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename()
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    className="rounded border border-[var(--accent)] px-1 text-[13px] outline-none"
                  />
                ) : (
                  <span
                    data-testid={`finder-name-${node.id}`}
                    className="flex-1 truncate"
                  >
                    {node.name}
                  </span>
                )}
                <span className="shrink-0 text-xs text-black/30">
                  {node.type === 'folder'
                    ? 'Folder'
                    : (node.kind ?? 'file')}
                </span>
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
                  <button
                    data-testid={`finder-rename-${node.id}`}
                    onClick={() => startRename(node)}
                    className="rounded p-1 hover:bg-black/10"
                    aria-label={`Rename ${node.name}`}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    data-testid={`finder-delete-${node.id}`}
                    onClick={() => handleDelete(node.id)}
                    className="rounded p-1 hover:bg-black/10"
                    aria-label={`Delete ${node.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Finder
