import { useState } from 'react'
import { Icon } from './common/Icon'

export function DockItem({ app, isRunning, isActive, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      data-testid={`dock-item-${app.id}`}
      aria-label={app.name}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: 'var(--dock-item-size)',
        height: 'var(--dock-item-size)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transform: hovered ? 'scale(1.15) translateY(-6px)' : 'scale(1) translateY(0)',
        transition: 'transform var(--transition-fast)',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-lg)',
          background: app.id === 'finder' ? 'var(--color-accent)' : 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-button)',
        }}
      >
        <Icon name={app.icon} size={24} color={app.id === 'finder' ? '#fff' : 'var(--color-text)'} />
      </div>
      {isRunning && (
        <span
          data-testid={`dock-indicator-${app.id}`}
          style={{
            position: 'absolute',
            bottom: -6,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          }}
        />
      )}
      {hovered && (
        <span
          data-testid={`dock-tooltip-${app.id}`}
          style={{
            position: 'absolute',
            top: -28,
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            fontSize: 'var(--text-xs)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {app.name}
        </span>
      )}
    </button>
  )
}

export default DockItem
