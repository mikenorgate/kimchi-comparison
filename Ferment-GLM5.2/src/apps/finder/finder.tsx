import { useState, useCallback, useMemo } from 'react'
import { useFileStore, type FSNode } from '../../store/file-store'
import { AppIcon } from '../../primitives/app-icon'

type ViewMode = 'list' | 'icon'

const SIDEBAR_SECTIONS: { title: string; items: { id: string; name: string; icon: string }[] }[] = [
  {
    title: 'Favorites',
    items: [
      { id: 'desktop', name: 'Desktop', icon: 'finder' },
      { id: 'documents', name: 'Documents', icon: 'notes' },
      { id: 'downloads', name: 'Downloads', icon: 'finder' },
      { id: 'apps', name: 'Applications', icon: 'finder' },
    ],
  },
  {
    title: 'iCloud',
    items: [
      { id: 'pictures', name: 'Pictures', icon: 'photos' },
    ],
  },
  {
    title: 'Locations',
    items: [
      { id: 'root', name: 'Macintosh HD', icon: 'finder' },
    ],
  },
]

function nodeIcon(node: FSNode): string {
  if (node.type === 'folder') return 'finder'
  if (node.name.endsWith('.txt') || node.name.endsWith('.md')) return 'notes'
  if (node.name.endsWith('.png') || node.name.endsWith('.jpg')) return 'photos'
  return 'notes'
}

