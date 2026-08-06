/* eslint-disable react-refresh/only-export-components */
import type { ComponentType } from 'react';

import type { AppDefinition } from '../types/os';

/**
 * Minimal placeholder used by the window manager to render an empty
 * Finder window. Later chunks (Chunk 5+) will replace this with the real
 * Finder implementation by calling `useOSStore.registerApp()` with a
 * definition whose `component` is the real Finder.
 */
export function FinderPlaceholder({ windowId }: { windowId: string }): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 8,
        padding: 24,
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 48 }}>📁</div>
      <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>Finder</div>
      <div style={{ fontSize: 13 }}>Placeholder Finder window</div>
      <div style={{ fontSize: 11, opacity: 0.7 }}>window id: {windowId}</div>
    </div>
  );
}

FinderPlaceholder.displayName = 'FinderPlaceholder';

const finderDefinition: AppDefinition = {
  id: 'finder',
  name: 'Finder',
  icon: '📁',
  category: 'system',
  component: FinderPlaceholder as ComponentType<{ windowId: string }>,
  canOpenMultiple: false,
  defaultWidth: 720,
  defaultHeight: 480,
  minWidth: 320,
  minHeight: 240,
};

/**
 * Minimal app registry. Register all built-in apps here. Subsequent
 * chunks will replace these registrations with real implementations.
 *
 * Note: the registration is intentionally idempotent — calling this more
 * than once simply overwrites the previous definition in the store.
 */
export function registerApps(
  register: (app: AppDefinition) => void,
): void {
  register(finderDefinition);
}

export { finderDefinition };
export default registerApps;
