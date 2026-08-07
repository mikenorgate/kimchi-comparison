import { useMemo, useState } from 'react'
import { Inbox, PenLine, Send, Trash2 } from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/**
 * Mail — inbox + message view + compose; send moves to Sent; persisted.
 *
 * Two mailboxes: Inbox (received) and Sent (sent by the user). Messages are
 * seeded on first run and persisted to localStorage ('tahoe.mail'). Composing
 * a message and pressing Send prepends it to Sent and selects it. Deleting a
 * message removes it from its mailbox.
 */

export interface MailMessage {
  id: string
  mailbox: 'inbox' | 'sent'
  from: string
  to: string
  subject: string
  body: string
  date: number // epoch ms
  read: boolean
}

const STORAGE_KEY = 'tahoe.mail'

function uid(): string {
  return 'm' + Math.random().toString(36).slice(2, 10)
}

const SEED: MailMessage[] = [
  {
    id: 'seed-1',
    mailbox: 'inbox',
    from: 'Apple <no-reply@apple.com>',
    to: 'me',
    subject: 'Welcome to Mail',
    body: 'Welcome to Mail on macOS Tahoe.\n\nYour inbox is set up and ready to go.',
    date: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
  },
  {
    id: 'seed-2',
    mailbox: 'inbox',
    from: 'Tim <tim@apple.com>',
    to: 'me',
    subject: 'Tahoe is here',
    body: 'macOS Tahoe brings the Liquid Glass design across the system.\nEnjoy the new look!',
    date: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
  },
  {
    id: 'seed-3',
    mailbox: 'sent',
    from: 'me',
    to: 'friend@example.com',
    subject: 'Hello from Tahoe',
    body: 'Just upgraded to macOS Tahoe — the Dock looks amazing.',
    date: Date.now() - 1000 * 60 * 30,
    read: true,
  },
]

type Mailbox = 'inbox' | 'sent'

