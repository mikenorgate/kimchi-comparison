import { useState } from 'react';

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  body: string;
  timestamp: string;
  read: boolean;
  replies: string[];
}

const SEED_EMAILS: Email[] = [
  { id: 'mail-1', sender: 'Apple', subject: 'Welcome to macOS Tahoe', preview: 'Discover what\u2019s new in Tahoe...', body: 'Welcome to macOS Tahoe!\n\nLiquid Glass brings a new dimension to your desktop with translucency and depth.\n\nExplore the new Control Center, Spotlight, and more.', timestamp: '9:42 AM', read: false, replies: [] },
  { id: 'mail-2', sender: 'Sarah Chen', subject: 'Project Update', preview: 'The latest design looks amazing...', body: 'Hi,\n\nThe latest design looks amazing! The Liquid Glass effect is really coming together.\n\nCan we review the window manager tomorrow?\n\nBest,\nSarah', timestamp: '8:15 AM', read: false, replies: [] },
  { id: 'mail-3', sender: 'GitHub', subject: 'Pull Request #42 merged', preview: 'Your PR has been merged into main...', body: 'Your pull request #42 has been merged into main.\n\nView changes: github.com/repo/pull/42', timestamp: 'Yesterday', read: true, replies: [] },
  { id: 'mail-4', sender: 'Mike Johnson', subject: 'Meeting Tomorrow', preview: 'Don\u2019t forget our meeting at 10am...', body: 'Don\u2019t forget our meeting at 10am tomorrow.\n\nAgenda:\n1. Phase 3 review\n2. Safari design\n3. Additional apps', timestamp: 'Yesterday', read: true, replies: [] },
  { id: 'mail-5', sender: 'Newsletter', subject: 'Tech Weekly Digest', preview: 'This week in tech: new frameworks...', body: 'This week in tech:\n\n\u2022 React 19 released\n\u2022 New CSS backdrop-filter features\n\u2022 TypeScript 5.5 updates\n\u2022 Vite 7 performance improvements', timestamp: 'Mon', read: true, replies: [] },
  { id: 'mail-6', sender: 'App Store', subject: 'App updates available', preview: '3 apps have updates...', body: '3 apps have updates available:\n\n\u2022 Notes (v2.1)\n\u2022 Photos (v4.0)\n\u2022 Music (v3.5)', timestamp: 'Sun', read: true, replies: [] },
];

export function Mail({ appId: _appId }: { appId: string }) {
  const [emails, setEmails] = useState(SEED_EMAILS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const selected = emails.find((e) => e.id === selectedId);

  const openEmail = (id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
    setSelectedId(id);
    setReplyText('');
  };

  const sendReply = () => {
    if (!selectedId || !replyText.trim()) return;
    setEmails((prev) => prev.map((e) => (e.id === selectedId ? { ...e, replies: [...e.replies, replyText] } : e)));
    setReplyText('');
  };

  return (
    <div className="flex h-full w-full" data-testid="mail-root">
      <div className="w-80 shrink-0 border-r border-black/5 dark:border-white/5 overflow-y-auto" data-testid="mail-inbox">
        <div className="px-4 py-2 text-xs font-semibold text-black/40 dark:text-white/40 uppercase border-b border-black/5 dark:border-white/5">Inbox</div>
        {emails.map((email) => (
          <button
            key={email.id}
            className={`w-full text-left px-4 py-3 border-b border-black/3 dark:border-white/3 transition-colors ${
              selectedId === email.id ? 'bg-[#0a84ff]/15' : 'hover:bg-black/3 dark:hover:bg-white/3'
            }`}
            onClick={() => openEmail(email.id)}
            data-testid={`mail-item-${email.id}`}
          >
            <div className="flex items-center gap-2">
              {!email.read && <div className="w-2 h-2 rounded-full bg-[#0a84ff]" />}
              <span className="text-sm font-medium text-black/80 dark:text-white/80 truncate">{email.sender}</span>
              <span className="ml-auto text-xs text-black/40 dark:text-white/40">{email.timestamp}</span>
            </div>
            <div className="text-sm text-black/70 dark:text-white/70 truncate mt-0.5">{email.subject}</div>
            <div className="text-xs text-black/40 dark:text-white/40 truncate">{email.preview}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col" data-testid="mail-reader">
        {selected ? (
          <>
            <div className="px-6 py-4 border-b border-black/5 dark:border-white/5">
              <h2 className="text-lg font-semibold text-black/80 dark:text-white/80">{selected.subject}</h2>
              <div className="text-sm text-black/50 dark:text-white/50 mt-1">From: {selected.sender} · {selected.timestamp}</div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="whitespace-pre-wrap text-sm text-black/70 dark:text-white/70">{selected.body}</div>
              {selected.replies.length > 0 && (
                <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4">
                  <div className="text-xs font-semibold text-black/40 dark:text-white/40 uppercase mb-2">Replies</div>
                  {selected.replies.map((r, i) => (
                    <div key={i} className="text-sm text-black/70 dark:text-white/70 mb-2 p-2 rounded bg-black/5 dark:bg-white/5">{r}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 p-3 border-t border-black/5 dark:border-white/5">
              <input
                type="text"
                placeholder="Reply..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-sm text-black/80 dark:text-white/80 outline-none"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
                data-testid="mail-reply-input"
              />
              <button
                className="px-4 py-1.5 rounded-lg bg-[#0a84ff] text-white text-sm"
                onClick={sendReply}
                data-testid="mail-reply-send"
              >Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-black/30 dark:text-white/30 text-sm" data-testid="mail-empty">Select an email</div>
        )}
      </div>
    </div>
  );
}
