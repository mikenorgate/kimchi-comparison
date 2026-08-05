import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Freeform } from './Freeform'

describe('Freeform', () => {
  beforeEach(() => {
    render(<Freeform />)
  })

  it('renders the app with toolbar and initial items', () => {
    expect(screen.getByTestId('freeform-app')).toBeInTheDocument()
    expect(screen.getByTestId('freeform-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('freeform-item-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('freeform-inspector')).toBeInTheDocument()
  })

  it('selects an item and shows its details in the inspector', async () => {
    await userEvent.click(screen.getByTestId('freeform-item-item-2'))
    expect(screen.queryByTestId('freeform-note-text')).not.toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('square'))).toBeInTheDocument()
  })

  it('adds a sticky note and edits its text', async () => {
    await userEvent.click(screen.getByTestId('freeform-tool-note'))
    const items = screen.getAllByTestId(/^freeform-item-/)
    expect(items.length).toBeGreaterThan(3)

    const added = items[items.length - 1]
    await userEvent.click(added)
    const textarea = screen.getByTestId('freeform-note-text')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Brainstorm idea')
    expect(textarea).toHaveValue('Brainstorm idea')
  })

  it('clears the board', async () => {
    await userEvent.click(screen.getByTestId('freeform-tool-clear'))
    expect(screen.queryByTestId(/^freeform-item-/)).not.toBeInTheDocument()
    expect(screen.getByTestId('freeform-empty')).toBeInTheDocument()
  })

  it('deletes the selected item', async () => {
    await userEvent.click(screen.getByTestId('freeform-item-item-1'))
    await userEvent.click(screen.getByTestId('freeform-tool-delete'))
    expect(screen.queryByTestId('freeform-item-item-1')).not.toBeInTheDocument()
  })
})
