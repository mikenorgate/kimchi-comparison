import type { AppDefinition } from './types'
import {
  FinderIcon,
  SafariIcon,
  NotesIcon,
  SettingsIcon,
  CalendarIcon,
  PhotosIcon,
  PhoneIcon,
  JournalIcon,
} from './icons'
import {
  FinderApp,
  SafariApp,
  NotesApp,
  SystemSettingsApp,
  CalendarApp,
  PhotosApp,
  PhoneApp,
  JournalApp,
} from './components'

export const appRegistry: AppDefinition[] = [
  {
    id: 'finder',
    name: 'Finder',
    icon: FinderIcon,
    component: FinderApp,
    category: 'system',
    defaultWidth: 520,
    defaultHeight: 320,
  },
  {
    id: 'safari',
    name: 'Safari',
    icon: SafariIcon,
    component: SafariApp,
    category: 'system',
    defaultWidth: 800,
    defaultHeight: 520,
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: NotesIcon,
    component: NotesApp,
    category: 'productivity',
    defaultWidth: 480,
    defaultHeight: 560,
  },
  {
    id: 'system-settings',
    name: 'System Settings',
    shortName: 'Settings',
    icon: SettingsIcon,
    component: SystemSettingsApp,
    category: 'system',
    defaultWidth: 560,
    defaultHeight: 400,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: CalendarIcon,
    component: CalendarApp,
    category: 'productivity',
    defaultWidth: 560,
    defaultHeight: 440,
  },
  {
    id: 'photos',
    name: 'Photos',
    icon: PhotosIcon,
    component: PhotosApp,
    category: 'media',
    defaultWidth: 720,
    defaultHeight: 480,
  },
  {
    id: 'phone',
    name: 'Phone',
    icon: PhoneIcon,
    component: PhoneApp,
    category: 'communication',
    defaultWidth: 320,
    defaultHeight: 520,
  },
  {
    id: 'journal',
    name: 'Journal',
    icon: JournalIcon,
    component: JournalApp,
    category: 'productivity',
    defaultWidth: 460,
    defaultHeight: 540,
  },
]

export const appRegistryById = new Map<string, AppDefinition>(
  appRegistry.map((app) => [app.id, app]),
)

export function getAppById(id: string): AppDefinition | undefined {
  return appRegistryById.get(id)
}
