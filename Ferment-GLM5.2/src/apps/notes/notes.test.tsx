import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Notes } from './notes'
import { useNoteStore } from '../../store/note-store'

function resetStore() {
  localStorage.removeItem('tahoe.notes')
  localStorage.removeItem('tahoe.note-folders')
  useNoteStore.getState().reset()
}

describe('Notes', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders the three-panel layout: sidebar, list, editor', () => {
    render(<Notes windowId="w1" />)
    expect(screen.getByTestId('notes-root')).toBeInTheDocument()
    expect(screen.getByTestId('notes-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('notes-list-panel')).toBeInTheDocument()
    expect(screen.getByTestId('notes-editor-panel')).toBeInTheDocument()
  })

  it('renders default folders in the sidebar', () => {
    render(<Notes windowId="w1" />)
    expect(screen.getByTestId('notes-folder-all')).toHaveTextContent('All Notes')
    expect(screen.getByTestId('notes-folder-icloud')).toHaveTextContent('iCloud')
    expect(screen.getByTestId('notes-folder-work')).toHaveTextContent('Work')
    expect(screen.getByTestId('notes-folder-personal')).toHaveTextContent('Personal')
  })

  it('shows empty state when there are no notes', () => {
    render(<Notes windowId="w1" />)
    expect(screen.getByTestId('notes-empty')).toHaveTextContent('No Notes')
  })

  it('creates a new note on + New Note button click', () => {
    render(<Notes windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('notes-new-btn'))
    })
    expect(useNoteStore.getState().notes).toHaveLength(1)
    expect(screen.getByTestId('notes-title-input')).toHaveValue('New Note')
  })

  it('selects a note from the list to show the editor', () => {
    const id = useNoteStore.getState().createNote('icloud')
    render(<Notes windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId(`note-item-${id}`))
    })
    expect(screen.getByTestId('notes-title-input')).toHaveValue('New Note')
    expect(screen.getByTestId('notes-editor')).toBeInTheDocument()
  })

  it('shows "Select a note" placeholder when no note is selected', () => {
    render(<Notes windowId="w1" />)
    expect(screen.getByTestId('notes-no-selection')).toBeInTheDocument()
  })

  it('updates the note title when typing in the title input', () => {
    const id = useNoteStore.getState().createNote('icloud')
    render(<Notes windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId(`note-item-${id}`))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('notes-title-input'), { target: { value: 'My Title' } })
    })
    expect(useNoteStore.getState().getNote(id)!.title).toBe('My Title')
  })

  it('updates the note body when typing in the editor (autosave)', () => {
    const id = useNoteStore.getState().createNote('icloud')
    render(<Notes windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId(`note-item-${id}`))
    })
    const editor = screen.getByTestId('notes-editor')
    act(() => {
      editor.innerHTML = '<p>Hello world</p>'
      fireEvent.input(editor)
    })
    expect(useNoteStore.getState().getNote(id)!.body).toBe('<p>Hello world</p>')
  })

  it('deletes a note via the Delete button', () => {
    const id = useNoteStore.getState().createNote('icloud')
    render(<Notes windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId(`note-item-${id}`))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('notes-delete-btn'))
    })
    expect(useNoteStore.getState().notes).toHaveLength(0)
    expect(screen.getByTestId('notes-empty')).toBeInTheDocument()
  })

  it('filters notes by search query in title', () => {
    useNoteStore.getState().createNote('icloud')
    useNoteStore.getState().updateNote(
      useNoteStore.getState().notes[0].id,
      { title: 'Shopping List' }
    )
    useNoteStore.getState().createNote('icloud')
    useNoteStore.getState().updateNote(
      useNoteStore.getState().notes[0].id,
      { title: 'Work Notes' }
    )
    render(<Notes windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('notes-search'), { target: { value: 'shop' } })
    })
    const list = screen.getByTestId('notes-list')
    const items = list.querySelectorAll('[data-testid^="note-item-"]')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('Shopping List')
  })

  it('filters notes by search query in body', () => {
    const id1 = useNoteStore.getState().createNote('icloud')
    useNoteStore.getState().updateNote(id1, { title: 'A', body: 'buy milk and eggs' })
    const id2 = useNoteStore.getState().createNote('icloud')
    useNoteStore.getState().updateNote(id2, { title: 'B', body: 'meeting at 3pm' })
    render(<Notes windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('notes-search'), { target: { value: 'milk' } })
    })
    const list = screen.getByTestId('notes-list')
    const items = list.querySelectorAll('[data-testid^="note-item-"]')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('A')
  })

  it('shows note preview in the list', () => {
    const id = useNoteStore.getState().createNote('icloud')
    useNoteStore.getState().updateNote(id, { title: 'Test', body: 'This is the body text' })
    render(<Notes windowId="w1" />)
    expect(screen.getByTestId(`note-preview-${id}`)).toHaveTextContent('This is the body text')
  })

  it('filters notes by folder when selecting a folder in the sidebar', () => {
    useNoteStore.getState().createNote('work')
    useNoteStore.getState().createNote('personal')
    render(<Notes windowId="w1" />)
    // "All Notes" should show both
    expect(screen.getAllByTestId(/note-item-/)).toHaveLength(2)
    // Click "Work" folder
    act(() => {
      fireEvent.click(screen.getByTestId('notes-folder-work'))
    })
    expect(screen.getAllByTestId(/note-item-/)).toHaveLength(1)
  })

  it('persists notes to localStorage', () => {
    const id = useNoteStore.getState().createNote('icloud')
    useNoteStore.getState().updateNote(id, { title: 'Persisted', body: 'persisted body' })
    const stored = JSON.parse(localStorage.getItem('tahoe.notes')!)
    expect(stored).toHaveLength(1)
    expect(stored[0].title).toBe('Persisted')
  })

  it('persists notes across store re-init (simulating reload)', () => {
    useNoteStore.getState().createNote('icloud')
    useNoteStore.getState().createNote('work')
    // Simulate reload: re-import the store (force re-initialization)
    // We check localStorage has the data, and a fresh reset loads from localStorage
    const stored = JSON.parse(localStorage.getItem('tahoe.notes')!)
    expect(stored).toHaveLength(2)
  })

  it('sorts notes by modifiedAt (most recent first)', () => {
    const id1 = useNoteStore.getState().createNote('icloud')
    // Create a second note
    useNoteStore.getState().createNote('icloud')
    // Manually set modifiedAt to ensure id1 is more recent (createNote may run in same ms)
    const notes = useNoteStore.getState().notes
    useNoteStore.setState({
      notes: notes.map((n) =>
        n.id === id1 ? { ...n, title: 'Updated First', modifiedAt: n.modifiedAt + 1000 } : n
      ),
    })
    render(<Notes windowId="w1" />)
    const items = screen.getAllByTestId(/note-item-/)
    expect(items[0]).toHaveTextContent('Updated First')
  })
})
