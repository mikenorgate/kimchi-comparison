import { useState } from 'react';

interface Message { id: string; text: string; fromMe: boolean; time: string; }
interface Thread { id: string; name: string; avatar: string; messages: Message[]; }

const SEED_THREADS: Thread[] = [
  { id: 't1', name: 'Sarah Chen', avatar: '👩', messages: [
    { id: 'm1', text: 'Hey! Did you see the new Tahoe design?', fromMe: false, time: '9:30 AM' },
    { id: 'm2', text: 'Yes! The Liquid Glass looks incredible', fromMe: true, time: '9:32 AM' },
    { id: 'm3', text: 'Right? Can\u2019t wait to ship it', fromMe: false, time: '9:33 AM' },
  ]},
  { id: 't2', name: 'Mike Johnson', avatar: '👨', messages: [
    { id: 'm4', text: 'Meeting at 10am tomorrow?', fromMe: false, time: 'Yesterday' },
    { id: 'm5', text: 'Sounds good', fromMe: true, time: 'Yesterday' },
  ]},
  { id: 't3', name: 'Family Group', avatar: '👨‍👩‍👧‍👦', messages: [
    { id: 'm6', text: 'Dinner on Sunday?', fromMe: false, time: 'Mon' },
  ]},
];

export function Messages({ appId: _appId }: { appId: string }) {
  const [threads, setThreads] = useState(SEED_THREADS);
  const [selectedId, setSelectedId] = useState<string | null>(SEED_THREADS[0].id);
  const [input, setInput] = useState('');
  const selected = threads.find((t) => t.id === selectedId);

  const sendMessage = () => {
    if (!selectedId || !input.trim()) return;
    setThreads((prev) => prev.map((t) => t.id === selectedId ? {
      ...t,
      messages: [...t.messages, { id: `m-${Date.now()}`, text: input, fromMe: true, time: 'Now' }],
    } : t));
    setInput('');
  };

  return (
    <div className="flex h-full w-full" data-testid="messages-root">
      <div className="w-64 shrink-0 border-r border-black/5 dark:border-white/5 overflow-y-auto" data-testid="messages-sidebar">
        {threads.map((thread) => (
          <button
            key={thread.id}
            className={`w-full flex items-center gap-2 px-4 py-3 border-b border-black/3 dark:border-white/3 transition-colors ${
              selectedId === thread.id ? 'bg-[#0a84ff]/15' : 'hover:bg-black/3 dark:hover:bg-white/3'
            }`}
            onClick={() => setSelectedId(thread.id)}
            data-testid={`messages-thread-${thread.id}`}
          >
            <span className="text-2xl">{thread.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black/80 dark:text-white/80 truncate">{thread.name}</div>
              <div className="text-xs text-black/40 dark:text-white/40 truncate">{thread.messages[thread.messages.length - 1]?.text}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col" data-testid="messages-chat">
        {selected ? (
          <>
            <div className="px-4 py-2 border-b border-black/5 dark:border-white/5 text-sm font-medium text-black/70 dark:text-white/70" data-testid="messages-header">{selected.name}</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2" data-testid="messages-list">
              {selected.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                    msg.fromMe ? 'bg-[#0a84ff] text-white' : 'bg-black/8 dark:bg-white/10 text-black/80 dark:text-white/80'
                  }`} data-testid={`message-${msg.id}`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-3 border-t border-black/5 dark:border-white/5">
              <input
                type="text"
                placeholder="iMessage"
                className="flex-1 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-sm text-black/80 dark:text-white/80 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                data-testid="messages-input"
              />
              <button className="px-3 py-1.5 rounded-full bg-[#0a84ff] text-white text-sm" onClick={sendMessage} data-testid="messages-send">↑</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-black/30 dark:text-white/30 text-sm">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
