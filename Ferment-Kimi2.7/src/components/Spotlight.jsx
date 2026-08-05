import { useEffect, useMemo, useRef, useState } from 'react'
import { BUILT_IN_APPS } from '../data/apps'
import { useDesktopStore } from '../store/desktopStore'
import { Icon } from './common/Icon'

export function Spotlight({ isOpen, onClose }) {
  const openApp = useDesktopStore((state) => state.openApp)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return BUILT_IN_APPS
    return BUILT_IN_APPS.filter(
      (app) =>
        app.name.toLowerCase().includes(normalized) ||
        app.id.toLowerCase().includes(normalized)
    )
  }, [query])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % results.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + results.length) % results.length)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const app = results[selectedIndex]
        if (app) {
          openApp(app.id)
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, openApp, results, selectedIndex])

  function handleLaunch(app) {
    openApp(app.id)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      data-testid="spotlight-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-spotlight)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        background: 'rgba(0,0,0,0.25)',
      }}
      onClick={onClose}
    >
      <div
        data-testid="spotlight-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: '90vw',
          background: 'var(--color-surface)',
          backdropFilter: 'blur(var(--blur-xl))',
          WebkitBackdropFilter: 'blur(var(--blur-xl))',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            padding: 'var(--space-md)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Icon name="search" size={20} color="var(--color-text-secondary)" />
          <input
            ref={inputRef}
            data-testid="spotlight-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Spotlight Search"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-medium)',
            }}
          />
        </div>

        <div
          data-testid="spotlight-results"
          style={{ maxHeight: 320, overflow: 'auto', padding: 'var(--space-sm)' }}
        >
          {results.length === 0 && (
            <div
              data-testid="spotlight-no-results"
              style={{
                padding: 'var(--space-lg)',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}
            >
              No results
            </div>
          )}
          {results.map((app, index) => (
            <button
              key={app.id}
              type="button"
              data-testid={`spotlight-result-${app.id}`}
              onClick={() => handleLaunch(app)}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: index === selectedIndex ? 'var(--color-accent)' : 'transparent',
                color: index === selectedIndex ? '#fff' : 'var(--color-text)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <Icon name={app.icon} size={32} color={index === selectedIndex ? '#fff' : 'var(--color-text)'} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{app.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>{app.category}</div>
              </div>
              <Icon name="chevronRight" size={16} color={index === selectedIndex ? '#fff' : 'var(--color-text-secondary)'} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Spotlight
