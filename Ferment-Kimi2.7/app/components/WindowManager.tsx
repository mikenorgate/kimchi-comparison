'use client';

import { useShell } from '@/app/lib/shellContext';
import { WindowFrame } from './WindowFrame';
import { AppContent } from './apps';

export function WindowManager() {
  const { state } = useShell();

  return (
    <div data-testid="window-manager" className="pointer-events-none absolute inset-0">
      {state.windows.map((win) => (
        <div key={win.id} className="pointer-events-auto">
          <WindowFrame window={win}>
            <div data-testid={`app-content-${win.appId}`} className="h-full w-full overflow-hidden">
              <AppContent appId={win.appId} />
            </div>
          </WindowFrame>
        </div>
      ))}
    </div>
  );
}
