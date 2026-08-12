import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the Tahoe Web Desktop title', () => {
    render(<App />)
    expect(screen.getByText('Tahoe Web Desktop')).toBeInTheDocument()
  })
})
