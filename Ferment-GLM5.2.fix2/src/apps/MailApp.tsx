import { useState } from 'react';
import { MAIL_MESSAGES } from '@/data/productivity-data';
import { GlassSurface } from '@/components/glass/GlassSurface';

export default function MailApp({ windowId: _windowId }: { windowId?: string }) {
  const [messages, setMessages] = useState(MAIL_MESSAGES);
  const [selectedId, setSelectedId] = useState(MAIL_MESSAGES[0]?.id ?? '');

  const selected = messages.find((m) => m.id === selectedId) ?? null;
  const unreadCount = messages.filter((m) => m.unread).length;

  const selectMessage = (id: string) => {
    setSelectedId(id);
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m)),
    );
  };

  return (
    <GlassSurface
      variant="regular"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--glass-border-inner)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }} aria-hidden>✉️</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
              Inbox
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {messages.length} messages · {unreadCount} unread
            </div>
          </div>
        </div>
      </div>

      {/* Two-pane body */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Inbox list */}
        <div
          style={{
            width: 280,
            minWidth: 280,
            borderRight: '1px solid var(--glass-border-inner)',
            overflowY: 'auto',
            padding: 8,
          }}
        >
          {messages.map((m) => {
            const isActive = m.id === selectedId;
            return (
              <button
                key={m.id}
                onClick={() => selectMessage(m.id)}
                style={{
                  display: 'flex',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  padding: 10,
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  cursor: 'pointer',
                  marginBottom: 4,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    {m.unread && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: isActive
                            ? 'var(--window-bg)'
                            : 'var(--accent)',
                          flexShrink: 0,
                        }}
                        aria-hidden
                      />
                    )}
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: m.unread ? 600 : 400,
                        color: isActive
                          ? 'var(--window-bg)'
                          : 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.from}
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
                      {m.time}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: m.unread ? 600 : 400,
                      color: isActive
                        ? 'var(--window-bg)'
                        : 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 2,
                    }}
                  >
                    {m.subject}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: isActive
                        ? 'var(--window-bg)'
                        : 'var(--text-secondary)',
                      opacity: isActive ? 0.85 : 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.preview}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Message view */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {selected ? (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                  }}
                >
                  {selected.subject}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: 'var(--window-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {selected.from.charAt(0)}
                  </span>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {selected.from}
                  </span>
                  <span>·</span>
                  <span>{selected.time}</span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selected.body}
              </div>
            </div>
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
              Select a message to read
            </div>
          )}
        </div>
      </div>
    </GlassSurface>
  );
}
