import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import {
  createWindowManagerStore,
  type WindowManagerStore,
  type WindowsState,
} from './windowsStore';

export type { WindowManagerStore, WindowState, WindowsState } from './windowsStore';
export { createWindowManagerStore } from './windowsStore';

export const WindowManagerContext = createContext<WindowManagerStore | null>(null);

export function useWindowManager(): WindowManagerStore {
  const store = useContext(WindowManagerContext);
  if (store === null) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  useSyncExternalStore(
    (callback) => store.subscribe(callback),
    () => store.state,
    () => store.state
  );
  return store;
}

export function WindowManagerProvider({
  children,
  initialState,
}: {
  readonly children: React.ReactNode;
  readonly initialState?: WindowsState;
}): React.ReactElement {
  const store = useMemo(() => createWindowManagerStore(initialState), [initialState]);
  return (
    <WindowManagerContext.Provider value={store}>
      {children}
    </WindowManagerContext.Provider>
  );
}
