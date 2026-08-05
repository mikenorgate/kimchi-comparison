import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Tv } from './Tv'

describe('TV', () => {
  beforeEach(() => {
    render(<Tv />)
  })

  it('renders the featured hero and category rows', () => {
    expect(screen.getByTestId('tv-app')).toBeInTheDocument()
    expect(screen.getByTestId('tv-hero')).toBeInTheDocument()
    expect(screen.getByTestId('tv-row-cat-watch-now')).toBeInTheDocument()
    expect(screen.getAllByTestId('tv-item-cat-watch-now-mv-1').length).toBeGreaterThanOrEqual(1)
  })

  it('opens the player when a movie is clicked', async () => {
    await userEvent.click(screen.getAllByTestId('tv-item-cat-watch-now-mv-2')[0])
    expect(screen.getByTestId('tv-player')).toBeInTheDocument()
    expect(screen.getByTestId('tv-player-title')).toHaveTextContent(
      'Coastal Dreams'
    )
  })

  it('closes the player', async () => {
    await userEvent.click(screen.getAllByTestId('tv-item-cat-action-mv-3')[0])
    expect(screen.getByTestId('tv-player')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('tv-player-close'))
    expect(screen.queryByTestId('tv-player')).not.toBeInTheDocument()
  })

  it('toggles play and pause in the player', async () => {
    await userEvent.click(screen.getByTestId('tv-play-mv-1'))
    expect(screen.getByTestId('tv-player-play')).toHaveAttribute(
      'aria-label',
      'Play'
    )
    await userEvent.click(screen.getByTestId('tv-player-play'))
    expect(screen.getByTestId('tv-player-play')).toHaveAttribute(
      'aria-label',
      'Pause'
    )
  })
})
