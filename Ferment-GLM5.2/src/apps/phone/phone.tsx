import { useState, useEffect, useRef, useCallback } from 'react'

export interface PhoneContact {
  id: string
  name: string
  number: string
  avatar: string
  color: string
}

export interface RecentCall {
  id: string
  contactId: string
  name: string
  number: string
  type: 'outgoing' | 'incoming' | 'missed'
  duration: number
  timestamp: string
}

export interface Voicemail {
  id: string
  contactId: string
  name: string
  number: string
  duration: number
  timestamp: string
  transcript: string
  played: boolean
}

const RECENTS_KEY = 'tahoe.phone-recents'
const VOICEMAILS_KEY = 'tahoe.phone-voicemails'

const DEFAULT_CONTACTS: PhoneContact[] = [
  { id: 'pc1', name: 'Sarah Chen', number: '555-0101', avatar: 'S', color: '#ff6b6b' },
  { id: 'pc2', name: 'Mike Rodriguez', number: '555-0102', avatar: 'M', color: '#4ecdc4' },
  { id: 'pc3', name: 'Mom', number: '555-0103', avatar: 'M', color: '#ffd93d' },
  { id: 'pc4', name: 'Dad', number: '555-0104', avatar: 'D', color: '#6bcf7f' },
  { id: 'pc5', name: 'Emma Wilson', number: '555-0105', avatar: 'E', color: '#a78bfa' },
  { id: 'pc6', name: 'Alex Kim', number: '555-0106', avatar: 'A', color: '#f9a826' },
]

const DEFAULT_RECENTS: RecentCall[] = [
  { id: 'rc1', contactId: 'pc1', name: 'Sarah Chen', number: '555-0101', type: 'outgoing', duration: 324, timestamp: '2026-08-17T09:30:00' },
  { id: 'rc2', contactId: 'pc3', name: 'Mom', number: '555-0103', type: 'incoming', duration: 612, timestamp: '2026-08-16T19:00:00' },
  { id: 'rc3', contactId: 'pc5', name: 'Emma Wilson', number: '555-0105', type: 'missed', duration: 0, timestamp: '2026-08-16T10:15:00' },
  { id: 'rc4', contactId: 'pc2', name: 'Mike Rodriguez', number: '555-0102', type: 'outgoing', duration: 45, timestamp: '2026-08-15T16:00:00' },
]

const DEFAULT_VOICEMAILS: Voicemail[] = [
  { id: 'vm1', contactId: 'pc3', name: 'Mom', number: '555-0103', duration: 15, timestamp: '2026-08-16T19:05:00', transcript: 'Hi sweetie, just wanted to check in. Call me back when you can!', played: false },
  { id: 'vm2', contactId: 'pc5', name: 'Emma Wilson', number: '555-0105', duration: 8, timestamp: '2026-08-16T10:16:00', transcript: 'Hey, I was calling about the project. Talk later.', played: false },
]

