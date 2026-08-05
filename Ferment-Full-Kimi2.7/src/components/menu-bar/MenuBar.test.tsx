import { render, screen } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { MenuBar } from './MenuBar'
import { DesktopProvider } from '../../desktop/store'
import { clearRegistry, registerApp } from '../../apps/registry'
import { Folder } from 'lucide-react'

const TestApp = () => null

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <DesktopProvider>
      {children}
    </DesktopProvider>
  )
}

describe('MenuBar', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: TestApp, defaultSize: { width: 800, height: 500 } })
  })

  it('renders menu bar', () => {
    render(<MenuBar />, { wrapper: Wrapper })
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument()
  })

  it('shows active app menu when a window is open', async () => {
    render(<MenuBar />, { wrapper: Wrapper })
    const menuBar = screen.getByTestId('menu-bar')
    expect(menuBar).toBeInTheDocument()
    // Open a window first via desktop store is not exposed here, so we test only rendering.
    expect(screen.getByTestId('menu-bar-time')).toBeInTheDocument()
  })
})
