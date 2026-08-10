import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { Desktop } from './Desktop'
import { WindowManagerProvider } from '../window'
import { ThemeProvider } from '../../theme'
import { appRegistry } from '../../apps'

function renderDesktop() {
  return render(
    <ThemeProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </ThemeProvider>,
  )
}

describe('Dock', () => {
  it('renders all eight app icons', () => {
    renderDesktop()
    const dock = screen.getByTestId('dock')
    const icons = within(dock).getAllByTestId('dock-icon')
    expect(icons).toHaveLength(appRegistry.length)
    for (const app of appRegistry) {
      expect(within(dock).getByLabelText(app.name)).toBeInTheDocument()
    }
  })

  it('opens a window when an app icon is clicked', async () => {
    renderDesktop()
    const dock = screen.getByTestId('dock')
    const notesIcon = within(dock).getByLabelText('Notes')
    fireEvent.click(notesIcon)

    await waitFor(() => {
      const frames = screen.getAllByTestId('window-frame')
      expect(frames.length).toBeGreaterThanOrEqual(1)
    })
    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument()
    expect(screen.getByTestId('notes-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('notes-editor')).toBeInTheDocument()
  })

  it('shows a running indicator for open windows', async () => {
    renderDesktop()
    const dock = screen.getByTestId('dock')
    const finderIcon = within(dock).getByLabelText('Finder')
    fireEvent.click(finderIcon)

    await waitFor(() => {
      const dots = within(dock).getAllByTestId('dock-running-dot')
      expect(dots.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('restores a minimized window when its icon is clicked', async () => {
    renderDesktop()
    const dock = screen.getByTestId('dock')
    const finderIcon = within(dock).getByLabelText('Finder')
    fireEvent.click(finderIcon)

    const finderFrame = screen.getByRole('dialog', { name: 'Finder' })
    const minimizeBtn = within(finderFrame).getByRole('button', { name: 'Minimize' })
    fireEvent.click(minimizeBtn)
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Finder' })).not.toBeInTheDocument()
    })

    fireEvent.click(finderIcon)
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Finder' })).toBeInTheDocument()
    })
  })
})
