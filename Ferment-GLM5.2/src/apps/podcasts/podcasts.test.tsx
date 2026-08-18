import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Podcasts } from './podcasts'

function resetPodcasts() {
  localStorage.removeItem('tahoe.podcasts-subscriptions')
  localStorage.removeItem('tahoe.podcasts-progress')
}

describe('Podcasts', () => {
  beforeEach(() => {
    resetPodcasts()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the root with sidebar, browse view, and now-playing bar', () => {
    render(<Podcasts windowId="w1" />)
    expect(screen.getByTestId('podcasts-root')).toBeInTheDocument()
    expect(screen.getByTestId('podcasts-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('podcasts-browse')).toBeInTheDocument()
    expect(screen.getByTestId('now-playing')).toBeInTheDocument()
  })

  it('shows all podcast shows in browse grid', () => {
    render(<Podcasts windowId="w1" />)
    expect(screen.getByTestId('show-card-ps1')).toBeInTheDocument()
    expect(screen.getByTestId('show-card-ps2')).toBeInTheDocument()
    expect(screen.getByTestId('show-card-ps3')).toBeInTheDocument()
    expect(screen.getByTestId('show-card-ps4')).toBeInTheDocument()
  })

  it('clicking a show card opens show detail', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    expect(screen.getByTestId('podcast-title')).toHaveTextContent('Tech Today')
    expect(screen.getByTestId('podcast-author')).toHaveTextContent('Daily Tech')
    expect(screen.getByTestId('podcast-description')).toBeInTheDocument()
  })

  it('show detail lists all episodes', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    expect(screen.getByTestId('episode-ps1e1')).toBeInTheDocument()
    expect(screen.getByTestId('episode-ps1e2')).toBeInTheDocument()
    expect(screen.getByTestId('episode-ps1e3')).toBeInTheDocument()
  })

  it('subscribe button toggles subscription', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    expect(screen.getByTestId('subscribe-btn')).toHaveTextContent('+ Subscribe')
    act(() => {
      fireEvent.click(screen.getByTestId('subscribe-btn'))
    })
    expect(screen.getByTestId('subscribe-btn')).toHaveTextContent('✓ Subscribed')
    act(() => {
      fireEvent.click(screen.getByTestId('subscribe-btn'))
    })
    expect(screen.getByTestId('subscribe-btn')).toHaveTextContent('+ Subscribe')
  })

  it('subscribed show appears in sidebar', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps2'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('subscribe-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('view-browse'))
    })
    expect(screen.getByTestId('sub-show-ps2')).toBeInTheDocument()
  })

  it('subscribed show shows badge in browse grid', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('subscribe-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('view-browse'))
    })
    expect(screen.getByTestId('sub-badge-ps3')).toBeInTheDocument()
  })

  it('persists subscriptions to localStorage', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('subscribe-btn'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.podcasts-subscriptions')!)
    expect(stored).toContain('ps1')
  })

  it('now-playing shows "Not Playing" initially', () => {
    render(<Podcasts windowId="w1" />)
    expect(screen.getByTestId('np-title')).toHaveTextContent('Not Playing')
  })

  it('clicking an episode plays it', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('AI and the Future')
    expect(screen.getByTestId('np-show')).toHaveTextContent('Tech Today')
    expect(screen.getByTestId('btn-play')).toHaveTextContent('⏸')
  })

  it('play/pause toggles playback', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-play'))
    })
    expect(screen.getByTestId('btn-play')).toHaveTextContent('▶')
    act(() => {
      fireEvent.click(screen.getByTestId('btn-play'))
    })
    expect(screen.getByTestId('btn-play')).toHaveTextContent('⏸')
  })

  it('position advances on interval when playing', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('0:00')
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('0:05')
  })

  it('seek bar changes position', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('seek-bar'), { target: { value: 120 } })
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('2:00')
  })

  it('now-playing shows duration', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    expect(screen.getByTestId('np-duration')).toHaveTextContent('44:00')
  })

  it('next button skips to next episode in same show', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-next'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('The Cloud Wars')
  })

  it('prev button goes back to previous episode', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e2'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-prev'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('AI and the Future')
  })

  it('next button on last episode does nothing', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-next'))
    })
    expect(screen.getByTestId('np-title')).toHaveTextContent('Quantum Computing 101')
  })

  it('playback stops at end of episode', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps2'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps2e1'))
    })
    // ps2e1 duration is 600
    act(() => {
      vi.advanceTimersByTime(600000)
    })
    expect(screen.getByTestId('btn-play')).toHaveTextContent('▶')
    expect(screen.getByTestId('np-position')).toHaveTextContent('10:00')
  })

  it('clicking play after episode finishes restarts', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps2'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps2e1'))
    })
    act(() => {
      vi.advanceTimersByTime(600000)
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('10:00')
    act(() => {
      fireEvent.click(screen.getByTestId('btn-play'))
    })
    expect(screen.getByTestId('btn-play')).toHaveTextContent('⏸')
    expect(screen.getByTestId('np-position')).toHaveTextContent('0:00')
  })

  it('partially watched episode shows resume indicator', () => {
    localStorage.setItem('tahoe.podcasts-progress', JSON.stringify({ 'ps1e1': 300 }))
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    expect(screen.getByTestId('episode-resume-ps1e1')).toHaveTextContent('Resume at 5:00')
  })

  it('playing partially watched episode resumes from saved position', () => {
    localStorage.setItem('tahoe.podcasts-progress', JSON.stringify({ 'ps1e1': 300 }))
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('5:00')
  })

  it('playing fully watched episode restarts from beginning', () => {
    localStorage.setItem('tahoe.podcasts-progress', JSON.stringify({ 'ps1e1': 2640 }))
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps1e1'))
    })
    expect(screen.getByTestId('np-position')).toHaveTextContent('0:00')
  })

  it('fully watched episode shows checkmark', () => {
    localStorage.setItem('tahoe.podcasts-progress', JSON.stringify({ 'ps1e1': 2640 }))
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    expect(screen.getByTestId('episode-icon-ps1e1')).toHaveTextContent('✓')
  })

  it('unwatched episode shows play icon', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps1'))
    })
    expect(screen.getByTestId('episode-icon-ps1e1')).toHaveTextContent('▶')
  })

  it('play controls disabled when no episode is playing', () => {
    render(<Podcasts windowId="w1" />)
    expect((screen.getByTestId('btn-play') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('btn-next') as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByTestId('btn-prev') as HTMLButtonElement).disabled).toBe(true)
  })

  it('persists progress when playback completes', () => {
    render(<Podcasts windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('show-card-ps2'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('episode-ps2e1'))
    })
    act(() => {
      vi.advanceTimersByTime(600000)
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.podcasts-progress')!)
    expect(stored['ps2e1']).toBe(600)
  })
})
