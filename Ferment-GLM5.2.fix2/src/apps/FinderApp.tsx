import { useState } from 'react'
import { FINDER_SECTIONS } from '@/data/finder-data'

interface SidebarItem { id: string; label: string; icon: string }

const FAVORITES: SidebarItem[] = [
  { id: 'recents', label: 'Recents', icon: '🕘' },
  { id: 'applications', label: 'Applications', icon: '🅰️' },
  { id: 'desktop', label: 'Desktop', icon: '🖥' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'downloads', label: 'Downloads', icon: '⬇️' },
]

const LOCATIONS: SidebarItem[] = [
  { id: 'icloud', label: 'iCloud Drive', icon: '☁️' },
  { id: 'macintosh', label: 'Macintosh HD', icon: '💽' },
]

export default function FinderApp({ windowId: _windowId }: { windowId?: string }) {
  const [selected, setSelected] = useState<string>('recents')

  const section = FINDER_SECTIONS.find((s) => s.id === selected)
  const entries = section ? section.entries : []

  const renderSidebarSection = (title: string, items: SidebarItem[]) => (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--text-secondary)',
          padding: '4px 12px',
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      {items.map((item) => {
        const active = item.id === selected
        return (
          <button
            key={item.id}
            onClick={() => setSelected(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '6px 12px',
              border: 'none',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: 13,
              borderRadius: 6,
              textAlign: 'left',
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', color: 'var(--text-primary)' }}>
      <div
        style={{
          width: 200,
          flexShrink: 0,
          borderRight: '1px solid var(--glass-border-inner)',
          padding: '12px 8px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            color: 'var(--text-secondary)',
            padding: '4px 12px',
            marginBottom: 4,
          }}
        >
          Favorites
        </div>
        {FAVORITES.flatMap((item) =>
          item.label === 'Applications'
            ? [
                { id: 'airdrop', label: 'AirDrop', icon: '📡' },
                item,
              ]
            : [item],
        ).map((item) => {
          const active = item.id === selected
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '6px 12px',
                border: 'none',
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 13,
                borderRadius: 6,
                textAlign: 'left',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
        {renderSidebarSection('Locations', LOCATIONS)}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
            disabled
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'default',
              fontSize: 14,
              opacity: 0.5,
            }}
            aria-label="Back"
          >
            ‹
          </button>
          <button
            disabled
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'default',
              fontSize: 14,
              opacity: 0.5,
            }}
            aria-label="Forward"
          >
            ›
          </button>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
            {section ? section.label : 'Finder'}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                border: '1px solid var(--glass-border-inner)',
                borderRadius: 4,
                padding: '2px 6px',
              }}
            >
              ▦
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '6px 12px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            borderBottom: '1px solid var(--glass-border-inner)',
          }}
        >
          Finder › {section ? section.label : ''}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {entries.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No items</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                gap: 16,
              }}
            >
              {entries.map((entry) => (
                <div
                  key={entry.name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: 8,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 40, lineHeight: 1 }}>{entry.icon}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', textAlign: 'center', wordBreak: 'break-word' }}>
                    {entry.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
