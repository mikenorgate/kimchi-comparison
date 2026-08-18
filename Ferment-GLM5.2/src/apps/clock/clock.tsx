import { useState, useEffect, useRef, useCallback } from 'react'

type Tab = 'world' | 'stopwatch' | 'timer'

interface City {
  id: string
  name: string
  tzOffset: number // hours offset from UTC
}

const DEFAULT_CITIES: City[] = [
  { id: 'cupertino', name: 'Cupertino', tzOffset: -7 },
  { id: 'newyork', name: 'New York', tzOffset: -4 },
  { id: 'london', name: 'London', tzOffset: 1 },
  { id: 'tokyo', name: 'Tokyo', tzOffset: 9 },
]

const AVAILABLE_CITIES: City[] = [
  ...DEFAULT_CITIES,
  { id: 'paris', name: 'Paris', tzOffset: 2 },
  { id: 'sydney', name: 'Sydney', tzOffset: 10 },
  { id: 'dubai', name: 'Dubai', tzOffset: 4 },
  { id: 'mumbai', name: 'Mumbai', tzOffset: 5.5 },
]

const CITIES_KEY = 'tahoe.clock-cities'

function loadCities(): City[] {
  if (typeof window === 'undefined') return DEFAULT_CITIES
  try {
    const s = localStorage.getItem(CITIES_KEY)
    return s ? JSON.parse(s) : DEFAULT_CITIES
  } catch { return DEFAULT_CITIES }
}

function persistCities(cities: City[]) {
  try { localStorage.setItem(CITIES_KEY, JSON.stringify(cities)) } catch { /* ignore */ }
}

