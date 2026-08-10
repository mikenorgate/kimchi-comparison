import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NotesApp } from './components'

describe('Notes app', () => {
  it('renders sidebar note list and editor for the first note', () => {
    render(<NotesApp />)

    expect(screen.getByTestId('notes-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('notes-editor')).toBeInTheDocument()
    expect(screen.getByTestId('notes-item-note-1')).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Grocery List')
    expect(screen.getByTestId('notes-body-input')).toHaveValue('- Almond milk\n- Avocados\n- Sourdough bread\n- Coffee beans')
  })

  it('switches the selected note and updates the editor', () => {
    render(<NotesApp />)

    const secondNote = screen.getByTestId('notes-item-note-2')
    fireEvent.click(secondNote)

    expect(secondNote).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Project Ideas')
    expect(screen.getByTestId('notes-body-input')).toHaveValue(
      '1. Recreate macOS Tahoe in the browser\n2. Build a Liquid Glass design system\n3. Write end-to-end tests for every app',
    )
  })

  it('filters the note list when searching', () => {
    render(<NotesApp />)

    const search = screen.getByTestId('notes-search')
    fireEvent.change(search, { target: { value: 'Meeting' } })

    expect(screen.queryByTestId('notes-item-note-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('notes-item-note-2')).not.toBeInTheDocument()
    expect(screen.getByTestId('notes-item-note-3')).toBeInTheDocument()
  })
})
