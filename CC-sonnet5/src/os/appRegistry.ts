import type { AppDef } from './types';
import Finder from '../apps/finder/Finder';
import Notes from '../apps/notes/Notes';
import TextEdit from '../apps/textedit/TextEdit';
import Calculator from '../apps/calculator/Calculator';
import Safari from '../apps/safari/Safari';
import Settings from '../apps/settings/Settings';
import Placeholder from '../apps/placeholder/Placeholder';

export const APPS: AppDef[] = [
  {
    id: 'finder',
    title: 'Finder',
    icon: '🙂',
    color: 'linear-gradient(160deg, #6fc7ff, #2f6fe0)',
    component: Finder,
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 480, height: 320 },
    functional: false,
  },
  {
    id: 'safari',
    title: 'Safari',
    icon: '🧭',
    color: 'linear-gradient(160deg, #6fd0ff, #2f8fe0)',
    component: Safari,
    defaultSize: { width: 900, height: 600 },
    minSize: { width: 480, height: 360 },
    functional: false,
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: '🗒️',
    color: 'linear-gradient(160deg, #ffe38a, #ffb400)',
    component: Notes,
    defaultSize: { width: 720, height: 500 },
    minSize: { width: 420, height: 320 },
    functional: false,
  },
  {
    id: 'textedit',
    title: 'TextEdit',
    icon: '📝',
    color: 'linear-gradient(160deg, #ffffff, #d7d7d7)',
    component: TextEdit,
    defaultSize: { width: 640, height: 480 },
    minSize: { width: 360, height: 280 },
    functional: true,
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: '🧮',
    color: 'linear-gradient(160deg, #4a4a4a, #1c1c1e)',
    component: Calculator,
    defaultSize: { width: 300, height: 460 },
    minSize: { width: 280, height: 420 },
    functional: false,
  },
  {
    id: 'settings',
    title: 'System Settings',
    icon: '⚙️',
    color: 'linear-gradient(160deg, #b8b8bd, #6e6e73)',
    component: Settings,
    defaultSize: { width: 680, height: 480 },
    minSize: { width: 520, height: 380 },
    functional: false,
  },
  {
    id: 'mail',
    title: 'Mail',
    icon: '✉️',
    color: 'linear-gradient(160deg, #7fb8ff, #2f6fe0)',
    component: Placeholder,
    defaultSize: { width: 600, height: 420 },
    functional: false,
  },
  {
    id: 'messages',
    title: 'Messages',
    icon: '💬',
    color: 'linear-gradient(160deg, #7bffa0, #24c95a)',
    component: Placeholder,
    defaultSize: { width: 600, height: 420 },
    functional: false,
  },
  {
    id: 'photos',
    title: 'Photos',
    icon: '🌈',
    color: 'linear-gradient(160deg, #ff9a9e, #fecfef)',
    component: Placeholder,
    defaultSize: { width: 600, height: 420 },
    functional: false,
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: '📅',
    color: 'linear-gradient(160deg, #ffffff, #ff5b4d)',
    component: Placeholder,
    defaultSize: { width: 600, height: 420 },
    functional: false,
  },
  {
    id: 'reminders',
    title: 'Reminders',
    icon: '✅',
    color: 'linear-gradient(160deg, #ffffff, #f0f0f0)',
    component: Placeholder,
    defaultSize: { width: 600, height: 420 },
    functional: false,
  },
  {
    id: 'maps',
    title: 'Maps',
    icon: '🗺️',
    color: 'linear-gradient(160deg, #9be89b, #35a35a)',
    component: Placeholder,
    defaultSize: { width: 600, height: 420 },
    functional: false,
  },
  {
    id: 'music',
    title: 'Music',
    icon: '🎵',
    color: 'linear-gradient(160deg, #ff8ac2, #fa3c8c)',
    component: Placeholder,
    defaultSize: { width: 600, height: 420 },
    functional: false,
  },
];

const APP_MAP = new Map(APPS.map((a) => [a.id, a]));

export function getApp(id: string): AppDef | undefined {
  return APP_MAP.get(id);
}
