import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Messages } from './Messages'

describe('Messages', () => {
  beforeEach(() => {
    render(<Messages />)
  })

  it('renders the conversation list and chat view', () => {
    expect(screen.getByTestId('messages-app')).toBeInTheDocument()
    expect(screen.getByTestId('messages-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('messages-list')).toBeInTheDocument()
    expect(screen.getByTestId('messages-conversation-conv-1')).toBeInTheDocument()
  })

  it('selects a conversation and shows its messages', async () => {
    await userEvent.click(screen.getByTestId('messages-conversation-conv-2'))
    expect(screen.getByTestId('messages-header')).toHaveTextContent('Bob')
    expect(screen.getByTestId('messages-message-m-3')).toBeInTheDocument()
  })

  it('marks the selected conversation as read', async () => {
    const first = screen.getByTestId('messages-conversation-conv-1')
    expect(within(first).getByTestId('messages-unread-conv-1')).toBeInTheDocument()
    await userEvent.click(first)
    expect(within(first).queryByTestId('messages-unread-conv-1')).not.toBeInTheDocument()
  })

  it('sends a new message', async () => {
    await userEvent.type(screen.getByTestId('messages-input'), 'Hello Alice')
    await userEvent.click(screen.getByTestId('messages-send'))
    expect(within(screen.getByTestId('messages-list')).getByText('Hello Alice')).toBeInTheDocument()
    expect(screen.getByTestId('messages-input')).toHaveValue('')
  })

  it('does not send an empty message', async () => {
    const sendButton = screen.getByTestId('messages-send')
    expect(sendButton).toBeDisabled()
  })

  it('sends a message by pressing Enter', async () => {
    const input = screen.getByTestId('messages-input')
    await userEvent.type(input, 'Quick reply{enter}')
    expect(within(screen.getByTestId('messages-list')).getByText('Quick reply')).toBeInTheDocument()
  })

  it('escapes HTML payloads in chat messages', async () => {
    const payload = '<script>alert("xss")</script>'
    await userEvent.type(screen.getByTestId('messages-input'), payload)
    await userEvent.click(screen.getByTestId('messages-send'))
    const messages = screen.getAllByTestId(/messages-message-/)
    const lastMessage = messages[messages.length - 1]
    expect(within(lastMessage).getByText(payload)).toBeInTheDocument()
    expect(lastMessage.querySelector('script')).not.toBeInTheDocument()
  })
})
