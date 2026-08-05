import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Podcasts } from './Podcasts'

describe('Podcasts', () => {
  beforeEach(() => {
    render(<Podcasts />)
  })

  it('renders the library and episode list', () => {
    expect(screen.getByTestId('podcasts-app')).toBeInTheDocument()
    expect(screen.getByTestId('podcasts-library')).toBeInTheDocument()
    expect(screen.getByTestId('podcasts-episode-list')).toBeInTheDocument()
    expect(screen.getByTestId('podcasts-episode-ep-1')).toBeInTheDocument()
  })

  it('selects a podcast and shows its episodes', async () => {
    await userEvent.click(screen.getByTestId('podcasts-podcast-pod-2'))
    expect(screen.getByTestId('podcasts-show-title')).toHaveTextContent(
      'The Daily'
    )
    expect(screen.getByTestId('podcasts-episode-ep-3')).toBeInTheDocument()
    expect(screen.queryByTestId('podcasts-episode-ep-1')).not.toBeInTheDocument()
  })

  it('starts playback and toggles play/pause', async () => {
    await userEvent.click(screen.getByTestId('podcasts-play-ep-1'))
    expect(screen.getByTestId('podcasts-current-title')).toHaveTextContent(
      'Interfaces That Breathe'
    )
    expect(screen.getByTestId('podcasts-play-pause')).toHaveAttribute(
      'aria-label',
      'Pause'
    )
    await userEvent.click(screen.getByTestId('podcasts-play-pause'))
    expect(screen.getByTestId('podcasts-play-pause')).toHaveAttribute(
      'aria-label',
      'Play'
    )
  })

  it('skips to the next episode', async () => {
    await userEvent.click(screen.getByTestId('podcasts-play-ep-1'))
    expect(screen.getByTestId('podcasts-current-title')).toHaveTextContent(
      'Interfaces That Breathe'
    )
    await userEvent.click(screen.getByTestId('podcasts-next'))
    expect(screen.getByTestId('podcasts-current-title')).toHaveTextContent(
      'The Typography Episode'
    )
  })

  it('filters episodes by search query', async () => {
    await userEvent.type(screen.getByTestId('podcasts-search'), 'typography')
    expect(
      screen.queryByTestId('podcasts-episode-ep-1')
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('podcasts-episode-ep-2')).toBeInTheDocument()
  })
})
