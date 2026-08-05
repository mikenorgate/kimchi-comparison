import { describe, it, expect } from 'vitest'
import { FINDER_PLACES, PLACE_IDS, getPlaceById, getPlaceItems } from './places'
import { APP_IDS } from './apps'

describe('places', () => {
  it('defines favorites and applications sections', () => {
    expect(FINDER_PLACES).toHaveLength(2)
    expect(FINDER_PLACES.some((p) => p.id === PLACE_IDS.FAVORITES)).toBe(true)
    expect(FINDER_PLACES.some((p) => p.id === PLACE_IDS.APPLICATIONS)).toBe(true)
  })

  it('returns a place by id', () => {
    expect(getPlaceById(PLACE_IDS.APPLICATIONS).name).toBe('Applications')
  })

  it('returns items for a place', () => {
    const items = getPlaceItems(PLACE_IDS.APPLICATIONS)
    expect(items.length).toBeGreaterThan(0)
    expect(items.some((item) => item.appId === APP_IDS.CALCULATOR)).toBe(true)
  })
})
