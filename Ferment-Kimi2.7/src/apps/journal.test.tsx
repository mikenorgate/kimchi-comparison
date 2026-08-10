import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { JournalApp } from './components'

describe('JournalApp', () => {
  it('renders the entry list and editor area with the first entry selected', () => {
    render(<JournalApp />)
    expect(screen.getByTestId('journal-entry-list')).toBeInTheDocument()
    expect(screen.getByTestId('journal-editor')).toBeInTheDocument()
    expect(screen.getByTestId('journal-title-input')).toHaveValue('First Day at Tahoe')
    expect(screen.getByTestId('journal-body-input')).toHaveValue(
      'Spent the morning exploring the shoreline. The water was impossibly clear and the air smelled like pine. I can already tell this trip is going to be memorable.',
    )
    expect(screen.getByTestId('journal-date')).toHaveTextContent('Aug 10, 2026')
  })

  it('switches the editor to a different entry when clicked', () => {
    render(<JournalApp />)
    fireEvent.click(screen.getByTestId('journal-entry-j2'))
    expect(screen.getByTestId('journal-title-input')).toHaveValue('Roadmap Review')
    expect(screen.getByTestId('journal-body-input')).toHaveValue(
      'We walked through the rest of the core apps today. Everyone agreed the Liquid Glass treatment is the right direction. Next up: overlays and final integration.',
    )
  })

  it('updates the selected entry title and body when typing', () => {
    render(<JournalApp />)
    const titleInput = screen.getByTestId('journal-title-input')
    const bodyInput = screen.getByTestId('journal-body-input')

    fireEvent.change(titleInput, { target: { value: 'Updated Title' } })
    expect(titleInput).toHaveValue('Updated Title')

    fireEvent.change(bodyInput, { target: { value: 'Updated body content.' } })
    expect(bodyInput).toHaveValue('Updated body content.')
  })

  it('creates a new entry and selects it', () => {
    render(<JournalApp />)
    const listBefore = screen.getAllByTestId(/journal-entry-/).length
    fireEvent.click(screen.getByTestId('journal-new-button'))
    const listAfter = screen.getAllByTestId(/journal-entry-/).length
    expect(listAfter).toBe(listBefore + 1)
    expect(screen.getByTestId('journal-title-input')).toHaveValue('New Entry')
    expect(screen.getByTestId('journal-body-input')).toHaveValue('')
  })
})
