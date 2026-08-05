export const APP_IDS = {
  FINDER: 'finder',
  CALCULATOR: 'calculator',
  NOTES: 'notes',
  CALENDAR: 'calendar',
  CLOCK: 'clock',
  SAFARI: 'safari',
  SETTINGS: 'settings',
}

export const BUILT_IN_APPS = [
  {
    id: APP_IDS.FINDER,
    name: 'Finder',
    icon: 'folder',
    category: 'system',
    defaultSize: { width: 720, height: 480 },
    defaultPosition: { x: 120, y: 80 },
    inDock: true,
    inFinder: false,
  },
  {
    id: APP_IDS.CALCULATOR,
    name: 'Calculator',
    icon: 'gear',
    category: 'productivity',
    defaultSize: { width: 240, height: 360 },
    defaultPosition: { x: 200, y: 120 },
    inDock: true,
    inFinder: true,
  },
  {
    id: APP_IDS.NOTES,
    name: 'Notes',
    icon: 'document',
    category: 'productivity',
    defaultSize: { width: 640, height: 440 },
    defaultPosition: { x: 160, y: 100 },
    inDock: true,
    inFinder: true,
  },
  {
    id: APP_IDS.CALENDAR,
    name: 'Calendar',
    icon: 'calendar',
    category: 'productivity',
    defaultSize: { width: 560, height: 420 },
    defaultPosition: { x: 180, y: 110 },
    inDock: true,
    inFinder: true,
  },
  {
    id: APP_IDS.CLOCK,
    name: 'Clock',
    icon: 'clock',
    category: 'utilities',
    defaultSize: { width: 320, height: 380 },
    defaultPosition: { x: 220, y: 130 },
    inDock: true,
    inFinder: true,
  },
  {
    id: APP_IDS.SAFARI,
    name: 'Safari',
    icon: 'safari',
    category: 'internet',
    defaultSize: { width: 800, height: 540 },
    defaultPosition: { x: 100, y: 60 },
    inDock: true,
    inFinder: true,
  },
  {
    id: APP_IDS.SETTINGS,
    name: 'System Settings',
    icon: 'gear',
    category: 'system',
    defaultSize: { width: 480, height: 520 },
    defaultPosition: { x: 240, y: 90 },
    inDock: false,
    inFinder: true,
  },
]

export function getAppById(id) {
  return BUILT_IN_APPS.find((app) => app.id === id)
}

export function getDockApps() {
  return BUILT_IN_APPS.filter((app) => app.inDock)
}

export function getFinderApps() {
  return BUILT_IN_APPS.filter((app) => app.inFinder)
}
