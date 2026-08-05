import { useState } from 'react'

const INITIAL_NOTES = [
  {
    id: 'welcome',
    title: 'Welcome',
    body: 'Hello, macOS Tahoe!\n\nThis is your Notes app.',
    updatedAt: new Date(),
  },
  {
    id: 'ideas',
    title: 'Ideas',
    body: 'Build a desktop shell in React.',
    updatedAt: new Date(Date.now() - 86400000),
  },
]

export function formatNoteDate(date) {
  return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function Notes() {
  const [notes, setNotes] = useState(INITIAL_NOTES)
  const [selectedId, setSelectedId] = useState(INITIAL_NOTES[0].id)

  const selectedNote = notes.find((n) => n.id === selectedId) || notes[0]

  function handleCreate() {
    const newNote = {
      id: crypto.randomUUID(),
      title: 'New Note',
      body: '',
      updatedAt: new Date(),
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedId(newNote.id)
  }

  function updateSelected(update) {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === selectedId ? { ...note, ...update, updatedAt: new Date() } : note
      )
    )
  }

  return (
    <div data-testid="notes-app" style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <aside
        data-testid="notes-sidebar"
        style={{
          width: 200,
          flexShrink: 0,
          background: 'var(--color-surface-elevated)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-md)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Notes</span>
          <button
            type="button"
            data-testid="notes-create"
            onClick={handleCreate}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 'var(--text-lg)',
              lineHeight: 1,
            }}
          >
            +
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {notes.map((note) => {
            const titleText = note.title ? note.title : 'Untitled'
            return (
              <button
                key={note.id}
                type="button"
                data-testid={`notes-item-${note.id}`}
                onClick={() => setSelectedId(note.id)}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm) var(--space-md)',
                  border: 'none',
                  borderBottom: '1px solid var(--color-border)',
                  background: note.id === selectedId ? 'var(--color-accent)' : 'transparent',
                  color: note.id === selectedId ? '#fff' : 'var(--color-text)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>{titleText}</div>
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>{formatNoteDate(note.updatedAt)}</div>
              </button>
            )
          })}
        </div>
      </aside>

      <main data-testid="notes-editor-pane" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <input
          data-testid="notes-title-input"
          type="text"
          value={selectedNote?.title || ''}
          onChange={(e) => updateSelected({ title: e.target.value })}
          placeholder="Title"
          style={{
            padding: 'var(--space-md)',
            border: 'none',
            borderBottom: '1px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            outline: 'none',
          }}
        />
        <textarea
          data-testid="notes-body-input"
          value={selectedNote?.body || ''}
          onChange={(e) => updateSelected({ body: e.target.value })}
          placeholder="Write something..."
          style={{
            flex: 1,
            padding: 'var(--space-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text)',
            fontSize: 'var(--text-base)',
            lineHeight: 1.5,
            outline: 'none',
            resize: 'none',
          }}
        />
      </main>
    </div>
  )
}

export default Notes
