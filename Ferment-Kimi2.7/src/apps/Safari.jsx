import { useState } from 'react'

export const MOCK_PAGES = {
  'apple.com': {
    title: 'Apple',
    heading: 'Apple',
    body: 'Innovation at its finest. Explore the latest Apple products and services.',
  },
  'developer.apple.com': {
    title: 'Apple Developer',
    heading: 'Apple Developer',
    body: 'Resources for building apps across Apple platforms.',
  },
  'example.com': {
    title: 'Example',
    heading: 'Example Domain',
    body: 'This domain is for use in illustrative examples in documents.',
  },
}

export function normalizeUrl(input) {
  let trimmed = input.trim().toLowerCase()
  // Reject dangerous pseudo-protocols entirely.
  if (/^(javascript|data|vbscript|file):/.test(trimmed)) {
    return 'example.com'
  }
  trimmed = trimmed.replace(/^https?:\/\//, '')
  trimmed = trimmed.replace(/^www\./, '')
  // Trim any remaining path/query for the mocked shell.
  return trimmed.split('/')[0]
}

export function Safari() {
  const [tabs, setTabs] = useState([{ id: 'tab-1', url: 'apple.com' }])
  const [activeTabId, setActiveTabId] = useState('tab-1')
  const [inputValue, setInputValue] = useState('apple.com')

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]
  const page = MOCK_PAGES[activeTab.url] || {
    title: activeTab.url,
    heading: activeTab.url,
    body: 'No content available for this address.',
  }

  function navigate(url) {
    const clean = normalizeUrl(url)
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, url: clean } : t)))
    setInputValue(clean)
  }

  function addTab() {
    const newTab = { id: `tab-${Date.now()}`, url: 'apple.com' }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
    setInputValue(newTab.url)
  }

  function closeTab(e, id) {
    e.stopPropagation()
    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== id)
      if (remaining.length === 0) {
        const fallback = { id: `tab-${Date.now()}`, url: 'apple.com' }
        setActiveTabId(fallback.id)
        setInputValue(fallback.url)
        return [fallback]
      }
      if (activeTabId === id) {
        const index = prev.findIndex((t) => t.id === id)
        const next = prev[index - 1] || prev[index + 1]
        setActiveTabId(next.id)
        setInputValue(next.url)
      }
      return remaining
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    navigate(inputValue)
  }

  return (
    <div data-testid="safari-app" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--color-surface-elevated)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button type="button" style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#ff5f57', cursor: 'pointer' }} />
          <button type="button" style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#febc2e', cursor: 'pointer' }} />
          <button type="button" style={{ width: 12, height: 12, borderRadius: '50%', border: 'none', background: '#28c840', cursor: 'pointer' }} />
        </div>
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <input
            data-testid="safari-address"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.1)',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
        </form>
      </div>

      <div data-testid="safari-tabs" style={{ display: 'flex', gap: 2, padding: 'var(--space-xs)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const title = MOCK_PAGES[tab.url] ? MOCK_PAGES[tab.url].title : tab.url
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`safari-tab-item-${tab.id}`}
              onClick={() => {
                setActiveTabId(tab.id)
                setInputValue(tab.url)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-xs) var(--space-sm)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'var(--color-surface-elevated)' : 'transparent',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              <span>{title}</span>
              <span
                role="button"
                tabIndex={0}
                data-testid={`safari-tab-close-${tab.id}`}
                onClick={(e) => closeTab(e, tab.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeTab(e, tab.id) }}
                style={{ fontSize: 'var(--text-xs)', padding: '0 2px' }}
              >
                ×
              </span>
            </button>
          )
        })}
        <button type="button" data-testid="safari-add-tab" onClick={addTab} style={{ border: 'none', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', padding: 'var(--space-xs)' }}>+</button>
      </div>

      <div data-testid="safari-content" style={{ flex: 1, padding: 'var(--space-xl)', overflow: 'auto' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-md)' }}>{page.heading}</h1>
        <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.6 }}>{page.body}</p>
      </div>
    </div>
  )
}

export default Safari
