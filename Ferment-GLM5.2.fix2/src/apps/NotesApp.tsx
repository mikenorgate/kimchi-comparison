import { useState } from 'react'
import { INITIAL_NOTES, type Note } from '@/data/notes-data'

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES)
  const [selectedId, setSelectedId] = useState<string>(INITIAL_NOTES[0]?.id ?? '')

  const selected = notes.find((n) => n.id === selectedId) ?? null

  const handleBodyChange = (body: string) => {
    if (!selected) return
    setNotes((prev) =>
      prev.map((n) => (n.id === selected.id ? { ...n, body, updated: 'Just now' } : n)),
    )
  }

  const handleNewNote = () => {
    const id = `n${Date.now()}`
    const note: Note = { id, title: 'New Note', body: '', updated: 'Just now' }
    setNotes((prev) => [note, ...prev])
    setSelectedId(id)
  }

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', color: 'var(--text-primary)' }}>
      <div
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: '1px solid var(--glass-border-inner)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            borderBottom: '1px solid var(--glass-border-inner)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>Notes</span>
          <button
            onClick={handleNewNote}
            data-testid="notes-new"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 600,
              padding: '0 6px',
            }}
            aria-label="New Note"
          >
            +
          </button>
        </div>
        <div data-testid="notes-list" style={{ flex: 1, overflowY: 'auto' }}>
          {notes.map((note) => {
            const active = note.id === selectedId
            return (
              <button
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: '1px solid var(--glass-border-inner)',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.title || 'New Note'}
                </div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                  {note.updated}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {selected ? (
          <>
            <div
              style={{
                padding: '8px 16px',
                borderBottom: '1px solid var(--glass-border-inner)',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              {selected.updated}
            </div>
            <textarea
              data-testid="notes-editor"
              value={selected.body}
              onChange={(e) => handleBodyChange(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: 16,
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: 14,
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: 13,
            }}
          >
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  )
}
