export function WindowFrame({
  children,
  title = '',
  active = true,
  onClose,
  onMinimize,
  onZoom,
  onTitleMouseDown,
  style = {},
  ...props
}) {
  return (
    <div
      data-testid="window-frame"
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'var(--color-window-bg)',
        borderRadius: 'var(--radius-window)',
        boxShadow: active ? 'var(--shadow-window-active)' : 'var(--shadow-window)',
        overflow: 'hidden',
        transition: 'box-shadow var(--transition-fast)',
        ...style,
      }}
      {...props}
    >
      <div
        data-testid="window-titlebar"
        onMouseDown={onTitleMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'var(--window-titlebar-height)',
          padding: '0 var(--space-md)',
          background: active ? 'var(--color-window-titlebar)' : 'rgba(230,230,230,0.8)',
          borderBottom: '1px solid var(--color-border)',
          borderTopLeftRadius: 'var(--radius-window)',
          borderTopRightRadius: 'var(--radius-window)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <TrafficLight color="var(--color-close)" onClick={onClose} label="close" />
          <TrafficLight color="var(--color-minimize)" onClick={onMinimize} label="minimize" />
          <TrafficLight color="var(--color-zoom)" onClick={onZoom} label="zoom" />
        </div>
        <div
          data-testid="window-title"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: active ? 'var(--color-text)' : 'var(--color-text-secondary)',
          }}
        >
          {title}
        </div>
        <div style={{ width: 52 }} />
      </div>
      <div
        data-testid="window-content"
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function TrafficLight({ color, onClick, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      data-testid={`window-${label}`}
      onClick={onClick}
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        padding: 0,
      }}
    />
  )
}

export default WindowFrame
