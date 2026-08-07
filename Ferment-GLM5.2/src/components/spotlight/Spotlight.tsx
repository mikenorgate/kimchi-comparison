import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, Search } from 'lucide-react'
import { listApps } from '../../lib/registry'
import { useWindowStore } from '../../store/window-manager'

/**
 * Spotlight — Tahoe's system-wide search.
 *
 * Opens with Cmd+Space (wired in App). Typing filters registered apps by
 * appId/title; Arrow keys move the selection; Enter launches the selected
 * app into a window and closes Spotlight; Esc closes. Clicking a result
 * launches it too.
 */

export interface SpotlightProps {
  open: boolean
  onClose: () => void
}

interface Result {
  appId: string
  title: string
  subtitle: string
}

export function Spotlight({ open, onClose }: SpotlightProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const launchWindow = useWindowStore((s) => s.open)
  const windows = useWindowStore((s) => s.windows)

  const results = useMemo<Result[]>(() => {
    const apps = listApps().map((a) => ({
      appId: a.appId,
      title: a.title,
      subtitle: 'Application',
    }))
    const q = query.trim().toLowerCase()
    if (!q) return apps
    return apps.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.appId.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    setSelected(0)
  }, [query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      // focus on next tick so the input is mounted
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const launch = (appId: string) => {
    const app = listApps().find((a) => a.appId === appId)
    if (!app) return
    const size = app.defaultSize ?? { w: 560, h: 400 }
    const offset = windows.length * 28
    launchWindow({
      appId,
      title: app.title,
      bounds: { x: 140 + offset, y: 80 + offset, w: size.w, h: size.h },
    })
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[selected]
      if (r) launch(r.appId)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000000] flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          data-testid="spotlight-overlay"
          onMouseDown={onClose}
        >
          <motion.div
            className="w-[640px] max-w-[80vw] overflow-hidden"
            style={{
              background: 'rgba(245,245,247,0.82)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '0.5px solid var(--color-glass-light-border)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-window)',
            }}
            data-testid="spotlight"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <Search size={20} className="text-black/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Spotlight Search"
                className="flex-1 bg-transparent text-[18px] text-black/85 outline-none placeholder:text-black/30"
                data-testid="spotlight-input"
                aria-label="Spotlight search"
              />
            </div>
            {results.length > 0 && (
              <ul
                className="max-h-[320px] overflow-auto border-t border-black/10 py-1"
                data-testid="spotlight-results"
              >
                {results.map((r, i) => (
                  <li key={r.appId}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-[14px] ${
                        i === selected ? 'bg-[var(--color-accent-blue)] text-white' : 'text-black/85 hover:bg-black/5'
                      }`}
                      data-testid={`spotlight-result-${r.appId}`}
                      data-selected={i === selected ? 'true' : 'false'}
                      onMouseEnter={() => setSelected(i)}
                      onClick={() => launch(r.appId)}
                    >
                      <span>
                        <span className="font-medium">{r.title}</span>
                        <span className="ml-2 text-xs opacity-60">
                          {r.subtitle}
                        </span>
                      </span>
                      {i === selected && (
                        <CornerDownLeft size={14} className="opacity-70" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {results.length === 0 && query.trim() && (
              <div
                className="border-t border-black/10 px-4 py-6 text-center text-[14px] text-black/40"
                data-testid="spotlight-no-results"
              >
                No results for “{query}”
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Spotlight
