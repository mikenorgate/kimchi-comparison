import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Mail } from './mail'

function resetMail() {
  localStorage.removeItem('tahoe.mail')
}

describe('Mail', () => {
  beforeEach(() => {
    resetMail()
  })

  it('renders the mail root with sidebar, list, and placeholder', () => {
    render(<Mail windowId="w1" />)
    expect(screen.getByTestId('mail-root')).toBeInTheDocument()
    expect(screen.getByTestId('mail-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('mail-list')).toBeInTheDocument()
    expect(screen.getByTestId('mail-placeholder')).toHaveTextContent('Select an email to read')
  })

  it('shows folder list in sidebar', () => {
    render(<Mail windowId="w1" />)
    expect(screen.getByTestId('folder-inbox')).toHaveTextContent('Inbox')
    expect(screen.getByTestId('folder-sent')).toHaveTextContent('Sent')
    expect(screen.getByTestId('folder-drafts')).toHaveTextContent('Drafts')
    expect(screen.getByTestId('folder-trash')).toHaveTextContent('Trash')
  })

  it('shows inbox emails by default', () => {
    render(<Mail windowId="w1" />)
    expect(screen.getByTestId('email-m1')).toBeInTheDocument()
    expect(screen.getByTestId('email-m2')).toBeInTheDocument()
    expect(screen.getByTestId('email-m5')).toBeInTheDocument()
  })

  it('shows unread count badge on inbox', () => {
    render(<Mail windowId="w1" />)
    expect(screen.getByTestId('unread-inbox')).toHaveTextContent('2')
  })

  it('unread emails show blue dot', () => {
    render(<Mail windowId="w1" />)
    expect(screen.getByTestId('unread-dot-m1')).toBeInTheDocument()
    expect(screen.queryByTestId('unread-dot-m3')).toBeNull()
  })

  it('clicking an email opens detail view', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    expect(screen.getByTestId('email-detail')).toBeInTheDocument()
    expect(screen.getByTestId('detail-subject')).toHaveTextContent('Welcome to macOS Tahoe')
  })

  it('opening an email marks it as read', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    expect(screen.queryByTestId('unread-dot-m1')).toBeNull()
    expect(screen.getByTestId('unread-inbox')).toHaveTextContent('1')
  })

  it('detail shows from, email, date, and body', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m3'))
    })
    expect(screen.getByTestId('detail-from')).toHaveTextContent('Sarah Chen')
    expect(screen.getByTestId('detail-email')).toHaveTextContent('sarah@example.com')
    expect(screen.getByTestId('detail-body')).toHaveTextContent('The project is on track')
  })

  it('delete button moves email to trash', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('delete-btn'))
    })
    expect(screen.queryByTestId('email-m1')).toBeNull()
    // Email is in trash now
    act(() => {
      fireEvent.click(screen.getByTestId('folder-trash'))
    })
    expect(screen.getByTestId('email-m1')).toBeInTheDocument()
  })

  it('delete from trash permanently removes', () => {
    render(<Mail windowId="w1" />)
    // Move to trash
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('delete-btn'))
    })
    // Go to trash and delete again
    act(() => {
      fireEvent.click(screen.getByTestId('folder-trash'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('delete-btn'))
    })
    expect(screen.queryByTestId('email-m1')).toBeNull()
  })

  it('star button toggles star', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    expect(screen.getByTestId('star-btn')).toHaveTextContent('☆')
    act(() => {
      fireEvent.click(screen.getByTestId('star-btn'))
    })
    expect(screen.getByTestId('star-btn')).toHaveTextContent('★')
  })

  it('star appears in email list', () => {
    render(<Mail windowId="w1" />)
    expect(screen.getByTestId('email-m2')).toHaveTextContent('★')
  })

  it('compose button opens compose view', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('compose-btn'))
    })
    expect(screen.getByTestId('compose-view')).toBeInTheDocument()
    expect(screen.getByTestId('compose-to')).toBeInTheDocument()
    expect(screen.getByTestId('compose-subject')).toBeInTheDocument()
    expect(screen.getByTestId('compose-body')).toBeInTheDocument()
  })

  it('send email stores to sent folder', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('compose-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('compose-to'), { target: { value: 'test@example.com' } })
      fireEvent.change(screen.getByTestId('compose-subject'), { target: { value: 'Test Subject' } })
      fireEvent.change(screen.getByTestId('compose-body'), { target: { value: 'Test body' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('send-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('folder-sent'))
    })
    const sentEmails = screen.getAllByTestId(/email-m-/)
    expect(sentEmails.length).toBeGreaterThan(0)
    expect(sentEmails[0]).toHaveTextContent('To: test@example.com')
    expect(sentEmails[0]).toHaveTextContent('Test Subject')
  })

  it('send requires at least to and subject', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('compose-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('compose-to'), { target: { value: '' } })
      fireEvent.change(screen.getByTestId('compose-subject'), { target: { value: '' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('send-btn'))
    })
    // Still in compose view
    expect(screen.getByTestId('compose-view')).toBeInTheDocument()
  })

  it('save draft stores to drafts folder', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('compose-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('compose-subject'), { target: { value: 'Draft Subject' } })
      fireEvent.change(screen.getByTestId('compose-body'), { target: { value: 'Draft body' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('save-draft-btn'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('folder-drafts'))
    })
    const drafts = screen.getAllByTestId(/email-m-/)
    expect(drafts.length).toBeGreaterThanOrEqual(1)
    expect(drafts.some((d) => d.textContent!.includes('Draft Subject'))).toBe(true)
  })

  it('cancel compose discards', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('compose-btn'))
    })
    act(() => {
      fireEvent.change(screen.getByTestId('compose-subject'), { target: { value: 'Discarded' } })
    })
    act(() => {
      fireEvent.click(screen.getByTestId('cancel-compose-btn'))
    })
    expect(screen.queryByTestId('compose-view')).toBeNull()
    expect(screen.getByTestId('mail-placeholder')).toBeInTheDocument()
  })

  it('reply pre-fills to and subject', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('reply-btn'))
    })
    expect((screen.getByTestId('compose-to') as HTMLInputElement).value).toBe('sarah@example.com')
    expect((screen.getByTestId('compose-subject') as HTMLInputElement).value).toBe('Re: Project update')
  })

  it('reply includes original message', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m3'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('reply-btn'))
    })
    const body = (screen.getByTestId('compose-body') as HTMLTextAreaElement).value
    expect(body).toContain('Original Message')
    expect(body).toContain('Sarah Chen')
    expect(body).toContain('The project is on track')
  })

  it('search filters emails by subject', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('mail-search'), { target: { value: 'Welcome' } })
    })
    expect(screen.getByTestId('email-m1')).toBeInTheDocument()
    expect(screen.queryByTestId('email-m2')).toBeNull()
    expect(screen.queryByTestId('email-m3')).toBeNull()
  })

  it('search filters emails by sender', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('mail-search'), { target: { value: 'Sarah' } })
    })
    expect(screen.getByTestId('email-m3')).toBeInTheDocument()
    expect(screen.queryByTestId('email-m1')).toBeNull()
  })

  it('search with no results shows empty', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('mail-search'), { target: { value: 'nonexistent' } })
    })
    expect(screen.getByTestId('mail-empty')).toBeInTheDocument()
  })

  it('switching folders clears selection', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    expect(screen.getByTestId('email-detail')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('folder-sent'))
    })
    expect(screen.queryByTestId('email-detail')).toBeNull()
    expect(screen.getByTestId('mail-placeholder')).toBeInTheDocument()
  })

  it('persists emails to localStorage', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('email-m1'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.mail')!)
    const m1 = stored.find((e: { id: string }) => e.id === 'm1')
    expect(m1.read).toBe(true)
  })

  it('sent folder shows sent emails', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('folder-sent'))
    })
    expect(screen.getByTestId('email-m6')).toBeInTheDocument()
    expect(screen.getByTestId('email-m6')).toHaveTextContent('To: sarah@example.com')
  })

  it('drafts folder shows drafts', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('folder-drafts'))
    })
    expect(screen.getByTestId('email-m7')).toBeInTheDocument()
  })

  it('empty trash shows empty message', () => {
    render(<Mail windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('folder-trash'))
    })
    expect(screen.getByTestId('mail-empty')).toBeInTheDocument()
  })
})
