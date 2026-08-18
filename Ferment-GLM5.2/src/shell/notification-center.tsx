import { useUIStore } from '../store/ui-store'
import { useNotificationStore, type Notification } from '../store/notification-store'
import { AppIcon } from '../primitives/app-icon'

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(ts).toLocaleDateString()
}

function NotificationCard({ notif, onDismiss }: { notif: Notification; onDismiss: (id: string) => void }) {
  return (
    <div
      data-testid={`notif-card-${notif.id}`}
      className="glass-panel"
      style={{
        borderRadius: 14,
        padding: 12,
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, overflow: 'hidden' }}>
        <AppIcon name="notification" size={32} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{notif.title}</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatRelativeTime(notif.timestamp)}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2, lineHeight: 1.4 }}>{notif.body}</p>
      </div>
      <button
        data-testid={`notif-dismiss-${notif.id}`}
        onClick={() => onDismiss(notif.id)}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(128,128,128,0.3)',
          color: 'white',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}

export function NotificationCenter() {
  const open = useUIStore((s) => s.notificationCenterOpen)
  const setOpen = useUIStore((s) => s.setNotificationCenterOpen)
  const { notifications, dismissNotification, clearAll } = useNotificationStore()

  if (!open) return null

  return (
    <>
      <div
        data-testid="notif-backdrop"
        onClick={() => setOpen(false)}
        style={{ position: 'absolute', inset: 0, zIndex: 10001 }}
      />
      <div
        data-testid="notif-center-panel"
        className="glass-panel"
        style={{
          position: 'absolute',
          top: 32,
          right: 0,
          width: 340,
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          borderRadius: 16,
          padding: 12,
          zIndex: 10002,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          transform: 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 4px' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
          {notifications.length > 0 && (
            <button
              data-testid="notif-clear-all"
              onClick={clearAll}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--accent-blue)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div data-testid="notif-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            No New Notifications
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationCard key={notif.id} notif={notif} onDismiss={dismissNotification} />
          ))
        )}
      </div>
    </>
  )
}
