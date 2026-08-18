import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { FaceTime } from './facetime'

function resetFT() {
  localStorage.removeItem('tahoe.facetime-history')
}

describe('FaceTime', () => {
  beforeEach(() => {
    resetFT()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the root with contacts list and tabs', () => {
    render(<FaceTime windowId="w1" />)
    expect(screen.getByTestId('facetime-root')).toBeInTheDocument()
    expect(screen.getByTestId('tab-contacts')).toBeInTheDocument()
    expect(screen.getByTestId('tab-history')).toBeInTheDocument()
    expect(screen.getByTestId('contacts-list')).toBeInTheDocument()
  })

  it('shows default contacts', () => {
    render(<FaceTime windowId="w1" />)
    expect(screen.getByTestId('contact-ft1')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('contact-ft2')).toHaveTextContent('Mike Rodriguez')
    expect(screen.getByTestId('contact-ft3')).toHaveTextContent('Mom')
    expect(screen.getByTestId('contact-ft6')).toHaveTextContent('Alex Kim')
  })

  it('contact shows email and call button', () => {
    render(<FaceTime windowId="w1" />)
    expect(screen.getByTestId('contact-ft1')).toHaveTextContent('sarah@icloud.com')
    expect(screen.getByTestId('call-ft1')).toBeInTheDocument()
  })

  it('clicking call button opens call view', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft1'))
    })
    expect(screen.getByTestId('call-view')).toBeInTheDocument()
    expect(screen.getByTestId('call-name')).toHaveTextContent('Sarah Chen')
  })

  it('call view shows timer starting at 0:00', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft1'))
    })
    expect(screen.getByTestId('call-timer')).toHaveTextContent('0:00')
  })

  it('call timer advances on interval', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft1'))
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByTestId('call-timer')).toHaveTextContent('0:05')
  })

  it('call view has local camera preview', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft1'))
    })
    expect(screen.getByTestId('local-preview')).toBeInTheDocument()
    expect(screen.getByTestId('local-camera-active')).toBeInTheDocument()
  })

  it('call controls show mute, camera, and end buttons', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft1'))
    })
    expect(screen.getByTestId('btn-mute')).toBeInTheDocument()
    expect(screen.getByTestId('btn-camera')).toBeInTheDocument()
    expect(screen.getByTestId('btn-end')).toBeInTheDocument()
  })

  it('mute button toggles mute state', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft1'))
    })
    expect(screen.getByTestId('btn-mute')).toHaveTextContent('🎤')
    act(() => {
      fireEvent.click(screen.getByTestId('btn-mute'))
    })
    expect(screen.getByTestId('btn-mute')).toHaveTextContent('🔇')
    act(() => {
      fireEvent.click(screen.getByTestId('btn-mute'))
    })
    expect(screen.getByTestId('btn-mute')).toHaveTextContent('🎤')
  })

  it('camera button toggles camera off', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft1'))
    })
    expect(screen.queryByTestId('local-camera-active')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('btn-camera'))
    })
    expect(screen.queryByTestId('local-camera-active')).toBeNull()
    expect(screen.getByTestId('call-timer')).toHaveTextContent('Camera Off')
    act(() => {
      fireEvent.click(screen.getByTestId('btn-camera'))
    })
    expect(screen.getByTestId('local-camera-active')).toBeInTheDocument()
  })

  it('end call returns to contacts and saves history', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft2'))
    })
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-end'))
    })
    expect(screen.queryByTestId('call-view')).toBeNull()
    expect(screen.getByTestId('contacts-list')).toBeInTheDocument()
    // History should have the new call
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    const records = screen.getAllByTestId(/call-record-ch/)
    expect(records.length).toBe(4) // default 3 + new one
    expect(records[0]).toHaveTextContent('Mike Rodriguez')
    expect(records[0]).toHaveTextContent('0:10')
  })

  it('history tab shows call records', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    expect(screen.getByTestId('history-list')).toBeInTheDocument()
    expect(screen.getByTestId('call-record-ch1')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('call-record-ch2')).toHaveTextContent('Mom')
    expect(screen.getByTestId('call-record-ch3')).toHaveTextContent('Emma Wilson')
  })

  it('missed calls shown in red', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    const missed = screen.getByTestId('call-record-ch3')
    expect(missed).toHaveTextContent('Emma Wilson')
    const nameEl = Array.from(missed.querySelectorAll('div')).find(d => d.textContent === 'Emma Wilson') as HTMLElement
    expect(nameEl?.style.color).toBe('rgb(255, 69, 58)')
  })

  it('history shows call type icons', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    expect(screen.getByTestId('call-record-ch1')).toHaveTextContent('↗️') // outgoing
    expect(screen.getByTestId('call-record-ch2')).toHaveTextContent('↘️') // incoming
    expect(screen.getByTestId('call-record-ch3')).toHaveTextContent('✗')  // missed
  })

  it('callback button from history starts a call', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('callback-ch1'))
    })
    expect(screen.getByTestId('call-view')).toBeInTheDocument()
    expect(screen.getByTestId('call-name')).toHaveTextContent('Sarah Chen')
  })

  it('persists call history to localStorage', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('call-ft3'))
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-end'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.facetime-history')!)
    expect(stored[0].contactName).toBe('Mom')
    expect(stored[0].duration).toBe(5)
  })

  it('missed call shows no duration', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    const missed = screen.getByTestId('call-record-ch3')
    expect(missed.textContent).not.toContain('0:00')
  })

  it('incoming call shows duration', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    expect(screen.getByTestId('call-record-ch2')).toHaveTextContent('10:12')
  })

  it('outgoing call shows duration', () => {
    render(<FaceTime windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-history'))
    })
    expect(screen.getByTestId('call-record-ch1')).toHaveTextContent('5:24')
  })
})
