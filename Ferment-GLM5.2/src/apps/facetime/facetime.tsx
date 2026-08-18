import { useState, useEffect, useRef, useCallback } from 'react'

export interface FTContact {
  id: string
  name: string
  email: string
  avatar: string
  color: string
}

export interface CallRecord {
  id: string
  contactId: string
  contactName: string
  type: 'outgoing' | 'incoming' | 'missed'
  duration: number // seconds
  timestamp: string
}

const HISTORY_KEY = 'tahoe.facetime-history'

const DEFAULT_CONTACTS: FTContact[] = [
  { id: 'ft1', name: 'Sarah Chen', email: 'sarah@icloud.com', avatar: 'S', color: '#ff6b6b' },
  { id: 'ft2', name: 'Mike Rodriguez', email: 'mike@icloud.com', avatar: 'M', color: '#4ecdc4' },
  { id: 'ft3', name: 'Mom', email: 'mom@icloud.com', avatar: 'M', color: '#ffd93d' },
  { id: 'ft4', name: 'Dad', email: 'dad@icloud.com', avatar: 'D', color: '#6bcf7f' },
  { id: 'ft5', name: 'Emma Wilson', email: 'emma@icloud.com', avatar: 'E', color: '#a78bfa' },
  { id: 'ft6', name: 'Alex Kim', email: 'alex@icloud.com', avatar: 'A', color: '#f9a826' },
]

const DEFAULT_HISTORY: CallRecord[] = [
  { id: 'ch1', contactId: 'ft1', contactName: 'Sarah Chen', type: 'outgoing', duration: 324, timestamp: '2026-08-16T14:30:00' },
  { id: 'ch2', contactId: 'ft3', contactName: 'Mom', type: 'incoming', duration: 612, timestamp: '2026-08-15T19:00:00' },
  { id: 'ch3', contactId: 'ft5', contactName: 'Emma Wilson', type: 'missed', duration: 0, timestamp: '2026-08-15T10:15:00' },
]

function loadHistory(): CallRecord[] {
  try {
    const s = localStorage.getItem(HISTORY_KEY)
    return s ? JSON.parse(s) : DEFAULT_HISTORY
  } catch { return DEFAULT_HISTORY }
}

