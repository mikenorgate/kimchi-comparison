import { describe, it, expect } from 'vitest'
import { appRegistry, getAppById } from './registry'

describe('appRegistry', () => {
  it('exports eight core apps', () => {
    expect(appRegistry).toHaveLength(8)
  })

  it('includes all required app ids', () => {
    const ids = appRegistry.map((app) => app.id)
    expect(ids).toEqual([
      'finder',
      'safari',
      'notes',
      'system-settings',
      'calendar',
      'photos',
      'phone',
      'journal',
    ])
  })

  it('every app has name, icon, component, and category', () => {
    for (const app of appRegistry) {
      expect(app.name).toBeTruthy()
      expect(app.icon).toBeTypeOf('function')
      expect(app.component).toBeTypeOf('function')
      expect(['system', 'productivity', 'media', 'communication']).toContain(
        app.category,
      )
    }
  })

  it('looks up apps by id', () => {
    expect(getAppById('finder')?.name).toBe('Finder')
    expect(getAppById('safari')?.name).toBe('Safari')
    expect(getAppById('unknown')).toBeUndefined()
  })
})
