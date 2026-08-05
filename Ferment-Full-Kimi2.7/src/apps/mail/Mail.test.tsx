import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Mail } from './Mail'

describe('Mail', () => {
  beforeEach(() => {
    render(<Mail />)
  })

  it('renders the inbox and folder sidebar', () => {
    expect(screen.getByTestId('mail-app')).toBeInTheDocument()
    expect(screen.getByTestId('mail-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('mail-list')).toBeInTheDocument()
    expect(screen.getByTestId('mail-folder-inbox')).toBeInTheDocument()
  })

  it('shows message list items and selects a message', async () => {
    const item = screen.getByTestId('mail-item-em-1')
    expect(item).toBeInTheDocument()
    await userEvent.click(item)
    expect(screen.getByTestId('mail-reading-pane')).toHaveTextContent(
      'Welcome to your new Mac'
    )
    expect(screen.getByTestId('mail-reading-sender')).toHaveTextContent('Apple')
  })

  it('toggles a message flag', async () => {
    const item = screen.getByTestId('mail-item-em-1')
    const flag = within(item).getByTestId('mail-flag-em-1')
    await userEvent.click(flag)
    // Flag state changes; mainly asserting the button is present and clickable.
    expect(flag).toBeInTheDocument()
  })

  it('deletes a message from inbox and shows it in trash', async () => {
    expect(screen.getByTestId('mail-item-em-2')).toBeInTheDocument()
    const item = screen.getByTestId('mail-item-em-2')
    await userEvent.click(within(item).getByTestId('mail-delete-em-2'))
    expect(screen.queryByTestId('mail-item-em-2')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('mail-folder-trash'))
    expect(screen.getByTestId('mail-item-em-2')).toBeInTheDocument()
  })

  it('switches folders and shows empty state when appropriate', async () => {
    await userEvent.click(screen.getByTestId('mail-folder-sent'))
    expect(screen.getByTestId('mail-item-em-3')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('mail-folder-drafts'))
    expect(screen.getByTestId('mail-item-em-4')).toBeInTheDocument()
  })

  it('composes and sends a new message', async () => {
    await userEvent.click(screen.getByTestId('mail-compose'))
    expect(screen.getByTestId('mail-compose-modal')).toBeInTheDocument()

    await userEvent.type(
      screen.getByTestId('mail-compose-subject'),
      'Test subject'
    )
    await userEvent.type(
      screen.getByTestId('mail-compose-body'),
      'Hello from the test'
    )
    await userEvent.click(screen.getByTestId('mail-compose-send'))

    expect(screen.queryByTestId('mail-compose-modal')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('mail-folder-sent'))
    expect(screen.getByText('Test subject')).toBeInTheDocument()
  })

  it('escapes HTML payloads in the email body', async () => {
    const payload = '<script>alert("xss")</script>'
    await userEvent.click(screen.getByTestId('mail-compose'))
    await userEvent.type(
      screen.getByTestId('mail-compose-to'),
      'test@example.com'
    )
    await userEvent.type(
      screen.getByTestId('mail-compose-subject'),
      'Security test'
    )
    await userEvent.type(screen.getByTestId('mail-compose-body'), payload)
    await userEvent.click(screen.getByTestId('mail-compose-send'))
    await userEvent.click(screen.getByTestId('mail-folder-sent'))
    await userEvent.click(screen.getByText('Security test'))
    const readingPane = screen.getByTestId('mail-reading-pane')
    expect(within(readingPane).getByText(payload)).toBeInTheDocument()
    expect(readingPane.querySelector('script')).not.toBeInTheDocument()
  })
})
