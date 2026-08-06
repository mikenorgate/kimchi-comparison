import { useEffect, useRef, useState } from 'react';

type Tab = 'world' | 'alarm' | 'timer' | 'stopwatch';

interface WorldClock {
  id: string;
  city: string;
  timezone: string;
}

const WORLD_CLOCKS: WorldClock[] = [
  { id: 'local', city: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: 'sf', city: 'San Francisco', timezone: 'America/Los_Angeles' },
  { id: 'nyc', city: 'New York', timezone: 'America/New_York' },
  { id: 'london', city: 'London', timezone: 'Europe/London' },
  { id: 'tokyo', city: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 'sydney', city: 'Sydney', timezone: 'Australia/Sydney' },
];

interface Alarm {
  id: string;
  time: string; // HH:MM
  enabled: boolean;
  label: string;
}

const INITIAL_ALARMS: Alarm[] = [
  { id: 'a1', time: '07:30', enabled: true, label: 'Wake up' },
  { id: 'a2', time: '12:00', enabled: false, label: 'Lunch' },
  { id: 'a3', time: '18:00', enabled: true, label: 'Wrap up' },
];

function useTicker(intervalMs: number): number {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return Date.now();
}

function formatTimeInZone(timezone: string, withSeconds = false): { time: string; date: string } {
  const now = new Date();
  const time = now.toLocaleTimeString(undefined, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: false,
  });
  const date = now.toLocaleDateString(undefined, {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return { time, date };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatStopwatch(ms: number): { main: string; ms: string } {
  const total = Math.max(0, ms);
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  const centis = Math.floor((total % 1000) / 10);
  const main = hours > 0
    ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
    : `${pad2(minutes)}:${pad2(seconds)}`;
  return { main, ms: `.${pad2(centis)}` };
}

function formatTimer(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${pad2(m)}:${pad2(s)}`
    : `${pad2(m)}:${pad2(s)}`;
}

export function Clock(): JSX.Element {
  const [tab, setTab] = useState<Tab>('world');
  // Tick once per second to refresh clock displays.
  useTicker(1000);

  return (
    <div className="clock-root">
      <div className="app-tabs">
        <button
          type="button"
          className={`app-tab${tab === 'world' ? ' app-tab--active' : ''}`}
          onClick={() => setTab('world')}
        >
          World Clock
        </button>
        <button
          type="button"
          className={`app-tab${tab === 'alarm' ? ' app-tab--active' : ''}`}
          onClick={() => setTab('alarm')}
        >
          Alarm
        </button>
        <button
          type="button"
          className={`app-tab${tab === 'timer' ? ' app-tab--active' : ''}`}
          onClick={() => setTab('timer')}
        >
          Timer
        </button>
        <button
          type="button"
          className={`app-tab${tab === 'stopwatch' ? ' app-tab--active' : ''}`}
          onClick={() => setTab('stopwatch')}
        >
          Stopwatch
        </button>
      </div>
      <div className="clock-content">
        {tab === 'world' && <WorldTab />}
        {tab === 'alarm' && <AlarmTab />}
        {tab === 'timer' && <TimerTab />}
        {tab === 'stopwatch' && <StopwatchTab />}
      </div>
    </div>
  );
}

function WorldTab(): JSX.Element {
  return (
    <div className="clock-world-list">
      {WORLD_CLOCKS.map((wc) => {
        const { time, date } = formatTimeInZone(wc.timezone, true);
        return (
          <div key={wc.id} className="clock-world-row">
            <div>
              <div className="clock-world-row__city">{wc.city}</div>
              <div className="clock-world-row__date">{date}</div>
            </div>
            <div className="clock-world-row__time">{time}</div>
          </div>
        );
      })}
    </div>
  );
}

function AlarmTab(): JSX.Element {
  const [alarms, setAlarms] = useState<Alarm[]>(INITIAL_ALARMS);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');

  const toggle = (id: string): void => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  };

  const remove = (id: string): void => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const add = (): void => {
    if (!newTime) return;
    setAlarms((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        time: newTime,
        enabled: true,
        label: newLabel.trim() || 'Alarm',
      },
    ]);
    setNewLabel('');
  };

  return (
    <div>
      {alarms.length === 0 && (
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, padding: 16 }}>
          No alarms. Add one below.
        </div>
      )}
      {alarms.map((a) => (
        <div key={a.id} className="clock-alarm-row">
          <div>
            <div className="clock-alarm-row__time">{a.time}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
              {a.label}
              {' · '}
              <button
                type="button"
                onClick={() => remove(a.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-accent)',
                  padding: 0,
                  font: 'inherit',
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <button
            type="button"
            className={`clock-toggle${a.enabled ? ' clock-toggle--on' : ''}`}
            onClick={() => toggle(a.id)}
            aria-label={a.enabled ? 'Disable alarm' : 'Enable alarm'}
          >
            <span className="clock-toggle__knob" />
          </button>
        </div>
      ))}
      <div className="clock-section-title">Add Alarm</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="time"
          className="app-input"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />
        <input
          type="text"
          className="app-input"
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="button" className="app-btn app-btn--primary" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

function TimerTab(): JSX.Element {
  const [inputMinutes, setInputMinutes] = useState('5');
  const [inputSeconds, setInputSeconds] = useState('0');
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running || remainingMs === null) return undefined;
    lastTickRef.current = performance.now();
    const tick = (): void => {
      const now = performance.now();
      const last = lastTickRef.current ?? now;
      const delta = now - last;
      lastTickRef.current = now;
      setRemainingMs((prev) => {
        if (prev === null) return null;
        const next = prev - delta;
        if (next <= 0) {
          setRunning(false);
          return 0;
        }
        return next;
      });
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [running, remainingMs]);

  const start = (): void => {
    if (remainingMs === null || remainingMs <= 0) {
      const total = (Number(inputMinutes) || 0) * 60_000 + (Number(inputSeconds) || 0) * 1000;
      if (total <= 0) return;
      setRemainingMs(total);
    }
    setRunning(true);
  };

  const pause = (): void => setRunning(false);
  const reset = (): void => {
    setRunning(false);
    setRemainingMs(null);
  };

  const display = remainingMs === null
    ? `${pad2(Number(inputMinutes) || 0)}:${pad2(Number(inputSeconds) || 0)}`
    : formatTimer(remainingMs);

  return (
    <div className="clock-display">
      <div className="clock-display__time">{display}</div>
      <div className="clock-display__label">
        {remainingMs === null ? 'Set a duration and start' : running ? 'Running…' : 'Paused'}
      </div>
      {remainingMs === null && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 6 }}>
          <input
            type="number"
            min={0}
            className="app-input"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            style={{ width: 70 }}
          />
          <span style={{ alignSelf: 'center' }}>min</span>
          <input
            type="number"
            min={0}
            className="app-input"
            value={inputSeconds}
            onChange={(e) => setInputSeconds(e.target.value)}
            style={{ width: 70 }}
          />
          <span style={{ alignSelf: 'center' }}>sec</span>
        </div>
      )}
      <div className="clock-controls">
        {remainingMs === null || (!running && (remainingMs ?? 0) <= 0) ? (
          <button type="button" className="app-btn app-btn--primary" onClick={start}>
            Start
          </button>
        ) : running ? (
          <button type="button" className="app-btn" onClick={pause}>
            Pause
          </button>
        ) : (
          <button type="button" className="app-btn app-btn--primary" onClick={start}>
            Resume
          </button>
        )}
        {(remainingMs !== null || running) && (
          <button type="button" className="app-btn" onClick={reset}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function StopwatchTab(): JSX.Element {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const baseRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return undefined;
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }
    const tick = (): void => {
      const now = performance.now();
      const start = startTimeRef.current ?? now;
      setElapsedMs(baseRef.current + (now - start));
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [running]);

  const start = (): void => {
    if (running) return;
    baseRef.current = elapsedMs;
    startTimeRef.current = null;
    setRunning(true);
  };

  const stop = (): void => {
    if (!running) return;
    setRunning(false);
    baseRef.current = elapsedMs;
    startTimeRef.current = null;
  };

  const reset = (): void => {
    setRunning(false);
    setElapsedMs(0);
    baseRef.current = 0;
    startTimeRef.current = null;
  };

  const { main, ms } = formatStopwatch(elapsedMs);

  return (
    <div className="clock-display">
      <div>
        <span className="clock-display__time">{main}</span>
        <span className="clock-display__ms">{ms}</span>
      </div>
      <div className="clock-display__label">{running ? 'Running…' : elapsedMs > 0 ? 'Stopped' : 'Ready'}</div>
      <div className="clock-controls">
        {!running ? (
          <button type="button" className="app-btn app-btn--primary" onClick={start}>
            {elapsedMs > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button type="button" className="app-btn" onClick={stop}>
            Stop
          </button>
        )}
        <button type="button" className="app-btn" onClick={reset} disabled={elapsedMs === 0 && !running}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default Clock;
