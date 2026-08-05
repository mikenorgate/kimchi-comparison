import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { SystemSettings } from './SystemSettings'
import { clearRegistry, registerApp } from '../registry'
import { Settings } from 'lucide-react'

describe('System Settings', () => {
  beforeEach(() => {
    clearRegistry()
    registerApp({ id: 'settings', name: 'System Settings', icon: Settings, component: SystemSettings, defaultSize: { width: 760, height: 520 } })
  })

  it('renders categories in sidebar', () => {
    render(<SystemSettings />)
    const sidebar = screen.getByTestId('settings-sidebar')
    expect(within(sidebar).getByText('Wi-Fi')).toBeInTheDocument()
    expect(within(sidebar).getByText('Bluetooth')).toBeInTheDocument()
    expect(within(sidebar).getByText('Appearance')).toBeInTheDocument()
  })

  it('shows first category settings by default', () => {
    render(<SystemSettings />)
    const detail = screen.getByTestId('settings-detail')
    expect(within(detail).getByRole('heading', { name: 'Wi-Fi' })).toBeInTheDocument()
    expect(within(detail).getByText('Connect to wireless networks.')).toBeInTheDocument()
  })

  it('switches category on click', async () => {
    render(<SystemSettings />)
    const sidebar = screen.getByTestId('settings-sidebar')
    await userEvent.click(within(sidebar).getByText('Appearance'))
    const detail = screen.getByTestId('settings-detail')
    expect(within(detail).getByRole('heading', { name: 'Appearance' })).toBeInTheDocument()
    expect(within(detail).getByText('Dark Mode')).toBeInTheDocument()
  })

  it('toggles a setting and updates UI', async () => {
    render(<SystemSettings />)
    const detail = screen.getByTestId('settings-detail')
    const toggle = within(detail).getByRole('button', { name: 'Wi-Fi' })
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('updates checkbox state', async () => {
    render(<SystemSettings />)
    const detail = screen.getByTestId('settings-detail')
    const checkbox = within(detail).getByRole('checkbox', { name: 'Ask to join networks' })
    expect(checkbox).toBeChecked()
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('filters categories and settings by search', async () => {
    render(<SystemSettings />)
    const search = screen.getByPlaceholderText('Search')
    await userEvent.type(search, 'dark')
    const sidebar = screen.getByTestId('settings-sidebar')
    expect(within(sidebar).getByText('Appearance')).toBeInTheDocument()
    expect(within(sidebar).queryByText('Bluetooth')).not.toBeInTheDocument()
    const detail = screen.getByTestId('settings-detail')
    expect(within(detail).getByText('Dark Mode')).toBeInTheDocument()
  })
})