export function Mail() {
  const [messages, setMessages] = usePersistentState<MailMessage[]>(STORAGE_KEY, SEED)
  const [mailbox, setMailbox] = useState<Mailbox>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState({ to: '', subject: '', body: '' })

  const mailboxMessages = useMemo(
    () =>
      messages
        .filter((m) => m.mailbox === mailbox)
        .sort((a, b) => b.date - a.date),
    [messages, mailbox],
  )

  const selected = messages.find((m) => m.id === selectedId) ?? null

  // Mark a message read when selected.
  const selectMessage = (id: string) => {
    setSelectedId(id)
    setComposing(false)
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m)),
    )
  }

  const openMailbox = (mb: Mailbox) => {
    setMailbox(mb)
    setSelectedId(null)
    setComposing(false)
  }

  const startCompose = () => {
    setComposing(true)
    setSelectedId(null)
    setDraft({ to: '', subject: '', body: '' })
  }

  const send = () => {
    if (!draft.to.trim() || !draft.subject.trim()) return
    const msg: MailMessage = {
      id: uid(),
      mailbox: 'sent',
      from: 'me',
      to: draft.to.trim(),
      subject: draft.subject.trim(),
      body: draft.body,
      date: Date.now(),
      read: true,
    }
    setMessages((prev) => [msg, ...prev])
    setComposing(false)
    setMailbox('sent')
    setSelectedId(msg.id)
  }

  const remove = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const unreadCount = messages.filter((m) => m.mailbox === 'inbox' && !m.read).length

  return (
    <div data-testid="mail-content" className="flex h-full text-[13px]">
      {/* Mailbox sidebar */}
      <aside className="w-44 border-r border-black/10 bg-black/[0.04] p-2">
        <button
          data-testid="mail-compose"
          onClick={startCompose}
          className="mb-3 flex w-full items-center gap-2 rounded-md bg-[var(--accent)] px-2 py-1.5 text-white hover:brightness-105"
        >
          <PenLine size={14} />
          <span>New</span>
        </button>
        <button
          data-testid="mail-mailbox-inbox"
          onClick={() => openMailbox('inbox')}
          className={`mb-0.5 flex w-full items-center justify-between rounded-md px-2 py-1.5 ${
            mailbox === 'inbox' ? 'bg-black/10 font-medium' : 'hover:bg-black/5'
          }`}
        >
          <span className="flex items-center gap-2">
            <Inbox size={14} />
            <span>Inbox</span>
          </span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[var(--accent)] px-1.5 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          data-testid="mail-mailbox-sent"
          onClick={() => openMailbox('sent')}
          className={`mb-0.5 flex w-full items-center gap-2 rounded-md px-2 py-1.5 ${
            mailbox === 'sent' ? 'bg-black/10 font-medium' : 'hover:bg-black/5'
          }`}
        >
          <Send size={14} />
          <span>Sent</span>
        </button>
      </aside>

      {/* Message list */}
      <div className="w-64 border-r border-black/10 overflow-auto">
        <div data-testid="mail-list">
          {mailboxMessages.length === 0 ? (
            <div className="p-4 text-black/40">No messages.</div>
          ) : (
            mailboxMessages.map((m) => {
              const active = m.id === selectedId
              return (
                <div
                  key={m.id}
                  data-testid="mail-item"
                  data-message-id={m.id}
                  onClick={() => selectMessage(m.id)}
                  className={`cursor-pointer border-b border-black/[0.04] px-3 py-2 ${
                    active ? 'bg-[var(--accent)]/15' : 'hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      data-testid="mail-item-from"
                      className={`truncate ${
                        m.read ? 'font-normal text-black/70' : 'font-semibold text-black'
                      }`}
                    >
                      {mailbox === 'inbox' ? m.from : `To: ${m.to}`}
                    </span>
                    {!m.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <div data-testid="mail-item-subject" className="truncate text-black/60">
                    {m.subject}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Reading pane / compose */}
      <div className="flex-1 overflow-auto">
        {composing ? (
          <div data-testid="mail-compose-form" className="flex h-full flex-col p-4">
            <input
              data-testid="mail-compose-to"
              value={draft.to}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
              placeholder="To:"
              className="mb-2 rounded-md border border-black/10 px-2 py-1 outline-none focus:border-[var(--accent)]"
            />
            <input
              data-testid="mail-compose-subject"
              value={draft.subject}
              onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
              placeholder="Subject:"
              className="mb-2 rounded-md border border-black/10 px-2 py-1 outline-none focus:border-[var(--accent)]"
            />
            <textarea
              data-testid="mail-compose-body"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder="Message body…"
              className="mb-2 flex-1 resize-none rounded-md border border-black/10 p-2 outline-none focus:border-[var(--accent)]"
            />
            <div className="flex justify-end gap-2">
              <button
                data-testid="mail-compose-cancel"
                onClick={() => setComposing(false)}
                className="rounded-md px-3 py-1.5 hover:bg-black/10"
              >
                Cancel
              </button>
              <button
                data-testid="mail-compose-send"
                onClick={send}
                className="flex items-center gap-1 rounded-md bg-[var(--accent)] px-3 py-1.5 text-white hover:brightness-105"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : selected ? (
          <div data-testid="mail-view" className="p-4">
            <div className="mb-3 flex items-start justify-between border-b border-black/10 pb-3">
              <div>
                <h1 data-testid="mail-view-subject" className="text-lg font-semibold">
                  {selected.subject}
                </h1>
                <div data-testid="mail-view-from" className="mt-1 text-black/60">
                  From: {selected.from}
                </div>
                <div data-testid="mail-view-to" className="text-black/60">
                  To: {selected.to}
                </div>
              </div>
              <button
                data-testid="mail-delete"
                onClick={() => remove(selected.id)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-black/60 hover:bg-black/10"
                aria-label="Delete message"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <pre data-testid="mail-view-body" className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed">
              {selected.body}
            </pre>
          </div>
        ) : (
          <div
            data-testid="mail-empty"
            className="grid h-full place-items-center text-black/40"
          >
            Select a message to read.
          </div>
        )}
      </div>
    </div>
  )
}

export default Mail
