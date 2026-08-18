import { registerApp, type AppDefinition } from './store/app-registry'
import { Finder } from './apps/finder/finder'
import { Notes } from './apps/notes/notes'
import { Reminders } from './apps/reminders/reminders'
import { Calendar } from './apps/calendar/calendar'
import { Calculator } from './apps/calculator/calculator'
import { TextEdit } from './apps/textedit/textedit'
import { SystemSettings } from './apps/system-settings/system-settings'
import { Terminal } from './apps/terminal/terminal'
import { ActivityMonitor } from './apps/activity-monitor/activity-monitor'
import { Clock } from './apps/clock/clock'
import { Photos } from './apps/photos/photos'
import { Music } from './apps/music/music'
import { TV } from './apps/tv/tv'
import { Podcasts } from './apps/podcasts/podcasts'
import { Mail } from './apps/mail/mail'
import { Messages } from './apps/messages/messages'
import { FaceTime } from './apps/facetime/facetime'
import { Phone } from './apps/phone/phone'
import { Safari } from './apps/safari/safari'
import { Maps } from './apps/maps/maps'
import { Weather } from './apps/weather/weather'
import { Stocks } from './apps/stocks/stocks'

const finderApp: AppDefinition = {
  id: 'finder',
  name: 'Finder',
  icon: 'finder',
  component: Finder,
  defaultWidth: 720,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'New Finder Window', shortcut: '⌘N' }, { label: 'New Folder', shortcut: '⇧⌘N' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }, { label: 'Redo', shortcut: '⇧⌘Z' }] },
    { label: 'View', items: [{ label: 'as Icons' }, { label: 'as List' }, { label: 'as Columns' }] },
    { label: 'Go', items: [{ label: 'Back', shortcut: '⌘[' }, { label: 'Forward', shortcut: '⌘]' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
    { label: 'Help', items: [{ label: 'Search' }] },
  ],
}

const notesApp: AppDefinition = {
  id: 'notes',
  name: 'Notes',
  icon: 'notes',
  component: Notes,
  defaultWidth: 680,
  defaultHeight: 440,
  menus: [
    { label: 'File', items: [{ label: 'New Note', shortcut: '⌘N' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const remindersApp: AppDefinition = {
  id: 'reminders',
  name: 'Reminders',
  icon: 'reminders',
  component: Reminders,
  defaultWidth: 560,
  defaultHeight: 420,
  menus: [
    { label: 'File', items: [{ label: 'New Reminder', shortcut: '⌘N' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const calendarApp: AppDefinition = {
  id: 'calendar',
  name: 'Calendar',
  icon: 'calendar',
  component: Calendar,
  defaultWidth: 700,
  defaultHeight: 500,
  menus: [
    { label: 'File', items: [{ label: 'New Event', shortcut: '⌘N' }] },
    { label: 'View', items: [{ label: 'Day' }, { label: 'Week' }, { label: 'Month' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const calculatorApp: AppDefinition = {
  id: 'calculator',
  name: 'Calculator',
  icon: 'calculator',
  component: Calculator,
  defaultWidth: 260,
  defaultHeight: 400,
  singleWindow: true,
  menus: [
    { label: 'View', items: [{ label: 'Basic' }, { label: 'Scientific' }] },
    { label: 'Edit', items: [{ label: 'Copy', shortcut: '⌘C' }, { label: 'Paste', shortcut: '⌘V' }] },
  ],
}

const textEditApp: AppDefinition = {
  id: 'textedit',
  name: 'TextEdit',
  icon: 'textedit',
  component: TextEdit,
  defaultWidth: 600,
  defaultHeight: 460,
  menus: [
    { label: 'File', items: [{ label: 'New', shortcut: '⌘N' }, { label: 'Open…', shortcut: '⌘O' }, { label: 'Save', shortcut: '⌘S' }] },
    { label: 'Format', items: [{ label: 'Plain Text' }, { label: 'Rich Text' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }, { label: 'Redo', shortcut: '⇧⌘Z' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const systemSettingsApp: AppDefinition = {
  id: 'system-settings',
  name: 'System Settings',
  icon: 'settings',
  component: SystemSettings,
  defaultWidth: 640,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'View', items: [{ label: 'Sidebar' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const terminalApp: AppDefinition = {
  id: 'terminal',
  name: 'Terminal',
  icon: 'terminal',
  component: Terminal,
  defaultWidth: 680,
  defaultHeight: 420,
  menus: [
    { label: 'Shell', items: [{ label: 'New Window', shortcut: '⌘N' }, { label: 'Close', shortcut: '⌘W' }] },
    { label: 'Edit', items: [{ label: 'Clear Screen', shortcut: '⌘K' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const activityMonitorApp: AppDefinition = {
  id: 'activity-monitor',
  name: 'Activity Monitor',
  icon: 'activity',
  component: ActivityMonitor,
  defaultWidth: 680,
  defaultHeight: 420,
  menus: [
    { label: 'View', items: [{ label: 'All Processes' }, { label: 'My Processes' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const clockApp: AppDefinition = {
  id: 'clock',
  name: 'Clock',
  icon: 'clock',
  component: Clock,
  defaultWidth: 360,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const photosApp: AppDefinition = {
  id: 'photos',
  name: 'Photos',
  icon: 'photos',
  component: Photos,
  defaultWidth: 680,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'Import…', shortcut: '⇧⌘I' }] },
    { label: 'View', items: [{ label: 'Grid' }, { label: 'Years' }, { label: 'Months' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const musicApp: AppDefinition = {
  id: 'music',
  name: 'Music',
  icon: 'music',
  component: Music,
  defaultWidth: 720,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'New Playlist', shortcut: '⌘N' }] },
    { label: 'Controls', items: [{ label: 'Play/Pause', shortcut: 'Space' }, { label: 'Next', shortcut: '⌘→' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const tvApp: AppDefinition = {
  id: 'tv',
  name: 'TV',
  icon: 'tv',
  component: TV,
  defaultWidth: 720,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Controls', items: [{ label: 'Play/Pause', shortcut: 'Space' }, { label: 'Fullscreen', shortcut: '⌃⌘F' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const podcastsApp: AppDefinition = {
  id: 'podcasts',
  name: 'Podcasts',
  icon: 'podcasts',
  component: Podcasts,
  defaultWidth: 720,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Controls', items: [{ label: 'Play/Pause', shortcut: 'Space' }, { label: 'Skip', shortcut: '⏩' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const mailApp: AppDefinition = {
  id: 'mail',
  name: 'Mail',
  icon: 'mail',
  component: Mail,
  defaultWidth: 780,
  defaultHeight: 500,
  menus: [
    { label: 'File', items: [{ label: 'New Message', shortcut: '⌘N' }, { label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
    { label: 'Mailbox', items: [{ label: 'Get New Mail', shortcut: '⇧⌘N' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const messagesApp: AppDefinition = {
  id: 'messages',
  name: 'Messages',
  icon: 'messages',
  component: Messages,
  defaultWidth: 680,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'New Message', shortcut: '⌘N' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const facetimeApp: AppDefinition = {
  id: 'facetime',
  name: 'FaceTime',
  icon: 'facetime',
  component: FaceTime,
  defaultWidth: 500,
  defaultHeight: 480,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const phoneApp: AppDefinition = {
  id: 'phone',
  name: 'Phone',
  icon: 'phone',
  component: Phone,
  defaultWidth: 360,
  defaultHeight: 560,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const safariApp: AppDefinition = {
  id: 'safari',
  name: 'Safari',
  icon: 'safari',
  component: Safari,
  defaultWidth: 800,
  defaultHeight: 560,
  menus: [
    { label: 'File', items: [{ label: 'New Tab', shortcut: '⌘T' }, { label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'History', items: [{ label: 'Clear History…' }] },
    { label: 'Bookmarks', items: [{ label: 'Add Bookmark', shortcut: '⌘D' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const mapsApp: AppDefinition = {
  id: 'maps',
  name: 'Maps',
  icon: 'maps',
  component: Maps,
  defaultWidth: 720,
  defaultHeight: 500,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'View', items: [{ label: 'Zoom In', shortcut: '⌘+' }, { label: 'Zoom Out', shortcut: '⌘-' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const weatherApp: AppDefinition = {
  id: 'weather',
  name: 'Weather',
  icon: 'weather',
  component: Weather,
  defaultWidth: 500,
  defaultHeight: 560,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

const stocksApp: AppDefinition = {
  id: 'stocks',
  name: 'Stocks',
  icon: 'stocks',
  component: Stocks,
  defaultWidth: 480,
  defaultHeight: 560,
  menus: [
    { label: 'File', items: [{ label: 'Close Window', shortcut: '⌘W' }] },
    { label: 'Edit', items: [{ label: 'Undo', shortcut: '⌘Z' }] },
    { label: 'Window', items: [{ label: 'Minimize', shortcut: '⌘M' }] },
  ],
}

/**
 * Register all built-in apps. Called once at app startup.
 * Later phases will add their own registerApp calls.
 */
export function registerBuiltInApps(): void {
  registerApp(finderApp)
  registerApp(notesApp)
  registerApp(remindersApp)
  registerApp(calendarApp)
  registerApp(calculatorApp)
  registerApp(textEditApp)
  registerApp(systemSettingsApp)
  registerApp(terminalApp)
  registerApp(activityMonitorApp)
  registerApp(clockApp)
  registerApp(photosApp)
  registerApp(musicApp)
  registerApp(tvApp)
  registerApp(podcastsApp)
  registerApp(mailApp)
  registerApp(messagesApp)
  registerApp(facetimeApp)
  registerApp(phoneApp)
  registerApp(safariApp)
  registerApp(mapsApp)
  registerApp(weatherApp)
  registerApp(stocksApp)
}
