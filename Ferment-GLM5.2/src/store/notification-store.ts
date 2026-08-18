import { create } from 'zustand'

export interface Notification {
  id: string
  appId: string
  title: string
  body: string
  timestamp: number
  read: boolean
}

interface NotificationStore {
  notifications: Notification[]
  pushNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string
  dismissNotification: (id: string) => void
  clearAll: () => void
  markRead: (id: string) => void
}

let notifIdCounter = 0
const nextNotifId = () => `notif-${++notifIdCounter}`

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  pushNotification: (n) => {
    const id = nextNotifId()
    const notif: Notification = {
      ...n,
      id,
      timestamp: Date.now(),
      read: false,
    }
    set((s) => ({ notifications: [notif, ...s.notifications] }))
    return id
  },
  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  clearAll: () => set({ notifications: [] }),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
}))
