import { useState } from 'react'

interface FavoriteTile { label: string; icon: string; url: string }
const FAVORITES: FavoriteTile[] = [
  { label: 'Apple', icon: '🍎', url: 'apple.com' },
  { label: 'Google', icon: '🔍', url: 'google.com' },
  { label: 'Wikipedia', icon: '📚', url: 'wikipedia.org' },
  { label: 'GitHub', icon: '🐙', url: 'github.com' },
  { label: 'YouTube', icon: '📺', url: 'youtube.com' },
]

interface ReadingItem { title: string; source: string }
const READING_LIST: ReadingItem[] = [
  { title: 'The Tahelkskote Design Language', source: 'developer.apple.com' },
  { title: 'Glassmorphism in Modern UIs', source: 'css-tricks.com' },
  { title: 'Why Liquid Glass Works', source: 'medium.com' },
]

export default function SafariApp() {
  const [address, setAddress] = useState('apple.com')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', color: 'var(--text-primary)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderBottom: '1px solid var(--glass-border-inner)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            padding: '4px 10px',
            borderRadius: 6,
            background: 'var(--glass-border-inner)',
          }}
        >
          Start Page
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid var(--glass-border-inner)',
        }}
      >
        <button
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: 14,
          }}
          aria-label="Reload"
          onClick={() => {
            /* visual only */
          }}
        >
          ⟳
        </button>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--glass-border-inner)',
            background: 'rgba(0,0,0,0.04)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
          }}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Favorites
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 16,
            }}
          >
            {FAVORITES.map((fav) => (
              <button
                key={fav.label}
                onClick={() => setAddress(fav.url)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 16,
                  border: '1px solid var(--glass-border-inner)',
              background: 'transparent',
                  borderRadius: 12,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 32 }}>{fav.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{fav.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            width: 220,
            flexShrink: 0,
            borderLeft: '1px solid var(--glass-border-inner)',
            padding: '16px 12px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            Reading List
          </div>
          {READING_LIST.map((item) => (
            <div
              key={item.title}
              style={{
                padding: '8px',
                borderRadius: 8,
                marginBottom: 8,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.source}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
