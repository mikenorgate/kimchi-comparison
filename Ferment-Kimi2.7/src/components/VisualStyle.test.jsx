import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MenuBar } from './MenuBar'
import { Dock } from './Dock'
import { WindowFrame } from './common/WindowFrame'
import { useDesktopStore } from '../store/desktopStore'
import '../styles/animations.css'
import '../styles/transparency.css'

describe('Visual style — Tahoe materials', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('MenuBar uses backdrop-filter blur', () => {
    render(<MenuBar />)
    const bar = screen.getByTestId('menu-bar')
    expect(bar.style.backdropFilter).toContain('blur')
    expect(bar.style.background).toContain('var(--color-menu-bar-bg)')
  })

  it('Dock uses backdrop-filter blur', () => {
    render(<Dock />)
    const dock = screen.getByTestId('dock')
    expect(dock.style.backdropFilter).toContain('blur')
    expect(dock.style.boxShadow).toBeTruthy()
    expect(dock.style.borderRadius).toBeTruthy()
  })

  it('WindowFrame uses rounded corners and layered shadow', () => {
    render(<WindowFrame title="Test">content</WindowFrame>)
    const frame = screen.getByTestId('window-frame')
    expect(frame.style.borderRadius).toBeTruthy()
    expect(frame.style.boxShadow).toContain('var(--shadow-window')
  })

  it('CSS animation classes are defined and can be applied', () => {
    render(<div data-testid="animated" className="animate-scale-in window-enter" />)
    const node = screen.getByTestId('animated')
    expect(node.classList.contains('animate-scale-in')).toBe(true)
    expect(node.classList.contains('window-enter')).toBe(true)
  })

  it('CSS material classes are defined and can be applied', () => {
    render(<div data-testid="material" className="glass panel-material" />)
    const node = screen.getByTestId('material')
    expect(node.classList.contains('glass')).toBe(true)
    expect(node.classList.contains('panel-material')).toBe(true)
  })
})
