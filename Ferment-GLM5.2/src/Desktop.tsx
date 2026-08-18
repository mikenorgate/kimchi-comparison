import MenuBar from './components/MenuBar'
import Dock from './components/Dock'
import Spotlight from './components/Spotlight'
import ControlCenter from './components/ControlCenter'
import MissionControl from './components/MissionControl'
import { WindowManagerProvider, useWindowManager, AppContent } from './WindowManager'
import { ShellSettingsProvider, useShellSettings } from './ShellSettings'
import WindowFrame from './components/WindowFrame'

function DesktopShell() {
  const { windows } = useWindowManager()
  const { darkMode, wallpaper } = useShellSettings()

  return (
    <div
      data-testid="desktop-root"
      data-dark-mode={darkMode}
      className={darkMode ? 'dark' : 'light'}
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: wallpaper,
      }}
    >
      <MenuBar />
      <ControlCenter />
      <div
        data-testid="desktop-content"
        style={{ position: 'relative', height: '100%', width: '100%' }}
      >
        {windows.map((w) => (
          <WindowFrame key={w.id} win={w}>
            <AppContent appId={w.appId} />
          </WindowFrame>
        ))}
      </div>
      <Dock />
      <Spotlight />
      <MissionControl />
    </div>
  )
}

export default function Desktop() {
  return (
    <ShellSettingsProvider>
      <WindowManagerProvider>
        <DesktopShell />
      </WindowManagerProvider>
    </ShellSettingsProvider>
  )
}
