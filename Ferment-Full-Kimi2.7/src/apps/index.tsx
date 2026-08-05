import {
  Folder,
  Settings,
  Globe,
  Terminal as TerminalIcon,
  Calculator as CalculatorIcon,
  StickyNote,
  Mail as MailIcon,
  MessageSquare,
  Calendar as CalendarIcon,
  Image,
  Music as MusicIcon,
  Tv as TvIcon,
  CloudSun,
  Clock as ClockIcon,
  Map as MapIcon,
  Video,
  CheckCircle2,
  BookOpen,
  AppWindow,
  Contact,
  Newspaper,
  TrendingUp,
  Home,
  Mic,
  LayoutGrid,
  Lock,
} from 'lucide-react'
import { registerApp } from './registry'
import { Finder } from './finder/Finder'
import { SystemSettings } from './system-settings/SystemSettings'
import { Safari } from './safari/Safari'
import { Terminal } from './terminal/Terminal'
import { Calculator } from './calculator/Calculator'
import { Notes } from './notes/Notes'
import { Calendar } from './calendar/Calendar'
import { Reminders } from './reminders/Reminders'
import { Clock } from './clock/Clock'
import { Weather } from './weather/Weather'
import { Mail } from './mail/Mail'
import { Messages } from './messages/Messages'
import { Photos } from './photos/Photos'
import { Music } from './music/Music'
import { Tv } from './tv/Tv'
import { Maps } from './maps/Maps'
import { FaceTime } from './facetime/FaceTime'
import { AppStore } from './app-store/AppStore'
import { Contacts } from './contacts/Contacts'
import { Books } from './books/Books'
import { Podcasts } from './podcasts/Podcasts'
import { News } from './news/News'
import { Stocks } from './stocks/Stocks'
import { Home as HomeApp } from './home/Home'
import { VoiceMemos } from './voice-memos/VoiceMemos'
import { Freeform } from './freeform/Freeform'
import { Passwords } from './passwords/Passwords'

export function registerDefaultApps() {
  registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: Finder, defaultSize: { width: 820, height: 520 } })
  registerApp({ id: 'settings', name: 'System Settings', icon: Settings, component: SystemSettings, defaultSize: { width: 760, height: 520 } })
  registerApp({ id: 'safari', name: 'Safari', icon: Globe, component: Safari, defaultSize: { width: 1024, height: 700 } })
  registerApp({ id: 'terminal', name: 'Terminal', icon: TerminalIcon, component: Terminal, defaultSize: { width: 720, height: 460 } })
  registerApp({ id: 'calculator', name: 'Calculator', icon: CalculatorIcon, component: Calculator, defaultSize: { width: 280, height: 420 } })
  registerApp({ id: 'notes', name: 'Notes', icon: StickyNote, component: Notes, defaultSize: { width: 720, height: 520 } })
  registerApp({ id: 'mail', name: 'Mail', icon: MailIcon, component: Mail, defaultSize: { width: 960, height: 620 } })
  registerApp({ id: 'messages', name: 'Messages', icon: MessageSquare, component: Messages, defaultSize: { width: 720, height: 540 } })
  registerApp({ id: 'calendar', name: 'Calendar', icon: CalendarIcon, component: Calendar, defaultSize: { width: 820, height: 620 } })
  registerApp({ id: 'photos', name: 'Photos', icon: Image, component: Photos, defaultSize: { width: 900, height: 640 } })
  registerApp({ id: 'music', name: 'Music', icon: MusicIcon, component: Music, defaultSize: { width: 900, height: 620 } })
  registerApp({ id: 'maps', name: 'Maps', icon: MapIcon, component: Maps, defaultSize: { width: 900, height: 640 } })
  registerApp({ id: 'tv', name: 'TV', icon: TvIcon, component: Tv, defaultSize: { width: 900, height: 620 } })
  registerApp({ id: 'weather', name: 'Weather', icon: CloudSun, component: Weather, defaultSize: { width: 360, height: 560 } })
  registerApp({ id: 'clock', name: 'Clock', icon: ClockIcon, component: Clock, defaultSize: { width: 360, height: 420 } })
  registerApp({ id: 'facetime', name: 'FaceTime', icon: Video, component: FaceTime, defaultSize: { width: 720, height: 520 } })
  registerApp({ id: 'reminders', name: 'Reminders', icon: CheckCircle2, component: Reminders, defaultSize: { width: 720, height: 520 } })
  registerApp({ id: 'appstore', name: 'App Store', icon: AppWindow, component: AppStore, defaultSize: { width: 900, height: 620 } })
  registerApp({ id: 'contacts', name: 'Contacts', icon: Contact, component: Contacts, defaultSize: { width: 720, height: 520 } })
  registerApp({ id: 'books', name: 'Books', icon: BookOpen, component: Books, defaultSize: { width: 820, height: 620 } })
  registerApp({ id: 'podcasts', name: 'Podcasts', icon: Mic, component: Podcasts, defaultSize: { width: 900, height: 620 } })
  registerApp({ id: 'news', name: 'News', icon: Newspaper, component: News, defaultSize: { width: 900, height: 620 } })
  registerApp({ id: 'stocks', name: 'Stocks', icon: TrendingUp, component: Stocks, defaultSize: { width: 820, height: 560 } })
  registerApp({ id: 'home', name: 'Home', icon: Home, component: HomeApp, defaultSize: { width: 720, height: 560 } })
  registerApp({ id: 'voicememos', name: 'Voice Memos', icon: Mic, component: VoiceMemos, defaultSize: { width: 520, height: 420 } })
  registerApp({ id: 'freeform', name: 'Freeform', icon: LayoutGrid, component: Freeform, defaultSize: { width: 900, height: 640 } })
  registerApp({ id: 'passwords', name: 'Passwords', icon: Lock, component: Passwords, defaultSize: { width: 720, height: 520 } })
}

registerDefaultApps()
