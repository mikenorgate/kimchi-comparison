import { useEffect, useState } from 'react';
import Desktop from './components/Desktop';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import Window from './components/Window';
import Spotlight from './components/Spotlight';
import LockScreen from './components/LockScreen';
import { useWindowStore } from './os/windowStore';
import { useSystemStore } from './os/systemStore';

function App() {
  const windows = useWindowStore((s) => s.windows);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const theme = useSystemStore((s) => s.theme);
  const locked = useSystemStore((s) => s.locked);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
        e.preventDefault();
        setSpotlightOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
        e.preventDefault();
        if (windows.length > 1) {
          const focusedIdx = windows.findIndex((w) => w.id === useWindowStore.getState().focusedId);
          const next = windows[(focusedIdx + 1) % windows.length];
          if (next) focusWindow(next.id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [windows, focusWindow]);

  if (locked) return <LockScreen />;

  return (
    <Desktop>
      <MenuBar />
      {windows.map((w) => (
        <Window key={w.id} win={w} />
      ))}
      <Dock />
      {spotlightOpen && <Spotlight onClose={() => setSpotlightOpen(false)} />}
    </Desktop>
  );
}

export default App;
