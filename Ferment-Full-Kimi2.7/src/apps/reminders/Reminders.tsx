import { useState, useMemo, useCallback } from 'react'
import { Plus, Trash2, Flag } from 'lucide-react'
import type { Reminder } from './types'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const initialReminders: Reminder[] = [
  { id: generateId(), title: 'Buy groceries', completed: false, list: 'Today' },
  { id: generateId(), title: 'Call dentist', completed: true, list: 'Today' },
  { id: generateId(), title: 'Review designs', completed: false, list: 'Scheduled', flagged: true },
]

type Filter = 'Today' | 'Scheduled' | 'All' | 'Flagged'

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [filter, setFilter] = useState<Filter>('Today')
  const [input, setInput] = useState('')

  const filtered = useMemo(() => {
    switch (filter) {
      case 'Today':
        return reminders.filter((r) => r.list === 'Today')
      case 'Scheduled':
        return reminders.filter((r) => r.list === 'Scheduled')
      case 'Flagged':
        return reminders.filter((r) => r.flagged)
      case 'All':
      default:
        return reminders
    }
  }, [reminders, filter])

  const toggleComplete = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
    )
  }, [])

  const toggleFlag = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, flagged: !r.flagged } : r)),
    )
  }, [])

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addReminder = useCallback(() => {
    const title = input.trim()
    if (!title) return
    setReminders((prev) => [
      { id: generateId(), title, completed: false, list: filter === 'Flagged' ? 'Today' : filter },
      ...prev,
    ])
    setInput('')
  }, [input, filter])

  return (
    <div className="flex h-full bg-tahoe-surface text-tahoe-text overflow-hidden" data-testid="reminders-app">
      <div className="w-48 border-r border-white/10 bg-tahoe-glass/30 p-3 space-y-1" data-testid="reminders-sidebar">
        {(['Today', 'Scheduled', 'All', 'Flagged'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              filter === f ? 'bg-tahoe-accent text-white' : 'hover:bg-white/10'
            }`}
            data-testid={`reminders-filter-${f.toLowerCase()}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-lg font-semibold" data-testid="reminders-heading">{filter}</h2>
        </div>
        <div className="px-4 py-3 border-b border-white/10 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addReminder()
            }}
            placeholder="New reminder"
            className="flex-1 bg-white/5 rounded-md px-3 py-2 text-sm outline-none placeholder-white/30"
            data-testid="reminders-input"
          />
          <button
            onClick={addReminder}
            className="p-2 rounded-md bg-tahoe-accent text-white hover:brightness-110"
            aria-label="Add reminder"
            data-testid="reminders-add"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-2" data-testid="reminders-list">
          {filtered.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center gap-3 bg-white/5 rounded-md p-3 group"
              data-testid={`reminder-${reminder.id}`}
            >
              <input
                type="checkbox"
                checked={reminder.completed}
                onChange={() => toggleComplete(reminder.id)}
                className="w-4 h-4 accent-tahoe-accent cursor-pointer"
                data-testid={`reminder-check-${reminder.id}`}
              />
              <span className={`flex-1 text-sm ${reminder.completed ? 'line-through opacity-50' : ''}`}>
                {reminder.title}
              </span>
              <button
                onClick={() => toggleFlag(reminder.id)}
                className={`p-1 rounded-md hover:bg-white/10 ${reminder.flagged ? 'text-orange-400' : 'text-tahoe-text-secondary'}`}
                aria-label="Flag reminder"
                data-testid={`reminder-flag-${reminder.id}`}
              >
                <Flag className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteReminder(reminder.id)}
                className="p-1 rounded-md hover:bg-red-500/20 text-tahoe-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete reminder"
                data-testid={`reminder-delete-${reminder.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-tahoe-text-secondary" data-testid="reminders-empty">No reminders</p>
          )}
        </div>
      </div>
    </div>
  )
}
