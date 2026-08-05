import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Desktop } from './Desktop'

describe('Desktop', () => {
  it('renders wallpaper and desktop layer', () => {
    render(<Desktop><div data-testid="child">App</div></Desktop>)
    expect(screen.getByTestId('wallpaper')).toBeInTheDocument()
    expect(screen.getByTestId('desktop-layer')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
