import { useState, useEffect, useCallback } from 'react'

export interface Email {
  id: string
  from: string
  fromEmail: string
  to: string
  subject: string
  body: string
  date: string // ISO
  read: boolean
  starred: boolean
  folder: 'inbox' | 'sent' | 'drafts' | 'trash'
}

const MAIL_KEY = 'tahoe.mail'

const DEFAULT_EMAILS: Email[] = [
  { id: 'm1', from: 'Apple', fromEmail: 'noreply@apple.com', to: 'me@macbook.local', subject: 'Welcome to macOS Tahoe', body: 'Thank you for updating to macOS Tahoe. Explore the new Liquid Glass design and enhanced features.', date: '2026-08-17T09:00:00', read: false, starred: false, folder: 'inbox' },
  { id: 'm2', from: 'GitHub', fromEmail: 'noreply@github.com', to: 'me@macbook.local', subject: 'Your weekly digest', body: 'Here are the top repositories trending this week on GitHub.', date: '2026-08-16T14:30:00', read: false, starred: true, folder: 'inbox' },
  { id: 'm3', from: 'Sarah Chen', fromEmail: 'sarah@example.com', to: 'me@macbook.local', subject: 'Project update', body: 'Hi! The project is on track for next week. Can we schedule a review meeting?', date: '2026-08-16T10:15:00', read: true, starred: false, folder: 'inbox' },
  { id: 'm4', from: 'Newsletter', fromEmail: 'hello@newsletter.com', to: 'me@macbook.local', subject: 'This week in tech', body: 'The biggest stories in technology this week.', date: '2026-08-15T08:00:00', read: true, starred: false, folder: 'inbox' },
  { id: 'm5', from: 'Mike Rodriguez', fromEmail: 'mike@example.com', to: 'me@macbook.local', subject: 'Lunch tomorrow?', body: 'Hey, want to grab lunch tomorrow at noon?', date: '2026-08-14T16:45:00', read: true, starred: false, folder: 'inbox' },
  { id: 'm6', from: 'me@macbook.local', fromEmail: 'me@macbook.local', to: 'sarah@example.com', subject: 'Re: Project update', body: 'Sounds great! Let\'s meet at 2pm on Wednesday.', date: '2026-08-16T11:00:00', read: true, starred: false, folder: 'sent' },
  { id: 'm7', from: 'me@macbook.local', fromEmail: 'me@macbook.local', to: 'team@example.com', subject: 'Draft: Q3 plans', body: 'Drafting Q3 plans for the team...', date: '2026-08-15T17:00:00', read: true, starred: false, folder: 'drafts' },
]

