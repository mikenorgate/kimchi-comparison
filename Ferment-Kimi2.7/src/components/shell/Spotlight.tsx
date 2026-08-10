import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { appRegistry } from '../../apps/registry'
import { useWindowManager } from '../window'
import { GlassPanel } from '../ui'

interface SpotlightAction {
  id: string
  name: string
  description: string
  icon: string
}

const actions: SpotlightAction[] = [
  { id: 'new-finder-window', name: 'New Finder Window', description: 'Open a new Finder window', icon: '🔍' },
  { id: 'lock-screen', name: 'Lock Screen', description: 'Lock your Mac', icon: '🔒' },
  { id: 'sleep', name: 'Sleep', description: 'Put your Mac to sleep', icon: '💤' },
  { id: 'restart', name: 'Restart', description: 'Restart your Mac', icon: '⟳' },
  { id: 'shut-down', name: 'Shut Down', description: 'Turn off your Mac', icon: '⏻' },
]

interface SpotlightProps {
  open: boolean
  onClose: () => void
}

export function Spotlight({ open, onClose }: SpotlightProps) {
  const { openWindow } = useWindowManager()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const appResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return appRegistry
    return appRegistry.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q),
    )
  }, [query])

  const actionResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter(
      (action) =>
        action.name.toLowerCase().includes(q) ||
        action.description.toLowerCase().includes(q),
    )
  }, [query])

  const results = useMemo(
    () => [...appResults, ...actionResults],
    [appResults, actionResults],
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.focus()
    }
  }, [open])

  const handleSelect = useCallback(
    (index: number) => {
      const item = results[index]
      if (!item) return
      if ('category' in item) {
        const app = item as (typeof appRegistry)[number]
        openWindow({
          id: `${app.id}-spotlight-${Date.now()}`,
          appId: app.id,
          title: app.name,
          x: 140,
          y: 110,
          width: app.defaultWidth ?? 520,
          height: app.defaultHeight ?? 360,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
        })
      }
      onClose()
    },
    [results, openWindow, onClose],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % Math.max(results.length, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleSelect(selectedIndex)
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [results.length, selectedIndex, handleSelect, onClose],
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex justify-center pt-24"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
      onClick={onClose}
      data-testid="spotlight-overlay"
      role="presentation"
    >
      <div
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassPanel
          variant="strong"
          className="w-full h-fit max-h-[70vh] overflow-hidden flex flex-col shadow-2xl"
          data-testid="spotlight-panel"
        >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <span className="text-xl opacity-60" aria-hidden="true">
            🔍
          </span>
          <input
            ref={inputRef}
            data-testid="spotlight-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-lg outline-none placeholder:text-white/40 text-tahoe-text"
            aria-label="Spotlight Search"
            aria-autocomplete="list"
            aria-controls="spotlight-results"
          />
        </div>
        <div className="flex-1 overflow-auto p-2" id="spotlight-results" role="listbox">
          {results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm opacity-60" data-testid="spotlight-no-results">
              No results found.
            </div>
          )}
          {appResults.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1 text-xs font-semibold opacity-50 uppercase tracking-wide">Applications</div>
              <ul role="group" aria-label="Applications">
                {appResults.map((app, idx) => (
                  <li key={app.id}>
                    <button
                      type="button"
                      data-testid={`spotlight-result-${app.id}`}
                      onClick={() => handleSelect(idx)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
                        selectedIndex === idx ? 'bg-tahoe-accent/30' : 'hover:bg-white/10'
                      }`}
                      role="option"
                      aria-selected={selectedIndex === idx}
                    >
                      <span className="text-xl" aria-hidden="true">
                        <app.icon className="w-6 h-6" />
                      </span>
                      <div>
                        <div className="text-sm font-medium">{app.name}</div>
                        <div className="text-xs opacity-60 capitalize">{app.category}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {actionResults.length > 0 && (
            <div>
              <div className="px-3 py-1 text-xs font-semibold opacity-50 uppercase tracking-wide">Actions</div>
              <ul role="group" aria-label="Actions">
                {actionResults.map((action, idx) => {
                  const resultIndex = appResults.length + idx
                  return (
                    <li key={action.id}>
                      <button
                        type="button"
                        data-testid={`spotlight-action-${action.id}`}
                        onClick={() => handleSelect(resultIndex)}
                        onMouseEnter={() => setSelectedIndex(resultIndex)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-tahoe-accent/50 ${
                          selectedIndex === resultIndex ? 'bg-tahoe-accent/30' : 'hover:bg-white/10'
                        }`}
                        role="option"
                        aria-selected={selectedIndex === resultIndex}
                      >
                        <span className="text-xl" aria-hidden="true">
                          {action.icon}
                        </span>
                        <div>
                          <div className="text-sm font-medium">{action.name}</div>
                          <div className="text-xs opacity-60">{action.description}</div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
        </GlassPanel>
      </div>
    </div>
  )
}
