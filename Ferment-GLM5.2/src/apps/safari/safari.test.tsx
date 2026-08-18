import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Safari } from './safari'

function resetSafari() {
  localStorage.removeItem('tahoe.safari-bookmarks')
  localStorage.removeItem('tahoe.safari-history')
}

describe('Safari', () => {
  beforeEach(() => {
    resetSafari()
  })

  it('renders the root with tabs, toolbar, bookmarks bar, and start page', () => {
    render(<Safari windowId="w1" />)
    expect(screen.getByTestId('safari-root')).toBeInTheDocument()
    expect(screen.getByTestId('safari-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('address-bar')).toBeInTheDocument()
    expect(screen.getByTestId('bookmarks-bar')).toBeInTheDocument()
    expect(screen.getByTestId('start-page')).toBeInTheDocument()
  })

  it('starts with one tab showing Start Page', () => {
    render(<Safari windowId="w1" />)
    const tabs = screen.getAllByTestId(/tab-/).filter((el) => !el.dataset.testid!.includes('close') && !el.dataset.testid!.includes('new'))
    expect(tabs).toHaveLength(1)
    expect(tabs[0]).toHaveTextContent('Start Page')
  })

  it('start page shows favorites grid', () => {
    render(<Safari windowId="w1" />)
    expect(screen.getByTestId('favorites-grid')).toBeInTheDocument()
    expect(screen.getByTestId('favorite-apple')).toBeInTheDocument()
    expect(screen.getByTestId('favorite-wikipedia')).toBeInTheDocument()
    expect(screen.getByTestId('favorite-github')).toBeInTheDocument()
  })

  it('clicking a favorite navigates to that URL', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('favorite-github'))
    })
    expect(screen.queryByTestId('start-page')).toBeNull()
    expect(screen.getByTestId('web-frame')).toBeInTheDocument()
    expect(screen.getByTestId('web-frame').getAttribute('src')).toBe('https://github.com')
  })

  it('typing a URL in address bar navigates', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    expect(screen.getByTestId('web-frame').getAttribute('src')).toBe('https://example.com')
  })

  it('typing a full URL with https:// navigates', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://www.apple.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    expect(screen.getByTestId('web-frame').getAttribute('src')).toBe('https://www.apple.com')
  })

  it('typing a search query navigates to search engine', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'hello world' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    expect(screen.getByTestId('web-frame').getAttribute('src')).toContain('duckduckgo.com')
  })

  it('address bar shows current URL after navigation', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    expect((screen.getByTestId('address-bar') as HTMLInputElement).value).toBe('https://example.com')
  })

  it('back button is disabled on start page', () => {
    render(<Safari windowId="w1" />)
    expect((screen.getByTestId('btn-back') as HTMLButtonElement).disabled).toBe(true)
  })

  it('forward button is disabled on start page', () => {
    render(<Safari windowId="w1" />)
    expect((screen.getByTestId('btn-forward') as HTMLButtonElement).disabled).toBe(true)
  })

  it('back button navigates to previous page', () => {
    render(<Safari windowId="w1" />)
    // Navigate to two URLs
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://test.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    // Go back
    act(() => {
      fireEvent.click(screen.getByTestId('btn-back'))
    })
    expect(screen.getByTestId('web-frame').getAttribute('src')).toBe('https://example.com')
  })

  it('forward button navigates to next page', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://test.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-back'))
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-forward'))
    })
    expect(screen.getByTestId('web-frame').getAttribute('src')).toBe('https://test.com')
  })

  it('new tab button creates a new tab', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('new-tab'))
    })
    const tabs = screen.getAllByTestId(/tab-/)
    // Filter out close buttons
    const tabDivs = tabs.filter((t) => !t.dataset.testid!.includes('close'))
    expect(tabDivs).toHaveLength(2)
  })

  it('closing the last tab creates a new start page tab', () => {
    render(<Safari windowId="w1" />)
    const tabs = screen.getAllByTestId(/tab-/)
    const tabDiv = tabs.find((t) => !t.dataset.testid!.includes('close'))!
    const tabId = tabDiv.dataset.testid!.replace('tab-', '')
    act(() => {
      fireEvent.click(screen.getByTestId(`tab-close-${tabId}`))
    })
    const newTabs = screen.getAllByTestId(/tab-/)
    const newTabDivs = newTabs.filter((t) => !t.dataset.testid!.includes('close'))
    expect(newTabDivs).toHaveLength(1)
    expect(screen.getByTestId('start-page')).toBeInTheDocument()
  })

  it('switching tabs changes the content', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('new-tab'))
    })
    // Tab 0 is start page, tab 1 is start page
    const tabs = screen.getAllByTestId(/tab-/)
    const tabDivs = tabs.filter((t) => !t.dataset.testid!.includes('close'))
    // Navigate in first tab
    act(() => {
      fireEvent.click(tabDivs[0])
    })
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    // Switch to second tab
    act(() => {
      fireEvent.click(tabDivs[1])
    })
    expect(screen.getByTestId('start-page')).toBeInTheDocument()
  })

  it('shows default bookmarks in bookmarks bar', () => {
    render(<Safari windowId="w1" />)
    expect(screen.getByTestId('bookmark-bm1')).toHaveTextContent('Apple')
    expect(screen.getByTestId('bookmark-bm2')).toHaveTextContent('Wikipedia')
  })

  it('bookmark button adds current page to bookmarks', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://github.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    const beforeCount = screen.getAllByTestId(/bookmark-bm|bookmark-\d/).length
    act(() => {
      fireEvent.click(screen.getByTestId('btn-bookmark'))
    })
    const afterCount = screen.getAllByTestId(/bookmark-bm|bookmark-\d/).length
    expect(afterCount).toBe(beforeCount + 1)
  })

  it('bookmark button is disabled on start page', () => {
    render(<Safari windowId="w1" />)
    expect((screen.getByTestId('btn-bookmark') as HTMLButtonElement).disabled).toBe(true)
  })

  it('clicking a bookmark navigates to its URL', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('bookmark-bm1'))
    })
    expect(screen.getByTestId('web-frame').getAttribute('src')).toBe('https://www.apple.com')
  })

  it('removing a bookmark removes it from the bar', () => {
    render(<Safari windowId="w1" />)
    expect(screen.getByTestId('bookmark-bm1')).toBeInTheDocument()
    act(() => {
      fireEvent.click(screen.getByTestId('bookmark-remove-bm1'))
    })
    expect(screen.queryByTestId('bookmark-bm1')).toBeNull()
  })

  it('history button opens history view', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('btn-history'))
    })
    expect(screen.getByTestId('history-view')).toBeInTheDocument()
  })

  it('history shows visited URLs', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-history'))
    })
    const entries = screen.getAllByTestId(/history-/)
    expect(entries.length).toBeGreaterThan(0)
    expect(entries[0]).toHaveTextContent('example.com')
  })

  it('clear history removes all entries', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-history'))
    })
    expect(screen.getAllByTestId(/history-/).length).toBeGreaterThan(0)
    act(() => {
      fireEvent.click(screen.getByTestId('clear-history'))
    })
    expect(screen.getByTestId('history-empty')).toBeInTheDocument()
  })

  it('clicking a history entry navigates to it', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-history'))
    })
    const entries = screen.getAllByTestId(/^history-[a-z0-9]/i)
    act(() => {
      fireEvent.click(entries[0])
    })
    // Address bar should show the navigated URL
    expect((screen.getByTestId('address-bar') as HTMLInputElement).value).toBe('https://example.com')
  })

  it('history with no entries shows empty message', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.click(screen.getByTestId('btn-history'))
    })
    expect(screen.getByTestId('history-empty')).toBeInTheDocument()
  })

  it('persists bookmarks to localStorage', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://github.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    act(() => {
      fireEvent.click(screen.getByTestId('btn-bookmark'))
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.safari-bookmarks')!)
    expect(stored.some((b: { url: string }) => b.url === 'https://github.com')).toBe(true)
  })

  it('persists history to localStorage', () => {
    render(<Safari windowId="w1" />)
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    const stored = JSON.parse(localStorage.getItem('tahoe.safari-history')!)
    expect(stored.some((h: { url: string }) => h.url === 'https://example.com')).toBe(true)
  })

  it('duplicate bookmark is not added', () => {
    render(<Safari windowId="w1" />)
    // bm1 is already apple.com
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://www.apple.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    const beforeCount = screen.getAllByTestId(/bookmark-bm|bookmark-\d/).length
    act(() => {
      fireEvent.click(screen.getByTestId('btn-bookmark'))
    })
    const afterCount = screen.getAllByTestId(/bookmark-bm|bookmark-\d/).length
    expect(afterCount).toBe(beforeCount)
  })

  it('reload button remounts the iframe via key change', () => {
    render(<Safari windowId="w1" />)
    // Navigate to a URL first
    act(() => {
      fireEvent.change(screen.getByTestId('address-bar'), { target: { value: 'https://example.com' } })
      fireEvent.submit(screen.getByTestId('address-bar').closest('form')!)
    })
    const frame1 = screen.getByTestId('web-frame')
    // Click reload
    act(() => {
      fireEvent.click(screen.getByTestId('btn-reload'))
    })
    const frame2 = screen.getByTestId('web-frame')
    // The iframe should be a different DOM node after reload (React remounts on key change)
    expect(frame2).not.toBe(frame1)
    // The src should remain the same URL
    expect(frame2.getAttribute('src')).toBe('https://example.com')
  })
})
