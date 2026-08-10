import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FinderApp } from './components'

describe('Finder app', () => {
  it('renders toolbar, sidebar, and file grid', () => {
    render(<FinderApp />)

    expect(screen.getByTestId('finder-toolbar')).toBeInTheDocument()
    expect(screen.getByTestId('finder-path')).toHaveTextContent('Macintosh HD')
    expect(screen.getByText('Favorites')).toBeInTheDocument()
    expect(screen.getByText('Locations')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Finder files' })).toBeInTheDocument()
    expect(screen.getByTestId('finder-item-applications')).toBeInTheDocument()
  })

  it('selects a file item on click', () => {
    render(<FinderApp />)
    const item = screen.getByTestId('finder-item-readme')
    fireEvent.click(item)
    expect(item).toHaveAttribute('aria-selected', 'true')
  })

  it('navigates into a folder on double click and updates the path bar', () => {
    render(<FinderApp />)
    const folder = screen.getByTestId('finder-item-applications')
    fireEvent.doubleClick(folder)
    expect(screen.getByTestId('finder-path')).toHaveTextContent('Macintosh HD / Applications')
  })
})
