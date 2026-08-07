import { Calendar as CalendarIcon, Calculator as CalcIcon, CheckSquare, Cloud, Compass, Folder, Image as ImageIcon, Mail as MailIcon, MessageSquare, Settings as SettingsIcon, StickyNote, Terminal as TerminalIcon } from 'lucide-react'
import { registerApp } from '../lib/registry'
import { Finder } from './Finder'
import { Terminal } from './Terminal'
import { Calculator } from './Calculator'
import { Notes } from './Notes'
import { Settings } from './Settings'
import { Mail } from './Mail'
import { Messages } from './Messages'
import { Calendar } from './Calendar'
import { Reminders } from './Reminders'
import { Safari } from './Safari'
import { Photos } from './Photos'
import { Weather } from './Weather'

const apps = [
  {
    appId: 'finder',
    title: 'Finder',
    icon: <Folder size={28} />,
    defaultSize: { w: 720, h: 480 },
    render: () => <Finder />,
  },
  {
    appId: 'calculator',
    title: 'Calculator',
    icon: <CalcIcon size={28} />,
    defaultSize: { w: 320, h: 480 },
    render: () => <Calculator />,
  },
  {
    appId: 'notes',
    title: 'Notes',
    icon: <StickyNote size={28} />,
    defaultSize: { w: 640, h: 460 },
    render: () => <Notes />,
  },
  {
    appId: 'terminal',
    title: 'Terminal',
    icon: <TerminalIcon size={28} />,
    defaultSize: { w: 640, h: 400 },
    render: () => <Terminal />,
  },
  {
    appId: 'mail',
    title: 'Mail',
    icon: <MailIcon size={28} />,
    defaultSize: { w: 800, h: 520 },
    render: () => <Mail />,
  },
  {
    appId: 'messages',
    title: 'Messages',
    icon: <MessageSquare size={28} />,
    defaultSize: { w: 640, h: 480 },
    render: () => <Messages />,
  },
  {
    appId: 'calendar',
    title: 'Calendar',
    icon: <CalendarIcon size={28} />,
    defaultSize: { w: 720, h: 500 },
    render: () => <Calendar />,
  },
  {
    appId: 'weather',
    title: 'Weather',
    icon: <Cloud size={28} />,
    defaultSize: { w: 640, h: 520 },
    render: () => <Weather />,
  },
  {
    appId: 'photos',
    title: 'Photos',
    icon: <ImageIcon size={28} />,
    defaultSize: { w: 720, h: 520 },
    render: () => <Photos />,
  },
  {
    appId: 'safari',
    title: 'Safari',
    icon: <Compass size={28} />,
    defaultSize: { w: 800, h: 560 },
    render: () => <Safari />,
  },
  {
    appId: 'reminders',
    title: 'Reminders',
    icon: <CheckSquare size={28} />,
    defaultSize: { w: 560, h: 440 },
    render: () => <Reminders />,
  },
  {
    appId: 'settings',
    title: 'System Settings',
    icon: <SettingsIcon size={28} />,
    defaultSize: { w: 640, h: 480 },
    render: () => <Settings />,
  },
]

apps.forEach(registerApp)
