import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TV } from './tv'

function resetTV() {
  localStorage.removeItem('tahoe.tv-progress')
}

describe('TV', () => {
  beforeEach(() => {
    resetTV()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the TV root with sidebar and welcome screen', () => {
    render(<TV windowId="w1" />)
    expect(screen.getByTestId('tv-root')).toBeInTheDocument()
    expect(screen.getByTestId('tv-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('tv-welcome')).toHaveTextContent('TV Shows')
  })

  it('shows show cards in the grid', () => {
    render(<TV windowId="w1" />)
    expect(screen.getByTestId('show-card-s1')).toBeInTheDocument()
    expect(screen.getByTestId('show-card-s2')).toBeInTheDocument()
    expect(screen.getByTestId('show-card-s3')).toBeInTheDocument()
  })

  it('clicking a show card opens the episode list', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-s1'))
    })
    expect(screen.getByTestId('show-title')).toHaveTextContent('The Horizon')
    expect(screen.getByTestId('show-genre')).toHaveTextContent('Drama')
    expect(screen.getByTestId('episode-list')).toBeInTheDocument()
  })

  it('sidebar show selection opens episode list', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s2'))
    })
    expect(screen.getByTestId('show-title')).toHaveTextContent('City Nights')
  })

  it('shows all episodes for a show', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    expect(screen.getByTestId('episode-s1e1')).toBeInTheDocument()
    expect(screen.getByTestId('episode-s1e2')).toBeInTheDocument()
    expect(screen.getByTestId('episode-s1e3')).toBeInTheDocument()
  })

  it('episode shows season, episode number, title, and duration', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    const ep = screen.getByTestId('episode-s1e1')
    expect(ep).toHaveTextContent('S1 E1')
    expect(ep).toHaveTextContent('Pilot')
    expect(ep).toHaveTextContent('47:20')
  })

  it('clicking an episode opens the player', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    expect(screen.getByTestId('tv-player')).toBeInTheDocument()
    expect(screen.getByTestId('tv-video-area')).toBeInTheDocument()
  })

  it('player shows play/pause button initially playing', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    expect(screen.getByTestId('tv-play')).toHaveTextContent('⏸')
  })

  it('clicking play/pause toggles playback', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('tv-play'))
    })
    expect(screen.getByTestId('tv-play')).toHaveTextContent('▶')
    act(() => {
      fireEvent.click(screen.getByTestId('tv-play'))
    })
    expect(screen.getByTestId('tv-play')).toHaveTextContent('⏸')
  })

  it('clicking video area toggles playback', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    expect(screen.getByTestId('tv-play')).toHaveTextContent('⏸')
    act(() => {
      fireEvent.click(screen.getByTestId('tv-video-area'))
    })
    expect(screen.getByTestId('tv-play')).toHaveTextContent('▶')
  })

  it('position advances on interval when playing', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    expect(screen.getByTestId('tv-position')).toHaveTextContent('0:00')
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByTestId('tv-position')).toHaveTextContent('0:05')
  })

  it('seek bar changes position', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('tv-seek'), { target: { value: 120 } })
    })
    expect(screen.getByTestId('tv-position')).toHaveTextContent('2:00')
  })

  it('player shows episode duration', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    expect(screen.getByTestId('tv-duration')).toHaveTextContent('47:20')
  })

  it('back button returns to episode list and saves progress', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('tv-back'))
    })
    // Back to episode list
    expect(screen.getByTestId('episode-list')).toBeInTheDocument()
    // Progress saved to localStorage
    const stored = JSON.parse(localStorage.getItem('tahoe.tv-progress')!)
    expect(stored['s1e1']).toBe(10)
  })

  it('partially watched episode shows resume indicator', () => {
    // Pre-set progress
    localStorage.setItem('tahoe.tv-progress', JSON.stringify({ 's1e1': 600 }))
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    expect(screen.getByTestId('episode-progress-s1e1')).toHaveTextContent('Resume at 10:00')
  })

  it('playing a partially watched episode resumes from saved position', () => {
    localStorage.setItem('tahoe.tv-progress', JSON.stringify({ 's1e1': 600 }))
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    expect(screen.getByTestId('tv-position')).toHaveTextContent('10:00')
  })

  it('playing a fully watched episode restarts from beginning', () => {
    localStorage.setItem('tahoe.tv-progress', JSON.stringify({ 's1e1': 2840 }))
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    expect(screen.getByTestId('tv-position')).toHaveTextContent('0:00')
  })

  it('fully watched episode shows checkmark icon', () => {
    localStorage.setItem('tahoe.tv-progress', JSON.stringify({ 's1e1': 2840 }))
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    expect(screen.getByTestId('episode-icon-s1e1')).toHaveTextContent('✓')
  })

  it('unwatched episode shows play icon', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    expect(screen.getByTestId('episode-icon-s1e1')).toHaveTextContent('▶')
  })

  it('playback stops at end of episode', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s2'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s2e1'))
    })
    // s2e1 duration is 1820
    act(() => {
      vi.advanceTimersByTime(1820000)
    })
    expect(screen.getByTestId('tv-play')).toHaveTextContent('▶')
    expect(screen.getByTestId('tv-position')).toHaveTextContent('30:20')
  })

  it('clicking play after episode finishes restarts from beginning', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s2'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s2e1'))
    })
    act(() => {
      vi.advanceTimersByTime(1820000)
    })
    expect(screen.getByTestId('tv-position')).toHaveTextContent('30:20')
    act(() => {
      fireEvent.click(screen.getByTestId('tv-play'))
    })
    expect(screen.getByTestId('tv-play')).toHaveTextContent('⏸')
    expect(screen.getByTestId('tv-position')).toHaveTextContent('0:00')
  })

  it('fullscreen toggle works', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e1'))
    })
    const player = screen.getByTestId('tv-player')
    expect(player.style.position).not.toBe('absolute')
    act(() => {
      fireEvent.click(screen.getByTestId('tv-fullscreen'))
    })
    expect(screen.getByTestId('tv-player').style.position).toBe('absolute')
    act(() => {
      fireEvent.click(screen.getByTestId('tv-fullscreen'))
    })
    expect(screen.getByTestId('tv-player').style.position).not.toBe('absolute')
  })

  it('persists watch progress to localStorage', () => {
    render(<TV windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-s1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-s1e2'))
    })
    act(() => {
      vi.advanceTimersByTime(30000)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('tv-back'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.tv-progress')!)
    expect(stored['s1e2']).toBe(30)
  })
})
