import { useState, useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '../store/ui-store'
import { getRegisteredApps, type AppDefinition } from '../store/app-registry'
import { useWindowStore } from '../store/window-store'
import { AppIcon } from '../primitives/app-icon'

interface SearchResult {
  app: AppDefinition
  score: number
}

function searchApps(query: string): SearchResult[] {
  const apps = getRegisteredApps()
  if (!query.trim()) {
    return apps.map((app) => ({ app, score: 0 }))
  }
  const q = query.toLowerCase()
  return apps
    .map((app) => {
      const name = app.name.toLowerCase()
      let score = 0
      if (name === q) score = 100
      else if (name.startsWith(q)) score = 80
      else if (name.includes(q)) score = 60
      else score = 0
      return { app, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function Spotlight() {
  const open = useUIStore((s) => s.spotlightOpen)
  const setOpen = useUIStore((s) => s.setSpotlightOpen)
  const openWindow = useWindowStore((s) => s.openWindow)
  const focusWindow = useWindowStore((s) => s.focusWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)
  const windows = useWindowStore((s) => s.windows)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cmd+Space / Ctrl+Space toggles Spotlight; Cmd+W closes focused window
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault()
        setOpen(!useUIStore.getState().spotlightOpen)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
        e.preventDefault()
        const { focusedId, closeWindow } = useWindowStore.getState()
        if (focusedId) closeWindow(focusedId)
      }
      if (e.key === 'Escape' && useUIStore.getState().spotlightOpen) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const results = searchApps(query)

  const launchApp = useCallback(
    (app: AppDefinition) => {
      const existing = windows.find((w) => w.appId === app.id)
      if (existing) {
        if (existing.isMinimized) restoreWindow(existing.id)
        else focusWindow(existing.id)
      } else {
        openWindow(app.id, app.name, {
          width: app.defaultWidth,
          height: app.defaultHeight,
        })
      }
      setOpen(false)
    },
    [windows, openWindow, focusWindow, restoreWindow, setOpen]
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        launchApp(results[selectedIndex].app)
      }
    }
  }

  if (!open) return null

  return (
    <div
      data-testid="spotlight-overlay"
      onClick={() => setOpen(false)}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 10002,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '15vh',
      }}
    >
      <div
        data-testid="spotlight-panel"
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 90vw)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 10 }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16" y1="16" x2="21" y2="21" />
          </svg>
          <input
            ref={inputRef}
            data-testid="spotlight-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 22,
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
        </div>
        {results.length > 0 && (
          <div data-testid="spotlight-results" style={{ borderTop: '0.5px solid var(--glass-border)', padding: '4px 0' }}>
            {results.map((r, i) => (
              <div
                key={r.app.id}
                data-testid={`spotlight-result-${r.app.id}`}
                onClick={() => launchApp(r.app)}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '6px 16px',
                  cursor: 'pointer',
                  background: i === selectedIndex ? 'rgba(0,0,0,0.1)' : 'transparent',
                  borderRadius: 8,
                  margin: '0 4px',
                }}
              >
                <AppIcon name={r.app.icon} size={32} />
                <span style={{ fontSize: 15, color: 'var(--text-primary)' }}>{r.app.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>Application</span>
              </div>
            ))}
          </div>
        )}
        {query.trim() && results.length === 0 && (
          <div data-testid="spotlight-no-results" style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 14 }}>
            No results for "{query}"
          </div>
        )}
      </div>
    </div>
  )
}
