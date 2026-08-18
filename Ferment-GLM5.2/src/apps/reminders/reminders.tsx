import { useState, useMemo, useCallback } from 'react'
import { useReminderStore, type Reminder } from '../../store/reminder-store'

function formatDate(dueDate: string): string {
  const d = new Date(dueDate + 'T00:00:00')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function isOverdue(dueDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dueDate < today
}

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const { toggleComplete, deleteReminder, updateReminder } = useReminderStore()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(reminder.title)
  const [showDetails, setShowDetails] = useState(false)

  const overdue = reminder.dueDate && !reminder.completed && isOverdue(reminder.dueDate)

  return (
    <div
      data-testid={`reminder-row-${reminder.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 12px',
        borderBottom: '0.5px solid var(--glass-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          data-testid={`reminder-check-${reminder.id}`}
          onClick={() => toggleComplete(reminder.id)}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: reminder.completed ? 'none' : '1.5px solid var(--accent-blue)',
            background: reminder.completed ? 'var(--accent-blue)' : 'transparent',
            cursor: 'pointer',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 14,
            lineHeight: 1,
            padding: 0,
          }}
        >
          {reminder.completed && '✓'}
        </button>
        {editing ? (
          <input
            data-testid={`reminder-edit-${reminder.id}`}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => { updateReminder(reminder.id, { title: editValue }); setEditing(false) }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { updateReminder(reminder.id, { title: editValue }); setEditing(false) }
              if (e.key === 'Escape') setEditing(false)
            }}
            autoFocus
            style={{ flex: 1, fontSize: 14, border: '1px solid var(--accent-blue)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-primary)', background: 'var(--glass-bg)' }}
          />
        ) : (
          <span
            data-testid={`reminder-title-${reminder.id}`}
            onDoubleClick={() => { setEditValue(reminder.title); setEditing(true) }}
            style={{
              flex: 1,
              fontSize: 14,
              color: reminder.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: reminder.completed ? 'line-through' : 'none',
            }}
          >
            {reminder.title}
          </span>
        )}
        {reminder.dueDate && (
          <span
            data-testid={`reminder-due-${reminder.id}`}
            style={{ fontSize: 12, color: overdue ? '#ff453a' : 'var(--text-secondary)', flexShrink: 0 }}
          >
            {formatDate(reminder.dueDate)}
          </span>
        )}
        <button
          data-testid={`reminder-delete-${reminder.id}`}
          onClick={() => deleteReminder(reminder.id)}
          style={{ border: 'none', background: 'transparent', color: '#ff5f57', cursor: 'pointer', fontSize: 16, padding: 0, flexShrink: 0 }}
        >
          ✕
        </button>
        <button
          data-testid={`reminder-details-${reminder.id}`}
          onClick={() => setShowDetails(!showDetails)}
          style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, padding: 0, flexShrink: 0 }}
        >
          ⓘ
        </button>
      </div>
      {showDetails && (
        <div data-testid={`reminder-detail-panel-${reminder.id}`} style={{ marginLeft: 32, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Due Date:
            <input
              data-testid={`reminder-date-${reminder.id}`}
              type="date"
              value={reminder.dueDate ?? ''}
              onChange={(e) => updateReminder(reminder.id, { dueDate: e.target.value || null })}
              style={{ marginLeft: 8, padding: '2px 4px', border: '0.5px solid var(--glass-border)', borderRadius: 4, color: 'var(--text-primary)', background: 'var(--glass-bg)' }}
            />
          </label>
          <textarea
            data-testid={`reminder-notes-${reminder.id}`}
            placeholder="Notes"
            value={reminder.notes}
            onChange={(e) => updateReminder(reminder.id, { notes: e.target.value })}
            style={{ padding: '4px', border: '0.5px solid var(--glass-border)', borderRadius: 4, color: 'var(--text-primary)', background: 'var(--glass-bg)', fontSize: 13, minHeight: 40, resize: 'vertical' }}
          />
        </div>
      )}
    </div>
  )
}

export function Reminders({ windowId: _windowId }: { windowId: string }) {
  const { lists, reminders, addReminder } = useReminderStore()
  const [selectedListId, setSelectedListId] = useState('today')
  const [newTitle, setNewTitle] = useState('')

  const visibleReminders = useMemo(() => {
    const store = useReminderStore.getState()
    const list = store.getRemindersByList(selectedListId)
    // Sort: incomplete first, then by order
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return a.order - b.order
    })
  }, [reminders, selectedListId])

  const handleAdd = useCallback(() => {
    if (newTitle.trim()) {
      const listId = selectedListId === 'today' || selectedListId === 'scheduled' || selectedListId === 'all'
        ? 'personal'
        : selectedListId
      addReminder(listId, newTitle.trim(), selectedListId === 'today' ? new Date().toISOString().slice(0, 10) : null)
      setNewTitle('')
    }
  }, [newTitle, selectedListId, addReminder])

  const selectedList = lists.find((l) => l.id === selectedListId)

  return (
    <div data-testid="reminders-root" style={{ display: 'flex', height: '100%', width: '100%' }}>
      {/* Sidebar — lists */}
      <div
        data-testid="reminders-sidebar"
        style={{
          width: 200,
          borderRight: '0.5px solid var(--glass-border)',
          background: 'rgba(128,128,128,0.06)',
          overflowY: 'auto',
          flexShrink: 0,
          padding: '8px 0',
        }}
      >
        {lists.map((list) => {
          const count = useReminderStore.getState().getRemindersByList(list.id).filter((r) => !r.completed).length
          return (
            <button
              key={list.id}
              data-testid={`reminders-list-${list.id}`}
              onClick={() => setSelectedListId(list.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: selectedListId === list.id ? 'var(--accent-blue)' : 'transparent',
                color: selectedListId === list.id ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: list.color, flexShrink: 0 }} />
              {list.name}
              <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.6 }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div data-testid="reminders-header" style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--glass-border)' }}>
          <h2 data-testid="reminders-list-title" style={{ fontSize: 22, fontWeight: 700, color: selectedList?.color ?? 'var(--text-primary)', margin: 0 }}>
            {selectedList?.name ?? 'Reminders'}
          </h2>
        </div>
        <div data-testid="reminders-list" style={{ flex: 1, overflowY: 'auto' }}>
          {visibleReminders.length === 0 ? (
            <div data-testid="reminders-empty" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
              No Reminders
            </div>
          ) : (
            visibleReminders.map((r) => <ReminderRow key={r.id} reminder={r} />)
          )}
        </div>
        {/* Add reminder input */}
        <div style={{ padding: '8px 12px', borderTop: '0.5px solid var(--glass-border)', display: 'flex', gap: 8 }}>
          <input
            data-testid="reminders-new-input"
            type="text"
            placeholder="New Reminder"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            style={{ flex: 1, padding: '4px 8px', border: '0.5px solid var(--glass-border)', borderRadius: 6, color: 'var(--text-primary)', background: 'var(--glass-bg)', fontSize: 14, outline: 'none' }}
          />
          <button
            data-testid="reminders-add-btn"
            onClick={handleAdd}
            style={{ padding: '4px 12px', border: 'none', borderRadius: 6, background: 'var(--accent-blue)', color: 'white', cursor: 'pointer', fontSize: 13 }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
