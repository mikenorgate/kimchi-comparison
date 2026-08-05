import type { SettingCategory } from './types'

export const settingCategories: SettingCategory[] = [
  {
    id: 'wi-fi',
    name: 'Wi-Fi',
    icon: 'wifi',
    settings: [
      { id: 'wifi-enabled', label: 'Wi-Fi', kind: 'toggle', value: true, description: 'Connect to wireless networks.' },
      { id: 'wifi-ask-join', label: 'Ask to join networks', kind: 'checkbox', value: true },
    ],
  },
  {
    id: 'bluetooth',
    name: 'Bluetooth',
    icon: 'bluetooth',
    settings: [
      { id: 'bt-enabled', label: 'Bluetooth', kind: 'toggle', value: true, description: 'Connect to Bluetooth devices.' },
      { id: 'bt-discoverable', label: 'Discoverable', kind: 'checkbox', value: false },
    ],
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: 'palette',
    settings: [
      { id: 'dark-mode', label: 'Dark Mode', kind: 'toggle', value: false, description: 'Use a dark color scheme.' },
      { id: 'transparency', label: 'Reduce Transparency', kind: 'checkbox', value: false },
      { id: 'motion', label: 'Reduce Motion', kind: 'checkbox', value: false },
    ],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: 'bell',
    settings: [
      { id: 'dnd', label: 'Do Not Disturb', kind: 'toggle', value: false },
      { id: 'badges', label: 'Show App Badges', kind: 'checkbox', value: true },
    ],
  },
  {
    id: 'sound',
    name: 'Sound',
    icon: 'volume-2',
    settings: [
      { id: 'sound-effects', label: 'Play sound effects', kind: 'checkbox', value: true },
      { id: 'alert-volume', label: 'Alert volume', kind: 'info', description: 'Mocked slider value: 75%' },
    ],
  },
  {
    id: 'general',
    name: 'General',
    icon: 'settings',
    settings: [
      { id: 'auto-update', label: 'Automatic Updates', kind: 'toggle', value: true },
      { id: 'time-machine', label: 'Time Machine', kind: 'button' },
    ],
  },
]
