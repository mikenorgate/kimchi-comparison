import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Music } from './Music'

describe('Music', () => {
  beforeEach(() => {
    render(<Music />)
  })

  it('renders the sidebar and track list', () => {
    expect(screen.getByTestId('music-app')).toBeInTheDocument()
    expect(screen.getByTestId('music-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('music-track-list')).toBeInTheDocument()
    expect(screen.getByTestId('music-track-tr-1')).toBeInTheDocument()
  })

  it('selects a track and starts playback', async () => {
    await userEvent.click(screen.getByTestId('music-track-tr-1'))
    expect(screen.getByTestId('music-current-title')).toHaveTextContent(
      'Midnight City'
    )
    expect(screen.getByTestId('music-play-pause')).toHaveAttribute(
      'aria-label',
      'Pause'
    )
  })

  it('pauses and resumes playback', async () => {
    await userEvent.click(screen.getByTestId('music-track-tr-2'))
    await userEvent.click(screen.getByTestId('music-play-pause'))
    expect(screen.getByTestId('music-play-pause')).toHaveAttribute(
      'aria-label',
      'Play'
    )
    await userEvent.click(screen.getByTestId('music-play-pause'))
    expect(screen.getByTestId('music-play-pause')).toHaveAttribute(
      'aria-label',
      'Pause'
    )
  })

  it('navigates to the next track', async () => {
    await userEvent.click(screen.getByTestId('music-track-tr-1'))
    expect(screen.getByTestId('music-current-title')).toHaveTextContent(
      'Midnight City'
    )
    await userEvent.click(screen.getByTestId('music-next'))
    expect(screen.getByTestId('music-current-title')).toHaveTextContent(
      'Blinding Lights'
    )
  })

  it('toggles favorite and filters the favorites playlist', async () => {
    await userEvent.click(
      within(screen.getByTestId('music-track-tr-3')).getByTestId(
        'music-favorite-tr-3'
      )
    )
    await userEvent.click(screen.getByTestId('music-playlist-favorites'))
    expect(screen.getByTestId('music-track-tr-3')).toBeInTheDocument()
    expect(screen.queryByTestId('music-track-tr-1')).not.toBeInTheDocument()
  })
})
