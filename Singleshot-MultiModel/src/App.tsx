import { useEffect } from 'react';
import { useSystemStore } from './stores/systemStore';
import Desktop from './components/Desktop';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import WindowManager from './components/WindowManager';

export default function App() {
  const booted = useSystemStore((s) => s.booted);
  const setBooted = useSystemStore((s) => s.setBooted);

  useEffect(() => {
    setBooted(true);
  }, [setBooted]);

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
    </div>
  );
}
