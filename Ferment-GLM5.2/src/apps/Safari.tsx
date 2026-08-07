import { useEffect, useRef, useState } from 'react'
import { BookmarkPlus, Compass, ExternalLink, Globe, Plus, RotateCw, X } from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/**
 * Safari — favorites start page, address bar loads a URL into an iframe with a
 * graceful embedding-block fallback, tabs, bookmarks add/persist.
 *
 * Many real sites block iframe embedding (X-Frame-Options/CSP frame-ancestors).
 * Browsers fire onLoad even for blocked frames, so onLoad alone can't detect a
 * block; we use a load timeout — if the iframe doesn't signal onLoad within
 * LOAD_TIMEOUT, we show a "can't be displayed in a frame" fallback with an
 * "Open in new tab" link. This also covers no-network / non-routable URLs.
 */

interface Bookmark {
  id: string
  title: string
  url: string
}

interface Tab {
  id: string
  url: string | null // null = start page
  title: string
}

const STORAGE_KEY = 'tahoe.safari'
const LOAD_TIMEOUT = 2500

const FAVORITES = [
  { title: 'Apple', url: 'https://www.apple.com', letter: 'A', color: '#333333' },
  { title: 'Wikipedia', url: 'https://www.wikipedia.org', letter: 'W', color: '#000000' },
  { title: 'Example', url: 'https://example.com', letter: 'E', color: '#0a84ff' },
  { title: 'GitHub', url: 'https://github.com', letter: 'G', color: '#24292e' },
  { title: 'MDN', url: 'https://developer.mozilla.org', letter: 'M', color: '#000000' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', letter: 'Y', color: '#ff6600' },
]

function uid(): string {
  return 't' + Math.random().toString(36).slice(2, 10)
}

function normalizeUrl(input: string): string {
  const s = input.trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s)) return s
  return 'https://' + s
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'blocked'

