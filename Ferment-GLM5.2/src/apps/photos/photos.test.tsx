import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Photos } from './photos'

function resetPhotos() {
  localStorage.removeItem('tahoe.photos-favorites')
  localStorage.removeItem('tahoe.photos-albums')
}

describe('Photos', () => {
  beforeEach(() => {
    resetPhotos()
  })

  it('renders the photos root with sidebar and grid', () => {
    render(<Photos windowId="w1" />)
    expect(screen.getByTestId('photos-root')).toBeInTheDocument()
    expect(screen.getByTestId('photos-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('photos-grid')).toBeInTheDocument()
  })

  it('shows default albums in sidebar', () => {
    render(<Photos windowId="w1" />)
    expect(screen.getByTestId('album-all')).toHaveTextContent('All Photos')
    expect(screen.getByTestId('album-favorites')).toHaveTextContent('Favorites')
    expect(screen.getByTestId('album-recents')).toHaveTextContent('Recents')
  })

  it('displays sample photos in the grid', () => {
    render(<Photos windowId="w1" />)
    expect(screen.getByTestId('photo-photo-1')).toBeInTheDocument()
    expect(screen.getByTestId('photo-photo-2')).toBeInTheDocument()
    expect(screen.getByTestId('photo-photo-12')).toBeInTheDocument()
  })

  it('opens photo viewer when a photo is clicked', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    expect(screen.getByTestId('photo-viewer')).toBeInTheDocument()
    expect(screen.getByTestId('viewer-image')).toBeInTheDocument()
    expect(screen.getByTestId('viewer-title')).toHaveTextContent('Sample Photo 1')
  })

  it('viewer shows photo counter', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    expect(screen.getByTestId('viewer-counter')).toHaveTextContent('1 / 12')
  })

  it('navigates to next photo with next button', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-next'))
    })
    expect(screen.getByTestId('viewer-title')).toHaveTextContent('Sample Photo 2')
    expect(screen.getByTestId('viewer-counter')).toHaveTextContent('2 / 12')
  })

  it('navigates to previous photo with prev button', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-prev'))
    })
    expect(screen.getByTestId('viewer-title')).toHaveTextContent('Sample Photo 2')
  })

  it('next wraps around to first photo', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-12'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-next'))
    })
    expect(screen.getByTestId('viewer-title')).toHaveTextContent('Sample Photo 1')
  })

  it('prev wraps around to last photo', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-prev'))
    })
    expect(screen.getByTestId('viewer-title')).toHaveTextContent('Sample Photo 12')
  })

  it('closes viewer with close button', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    expect(screen.getByTestId('photo-viewer')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-close'))
    })
    expect(screen.queryByTestId('photo-viewer')).toBeNull()
  })

  it('closes viewer when clicking the backdrop', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    expect(screen.getByTestId('photo-viewer')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('photo-viewer'))
    })
    expect(screen.queryByTestId('photo-viewer')).toBeNull()
  })

  it('toggles favorite from viewer', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    // Not favorited initially
    expect(screen.queryByTestId('fav-photo-1')).toBeNull()
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-favorite'))
    })
    // Now favorited — star appears in grid (behind overlay) and button changes
    expect(screen.getByTestId('viewer-favorite')).toHaveTextContent('★')
  })

  it('favorite star appears on photo thumbnail in grid', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-favorite'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-close'))
    })
    expect(screen.getByTestId('fav-photo-1')).toBeInTheDocument()
  })

  it('favorites filter shows only favorited photos', () => {
    render(<Photos windowId="w1" />)
    // Favorite photo 1
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-favorite'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-close'))
    })
    // Switch to Favorites album
    act(() => {
      fireEvent.click(screen.getByTestId('album-favorites'))
    })
    expect(screen.getByTestId('photo-photo-1')).toBeInTheDocument()
    expect(screen.queryByTestId('photo-photo-2')).toBeNull()
    expect(screen.queryByTestId('photo-photo-3')).toBeNull()
  })

  it('favorites count appears in sidebar', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-favorite'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-close'))
    })
    expect(screen.getByTestId('album-favorites')).toHaveTextContent('1')
  })

  it('unfavorites a photo by toggling favorite again', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-favorite'))
    })
    expect(screen.getByTestId('viewer-favorite')).toHaveTextContent('★')
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-favorite'))
    })
    expect(screen.getByTestId('viewer-favorite')).toHaveTextContent('☆')
  })

  it('persists favorites to localStorage', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('photo-photo-5'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('viewer-favorite'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.photos-favorites')!)
    expect(stored).toContain('photo-5')
  })

  it('creates a new album', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('album-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('album-name-input'), { target: { value: 'Vacation' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('album-create'))
    })
    // New album should appear in sidebar
    const albums = screen.getAllByTestId(/album-album-/)
    expect(albums.length).toBeGreaterThan(0)
    expect(albums[0]).toHaveTextContent('Vacation')
  })

  it('new album is empty when selected', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('album-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('album-name-input'), { target: { value: 'Empty Album' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('album-create'))
    })
    const albumBtn = screen.getAllByTestId(/album-album-/)[0]
    act(() => {
      fireEvent.click(albumBtn)
    })
    expect(screen.getByTestId('photos-empty')).toBeInTheDocument()
  })

  it('persists albums to localStorage', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('album-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('album-name-input'), { target: { value: 'My Album' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('album-create'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.photos-albums')!)
    expect(stored.some((a: { name: string }) => a.name === 'My Album')).toBe(true)
  })

  it('creating album with empty name does nothing', () => {
    render(<Photos windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('album-add'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('album-create'))
    })
    // No new album should appear
    expect(screen.queryAllByTestId(/album-album-/)).toHaveLength(0)
  })
})
