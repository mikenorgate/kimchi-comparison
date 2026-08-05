import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Finder } from './Finder'
import { useDesktopStore } from '../store/desktopStore'
import { APP_IDS } from '../data/apps'

describe('Finder', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('renders sidebar and main content', () => {
    render(<Finder />)
    expect(screen.getByTestId('finder-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('finder-content')).toBeInTheDocument()
    expect(screen.getByTestId('finder-path')).toBeInTheDocument()
  })

  it('renders sidebar items from places', () => {
    render(<Finder />)
    expect(screen.getByTestId('finder-sidebar-applications')).toBeInTheDocument()
    expect(screen.getByTestId('finder-sidebar-desktop')).toBeInTheDocument()
  })

  it('switches active place when sidebar item clicked', () => {
    render(<Finder />)
    fireEvent.click(screen.getByTestId('finder-sidebar-app-calculator'))
    expect(screen.getByTestId('finder-path')).toHaveTextContent('Applications')
    expect(screen.getByTestId('finder-item-app-calculator')).toBeInTheDocument()
  })

  it('opens an app on double-click', () => {
    render(<Finder />)
    fireEvent.click(screen.getByTestId('finder-sidebar-app-calculator'))
    fireEvent.doubleClick(screen.getByTestId('finder-item-app-calculator'))
    expect(useDesktopStore.getState().windows).toHaveLength(1)
    expect(useDesktopStore.getState().windows[0].appId).toBe(APP_IDS.CALCULATOR)
  })
})
