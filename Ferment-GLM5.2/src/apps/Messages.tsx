import { useEffect, useMemo, useRef, useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'

/**
 * Messages — conversation list + thread view; send + simulated auto-reply.
 *
 * Each conversation has a contact name and an ordered list of messages. The
 * user's messages are right-aligned; the contact's are left-aligned. Sending a
 * message appends it to the thread, then a simulated auto-reply arrives after
 * a short delay. All state persists to localStorage ('tahoe.messages').
 */

export interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  date: number
}

export interface Conversation {
  id: string
  contact: string
  messages: ChatMessage[]
}

const STORAGE_KEY = 'tahoe.messages'

function uid(): string {
  return 'c' + Math.random().toString(36).slice(2, 10)
}

const SEED: Conversation[] = [
  {
    id: 'seed-1',
    contact: 'Jamie',
    messages: [
      { id: 's1', from: 'them', text: 'Hey! Are you free for lunch?', date: Date.now() - 60000 },
      { id: 's2', from: 'me', text: 'Sure, noon works!', date: Date.now() - 50000 },
    ],
  },
  {
    id: 'seed-2',
    contact: 'Alex',
    messages: [
      { id: 's3', from: 'them', text: 'Did you see the new Tahoe update?', date: Date.now() - 3600000 },
    ],
  },
]

const REPLIES = [
  'Sounds good!',
  'Got it 👍',
  'Haha, nice.',
  'Let me check and get back to you.',
  'Totally agree.',
  'On my way.',
]

export function Messages() {
  const [conversations, setConversations] = usePersistentState<Conversation[]>(STORAGE_KEY, SEED)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Select the first conversation on mount.
  useEffect(() => {
    if (selectedId === null && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedId])

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  // Auto-scroll to the bottom when the thread grows.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [selected?.messages.length])

  const send = () => {
    const text = input.trim()
    if (!text || !selectedId) return
    const msg: ChatMessage = { id: uid(), from: 'me', text, date: Date.now() }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, messages: [...c.messages, msg] } : c,
      ),
    )
    setInput('')

    // Simulated auto-reply after a delay.
    const replyText = REPLIES[Math.floor(Math.random() * REPLIES.length)]
    const targetId = selectedId
    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: uid(),
        from: 'them',
        text: replyText,
        date: Date.now(),
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId ? { ...c, messages: [...c.messages, reply] } : c,
        ),
      )
    }, 800)
  }

  const lastMessage = (c: Conversation): string => {
    const last = c.messages[c.messages.length - 1]
    return last ? last.text : 'No messages yet'
  }

  return (
    <div data-testid="messages-content" className="flex h-full text-[13px]">
      {/* Conversation list */}
      <aside className="w-56 border-r border-black/10 bg-black/[0.04] overflow-auto">
        <div data-testid="messages-list">
          {conversations.map((c) => {
            const active = c.id === selectedId
            return (
              <div
                key={c.id}
                data-testid="messages-conversation"
                data-contact={c.contact}
                onClick={() => setSelectedId(c.id)}
                className={`cursor-pointer border-b border-black/[0.04] px-3 py-2 ${
                  active ? 'bg-[var(--accent)]/15' : 'hover:bg-black/5'
                }`}
              >
                <div
                  data-testid="messages-contact"
                  className={`truncate font-medium ${
                    active ? 'text-[var(--accent)]' : 'text-black/80'
                  }`}
                >
                  {c.contact}
                </div>
                <div className="truncate text-[11px] text-black/40">
                  {lastMessage(c)}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Thread view */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="border-b border-black/10 px-4 py-2 font-semibold">
              <span data-testid="messages-thread-contact">{selected.contact}</span>
            </div>
            <div
              ref={scrollRef}
              data-testid="messages-thread"
              className="flex-1 space-y-2 overflow-auto p-4"
            >
              {selected.messages.map((m) => (
                <div
                  key={m.id}
                  data-testid="messages-bubble"
                  data-from={m.from}
                  className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <span
                    data-testid="messages-bubble-text"
                    className={`max-w-[70%] rounded-2xl px-3 py-1.5 text-[13px] ${
                      m.from === 'me'
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-black/10 text-black'
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-black/10 p-2">
              <input
                data-testid="messages-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send() }}
                placeholder="iMessage"
                className="flex-1 rounded-full border border-black/10 px-3 py-1.5 outline-none focus:border-[var(--accent)]"
              />
              <button
                data-testid="messages-send"
                onClick={send}
                className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-white hover:brightness-105"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div
            data-testid="messages-empty"
            className="grid flex-1 place-items-center text-black/40"
          >
            Select a conversation.
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
