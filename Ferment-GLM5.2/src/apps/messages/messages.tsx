import { useState, useEffect, useRef, useCallback } from 'react'

export interface Message {
  id: string
  text: string
  fromMe: boolean
  timestamp: string
}

export interface Conversation {
  id: string
  name: string
  avatar: string // single char
  color: string
  messages: Message[]
  unread: number
}

const MESSAGES_KEY = 'tahoe.messages'

const SCRIPTED_REPLIES = [
  'That sounds great!',
  'I\'ll get back to you on that.',
  'Interesting, tell me more.',
  'Sure, no problem!',
  'Thanks for letting me know.',
  'Can we talk about this later?',
  'I completely agree.',
  'Let me check and get back to you.',
]

const genMsgId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', name: 'Sarah Chen', avatar: 'S', color: '#ff6b6b',
    unread: 2,
    messages: [
      { id: 'msg-1', text: 'Hey! Are we still on for the meeting?', fromMe: false, timestamp: '2026-08-17T09:30:00' },
      { id: 'msg-2', text: 'Yes! 2pm at the usual place', fromMe: true, timestamp: '2026-08-17T09:32:00' },
      { id: 'msg-3', text: 'Perfect, see you there', fromMe: false, timestamp: '2026-08-17T09:33:00' },
      { id: 'msg-4', text: 'I have some new ideas to share', fromMe: false, timestamp: '2026-08-17T09:33:30' },
    ],
  },
  {
    id: 'c2', name: 'Mike Rodriguez', avatar: 'M', color: '#4ecdc4',
    unread: 0,
    messages: [
      { id: 'msg-5', text: 'Lunch tomorrow?', fromMe: false, timestamp: '2026-08-16T16:45:00' },
      { id: 'msg-6', text: 'Sounds good! Noon works for me', fromMe: true, timestamp: '2026-08-16T16:47:00' },
    ],
  },
  {
    id: 'c3', name: 'Mom', avatar: 'M', color: '#ffd93d',
    unread: 1,
    messages: [
      { id: 'msg-7', text: 'Call me when you get a chance ❤️', fromMe: false, timestamp: '2026-08-16T11:00:00' },
    ],
  },
  {
    id: 'c4', name: 'Team Chat', avatar: 'T', color: '#a78bfa',
    unread: 0,
    messages: [
      { id: 'msg-8', text: 'Pushed the latest changes to the repo', fromMe: true, timestamp: '2026-08-15T17:00:00' },
      { id: 'msg-9', text: 'Great, I\'ll review tomorrow morning', fromMe: false, timestamp: '2026-08-15T17:15:00' },
    ],
  },
]

function loadConversations(): Conversation[] {
  try {
    const s = localStorage.getItem(MESSAGES_KEY)
    return s ? JSON.parse(s) : DEFAULT_CONVERSATIONS
  } catch { return DEFAULT_CONVERSATIONS }
}

function persistConversations(conversations: Conversation[]) {
  try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations)) } catch { /* ignore */ }
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function Messages({ windowId: _windowId }: { windowId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    persistConversations(conversations)
  }, [conversations])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selectedId, conversations])

  const selectedConversation = conversations.find((c) => c.id === selectedId)

  const openConversation = useCallback((conv: Conversation) => {
    setSelectedId(conv.id)
    setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unread: 0 } : c))
  }, [])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || !selectedId) return
    const newMsg: Message = {
      id: genMsgId(),
      text,
      fromMe: true,
      timestamp: new Date().toISOString(),
    }
    setConversations((prev) => prev.map((c) =>
      c.id === selectedId
        ? { ...c, messages: [...c.messages, newMsg] }
        : c
    ))
    setInput('')

    // Trigger scripted auto-reply after a delay
    setTimeout(() => {
      const reply: Message = {
        id: genMsgId(),
        text: SCRIPTED_REPLIES[Math.floor(Math.random() * SCRIPTED_REPLIES.length)],
        fromMe: false,
        timestamp: new Date().toISOString(),
      }
      setConversations((prev) => prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, reply] }
          : c
      ))
    }, 1500)
  }, [input, selectedId])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const deleteConversation = useCallback((convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId))
    if (selectedId === convId) setSelectedId(null)
  }, [selectedId])

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return c.name.toLowerCase().includes(q) ||
           c.messages.some((m) => m.text.toLowerCase().includes(q))
  })

  return (
    <div data-testid="messages-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar */}
      <div data-testid="messages-sidebar" style={{ width: 240, borderRight: '0.5px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)' }}>
          <input
            data-testid="msg-search"
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '4px 8px', border: '0.5px solid var(--glass-border)', borderRadius: 6, background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div data-testid="msg-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No conversations
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                data-testid={`conv-${conv.id}`}
                onClick={() => openConversation(conv)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  background: selectedId === conv.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                  borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: conv.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {conv.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.name}</span>
                    {conv.messages.length > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0 }}>{formatTime(conv.messages[conv.messages.length - 1].timestamp)}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].text : 'No messages'}
                  </div>
                </div>
                {conv.unread > 0 && (
                  <span data-testid={`unread-${conv.id}`} style={{ fontSize: 11, fontWeight: 700, color: 'white', background: 'var(--accent-blue)', borderRadius: 10, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', flexShrink: 0 }}>
                    {conv.unread}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat view */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Header */}
            <div data-testid="chat-header" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: selectedConversation.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>
                {selectedConversation.avatar}
              </div>
              <span data-testid="chat-name" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{selectedConversation.name}</span>
              <button data-testid="delete-conv" onClick={() => deleteConversation(selectedConversation.id)} style={{ border: 'none', background: 'transparent', color: '#ff5f57', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} data-testid="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  data-testid={`msg-${msg.id}`}
                  style={{
                    alignSelf: msg.fromMe ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  <div style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: 16,
                    fontSize: 13,
                    color: msg.fromMe ? 'white' : 'var(--text-primary)',
                    background: msg.fromMe ? 'var(--accent-blue)' : 'var(--glass-bg)',
                    border: msg.fromMe ? 'none' : '0.5px solid var(--glass-border)',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, textAlign: msg.fromMe ? 'right' : 'left' }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '8px 16px', borderTop: '0.5px solid var(--glass-border)', display: 'flex', gap: 8, flexShrink: 0 }}>
              <input
                data-testid="msg-input"
                type="text"
                placeholder="iMessage"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1, padding: '6px 12px', border: '0.5px solid var(--glass-border)', borderRadius: 18, background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
              />
              <button
                data-testid="msg-send"
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  border: 'none',
                  borderRadius: 18,
                  padding: '6px 16px',
                  background: input.trim() ? 'var(--accent-blue)' : 'rgba(128,128,128,0.2)',
                  color: input.trim() ? 'white' : 'var(--text-secondary)',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >↑</button>
            </div>
          </>
        ) : (
          <div data-testid="msg-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: 14 }}>
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}
