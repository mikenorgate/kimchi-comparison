import { useState } from 'react'
import { Desktop } from './components/Desktop'
import { MenuBar } from './components/MenuBar'
import { Dock } from './components/Dock'
import { Spotlight } from './components/Spotlight'
import { ControlCenter } from './components/ControlCenter'
import { Window } from './components/Window'
import { useSpotlightShortcut } from './hooks/useSpotlightShortcut'
import { useDesktopStore } from './store/desktopStore'

function App() {
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [controlCenterOpen, setControlCenterOpen] = useState(false)
  const windows = useDesktopStore((state) => state.windows)

  useSpotlightShortcut(() => setSpotlightOpen((open) => !open))

  return (
    <Desktop>
      <MenuBar
        onOpenSpotlight={() => setSpotlightOpen(true)}
        onOpenControlCenter={() => setControlCenterOpen((open) => !open)}
      />
      <Dock />
      {windows.map((window) => (
        <Window key={window.id} windowId={window.id} />
      ))}
      <Spotlight isOpen={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <ControlCenter isOpen={controlCenterOpen} onClose={() => setControlCenterOpen(false)} />
    </Desktop>
  )
}

export default App
