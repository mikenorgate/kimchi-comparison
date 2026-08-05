import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { VoiceMemos } from './VoiceMemos'

describe('VoiceMemos', () => {
  beforeEach(() => {
    render(<VoiceMemos />)
  })

  it('renders the app with recording list and waveform', () => {
    expect(screen.getByTestId('voice-memos-app')).toBeInTheDocument()
    expect(screen.getByTestId('voice-memos-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('voice-memo-rec-1')).toBeInTheDocument()
    expect(screen.getByTestId('voice-memos-wave-0')).toBeInTheDocument()
  })

  it('selects a different recording from the list', async () => {
    await userEvent.click(screen.getByTestId('voice-memo-rec-2'))
    expect(screen.getByTestId('voice-memos-title')).toHaveTextContent(
      'Meeting notes: design sync'
    )
  })

  it('starts and pauses playback', async () => {
    await userEvent.click(screen.getByTestId('voice-memos-play-pause'))
    expect(screen.getByTestId('voice-memos-play-pause')).toHaveAttribute(
      'aria-label',
      'Pause'
    )

    await userEvent.click(screen.getByTestId('voice-memos-play-pause'))
    expect(screen.getByTestId('voice-memos-play-pause')).toHaveAttribute(
      'aria-label',
      'Play'
    )
  })

  it('stops playback and resets progress display', async () => {
    await userEvent.click(screen.getByTestId('voice-memos-play-pause'))
    await userEvent.click(screen.getByTestId('voice-memos-stop-playback'))
    expect(screen.getByTestId('voice-memos-play-pause')).toHaveAttribute(
      'aria-label',
      'Play'
    )
    expect(screen.getByTestId('voice-memos-progress')).toHaveTextContent(
      '0:00 / 1:08'
    )
  })

  it('records a new memo and adds it to the list', async () => {
    await userEvent.click(screen.getByTestId('voice-memos-record'))
    expect(screen.getByTestId('voice-memos-timer')).toHaveTextContent('00:00')

    await userEvent.click(screen.getByTestId('voice-memos-stop'))
    expect(screen.getByTestId('voice-memos-title')).toHaveTextContent(
      'New Recording 5'
    )
  })

  it('deletes the selected recording', async () => {
    await userEvent.click(screen.getByTestId('voice-memos-delete'))
    expect(screen.queryByTestId('voice-memo-rec-1')).not.toBeInTheDocument()
  })
})
