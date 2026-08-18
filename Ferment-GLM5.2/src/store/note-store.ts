import { create } from 'zustand'

export interface Note {
  id: string
  folderId: string
  title: string
  body: string
  createdAt: number
  modifiedAt: number
}

export interface NoteFolder {
  id: string
  name: string
}

const NOTES_KEY = 'tahoe.notes'
const FOLDERS_KEY = 'tahoe.note-folders'

function defaultFolders(): NoteFolder[] {
  return [
    { id: 'all', name: 'All Notes' },
    { id: 'icloud', name: 'iCloud' },
    { id: 'work', name: 'Work' },
    { id: 'personal', name: 'Personal' },
  ]
}

function loadFolders(): NoteFolder[] {
  if (typeof window === 'undefined') return defaultFolders()
  try {
    const s = localStorage.getItem(FOLDERS_KEY)
    return s ? JSON.parse(s) : defaultFolders()
  } catch { return defaultFolders() }
}

function loadNotes(): Note[] {
  if (typeof window === 'undefined') return []
  try {
    const s = localStorage.getItem(NOTES_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function persistNotes(notes: Note[]) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)) } catch { /* ignore */ }
}

function persistFolders(folders: NoteFolder[]) {
  try { localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)) } catch { /* ignore */ }
}

let noteCounter = 0
const genId = () => `note-${Date.now()}-${++noteCounter}`

interface NoteStore {
  notes: Note[]
  folders: NoteFolder[]
  createNote: (folderId: string) => string
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'body'>>) => void
  deleteNote: (id: string) => void
  getNote: (id: string) => Note | undefined
  searchNotes: (query: string) => Note[]
  reset: () => void
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: loadNotes(),
  folders: loadFolders(),
  createNote: (folderId) => {
    const id = genId()
    const now = Date.now()
    const note: Note = {
      id, folderId, title: 'New Note', body: '',
      createdAt: now, modifiedAt: now,
    }
    const notes = [note, ...get().notes]
    persistNotes(notes)
    set({ notes })
    return id
  },
  updateNote: (id, updates) => {
    const notes = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, modifiedAt: Date.now() } : n
    )
    persistNotes(notes)
    set({ notes })
  },
  deleteNote: (id) => {
    const notes = get().notes.filter((n) => n.id !== id)
    persistNotes(notes)
    set({ notes })
  },
  getNote: (id) => get().notes.find((n) => n.id === id),
  searchNotes: (query) => {
    const q = query.toLowerCase()
    return get().notes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
    )
  },
  reset: () => {
    const f = defaultFolders()
    persistFolders(f)
    persistNotes([])
    set({ notes: [], folders: f })
  },
}))
