import { useMemo, useState } from 'react';
import { Inbox, Send, FileText, Trash2 } from 'lucide-react';

/**
 * MailApp
 *
 * Three-pane Mail window modelled after macOS Mail:
 *
 *   Left sidebar  - mailboxes (Inbox, Sent, Drafts, Trash). Selecting
 *                   a mailbox filters the message list shown in the
 *                   middle pane.
 *   Middle pane   - list of messages in the selected mailbox. Each row
 *                   shows sender, subject, preview and timestamp.
 *   Right pane    - reader for the selected message, displaying
 *                   sender, subject, timestamp and body.
 *
 * Pure UI mock. No persistence. Mock data is co-located with the
 * component.
 *
 * Props:
 *   - className (string, optional): extra classes appended to the root.
 */

const MAILBOXES = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'trash', label: 'Trash', icon: Trash2 },
];

const EMAILS = [
  {
    id: 'e1',
    mailboxId: 'inbox',
    from: 'Ada Lovelace',
    subject: 'Demo tomorrow',
    preview: 'Looking forward to walking through the spec with you.',
    timestamp: '9:41 AM',
    body: 'Hi,\n\nLooking forward to walking through the spec with you tomorrow morning. I have the deck ready and a few questions about the timing.\n\nBest,\nAda',
  },
  {
    id: 'e2',
    mailboxId: 'inbox',
    from: 'Grace Hopper',
    subject: 'Compiler patch up for review',
    preview: 'Please take a look when you get a chance.',
    timestamp: '8:15 AM',
    body: 'Hey,\n\nThe compiler patch is up for review. No rush, but I would love your feedback before the end of the week.\n\nThanks,\nGrace',
  },
  {
    id: 'e3',
    mailboxId: 'inbox',
    from: 'Alan Turing',
    subject: 'New paper',
    preview: 'Have you read the latest issue yet?',
    timestamp: 'Yesterday',
    body: 'Hello,\n\nHave you read the latest issue of the journal yet? Section 3 is particularly relevant to what we discussed last week.\n\nCheers,\nAlan',
  },
  {
    id: 'e4',
    mailboxId: 'sent',
    from: 'Me',
    subject: 'Re: Trajectory numbers',
    preview: 'Thanks for double-checking the calculations.',
    timestamp: 'Sun',
    body: 'Hi Katherine,\n\nThanks for double-checking the trajectory calculations. Everything looks great on my end too.\n\nBest,\nMe',
  },
  {
    id: 'e5',
    mailboxId: 'sent',
    from: 'Me',
    subject: 'Meeting notes',
    preview: 'Sharing the notes from this mornings sync.',
    timestamp: 'Sat',
    body: 'Hi team,\n\nSharing the notes from this mornings sync. Please reply with any edits before Monday.\n\nThanks,\nMe',
  },
  {
    id: 'e6',
    mailboxId: 'drafts',
    from: 'Me',
    subject: 'Quarterly review draft',
    preview: 'Outline of talking points for the quarterly review.',
    timestamp: 'Mon',
    body: 'Draft outline:\n\n1. Wins from the last quarter\n2. Open questions\n3. Goals for next quarter\n\n(to be expanded)',
  },
  {
    id: 'e7',
    mailboxId: 'trash',
    from: 'Spam Sender',
    subject: 'You have won a prize',
    preview: 'Click here to claim your reward.',
    timestamp: 'Last week',
    body: 'Congratulations! You have been selected as the winner of a totally real prize. Click here to claim.',
  },
];

