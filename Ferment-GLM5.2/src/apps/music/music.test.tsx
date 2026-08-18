import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Music } from './music'

function resetMusic() {
  localStorage.removeItem('tahoe.music-library')
  localStorage.removeItem('tahoe.music-playlists')
}

describe('Music', () => {
  beforeEach(() => {
    resetMusic()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the music root with sidebar, tracklist, and now-playing bar', () => {
    render(<Music windowId="w1" />)
    expect(screen.getByTestId('music-root')).toBeInTheDocument()
    expect(screen.getByTestId('music-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('music-tracklist')).toBeInTheDocument()
    expect(screen.getByTestId('now-playing')).toBeInTheDocument()
  })

  it('shows library view by default with all tracks', () => {
    render(<Music windowId="w1" />)
    expect(screen.getByTestId('track-t1')).toBeInTheDocument()
    expect(screen.getByTestId('track-t10')).toBeInTheDocument()
  })

  it('displays track title, artist, album, and duration in the table', () => {
    render(<Music windowId="w1" />)
    const row = screen.getByTestId('track-t1')
    expect(row).toHaveTextContent('Morning Light')
    expect(row).toHaveTextContent('Aurora Bay')
    expect(row).toHaveTextContent('Horizon')
    expect(row).toHaveTextContent('3:34')
  })

  it('now-playing bar shows "Not Playing" initially', () => {
    render(<Music windowId="w1" />)
    expect(screen.getByTestId('np-title')).toHaveTextContent('Not Playing')
  })

  it('clicking a track plays it', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t1'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Morning Light')
    expect(screen.getByTestId('np-artist')).toHaveTextContent('Aurora Bay')
    expect(screen.getByTestId('btn-play')).toHaveTextContent('⏸')
  })

  it('play/pause button toggles playback', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t1'))
    })
    expect(screen.getByTestId('btn-play')).toHaveTextContent('⏸')
    act(() => {
      fireEvent.click(screen.getByTestId('btn-play'))
    })
    expect(screen.getByTestId('btn-play')).toHaveTextContent('▶')
    act(() => {
      fireEvent.click(screen.getByTestId('btn-play'))
    })
    expect(screen.getByTestId('btn-play')).toHaveTextContent('⏸')
  })

  it('next button advances to the next track', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-next'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Electric Dreams')
  })

  it('prev button goes back to the previous track', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-prev'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Electric Dreams')
  })

  it('prev button within 3 seconds goes to previous track', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-prev'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Electric Dreams')
  })

  it('prev button after 3 seconds restarts current track', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t2'))
    })
    // Advance position past 3 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-prev'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Electric Dreams')
    expect(screen.getByTestId('np-position')).toHaveTextContent('0:00')
  })

  it('next wraps around to first track', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t10'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-next'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Morning Light')
  })

  it('playback position advances on interval when playing', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t1'))
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('0:00')
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('0:03')
  })

  it('seek bar changes position', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t1'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('seek-bar'), { target: { value: 60 } })
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('1:00')
  })

  it('now-playing shows duration of current track', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t1'))
    })
    expect(screen.getByTestId('np-duration')).toHaveTextContent('3:34')
  })

  it('creates a new playlist', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('playlist-name-input'), { target: { value: 'Chill Mix' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-create'))
    })
    const playlists = screen.getAllByTestId(/playlist-pl-/)
    expect(playlists).toHaveLength(1)
    expect(playlists[0]).toHaveTextContent('Chill Mix')
  })

  it('new playlist is empty when selected', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('playlist-name-input'), { target: { value: 'Empty' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-create'))
    })
    const playlistBtn = screen.getAllByTestId(/playlist-pl-/)[0]
    act(() => {
      fireEvent.click(playlistBtn)
    })
    expect(screen.getByTestId('music-empty')).toBeInTheDocument()
  })

  it('persists playlists to localStorage', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('playlist-name-input'), { target: { value: 'My Mix' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-create'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.music-playlists')!)
    expect(stored.some((p: { name: string }) => p.name === 'My Mix')).toBe(true)
  })

  it('creating playlist with empty name does nothing', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-add'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-create'))
    })
    expect(screen.queryAllByTestId(/playlist-pl-/)).toHaveLength(0)
  })

  it('adds a track to a playlist', () => {
    render(<Music windowId="w1" />)
    // Create playlist
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('playlist-name-input'), { target: { value: 'Road Trip' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-create'))
    })
    // Add track t1 to the playlist
    const playlistBtn = screen.getAllByTestId(/playlist-pl-/)[0]
    const playlistId = playlistBtn.dataset.testid!.replace('playlist-', '')
    act(() => {
      fireEvent.click(screen.getByTestId(`add-t1-to-${playlistId}`))
    })
    // Switch to playlist view
    act(() => {
      fireEvent.click(playlistBtn)
    })
    expect(screen.getByTestId('track-t1')).toBeInTheDocument()
    expect(screen.queryByTestId('track-t2')).toBeNull()
  })

  it('removes a track from a playlist', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-add'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('playlist-name-input'), { target: { value: 'Mix' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('playlist-create'))
    })
    const playlistBtn = screen.getAllByTestId(/playlist-pl-/)[0]
    const playlistId = playlistBtn.dataset.testid!.replace('playlist-', '')
    // Add two tracks
    act(() => {
      fireEvent.click(screen.getByTestId(`add-t1-to-${playlistId}`))
      fireEvent.click(screen.getByTestId(`add-t2-to-${playlistId}`))
    })
    // Switch to playlist
    act(() => {
      fireEvent.click(playlistBtn)
    })
    expect(screen.getByTestId('track-t1')).toBeInTheDocument()
    expect(screen.getByTestId('track-t2')).toBeInTheDocument()
    // Remove t1
    act(() => {
      fireEvent.click(screen.getByTestId('remove-from-t1'))
    })
    expect(screen.queryByTestId('track-t1')).toBeNull()
    expect(screen.getByTestId('track-t2')).toBeInTheDocument()
  })

  it('auto-advances to next track when current finishes', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t1'))
    })
    // t1 duration is 214 seconds
    act(() => {
      vi.advanceTimersByTime(214000)
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Electric Dreams')
  })

  it('currently playing track is highlighted in the tracklist', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t5'))
    })
    const row = screen.getByTestId('track-t5')
    expect(row.style.background).toContain('rgba(0, 122, 255')
  })

  it('playing track shows play icon in the # column', () => {
    render(<Music windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('track-t3'))
    })
    const row = screen.getByTestId('track-t3')
    expect(row).toHaveTextContent('▶')
  })

  it('play controls are disabled when no track is playing', () => {
    render(<Music windowId="w1" />)
    expect((screen.getByTestId('btn-play') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('btn-next') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('btn-prev') as HTMLButtonElement).disabled).toBe(true)
  })
})
