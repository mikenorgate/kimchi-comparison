'use client';

import type { AppId } from '@/app/lib/types';
import { Finder } from './Finder';
import { Safari } from './Safari';
import { Notes } from './Notes';
import { Calendar } from './Calendar';
import { Clock } from './Clock';
import { Photos } from './Photos';
import { Music } from './Music';
import { Terminal } from './Terminal';
import { Calculator } from './Calculator';
import { Settings } from './Settings';

const APP_COMPONENTS: Record<AppId, () => React.ReactNode> = {
  finder: Finder,
  safari: Safari,
  notes: Notes,
  terminal: Terminal,
  settings: Settings,
  calculator: Calculator,
  calendar: Calendar,
  clock: Clock,
  photos: Photos,
  music: Music,
};

export function AppContent({ appId }: { appId: AppId }) {
  const Component = APP_COMPONENTS[appId];
  return <Component />;
}
