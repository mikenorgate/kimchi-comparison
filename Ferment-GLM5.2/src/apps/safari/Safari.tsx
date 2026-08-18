import { useState, useCallback, useRef } from 'react'

/** Known domains that block iframe embedding. */
const BLOCKED_DOMAINS = [
  'google.com',
  'youtube.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'github.com',
  'apple.com',
]

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!url) return ''
  if (!url.match(/^https?:\/\//)) {
    url = 'https://' + url
  }
  return url
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function isBlocked(url: string): boolean {
  const hostname = getHostname(url)
  return BLOCKED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))
}

interface HistoryEntry {
  url: string
  blocked: boolean
}

/**
 * Safari app — toolbar with URL field, back/forward buttons, reload.
 * Loads URLs in an iframe. Blocked sites show a fallback screen.
 * In-memory history array for back/forward navigation.
 */
export default function Safari() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { url: 'https://example.com', blocked: false },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [urlInput, setUrlInput] = useState('https://example.com')
  const [iframeKey, setIframeKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = history[historyIndex]

  const navigateTo = useCallback((rawUrl: string) => {
    const url = normalizeUrl(rawUrl)
    if (!url) return
    const blocked = isBlocked(url)
    const entry: HistoryEntry = { url, blocked }

    setHistory(prev => [...prev.slice(0, historyIndex + 1), entry])
    setHistoryIndex(prev => prev + 1)
    setUrlInput(url)
  }, [historyIndex])

  const handleNavigate = useCallback(() => {
    navigateTo(urlInput)
  }, [urlInput, navigateTo])

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1
      setHistoryIndex(newIdx)
      setUrlInput(history[newIdx].url)
    }
  }, [historyIndex, history])

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1
      setHistoryIndex(newIdx)
      setUrlInput(history[newIdx].url)
    }
  }, [historyIndex, history])

  const reload = useCallback(() => {
    setIframeKey(k => k + 1)
  }, [])

  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < history.length - 1

  return (
    <div
      data-testid="safari"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1e1e1e',
        color: '#fff',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: '#2a2a2a',
        }}
      >
        <button
          data-testid="safari-back"
          onClick={goBack}
          disabled={!canGoBack}
          style={{
            background: 'none',
            border: 'none',
            color: canGoBack ? '#0a84ff' : '#555',
            fontSize: '18px',
            cursor: canGoBack ? 'pointer' : 'default',
            padding: '2px 6px',
          }}
        >
          ‹
        </button>
        <button
          data-testid="safari-forward"
          onClick={goForward}
          disabled={!canGoForward}
          style={{
            background: 'none',
            border: 'none',
            color: canGoForward ? '#0a84ff' : '#555',
            fontSize: '18px',
            cursor: canGoForward ? 'pointer' : 'default',
            padding: '2px 6px',
          }}
        >
          ›
        </button>
        <button
          data-testid="safari-reload"
          onClick={reload}
          style={{
            background: 'none',
            border: 'none',
            color: '#0a84ff',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          ⟳
        </button>
        <input
          ref={inputRef}
          data-testid="safari-url-input"
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleNavigate()
            }
          }}
          placeholder="Search or enter website name"
          style={{
            flex: 1,
            background: '#1e1e1e',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
        {current?.blocked ? (
          <div
            data-testid="safari-fallback"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: '#1e1e1e',
              color: '#fff',
              gap: '12px',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px' }}>⚠️</div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              This site cannot be displayed in a frame
            </div>
            <div data-testid="safari-fallback-url" style={{ fontSize: '13px', opacity: 0.6 }}>
              {current.url}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.4, maxWidth: '400px' }}>
              The site's security policy prevents it from being embedded in an iframe.
              Try opening it in a new tab.
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            data-testid="safari-iframe"
            src={current?.url ?? ''}
            title="Safari content"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  )
}
