import { Calculator } from './calculator';
import { Calendar } from './calendar';
import { Finder, FinderIcon } from './finder';
import { Journal } from './journal';
import { Mail } from './mail';
import { Notes } from './notes';
import { Phone } from './phone';
import { Safari, SafariIcon } from './safari';
import { Settings } from './settings';
import type { AppDefinition, AppId } from './types';

export const CORE_APP_IDS: AppId[] = [
  'finder',
  'safari',
  'notes',
  'calculator',
  'calendar',
  'mail',
  'settings',
];

export const apps: AppDefinition[] = [
  {
    id: 'finder',
    title: 'Finder',
    icon: FinderIcon,
    category: 'system',
    component: Finder,
  },
  {
    id: 'safari',
    title: 'Safari',
    icon: SafariIcon,
    category: 'productivity',
    component: Safari,
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: Notes,
    category: 'productivity',
    component: Notes,
  },
  {
    id: 'calculator',
    title: 'Calculator',
    icon: Calculator,
    category: 'utilities',
    component: Calculator,
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    category: 'productivity',
    component: Calendar,
  },
  {
    id: 'mail',
    title: 'Mail',
    icon: Mail,
    category: 'productivity',
    component: Mail,
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    category: 'system',
    component: Settings,
  },
  {
    id: 'phone',
    title: 'Phone',
    icon: Phone,
    category: 'utilities',
    component: Phone,
  },
  {
    id: 'journal',
    title: 'Journal',
    icon: Journal,
    category: 'productivity',
    component: Journal,
  },
];

export function getAppById(id: AppId): AppDefinition {
  const app = apps.find((entry) => entry.id === id);
  if (!app) {
    throw new Error(`App with id "${id}" not found in registry.`);
  }
  return app;
}
