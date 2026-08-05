import { useState, useCallback } from 'react'
import { Inbox, Send, FileText, Trash2, Star, Plus, X } from 'lucide-react'
import type { Email, MailFolder } from './types'
import { sampleEmails, folders } from './data'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const folderIcons: Record<MailFolder, typeof Inbox> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  trash: Trash2,
}

export function Mail() {
  const [emails, setEmails] = useState<Email[]>(sampleEmails)
  const [folder, setFolder] = useState<MailFolder>('inbox')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')

  const filteredEmails = emails.filter((email) => {
    if (folder === 'trash') return email.folder === 'trash'
    if (folder === 'inbox') return email.folder === 'inbox'
    if (folder === 'sent') return email.folder === 'sent'
    if (folder === 'drafts') return email.folder === 'drafts'
    return true
  })

  const selectedEmail = emails.find((email) => email.id === selectedId) ?? null

  const selectEmail = useCallback((id: string) => {
    setSelectedId(id)
    setEmails((prev) =>
      prev.map((email) => (email.id === id ? { ...email, read: true } : email))
    )
  }, [])

  const toggleFlag = useCallback((id: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, flagged: !email.flagged } : email
      )
    )
  }, [])

  const deleteEmail = useCallback((id: string) => {
    setEmails((prev) => {
      const target = prev.find((email) => email.id === id)
      if (!target) return prev
      if (target.folder === 'trash') {
        return prev.filter((email) => email.id !== id)
      }
      return prev.map((email) =>
        email.id === id ? { ...email, folder: 'trash' } : email
      )
    })
    setSelectedId((current) => (current === id ? null : current))
  }, [])

  const sendEmail = useCallback(() => {
    const subject = composeSubject.trim() || 'No Subject'
    const newEmail: Email = {
      id: generateId(),
      sender: 'me',
      subject,
      preview: composeBody.slice(0, 80),
      body: composeBody,
      date: 'Just now',
      read: true,
      flagged: false,
      folder: 'sent',
    }
    setEmails((prev) => [newEmail, ...prev])
    setComposeTo('')
    setComposeSubject('')
    setComposeBody('')
    setShowCompose(false)
  }, [composeSubject, composeBody])

  const unreadCount = (folderId: MailFolder) =>
    emails.filter((email) => email.folder === folderId && !email.read).length

  return (
    <div
      className="flex h-full w-full bg-tahoe-glass/30 text-tahoe-text overflow-hidden"
      data-testid="mail-app"
    >
      {/* Sidebar */}
      <div
        className="w-48 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/60 p-3 flex flex-col gap-1"
        data-testid="mail-sidebar"
      >
        <button
          onClick={() => setShowCompose(true)}
          className="mb-3 flex items-center justify-center gap-2 rounded-tahoe-xs bg-tahoe-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
          data-testid="mail-compose"
        >
          <Plus className="w-4 h-4" />
          Compose
        </button>
        {folders.map(({ id, label }) => {
          const Icon = folderIcons[id]
          const count = unreadCount(id)
          return (
            <button
              key={id}
              onClick={() => {
                setFolder(id)
                setSelectedId(null)
              }}
              className={`flex items-center justify-between rounded-tahoe-xs px-3 py-2 text-sm transition-colors ${
                folder === id
                  ? 'bg-tahoe-accent/20 text-tahoe-text'
                  : 'hover:bg-white/5 text-tahoe-text-secondary'
              }`}
              data-testid={`mail-folder-${id}`}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </span>
              {count > 0 && (
                <span className="rounded-full bg-tahoe-accent px-2 py-0.5 text-xs text-white">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Message list */}
      <div
        className="w-72 flex-shrink-0 border-r border-tahoe-glass-border bg-tahoe-window/40 overflow-y-auto"
        data-testid="mail-list"
      >
        {filteredEmails.length === 0 ? (
          <div
            className="flex h-full items-center justify-center text-sm text-tahoe-text-secondary"
            data-testid="mail-empty-list"
          >
            No messages
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => selectEmail(email.id)}
              className={`cursor-pointer border-b border-tahoe-glass-border p-3 transition-colors ${
                selectedId === email.id
                  ? 'bg-tahoe-accent/10'
                  : 'hover:bg-white/5'
              } ${email.read ? 'opacity-90' : 'font-semibold'}`}
              data-testid={`mail-item-${email.id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm">{email.sender}</span>
                <span className="text-xs text-tahoe-text-secondary whitespace-nowrap">
                  {email.date}
                </span>
              </div>
              <div className="truncate text-sm">{email.subject}</div>
              <div className="truncate text-xs text-tahoe-text-secondary">
                {email.preview}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFlag(email.id)
                  }}
                  className="p-1 rounded hover:bg-white/10"
                  data-testid={`mail-flag-${email.id}`}
                  aria-label="Flag"
                >
                  <Star
                    className={`w-4 h-4 ${
                      email.flagged
                        ? 'fill-tahoe-yellow text-tahoe-yellow'
                        : 'text-tahoe-text-secondary'
                    }`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteEmail(email.id)
                  }}
                  className="p-1 rounded hover:bg-white/10 text-tahoe-text-secondary hover:text-tahoe-red"
                  data-testid={`mail-delete-${email.id}`}
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reading pane */}
      <div
        className="flex flex-1 flex-col bg-tahoe-window/80"
        data-testid="mail-reading-pane"
      >
        {selectedEmail ? (
          <>
            <div className="border-b border-tahoe-glass-border p-4">
              <h2 className="text-lg font-semibold">{selectedEmail.subject}</h2>
              <div className="mt-1 flex items-center justify-between text-sm text-tahoe-text-secondary">
                <span data-testid="mail-reading-sender">
                  From: {selectedEmail.sender}
                </span>
                <span>{selectedEmail.date}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 whitespace-pre-wrap text-sm">
              {selectedEmail.body}
            </div>
          </>
        ) : (
          <div
            className="flex flex-1 items-center justify-center text-sm text-tahoe-text-secondary"
            data-testid="mail-empty-reading"
          >
            Select a message to read
          </div>
        )}
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
          data-testid="mail-compose-modal"
        >
          <div className="w-[480px] rounded-tahoe-lg bg-tahoe-window p-4 shadow-window border border-tahoe-glass-border">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">New Message</h3>
              <button
                onClick={() => setShowCompose(false)}
                className="p-1 rounded hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="To"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="w-full rounded-tahoe-xs bg-white/5 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-tahoe-accent placeholder:text-tahoe-text-secondary"
                data-testid="mail-compose-to"
              />
              <input
                type="text"
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="w-full rounded-tahoe-xs bg-white/5 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-tahoe-accent placeholder:text-tahoe-text-secondary"
                data-testid="mail-compose-subject"
              />
              <textarea
                rows={6}
                placeholder="Message"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full resize-none rounded-tahoe-xs bg-white/5 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-tahoe-accent placeholder:text-tahoe-text-secondary"
                data-testid="mail-compose-body"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCompose(false)}
                  className="rounded-tahoe-xs px-4 py-2 text-sm hover:bg-white/5"
                  data-testid="mail-compose-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={sendEmail}
                  className="rounded-tahoe-xs bg-tahoe-accent px-4 py-2 text-sm font-medium text-white hover:brightness-110"
                  data-testid="mail-compose-send"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
