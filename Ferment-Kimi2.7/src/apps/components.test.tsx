import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../theme'
import { SystemSettingsApp } from './components'

describe('SystemSettingsApp', () => {
  it('renders the settings sidebar and appearance panel', () => {
    render(
      <ThemeProvider>
        <SystemSettingsApp />
      </ThemeProvider>,
    )
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('settings-category-appearance'))
    expect(screen.getByTestId('settings-pane-appearance')).toBeInTheDocument()
    expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Switch to Dark')
  })

  it('toggles the theme when the toggle button is clicked', () => {
    render(
      <ThemeProvider>
        <SystemSettingsApp />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByTestId('settings-category-appearance'))
    const toggle = screen.getByTestId('theme-toggle')
    expect(toggle).toHaveTextContent('Switch to Dark')

    fireEvent.click(toggle)
    expect(toggle).toHaveTextContent('Switch to Light')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    fireEvent.click(toggle)
    expect(toggle).toHaveTextContent('Switch to Dark')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
