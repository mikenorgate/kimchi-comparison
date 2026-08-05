import { useState } from 'react'
import { FINDER_PLACES, getPlaceItems } from '../data/places'
import { useDesktopStore } from '../store/desktopStore'
import { Icon } from '../components/common/Icon'

function SidebarItem({ icon, label, active, onClick, 'data-testid': testId }) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '6px var(--space-sm)',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        background: active ? 'var(--color-accent)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text)',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 'var(--text-sm)',
      }}
    >
      <Icon name={icon} size={16} color={active ? '#fff' : 'var(--color-text-secondary)'} />
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  )
}

export function Finder() {
  const openApp = useDesktopStore((state) => state.openApp)
  const [activePlaceId, setActivePlaceId] = useState(FINDER_PLACES[0].id)
  const items = getPlaceItems(activePlaceId)

  function handleDoubleClick(item) {
    if (item.kind === 'app' && item.appId) {
      openApp(item.appId)
    }
  }

  return (
    <div
      data-testid="finder-app"
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'var(--color-window-bg)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      <aside
        data-testid="finder-sidebar"
        style={{
          width: 180,
          flexShrink: 0,
          background: 'var(--color-surface-elevated)',
          borderRight: '1px solid var(--color-border)',
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}
      >
        {FINDER_PLACES.map((place) => (
          <div key={place.id}>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-xs)',
                paddingLeft: 'var(--space-sm)',
              }}
            >
              {place.name}
            </div>
            {place.items.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.name}
                active={activePlaceId === place.id && items.some((i) => i.id === item.id)}
                onClick={() => setActivePlaceId(place.id)}
                data-testid={`finder-sidebar-${item.id}`}
              />
            ))}
          </div>
        ))}
      </aside>

      <main
        data-testid="finder-content"
        style={{
          flex: 1,
          padding: 'var(--space-lg)',
          overflow: 'auto',
        }}
      >
        <div
          data-testid="finder-path"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-md)',
          }}
        >
          {FINDER_PLACES.find((p) => p.id === activePlaceId)?.name}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
            gap: 'var(--space-md)',
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              data-testid={`finder-item-${item.id}`}
              onDoubleClick={() => handleDoubleClick(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-sm)',
                borderRadius: 'var(--radius-md)',
                cursor: item.kind === 'app' ? 'pointer' : 'default',
              }}
            >
              <Icon name={item.icon} size={48} color="var(--color-text)" />
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Finder
