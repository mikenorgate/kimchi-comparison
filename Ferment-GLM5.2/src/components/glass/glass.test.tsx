import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { GlassPanel, Dock, MenuBar } from './index'

/**
 * Liquid Glass design-system tests.
 *
 * Asserts the *material* contract each component owns: the inline CSS that
 * produces Tahoe's translucent, refractive glass. jsdom can't render
 * backdrop-filter visually, so we assert on the applied inline styles — the
 * load-bearing contract that downstream windows/docks/menus rely on.
 */
describe('GlassPanel', () => {
  it('renders children and applies the glass material via inline style', () => {
    const { getByTestId, getByText } = render(
      <GlassPanel testId="panel" radius="xl" shadow="window">
        <span>content</span>
      </GlassPanel>,
    )
    const panel = getByTestId('panel')
    expect(getByText('content')).toBeInTheDocument()
    expect(panel.getAttribute('data-glass')).toBe('true')
    // Refraction: backdrop-filter must include blur + saturate
    expect(panel.style.backdropFilter).toContain('blur(')
    expect(panel.style.backdropFilter).toContain('saturate(')
    // Translucency: a non-transparent background tint
    expect(panel.style.background).toMatch(/rgba\(255, 255, 255,/)
    // Specular highlight overlay
    expect(panel.style.backgroundImage).toContain('linear-gradient')
    // Soft border + rounded corner
    expect(panel.style.border).toContain('0.5px')
    expect(panel.style.borderRadius).toBe('var(--radius-xl)')
    expect(panel.style.boxShadow).toBe('var(--shadow-window)')
  })

  it('dark variant uses the dark tint', () => {
    const { getByTestId } = render(<GlassPanel testId="panel" variant="dark" />)
    const panel = getByTestId('panel')
    expect(panel.getAttribute('data-variant')).toBe('dark')
    expect(panel.style.background).toMatch(/rgba\(28, 28, 30,/)
  })
})

describe('Dock', () => {
  it('renders children with a capsule glass surface', () => {
    const { getByTestId, getByText } = render(
      <Dock testId="dock">
        <span>app-icon</span>
      </Dock>,
    )
    const dock = getByTestId('dock')
    expect(getByText('app-icon')).toBeInTheDocument()
    expect(dock.getAttribute('data-dock')).toBe('true')
    // Stronger blur than a plain panel
    expect(dock.style.backdropFilter).toContain('blur(40px)')
    expect(dock.style.borderRadius).toBe('var(--radius-3xl)')
    expect(dock.style.boxShadow).toBe('var(--shadow-dock)')
  })
})

describe('MenuBar', () => {
  it('is fully transparent with no backdrop blur (Tahoe menu bar)', () => {
    const { getByTestId, getByText } = render(
      <MenuBar testId="menubar">
        <span>Finder</span>
      </MenuBar>,
    )
    const bar = getByTestId('menubar')
    expect(getByText('Finder')).toBeInTheDocument()
    expect(bar.getAttribute('data-menubar')).toBe('true')
    // Tahoe: completely transparent — no tint, no blur
    expect(bar.style.background).toBe('transparent')
    expect(bar.style.backdropFilter).toBe('none')
  })
})
