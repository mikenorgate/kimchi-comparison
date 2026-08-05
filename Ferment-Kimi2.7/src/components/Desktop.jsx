import { Wallpaper } from './Wallpaper'

export function Desktop({ children }) {
  return (
    <div
      data-testid="desktop"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Wallpaper />
      <div
        data-testid="desktop-layer"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 'var(--z-desktop)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          data-testid="desktop-content"
          style={{
            position: 'relative',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default Desktop
