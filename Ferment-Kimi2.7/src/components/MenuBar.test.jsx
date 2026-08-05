import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MenuBar } from './MenuBar'
import { useDesktopStore } from '../store/desktopStore'
import { APP_IDS } from '../data/apps'

describe('MenuBar', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('renders the menu bar with default Finder app name', () => {
    render(<MenuBar />)
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument()
    expect(screen.getByTestId('menu-app-name')).toHaveTextContent('Finder')
  })

  it('shows File, Edit, View, Window menus', () => {
    render(<MenuBar />)
    ;['File', 'Edit', 'View', 'Window'].forEach((label) => {
      expect(screen.getByTestId(`menu-${label.toLowerCase()}`)).toHaveTextContent(label)
    })
  })

  it('updates app name when active window changes', () => {
    useDesktopStore.getState().openApp(APP_IDS.NOTES)
    render(<MenuBar />)
    expect(screen.getByTestId('menu-app-name')).toHaveTextContent('Notes')
  })

  it('calls onOpenControlCenter when control center button clicked', () => {
    const handler = vi.fn()
    render(<MenuBar onOpenControlCenter={handler} />)
    fireEvent.click(screen.getByTestId('menu-control-center'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenSpotlight when spotlight button clicked', () => {
    const handler = vi.fn()
    render(<MenuBar onOpenSpotlight={handler} />)
    fireEvent.click(screen.getByTestId('menu-spotlight'))
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
