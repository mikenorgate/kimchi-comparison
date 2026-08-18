import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Desktop from '../Desktop'

describe('Desktop component', () => {
  it('renders the desktop root element', () => {
    render(<Desktop />)
    expect(screen.getByTestId('desktop-root')).toBeInTheDocument()
  })

  it('renders the menu bar with glass class', () => {
    render(<Desktop />)
    const menuBar = screen.getByTestId('menu-bar')
    expect(menuBar).toBeInTheDocument()
    expect(menuBar.className).toContain('glass')
  })

  it('renders the dock with glass class', () => {
    render(<Desktop />)
    const dock = screen.getByTestId('dock')
    expect(dock).toBeInTheDocument()
    expect(dock.className).toContain('glass')
  })

  it('renders the desktop content container', () => {
    render(<Desktop />)
    expect(screen.getByTestId('desktop-content')).toBeInTheDocument()
  })

  it('applies a wallpaper background to the desktop root', () => {
    render(<Desktop />)
    const root = screen.getByTestId('desktop-root')
    const bg = root.style.background
    expect(bg).toContain('linear-gradient')
  })
})
