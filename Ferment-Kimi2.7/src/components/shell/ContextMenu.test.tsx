import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContextMenu } from './ContextMenu'
import { ThemeProvider } from '../../theme'

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1280,
})
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 800,
})

describe('ContextMenu', () => {
  it('renders default menu items', () => {
    render(
      <ThemeProvider>
        <ContextMenu x={100} y={100} onClose={vi.fn()} />
      </ThemeProvider>,
    )
    expect(screen.getByText('New Folder')).toBeInTheDocument()
    expect(screen.getByText('Get Info')).toBeInTheDocument()
    expect(screen.getByText('Change Wallpaper…')).toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', () => {
    const close = vi.fn()
    render(
      <ThemeProvider>
        <ContextMenu x={100} y={100} onClose={close} />
      </ThemeProvider>,
    )
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('clamps position to viewport when near right edge', () => {
    const { container } = render(
      <ThemeProvider>
        <ContextMenu x={1200} y={100} onClose={vi.fn()} />
      </ThemeProvider>,
    )
    const menu = container.firstChild as HTMLElement
    const left = parseInt(menu.style.left, 10)
    expect(left + 200).toBeLessThanOrEqual(window.innerWidth)
  })

  it('clamps position to viewport when near bottom edge', () => {
    const { container } = render(
      <ThemeProvider>
        <ContextMenu x={100} y={750} onClose={vi.fn()} />
      </ThemeProvider>,
    )
    const menu = container.firstChild as HTMLElement
    const top = parseInt(menu.style.top, 10)
    // menu is roughly 180px tall with default items
    expect(top).toBeLessThan(window.innerHeight - 120)
  })
})
