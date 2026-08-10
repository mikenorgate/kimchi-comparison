import { useState, useEffect } from 'react'
import { WORLD_CLOCKS } from '@/data/media-data'
import { GlassSurface } from '@/components/glass/GlassSurface'

type Tab = 'world' | 'timer'

function cityTime(offsetHours: number, now: Date): string {
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000
  const cityDate = new Date(utcMs + offsetHours * 3_600_000)
  const h = cityDate.getHours().toString().padStart(2, '0')
  const m = cityDate.getMinutes().toString().padStart(2, '0')
  const s = cityDate.getSeconds().toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function ClockApp() {
  const [tab, setTab] = useState<Tab>('world')
  const [now, setNow] = useState<Date>(() => new Date())

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(60)
  const [remaining, setRemaining] = useState<number>(60)
  const [running, setRunning] = useState<boolean>(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  const setPreset = (minutes: number) => {
    const secs = minutes * 60
    setTimerSeconds(secs)
    setRemaining(secs)
    setRunning(false)
  }

  const start = () => {
    if (remaining <= 0) {
      setRemaining(timerSeconds)
    }
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setRemaining(timerSeconds)
  }

  const onMinutesChange = (value: number) => {
    const m = Math.max(0, Math.min(180, value))
    const secs = m * 60
    setTimerSeconds(secs)
    setRemaining(secs)
    setRunning(false)
  }

  const displayM = Math.floor(remaining / 60).toString().padStart(2, '0')
  const displayS = (remaining % 60).toString().padStart(2, '0')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', gap: 4, padding: '10px 16px', borderBottom: '1px solid var(--glass-border-inner)' }}>
        {(['world', 'timer'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              font: 'inherit',
            }}
          >
            {t === 'world' ? 'World Clock' : 'Timer'}
          </button>
        ))}
      </div>

      {tab === 'world' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WORLD_CLOCKS.map((clock) => (
              <GlassSurface
                key={clock.city}
                variant="regular"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10 }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{clock.city}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {clock.offset >= 0 ? `+${clock.offset}h` : `${clock.offset}h`} from Cupertino
                  </div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {cityTime(clock.offset, now)}
                </div>
              </GlassSurface>
            ))}
          </div>
        </div>
      )}

      {tab === 'timer' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
            {displayM}:{displayS}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 3, 5].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPreset(m)}
                style={presetBtn}
              >
                {m}m
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Minutes</label>
            <input
              type="number"
              min={0}
              max={180}
              value={Math.floor(timerSeconds / 60)}
              onChange={(e) => onMinutesChange(Number(e.target.value))}
              style={numInput}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            {running ? (
              <button type="button" onClick={pause} style={{ ...primaryBtn, background: '#ff9f0a' }}>Pause</button>
            ) : (
              <button type="button" onClick={start} style={primaryBtn}>Start</button>
            )}
            <button type="button" onClick={reset} style={secondaryBtn}>Reset</button>
          </div>
        </div>
      )}
    </div>
  )
}

const presetBtn: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  border: '1px solid var(--glass-border-inner)',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  font: 'inherit',
}

const numInput: React.CSSProperties = {
  width: 60,
  padding: '4px 6px',
  borderRadius: 6,
  border: '1px solid var(--glass-border-inner)',
  background: 'var(--window-bg)',
  color: 'var(--text-primary)',
  fontSize: 14,
  textAlign: 'center',
  font: 'inherit',
}

const primaryBtn: React.CSSProperties = {
  padding: '8px 24px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 700,
  font: 'inherit',
}

const secondaryBtn: React.CSSProperties = {
  padding: '8px 24px',
  borderRadius: 10,
  border: '1px solid var(--glass-border-inner)',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 700,
  font: 'inherit',
}
