import { useState, useEffect, useRef, useCallback } from 'react'
import { APP_REGISTRY } from '../apps/registry'
import { useWindowManager } from '../WindowManager'

/**
 * Spotlight — a centered search overlay with Liquid Glass material.
 * Opens on Cmd+Space (or Meta+Space), filters apps by name,
 * arrow keys navigate, Enter launches, Esc closes.
 */
export default function Spotlight() {
  const { openApp } = useWindowManager()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Global hotkey: Cmd+Space (Meta+Space) to toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const filtered = APP_REGISTRY.filter(app =>
    app.name.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        openApp(filtered[selectedIndex].id)
        setOpen(false)
      }
    }
  }, [filtered, selectedIndex, openApp])

  if (!open) return null

  return (
    <div
      data-testid="spotlight-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '120px',
        background: 'rgba(0, 0, 0, 0.3)',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        data-testid="spotlight-panel"
        className="glass"
        style={{
          width: '600px',
          maxWidth: '90vw',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '20px',
            fontWeight: '300',
            boxSizing: 'border-box',
          }}
        />
        {filtered.length > 0 && (
          <div data-testid="spotlight-results" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            {filtered.map((app, index) => (
              <div
                key={app.id}
                data-testid={`spotlight-result-${app.id}`}
                data-app-id={app.id}
                data-selected={index === selectedIndex}
                onClick={() => {
                  openApp(app.id)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 20px',
                  cursor: 'default',
                  background: index === selectedIndex ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  fontSize: '15px',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: app.gradient,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d={app.iconPath} />
                  </svg>
                </div>
                {app.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
