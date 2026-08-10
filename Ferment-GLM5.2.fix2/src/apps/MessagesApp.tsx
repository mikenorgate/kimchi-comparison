import { useState } from 'react';
import { MESSAGE_THREADS, type MessageThread } from '@/data/productivity-data';
import { GlassSurface } from '@/components/glass/GlassSurface';

export default function MessagesApp({ windowId: _windowId }: { windowId?: string }) {
  const [threads, setThreads] = useState<MessageThread[]>(MESSAGE_THREADS);
  const [selectedId, setSelectedId] = useState<string>(MESSAGE_THREADS[0]?.id ?? '');
  const [draft, setDraft] = useState('');

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  const send = () => {
    const text = draft.trim();
    if (!text || !selected) return;
    const now = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
    const newMsg = {
      id: `local-${Date.now()}`,
      fromMe: true,
      text,
      time: now,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMessage: text,
              time: 'now',
            }
          : t,
      ),
    );
    setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <GlassSurface
      variant="regular"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Thread list */}
        <div
          style={{
            width: 260,
            minWidth: 260,
            borderRight: '1px solid var(--glass-border-inner)',
            overflowY: 'auto',
            padding: 8,
          }}
        >
          {threads.map((t) => {
            const isActive = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                style={{
                  display: 'flex',
                  gap: 10,
                  width: '100%',
                  textAlign: 'left',
                  padding: 10,
                  borderRadius: 12,
                  border: 'none',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  cursor: 'pointer',
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }} aria-hidden>
                  {t.avatar}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isActive
                          ? 'var(--window-bg)'
                          : 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 11,
                        color: isActive
                          ? 'var(--window-bg)'
                          : 'var(--text-secondary)',
                        flexShrink: 0,
                      }}
                    >
                      {t.time}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: isActive
                        ? 'var(--window-bg)'
                        : 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t.lastMessage}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Conversation */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {selected ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--glass-border-inner)',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 24 }} aria-hidden>
                  {selected.avatar}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {selected.name}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: m.fromMe ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '8px 12px',
                        borderRadius: 16,
                        fontSize: 14,
                        lineHeight: 1.4,
                        background: m.fromMe
                          ? 'var(--accent)'
                          : 'var(--glass-border-inner)',
                        color: m.fromMe
                          ? 'var(--window-bg)'
                          : 'var(--text-primary)',
                        borderBottomRightRadius: m.fromMe ? 4 : 16,
                        borderBottomLeftRadius: m.fromMe ? 16 : 4,
                      }}
                    >
                      {m.text}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-secondary)',
                        marginTop: 3,
                        padding: '0 4px',
                      }}
                    >
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  padding: 12,
                  borderTop: '1px solid var(--glass-border-inner)',
                  flexShrink: 0,
                }}
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="iMessage"
                  rows={1}
                  style={{
                    flex: 1,
                    resize: 'none',
                    border: '1px solid var(--glass-border-inner)',
                    borderRadius: 16,
                    padding: '8px 12px',
                    fontSize: 14,
                    background: 'var(--window-bg)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={send}
                  disabled={!draft.trim()}
                  style={{
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    border: 'none',
                    background: draft.trim() ? 'var(--accent)' : 'var(--glass-border-inner)',
                    color: 'var(--window-bg)',
                    fontSize: 18,
                    cursor: draft.trim() ? 'pointer' : 'default',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
                fontSize: 14,
              }}
            >
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </GlassSurface>
  );
}
