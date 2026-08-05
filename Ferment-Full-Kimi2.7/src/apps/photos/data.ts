import type { Album, Photo } from './types'

export const albums: Album[] = [
  { id: 'library', name: 'Library' },
  { id: 'favorites', name: 'Favorites' },
  { id: 'recently-added', name: 'Recently Added' },
]

export const samplePhotos: Photo[] = [
  {
    id: 'ph-1',
    title: 'Golden Gate',
    date: 'Aug 1, 2026',
    albums: ['library', 'favorites'],
    gradient: 'from-orange-300 to-red-500',
  },
  {
    id: 'ph-2',
    title: 'Ocean Waves',
    date: 'Jul 28, 2026',
    albums: ['library', 'recently-added'],
    gradient: 'from-blue-300 to-cyan-500',
  },
  {
    id: 'ph-3',
    title: 'Mountain Peak',
    date: 'Jul 20, 2026',
    albums: ['library'],
    gradient: 'from-emerald-300 to-green-600',
  },
  {
    id: 'ph-4',
    title: 'City Lights',
    date: 'Jul 15, 2026',
    albums: ['library', 'recently-added', 'favorites'],
    gradient: 'from-purple-300 to-indigo-600',
  },
  {
    id: 'ph-5',
    title: 'Desert Dunes',
    date: 'Jul 10, 2026',
    albums: ['library'],
    gradient: 'from-yellow-200 to-amber-500',
  },
  {
    id: 'ph-6',
    title: 'Forest Path',
    date: 'Jul 5, 2026',
    albums: ['library', 'favorites'],
    gradient: 'from-lime-300 to-teal-600',
  },
]
