import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Plus, Trash2 } from 'lucide-react'
import type { WorldClock, Alarm } from './types'

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const worldClocks: WorldClock[] = [
  { id: 'cupertino', city: 'Cupertino', timezone: 'America/Los_Angeles' },
  { id: 'london', city: 'London', timezone: 'Europe/London' },
  { id: 'tokyo', city: 'Tokyo', timezone: 'Asia/Tokyo' },
]

const initialAlarms: Alarm[] = [
  { id: generateId(), label: 'Wake up', time: '07:00', enabled: true },
  { id: generateId(), label: 'Meeting', time: '09:30', enabled: false },
]

type Tab = 'world' | 'alarm' | 'stopwatch'

function formatStopwatch(ms: number) {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centis = Math.floor((ms % 1000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
}

export function Clock() {
  const [now, setNow] = useState(new Date())
  const [tab, setTab] = useState<Tab>('world')
  const [stopwatchMs, setStopwatchMs] = useState(0)
  const [running, setRunning] = useState(false)
  const [alarms, setAlarms] = useState<Alarm[]>(initialAlarms)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (running) {
      const start = Date.now() - stopwatchMs
      intervalRef.current = window.setInterval(() => {
        setStopwatchMs(Date.now() - start)
      }, 50)
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [running])

  const resetStopwatch = useCallback(() => {
    setRunning(false)
    setStopwatchMs(0)
  }, [])

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
  }, [])

  const addAlarm = useCallback(() => {
    setAlarms((prev) => [...prev, { id: generateId(), label: 'Alarm', time: '08:00', enabled: true }])
  }, [])

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return (
    <div className="flex flex-col h-full bg-tahoe-surface text-tahoe-text" data-testid="clock-app">
      <div className="flex justify-center gap-2 p-3 border-b border-white/10">
        {(['world', 'alarm', 'stopwatch'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
              tab === t ? 'bg-tahoe-accent text-white' : 'hover:bg-white/10'
            }`}
            data-testid={`clock-tab-${t}`}
          >
            {t === 'stopwatch' ? 'Stopwatch' : t}
          </button>
        ))}
      </div>

      {tab === 'world' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6" data-testid="clock-world-panel">
          <div className="text-6xl font-light tabular-nums" data-testid="clock-digital-time">
            {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-tahoe-text-secondary mt-2" data-testid="clock-date">
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
            {worldClocks.map((clock) => (
              <div key={clock.id} className="bg-white/5 rounded-xl p-4 text-center" data-testid={`clock-world-${clock.id}`}>
                <div className="text-sm text-tahoe-text-secondary">{clock.city}</div>
                <div className="text-xl font-medium mt-1">
                  {now.toLocaleTimeString(undefined, { timeZone: clock.timezone, hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'alarm' && (
        <div className="flex-1 overflow-auto p-4" data-testid="clock-alarm-panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Alarms</h2>
            <button onClick={addAlarm} className="p-2 rounded-md bg-tahoe-accent text-white hover:brightness-110" data-testid="clock-add-alarm">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {alarms.map((alarm) => (
              <div key={alarm.id} className="flex items-center justify-between bg-white/5 rounded-md p-3" data-testid="clock-alarm-item">
                <div>
                  <div className="text-2xl font-light">{alarm.time}</div>
                  <div className="text-sm text-tahoe-text-secondary">{alarm.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={() => toggleAlarm(alarm.id)}
                    className="w-5 h-5 accent-tahoe-accent cursor-pointer"
                    data-testid={`clock-alarm-toggle-${alarm.id}`}
                  />
                  <button onClick={() => deleteAlarm(alarm.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-tahoe-text-secondary hover:text-red-400" data-testid={`clock-alarm-delete-${alarm.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'stopwatch' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6" data-testid="clock-stopwatch-panel">
          <div className="text-6xl font-light tabular-nums mb-8" data-testid="clock-stopwatch-display">
            {formatStopwatch(stopwatchMs)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setRunning((r) => !r)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-tahoe-accent text-white hover:brightness-110"
              data-testid="clock-stopwatch-toggle"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetStopwatch}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20"
              data-testid="clock-stopwatch-reset"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
