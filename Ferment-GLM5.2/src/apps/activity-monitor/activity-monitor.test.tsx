import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ActivityMonitor } from './activity-monitor'

describe('Activity Monitor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the root, header, and process table', () => {
    render(<ActivityMonitor windowId="w1" />)
    expect(screen.getByTestId('activity-root')).toBeInTheDocument()
    expect(screen.getByTestId('activity-header')).toBeInTheDocument()
    expect(screen.getByTestId('am-graph')).toBeInTheDocument()
  })

  it('displays summary stats: CPU, Memory, Threads, Processes', () => {
    render(<ActivityMonitor windowId="w1" />)
    expect(screen.getByTestId('am-stat-cpu')).toBeInTheDocument()
    expect(screen.getByTestId('am-stat-mem')).toBeInTheDocument()
    expect(screen.getByTestId('am-stat-threads')).toBeInTheDocument()
    expect(screen.getByTestId('am-stat-processes')).toBeInTheDocument()
  })

  it('shows the initial mock processes in the table', () => {
    render(<ActivityMonitor windowId="w1" />)
    expect(screen.getByTestId('am-process-1')).toHaveTextContent('kernel_task')
    expect(screen.getByTestId('am-process-128')).toHaveTextContent('Finder')
    expect(screen.getByTestId('am-process-256')).toHaveTextContent('Safari')
    expect(screen.getByTestId('am-process-400')).toHaveTextContent('Terminal')
  })

  it('renders a CPU history graph (SVG polyline)', () => {
    render(<ActivityMonitor windowId="w1" />)
    expect(screen.getByTestId('am-graph-svg')).toBeInTheDocument()
    expect(screen.getByTestId('am-graph-line')).toBeInTheDocument()
  })

  it('has a filter input', () => {
    render(<ActivityMonitor windowId="w1" />)
    expect(screen.getByTestId('am-filter')).toBeInTheDocument()
  })

  it('filters processes by name', () => {
    render(<ActivityMonitor windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('am-filter'), { target: { value: 'safari' } })
    })
    expect(screen.getByTestId('am-process-256')).toBeInTheDocument()
    expect(screen.queryByTestId('am-process-128')).toBeNull()
    expect(screen.queryByTestId('am-process-1')).toBeNull()
  })

  it('shows no-results when filter matches nothing', () => {
    render(<ActivityMonitor windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('am-filter'), { target: { value: 'nonexistentproc' } })
    })
    expect(screen.getByTestId('am-no-results')).toBeInTheDocument()
  })

  it('filter is case-insensitive', () => {
    render(<ActivityMonitor windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('am-filter'), { target: { value: 'MAIL' } })
    })
    expect(screen.getByTestId('am-process-300')).toBeInTheDocument()
  })

  it('updates metrics on interval tick', () => {
    render(<ActivityMonitor windowId="w1" />)
    // Capture CPU value for a specific process before tick
    const safariRowBefore = screen.getByTestId('am-process-256').textContent!
    const cpuBefore = parseFloat(safariRowBefore.match(/Safari([\d.]+)/)?.[1] ?? '0')

    // Run multiple ticks to ensure jitter changes at least one value
    let cpuChanged = false
    for (let i = 0; i < 10; i++) {
      act(() => { vi.advanceTimersByTime(1600) })
      const safariRowAfter = screen.getByTestId('am-process-256').textContent!
      const cpuAfter = parseFloat(safariRowAfter.match(/Safari([\d.]+)/)?.[1] ?? '0')
      if (cpuAfter !== cpuBefore) { cpuChanged = true; break }
    }
    expect(cpuChanged).toBe(true)
  })

  it('clearing the filter restores all processes', () => {
    render(<ActivityMonitor windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('am-filter'), { target: { value: 'notes' } })
    })
    expect(screen.queryByTestId('am-process-1')).toBeNull()
    act(() => {
      fireEvent.change(screen.getByTestId('am-filter'), { target: { value: '' } })
    })
    expect(screen.getByTestId('am-process-1')).toBeInTheDocument()
    expect(screen.getByTestId('am-process-128')).toBeInTheDocument()
  })

  it('sorts by CPU descending by default', () => {
    render(<ActivityMonitor windowId="w1" />)
    const rows = screen.getAllByTestId(/am-process-\d+/)
    // First row should have higher CPU than last row
    const firstCpu = parseFloat(rows[0].textContent!.match(/(\d+\.\d)/)?.[1] ?? '0')
    const lastCpu = parseFloat(rows[rows.length - 1].textContent!.match(/(\d+\.\d)/)?.[1] ?? '0')
    expect(firstCpu).toBeGreaterThanOrEqual(lastCpu)
  })

  it('sorts by memory when Memory header is clicked', () => {
    render(<ActivityMonitor windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('am-sort-mem'))
    })
    const rows = screen.getAllByTestId(/am-process-\d+/)
    // First row should have higher memory than last row
    const firstMem = parseInt(rows[0].textContent!.match(/(\d+) MB/)?.[1] ?? '0')
    const lastMem = parseInt(rows[rows.length - 1].textContent!.match(/(\d+) MB/)?.[1] ?? '0')
    expect(firstMem).toBeGreaterThanOrEqual(lastMem)
  })

  it('sorts by name when Process Name header is clicked', () => {
    render(<ActivityMonitor windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('am-sort-name'))
    })
    const rows = screen.getAllByTestId(/am-process-\d+/)
    const firstName = rows[0].textContent!.split(/\s+/)[0]
    const lastName = rows[rows.length - 1].textContent!.split(/\s+/)[0]
    expect(firstName.localeCompare(lastName)).toBeLessThanOrEqual(0)
  })

  it('sorts by PID when PID header is clicked', () => {
    render(<ActivityMonitor windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('am-sort-pid'))
    })
    const rows = screen.getAllByTestId(/am-process-\d+/)
    // Extract PIDs from testids
    const pids = rows.map((r) => parseInt(r.dataset.testid!.replace('am-process-', '')))
    expect(pids).toEqual([...pids].sort((a, b) => a - b))
  })

  it('shows correct process count in stats', () => {
    render(<ActivityMonitor windowId="w1" />)
    expect(screen.getByTestId('am-stat-processes')).toHaveTextContent('15')
  })

  it('graph updates on interval tick', () => {
    render(<ActivityMonitor windowId="w1" />)
    const pointsBefore = screen.getByTestId('am-graph-line').getAttribute('points')
    act(() => { vi.advanceTimersByTime(1600) })
    const pointsAfter = screen.getByTestId('am-graph-line').getAttribute('points')
    // The points string should change after a tick since new CPU total is pushed
    expect(pointsAfter).not.toBe(pointsBefore)
  })

  it('displays memory in GB in the stat card', () => {
    render(<ActivityMonitor windowId="w1" />)
    expect(screen.getByTestId('am-stat-mem')).toHaveTextContent(/GB/)
  })
})
