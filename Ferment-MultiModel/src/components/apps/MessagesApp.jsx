import { useMemo, useState } from 'react';
import { Send } from 'lucide-react';

/**
 * MessagesApp
 *
 * Two-pane Messages window modelled after macOS / iOS Messages.
 *
 *   Left pane  – conversation list. Each row shows an avatar placeholder
 *                (initials inside a coloured circle), the contact name,
 *                a single-line preview, and a short timestamp.
 *   Right pane – chat view for the selected conversation. Each message
 *                is rendered as a bubble aligned right (sent) or left
 *                (received). A composer at the bottom has a text input
 *                and a Send button.
 *
 * Pure UI mock. There is no persistence: the conversations seed is
 * co-located with the component, and any message the user sends is
 * appended to the local state only and is lost on reload.
 *
 * Props:
 *   - className (string, optional): extra classes appended to the root.
 */
const INITIAL_CONVERSATIONS = [
  {
    id: 'c1',
    name: 'Ada Lovelace',
    preview: 'See you at the demo tomorrow!',
    timestamp: '9:41 AM',
    messages: [
      { id: 'm1', text: 'Hey, did you finish the analytical engine spec?', from: 'them', timestamp: '9:30 AM' },
      { id: 'm2', text: 'Almost — last paragraph tonight.', from: 'me', timestamp: '9:32 AM' },
      { id: 'm3', text: 'See you at the demo tomorrow!', from: 'them', timestamp: '9:41 AM' },
    ],
  },
  {
    id: 'c2',
    name: 'Grace Hopper',
    preview: 'The compiler patch is up for review.',
    timestamp: 'Yesterday',
    messages: [
      { id: 'm1', text: 'COBOL meeting moved to 3pm.', from: 'them', timestamp: 'Yesterday' },
      { id: 'm2', text: 'Got it, thanks for the heads up.', from: 'me', timestamp: 'Yesterday' },
      { id: 'm3', text: 'The compiler patch is up for review.', from: 'them', timestamp: 'Yesterday' },
    ],
  },
  {
    id: 'c3',
    name: 'Alan Turing',
    preview: 'Have you read the latest paper?',
    timestamp: 'Mon',
    messages: [
      { id: 'm1', text: 'Have you read the latest paper?', from: 'them', timestamp: 'Mon' },
    ],
  },
  {
    id: 'c4',
    name: 'Katherine Johnson',
    preview: 'Trajectory numbers look great.',
    timestamp: 'Sun',
    messages: [
      { id: 'm1', text: 'Trajectory numbers look great.', from: 'them', timestamp: 'Sun' },
      { id: 'm2', text: 'Thanks for double-checking!', from: 'me', timestamp: 'Sun' },
    ],
  },
];

// Deterministic colour palette so each contact keeps a stable hue across
// renders without needing a hashing utility.
const AVATAR_PALETTE = [
  'bg-rose-500/80',
  'bg-amber-500/80',
  'bg-emerald-500/80',
  'bg-sky-500/80',
  'bg-violet-500/80',
  'bg-fuchsia-500/80',
  'bg-teal-500/80',
];

