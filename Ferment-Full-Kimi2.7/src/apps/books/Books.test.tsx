import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Books } from './Books'

describe('Books', () => {
  beforeEach(() => {
    render(<Books />)
  })

  it('renders the sidebar and book grid', () => {
    expect(screen.getByTestId('books-app')).toBeInTheDocument()
    expect(screen.getByTestId('books-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('books-grid')).toBeInTheDocument()
    expect(screen.getByTestId('books-item-b-1')).toBeInTheDocument()
  })

  it('filters books by collection', async () => {
    await userEvent.click(screen.getByTestId('books-collection-finished'))
    expect(screen.getByTestId('books-grid-heading')).toHaveTextContent('Finished')
    expect(screen.getByTestId('books-item-b-4')).toBeInTheDocument()
    expect(screen.queryByTestId('books-item-b-1')).not.toBeInTheDocument()
  })

  it('searches books by title', async () => {
    await userEvent.type(screen.getByTestId('books-search'), 'Starlight')
    expect(screen.getByTestId('books-item-b-3')).toBeInTheDocument()
    expect(screen.queryByTestId('books-item-b-1')).not.toBeInTheDocument()
  })

  it('opens a book in the reader view', async () => {
    await userEvent.click(screen.getByTestId('books-item-b-2'))
    expect(screen.getByTestId('books-reader')).toBeInTheDocument()
    expect(screen.getByTestId('books-reader-title')).toHaveTextContent(
      'Clockwork Garden'
    )
  })

  it('navigates pages in the reader', async () => {
    await userEvent.click(screen.getByTestId('books-item-b-4'))
    expect(screen.getByTestId('books-reader-page')).toHaveTextContent('Page 1')
    await userEvent.click(screen.getByTestId('books-reader-next'))
    expect(screen.getByTestId('books-reader-page')).toHaveTextContent('Page 2')
    await userEvent.click(screen.getByTestId('books-reader-prev'))
    expect(screen.getByTestId('books-reader-page')).toHaveTextContent('Page 1')
  })

  it('closes the reader and returns to the library', async () => {
    await userEvent.click(screen.getByTestId('books-item-b-1'))
    expect(screen.getByTestId('books-reader')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('books-reader-back'))
    expect(screen.queryByTestId('books-reader')).not.toBeInTheDocument()
  })
})
