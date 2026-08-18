import { useState, useCallback } from 'react'

interface Email {
  id: string
  sender: string
  subject: string
  preview: string
  body: string
  timestamp: string
  read: boolean
}

interface OutboxItem {
  id: string
  to: string
  subject: string
  body: string
}

interface Conversation {
  id: string
  name: string
  messages: { id: string; from: string; text: string }[]
}

const MOCK_INBOX: Email[] = [
  {
    id: 'mail-1',
    sender: 'Tim Apple',
    subject: 'Welcome to macOS Tahoe',
    preview: 'Experience the all-new Liquid Glass design...',
    body: 'Welcome to macOS Tahoe 26!\n\nExperience the all-new Liquid Glass design system that brings a new level of depth and translucency to your desktop. Every element has been reimagined with stunning clarity.\n\nEnjoy exploring!',
    timestamp: '10:30 AM',
    read: false,
  },
  {
    id: 'mail-2',
    sender: 'GitHub',
    subject: 'Your weekly digest',
    preview: '12 new repositories trending this week...',
    body: 'Here are the top repositories trending this week:\n\n1. awesome-react - A collection of amazing React things\n2. vite-plugin-federation - Module federation for Vite\n3. tailwindcss-v4 - The next generation of Tailwind\n\nHappy coding!',
    timestamp: '9:15 AM',
    read: false,
  },
  {
    id: 'mail-3',
    sender: 'Sarah Chen',
    subject: 'Lunch tomorrow?',
    preview: 'Hey, are you free for lunch tomorrow at 12?',
    body: 'Hey!\n\nAre you free for lunch tomorrow at 12? I was thinking we could try that new ramen place that opened on 5th street.\n\nLet me know!\n\nSarah',
    timestamp: 'Yesterday',
    read: true,
  },
]

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Sarah Chen',
    messages: [
      { id: 'm1', from: 'Sarah Chen', text: 'Hey! Are you coming to the meeting?' },
      { id: 'm2', from: 'Me', text: 'Yes, I will be there in 5 minutes.' },
      { id: 'm3', from: 'Sarah Chen', text: 'Great, see you soon!' },
    ],
  },
  {
    id: 'conv-2',
    name: 'Mom',
    messages: [
      { id: 'm4', from: 'Mom', text: 'Call me when you get a chance ❤️' },
    ],
  },
]

/**
 * Mail + Messages app — single app with two tabs.
 * Mail tab: inbox list + reading pane + compose.
 * Messages tab: conversation list + thread + compose.
 */
