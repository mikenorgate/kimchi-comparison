import { Desktop } from './desktop/Desktop'
import { MenuBar } from './components/menu-bar/MenuBar'
import { Dock } from './components/dock/Dock'
import { WindowManager } from './components/window/WindowManager'
import { DesktopContextMenu } from './components/context-menu/DesktopContextMenu'
import { Spotlight, SpotlightProvider } from './components/spotlight/Spotlight'

import './apps'

function App() {
  return (
    <Desktop>
      <SpotlightProvider>
        <DesktopContextMenu>
          <MenuBar />
          <WindowManager />
          <Dock />
          <Spotlight />
        </DesktopContextMenu>
      </SpotlightProvider>
    </Desktop>
  )
}

export default App
