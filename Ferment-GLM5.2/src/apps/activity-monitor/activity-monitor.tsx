import { useState, useEffect, useRef, useCallback } from 'react'

interface Process {
  pid: number
  name: string
  cpu: number
  memory: number // in MB
  threads: number
}

const INITIAL_PROCESSES: Process[] = [
  { pid: 1, name: 'kernel_task', cpu: 2.1, memory: 120, threads: 88 },
  { pid: 42, name: 'WindowServer', cpu: 5.3, memory: 340, threads: 12 },
  { pid: 128, name: 'Finder', cpu: 1.2, memory: 180, threads: 8 },
  { pid: 256, name: 'Safari', cpu: 8.7, memory: 520, threads: 24 },
  { pid: 300, name: 'Mail', cpu: 0.8, memory: 210, threads: 6 },
  { pid: 350, name: 'Notes', cpu: 0.5, memory: 95, threads: 4 },
  { pid: 400, name: 'Terminal', cpu: 1.1, memory: 60, threads: 3 },
  { pid: 450, name: 'Music', cpu: 3.2, memory: 280, threads: 10 },
  { pid: 500, name: 'Photos', cpu: 2.4, memory: 450, threads: 14 },
  { pid: 550, name: 'Messages', cpu: 0.9, memory: 150, threads: 5 },
  { pid: 600, name: 'Calendar', cpu: 0.3, memory: 85, threads: 4 },
  { pid: 650, name: 'Reminders', cpu: 0.2, memory: 40, threads: 3 },
  { pid: 700, name: 'Spotlight', cpu: 0.1, memory: 35, threads: 2 },
  { pid: 750, name: 'Dock', cpu: 0.4, memory: 70, threads: 3 },
  { pid: 800, name: 'ControlCenter', cpu: 0.2, memory: 45, threads: 2 },
]

const MAX_HISTORY = 30

function jitter(value: number, min: number, max: number, delta: number): number {
  const next = value + (Math.random() - 0.5) * delta
  return Math.max(min, Math.min(max, next))
}

export function ActivityMonitor({ windowId: _windowId }: { windowId: string }) {
  const [processes, setProcesses] = useState<Process[]>(INITIAL_PROCESSES)
  const [filter, setFilter] = useState('')
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(MAX_HISTORY).fill(0))
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name' | 'pid'>('cpu')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Ref to hold latest processes so tick reads fresh data, not stale closure
  const processesRef = useRef(processes)
  processesRef.current = processes

  // Animate metrics on an interval
  const tick = useCallback(() => {
    const updated = processesRef.current.map((p) => ({
      ...p,
      cpu: parseFloat(jitter(p.cpu, 0, 15, 2).toFixed(1)),
      memory: Math.round(jitter(p.memory, 30, 600, 20)),
      threads: Math.max(1, Math.round(jitter(p.threads, 1, 30, 1))),
    }))
    setProcesses(updated)
    const totalCpu = parseFloat(updated.reduce((sum, p) => sum + p.cpu, 0).toFixed(1))
    setCpuHistory((prev) => [...prev.slice(1), totalCpu])
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(tick, 1500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tick])

  const filtered = processes
    .filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'cpu': return b.cpu - a.cpu
        case 'memory': return b.memory - a.memory
        case 'name': return a.name.localeCompare(b.name)
        case 'pid': return a.pid - b.pid
        default: return 0
      }
    })

  const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0)
  const totalMem = processes.reduce((sum, p) => sum + p.memory, 0)
  const totalThreads = processes.reduce((sum, p) => sum + p.threads, 0)

  // Simple sparkline graph
  const maxCpu = Math.max(...cpuHistory, 1)
  const graphPoints = cpuHistory
    .map((v, i) => `${(i / (MAX_HISTORY - 1)) * 100},${40 - (v / maxCpu) * 35}`)
    .join(' ')

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    padding: '4px 8px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--glass-border)',
    userSelect: 'none',
  }

  const tdStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-primary)',
    padding: '3px 8px',
    fontFamily: 'SF Mono, Menlo, monospace',
  }

  return (
    <div data-testid="activity-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Top stats + graph */}
      <div
        data-testid="activity-header"
        style={{ display: 'flex', gap: 12, padding: '8px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}
      >
        <div data-testid="am-stat-cpu" style={statCard}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>CPU Usage</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-blue)' }}>{totalCpu.toFixed(1)}%</div>
        </div>
        <div data-testid="am-stat-mem" style={statCard}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Memory</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#30d158' }}>{(totalMem / 1024).toFixed(2)} GB</div>
        </div>
        <div data-testid="am-stat-threads" style={statCard}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Threads</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#ffd60a' }}>{totalThreads}</div>
        </div>
        <div data-testid="am-stat-processes" style={statCard}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Processes</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{processes.length}</div>
        </div>
        {/* Sparkline graph */}
        <div data-testid="am-graph" style={{ flex: 1, minWidth: 120 }}>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>CPU History</div>
          <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none" data-testid="am-graph-svg">
            <polyline
              data-testid="am-graph-line"
              points={graphPoints}
              fill="none"
              stroke="var(--accent-blue)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      {/* Filter input */}
      <div style={{ padding: '6px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
        <input
          data-testid="am-filter"
          type="text"
          placeholder="Filter processes by name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '0.5px solid var(--glass-border)',
            borderRadius: 6,
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Process table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle} data-testid="am-sort-name" onClick={() => setSortBy('name')}>Process Name</th>
              <th style={thStyle} data-testid="am-sort-cpu" onClick={() => setSortBy('cpu')}>% CPU</th>
              <th style={thStyle} data-testid="am-sort-mem" onClick={() => setSortBy('memory')}>Memory</th>
              <th style={thStyle} data-testid="am-sort-pid" onClick={() => setSortBy('pid')}>PID</th>
              <th style={thStyle}>Threads</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} data-testid="am-no-results" style={{ ...tdStyle, textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                  No processes found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.pid} data-testid={`am-process-${p.pid}`}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={tdStyle}>{p.cpu.toFixed(1)}</td>
                  <td style={tdStyle}>{p.memory} MB</td>
                  <td style={tdStyle}>{p.pid}</td>
                  <td style={tdStyle}>{p.threads}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const statCard: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '4px 12px',
  borderRadius: 8,
  background: 'var(--glass-bg)',
  border: '0.5px solid var(--glass-border)',
  minWidth: 80,
}
