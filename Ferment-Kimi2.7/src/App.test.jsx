import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { useDesktopStore } from './store/desktopStore'

describe('App integration', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('renders desktop shell components', () => {
    render(<App />)
    expect(screen.getByTestId('desktop')).toBeInTheDocument()
    expect(screen.getByTestId('menu-bar')).toBeInTheDocument()
    expect(screen.getByTestId('dock')).toBeInTheDocument()
  })

  it('opens Spotlight from menu bar', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('menu-spotlight'))
    expect(screen.getByTestId('spotlight-panel')).toBeInTheDocument()
  })

  it('opens Control Center from menu bar', () => {
    render(<App />)
    fireEvent.click(screen.getByTestId('menu-control-center'))
    expect(screen.getByTestId('control-center-panel')).toBeInTheDocument()
  })

  it('renders open windows', () => {
    useDesktopStore.getState().openApp('finder')
    render(<App />)
    expect(screen.getByTestId('finder-app')).toBeInTheDocument()
  })
})
