import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Wallpaper } from './Wallpaper'

describe('Wallpaper', () => {
  it('renders a full-screen wallpaper layer', () => {
    render(<Wallpaper />)
    const wallpaper = screen.getByTestId('wallpaper')
    expect(wallpaper).toBeInTheDocument()
    expect(wallpaper).toHaveStyle({ position: 'fixed' })
  })
})
