import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { FaceTime } from './FaceTime'

describe('FaceTime', () => {
  beforeEach(() => {
    render(<FaceTime />)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the contacts list', () => {
    expect(screen.getByTestId('facetime-app')).toBeInTheDocument()
    expect(screen.getByTestId('facetime-contact-c-1')).toBeInTheDocument()
    expect(screen.getByTestId('facetime-contact-c-4')).toBeInTheDocument()
  })

  it('starts a call and shows the call UI', async () => {
    await userEvent.click(screen.getByTestId('facetime-contact-c-1'))
    expect(screen.getByTestId('facetime-call')).toBeInTheDocument()
    expect(screen.getByTestId('facetime-call-name')).toHaveTextContent(
      'Alice Johnson'
    )
    expect(screen.getByTestId('facetime-controls')).toBeInTheDocument()
  })

  it('increments the call duration', () => {
    vi.useFakeTimers()
    act(() => {
      fireEvent.click(screen.getByTestId('facetime-contact-c-2'))
    })
    expect(screen.getByTestId('facetime-duration')).toHaveTextContent('00:00')
    act(() => {
      vi.advanceTimersByTime(2500)
    })
    expect(screen.getByTestId('facetime-duration')).toHaveTextContent('00:02')
  })

  it('toggles mute and video', async () => {
    await userEvent.click(screen.getByTestId('facetime-contact-c-3'))
    expect(screen.getByTestId('facetime-mute')).toHaveAttribute(
      'aria-label',
      'Mute'
    )
    await userEvent.click(screen.getByTestId('facetime-mute'))
    expect(screen.getByTestId('facetime-mute')).toHaveAttribute(
      'aria-label',
      'Unmute'
    )
    await userEvent.click(screen.getByTestId('facetime-video'))
    expect(screen.getByTestId('facetime-video')).toHaveAttribute(
      'aria-label',
      'Turn video on'
    )
  })

  it('ends the call and returns to contacts', async () => {
    await userEvent.click(screen.getByTestId('facetime-contact-c-4'))
    expect(screen.getByTestId('facetime-call')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('facetime-end'))
    expect(screen.queryByTestId('facetime-call')).not.toBeInTheDocument()
    expect(screen.getByTestId('facetime-contact-c-4')).toBeInTheDocument()
  })
})
