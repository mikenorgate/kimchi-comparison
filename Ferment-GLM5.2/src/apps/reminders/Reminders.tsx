import { useState } from 'react';

interface Reminder { id: string; text: string; completed: boolean; listId: string; }
interface ReminderList { id: string; name: string; color: string; }

const SEED_LISTS: ReminderList[] = [
  { id: 'l1', name: 'Today', color: '#0a84ff' },
  { id: 'l2', name: 'Work', color: '#ff9f0a' },
  { id: 'l3', name: 'Personal', color: '#30d158' },
];

const SEED_REMINDERS: Reminder[] = [
  { id: 'r1', text: 'Review Phase 3 apps', completed: false, listId: 'l1' },
  { id: 'r2', text: 'Ship Safari', completed: true, listId: 'l1' },
  { id: 'r3', text: 'Build additional apps', completed: false, listId: 'l1' },
  { id: 'r4', text: 'Design review at 2pm', completed: false, listId: 'l2' },
  { id: 'r5', text: 'Update documentation', completed: false, listId: 'l2' },
  { id: 'r6', text: 'Buy groceries', completed: false, listId: 'l3' },
  { id: 'r7', text: 'Call mom', completed: true, listId: 'l3' },
];

export function Reminders({ appId: _appId }: { appId: string }) {
  const [lists] = useState(SEED_LISTS);
  const [reminders, setReminders] = useState(SEED_REMINDERS);
  const [selectedList, setSelectedList] = useState('l1');
  const [newText, setNewText] = useState('');

  const filtered = reminders.filter(r => r.listId === selectedList);
  const list = lists.find(l => l.id === selectedList)!;

  const toggleComplete = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  };

  const addReminder = () => {
    if (!newText.trim()) return;
    setReminders(prev => [...prev, { id: `r-${Date.now()}`, text: newText, completed: false, listId: selectedList }]);
    setNewText('');
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex h-full w-full" data-testid="reminders-root">
      <div className="w-48 shrink-0 border-r border-black/5 dark:border-white/5 p-2 overflow-y-auto" data-testid="reminders-sidebar">
        {lists.map(l => {
          const count = reminders.filter(r => r.listId === l.id && !r.completed).length;
          return (
            <button
              key={l.id}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedList === l.id ? 'bg-[#0a84ff]/15 text-[#0a84ff]' : 'text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              onClick={() => setSelectedList(l.id)}
              data-testid={`reminders-list-${l.id}`}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              <span>{l.name}</span>
              <span className="ml-auto text-xs opacity-50">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 flex flex-col" data-testid="reminders-content">
        <div className="px-4 py-2 border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg font-semibold" style={{ color: list.color }}>{list.name}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3" data-testid="reminders-list-items">
          {filtered.map(r => (
            <div key={r.id} className="flex items-center gap-2 py-2 group" data-testid={`reminder-item-${r.id}`}>
              <button
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  r.completed ? 'bg-[#0a84ff] border-[#0a84ff]' : 'border-black/20 dark:border-white/20'
                }`}
                onClick={() => toggleComplete(r.id)}
                data-testid={`reminder-toggle-${r.id}`}
              >
                {r.completed && <span className="text-white text-xs">✓</span>}
              </button>
              <span className={`text-sm flex-1 ${r.completed ? 'text-black/30 dark:text-white/30 line-through' : 'text-black/80 dark:text-white/80'}`}>{r.text}</span>
              <button
                className="opacity-0 group-hover:opacity-100 text-red-500 text-xs"
                onClick={() => deleteReminder(r.id)}
                data-testid={`reminder-delete-${r.id}`}
              >✕</button>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-sm text-black/30 dark:text-white/30 text-center py-4">No reminders</div>}
        </div>
        <div className="flex gap-2 p-3 border-t border-black/5 dark:border-white/5">
          <input
            type="text"
            placeholder="New Reminder"
            className="flex-1 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-sm text-black/80 dark:text-white/80 outline-none"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addReminder(); }}
            data-testid="reminders-new-input"
          />
          <button className="px-3 py-1.5 rounded-lg bg-[#0a84ff] text-white text-sm" onClick={addReminder} data-testid="reminders-add">Add</button>
        </div>
      </div>
    </div>
  );
}
