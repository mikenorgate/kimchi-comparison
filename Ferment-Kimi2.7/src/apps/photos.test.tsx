import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhotosApp } from './components'

describe('PhotosApp', () => {
  it('renders the photo grid with all thumbnails', () => {
    render(<PhotosApp />)
    expect(screen.getByTestId('photos-grid')).toBeInTheDocument()
    for (const id of ['1', '2', '3', '4', '5', '6']) {
      expect(screen.getByTestId(`photo-thumbnail-${id}`)).toBeInTheDocument()
    }
  })

  it('opens a placeholder detail view when a thumbnail is clicked', () => {
    render(<PhotosApp />)
    fireEvent.click(screen.getByTestId('photo-thumbnail-1'))
    expect(screen.getByTestId('photo-detail')).toBeInTheDocument()
    expect(screen.getByTestId('photo-detail-title')).toHaveTextContent('Tahoe Sunrise')
    expect(screen.getByTestId('photo-detail-date')).toHaveTextContent('Aug 1, 2026')
    expect(screen.getByTestId('photo-detail-image-1')).toBeInTheDocument()
  })

  it('returns to the grid from the detail view', () => {
    render(<PhotosApp />)
    fireEvent.click(screen.getByTestId('photo-thumbnail-2'))
    expect(screen.getByTestId('photo-detail')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('photo-detail-back'))
    expect(screen.getByTestId('photos-grid')).toBeInTheDocument()
    expect(screen.queryByTestId('photo-detail')).not.toBeInTheDocument()
  })
})
