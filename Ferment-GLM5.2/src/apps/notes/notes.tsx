import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNoteStore } from '../../store/note-store'

function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  return d.toLocaleDateString()
}

function getPreview(body: string): string {
  const text = body.replace(/<[^>]*>/g, '').trim()
  return text.slice(0, 80) || 'No additional text'
}

export function Notes({ windowId: _windowId }: { windowId: string }) {
  const { notes, folders, createNote, updateNote, deleteNote } = useNoteStore()
  const [selectedFolderId, setSelectedFolderId] = useState('all')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const visibleNotes = useMemo(() => {
    let filtered = selectedFolderId === 'all' ? notes : notes.filter((n) => n.folderId === selectedFolderId)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      )
    }
    return [...filtered].sort((a, b) => b.modifiedAt - a.modifiedAt)
  }, [notes, selectedFolderId, searchQuery])

  const selectedNote = useMemo(
    () => notes.find((n) => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  )

  // Sync editor content when switching notes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = selectedNote?.body ?? ''
    }
  }, [selectedNoteId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = useCallback(() => {
    const id = createNote(selectedFolderId === 'all' ? 'icloud' : selectedFolderId)
    setSelectedNoteId(id)
    setTimeout(() => titleRef.current?.select(), 0)
  }, [createNote, selectedFolderId])

  const handleDelete = useCallback(() => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId)
      setSelectedNoteId(null)
    }
  }, [selectedNoteId, deleteNote])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedNoteId) {
        updateNote(selectedNoteId, { title: e.target.value })
      }
    },
    [selectedNoteId, updateNote]
  )

  const handleBodyInput = useCallback(() => {
    if (selectedNoteId && editorRef.current) {
      updateNote(selectedNoteId, { body: editorRef.current.innerHTML })
    }
  }, [selectedNoteId, updateNote])

  return (
    <div data-testid="notes-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar — folders */}
      <div
        data-testid="notes-sidebar"
        style={{
          width: 180,
          borderRight: '0.5px solid var(--glass-border)',
          background: 'rgba(128,128,128,0.06)',
          overflowY: 'auto',
          flexShrink: 0,
          padding: '8px 0',
        }}
      >
        <div style={{ padding: '0 12px 8px' }}>
          <button
            data-testid="notes-new-btn"
            onClick={handleCreate}
            style={{
              width: '100%',
              padding: '6px',
              border: 'none',
              borderRadius: 6,
              background: 'var(--accent-blue)',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + New Note
          </button>
        </div>
        {folders.map((folder) => (
          <button
            key={folder.id}
            data-testid={`notes-folder-${folder.id}`}
            onClick={() => { setSelectedFolderId(folder.id); setSelectedNoteId(null) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '4px 12px',
              border: 'none',
              background: selectedFolderId === folder.id ? 'var(--accent-blue)' : 'transparent',
              color: selectedFolderId === folder.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 13,
              textAlign: 'left',
            }}
          >
            {folder.name}
          </button>
        ))}
      </div>

      {/* Middle — notes list */}
      <div
        data-testid="notes-list-panel"
        style={{
          width: 240,
          borderRight: '0.5px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '8px 10px' }}>
          <input
            data-testid="notes-search"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '0.5px solid var(--glass-border)',
              borderRadius: 6,
              background: 'var(--glass-bg)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>
        <div data-testid="notes-list" style={{ flex: 1, overflowY: 'auto' }}>
          {visibleNotes.length === 0 ? (
            <div data-testid="notes-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No Notes
            </div>
          ) : (
            visibleNotes.map((note) => (
              <div
                key={note.id}
                data-testid={`note-item-${note.id}`}
                onClick={() => setSelectedNoteId(note.id)}
                style={{
                  padding: '8px 12px',
                  borderBottom: '0.5px solid var(--glass-border)',
                  cursor: 'pointer',
                  background: selectedNoteId === note.id ? 'var(--accent-blue)' : 'transparent',
                  color: selectedNoteId === note.id ? 'white' : 'var(--text-primary)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.title || 'New Note'}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{formatDate(note.modifiedAt)}</span>
                  <span data-testid={`note-preview-${note.id}`} style={{ fontSize: 11, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {getPreview(note.body)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right — editor */}
      <div data-testid="notes-editor-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedNote ? (
          <>
            <div style={{ padding: '8px 16px', borderBottom: '0.5px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                ref={titleRef}
                data-testid="notes-title-input"
                type="text"
                value={selectedNote.title}
                onChange={handleTitleChange}
                placeholder="Title"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: 18,
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <button
                data-testid="notes-delete-btn"
                onClick={handleDelete}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#ff5f57',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Delete
              </button>
            </div>
            <div
              ref={editorRef}
              data-testid="notes-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={handleBodyInput}
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                color: 'var(--text-primary)',
                fontSize: 14,
                lineHeight: 1.6,
                outline: 'none',
              }}
            />
          </>
        ) : (
          <div data-testid="notes-no-selection" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 16 }}>
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
