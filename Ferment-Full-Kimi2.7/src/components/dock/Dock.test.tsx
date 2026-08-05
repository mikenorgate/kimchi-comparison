import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Dock } from './Dock'
import { Spotlight } from '../spotlight/Spotlight'
import { DesktopProvider } from '../../desktop/store'
import { SpotlightProvider } from '../spotlight/Spotlight'
import { clearRegistry, registerApp } from '../../apps/registry'
import { Folder, Settings } from 'lucide-react'

const TestApp = () => null

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <DesktopProvider>
      <SpotlightProvider>
        {children}
        <Spotlight />
      </SpotlightProvider>
    </DesktopProvider>
  )
}

describe('Dock', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: TestApp, defaultSize: { width: 800, height: 500 } })
    registerApp({ id: 'settings', name: 'System Settings', icon: Settings, component: TestApp, defaultSize: { width: 700, height: 500 } })
  })

  it('renders dock icons for registered apps', () => {
    render(<Dock />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: 'Finder' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'System Settings' })).toBeInTheDocument()
  })

  it('opens an app when its dock icon is clicked', async () => {
    render(
      <Wrapper>
        <Dock />
      </Wrapper>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Finder' }))
    expect(screen.getByRole('button', { name: 'Finder' }).querySelector('.rounded-full')).toBeInTheDocument()
  })

  it('opens the Spotlight overlay when the Spotlight dock icon is clicked', async () => {
    render(
      <Wrapper>
        <Dock />
        <div data-testid="spotlight-consumer" />
      </Wrapper>
    )
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Spotlight' }))
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()
  })
})
