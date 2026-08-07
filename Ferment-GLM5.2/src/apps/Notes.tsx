import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, Trash2 } from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'
import { useIntentStore } from '../store/intent'
import { useVfsStore } from '../store/vfs'

/**
 * Notes — note list + editor with autosave + search.
 *
 * Notes are persisted to localStorage via usePersistentState (key
 * 'tahoe.notes'). The editor's title is derived from the first line of the
 * body (macOS Notes behavior). Search filters by title/body substring.
 *
 * Cross-app dispatch: when Finder (or Spotlight) opens a text/markdown file,
 * it sets an open-file intent and focuses/launches Notes. On intent change,
 * Notes imports the file's content as a new note and selects it.
 */

export interface Note {
  id: string
  body: string
  createdAt: number
  modifiedAt: number
}

const STORAGE_KEY = 'tahoe.notes'

function uid(): string {
  return 'n' + Math.random().toString(36).slice(2, 10)
}

function noteTitle(body: string): string {
  const firstLine = body.split('\n').find((l) => l.trim().length > 0)
  if (!firstLine) return 'New Note'
  return firstLine.length > 40 ? firstLine.slice(0, 40) + '…' : firstLine
}

function notePreview(body: string): string {
  const lines = body.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length <= 1) return 'No additional text'
  return lines.slice(1).join(' ').slice(0, 60)
}

function makeNote(body = ''): Note {
  const now = Date.now()
  return { id: uid(), body, createdAt: now, modifiedAt: now }
}

const SEED_NOTES: Note[] = [
  (() => {
    const n = makeNote('Welcome to Notes\n\nThis is your first note. Click + to create more.')
    n.id = 'seed-welcome'
    return n
  })(),
]

export function Notes() {
  const [notes, setNotes] = usePersistentState<Note[]>(STORAGE_KEY, SEED_NOTES)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const openFileId = useIntentStore((s) => s.openFileId)
  const consumeOpenFile = useIntentStore((s) => s.consumeOpenFile)

  // Select the first note on mount if nothing is selected.
  useEffect(() => {
    if (selectedId === null && notes.length > 0) {
      setSelectedId(notes[0].id)
    }
  }, [notes, selectedId])

  // Consume a pending open-file intent: import the file's content as a note.
  useEffect(() => {
    if (!openFileId) return
    const node = useVfsStore.getState().getNode(openFileId)
    if (node && node.type === 'file') {
      const note = makeNote(node.content ?? '')
      setNotes((prev) => [note, ...prev])
      setSelectedId(note.id)
    }
    consumeOpenFile()
  }, [openFileId, consumeOpenFile, setNotes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...notes].sort((a, b) => b.modifiedAt - a.modifiedAt)
    if (!q) return sorted
    return sorted.filter(
      (n) =>
        n.body.toLowerCase().includes(q) ||
        noteTitle(n.body).toLowerCase().includes(q),
    )
  }, [notes, query])

  const selected = notes.find((n) => n.id === selectedId) ?? null

  const createNote = () => {
    const note = makeNote('')
    setNotes((prev) => [note, ...prev])
    setSelectedId(note.id)
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id)
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[0].id : null)
      }
      return next
    })
  }

  const updateBody = (body: string) => {
    if (!selectedId) return
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId ? { ...n, body, modifiedAt: Date.now() } : n,
      ),
    )
  }

  return (
    <div data-testid="notes-content" className="flex h-full text-[13px]">
      {/* Sidebar: search + note list */}
      <aside className="flex w-56 flex-col border-r border-black/10 bg-black/[0.04]">
        <div className="flex items-center gap-1 border-b border-black/10 p-2">
          <div className="relative flex-1">
            <Search
              size={13}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-black/40"
            />
            <input
              data-testid="notes-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full rounded-md border border-black/10 bg-white/70 py-1 pl-7 pr-2 text-[12px] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <button
            data-testid="notes-new"
            onClick={createNote}
            className="rounded-md p-1.5 hover:bg-black/10"
            aria-label="New note"
          >
            <Plus size={16} />
          </button>
        </div>
        <div
          data-testid="notes-list"
          className="flex-1 overflow-auto"
        >
          {filtered.length === 0 ? (
            <div className="p-3 text-black/40">No notes found.</div>
          ) : (
            filtered.map((note) => {
              const active = note.id === selectedId
              return (
                <div
                  key={note.id}
                  data-testid="notes-item"
                  data-note-id={note.id}
                  onClick={() => setSelectedId(note.id)}
                  className={`group cursor-pointer border-b border-black/[0.04] px-3 py-2 ${
                    active ? 'bg-[var(--accent)]/15' : 'hover:bg-black/5'
                  }`}
                >
                  <div
                    data-testid="notes-item-title"
                    className={`truncate font-medium ${
                      active ? 'text-[var(--accent)]' : 'text-black/80'
                    }`}
                  >
                    {noteTitle(note.body)}
                  </div>
                  <div className="truncate text-[11px] text-black/40">
                    {notePreview(note.body)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-2">
              <span className="text-[11px] text-black/40">
                {new Date(selected.modifiedAt).toLocaleString()}
              </span>
              <button
                data-testid="notes-delete"
                onClick={() => deleteNote(selected.id)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-black/60 hover:bg-black/10"
                aria-label="Delete note"
              >
                <Trash2 size={14} />
                <span className="text-xs">Delete</span>
              </button>
            </div>
            <textarea
              data-testid="notes-editor"
              value={selected.body}
              onChange={(e) => updateBody(e.target.value)}
              placeholder="Start writing…"
              className="flex-1 resize-none bg-transparent p-4 text-[14px] leading-relaxed outline-none"
              spellCheck={false}
            />
          </>
        ) : (
          <div
            data-testid="notes-empty"
            className="grid flex-1 place-items-center text-black/40"
          >
            No note selected.
          </div>
        )}
      </div>
    </div>
  )
}

export default Notes
