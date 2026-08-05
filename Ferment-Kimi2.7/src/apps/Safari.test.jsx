import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Safari, normalizeUrl, MOCK_PAGES } from './Safari'

describe('Safari', () => {
  it('renders address bar, tabs, and content', () => {
    render(<Safari />)
    expect(screen.getByTestId('safari-address')).toBeInTheDocument()
    expect(screen.getByTestId('safari-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('safari-content')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Apple' })).toBeInTheDocument()
  })

  it('navigates to a different mocked page', () => {
    render(<Safari />)
    const address = screen.getByTestId('safari-address')
    fireEvent.change(address, { target: { value: 'example.com' } })
    fireEvent.submit(address.closest('form'))
    expect(screen.getByText('Example Domain')).toBeInTheDocument()
    expect(address).toHaveValue('example.com')
  })

  it('adds and switches tabs', () => {
    render(<Safari />)
    fireEvent.click(screen.getByTestId('safari-add-tab'))
    expect(screen.getAllByTestId(/safari-tab-item-/)).toHaveLength(2)
  })

  it('closes a tab', () => {
    render(<Safari />)
    fireEvent.click(screen.getByTestId('safari-add-tab'))
    const tabs = screen.getAllByTestId(/safari-tab-item-/)
    expect(tabs).toHaveLength(2)
    const firstClose = screen.getByTestId('safari-tab-close-tab-1')
    fireEvent.click(firstClose)
    expect(screen.getAllByTestId(/safari-tab-item-/)).toHaveLength(1)
  })

  it('normalizeUrl strips protocol and www', () => {
    expect(normalizeUrl('https://www.apple.com')).toBe('apple.com')
    expect(normalizeUrl('http://example.com')).toBe('example.com')
    expect(normalizeUrl('apple.com')).toBe('apple.com')
  })

  it('MOCK_PAGES contains known entries', () => {
    expect(MOCK_PAGES['apple.com']).toBeDefined()
    expect(MOCK_PAGES['example.com']).toBeDefined()
  })
})
