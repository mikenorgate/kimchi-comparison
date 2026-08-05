import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Notes, formatNoteDate } from './Notes'

describe('Notes', () => {
  it('renders split view with sidebar and editor', () => {
    render(<Notes />)
    expect(screen.getByTestId('notes-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('notes-editor-pane')).toBeInTheDocument()
    expect(screen.getByTestId('notes-title-input')).toBeInTheDocument()
    expect(screen.getByTestId('notes-body-input')).toBeInTheDocument()
  })

  it('selects a note and shows it in the editor', () => {
    render(<Notes />)
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Welcome')
    fireEvent.click(screen.getByTestId('notes-item-ideas'))
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Ideas')
  })

  it('edits the selected note title and body', () => {
    render(<Notes />)
    fireEvent.change(screen.getByTestId('notes-title-input'), { target: { value: 'Updated Title' } })
    fireEvent.change(screen.getByTestId('notes-body-input'), { target: { value: 'Updated body' } })
    expect(screen.getByTestId('notes-title-input')).toHaveValue('Updated Title')
    expect(screen.getByTestId('notes-body-input')).toHaveValue('Updated body')
  })

  it('creates a new note and selects it', () => {
    render(<Notes />)
    fireEvent.click(screen.getByTestId('notes-create'))
    expect(screen.getByTestId('notes-title-input')).toHaveValue('New Note')
    expect(screen.getByTestId('notes-body-input')).toHaveValue('')
  })

  it('formatNoteDate formats a date', () => {
    const date = new Date('2026-08-05')
    expect(formatNoteDate(date)).toContain('Aug')
  })
})
