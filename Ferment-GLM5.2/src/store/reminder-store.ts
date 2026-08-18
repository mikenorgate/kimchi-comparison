import { create } from 'zustand'

export interface Reminder {
  id: string
  listId: string
  title: string
  completed: boolean
  dueDate: string | null // ISO date string YYYY-MM-DD or null
  notes: string
  createdAt: number
  order: number
}

export interface ReminderList {
  id: string
  name: string
  color: string
}

const REMINDERS_KEY = 'tahoe.reminders'
const LISTS_KEY = 'tahoe.reminder-lists'

function defaultLists(): ReminderList[] {
  return [
    { id: 'today', name: 'Today', color: '#0a84ff' },
    { id: 'scheduled', name: 'Scheduled', color: '#ff453a' },
    { id: 'all', name: 'All', color: '#ffd60a' },
    { id: 'personal', name: 'Personal', color: '#bf5af2' },
    { id: 'work', name: 'Work', color: '#30d158' },
  ]
}

function loadLists(): ReminderList[] {
  if (typeof window === 'undefined') return defaultLists()
  try {
    const s = localStorage.getItem(LISTS_KEY)
    return s ? JSON.parse(s) : defaultLists()
  } catch { return defaultLists() }
}

function loadReminders(): Reminder[] {
  if (typeof window === 'undefined') return []
  try {
    const s = localStorage.getItem(REMINDERS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function persistReminders(r: Reminder[]) {
  try { localStorage.setItem(REMINDERS_KEY, JSON.stringify(r)) } catch { /* ignore */ }
}

function persistLists(l: ReminderList[]) {
  try { localStorage.setItem(LISTS_KEY, JSON.stringify(l)) } catch { /* ignore */ }
}

let remCounter = 0
const genRemId = () => `rem-${Date.now()}-${++remCounter}`

interface ReminderStore {
  reminders: Reminder[]
  lists: ReminderList[]
  addReminder: (listId: string, title: string, dueDate?: string | null) => string
  toggleComplete: (id: string) => void
  deleteReminder: (id: string) => void
  updateReminder: (id: string, updates: Partial<Pick<Reminder, 'title' | 'dueDate' | 'notes' | 'listId'>>) => void
  getRemindersByList: (listId: string) => Reminder[]
  reset: () => void
}

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: loadReminders(),
  lists: loadLists(),
  addReminder: (listId, title, dueDate = null) => {
    const id = genRemId()
    const now = Date.now()
    const maxOrder = Math.max(0, ...get().reminders.map((r) => r.order))
    const reminder: Reminder = {
      id, listId, title: title || 'New Reminder', completed: false,
      dueDate, notes: '', createdAt: now, order: maxOrder + 1,
    }
    const reminders = [...get().reminders, reminder]
    persistReminders(reminders)
    set({ reminders })
    return id
  },
  toggleComplete: (id) => {
    const reminders = get().reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    )
    persistReminders(reminders)
    set({ reminders })
  },
  deleteReminder: (id) => {
    const reminders = get().reminders.filter((r) => r.id !== id)
    persistReminders(reminders)
    set({ reminders })
  },
  updateReminder: (id, updates) => {
    const reminders = get().reminders.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    )
    persistReminders(reminders)
    set({ reminders })
  },
  getRemindersByList: (listId) => {
    if (listId === 'all') return get().reminders
    if (listId === 'today') {
      const today = new Date().toISOString().slice(0, 10)
      return get().reminders.filter((r) => r.dueDate === today)
    }
    if (listId === 'scheduled') {
      return get().reminders.filter((r) => r.dueDate !== null)
    }
    return get().reminders.filter((r) => r.listId === listId)
  },
  reset: () => {
    const l = defaultLists()
    persistLists(l)
    persistReminders([])
    set({ reminders: [], lists: l })
  },
}))
