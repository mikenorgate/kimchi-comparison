import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SafariApp } from './components'

describe('Safari app', () => {
  it('renders address bar, toolbar, and mocked webpage', () => {
    render(<SafariApp />)

    expect(screen.getByTestId('safari-address-bar')).toBeInTheDocument()
    expect(screen.getByTestId('safari-address-bar')).toHaveTextContent('apple.com')
    expect(screen.getByTestId('safari-webpage')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Welcome to Safari' })).toBeInTheDocument()
  })

  it('switches active tab when a tab is clicked', () => {
    render(<SafariApp />)

    const tabBar = screen.getByTestId('safari-tab-bar')
    expect(tabBar.children.length).toBe(1)

    const addTab = screen.getByRole('button', { name: 'New tab' })
    fireEvent.click(addTab)

    expect(tabBar.children.length).toBe(2)

    const firstTab = screen.getByTestId('safari-tab-tab-1')
    const secondTab = tabBar.children[1]

    fireEvent.click(secondTab)
    expect(secondTab).toHaveAttribute('aria-selected', 'true')
    expect(firstTab).toHaveAttribute('aria-selected', 'false')
  })
})