function loadRecents(): RecentCall[] {
  try { const s = localStorage.getItem(RECENTS_KEY); return s ? JSON.parse(s) : DEFAULT_RECENTS } catch { return DEFAULT_RECENTS }
}
function persistRecents(r: RecentCall[]) { try { localStorage.setItem(RECENTS_KEY, JSON.stringify(r)) } catch {} }
function loadVoicemails(): Voicemail[] {
  try { const s = localStorage.getItem(VOICEMAILS_KEY); return s ? JSON.parse(s) : DEFAULT_VOICEMAILS } catch { return DEFAULT_VOICEMAILS }
}
function persistVoicemails(v: Voicemail[]) { try { localStorage.setItem(VOICEMAILS_KEY, JSON.stringify(v)) } catch {} }

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60); const s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`
}
function formatTime(ts: string): string {
  const d = new Date(ts); const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

type Tab = 'recents' | 'contacts' | 'voicemail' | 'keypad'

export function Phone({ windowId: _windowId }: { windowId: string }) {
  const [contacts] = useState<PhoneContact[]>(DEFAULT_CONTACTS)
  const [recents, setRecents] = useState<RecentCall[]>(loadRecents)
  const [voicemails, setVoicemails] = useState<Voicemail[]>(loadVoicemails)
  const [tab, setTab] = useState<Tab>('recents')
  const [callName, setCallName] = useState<string | null>(null)
  const [callNumber, setCallNumber] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  const [keypadInput, setKeypadInput] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)
  durationRef.current = callDuration

  useEffect(() => { persistRecents(recents) }, [recents])
  useEffect(() => { persistVoicemails(voicemails) }, [voicemails])

  useEffect(() => {
    if (!callName) return
    intervalRef.current = setInterval(() => {
      setCallDuration((prev) => { const n = prev + 1; durationRef.current = n; return n })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [callName])

  const placeCall = useCallback((name: string, number: string) => {
    setCallName(name); setCallNumber(number); setCallDuration(0); durationRef.current = 0
  }, [])

  const endCall = useCallback(() => {
    if (callName) {
      const record: RecentCall = {
        id: `rc-${Date.now()}`, contactId: '', name: callName, number: callNumber,
        type: 'outgoing', duration: durationRef.current, timestamp: new Date().toISOString(),
      }
      setRecents((prev) => [record, ...prev])
    }
    setCallName(null); setCallDuration(0)
  }, [callName, callNumber])

  const keypadCall = useCallback(() => {
    if (!keypadInput) return
    placeCall(keypadInput, keypadInput)
    setKeypadInput('')
  }, [keypadInput, placeCall])

  const playVoicemail = useCallback((id: string) => {
    setVoicemails((prev) => prev.map((v) => v.id === id ? { ...v, played: true } : v))
  }, [])

  const deleteVoicemail = useCallback((id: string) => {
    setVoicemails((prev) => prev.filter((v) => v.id !== id))
  }, [])

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

  if (callName) {
    return (
      <div data-testid="phone-call" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', height: '100%', gap: 16 }}>
        <div data-testid="call-name" style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>{callName}</div>
        <div data-testid="call-number" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{callNumber}</div>
        <div data-testid="call-timer" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'SF Mono, monospace' }}>{formatDuration(callDuration)}</div>
        <button data-testid="btn-end-call" onClick={endCall} style={{ border: 'none', borderRadius: '50%', width: 64, height: 64, background: '#ff453a', color: 'white', cursor: 'pointer', fontSize: 28 }}>📵</button>
      </div>
    )
  }

  return (
    <div data-testid="phone-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Tab bar */}
      <div data-testid="phone-tabs" style={{ display: 'flex', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
        {(['recents', 'contacts', 'voicemail', 'keypad'] as Tab[]).map((t) => (
          <button key={t} data-testid={`tab-${t}`} onClick={() => setTab(t)} style={tabBtn(tab === t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'recents' && (
          <div data-testid="recents-list" style={{ padding: 4 }}>
            {recents.length === 0 ? (
              <div data-testid="recents-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No recent calls</div>
            ) : (
              recents.map((call) => (
                <div key={call.id} data-testid={`recent-${call.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 14, width: 20, textAlign: 'center' }}>
                    {call.type === 'outgoing' ? '↗️' : call.type === 'incoming' ? '↘️' : '✗'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: call.type === 'missed' ? '#ff453a' : 'var(--text-primary)' }}>{call.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{call.number} · {formatTime(call.timestamp)}{call.duration > 0 && ` · ${formatDuration(call.duration)}`}</div>
                  </div>
                  <button data-testid={`callback-${call.id}`} onClick={() => placeCall(call.name, call.number)} style={{ border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 18 }}>📞</button>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'contacts' && (
          <div data-testid="contacts-list" style={{ padding: 4 }}>
            {contacts.map((c) => (
              <div key={c.id} data-testid={`contact-${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 600 }}>{c.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.number}</div>
                </div>
                <button data-testid={`call-${c.id}`} onClick={() => placeCall(c.name, c.number)} style={{ border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 18 }}>📞</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'voicemail' && (
          <div data-testid="voicemail-list" style={{ padding: 4 }}>
            {voicemails.length === 0 ? (
              <div data-testid="voicemail-empty" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No voicemails</div>
            ) : (
              voicemails.map((vm) => (
                <div key={vm.id} data-testid={`vm-${vm.id}`} style={{ padding: '8px 12px', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{vm.played ? '●' : '🔴'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{vm.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatTime(vm.timestamp)} · {formatDuration(vm.duration)}</div>
                    </div>
                    <button data-testid={`play-vm-${vm.id}`} onClick={() => playVoicemail(vm.id)} style={{ border: 'none', background: 'transparent', color: 'var(--accent-blue)', cursor: 'pointer', fontSize: 18 }}>▶</button>
                    <button data-testid={`delete-vm-${vm.id}`} onClick={() => deleteVoicemail(vm.id)} style={{ border: 'none', background: 'transparent', color: '#ff5f57', cursor: 'pointer', fontSize: 16 }}>🗑</button>
                  </div>
                  <div data-testid={`transcript-${vm.id}`} style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, paddingLeft: 30 }}>{vm.transcript}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'keypad' && (
          <div data-testid="keypad-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 16, gap: 12 }}>
            <div data-testid="keypad-display" style={{ fontSize: 28, color: 'var(--text-primary)', minHeight: 36, fontFamily: 'SF Mono, monospace' }}>{keypadInput || ''}</div>
            <div data-testid="keypad-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {keypadKeys.map((key) => (
                <button key={key} data-testid={`key-${key}`} onClick={() => setKeypadInput((prev) => prev + key)} style={{
                  width: 56, height: 56, borderRadius: '50%', border: '0.5px solid var(--glass-border)',
                  background: 'var(--glass-bg)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 22, fontWeight: 300,
                }}>{key}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 56 }} />
              <button data-testid="keypad-call" onClick={keypadCall} disabled={!keypadInput} style={{
                width: 56, height: 56, borderRadius: '50%', border: 'none',
                background: keypadInput ? '#30d158' : 'rgba(128,128,128,0.2)', color: 'white',
                cursor: keypadInput ? 'pointer' : 'not-allowed', fontSize: 24,
              }}>📞</button>
              <button data-testid="keypad-delete" onClick={() => setKeypadInput((prev) => prev.slice(0, -1))} disabled={!keypadInput} style={{
                width: 56, height: 56, border: 'none', background: 'transparent',
                color: keypadInput ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: keypadInput ? 'pointer' : 'not-allowed', fontSize: 20,
              }}>⌫</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const tabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1,
  border: 'none',
  background: active ? 'var(--accent-blue)' : 'transparent',
  color: active ? 'white' : 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: 12,
  padding: '8px 0',
  fontWeight: active ? 600 : 400,
})
