import { Window } from './Window'
import { useWindowManager } from './useWindowManager'
import { getAppById } from '../../apps'

function AppContent({ appId, windowId }: { appId: string; windowId: string }) {
  const app = getAppById(appId)
  if (!app) {
    return <div className="w-full h-full" />
  }
  const AppComponent = app.component
  return <AppComponent windowId={windowId} />
}

export function WindowManager() {
  const {
    state,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
  } = useWindowManager()

  return (
    <>
      {state.windows.map((w) => (
        <Window
          key={w.id}
          id={w.id}
          title={w.title}
          icon={w.icon}
          x={w.x}
          y={w.y}
          width={w.width}
          height={w.height}
          zIndex={w.zIndex}
          isFocused={state.focusedId === w.id}
          isMinimized={w.isMinimized}
          isMaximized={w.isMaximized}
          onClose={() => closeWindow(w.id)}
          onMinimize={() => minimizeWindow(w.id)}
          onMaximize={() =>
            w.isMaximized ? restoreWindow(w.id) : maximizeWindow(w.id)
          }
          onFocus={() => focusWindow(w.id)}
          onMove={(x, y) => moveWindow(w.id, x, y)}
          onResize={(width, height) => resizeWindow(w.id, width, height)}
        >
          <AppContent appId={w.appId} windowId={w.id} />
        </Window>
      ))}
    </>
  )
}
