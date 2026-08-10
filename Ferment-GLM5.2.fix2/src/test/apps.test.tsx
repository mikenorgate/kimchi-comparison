import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import CalculatorApp from '@/apps/CalculatorApp'
import TerminalApp from '@/apps/TerminalApp'
import NotesApp from '@/apps/NotesApp'
import TextEditApp from '@/apps/TextEditApp'

/**
 * Runtime tests asserting the interactive in-session apps behave correctly:
 * - Calculator computes (incl. division-by-zero → Error)
 * - Terminal responds to commands (ls, pwd, echo, clear, help, unknown)
 * - Notes accepts text + "+" creates a note
 * - TextEdit renders an editable surface
 */
describe('Interactive apps', () => {
  describe('Calculator', () => {
    it('computes 2 + 2 = 4', () => {
      render(<CalculatorApp />)
      const display = screen.getByTestId('calc-display')
      // Use getByRole('button') to avoid ambiguity with the display value.
      fireEvent.click(screen.getByRole('button', { name: '2' }))
      fireEvent.click(screen.getByRole('button', { name: '+' }))
      fireEvent.click(screen.getByRole('button', { name: '2' }))
      fireEvent.click(screen.getByRole('button', { name: '=' }))
      expect(display.textContent).toBe('4')
    })

    it('shows Error on division by zero', () => {
      render(<CalculatorApp />)
      const display = screen.getByTestId('calc-display')
      fireEvent.click(screen.getByRole('button', { name: '5' }))
      fireEvent.click(screen.getByRole('button', { name: '÷' }))
      fireEvent.click(screen.getByRole('button', { name: '0' }))
      fireEvent.click(screen.getByRole('button', { name: '=' }))
      expect(display.textContent?.toLowerCase()).toBe('error')
    })
  })

  describe('Terminal', () => {
    it('responds to ls, pwd, and echo', () => {
      render(<TerminalApp />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      const form = input.closest('form') as HTMLFormElement
      // ls
      fireEvent.change(input, { target: { value: 'ls' } })
      fireEvent.submit(form)
      expect(screen.getByText(/Desktop/)).toBeInTheDocument()
      // pwd
      fireEvent.change(input, { target: { value: 'pwd' } })
      fireEvent.submit(form)
      expect(screen.getByText(/\/Users\/user/)).toBeInTheDocument()
      // echo
      fireEvent.change(input, { target: { value: 'echo hello' } })
      fireEvent.submit(form)
      expect(screen.getByText('hello')).toBeInTheDocument()
    })

    it('shows command-not-found for unknown commands', () => {
      render(<TerminalApp />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      const form = input.closest('form') as HTMLFormElement
      fireEvent.change(input, { target: { value: 'bogus' } })
      fireEvent.submit(form)
      expect(screen.getByText(/command not found/i)).toBeInTheDocument()
    })

    it('clears scrollback on clear', () => {
      render(<TerminalApp />)
      const input = screen.getByTestId('terminal-input') as HTMLInputElement
      const form = input.closest('form') as HTMLFormElement
      fireEvent.change(input, { target: { value: 'echo stay' } })
      fireEvent.submit(form)
      expect(screen.getByText('stay')).toBeInTheDocument()
      fireEvent.change(input, { target: { value: 'clear' } })
      fireEvent.submit(form)
      expect(screen.queryByText('stay')).not.toBeInTheDocument()
    })
  })

  describe('Notes', () => {
    it('accepts text in the editor', () => {
      render(<NotesApp />)
      const editor = screen.getByTestId('notes-editor') as HTMLTextAreaElement
      fireEvent.change(editor, { target: { value: 'my new note text' } })
      expect(editor.value).toBe('my new note text')
    })

    it('creates a new note on "+"', () => {
      render(<NotesApp />)
      const newBtn = screen.getByTestId('notes-new')
      const list = screen.getByTestId('notes-list')
      const before = within(list).getAllByRole('button').length
      fireEvent.click(newBtn)
      const after = within(list).getAllByRole('button').length
      expect(after).toBe(before + 1)
    })
  })

  describe('TextEdit', () => {
    it('renders an editable surface', () => {
      render(<TextEditApp />)
      // The contentEditable editor surface. jsdom doesn't implement
      // isContentEditable, so assert the attribute directly.
      const editor = screen.getByTestId('textedit-editor')
      expect(editor).toBeInTheDocument()
      expect(editor.getAttribute('contenteditable')).toBe('true')
    })
  })
})
