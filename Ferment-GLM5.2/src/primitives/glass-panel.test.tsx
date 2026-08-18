import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassPanel } from './glass-panel'

describe('GlassPanel', () => {
  it('renders children inside the panel', () => {
    render(<GlassPanel>Hello Glass</GlassPanel>)
    const panel = screen.getByTestId('glass-panel')
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveTextContent('Hello Glass')
  })

  it('applies the glass-panel CSS class for backdrop-filter translucency', () => {
    render(<GlassPanel>translucent</GlassPanel>)
    const panel = screen.getByTestId('glass-panel')
    expect(panel.className).toContain('glass-panel')
  })

  it('applies the specular highlight via ::before pseudo-element class', () => {
    render(<GlassPanel>highlight</GlassPanel>)
    const panel = screen.getByTestId('glass-panel')
    // The ::before specular highlight is defined in CSS on .glass-panel;
    // verify the element carries the class that triggers it.
    expect(panel.className).toMatch(/glass-panel/)
  })

  it('supports the strong variant for higher opacity', () => {
    render(<GlassPanel strong>opaque</GlassPanel>)
    const panel = screen.getByTestId('glass-panel')
    expect(panel.className).toContain('glass-strong')
  })

  it('supports custom className passthrough', () => {
    render(<GlassPanel className="my-extra">extra</GlassPanel>)
    const panel = screen.getByTestId('glass-panel')
    expect(panel.className).toContain('my-extra')
    expect(panel.className).toContain('glass-panel')
  })

  it('renders as a different element via the `as` prop', () => {
    render(<GlassPanel as="nav">nav glass</GlassPanel>)
    const panel = screen.getByTestId('glass-panel')
    expect(panel.tagName.toLowerCase()).toBe('nav')
  })

  it('passes through inline style', () => {
    render(<GlassPanel style={{ width: 200 }}>styled</GlassPanel>)
    const panel = screen.getByTestId('glass-panel')
    expect(panel.style.width).toBe('200px')
  })
})
