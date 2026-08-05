import { useState, useMemo, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Note } from './types'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const initialNotes: Note[] = [
  {
    id: generateId(),
    title: 'Welcome to Notes',
    body: 'This is a simple in-memory notes app. Create, edit, and delete notes while the session lasts.',
    updatedAt: Date.now(),
  },
  {
    id: generateId(),
    title: 'Ideas',
    body: '- Recreate macOS Tahoe\n- Build more default apps\n- Add persistence later',
    updatedAt: Date.now() - 1000 * 60 * 5,
  },
]

export function Notes() {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [selectedId, setSelectedId] = useState<string>(initialNotes[0]?.id ?? '')

  const selectedNote = useMemo(() => notes.find((n) => n.id === selectedId), [notes, selectedId])

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: 'New Note',
      body: '',
      updatedAt: Date.now(),
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedId(newNote.id)
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<Omit<Note, 'id' | 'updatedAt'>>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: Date.now() } : note,
      ),
    )
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const filtered = prev.filter((note) => note.id !== id)
      if (selectedId === id) {
        setSelectedId(filtered[0]?.id ?? '')
      }
      return filtered
    })
  }, [selectedId])

  return (
    <div className="flex h-full bg-tahoe-surface text-tahoe-text overflow-hidden" data-testid="notes-app">
      <div className="w-56 flex flex-col border-r border-white/10 bg-tahoe-glass/30" data-testid="notes-sidebar">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <span className="text-sm font-semibold">Notes</span>
          <button
            onClick={createNote}
            className="p-1.5 rounded-md hover:bg-white/10"
            aria-label="Create note"
            data-testid="notes-create"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedId(note.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedId === note.id ? 'bg-tahoe-accent text-white' : 'hover:bg-white/10'
              }`}
              data-testid={`note-item-${note.id}`}
            >
              <div className="font-medium truncate">{note.title || 'Untitled'}</div>
              <div className="text-xs opacity-70 truncate">{formatDate(note.updatedAt)}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <input
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                className="bg-transparent text-lg font-semibold outline-none placeholder-white/30 flex-1"
                placeholder="Title"
                data-testid="notes-title-input"
              />
              <button
                onClick={() => deleteNote(selectedNote.id)}
                className="p-1.5 rounded-md hover:bg-red-500/20 text-tahoe-text-secondary hover:text-red-400"
                aria-label="Delete note"
                data-testid="notes-delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={selectedNote.body}
              onChange={(e) => updateNote(selectedNote.id, { body: e.target.value })}
              className="flex-1 bg-transparent p-4 resize-none outline-none text-sm leading-relaxed"
              placeholder="Start typing..."
              data-testid="notes-body-input"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-tahoe-text-secondary text-sm" data-testid="notes-empty">
            Select a note or create a new one.
          </div>
        )}
      </div>
    </div>
  )
}