export default function Mail() {
  const [activeTab, setActiveTab] = useState<'mail' | 'messages'>('mail')
  const [inbox, setInbox] = useState<Email[]>(MOCK_INBOX)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [outbox, setOutbox] = useState<OutboxItem[]>([])
  const [composing, setComposing] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')

  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')

  const selectedEmail = inbox.find(e => e.id === selectedEmailId) ?? null
  const selectedConv = conversations.find(c => c.id === selectedConvId) ?? null

  const handleSelectEmail = useCallback((id: string) => {
    setSelectedEmailId(id)
    setInbox(prev => prev.map(e => e.id === id ? { ...e, read: true } : e))
  }, [])

  const handleSendEmail = useCallback(() => {
    if (!composeTo.trim()) return
    const item: OutboxItem = {
      id: `out-${Date.now()}`,
      to: composeTo,
      subject: composeSubject || '(no subject)',
      body: composeBody,
    }
    setOutbox(prev => [...prev, item])
    setComposing(false)
    setComposeTo('')
    setComposeSubject('')
    setComposeBody('')
  }, [composeTo, composeSubject, composeBody])

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConvId) return
    const msg = { id: `msg-${Date.now()}`, from: 'Me', text: messageInput.trim() }
    setConversations(prev => prev.map(c =>
      c.id === selectedConvId ? { ...c, messages: [...c.messages, msg] } : c
    ))
    setMessageInput('')
  }, [messageInput, selectedConvId])

  return (
    <div
      data-testid="mail"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1e1e1e',
        color: '#fff',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#2a2a2a' }}>
        <button
          data-testid="tab-mail"
          onClick={() => setActiveTab('mail')}
          style={{
            padding: '8px 20px',
            background: activeTab === 'mail' ? '#1e1e1e' : 'transparent',
            border: 'none',
            color: activeTab === 'mail' ? '#0a84ff' : '#888',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Mail
        </button>
        <button
          data-testid="tab-messages"
          onClick={() => setActiveTab('messages')}
          style={{
            padding: '8px 20px',
            background: activeTab === 'messages' ? '#1e1e1e' : 'transparent',
            border: 'none',
            color: activeTab === 'messages' ? '#0a84ff' : '#888',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Messages
        </button>
      </div>

      {/* Mail tab */}
      {activeTab === 'mail' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Inbox list */}
          <div data-testid="mail-inbox" style={{ width: '280px', minWidth: '280px', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>
            <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.7 }}>Inbox</span>
              <button
                data-testid="mail-compose"
                onClick={() => setComposing(true)}
                style={{
                  background: '#0a84ff',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Compose
              </button>
            </div>
            {inbox.map(email => (
              <div
                key={email.id}
                data-testid={`mail-item-${email.id}`}
                onClick={() => handleSelectEmail(email.id)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: selectedEmailId === email.id ? 'rgba(10,132,255,0.2)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: email.read ? 400 : 600 }}>
                    {!email.read && <span style={{ color: '#0a84ff' }}>● </span>}
                    {email.sender}
                  </span>
                  <span style={{ fontSize: '11px', opacity: 0.5 }}>{email.timestamp}</span>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>{email.subject}</div>
                <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {email.preview}
                </div>
              </div>
            ))}
          </div>

          {/* Reading pane / Compose */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {composing ? (
              <div data-testid="mail-compose-form" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>New Message</div>
                <input
                  data-testid="compose-to"
                  type="text"
                  placeholder="To:"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
                <input
                  data-testid="compose-subject"
                  type="text"
                  placeholder="Subject:"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  style={{ background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                />
                <textarea
                  data-testid="compose-body"
                  placeholder="Message body..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  style={{ flex: 1, background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '10px', color: '#fff', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.5 }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button data-testid="compose-cancel" onClick={() => setComposing(false)} style={{ background: 'transparent', border: 'none', color: '#0a84ff', cursor: 'pointer', fontSize: '13px', padding: '6px 14px' }}>Cancel</button>
                  <button data-testid="compose-send" onClick={handleSendEmail} style={{ background: '#0a84ff', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', padding: '6px 18px' }}>Send</button>
                </div>
              </div>
            ) : selectedEmail ? (
              <div data-testid="mail-reading" style={{ padding: '16px', overflowY: 'auto' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{selectedEmail.subject}</div>
                <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '16px' }}>
                  From: {selectedEmail.sender} · {selectedEmail.timestamp}
                </div>
                <div data-testid="mail-body" style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedEmail.body}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                Select a message to read
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages tab */}
      {activeTab === 'messages' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Conversation list */}
          <div data-testid="messages-list" style={{ width: '220px', minWidth: '220px', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.7, padding: '8px 12px' }}>Conversations</div>
            {conversations.map(conv => (
              <div
                key={conv.id}
                data-testid={`conv-item-${conv.id}`}
                onClick={() => setSelectedConvId(conv.id)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: selectedConvId === conv.id ? 'rgba(10,132,255,0.2)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{conv.name}</div>
                <div style={{ fontSize: '11px', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {conv.messages[conv.messages.length - 1]?.text ?? ''}
                </div>
              </div>
            ))}
          </div>

          {/* Thread view */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedConv ? (
              <>
                <div data-testid="message-thread" style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedConv.messages.map(msg => (
                    <div
                      key={msg.id}
                      data-testid={`message-${msg.id}`}
                      style={{
                        alignSelf: msg.from === 'Me' ? 'flex-end' : 'flex-start',
                        background: msg.from === 'Me' ? '#0a84ff' : '#333',
                        borderRadius: '12px',
                        padding: '8px 14px',
                        maxWidth: '70%',
                        fontSize: '13px',
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div style={{ padding: '8px 12px', display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <input
                    data-testid="message-input"
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                    style={{ flex: 1, background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '18px', padding: '8px 14px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                  <button
                    data-testid="message-send"
                    onClick={handleSendMessage}
                    style={{ background: '#0a84ff', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}
                  >
                    ↑
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                Select a conversation
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outbox indicator (hidden but queryable for tests) */}
      {outbox.length > 0 && (
        <div data-testid="mail-outbox" style={{ display: 'none' }}>
          {outbox.map(item => (
            <div key={item.id} data-testid={`outbox-item-${item.id}`}>
              {item.to}|{item.subject}|{item.body}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
