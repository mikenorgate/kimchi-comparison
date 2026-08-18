import { useState, useEffect, useCallback } from 'react'

export interface Bookmark {
  id: string
  title: string
  url: string
}

export interface HistoryEntry {
  id: string
  title: string
  url: string
  timestamp: string
}

export interface Tab {
  id: string
  title: string
  url: string
  history: string[]
  historyIdx: number
}

const BOOKMARKS_KEY = 'tahoe.safari-bookmarks'
const HISTORY_KEY = 'tahoe.safari-history'

const FAVORITE_SITES = [
  { title: 'Apple', url: 'https://www.apple.com' },
  { title: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'MDN', url: 'https://developer.mozilla.org' },
  { title: 'OpenStreetMap', url: 'https://www.openstreetmap.org' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com' },
]

const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: 'bm1', title: 'Apple', url: 'https://www.apple.com' },
  { id: 'bm2', title: 'Wikipedia', url: 'https://www.wikipedia.org' },
]

const START_PAGE_URL = 'about:start'

function loadBookmarks(): Bookmark[] {
  try { const s = localStorage.getItem(BOOKMARKS_KEY); return s ? JSON.parse(s) : DEFAULT_BOOKMARKS } catch { return DEFAULT_BOOKMARKS }
}
function persistBookmarks(b: Bookmark[]) { try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(b)) } catch {} }
function loadHistory(): HistoryEntry[] {
  try { const s = localStorage.getItem(HISTORY_KEY); return s ? JSON.parse(s) : [] } catch { return [] }
}
function persistHistory(h: HistoryEntry[]) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)) } catch {} }

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return START_PAGE_URL
  if (trimmed === 'about:start' || trimmed === 'about:history') return trimmed
  // Check if it looks like a URL
  if (/^https?:\/\//.test(trimmed)) return trimmed
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`
  // Otherwise treat as search
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

export function Safari({ windowId: _windowId }: { windowId: string }) {
  const [tabs, setTabs] = useState<Tab[]>([{ id: genId(), title: 'Start Page', url: START_PAGE_URL, history: [START_PAGE_URL], historyIdx: 0 }])
  const [activeTabId, setActiveTabId] = useState(tabs[0].id)
  const [addressInput, setAddressInput] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [reloadKey, setReloadKey] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const activeTab = tabs.find((t) => t.id === activeTabId)!

  useEffect(() => { persistBookmarks(bookmarks) }, [bookmarks])
  useEffect(() => { persistHistory(history) }, [history])

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => t.id === tabId ? { ...t, ...updates } : t))
  }, [])

  const navigate = useCallback((url: string) => {
    const normalized = normalizeUrl(url)
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    const newHistory = [...tab.history.slice(0, tab.historyIdx + 1), normalized]
    updateTab(activeTabId, {
      url: normalized,
      title: normalized === START_PAGE_URL ? 'Start Page' : getDomain(normalized),
      history: newHistory,
      historyIdx: newHistory.length - 1,
    })
    setAddressInput(normalized === START_PAGE_URL ? '' : normalized)
    // Add to history
    if (normalized !== START_PAGE_URL) {
      const entry: HistoryEntry = {
        id: genId(),
        title: getDomain(normalized),
        url: normalized,
        timestamp: new Date().toISOString(),
      }
      setHistory((prev) => [entry, ...prev].slice(0, 100))
    }
    setShowHistory(false)
  }, [activeTabId, tabs, updateTab])

  const goBack = useCallback(() => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab || tab.historyIdx <= 0) return
    const newIdx = tab.historyIdx - 1
    const newUrl = tab.history[newIdx]
    updateTab(activeTabId, {
      url: newUrl,
      title: newUrl === START_PAGE_URL ? 'Start Page' : getDomain(newUrl),
      historyIdx: newIdx,
    })
    setAddressInput(newUrl === START_PAGE_URL ? '' : newUrl)
  }, [activeTabId, tabs, updateTab])

  const goForward = useCallback(() => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab || tab.historyIdx >= tab.history.length - 1) return
    const newIdx = tab.historyIdx + 1
    const newUrl = tab.history[newIdx]
    updateTab(activeTabId, {
      url: newUrl,
      title: newUrl === START_PAGE_URL ? 'Start Page' : getDomain(newUrl),
      historyIdx: newIdx,
    })
    setAddressInput(newUrl === START_PAGE_URL ? '' : newUrl)
  }, [activeTabId, tabs, updateTab])

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1)
  }, [])

  const newTab = useCallback(() => {
    const tab: Tab = { id: genId(), title: 'Start Page', url: START_PAGE_URL, history: [START_PAGE_URL], historyIdx: 0 }
    setTabs((prev) => [...prev, tab])
    setActiveTabId(tab.id)
    setAddressInput('')
  }, [])

  const closeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== tabId)
      if (filtered.length === 0) {
        const newTab: Tab = { id: genId(), title: 'Start Page', url: START_PAGE_URL, history: [START_PAGE_URL], historyIdx: 0 }
        setActiveTabId(newTab.id)
        return [newTab]
      }
      if (activeTabId === tabId) {
        setActiveTabId(filtered[0].id)
      }
      return filtered
    })
  }, [activeTabId])

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId)
    const tab = tabs.find((t) => t.id === tabId)
    setAddressInput(tab && tab.url !== START_PAGE_URL ? tab.url : '')
  }, [tabs])

  const addBookmark = useCallback(() => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab || tab.url === START_PAGE_URL) return
    if (bookmarks.some((b) => b.url === tab.url)) return
    const bookmark: Bookmark = { id: genId(), title: getDomain(tab.url), url: tab.url }
    setBookmarks((prev) => [...prev, bookmark])
  }, [activeTabId, tabs, bookmarks])

  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const handleAddressSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    navigate(addressInput)
  }, [addressInput, navigate])

  const canGoBack = activeTab.historyIdx > 0
  const canGoForward = activeTab.historyIdx < activeTab.history.length - 1
  const isStartPage = activeTab.url === START_PAGE_URL

  return (
    <div data-testid="safari-root" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Tab bar */}
      <div data-testid="safari-tabs" style={{ display: 'flex', gap: 2, padding: '4px 8px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0, overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => switchTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              background: tab.id === activeTabId ? 'var(--glass-bg)' : 'transparent',
              border: tab.id === activeTabId ? '0.5px solid var(--glass-border)' : 'none',
              fontSize: 11,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span>{tab.title}</span>
            <button
              data-testid={`tab-close-${tab.id}`}
              onClick={(e) => { e.stopPropagation(); closeTab(tab.id) }}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
            >✕</button>
          </div>
        ))}
        <button data-testid="new-tab" onClick={newTab} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, padding: '2px 8px' }}>+</button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0 }}>
        <button data-testid="btn-back" onClick={goBack} disabled={!canGoBack} style={toolbarBtn(canGoBack)}>‹</button>
        <button data-testid="btn-forward" onClick={goForward} disabled={!canGoForward} style={toolbarBtn(canGoForward)}>›</button>
        <button data-testid="btn-reload" onClick={reload} style={toolbarBtn(true)}>⟳</button>
        <form onSubmit={handleAddressSubmit} style={{ flex: 1 }}>
          <input
            data-testid="address-bar"
            type="text"
            placeholder="Search or enter website name"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            style={{ width: '100%', padding: '4px 12px', border: '0.5px solid var(--glass-border)', borderRadius: 16, background: 'var(--glass-bg)', color: 'var(--text-primary)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          />
        </form>
        <button data-testid="btn-bookmark" onClick={addBookmark} disabled={isStartPage} style={toolbarBtn(!isStartPage)}>☆</button>
        <button data-testid="btn-history" onClick={() => setShowHistory(!showHistory)} style={toolbarBtn(true)}>🕐</button>
      </div>

      {/* Bookmarks bar */}
      <div data-testid="bookmarks-bar" style={{ display: 'flex', gap: 4, padding: '3px 12px', borderBottom: '0.5px solid var(--glass-border)', flexShrink: 0, overflowX: 'auto' }}>
        {bookmarks.map((bm) => (
          <div key={bm.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              data-testid={`bookmark-${bm.id}`}
              onClick={() => navigate(bm.url)}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 11, padding: '2px 8px' }}
            >{bm.title}</button>
            <button
              data-testid={`bookmark-remove-${bm.id}`}
              onClick={() => removeBookmark(bm.id)}
              style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 10, padding: 0 }}
            >✕</button>
          </div>
        ))}
        {bookmarks.length === 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: '2px 0' }}>No bookmarks</span>
        )}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {showHistory ? (
          /* History view */
          <div data-testid="history-view" style={{ height: '100%', overflowY: 'auto', padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>History</span>
              <button data-testid="clear-history" onClick={clearHistory} style={{ padding: '4px 12px', border: '0.5px solid var(--glass-border)', borderRadius: 6, background: 'var(--glass-bg)', color: '#ff5f57', cursor: 'pointer', fontSize: 12 }}>Clear</button>
            </div>
            {history.length === 0 ? (
              <div data-testid="history-empty" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 14 }}>No history</div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  data-testid={`history-${entry.id}`}
                  onClick={() => navigate(entry.url)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', cursor: 'pointer', borderRadius: 6, borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{entry.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{entry.url}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(entry.timestamp).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        ) : isStartPage ? (
          /* Start page */
          <div data-testid="start-page" style={{ height: '100%', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: 'var(--text-primary)', marginBottom: 24 }}>Favorites</div>
            <div data-testid="favorites-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 16, maxWidth: 600 }}>
              {FAVORITE_SITES.map((site) => (
                <button
                  key={site.url}
                  data-testid={`favorite-${site.title.toLowerCase().replace(/\s/g, '-')}`}
                  onClick={() => navigate(site.url)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: 16,
                    border: '0.5px solid var(--glass-border)',
                    borderRadius: 12,
                    background: 'var(--glass-bg)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `hsl(${site.title.charCodeAt(0) * 30}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 700 }}>
                    {site.title[0]}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{site.title}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* iframe for actual web pages */
          <iframe
            key={activeTab.url + '#' + reloadKey}
            data-testid="web-frame"
            src={activeTab.url}
            title={activeTab.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ width: '100%', height: '100%', border: 'none' }}
            onError={() => {}}
          />
        )}
      </div>
    </div>
  )
}

const toolbarBtn = (enabled: boolean): React.CSSProperties => ({
  border: 'none',
  background: 'transparent',
  color: enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
  cursor: enabled ? 'pointer' : 'not-allowed',
  fontSize: 16,
  padding: '2px 8px',
  opacity: enabled ? 1 : 0.4,
})
