import type { Playlist, Track } from './types'

export const playlists: Playlist[] = [
  { id: 'library', name: 'Library' },
  { id: 'recently-played', name: 'Recently Played' },
  { id: 'favorites', name: 'Favorites' },
]

export const sampleTracks: Track[] = [
  {
    id: 'tr-1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: 243,
    cover: 'from-pink-400 to-purple-600',
  },
  {
    id: 'tr-2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    cover: 'from-red-500 to-orange-600',
  },
  {
    id: 'tr-3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    cover: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'tr-4',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration: 178,
    cover: 'from-violet-400 to-fuchsia-600',
  },
]
