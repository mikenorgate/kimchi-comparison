'use client';

import { type ReactNode } from 'react';
import { WindowManager } from './WindowManager';

interface DesktopProps {
  children?: ReactNode;
  'data-testid'?: string;
}

export function Desktop({ children, 'data-testid': testId }: DesktopProps) {
  return (
    <div
      data-testid={testId ?? 'desktop'}
      className="fixed inset-0 overflow-hidden"
      style={{ background: 'var(--desktop-wallpaper)', backgroundSize: 'cover' }}
      aria-label="desktop"
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 top-0 bottom-0 flex flex-col"
        style={{
          paddingTop: 'var(--menubar-height)',
          paddingBottom: 'var(--dock-height)',
        }}
      >
        <div className="relative flex-1">
          {children}
          <WindowManager />
        </div>
      </div>
    </div>
  );
}