export function Safari() {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'tab-1', url: null, title: 'Start Page' }])
  const [activeId, setActiveId] = useState('tab-1')
  const [address, setAddress] = useState('')
  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [reloadKey, setReloadKey] = useState(0)
  const [bookmarks, setBookmarks] = usePersistentState<Bookmark[]>(STORAGE_KEY, [])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0]

  // Reset to idle when switching to a start-page tab.
  useEffect(() => {
    if (!activeTab.url) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setLoadState('idle')
      setAddress('')
    } else {
      setAddress(activeTab.url)
      // Re-arm the load timeout for an already-loaded tab (e.g. switching back).
      setLoadState('loading')
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setLoadState('blocked'), LOAD_TIMEOUT)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  const navigate = (rawUrl: string) => {
    const url = normalizeUrl(rawUrl)
    if (!url) return
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, url, title: hostOf(url) } : t,
      ),
    )
    setAddress(url)
    setReloadKey((k) => k + 1)
    setLoadState('loading')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLoadState('blocked'), LOAD_TIMEOUT)
  }

  const onIframeLoad = () => {
    if (loadState !== 'loading') return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setLoadState('loaded')
  }

  const reload = () => {
    if (!activeTab.url) return
    setReloadKey((k) => k + 1)
    setLoadState('loading')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLoadState('blocked'), LOAD_TIMEOUT)
  }

  const newTab = () => {
    const id = uid()
    setTabs((prev) => [...prev, { id, url: null, title: 'Start Page' }])
    setActiveId(id)
  }

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id)
      if (next.length === 0) {
        const fresh = { id: uid(), url: null, title: 'Start Page' }
        setActiveId(fresh.id)
        return [fresh]
      }
      if (id === activeId) setActiveId(next[0].id)
      return next
    })
  }

  const addBookmark = () => {
    if (!activeTab.url) return
    if (bookmarks.some((b) => b.url === activeTab.url)) return
    setBookmarks((prev) => [
      ...prev,
      { id: uid(), title: activeTab.title || hostOf(activeTab.url!), url: activeTab.url! },
    ])
  }

  const openExternal = () => {
    if (activeTab.url) window.open(activeTab.url, '_blank', 'noopener')
  }

  const showStartPage = !activeTab.url
  const showFallback = loadState === 'blocked'
  const showIframe = activeTab.url && (loadState === 'loading' || loadState === 'loaded')

  return (
    <div data-testid="safari-content" className="flex h-full flex-col text-[13px]">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-black/10 bg-black/[0.04] px-2 py-1">
        {tabs.map((t) => {
          const active = t.id === activeId
          return (
            <div
              key={t.id}
              data-testid="safari-tab"
              onClick={() => setActiveId(t.id)}
              className={`group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] ${
                active ? 'bg-white/70 font-medium' : 'hover:bg-black/5'
              }`}
            >
              <Globe size={11} className="text-black/40" />
              <span className="max-w-[100px] truncate">{t.title}</span>
              <button
                data-testid="safari-close-tab"
                onClick={(e) => { e.stopPropagation(); closeTab(t.id) }}
                className="ml-1 rounded p-0.5 opacity-0 hover:bg-black/10 group-hover:opacity-100"
                aria-label="Close tab"
              >
                <X size={11} />
              </button>
            </div>
          )
        })}
        <button
          data-testid="safari-new-tab"
          onClick={newTab}
          className="rounded-md p-1 hover:bg-black/10"
          aria-label="New tab"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Toolbar: address bar + actions */}
      <div className="flex items-center gap-2 border-b border-black/10 px-3 py-2">
        <button
          data-testid="safari-reload"
          onClick={reload}
          className="rounded-md p-1 hover:bg-black/10"
          aria-label="Reload"
        >
          <RotateCw size={14} />
        </button>
        <form
          className="flex flex-1"
          onSubmit={(e) => { e.preventDefault(); navigate(address) }}
        >
          <input
            data-testid="safari-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search or enter website name"
            className="w-full rounded-lg border border-black/10 bg-white/70 px-3 py-1 text-center outline-none focus:border-[var(--accent)] focus:text-left"
          />
        </form>
        <button
          data-testid="safari-bookmark-add"
          onClick={addBookmark}
          disabled={!activeTab.url}
          className="rounded-md p-1 hover:bg-black/10 disabled:opacity-30"
          aria-label="Add bookmark"
        >
          <BookmarkPlus size={15} />
        </button>
      </div>

      {/* Bookmarks bar */}
      {bookmarks.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-black/10 bg-black/[0.02] px-2 py-1">
          {bookmarks.map((b) => (
            <button
              key={b.id}
              data-testid="safari-bookmark"
              onClick={() => navigate(b.url)}
              className="flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[12px] hover:bg-black/10"
            >
              <Globe size={11} className="text-black/40" />
              <span>{b.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative flex-1 overflow-hidden bg-white">
        {showStartPage ? (
          <div
            data-testid="safari-start-page"
            className="grid h-full place-items-center overflow-auto p-8"
          >
            <div className="w-full max-w-md">
              <div className="mb-6 text-center text-lg font-semibold text-black/70">
                Favorites
              </div>
              <div className="grid grid-cols-3 gap-4">
                {FAVORITES.map((f) => (
                  <button
                    key={f.url}
                    data-testid="safari-favorite"
                    data-url={f.url}
                    onClick={() => navigate(f.url)}
                    className="flex flex-col items-center gap-1 rounded-lg p-2 hover:bg-black/5"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
                      style={{ backgroundColor: f.color }}
                    >
                      {f.letter}
                    </span>
                    <span className="text-[11px] text-black/60">{f.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : showFallback ? (
          <div
            data-testid="safari-fallback"
            className="grid h-full place-items-center p-8"
          >
            <div className="max-w-sm text-center">
              <Compass size={40} className="mx-auto mb-3 text-black/30" />
              <h2 className="mb-1 text-base font-semibold">
                This site can&apos;t be displayed in a frame
              </h2>
              <p className="mb-4 text-[12px] text-black/50">
                {activeTab.url} may block embedding. Open it in a new tab instead.
              </p>
              <button
                data-testid="safari-open-external"
                onClick={openExternal}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-3 py-1.5 text-white hover:brightness-105"
              >
                <ExternalLink size={13} />
                <span>Open in new tab</span>
              </button>
            </div>
          </div>
        ) : showIframe ? (
          <iframe
            key={`${activeTab.url}-${reloadKey}`}
            data-testid="safari-iframe"
            src={activeTab.url ?? undefined}
            onLoad={onIframeLoad}
            referrerPolicy="no-referrer"
            className="h-full w-full border-0"
            title={activeTab.title}
          />
        ) : null}
      </div>
    </div>
  )
}

export default Safari
