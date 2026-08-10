import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MenuBar } from './MenuBar'
import { ThemeProvider } from '../../theme'

describe('MenuBar', () => {
  it('renders the apple logo and current app name', () => {
    render(
      <ThemeProvider>
        <MenuBar currentApp="Finder" />
      </ThemeProvider>,
    )
    expect(screen.getByText('Finder')).toBeInTheDocument()
    expect(screen.getByLabelText('Apple menu')).toBeInTheDocument()
  })

  it('renders standard menu items', () => {
    render(
      <ThemeProvider>
        <MenuBar currentApp="Finder" />
      </ThemeProvider>,
    )
    ;['File', 'Edit', 'View', 'Go', 'Window', 'Help'].forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('renders status icons and clock', () => {
    render(
      <ThemeProvider>
        <MenuBar currentApp="Finder" />
      </ThemeProvider>,
    )
    expect(screen.getByLabelText('Spotlight')).toBeInTheDocument()
    expect(screen.getByLabelText('Control Center')).toBeInTheDocument()
    const clock = screen.getByText(/Mon,|Tue,|Wed,|Thu,|Fri,|Sat,|Sun,/)
    expect(clock).toBeInTheDocument()
  })

  it('calls onSpotlightClick and onControlCenterClick', () => {
    const spotlight = vi.fn()
    const controlCenter = vi.fn()
    render(
      <ThemeProvider>
        <MenuBar
          currentApp="Finder"
          onSpotlightClick={spotlight}
          onControlCenterClick={controlCenter}
        />
      </ThemeProvider>,
    )
    screen.getByLabelText('Spotlight').click()
    screen.getByLabelText('Control Center').click()
    expect(spotlight).toHaveBeenCalledTimes(1)
    expect(controlCenter).toHaveBeenCalledTimes(1)
  })

  it('shows the app menu dropdown when the current app name is clicked', async () => {
    render(
      <ThemeProvider>
        <MenuBar currentApp="Finder" />
      </ThemeProvider>,
    )

    expect(screen.queryByTestId('menu-dropdown')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('menubar-app-menu-button'))
    await waitFor(() => expect(screen.getByTestId('menu-dropdown')).toBeInTheDocument())
    expect(screen.getByText('About Finder')).toBeInTheDocument()
    expect(screen.getByText('Quit Finder')).toBeInTheDocument()
  })

  it('shows a generic menu dropdown when a standard menu item is clicked', async () => {
    render(
      <ThemeProvider>
        <MenuBar currentApp="Finder" />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByTestId('menu-button-file'))
    await waitFor(() => expect(screen.getByTestId('menu-dropdown')).toBeInTheDocument())
    expect(screen.getByText('New Window')).toBeInTheDocument()
    expect(screen.getByText('Move to Trash')).toBeInTheDocument()
  })
})
