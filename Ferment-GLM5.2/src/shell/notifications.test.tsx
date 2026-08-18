import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { NotificationCenter } from './notification-center'
import { useNotificationStore } from '../store/notification-store'
import { useUIStore } from '../store/ui-store'

function resetStores() {
  useNotificationStore.setState({ notifications: [] })
  useUIStore.setState({ spotlightOpen: false, controlCenterOpen: false, notificationCenterOpen: false, missionControlOpen: false })
}

describe('NotificationCenter', () => {
  beforeEach(() => {
    resetStores()
  })

  it('does not render when notificationCenterOpen is false', () => {
    render(<NotificationCenter />)
    expect(screen.queryByTestId('notif-center-panel')).toBeNull()
  })

  it('renders the glass panel when notificationCenterOpen is true', () => {
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    expect(screen.getByTestId('notif-center-panel')).toBeInTheDocument()
    expect(screen.getByTestId('notif-center-panel').className).toContain('glass-panel')
  })

  it('shows empty state when there are no notifications', () => {
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    expect(screen.getByTestId('notif-empty')).toBeInTheDocument()
  })

  it('renders notification cards for each notification', () => {
    useNotificationStore.getState().pushNotification({ appId: 'messages', title: 'New Message', body: 'Hello there!' })
    useNotificationStore.getState().pushNotification({ appId: 'mail', title: 'New Mail', body: 'You have 3 unread' })
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    expect(screen.getByText('New Message')).toBeInTheDocument()
    expect(screen.getByText('Hello there!')).toBeInTheDocument()
    expect(screen.getByText('New Mail')).toBeInTheDocument()
    expect(screen.getByText('You have 3 unread')).toBeInTheDocument()
  })

  it('dismisses a notification when the dismiss button is clicked', () => {
    const id = useNotificationStore.getState().pushNotification({ appId: 'messages', title: 'Test', body: 'Body' })
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    expect(screen.getByTestId(`notif-card-${id}`)).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId(`notif-dismiss-${id}`))
    })
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
    expect(screen.queryByTestId(`notif-card-${id}`)).toBeNull()
  })

  it('clears all notifications when Clear All is clicked', () => {
    useNotificationStore.getState().pushNotification({ appId: 'a', title: 'A', body: '1' })
    useNotificationStore.getState().pushNotification({ appId: 'b', title: 'B', body: '2' })
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    act(() => {
      fireEvent.click(screen.getByTestId('notif-clear-all'))
    })
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })

  it('closes when clicking the backdrop', () => {
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    act(() => {
      fireEvent.click(screen.getByTestId('notif-backdrop'))
    })
    expect(useUIStore.getState().notificationCenterOpen).toBe(false)
  })

  it('shows relative time for notifications', () => {
    useNotificationStore.getState().pushNotification({ appId: 'messages', title: 'Test', body: 'Body' })
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    // Should contain a relative time string (e.g. "now", "1m ago", etc.)
    const card = screen.getByTestId(/notif-card-/)
    expect(card.textContent).toMatch(/(now|m ago|h ago)/)
  })

  it('does not show Clear All button when there are no notifications', () => {
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    expect(screen.queryByTestId('notif-clear-all')).toBeNull()
  })

  it('shows Clear All button when there are notifications', () => {
    useNotificationStore.getState().pushNotification({ appId: 'a', title: 'A', body: '1' })
    useUIStore.setState({ notificationCenterOpen: true })
    render(<NotificationCenter />)
    expect(screen.getByTestId('notif-clear-all')).toBeInTheDocument()
  })
})

describe('notification-store', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [] })
  })

  it('pushes a notification and returns an id', () => {
    const id = useNotificationStore.getState().pushNotification({ appId: 'test', title: 'T', body: 'B' })
    expect(id).toBeTruthy()
    expect(useNotificationStore.getState().notifications).toHaveLength(1)
    expect(useNotificationStore.getState().notifications[0].title).toBe('T')
  })

  it('new notifications are prepended (most recent first)', () => {
    useNotificationStore.getState().pushNotification({ appId: 'a', title: 'First', body: '1' })
    useNotificationStore.getState().pushNotification({ appId: 'b', title: 'Second', body: '2' })
    const notifs = useNotificationStore.getState().notifications
    expect(notifs[0].title).toBe('Second')
    expect(notifs[1].title).toBe('First')
  })

  it('new notifications are unread', () => {
    useNotificationStore.getState().pushNotification({ appId: 'a', title: 'T', body: 'B' })
    expect(useNotificationStore.getState().notifications[0].read).toBe(false)
  })

  it('marks a notification as read', () => {
    const id = useNotificationStore.getState().pushNotification({ appId: 'a', title: 'T', body: 'B' })
    useNotificationStore.getState().markRead(id)
    expect(useNotificationStore.getState().notifications[0].read).toBe(true)
  })

  it('dismissNotification removes the notification by id', () => {
    const id = useNotificationStore.getState().pushNotification({ appId: 'a', title: 'T', body: 'B' })
    useNotificationStore.getState().dismissNotification(id)
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })

  it('clearAll empties the notification list', () => {
    useNotificationStore.getState().pushNotification({ appId: 'a', title: 'A', body: '1' })
    useNotificationStore.getState().pushNotification({ appId: 'b', title: 'B', body: '2' })
    useNotificationStore.getState().clearAll()
    expect(useNotificationStore.getState().notifications).toHaveLength(0)
  })
})
