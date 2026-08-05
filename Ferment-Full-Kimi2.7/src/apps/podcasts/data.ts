import type { Podcast, Episode } from './types'

export const podcasts: Podcast[] = [
  {
    id: 'pod-1',
    title: 'Design Details',
    author: 'Spec',
    artwork: 'from-violet-400 to-fuchsia-500',
    category: 'Design',
  },
  {
    id: 'pod-2',
    title: 'The Daily',
    author: 'The New York Times',
    artwork: 'from-gray-200 to-gray-400',
    category: 'News',
  },
  {
    id: 'pod-3',
    title: 'How I Built This',
    author: 'NPR',
    artwork: 'from-orange-300 to-red-400',
    category: 'Business',
  },
  {
    id: 'pod-4',
    title: 'Reply All',
    author: 'Gimlet',
    artwork: 'from-green-300 to-emerald-500',
    category: 'Technology',
  },
]

export const episodes: Episode[] = [
  {
    id: 'ep-1',
    podcastId: 'pod-1',
    title: 'Interfaces That Breathe',
    description: 'Exploring the subtle motion and space in modern app design.',
    duration: 3240,
    date: 'Today',
  },
  {
    id: 'ep-2',
    podcastId: 'pod-1',
    title: 'The Typography Episode',
    description: 'A deep dive into type systems and readability at scale.',
    duration: 2850,
    date: 'Yesterday',
  },
  {
    id: 'ep-3',
    podcastId: 'pod-2',
    title: 'The Weekend Briefing',
    description: 'The biggest stories of the week, unpacked.',
    duration: 1560,
    date: 'Today',
  },
  {
    id: 'ep-4',
    podcastId: 'pod-3',
    title: 'Patagonia: Yvon Chouinard',
    description: 'How a climber built a billion-dollar conscious company.',
    duration: 3840,
    date: 'Mon',
  },
  {
    id: 'ep-5',
    podcastId: 'pod-4',
    title: 'The Case of the Missing Hit',
    description: 'A song no one remembers — except one person.',
    duration: 4020,
    date: 'Tue',
  },
]
