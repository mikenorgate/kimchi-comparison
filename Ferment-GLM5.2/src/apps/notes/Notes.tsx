import { useState } from 'react'

interface Note {
  id: string
  title: string
  body: string
}

let noteCounter = 0

/**
 * Notes app — two-pane layout with sidebar list of notes + editor.
 * Create new note, click a note to edit title+body, delete a note.
 * State held in-memory only.
 */
export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([
    { id: 'note-0', title: 'Welcome', body: 'Welcome to Notes! Click + to create a new note.' },
  ])
  const [selectedId, setSelectedId] = useState<string | null>('note-0')

  const selectedNote = notes.find(n => n.id === selectedId) ?? null

  const createNote = () => {
    noteCounter++
    const id = `note-${Date.now()}-${noteCounter}`
    const newNote: Note = { id, title: 'New Note', body: '' }
    setNotes(prev => [newNote, ...prev])
    setSelectedId(id)
  }

  const deleteNote = (id: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id)
      if (selectedId === id) {
        setSelectedId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))
  }

  return (
    <div
      data-testid="notes"
      style={{
        display: 'flex',
        height: '100%',
        background: '#1e1e1e',
        color: '#fff',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        data-testid="notes-sidebar"
        style={{
          width: '220px',
          minWidth: '220px',
          background: '#2a2a2a',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>Notes</span>
          <button
            data-testid="notes-new"
            onClick={createNote}
            style={{
              background: '#0a84ff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            +
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notes.map(note => (
            <div
              key={note.id}
              data-testid={`notes-item-${note.id}`}
              onClick={() => setSelectedId(note.id)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: selectedId === note.id ? 'rgba(10,132,255,0.3)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {note.title || 'Untitled'}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {note.body.slice(0, 40) || 'No additional text'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedNote ? (
          <>
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <input
                data-testid="notes-title-input"
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                placeholder="Title"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <button
                data-testid="notes-delete"
                onClick={() => deleteNote(selectedNote.id)}
                style={{
                  background: '#ff453a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Delete
              </button>
            </div>
            <textarea
              data-testid="notes-body-input"
              value={selectedNote.body}
              onChange={(e) => updateNote(selectedNote.id, { body: e.target.value })}
              placeholder="Start writing..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                padding: '12px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
