import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

describe('Icon', () => {
  it('renders a known icon', () => {
    render(<Icon name="search" />)
    expect(screen.getByTestId('icon')).toHaveAttribute('data-icon', 'search')
  })

  it('renders nothing for an unknown icon', () => {
    const { container } = render(<Icon name="does-not-exist" />)
    expect(container.firstChild).toBeNull()
  })

  it('applies size', () => {
    render(<Icon name="folder" size={32} />)
    const icon = screen.getByTestId('icon')
    expect(icon).toHaveAttribute('width', '32')
    expect(icon).toHaveAttribute('height', '32')
  })
})
