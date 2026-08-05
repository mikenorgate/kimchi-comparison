import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Search,
  Folder,
  FileText,
  AppWindow,
  HardDrive,
  Home,
  Download,
  Image as ImageIcon,
  Clock,
  Wifi,
} from 'lucide-react'
import { fileTree, favorites, findNodeById, getPath } from './data'
import type { FileSystemNode, ViewMode } from './types'

function NodeIcon({ node, className = 'w-10 h-10' }: { node: FileSystemNode; className?: string }) {
  switch (node.kind) {
    case 'folder':
      return <Folder className={`text-tahoe-yellow ${className}`} />
    case 'app':
      return <AppWindow className={`text-tahoe-blue ${className}`} />
    case 'file':
      if (node.name.endsWith('.jpg') || node.name.endsWith('.png')) {
        return <ImageIcon className={`text-tahoe-purple ${className}`} />
      }
      return <FileText className={`text-tahoe-text-secondary ${className}`} />
    default:
      return <FileText className={`text-tahoe-text-secondary ${className}`} />
  }
}

export function Finder() {
  const [currentId, setCurrentId] = useState('user-mike')
  const [view, setView] = useState<ViewMode>('icon')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const current = useMemo(() => findNodeById(fileTree, currentId) ?? fileTree, [currentId])
  const path = useMemo(() => getPath(fileTree, currentId), [currentId])

  const items = useMemo(() => {
    const children = current.children ?? []
    if (!search.trim()) return children
    const term = search.toLowerCase()
    return children.filter((child) => child.name.toLowerCase().includes(term))
  }, [current, search])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleOpen = (node: FileSystemNode) => {
    if (node.kind === 'folder') {
      setCurrentId(node.id)
      setSelectedIds(new Set())
    }
  }

  return (
    <div className="flex h-full w-full bg-tahoe-window text-tahoe-text select-none">
      {/* Sidebar */}
      <aside data-testid="finder-sidebar" className="w-44 flex-shrink-0 bg-tahoe-sidebar/80 backdrop-blur-tahoe border-r border-tahoe-glass-border p-3 overflow-auto">
        <div className="text-xs font-semibold text-tahoe-text-secondary uppercase tracking-wide mb-2 px-2">Favorites</div>
        <nav className="space-y-0.5">
          {favorites.map((fav) => {
            const node = findNodeById(fileTree, fav.nodeId)
            if (!node) return null
            return (
              <button
                key={fav.id}
                onClick={() => {
                  setCurrentId(fav.nodeId)
                  setSelectedIds(new Set())
                }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                  currentId === fav.nodeId ? 'bg-tahoe-accent text-white' : 'text-tahoe-text hover:bg-tahoe-hover'
                }`}
              >
                {fav.name === 'AirDrop' && <Wifi className="w-4 h-4" />}
                {fav.name === 'Recents' && <Clock className="w-4 h-4" />}
                {fav.name === 'Applications' && <AppWindow className="w-4 h-4" />}
                {fav.name === 'Documents' && <FileText className="w-4 h-4" />}
                {fav.name === 'Downloads' && <Download className="w-4 h-4" />}
                {fav.name === 'Pictures' && <ImageIcon className="w-4 h-4" />}
                <span className="truncate">{fav.name}</span>
              </button>
            )
          })}
        </nav>
        <div className="text-xs font-semibold text-tahoe-text-secondary uppercase tracking-wide mt-4 mb-2 px-2">Locations</div>
        <nav className="space-y-0.5">
          <button
            onClick={() => {
              setCurrentId('root')
              setSelectedIds(new Set())
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              currentId === 'root' ? 'bg-tahoe-accent text-white' : 'text-tahoe-text hover:bg-tahoe-hover'
            }`}
          >
            <HardDrive className="w-4 h-4" /> Macintosh HD
          </button>
          <button
            onClick={() => {
              setCurrentId('user-mike')
              setSelectedIds(new Set())
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              currentId === 'user-mike' ? 'bg-tahoe-accent text-white' : 'text-tahoe-text hover:bg-tahoe-hover'
            }`}
          >
            <Home className="w-4 h-4" /> Home
          </button>
        </nav>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 flex items-center gap-2 px-3 border-b border-tahoe-glass-border bg-tahoe-titlebar/60 backdrop-blur-tahoe">
          <div className="flex items-center gap-1">
            <button
              onClick={() => path.length > 1 && setCurrentId(path[path.length - 2].id)}
              disabled={path.length <= 1}
              className="p-1.5 rounded-md hover:bg-tahoe-hover disabled:opacity-30"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-tahoe-hover disabled:opacity-30" disabled aria-label="Forward">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center text-sm text-tahoe-text bg-tahoe-hover/50 rounded-md px-2 py-1 flex-1 min-w-0 mx-2">
            {path.map((node, idx) => (
              <span key={node.id} className="flex items-center">
                <button
                  onClick={() => {
                    setCurrentId(node.id)
                    setSelectedIds(new Set())
                  }}
                  className="hover:bg-tahoe-hover rounded px-1 truncate"
                >
                  {node.name}
                </button>
                {idx < path.length - 1 && <span className="mx-1 text-tahoe-text-tertiary">›</span>}
              </span>
            ))}
          </div>

          <div className="flex items-center bg-tahoe-search rounded-lg px-2 py-1">
            <Search className="w-4 h-4 text-tahoe-text-tertiary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="bg-transparent text-sm ml-2 outline-none placeholder:text-tahoe-text-tertiary w-32"
            />
          </div>

          <div className="flex items-center bg-tahoe-hover/50 rounded-md p-0.5 ml-1">
            <button
              onClick={() => setView('icon')}
              className={`p-1.5 rounded ${view === 'icon' ? 'bg-tahoe-window shadow-sm' : 'hover:bg-tahoe-hover'}`}
              aria-label="Icon view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded ${view === 'list' ? 'bg-tahoe-window shadow-sm' : 'hover:bg-tahoe-hover'}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div data-testid="finder-content" className="flex-1 overflow-auto p-4">
          {view === 'icon' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-4">
              {items.map((node) => (
                <button
                  key={node.id}
                  onClick={() => toggleSelect(node.id)}
                  onDoubleClick={() => handleOpen(node)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    selectedIds.has(node.id) ? 'bg-tahoe-accent/20 ring-1 ring-tahoe-accent' : 'hover:bg-tahoe-hover'
                  }`}
                >
                  <NodeIcon node={node} />
                  <span className="text-xs text-center break-words w-full line-clamp-2">{node.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-[1fr_6rem_8rem] text-xs text-tahoe-text-secondary border-b border-tahoe-glass-border pb-1 px-2">
                <span>Name</span>
                <span>Size</span>
                <span>Modified</span>
              </div>
              {items.map((node) => (
                <button
                  key={node.id}
                  onClick={() => toggleSelect(node.id)}
                  onDoubleClick={() => handleOpen(node)}
                  className={`w-full grid grid-cols-[1fr_6rem_8rem] items-center text-sm px-2 py-1 rounded-md transition-colors ${
                    selectedIds.has(node.id) ? 'bg-tahoe-accent text-white' : 'hover:bg-tahoe-hover'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <NodeIcon node={node} className="w-5 h-5" />
                    {node.name}
                  </span>
                  <span>{node.size ?? '--'}</span>
                  <span>{node.modified ?? '--'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-7 flex items-center justify-between px-3 text-xs text-tahoe-text-secondary border-t border-tahoe-glass-border bg-tahoe-titlebar/40">
          <span>{items.length} items</span>
          <span>{selectedIds.size} selected</span>
        </div>
      </main>
    </div>
  )
}
