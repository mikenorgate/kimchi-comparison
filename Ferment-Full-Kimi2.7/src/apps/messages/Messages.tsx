import { useState, useCallback, useRef, useEffect } from 'react'
import { Send, Smile } from 'lucide-react'
import type { Conversation, Message } from './types'
import { sampleConversations } from './data'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

function formatTime() {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>(sampleConversations)
  const [selectedId, setSelectedId] = useState<string>(sampleConversations[0].id)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0]

  const selectConversation = useCallback((id: string) => {
    setSelectedId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    )
  }, [])

  const sendMessage = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    const newMessage: Message = {
      id: generateId(),
      sender: 'me',
      text,
      timestamp: formatTime(),
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    )
    setDraft('')
  }, [draft, selectedId])

  useEffect(() => {
    const el = listRef.current
    if (el) {
      if (typeof el.scrollTo === 'function') {
        el.scrollTo({ top: el.scrollHeight })
      } else {
        el.scrollTop = el.scrollHeight
      }
    }
  }, [selected.messages])

  return (
    <div
      className="flex h-full w-full bg-tahoe-glass/30 text-tahoe-text overflow-hidden"
      data-testid="messages-app"
    >
      {/* Conversation list */}
      <div
        className="w-56 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 overflow-y-auto"
        data-testid="messages-sidebar"
      >
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => selectConversation(conversation.id)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors border-b border-tahoe-glass-border ${
              selectedId === conversation.id
                ? 'bg-tahoe-accent/20'
                : 'hover:bg-white/5'
            }`}
            data-testid={`messages-conversation-${conversation.id}`}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-tahoe-accent text-white font-semibold">
              {conversation.avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium">
                  {conversation.name}
                </span>
                {conversation.unread && (
                  <span
                    className="ml-2 h-2 w-2 flex-shrink-0 rounded-full bg-tahoe-accent"
                    data-testid={`messages-unread-${conversation.id}`}
                  />
                )}
              </div>
              <div className="truncate text-xs text-tahoe-text-secondary">
                {conversation.messages.at(-1)?.text ?? ''}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Chat view */}
      <div className="flex flex-1 flex-col bg-tahoe-window/80">
        <div
          className="flex h-14 items-center gap-3 border-b border-tahoe-glass-border px-4"
          data-testid="messages-header"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tahoe-accent text-white font-semibold">
            {selected.avatarInitial}
          </div>
          <span className="font-medium">{selected.name}</span>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          data-testid="messages-list"
        >
          {selected.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              }`}
              data-testid={`messages-message-${message.id}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  message.sender === 'me'
                    ? 'bg-tahoe-accent text-white rounded-br-md'
                    : 'bg-tahoe-glass/50 rounded-bl-md'
                }`}
              >
                <div>{message.text}</div>
                <div
                  className={`mt-1 text-right text-xs ${
                    message.sender === 'me'
                      ? 'text-white/70'
                      : 'text-tahoe-text-secondary'
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-tahoe-glass-border p-3">
          <button
            className="p-2 rounded-full hover:bg-white/10 text-tahoe-text-secondary"
            aria-label="Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="iMessage"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage()
            }}
            className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-tahoe-accent placeholder:text-tahoe-text-secondary"
            data-testid="messages-input"
          />
          <button
            onClick={sendMessage}
            disabled={!draft.trim()}
            className="p-2 rounded-full bg-tahoe-accent text-white disabled:opacity-40 hover:brightness-110"
            data-testid="messages-send"
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
