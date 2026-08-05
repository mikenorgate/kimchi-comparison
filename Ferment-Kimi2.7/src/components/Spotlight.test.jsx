import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Spotlight } from './Spotlight'
import { useDesktopStore } from '../store/desktopStore'
import { APP_IDS } from '../data/apps'

describe('Spotlight', () => {
  beforeEach(() => {
    useDesktopStore.setState({ windows: [], activeWindowId: null })
  })

  it('is hidden when isOpen is false', () => {
    render(<Spotlight isOpen={false} onClose={() => {}} />)
    expect(screen.queryByTestId('spotlight-overlay')).not.toBeInTheDocument()
  })

  it('renders search panel and results when open', () => {
    render(<Spotlight isOpen onClose={() => {}} />)
    expect(screen.getByTestId('spotlight-panel')).toBeInTheDocument()
    expect(screen.getByTestId('spotlight-input')).toBeInTheDocument()
    expect(screen.getByTestId(`spotlight-result-${APP_IDS.FINDER}`)).toBeInTheDocument()
  })

  it('filters results by query', () => {
    render(<Spotlight isOpen onClose={() => {}} />)
    fireEvent.change(screen.getByTestId('spotlight-input'), { target: { value: 'calc' } })
    expect(screen.getByTestId(`spotlight-result-${APP_IDS.CALCULATOR}`)).toBeInTheDocument()
    expect(screen.queryByTestId(`spotlight-result-${APP_IDS.SAFARI}`)).not.toBeInTheDocument()
  })

  it('launches selected app on result click and calls onClose', () => {
    const onClose = vi.fn()
    render(<Spotlight isOpen onClose={onClose} />)
    fireEvent.click(screen.getByTestId(`spotlight-result-${APP_IDS.NOTES}`))
    expect(useDesktopStore.getState().windows).toHaveLength(1)
    expect(useDesktopStore.getState().windows[0].appId).toBe(APP_IDS.NOTES)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('launches selected app on Enter key', () => {
    const onClose = vi.fn()
    render(<Spotlight isOpen onClose={onClose} />)
    fireEvent.change(screen.getByTestId('spotlight-input'), { target: { value: 'safari' } })
    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' })
    expect(useDesktopStore.getState().windows).toHaveLength(1)
    expect(useDesktopStore.getState().windows[0].appId).toBe(APP_IDS.SAFARI)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    render(<Spotlight isOpen onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
