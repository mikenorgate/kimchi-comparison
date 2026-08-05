import type { AppCategory, AppItem } from './types'

export const categories: AppCategory[] = [
  'All',
  'Productivity',
  'Games',
  'Social',
  'Utilities',
  'Creativity',
]

export const featuredApp: AppItem = {
  id: 'featured-1',
  name: 'Focus Flow',
  developer: 'Mindful Apps',
  category: 'Productivity',
  rating: 4.8,
  reviews: 12400,
  price: 'Free',
  description:
    'Master your day with Focus Flow. Beautiful timers, habit tracking, and distraction blocking to keep you in the zone.',
  color: 'from-tahoe-purple to-tahoe-pink',
}

export const apps: AppItem[] = [
  featuredApp,
  {
    id: 'app-1',
    name: 'Pixel Sketch',
    developer: 'Creative Studio',
    category: 'Creativity',
    rating: 4.5,
    reviews: 3200,
    price: '$4.99',
    description:
      'Draw and paint with a complete set of brushes, layers, and vector tools designed for desktop creativity.',
    color: 'from-orange-400 to-amber-500',
  },
  {
    id: 'app-2',
    name: 'Cloud Drive',
    developer: 'Sky Storage',
    category: 'Utilities',
    rating: 4.2,
    reviews: 8900,
    price: 'Free',
    description:
      'Sync your files across every device with end-to-end encryption and smart offline folders.',
    color: 'from-sky-400 to-blue-600',
  },
  {
    id: 'app-3',
    name: 'Wordy',
    developer: 'Lexicon Labs',
    category: 'Productivity',
    rating: 4.6,
    reviews: 5600,
    price: '$9.99',
    description:
      'A modern writing studio with focus mode, markdown support, and seamless cloud publishing.',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'app-4',
    name: 'Star Quest',
    developer: 'Nebula Games',
    category: 'Games',
    rating: 4.9,
    reviews: 21000,
    price: '$19.99',
    description:
      'Explore galaxies, build your fleet, and forge alliances in this epic space adventure.',
    color: 'from-indigo-500 to-violet-700',
  },
  {
    id: 'app-5',
    name: 'Chat Bubble',
    developer: 'Connect Inc.',
    category: 'Social',
    rating: 4.3,
    reviews: 15400,
    price: 'Free',
    description:
      'Stay close to friends and communities with channels, voice rooms, and shared media.',
    color: 'from-rose-400 to-red-600',
  },
  {
    id: 'app-6',
    name: 'Task Titan',
    developer: 'Productive People',
    category: 'Productivity',
    rating: 4.7,
    reviews: 4300,
    price: '$6.99',
    description:
      'Organize projects, delegate tasks, and track progress with powerful team dashboards.',
    color: 'from-tahoe-accent to-tahoe-teal',
  },
  {
    id: 'app-7',
    name: 'Neon Racer',
    developer: 'Speedsoft',
    category: 'Games',
    rating: 4.4,
    reviews: 6700,
    price: '$3.99',
    description:
      'Race through neon-lit cities with tight controls, customization, and online leaderboards.',
    color: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'app-8',
    name: 'SafeKey',
    developer: 'Lockdown Security',
    category: 'Utilities',
    rating: 4.8,
    reviews: 9800,
    price: '$2.99',
    description:
      'Generate strong passwords, store secrets securely, and autofill logins everywhere.',
    color: 'from-slate-500 to-slate-700',
  },
]
