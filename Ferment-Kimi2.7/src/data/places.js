export const PLACE_IDS = {
  FAVORITES: 'favorites',
  APPLICATIONS: 'applications',
  DOCUMENTS: 'documents',
  DOWNLOADS: 'downloads',
  DESKTOP: 'desktop',
  HOME: 'home',
}

export const FINDER_PLACES = [
  {
    id: PLACE_IDS.FAVORITES,
    name: 'Favorites',
    icon: 'star',
    items: [
      { id: 'airdrop', name: 'AirDrop', icon: 'wifi', kind: 'system' },
      { id: 'recents', name: 'Recents', icon: 'clock', kind: 'system' },
      { id: 'applications', name: 'Applications', icon: 'folder', kind: 'folder' },
      { id: 'desktop', name: 'Desktop', icon: 'folder', kind: 'folder' },
      { id: 'documents', name: 'Documents', icon: 'folder', kind: 'folder' },
      { id: 'downloads', name: 'Downloads', icon: 'folder', kind: 'folder' },
    ],
  },
  {
    id: PLACE_IDS.APPLICATIONS,
    name: 'Applications',
    icon: 'folder',
    items: [
      { id: 'app-calculator', name: 'Calculator', icon: 'gear', kind: 'app', appId: 'calculator' },
      { id: 'app-calendar', name: 'Calendar', icon: 'calendar', kind: 'app', appId: 'calendar' },
      { id: 'app-clock', name: 'Clock', icon: 'clock', kind: 'app', appId: 'clock' },
      { id: 'app-notes', name: 'Notes', icon: 'document', kind: 'app', appId: 'notes' },
      { id: 'app-safari', name: 'Safari', icon: 'safari', kind: 'app', appId: 'safari' },
      { id: 'app-settings', name: 'System Settings', icon: 'gear', kind: 'app', appId: 'settings' },
    ],
  },
]

export function getPlaceById(id) {
  return FINDER_PLACES.find((place) => place.id === id)
}

export function getPlaceItems(placeId) {
  const place = getPlaceById(placeId)
  return place ? place.items : []
}
