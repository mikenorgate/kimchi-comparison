import { useCallback, useEffect, useState } from 'react';
import { useSystemStore } from './stores/systemStore';
import Desktop from './components/Desktop';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import WindowManager from './components/WindowManager';
import ForceQuitDialog from './components/ForceQuitDialog';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const booted = useSystemStore((s) => s.booted);
  const setBooted = useSystemStore((s) => s.setBooted);

  const [forceQuitOpen, setForceQuitOpen] = useState(false);
  const openForceQuit = useCallback(() => setForceQuitOpen(true), []);
  const closeForceQuit = useCallback(() => setForceQuitOpen(false), []);

  useEffect(() => {
    setBooted(true);
  }, [setBooted]);

  useKeyboardShortcuts({ onForceQuit: openForceQuit });

  if (!booted) {
    return null;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Desktop>
        <WindowManager />
      </Desktop>
      <div className="absolute inset-x-0 top-0 z-40">
        <MenuBar />
      </div>
      <Dock />
      <ForceQuitDialog open={forceQuitOpen} onClose={closeForceQuit} />
    </div>
  );
}