export function Finder({ windowId: _windowId }: { windowId: string }) {
  const { tree, getChildren, getPath, createNode, deleteNode, renameNode } = useFileStore()
  const [currentFolderId, setCurrentFolderId] = useState('documents')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const children = useMemo(() => getChildren(currentFolderId), [getChildren, currentFolderId, tree])
  const breadcrumbs = useMemo(() => getPath(currentFolderId), [getPath, currentFolderId, tree])

  const navigateTo = useCallback((id: string) => {
    setCurrentFolderId(id)
    setSelectedId(null)
  }, [])

  const handleNewFolder = useCallback(() => {
    const id = createNode('New Folder', 'folder', currentFolderId)
    setSelectedId(id)
    setRenamingId(id)
    setRenameValue('New Folder')
  }, [createNode, currentFolderId])

  const handleNewFile = useCallback(() => {
    const id = createNode('Untitled.txt', 'file', currentFolderId)
    setSelectedId(id)
    setRenamingId(id)
    setRenameValue('Untitled.txt')
  }, [createNode, currentFolderId])

  const handleDelete = useCallback(() => {
    if (selectedId) {
      deleteNode(selectedId)
      setSelectedId(null)
    }
  }, [selectedId, deleteNode])

  const handleStartRename = useCallback((node: FSNode) => {
    setRenamingId(node.id)
    setRenameValue(node.name)
  }, [])

  const handleCommitRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameNode(renamingId, renameValue.trim())
    }
    setRenamingId(null)
  }, [renamingId, renameValue, renameNode])

  const handleOpen = useCallback((node: FSNode) => {
    if (node.type === 'folder') {
      navigateTo(node.id)
    }
    // Files will be opened by TextEdit in a later step; for now just select
    setSelectedId(node.id)
  }, [navigateTo])

  return (
    <div data-testid="finder-root" style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div
        data-testid="finder-toolbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderBottom: '0.5px solid var(--glass-border)',
          background: 'var(--glass-bg)',
        }}
      >
        <button data-testid="finder-new-folder" onClick={handleNewFolder} style={toolbarBtn}>+ Folder</button>
        <button data-testid="finder-new-file" onClick={handleNewFile} style={toolbarBtn}>+ File</button>
        <button data-testid="finder-delete" onClick={handleDelete} disabled={!selectedId} style={{ ...toolbarBtn, opacity: selectedId ? 1 : 0.4 }}>
          Delete
        </button>
        <div style={{ flex: 1 }} />
        <button
          data-testid="finder-view-list"
          onClick={() => setViewMode('list')}
          style={{ ...toolbarBtn, fontWeight: viewMode === 'list' ? 700 : 400 }}
        >
          List
        </button>
        <button
          data-testid="finder-view-icon"
          onClick={() => setViewMode('icon')}
          style={{ ...toolbarBtn, fontWeight: viewMode === 'icon' ? 700 : 400 }}
        >
          Icons
        </button>
      </div>

      {/* Breadcrumbs */}
      <div data-testid="finder-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>
        {breadcrumbs.map((node, i) => (
          <span key={node.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <span>›</span>}
            <button
              data-testid={`breadcrumb-${node.id}`}
              onClick={() => navigateTo(node.id)}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, padding: 0 }}
            >
              {node.name}
            </button>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div
          data-testid="finder-sidebar"
          style={{
            width: 180,
            borderRight: '0.5px solid var(--glass-border)',
            background: 'rgba(128,128,128,0.06)',
            overflowY: 'auto',
            padding: '8px 0',
            flexShrink: 0,
          }}
        >
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', padding: '8px 12px 4px', textTransform: 'uppercase' }}>
                {section.title}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  data-testid={`sidebar-${item.id}`}
                  onClick={() => navigateTo(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '4px 12px',
                    border: 'none',
                    background: currentFolderId === item.id ? 'var(--accent-blue)' : 'transparent',
                    color: currentFolderId === item.id ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: 13,
                    textAlign: 'left',
                  }}
                >
                  <AppIcon name={item.icon} size={16} />
                  {item.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Content area */}
        <div data-testid="finder-content" style={{ flex: 1, overflow: 'auto', padding: 8 }}>
          {viewMode === 'list' ? (
            <div data-testid="finder-list-view">
              <div style={{ display: 'flex', borderBottom: '0.5px solid var(--glass-border)', paddingBottom: 4, marginBottom: 4, fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                <span style={{ flex: 1 }}>Name</span>
                <span style={{ width: 100 }}>Date Modified</span>
                <span style={{ width: 60 }}>Kind</span>
              </div>
              {children.length === 0 ? (
                <div data-testid="finder-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  This folder is empty
                </div>
              ) : (
                children.map((node) => (
                  <div
                    key={node.id}
                    data-testid={`fs-node-${node.id}`}
                    onClick={() => setSelectedId(node.id)}
                    onDoubleClick={() => handleOpen(node)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 6px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: selectedId === node.id ? 'var(--accent-blue)' : 'transparent',
                      color: selectedId === node.id ? 'white' : 'var(--text-primary)',
                      fontSize: 13,
                    }}
                  >
                    <AppIcon name={nodeIcon(node)} size={18} />
                    {renamingId === node.id ? (
                      <input
                        data-testid={`rename-input-${node.id}`}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleCommitRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommitRename()
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        autoFocus
                        style={{ fontSize: 13, border: '1px solid var(--accent-blue)', borderRadius: 3, padding: '0 4px' }}
                      />
                    ) : (
                      <span
                        data-testid={`node-name-${node.id}`}
                        onDoubleClick={(e) => { e.stopPropagation(); handleStartRename(node) }}
                        style={{ flex: 1 }}
                      >
                        {node.name}
                      </span>
                    )}
                    <span style={{ width: 100, fontSize: 11, color: selectedId === node.id ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                      {new Date(node.modifiedAt).toLocaleDateString()}
                    </span>
                    <span style={{ width: 60, fontSize: 11, color: selectedId === node.id ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>
                      {node.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div data-testid="finder-icon-view" style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {children.length === 0 ? (
                <div data-testid="finder-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
                  This folder is empty
                </div>
              ) : (
                children.map((node) => (
                  <div
                    key={node.id}
                    data-testid={`fs-node-${node.id}`}
                    onClick={() => setSelectedId(node.id)}
                    onDoubleClick={() => handleOpen(node)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      width: 90,
                      padding: 8,
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: selectedId === node.id ? 'rgba(10,132,255,0.2)' : 'transparent',
                    }}
                  >
                    <AppIcon name={nodeIcon(node)} size={48} />
                    {renamingId === node.id ? (
                      <input
                        data-testid={`rename-input-${node.id}`}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleCommitRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommitRename()
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        autoFocus
                        style={{ fontSize: 12, border: '1px solid var(--accent-blue)', borderRadius: 3, width: '100%', textAlign: 'center' }}
                      />
                    ) : (
                      <span
                        data-testid={`node-name-${node.id}`}
                        onDoubleClick={(e) => { e.stopPropagation(); handleStartRename(node) }}
                        style={{ fontSize: 12, color: 'var(--text-primary)', textAlign: 'center', wordBreak: 'break-word' }}
                      >
                        {node.name}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const toolbarBtn: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 13,
  padding: '2px 8px',
  borderRadius: 4,
}
