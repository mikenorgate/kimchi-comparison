import { useMemo, useState, useEffect } from 'react'
import MenuBar from './components/MenuBar'
import Dock from './components/Dock'
import Desktop from './components/Desktop'
import WindowFrame from './components/WindowFrame'
import { WindowProvider, useWindows } from './context/WindowContext'
import { ThemeProvider } from './context/ThemeContext'
import { getAppById } from './config/apps'
import Finder from './apps/Finder'
import Safari from './apps/Safari'
import Mail from './apps/Mail'
import Calendar from './apps/Calendar'
import Notes from './apps/Notes'
import Photos from './apps/Photos'
import Settings from './apps/Settings'
import Calculator from './apps/Calculator'
import Terminal from './apps/Terminal'
import Maps from './apps/Maps'
import StubApp from './apps/stubs/StubApp'
import Spotlight from './components/Spotlight'
import ControlCenter from './components/ControlCenter'
import './App.css'

function AppContent({ appId }) {
  switch (appId) {
    case 'finder':
      return <Finder />
    case 'safari':
      return <Safari />
    case 'mail':
      return <Mail />
    case 'calendar':
      return <Calendar />
    case 'notes':
      return <Notes />
    case 'photos':
      return <Photos />
    case 'settings':
      return <Settings />
    case 'calculator':
      return <Calculator />
    case 'terminal':
      return <Terminal />
    case 'maps':
      return <Maps />
    default:
      return <StubApp appId={appId} />
  }
}

function WindowLayer() {
  const { windows } = useWindows()

  return (
    <>
      {windows.map((win) => (
        <WindowFrame key={win.id} win={win}>
          <AppContent appId={win.appId} />
        </WindowFrame>
      ))}
    </>
  )
}

const WALLPAPERS = [
  {
    background: `radial-gradient(circle at 20% 30%, rgba(120, 80, 220, 0.28) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(0, 150, 255, 0.24) 0%, transparent 42%), radial-gradient(circle at 50% 50%, rgba(255, 100, 160, 0.16) 0%, transparent 50%), linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)`,
    backgroundSize: 'cover',
  },
  {
    background: `radial-gradient(circle at 30% 20%, rgba(0, 200, 180, 0.30) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(220, 80, 120, 0.24) 0%, transparent 42%), radial-gradient(circle at 50% 50%, rgba(255, 200, 80, 0.16) 0%, transparent 50%), linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)`,
    backgroundSize: 'cover',
  },
  {
    background: `radial-gradient(circle at 25% 25%, rgba(255, 120, 80, 0.28) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(120, 80, 220, 0.24) 0%, transparent 42%), radial-gradient(circle at 50% 50%, rgba(80, 200, 255, 0.16) 0%, transparent 50%), linear-gradient(135deg, #232526 0%, #414345 100%)`,
    backgroundSize: 'cover',
  },
];

function AppShell() {
  const { activeId, windows } = useWindows()
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)
  const [wallpaperIndex, setWallpaperIndex] = useState(0)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey && e.code === 'Space') {
        e.preventDefault()
        setSpotlightOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const activeAppName = useMemo(() => {
    const activeWindow = windows.find((w) => w.id === activeId)
    return getAppById(activeWindow?.appId)?.name || 'Finder'
  }, [activeId, windows])

  return (
    <div className="desktop-shell">
      <Desktop
        wallpaperStyle={WALLPAPERS[wallpaperIndex]}
        onWallpaperChange={() => setWallpaperIndex((i) => (i + 1) % WALLPAPERS.length)}
      >
        <MenuBar
          activeApp={activeAppName}
          onControlCenterToggle={() => setControlCenterOpen((open) => !open)}
        />
        <WindowLayer />
        <Dock />
        <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
        <ControlCenter open={controlCenterOpen} onClose={() => setControlCenterOpen(false)} />
      </Desktop>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <WindowProvider>
        <AppShell />
      </WindowProvider>
    </ThemeProvider>
  )
}

export default App
