import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Photos } from './Photos'

describe('Photos', () => {
  beforeEach(() => {
    render(<Photos />)
  })

  it('renders the albums sidebar and photo grid', () => {
    expect(screen.getByTestId('photos-app')).toBeInTheDocument()
    expect(screen.getByTestId('photos-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('photos-grid')).toBeInTheDocument()
    expect(screen.getByTestId('photos-album-library')).toBeInTheDocument()
  })

  it('switches albums and filters photos', async () => {
    expect(screen.getByTestId('photos-photo-ph-1')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('photos-album-favorites'))
    expect(screen.getByTestId('photos-photo-ph-1')).toBeInTheDocument()
    expect(screen.queryByTestId('photos-photo-ph-2')).not.toBeInTheDocument()
  })

  it('opens and closes the photo viewer', async () => {
    await userEvent.click(screen.getByTestId('photos-photo-ph-1'))
    expect(screen.getByTestId('photos-viewer')).toBeInTheDocument()
    expect(screen.getByTestId('photos-viewer-image')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('photos-viewer-close'))
    expect(screen.queryByTestId('photos-viewer')).not.toBeInTheDocument()
  })

  it('navigates to the next photo in the viewer', async () => {
    await userEvent.click(screen.getByTestId('photos-photo-ph-1'))
    expect(screen.getByTestId('photos-viewer-title')).toHaveTextContent('Golden Gate')
    await userEvent.click(screen.getByTestId('photos-viewer-next'))
    expect(screen.getByTestId('photos-viewer-title')).toHaveTextContent('Ocean Waves')
  })

  it('toggles favorite status for a photo', async () => {
    const grid = screen.getByTestId('photos-grid')
    expect(within(grid).queryByTestId('photos-viewer-favorite')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('photos-photo-ph-3'))
    await userEvent.click(screen.getByTestId('photos-viewer-favorite'))
    await userEvent.click(screen.getByTestId('photos-viewer-close'))
    await userEvent.click(screen.getByTestId('photos-album-favorites'))
    expect(screen.getByTestId('photos-photo-ph-3')).toBeInTheDocument()
  })
})
