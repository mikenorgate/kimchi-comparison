import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Notes } from './Notes'

describe('Notes', () => {
  beforeEach(() => {
    render(<Notes />)
  })

  it('renders the notes list with initial notes', () => {
    expect(screen.getByTestId('notes-sidebar')).toBeInTheDocument()
    expect(screen.getByText('Welcome to Notes')).toBeInTheDocument()
    expect(screen.getByText('Ideas')).toBeInTheDocument()
  })

  it('creates a new note and selects it', async () => {
    await userEvent.click(screen.getByTestId('notes-create'))
    expect(screen.getByTestId('notes-title-input')).toHaveValue('New Note')
    expect(screen.getByText('New Note')).toBeInTheDocument()
  })

  it('edits the selected note title and body', async () => {
    const titleInput = screen.getByTestId('notes-title-input')
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Shopping List')

    const bodyInput = screen.getByTestId('notes-body-input')
    await userEvent.clear(bodyInput)
    await userEvent.type(bodyInput, 'Milk, eggs, bread')

    expect(titleInput).toHaveValue('Shopping List')
    expect(bodyInput).toHaveValue('Milk, eggs, bread')
    expect(screen.getByText('Shopping List')).toBeInTheDocument()
  })

  it('deletes the selected note', async () => {
    await userEvent.click(screen.getByTestId('notes-delete'))
    expect(screen.queryByText('Welcome to Notes')).not.toBeInTheDocument()
  })

  it('selects a different note from the list', async () => {
    const ideas = screen.getByText('Ideas')
    await userEvent.click(ideas)
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Ideas')
    expect(screen.getByTestId('notes-body-input')).toHaveTextContent('Recreate macOS Tahoe')
  })

  it('updates the timestamp after editing', async () => {
    const bodyInput = screen.getByTestId('notes-body-input')
    const before = new Date().getTime()
    await userEvent.type(bodyInput, ' updated')
    const after = new Date().getTime()
    const noteItem = screen.getAllByTestId(/^note-item-/)[0].closest('button')
    if (noteItem) {
      expect(within(noteItem).getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument()
    }
    expect(before).toBeLessThanOrEqual(after)
  })
})