const genId = () => `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function loadEmails(): Email[] {
  try {
    const s = localStorage.getItem(MAIL_KEY)
    return s ? JSON.parse(s) : DEFAULT_EMAILS
  } catch { return DEFAULT_EMAILS }
}

function persistEmails(emails: Email[]) {
  try { localStorage.setItem(MAIL_KEY, JSON.stringify(emails)) } catch { /* ignore */ }
}

const FOLDERS = [
  { id: 'inbox', name: 'Inbox', icon: '📥' },
  { id: 'sent', name: 'Sent', icon: '📤' },
  { id: 'drafts', name: 'Drafts', icon: '📝' },
  { id: 'trash', name: 'Trash', icon: '🗑' },
] as const

export function Mail({ windowId: _windowId }: { windowId: string }) {
  const [emails, setEmails] = useState<Email[]>(loadEmails)
  const [selectedFolder, setSelectedFolder] = useState<string>('inbox')
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [composing, setComposing] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [replyTo, setReplyTo] = useState<Email | null>(null)

  useEffect(() => {
    persistEmails(emails)
  }, [emails])

  const folderEmails = emails
    .filter((e) => e.folder === selectedFolder)
    .filter((e) => {
      if (!search) return true
      const q = search.toLowerCase()
      return e.from.toLowerCase().includes(q) ||
             e.subject.toLowerCase().includes(q) ||
             e.body.toLowerCase().includes(q)
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const selectedEmail = emails.find((e) => e.id === selectedEmailId && e.folder === selectedFolder)

  const unreadCount = (folder: string) =>
    emails.filter((e) => e.folder === folder && !e.read).length

  const openEmail = useCallback((email: Email) => {
    setSelectedEmailId(email.id)
    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, read: true } : e))
  }, [])

  const deleteEmail = useCallback((emailId: string) => {
    setEmails((prev) => {
      const email = prev.find((e) => e.id === emailId)
      if (email && email.folder === 'trash') {
        // Permanently delete from trash
        return prev.filter((e) => e.id !== emailId)
      }
      // Move to trash
      return prev.map((e) => e.id === emailId ? { ...e, folder: 'trash' as const } : e)
    })
    setSelectedEmailId(null)
  }, [])

  const starEmail = useCallback((emailId: string) => {
    setEmails((prev) => prev.map((e) => e.id === emailId ? { ...e, starred: !e.starred } : e))
  }, [])

  const startCompose = useCallback(() => {
    setComposing(true)
    setReplyTo(null)
    setComposeTo('')
    setComposeSubject('')
    setComposeBody('')
  }, [])

  const startReply = useCallback((email: Email) => {
    setComposing(true)
    setReplyTo(email)
    setComposeTo(email.fromEmail)
    setComposeSubject(email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`)
    setComposeBody(`\n\n--- Original Message ---\nFrom: ${email.from} <${email.fromEmail}>\nSubject: ${email.subject}\n\n${email.body}`)
  }, [])

  const sendEmail = useCallback(() => {
    if (!composeTo.trim() || !composeSubject.trim()) return
    const newEmail: Email = {
      id: genId(),
      from: 'me@macbook.local',
      fromEmail: 'me@macbook.local',
      to: composeTo,
      subject: composeSubject,
      body: composeBody,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'sent',
    }
    setEmails((prev) => [...prev, newEmail])
    setComposing(false)
    setComposeTo('')
    setComposeSubject('')
    setComposeBody('')
    setReplyTo(null)
  }, [composeTo, composeSubject, composeBody])

  const saveDraft = useCallback(() => {
    if (!composeSubject.trim() && !composeBody.trim()) {
      setComposing(false)
      return
    }
    const draftEmail: Email = {
      id: replyTo ? `draft-${replyTo.id}` : genId(),
      from: 'me@macbook.local',
      fromEmail: 'me@macbook.local',
      to: composeTo,
      subject: composeSubject || '(No Subject)',
      body: composeBody,
      date: new Date().toISOString(),
      read: true,
      starred: false,
      folder: 'drafts',
    }
    setEmails((prev) => {
      const existing = prev.find((e) => e.id === draftEmail.id)
      if (existing) {
        return prev.map((e) => e.id === draftEmail.id ? draftEmail : e)
      }
      return [...prev, draftEmail]
    })
    setComposing(false)
  }, [composeTo, composeSubject, composeBody, replyTo])

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'short' })
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const sidebarBtn = (folderId: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    padding: '5px 12px',
    border: 'none',
    background: selectedFolder === folderId ? 'var(--accent-blue)' : 'transparent',
    color: selectedFolder === folderId ? 'white' : 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: 13,
  })

  return (
    <div data-testid="mail-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar */}
      <div data-testid="mail-sidebar" style={{ width: 180, borderRight: '0.5px solid var(--glass-border)', padding: '8px 0', flexShrink: 0 }}>
        <button
          data-testid="compose-btn"
          onClick={startCompose}
          style={{
            margin: '0 12px 8px',
            padding: '6px 16px',
            border: 'none',
            borderRadius: 16,
            background: 'var(--accent-blue)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >✏️ Compose</button>
        {FOLDERS.map((folder) => {
          const count = folder.id === 'inbox' ? unreadCount(folder.id) : emails.filter((e) => e.folder === folder.id).length
          return (
            <button key={folder.id} data-testid={`folder-${folder.id}`} onClick={() => { setSelectedFolder(folder.id); setSelectedEmailId(null) }} style={sidebarBtn(folder.id)}>
              <span>{folder.icon}</span>
              <span style={{ flex: 1 }}>{folder.name}</span>
              {count > 0 && folder.id === 'inbox' && (
                <span data-testid={`unread-${folder.id}`} style={{ fontSize: 11, opacity: 0.8 }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Email list */}
      <div data-testid="mail-list" style={{ width: 280, borderRight: '0.5px solid var(--glass-border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)' }}>
          <input
            data-testid="mail-search"
            type="text"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '4px 8px', border: '0.5px solid var(--glass-border)', borderRadius: 6, background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {folderEmails.length === 0 ? (
            <div data-testid="mail-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No emails
            </div>
          ) : (
            folderEmails.map((email) => (
              <div
                key={email.id}
                data-testid={`email-${email.id}`}
                onClick={() => openEmail(email)}
                style={{
                  padding: '8px 12px',
                  borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: selectedEmailId === email.id ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!email.read && <span data-testid={`unread-dot-${email.id}`} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0 }} />}
                  <span style={{ fontSize: 12, fontWeight: email.read ? 400 : 600, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.folder === 'sent' ? `To: ${email.to}` : email.from}
                  </span>
                  {email.starred && <span style={{ fontSize: 12, color: '#ffd60a' }}>★</span>}
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0 }}>{formatDate(email.date)}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: email.read ? 400 : 500 }}>{email.subject}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.body.slice(0, 60)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email detail or compose */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {composing ? (
          <div data-testid="compose-view" style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>New Message</span>
              <div style={{ flex: 1 }} />
              <button data-testid="send-btn" onClick={sendEmail} style={{ padding: '4px 16px', border: 'none', borderRadius: 6, background: 'var(--accent-blue)', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Send</button>
              <button data-testid="save-draft-btn" onClick={saveDraft} style={{ padding: '4px 12px', border: '0.5px solid var(--glass-border)', borderRadius: 6, background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12 }}>Save Draft</button>
              <button data-testid="cancel-compose-btn" onClick={() => setComposing(false)} style={{ padding: '4px 12px', border: '0.5px solid var(--glass-border)', borderRadius: 6, background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 12 }}>Cancel</button>
            </div>
            <input data-testid="compose-to" type="text" placeholder="To:" value={composeTo} onChange={(e) => setComposeTo(e.target.value)} style={{ ...composeInput, borderBottom: '0.5px solid var(--glass-border)' }} />
            <input data-testid="compose-subject" type="text" placeholder="Subject:" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} style={{ ...composeInput, borderBottom: '0.5px solid var(--glass-border)' }} />
            <textarea data-testid="compose-body" placeholder="Message body…" value={composeBody} onChange={(e) => setComposeBody(e.target.value)} style={{ flex: 1, ...composeInput, resize: 'none', fontFamily: 'inherit' }} />
          </div>
        ) : selectedEmail ? (
          <div data-testid="email-detail" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <button data-testid="reply-btn" onClick={() => startReply(selectedEmail)} style={detailBtn}>↩ Reply</button>
              <button data-testid="star-btn" onClick={() => starEmail(selectedEmail.id)} style={detailBtn}>{selectedEmail.starred ? '★' : '☆'}</button>
              <button data-testid="delete-btn" onClick={() => deleteEmail(selectedEmail.id)} style={detailBtn}>🗑 Delete</button>
            </div>
            <h2 data-testid="detail-subject" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>{selectedEmail.subject}</h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${selectedEmail.id.charCodeAt(0) * 30}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 600 }}>
                {selectedEmail.from[0]}
              </div>
              <div>
                <div data-testid="detail-from" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{selectedEmail.from}</div>
                <div data-testid="detail-email" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{selectedEmail.fromEmail}</div>
                <div data-testid="detail-date" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(selectedEmail.date).toLocaleString()}</div>
              </div>
            </div>
            <div data-testid="detail-body" style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{selectedEmail.body}</div>
          </div>
        ) : (
          <div data-testid="mail-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: 14 }}>
            Select an email to read
          </div>
        )}
      </div>
    </div>
  )
}

const composeInput: React.CSSProperties = {
  padding: '6px 8px',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-primary)',
  fontSize: 13,
  outline: 'none',
}

const detailBtn: React.CSSProperties = {
  padding: '4px 12px',
  border: '0.5px solid var(--glass-border)',
  borderRadius: 6,
  background: 'var(--glass-bg)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 12,
}
