import { useMemo, useState } from 'react'
import { Check, ListTodo, Plus, Trash2 } from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/**
 * Reminders — lists + tasks, add/complete/delete, persisted.
 *
 * A flat array of lists, each with an ordered array of tasks. Tasks can be
 * completed (checkbox toggle, struck through) and deleted. Lists can be
 * added and deleted. All state persists to localStorage ('tahoe.reminders').
 */

export interface Task {
  id: string
  title: string
  done: boolean
}

export interface ReminderList {
  id: string
  name: string
  tasks: Task[]
}

const STORAGE_KEY = 'tahoe.reminders'

function uid(): string {
  return 'r' + Math.random().toString(36).slice(2, 10)
}

const SEED: ReminderList[] = [
  {
    id: 'seed-list',
    name: 'Reminders',
    tasks: [
      { id: 'seed-t1', title: 'Explore macOS Tahoe', done: false },
      { id: 'seed-t2', title: 'Try the new Dock', done: true },
    ],
  },
]

export function Reminders() {
  const [lists, setLists] = usePersistentState<ReminderList[]>(STORAGE_KEY, SEED)
  const [selectedId, setSelectedId] = useState<string | null>(lists[0]?.id ?? null)
  const [newTask, setNewTask] = useState('')
  const [newList, setNewList] = useState('')

  const selected = useMemo(
    () => lists.find((l) => l.id === selectedId) ?? null,
    [lists, selectedId],
  )

  const addTask = () => {
    const title = newTask.trim()
    if (!title || !selectedId) return
    const task: Task = { id: uid(), title, done: false }
    setLists((prev) =>
      prev.map((l) =>
        l.id === selectedId ? { ...l, tasks: [...l.tasks, task] } : l,
      ),
    )
    setNewTask('')
  }

  const toggleTask = (taskId: string) => {
    if (!selectedId) return
    setLists((prev) =>
      prev.map((l) =>
        l.id === selectedId
          ? {
              ...l,
              tasks: l.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t,
              ),
            }
          : l,
      ),
    )
  }

  const deleteTask = (taskId: string) => {
    if (!selectedId) return
    setLists((prev) =>
      prev.map((l) =>
        l.id === selectedId
          ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) }
          : l,
      ),
    )
  }

  const addList = () => {
    const name = newList.trim()
    if (!name) return
    const list: ReminderList = { id: uid(), name, tasks: [] }
    setLists((prev) => [...prev, list])
    setSelectedId(list.id)
    setNewList('')
  }

  const deleteList = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id))
    if (selectedId === id) {
      const remaining = lists.filter((l) => l.id !== id)
      setSelectedId(remaining[0]?.id ?? null)
    }
  }

  const remainingCount = (l: ReminderList) =>
    l.tasks.filter((t) => !t.done).length

  return (
    <div data-testid="reminders-content" className="flex h-full text-[13px]">
      {/* Lists sidebar */}
      <aside className="w-48 border-r border-black/10 bg-black/[0.04] p-2">
        <div className="mb-2 flex items-center gap-1">
          <input
            data-testid="reminders-new-list-input"
            value={newList}
            onChange={(e) => setNewList(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addList() }}
            placeholder="New list…"
            className="w-full rounded-md border border-black/10 px-2 py-1 outline-none focus:border-[var(--accent)]"
          />
          <button
            data-testid="reminders-add-list"
            onClick={addList}
            className="rounded-md p-1.5 hover:bg-black/10"
            aria-label="Add list"
          >
            <Plus size={15} />
          </button>
        </div>
        <div data-testid="reminders-lists">
          {lists.map((l) => {
            const active = l.id === selectedId
            return (
              <div
                key={l.id}
                data-testid="reminders-list"
                data-list-id={l.id}
                onClick={() => setSelectedId(l.id)}
                className={`group flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 ${
                  active ? 'bg-[var(--accent)]/15' : 'hover:bg-black/5'
                }`}
              >
                <span
                  data-testid="reminders-list-name"
                  className={`flex items-center gap-2 truncate ${
                    active ? 'text-[var(--accent)]' : 'text-black/80'
                  }`}
                >
                  <ListTodo size={14} />
                  <span className="truncate">{l.name}</span>
                </span>
                <span className="flex items-center gap-1">
                  {remainingCount(l) > 0 && (
                    <span className="text-[10px] text-black/40">
                      {remainingCount(l)}
                    </span>
                  )}
                  <button
                    data-testid="reminders-delete-list"
                    onClick={(e) => { e.stopPropagation(); deleteList(l.id) }}
                    className="opacity-0 group-hover:opacity-100"
                    aria-label="Delete list"
                  >
                    <Trash2 size={12} />
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      </aside>

      {/* Task list */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="border-b border-black/10 px-4 py-2">
              <h2 data-testid="reminders-list-title" className="text-base font-semibold">
                {selected.name}
              </h2>
            </div>
            <div
              data-testid="reminders-tasks"
              className="flex-1 overflow-auto"
            >
              {selected.tasks.length === 0 ? (
                <div className="p-4 text-black/30">No tasks.</div>
              ) : (
                selected.tasks.map((t) => (
                  <div
                    key={t.id}
                    data-testid="reminders-task"
                    data-task-id={t.id}
                    className="group flex items-center gap-2 border-b border-black/[0.04] px-4 py-2"
                  >
                    <button
                      data-testid="reminders-task-check"
                      onClick={() => toggleTask(t.id)}
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        t.done
                          ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                          : 'border-black/30'
                      }`}
                      aria-label={t.done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {t.done && <Check size={10} strokeWidth={3} />}
                    </button>
                    <span
                      data-testid="reminders-task-title"
                      className={`flex-1 ${t.done ? 'text-black/40 line-through' : 'text-black/80'}`}
                    >
                      {t.title}
                    </span>
                    <button
                      data-testid="reminders-task-delete"
                      onClick={() => deleteTask(t.id)}
                      className="opacity-0 group-hover:opacity-100"
                      aria-label="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2 border-t border-black/10 p-2">
              <Plus size={15} className="text-black/40" />
              <input
                data-testid="reminders-new-task"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addTask() }}
                placeholder="New reminder"
                className="flex-1 rounded-md border border-black/10 px-2 py-1 outline-none focus:border-[var(--accent)]"
              />
            </div>
          </>
        ) : (
          <div
            data-testid="reminders-empty"
            className="grid h-full place-items-center text-black/40"
          >
            Select a list.
          </div>
        )}
      </div>
    </div>
  )
}

export default Reminders
