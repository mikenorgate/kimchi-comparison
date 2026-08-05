import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, beforeEach } from 'vitest'
import { Maps } from './Maps'

describe('Maps', () => {
  beforeEach(() => {
    render(<Maps />)
  })

  it('renders the sidebar, search, and map canvas', () => {
    expect(screen.getByTestId('maps-app')).toBeInTheDocument()
    expect(screen.getByTestId('maps-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('maps-search')).toBeInTheDocument()
    expect(screen.getByTestId('maps-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('maps-location-loc-1')).toBeInTheDocument()
  })

  it('filters the location list when searching', async () => {
    const search = screen.getByTestId('maps-search')
    await userEvent.type(search, 'tahoe')
    expect(screen.getByTestId('maps-location-loc-4')).toBeInTheDocument()
    expect(screen.queryByTestId('maps-location-loc-1')).not.toBeInTheDocument()
  })

  it('shows an info card when a location is selected', async () => {
    await userEvent.click(screen.getByTestId('maps-location-loc-2'))
    expect(screen.getByTestId('maps-info-card')).toBeInTheDocument()
    expect(screen.getByTestId('maps-info-title')).toHaveTextContent(
      'Golden Gate Bridge'
    )
  })

  it('shows an info card when a map pin is clicked', async () => {
    await userEvent.click(screen.getByTestId('maps-pin-loc-3'))
    expect(screen.getByTestId('maps-info-card')).toBeInTheDocument()
    expect(screen.getByTestId('maps-info-title')).toHaveTextContent(
      'Downtown Coffee'
    )
  })

  it('closes the info card', async () => {
    await userEvent.click(screen.getByTestId('maps-location-loc-1'))
    expect(screen.getByTestId('maps-info-card')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('maps-info-close'))
    expect(screen.queryByTestId('maps-info-card')).not.toBeInTheDocument()
  })

  it('shows an empty state for no results', async () => {
    const search = screen.getByTestId('maps-search')
    await userEvent.type(search, 'xyz-no-match')
    expect(screen.getByTestId('maps-empty')).toBeInTheDocument()
  })
})
