import { create } from 'zustand'

export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  notes: string
  color: string
}

const EVENTS_KEY = 'tahoe.calendar-events'

function loadEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const s = localStorage.getItem(EVENTS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function persistEvents(events: CalendarEvent[]) {
  try { localStorage.setItem(EVENTS_KEY, JSON.stringify(events)) } catch { /* ignore */ }
}

let evCounter = 0
const genEvId = () => `evt-${Date.now()}-${++evCounter}`

interface CalendarStore {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => string
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => void
  deleteEvent: (id: string) => void
  getEventsByDate: (date: string) => CalendarEvent[]
  reset: () => void
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: loadEvents(),
  addEvent: (event) => {
    const id = genEvId()
    const events = [...get().events, { ...event, id }]
    persistEvents(events)
    set({ events })
    return id
  },
  updateEvent: (id, updates) => {
    const events = get().events.map((e) => (e.id === id ? { ...e, ...updates } : e))
    persistEvents(events)
    set({ events })
  },
  deleteEvent: (id) => {
    const events = get().events.filter((e) => e.id !== id)
    persistEvents(events)
    set({ events })
  },
  getEventsByDate: (date) => get().events.filter((e) => e.date === date),
  reset: () => {
    persistEvents([])
    set({ events: [] })
  },
}))
