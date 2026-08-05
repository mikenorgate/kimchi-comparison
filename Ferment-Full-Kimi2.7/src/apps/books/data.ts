import type { Book, BookCollection } from './types'

export const collections: BookCollection[] = [
  { id: 'library', name: 'Library' },
  { id: 'favorites', name: 'Favorites' },
  { id: 'want-to-read', name: 'Want to Read' },
  { id: 'finished', name: 'Finished' },
]

export const books: Book[] = [
  {
    id: 'b-1',
    title: 'The Silent Ocean',
    author: 'Elena Morrow',
    collectionId: 'library',
    cover: 'from-blue-500 to-cyan-600',
    description:
      'A haunting tale of exploration and loss beneath the surface of a world covered by still waters.',
    totalPages: 324,
  },
  {
    id: 'b-2',
    title: 'Clockwork Garden',
    author: 'Arthur Finch',
    collectionId: 'favorites',
    cover: 'from-emerald-500 to-teal-700',
    description:
      'Steampunk wonder meets botanical mystery in this richly illustrated adventure.',
    totalPages: 276,
  },
  {
    id: 'b-3',
    title: 'Starlight Archives',
    author: 'Nora Vega',
    collectionId: 'want-to-read',
    cover: 'from-indigo-500 to-violet-700',
    description:
      'An archivist aboard a generation ship uncovers the truth about humanity\'s departure from Earth.',
    totalPages: 412,
  },
  {
    id: 'b-4',
    title: 'The Last Café',
    author: 'Julian Reed',
    collectionId: 'finished',
    cover: 'from-amber-500 to-orange-600',
    description:
      'Stories intertwine over decades in a corner café that refuses to close its doors.',
    totalPages: 198,
  },
  {
    id: 'b-5',
    title: 'Paper Dragons',
    author: 'Lina Cho',
    collectionId: 'library',
    cover: 'from-rose-500 to-red-700',
    description:
      'A young origami master discovers that every fold can reshape reality itself.',
    totalPages: 356,
  },
  {
    id: 'b-6',
    title: 'Midnight in Azure',
    author: 'Samuel Holt',
    collectionId: 'favorites',
    cover: 'from-sky-600 to-blue-800',
    description:
      'A detective novel set in a city where the night lasts for months and secrets never thaw.',
    totalPages: 289,
  },
]
