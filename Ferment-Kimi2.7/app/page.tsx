'use client';

import { Desktop } from './components/Desktop';
import { MenuBar } from './components/MenuBar';
import { Dock } from './components/Dock';
import { LoginScreen } from './components/LoginScreen';
import { SpacesView } from './components/SpacesView';
import { useShell } from './lib/shellContext';

export default function Home() {
  const { state, unlock } = useShell();

  return (
    <main className="relative h-full w-full overflow-hidden">
      {state.locked && <LoginScreen onUnlock={unlock} />}
      {!state.locked && state.showSpaces && <SpacesView />}
      <Desktop>
        <MenuBar />
        <Dock />
      </Desktop>
    </main>
  );
}
