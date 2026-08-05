import type { Category, Movie } from './types'

export const movies: Movie[] = [
  {
    id: 'mv-1',
    title: 'Starlight Voyage',
    genre: 'Sci-Fi',
    duration: '2h 14m',
    description:
      'A crew of explorers ventures beyond the edge of the known galaxy.',
    gradient: 'from-indigo-500 to-purple-700',
    featured: true,
  },
  {
    id: 'mv-2',
    title: 'Coastal Dreams',
    genre: 'Drama',
    duration: '1h 52m',
    description:
      'Two strangers reconnect in a quiet seaside town over one summer.',
    gradient: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'mv-3',
    title: 'Midnight Heist',
    genre: 'Thriller',
    duration: '2h 05m',
    description:
      'A master thief assembles a team for one last impossible job.',
    gradient: 'from-red-500 to-slate-800',
  },
  {
    id: 'mv-4',
    title: 'Garden of Letters',
    genre: 'Romance',
    duration: '1h 45m',
    description: 'A poet and a gardener exchange letters across the seasons.',
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'mv-5',
    title: 'Pixel Quest',
    genre: 'Animation',
    duration: '1h 38m',
    description:
      'A video-game hero jumps out of the screen to save the arcade.',
    gradient: 'from-yellow-400 to-orange-500',
  },
]

export const categories: Category[] = [
  { id: 'cat-watch-now', name: 'Watch Now', movieIds: ['mv-1', 'mv-2'] },
  { id: 'cat-action', name: 'Action & Adventure', movieIds: ['mv-3', 'mv-1'] },
  { id: 'cat-drama', name: 'Drama', movieIds: ['mv-2', 'mv-4'] },
  { id: 'cat-kids', name: 'Kids & Family', movieIds: ['mv-5'] },
]
