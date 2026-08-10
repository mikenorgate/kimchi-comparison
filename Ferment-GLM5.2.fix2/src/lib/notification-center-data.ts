/**
 * Mock notifications + weather data for Notification Center.
 *
 * In real macOS these come from the notification service + WeatherKit; here
 * they're canned representative content.
 */
export interface NCNotification {
  id: string
  app: string
  appIcon: string
  title: string
  body: string
  time: string
}

export const NOTIFICATIONS: NCNotification[] = [
  {
    id: 'nc1',
    app: 'Messages',
    appIcon: '💬',
    title: 'Alex Chen',
    body: 'Sounds great — see you at 3! 🎉',
    time: '2m ago',
  },
  {
    id: 'nc2',
    app: 'Mail',
    appIcon: '✉',
    title: 'GitHub',
    body: 'Your weekly digest is ready to read',
    time: '15m ago',
  },
  {
    id: 'nc3',
    app: 'Calendar',
    appIcon: '📅',
    title: 'Design Review',
    body: 'Starts in 30 minutes — Conference Room B',
    time: '28m ago',
  },
  {
    id: 'nc4',
    app: 'Reminders',
    appIcon: '✓',
    title: 'Pick up groceries',
    body: 'Milk, eggs, coffee, bread',
    time: '1h ago',
  },
]

export interface WeatherDay {
  day: string
  icon: string
  high: number
  low: number
}

export const WEATHER: {
  location: string
  current: number
  condition: string
  icon: string
  high: number
  low: number
  forecast: WeatherDay[]
} = {
  location: 'Cupertino',
  current: 72,
  condition: 'Sunny',
  icon: '☀️',
  high: 76,
  low: 58,
  forecast: [
    { day: 'Mon', icon: '☀️', high: 76, low: 58 },
    { day: 'Tue', icon: '⛅', high: 71, low: 55 },
    { day: 'Wed', icon: '🌤', high: 68, low: 54 },
    { day: 'Thu', icon: '🌧', high: 62, low: 50 },
    { day: 'Fri', icon: '☀️', high: 70, low: 56 },
  ],
}
