import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SystemSettings from './SystemSettings'
import { ShellSettingsProvider } from '../../ShellSettings'

afterEach(() => cleanup())

function renderSettings() {
  return render(
    <ShellSettingsProvider>
      <SystemSettings />
    </ShellSettingsProvider>
  )
}

describe('SystemSettings', () => {
  it('renders with sidebar sections', () => {
    renderSettings()
    expect(screen.getByTestId('system-settings')).toBeInTheDocument()
    expect(screen.getByTestId('settings-section-appearance')).toBeInTheDocument()
    expect(screen.getByTestId('settings-section-wallpaper')).toBeInTheDocument()
    expect(screen.getByTestId('settings-section-dock')).toBeInTheDocument()
  })

  it('shows Appearance section by default with dark mode toggle', () => {
    renderSettings()
    expect(screen.getByTestId('settings-appearance')).toBeInTheDocument()
    expect(screen.getByTestId('dark-mode-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('dark-mode-toggle')).toHaveAttribute('data-active', 'true')
  })

  it('toggles dark mode off and on', () => {
    renderSettings()

    const toggle = screen.getByTestId('dark-mode-toggle')
    expect(toggle).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('dark-mode-label').textContent).toBe('On')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('data-active', 'false')
    expect(screen.getByTestId('dark-mode-label').textContent).toBe('Off')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('data-active', 'true')
    expect(screen.getByTestId('dark-mode-label').textContent).toBe('On')
  })

  it('shows Wallpaper section with 6 gradient options', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('settings-section-wallpaper'))

    expect(screen.getByTestId('settings-wallpaper')).toBeInTheDocument()
    expect(screen.getByTestId('wallpaper-tahoe')).toBeInTheDocument()
    expect(screen.getByTestId('wallpaper-sunset')).toBeInTheDocument()
    expect(screen.getByTestId('wallpaper-ocean')).toBeInTheDocument()
    expect(screen.getByTestId('wallpaper-forest')).toBeInTheDocument()
    expect(screen.getByTestId('wallpaper-monochrome')).toBeInTheDocument()
    expect(screen.getByTestId('wallpaper-aurora')).toBeInTheDocument()
  })

  it('selects a wallpaper and highlights it', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('settings-section-wallpaper'))

    const sunset = screen.getByTestId('wallpaper-sunset')
    fireEvent.click(sunset)

    // The selected wallpaper should have a blue border
    expect(sunset.style.border).toContain('3px solid')
    expect(sunset.style.border).toContain('rgb(10, 132, 255)')
  })

  it('shows Dock section with magnification toggle and icon size buttons', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('settings-section-dock'))

    expect(screen.getByTestId('settings-dock')).toBeInTheDocument()
    expect(screen.getByTestId('dock-magnification-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('dock-size-S')).toBeInTheDocument()
    expect(screen.getByTestId('dock-size-M')).toBeInTheDocument()
    expect(screen.getByTestId('dock-size-L')).toBeInTheDocument()
  })

  it('toggles dock magnification', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('settings-section-dock'))

    const toggle = screen.getByTestId('dock-magnification-toggle')
    expect(toggle).toHaveAttribute('data-active', 'true')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('data-active', 'false')
  })

  it('changes dock icon size', () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('settings-section-dock'))

    // Default is M
    const sizeM = screen.getByTestId('dock-size-M')
    expect(sizeM.style.background).toBe('rgb(10, 132, 255)')

    // Click L
    const sizeL = screen.getByTestId('dock-size-L')
    fireEvent.click(sizeL)
    expect(sizeL.style.background).toBe('rgb(10, 132, 255)')
    expect(sizeM.style.background).not.toBe('rgb(10, 132, 255)')

    // Click S
    const sizeS = screen.getByTestId('dock-size-S')
    fireEvent.click(sizeS)
    expect(sizeS.style.background).toBe('rgb(10, 132, 255)')
  })
})
