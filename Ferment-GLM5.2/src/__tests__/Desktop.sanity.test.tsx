import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Desktop from '../Desktop'

describe('Desktop sanity test', () => {
  it('renders the desktop root element', () => {
    render(<Desktop />)
    expect(screen.getByTestId('desktop-root')).toBeInTheDocument()
  })

  it('renders desktop content container', () => {
    render(<Desktop />)
    expect(screen.getByTestId('desktop-content')).toBeInTheDocument()
  })
})
