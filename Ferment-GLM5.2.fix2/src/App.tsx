import { useEffect } from 'react'
import { ThemeProvider } from '@/lib/theme'
import { OsProvider } from '@/lib/os-store'
import { WindowsProvider } from '@/lib/windows-store'
import { OverlaysProvider } from '@/lib/overlays-store'
import { useOverlays } from '@/lib/overlays-context'
import { SystemProvider } from '@/lib/system-store'
import { useWindows } from '@/lib/windows-context'
import { DOCK_APPS } from '@/lib/app-registry'
// Module-level app registration (no side-effects-in-render).
import '@/lib/app-registration'
import { Desktop } from '@/components/desktop/Desktop'
import { MenuBar } from '@/components/menubar/MenuBar'
import { SystemOverlays } from '@/components/system/SystemOverlays'
import { ControlCenter, BrightnessOverlay } from '@/components/system/ControlCenter'
import { WindowManager } from '@/components/windows/WindowManager'
import { Dock } from '@/components/dock/Dock'
import { SpotlightRoot } from '@/components/overlays/Spotlight'
import { Launchpad } from '@/components/overlays/Launchpad'
import { MissionControl } from '@/components/overlays/MissionControl'
import { NotificationCenter } from '@/components/overlays/NotificationCenter'
import FinderApp from '@/apps/FinderApp'
import SafariApp from '@/apps/SafariApp'
import NotesApp from '@/apps/NotesApp'
import CalculatorApp from '@/apps/CalculatorApp'
import TerminalApp from '@/apps/TerminalApp'
import SystemSettingsApp from '@/apps/SystemSettingsApp'
import MailApp from '@/apps/MailApp'
import CalendarApp from '@/apps/CalendarApp'
import MessagesApp from '@/apps/MessagesApp'
import TextEditApp from '@/apps/TextEditApp'
import MusicApp from '@/apps/MusicApp'
import PhotosApp from '@/apps/PhotosApp'
import MapsApp from '@/apps/MapsApp'
import ClockApp from '@/apps/ClockApp'

/**
 * macOS Tahoe Web Shell root.
 *
 * Step 5 state: full desktop + transparent menu bar + window manager + Liquid
 * Glass Dock holding all ~14 apps with Framer Motion magnification. Clicking a
 * Dock icon opens (or focuses) that app's window; focusing a window re-titles
 * the menu bar. Finder opens on launch to prove the pipeline; other apps open
 * stub content (Phase 3 fills them in).
 *
 * Step 6 (theming) is already satisfied: ThemeProvider sets data-theme /
 * data-accent / .reduce-transparency on <html>, which all glass surfaces and
 * the desktop read via CSS variables — so toggling them re-tints everything.
 */
function Shell() {
  const { openWindow, windows } = useWindows()
  const overlays = useOverlays()

  // Open a Finder window on first launch to prove the pipeline.
  useEffect(() => {
    if (windows.length === 0) {
      openWindow({ appId: 'finder', title: 'Finder', width: 680, height: 420 })
    }
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ⌘+Space (or Ctrl+Space fallback) toggles Spotlight.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault()
        overlays.toggle('spotlight')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlays])

  const renderApp = (appId: string): React.ReactNode => {
    const app = DOCK_APPS.find((a) => a.id === appId)
    switch (appId) {
      case 'finder':
        return <FinderApp windowId={appId} />
      case 'safari':
        return <SafariApp />
      case 'notes':
        return <NotesApp />
      case 'calculator':
        return <CalculatorApp />
      case 'terminal':
        return <TerminalApp />
      case 'system-settings':
        return <SystemSettingsApp />
      case 'mail':
        return <MailApp windowId={appId} />
      case 'calendar':
        return <CalendarApp windowId={appId} />
      case 'messages':
        return <MessagesApp windowId={appId} />
      case 'textedit':
        return <TextEditApp windowId={appId} />
      case 'music':
        return <MusicApp />
      case 'photos':
        return <PhotosApp />
      case 'maps':
        return <MapsApp />
      case 'clock':
        return <ClockApp />
      default:
        return (
          <div
            style={{
              padding: '24px',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '48px' }}>{app?.glyph ?? '📦'}</div>
            <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
              {app?.name ?? appId}
            </h2>
            <p style={{ margin: 0 }}>This app arrives in a later phase.</p>
          </div>
        )
    }
  }

  return (
    <Desktop>
      <MenuBar />
      <WindowManager renderApp={(appId) => renderApp(appId)} />
      <Dock />
      <SpotlightRoot />
      <Launchpad />
      <MissionControl />
      <NotificationCenter />
      <ControlCenter />
      <BrightnessOverlay />
      <SystemOverlays />
    </Desktop>
  )
}

function App() {
  return (
    <ThemeProvider>
      <OsProvider>
        <WindowsProvider>
          <OverlaysProvider>
            <SystemProvider>
              <Shell />
            </SystemProvider>
          </OverlaysProvider>
        </WindowsProvider>
      </OsProvider>
    </ThemeProvider>
  )
}

export default App
