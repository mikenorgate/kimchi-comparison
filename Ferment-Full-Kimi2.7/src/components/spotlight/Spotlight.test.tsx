import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Spotlight, SpotlightProvider } from './Spotlight'
import { DesktopProvider, useDesktop } from '../../desktop/store'
import { clearRegistry, registerApp } from '../../apps/registry'
import { Globe, Folder } from 'lucide-react'

function WindowCounter() {
  const { windows } = useDesktop()
  return <div data-testid="window-counter">{windows.length}</div>
}

function renderSpotlight() {
  return render(
    <DesktopProvider>
      <SpotlightProvider>
        <Spotlight />
        <WindowCounter />
      </SpotlightProvider>
    </DesktopProvider>
  )
}

describe('Spotlight', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'finder', name: 'Finder', icon: Folder, component: () => null, defaultSize: { width: 820, height: 520 } })
    registerApp({ id: 'safari', name: 'Safari', icon: Globe, component: () => null, defaultSize: { width: 1024, height: 700 } })
  })

  it('is hidden by default', () => {
    renderSpotlight()
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
  })

  it('opens on Cmd+Space', () => {
    renderSpotlight()
    fireEvent.keyDown(window, { key: ' ', code: 'Space', metaKey: true })
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()
  })

  it('closes on Escape', () => {
    renderSpotlight()
    fireEvent.keyDown(window, { key: ' ', code: 'Space', metaKey: true })
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
  })

  it('filters apps as the user types', async () => {
    renderSpotlight()
    fireEvent.keyDown(window, { key: ' ', code: 'Space', metaKey: true })
    const input = screen.getByTestId('spotlight-input')
    await userEvent.type(input, 'saf')
    const results = screen.getAllByTestId('spotlight-result')
    expect(results.length).toBe(1)
    expect(results[0]).toHaveTextContent('Safari')
  })

  it('launches the selected app on Enter', async () => {
    renderSpotlight()
    fireEvent.keyDown(window, { key: ' ', code: 'Space', metaKey: true })
    const input = screen.getByTestId('spotlight-input')
    await userEvent.type(input, 'safari')
    await userEvent.keyboard('{Enter}')
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
    expect(screen.getByTestId('window-counter')).toHaveTextContent('1')
  })

  it('launches an app when clicking a result', async () => {
    renderSpotlight()
    fireEvent.keyDown(window, { key: ' ', code: 'Space', metaKey: true })
    const input = screen.getByTestId('spotlight-input')
    await userEvent.type(input, 'finder')
    const result = screen.getByText('Finder')
    await userEvent.click(result)
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
    expect(screen.getByTestId('window-counter')).toHaveTextContent('1')
  })
})
