import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GlassPanel, GlassButton, GlassSidebar, GlassSidebarItem, GlassToolbar, GlassPopover } from './index'
import { GlassPrimitivesDemo } from './GlassPrimitivesDemo'

describe('Liquid Glass primitives', () => {
  it('GlassPanel renders with glass styling', () => {
    render(<GlassPanel data-testid="panel">Hello</GlassPanel>)
    const panel = screen.getByTestId('panel')
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveTextContent('Hello')
    expect(panel).toHaveClass('tahoe-glass')
  })

  it('GlassPanel supports strong variant', () => {
    render(
      <GlassPanel variant="strong" data-testid="panel-strong">
        Strong
      </GlassPanel>,
    )
    const panel = screen.getByTestId('panel-strong')
    expect(panel).toHaveClass('tahoe-glass-strong')
  })

  it('GlassPanel tinted variant applies a tinted background', () => {
    render(
      <GlassPanel variant="tinted" data-testid="panel-tinted">
        Tinted
      </GlassPanel>,
    )
    const panel = screen.getByTestId('panel-tinted')
    expect(panel).toHaveStyle({ backgroundColor: 'var(--tahoe-glass-tint)' })
  })

  it('GlassButton renders, accepts focus, and forwards disabled state', () => {
    render(<GlassButton data-testid="btn">Click</GlassButton>)
    const btn = screen.getByTestId('btn')
    expect(btn).toBeInTheDocument()
    expect(btn.tagName).toBe('BUTTON')
    expect(btn).toHaveTextContent('Click')

    btn.focus()
    expect(btn).toHaveFocus()
  })

  it('GlassButton disabled state is exposed to assistive tech', () => {
    render(<GlassButton disabled>Disabled</GlassButton>)
    const btn = screen.getByText('Disabled')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-disabled', 'true')
  })

  it('GlassSidebar renders as an aside with custom width', () => {
    render(
      <GlassSidebar width={180} data-testid="sidebar">
        Nav
      </GlassSidebar>,
    )
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.tagName).toBe('ASIDE')
    expect(sidebar).toHaveStyle({ width: '180px' })
  })

  it('GlassToolbar renders children', () => {
    render(
      <GlassToolbar data-testid="toolbar">
        <span>Tools</span>
      </GlassToolbar>,
    )
    expect(screen.getByTestId('toolbar')).toHaveTextContent('Tools')
  })

  it('GlassPopover renders with arrow by default', () => {
    render(
      <GlassPopover data-testid="popover">
        Content
      </GlassPopover>,
    )
    const popover = screen.getByTestId('popover')
    expect(popover).toHaveTextContent('Content')
    expect(popover.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('GlassPopover can hide arrow', () => {
    render(
      <GlassPopover showArrow={false} data-testid="popover-no-arrow">
        Content
      </GlassPopover>,
    )
    const popover = screen.getByTestId('popover-no-arrow')
    expect(popover.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('GlassPrimitivesDemo renders all primitives together', () => {
    render(<GlassPrimitivesDemo />)
    expect(screen.getByText('GlassPanel')).toBeInTheDocument()
    expect(screen.getByText('GlassPanel Strong')).toBeInTheDocument()
    expect(screen.getByText('Toolbar')).toBeInTheDocument()
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByText('Popover content with a glass arrow.')).toBeInTheDocument()
  })

  it('GlassPanel applies a real backdrop-filter glass effect', () => {
    render(<GlassPanel data-testid="panel">Hello</GlassPanel>)
    const panel = screen.getByTestId('panel')
    const style = window.getComputedStyle(panel)
    expect(style.backdropFilter).toMatch(/blur/)
  })

  it('GlassPanel hoverable adds hover transition classes', () => {
    render(
      <GlassPanel hoverable data-testid="panel-hover">
        Hover me
      </GlassPanel>,
    )
    const panel = screen.getByTestId('panel-hover')
    expect(panel.className).toContain('hover:shadow-tahoe-window')
    expect(panel.className).toContain('focus-within:brightness-105')
  })

  it('GlassSidebarItem calls onClick and can be focused', () => {
    const handleClick = vi.fn()
    render(<GlassSidebarItem onClick={handleClick}>Item</GlassSidebarItem>)
    const item = screen.getByText('Item')
    fireEvent.click(item)
    expect(handleClick).toHaveBeenCalledTimes(1)

    item.focus()
    expect(item).toHaveFocus()
  })

  it('GlassSidebarItem active state is exposed with aria-current', () => {
    render(<GlassSidebarItem active>Active Item</GlassSidebarItem>)
    const item = screen.getByText('Active Item')
    expect(item).toHaveAttribute('aria-current', 'true')
  })
})