function formatTime(date: Date, tzOffset: number): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  const local = new Date(utc + tzOffset * 3600000)
  const h = local.getHours()
  const m = local.getMinutes()
  const s = local.getSeconds()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`
}

function formatDate(date: Date, tzOffset: number): string {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  const local = new Date(utc + tzOffset * 3600000)
  return local.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatStopwatch(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const cs = Math.floor((ms % 1000) / 10)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

function formatTimer(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function WorldClockTab() {
  const [cities, setCities] = useState<City[]>(loadCities)
  const [now, setNow] = useState(new Date())
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const removeCity = useCallback((id: string) => {
    const next = cities.filter((c) => c.id !== id)
    persistCities(next)
    setCities(next)
  }, [cities])

  const addCity = useCallback((city: City) => {
    if (cities.some((c) => c.id === city.id)) return
    const next = [...cities, city]
    persistCities(next)
    setCities(next)
    setShowAdd(false)
  }, [cities])

  const available = AVAILABLE_CITIES.filter((c) => !cities.some((ec) => ec.id === c.id))

  return (
    <div data-testid="world-clock-tab" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16, gap: 8 }}>
      {cities.map((city) => (
        <div
          key={city.id}
          data-testid={`city-${city.id}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'var(--glass-bg)',
            border: '0.5px solid var(--glass-border)',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-primary)' }} data-testid={`city-time-${city.id}`}>
              {formatTime(now, city.tzOffset)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }} data-testid={`city-date-${city.id}`}>
              {city.name} — {formatDate(now, city.tzOffset)}
            </div>
          </div>
          <button
            data-testid={`city-remove-${city.id}`}
            onClick={() => removeCity(city.id)}
            style={{ border: 'none', background: 'transparent', color: '#ff5f57', cursor: 'pointer', fontSize: 18 }}
          >✕</button>
        </div>
      ))}
      {showAdd && available.length > 0 && (
        <div data-testid="city-add-list" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {available.map((c) => (
            <button
              key={c.id}
              data-testid={`city-add-${c.id}`}
              onClick={() => addCity(c)}
              style={{
                textAlign: 'left',
                padding: '8px 16px',
                border: '0.5px solid var(--glass-border)',
                borderRadius: 8,
                background: 'var(--glass-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      <button
        data-testid="city-add-btn"
        onClick={() => setShowAdd(!showAdd)}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 16px',
          border: '0.5px solid var(--glass-border)',
          borderRadius: 8,
          background: 'var(--accent-blue)',
          color: 'white',
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        {showAdd ? 'Done' : '+ Add City'}
      </button>
    </div>
  )
}

function StopwatchTab() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now() - elapsed
    const update = () => {
      setElapsed(Date.now() - startRef.current)
      rafRef.current = requestAnimationFrame(update)
    }
    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(() => setRunning((r) => !r), [])
  const reset = useCallback(() => {
    setRunning(false)
    setElapsed(0)
    setLaps([])
  }, [])
  const lap = useCallback(() => {
    setLaps((prev) => [...prev, elapsed])
  }, [elapsed])

  return (
    <div data-testid="stopwatch-tab" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', padding: 24, gap: 16 }}>
      <div data-testid="stopwatch-display" style={{ fontSize: 56, fontWeight: 200, color: 'var(--text-primary)', fontFamily: 'SF Mono, Menlo, monospace' }}>
        {formatStopwatch(elapsed)}
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <button data-testid="sw-lap" onClick={lap} disabled={!running} style={ctrlBtn(running)}>
          Lap
        </button>
        <button data-testid="sw-toggle" onClick={toggle} style={{ ...ctrlBtn(true), background: running ? '#ff453a' : '#30d158' }}>
          {running ? 'Stop' : 'Start'}
        </button>
        <button data-testid="sw-reset" onClick={reset} disabled={elapsed === 0} style={ctrlBtn(elapsed > 0)}>
          Reset
        </button>
      </div>
      <div data-testid="sw-laps" style={{ width: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {laps.map((lapTime, i) => (
          <div key={i} data-testid={`sw-lap-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>Lap {i + 1}</span>
            <span style={{ fontFamily: 'SF Mono, Menlo, monospace' }}>{formatStopwatch(lapTime)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimerTab() {
  const [inputHours, setInputHours] = useState(0)
  const [inputMinutes, setInputMinutes] = useState(5)
  const [inputSeconds, setInputSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const startRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!running) return
    startRef.current = Date.now()
    const update = () => {
      const elapsed = Date.now() - startRef.current
      const left = remaining - elapsed
      if (left <= 0) {
        setRemaining(0)
        setRunning(false)
        setFinished(true)
        return
      }
      setRemaining(left)
      rafRef.current = requestAnimationFrame(update)
    }
    rafRef.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    const total = (inputHours * 3600 + inputMinutes * 60 + inputSeconds) * 1000
    if (total <= 0) return
    setRemaining(total)
    setFinished(false)
    setRunning(true)
  }, [inputHours, inputMinutes, inputSeconds])

  const pause = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => {
    if (remaining > 0) {
      startRef.current = Date.now()
      setRunning(true)
    }
  }, [remaining])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining(0)
    setFinished(false)
  }, [])

  const hasInput = inputHours > 0 || inputMinutes > 0 || inputSeconds > 0

  return (
    <div data-testid="timer-tab" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', padding: 24, gap: 16 }}>
      {remaining > 0 || running ? (
        <div data-testid="timer-display" style={{ fontSize: 56, fontWeight: 200, color: finished ? '#ff453a' : 'var(--text-primary)', fontFamily: 'SF Mono, Menlo, monospace' }}>
          {formatTimer(remaining)}
        </div>
      ) : (
        <div data-testid="timer-inputs" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <input data-testid="timer-hours" type="number" min={0} max={23} value={inputHours} onChange={(e) => setInputHours(Math.max(0, parseInt(e.target.value) || 0))} style={numInput} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>hours</span>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <input data-testid="timer-minutes" type="number" min={0} max={59} value={inputMinutes} onChange={(e) => setInputMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} style={numInput} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>min</span>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <input data-testid="timer-seconds" type="number" min={0} max={59} value={inputSeconds} onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} style={numInput} />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>sec</span>
          </label>
        </div>
      )}
      {finished && (
        <div data-testid="timer-alarm" style={{ fontSize: 18, fontWeight: 700, color: '#ff453a' }}>⏰ Timer Finished!</div>
      )}
      <div style={{ display: 'flex', gap: 16 }}>
        {!running && remaining === 0 && (
          <button data-testid="timer-start" onClick={start} disabled={!hasInput} style={{ ...ctrlBtn(hasInput), background: '#30d158', color: 'white' }}>
            Start
          </button>
        )}
        {running && (
          <button data-testid="timer-pause" onClick={pause} style={{ ...ctrlBtn(true), background: '#ff9f0a' }}>
            Pause
          </button>
        )}
        {!running && remaining > 0 && (
          <button data-testid="timer-resume" onClick={resume} style={{ ...ctrlBtn(true), background: '#30d158', color: 'white' }}>
            Resume
          </button>
        )}
        <button data-testid="timer-reset" onClick={reset} style={ctrlBtn(remaining > 0 || finished)}>
          Reset
        </button>
      </div>
    </div>
  )
}

const ctrlBtn = (enabled: boolean): React.CSSProperties => ({
  border: 'none',
  borderRadius: '50%',
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 600,
  cursor: enabled ? 'pointer' : 'not-allowed',
  background: enabled ? 'var(--glass-bg)' : 'rgba(128,128,128,0.2)',
  color: enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
  opacity: enabled ? 1 : 0.5,
})

const numInput: React.CSSProperties = {
  width: 60,
  fontSize: 28,
  fontWeight: 200,
  textAlign: 'center',
  border: '0.5px solid var(--glass-border)',
  borderRadius: 8,
  background: 'var(--glass-bg)',
  color: 'var(--text-primary)',
  outline: 'none',
  padding: '4px',
}

export function Clock({ windowId: _windowId }: { windowId: string }) {
  const [tab, setTab] = useState<Tab>('world')

  const tabBtn = (t: Tab): React.CSSProperties => ({
    border: 'none',
    background: tab === t ? 'var(--accent-blue)' : 'transparent',
    color: tab === t ? 'white' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 12,
    padding: '4px 12px',
    borderRadius: 6,
    fontWeight: tab === t ? 600 : 400,
  })

  return (
    <div data-testid="clock-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Tab bar */}
      <div data-testid="clock-tabs" style={{ display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
        <button data-testid="clock-tab-world" onClick={() => setTab('world')} style={tabBtn('world')}>World Clock</button>
        <button data-testid="clock-tab-stopwatch" onClick={() => setTab('stopwatch')} style={tabBtn('stopwatch')}>Stopwatch</button>
        <button data-testid="clock-tab-timer" onClick={() => setTab('timer')} style={tabBtn('timer')}>Timer</button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'world' && <WorldClockTab />}
        {tab === 'stopwatch' && <StopwatchTab />}
        {tab === 'timer' && <TimerTab />}
      </div>
    </div>
  )
}
