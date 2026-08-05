import { useWindowManager } from '../hooks/useWindowManager'
import { WindowFrame } from './common/WindowFrame'
import { getAppComponent } from '../apps'
import { getAppById } from '../data/apps'

export function Window({ windowId }) {
  const { window, isActive, focus, close, minimize, handlers } = useWindowManager(windowId)

  if (!window || window.minimized) return null

  const app = getAppById(window.appId)
  const AppComponent = getAppComponent(window.appId)

  return (
    <div
      data-testid={`window-${windowId}`}
      onMouseDown={focus}
      style={{
        position: 'absolute',
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: window.zIndex,
      }}
    >
      <WindowFrame
        title={window.title || app?.name || 'Window'}
        active={isActive}
        onClose={close}
        onMinimize={minimize}
        onZoom={() => {}}
        onTitleMouseDown={handlers.onTitleMouseDown}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {AppComponent ? <AppComponent /> : <div style={{ padding: 'var(--space-lg)' }}>Unknown app</div>}
          <div
            data-testid={`window-resize-${windowId}`}
            onMouseDown={handlers.onResizeMouseDown}
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 16,
              height: 16,
              cursor: 'nwse-resize',
            }}
          />
        </div>
      </WindowFrame>
    </div>
  )
}

export default Window
