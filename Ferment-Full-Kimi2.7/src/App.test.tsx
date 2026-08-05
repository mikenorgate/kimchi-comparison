import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import App from './App'
import { clearRegistry } from './apps/registry'
import { registerDefaultApps } from './apps'

describe('App integration', () => {
  beforeEach(() => {
    clearRegistry()
    registerDefaultApps()
  })

  it('renders the desktop shell with menu bar and dock', () => {
    render(<App />)
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument()
    expect(screen.getByTestId('dock')).toBeInTheDocument()
  })

  it('opens Finder from the Dock', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Finder' }))
    expect(screen.getAllByText('Finder').length).toBeGreaterThanOrEqual(2)
  })

  it('opens Spotlight with Cmd+Space and launches Safari from search', async () => {
    render(<App />)
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
    fireEvent.keyDown(window, { key: ' ', code: 'Space', metaKey: true })
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()
    await userEvent.type(screen.getByTestId('spotlight-input'), 'safari')
    await userEvent.keyboard('{Enter}')
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
    expect(screen.getAllByText('Safari').length).toBeGreaterThanOrEqual(2)
  })

  it('opens Spotlight from the Dock search icon', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Spotlight' }))
    expect(screen.getByTestId('spotlight-overlay')).toBeInTheDocument()
  })

  it('opens Terminal and executes a mocked command', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Terminal' }))
    const input = screen.getByLabelText('Terminal command input')
    await userEvent.type(input, 'echo integration')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByText('integration')).toBeInTheDocument()
  })

  it('opens System Settings and shows categories', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'System Settings' }))
    expect(screen.getByTestId('settings-sidebar')).toBeInTheDocument()
    expect(screen.getAllByText('Wi-Fi').length).toBeGreaterThanOrEqual(1)
  })
})