function MailApp({ className }) {
  const [selectedMailboxId, setSelectedMailboxId] = useState('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const messagesInMailbox = useMemo(
    () => EMAILS.filter((email) => email.mailboxId === selectedMailboxId),
    [selectedMailboxId],
  );

  const selectedMessage = useMemo(
    () => EMAILS.find((email) => email.id === selectedMessageId) ?? null,
    [selectedMessageId],
  );

  function handleSelectMailbox(id) {
    setSelectedMailboxId(id);
    setSelectedMessageId(null);
  }

  function handleSelectMessage(id) {
    setSelectedMessageId(id);
  }

  const rootClassName = [
    'flex',
    'h-full',
    'w-full',
    'text-white/90',
    'text-sm',
    'overflow-hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      data-testid="mail-app"
      data-app-id="mail"
      className={rootClassName}
    >
      <aside
        data-testid="mail-mailbox-list"
        aria-label="Mailboxes"
        className="w-48 shrink-0 border-r border-white/10 bg-white/5 overflow-y-auto"
      >
        {MAILBOXES.map((mailbox) => {
          const Icon = mailbox.icon;
          const isActive = mailbox.id === selectedMailboxId;
          const itemClassName = [
            'flex',
            'items-center',
            'gap-2',
            'w-full',
            'px-3',
            'py-2',
            'cursor-pointer',
            'transition-colors',
            'text-left',
            isActive
              ? 'bg-white/15 text-white'
              : 'text-white/80 hover:bg-white/10',
          ].join(' ');
          return (
            <button
              key={mailbox.id}
              type="button"
              data-testid="mail-mailbox"
              data-mailbox-id={mailbox.id}
              data-active={isActive ? 'true' : 'false'}
              aria-pressed={isActive}
              onClick={() => handleSelectMailbox(mailbox.id)}
              className={itemClassName}
            >
              <Icon aria-hidden="true" className="w-4 h-4 shrink-0" />
              <span className="text-sm">{mailbox.label}</span>
            </button>
          );
        })}
      </aside>

      <section
        data-testid="mail-message-list"
        aria-label="Messages"
        className="w-80 shrink-0 border-r border-white/10 bg-white/5 overflow-y-auto"
      >
        {messagesInMailbox.length === 0 ? (
          <div className="px-4 py-10 text-center text-white/60 text-sm">
            No messages.
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {messagesInMailbox.map((email) => {
              const isActive = email.id === selectedMessageId;
              const itemClassName = [
                'flex',
                'flex-col',
                'gap-1',
                'w-full',
                'px-3',
                'py-2',
                'cursor-pointer',
                'transition-colors',
                'text-left',
                isActive
                  ? 'bg-white/15'
                  : 'hover:bg-white/10',
              ].join(' ');
              return (
                <li key={email.id}>
                  <button
                    type="button"
                    data-testid="mail-message"
                    data-message-id={email.id}
                    data-mailbox-id={email.mailboxId}
                    data-active={isActive ? 'true' : 'false'}
                    aria-pressed={isActive}
                    onClick={() => handleSelectMessage(email.id)}
                    className={itemClassName}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium truncate">
                        {email.from}
                      </span>
                      <span className="text-[10px] text-white/60 shrink-0">
                        {email.timestamp}
                      </span>
                    </span>
                    <span className="text-xs font-medium truncate">
                      {email.subject}
                    </span>
                    <span className="text-xs text-white/70 truncate">
                      {email.preview}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        data-testid="mail-reader"
        aria-label="Message reader"
        className="flex-1 min-w-0 overflow-y-auto"
      >
        {selectedMessage ? (
          <article className="flex flex-col gap-3 p-4">
            <header className="border-b border-white/10 pb-3">
              <h2
                data-testid="mail-reader-subject"
                className="text-lg font-semibold text-white"
              >
                {selectedMessage.subject}
              </h2>
              <div className="mt-1 flex items-baseline justify-between gap-2 text-xs text-white/70">
                <span data-testid="mail-reader-from">
                  From: {selectedMessage.from}
                </span>
                <span data-testid="mail-reader-timestamp">
                  {selectedMessage.timestamp}
                </span>
              </div>
            </header>
            <div
              data-testid="mail-reader-body"
              className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed"
            >
              {selectedMessage.body}
            </div>
          </article>
        ) : (
          <div className="h-full flex items-center justify-center text-white/60 text-sm">
            Select a message to read it.
          </div>
        )}
      </section>
    </div>
  );
}

export default MailApp;
export { MailApp, MAILBOXES, EMAILS };
