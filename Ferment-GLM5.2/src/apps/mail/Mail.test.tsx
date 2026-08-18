import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Mail from './Mail'

afterEach(() => cleanup())

describe('Mail + Messages', () => {
  it('renders with Mail tab active by default', () => {
    render(<Mail />)
    expect(screen.getByTestId('mail')).toBeInTheDocument()
    expect(screen.getByTestId('mail-inbox')).toBeInTheDocument()
    expect(screen.queryByTestId('messages-list')).not.toBeInTheDocument()
  })

  it('selects an email and shows the body', () => {
    render(<Mail />)
    fireEvent.click(screen.getByTestId('mail-item-mail-1'))

    expect(screen.getByTestId('mail-reading')).toBeInTheDocument()
    expect(screen.getByTestId('mail-body').textContent).toContain('Welcome to macOS Tahoe')
  })

  it('composes and sends an email to the outbox', () => {
    render(<Mail />)
    fireEvent.click(screen.getByTestId('mail-compose'))

    const composeForm = screen.getByTestId('mail-compose-form')
    expect(composeForm).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('compose-to'), { target: { value: 'friend@example.com' } })
    fireEvent.change(screen.getByTestId('compose-subject'), { target: { value: 'Hello' } })
    fireEvent.change(screen.getByTestId('compose-body'), { target: { value: 'This is a test email.' } })
    fireEvent.click(screen.getByTestId('compose-send'))

    // Compose form should close
    expect(screen.queryByTestId('mail-compose-form')).not.toBeInTheDocument()

    // Outbox should contain the sent email
    const outbox = screen.getByTestId('mail-outbox')
    expect(outbox.textContent).toContain('friend@example.com')
    expect(outbox.textContent).toContain('Hello')
    expect(outbox.textContent).toContain('This is a test email.')
  })

  it('switches to Messages tab', () => {
    render(<Mail />)
    fireEvent.click(screen.getByTestId('tab-messages'))

    expect(screen.getByTestId('messages-list')).toBeInTheDocument()
    expect(screen.queryByTestId('mail-inbox')).not.toBeInTheDocument()
  })

  it('selects a conversation and views the thread', () => {
    render(<Mail />)
    fireEvent.click(screen.getByTestId('tab-messages'))
    fireEvent.click(screen.getByTestId('conv-item-conv-1'))

    expect(screen.getByTestId('message-thread')).toBeInTheDocument()
    expect(screen.getByTestId('message-thread').textContent).toContain('Hey! Are you coming to the meeting?')
  })

  it('sends a message that appends to the thread', () => {
    render(<Mail />)
    fireEvent.click(screen.getByTestId('tab-messages'))
    fireEvent.click(screen.getByTestId('conv-item-conv-1'))

    const input = screen.getByTestId('message-input')
    fireEvent.change(input, { target: { value: 'See you in 5!' } })
    fireEvent.click(screen.getByTestId('message-send'))

    // The message should appear in the thread
    expect(screen.getByTestId('message-thread').textContent).toContain('See you in 5!')
    // Input should be cleared
    expect(screen.getByTestId('message-input')).toHaveValue('')
  })

  it('marks email as read when selected', () => {
    render(<Mail />)
    // mail-1 starts unread (blue dot)
    const item = screen.getByTestId('mail-item-mail-1')
    expect(item.textContent).toContain('●')

    fireEvent.click(item)

    // After selecting, it should be read (no blue dot)
    expect(item.textContent).not.toContain('●')
  })
})
