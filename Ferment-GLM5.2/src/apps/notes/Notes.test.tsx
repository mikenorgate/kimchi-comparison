import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import Notes from './Notes'

afterEach(() => cleanup())

describe('Notes', () => {
  it('renders with a default note', () => {
    render(<Notes />)
    expect(screen.getByTestId('notes')).toBeInTheDocument()
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Welcome')
  })

  it('creates a new note and types into the body', () => {
    render(<Notes />)
    fireEvent.click(screen.getByTestId('notes-new'))

    // The new note should be selected
    const bodyInput = screen.getByTestId('notes-body-input') as HTMLTextAreaElement
    fireEvent.change(bodyInput, { target: { value: 'Hello World' } })

    expect(bodyInput.value).toBe('Hello World')
  })

  it('creates two notes and switches between them with isolated content', () => {
    render(<Notes />)

    // Create first new note
    fireEvent.click(screen.getByTestId('notes-new'))
    fireEvent.change(screen.getByTestId('notes-title-input'), { target: { value: 'Note A' } })
    fireEvent.change(screen.getByTestId('notes-body-input'), { target: { value: 'Content A' } })

    // Create second new note
    fireEvent.click(screen.getByTestId('notes-new'))
    fireEvent.change(screen.getByTestId('notes-title-input'), { target: { value: 'Note B' } })
    fireEvent.change(screen.getByTestId('notes-body-input'), { target: { value: 'Content B' } })

    // Switch back to Note A — need to find it in the sidebar
    const sidebar = screen.getByTestId('notes-sidebar')
    const noteAItem = within(sidebar).getByText('Note A')
    fireEvent.click(noteAItem)

    expect(screen.getByTestId('notes-title-input')).toHaveValue('Note A')
    expect(screen.getByTestId('notes-body-input')).toHaveValue('Content A')

    // Switch to Note B
    const noteBItem = within(sidebar).getByText('Note B')
    fireEvent.click(noteBItem)

    expect(screen.getByTestId('notes-title-input')).toHaveValue('Note B')
    expect(screen.getByTestId('notes-body-input')).toHaveValue('Content B')
  })

  it('deletes the selected note', () => {
    render(<Notes />)
    // Default note is selected
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Welcome')

    // Delete it
    fireEvent.click(screen.getByTestId('notes-delete'))

    // No note should be selected — placeholder shows
    expect(screen.queryByTestId('notes-title-input')).not.toBeInTheDocument()
  })

  it('updates the note title in the sidebar when edited', () => {
    render(<Notes />)
    fireEvent.change(screen.getByTestId('notes-title-input'), { target: { value: 'My Custom Title' } })

    const sidebar = screen.getByTestId('notes-sidebar')
    expect(within(sidebar).getByText('My Custom Title')).toBeInTheDocument()
  })
})
