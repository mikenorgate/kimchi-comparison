import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  GlassPanel,
  Squircle,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Sidebar,
} from '../index'

describe('GlassPanel', () => {
  it('renders children', () => {
    render(<GlassPanel>panel content</GlassPanel>)
    expect(screen.getByText('panel content')).toBeTruthy()
  })

  it('applies glass-surface class for backdrop-filter', () => {
    const { container } = render(<GlassPanel>glass</GlassPanel>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('glass-surface')
  })

  it('applies heavy variant class', () => {
    const { container } = render(<GlassPanel variant="heavy">heavy</GlassPanel>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('glass-surface-heavy')
  })

  it('applies border-radius from token', () => {
    const { container } = render(<GlassPanel>rounded</GlassPanel>)
    const el = container.firstChild as HTMLElement
    expect(el.style.borderRadius).toContain('var(--radius-window)')
  })
})

describe('Squircle', () => {
  it('renders children', () => {
    render(<Squircle>squircle content</Squircle>)
    expect(screen.getByText('squircle content')).toBeTruthy()
  })

  it('applies border-radius', () => {
    const { container } = render(<Squircle radius="22px">r</Squircle>)
    const el = container.firstChild as HTMLElement
    expect(el.style.borderRadius).toBe('22px')
  })
})

describe('Button', () => {
  it('renders label text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeTruthy()
  })

  it('fires onClick when enabled', () => {
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Press</Button>)
    fireEvent.click(screen.getByText('Press'))
    expect(clicked).toBe(true)
  })

  it('does not fire onClick when disabled', () => {
    let clicked = false
    render(
      <Button disabled onClick={() => { clicked = true }}>
        No click
      </Button>,
    )
    fireEvent.click(screen.getByText('No click'))
    expect(clicked).toBe(false)
  })

  it('applies glass-surface for secondary variant', () => {
    const { container } = render(<Button variant="secondary">S</Button>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('glass-surface')
  })

  it('applies primary blue background', () => {
    const { container } = render(<Button variant="primary">P</Button>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('#0a84ff')
  })
})

describe('Menu / MenuItem', () => {
  it('renders menu with items', () => {
    render(
      <Menu>
        <MenuItem label="Cut" shortcut="⌘X" />
        <MenuItem label="Copy" shortcut="⌘C" />
        <MenuItem separator />
        <MenuItem label="Paste" shortcut="⌘V" />
      </Menu>,
    )
    expect(screen.getByText('Cut')).toBeTruthy()
    expect(screen.getByText('Copy')).toBeTruthy()
    expect(screen.getByText('Paste')).toBeTruthy()
  })

  it('renders separator', () => {
    const { container } = render(
      <Menu>
        <MenuItem label="A" />
        <MenuItem separator />
        <MenuItem label="B" />
      </Menu>,
    )
    const sep = container.querySelector('[role="separator"]')
    expect(sep).toBeTruthy()
  })

  it('fires onClick on menu item', () => {
    let clicked = ''
    render(
      <Menu>
        <MenuItem label="Open" onClick={() => { clicked = 'opened' }} />
      </Menu>,
    )
    fireEvent.click(screen.getByText('Open'))
    expect(clicked).toBe('opened')
  })

  it('does not fire onClick when disabled', () => {
    let clicked = false
    render(
      <Menu>
        <MenuItem label="Save" disabled onClick={() => { clicked = true }} />
      </Menu>,
    )
    fireEvent.click(screen.getByText('Save'))
    expect(clicked).toBe(false)
  })

  it('applies glass-surface-bar class to menu', () => {
    const { container } = render(
      <Menu>
        <MenuItem label="Test" />
      </Menu>,
    )
    const menu = container.firstChild as HTMLElement
    expect(menu.className).toContain('glass-surface-bar')
  })
})

describe('Toolbar', () => {
  it('renders children', () => {
    render(<Toolbar>toolbar content</Toolbar>)
    expect(screen.getByText('toolbar content')).toBeTruthy()
  })

  it('applies glass-surface-bar class', () => {
    const { container } = render(<Toolbar>t</Toolbar>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('glass-surface-bar')
  })
})

describe('Sidebar', () => {
  it('renders children', () => {
    render(<Sidebar>sidebar content</Sidebar>)
    expect(screen.getByText('sidebar content')).toBeTruthy()
  })

  it('applies glass-surface class', () => {
    const { container } = render(<Sidebar>s</Sidebar>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('glass-surface')
  })

  it('applies custom width', () => {
    const { container } = render(<Sidebar width="300px">w</Sidebar>)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('300px')
  })
})
