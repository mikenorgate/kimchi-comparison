import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WindowFrame } from './WindowFrame'

describe('WindowFrame', () => {
  it('renders title and children', () => {
    render(<WindowFrame title="Finder"><div>Content</div></WindowFrame>)
    expect(screen.getByTestId('window-title')).toHaveTextContent('Finder')
    expect(screen.getByTestId('window-content')).toHaveTextContent('Content')
  })

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn()
    render(<WindowFrame onClose={handleClose} />)
    fireEvent.click(screen.getByTestId('window-close'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onMinimize when minimize button clicked', () => {
    const handleMinimize = vi.fn()
    render(<WindowFrame onMinimize={handleMinimize} />)
    fireEvent.click(screen.getByTestId('window-minimize'))
    expect(handleMinimize).toHaveBeenCalledTimes(1)
  })
})
