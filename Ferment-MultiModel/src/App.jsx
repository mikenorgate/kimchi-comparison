import { useEffect, useState } from 'react';
import Desktop from './components/Desktop';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import ControlCenter from './components/ControlCenter';
import Spotlight from './components/Spotlight';
import WindowManager from './components/WindowManager.jsx';
import {
  WindowProvider,
  useWindowActions,
  useWindows,
} from './contexts/WindowContext.jsx';

function AppShell() {
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const { activeAppId } = useWindows();
  const { openApp } = useWindowActions();

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setSpotlightOpen((open) => !open);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Menu bar reads the active app from WindowContext. The reducer
  // normalizes `activeAppId` to a curated app id or null; when null we
  // fall back to "Finder" so the label remains stable.
  const activeApp = activeAppId ?? 'Finder';

  return (
    <Desktop>
      <div className="relative z-50">
        <MenuBar
          activeApp={activeApp}
          onMenuAction={(type, label) => {
            console.log('[menu]', type, label);
          }}
        />
        <div className="absolute top-1 right-2">
          <ControlCenter
            className="scale-90 origin-top-right"
            onClose={() => {}}
          />
        </div>
      </div>

      <WindowManager />

      <Spotlight
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onOpenApp={(id) => {
          openApp(id);
          setSpotlightOpen(false);
        }}
        onOpenFile={() => setSpotlightOpen(false)}
      />

      <Dock />
    </Desktop>
  );
}

function App() {
  return (
    <WindowProvider>
      <AppShell />
    </WindowProvider>
  );
}

export default App;
