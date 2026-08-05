import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Home } from './Home'

describe('Home', () => {
  beforeEach(() => {
    render(<Home />)
  })

  it('renders the dashboard with rooms and accessories', () => {
    expect(screen.getByTestId('home-app')).toBeInTheDocument()
    expect(screen.getByTestId('home-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('home-grid')).toBeInTheDocument()
    expect(screen.getByTestId('home-accessory-acc-1')).toBeInTheDocument()
  })

  it('switches rooms and shows matching accessories', async () => {
    await userEvent.click(screen.getByTestId('home-room-room-kitchen'))
    expect(screen.getByTestId('home-room-title')).toHaveTextContent('Kitchen')
    expect(screen.getByTestId('home-accessory-acc-6')).toBeInTheDocument()
    expect(screen.queryByTestId('home-accessory-acc-1')).not.toBeInTheDocument()
  })

  it('toggles an accessory on and off', async () => {
    const toggle = screen.getByTestId('home-toggle-acc-1')
    expect(toggle).toHaveAttribute('aria-label', 'Turn off')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-label', 'Turn on')
  })

  it('adjusts light brightness', async () => {
    await userEvent.click(screen.getByTestId('home-bright-acc-1'))
    expect(screen.getByTestId('home-accessory-acc-1')).toHaveTextContent('85%')
    await userEvent.click(screen.getByTestId('home-dim-acc-1'))
    expect(screen.getByTestId('home-accessory-acc-1')).toHaveTextContent('75%')
  })

  it('activates a scene that updates accessories', async () => {
    await userEvent.click(screen.getByTestId('home-scene-away'))
    expect(screen.getByTestId('home-toggle-acc-1')).toHaveAttribute(
      'aria-label',
      'Turn on'
    )
    expect(screen.getByTestId('home-toggle-acc-3')).toHaveAttribute(
      'aria-label',
      'Turn on'
    )
  })
})
