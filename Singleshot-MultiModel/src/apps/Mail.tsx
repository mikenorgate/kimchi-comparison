import { useMemo, useState } from 'react';

interface MailMessage {
  id: string;
  sender: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string; // ISO
}

const SAMPLE_MAIL: MailMessage[] = [
  {
    id: 'm-1',
    sender: 'Apple',
    email: 'no-reply@apple.com',
    subject: 'Welcome to iCloud',
    preview: 'Get started with 5 GB of free storage and sync across all your devices.',
    body: 'Welcome to iCloud!\n\nYou now have 5 GB of free storage to keep your photos, files, and backups in sync.\n\nIf you would like more space, you can upgrade at any time from System Settings → Apple ID → iCloud.\n\n— The iCloud Team',
    receivedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'm-2',
    sender: 'GitHub',
    email: 'noreply@github.com',
    subject: 'Your weekly digest',
    preview: '12 new stars, 3 pull requests merged across your repositories.',
    body: 'Here is what happened this week across your repositories:\n\n• macos-tahoe-web received 12 new stars\n• 3 pull requests were merged\n• 4 new issues opened\n\nKeep up the great work!',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'm-3',
    sender: 'Maya Chen',
    email: 'maya@example.com',
    subject: 'Design review notes',
    preview: 'A few thoughts on the latest mocks — let me know what you think!',
    body: 'Hi there,\n\nI went through the latest mocks and have a few notes:\n\n1. The new sidebar spacing feels much better.\n2. Can we tighten the icon size on the Dock?\n3. The Music app looks great — nice work!\n\nLet me know when you have time to chat.\n\n— Maya',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 'm-4',
    sender: 'Linear',
    email: 'team@linear.app',
    subject: 'Cycle 47 planning starts tomorrow',
    preview: 'Get ready to scope issues for the next two-week cycle.',
    body: 'Cycle 47 starts tomorrow.\n\nPlease make sure all of your issues are triaged and prioritized before the planning session.\n\nHappy shipping!',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: 'm-5',
    sender: 'Stripe',
    email: 'receipts@stripe.com',
    subject: 'Receipt for your subscription',
    preview: 'Your monthly subscription of $19.00 has been charged.',
    body: 'Thank you for your subscription.\n\nAmount: $19.00\nDate: Today\nCard: Visa ending in 4242\n\nThis email serves as your receipt.',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  if (diffMs < dayMs) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (diffMs < dayMs * 7) {
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function Mail(): JSX.Element {
  const [messages, setMessages] = useState<MailMessage[]>(SAMPLE_MAIL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [draftTo, setDraftTo] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId],
  );

  const handleDelete = (): void => {
    if (!selected) return;
    setMessages((prev) => prev.filter((m) => m.id !== selected.id));
    setSelectedId(null);
  };

  const handleSend = (): void => {
    if (!draftTo.trim()) return;
    const sent: MailMessage = {
      id: `m-${Date.now()}`,
      sender: 'You',
      email: 'me@example.com',
      subject: draftSubject.trim() || '(no subject)',
      preview: draftBody.slice(0, 80),
      body: draftBody,
      receivedAt: new Date().toISOString(),
    };
    setMessages((prev) => [sent, ...prev]);
    setSelectedId(sent.id);
    setComposing(false);
    setDraftTo('');
    setDraftSubject('');
    setDraftBody('');
  };

  const handleCancelCompose = (): void => {
    setComposing(false);
    setDraftTo('');
    setDraftSubject('');
    setDraftBody('');
  };

  return (
    <div className="mail-root">
      <div className="mail-list">
        <div className="mail-list__header">
          <span>Inbox</span>
          <button
            type="button"
            className="app-btn app-btn--primary"
            style={{ height: 22, fontSize: 11 }}
            onClick={() => setComposing(true)}
          >
            Compose
          </button>
        </div>
        <div className="mail-list__items">
          {messages.length === 0 && (
            <div style={{ padding: 20, color: 'var(--color-text-secondary)', fontSize: 13 }}>
              Inbox is empty.
            </div>
          )}
          {messages.map((m) => {
            const isSelected = m.id === selectedId;
            return (
              <button
                type="button"
                key={m.id}
                className={`mail-list-item${isSelected ? ' mail-list-item--selected' : ''}`}
                onClick={() => {
                  setSelectedId(m.id);
                  setComposing(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div className="mail-list-item__row">
                  <span className="mail-list-item__sender">{m.sender}</span>
                  <span className="mail-list-item__time">{formatTime(m.receivedAt)}</span>
                </div>
                <div className="mail-list-item__subject">{m.subject}</div>
                <div className="mail-list-item__preview">{m.preview}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mail-reader">
        {composing ? (
          <>
            <div className="mail-reader__header">
              <div className="mail-reader__subject">New Message</div>
            </div>
            <div className="mail-compose">
              <div className="mail-compose__field">
                <label>To:</label>
                <input
                  type="email"
                  className="app-input"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                  placeholder="someone@example.com"
                />
              </div>
              <div className="mail-compose__field">
                <label>Subject:</label>
                <input
                  type="text"
                  className="app-input"
                  value={draftSubject}
                  onChange={(e) => setDraftSubject(e.target.value)}
                />
              </div>
              <textarea
                className="mail-compose__body"
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder="Write your message…"
              />
              <div className="mail-compose__actions">
                <button type="button" className="app-btn" onClick={handleCancelCompose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  onClick={handleSend}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : selected ? (
          <>
            <div className="mail-reader__header">
              <div className="mail-reader__subject">{selected.subject}</div>
              <div className="mail-reader__meta">
                <span>
                  <strong>{selected.sender}</strong> &lt;{selected.email}&gt;
                </span>
                <span>{new Date(selected.receivedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="mail-reader__body">{selected.body}</div>
            <div
              style={{
                padding: '10px 20px',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                gap: 8,
                background: 'rgba(245,245,247,0.7)',
                flexShrink: 0,
              }}
            >
              <button type="button" className="app-btn" onClick={() => setSelectedId(null)}>
                Back
              </button>
              <button type="button" className="app-btn" onClick={handleDelete}>
                Delete
              </button>
              <button
                type="button"
                className="app-btn app-btn--primary"
                onClick={() => setComposing(true)}
              >
                Reply
              </button>
            </div>
          </>
        ) : (
          <div className="mail-reader__empty">
            <div style={{ fontSize: 36 }}>✉️</div>
            <div>Select a message to read</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mail;