function getInitials(name) {
  if (typeof name !== 'string' || name.length === 0) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function pickAvatarClass(id, palette) {
  if (typeof id !== 'string' || palette.length === 0) return palette[0];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
}

function formatNow() {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mm} ${ampm}`;
}

function MessagesApp({ className }) {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState(INITIAL_CONVERSATIONS[0].id);
  const [draft, setDraft] = useState('');

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  function handleSelect(id) {
    setSelectedId(id);
  }

  function handleDraftChange(event) {
    setDraft(event.target.value);
  }

  function handleSend() {
    const text = draft.trim();
    if (text.length === 0 || !selectedConversation) return;

    const newMessage = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      from: 'me',
      timestamp: formatNow(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              preview: text,
              timestamp: newMessage.timestamp,
            }
          : c,
      ),
    );
    setDraft('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
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
      data-testid="messages-app"
      data-app-id="messages"
      className={rootClassName}
    >
      <aside
        data-testid="messages-conversation-list"
        aria-label="Conversations"
        className="w-64 shrink-0 border-r border-white/10 bg-white/5 overflow-y-auto"
      >
        {conversations.map((conversation) => {
          const isActive = conversation.id === selectedId;
          const avatarClass = pickAvatarClass(conversation.id, AVATAR_PALETTE);
          const initials = getInitials(conversation.name);
          const itemClassName = [
            'flex',
            'items-center',
            'gap-3',
            'px-3',
            'py-2',
            'cursor-pointer',
            'transition-colors',
            isActive ? 'bg-white/15' : 'hover:bg-white/10',
          ].join(' ');
          return (
            <button
              key={conversation.id}
              type="button"
              data-testid="messages-conversation-item"
              data-conversation-id={conversation.id}
              data-active={isActive ? 'true' : 'false'}
              aria-pressed={isActive}
              onClick={() => handleSelect(conversation.id)}
              className={itemClassName}
            >
              <span
                aria-hidden="true"
                className={[
                  'flex',
                  'items-center',
                  'justify-center',
                  'w-9',
                  'h-9',
                  'rounded-full',
                  'text-xs',
                  'font-semibold',
                  'text-white',
                  'shrink-0',
                  avatarClass,
                ].join(' ')}
              >
                {initials}
              </span>
              <span className="flex-1 min-w-0 text-left">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium truncate">
                    {conversation.name}
                  </span>
                  <span className="text-[10px] text-white/60 shrink-0">
                    {conversation.timestamp}
                  </span>
                </span>
                <span className="block text-xs text-white/70 truncate">
                  {conversation.preview}
                </span>
              </span>
            </button>
          );
        })}
      </aside>

      <section
        data-testid="messages-chat-view"
        aria-label="Conversation"
        className="flex-1 flex flex-col min-w-0"
      >
        <header className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-white/5">
          <span
            aria-hidden="true"
            className={[
              'flex',
              'items-center',
              'justify-center',
              'w-8',
              'h-8',
              'rounded-full',
              'text-xs',
              'font-semibold',
              'text-white',
              selectedConversation
                ? pickAvatarClass(selectedConversation.id, AVATAR_PALETTE)
                : 'bg-white/20',
            ].join(' ')}
          >
            {selectedConversation ? getInitials(selectedConversation.name) : '?'}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {selectedConversation ? selectedConversation.name : 'No conversation'}
            </div>
          </div>
        </header>

        <div
          data-testid="messages-thread"
          className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        >
          {selectedConversation && selectedConversation.messages.length > 0 ? (
            selectedConversation.messages.map((message) => {
              const isMine = message.from === 'me';
              const bubbleClassName = [
                'max-w-[70%]',
                'rounded-2xl',
                'px-3',
                'py-1.5',
                'text-sm',
                'leading-snug',
                'shadow-sm',
                isMine
                  ? 'ml-auto bg-sky-500/80 text-white rounded-br-sm'
                  : 'mr-auto bg-white/15 text-white/90 rounded-bl-sm',
              ].join(' ');
              const wrapperClassName = [
                'flex',
                isMine ? 'justify-end' : 'justify-start',
              ].join(' ');
              return (
                <div
                  key={message.id}
                  data-testid="messages-bubble"
                  data-from={message.from}
                  className={wrapperClassName}
                >
                  <div className={bubbleClassName}>
                    <div>{message.text}</div>
                    <div
                      className={[
                        'mt-1',
                        'text-[10px]',
                        'uppercase',
                        'tracking-wide',
                        isMine ? 'text-white/70 text-right' : 'text-white/60',
                      ].join(' ')}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex items-center justify-center text-white/60 text-sm">
              Select a conversation to start chatting.
            </div>
          )}
        </div>

        <form
          data-testid="messages-composer"
          className="flex items-center gap-2 px-3 py-2 border-t border-white/10 bg-white/5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            data-testid="messages-input"
            aria-label="Message"
            placeholder="iMessage"
            value={draft}
            onChange={handleDraftChange}
            onKeyDown={handleKeyDown}
            disabled={!selectedConversation}
            className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/60 disabled:opacity-50"
          />
          <button
            type="submit"
            data-testid="messages-send-button"
            aria-label="Send"
            disabled={draft.trim().length === 0 || !selectedConversation}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-400 disabled:bg-white/20 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Send aria-hidden="true" className="w-4 h-4" />
          </button>
        </form>
      </section>
    </div>
  );
}

export default MessagesApp;
