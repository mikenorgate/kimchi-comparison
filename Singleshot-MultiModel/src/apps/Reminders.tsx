import { useMemo, useState } from 'react';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface ReminderList {
  id: string;
  name: string;
  tasks: Task[];
}

const INITIAL_LISTS: ReminderList[] = [
  {
    id: 'l-today',
    name: 'Today',
    tasks: [
      { id: 't1', text: 'Review pull request', done: false },
      { id: 't2', text: 'Call mom', done: true },
      { id: 't3', text: 'Pick up groceries', done: false },
    ],
  },
  {
    id: 'l-personal',
    name: 'Personal',
    tasks: [
      { id: 't4', text: 'Read 30 pages', done: false },
      { id: 't5', text: 'Yoga at 7pm', done: false },
    ],
  },
  {
    id: 'l-work',
    name: 'Work',
    tasks: [
      { id: 't6', text: 'Write design doc', done: false },
      { id: 't7', text: 'Schedule 1:1 with manager', done: true },
      { id: 't8', text: 'Investigate flaky test', done: false },
      { id: 't9', text: 'Plan team offsite', done: false },
    ],
  },
  {
    id: 'l-errands',
    name: 'Errands',
    tasks: [
      { id: 't10', text: 'Return library books', done: false },
      { id: 't11', text: 'Get bike tuned', done: false },
    ],
  },
];

export function Reminders(): JSX.Element {
  const [lists, setLists] = useState<ReminderList[]>(INITIAL_LISTS);
  const [activeListId, setActiveListId] = useState<string>(INITIAL_LISTS[0]!.id);
  const [newListName, setNewListName] = useState('');
  const [newTask, setNewTask] = useState('');

  const activeList = useMemo(
    () => lists.find((l) => l.id === activeListId) ?? lists[0]!,
    [lists, activeListId],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const list of lists) {
      map.set(list.id, list.tasks.filter((t) => !t.done).length);
    }
    return map;
  }, [lists]);

  const addList = (): void => {
    const name = newListName.trim();
    if (!name) return;
    const id = `l-${Date.now()}`;
    setLists((prev) => [...prev, { id, name, tasks: [] }]);
    setActiveListId(id);
    setNewListName('');
  };

  const deleteList = (): void => {
    if (lists.length <= 1) return;
    setLists((prev) => prev.filter((l) => l.id !== activeListId));
    const remaining = lists.filter((l) => l.id !== activeListId);
    if (remaining[0]) setActiveListId(remaining[0].id);
  };

  const addTask = (): void => {
    const text = newTask.trim();
    if (!text) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id === activeListId
          ? { ...l, tasks: [...l.tasks, { id: `t-${Date.now()}`, text, done: false }] }
          : l,
      ),
    );
    setNewTask('');
  };

  const toggleTask = (taskId: string): void => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === activeListId
          ? {
              ...l,
              tasks: l.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
            }
          : l,
      ),
    );
  };

  const deleteTask = (taskId: string): void => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === activeListId ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) } : l,
      ),
    );
  };

  return (
    <div className="reminders-root">
      <div className="reminders-sidebar">
        <div className="reminders-sidebar__header">My Lists</div>
        <div className="reminders-sidebar__list">
          {lists.map((list) => {
            const count = counts.get(list.id) ?? 0;
            return (
              <button
                type="button"
                key={list.id}
                className={`reminders-sidebar__item${list.id === activeListId ? ' reminders-sidebar__item--selected' : ''}`}
                onClick={() => setActiveListId(list.id)}
              >
                <span aria-hidden="true">{count > 0 ? '●' : '○'}</span>
                <span style={{ flex: 1 }}>{list.name}</span>
                <span className="reminders-sidebar__count">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="reminders-sidebar__add">
          <input
            type="text"
            className="app-input"
            placeholder="New list…"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addList();
            }}
          />
          <button type="button" className="app-btn" onClick={addList} aria-label="Add list">
            +
          </button>
        </div>
      </div>

      <div className="reminders-main">
        <div className="reminders-main__header">
          <div className="reminders-main__title">{activeList.name}</div>
          {lists.length > 1 && (
            <button type="button" className="app-btn" onClick={deleteList}>
              Delete List
            </button>
          )}
        </div>
        <div className="reminders-main__add">
          <input
            type="text"
            className="app-input"
            placeholder={`Add a task to ${activeList.name}…`}
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask();
            }}
          />
          <button type="button" className="app-btn app-btn--primary" onClick={addTask}>
            Add
          </button>
        </div>
        <div className="reminders-task-list">
          {activeList.tasks.length === 0 ? (
            <div className="reminders-empty">
              <div style={{ fontSize: 32 }}>✅</div>
              <div>No tasks yet. Add one above.</div>
            </div>
          ) : (
            activeList.tasks.map((task) => (
              <div className="reminders-task" key={task.id}>
                <button
                  type="button"
                  className={`reminders-task__checkbox${task.done ? ' reminders-task__checkbox--done' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.done ? 'Mark task incomplete' : 'Mark task complete'}
                >
                  {task.done ? '✓' : ''}
                </button>
                <span className={`reminders-task__text${task.done ? ' reminders-task__text--done' : ''}`}>
                  {task.text}
                </span>
                <button
                  type="button"
                  className="reminders-task__delete"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.text}`}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Reminders;