function persistHistory(history: CallRecord[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)) } catch { /* ignore */ }
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function FaceTime({ windowId: _windowId }: { windowId: string }) {
  const [contacts] = useState<FTContact[]>(DEFAULT_CONTACTS)
  const [history, setHistory] = useState<CallRecord[]>(loadHistory)
  const [activeCall, setActiveCall] = useState<FTContact | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [view, setView] = useState<'contacts' | 'history'>('contacts')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)
  durationRef.current = callDuration

  useEffect(() => {
    persistHistory(history)
  }, [history])

  // Simulate call timer
  useEffect(() => {
    if (!activeCall) return
    intervalRef.current = setInterval(() => {
      setCallDuration((prev) => {
        const next = prev + 1
        durationRef.current = next
        return next
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeCall])

  const startCall = useCallback((contact: FTContact) => {
    setActiveCall(contact)
    setCallDuration(0)
    durationRef.current = 0
    setMuted(false)
    setCameraOff(false)
  }, [])

  const endCall = useCallback(() => {
    if (activeCall) {
      const record: CallRecord = {
        id: `ch-${Date.now()}`,
        contactId: activeCall.id,
        contactName: activeCall.name,
        type: 'outgoing',
        duration: durationRef.current,
        timestamp: new Date().toISOString(),
      }
      setHistory((prev) => [record, ...prev])
    }
    setActiveCall(null)
    setCallDuration(0)
    setMuted(false)
    setCameraOff(false)
  }, [activeCall])

  const toggleMute = useCallback(() => setMuted((m) => !m), [])
  const toggleCamera = useCallback(() => setCameraOff((c) => !c), [])

  return (
    <div data-testid="facetime-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {activeCall ? (
        /* Call view */
        <div data-testid="call-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.9)', position: 'relative' }}>
          {/* Remote video placeholder */}
          <div data-testid="remote-video" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: activeCall.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 700, color: 'white' }}>
              {activeCall.avatar}
            </div>
            <div data-testid="call-name" style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>{activeCall.name}</div>
            <div data-testid="call-timer" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'SF Mono, monospace' }}>
              {cameraOff ? 'Camera Off' : formatDuration(callDuration)}
            </div>
          </div>

          {/* Local camera preview (PiP) */}
          <div
            data-testid="local-preview"
            style={{
              position: 'absolute',
              bottom: 80,
              right: 16,
              width: 120,
              height: 90,
              borderRadius: 8,
              background: cameraOff ? 'rgba(40,40,40,0.8)' : 'rgba(60,60,80,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {cameraOff ? (
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Camera Off</span>
            ) : (
              <span data-testid="local-camera-active" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>📹 Live</span>
            )}
          </div>

          {/* Controls */}
          <div data-testid="call-controls" style={{ padding: 16, display: 'flex', justifyContent: 'center', gap: 16, flexShrink: 0 }}>
            <button
              data-testid="btn-mute"
              onClick={toggleMute}
              style={callBtn(muted ? '#ff453a' : 'rgba(255,255,255,0.2)')}
            >
              {muted ? '🔇' : '🎤'}
            </button>
            <button
              data-testid="btn-camera"
              onClick={toggleCamera}
              style={callBtn(cameraOff ? '#ff453a' : 'rgba(255,255,255,0.2)')}
            >
              {cameraOff ? '📹‍🚫' : '📹'}
            </button>
            <button
              data-testid="btn-end"
              onClick={endCall}
              style={callBtn('#ff453a')}
            >
              📵
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
            <button data-testid="tab-contacts" onClick={() => setView('contacts')} style={tabBtn(view === 'contacts')}>Contacts</button>
            <button data-testid="tab-history" onClick={() => setView('history')} style={tabBtn(view === 'history')}>History</button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {view === 'contacts' ? (
              <div data-testid="contacts-list" style={{ padding: 8 }}>
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    data-testid={`contact-${contact.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 12px',
                      borderRadius: 8,
                      borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: contact.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: 'white' }}>
                      {contact.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{contact.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{contact.email}</div>
                    </div>
                    <button
                      data-testid={`call-${contact.id}`}
                      onClick={() => startCall(contact)}
                      style={{ border: 'none', background: 'var(--accent-blue)', color: 'white', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 14 }}
                    >
                      📹
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div data-testid="history-list" style={{ padding: 8 }}>
                {history.length === 0 ? (
                  <div data-testid="history-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    No call history
                  </div>
                ) : (
                  history.map((record) => (
                    <div
                      key={record.id}
                      data-testid={`call-record-${record.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '8px 12px',
                        borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div style={{ fontSize: 16 }}>
                        {record.type === 'outgoing' ? '↗️' : record.type === 'incoming' ? '↘️' : '✗'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: record.type === 'missed' ? '#ff453a' : 'var(--text-primary)' }}>{record.contactName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {formatTime(record.timestamp)} {record.duration > 0 && `· ${formatDuration(record.duration)}`}
                        </div>
                      </div>
                      <button
                        data-testid={`callback-${record.id}`}
                        onClick={() => {
                          const contact = contacts.find((c) => c.id === record.contactId)
                          if (contact) startCall(contact)
                        }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 18 }}
                      >
                        📹
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const callBtn = (bg: string): React.CSSProperties => ({
  border: 'none',
  borderRadius: '50%',
  width: 48,
  height: 48,
  background: bg,
  color: 'white',
  cursor: 'pointer',
  fontSize: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const tabBtn = (active: boolean): React.CSSProperties => ({
  border: 'none',
  background: active ? 'var(--accent-blue)' : 'transparent',
  color: active ? 'white' : 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 12,
  padding: '4px 12px',
  borderRadius: 6,
  fontWeight: active ? 600 : 400,
})
