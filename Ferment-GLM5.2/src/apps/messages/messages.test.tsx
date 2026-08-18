import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Messages } from './messages'

function resetMessages() {
  localStorage.removeItem('tahoe.messages')
}

describe('Messages', () => {
  beforeEach(() => {
    resetMessages()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the root with sidebar and placeholder', () => {
    render(<Messages windowId="w1" />)
    expect(screen.getByTestId('messages-root')).toBeInTheDocument()
    expect(screen.getByTestId('messages-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('msg-placeholder')).toHaveTextContent('Select a conversation')
  })

  it('shows default conversations in sidebar', () => {
    render(<Messages windowId="w1" />)
    expect(screen.getByTestId('conv-c1')).toBeInTheDocument()
    expect(screen.getByTestId('conv-c2')).toBeInTheDocument()
    expect(screen.getByTestId('conv-c3')).toBeInTheDocument()
    expect(screen.getByTestId('conv-c4')).toBeInTheDocument()
  })

  it('shows conversation name and last message preview', () => {
    render(<Messages windowId="w1" />)
    const conv = screen.getByTestId('conv-c1')
    expect(conv).toHaveTextContent('Sarah Chen')
    expect(conv).toHaveTextContent('I have some new ideas to share')
  })

  it('shows unread count badge', () => {
    render(<Messages windowId="w1" />)
    expect(screen.getByTestId('unread-c1')).toHaveTextContent('2')
    expect(screen.getByTestId('unread-c3')).toHaveTextContent('1')
    expect(screen.queryByTestId('unread-c2')).toBeNull()
  })

  it('clicking a conversation opens chat view', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    expect(screen.getByTestId('chat-header')).toBeInTheDocument()
    expect(screen.getByTestId('chat-name')).toHaveTextContent('Sarah Chen')
  })

  it('opening a conversation clears unread count', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    expect(screen.queryByTestId('unread-c1')).toBeNull()
  })

  it('chat view shows all messages with correct alignment', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c2'))
    })
    expect(screen.getByTestId('chat-messages')).toBeInTheDocument()
    expect(screen.getByTestId('msg-msg-5')).toBeInTheDocument()
    expect(screen.getByTestId('msg-msg-6')).toBeInTheDocument()
  })

  it('messages from me are aligned right (blue), others left (gray)', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c2'))
    })
    const msg5 = screen.getByTestId('msg-msg-5')
    expect(msg5.style.alignSelf).toBe('flex-start')
    const msg6 = screen.getByTestId('msg-msg-6')
    expect(msg6.style.alignSelf).toBe('flex-end')
  })

  it('has message input and send button', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    expect(screen.getByTestId('msg-input')).toBeInTheDocument()
    expect(screen.getByTestId('msg-send')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    expect((screen.getByTestId('msg-send') as HTMLButtonElement).disabled).toBe(true)
  })

  it('sending a message adds it to the chat', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    const beforeCount = screen.getAllByTestId(/msg-msg-/).length
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Test message' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('msg-send'))
    })
    const afterCount = screen.getAllByTestId(/msg-msg-/).length
    expect(afterCount).toBe(beforeCount + 1)
  })

  it('sending a message clears the input', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Test' } })
      fireEvent.click(screen.getByTestId('msg-send'))
    })
    expect((screen.getByTestId('msg-input') as HTMLInputElement).value).toBe('')
  })

  it('Enter key sends message', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    const beforeCount = screen.getAllByTestId(/msg-msg-/).length
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Enter sent' } })
      fireEvent.keyDown(screen.getByTestId('msg-input'), { key: 'Enter' })
    })
    expect(screen.getAllByTestId(/msg-msg-/).length).toBe(beforeCount + 1)
  })

  it('Shift+Enter does not send message', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    const beforeCount = screen.getAllByTestId(/msg-msg-/).length
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Not sent' } })
      fireEvent.keyDown(screen.getByTestId('msg-input'), { key: 'Enter', shiftKey: true })
    })
    expect(screen.getAllByTestId(/msg-msg-/).length).toBe(beforeCount)
  })

  it('sending a message triggers a scripted auto-reply after delay', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    const beforeCount = screen.getAllByTestId(/msg-msg-/).length
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Hello there' } })
      fireEvent.click(screen.getByTestId('msg-send'))
    })
    // After 1.5s, auto-reply arrives
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    const afterCount = screen.getAllByTestId(/msg-msg-/).length
    expect(afterCount).toBe(beforeCount + 2) // my message + auto-reply
  })

  it('auto-reply is not from me', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c2'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Test' } })
      fireEvent.click(screen.getByTestId('msg-send'))
    })
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    const allMsgs = screen.getAllByTestId(/msg-msg-/)
    const lastMsg = allMsgs[allMsgs.length - 1]
    expect(lastMsg.style.alignSelf).toBe('flex-start')
  })

  it('delete conversation removes it from sidebar', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('delete-conv'))
    })
    expect(screen.queryByTestId('conv-c3')).toBeNull()
  })

  it('delete conversation returns to placeholder', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('delete-conv'))
    })
    expect(screen.getByTestId('msg-placeholder')).toBeInTheDocument()
  })

  it('search filters conversations by name', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('msg-search'), { target: { value: 'Sarah' } })
    })
    expect(screen.getByTestId('conv-c1')).toBeInTheDocument()
    expect(screen.queryByTestId('conv-c2')).toBeNull()
    expect(screen.queryByTestId('conv-c3')).toBeNull()
  })

  it('search filters by message content', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('msg-search'), { target: { value: 'lunch' } })
    })
    expect(screen.getByTestId('conv-c2')).toBeInTheDocument()
    expect(screen.queryByTestId('conv-c1')).toBeNull()
  })

  it('search with no results shows empty', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('msg-search'), { target: { value: 'nonexistent' } })
    })
    expect(screen.getByTestId('msg-empty')).toBeInTheDocument()
  })

  it('persists conversations to localStorage', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c2'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Persisted msg' } })
      fireEvent.click(screen.getByTestId('msg-send'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.messages')!)
    const c2 = stored.find((c: { id: string }) => c.id === 'c2')
    expect(c2.messages.some((m: { text: string }) => m.text === 'Persisted msg')).toBe(true)
  })

  it('sent message appears with blue background', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c3'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: 'Blue bubble' } })
      fireEvent.click(screen.getByTestId('msg-send'))
    })
    const allMsgs = screen.getAllByTestId(/msg-msg-/)
    const lastMsg = allMsgs[allMsgs.length - 1]
    const bubble = lastMsg.querySelector('div')!
    expect(bubble.style.background).toContain('var(--accent-blue)')
  })

  it('empty input does not send', () => {
    render(<Messages windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('conv-c1'))
    })
    const beforeCount = screen.getAllByTestId(/msg-msg-/).length
    act(() => {
      fireEvent.change(screen.getByTestId('msg-input'), { target: { value: '   ' } })
      fireEvent.click(screen.getByTestId('msg-send'))
    })
    expect(screen.getAllByTestId(/msg-msg-/).length).toBe(beforeCount)
  })
})
