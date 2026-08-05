import { describe, expect, it, beforeEach } from 'vitest'
import { Folder, Settings } from 'lucide-react'
import { clearRegistry, getApp, getApps, getDockApps, getApplicationsFolderApps, registerApp } from './registry'

const TestApp1 = () => null
const TestApp2 = () => null

describe('app registry', () => {
  beforeEach(() => {
    clearRegistry()
  })

  it('registers and retrieves an app by id', () => {
    registerApp({
      id: 'finder',
      name: 'Finder',
      icon: Folder,
      component: TestApp1,
      defaultSize: { width: 800, height: 500 },
    })
    const app = getApp('finder')
    expect(app).toBeDefined()
    expect(app?.name).toBe('Finder')
  })

  it('lists all registered apps', () => {
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: TestApp1, defaultSize: { width: 800, height: 500 } })
    registerApp({ id: 'settings', name: 'System Settings', icon: Settings, component: TestApp2, defaultSize: { width: 700, height: 500 } })
    expect(getApps()).toHaveLength(2)
  })

  it('returns dock apps by default', () => {
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: TestApp1, defaultSize: { width: 800, height: 500 } })
    registerApp({ id: 'hidden', name: 'Hidden', icon: Settings, component: TestApp2, defaultSize: { width: 100, height: 100 }, showInDock: false })
    expect(getDockApps()).toHaveLength(1)
    expect(getDockApps()[0].id).toBe('finder')
  })

  it('returns applications folder apps by default', () => {
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: TestApp1, defaultSize: { width: 800, height: 500 } })
    registerApp({ id: 'hidden', name: 'Hidden', icon: Settings, component: TestApp2, defaultSize: { width: 100, height: 100 }, showInApplications: false })
    expect(getApplicationsFolderApps()).toHaveLength(1)
  })
})
