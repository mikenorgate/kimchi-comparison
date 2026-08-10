import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../theme'
import { SystemSettingsApp } from './components'

function renderSettings() {
  return render(
    <ThemeProvider>
      <SystemSettingsApp />
    </ThemeProvider>,
  )
}

describe('SystemSettingsApp', () => {
  it('renders the settings sidebar and default General pane', () => {
    renderSettings()
    expect(screen.getByTestId('settings-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('settings-category-general')).toBeInTheDocument()
    expect(screen.getByTestId('settings-pane-general')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'General' })).toBeInTheDocument()
    expect(screen.getByText('Tahoe System')).toBeInTheDocument()
  })

  it('switches to the selected category pane', () => {
    renderSettings()
    const wifi = screen.getByTestId('settings-category-wifi')
    fireEvent.click(wifi)
    expect(screen.getByTestId('settings-pane-wifi')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Wi-Fi' })).toBeInTheDocument()
  })

  it('toggles Wi-Fi switch state', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('settings-category-wifi'))
    const toggle = screen.getByTestId('wifi-toggle')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles the theme from the Appearance pane', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('settings-category-appearance'))
    const toggle = screen.getByTestId('theme-toggle')
    expect(toggle).toHaveTextContent('Switch to Dark')
    fireEvent.click(toggle)
    expect(toggle).toHaveTextContent('Switch to Light')
  })
})
