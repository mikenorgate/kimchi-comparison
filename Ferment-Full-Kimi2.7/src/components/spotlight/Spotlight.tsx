import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { getApps } from '../../apps/registry'
import { useDesktop } from '../../desktop/store'

interface SpotlightContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const SpotlightContext = createContext<SpotlightContextValue | null>(null)

export function SpotlightProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
    }),
    [isOpen]
  )
  return <SpotlightContext.Provider value={value}>{children}</SpotlightContext.Provider>
}

export function useSpotlight(): SpotlightContextValue {
  const context = useContext(SpotlightContext)
  if (!context) {
    throw new Error('useSpotlight must be used within a SpotlightProvider')
  }
  return context
}

export function Spotlight() {
  const { isOpen, close, toggle } = useSpotlight()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { openWindow } = useDesktop()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault()
        toggle()
      } else if (e.key === 'Escape' && isOpen) {
        close()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, toggle, close])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const apps = getApps()
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return apps
    return apps.filter((app) => app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q))
  }, [apps, query])

  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(0, results.length - 1)))
  }, [results.length])

  const launch = (index: number) => {
    const app = results[index]
    if (!app) return
    openWindow(app.id)
    close()
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      launch(selectedIndex)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[18vh] bg-black/20 backdrop-blur-sm"
      data-testid="spotlight-overlay"
      onClick={close}
    >
      <div
        className="w-full max-w-xl bg-tahoe-glass-bg border border-tahoe-glass-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-tahoe-glass-border">
          <Search className="w-5 h-5 text-tahoe-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-lg text-tahoe-text placeholder:text-tahoe-text-tertiary"
            aria-label="Spotlight search"
            data-testid="spotlight-input"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto py-2" role="listbox" data-testid="spotlight-results">
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-tahoe-text-secondary">No results</li>
          )}
          {results.map((app, index) => {
            const Icon = app.icon
            return (
              <li
                key={app.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => launch(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center gap-3 px-4 py-2 cursor-pointer ${
                  index === selectedIndex ? 'bg-tahoe-accent text-white' : 'text-tahoe-text hover:bg-tahoe-hover'
                }`}
                data-testid="spotlight-result"
              >
                <Icon className="w-6 h-6" />
                <span className="flex-1">{app.name}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
