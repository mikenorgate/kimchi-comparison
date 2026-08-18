import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Phone } from './phone'

function resetPhone() {
  localStorage.removeItem('tahoe.phone-recents')
  localStorage.removeItem('tahoe.phone-voicemails')
}

describe('Phone', () => {
  beforeEach(() => {
    resetPhone()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the root with 4 tabs', () => {
    render(<Phone windowId="w1" />)
    expect(screen.getByTestId('phone-root')).toBeInTheDocument()
    expect(screen.getByTestId('tab-recents')).toBeInTheDocument()
    expect(screen.getByTestId('tab-contacts')).toBeInTheDocument()
    expect(screen.getByTestId('tab-voicemail')).toBeInTheDocument()
    expect(screen.getByTestId('tab-keypad')).toBeInTheDocument()
  })

  it('defaults to Recents tab', () => {
    render(<Phone windowId="w1" />)
    expect(screen.getByTestId('recents-list')).toBeInTheDocument()
  })

  it('shows recent calls', () => {
    render(<Phone windowId="w1" />)
    expect(screen.getByTestId('recent-rc1')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('recent-rc2')).toHaveTextContent('Mom')
    expect(screen.getByTestId('recent-rc3')).toHaveTextContent('Emma Wilson')
    expect(screen.getByTestId('recent-rc4')).toHaveTextContent('Mike Rodriguez')
  })

  it('recent call shows type icon and duration', () => {
    render(<Phone windowId="w1" />)
    expect(screen.getByTestId('recent-rc1')).toHaveTextContent('↗️')
    expect(screen.getByTestId('recent-rc1')).toHaveTextContent('5:24')
    expect(screen.getByTestId('recent-rc3')).toHaveTextContent('✗')
  })

  it('missed calls shown in red', () => {
    render(<Phone windowId="w1" />)
    const missed = screen.getByTestId('recent-rc3')
    const nameEl = Array.from(missed.querySelectorAll('div')).find(d => d.textContent === 'Emma Wilson') as HTMLElement
    expect(nameEl?.style.color).toBe('rgb(255, 69, 58)')
  })

  it('callback button places a call', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('callback-rc1'))
    })
    expect(screen.getByTestId('phone-call')).toBeInTheDocument()
    expect(screen.getByTestId('call-name')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('call-number')).toHaveTextContent('555-0101')
  })

  it('call view shows timer starting at 0:00', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('callback-rc1'))
    })
    expect(screen.getByTestId('call-timer')).toHaveTextContent('0:00')
  })

  it('call timer advances on interval', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('callback-rc1'))
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByTestId('call-timer')).toHaveTextContent('0:05')
  })

  it('end call returns to tabs and saves to recents', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('callback-rc1'))
    })
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-end-call'))
    })
    expect(screen.queryByTestId('phone-call')).toBeNull()
    expect(screen.getByTestId('phone-root')).toBeInTheDocument()
    // New record at top of recents
    const records = screen.getAllByTestId(/recent-rc/)
    expect(records.length).toBe(5)
    expect(records[0]).toHaveTextContent('Sarah Chen')
    expect(records[0]).toHaveTextContent('0:10')
  })

  it('Contacts tab shows contacts', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-contacts'))
    })
    expect(screen.getByTestId('contacts-list')).toBeInTheDocument()
    expect(screen.getByTestId('contact-pc1')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('contact-pc6')).toHaveTextContent('Alex Kim')
  })

  it('contact call button places a call', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-contacts'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('call-pc3'))
    })
    expect(screen.getByTestId('call-name')).toHaveTextContent('Mom')
  })

  it('Voicemail tab shows voicemails', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-voicemail'))
    })
    expect(screen.getByTestId('voicemail-list')).toBeInTheDocument()
    expect(screen.getByTestId('vm-vm1')).toHaveTextContent('Mom')
    expect(screen.getByTestId('vm-vm2')).toHaveTextContent('Emma Wilson')
  })

  it('voicemail shows transcript', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-voicemail'))
    })
    expect(screen.getByTestId('transcript-vm1')).toHaveTextContent('sweetie')
  })

  it('play voicemail marks it as played', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-voicemail'))
    })
    // Unplayed shows 🔴
    expect(screen.getByTestId('vm-vm1')).toHaveTextContent('🔴')
    act(() => {
      fireEvent.click(screen.getByTestId('play-vm-vm1'))
    })
    // Played shows ●
    expect(screen.getByTestId('vm-vm1')).toHaveTextContent('●')
  })

  it('delete voicemail removes it', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-voicemail'))
    })
    expect(screen.getByTestId('vm-vm1')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('delete-vm-vm1'))
    })
    expect(screen.queryByTestId('vm-vm1')).toBeNull()
    expect(screen.getByTestId('vm-vm2')).toBeInTheDocument()
  })

  it('Keypad tab shows keypad with display and keys', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-keypad'))
    })
    expect(screen.getByTestId('keypad-view')).toBeInTheDocument()
    expect(screen.getByTestId('keypad-display')).toBeInTheDocument()
    expect(screen.getByTestId('keypad-grid')).toBeInTheDocument()
    expect(screen.getByTestId('key-1')).toBeInTheDocument()
    expect(screen.getByTestId('key-0')).toBeInTheDocument()
    expect(screen.getByTestId('key-#')).toBeInTheDocument()
  })

  it('pressing keypad keys builds the number', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-keypad'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('key-5'))
      fireEvent.click(screen.getByTestId('key-5'))
      fireEvent.click(screen.getByTestId('key-5'))
    })
    expect(screen.getByTestId('keypad-display')).toHaveTextContent('555')
  })

  it('keypad call button places a call with the entered number', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-keypad'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('key-9'))
      fireEvent.click(screen.getByTestId('key-1'))
      fireEvent.click(screen.getByTestId('key-1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('keypad-call'))
    })
    expect(screen.getByTestId('call-name')).toHaveTextContent('911')
    expect(screen.getByTestId('call-number')).toHaveTextContent('911')
  })

  it('keypad delete removes last digit', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-keypad'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('key-1'))
      fireEvent.click(screen.getByTestId('key-2'))
      fireEvent.click(screen.getByTestId('key-3'))
    })
    expect(screen.getByTestId('keypad-display')).toHaveTextContent('123')
    act(() => {
      fireEvent.click(screen.getByTestId('keypad-delete'))
    })
    expect(screen.getByTestId('keypad-display')).toHaveTextContent('12')
  })

  it('keypad call button disabled when no input', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-keypad'))
    })
    expect((screen.getByTestId('keypad-call') as HTMLButtonElement).disabled).toBe(true)
  })

  it('persists recents to localStorage', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('callback-rc2'))
    })
    act(() => {
      vi.advanceTimersByTime(7000)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-end-call'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.phone-recents')!)
    expect(stored[0].name).toBe('Mom')
    expect(stored[0].duration).toBe(7)
  })

  it('persists voicemail played state to localStorage', () => {
    render(<Phone windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('tab-voicemail'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('play-vm-vm2'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.phone-voicemails')!)
    expect(stored.find((v: { id: string }) => v.id === 'vm2').played).toBe(true)
  })

  it('missed call shows no duration text', () => {
    render(<Phone windowId="w1" />)
    const missed = screen.getByTestId('recent-rc3')
    expect(missed.textContent).not.toMatch(/\d+:\d+/)
  })
})
