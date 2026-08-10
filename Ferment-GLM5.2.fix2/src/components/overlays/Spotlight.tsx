import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DOCK_APPS } from '@/lib/app-registry'
import { FILES, type SearchEntry } from '@/lib/spotlight-data'
import { useOverlays } from '@/lib/overlays-context'
import { useAppLauncher } from '@/lib/launch'
import { evaluateMath } from '@/lib/spotlight-math'

/**
 * macOS Spotlight search.
 *
 * - Opens via ⌘+Space (handled in App.tsx) or the menu-bar magnifier.
 * - Typing filters apps + files; arrow keys move the selection; Enter
 *   launches the selected app (or does nothing for plain files — they just
 *   show in results).
 * - Quick math: if the query is an arithmetic expression (e.g. "2+2"), the
 *   result is shown at the top of the results.
 */
export function Spotlight() {
  const { isOpen, close } = useOverlaysState()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const launch = useAppLauncher()

  // Focus the input when Spotlight opens; clear on close.
  useEffect(() => {
    if (isOpen('spotlight')) {
      setQuery('')
      setSelected(0)
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Results: apps (from the dock registry) + files, filtered by query.
  const appEntries: SearchEntry[] = useMemo(
    () =>
      DOCK_APPS.map((a) => ({
        kind: 'app' as const,
        id: a.id,
        name: a.name,
        appId: a.id,
        icon: a.glyph,
        detail: 'Application',
      })),
    [],
  )

  const mathResult = useMemo(() => evaluateMath(query), [query])

  const results = useMemo(() => {
    const all = [...appEntries, ...FILES]
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((e) => e.name.toLowerCase().includes(q))
  }, [appEntries, query])

  // Keep selection in bounds as results change.
  useEffect(() => {
    if (selected > results.length - 1) setSelected(0)
  }, [results.length, selected])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const entry = results[selected]
      if (entry?.kind === 'app' && entry.appId) {
        launch(entry.appId)
        close()
      }
    }
  }

  if (!isOpen('spotlight')) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9800,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '18vh',
      }}
      onMouseDown={close}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        style={{
          width: 560,
          maxWidth: '92vw',
          background: 'var(--window-bg)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          WebkitBackdropFilter:
            'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          borderRadius: 16,
          border: '0.5px solid var(--glass-border)',
          boxShadow:
            '0 24px 60px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(0,0,0,0.1), inset 0 0.0px 0.5px rgba(255,255,255,0.25)',
          overflow: 'hidden',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <span style={{ fontSize: 20, opacity: 0.5, marginRight: 10 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Spotlight Search"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 22,
              padding: '18px 0',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Math result */}
        {mathResult !== null && (
          <div
            style={{
              padding: '10px 16px',
              borderTop: '0.5px solid var(--glass-border-inner)',
              borderBottom: '0.5px solid var(--glass-border-inner)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              {query} =
            </span>
            <span
              style={{
                color: 'var(--text-primary)',
                fontSize: 28,
                fontWeight: 300,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {mathResult}
            </span>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0', maxHeight: 340, overflowY: 'auto' }}>
            {results.map((entry, i) => (
              <li
                key={`${entry.kind}-${entry.id}`}
                onMouseEnter={() => setSelected(i)}
                onClick={() => {
                  if (entry.kind === 'app' && entry.appId) {
                    launch(entry.appId)
                    close()
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  background:
                    i === selected
                      ? 'rgba(var(--accent-rgb), 0.85)'
                      : 'transparent',
                  color: i === selected ? '#fff' : 'var(--text-primary)',
                }}
              >
                <span style={{ fontSize: 22, width: 26, textAlign: 'center' }}>
                  {entry.icon}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {entry.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.7,
                    }}
                  >
                    {entry.detail}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {results.length === 0 && mathResult === null && (
          <div
            style={{
              padding: '16px',
              color: 'var(--text-secondary)',
              fontSize: 13,
              textAlign: 'center',
            }}
          >
            No results for "{query}"
          </div>
        )}
      </motion.div>
    </div>
  )
}

/**
 * Hook wrapper giving Spotlight the overlays API + a stable close.
 */
function useOverlaysState() {
  const overlays = useOverlays()
  return {
    isOpen: overlays.isOpen,
    close: overlays.close,
  }
}

/**
 * Framer Motion exit animation needs AnimatePresence in the parent.
 */
export function SpotlightRoot() {
  const { isOpen } = useOverlays()
  return (
    <AnimatePresence>
      {isOpen('spotlight') && <Spotlight />}
    </AnimatePresence>
  )
}
