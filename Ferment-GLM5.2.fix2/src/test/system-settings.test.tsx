import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SystemSettingsApp from '@/apps/SystemSettingsApp'
import { ThemeProvider } from '@/lib/theme'

/**
 * Runtime tests asserting System Settings' theme controls write through to the
 * ThemeProvider and land on <html> data-attributes / classes — the path that
 * had an inverted Reduce Transparency toggle (now fixed).
 */
describe('System Settings theme application', () => {
  beforeEach(() => {
    // Reset <html> attributes/classes each test so assertions are isolated.
    document.documentElement.className = ''
    document.documentElement.dataset.theme = ''
    document.documentElement.dataset.accent = ''
    cleanup()
  })

  function renderSettings() {
    return render(
      <ThemeProvider>
        <SystemSettingsApp />
      </ThemeProvider>,
    )
  }

  it('Dark Mode toggle flips the theme mode on <html>', () => {
    renderSettings()
    // Appearance is the default section.
    const darkToggle = screen.getByTestId('toggle-dark-mode')
    // Initial state is light (data-theme="light"); toggling → dark.
    fireEvent.click(darkToggle)
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('Reduce Transparency toggle is NOT inverted — enables reduce-transparency class', () => {
    renderSettings()
    const rtToggle = screen.getByTestId('toggle-reduce-transparency')
    // Toggling ON should add the reduce-transparency class (not remove it).
    fireEvent.click(rtToggle)
    expect(
      document.documentElement.classList.contains('reduce-transparency'),
    ).toBe(true)
  })

  it('Accent Color swatch sets the accent on <html>', () => {
    renderSettings()
    // Navigate to Accent Color section.
    fireEvent.click(screen.getByText('Accent Color'))
    // Swatch aria-label is acc.label ("Purple"), not acc.color.
    fireEvent.click(screen.getByLabelText('Purple'))
    expect(document.documentElement.dataset.accent).toBe('purple')
  })

  it('Wallpaper swatch sets the --desktop-gradient CSS variable', () => {
    renderSettings()
    fireEvent.click(screen.getByText('Wallpaper'))
    const wallpapers = screen.getAllByRole('button', { name: /Set wallpaper/ })
    fireEvent.click(wallpapers[0])
    const gradient = document.documentElement.style.getPropertyValue(
      '--desktop-gradient',
    )
    expect(gradient.length).toBeGreaterThan(0)
  })
})
