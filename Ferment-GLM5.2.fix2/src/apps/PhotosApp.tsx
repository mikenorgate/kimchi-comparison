import { useState } from 'react'
import { PHOTOS, type Photo } from '@/data/media-data'
import { GlassSurface } from '@/components/glass/GlassSurface'

type ViewMode = 'grid' | 'square'

export default function PhotosApp() {
  const [view, setView] = useState<ViewMode>('grid')
  const [selected, setSelected] = useState<Photo | null>(null)

  const cellAspect = view === 'grid' ? '4 / 3' : '1 / 1'

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', color: 'var(--text-primary)' }}>
      <GlassSurface
        variant="regular"
        style={{ width: 160, padding: 16, borderRight: '1px solid var(--glass-border-inner)' }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5, marginBottom: 12 }}>
          Photos
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {['Years', 'Months', 'All'].map((section) => (
            <div key={section} style={{ padding: '6px 8px', borderRadius: 6, fontSize: 14 }}>
              {section}
            </div>
          ))}
        </nav>
      </GlassSurface>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--glass-border-inner)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700 }}>Library</div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--glass-border-inner)', borderRadius: 8, padding: 2 }}>
            {(['grid', 'square'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: view === mode ? 'var(--accent)' : 'transparent',
                  color: view === mode ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  textTransform: 'capitalize',
                  font: 'inherit',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 8,
            }}
          >
            {PHOTOS.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelected(photo)}
                style={{
                  position: 'relative',
                  aspectRatio: cellAspect,
                  borderRadius: 10,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: photo.gradient,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '8px 10px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  {photo.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            cursor: 'pointer',
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <div
              style={{
                width: 420,
                maxWidth: '80%',
                aspectRatio: '4 / 3',
                borderRadius: 14,
                background: selected.gradient,
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '16px 18px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: 700,
                  borderBottomLeftRadius: 14,
                  borderBottomRightRadius: 14,
                }}
              >
                {selected.label}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: -14,
                right: -14,
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: 'none',
                background: 'var(--window-bg)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: 14,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
